/**
 * Zakeem Solutions — IT Training Application Service & Persistence
 * Phase 71B: Zakeem IT Training Fully Online Application Flow
 */

import {
  TrainingApplicationPayload,
  TrainingApplicationRecord,
  TrainingSubmissionResult,
} from "@/types/training";
import {
  generateTrainingReferenceId,
  getLagosTodayIsoDate,
  sanitizeInput,
  validateTrainingApplication,
} from "./trainingValidation";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";
import { dispatchTrainingApplicationNotifications } from "./notificationService";
import { recordAuditEvent } from "./auditTelemetry";

let lastTrainingSubmissionTimestamp = 0;
const SUBMISSION_COOLDOWN_MS = 3000;

const STORAGE_KEY = "zakeem_it_training_applications";

function getStoredTrainingApplications(): TrainingApplicationRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredTrainingApplications(list: TrainingApplicationRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Non-blocking fallback
  }
}

/**
 * Links an organization applicant to canonical CRM entities (crm_organizations, crm_contacts, crm_leads, crm_activities).
 * Avoids duplicate CRM records if the same application reference is retried.
 */
export async function linkOrganizationTrainingToCRM(params: {
  applicationReference: string;
  organizationName: string;
  businessEmail: string;
  course: string;
  customTrainingRequest?: string;
  preferredStartDate: string;
  trainingDays: string[];
  preferredTime: string;
}): Promise<{ success: boolean; organizationId?: string; contactId?: string; leadId?: string; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Database unconfigured" };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: "Database client unavailable" };
  }

  try {
    const cleanOrgName = sanitizeInput(params.organizationName);
    const cleanEmail = sanitizeInput(params.businessEmail).toLowerCase();
    const domain = cleanEmail.includes("@") ? cleanEmail.split("@")[1].toLowerCase() : "";
    const isFreeDomain = [
      "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com",
      "icloud.com", "proton.me", "protonmail.com", "mail.com", "zoho.com"
    ].includes(domain);

    // 1. Resolve or create Organization
    let organizationId: string | null = null;
    if (!isFreeDomain && domain) {
      const { data: orgByDomain } = await client
        .from("crm_organizations")
        .select("id")
        .eq("domain", domain)
        .limit(1)
        .maybeSingle();
      if (orgByDomain) organizationId = orgByDomain.id;
    }

    if (!organizationId) {
      const { data: orgByName } = await client
        .from("crm_organizations")
        .select("id")
        .ilike("name", cleanOrgName)
        .limit(1)
        .maybeSingle();
      if (orgByName) organizationId = orgByName.id;
    }

    if (!organizationId) {
      const slug = cleanOrgName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const finalSlug = (slug.length >= 2 ? slug : "org") + "-" + Math.random().toString(36).substring(2, 6);

      const { data: newOrg, error: orgInsertErr } = await client
        .from("crm_organizations")
        .insert({
          name: cleanOrgName,
          slug: finalSlug,
          domain: !isFreeDomain ? domain : null,
          status: "lead",
        })
        .select("id")
        .single();

      if (!orgInsertErr && newOrg) {
        organizationId = newOrg.id;
      }
    }

    // 2. Resolve or create Contact
    let contactId: string | null = null;
    const { data: existingContact } = await client
      .from("crm_contacts")
      .select("id")
      .eq("email", cleanEmail)
      .limit(1)
      .maybeSingle();

    if (existingContact) {
      contactId = existingContact.id;
      if (organizationId) {
        await client
          .from("crm_contacts")
          .update({ organization_id: organizationId, updated_at: new Date().toISOString() })
          .eq("id", contactId);
      }
    } else {
      const { data: newContact, error: contactInsertErr } = await client
        .from("crm_contacts")
        .insert({
          organization_id: organizationId,
          email: cleanEmail,
          full_name: cleanOrgName + " Admissions Contact",
          is_primary: true,
        })
        .select("id")
        .single();

      if (!contactInsertErr && newContact) {
        contactId = newContact.id;
      }
    }

    // 3. Resolve or create CRM Lead (idempotent on application reference)
    let leadId: string | null = null;
    const { data: existingLead } = await client
      .from("crm_leads")
      .select("id")
      .eq("reference_id", params.applicationReference)
      .limit(1)
      .maybeSingle();

    if (existingLead) {
      leadId = existingLead.id;
    } else {
      const daysStr = params.trainingDays.join(", ");
      const notes = [
        `Zakeem IT Training Application (${params.applicationReference})`,
        `Course: ${params.course}`,
        params.customTrainingRequest ? `Custom Requirements: ${params.customTrainingRequest}` : null,
        `Start Date: ${params.preferredStartDate}`,
        `Days: ${daysStr} (2 hours/session)`,
        `Time: ${params.preferredTime} (Africa/Lagos WAT)`,
      ].filter(Boolean).join("\n");

      const { data: newLead, error: leadErr } = await client
        .from("crm_leads")
        .insert({
          reference_id: params.applicationReference,
          organization_id: organizationId,
          contact_id: contactId,
          form_type: "contact",
          status: "new",
          product_interest: `Zakeem IT Training — ${params.course}`,
          inquiry_category: "it-training",
          notes,
          attribution: {
            source: "it_training_online_form",
            application_reference: params.applicationReference,
          },
        })
        .select("id")
        .single();

      if (!leadErr && newLead) {
        leadId = newLead.id;

        // Record CRM Activity
        await client.from("crm_activities").insert({
          activity_type: "lead_created",
          organization_id: organizationId,
          contact_id: contactId,
          lead_id: leadId,
          title: `IT Training Application Received (${params.applicationReference})`,
          description: `Online training inquiry for ${params.course}. Schedule: ${daysStr} at ${params.preferredTime} WAT.`,
          status: "completed",
          completed_at: new Date().toISOString(),
        });
      }
    }

    return {
      success: true,
      organizationId: organizationId || undefined,
      contactId: contactId || undefined,
      leadId: leadId || undefined,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "CRM linking failed";
    return { success: false, error: errorMsg };
  }
}

