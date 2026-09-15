-- ==============================================================================
-- PHASE 26C — CRM LEAD LIFECYCLE & CONVERSION RPCs (HARDENED)
-- Migration: 20260917000001_zakeem_crm_lead_lifecycle.sql
-- Dedicated Project: Zakeem Solutions (atrevctosjcimszirdcc)
--
-- OBJECTIVE:
-- 1. Create atomic SECURITY DEFINER RPCs for lead status transitions:
--    - public.update_lead_status_atomic
--    - public.convert_lead_to_opportunity_atomic
-- 2. Enforce strict server-side lifecycle governance:
--    - new -> contacted OR disqualified
--    - contacted -> qualified OR disqualified
--    - qualified -> converted OR disqualified
--    - converted -> terminal
--    - disqualified -> terminal
-- 3. Require meaningful non-empty disqualification reason (minimum 3 chars).
-- 4. Conversion constraints:
--    - ONLY qualified leads can convert (new, contacted, disqualified blocked)
--    - Conversion is atomic with opportunity creation
--    - Duplicate conversion is blocked (cannot create multiple opportunities)
--    - Opportunity linked to lead, organization, and primary contact
--    - Zero fabricated monetary value (deal_value_ngn IS NULL)
-- 5. Authorization:
--    - Independently checks is_admin() (explicit admin role in app_metadata/auth.users)
--    - Rejects anon
--    - Rejects authenticated non-admin users
--    - Zero email-domain authorization
--    - Zero user_metadata authorization
--    - SET search_path = public, pg_temp
--    - Preserves existing hardened is_admin() implementation
-- ==============================================================================

