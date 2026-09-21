-- ==============================================================================
-- PHASE 38A — PRODUCTION CLIENT INVITATION RPC DIGEST REMEDIATION
-- Migration: 20260921000000_zakeem_invitation_rpc_digest_remediation.sql
-- Dedicated Project: Zakeem Solutions (atrevctosjcimszirdcc)
--
-- DEFECT:
-- In Supabase Cloud, pgcrypto is installed in the extensions schema.
-- verify_client_invitation() and accept_client_invitation() were defined with
-- `SET search_path = public, pg_temp`, causing runtime error:
-- 42883: function digest(text, unknown) does not exist
--
-- REMEDIATION:
-- 1. Explicitly qualify cryptographic token hashing as extensions.digest(trim(p_token), 'sha256').
-- 2. Include extensions in the SECURITY DEFINER function search_path:
--    `SET search_path = public, extensions, pg_temp`.
-- 3. Strictly preserve all existing security properties:
--    - SECURITY DEFINER execution.
--    - Hardened search_path (public, extensions, pg_temp).
--    - Explicit caller session verification (auth.uid() = p_user_id) for accept_client_invitation.
--    - Unrestricted anonymous execution forbidden on accept_client_invitation.
--    - Safe public metadata returns only on verify_client_invitation.
--    - Profile provisioning strictly locked to role = 'client'.
--    - Canonical CRM contact, organization, and activity linking preserved.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. REMEDIATE verify_client_invitation
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.verify_client_invitation(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
    v_hash TEXT;
    v_inv RECORD;
BEGIN
    IF p_token IS NULL OR trim(p_token) = '' THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Invitation token is missing.');
    END IF;

    -- Compute SHA-256 hash of provided token via explicitly qualified extensions.digest
    v_hash := encode(extensions.digest(trim(p_token), 'sha256'), 'hex');

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

-- Enforce explicit permissions for verify_client_invitation
REVOKE EXECUTE ON FUNCTION public.verify_client_invitation(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_client_invitation(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_client_invitation(TEXT) TO authenticated;


-- ------------------------------------------------------------------------------
-- 2. REMEDIATE accept_client_invitation (WITH CANONICAL CRM BRIDGING)
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
SET search_path = public, extensions, pg_temp
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

    -- Compute SHA-256 hash of provided token via explicitly qualified extensions.digest
    v_hash := encode(extensions.digest(trim(p_token), 'sha256'), 'hex');

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

-- Enforce explicit permissions for accept_client_invitation
REVOKE EXECUTE ON FUNCTION public.accept_client_invitation(TEXT, UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.accept_client_invitation(TEXT, UUID, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.accept_client_invitation(TEXT, UUID, TEXT, TEXT) TO authenticated;
