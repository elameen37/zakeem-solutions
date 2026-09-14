-- ==============================================================================
-- ZAKEEM SOLUTIONS — PHASE 23A: SECURITY & LIFECYCLE REMEDIATION
-- Additive corrective migration enforcing:
-- 1. Server-side is_admin() authorization inside all admin SECURITY DEFINER RPCs
-- 2. Strict PostgreSQL-enforced booking lifecycle state machine transitions
-- 3. Append-only, genuinely immutable audit log table
-- 4. Secure provider-neutral notification queue (admin SELECT only, no anon access)
-- 5. Safe search_path = public, pg_temp on all SECURITY DEFINER functions
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. REVISE is_admin() WITH SAFE search_path & POSTGREST CLAIMS ISOLATION
-- ------------------------------------------------------------------------------
-- Ensures that SECURITY DEFINER privilege elevation does NOT deceive is_admin():
-- When called via PostgREST/client, request.jwt.claims is strictly inspected.
-- Direct psql superuser access is verified via session_user, NOT current_user.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_claims_raw text;
  v_claims jsonb;
BEGIN
  v_claims_raw := current_setting('request.jwt.claims', true);
  
  -- If JWT claims are present (API call via Supabase client):
  IF v_claims_raw IS NOT NULL AND v_claims_raw <> '' THEN
    BEGIN
      v_claims := v_claims_raw::jsonb;
      IF (v_claims -> 'app_metadata' ->> 'role') = 'admin' THEN
        RETURN true;
      END IF;
      IF (v_claims ->> 'email') LIKE '%@zakeemsolutions.com' THEN
        RETURN true;
      END IF;
      RETURN false;
    EXCEPTION
      WHEN OTHERS THEN
        RETURN false;
    END;
  END IF;

  -- If no JWT claims exist (direct internal connection / migration):
  IF session_user = 'postgres' THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. HARDEN AUDIT LOGS (APPEND-ONLY & IMMUTABLE)
-- ------------------------------------------------------------------------------
-- Ensure anon and public have zero access
REVOKE ALL ON booking_audit_logs FROM anon;
REVOKE ALL ON booking_audit_logs FROM PUBLIC;
REVOKE ALL ON booking_audit_logs FROM authenticated;

-- Grant ONLY SELECT to authenticated (governed strictly by RLS)
GRANT SELECT ON booking_audit_logs TO authenticated;

-- Remove permissive ALL policies
DROP POLICY IF EXISTS "Admin staff full access to booking_audit_logs" ON booking_audit_logs;
DROP POLICY IF EXISTS "Admin staff can view booking_audit_logs" ON booking_audit_logs;
DROP POLICY IF EXISTS "Admin staff can only view booking_audit_logs" ON booking_audit_logs;

-- Apply SELECT-only policy for verified administrators
CREATE POLICY "Admin staff can only view booking_audit_logs"
ON booking_audit_logs FOR SELECT
TO authenticated
USING (is_admin());

-- Engine-level immutability: trigger that unconditionally rejects any UPDATE or DELETE
CREATE OR REPLACE FUNCTION trg_prevent_audit_log_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RAISE EXCEPTION 'Booking audit log records are immutable and append-only. Updating or deleting audit records is strictly prohibited.'
    USING ERRCODE = '42501';
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON booking_audit_logs;
CREATE TRIGGER trg_audit_logs_immutable
BEFORE UPDATE OR DELETE ON booking_audit_logs
FOR EACH ROW
EXECUTE FUNCTION trg_prevent_audit_log_mutation();

-- ------------------------------------------------------------------------------
-- 3. HARDEN NOTIFICATION QUEUE (PROVIDER-NEUTRAL & ADMIN-READ-ONLY)
-- ------------------------------------------------------------------------------
-- Revoke all access from anon, public, and authenticated
REVOKE ALL ON booking_notifications FROM anon;
REVOKE ALL ON booking_notifications FROM PUBLIC;
REVOKE ALL ON booking_notifications FROM authenticated;

-- Grant ONLY SELECT to authenticated (governed strictly by RLS)
GRANT SELECT ON booking_notifications TO authenticated;

-- Remove permissive ALL policies
DROP POLICY IF EXISTS "Admin staff full access to booking_notifications" ON booking_notifications;
DROP POLICY IF EXISTS "Admin staff can view booking_notifications" ON booking_notifications;
DROP POLICY IF EXISTS "Admin staff can only view booking_notifications" ON booking_notifications;

