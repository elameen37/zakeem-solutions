-- ==============================================================================
-- PHASE 27 — ENTERPRISE CRM OPERATIONS & ADMIN WORKFLOW MIGRATION
-- Migration: 20260917000004_zakeem_crm_operations.sql
-- Dedicated Project: Zakeem Solutions (atrevctosjcimszirdcc)
--
-- OBJECTIVE:
-- 1. Phase 27A: Add authenticated admin ownership to crm_leads and crm_opportunities.
-- 2. Phase 27B: Extend crm_activities with operational touchpoints, due dates,
--    completion statuses, and assignees (call, meeting, follow_up, note, etc.).
-- 3. Phase 27C: Extend crm_opportunities with operational fields (expected_close_date,
--    next_action, next_action_due_date, last_activity_at).
-- 4. Phase 27D: Add follow-up intelligence aggregation RPC for overdue, today,
--    upcoming, stale, and unassigned records.
-- 5. Hardened SECURITY DEFINER RPCs:
--    - assign_lead_owner_atomic
--    - assign_opportunity_owner_atomic
--    - create_crm_activity_atomic
--    - complete_crm_activity_atomic
--    - update_opportunity_details_atomic (extended)
--    - get_crm_follow_up_intelligence_atomic
-- 6. Strict server-side admin authorization (is_admin()), zero client/anon access,
--    and search_path = public, pg_temp.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTEND CRM_LEADS (OWNERSHIP)
-- ------------------------------------------------------------------------------
ALTER TABLE public.crm_leads
    ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_crm_leads_owner_id ON public.crm_leads(owner_id);

