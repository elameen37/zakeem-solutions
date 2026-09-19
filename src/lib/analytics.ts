/**
 * Zakeem Solutions — Centralized Google Analytics 4 (GA4) Module
 * Measurement ID: G-9Q4QD0CBCB
 *
 * Provides:
 * - Asynchronous, idempotent GA4 tag initialization
 * - Google Consent Mode v2 integrated with existing cookie consent system
 * - SPA-aware route and page-view tracking
 * - Privacy-first parameter sanitization (strict PII rejection)
 * - Structured high-value business conversion events
 */

import { isAnalyticsConsentGranted, subscribeToConsentChanges } from "./cookieConsent";

// Augment the window interface with dataLayer and gtag
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    __ga4_initialized?: boolean;
  }
}

/**
 * Active GA4 Measurement ID.
 * Defaults to the production measurement ID G-9Q4QD0CBCB if environment variable is unset.
 */
export const GA_MEASUREMENT_ID: string = (
  import.meta.env.VITE_GA_MEASUREMENT_ID || "G-9Q4QD0CBCB"
).trim();

const GA_SCRIPT_ID = "ga4-gtag-script";

// Sensitive parameter patterns that MUST NEVER be sent to Google Analytics (PII protection)
const SENSITIVE_KEY_REGEX =
  /email|phone|password|token|secret|key|bvn|nin|ssn|card|cvv|account_num|first_name|last_name|full_name|customer_name|client_name/i;

/**
 * Sanitizes event parameters to eliminate any personally identifiable information (PII)
 * or sensitive credentials before transmitting to GA4.
 */
export function sanitizeEventParams(
  params?: Record<string, unknown>
): Record<string, unknown> {
  if (!params || typeof params !== "object") return {};

  const clean: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    // 1. Omit any keys matching sensitive PII patterns
    if (SENSITIVE_KEY_REGEX.test(key)) {
      continue;
    }

    // 2. Reject values that resemble email addresses
    if (typeof value === "string" && value.includes("@") && value.includes(".")) {
      continue;
    }

    // 3. Reject values that resemble raw phone numbers (e.g. +234..., 080...)
    if (
      typeof value === "string" &&
      /^\+?[0-9\s-]{7,18}$/.test(value.trim())
    ) {
      continue;
    }

    // 4. Accept primitive clean attributes
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      clean[key] = value;
    }
  }

  return clean;
}

/**
 * Determines whether GA4 script is currently initialized in the browser.
 */
export function isGAInitialized(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean(window.__ga4_initialized && window.gtag)
  );
}

/**
 * Initializes Google Analytics 4 tag and Google Consent Mode v2.
 * Idempotent: Can be safely called multiple times; executes only once.
 */
export function initGA(): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  if (window.__ga4_initialized || document.getElementById(GA_SCRIPT_ID)) {
    return;
  }

  // 1. Prepare dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };

  // 2. Configure Google Consent Mode v2 (Default state based on stored user choice)
  const consentGranted = isAnalyticsConsentGranted();
  window.gtag("consent", "default", {
    analytics_storage: consentGranted ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  });

  // 3. Establish timestamp
  window.gtag("js", new Date());

  // 4. Configure Measurement ID with manual SPA page_view handling
  window.gtag("config", GA_MEASUREMENT_ID, {
    send_page_view: false, // SPA router manages page views explicitly to prevent duplicates
    cookie_flags: "SameSite=None;Secure",
  });

  // 5. Inject script asynchronously into document head
  const script = document.createElement("script");
  script.id = GA_SCRIPT_ID;
  script.type = "text/javascript";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;

  document.head.appendChild(script);
  window.__ga4_initialized = true;

  // 6. Listen for dynamic cookie consent updates across the session
  subscribeToConsentChanges((consent) => {
    const granted = Boolean(consent?.analytics);
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: granted ? "granted" : "denied",
      });
    }
  });
}

