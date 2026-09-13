-- ==============================================================================
-- ZAKEEM SOLUTIONS — SELF-MANAGED SCHEDULING ENGINE MIGRATION
-- Phase 17A: Scheduling Security, GiST Overlap Exclusion & Database Correction
-- ==============================================================================

-- Explicitly enable required PostgreSQL extensions
-- pgcrypto provides gen_random_uuid() and cryptographic primitives
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- uuid-ossp provides RFC 4122 UUID generation functions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- btree_gist provides GiST indexing for scalar types and exclusion constraints
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ------------------------------------------------------------------------------
-- 0. ADMIN ACCESS VERIFICATION FUNCTION
-- Determines whether the current request is an authorized solutions administrator.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role') = 'admin' OR
    (current_setting('request.jwt.claims', true)::jsonb ->> 'email') LIKE '%@zakeemsolutions.com' OR
    current_user = 'postgres',
    false
  );
$$;

-- ------------------------------------------------------------------------------
-- 1. SCHEDULE SETTINGS
-- Holds operational parameters for executive walkthroughs & demos.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schedule_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'Default Executive Schedule',
    timezone TEXT NOT NULL DEFAULT 'Africa/Lagos',
    slot_duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (slot_duration_minutes > 0),
    buffer_before_minutes INTEGER NOT NULL DEFAULT 0 CHECK (buffer_before_minutes >= 0),
    buffer_after_minutes INTEGER NOT NULL DEFAULT 15 CHECK (buffer_after_minutes >= 0),
    minimum_notice_hours INTEGER NOT NULL DEFAULT 2 CHECK (minimum_notice_hours >= 0),
    maximum_booking_days INTEGER NOT NULL DEFAULT 30 CHECK (maximum_booking_days > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. AVAILABILITY RULES (RECURRING WEEKLY SCHEDULE)
-- Defines standard operating windows by day of week (0 = Sunday, 1 = Monday ... 6 = Saturday).
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS availability_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES schedule_settings(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT check_start_before_end CHECK (start_time < end_time)
);

-- ------------------------------------------------------------------------------
-- 3. AVAILABILITY EXCEPTIONS (BLACKOUT DATES & SPECIAL HOURS)
-- Supports public holidays, executive travel, and blackout dates.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS availability_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES schedule_settings(id) ON DELETE CASCADE,
    exception_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    exception_type TEXT NOT NULL DEFAULT 'unavailable' CHECK (exception_type IN ('unavailable', 'custom_hours')),
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 4. BOOKINGS (CONFIRMED RESERVATIONS)
-- Tracks scheduled appointments with full commercial context and lead reference.
-- Uses GiST exclusion constraint on booking_slot tsrange for overlap protection.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id TEXT NOT NULL UNIQUE,
    lead_id TEXT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    organization TEXT NOT NULL,
    phone TEXT,
    job_title TEXT,
    product TEXT NOT NULL,
    tier TEXT,
    suite TEXT,
    deployment TEXT DEFAULT 'cloud',
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    booking_slot TSRANGE NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Africa/Lagos',
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    notes TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT check_booking_time_valid CHECK (start_time < end_time),

    -- POSTGRESQL-LEVEL OVERLAP EXCLUSION CONSTRAINT
    -- Prevents overlapping booking intervals among active bookings.
    -- Cancelled bookings do not block new bookings.
    CONSTRAINT no_overlapping_active_bookings
    EXCLUDE USING gist (
        booking_slot WITH &&
    )
    WHERE (status NOT IN ('cancelled'))
);

-- Automatic synchronization trigger for booking_slot range
CREATE OR REPLACE FUNCTION set_booking_slot_range()
RETURNS trigger AS $$
BEGIN
    NEW.booking_slot := tsrange(NEW.booking_date + NEW.start_time, NEW.booking_date + NEW.end_time);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_booking_slot_range ON bookings;
CREATE TRIGGER trg_set_booking_slot_range
BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION set_booking_slot_range();

-- Indexes for rapid lookup
CREATE INDEX IF NOT EXISTS idx_bookings_date_status ON bookings (booking_date, status);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings (email);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings (reference_id);

