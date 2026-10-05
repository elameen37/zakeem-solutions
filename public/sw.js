/**
 * Zakeem Solutions — Production Progressive Web App Service Worker
 * Phase 81.1: PWA Offline Experience & Resilience Architecture
 * 
 * Cache Categories:
 * 1. APP SHELL (pre-cached during install, prioritized public routes)
 * 2. STATIC ASSETS (cache-first for hashed bundles, fonts, icons)
 * 3. PUBLIC CONTENT (network-first with offline fallback & cache bounding)
 * 
 * Strict Security Exclusions (NEVER CACHED):
 * - Supabase auth, REST, edge functions, storage endpoints
 * - Private admin (/admin/*, /zakeem-admin3100), client portal (/portal/*, /client-portal), login & reset-password routes
 * - Non-GET requests (POST, PUT, DELETE, PATCH)
 * - Requests containing credentials, tokens, or authorization headers
 * - Sensitive query parameters (tokens, keys, secrets)
 */

const SW_VERSION = "zakeem-pwa-v1.3.0";
const CACHE_APP_SHELL = `${SW_VERSION}-shell`;
const CACHE_STATIC_ASSETS = `${SW_VERSION}-static`;
const CACHE_PUBLIC_PAGES = `${SW_VERSION}-pages`;

const MAX_PAGES_ENTRIES = 35;
const MAX_STATIC_ENTRIES = 100;

// Prioritized public routes and core assets pre-cached for offline resilience
const PRECACHE_ASSETS = [
  "/",
  "/services",
  "/it-training",
  "/training",
  "/training/status",
  "/request-demo",
  "/contact",
  "/manifest.webmanifest",
  "/manifest.json",
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
  "/client-portal",
  "/accept-invite",
  "/accept-invitation",
  "/reset-password",
  "/login"
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

  // Supabase Backend / Database / Auth / Storage / Functions / RPC / API endpoints
  if (
    url.hostname.includes("supabase.co") ||
    url.pathname.includes("/auth/") ||
    url.pathname.includes("/rest/") ||
    url.pathname.includes("/functions/") ||
    url.pathname.includes("/storage/") ||
    url.pathname.includes("/rpc/") ||
    url.pathname.startsWith("/api/")
  ) {
    return true;
  }

  // Authorization and authentication headers check
  if (
    request.headers.has("authorization") ||
    request.headers.has("apikey") ||
    request.headers.has("x-api-key") ||
    request.headers.has("x-supabase-auth")
  ) {
    return true;
  }

  // Sensitive URL parameters that must NEVER enter Cache Storage
  const search = url.search.toLowerCase();
  if (
    search.includes("token=") ||
    search.includes("access_token=") ||
    search.includes("refresh_token=") ||
    search.includes("secret=") ||
    search.includes("api_key=") ||
    search.includes("apikey=") ||
    search.includes("password=") ||
    search.includes("pwd=") ||
    search.includes("authorization=") ||
    search.includes("session=") ||
    search.includes("session_token=") ||
    search.includes("code=") ||
    search.includes("state=") ||
    search.includes("email=") ||
    search.includes("ref=")
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

// Bounded cache maintenance to prevent uncontrolled storage growth
async function limitCacheSize(cacheName, maxEntries) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxEntries) {
      const toDelete = keys.slice(0, keys.length - maxEntries);
      await Promise.all(toDelete.map((k) => cache.delete(k)));
    }
  } catch (e) {
    // Non-blocking catch
  }
}

// =============================================================================
// LIFECYCLE: INSTALL
// =============================================================================
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_APP_SHELL)
      .then(async (cache) => {
        // Resilient precaching: individual failures do not block SW installation
        await Promise.all(
          PRECACHE_ASSETS.map(async (asset) => {
            try {
              await cache.add(asset);
            } catch (err) {
              console.warn(`[PWA SW] Precache skipped for ${asset}:`, err);
            }
          })
        );
      })
      .then(() => {
        // Do not force immediate activation; let active sessions complete safely
      })
      .catch((err) => {
        console.warn("[PWA SW] Precache error:", err);
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
// LIFECYCLE: MESSAGE (SKIP WAITING UPDATE HOOK & VERSION QUERY)
// =============================================================================
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data && event.data.type === "GET_VERSION") {
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ version: SW_VERSION });
    }
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

  const isSameOrigin = url.origin === self.location.origin;
  const isApprovedThirdParty =
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com";

  // 2. Navigation Requests: Network First with Cached Page -> App Shell -> Offline Fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Strictly only cache successful same-origin navigation responses
          if (isSameOrigin && networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_PUBLIC_PAGES).then((cache) => {
              cache.put(request, copy);
              limitCacheSize(CACHE_PUBLIC_PAGES, MAX_PAGES_ENTRIES);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // 1. Attempt exact cached page URL
          const cachedPage = await caches.match(request);
          if (cachedPage) {
            return cachedPage;
          }

          // 2. SPA Architecture: App Shell index.html renders client-side route
          const appShell = await caches.match("/");
          if (appShell) {
            return appShell;
          }

          // 3. Fall back to dedicated offline shell
          const offlineFallback = await caches.match("/offline.html");
          if (offlineFallback) {
            return offlineFallback;
          }

          return Response.error();
        })
    );
    return;
  }

  // 3. Static Assets: Cache First with Background Revalidation
  const isStaticAsset =
    (isSameOrigin &&
      (url.pathname.startsWith("/assets/") ||
       url.pathname.startsWith("/icons/") ||
       url.pathname.startsWith("/favicon."))) ||
    isApprovedThirdParty;

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
                    limitCacheSize(CACHE_STATIC_ASSETS, MAX_STATIC_ENTRIES);
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
              limitCacheSize(CACHE_STATIC_ASSETS, MAX_STATIC_ENTRIES);
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