/**
 * Sends a page_view event to GA4 for client-side SPA navigation.
 */
export function trackPageView(path: string, title?: string): void {
  if (typeof window === "undefined") return;

  if (!isGAInitialized()) {
    initGA();
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: title || document.title,
    });
  }
}

/**
 * Sends a custom GA4 event with automatic PII sanitization.
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;

  if (!isGAInitialized()) {
    initGA();
  }

  if (typeof window.gtag === "function") {
    const sanitized = sanitizeEventParams(params);
    window.gtag("event", eventName, sanitized);
  }
}

/* ==============================================================================
 * HIGH-VALUE BUSINESS CONVERSION & KEY EVENTS
 * ============================================================================== */

/**
 * Tracks a confirmed enterprise contact form submission.
 * Trigger ONLY after backend/API confirms success.
 */
export function trackContactFormSubmit(params?: {
  category?: string;
  contextSummary?: string | null;
  [key: string]: unknown;
}): void {
  trackEvent("contact_form_submit", {
    form_type: "contact",
    inquiry_category: params?.category || "general-inquiry",
    context_summary: params?.contextSummary || undefined,
    ...params,
  });
}

/**
 * Tracks a confirmed technical demonstration or architecture booking request.
 * Trigger ONLY after scheduling service confirms reservation.
 */
export function trackDemoRequest(params?: {
  product?: string;
  deployment?: string;
  bookingDate?: string;
  [key: string]: unknown;
}): void {
  trackEvent("demo_request", {
    form_type: "demo",
    product: params?.product || "zakeem-realty-erp",
    deployment: params?.deployment || "cloud",
    booking_date: params?.bookingDate,
    ...params,
  });
}

/**
 * Tracks a general commercial lead capture event.
 * Trigger ONLY after backend confirms persistence.
 */
export function trackLeadFormSubmit(params?: {
  formType?: string;
  product?: string;
  tier?: string;
  suite?: string;
  billing?: string;
  deployment?: string;
  service?: string;
  [key: string]: unknown;
}): void {
  trackEvent("lead_form_submit", {
    form_type: params?.formType || "general",
    product: params?.product,
    tier: params?.tier,
    suite: params?.suite,
    billing: params?.billing,
    deployment: params?.deployment,
    service: params?.service,
  });
}

/**
 * Tracks an outbound click on a telephone link (tel:).
 */
export function trackPhoneClick(label?: string): void {
  trackEvent("phone_click", {
    link_label: label || "Corporate Line",
    channel: "telephone",
  });
}

/**
 * Tracks an outbound click on an email link (mailto:).
 */
export function trackEmailClick(recipientType?: string): void {
  trackEvent("email_click", {
    recipient_type: recipientType || "corporate",
    channel: "email",
  });
}

/**
 * Tracks an outbound click on a WhatsApp direct link.
 */
export function trackWhatsAppClick(label?: string): void {
  trackEvent("whatsapp_click", {
    link_label: label || "WhatsApp Channel",
    channel: "whatsapp",
  });
}

/**
 * Tracks a product exploration view.
 */
export function trackProductView(product: {
  id: string;
  name: string;
  slug: string;
  category?: string;
  status?: string;
}): void {
  trackEvent("product_view", {
    product_id: product.id,
    product_name: product.name,
    product_slug: product.slug,
    product_category: product.category,
    product_status: product.status,
  });
}

/**
 * Tracks a service / engineering practice detail view.
 */
export function trackServiceView(service: {
  slug: string;
  title: string;
  category?: string;
}): void {
  trackEvent("service_view", {
    service_slug: service.slug,
    service_name: service.title,
    service_category: service.category,
  });
}

/**
 * Tracks a major call-to-action button click.
 */
export function trackCTAClick(ctaName: string, location?: string): void {
  trackEvent("cta_click", {
    cta_name: ctaName,
    page_location:
      location ||
      (typeof window !== "undefined" ? window.location.pathname : undefined),
  });
}
