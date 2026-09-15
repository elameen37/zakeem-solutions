-- ==============================================================================
-- PHASE 24B — CLIENT ACCOUNT PROVISIONING & INVITATIONS
-- Migration: 20260916000000_zakeem_client_invitations.sql
-- Dedicated Project: Zakeem Solutions (atrevctosjcimszirdcc)
--
-- OBJECTIVE:
-- 1. Create public.client_invitations table to manage controlled B2B client onboarding.
-- 2. Enforce strict Row-Level Security (RLS):
--    - Direct access restricted strictly to verified administrators (via is_admin()).
--    - Anonymous visitors have ZERO direct table access.
-- 3. Expose hardened SECURITY DEFINER RPCs for invitation verification and acceptance:
--    - verify_client_invitation: validates token hash without exposing admin/system metadata.
--    - accept_client_invitation: transitions invitation status to accepted and provisions
--      public.profiles with role = 'client' upon user registration.
-- 4. Establish clean relationship between Phase 15/16 lead records and client identity.
-- ==============================================================================

-- Enable pgcrypto for cryptographic hashing if not already active
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. CREATE CLIENT INVITATIONS TABLE
CREATE TABLE IF NOT EXISTS public.client_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    organization TEXT NOT NULL,
    full_name TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    lead_id TEXT, -- Clean linkage to Phase 15/16 lead reference ID (e.g., ZK-202609-XXXX)
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    accepted_at TIMESTAMPTZ
);

-- Indices for rapid lookups
CREATE INDEX IF NOT EXISTS idx_client_invitations_token_hash ON public.client_invitations(token_hash);
CREATE INDEX IF NOT EXISTS idx_client_invitations_email ON public.client_invitations(email);
CREATE INDEX IF NOT EXISTS idx_client_invitations_status ON public.client_invitations(status);
CREATE INDEX IF NOT EXISTS idx_client_invitations_lead_id ON public.client_invitations(lead_id);

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.client_invitations ENABLE ROW LEVEL SECURITY;

-- 3. REVOKE DEFAULT UNRESTRICTED ACCESS
REVOKE ALL ON public.client_invitations FROM anon;
REVOKE ALL ON public.client_invitations FROM PUBLIC;
REVOKE ALL ON public.client_invitations FROM authenticated;

-- Grant table access to authenticated role governed strictly by RLS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_invitations TO authenticated;

-- 4. RLS POLICIES FOR INVITATIONS (STRICT ADMIN ACCESS ONLY)
DROP POLICY IF EXISTS "Admin staff manage client invitations" ON public.client_invitations;
CREATE POLICY "Admin staff manage client invitations"
ON public.client_invitations FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- 5. PUBLIC RPC: VERIFY CLIENT INVITATION TOKEN
-- Securely verifies token and returns safe public metadata without exposing admin metadata
CREATE OR REPLACE FUNCTION public.verify_client_invitation(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_hash TEXT;
    v_inv RECORD;
BEGIN
    IF p_token IS NULL OR trim(p_token) = '' THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Invitation token is missing.');
    END IF;

    -- Compute SHA-256 hash of provided token
    v_hash := encode(digest(trim(p_token), 'sha256'), 'hex');

    SELECT id, email, organization, full_name, status, expires_at, lead_id
    INTO v_inv
    FROM public.client_invitations
    WHERE token_hash = v_hash;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Invalid or unrecognised invitation token.');
    END IF;

    IF v_inv.status = 'revoked' THEN
        RETURN jsonb_build_object('valid', false, 'error', 'This invitation has been revoked by an administrator.');
    END IF;

    IF v_inv.status = 'accepted' THEN
        RETURN jsonb_build_object('valid', false, 'error', 'This invitation has already been accepted. Please sign in to your client portal.');
    END IF;

    IF v_inv.expires_at < now() OR v_inv.status = 'expired' THEN
        -- Mark as expired if not already
        UPDATE public.client_invitations
        SET status = 'expired'
        WHERE id = v_inv.id AND status = 'pending';

        RETURN jsonb_build_object('valid', false, 'error', 'This invitation has expired. Please request a new invitation.');
    END IF;

    -- Return safe metadata only
    RETURN jsonb_build_object(
        'valid', true,
        'email', v_inv.email,
        'organization', v_inv.organization,
        'full_name', v_inv.full_name,
        'lead_id', v_inv.lead_id
    );
END;
$$;

-- Revoke execute from public, grant to anon and authenticated
REVOKE EXECUTE ON FUNCTION public.verify_client_invitation(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_client_invitation(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_client_invitation(TEXT) TO authenticated;

-- 6. RPC: ACCEPT CLIENT INVITATION AND PROVISION PROFILE
-- Transitions invitation to 'accepted' and provisions user profile with role = 'client'
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
BEGIN
    -- Caller must be authenticated as p_user_id
    IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized user session context.');
    END IF;

    IF p_token IS NULL OR trim(p_token) = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Missing invitation token.');
    END IF;

    v_hash := encode(digest(trim(p_token), 'sha256'), 'hex');

    SELECT id, email, organization, full_name, status, expires_at
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

    -- Transition invitation status to accepted
    UPDATE public.client_invitations
    SET status = 'accepted',
        accepted_at = now()
    WHERE id = v_inv.id;

    -- Provision or update public.profiles with role = 'client' (never elevated to admin)
    INSERT INTO public.profiles (id, full_name, organization, role, updated_at)
    VALUES (p_user_id, v_target_name, v_target_org, 'client', now())
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        organization = EXCLUDED.organization,
        role = 'client', -- HARD GUARANTEE: cannot elevate role
        updated_at = now();

    RETURN jsonb_build_object(
        'success', true,
        'email', v_inv.email,
        'organization', v_target_org,
        'full_name', v_target_name
    );
END;
$$;

-- Grant execute to authenticated users
REVOKE EXECUTE ON FUNCTION public.accept_client_invitation(TEXT, UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.accept_client_invitation(TEXT, UUID, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.accept_client_invitation(TEXT, UUID, TEXT, TEXT) TO authenticated;

-- 7. ADMIN RPC: REVOKE INVITATION
CREATE OR REPLACE FUNCTION public.admin_revoke_client_invitation(p_invitation_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT is_admin() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Administrative access required.');
    END IF;

    UPDATE public.client_invitations
    SET status = 'revoked'
    WHERE id = p_invitation_id AND status = 'pending';

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Pending invitation not found or already processed.');
    END IF;

    RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_revoke_client_invitation(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_revoke_client_invitation(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_revoke_client_invitation(UUID) TO authenticated;
