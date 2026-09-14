-- ==============================================================================
-- PHASE 24A — CLIENT IDENTITY & PROFILES FOUNDATION
-- Migration: 20260915000000_zakeem_client_identity_profiles.sql
-- Dedicated Project: Zakeem Solutions (atrevctosjcimszirdcc)
--
-- OBJECTIVE:
-- 1. Create public.profiles table linked to auth.users.
-- 2. Enforce strict Row-Level Security (RLS):
--    - Authenticated users can view their own profile only.
--    - Authenticated users can update permitted fields on their own profile without self-elevation.
--    - Administrators (verified via Phase 23B is_admin()) retain full administrative access.
--    - Anonymous / public users have zero access.
-- ==============================================================================

-- 1. CREATE PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    organization TEXT,
    role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast user identification
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. ENABLE ROW-LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. REVOKE DEFAULT UNRESTRICTED ACCESS
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM PUBLIC;
REVOKE ALL ON public.profiles FROM authenticated;

-- Grant selective table access to authenticated role (governed strictly by RLS)
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- 4. RLS POLICIES FOR USERS AND ADMINS

-- A. Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- B. Users can update their own profile (cannot modify role)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id AND 
    role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
);

-- C. Administrators (via hardened is_admin()) can view all profiles
DROP POLICY IF EXISTS "Admin staff view access to profiles" ON public.profiles;
CREATE POLICY "Admin staff view access to profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (is_admin());

-- D. Administrators can update or insert profiles
DROP POLICY IF EXISTS "Admin staff manage access to profiles" ON public.profiles;
CREATE POLICY "Admin staff manage access to profiles"
ON public.profiles FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- 5. AUTOMATIC TIMESTAMP TRIGGER
CREATE OR REPLACE FUNCTION trg_set_profiles_updated_at()
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

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION trg_set_profiles_updated_at();
