-- ==============================================================================
-- ZAKEEM SOLUTIONS — SCHEDULING OPERATIONS & NOTIFICATION LAYER MIGRATION
-- Phase 23: Booking Lifecycle, Rescheduling, Internal Notes, Notifications & Audit Trail
-- ==============================================================================

-- 1. EXTEND BOOKINGS TABLE WITH OPERATIONAL FIELDS
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS internal_notes TEXT,
    ADD COLUMN IF NOT EXISTS rescheduled_from_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS rescheduled_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS reschedule_count INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_bookings_rescheduled_from ON bookings(rescheduled_from_id);

-- 2. AUDIT TRAIL TABLE
CREATE TABLE IF NOT EXISTS booking_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    reference_id TEXT NOT NULL,
    action TEXT NOT NULL,
    actor TEXT NOT NULL DEFAULT 'system',
    previous_status TEXT,
    new_status TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_audit_logs_booking_id ON booking_audit_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_audit_logs_reference_id ON booking_audit_logs(reference_id);
CREATE INDEX IF NOT EXISTS idx_booking_audit_logs_created_at ON booking_audit_logs(created_at DESC);

-- 3. PROVIDER-NEUTRAL NOTIFICATIONS QUEUE
CREATE TABLE IF NOT EXISTS booking_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    reference_id TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('booking_created', 'booking_confirmed', 'booking_cancelled', 'booking_rescheduled', 'booking_completed', 'booking_no_show')),
    recipient_email TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email', 'sms', 'whatsapp', 'webhook')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed', 'skipped')),
    payload JSONB NOT NULL,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_booking_notifications_booking_id ON booking_notifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_notifications_reference_id ON booking_notifications(reference_id);
CREATE INDEX IF NOT EXISTS idx_booking_notifications_status ON booking_notifications(status);

-- 4. ROW LEVEL SECURITY (RLS) FOR NEW TABLES
ALTER TABLE booking_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_notifications ENABLE ROW LEVEL SECURITY;

-- Revoke default public table privileges
REVOKE ALL ON booking_audit_logs FROM anon;
REVOKE ALL ON booking_audit_logs FROM authenticated;
REVOKE ALL ON booking_notifications FROM anon;
REVOKE ALL ON booking_notifications FROM authenticated;