-- Apply SELECT-only policy for verified administrators
CREATE POLICY "Admin staff can only view booking_notifications"
ON booking_notifications FOR SELECT
TO authenticated
USING (is_admin());

-- Engine-level protection: trigger that prevents direct deletion of notification records
CREATE OR REPLACE FUNCTION trg_prevent_notification_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RAISE EXCEPTION 'Notification queue records cannot be deleted directly from application roles.'
    USING ERRCODE = '42501';
END;
$$;

DROP TRIGGER IF EXISTS trg_notifications_protect_delete ON booking_notifications;
CREATE TRIGGER trg_notifications_protect_delete
BEFORE DELETE ON booking_notifications
FOR EACH ROW
EXECUTE FUNCTION trg_prevent_notification_deletion();

-- ------------------------------------------------------------------------------
-- 4. REVISE UPDATE_BOOKING_STATUS_ATOMIC (ADMIN CHECK + STRICT STATE MACHINE)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_booking_status_atomic(
    p_booking_id UUID,
    p_new_status TEXT,
    p_reason TEXT DEFAULT NULL,
    p_actor TEXT DEFAULT 'admin'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_booking RECORD;
    v_is_valid_transition BOOLEAN := false;
BEGIN
    -- 1. Server-Side Administrative Authorization Check
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied. Administrative authorization required.'
        USING ERRCODE = '42501';
    END IF;

    -- 2. Fetch current booking
    SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking record not found.'
        USING ERRCODE = 'P0002';
    END IF;

    -- 3. Validate status value domain
    IF p_new_status NOT IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show') THEN
        RAISE EXCEPTION 'Invalid booking status: %', p_new_status
        USING ERRCODE = '22023';
    END IF;

    -- 4. Idempotent check (same status is a no-op)
    IF v_booking.status = p_new_status THEN
        RETURN jsonb_build_object(
            'success', true,
            'booking_id', p_booking_id,
            'status', p_new_status,
            'unchanged', true
        );
    END IF;

    -- 5. Enforce Strict PostgreSQL-Enforced State Machine Transitions
    -- Allowed transitions:
    --   pending   -> confirmed
    --   pending   -> cancelled
    --   confirmed -> completed
    --   confirmed -> no_show
    --   confirmed -> cancelled
    --   completed -> no transitions (terminal)
    --   no_show   -> no transitions (terminal)
    --   cancelled -> no transitions (terminal, must reschedule)
    IF v_booking.status = 'pending' AND p_new_status IN ('confirmed', 'cancelled') THEN
        v_is_valid_transition := true;
    ELSIF v_booking.status = 'confirmed' AND p_new_status IN ('completed', 'no_show', 'cancelled') THEN
        v_is_valid_transition := true;
    END IF;

    IF NOT v_is_valid_transition THEN
        RAISE EXCEPTION 'Invalid status transition from "%" to "%".', v_booking.status, p_new_status
        USING ERRCODE = '22023';
    END IF;

    -- 6. Perform Status Update
    UPDATE bookings
    SET status = p_new_status,
        cancellation_reason = CASE
            WHEN p_new_status = 'cancelled' THEN COALESCE(p_reason, 'Cancelled by solutions administrator')
            ELSE cancellation_reason
        END,
        cancelled_at = CASE
            WHEN p_new_status = 'cancelled' THEN now()
            ELSE cancelled_at
        END,
        updated_at = now()
    WHERE id = p_booking_id;

    -- 7. Record Immutable Audit Log
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
        COALESCE(p_actor, 'solutions-admin'),
        v_booking.status,
        p_new_status,
        jsonb_build_object('reason', p_reason, 'transition_time', now())
    );

    -- 8. Enqueue Notification in Provider-Neutral Queue
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
            'previous_status', v_booking.status,
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

-- ------------------------------------------------------------------------------
-- 5. REVISE RESCHEDULE_BOOKING_ATOMIC (ADMIN CHECK + SAFE RE-ALLOCATION)
-- ------------------------------------------------------------------------------
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
SET search_path = public, pg_temp
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
    v_old_status TEXT;
