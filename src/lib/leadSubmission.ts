/**
 * Zakeem Solutions — Lead Submission & CRM Infrastructure
 * Phase 15 & 16: Lead Capture, CRM Readiness & Conversion Infrastructure
 */

import {
  CRMLeadRecord,
  LeadSubmissionPayload,
  SubmissionResult,
} from "@/types/lead";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";
import { isAnalyticsConsentGranted } from "./cookieConsent";

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

    // Scheduling preferences (non-binding requested time)
    zakeem_preferred_date:
      payload.scheduling?.preferredDate || payload.preferredDate || undefined,
    zakeem_preferred_time:
      payload.scheduling?.preferredTime || payload.preferredTime || undefined,
    zakeem_preferred_timezone:
      payload.scheduling?.preferredTimezone || payload.preferredTimezone || undefined,

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

  // 5. Build CRM representation (ready for logging/inspection)
  const crmRecord = mapToCRMRecord(payload);

  // In development, log the structured CRM record for inspection
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.info("[CRM Lead Ready]:", crmRecord);
  }

  // 6. Supabase Canonical CRM Persistence
  let returnedLeadId = payload.id;
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (!client) {
      return {
        success: false,
        leadId: "",
        submittedAt: new Date().toISOString(),
        error: "Database client is unavailable.",
      };
    }

    try {
      const { data, error } = await client.rpc("submit_inbound_lead", {
        p_reference_id: payload.id,
        p_form_type: payload.commercial.formType,
        p_full_name: payload.identity.fullName.trim(),
        p_work_email: payload.identity.workEmail.trim(),
        p_company: payload.identity.company.trim(),
        p_phone: payload.identity.phone?.trim() || null,
        p_job_title: payload.identity.jobTitle?.trim() || null,
        p_product: payload.commercial.product || null,
        p_tier: payload.commercial.tier || null,
        p_suite: payload.commercial.suite || null,
        p_billing: payload.commercial.billing || null,
        p_deployment: payload.commercial.deployment || null,
        p_inquiry_category: payload.commercial.inquiryCategory || null,
        p_notes: (payload.message || payload.notes)?.trim() || null,
        p_attribution: {
          utm_source: payload.attribution.utmSource || null,
          utm_medium: payload.attribution.utmMedium || null,
          utm_campaign: payload.attribution.utmCampaign || null,
          utm_term: payload.attribution.utmTerm || null,
          utm_content: payload.attribution.utmContent || null,
          referrer: payload.attribution.referrer || null,
          landing_page: payload.attribution.landingPage || null,
        },
      });

      if (error) {
        // eslint-disable-next-line no-console
        console.error("[CRM Lead Persistence Error]:", error.message);
        return {
          success: false,
          leadId: "",
          submittedAt: new Date().toISOString(),
          error: error.message || "Failed to persist inquiry to CRM.",
        };
      }

      if (data && data.success === false) {
        return {
          success: false,
          leadId: "",
          submittedAt: new Date().toISOString(),
          error: data.error || "Failed to persist inquiry.",
        };
      }

      if (data?.reference_id) {
        returnedLeadId = data.reference_id;
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("[CRM Lead Submission Exception]:", err);
      return {
        success: false,
        leadId: "",
        submittedAt: new Date().toISOString(),
        error: err?.message || "An unexpected error occurred while saving your inquiry.",
      };
    }
  }

  // 7. Dispatch custom DOM event for analytics / telemetry (gated by cookie consent)
  if (typeof window !== "undefined" && isAnalyticsConsentGranted()) {
    const event = new CustomEvent("zakeem:lead_capture", {
      bubbles: true,
      detail: {
        id: returnedLeadId,
        formType: payload.commercial.formType,
        product: payload.commercial.product,
        tier: payload.commercial.tier,
        suite: payload.commercial.suite,
        billing: payload.commercial.billing,
        deployment: payload.commercial.deployment,
        service: payload.commercial.service,
        company: payload.identity.company,
        preferredDate:
          payload.scheduling?.preferredDate || payload.preferredDate || undefined,
        preferredTime:
          payload.scheduling?.preferredTime || payload.preferredTime || undefined,
        preferredTimezone:
          payload.scheduling?.preferredTimezone || payload.preferredTimezone || undefined,
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
    leadId: returnedLeadId,
    submittedAt: payload.submittedAt,
  };
}