-- ------------------------------------------------------------------------------
-- 2. EXTEND CRM_OPPORTUNITIES (OWNERSHIP & OPERATIONAL FIELDS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.crm_opportunities
    ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS expected_close_date DATE,
    ADD COLUMN IF NOT EXISTS next_action TEXT,
    ADD COLUMN IF NOT EXISTS next_action_due_date DATE,
    ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_crm_opportunities_owner_id ON public.crm_opportunities(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_last_activity ON public.crm_opportunities(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_next_action_due ON public.crm_opportunities(next_action_due_date);

-- ------------------------------------------------------------------------------
-- 3. EXTEND CRM_ACTIVITIES (OPERATIONAL FOLLOW-UPS & ASSIGNMENTS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.crm_activities
    ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed',
    ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Safely update check constraint on status
ALTER TABLE public.crm_activities
    DROP CONSTRAINT IF EXISTS crm_activities_status_check;

ALTER TABLE public.crm_activities
    ADD CONSTRAINT crm_activities_status_check
    CHECK (status IN ('pending', 'completed', 'cancelled'));

-- Safely expand check constraint on activity_type to support operational touchpoints
ALTER TABLE public.crm_activities
    DROP CONSTRAINT IF EXISTS crm_activities_activity_type_check;

ALTER TABLE public.crm_activities
    ADD CONSTRAINT crm_activities_activity_type_check
    CHECK (
        activity_type IN (
            'lead_created', 'lead_status_changed',
            'demo_booked', 'demo_rescheduled', 'demo_cancelled', 'demo_completed',
            'opportunity_created', 'stage_changed',
            'invitation_sent', 'invitation_accepted', 'invitation_revoked',
            'note_added', 'email_sent',
            'call', 'meeting', 'follow_up', 'demo', 'proposal', 'negotiation', 'owner_assigned'
        )
    );

CREATE INDEX IF NOT EXISTS idx_crm_activities_due_date ON public.crm_activities(due_date);
CREATE INDEX IF NOT EXISTS idx_crm_activities_status ON public.crm_activities(status);
CREATE INDEX IF NOT EXISTS idx_crm_activities_assigned_to ON public.crm_activities(assigned_to);

-- ------------------------------------------------------------------------------
-- 4. AUTOMATIC TRIGGER: UPDATE OPPORTUNITY LAST_ACTIVITY_AT
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_update_opportunity_last_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.opportunity_id IS NOT NULL THEN
        UPDATE public.crm_opportunities
        SET last_activity_at = NEW.created_at,
            updated_at = now()
        WHERE id = NEW.opportunity_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crm_activities_opportunity_sync ON public.crm_activities;
CREATE TRIGGER trg_crm_activities_opportunity_sync
AFTER INSERT ON public.crm_activities
FOR EACH ROW
EXECUTE FUNCTION trg_update_opportunity_last_activity();

-- ------------------------------------------------------------------------------
-- 5. RPC: ASSIGN LEAD OWNER ATOMICALLY
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.assign_lead_owner_atomic(
    p_lead_id UUID,
    p_new_owner_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_lead RECORD;
    v_old_owner_id UUID;
    v_old_owner_name TEXT := 'Unassigned';
    v_new_owner_name TEXT := 'Unassigned';
BEGIN
    -- 1. Explicit admin check
    IF NOT is_admin() THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized: Administrative access required.'
        );
    END IF;

    -- 2. Fetch target lead
    SELECT id, reference_id, organization_id, contact_id, owner_id
    INTO v_lead
    FROM public.crm_leads
    WHERE id = p_lead_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Lead record not found.');
    END IF;

    v_old_owner_id := v_lead.owner_id;

    -- 3. If new owner is provided, verify they are an active administrator
    IF p_new_owner_id IS NOT NULL THEN
        SELECT full_name INTO v_new_owner_name
        FROM public.profiles
        WHERE id = p_new_owner_id AND role = 'admin';

        IF NOT FOUND THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Invalid owner: Assigned owner must be an authorized administrator.'
            );
        END IF;
    END IF;

    -- Resolve old owner name if previously assigned
    IF v_old_owner_id IS NOT NULL THEN
        SELECT full_name INTO v_old_owner_name
        FROM public.profiles
        WHERE id = v_old_owner_id;
    END IF;

    -- 4. Apply update
    UPDATE public.crm_leads
    SET owner_id = p_new_owner_id,
        updated_at = now()
    WHERE id = p_lead_id;

    -- 5. Record chronological audit activity
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
        'owner_assigned',
        v_lead.organization_id,
        v_lead.contact_id,
        p_lead_id,
        auth.uid(),
        'Lead Ownership Updated',
        'Lead owner changed from ' || COALESCE(v_old_owner_name, 'Unassigned') || ' to ' || COALESCE(v_new_owner_name, 'Unassigned'),
        jsonb_build_object(
            'previous_owner_id', v_old_owner_id,
            'new_owner_id', p_new_owner_id,
            'previous_owner_name', v_old_owner_name,
            'new_owner_name', v_new_owner_name,
            'reference_id', v_lead.reference_id
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'lead_id', p_lead_id,
        'owner_id', p_new_owner_id,
        'owner_name', v_new_owner_name
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.assign_lead_owner_atomic(UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.assign_lead_owner_atomic(UUID, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.assign_lead_owner_atomic(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_lead_owner_atomic(UUID, UUID) TO service_role;

-- ------------------------------------------------------------------------------
-- 6. RPC: ASSIGN OPPORTUNITY OWNER ATOMICALLY
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.assign_opportunity_owner_atomic(
    p_opportunity_id UUID,
    p_new_owner_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_opp RECORD;
    v_old_owner_id UUID;
    v_old_owner_name TEXT := 'Unassigned';
    v_new_owner_name TEXT := 'Unassigned';
BEGIN
    -- 1. Explicit admin check
    IF NOT is_admin() THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized: Administrative access required.'
        );
    END IF;

    -- 2. Fetch target opportunity
    SELECT id, organization_id, contact_id, lead_id, title, owner_id
    INTO v_opp
    FROM public.crm_opportunities
    WHERE id = p_opportunity_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Opportunity record not found.');
    END IF;

    v_old_owner_id := v_opp.owner_id;

    -- 3. If new owner is provided, verify they are an active administrator
    IF p_new_owner_id IS NOT NULL THEN
        SELECT full_name INTO v_new_owner_name
        FROM public.profiles
        WHERE id = p_new_owner_id AND role = 'admin';

        IF NOT FOUND THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Invalid owner: Assigned owner must be an authorized administrator.'
            );
        END IF;
    END IF;

    -- Resolve old owner name if previously assigned
    IF v_old_owner_id IS NOT NULL THEN
        SELECT full_name INTO v_old_owner_name
        FROM public.profiles
        WHERE id = v_old_owner_id;
    END IF;

    -- 4. Apply update
    UPDATE public.crm_opportunities
    SET owner_id = p_new_owner_id,
        last_activity_at = now(),
        updated_at = now()
    WHERE id = p_opportunity_id;

    -- 5. Record chronological audit activity
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
        'owner_assigned',
        v_opp.organization_id,
        v_opp.contact_id,
        v_opp.lead_id,
        p_opportunity_id,
        auth.uid(),
        'Deal Ownership Updated',
        'Deal owner changed from ' || COALESCE(v_old_owner_name, 'Unassigned') || ' to ' || COALESCE(v_new_owner_name, 'Unassigned'),
        jsonb_build_object(
            'previous_owner_id', v_old_owner_id,
            'new_owner_id', p_new_owner_id,
            'previous_owner_name', v_old_owner_name,
            'new_owner_name', v_new_owner_name,
            'title', v_opp.title
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'opportunity_id', p_opportunity_id,
        'owner_id', p_new_owner_id,
        'owner_name', v_new_owner_name
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.assign_opportunity_owner_atomic(UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.assign_opportunity_owner_atomic(UUID, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.assign_opportunity_owner_atomic(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_opportunity_owner_atomic(UUID, UUID) TO service_role;

-- ------------------------------------------------------------------------------
-- 7. RPC: CREATE CRM OPERATIONAL ACTIVITY ATOMICALLY
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_crm_activity_atomic(
    p_activity_type TEXT,
    p_title TEXT,
    p_description TEXT DEFAULT NULL,
    p_organization_id UUID DEFAULT NULL,
    p_contact_id UUID DEFAULT NULL,
    p_lead_id UUID DEFAULT NULL,
    p_opportunity_id UUID DEFAULT NULL,
    p_booking_id UUID DEFAULT NULL,
    p_due_date TIMESTAMPTZ DEFAULT NULL,
    p_assigned_to UUID DEFAULT NULL,
    p_status TEXT DEFAULT 'completed',
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_clean_title TEXT;
    v_clean_desc TEXT;
    v_status TEXT;
    v_act_id UUID;
BEGIN
    -- 1. Explicit admin check
    IF NOT is_admin() THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized: Administrative access required.'
        );
    END IF;

    -- 2. Validate title
    v_clean_title := NULLIF(trim(p_title), '');
    IF v_clean_title IS NULL OR length(v_clean_title) < 2 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Activity title must be at least 2 characters.');
    END IF;

    v_clean_desc := NULLIF(trim(p_description), '');

    -- 3. Validate status
    v_status := COALESCE(p_status, CASE WHEN p_due_date IS NOT NULL AND p_due_date > now() THEN 'pending' ELSE 'completed' END);
    IF v_status NOT IN ('pending', 'completed', 'cancelled') THEN
        v_status := 'completed';
    END IF;

    -- 4. Validate assignee if provided
    IF p_assigned_to IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_assigned_to AND role = 'admin') THEN
            RETURN jsonb_build_object('success', false, 'error', 'Assignee must be an active administrator.');
        END IF;
    END IF;

    -- 5. Insert activity record
    INSERT INTO public.crm_activities (
        activity_type,
        organization_id,
        contact_id,
        lead_id,
        opportunity_id,
        booking_id,
        actor_id,
        assigned_to,
        title,
        description,
        due_date,
        completed_at,
        status,
        metadata
    ) VALUES (
        p_activity_type,
        p_organization_id,
        p_contact_id,
        p_lead_id,
        p_opportunity_id,
        p_booking_id,
        auth.uid(),
        p_assigned_to,
        v_clean_title,
        v_clean_desc,
        p_due_date,
        CASE WHEN v_status = 'completed' THEN now() ELSE NULL END,
        v_status,
        COALESCE(p_metadata, '{}'::jsonb)
    )
    RETURNING id INTO v_act_id;

    -- 6. Update opportunity last_activity_at if opportunity_id is set
    IF p_opportunity_id IS NOT NULL THEN
        UPDATE public.crm_opportunities
        SET last_activity_at = now(),
            updated_at = now()
        WHERE id = p_opportunity_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'activity_id', v_act_id,
        'title', v_clean_title,
        'status', v_status
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_crm_activity_atomic FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_crm_activity_atomic FROM anon;
GRANT EXECUTE ON FUNCTION public.create_crm_activity_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_crm_activity_atomic TO service_role;

-- ------------------------------------------------------------------------------
-- 8. RPC: COMPLETE CRM ACTIVITY ATOMICALLY
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.complete_crm_activity_atomic(
    p_activity_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_act RECORD;
BEGIN
    -- 1. Explicit admin check
    IF NOT is_admin() THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized: Administrative access required.'
        );
    END IF;

    -- 2. Fetch target activity
    SELECT id, opportunity_id, status, title
    INTO v_act
    FROM public.crm_activities
    WHERE id = p_activity_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Activity record not found.');
    END IF;

    IF v_act.status = 'completed' THEN
        RETURN jsonb_build_object('success', true, 'message', 'Activity is already completed.');
    END IF;

    -- 3. Update activity status
    UPDATE public.crm_activities
    SET status = 'completed',
        completed_at = now()
    WHERE id = p_activity_id;

    -- 4. Update opportunity last_activity_at if attached
    IF v_act.opportunity_id IS NOT NULL THEN
        UPDATE public.crm_opportunities
        SET last_activity_at = now(),
            updated_at = now()
        WHERE id = v_act.opportunity_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'activity_id', p_activity_id,
        'status', 'completed',
        'title', v_act.title
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.complete_crm_activity_atomic(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.complete_crm_activity_atomic(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.complete_crm_activity_atomic(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_crm_activity_atomic(UUID) TO service_role;

-- ------------------------------------------------------------------------------
-- 9. EXTEND UPDATE_OPPORTUNITY_DETAILS_ATOMIC
-- Supports expected_close_date, next_action, and next_action_due_date.
-- ------------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.update_opportunity_details_atomic(UUID, TEXT, NUMERIC, DATE);

CREATE OR REPLACE FUNCTION public.update_opportunity_details_atomic(
    p_opportunity_id UUID,
    p_title TEXT DEFAULT NULL,
    p_deal_value_ngn NUMERIC DEFAULT NULL,
    p_close_date DATE DEFAULT NULL,
    p_expected_close_date DATE DEFAULT NULL,
    p_next_action TEXT DEFAULT NULL,
    p_next_action_due_date DATE DEFAULT NULL
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

    -- 2. Fetch target opportunity
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
        expected_close_date = CASE WHEN p_expected_close_date IS NOT NULL THEN p_expected_close_date ELSE expected_close_date END,
        next_action = CASE WHEN p_next_action IS NOT NULL THEN NULLIF(trim(p_next_action), '') ELSE next_action END,
        next_action_due_date = CASE WHEN p_next_action_due_date IS NOT NULL THEN p_next_action_due_date ELSE next_action_due_date END,
        last_activity_at = now(),
        updated_at = now()
    WHERE id = p_opportunity_id;

    RETURN jsonb_build_object(
        'success', true,
        'opportunity_id', p_opportunity_id
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_opportunity_details_atomic(UUID, TEXT, NUMERIC, DATE, DATE, TEXT, DATE) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_opportunity_details_atomic(UUID, TEXT, NUMERIC, DATE, DATE, TEXT, DATE) FROM anon;
GRANT EXECUTE ON FUNCTION public.update_opportunity_details_atomic(UUID, TEXT, NUMERIC, DATE, DATE, TEXT, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_opportunity_details_atomic(UUID, TEXT, NUMERIC, DATE, DATE, TEXT, DATE) TO service_role;

-- ------------------------------------------------------------------------------
-- 10. RPC: GET CRM FOLLOW-UP & WORKSPACE INTELLIGENCE
-- Returns actual database records for overdue, today's, upcoming follow-ups,
-- stale opportunities (>14 days without activity), and unassigned records.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_crm_follow_up_intelligence_atomic()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_overdue_activities JSONB;
    v_today_activities JSONB;
    v_upcoming_activities JSONB;
    v_stale_opportunities JSONB;
    v_unassigned_leads JSONB;
    v_unassigned_opportunities JSONB;
    v_counts JSONB;
    v_now TIMESTAMPTZ := now();
    v_today_date DATE := CURRENT_DATE;
BEGIN
    -- 1. Explicit admin check
    IF NOT is_admin() THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized: Administrative access required.'
        );
    END IF;

    -- 2. Overdue follow-ups (pending & due before now)
    SELECT jsonb_agg(jsonb_build_object(
        'id', a.id,
        'activityType', a.activity_type,
        'title', a.title,
        'description', a.description,
        'dueDate', a.due_date,
        'status', a.status,
        'assignedTo', a.assigned_to,
        'assigneeName', p.full_name,
        'leadId', a.lead_id,
        'opportunityId', a.opportunity_id,
        'opportunityTitle', o.title,
        'contactId', a.contact_id,
        'contactName', c.full_name,
        'organizationName', org.name,
        'createdAt', a.created_at
    ))
    INTO v_overdue_activities
    FROM public.crm_activities a
    LEFT JOIN public.profiles p ON p.id = a.assigned_to
    LEFT JOIN public.crm_opportunities o ON o.id = a.opportunity_id
    LEFT JOIN public.crm_contacts c ON c.id = a.contact_id
    LEFT JOIN public.crm_organizations org ON org.id = a.organization_id
    WHERE a.status = 'pending'
      AND a.due_date < v_now
    ORDER BY a.due_date ASC
    LIMIT 25;

    -- 3. Today's follow-ups (pending & due today)
    SELECT jsonb_agg(jsonb_build_object(
        'id', a.id,
        'activityType', a.activity_type,
        'title', a.title,
        'description', a.description,
        'dueDate', a.due_date,
        'status', a.status,
        'assignedTo', a.assigned_to,
        'assigneeName', p.full_name,
        'leadId', a.lead_id,
        'opportunityId', a.opportunity_id,
        'opportunityTitle', o.title,
        'contactId', a.contact_id,
        'contactName', c.full_name,
        'organizationName', org.name,
        'createdAt', a.created_at
    ))
    INTO v_today_activities
    FROM public.crm_activities a
    LEFT JOIN public.profiles p ON p.id = a.assigned_to
    LEFT JOIN public.crm_opportunities o ON o.id = a.opportunity_id
    LEFT JOIN public.crm_contacts c ON c.id = a.contact_id
    LEFT JOIN public.crm_organizations org ON org.id = a.organization_id
    WHERE a.status = 'pending'
      AND a.due_date::date = v_today_date
    ORDER BY a.due_date ASC
    LIMIT 25;

    -- 4. Upcoming follow-ups (pending & due in the future)
    SELECT jsonb_agg(jsonb_build_object(
        'id', a.id,
        'activityType', a.activity_type,
        'title', a.title,
        'description', a.description,
        'dueDate', a.due_date,
        'status', a.status,
        'assignedTo', a.assigned_to,
        'assigneeName', p.full_name,
        'leadId', a.lead_id,
        'opportunityId', a.opportunity_id,
        'opportunityTitle', o.title,
        'contactId', a.contact_id,
        'contactName', c.full_name,
        'organizationName', org.name,
        'createdAt', a.created_at
    ))
    INTO v_upcoming_activities
    FROM public.crm_activities a
    LEFT JOIN public.profiles p ON p.id = a.assigned_to
    LEFT JOIN public.crm_opportunities o ON o.id = a.opportunity_id
    LEFT JOIN public.crm_contacts c ON c.id = a.contact_id
    LEFT JOIN public.crm_organizations org ON org.id = a.organization_id
    WHERE a.status = 'pending'
      AND a.due_date > v_now
      AND a.due_date::date <> v_today_date
    ORDER BY a.due_date ASC
    LIMIT 25;

    -- 5. Stale Opportunities (open deals with no activity in > 14 days)
    SELECT jsonb_agg(jsonb_build_object(
        'id', o.id,
        'title', o.title,
        'stage', o.stage,
        'dealValueNgn', o.deal_value_ngn,
        'primaryProduct', o.primary_product,
        'ownerId', o.owner_id,
        'ownerName', p.full_name,
        'organizationName', org.name,
        'lastActivityAt', COALESCE(o.last_activity_at, o.updated_at, o.created_at),
        'daysInactive', EXTRACT(DAY FROM (v_now - COALESCE(o.last_activity_at, o.updated_at, o.created_at)))::int,
        'createdAt', o.created_at
    ))
    INTO v_stale_opportunities
    FROM public.crm_opportunities o
    LEFT JOIN public.profiles p ON p.id = o.owner_id
    LEFT JOIN public.crm_organizations org ON org.id = o.organization_id
    WHERE o.stage NOT IN ('won', 'lost')
      AND COALESCE(o.last_activity_at, o.updated_at, o.created_at) < (v_now - INTERVAL '14 days')
    ORDER BY COALESCE(o.last_activity_at, o.updated_at, o.created_at) ASC
    LIMIT 25;

    -- 6. Unassigned Leads (active leads without owner)
    SELECT jsonb_agg(jsonb_build_object(
        'id', l.id,
        'referenceId', l.reference_id,
        'status', l.status,
        'productInterest', l.product_interest,
        'organizationName', org.name,
        'contactName', c.full_name,
        'createdAt', l.created_at
    ))
    INTO v_unassigned_leads
    FROM public.crm_leads l
    LEFT JOIN public.crm_organizations org ON org.id = l.organization_id
    LEFT JOIN public.crm_contacts c ON c.id = l.contact_id
    WHERE l.owner_id IS NULL
      AND l.status NOT IN ('converted', 'disqualified')
    ORDER BY l.created_at DESC
    LIMIT 25;

    -- 7. Unassigned Opportunities (open opportunities without owner)
    SELECT jsonb_agg(jsonb_build_object(
        'id', o.id,
        'title', o.title,
        'stage', o.stage,
        'dealValueNgn', o.deal_value_ngn,
        'primaryProduct', o.primary_product,
        'organizationName', org.name,
        'createdAt', o.created_at
    ))
    INTO v_unassigned_opportunities
    FROM public.crm_opportunities o
    LEFT JOIN public.crm_organizations org ON org.id = o.organization_id
    WHERE o.owner_id IS NULL
      AND o.stage NOT IN ('won', 'lost')
    ORDER BY o.created_at DESC
    LIMIT 25;

    -- 8. Aggregated Counts
    v_counts := jsonb_build_object(
        'overdueFollowUps', (SELECT COUNT(*) FROM public.crm_activities WHERE status = 'pending' AND due_date < v_now),
        'todayFollowUps', (SELECT COUNT(*) FROM public.crm_activities WHERE status = 'pending' AND due_date::date = v_today_date),
        'upcomingFollowUps', (SELECT COUNT(*) FROM public.crm_activities WHERE status = 'pending' AND due_date > v_now AND due_date::date <> v_today_date),
        'staleOpportunities', (SELECT COUNT(*) FROM public.crm_opportunities WHERE stage NOT IN ('won', 'lost') AND COALESCE(last_activity_at, updated_at, created_at) < (v_now - INTERVAL '14 days')),
        'unassignedLeads', (SELECT COUNT(*) FROM public.crm_leads WHERE owner_id IS NULL AND status NOT IN ('converted', 'disqualified')),
        'unassignedOpportunities', (SELECT COUNT(*) FROM public.crm_opportunities WHERE owner_id IS NULL AND stage NOT IN ('won', 'lost'))
    );

    RETURN jsonb_build_object(
        'success', true,
        'counts', v_counts,
        'overdueFollowUps', COALESCE(v_overdue_activities, '[]'::jsonb),
        'todayFollowUps', COALESCE(v_today_activities, '[]'::jsonb),
        'upcomingFollowUps', COALESCE(v_upcoming_activities, '[]'::jsonb),
        'staleOpportunities', COALESCE(v_stale_opportunities, '[]'::jsonb),
        'unassignedLeads', COALESCE(v_unassigned_leads, '[]'::jsonb),
        'unassignedOpportunities', COALESCE(v_unassigned_opportunities, '[]'::jsonb)
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_crm_follow_up_intelligence_atomic FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_crm_follow_up_intelligence_atomic FROM anon;
GRANT EXECUTE ON FUNCTION public.get_crm_follow_up_intelligence_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_crm_follow_up_intelligence_atomic TO service_role;