-- Admin staff full access policies
CREATE POLICY "Admin staff full access to booking_audit_logs"
ON booking_audit_logs FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admin staff full access to booking_notifications"
ON booking_notifications FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- 5. ATOMIC STATUS TRANSITION RPC
CREATE OR REPLACE FUNCTION update_booking_status_atomic(
    p_booking_id UUID,
    p_new_status TEXT,
    p_reason TEXT DEFAULT NULL,
    p_actor TEXT DEFAULT 'admin'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_booking RECORD;
BEGIN
    -- 1. Fetch current booking
    SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking record not found.';
    END IF;

    -- 2. Validate valid status transitions
    IF p_new_status NOT IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show') THEN
        RAISE EXCEPTION 'Invalid booking status: %', p_new_status;
    END IF;

    IF v_booking.status = p_new_status THEN
        RETURN jsonb_build_object('success', true, 'booking_id', p_booking_id, 'status', p_new_status, 'unchanged', true);
    END IF;

    -- Cannot uncancel a cancelled booking directly (must reschedule)
    IF v_booking.status = 'cancelled' AND p_new_status != 'cancelled' THEN
        RAISE EXCEPTION 'Cancelled bookings cannot be directly reactivated. Please reschedule the appointment.';
    END IF;

    -- 3. Update status
    UPDATE bookings
    SET status = p_new_status,
        cancellation_reason = CASE WHEN p_new_status = 'cancelled' THEN COALESCE(p_reason, 'Cancelled by solutions administrator') ELSE cancellation_reason END,
        cancelled_at = CASE WHEN p_new_status = 'cancelled' THEN now() ELSE cancelled_at END,
        updated_at = now()
    WHERE id = p_booking_id;

    -- 4. Record audit log
    INSERT INTO booking_audit_logs (
        booking_id,
        reference_id,
        action,
        actor,
        previous_status,
        new_status,
        details
    ) VALUES (
        p_booking_id,
        v_booking.reference_id,
        'status_updated',
        COALESCE(p_actor, 'admin'),
        v_booking.status,
        p_new_status,
        jsonb_build_object('reason', p_reason, 'updated_at', now())
    );

    -- 5. Enqueue notification
    INSERT INTO booking_notifications (
        booking_id,
        reference_id,
        event_type,
        recipient_email,
        recipient_name,
        channel,
        status,
        payload
    ) VALUES (
        p_booking_id,
        v_booking.reference_id,
        CASE
            WHEN p_new_status = 'cancelled' THEN 'booking_cancelled'
            WHEN p_new_status = 'completed' THEN 'booking_completed'
            WHEN p_new_status = 'no_show' THEN 'booking_no_show'
            WHEN p_new_status = 'confirmed' THEN 'booking_confirmed'
            ELSE 'booking_created'
        END,
        v_booking.email,
        v_booking.full_name,
        'email',
        'pending',
        jsonb_build_object(
            'reference_id', v_booking.reference_id,
            'full_name', v_booking.full_name,
            'organization', v_booking.organization,
            'product', v_booking.product,
            'booking_date', v_booking.booking_date,
            'start_time', v_booking.start_time,
            'end_time', v_booking.end_time,
            'timezone', v_booking.timezone,
            'new_status', p_new_status,
            'reason', p_reason
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', p_booking_id,
        'reference_id', v_booking.reference_id,
        'previous_status', v_booking.status,
        'new_status', p_new_status
    );
END;
$$;

-- 6. ATOMIC RESCHEDULING RPC
CREATE OR REPLACE FUNCTION reschedule_booking_atomic(
    p_booking_id UUID,
    p_new_date DATE,
    p_new_start_time TIME,
    p_new_end_time TIME,
    p_reason TEXT DEFAULT NULL,
    p_actor TEXT DEFAULT 'admin'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_booking RECORD;
    v_settings RECORD;
    v_now_wat TIMESTAMPTZ;
    v_new_start TIMESTAMPTZ;
    v_new_slot_range TSRANGE;
    v_conflict_count INTEGER;
    v_day_of_week INTEGER;
    v_has_rule BOOLEAN;
    v_has_exception BOOLEAN;
    v_old_date DATE;
    v_old_start TIME;
    v_old_end TIME;
BEGIN
    -- 1. Fetch current booking
    SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking record not found.';
    END IF;

    v_old_date := v_booking.booking_date;
    v_old_start := v_booking.start_time;
    v_old_end := v_booking.end_time;

    -- 2. Compute current time in WAT (Africa/Lagos)
    v_now_wat := timezone('Africa/Lagos', now());
    v_new_start := (p_new_date + p_new_start_time) AT TIME ZONE 'Africa/Lagos';
    v_new_slot_range := tsrange(p_new_date + p_new_start_time, p_new_date + p_new_end_time);

    -- 3. Obtain active schedule settings
    SELECT * INTO v_settings FROM schedule_settings WHERE is_active = true LIMIT 1;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No active schedule configuration available.';
    END IF;

    -- 4. Verify minimum notice requirement
    IF v_new_start < (v_now_wat + (v_settings.minimum_notice_hours || ' hours')::INTERVAL) THEN
        RAISE EXCEPTION 'Rescheduled appointment violates minimum notice window (% hours).', v_settings.minimum_notice_hours;
    END IF;

    -- 5. Verify maximum booking horizon
    IF p_new_date > (v_now_wat::DATE + (v_settings.maximum_booking_days || ' days')::INTERVAL) THEN
        RAISE EXCEPTION 'Rescheduled appointment exceeds maximum booking horizon (% days).', v_settings.maximum_booking_days;
    END IF;

    -- 6. Acquire advisory transaction lock for the target date to serialize concurrent bookings
    PERFORM pg_advisory_xact_lock(hashtext('booking_' || p_new_date::TEXT));

    -- 7. Check for conflicting active bookings (Overlap check excluding this current booking)
    SELECT COUNT(*) INTO v_conflict_count
    FROM bookings b
    WHERE b.booking_date = p_new_date
      AND b.id != p_booking_id
      AND b.status NOT IN ('cancelled')
      AND (
          b.booking_slot && v_new_slot_range OR
          (b.start_time <= p_new_start_time AND b.end_time > p_new_start_time) OR
          (b.start_time < p_new_end_time AND b.end_time >= p_new_end_time) OR
          (b.start_time >= p_new_start_time AND b.end_time <= p_new_end_time)
      );

    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'Selected time slot is no longer available. Please select another slot.';
    END IF;

    -- 8. Verify weekly availability rule applies
    v_day_of_week := EXTRACT(DOW FROM p_new_date);
    SELECT EXISTS (
        SELECT 1 FROM availability_rules
        WHERE schedule_id = v_settings.id
          AND day_of_week = v_day_of_week
          AND is_active = true
          AND start_time <= p_new_start_time
          AND end_time >= p_new_end_time
    ) INTO v_has_rule;

    IF NOT v_has_rule THEN
        RAISE EXCEPTION 'Selected time is outside standard operational availability.';
    END IF;

    -- 9. Check for blackout date exceptions
    SELECT EXISTS (
        SELECT 1 FROM availability_exceptions
        WHERE schedule_id = v_settings.id
          AND exception_date = p_new_date
          AND exception_type = 'unavailable'
    ) INTO v_has_exception;

    IF v_has_exception THEN
        RAISE EXCEPTION 'Selected date is marked as an unavailable exception.';
    END IF;

    -- 10. Update booking atomically
    BEGIN
        UPDATE bookings
        SET booking_date = p_new_date,
            start_time = p_new_start_time,
            end_time = p_new_end_time,
            booking_slot = v_new_slot_range,
            status = 'confirmed',
            rescheduled_at = now(),
            reschedule_count = reschedule_count + 1,
            cancellation_reason = NULL,
            cancelled_at = NULL,
            updated_at = now()
        WHERE id = p_booking_id;
    EXCEPTION
        WHEN exclusion_violation THEN
            RAISE EXCEPTION 'Selected time slot is no longer available. Please select another slot.';
    END;

    -- 11. Record audit log
    INSERT INTO booking_audit_logs (
        booking_id,
        reference_id,
        action,
        actor,
        previous_status,
        new_status,
        details
    ) VALUES (
        p_booking_id,
        v_booking.reference_id,
        'booking_rescheduled',
        COALESCE(p_actor, 'admin'),
        v_booking.status,
        'confirmed',
        jsonb_build_object(
            'previous_date', v_old_date,
            'previous_start_time', v_old_start,
            'previous_end_time', v_old_end,
            'new_date', p_new_date,
            'new_start_time', p_new_start_time,
            'new_end_time', p_new_end_time,
            'reason', p_reason
        )
    );

    -- 12. Enqueue notification
    INSERT INTO booking_notifications (
        booking_id,
        reference_id,
        event_type,
        recipient_email,
        recipient_name,
        channel,
        status,
        payload
    ) VALUES (
        p_booking_id,
        v_booking.reference_id,
        'booking_rescheduled',
        v_booking.email,
        v_booking.full_name,
        'email',
        'pending',
        jsonb_build_object(
            'reference_id', v_booking.reference_id,
            'full_name', v_booking.full_name,
            'organization', v_booking.organization,
            'product', v_booking.product,
            'previous_date', v_old_date,
            'previous_start_time', v_old_start,
            'new_date', p_new_date,
            'new_start_time', p_new_start_time,
            'new_end_time', p_new_end_time,
            'timezone', 'Africa/Lagos',
            'reason', p_reason
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', p_booking_id,
        'reference_id', v_booking.reference_id,
        'new_date', p_new_date,
        'new_start_time', p_new_start_time,
        'new_end_time', p_new_end_time,
        'reschedule_count', v_booking.reschedule_count + 1
    );
END;
$$;

-- 7. ATOMIC INTERNAL NOTES RPC
CREATE OR REPLACE FUNCTION update_booking_notes_atomic(
    p_booking_id UUID,
    p_internal_notes TEXT,
    p_actor TEXT DEFAULT 'admin'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_ref TEXT;
BEGIN
    UPDATE bookings
    SET internal_notes = p_internal_notes,
        updated_at = now()
    WHERE id = p_booking_id
    RETURNING reference_id INTO v_ref;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking record not found.';
    END IF;

    INSERT INTO booking_audit_logs (
        booking_id,
        reference_id,
        action,
        actor,
        details
    ) VALUES (
        p_booking_id,
        v_ref,
        'note_updated',
        COALESCE(p_actor, 'admin'),
        jsonb_build_object('note_length', length(COALESCE(p_internal_notes, '')), 'updated_at', now())
    );

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', p_booking_id,
        'reference_id', v_ref
    );
END;
$$;

-- 8. EXTEND CREATE_BOOKING_ATOMIC TO RECORD INITIAL AUDIT & NOTIFICATION
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
    FROM bookings b
    WHERE b.booking_date = p_booking_date
      AND b.status NOT IN ('cancelled')
      AND (
          b.booking_slot && v_slot_range OR
          (b.start_time <= p_start_time AND b.end_time > p_start_time) OR
          (b.start_time < p_end_time AND b.end_time >= p_end_time) OR
          (b.start_time >= p_start_time AND b.end_time <= p_end_time)
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

    -- 10. Record initial audit log
    INSERT INTO booking_audit_logs (
        booking_id,
        reference_id,
        action,
        actor,
        new_status,
        details
    ) VALUES (
        v_booking_id,
        p_reference_id,
        'booking_created',
        'public_client',
        'confirmed',
        jsonb_build_object(
            'lead_id', p_lead_id,
            'product', p_product,
            'organization', p_organization,
            'booking_date', p_booking_date,
            'start_time', p_start_time,
            'end_time', p_end_time
        )
    );

    -- 11. Enqueue initial notification record
    INSERT INTO booking_notifications (
        booking_id,
        reference_id,
        event_type,
        recipient_email,
        recipient_name,
        channel,
        status,
        payload
    ) VALUES (
        v_booking_id,
        p_reference_id,
        'booking_confirmed',
        p_email,
        p_full_name,
        'email',
        'pending',
        jsonb_build_object(
            'reference_id', p_reference_id,
            'full_name', p_full_name,
            'organization', p_organization,
            'product', p_product,
            'booking_date', p_booking_date,
            'start_time', p_start_time,
            'end_time', p_end_time,
            'timezone', 'Africa/Lagos'
        )
    );

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

-- 9. PERMISSIONS
GRANT EXECUTE ON FUNCTION update_booking_status_atomic(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION reschedule_booking_atomic(UUID, DATE, TIME, TIME, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_booking_notes_atomic(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_booking_atomic(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, TIME, TIME, TEXT) TO anon, authenticated;