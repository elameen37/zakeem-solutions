-- ==============================================================================
-- PHASE 26B — CANONICAL CRM FOUNDATION MIGRATION
-- Migration: 20260917000000_zakeem_canonical_crm.sql
-- Dedicated Project: Zakeem Solutions (atrevctosjcimszirdcc)
--
-- OBJECTIVE:
-- 1. Create canonical CRM tables:
--    - public.crm_organizations
--    - public.crm_contacts
--    - public.crm_leads
--    - public.crm_opportunities
--    - public.crm_activities
-- 2. Add additive nullable relationship fields to:
--    - public.bookings (organization_id, contact_id, opportunity_id)
--    - public.client_invitations (organization_id, contact_id, booking_id, accepted_user_id)
--    - public.profiles (organization_id, phone, job_title)
-- 3. Comprehensive indexing for rapid lookup and foreign key integrity.
-- 4. Enable Row Level Security (RLS) on all CRM tables:
--    - Anon: ZERO direct access (no SELECT, INSERT, UPDATE, DELETE).
--    - Client: ZERO direct access.
--    - Admin: Full access via canonical is_admin() security definer function.
-- 5. Hardened SECURITY DEFINER RPC submit_inbound_lead(...) for public lead ingestion.
-- 6. Safe, idempotent backfill of existing bookings, invitations, and profiles.
-- 7. Seamless scheduling & invitation bridges with automatic activity logging.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CANONICAL ORGANIZATIONS TABLE (B2B ACCOUNTS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    domain TEXT,
    industry TEXT,
    company_size TEXT,
    status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'prospect', 'customer', 'churned', 'partner')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. CANONICAL CONTACTS TABLE (PEOPLE & DECISION-MAKERS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.crm_organizations(id) ON DELETE SET NULL,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    job_title TEXT,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 3. PERSISTENT INBOUND LEADS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id TEXT NOT NULL UNIQUE,
    organization_id UUID REFERENCES public.crm_organizations(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
    form_type TEXT NOT NULL CHECK (form_type IN ('contact', 'demo')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'disqualified')),
    product_interest TEXT,
    tier TEXT,
    suite TEXT,
    billing TEXT,
    deployment TEXT,
    inquiry_category TEXT,
    notes TEXT,
    attribution JSONB NOT NULL DEFAULT '{}'::jsonb,
    disqualification_reason TEXT,
    converted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 4. COMMERCIAL OPPORTUNITIES TABLE (PIPELINE)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.crm_organizations(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    primary_product TEXT NOT NULL,
    stage TEXT NOT NULL DEFAULT 'discovery' CHECK (
        stage IN ('discovery', 'demo_scheduled', 'demo_completed', 'proposal', 'negotiation', 'won', 'lost')
    ),
    deal_value_ngn NUMERIC(15, 2),
    close_date DATE,
    loss_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 5. CRM ACTIVITIES TABLE (UNIFIED TOUCHPOINT TIMELINE)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_type TEXT NOT NULL CHECK (
        activity_type IN (
            'lead_created', 'lead_status_changed',
            'demo_booked', 'demo_rescheduled', 'demo_cancelled', 'demo_completed',
            'opportunity_created', 'stage_changed',
            'invitation_sent', 'invitation_accepted', 'invitation_revoked',
            'note_added', 'email_sent'
        )
    ),
    organization_id UUID REFERENCES public.crm_organizations(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    opportunity_id UUID REFERENCES public.crm_opportunities(id) ON DELETE SET NULL,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 6. EXTEND EXISTING TABLES (ADDITIVE NULLABLE RELATIONSHIPS ONLY)
-- ------------------------------------------------------------------------------
ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.crm_organizations(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS opportunity_id UUID REFERENCES public.crm_opportunities(id) ON DELETE SET NULL;

ALTER TABLE public.client_invitations
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.crm_organizations(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS accepted_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.crm_organizations(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS job_title TEXT;

-- ------------------------------------------------------------------------------
-- 7. INDEXING STRATEGY
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_crm_organizations_slug ON public.crm_organizations(slug);
CREATE INDEX IF NOT EXISTS idx_crm_organizations_domain ON public.crm_organizations(domain);
CREATE INDEX IF NOT EXISTS idx_crm_organizations_status ON public.crm_organizations(status);
CREATE INDEX IF NOT EXISTS idx_crm_organizations_created_at ON public.crm_organizations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON public.crm_contacts(email);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_organization_id ON public.crm_contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_profile_id ON public.crm_contacts(profile_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_created_at ON public.crm_contacts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_crm_leads_reference_id ON public.crm_leads(reference_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_organization_id ON public.crm_leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_contact_id ON public.crm_leads(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON public.crm_leads(status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_product_interest ON public.crm_leads(product_interest);
CREATE INDEX IF NOT EXISTS idx_crm_leads_created_at ON public.crm_leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_crm_opportunities_organization_id ON public.crm_opportunities(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_contact_id ON public.crm_opportunities(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_lead_id ON public.crm_opportunities(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_stage ON public.crm_opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_primary_product ON public.crm_opportunities(primary_product);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_created_at ON public.crm_opportunities(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_crm_activities_organization_id ON public.crm_activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_contact_id ON public.crm_activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_lead_id ON public.crm_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_booking_id ON public.crm_activities(booking_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_opportunity_id ON public.crm_activities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_activity_type ON public.crm_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_crm_activities_created_at ON public.crm_activities(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_organization_id ON public.bookings(organization_id);
CREATE INDEX IF NOT EXISTS idx_bookings_contact_id ON public.bookings(contact_id);
CREATE INDEX IF NOT EXISTS idx_bookings_opportunity_id ON public.bookings(opportunity_id);

CREATE INDEX IF NOT EXISTS idx_client_invitations_org_id ON public.client_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_client_invitations_contact_id ON public.client_invitations(contact_id);
CREATE INDEX IF NOT EXISTS idx_client_invitations_booking_id ON public.client_invitations(booking_id);
CREATE INDEX IF NOT EXISTS idx_client_invitations_accepted_user ON public.client_invitations(accepted_user_id);

CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);

-- ------------------------------------------------------------------------------
-- 8. ROW-LEVEL SECURITY (RLS) FOR CRM ENTITIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.crm_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.crm_organizations FROM anon, PUBLIC;
REVOKE ALL ON public.crm_contacts FROM anon, PUBLIC;
REVOKE ALL ON public.crm_leads FROM anon, PUBLIC;
REVOKE ALL ON public.crm_opportunities FROM anon, PUBLIC;
REVOKE ALL ON public.crm_activities FROM anon, PUBLIC;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_contacts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_leads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_opportunities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_activities TO authenticated;

DROP POLICY IF EXISTS "Admins have full access to crm_organizations" ON public.crm_organizations;
CREATE POLICY "Admins have full access to crm_organizations"
ON public.crm_organizations FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins have full access to crm_contacts" ON public.crm_contacts;
CREATE POLICY "Admins have full access to crm_contacts"
ON public.crm_contacts FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins have full access to crm_leads" ON public.crm_leads;
CREATE POLICY "Admins have full access to crm_leads"
ON public.crm_leads FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins have full access to crm_opportunities" ON public.crm_opportunities;
CREATE POLICY "Admins have full access to crm_opportunities"
ON public.crm_opportunities FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins have full access to crm_activities" ON public.crm_activities;
CREATE POLICY "Admins have full access to crm_activities"
ON public.crm_activities FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

-- ------------------------------------------------------------------------------
-- 9. AUTOMATIC TIMESTAMP TRIGGERS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_set_crm_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crm_organizations_updated_at ON public.crm_organizations;
CREATE TRIGGER trg_crm_organizations_updated_at
BEFORE UPDATE ON public.crm_organizations
FOR EACH ROW EXECUTE FUNCTION trg_set_crm_updated_at();

DROP TRIGGER IF EXISTS trg_crm_contacts_updated_at ON public.crm_contacts;
CREATE TRIGGER trg_crm_contacts_updated_at
BEFORE UPDATE ON public.crm_contacts
FOR EACH ROW EXECUTE FUNCTION trg_set_crm_updated_at();

DROP TRIGGER IF EXISTS trg_crm_leads_updated_at ON public.crm_leads;
CREATE TRIGGER trg_crm_leads_updated_at
BEFORE UPDATE ON public.crm_leads
FOR EACH ROW EXECUTE FUNCTION trg_set_crm_updated_at();

DROP TRIGGER IF EXISTS trg_crm_opportunities_updated_at ON public.crm_opportunities;
CREATE TRIGGER trg_crm_opportunities_updated_at
BEFORE UPDATE ON public.crm_opportunities
FOR EACH ROW EXECUTE FUNCTION trg_set_crm_updated_at();

-- ------------------------------------------------------------------------------
-- 10. SECURE PUBLIC INBOUND LEAD RPC
-- Allows anonymous and authenticated visitors to submit inquiries safely.
-- Sanitizes inputs, extracts domain, deduplicates/resolves contacts and orgs,
-- and emits a crm_activities event.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_inbound_lead(
    p_reference_id TEXT,
    p_form_type TEXT,
    p_full_name TEXT,
    p_work_email TEXT,
    p_company TEXT,
    p_phone TEXT DEFAULT NULL,
    p_job_title TEXT DEFAULT NULL,
    p_product TEXT DEFAULT NULL,
    p_tier TEXT DEFAULT NULL,
    p_suite TEXT DEFAULT NULL,
    p_billing TEXT DEFAULT NULL,
    p_deployment TEXT DEFAULT NULL,
    p_inquiry_category TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_attribution JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_clean_email TEXT;
    v_clean_company TEXT;
    v_clean_name TEXT;
    v_domain TEXT;
    v_is_free_domain BOOLEAN;
    v_org_id UUID;
    v_contact_id UUID;
    v_lead_id UUID;
    v_ref_id TEXT;
    v_slug TEXT;
BEGIN
    -- 1. Input sanitization & validation
    IF p_full_name IS NULL OR length(trim(p_full_name)) < 2 OR length(trim(p_full_name)) > 200 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Full name must be between 2 and 200 characters.');
    END IF;

    IF p_work_email IS NULL OR position('@' in p_work_email) = 0 OR length(trim(p_work_email)) > 255 THEN
        RETURN jsonb_build_object('success', false, 'error', 'A valid work email address is required.');
    END IF;

    IF p_company IS NULL OR length(trim(p_company)) < 2 OR length(trim(p_company)) > 200 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Company name must be between 2 and 200 characters.');
    END IF;

    IF p_form_type NOT IN ('contact', 'demo') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid inquiry form type.');
    END IF;

    v_clean_email := lower(trim(p_work_email));
    v_clean_company := trim(p_company);
    v_clean_name := trim(p_full_name);

    -- 2. Domain extraction and free provider check
    v_domain := lower(split_part(v_clean_email, '@', 2));
    v_is_free_domain := v_domain IN (
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
        'icloud.com', 'proton.me', 'protonmail.com', 'mail.com', 'zoho.com',
        'yandex.com', 'live.com', 'msn.com'
    );

    -- 3. Resolve or create organization
    v_org_id := NULL;
    IF NOT v_is_free_domain AND v_domain <> '' THEN
        SELECT id INTO v_org_id FROM public.crm_organizations WHERE domain = v_domain LIMIT 1;
    END IF;

    IF v_org_id IS NULL THEN
        SELECT id INTO v_org_id FROM public.crm_organizations WHERE lower(name) = lower(v_clean_company) LIMIT 1;
    END IF;

    IF v_org_id IS NULL THEN
        v_slug := lower(regexp_replace(v_clean_company, '[^a-zA-Z0-9]+', '-', 'g'));
        v_slug := trim(both '-' from v_slug);
        IF length(v_slug) < 2 THEN
            v_slug := 'org-' || substr(md5(random()::text), 1, 6);
        ELSE
            v_slug := v_slug || '-' || substr(md5(random()::text), 1, 4);
        END IF;

        INSERT INTO public.crm_organizations (name, slug, domain, status)
        VALUES (
            v_clean_company,
            v_slug,
            CASE WHEN NOT v_is_free_domain THEN v_domain ELSE NULL END,
            'lead'
        )
        RETURNING id INTO v_org_id;
    END IF;

    -- 4. Resolve or create contact
    SELECT id INTO v_contact_id FROM public.crm_contacts WHERE email = v_clean_email LIMIT 1;

    IF v_contact_id IS NOT NULL THEN
        UPDATE public.crm_contacts
        SET organization_id = COALESCE(organization_id, v_org_id),
            phone = COALESCE(NULLIF(trim(p_phone), ''), phone),
            job_title = COALESCE(NULLIF(trim(p_job_title), ''), job_title),
            updated_at = now()
        WHERE id = v_contact_id;
    ELSE
        INSERT INTO public.crm_contacts (
            organization_id, email, full_name, phone, job_title, is_primary
        ) VALUES (
            v_org_id,
            v_clean_email,
            v_clean_name,
            NULLIF(trim(p_phone), ''),
            NULLIF(trim(p_job_title), ''),
            true
        )
        RETURNING id INTO v_contact_id;
    END IF;

    -- 5. Reference ID generation / preservation
    v_ref_id := COALESCE(
        NULLIF(trim(p_reference_id), ''),
        'ZK-' || to_char(timezone('Africa/Lagos', now()), 'YYYYMM') || '-' || upper(substr(md5(random()::text), 1, 4))
    );

    -- 6. Insert lead record (idempotent on reference_id)
    SELECT id INTO v_lead_id FROM public.crm_leads WHERE reference_id = v_ref_id LIMIT 1;

    IF v_lead_id IS NULL THEN
        INSERT INTO public.crm_leads (
            reference_id,
            organization_id,
            contact_id,
            form_type,
            status,
            product_interest,
            tier,
            suite,
            billing,
            deployment,
            inquiry_category,
            notes,
            attribution
        ) VALUES (
            v_ref_id,
            v_org_id,
            v_contact_id,
            p_form_type,
            'new',
            NULLIF(trim(p_product), ''),
            NULLIF(trim(p_tier), ''),
            NULLIF(trim(p_suite), ''),
            NULLIF(trim(p_billing), ''),
            NULLIF(trim(p_deployment), ''),
            NULLIF(trim(p_inquiry_category), ''),
            NULLIF(trim(p_notes), ''),
            COALESCE(p_attribution, '{}'::jsonb)
        )
        RETURNING id INTO v_lead_id;

        -- 7. Record genuine CRM activity
        INSERT INTO public.crm_activities (
            activity_type,
            organization_id,
            contact_id,
            lead_id,
            title,
            description,
            metadata
        ) VALUES (
            'lead_created',
            v_org_id,
            v_contact_id,
            v_lead_id,
            'Inbound ' || p_form_type || ' lead submitted',
            'Inquiry registered for ' || COALESCE(p_product, 'Zakeem Solutions') || ' by ' || v_clean_name,
            jsonb_build_object(
                'reference_id', v_ref_id,
                'form_type', p_form_type,
                'product', p_product,
                'tier', p_tier
            )
        );
    END IF;

    -- 8. Return safe, non-sensitive confirmation
    RETURN jsonb_build_object(
        'success', true,
        'reference_id', v_ref_id,
        'lead_id', v_lead_id,
        'organization_id', v_org_id,
        'contact_id', v_contact_id
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_inbound_lead FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_inbound_lead TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 11. SCHEDULING BRIDGE: UPDATED create_booking_atomic
-- Integrates canonical CRM linking (Organization, Contact, Lead, Opportunity)
-- while 100% preserving atomic race condition & GiST exclusion protection.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
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
    v_conflict_count INTEGER;
    v_settings RECORD;
    v_appointment_start TIMESTAMPTZ;
    v_now_wat TIMESTAMPTZ;
    v_slot_range TSRANGE;

    -- CRM linkage variables
    v_clean_email TEXT;
    v_clean_company TEXT;
    v_clean_name TEXT;
    v_domain TEXT;
    v_is_free_domain BOOLEAN;
    v_org_id UUID;
    v_contact_id UUID;
    v_crm_lead_id UUID;
    v_opportunity_id UUID;
    v_slug TEXT;
BEGIN
    -- 1. Compute current time in WAT (Africa/Lagos)
    v_now_wat := timezone('Africa/Lagos', now());
    v_appointment_start := (p_booking_date + p_start_time) AT TIME ZONE 'Africa/Lagos';
    v_slot_range := tsrange(p_booking_date + p_start_time, p_booking_date + p_end_time);

    -- 2. Obtain active schedule settings
    SELECT * INTO v_settings FROM public.schedule_settings WHERE is_active = true LIMIT 1;
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
    FROM public.bookings
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
        SELECT 1 FROM public.availability_rules
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
        SELECT 1 FROM public.availability_exceptions
        WHERE schedule_id = v_settings.id
          AND exception_date = p_booking_date
          AND exception_type = 'unavailable'
    ) INTO v_has_exception;

    IF v_has_exception THEN
        RAISE EXCEPTION 'Selected date is marked as an unavailable exception.';
    END IF;

    -- 9. Resolve CRM linkages
    v_clean_email := lower(trim(p_email));
    v_clean_company := trim(p_organization);
    v_clean_name := trim(p_full_name);
    v_domain := lower(split_part(v_clean_email, '@', 2));
    v_is_free_domain := v_domain IN (
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
        'icloud.com', 'proton.me', 'protonmail.com', 'mail.com', 'zoho.com',
        'yandex.com', 'live.com', 'msn.com'
    );

    -- A. Resolve or create organization
    v_org_id := NULL;
    IF NOT v_is_free_domain AND v_domain <> '' THEN
        SELECT id INTO v_org_id FROM public.crm_organizations WHERE domain = v_domain LIMIT 1;
    END IF;

    IF v_org_id IS NULL THEN
        SELECT id INTO v_org_id FROM public.crm_organizations WHERE lower(name) = lower(v_clean_company) LIMIT 1;
    END IF;

    IF v_org_id IS NULL THEN
        v_slug := lower(regexp_replace(v_clean_company, '[^a-zA-Z0-9]+', '-', 'g'));
        v_slug := trim(both '-' from v_slug);
        IF length(v_slug) < 2 THEN
            v_slug := 'org-' || substr(md5(random()::text), 1, 6);
        ELSE
            v_slug := v_slug || '-' || substr(md5(random()::text), 1, 4);
        END IF;

        INSERT INTO public.crm_organizations (name, slug, domain, status)
        VALUES (
            v_clean_company,
            v_slug,
            CASE WHEN NOT v_is_free_domain THEN v_domain ELSE NULL END,
            'lead'
        )
        RETURNING id INTO v_org_id;
    END IF;

    -- B. Resolve or create contact
    SELECT id INTO v_contact_id FROM public.crm_contacts WHERE email = v_clean_email LIMIT 1;

    IF v_contact_id IS NOT NULL THEN
        UPDATE public.crm_contacts
        SET organization_id = COALESCE(organization_id, v_org_id),
            phone = COALESCE(NULLIF(trim(p_phone), ''), phone),
            job_title = COALESCE(NULLIF(trim(p_job_title), ''), job_title),
            updated_at = now()
        WHERE id = v_contact_id;
    ELSE
        INSERT INTO public.crm_contacts (
            organization_id, email, full_name, phone, job_title, is_primary
        ) VALUES (
            v_org_id,
            v_clean_email,
            v_clean_name,
            NULLIF(trim(p_phone), ''),
            NULLIF(trim(p_job_title), ''),
            true
        )
        RETURNING id INTO v_contact_id;
    END IF;

    -- C. Resolve lead if reference ID provided
    v_crm_lead_id := NULL;
    IF p_lead_id IS NOT NULL AND trim(p_lead_id) <> '' THEN
        SELECT id INTO v_crm_lead_id FROM public.crm_leads WHERE reference_id = trim(p_lead_id) LIMIT 1;
        IF v_crm_lead_id IS NOT NULL THEN
            UPDATE public.crm_leads
            SET organization_id = COALESCE(organization_id, v_org_id),
                contact_id = COALESCE(contact_id, v_contact_id),
                status = CASE WHEN status = 'new' THEN 'contacted' ELSE status END,
                updated_at = now()
            WHERE id = v_crm_lead_id;
        END IF;
    END IF;

    -- D. Resolve or create opportunity
    SELECT id INTO v_opportunity_id
    FROM public.crm_opportunities
    WHERE organization_id = v_org_id
      AND primary_product = p_product
      AND stage NOT IN ('won', 'lost')
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_opportunity_id IS NULL THEN
        INSERT INTO public.crm_opportunities (
            organization_id,
            contact_id,
            lead_id,
            title,
            primary_product,
            stage,
            deal_value_ngn
        ) VALUES (
            v_org_id,
            v_contact_id,
            v_crm_lead_id,
            v_clean_company || ' — ' || p_product || ' (' || COALESCE(p_tier, 'Enterprise') || ')',
            p_product,
            'demo_scheduled',
            NULL -- Do not fabricate deal value
        )
        RETURNING id INTO v_opportunity_id;

        INSERT INTO public.crm_activities (
            activity_type,
            organization_id,
            contact_id,
            lead_id,
            opportunity_id,
            title,
            description,
            metadata
        ) VALUES (
            'opportunity_created',
            v_org_id,
            v_contact_id,
            v_crm_lead_id,
            v_opportunity_id,
            'Opportunity created: ' || p_product,
            'Commercial opportunity initiated via demo booking reservation',
            jsonb_build_object('product', p_product, 'stage', 'demo_scheduled')
        );
    ELSE
        -- Update stage to demo_scheduled if in discovery
        UPDATE public.crm_opportunities
        SET stage = CASE WHEN stage = 'discovery' THEN 'demo_scheduled' ELSE stage END,
            contact_id = COALESCE(contact_id, v_contact_id),
            lead_id = COALESCE(lead_id, v_crm_lead_id),
            updated_at = now()
        WHERE id = v_opportunity_id;
    END IF;

    -- 10. Insert confirmed booking record (protected by GiST exclusion constraint)
    BEGIN
        INSERT INTO public.bookings (
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
            notes,
            organization_id,
            contact_id,
            opportunity_id
        ) VALUES (
            p_reference_id,
            p_lead_id,
            v_clean_name,
            v_clean_email,
            v_clean_company,
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
            p_notes,
            v_org_id,
            v_contact_id,
            v_opportunity_id
        ) RETURNING id INTO v_booking_id;
    EXCEPTION
        WHEN exclusion_violation THEN
            RAISE EXCEPTION 'Selected time slot is no longer available. Please select another slot.';
        WHEN unique_violation THEN
            RAISE EXCEPTION 'A reservation with this reference ID or slot already exists.';
    END;

    -- 11. Record demo_booked activity
    INSERT INTO public.crm_activities (
        activity_type,
        organization_id,
        contact_id,
        lead_id,
        booking_id,
        opportunity_id,
        title,
        description,
        metadata
    ) VALUES (
        'demo_booked',
        v_org_id,
        v_contact_id,
        v_crm_lead_id,
        v_booking_id,
        v_opportunity_id,
        'Demo scheduled: ' || p_product,
        'Executive session scheduled for ' || p_booking_date || ' at ' || p_start_time || ' WAT',
        jsonb_build_object(
            'reference_id', p_reference_id,
            'booking_date', p_booking_date,
            'start_time', p_start_time,
            'end_time', p_end_time
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_booking_id,
        'reference_id', p_reference_id,
        'booking_date', p_booking_date,
        'start_time', p_start_time,
        'end_time', p_end_time,
        'timezone', 'Africa/Lagos',
        'organization_id', v_org_id,
        'contact_id', v_contact_id,
        'opportunity_id', v_opportunity_id
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 12. INVITATION BRIDGE: UPDATED accept_client_invitation
-- Links accepted invitation to crm_contacts.profile_id, updates organization status,
-- records invitation_accepted activity, while preserving role = 'client'.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.accept_client_invitation(
    p_token TEXT,
    p_user_id UUID,
    p_full_name TEXT DEFAULT NULL,
    p_organization TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_hash TEXT;
    v_inv RECORD;
    v_target_name TEXT;
    v_target_org TEXT;
    v_org_id UUID;
    v_contact_id UUID;
BEGIN
    -- Caller must be authenticated as p_user_id
    IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized user session context.');
    END IF;

    IF p_token IS NULL OR trim(p_token) = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Missing invitation token.');
    END IF;

    v_hash := encode(digest(trim(p_token), 'sha256'), 'hex');

    SELECT id, email, organization, full_name, status, expires_at, organization_id, contact_id, booking_id
    INTO v_inv
    FROM public.client_invitations
    WHERE token_hash = v_hash;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid invitation token.');
    END IF;

    IF v_inv.status <> 'pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invitation is no longer pending activation.');
    END IF;

    IF v_inv.expires_at < now() THEN
        UPDATE public.client_invitations SET status = 'expired' WHERE id = v_inv.id;
        RETURN jsonb_build_object('success', false, 'error', 'Invitation has expired.');
    END IF;

    v_target_name := COALESCE(NULLIF(trim(p_full_name), ''), v_inv.full_name);
    v_target_org := COALESCE(NULLIF(trim(p_organization), ''), v_inv.organization);

    -- Transition invitation status to accepted and link user
    UPDATE public.client_invitations
    SET status = 'accepted',
        accepted_at = now(),
        accepted_user_id = p_user_id
    WHERE id = v_inv.id;

    -- Provision or update public.profiles with role = 'client' (never elevated to admin)
    INSERT INTO public.profiles (
        id, full_name, organization, role, organization_id, updated_at
    ) VALUES (
        p_user_id,
        v_target_name,
        v_target_org,
        'client',
        v_inv.organization_id,
        now()
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        organization = EXCLUDED.organization,
        organization_id = COALESCE(EXCLUDED.organization_id, profiles.organization_id),
        role = 'client', -- HARD GUARANTEE: cannot elevate role
        updated_at = now();

    -- Link contact profile_id
    v_contact_id := v_inv.contact_id;
    IF v_contact_id IS NULL THEN
        SELECT id INTO v_contact_id FROM public.crm_contacts WHERE email = lower(trim(v_inv.email)) LIMIT 1;
    END IF;

    IF v_contact_id IS NOT NULL THEN
        UPDATE public.crm_contacts
        SET profile_id = p_user_id,
            updated_at = now()
        WHERE id = v_contact_id;
    END IF;

    -- Update organization status to customer if currently a lead or prospect
    v_org_id := v_inv.organization_id;
    IF v_org_id IS NOT NULL THEN
        UPDATE public.crm_organizations
        SET status = 'customer',
            updated_at = now()
        WHERE id = v_org_id AND status IN ('lead', 'prospect');
    END IF;

    -- Record invitation_accepted activity
    INSERT INTO public.crm_activities (
        activity_type,
        organization_id,
        contact_id,
        booking_id,
        actor_id,
        title,
        description,
        metadata
    ) VALUES (
        'invitation_accepted',
        v_org_id,
        v_contact_id,
        v_inv.booking_id,
        p_user_id,
        'Client invitation accepted',
        'Account activated for ' || v_inv.email || ' (' || v_target_org || ')',
        jsonb_build_object(
            'email', v_inv.email,
            'organization', v_target_org,
            'invitation_id', v_inv.id
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'email', v_inv.email,
        'organization', v_target_org,
        'full_name', v_target_name
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 13. INVITATION CREATION & REVOCATION HOOKS FOR ACTIVITY TRACKING
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_client_invitations_crm_bridge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_org_id UUID;
    v_contact_id UUID;
    v_slug TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Resolve organization if missing
        IF NEW.organization_id IS NULL THEN
            SELECT id INTO v_org_id FROM public.crm_organizations WHERE lower(name) = lower(trim(NEW.organization)) LIMIT 1;
            IF v_org_id IS NULL THEN
                v_slug := lower(regexp_replace(trim(NEW.organization), '[^a-zA-Z0-9]+', '-', 'g'));
                v_slug := trim(both '-' from v_slug) || '-' || substr(md5(random()::text), 1, 4);
                INSERT INTO public.crm_organizations (name, slug, status)
                VALUES (trim(NEW.organization), v_slug, 'prospect')
                RETURNING id INTO v_org_id;
            END IF;
            NEW.organization_id := v_org_id;
        END IF;

        -- Resolve contact if missing
        IF NEW.contact_id IS NULL THEN
            SELECT id INTO v_contact_id FROM public.crm_contacts WHERE email = lower(trim(NEW.email)) LIMIT 1;
            IF v_contact_id IS NULL THEN
                INSERT INTO public.crm_contacts (
                    organization_id, email, full_name, is_primary
                ) VALUES (
                    NEW.organization_id,
                    lower(trim(NEW.email)),
                    trim(NEW.full_name),
                    true
                )
                RETURNING id INTO v_contact_id;
            END IF;
            NEW.contact_id := v_contact_id;
        END IF;

        -- Resolve booking if lead_id matches
        IF NEW.booking_id IS NULL AND NEW.lead_id IS NOT NULL THEN
            SELECT id INTO NEW.booking_id FROM public.bookings WHERE lead_id = NEW.lead_id LIMIT 1;
        END IF;

        -- Record invitation_sent activity
        INSERT INTO public.crm_activities (
            activity_type,
            organization_id,
            contact_id,
            booking_id,
            actor_id,
            title,
            description,
            metadata
        ) VALUES (
            'invitation_sent',
            NEW.organization_id,
            NEW.contact_id,
            NEW.booking_id,
            NEW.invited_by,
            'Client invitation issued',
            'Controlled invitation link generated for ' || NEW.email,
            jsonb_build_object('expires_at', NEW.expires_at, 'lead_id', NEW.lead_id)
        );

        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'pending' AND NEW.status = 'revoked' THEN
            INSERT INTO public.crm_activities (
                activity_type,
                organization_id,
                contact_id,
                booking_id,
                actor_id,
                title,
                description,
                metadata
            ) VALUES (
                'invitation_revoked',
                NEW.organization_id,
                NEW.contact_id,
                NEW.booking_id,
                auth.uid(),
                'Client invitation revoked',
                'Invitation revoked by administrator for ' || NEW.email,
                jsonb_build_object('invitation_id', NEW.id)
            );
        END IF;
        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_client_invitations_crm_bridge ON public.client_invitations;
CREATE TRIGGER trg_client_invitations_crm_bridge
BEFORE INSERT OR UPDATE ON public.client_invitations
FOR EACH ROW EXECUTE FUNCTION trg_client_invitations_crm_bridge();

-- ------------------------------------------------------------------------------
-- 14. SAFE, IDEMPOTENT DATA BACKFILL
-- Backfills existing bookings, invitations, and profiles into canonical CRM entities.
-- Preserves existing lead references. Does not fabricate leads or deal values.
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    r_booking RECORD;
    r_inv RECORD;
    r_prof RECORD;
    v_org_id UUID;
    v_contact_id UUID;
    v_slug TEXT;
    v_domain TEXT;
    v_is_free BOOLEAN;
BEGIN
    -- 1. Backfill organizations from existing bookings
    FOR r_booking IN
        SELECT DISTINCT trim(organization) AS org_name
        FROM public.bookings
        WHERE organization IS NOT NULL AND trim(organization) <> ''
    LOOP
        SELECT id INTO v_org_id FROM public.crm_organizations WHERE lower(name) = lower(r_booking.org_name) LIMIT 1;
        IF v_org_id IS NULL THEN
            v_slug := lower(regexp_replace(r_booking.org_name, '[^a-zA-Z0-9]+', '-', 'g'));
            v_slug := trim(both '-' from v_slug);
            IF length(v_slug) < 2 THEN
                v_slug := 'org-' || substr(md5(random()::text), 1, 6);
            ELSE
                v_slug := v_slug || '-' || substr(md5(random()::text), 1, 4);
            END IF;

            INSERT INTO public.crm_organizations (name, slug, status)
            VALUES (r_booking.org_name, v_slug, 'lead')
            ON CONFLICT (slug) DO NOTHING;
        END IF;
    END LOOP;

    -- 2. Backfill organizations from existing invitations
    FOR r_inv IN
        SELECT DISTINCT trim(organization) AS org_name
        FROM public.client_invitations
        WHERE organization IS NOT NULL AND trim(organization) <> ''
    LOOP
        SELECT id INTO v_org_id FROM public.crm_organizations WHERE lower(name) = lower(r_inv.org_name) LIMIT 1;
        IF v_org_id IS NULL THEN
            v_slug := lower(regexp_replace(r_inv.org_name, '[^a-zA-Z0-9]+', '-', 'g'));
            v_slug := trim(both '-' from v_slug);
            IF length(v_slug) < 2 THEN
                v_slug := 'org-' || substr(md5(random()::text), 1, 6);
            ELSE
                v_slug := v_slug || '-' || substr(md5(random()::text), 1, 4);
            END IF;

            INSERT INTO public.crm_organizations (name, slug, status)
            VALUES (r_inv.org_name, v_slug, 'prospect')
            ON CONFLICT (slug) DO NOTHING;
        END IF;
    END LOOP;

    -- 3. Backfill contacts from existing bookings
    FOR r_booking IN
        SELECT DISTINCT ON (lower(trim(email)))
            lower(trim(email)) AS email,
            trim(full_name) AS full_name,
            trim(organization) AS org_name,
            phone,
            job_title
        FROM public.bookings
        WHERE email IS NOT NULL AND trim(email) <> ''
        ORDER BY lower(trim(email)), created_at DESC
    LOOP
        SELECT id INTO v_contact_id FROM public.crm_contacts WHERE email = r_booking.email LIMIT 1;
        IF v_contact_id IS NULL THEN
            SELECT id INTO v_org_id FROM public.crm_organizations WHERE lower(name) = lower(r_booking.org_name) LIMIT 1;
            
            -- Extract domain if not free
            v_domain := lower(split_part(r_booking.email, '@', 2));
            v_is_free := v_domain IN ('gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com');
            IF NOT v_is_free AND v_org_id IS NOT NULL THEN
                UPDATE public.crm_organizations SET domain = COALESCE(domain, v_domain) WHERE id = v_org_id;
            END IF;

            INSERT INTO public.crm_contacts (
                organization_id, email, full_name, phone, job_title, is_primary
            ) VALUES (
                v_org_id,
                r_booking.email,
                r_booking.full_name,
                r_booking.phone,
                r_booking.job_title,
                true
            )
            ON CONFLICT (email) DO NOTHING;
        END IF;
    END LOOP;

    -- 4. Backfill contacts from existing invitations
    FOR r_inv IN
        SELECT DISTINCT ON (lower(trim(email)))
            lower(trim(email)) AS email,
            trim(full_name) AS full_name,
            trim(organization) AS org_name
        FROM public.client_invitations
        WHERE email IS NOT NULL AND trim(email) <> ''
        ORDER BY lower(trim(email)), created_at DESC
    LOOP
        SELECT id INTO v_contact_id FROM public.crm_contacts WHERE email = r_inv.email LIMIT 1;
        IF v_contact_id IS NULL THEN
            SELECT id INTO v_org_id FROM public.crm_organizations WHERE lower(name) = lower(r_inv.org_name) LIMIT 1;

            INSERT INTO public.crm_contacts (
                organization_id, email, full_name, is_primary
            ) VALUES (
                v_org_id,
                r_inv.email,
                r_inv.full_name,
                true
            )
            ON CONFLICT (email) DO NOTHING;
        END IF;
    END LOOP;

    -- 5. Back-populate foreign keys in bookings
    UPDATE public.bookings b
    SET contact_id = c.id,
        organization_id = c.organization_id
    FROM public.crm_contacts c
    WHERE lower(trim(b.email)) = c.email
      AND (b.contact_id IS NULL OR b.organization_id IS NULL);

    -- 6. Back-populate foreign keys in client_invitations
    UPDATE public.client_invitations ci
    SET contact_id = c.id,
        organization_id = c.organization_id
    FROM public.crm_contacts c
    WHERE lower(trim(ci.email)) = c.email
      AND (ci.contact_id IS NULL OR ci.organization_id IS NULL);

    -- 7. Link existing profiles to contacts & organizations
    FOR r_prof IN
        SELECT id, organization
        FROM public.profiles
    LOOP
        UPDATE public.crm_contacts
        SET profile_id = r_prof.id
        WHERE profile_id IS NULL
          AND organization_id = (
              SELECT id FROM public.crm_organizations WHERE lower(name) = lower(trim(r_prof.organization)) LIMIT 1
          );

        UPDATE public.profiles
        SET organization_id = (
            SELECT id FROM public.crm_organizations WHERE lower(name) = lower(trim(r_prof.organization)) LIMIT 1
        )
        WHERE id = r_prof.id AND organization_id IS NULL;
    END LOOP;
END;
$$;
