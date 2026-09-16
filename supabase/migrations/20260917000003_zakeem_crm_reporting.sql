-- ==============================================================================
-- PHASE 26E — CRM COMMERCIAL INTELLIGENCE & REPORTING
-- Migration: 20260917000003_zakeem_crm_reporting.sql
-- Dedicated Project: Zakeem Solutions (atrevctosjcimszirdcc)
--
-- OBJECTIVE:
-- 1. Create atomic SECURITY DEFINER RPC for CRM commercial intelligence reporting:
--    - public.get_crm_commercial_reports_atomic
-- 2. Enforce strict server-side authorization:
--    - Independently checks is_admin() (canonical admin in app_metadata/auth.users)
--    - Rejects anon
--    - Rejects authenticated non-admin users
--    - Zero email-domain authorization
--    - Zero user_metadata authorization
--    - SET search_path = public, pg_temp
-- 3. Calculate metrics ONLY from actual database records (no speculative forecasting).
-- 4. Differentiate populated monetary values from NULL deal values.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_crm_commercial_reports_atomic(
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_report JSONB;
    v_summary JSONB;
    v_funnel JSONB;
    v_pipeline JSONB;
    v_product_demand JSONB;
    v_attribution JSONB;
    v_scheduling JSONB;
    v_account_contact JSONB;
    
    -- Filtered counts & metrics
    v_total_leads INT;
    v_new_leads INT;
    v_contacted_leads INT;
    v_qualified_leads INT;
    v_converted_leads INT;
    v_disqualified_leads INT;

    v_open_opps INT;
    v_won_opps INT;
    v_lost_opps INT;
    v_total_opps INT;
    v_deals_known_value INT;
    v_deals_unallocated INT;
    v_total_value NUMERIC;
    v_open_value NUMERIC;
    v_won_value NUMERIC;

    v_total_orgs INT;
    v_total_contacts INT;
    v_scheduled_walkthroughs INT;
BEGIN
    -- 1. Explicit admin check (rejects anon and non-admin authenticated users)
    IF NOT is_admin() THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized: Administrative access required.'
        );
    END IF;

    -- 2. Lead Funnel & Summary Calculations
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'new'),
        COUNT(*) FILTER (WHERE status = 'contacted'),
        COUNT(*) FILTER (WHERE status = 'qualified'),
        COUNT(*) FILTER (WHERE status = 'converted'),
        COUNT(*) FILTER (WHERE status = 'disqualified')
    INTO
        v_total_leads,
        v_new_leads,
        v_contacted_leads,
        v_qualified_leads,
        v_converted_leads,
        v_disqualified_leads
    FROM public.crm_leads
    WHERE (p_start_date IS NULL OR created_at >= p_start_date)
      AND (p_end_date IS NULL OR created_at <= p_end_date);

    v_funnel := jsonb_build_object(
        'new', v_new_leads,
        'contacted', v_contacted_leads,
        'qualified', v_qualified_leads,
        'converted', v_converted_leads,
        'disqualified', v_disqualified_leads,
        'total', v_total_leads,
        'conversionRatePercent', CASE WHEN v_total_leads > 0 THEN ROUND((v_converted_leads::NUMERIC / v_total_leads::NUMERIC) * 100, 1) ELSE NULL END,
        'qualificationRatePercent', CASE WHEN v_total_leads > 0 THEN ROUND(((v_qualified_leads + v_converted_leads)::NUMERIC / v_total_leads::NUMERIC) * 100, 1) ELSE NULL END
    );

    -- 3. Opportunities & Pipeline Valuation Calculations
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE stage NOT IN ('won', 'lost')),
        COUNT(*) FILTER (WHERE stage = 'won'),
        COUNT(*) FILTER (WHERE stage = 'lost'),
        COUNT(*) FILTER (WHERE deal_value_ngn IS NOT NULL),
        COUNT(*) FILTER (WHERE deal_value_ngn IS NULL),
        SUM(deal_value_ngn),
        SUM(deal_value_ngn) FILTER (WHERE stage NOT IN ('won', 'lost')),
        SUM(deal_value_ngn) FILTER (WHERE stage = 'won')
    INTO
        v_total_opps,
        v_open_opps,
        v_won_opps,
        v_lost_opps,
        v_deals_known_value,
        v_deals_unallocated,
        v_total_value,
        v_open_value,
        v_won_value
    FROM public.crm_opportunities
    WHERE (p_start_date IS NULL OR created_at >= p_start_date)
      AND (p_end_date IS NULL OR created_at <= p_end_date);

    -- Stage by stage breakdown
    WITH stage_agg AS (
        SELECT
            stage,
            COUNT(*) as count,
            SUM(deal_value_ngn) as populated_value,
            COUNT(*) FILTER (WHERE deal_value_ngn IS NOT NULL) as known_value_count,
            COUNT(*) FILTER (WHERE deal_value_ngn IS NULL) as unallocated_count
        FROM public.crm_opportunities
        WHERE (p_start_date IS NULL OR created_at >= p_start_date)
          AND (p_end_date IS NULL OR created_at <= p_end_date)
        GROUP BY stage
    )
    SELECT jsonb_object_agg(
        s.stage,
        jsonb_build_object(
            'count', COALESCE(sa.count, 0),
            'populatedValueNgn', sa.populated_value,
            'knownValueCount', COALESCE(sa.known_value_count, 0),
            'unallocatedValueCount', COALESCE(sa.unallocated_count, 0)
        )
    )
    INTO v_pipeline
    FROM (
        VALUES 
            ('discovery'), ('demo_scheduled'), ('demo_completed'),
            ('proposal'), ('negotiation'), ('won'), ('lost')
    ) AS s(stage)
    LEFT JOIN stage_agg sa ON sa.stage = s.stage;

    -- 4. Organizations & Contacts
    SELECT COUNT(*) INTO v_total_orgs
    FROM public.crm_organizations
    WHERE (p_start_date IS NULL OR created_at >= p_start_date)
      AND (p_end_date IS NULL OR created_at <= p_end_date);

    SELECT COUNT(*) INTO v_total_contacts
    FROM public.crm_contacts
    WHERE (p_start_date IS NULL OR created_at >= p_start_date)
      AND (p_end_date IS NULL OR created_at <= p_end_date);

    -- 5. Bookings / Scheduling Calculations
    SELECT
        COUNT(*),
        jsonb_build_object(
            'totalBookings', COUNT(*),
            'pending', COUNT(*) FILTER (WHERE status = 'pending'),
            'confirmed', COUNT(*) FILTER (WHERE status = 'confirmed'),
            'completed', COUNT(*) FILTER (WHERE status = 'completed'),
            'cancelled', COUNT(*) FILTER (WHERE status = 'cancelled'),
            'noShow', COUNT(*) FILTER (WHERE status = 'no_show')
        )
    INTO
        v_scheduled_walkthroughs,
        v_scheduling
    FROM public.bookings
    WHERE (p_start_date IS NULL OR created_at >= p_start_date)
      AND (p_end_date IS NULL OR created_at <= p_end_date);

    -- 6. Executive Summary
    v_summary := jsonb_build_object(
        'totalLeads', v_total_leads,
        'newLeads', v_new_leads,
        'contactedLeads', v_contacted_leads,
        'qualifiedLeads', v_qualified_leads,
        'convertedLeads', v_converted_leads,
        'disqualifiedLeads', v_disqualified_leads,
        'openOpportunities', v_open_opps,
        'wonOpportunities', v_won_opps,
        'lostOpportunities', v_lost_opps,
        'totalOrganizations', v_total_orgs,
        'totalContacts', v_total_contacts,
        'scheduledWalkthroughs', v_scheduled_walkthroughs
    );

    -- 7. Account & Contact Intelligence Breakdown
    WITH org_status AS (
        SELECT
            status,
            COUNT(*) as count
        FROM public.crm_organizations
        WHERE (p_start_date IS NULL OR created_at >= p_start_date)
          AND (p_end_date IS NULL OR created_at <= p_end_date)
        GROUP BY status
    ),
    contact_stats AS (
        SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE organization_id IS NOT NULL) as with_org,
            COUNT(*) FILTER (WHERE organization_id IS NULL) as independent,
            COUNT(*) FILTER (WHERE is_primary = true) as primary_count,
            COUNT(*) FILTER (WHERE is_primary = false OR is_primary IS NULL) as secondary_count
        FROM public.crm_contacts
        WHERE (p_start_date IS NULL OR created_at >= p_start_date)
          AND (p_end_date IS NULL OR created_at <= p_end_date)
    )
    SELECT jsonb_build_object(
        'organizationsByStatus', jsonb_build_object(
            'customer', COALESCE((SELECT count FROM org_status WHERE status = 'customer'), 0),
            'prospect', COALESCE((SELECT count FROM org_status WHERE status = 'prospect'), 0),
            'lead', COALESCE((SELECT count FROM org_status WHERE status = 'lead'), 0),
            'partner', COALESCE((SELECT count FROM org_status WHERE status = 'partner'), 0),
            'churned', COALESCE((SELECT count FROM org_status WHERE status = 'churned'), 0)
        ),
        'contactsTotal', cs.total,
        'contactsWithOrg', cs.with_org,
        'contactsIndependent', cs.independent,
        'primaryDecisionMakers', cs.primary_count,
        'secondaryStakeholders', cs.secondary_count
    )
    INTO v_account_contact
    FROM contact_stats cs;

    -- 8. Product Demand Breakdown (Grouped from Leads and Opportunities)
    WITH product_leads AS (
        SELECT
            product_interest as prod,
            COUNT(*) as l_count,
            COUNT(*) FILTER (WHERE status = 'converted') as c_count
        FROM public.crm_leads
        WHERE product_interest IS NOT NULL
          AND (p_start_date IS NULL OR created_at >= p_start_date)
          AND (p_end_date IS NULL OR created_at <= p_end_date)
        GROUP BY product_interest
    ),
    product_opps AS (
        SELECT
            primary_product as prod,
            COUNT(*) as o_count
        FROM public.crm_opportunities
        WHERE primary_product IS NOT NULL
          AND (p_start_date IS NULL OR created_at >= p_start_date)
          AND (p_end_date IS NULL OR created_at <= p_end_date)
        GROUP BY primary_product
    )
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'productId', COALESCE(pl.prod, po.prod),
                'leadCount', COALESCE(pl.l_count, 0),
                'opportunityCount', COALESCE(po.o_count, 0),
                'convertedCount', COALESCE(pl.c_count, 0)
            )
        ),
        '[]'::jsonb
    )
    INTO v_product_demand
    FROM product_leads pl
    FULL OUTER JOIN product_opps po ON po.prod = pl.prod;

    -- 9. Attribution Breakdown
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'source', COALESCE(attribution->>'source', attribution->>'utm_source', 'Direct / Organic'),
                'medium', COALESCE(attribution->>'medium', attribution->>'utm_medium', 'None'),
                'campaign', COALESCE(attribution->>'campaign', attribution->>'utm_campaign', 'None'),
                'leadCount', count
            )
        ),
        '[]'::jsonb
    )
    INTO v_attribution
    FROM (
        SELECT
            attribution,
            COUNT(*) as count
        FROM public.crm_leads
        WHERE attribution IS NOT NULL AND attribution != '{}'::jsonb
          AND (p_start_date IS NULL OR created_at >= p_start_date)
          AND (p_end_date IS NULL OR created_at <= p_end_date)
        GROUP BY attribution
        LIMIT 20
    ) att_sub;

    -- Return full consolidated payload
    RETURN jsonb_build_object(
        'success', true,
        'report', jsonb_build_object(
            'summary', v_summary,
            'leadFunnel', v_funnel,
            'pipeline', jsonb_build_object(
                'totalDealsCount', v_total_opps,
                'dealsWithKnownValueCount', v_deals_known_value,
                'dealsWithoutValueCount', v_deals_unallocated,
                'totalPopulatedValueNgn', v_total_value,
                'openPopulatedValueNgn', v_open_value,
                'wonPopulatedValueNgn', v_won_value,
                'stages', v_pipeline
            ),
            'productDemand', v_product_demand,
            'attribution', v_attribution,
            'scheduling', v_scheduling,
            'accountContact', v_account_contact
        )
    );
END;
$$;

-- Privileged execution permissions
REVOKE EXECUTE ON FUNCTION public.get_crm_commercial_reports_atomic(TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_crm_commercial_reports_atomic(TIMESTAMPTZ, TIMESTAMPTZ) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_crm_commercial_reports_atomic(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_crm_commercial_reports_atomic(TIMESTAMPTZ, TIMESTAMPTZ) TO service_role;
