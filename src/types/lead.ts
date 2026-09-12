/**
 * Zakeem Solutions — Lead Capture & CRM Integration Contract
 * Phase 15 & 16: Lead Capture, CRM Readiness & Conversion Infrastructure
 */

export interface LeadIdentity {
  fullName: string;
  workEmail: string;
  company: string;
  phone?: string;
  jobTitle?: string;
}

export type CommercialFormType = "contact" | "demo";

export interface CommercialIntent {
  formType: CommercialFormType;
  product?: string;
  tier?: string;
  suite?: string;
  billing?: "monthly" | "annual";
  deployment?: "cloud" | "private-vpc" | "on-premise";
  service?: string;
  inquiryCategory?: string;
  selectedModules?: string[];
}

export interface LeadAttribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  landingPage?: string;
  referrer?: string;
}

export interface LeadSchedulingPreference {
  preferredDate?: string; // Format: YYYY-MM-DD
  preferredTime?: string; // Format: "HH:MM AM/PM"
  preferredTimezone?: string; // Standard timezone identifier e.g., "Africa/Lagos" (WAT)
}

export interface LeadSubmissionPayload {
  id: string; // Unique reference e.g., ZK-202609-XXXX
  submittedAt: string; // ISO 8601
  identity: LeadIdentity;
  commercial: CommercialIntent;
  attribution: LeadAttribution;
  scheduling?: LeadSchedulingPreference;
  preferredDate?: string;
  preferredTime?: string;
  preferredTimezone?: string;
  message?: string;
  notes?: string;
  consent: boolean;
  honeypot?: string; // Must be empty to be valid
}

export interface SubmissionResult {
  success: boolean;
  leadId: string;
  submittedAt: string;
  error?: string;
}

/**
 * Conceptual CRM Lead Record
 * Demonstrates 1:1 mapping to industry-standard CRMs (HubSpot, Salesforce, Supabase).
 */
export interface CRMLeadRecord {
  // Common Contact Fields
  email: string;
  first_name: string;
  last_name: string;
  company_name: string;
  phone_number?: string;
  job_title?: string;

  // Commercial Properties
  zakeem_form_type: CommercialFormType;
  zakeem_product_interest?: string;
  zakeem_pricing_tier?: string;
  zakeem_suite_bundle?: string;
  zakeem_billing_commitment?: string;
  zakeem_deployment_model?: string;
  zakeem_service_engagement?: string;
  zakeem_inquiry_category?: string;
  zakeem_stack_modules?: string;

  // Scheduling Preferences (Requested, Non-Binding)
  zakeem_preferred_date?: string;
  zakeem_preferred_time?: string;
  zakeem_preferred_timezone?: string;

  // Attribution Properties
  hs_analytics_source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  lead_referrer?: string;
  conversion_page?: string;

  // Operational
  lead_notes?: string;
  submission_reference_id: string;
  consent_recorded_at: string;
}