BEGIN
    -- 1. Server-Side Administrative Authorization Check
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied. Administrative authorization required.'
        USING ERRCODE = '42501';
    END IF;

    -- 2. Fetch current booking
    SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking record not found.'
        USING ERRCODE = 'P0002';
    END IF;

    -- 3. Check lifecycle eligibility:
    -- Only pending, confirmed, or cancelled bookings can be rescheduled.
    -- Completed and no_show bookings cannot be rescheduled.
    IF v_booking.status NOT IN ('confirmed', 'pending', 'cancelled') THEN
        RAISE EXCEPTION 'Bookings with status "%" cannot be rescheduled.', v_booking.status
        USING ERRCODE = '22023';
    END IF;

    v_old_date := v_booking.booking_date;
    v_old_start := v_booking.start_time;
    v_old_end := v_booking.end_time;
    v_old_status := v_booking.status;

    -- 4. Compute current time in WAT (Africa/Lagos)
    v_now_wat := timezone('Africa/Lagos', now());
    v_new_start := (p_new_date + p_new_start_time) AT TIME ZONE 'Africa/Lagos';
    v_new_slot_range := tsrange(p_new_date + p_new_start_time, p_new_date + p_new_end_time);

    -- 5. Obtain active schedule settings
    SELECT * INTO v_settings FROM schedule_settings WHERE is_active = true LIMIT 1;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No active schedule configuration available.';
    END IF;

    -- 6. Verify minimum notice requirement
    IF v_new_start < (v_now_wat + (v_settings.minimum_notice_hours || ' hours')::INTERVAL) THEN
        RAISE EXCEPTION 'Rescheduled appointment violates minimum notice window (% hours).', v_settings.minimum_notice_hours
        USING ERRCODE = '22023';
    END IF;

    -- 7. Verify maximum booking horizon
    IF p_new_date > (v_now_wat::DATE + (v_settings.maximum_booking_days || ' days')::INTERVAL) THEN
        RAISE EXCEPTION 'Rescheduled appointment exceeds maximum booking horizon (% days).', v_settings.maximum_booking_days
        USING ERRCODE = '22023';
    END IF;

    -- 8. Acquire advisory transaction lock for the target date to serialize concurrent bookings
    PERFORM pg_advisory_xact_lock(hashtext('booking_' || p_new_date::TEXT));

    -- 9. Check for conflicting active bookings (Overlap check excluding this current booking)
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
        RAISE EXCEPTION 'Selected time slot is no longer available. Please select another slot.'
        USING ERRCODE = '23P01';
    END IF;

    -- 10. Verify weekly availability rule applies
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
        RAISE EXCEPTION 'Selected time is outside standard operational availability.'
        USING ERRCODE = '22023';
    END IF;

    -- 11. Check for blackout date exceptions
    SELECT EXISTS (
        SELECT 1 FROM availability_exceptions
        WHERE schedule_id = v_settings.id
          AND exception_date = p_new_date
          AND exception_type = 'unavailable'
    ) INTO v_has_exception;

    IF v_has_exception THEN
        RAISE EXCEPTION 'Selected date is marked as an unavailable exception.'
        USING ERRCODE = '22023';
    END IF;

    -- 12. Update booking atomically
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
            RAISE EXCEPTION 'Selected time slot is no longer available. Please select another slot.'
            USING ERRCODE = '23P01';
    END;

    -- 13. Record Immutable Audit Log
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
        COALESCE(p_actor, 'solutions-admin'),
        v_old_status,
        'confirmed',
        jsonb_build_object(
            'previous_date', v_old_date,
            'previous_start_time', v_old_start,
            'previous_end_time', v_old_end,
            'previous_status', v_old_status,
            'new_date', p_new_date,
            'new_start_time', p_new_start_time,
            'new_end_time', p_new_end_time,
            'reason', p_reason
        )
    );

    -- 14. Enqueue Notification
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
        'previous_status', v_old_status,
        'new_status', 'confirmed',
        'reschedule_count', v_booking.reschedule_count + 1
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 6. REVISE UPDATE_BOOKING_NOTES_ATOMIC (ADMIN CHECK + SAFE search_path)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_booking_notes_atomic(
    p_booking_id UUID,
    p_internal_notes TEXT,
    p_actor TEXT DEFAULT 'admin'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_ref TEXT;
BEGIN
    -- 1. Server-Side Administrative Authorization Check
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied. Administrative authorization required.'
        USING ERRCODE = '42501';
    END IF;

    -- 2. Update internal notes
    UPDATE bookings
    SET internal_notes = p_internal_notes,
        updated_at = now()
    WHERE id = p_booking_id
    RETURNING reference_id INTO v_ref;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking record not found.'
        USING ERRCODE = 'P0002';
    END IF;

    -- 3. Record Immutable Audit Log
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
        COALESCE(p_actor, 'solutions-admin'),
        jsonb_build_object('note_length', length(COALESCE(p_internal_notes, '')), 'updated_at', now())
    );

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', p_booking_id,
        'reference_id', v_ref
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 7. REVISE CREATE_BOOKING_ATOMIC (SAFE search_path)
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
SET search_path = public, pg_temp
AS $$
DECLARE
    v_booking_id UUID;
    v_day_of_week INTEGER;
    v_has_rule BOOLEAN;
    v_has_exception BOOLEAN;
    v_settings RECORD;
    v_now_wat TIMESTAMPTZ;
    v_booking_start TIMESTAMPTZ;
    v_slot_range TSRANGE;
    v_conflict_count INTEGER;
