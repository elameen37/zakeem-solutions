import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import {
  MaintenanceConfig,
  DEFAULT_MAINTENANCE_TITLE,
  DEFAULT_MAINTENANCE_MESSAGE,
  DEFAULT_MAINTENANCE_SECONDARY,
} from "@/types/maintenance";

const CACHE_TTL_MS = 30_000; // 30-second in-memory cache
let cachedConfig: MaintenanceConfig | null = null;
let lastFetchedAt = 0;

export const MAINTENANCE_EVENT_NAME = "zakeem:maintenance-status-changed";

export function getDefaultMaintenanceConfig(): MaintenanceConfig {
  return {
    enabled: false,
    title: DEFAULT_MAINTENANCE_TITLE,
    message: DEFAULT_MAINTENANCE_MESSAGE,
    secondaryMessage: DEFAULT_MAINTENANCE_SECONDARY,
    updatedAt: undefined,
    updatedBy: null,
    updatedByName: null,
  };
}

/**
 * Fetches the authoritative maintenance mode status from Supabase.
 * Uses a lightweight in-memory cache to prevent excessive requests on route navigation.
 */
export async function getMaintenanceStatus(forceRefresh = false): Promise<MaintenanceConfig> {
  const now = Date.now();
  if (!forceRefresh && cachedConfig && now - lastFetchedAt < CACHE_TTL_MS) {
    return cachedConfig;
  }

  if (!isSupabaseConfigured()) {
    const fallback = getDefaultMaintenanceConfig();
    cachedConfig = fallback;
    lastFetchedAt = now;
    return fallback;
  }

  const client = getSupabaseClient();
  if (!client) {
    return getDefaultMaintenanceConfig();
  }

  try {
    // 1. Try atomic RPC if deployed
    const { data: rpcData, error: rpcError } = await client.rpc("get_maintenance_mode_status");

    if (!rpcError && rpcData && typeof rpcData.enabled === "boolean") {
      const config: MaintenanceConfig = {
        enabled: rpcData.enabled,
        title: rpcData.title || DEFAULT_MAINTENANCE_TITLE,
        message: rpcData.message || DEFAULT_MAINTENANCE_MESSAGE,
        secondaryMessage: DEFAULT_MAINTENANCE_SECONDARY,
        updatedAt: rpcData.updated_at || undefined,
        updatedBy: rpcData.updated_by || null,
        updatedByName: rpcData.updated_by_name || null,
      };

      cachedConfig = config;
      lastFetchedAt = now;
      return config;
    }

    // 2. Direct table fallback if RPC is not yet registered
    const { data, error } = await client
      .from("system_settings")
      .select("key, value, updated_at, updated_by")
      .eq("key", "maintenance_mode")
      .maybeSingle();

    if (!error && data && data.value) {
      const val = data.value as Record<string, unknown>;
      let adminName: string | null = null;

      if (data.updated_by) {
        try {
          const { data: prof } = await client
            .from("profiles")
            .select("full_name")
            .eq("id", data.updated_by)
            .maybeSingle();
          if (prof?.full_name) {
            adminName = prof.full_name;
          }
        } catch {
          // Non-blocking
        }
      }

      const config: MaintenanceConfig = {
        enabled: Boolean(val.enabled),
        title: typeof val.title === "string" ? val.title : DEFAULT_MAINTENANCE_TITLE,
        message: typeof val.message === "string" ? val.message : DEFAULT_MAINTENANCE_MESSAGE,
        secondaryMessage: DEFAULT_MAINTENANCE_SECONDARY,
        updatedAt: data.updated_at,
        updatedBy: data.updated_by || null,
        updatedByName: adminName,
      };

      cachedConfig = config;
      lastFetchedAt = now;
      return config;
    }
  } catch {
    // Graceful fallback: on network failure, return last known or default
  }

  const fallback = cachedConfig || getDefaultMaintenanceConfig();
  cachedConfig = fallback;
  lastFetchedAt = now;
  return fallback;
}

