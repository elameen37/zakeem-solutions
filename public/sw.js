/**
 * Zakeem Solutions — Production Progressive Web App Service Worker
 * Phase 81: PWA Foundation & Installability Architecture
 * 
 * Cache Categories:
 * 1. APP SHELL (pre-cached during install)
 * 2. STATIC ASSETS (cache-first for hashed bundles, fonts, icons)
 * 3. PUBLIC CONTENT (network-first with offline fallback)
 * 
 * Strict Security Exclusions (NEVER CACHED):
 * - Supabase auth, REST, edge functions, storage endpoints
 * - Private admin (/admin/*, /zakeem-admin3100) and client portal (/portal/*) routes
 * - Non-GET requests (POST, PUT, DELETE, PATCH)
 * - Requests containing credentials, tokens, or authorization headers
 */

const SW_VERSION = "zakeem-pwa-v1.0.0";
const CACHE_APP_SHELL = `${SW_VERSION}-shell`;
const CACHE_STATIC_ASSETS = `${SW_VERSION}-static`;
const CACHE_PUBLIC_PAGES = `${SW_VERSION}-pages`;

const PRECACHE_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/favicon.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/maskable-icon-512x512.png",
  "/icons/apple-touch-icon.png",
  "/offline.html"
];

// Sensitive path prefixes that MUST NEVER be cached or handled by SW
const SENSITIVE_PATH_PREFIXES = [
  "/admin",
  "/zakeem-admin3100",
  "/portal",
  "/accept-invite",
  "/accept-invitation",
  "/reset-password"
];

// Domains and endpoints that MUST NEVER be cached
function isSecurityExcluded(request, url) {
  // Non-GET requests are strictly network-only
  if (request.method !== "GET") {
    return true;
  }

  // Scheme must be http or https
  if (!url.protocol.startsWith("http")) {
    return true;
  }

  // Supabase Backend / Database / Auth / Storage
  if (
    url.hostname.includes("supabase.co") ||
    url.pathname.includes("/auth/") ||
    url.pathname.includes("/rest/") ||
    url.pathname.includes("/functions/")
  ) {
    return true;
  }

  // Authorization headers check
  if (request.headers.has("authorization") || request.headers.has("apikey")) {
    return true;
  }

  // Sensitive URL parameters
  const search = url.search.toLowerCase();
  if (
    search.includes("token=") ||
    search.includes("access_token=") ||
    search.includes("refresh_token=") ||
    search.includes("secret=") ||
    search.includes("api_key=")
  ) {
    return true;
  }

  // Sensitive client routes
  const pathname = url.pathname.toLowerCase();
  for (const prefix of SENSITIVE_PATH_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return true;
    }
  }

  return false;
}

// =============================================================================
// LIFECYCLE: INSTALL
// =============================================================================
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_APP_SHELL)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Do not force immediate activation; let active sessions complete safely
      })
      .catch((err) => {
        console.warn("[PWA SW] Precache failed:", err);
      })
  );
});

// =============================================================================
// LIFECYCLE: ACTIVATE (CACHE PURGING)
// =============================================================================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            // Delete all caches belonging to older versions of Zakeem PWA
            if (key.startsWith("zakeem-pwa-") && !key.startsWith(SW_VERSION)) {
              return caches.delete(key);
            }
            return Promise.resolve();
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// =============================================================================
// LIFECYCLE: MESSAGE (SKIP WAITING UPDATE HOOK)
// =============================================================================
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// =============================================================================
// FETCH STRATEGY
// =============================================================================
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Security Exclusions: Direct Network Pass-Through
  if (isSecurityExcluded(request, url)) {
    return; // Browser executes standard fetch
  }

  // 2. Navigation Requests: Network First with Offline Fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_PUBLIC_PAGES).then((cache) => {
              cache.put(request, copy);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // If network failed, attempt matching cached page
          const cachedPage = await caches.match(request);
          if (cachedPage) {
            return cachedPage;
          }
          // Fall back to dedicated offline shell
          const offlineFallback = await caches.match("/offline.html");
          if (offlineFallback) {
            return offlineFallback;
          }
          // Final fallback to root index.html
          return (await caches.match("/")) || Response.error();
        })
    );
    return;
  }

  // 3. Static Assets: Cache First with Background Revalidation
  const isStaticAsset =
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/favicon.") ||
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com";

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalidate in background for non-hashed resources
          if (!url.pathname.includes("-") && !url.pathname.startsWith("/assets/")) {
            fetch(request)
              .then((fresh) => {
                if (fresh && fresh.status === 200) {
                  caches.open(CACHE_STATIC_ASSETS).then((cache) => {
                    cache.put(request, fresh);
                  });
                }
              })
              .catch(() => {});
          }
          return cachedResponse;
        }

        // Cache miss: fetch from network and cache
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_STATIC_ASSETS).then((cache) => {
              cache.put(request, copy);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 4. Default: Network with Cache Fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});
