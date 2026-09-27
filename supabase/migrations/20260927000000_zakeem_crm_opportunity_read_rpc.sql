-- ==============================================================================
-- PHASE 67 — CANONICAL CRM PIPELINE READ RPC MIGRATION
-- Migration: 20260927000000_zakeem_crm_opportunity_read_rpc.sql
-- Dedicated Project: Zakeem Solutions (atrevctosjcimszirdcc)
--
-- OBJECTIVE:
-- 1. Replace direct PostgREST table SELECT queries against public.crm_opportunities
--    with dedicated, server-authoritative SECURITY DEFINER read RPCs:
--    - public.get_admin_opportunities_atomic(...)
--    - public.get_admin_opportunity_detail_atomic(p_opportunity_id UUID)
-- 2. Strict Security Mandates:
--    - SECURITY DEFINER with SET search_path = public, pg_temp
--    - Explicit public.is_admin() server-side authorization check
--    - Rejects anon and non-admin authenticated users
--    - Zero trust in user_metadata or email domain
--    - Exposes only verified fields required by the Commercial Pipeline UI
--    - Preserves existing CRM RLS and table boundaries without weakening
--    - Explicit EXECUTE grants to authenticated and postgres; REVOKE from anon and PUBLIC
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. GET ADMIN OPPORTUNITIES ATOMIC (PIPELINE LIST & FILTERS)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_admin_opportunities_atomic(
    p_stage TEXT DEFAULT NULL,
    p_product TEXT DEFAULT NULL,
    p_organization_id UUID DEFAULT NULL,
    p_owner_id UUID DEFAULT NULL,
    p_unassigned_only BOOLEAN DEFAULT FALSE,
    p_stale_only BOOLEAN DEFAULT FALSE,
    p_search TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_result JSONB;
    v_stale_cutoff TIMESTAMPTZ := now() - INTERVAL '14 days';
BEGIN
    -- 1. Explicit server-authoritative admin verification
    IF NOT is_admin() THEN
        RETURN jsonb_build_object(
            'success', false,
            'opportunities', '[]'::jsonb,
            'error', 'Unauthorized: Administrative access required.'
        );
    END IF;

    -- 2. Query opportunities with relational joins
    SELECT jsonb_build_object(
        'success', true,
        'opportunities', COALESCE(jsonb_agg(
            jsonb_build_object(
                'id', o.id,
                'organization_id', o.organization_id,
                'contact_id', o.contact_id,
                'lead_id', o.lead_id,
                'title', o.title,
                'primary_product', o.primary_product,
                'stage', o.stage,
                'deal_value_ngn', o.deal_value_ngn,
                'close_date', o.close_date,
                'expected_close_date', o.expected_close_date,
                'next_action', o.next_action,
                'next_action_due_date', o.next_action_due_date,
                'last_activity_at', COALESCE(o.last_activity_at, o.updated_at, o.created_at),
                'loss_reason', o.loss_reason,
                'owner_id', o.owner_id,
                'created_at', o.created_at,
                'updated_at', o.updated_at,
                'organization', CASE WHEN org.id IS NOT NULL THEN jsonb_build_object(
                    'id', org.id,
                    'name', org.name,
                    'slug', org.slug,
                    'domain', org.domain,
                    'status', org.status,
                    'created_at', org.created_at,
                    'updated_at', org.updated_at
                ) ELSE NULL END,
                'contact', CASE WHEN c.id IS NOT NULL THEN jsonb_build_object(
                    'id', c.id,
                    'email', c.email,
                    'full_name', c.full_name,
                    'phone', c.phone,
                    'job_title', c.job_title,
                    'created_at', c.created_at,
                    'updated_at', c.updated_at
                ) ELSE NULL END
            ) ORDER BY o.created_at DESC
        ), '[]'::jsonb)
    )
    INTO v_result
    FROM public.crm_opportunities o
    LEFT JOIN public.crm_organizations org ON org.id = o.organization_id
    LEFT JOIN public.crm_contacts c ON c.id = o.contact_id
    WHERE (p_stage IS NULL OR o.stage = p_stage)
      AND (p_product IS NULL OR o.primary_product = p_product)
      AND (p_organization_id IS NULL OR o.organization_id = p_organization_id)
      AND (
          (p_unassigned_only = TRUE AND o.owner_id IS NULL)
          OR (p_unassigned_only = FALSE AND (p_owner_id IS NULL OR o.owner_id = p_owner_id))
      )
      AND (
          p_stale_only = FALSE
          OR (
              o.stage NOT IN ('won', 'lost')
              AND COALESCE(o.last_activity_at, o.updated_at, o.created_at) < v_stale_cutoff
          )
      )
      AND (
          p_search IS NULL
          OR o.title ILIKE '%' || p_search || '%'
          OR o.primary_product ILIKE '%' || p_search || '%'
          OR org.name ILIKE '%' || p_search || '%'
          OR c.full_name ILIKE '%' || p_search || '%'
      );

    RETURN v_result;
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. GET ADMIN OPPORTUNITY DETAIL ATOMIC (DRAWER & TIMELINE INSPECTION)
-- ------------------------------------------------------------------------------
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
    v_org RECORD;
    v_contact RECORD;
    v_lead RECORD;
    v_booking RECORD;
    v_activities JSONB;
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
        SELECT id, name, slug, domain, industry, company_size, status, created_at, updated_at
        INTO v_org
        FROM public.crm_organizations
        WHERE id = v_opp.organization_id;
    END IF;

    -- 4. Fetch contact if linked
    IF v_opp.contact_id IS NOT NULL THEN
        SELECT id, organization_id, email, full_name, phone, job_title, is_primary, created_at, updated_at
        INTO v_contact
        FROM public.crm_contacts
        WHERE id = v_opp.contact_id;
    END IF;

    -- 5. Fetch lead if linked
    IF v_opp.lead_id IS NOT NULL THEN
        SELECT id, reference_id, form_type, status, product_interest, tier, notes, created_at
        INTO v_lead
        FROM public.crm_leads
        WHERE id = v_opp.lead_id;
    END IF;

    -- 6. Fetch latest associated booking if any
    SELECT id, reference_id, booking_date, start_time, end_time, status
    INTO v_booking
    FROM public.bookings
    WHERE (v_lead.reference_id IS NOT NULL AND lead_id = v_lead.reference_id)
       OR (v_opp.contact_id IS NOT NULL AND contact_id = v_opp.contact_id)
    ORDER BY created_at DESC
    LIMIT 1;

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
            'organization', CASE WHEN v_org.id IS NOT NULL THEN jsonb_build_object(
                'id', v_org.id,
                'name', v_org.name,
                'slug', v_org.slug,
                'domain', v_org.domain,
                'industry', v_org.industry,
                'company_size', v_org.company_size,
                'status', v_org.status,
                'created_at', v_org.created_at,
                'updated_at', v_org.updated_at
            ) ELSE NULL END,
            'contact', CASE WHEN v_contact.id IS NOT NULL THEN jsonb_build_object(
                'id', v_contact.id,
                'organization_id', v_contact.organization_id,
                'email', v_contact.email,
                'full_name', v_contact.full_name,
                'phone', v_contact.phone,
                'job_title', v_contact.job_title,
                'is_primary', v_contact.is_primary,
                'created_at', v_contact.created_at,
                'updated_at', v_contact.updated_at
            ) ELSE NULL END,
            'lead', CASE WHEN v_lead.id IS NOT NULL THEN jsonb_build_object(
                'id', v_lead.id,
                'reference_id', v_lead.reference_id,
                'form_type', v_lead.form_type,
                'status', v_lead.status,
                'product_interest', v_lead.product_interest,
                'tier', v_lead.tier,
                'notes', v_lead.notes,
                'created_at', v_lead.created_at
            ) ELSE NULL END,
            'booking', CASE WHEN v_booking.id IS NOT NULL THEN jsonb_build_object(
                'id', v_booking.id,
                'reference_id', v_booking.reference_id,
                'booking_date', v_booking.booking_date,
                'start_time', v_booking.start_time,
                'end_time', v_booking.end_time,
                'status', v_booking.status
            ) ELSE NULL END,
            'activities', v_activities
        )
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. PERMISSION HARDENING & PRIVILEGE BOUNDARIES
-- ------------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.get_admin_opportunities_atomic FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_admin_opportunities_atomic FROM anon;
GRANT EXECUTE ON FUNCTION public.get_admin_opportunities_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_opportunities_atomic TO postgres;

REVOKE EXECUTE ON FUNCTION public.get_admin_opportunity_detail_atomic(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_admin_opportunity_detail_atomic(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_admin_opportunity_detail_atomic(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_opportunity_detail_atomic(UUID) TO postgres;