/**
 * Submits an online IT training application with validation, persistence,
 * CRM linking for corporate applicants, and dual email dispatch.
 */
export async function submitTrainingApplication(
  payload: Partial<TrainingApplicationPayload>
): Promise<TrainingSubmissionResult> {
  // 1. Anti-spam honeypot check
  if (payload.honeypot && payload.honeypot.trim().length > 0) {
    return {
      success: false,
      error: "Automated submission rejected.",
    };
  }

  // 2. Cooldown check
  const now = Date.now();
  if (now - lastTrainingSubmissionTimestamp < SUBMISSION_COOLDOWN_MS) {
    return {
      success: false,
      error: "Please wait a moment before submitting another application.",
    };
  }
  lastTrainingSubmissionTimestamp = now;

  // 3. Validation
  const validation = validateTrainingApplication(payload);
  if (!validation.isValid) {
    const firstErr = Object.values(validation.errors)[0] || "Validation failed.";
    return {
      success: false,
      error: firstErr,
    };
  }

  const applicationReference = payload.applicationReference || generateTrainingReferenceId();
  const nowIso = new Date().toISOString();

  const record: TrainingApplicationRecord = {
    id: `zit-${Date.now()}`,
    applicationReference,
    applicantType: payload.applicantType!,
    fullName: payload.applicantType === "individual" ? sanitizeInput(payload.fullName || "") : undefined,
    email: payload.applicantType === "individual" ? sanitizeInput(payload.email || "").toLowerCase() : undefined,
    organizationName: payload.applicantType === "organization" ? sanitizeInput(payload.organizationName || "") : undefined,
    businessEmail: payload.applicantType === "organization" ? sanitizeInput(payload.businessEmail || "").toLowerCase() : undefined,
    course: payload.course!,
    customTrainingRequest: payload.course === "Customized Training" ? sanitizeInput(payload.customTrainingRequest || "") : undefined,
    preferredStartDate: payload.preferredStartDate || getLagosTodayIsoDate(),
    trainingDays: payload.trainingDays || [],
    sessionDurationMinutes: 120,
    preferredTime: sanitizeInput(payload.preferredTime || "10:00"),
    timezone: "Africa/Lagos",
    acknowledgementAccepted: true,
    acknowledgementAcceptedAt: nowIso,
    status: "submitted",
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  // 4. CRM Integration for Organization Applicants ONLY
  let crmLeadId: string | undefined;
  if (record.applicantType === "organization" && record.organizationName && record.businessEmail) {
    const crmResult = await linkOrganizationTrainingToCRM({
      applicationReference,
      organizationName: record.organizationName,
      businessEmail: record.businessEmail,
      course: record.course,
      customTrainingRequest: record.customTrainingRequest,
      preferredStartDate: record.preferredStartDate,
      trainingDays: record.trainingDays,
      preferredTime: record.preferredTime,
    });
    if (crmResult.success && crmResult.leadId) {
      crmLeadId = crmResult.leadId;
      record.crmLeadId = crmLeadId;
    }
  }

  // 5. Database Persistence (training_applications table)
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { error: dbErr } = await client
          .from("training_applications")
          .insert({
            application_reference: applicationReference,
            applicant_type: record.applicantType,
            full_name: record.fullName || null,
            email: record.email || null,
            organization_name: record.organizationName || null,
            business_email: record.businessEmail || null,
            course: record.course,
            custom_training_request: record.customTrainingRequest || null,
            preferred_start_date: record.preferredStartDate,
            training_days: record.trainingDays,
            session_duration_minutes: 120,
            preferred_time: record.preferredTime,
            timezone: "Africa/Lagos",
            acknowledgement_accepted: true,
            acknowledgement_accepted_at: nowIso,
            status: "submitted",
            crm_lead_id: crmLeadId || null,
          });

        if (dbErr) {
          console.warn("[Training Application Database Insert Warning]:", dbErr.message);
        }
      } catch {
        // Table may be pending remote migration; fallback to local storage
      }
    }
  }

  // Always keep stored copy for local resilience
  const stored = getStoredTrainingApplications();
  stored.unshift(record);
  saveStoredTrainingApplications(stored);

  // 6. Record Audit Telemetry
  recordAuditEvent({
    eventType: "crm.lead.created",
    entityType: "lead",
    entityId: applicationReference,
    metadata: {
      applicationReference,
      applicantType: record.applicantType,
      course: record.course,
      preferredStartDate: record.preferredStartDate,
      trainingDays: record.trainingDays,
      crmLeadId: crmLeadId || null,
    },
  });

  // 7. Dispatch Outbound Emails (Internal & Applicant Confirmation)
  let internalDispatched = false;
  let applicantDispatched = false;

  try {
    const notifRes = await dispatchTrainingApplicationNotifications({
      applicationReference,
      applicantType: record.applicantType,
      fullName: record.fullName,
      email: record.email,
      organizationName: record.organizationName,
      businessEmail: record.businessEmail,
      course: record.course,
      customTrainingRequest: record.customTrainingRequest,
      preferredStartDate: record.preferredStartDate,
      trainingDays: record.trainingDays,
      sessionDurationMinutes: 120,
      preferredTime: record.preferredTime,
      timezone: "Africa/Lagos",
      submittedAt: nowIso,
    });

    internalDispatched = notifRes.internalResult.success;
    applicantDispatched = notifRes.applicantResult.success;
  } catch (emailErr) {
    // Non-blocking for UI submission feedback
    console.warn("[IT Training] Email notification dispatch notice:", emailErr);
  }

  return {
    success: true,
    applicationReference,
    record,
    crmLeadId,
    internalEmailDispatched: internalDispatched,
    applicantEmailDispatched: applicantDispatched,
  };
}