-- Forward declaration of convert_lead_to_opportunity_atomic for update_lead_status_atomic delegation
CREATE OR REPLACE FUNCTION public.convert_lead_to_opportunity_atomic(
    p_lead_id UUID,
    p_deal_title TEXT DEFAULT NULL,
    p_product TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_lead RECORD;
    v_org RECORD;
    v_contact_id UUID;
    v_opp_id UUID;
    v_booking_id UUID;
    v_target_product TEXT;
    v_target_title TEXT;
    v_stage TEXT;
BEGIN
    -- 1. Explicit admin check (rejects anon and non-admin authenticated users)
    IF NOT is_admin() THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized: Administrative access required.'
        );
    END IF;

    -- 2. Fetch target lead
    SELECT id, reference_id, organization_id, contact_id, status, product_interest, tier, notes
    INTO v_lead
    FROM public.crm_leads
    WHERE id = p_lead_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Lead record not found.');
    END IF;

    -- 3. Block duplicate conversion
    IF v_lead.status = 'converted' THEN
        SELECT id INTO v_opp_id FROM public.crm_opportunities WHERE lead_id = p_lead_id LIMIT 1;
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Duplicate conversion rejected: Lead has already been converted.',
            'opportunity_id', v_opp_id,
            'lead_id', p_lead_id
        );
    END IF;

    -- 4. Check for existing open opportunity to prevent duplication
    SELECT id INTO v_opp_id
    FROM public.crm_opportunities
    WHERE lead_id = p_lead_id
    LIMIT 1;

    IF v_opp_id IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Duplicate conversion rejected: An opportunity already exists for this lead.',
            'opportunity_id', v_opp_id,
            'lead_id', p_lead_id
        );
    END IF;

    -- 5. Enforce conversion rule: ONLY qualified leads can convert
    IF v_lead.status <> 'qualified' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid conversion: Only qualified leads can be converted to opportunities (current status: [' || v_lead.status || ']).',
            'lead_id', p_lead_id,
            'current_status', v_lead.status
        );
    END IF;

    -- 6. Resolve organization association
    IF v_lead.organization_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot convert lead without an associated organization.');
    END IF;

    SELECT id, name INTO v_org FROM public.crm_organizations WHERE id = v_lead.organization_id;

    -- 7. Resolve primary contact (lead contact, or org primary contact, or earliest org contact)
    v_contact_id := v_lead.contact_id;
    IF v_contact_id IS NULL THEN
        SELECT id INTO v_contact_id
        FROM public.crm_contacts
        WHERE organization_id = v_lead.organization_id AND is_primary = true
        LIMIT 1;

        IF v_contact_id IS NULL THEN
            SELECT id INTO v_contact_id
            FROM public.crm_contacts
            WHERE organization_id = v_lead.organization_id
            ORDER BY created_at ASC
            LIMIT 1;
        END IF;
    END IF;

    v_target_product := COALESCE(NULLIF(trim(p_product), ''), v_lead.product_interest, 'zakeem-realty-erp');

    -- 8. Check if demo walkthrough exists for this lead or contact
    SELECT id INTO v_booking_id
    FROM public.bookings
    WHERE (lead_id = v_lead.reference_id OR (v_contact_id IS NOT NULL AND contact_id = v_contact_id))
      AND status NOT IN ('cancelled')
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_booking_id IS NOT NULL THEN
        v_stage := 'demo_scheduled';
    ELSE
        v_stage := 'discovery';
    END IF;

    -- 9. Format opportunity title
    IF p_deal_title IS NOT NULL AND length(trim(p_deal_title)) >= 3 THEN
        v_target_title := trim(p_deal_title);
    ELSE
        v_target_title := COALESCE(v_org.name, 'Enterprise Account') || ' — ' || v_target_product || ' (' || COALESCE(v_lead.tier, 'Enterprise') || ')';
    END IF;

    -- 10. Atomic Opportunity creation (Zero fabricated monetary values)
    INSERT INTO public.crm_opportunities (
        organization_id,
        contact_id,
        lead_id,
        title,
        primary_product,
        stage,
        deal_value_ngn,
        close_date
    ) VALUES (
        v_lead.organization_id,
        v_contact_id,
        p_lead_id,
        v_target_title,
        v_target_product,
        v_stage,
        NULL, -- Deal value left NULL; never fabricate numbers
        NULL  -- Close date left NULL; never invent dates
    )
    RETURNING id INTO v_opp_id;

    -- 11. Atomic Lead status transition to 'converted'
    UPDATE public.crm_leads
    SET status = 'converted',
        converted_at = now(),
        updated_at = now()
    WHERE id = p_lead_id;

    -- 12. Record chronological crm_activities logs
    INSERT INTO public.crm_activities (
        activity_type,
        organization_id,
        contact_id,
        lead_id,
        opportunity_id,
        actor_id,
        title,
        description,
        metadata
    ) VALUES (
        'opportunity_created',
        v_lead.organization_id,
        v_contact_id,
        p_lead_id,
        v_opp_id,
        auth.uid(),
        'Commercial Opportunity Created',
        'Opportunity converted from lead ' || v_lead.reference_id || ' with initial stage [' || v_stage || ']',
        jsonb_build_object(
            'opportunity_id', v_opp_id,
            'stage', v_stage,
            'product', v_target_product,
            'lead_reference', v_lead.reference_id
        )
    );

    INSERT INTO public.crm_activities (
        activity_type,
        organization_id,
        contact_id,
        lead_id,
        opportunity_id,
        actor_id,
        title,
        description,
        metadata
    ) VALUES (
        'lead_status_changed',
        v_lead.organization_id,
        v_contact_id,
        p_lead_id,
        v_opp_id,
        auth.uid(),
        'Lead converted to opportunity',
        'Lead ' || v_lead.reference_id || ' successfully qualified and converted into deal pipeline',
        jsonb_build_object(
            'previous_status', v_lead.status,
            'new_status', 'converted',
            'opportunity_id', v_opp_id
        )
    );

    -- 13. Return confirmation
    RETURN jsonb_build_object(
        'success', true,
        'opportunity_id', v_opp_id,
        'lead_id', p_lead_id,
        'stage', v_stage,
        'title', v_target_title
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.convert_lead_to_opportunity_atomic(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.convert_lead_to_opportunity_atomic(UUID, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.convert_lead_to_opportunity_atomic(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.convert_lead_to_opportunity_atomic(UUID, TEXT, TEXT) TO service_role;


-- ------------------------------------------------------------------------------
-- ATOMIC LEAD STATUS TRANSITION RPC
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_lead_status_atomic(
    p_lead_id UUID,
    p_new_status TEXT,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_lead RECORD;
    v_clean_reason TEXT;
BEGIN
    -- 1. Explicit admin check (rejects anon and non-admin authenticated users)
    IF NOT is_admin() THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized: Administrative access required.'
        );
    END IF;

    -- 2. Fetch current lead
    SELECT id, reference_id, organization_id, contact_id, status, product_interest
    INTO v_lead
    FROM public.crm_leads
    WHERE id = p_lead_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Lead record not found.');
    END IF;

    IF v_lead.status = p_new_status THEN
        RETURN jsonb_build_object('success', true, 'message', 'Status already set.');
    END IF;

    -- 3. Enforce lifecycle governance rules:
    --    new -> contacted OR disqualified
    --    contacted -> qualified OR disqualified
    --    qualified -> converted OR disqualified
    --    converted -> terminal
    --    disqualified -> terminal
    IF v_lead.status = 'new' AND p_new_status NOT IN ('contacted', 'disqualified') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid transition: [new] can only transition to [contacted] or [disqualified].');
    ELSIF v_lead.status = 'contacted' AND p_new_status NOT IN ('qualified', 'disqualified') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid transition: [contacted] can only transition to [qualified] or [disqualified].');
    ELSIF v_lead.status = 'qualified' AND p_new_status NOT IN ('converted', 'disqualified') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid transition: [qualified] can only transition to [converted] or [disqualified].');
    ELSIF v_lead.status = 'converted' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid transition: [converted] is a terminal status.');
    ELSIF v_lead.status = 'disqualified' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid transition: [disqualified] is a terminal status.');
    END IF;

    -- 4. Disqualification reason requirement (meaningful reason, min 3 chars)
    v_clean_reason := NULLIF(trim(p_reason), '');
    IF p_new_status = 'disqualified' AND (v_clean_reason IS NULL OR length(v_clean_reason) < 3) THEN
        RETURN jsonb_build_object('success', false, 'error', 'A specific disqualification reason (minimum 3 characters) is required.');
    END IF;

    -- 5. If transitioning to 'converted', delegate atomically to conversion RPC
    IF p_new_status = 'converted' THEN
        RETURN convert_lead_to_opportunity_atomic(p_lead_id, NULL, NULL);
    END IF;

    -- 6. Perform status update
    UPDATE public.crm_leads
    SET status = p_new_status,
        disqualification_reason = CASE WHEN p_new_status = 'disqualified' THEN v_clean_reason ELSE disqualification_reason END,
        updated_at = now()
    WHERE id = p_lead_id;

    -- 7. Record chronological crm_activity
    INSERT INTO public.crm_activities (
        activity_type,
        organization_id,
        contact_id,
        lead_id,
        actor_id,
        title,
        description,
        metadata
    ) VALUES (
        'lead_status_changed',
        v_lead.organization_id,
        v_lead.contact_id,
        p_lead_id,
        auth.uid(),
        'Lead status changed: ' || v_lead.status || ' → ' || p_new_status,
        CASE WHEN p_new_status = 'disqualified' THEN 'Disqualification reason: ' || v_clean_reason ELSE NULL END,
        jsonb_build_object(
            'previous_status', v_lead.status,
            'new_status', p_new_status,
            'reason', v_clean_reason,
            'reference_id', v_lead.reference_id
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'lead_id', p_lead_id,
        'previous_status', v_lead.status,
        'new_status', p_new_status
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_lead_status_atomic(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_lead_status_atomic(UUID, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.update_lead_status_atomic(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_lead_status_atomic(UUID, TEXT, TEXT) TO service_role;