BEGIN
    -- 1. Compute current time in WAT (Africa/Lagos)
    v_now_wat := timezone('Africa/Lagos', now());
    v_booking_start := (p_booking_date + p_start_time) AT TIME ZONE 'Africa/Lagos';
    v_slot_range := tsrange(p_booking_date + p_start_time, p_booking_date + p_end_time);

    -- 2. Obtain active schedule settings
    SELECT * INTO v_settings FROM schedule_settings WHERE is_active = true LIMIT 1;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No active schedule configuration available.';
    END IF;

    -- 3. Verify minimum notice requirement
    IF v_booking_start < (v_now_wat + (v_settings.minimum_notice_hours || ' hours')::INTERVAL) THEN
        RAISE EXCEPTION 'Requested appointment violates minimum notice window (% hours).', v_settings.minimum_notice_hours
        USING ERRCODE = '22023';
    END IF;

    -- 4. Verify maximum booking horizon
    IF p_booking_date > (v_now_wat::DATE + (v_settings.maximum_booking_days || ' days')::INTERVAL) THEN
        RAISE EXCEPTION 'Requested appointment exceeds maximum booking horizon (% days).', v_settings.maximum_booking_days
        USING ERRCODE = '22023';
    END IF;

    -- 5. Acquire advisory transaction lock for the date
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
        RAISE EXCEPTION 'Selected time slot is no longer available. Please select another slot.'
        USING ERRCODE = '23P01';
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
        RAISE EXCEPTION 'Selected time is outside standard operational availability.'
        USING ERRCODE = '22023';
    END IF;

    -- 8. Check for blackout date exceptions
    SELECT EXISTS (
        SELECT 1 FROM availability_exceptions
        WHERE schedule_id = v_settings.id
          AND exception_date = p_booking_date
          AND exception_type = 'unavailable'
    ) INTO v_has_exception;

    IF v_has_exception THEN
        RAISE EXCEPTION 'Selected date is marked as an unavailable exception.'
        USING ERRCODE = '22023';
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
            RAISE EXCEPTION 'Selected time slot is no longer available. Please select another slot.'
            USING ERRCODE = '23P01';
        WHEN unique_violation THEN
            RAISE EXCEPTION 'A reservation with this reference ID or slot already exists.'
            USING ERRCODE = '23505';
    END;

    -- 10. Record initial immutable audit log
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

-- ------------------------------------------------------------------------------
-- 8. PERMISSIONS HARDENING
-- ------------------------------------------------------------------------------
-- Revoke all default public/anon EXECUTE permissions on admin functions
REVOKE ALL ON FUNCTION update_booking_status_atomic(UUID, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION update_booking_status_atomic(UUID, TEXT, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION update_booking_status_atomic(UUID, TEXT, TEXT, TEXT) TO authenticated;

REVOKE ALL ON FUNCTION reschedule_booking_atomic(UUID, DATE, TIME, TIME, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION reschedule_booking_atomic(UUID, DATE, TIME, TIME, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION reschedule_booking_atomic(UUID, DATE, TIME, TIME, TEXT, TEXT) TO authenticated;

REVOKE ALL ON FUNCTION update_booking_notes_atomic(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION update_booking_notes_atomic(UUID, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION update_booking_notes_atomic(UUID, TEXT, TEXT) TO authenticated;

-- Public booking creation remains intentionally executable by anon and authenticated
GRANT EXECUTE ON FUNCTION create_booking_atomic(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, TIME, TIME, TEXT) TO anon, authenticated;
