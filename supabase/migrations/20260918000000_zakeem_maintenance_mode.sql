-- ==============================================================================
-- PHASE 31 — SYSTEM SETTINGS & MAINTENANCE MODE MIGRATION
-- Migration: 20260918000000_zakeem_maintenance_mode.sql
-- Dedicated Project: Zakeem Solutions (atrevctosjcimszirdcc)
--
-- OBJECTIVE:
-- 1. Create public.system_settings table for platform-level configurations.
-- 2. Establish key = 'maintenance_mode' as the canonical platform status flag.
-- 3. Enforce strict Row Level Security (RLS):
--    - Public (anon + authenticated) can SELECT only specific public settings (maintenance_mode).
--    - Administrative write access governed strictly by public.is_admin().
-- 4. Hardened SECURITY DEFINER RPCs:
--    - public.get_maintenance_mode_status()
--    - public.set_maintenance_mode_atomic(p_enabled, p_title, p_message)
-- 5. Safe, idempotent initial seed.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CANONICAL SYSTEM SETTINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to ensure idempotency
DROP POLICY IF EXISTS "Public can read maintenance_mode setting" ON public.system_settings;
DROP POLICY IF EXISTS "Admins have full access to system_settings" ON public.system_settings;

-- Public can only read the maintenance_mode setting (unrelated system settings remain protected)
CREATE POLICY "Public can read maintenance_mode setting"
ON public.system_settings
FOR SELECT
TO anon, authenticated
USING (key = 'maintenance_mode');

-- Only verified administrators can insert, update, or delete system settings
CREATE POLICY "Admins have full access to system_settings"
ON public.system_settings
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 3. INITIAL SEED (IDEMPOTENT)
-- ------------------------------------------------------------------------------
INSERT INTO public.system_settings (key, value, updated_at)
VALUES (
    'maintenance_mode',
    jsonb_build_object(
        'enabled', false,
        'title', 'Scheduled System Maintenance',
        'message', 'Zakeem Solutions is temporarily unavailable while we perform scheduled maintenance and platform improvements. We’ll be back shortly.'
    ),
    now()
)
ON CONFLICT (key) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. RPC: GET MAINTENANCE MODE STATUS
-- Publicly callable by anon and authenticated users
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_maintenance_mode_status()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_setting RECORD;
    v_updated_by_name TEXT := NULL;
BEGIN
    SELECT s.key, s.value, s.updated_at, s.updated_by
    INTO v_setting
    FROM public.system_settings s
    WHERE s.key = 'maintenance_mode';

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', true,
            'enabled', false,
            'title', 'Scheduled System Maintenance',
            'message', 'Zakeem Solutions is temporarily unavailable while we perform scheduled maintenance and platform improvements. We’ll be back shortly.',
            'updated_at', now(),
            'updated_by', null,
            'updated_by_name', null
        );
    END IF;

    -- If updated_by exists, attempt to resolve administrator full name
    IF v_setting.updated_by IS NOT NULL THEN
        SELECT full_name INTO v_updated_by_name
        FROM public.profiles
        WHERE id = v_setting.updated_by;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'enabled', COALESCE((v_setting.value ->> 'enabled')::boolean, false),
        'title', COALESCE(v_setting.value ->> 'title', 'Scheduled System Maintenance'),
        'message', COALESCE(v_setting.value ->> 'message', 'Zakeem Solutions is temporarily unavailable while we perform scheduled maintenance and platform improvements. We’ll be back shortly.'),
        'updated_at', v_setting.updated_at,
        'updated_by', v_setting.updated_by,
        'updated_by_name', v_updated_by_name
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_maintenance_mode_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_maintenance_mode_status() TO anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 5. RPC: SET MAINTENANCE MODE ATOMICALLY
-- Restricted exclusively to authorized administrators
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_maintenance_mode_atomic(
    p_enabled BOOLEAN,
    p_title TEXT DEFAULT NULL,
    p_message TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_clean_title TEXT;
    v_clean_msg TEXT;
    v_current_val JSONB;
    v_new_val JSONB;
    v_user_name TEXT := 'Administrator';
BEGIN
    -- 1. Explicit admin check
    IF NOT is_admin() THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized: Administrative access required.'
        );
    END IF;

    -- 2. Sanitize and provide defaults
    v_clean_title := COALESCE(NULLIF(trim(p_title), ''), 'Scheduled System Maintenance');
    v_clean_msg := COALESCE(
        NULLIF(trim(p_message), ''),
        'Zakeem Solutions is temporarily unavailable while we perform scheduled maintenance and platform improvements. We’ll be back shortly.'
    );

    v_new_val := jsonb_build_object(
        'enabled', p_enabled,
        'title', v_clean_title,
        'message', v_clean_msg
    );

    -- 3. Upsert system settings
    INSERT INTO public.system_settings (key, value, updated_at, updated_by)
    VALUES ('maintenance_mode', v_new_val, now(), auth.uid())
    ON CONFLICT (key) DO UPDATE
    SET value = v_new_val,
        updated_at = now(),
        updated_by = auth.uid();

    -- 4. Record audit activity if crm_activities exists
    SELECT full_name INTO v_user_name
    FROM public.profiles
    WHERE id = auth.uid();

    BEGIN
        INSERT INTO public.crm_activities (
            activity_type,
            actor_id,
            title,
            description,
            status,
            metadata
        ) VALUES (
            'note_added',
            auth.uid(),
            CASE WHEN p_enabled THEN 'Platform Maintenance Mode Enabled' ELSE 'Platform Maintenance Mode Disabled' END,
            'Administrator ' || COALESCE(v_user_name, 'Staff') || ' ' || CASE WHEN p_enabled THEN 'activated' ELSE 'deactivated' END || ' system maintenance mode.',
            'completed',
            jsonb_build_object(
                'maintenance_enabled', p_enabled,
                'title', v_clean_title,
                'actor_email', auth.jwt() ->> 'email'
            )
        );
    EXCEPTION WHEN OTHERS THEN
        -- Non-blocking: audit failure does not abort settings update
        NULL;
    END;

    RETURN jsonb_build_object(
        'success', true,
        'enabled', p_enabled,
        'title', v_clean_title,
        'message', v_clean_msg,
        'updated_at', now(),
        'updated_by_name', v_user_name
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_maintenance_mode_atomic(BOOLEAN, TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_maintenance_mode_atomic(BOOLEAN, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.set_maintenance_mode_atomic(BOOLEAN, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_maintenance_mode_atomic(BOOLEAN, TEXT, TEXT) TO service_role;
