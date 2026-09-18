/**
 * Zakeem Solutions — Enterprise Cookie Consent & Privacy Preference System
 * Phase 28: Professional Cookie Consent & Privacy Experience
 *
 * Implements versioned first-party storage, category management (Essential vs Analytics),
 * event dispatching, and analytics gating.
 *
 * Storage Key: zakeem:cookie_consent:v1
 */

export const CONSENT_STORAGE_KEY = "zakeem:cookie_consent:v1";
export const CONSENT_VERSION = "v1" as const;

export const OPEN_COOKIE_PREFERENCES_EVENT = "zakeem:open-cookie-preferences";
export const COOKIE_CONSENT_UPDATED_EVENT = "zakeem:cookie-consent-updated";

export type ConsentDecision = "accepted_all" | "rejected_non_essential" | "customized";

export interface CookieConsentPreferences {
  version: typeof CONSENT_VERSION;
  timestamp: string; // ISO 8601
  essential: true; // Strictly necessary (always true)
  analytics: boolean; // Optional performance & interaction metrics
  decision: ConsentDecision;
}

// In-memory fallback for environments with disabled/restricted localStorage (private browsing)
let inMemoryConsent: CookieConsentPreferences | null = null;

/**
 * Checks whether localStorage is available and writable.
 */
function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = "__zakeem_storage_test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates whether an unknown object conforms to the expected CookieConsentPreferences schema.
 */
export function isValidConsent(data: unknown): data is CookieConsentPreferences {
  if (!data || typeof data !== "object") return false;

  const candidate = data as Record<string, unknown>;

  if (candidate.version !== CONSENT_VERSION) return false;
  if (typeof candidate.timestamp !== "string" || isNaN(Date.parse(candidate.timestamp))) return false;
  if (candidate.essential !== true) return false;
  if (typeof candidate.analytics !== "boolean") return false;
  if (!["accepted_all", "rejected_non_essential", "customized"].includes(candidate.decision as string)) {
    return false;
  }

  return true;
}

/**
 * Reads the stored consent record.
 * Returns null if consent has not been provided, is malformed, or is outdated.
 */
export function getStoredConsent(): CookieConsentPreferences | null {
  if (typeof window === "undefined") return null;

  if (!isStorageAvailable()) {
    return inMemoryConsent;
  }

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return inMemoryConsent;

    const parsed = JSON.parse(raw);
    if (isValidConsent(parsed)) {
      return parsed;
    }

    // Malformed or outdated version: clean up and return null
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    return null;
  } catch {
    // Storage read or JSON parse failure
    return inMemoryConsent;
  }
}

/**
 * Determines whether the current user has already recorded a valid consent decision.
 */
export function hasUserConsented(): boolean {
  return getStoredConsent() !== null;
}

/**
 * Determines whether optional performance & analytics tracking has been explicitly consented to.
 * Returns false if no consent exists or if analytics was rejected.
 */
export function isAnalyticsConsentGranted(): boolean {
  const consent = getStoredConsent();
  return Boolean(consent?.analytics);
}

/**
 * Saves a user consent choice to versioned storage and dispatches update events.
 */
export function saveConsent(params: {
  analytics: boolean;
  decision: ConsentDecision;
}): CookieConsentPreferences {
  const record: CookieConsentPreferences = {
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    essential: true,
    analytics: params.analytics,
    decision: params.decision,
  };

  inMemoryConsent = record;

  if (isStorageAvailable()) {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
    } catch {
      // Memory fallback remains populated
    }
  }

  // Dispatch event so UI and analytics components can respond immediately
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(
        new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, {
          bubbles: true,
          detail: record,
        })
      );
    } catch {
      // Non-blocking
    }
  }

  return record;
}

/**
 * Accepts all cookies (Essential + Analytics).
 */
export function acceptAllCookies(): CookieConsentPreferences {
  return saveConsent({
    analytics: true,
    decision: "accepted_all",
  });
}

/**
 * Rejects non-essential cookies (Essential only; Analytics disabled).
 */
export function rejectNonEssentialCookies(): CookieConsentPreferences {
  return saveConsent({
    analytics: false,
    decision: "rejected_non_essential",
  });
}

/**
 * Triggers the preferences dialog to reopen across the application.
 */
export function openCookiePreferences(): void {
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new CustomEvent(OPEN_COOKIE_PREFERENCES_EVENT));
    } catch {
      // Non-blocking
    }
  }
}

/**
 * Subscribes a callback to cookie consent changes.
 * Returns an unsubscription function.
 */
export function subscribeToConsentChanges(
  callback: (consent: CookieConsentPreferences | null) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (event: Event) => {
    const custom = event as CustomEvent<CookieConsentPreferences>;
    callback(custom.detail || getStoredConsent());
  };

  window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, handler);
  return () => {
    window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, handler);
  };
}