-- ------------------------------------------------------------------------------
-- 5. ATOMIC BOOKING FUNCTION (PREVENTS RACE CONDITIONS & ENFORCES VALIDATION)
-- Authoritative validation: timezone, notice period, horizon, schedule window,
-- blackout exceptions, advisory lock, and atomic insertion.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_booking_atomic(
    p_reference_id TEXT,
    p_lead_id TEXT,
    p_full_name TEXT,
    p_email TEXT,
    p_organization TEXT,
    p_phone TEXT,
    p_job_title TEXT,
    p_product TEXT,
    p_tier TEXT,
    p_suite TEXT,
    p_deployment TEXT,
    p_booking_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_notes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_booking_id UUID;
    v_day_of_week INTEGER;
    v_has_rule BOOLEAN;
    v_has_exception BOOLEAN;
    v_conflict_count INTEGER;
    v_settings RECORD;
    v_appointment_start TIMESTAMPTZ;
    v_now_wat TIMESTAMPTZ;
    v_slot_range TSRANGE;
BEGIN
    -- 1. Compute current time in WAT (Africa/Lagos)
    v_now_wat := timezone('Africa/Lagos', now());
    v_appointment_start := (p_booking_date + p_start_time) AT TIME ZONE 'Africa/Lagos';
    v_slot_range := tsrange(p_booking_date + p_start_time, p_booking_date + p_end_time);

    -- 2. Obtain active schedule settings
    SELECT * INTO v_settings FROM schedule_settings WHERE is_active = true LIMIT 1;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No active schedule configuration available.';
    END IF;

    -- 3. Verify minimum notice requirement
    IF v_appointment_start < (v_now_wat + (v_settings.minimum_notice_hours || ' hours')::INTERVAL) THEN
        RAISE EXCEPTION 'Appointment violates minimum notice window (% hours).', v_settings.minimum_notice_hours;
    END IF;

    -- 4. Verify maximum booking horizon
    IF p_booking_date > (v_now_wat::DATE + (v_settings.maximum_booking_days || ' days')::INTERVAL) THEN
        RAISE EXCEPTION 'Appointment exceeds maximum booking horizon (% days).', v_settings.maximum_booking_days;
    END IF;

    -- 5. Acquire advisory transaction lock for the specific date to serialize concurrent bookings
    PERFORM pg_advisory_xact_lock(hashtext('booking_' || p_booking_date::TEXT));

    -- 6. Check for conflicting active bookings (Overlap check)
    SELECT COUNT(*) INTO v_conflict_count
    FROM bookings
    WHERE booking_date = p_booking_date
      AND status NOT IN ('cancelled')
      AND (
          booking_slot && v_slot_range OR
          (start_time <= p_start_time AND end_time > p_start_time) OR
          (start_time < p_end_time AND end_time >= p_end_time) OR
          (start_time >= p_start_time AND end_time <= p_end_time)
      );

    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'Selected time slot is no longer available. Please select another slot.';
    END IF;

    -- 7. Verify weekly availability rule applies
    v_day_of_week := EXTRACT(DOW FROM p_booking_date);
    SELECT EXISTS (
        SELECT 1 FROM availability_rules
        WHERE schedule_id = v_settings.id
          AND day_of_week = v_day_of_week
          AND is_active = true
          AND start_time <= p_start_time
          AND end_time >= p_end_time
    ) INTO v_has_rule;

    IF NOT v_has_rule THEN
        RAISE EXCEPTION 'Selected time is outside standard operational availability.';
    END IF;

    -- 8. Check for blackout date exceptions
    SELECT EXISTS (
        SELECT 1 FROM availability_exceptions
        WHERE schedule_id = v_settings.id
          AND exception_date = p_booking_date
          AND exception_type = 'unavailable'
    ) INTO v_has_exception;

    IF v_has_exception THEN
        RAISE EXCEPTION 'Selected date is marked as an unavailable exception.';
    END IF;

    -- 9. Insert confirmed booking record (protected by GiST exclusion constraint)
    BEGIN
        INSERT INTO bookings (
            reference_id,
            lead_id,
            full_name,
            email,
            organization,
            phone,
            job_title,
            product,
            tier,
            suite,
            deployment,
            booking_date,
            start_time,
            end_time,
            booking_slot,
            timezone,
            status,
            notes
        ) VALUES (
            p_reference_id,
            p_lead_id,
            p_full_name,
            p_email,
            p_organization,
            p_phone,
            p_job_title,
            p_product,
            p_tier,
            p_suite,
            COALESCE(p_deployment, 'cloud'),
            p_booking_date,
            p_start_time,
            p_end_time,
            v_slot_range,
            'Africa/Lagos',
            'confirmed',
            p_notes
        ) RETURNING id INTO v_booking_id;
    EXCEPTION
        WHEN exclusion_violation THEN
            RAISE EXCEPTION 'Selected time slot is no longer available. Please select another slot.';
        WHEN unique_violation THEN
            RAISE EXCEPTION 'A reservation with this reference ID or slot already exists.';
    END;

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_booking_id,
        'reference_id', p_reference_id,
        'booking_date', p_booking_date,
        'start_time', p_start_time,
        'end_time', p_end_time,
        'timezone', 'Africa/Lagos'
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 6. DATA MINIMIZATION PUBLIC AVAILABILITY RPC
-- Computes and returns available time slots for a given date range.
-- NEVER exposes customer identities, emails, or internal booking details.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_public_availability(
    p_date_from DATE,
    p_date_to DATE
)
RETURNS TABLE (
    slot_date DATE,
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_settings RECORD;
    v_curr_date DATE;
    v_rule RECORD;
    v_slot_start TIME;
    v_slot_end TIME;
    v_stride_interval INTERVAL;
    v_is_blocked BOOLEAN;
    v_now_wat TIMESTAMPTZ;
    v_slot_datetime TIMESTAMPTZ;
    v_slot_range TSRANGE;
BEGIN
    v_now_wat := timezone('Africa/Lagos', now());
    SELECT * INTO v_settings FROM schedule_settings WHERE is_active = true LIMIT 1;
    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Stride is slot duration + buffer after
    v_stride_interval := ((v_settings.slot_duration_minutes + v_settings.buffer_after_minutes) || ' minutes')::INTERVAL;

    v_curr_date := p_date_from;
    WHILE v_curr_date <= p_date_to LOOP
        -- Skip past dates and dates beyond max horizon
        IF v_curr_date >= v_now_wat::DATE AND v_curr_date <= (v_now_wat::DATE + (v_settings.maximum_booking_days || ' days')::INTERVAL) THEN
            
            -- Check for blackout exception
            IF NOT EXISTS (
                SELECT 1 FROM availability_exceptions 
                WHERE schedule_id = v_settings.id 
                  AND exception_date = v_curr_date 
                  AND exception_type = 'unavailable'
            ) THEN
                -- Find active availability rule for current day of week
                FOR v_rule IN 
                    SELECT * FROM availability_rules 
                    WHERE schedule_id = v_settings.id 
                      AND day_of_week = EXTRACT(DOW FROM v_curr_date)
                      AND is_active = true
                LOOP
                    v_slot_start := v_rule.start_time;
                    WHILE v_slot_start + (v_settings.slot_duration_minutes || ' minutes')::INTERVAL <= v_rule.end_time LOOP
                        v_slot_end := v_slot_start + (v_settings.slot_duration_minutes || ' minutes')::INTERVAL;
                        v_slot_datetime := (v_curr_date + v_slot_start) AT TIME ZONE 'Africa/Lagos';
                        v_slot_range := tsrange(v_curr_date + v_slot_start, v_curr_date + v_slot_end);

                        -- Check minimum notice
                        IF v_slot_datetime >= (v_now_wat + (v_settings.minimum_notice_hours || ' hours')::INTERVAL) THEN
                            -- Check if booked
                            SELECT EXISTS (
                                SELECT 1 FROM bookings 
                                WHERE booking_date = v_curr_date 
                                  AND status NOT IN ('cancelled')
                                  AND (
                                      booking_slot && v_slot_range OR
                                      (start_time <= v_slot_start AND end_time > v_slot_start) OR
                                      (start_time < v_slot_end AND end_time >= v_slot_end)
                                  )
                            ) INTO v_is_blocked;

                            IF NOT v_is_blocked THEN
                                slot_date := v_curr_date;
                                start_time := v_slot_start;
                                end_time := v_slot_end;
                                is_available := true;
                                RETURN NEXT;
                            END IF;
                        END IF;

                        -- Advance by stride (duration + buffer)
                        v_slot_start := v_slot_start + v_stride_interval;
                    END LOOP;
                END LOOP;
            END IF;
        END IF;

        v_curr_date := v_curr_date + 1;
    END LOOP;
END;
$$;

-- ------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) & LEAST-PRIVILEGE GRANTS
-- Strict least-privilege security model protecting sensitive customer PII.
-- Public users have NO direct table INSERT/UPDATE/DELETE access to bookings.
-- ------------------------------------------------------------------------------
ALTER TABLE schedule_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Revoke default public table privileges on bookings
REVOKE ALL ON bookings FROM anon;
REVOKE ALL ON bookings FROM authenticated;

-- Public users can call get_public_availability and create_booking_atomic
GRANT EXECUTE ON FUNCTION get_public_availability(DATE, DATE) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_booking_atomic(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, TIME, TIME, TEXT) TO anon, authenticated;

-- Authenticated administrative staff permissions
GRANT SELECT, UPDATE, DELETE ON bookings TO authenticated;

-- Public read policies for schedule settings (needed for calendar horizon bounds)
CREATE POLICY "Public can view active schedule settings"
ON schedule_settings FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Public can view active availability rules"
ON availability_rules FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- CRITICAL BOOKING WRITE SECURITY:
-- Public users MUST NOT receive direct INSERT/UPDATE/DELETE access to bookings.
-- The intended public write path is exclusively create_booking_atomic (SECURITY DEFINER).
CREATE POLICY "Public cannot directly access bookings"
ON bookings FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Direct table INSERT is blocked for all clients to guarantee the atomic booking invariant.
-- All bookings (public or admin) must be created via create_booking_atomic.
CREATE POLICY "Direct booking insertion blocked to preserve atomic invariant"
ON bookings FOR INSERT
TO authenticated
WITH CHECK (false);

-- Authenticated Admin staff have SELECT / UPDATE / DELETE management access
CREATE POLICY "Admin staff view access to bookings"
ON bookings FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admin staff update access to bookings"
ON bookings FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admin staff delete access to bookings"
ON bookings FOR DELETE
TO authenticated
USING (is_admin());

CREATE POLICY "Admin staff full access to schedule settings"
ON schedule_settings FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admin staff full access to availability rules"
ON availability_rules FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admin staff full access to availability exceptions"
ON availability_exceptions FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ------------------------------------------------------------------------------
-- 8. SEED INITIAL DEFAULT BUSINESS HOURS & SETTINGS
-- Standard: Mon-Fri 09:00-17:00 WAT, 60m duration, 15m buffer, 2h notice, 30d horizon.
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_sched_id UUID;
BEGIN
    INSERT INTO schedule_settings (
        name,
        timezone,
        slot_duration_minutes,
        buffer_before_minutes,
        buffer_after_minutes,
        minimum_notice_hours,
        maximum_booking_days,
        is_active
    ) VALUES (
        'Executive Architecture Walkthroughs',
        'Africa/Lagos',
        60,
        0,
        15,
        2,
        30,
        true
    ) RETURNING id INTO v_sched_id;

    -- Monday (1) to Friday (5): 09:00 - 17:00 WAT
    INSERT INTO availability_rules (schedule_id, day_of_week, start_time, end_time, is_active) VALUES
    (v_sched_id, 1, '09:00:00', '17:00:00', true),
    (v_sched_id, 2, '09:00:00', '17:00:00', true),
    (v_sched_id, 3, '09:00:00', '17:00:00', true),
    (v_sched_id, 4, '09:00:00', '17:00:00', true),
    (v_sched_id, 5, '09:00:00', '17:00:00', true);
END $$;
