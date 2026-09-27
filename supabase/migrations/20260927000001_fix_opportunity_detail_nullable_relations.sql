-- ==============================================================================
-- PHASE 67B — SURGICAL PATCH: OPPORTUNITY DETAIL NULLABLE RELATIONS
-- Migration: 20260927000001_fix_opportunity_detail_nullable_relations.sql
-- Dedicated Project: Zakeem Solutions (atrevctosjcimszirdcc)
--
-- OBJECTIVE:
-- 1. Replace unassigned PL/pgSQL RECORD-variable access in
--    public.get_admin_opportunity_detail_atomic(p_opportunity_id UUID)
--    with type-safe nullable JSONB variables.
-- 2. Prevent PostgreSQL ERROR 55000 (record is not assigned yet) when
--    an opportunity has nullable relations (e.g. lead_id IS NULL,
--    organization_id IS NULL, contact_id IS NULL, or booking IS NULL).
-- 3. Preserve:
--    - Exact RPC signature: get_admin_opportunity_detail_atomic(UUID)
--    - RETURNS JSONB
--    - LANGUAGE plpgsql
--    - SECURITY DEFINER
--    - SET search_path = public, pg_temp
--    - Server-side public.is_admin() authorization check
--    - Rejection of anon and non-admin authenticated users
--    - Execution boundaries (REVOKE PUBLIC/anon; GRANT authenticated/postgres)
--    - Full response contract (organization, contact, lead, booking, activities)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_admin_opportunity_detail_atomic(
    p_opportunity_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_opp RECORD;
    v_org_json JSONB := NULL;
    v_contact_json JSONB := NULL;
    v_lead_json JSONB := NULL;
    v_lead_ref TEXT := NULL;
    v_booking_json JSONB := NULL;
    v_activities JSONB := '[]'::jsonb;
BEGIN
    -- 1. Explicit server-authoritative admin verification
    IF NOT is_admin() THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized: Administrative access required.'
        );
    END IF;

    -- 2. Fetch opportunity
    SELECT * INTO v_opp
    FROM public.crm_opportunities
    WHERE id = p_opportunity_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Opportunity not found.'
        );
    END IF;

    -- 3. Fetch organization if linked
    IF v_opp.organization_id IS NOT NULL THEN
        SELECT jsonb_build_object(
            'id', org.id,
            'name', org.name,
            'slug', org.slug,
            'domain', org.domain,
            'industry', org.industry,
            'company_size', org.company_size,
            'status', org.status,
            'created_at', org.created_at,
            'updated_at', org.updated_at
        )
        INTO v_org_json
        FROM public.crm_organizations org
        WHERE org.id = v_opp.organization_id;
    END IF;

    -- 4. Fetch contact if linked
    IF v_opp.contact_id IS NOT NULL THEN
        SELECT jsonb_build_object(
            'id', c.id,
            'organization_id', c.organization_id,
            'email', c.email,
            'full_name', c.full_name,
            'phone', c.phone,
            'job_title', c.job_title,
            'is_primary', c.is_primary,
            'created_at', c.created_at,
            'updated_at', c.updated_at
        )
        INTO v_contact_json
        FROM public.crm_contacts c
        WHERE c.id = v_opp.contact_id;
    END IF;

    -- 5. Fetch lead if linked
    IF v_opp.lead_id IS NOT NULL THEN
        SELECT 
            l.reference_id,
            jsonb_build_object(
                'id', l.id,
                'reference_id', l.reference_id,
                'form_type', l.form_type,
                'status', l.status,
                'product_interest', l.product_interest,
                'tier', l.tier,
                'notes', l.notes,
                'created_at', l.created_at
            )
        INTO v_lead_ref, v_lead_json
        FROM public.crm_leads l
        WHERE l.id = v_opp.lead_id;
    END IF;

    -- 6. Fetch latest associated booking if any
    IF v_lead_ref IS NOT NULL OR v_opp.contact_id IS NOT NULL THEN
        SELECT jsonb_build_object(
            'id', b.id,
            'reference_id', b.reference_id,
            'booking_date', b.booking_date,
            'start_time', b.start_time,
            'end_time', b.end_time,
            'status', b.status
        )
        INTO v_booking_json
        FROM public.bookings b
        WHERE (v_lead_ref IS NOT NULL AND b.lead_id = v_lead_ref)
           OR (v_opp.contact_id IS NOT NULL AND b.contact_id = v_opp.contact_id)
        ORDER BY b.created_at DESC
        LIMIT 1;
    END IF;

    -- 7. Fetch activities for this opportunity or lead
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', a.id,
        'activity_type', a.activity_type,
        'organization_id', a.organization_id,
        'contact_id', a.contact_id,
        'lead_id', a.lead_id,
        'booking_id', a.booking_id,
        'opportunity_id', a.opportunity_id,
        'actor_id', a.actor_id,
        'assigned_to', a.assigned_to,
        'due_date', a.due_date,
        'completed_at', a.completed_at,
        'status', a.status,
        'title', a.title,
        'description', a.description,
        'metadata', a.metadata,
        'created_at', a.created_at
    ) ORDER BY a.created_at DESC), '[]'::jsonb)
    INTO v_activities
    FROM public.crm_activities a
    WHERE a.opportunity_id = p_opportunity_id
       OR (v_opp.lead_id IS NOT NULL AND a.lead_id = v_opp.lead_id);

    -- 8. Assemble structured result
    RETURN jsonb_build_object(
        'success', true,
        'opportunity', jsonb_build_object(
            'id', v_opp.id,
            'organization_id', v_opp.organization_id,
            'contact_id', v_opp.contact_id,
            'lead_id', v_opp.lead_id,
            'title', v_opp.title,
            'primary_product', v_opp.primary_product,
            'stage', v_opp.stage,
            'deal_value_ngn', v_opp.deal_value_ngn,
            'close_date', v_opp.close_date,
            'expected_close_date', v_opp.expected_close_date,
            'next_action', v_opp.next_action,
            'next_action_due_date', v_opp.next_action_due_date,
            'last_activity_at', COALESCE(v_opp.last_activity_at, v_opp.updated_at, v_opp.created_at),
            'loss_reason', v_opp.loss_reason,
            'owner_id', v_opp.owner_id,
            'created_at', v_opp.created_at,
            'updated_at', v_opp.updated_at,
            'organization', v_org_json,
            'contact', v_contact_json,
            'lead', v_lead_json,
            'booking', v_booking_json,
            'activities', v_activities
        )
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- PERMISSION HARDENING & PRIVILEGE BOUNDARIES
-- ------------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.get_admin_opportunity_detail_atomic(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_admin_opportunity_detail_atomic(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_admin_opportunity_detail_atomic(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_opportunity_detail_atomic(UUID) TO postgres;