/**
 * Updates the maintenance mode status in Supabase.
 * Requires authenticated administrative credentials.
 */
export async function setMaintenanceStatus(
  enabled: boolean,
  title?: string,
  message?: string
): Promise<{ success: boolean; config?: MaintenanceConfig; error?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase client is not configured. Maintenance mode requires a live database.",
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: "Database client is unavailable." };
  }

  const cleanTitle = title?.trim() || DEFAULT_MAINTENANCE_TITLE;
  const cleanMsg = message?.trim() || DEFAULT_MAINTENANCE_MESSAGE;

  try {
    // 1. Try atomic RPC
    const { data: rpcData, error: rpcError } = await client.rpc("set_maintenance_mode_atomic", {
      p_enabled: enabled,
      p_title: cleanTitle,
      p_message: cleanMsg,
    });

    if (!rpcError && rpcData) {
      if (rpcData.success === false) {
        return { success: false, error: rpcData.error || "Administrative authorization failed." };
      }

      const updatedConfig: MaintenanceConfig = {
        enabled: rpcData.enabled ?? enabled,
        title: rpcData.title || cleanTitle,
        message: rpcData.message || cleanMsg,
        secondaryMessage: DEFAULT_MAINTENANCE_SECONDARY,
        updatedAt: rpcData.updated_at || new Date().toISOString(),
        updatedBy: rpcData.updated_by || null,
        updatedByName: rpcData.updated_by_name || null,
      };

      cachedConfig = updatedConfig;
      lastFetchedAt = Date.now();

      // Dispatch global window event
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(MAINTENANCE_EVENT_NAME, { detail: updatedConfig })
        );
      }

      return { success: true, config: updatedConfig };
    }

    // 2. Fallback direct table upsert for admins
    const { data: userData } = await client.auth.getUser();
    const userId = userData?.user?.id || null;

    const payload = {
      key: "maintenance_mode",
      value: {
        enabled,
        title: cleanTitle,
        message: cleanMsg,
      },
      updated_at: new Date().toISOString(),
      updated_by: userId,
    };

    const { error: upsertErr } = await client
      .from("system_settings")
      .upsert(payload, { onConflict: "key" });

    if (upsertErr) {
      return { success: false, error: upsertErr.message };
    }

    let adminName: string | null = null;
    if (userId) {
      const { data: prof } = await client
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .maybeSingle();
      if (prof?.full_name) adminName = prof.full_name;
    }

    const updatedConfig: MaintenanceConfig = {
      enabled,
      title: cleanTitle,
      message: cleanMsg,
      secondaryMessage: DEFAULT_MAINTENANCE_SECONDARY,
      updatedAt: payload.updated_at,
      updatedBy: userId,
      updatedByName: adminName,
    };

    cachedConfig = updatedConfig;
    lastFetchedAt = Date.now();

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(MAINTENANCE_EVENT_NAME, { detail: updatedConfig })
      );
    }

    return { success: true, config: updatedConfig };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update maintenance mode.";
    return { success: false, error: msg };
  }
}

/**
 * Subscribes to maintenance state changes across tabs and live updates.
 */
export function subscribeToMaintenanceChanges(
  callback: (config: MaintenanceConfig) => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleCustomEvent = (event: Event) => {
    const custom = event as CustomEvent<MaintenanceConfig>;
    if (custom.detail) {
      callback(custom.detail);
    }
  };

  window.addEventListener(MAINTENANCE_EVENT_NAME, handleCustomEvent);

  // Revalidate on window focus/visibility change
  const handleVisibility = () => {
    if (document.visibilityState === "visible") {
      getMaintenanceStatus(true).then((cfg) => {
        callback(cfg);
      });
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    window.removeEventListener(MAINTENANCE_EVENT_NAME, handleCustomEvent);
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}
