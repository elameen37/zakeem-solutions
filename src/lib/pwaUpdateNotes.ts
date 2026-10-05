/**
 * Zakeem Solutions — PWA Versioned "What's New" Release Notes Registry
 * Hotfix: PWA Update Notice — Show What Changed
 * 
 * Design & Security Principles:
 * 1. Fully static and deterministic; bundled with the client application.
 * 2. Zero remote network fetches; zero Supabase or third-party dependencies.
 * 3. Strictly public, non-confidential release information.
 * 4. Zero credentials, admin routes, CRM records, or sensitive internals.
 * 5. Safe generic fallback if an unrecognized version is requested.
 */

export interface PWAUpdateNote {
  title: string;
  items: string[];
}

export interface PWAUpdateRelease {
  version: string;
  title?: string;
  summary?: string;
  items: string[];
}

export const GENERIC_FALLBACK_NOTE: PWAUpdateRelease = {
  version: "v1.3.0",
  title: "New Version Ready",
  summary: "An updated release of Zakeem Solutions is available.",
  items: [
    "Performance, reliability and security improvements.",
    "Enhanced offline resilience and asset loading.",
    "Refined responsive touch interactions."
  ],
};

export const PWA_RELEASE_NOTES_REGISTRY: Record<string, PWAUpdateRelease> = {
  "1.3.0": {
    version: "v1.3.0",
    title: "New Version Ready",
    summary: "An updated release of Zakeem Solutions is available.",
    items: [
      "Improved offline reliability and network recovery",
      "Safer form draft preservation during connectivity loss",
      "Smoother update installation with reload-loop protection",
      "Hardened security boundaries preventing sensitive route caching",
      "Refined mobile navigation and accessibility touch targets",
    ],
  },
  "1.2.0": {
    version: "v1.2.0",
    title: "Draft Protection Release",
    summary: "Form protection and offline action queue.",
    items: [
      "Safe offline draft recovery for public forms",
      "Memory fallback when storage is restricted",
      "Draft recovery prompts with one-click restore",
    ],
  },
  "1.1.0": {
    version: "v1.1.0",
    title: "Offline Experience Release",
    summary: "Enhanced offline caching and reconnection handling.",
    items: [
      "Segregated application shell and static asset caching",
      "Brand-aligned offline fallback page",
      "Live network reconnection detection",
    ],
  },
  "1.0.0": {
    version: "v1.0.0",
    title: "Production Foundation Release",
    summary: "Initial enterprise production release.",
    items: [
      "Enterprise software & AI automation platform",
      "Zakeem Realty ERP showcase & interactive calculator",
      "Comprehensive IT Training curriculum & admissions",
    ],
  },
};

/**
 * Normalizes version strings (e.g. "zakeem-pwa-v1.3.0", "v1.3.0", "1.3.0" -> "1.3.0")
 */
export function normalizeVersionKey(version?: string | null): string {
  if (!version) return "";
  return version
    .replace(/^zakeem-pwa-v?/i, "")
    .replace(/^v/i, "")
    .trim();
}

/**
 * Resolves release notes for a given version, falling back gracefully to the latest/generic note.
 */
export function resolvePWAUpdateNotes(version?: string | null): PWAUpdateRelease {
  if (!version) {
    return PWA_RELEASE_NOTES_REGISTRY["1.3.0"] || GENERIC_FALLBACK_NOTE;
  }

  const normalized = normalizeVersionKey(version);
  if (normalized && PWA_RELEASE_NOTES_REGISTRY[normalized]) {
    return PWA_RELEASE_NOTES_REGISTRY[normalized];
  }

  // Exact key match check
  if (PWA_RELEASE_NOTES_REGISTRY[version]) {
    return PWA_RELEASE_NOTES_REGISTRY[version];
  }

  // Safe fallback with the detected version string formatted nicely
  const displayVersion = version.startsWith("v")
    ? version
    : `v${normalized || version}`;

  return {
    version: displayVersion,
    title: "New Version Ready",
    summary: "An updated release of Zakeem Solutions is available.",
    items: [
      "Performance, reliability and security improvements.",
      "Enhanced offline resilience and asset loading.",
      "Refined responsive touch interactions."
    ],
  };
}
