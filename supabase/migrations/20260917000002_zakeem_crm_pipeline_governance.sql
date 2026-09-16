-- ==============================================================================
-- PHASE 26D — CRM PIPELINE STAGE GOVERNANCE & OPPORTUNITY MANAGEMENT
-- Migration: 20260917000002_zakeem_crm_pipeline_governance.sql
-- Dedicated Project: Zakeem Solutions (atrevctosjcimszirdcc)
--
-- OBJECTIVE:
-- 1. Create atomic SECURITY DEFINER RPCs for opportunity stage transitions:
--    - public.update_opportunity_stage_atomic
--    - public.update_opportunity_details_atomic
-- 2. Enforce strict server-side opportunity stage governance:
--    - discovery -> demo_scheduled, demo_completed, proposal, lost
--    - demo_scheduled -> demo_completed, proposal, lost
--    - demo_completed -> proposal, negotiation, lost
--    - proposal -> negotiation, won, lost
--    - negotiation -> won, lost
--    - won -> terminal
--    - lost -> terminal
-- 3. Prevent arbitrary invalid stage jumps and reopening of terminal deals.
-- 4. Record chronological crm_activities logs (stage_changed, note_added).
-- 5. Privileged authorization:
--    - Independently checks is_admin() (canonical admin in app_metadata/auth.users)
--    - Rejects anon
--    - Rejects authenticated non-admin users
--    - Zero email-domain authorization
--    - Zero user_metadata authorization
--    - SET search_path = public, pg_temp
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ATOMIC OPPORTUNITY STAGE TRANSITION RPC
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_opportunity_stage_atomic(
    p_opportunity_id UUID,
    p_new_stage TEXT,
    p_loss_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_opp RECORD;
    v_clean_loss_reason TEXT;
BEGIN
    -- 1. Explicit admin check (rejects anon and non-admin authenticated users)
    IF NOT is_admin() THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized: Administrative access required.'
        );
    END IF;

    -- 2. Fetch current opportunity
    SELECT id, organization_id, contact_id, lead_id, title, primary_product, stage, deal_value_ngn
    INTO v_opp
    FROM public.crm_opportunities
    WHERE id = p_opportunity_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Opportunity record not found.');
    END IF;

    IF v_opp.stage = p_new_stage THEN
        RETURN jsonb_build_object('success', true, 'message', 'Stage already set.');
    END IF;

    -- 3. Terminal state check: won and lost cannot be altered via normal lifecycle
    IF v_opp.stage IN ('won', 'lost') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Terminal stage [' || v_opp.stage || '] cannot be altered. Closed deals are locked.'
        );
    END IF;

    -- 4. Valid stage enum validation
    IF p_new_stage NOT IN ('discovery', 'demo_scheduled', 'demo_completed', 'proposal', 'negotiation', 'won', 'lost') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid stage: [' || p_new_stage || '].');
    END IF;

    -- 5. Stage progression governance
    IF v_opp.stage = 'discovery' AND p_new_stage NOT IN ('demo_scheduled', 'demo_completed', 'proposal', 'lost') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid progression: [discovery] can only advance to [demo_scheduled], [demo_completed], [proposal], or [lost].');
    ELSIF v_opp.stage = 'demo_scheduled' AND p_new_stage NOT IN ('demo_completed', 'proposal', 'lost') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid progression: [demo_scheduled] can only advance to [demo_completed], [proposal], or [lost].');
    ELSIF v_opp.stage = 'demo_completed' AND p_new_stage NOT IN ('proposal', 'negotiation', 'lost') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid progression: [demo_completed] can only advance to [proposal], [negotiation], or [lost].');
    ELSIF v_opp.stage = 'proposal' AND p_new_stage NOT IN ('negotiation', 'won', 'lost') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid progression: [proposal] can only advance to [negotiation], [won], or [lost].');
    ELSIF v_opp.stage = 'negotiation' AND p_new_stage NOT IN ('won', 'lost') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid progression: [negotiation] can only advance to [won] or [lost].');
    END IF;

    -- 6. Clean loss reason if marked lost
    v_clean_loss_reason := NULLIF(trim(p_loss_reason), '');

    -- 7. Update opportunity record
    UPDATE public.crm_opportunities
    SET stage = p_new_stage,
        loss_reason = CASE WHEN p_new_stage = 'lost' THEN v_clean_loss_reason ELSE loss_reason END,
        close_date = CASE WHEN p_new_stage IN ('won', 'lost') AND close_date IS NULL THEN CURRENT_DATE ELSE close_date END,
        updated_at = now()
    WHERE id = p_opportunity_id;

    -- 8. Record chronological crm_activity
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
        'stage_changed',
        v_opp.organization_id,
        v_opp.contact_id,
        v_opp.lead_id,
        p_opportunity_id,
        auth.uid(),
        'Deal stage updated: ' || v_opp.stage || ' → ' || p_new_stage,
        CASE
            WHEN p_new_stage = 'lost' AND v_clean_loss_reason IS NOT NULL THEN 'Deal closed-lost. Reason: ' || v_clean_loss_reason
            WHEN p_new_stage = 'won' THEN 'Deal closed-won!'
            ELSE 'Deal progressed to ' || p_new_stage
        END,
        jsonb_build_object(
            'previous_stage', v_opp.stage,
            'new_stage', p_new_stage,
            'loss_reason', v_clean_loss_reason,
            'title', v_opp.title
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'opportunity_id', p_opportunity_id,
        'previous_stage', v_opp.stage,
        'new_stage', p_new_stage
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_opportunity_stage_atomic(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_opportunity_stage_atomic(UUID, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.update_opportunity_stage_atomic(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_opportunity_stage_atomic(UUID, TEXT, TEXT) TO service_role;


-- ------------------------------------------------------------------------------
-- 2. ATOMIC OPPORTUNITY DETAILS UPDATE RPC
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_opportunity_details_atomic(
    p_opportunity_id UUID,
    p_title TEXT DEFAULT NULL,
    p_deal_value_ngn NUMERIC DEFAULT NULL,
    p_close_date DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_opp RECORD;
BEGIN
    -- 1. Explicit admin check
    IF NOT is_admin() THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized: Administrative access required.'
        );
    END IF;

    -- 2. Fetch current opportunity
    SELECT id, organization_id, contact_id, lead_id, title, stage
    INTO v_opp
    FROM public.crm_opportunities
    WHERE id = p_opportunity_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Opportunity record not found.');
    END IF;

    -- 3. Apply updates
    UPDATE public.crm_opportunities
    SET title = COALESCE(NULLIF(trim(p_title), ''), title),
        deal_value_ngn = CASE WHEN p_deal_value_ngn IS NOT NULL THEN p_deal_value_ngn ELSE deal_value_ngn END,
        close_date = CASE WHEN p_close_date IS NOT NULL THEN p_close_date ELSE close_date END,
        updated_at = now()
    WHERE id = p_opportunity_id;

    RETURN jsonb_build_object(
        'success', true,
        'opportunity_id', p_opportunity_id
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_opportunity_details_atomic(UUID, TEXT, NUMERIC, DATE) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_opportunity_details_atomic(UUID, TEXT, NUMERIC, DATE) FROM anon;
GRANT EXECUTE ON FUNCTION public.update_opportunity_details_atomic(UUID, TEXT, NUMERIC, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_opportunity_details_atomic(UUID, TEXT, NUMERIC, DATE) TO service_role;
