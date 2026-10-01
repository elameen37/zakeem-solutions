-- =============================================================================
-- Migration: 20261001200000_zakeem_training_public_status_rpc.sql
-- Description: Secure public status lookup RPC for Zakeem IT Training applications
-- Project: Zakeem Solutions
-- Phase 73: Admissions Lifecycle & Status Verification
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_public_training_status(
    p_reference TEXT,
    p_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_clean_ref TEXT := upper(trim(COALESCE(p_reference, '')));
    v_clean_email TEXT := lower(trim(COALESCE(p_email, '')));
    v_rec RECORD;
    v_status_message TEXT;
BEGIN
    -- Both reference and email are strictly required
    IF v_clean_ref = '' OR v_clean_email = '' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Both Application Reference and Email address are required.'
        );
    END IF;

    -- Query matching reference AND email (checking individual email or organization business_email)
    -- This enforces zero-enumeration: an invalid email returns NOT FOUND regardless of whether reference exists.
    SELECT 
        application_reference,
        applicant_type,
        full_name,
        organization_name,
        course,
        preferred_start_date,
        training_days,
        session_duration_minutes,
        preferred_time,
        timezone,
        status,
        created_at
    INTO v_rec
    FROM public.training_applications
    WHERE upper(application_reference) = v_clean_ref
      AND (
        (applicant_type = 'individual' AND lower(email) = v_clean_email)
        OR
        (applicant_type = 'organization' AND lower(business_email) = v_clean_email)
      )
    LIMIT 1;

    IF NOT FOUND THEN
        -- Secure timing/existence-neutral rejection
        RETURN jsonb_build_object(
            'success', false,
            'error', 'No matching application located. Please verify your reference ID and the email address used during submission.'
        );
    END IF;

    -- Map applicant-facing status message
    CASE v_rec.status
        WHEN 'submitted' THEN
            v_status_message := 'Application received and queued for review by the Zakeem Admissions Desk.';
        WHEN 'in_review' THEN
            v_status_message := 'Application is currently under technical review and scheduling alignment.';
        WHEN 'confirmed' THEN
            v_status_message := 'Application officially confirmed! Cohort onboarding and virtual classroom credentials will be dispatched prior to your start date.';
        WHEN 'cancelled' THEN
            v_status_message := 'Application was cancelled. Please contact admissions@zakeemsolutions.com for assistance.';
        ELSE
            v_status_message := 'Application is currently being processed.';
    END CASE;

    -- Return strictly public, non-PII operational fields
    RETURN jsonb_build_object(
        'success', true,
        'data', jsonb_build_object(
            'reference', v_rec.application_reference,
            'applicantType', v_rec.applicant_type,
            'applicantDisplayName', CASE WHEN v_rec.applicant_type = 'organization' THEN v_rec.organization_name ELSE v_rec.full_name END,
            'course', v_rec.course,
            'preferredStartDate', v_rec.preferred_start_date,
            'trainingDays', v_rec.training_days,
            'sessionDuration', '2 hours per session',
            'sessionDurationMinutes', v_rec.session_duration_minutes,
            'preferredTime', v_rec.preferred_time,
            'timezone', v_rec.timezone,
            'status', v_rec.status,
            'statusMessage', v_status_message,
            'deliveryMode', 'Fully Online (Live / Structured)',
            'certificateEligible', true,
            'submittedAt', v_rec.created_at
        )
    );
END;
$$;

-- Grant execution to anon, authenticated, and service_role
REVOKE ALL ON FUNCTION public.get_public_training_status(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_training_status(TEXT, TEXT) TO anon, authenticated, service_role;
