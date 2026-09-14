-- ==============================================================================
-- PHASE 23B — FINAL ADMIN AUTHORIZATION LOCKDOWN
-- Migration: 20260914000000_zakeem_admin_authorization_lockdown.sql
-- Dedicated Project: Zakeem Solutions (atrevctosjcimszirdcc)
--
-- REMEDIATION:
-- 1. Completely removes automatic email domain elevation (claims->>'email' LIKE '%@zakeemsolutions.com').
-- 2. Enforces explicit administrative authorization via:
--    - app_metadata ->> 'role' = 'admin'
--    - app_metadata -> 'roles' ? 'admin'
--    - app_metadata ->> 'is_admin' = true
--    - Authoritative database verification against auth.users (raw_app_meta_data / is_super_admin)
-- 3. Preserves SECURITY DEFINER with strict search_path = public, pg_temp.
-- 4. Preserves fall-through for direct database superuser sessions (session_user = 'postgres').
-- ==============================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_claims_raw text;
  v_claims jsonb;
  v_sub uuid;
BEGIN
  v_claims_raw := current_setting('request.jwt.claims', true);
  
  -- If JWT claims are present (API call via Supabase client / PostgREST):
  IF v_claims_raw IS NOT NULL AND v_claims_raw <> '' THEN
    BEGIN
      v_claims := v_claims_raw::jsonb;

      -- 1. Check explicit 'admin' role in app_metadata claim
      IF (v_claims -> 'app_metadata' ->> 'role') = 'admin' THEN
        RETURN true;
      END IF;

      -- 2. Check explicit 'admin' in app_metadata roles array
      IF (v_claims -> 'app_metadata' -> 'roles') ? 'admin' THEN
        RETURN true;
      END IF;

      -- 3. Check explicit is_admin boolean in app_metadata
      IF COALESCE((v_claims -> 'app_metadata' ->> 'is_admin')::boolean, false) = true THEN
        RETURN true;
      END IF;

      -- 4. Check authoritative auth.users table for this user ID if sub is valid UUID
      BEGIN
        v_sub := (v_claims ->> 'sub')::uuid;
        IF v_sub IS NOT NULL THEN
          IF EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = v_sub
              AND (
                (raw_app_meta_data ->> 'role') = 'admin'
                OR (raw_app_meta_data -> 'roles') ? 'admin'
                OR COALESCE((raw_app_meta_data ->> 'is_admin')::boolean, false) = true
                OR is_super_admin = true
              )
          ) THEN
            RETURN true;
          END IF;
        END IF;
      EXCEPTION
        WHEN OTHERS THEN
          NULL;
      END;

      -- If claims exist but none of the explicit admin conditions are satisfied:
      RETURN false;
    EXCEPTION
      WHEN OTHERS THEN
        RETURN false;
    END;
  END IF;

  -- If no JWT claims exist (direct internal connection / migration):
  IF session_user = 'postgres' THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- Ensure execute privileges are granted to authenticated and postgres
REVOKE EXECUTE ON FUNCTION is_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO postgres;
