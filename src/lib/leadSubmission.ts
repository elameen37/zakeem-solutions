/**
 * Zakeem Solutions — Lead Submission & CRM Infrastructure
 * Phase 15: Lead Capture, CRM Readiness & Conversion Infrastructure
 */

import {
  CRMLeadRecord,
  LeadSubmissionPayload,
  SubmissionResult,
} from "@/types/lead";

let lastSubmissionTimestamp = 0;
const SUBMISSION_COOLDOWN_MS = 5000;

/**
 * Generates an enterprise reference identifier for customer tracking.
 * Format: ZK-YYYYMM-XXXX (e.g., ZK-202609-A4F1)
 */
export function generateLeadReferenceId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const randomSegment = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ZK-${year}${month}-${randomSegment}`;
}

/**
 * Maps frontend lead submission payload into an enterprise CRM record
 * compatible with HubSpot, Salesforce, and Supabase CRM schemas.
 */
export function mapToCRMRecord(payload: LeadSubmissionPayload): CRMLeadRecord {
  const names = payload.identity.fullName.trim().split(/\s+/);
  const firstName = names[0] || "";
  const lastName = names.slice(1).join(" ") || "";

  return {
    email: payload.identity.workEmail.trim().toLowerCase(),
    first_name: firstName,
    last_name: lastName,
    company_name: payload.identity.company.trim(),
    phone_number: payload.identity.phone?.trim() || undefined,
    job_title: payload.identity.jobTitle?.trim() || undefined,

    // Commercial intent properties
    zakeem_form_type: payload.commercial.formType,
    zakeem_product_interest: payload.commercial.product,
    zakeem_pricing_tier: payload.commercial.tier,
    zakeem_suite_bundle: payload.commercial.suite,
    zakeem_billing_commitment: payload.commercial.billing,
    zakeem_deployment_model: payload.commercial.deployment,
    zakeem_service_engagement: payload.commercial.service,
    zakeem_inquiry_category: payload.commercial.inquiryCategory,
    zakeem_stack_modules: payload.commercial.selectedModules?.join(", "),

    // Attribution properties
    hs_analytics_source: payload.attribution.utmSource ? "PAID_OR_CAMPAIGN" : "DIRECT_OR_ORGANIC",
    utm_source: payload.attribution.utmSource,
    utm_medium: payload.attribution.utmMedium,
    utm_campaign: payload.attribution.utmCampaign,
    utm_term: payload.attribution.utmTerm,
    utm_content: payload.attribution.utmContent,
    lead_referrer: payload.attribution.referrer,
    conversion_page: payload.attribution.landingPage,

    // Operational fields
    lead_notes: payload.message || payload.notes,
    submission_reference_id: payload.id,
    consent_recorded_at: payload.submittedAt,
  };
}

/**
 * Submits a lead with honeypot verification, cooldown rate-limiting,
 * CRM payload preparation, and DOM analytics event dispatching.
 */
export async function submitLead(
  payload: LeadSubmissionPayload
): Promise<SubmissionResult> {
  const now = Date.now();

  // 1. Honeypot check (anti-bot)
  if (payload.honeypot && payload.honeypot.trim().length > 0) {
    return {
      success: false,
      leadId: "",
      submittedAt: new Date().toISOString(),
      error: "Automated submission rejected.",
    };
  }

  // 2. Cooldown check (5-second throttle between rapid submissions)
  if (now - lastSubmissionTimestamp < SUBMISSION_COOLDOWN_MS) {
    return {
      success: false,
      leadId: "",
      submittedAt: new Date().toISOString(),
      error: "Please wait a moment before submitting another inquiry.",
    };
  }

  // 3. Simulated latency for authentic UX feedback
  await new Promise((resolve) => setTimeout(resolve, 600));

  // 4. Update cooldown timestamp
  lastSubmissionTimestamp = Date.now();

  // 5. Build CRM representation (ready for future endpoint integration)
  const crmRecord = mapToCRMRecord(payload);

  // In development, log the structured CRM record for inspection
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.info("[CRM Lead Ready]:", crmRecord);
  }

  // 6. Dispatch custom DOM event for analytics / Google Tag Manager / PostHog
  if (typeof window !== "undefined") {
    const event = new CustomEvent("zakeem:lead_capture", {
      bubbles: true,
      detail: {
        id: payload.id,
        formType: payload.commercial.formType,
        product: payload.commercial.product,
        tier: payload.commercial.tier,
        suite: payload.commercial.suite,
        billing: payload.commercial.billing,
        deployment: payload.commercial.deployment,
        service: payload.commercial.service,
        company: payload.identity.company,
        utmSource: payload.attribution.utmSource,
        utmMedium: payload.attribution.utmMedium,
        utmCampaign: payload.attribution.utmCampaign,
        submittedAt: payload.submittedAt,
      },
    });
    window.dispatchEvent(event);
  }

  return {
    success: true,
    leadId: payload.id,
    submittedAt: payload.submittedAt,
  };
}
