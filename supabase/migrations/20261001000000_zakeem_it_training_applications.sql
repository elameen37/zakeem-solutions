-- =============================================================================
-- Migration: 20261001000000_zakeem_it_training_applications.sql
-- Description: Minimum appropriate persistence structure for Zakeem IT Training Applications
-- Project: Zakeem Solutions
-- Phase 71B: Zakeem IT Training Online Application Form
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.training_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_reference TEXT NOT NULL UNIQUE,
    applicant_type TEXT NOT NULL CHECK (applicant_type IN ('individual', 'organization')),
    full_name TEXT,
    email TEXT,
    organization_name TEXT,
    business_email TEXT,
    course TEXT NOT NULL,
    custom_training_request TEXT,
    preferred_start_date DATE NOT NULL,
    training_days TEXT[] NOT NULL,
    session_duration_minutes INTEGER NOT NULL DEFAULT 120,
    preferred_time TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Africa/Lagos',
    acknowledgement_accepted BOOLEAN NOT NULL DEFAULT true,
    acknowledgement_accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'confirmed', 'cancelled')),
    crm_lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Conditional check constraints
    CONSTRAINT chk_individual_fields CHECK (
        (applicant_type = 'individual' AND full_name IS NOT NULL AND email IS NOT NULL) OR
        (applicant_type = 'organization')
    ),
    CONSTRAINT chk_organization_fields CHECK (
        (applicant_type = 'organization' AND organization_name IS NOT NULL AND business_email IS NOT NULL) OR
        (applicant_type = 'individual')
    ),
    CONSTRAINT chk_training_days_count CHECK (
        array_length(training_days, 1) = 3
    )
);

-- Indexes for performance & auditing
CREATE INDEX IF NOT EXISTS idx_training_applications_ref ON public.training_applications(application_reference);
CREATE INDEX IF NOT EXISTS idx_training_applications_status ON public.training_applications(status);
CREATE INDEX IF NOT EXISTS idx_training_applications_created ON public.training_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_training_applications_lead_id ON public.training_applications(crm_lead_id);

-- Enable Row Level Security
ALTER TABLE public.training_applications ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public / anonymous insertion for online applications
CREATE POLICY "Public training application submissions"
    ON public.training_applications
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Policy 2: Allow platform administrators to view and manage all applications
CREATE POLICY "Admins can view and manage training applications"
    ON public.training_applications
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
