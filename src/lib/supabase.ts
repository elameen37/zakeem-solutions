/**
 * Zakeem Solutions — Centralized Supabase Client
 * Phase 18: Production Supabase Integration
 *
 * Exclusively uses public anon credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).
 * NEVER includes or exposes service-role keys or secret database credentials.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Checks whether valid Supabase configuration credentials are present in the environment.
 * Rejects undefined, empty, or unconfigured placeholder strings.
 */
export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }
  const cleanUrl = supabaseUrl.trim();
  const cleanKey = supabaseAnonKey.trim();

  // Validate format and ensure placeholder strings are not treated as valid
  const isPlaceholderUrl =
    cleanUrl.includes("your-project") ||
    cleanUrl.includes("placeholder") ||
    cleanUrl === "";
  const isPlaceholderKey =
    cleanKey.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...") ||
    cleanKey.length < 20;

  return Boolean(
    cleanUrl.startsWith("https://") &&
      !isPlaceholderUrl &&
      !isPlaceholderKey
  );
}

/**
 * Single centralized Supabase client instance.
 * Returns null if Supabase credentials are missing or invalid, ensuring safe fallback.
 */
let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl!.trim(), supabaseAnonKey!.trim(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return cachedClient;
}

export const supabase = getSupabaseClient();
