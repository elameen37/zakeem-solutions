-- =============================================================================
-- Migration: 20261001100000_zakeem_it_training_admin_fields.sql
-- Description: Operational fields for Admissions Desk (admin notes, cancellation reason, timestamps)
-- Project: Zakeem Solutions
-- Phase 72: IT Training Admissions & Administration
--
-- IMPORTANT: Do NOT push to remote database without explicit CTO authorization.
-- =============================================================================

ALTER TABLE public.training_applications
    ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
    ADD COLUMN IF NOT EXISTS admin_notes TEXT,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_training_applications_course ON public.training_applications(course);
CREATE INDEX IF NOT EXISTS idx_training_applications_app_type ON public.training_applications(applicant_type);
