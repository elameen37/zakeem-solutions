/**
 * Zakeem Solutions — IT Training Application Service & Persistence
 * Phase 71B: Zakeem IT Training Fully Online Application Flow
 */

import {
  TrainingApplicationFilter,
  TrainingApplicationPayload,
  TrainingApplicationRecord,
  TrainingApplicationStatus,
  TrainingKPIStats,
  TrainingSubmissionResult,
  VALID_TRAINING_STATUS_TRANSITIONS,
} from "@/types/training";
import {
  generateTrainingReferenceId,
  getLagosTodayIsoDate,
  sanitizeInput,
  validateTrainingApplication,
} from "./trainingValidation";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";
import {
  dispatchNotification,
  dispatchTrainingApplicationNotifications,
} from "./notificationService";
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

// -----------------------------------------------------------------------------
// PHASE 72: ADMISSIONS DESK ADMINISTRATIVE OPERATIONS
// -----------------------------------------------------------------------------

function mapDbRecordToApplicationRecord(row: Record<string, any>): TrainingApplicationRecord {
  return {
    id: row.id || `zit-${Date.now()}`,
    applicationReference: row.application_reference || row.applicationReference || "",
    applicantType: row.applicant_type || row.applicantType || "individual",
    fullName: row.full_name || row.fullName || undefined,
    email: row.email || undefined,
    organizationName: row.organization_name || row.organizationName || undefined,
    businessEmail: row.business_email || row.businessEmail || undefined,
    course: row.course,
    customTrainingRequest: row.custom_training_request || row.customTrainingRequest || undefined,
    preferredStartDate: row.preferred_start_date || row.preferredStartDate || "",
    trainingDays: Array.isArray(row.training_days) ? row.training_days : (row.trainingDays || []),
    sessionDurationMinutes: row.session_duration_minutes || row.sessionDurationMinutes || 120,
    preferredTime: row.preferred_time || row.preferredTime || "10:00",
    timezone: row.timezone || "Africa/Lagos",
    acknowledgementAccepted: row.acknowledgement_accepted ?? row.acknowledgementAccepted ?? true,
    acknowledgementAcceptedAt: row.acknowledgement_accepted_at || row.acknowledgementAcceptedAt || row.created_at || new Date().toISOString(),
    status: (row.status as TrainingApplicationStatus) || "submitted",
    crmLeadId: row.crm_lead_id || row.crmLeadId || undefined,
    cancellationReason: row.cancellation_reason || row.cancellationReason || undefined,
    adminNotes: row.admin_notes || row.adminNotes || undefined,
    reviewedAt: row.reviewed_at || row.reviewedAt || undefined,
    confirmedAt: row.confirmed_at || row.confirmedAt || undefined,
    cancelledAt: row.cancelled_at || row.cancelledAt || undefined,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
  };
}

/**
 * Retrieves all training applications with filtering, search, and KPI calculations.
 */
export async function getAdminTrainingApplications(
  filters?: TrainingApplicationFilter
): Promise<{
  success: boolean;
  data: TrainingApplicationRecord[];
  stats: TrainingKPIStats;
  error?: string;
}> {
  let allApplications: TrainingApplicationRecord[] = [];

  // 1. Fetch from Supabase if configured
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("training_applications")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data)) {
          allApplications = data.map(mapDbRecordToApplicationRecord);
        }
      } catch (err) {
        console.warn("[getAdminTrainingApplications DB notice]:", err);
      }
    }
  }

  // 2. Merge with locally stored applications (for offline/resilience, deduplicating by reference)
  const stored = getStoredTrainingApplications();
  const existingRefs = new Set(allApplications.map((a) => a.applicationReference));
  for (const item of stored) {
    if (!existingRefs.has(item.applicationReference)) {
      allApplications.push(item);
      existingRefs.add(item.applicationReference);
    }
  }

  // Sort descending by createdAt
  allApplications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // 3. Compute KPI stats across ALL applications
  const stats: TrainingKPIStats = {
    totalApplications: allApplications.length,
    submitted: allApplications.filter((a) => a.status === "submitted").length,
    inReview: allApplications.filter((a) => a.status === "in_review").length,
    confirmed: allApplications.filter((a) => a.status === "confirmed").length,
    cancelled: allApplications.filter((a) => a.status === "cancelled").length,
    organizations: allApplications.filter((a) => a.applicantType === "organization").length,
    individuals: allApplications.filter((a) => a.applicantType === "individual").length,
  };

  // 4. Apply Filters
  let filtered = [...allApplications];

  if (filters?.applicantType && filters.applicantType !== "all") {
    filtered = filtered.filter((a) => a.applicantType === filters.applicantType);
  }

  if (filters?.status && filters.status !== "all") {
    filtered = filtered.filter((a) => a.status === filters.status);
  }

  if (filters?.course && filters.course !== "all") {
    filtered = filtered.filter((a) => a.course === filters.course);
  }

  if (filters?.crmStatus && filters.crmStatus !== "all") {
    if (filters.crmStatus === "linked") {
      filtered = filtered.filter((a) => Boolean(a.crmLeadId));
    } else if (filters.crmStatus === "unlinked") {
      filtered = filtered.filter((a) => !a.crmLeadId);
    }
  }

  if (filters?.startDateFrom) {
    filtered = filtered.filter((a) => a.preferredStartDate >= filters.startDateFrom!);
  }
  if (filters?.startDateTo) {
    filtered = filtered.filter((a) => a.preferredStartDate <= filters.startDateTo!);
  }

  if (filters?.search && filters.search.trim().length > 0) {
    const q = filters.search.trim().toLowerCase();
    filtered = filtered.filter((a) => {
      const refMatch = a.applicationReference.toLowerCase().includes(q);
      const nameMatch = a.fullName ? a.fullName.toLowerCase().includes(q) : false;
      const orgMatch = a.organizationName ? a.organizationName.toLowerCase().includes(q) : false;
      const emailMatch = a.email ? a.email.toLowerCase().includes(q) : false;
      const bizEmailMatch = a.businessEmail ? a.businessEmail.toLowerCase().includes(q) : false;
      const courseMatch = a.course.toLowerCase().includes(q);
      return refMatch || nameMatch || orgMatch || emailMatch || bizEmailMatch || courseMatch;
    });
  }

  return {
    success: true,
    data: filtered,
    stats,
  };
}

/**
 * Retrieves a single application by ID or application reference, including enriched CRM details.
 */
export async function getAdminTrainingApplicationById(
  idOrRef: string
): Promise<{ success: boolean; application?: TrainingApplicationRecord; error?: string }> {
  if (!idOrRef || !idOrRef.trim()) {
    return { success: false, error: "Application identifier is required." };
  }

  const cleanId = idOrRef.trim();
  let application: TrainingApplicationRecord | undefined;

  // 1. Search in Supabase
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
        let query = client.from("training_applications").select("*");
        if (isUuid) {
          query = query.or(`id.eq.${cleanId},application_reference.eq.${cleanId}`);
        } else {
          query = query.eq("application_reference", cleanId);
        }

        const { data, error } = await query.limit(1).maybeSingle();
        if (!error && data) {
          application = mapDbRecordToApplicationRecord(data);
        }
      } catch (err) {
        console.warn("[getAdminTrainingApplicationById DB notice]:", err);
      }
    }
  }

  // 2. Search local storage fallback
  if (!application) {
    const stored = getStoredTrainingApplications();
    application = stored.find(
      (a) => a.id === cleanId || a.applicationReference.toLowerCase() === cleanId.toLowerCase()
    );
  }

  if (!application) {
    return { success: false, error: `Training application "${cleanId}" not located.` };
  }

  // 3. Enrich CRM data if crmLeadId is present
  if (application.crmLeadId && isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data: lead } = await client
          .from("crm_leads")
          .select(`
            id,
            status,
            reference_id,
            organization_id,
            contact_id,
            crm_organizations ( id, name, slug, domain, status ),
            crm_contacts ( id, full_name, email, phone, job_title )
          `)
          .eq("id", application.crmLeadId)
          .maybeSingle();

        if (lead) {
          application.crmLeadStatus = lead.status;
          const org = (lead as any).crm_organizations;
          if (org && org.name) application.crmOrganizationName = org.name;
          const contact = (lead as any).crm_contacts;
          if (contact && contact.full_name) application.crmContactName = contact.full_name;
        }
      } catch {
        // Non-blocking enrichment failure
      }
    }
  }

  return { success: true, application };
}

/**
 * Transitions an application's lifecycle status with transition validation,
 * mandatory cancellation reason checking, timestamps, and audit telemetry.
 */
export async function updateAdminTrainingStatus(params: {
  idOrRef: string;
  newStatus: TrainingApplicationStatus;
  reason?: string;
  actor?: string;
}): Promise<{ success: boolean; application?: TrainingApplicationRecord; error?: string }> {
  const { idOrRef, newStatus, reason, actor = "admin" } = params;

  // 1. Fetch current application
  const existingRes = await getAdminTrainingApplicationById(idOrRef);
  if (!existingRes.success || !existingRes.application) {
    return { success: false, error: existingRes.error || "Training application not found." };
  }

  const current = existingRes.application;

  // 2. Idempotent no-op check
  if (current.status === newStatus) {
    return { success: true, application: current };
  }

  // 3. Strict Transition Rules
  const allowedNext = VALID_TRAINING_STATUS_TRANSITIONS[current.status] || [];
  if (!allowedNext.includes(newStatus)) {
    return {
      success: false,
      error: `Invalid status transition: Cannot change application from "${current.status}" to "${newStatus}".`,
    };
  }

  // 4. Cancellation Reason Validation
  if (newStatus === "cancelled") {
    if (!reason || !reason.trim()) {
      return {
        success: false,
        error: "A valid, non-empty cancellation reason is mandatory when cancelling a training application.",
      };
    }
  }

  const nowIso = new Date().toISOString();
  const cleanReason = reason ? sanitizeInput(reason.trim()) : undefined;

  // Update target object
  const updated: TrainingApplicationRecord = {
    ...current,
    status: newStatus,
    updatedAt: nowIso,
  };

  if (newStatus === "in_review") {
    updated.reviewedAt = nowIso;
  } else if (newStatus === "confirmed") {
    updated.confirmedAt = nowIso;
  } else if (newStatus === "cancelled") {
    updated.cancelledAt = nowIso;
    updated.cancellationReason = cleanReason;
  }

  // 5. Update Database
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const payload: Record<string, any> = {
          status: newStatus,
          updated_at: nowIso,
        };
        if (newStatus === "in_review") payload.reviewed_at = nowIso;
        if (newStatus === "confirmed") payload.confirmed_at = nowIso;
        if (newStatus === "cancelled") {
          payload.cancelled_at = nowIso;
          payload.cancellation_reason = cleanReason;
        }

        const { error: dbErr } = await client
          .from("training_applications")
          .update(payload)
          .eq("application_reference", current.applicationReference);

        if (dbErr) {
          // If error is due to missing columns, retry updating status and updated_at only
          await client
            .from("training_applications")
            .update({ status: newStatus, updated_at: nowIso })
            .eq("application_reference", current.applicationReference);
        }

        // If CRM Lead exists for an organization applicant, synchronize lead status
        if (current.applicantType === "organization" && current.crmLeadId) {
          let newLeadStatus: string | null = null;
          if (newStatus === "confirmed") {
            newLeadStatus = "qualified";
          } else if (newStatus === "cancelled") {
            newLeadStatus = "disqualified";
          }

          if (newLeadStatus) {
            await client
              .from("crm_leads")
              .update({
                status: newLeadStatus,
                updated_at: nowIso,
              })
              .eq("id", current.crmLeadId);
          }

          // Record CRM activity
          await client.from("crm_activities").insert({
            activity_type: newStatus === "confirmed" ? "proposal" : (newStatus === "cancelled" ? "follow_up" : "note_added"),
            lead_id: current.crmLeadId,
            organization_id: current.organizationName ? undefined : undefined,
            title: `Training Application ${newStatus.toUpperCase()}`,
            description: `Application status transitioned from ${current.status} to ${newStatus}.${cleanReason ? ` Reason: ${cleanReason}` : ""}${newLeadStatus ? ` [CRM Lead updated to ${newLeadStatus}]` : ""}`,
            status: "completed",
            completed_at: nowIso,
          });
        }
      } catch (err) {
        console.warn("[updateAdminTrainingStatus DB notice]:", err);
      }
    }
  }

  // 6. Update local storage
  const stored = getStoredTrainingApplications();
  const idx = stored.findIndex((a) => a.applicationReference === current.applicationReference);
  if (idx >= 0) {
    stored[idx] = updated;
  } else {
    stored.unshift(updated);
  }
  saveStoredTrainingApplications(stored);

  // 7. Record Audit Telemetry
  let auditEventType = "training.application.status_changed";
  if (newStatus === "confirmed") auditEventType = "training.application.confirmed";
  else if (newStatus === "cancelled") auditEventType = "training.application.cancelled";
  else if (newStatus === "in_review") auditEventType = "training.application.reviewed";

  recordAuditEvent({
    eventType: auditEventType as any,
    entityType: "training_application",
    entityId: current.applicationReference,
    actorId: actor,
    actorRole: "admin",
    metadata: {
      applicationReference: current.applicationReference,
      previousStatus: current.status,
      newStatus,
      cancellationReason: cleanReason || null,
      actor,
    },
  });

  return { success: true, application: updated };
}

/**
 * Confirms a training application and dispatches applicant confirmation email
 * using the existing notification service with deterministic idempotency.
 */
export async function confirmAdminTrainingApplication(params: {
  application: TrainingApplicationRecord;
  actor?: string;
}): Promise<{
  success: boolean;
  application?: TrainingApplicationRecord;
  emailDispatched?: boolean;
  error?: string;
}> {
  const { application, actor = "admin" } = params;

  // 1. Transition status to confirmed
  const statusRes = await updateAdminTrainingStatus({
    idOrRef: application.applicationReference,
    newStatus: "confirmed",
    actor,
  });

  if (!statusRes.success || !statusRes.application) {
    return { success: false, error: statusRes.error };
  }

  const confirmedApp = statusRes.application;

  // 2. Dispatch Confirmation Email with deterministic idempotency
  const applicantEmail = confirmedApp.applicantType === "organization"
    ? confirmedApp.businessEmail
    : confirmedApp.email;
  const applicantName = confirmedApp.applicantType === "organization"
    ? confirmedApp.organizationName
    : confirmedApp.fullName;

  let emailDispatched = false;

  if (applicantEmail) {
    const cleanRef = sanitizeInput(confirmedApp.applicationReference);
    const duration = confirmedApp.sessionDurationMinutes || 120;
    const timezone = confirmedApp.timezone || "Africa/Lagos";

    // Deterministic idempotency key prevents duplicate sends
    const origin = typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://www.zakeemsolutions.com";
    const statusUrl = `${origin}/training/status?ref=${encodeURIComponent(cleanRef)}&email=${encodeURIComponent(applicantEmail)}`;
    const idempotencyKey = `zk_notif_training_confirmed_${cleanRef}`;

    const notifResult = await dispatchNotification({
      eventType: "it_training_applicant_confirmation",
      recipientEmail: applicantEmail,
      recipientName: applicantName || "Candidate",
      subject: `Zakeem IT Training Application Confirmed — ${cleanRef}`,
      templateData: {
        applicationReference: cleanRef,
        applicantType: confirmedApp.applicantType,
        course: confirmedApp.course,
        preferredStartDate: confirmedApp.preferredStartDate,
        trainingDays: confirmedApp.trainingDays,
        sessionDurationMinutes: duration,
        preferredTime: confirmedApp.preferredTime,
        timezone,
        statusUrl,
        origin,
        isConfirmed: true,
        status: "confirmed",
      },
      referenceId: cleanRef,
      idempotencyKey,
    });

    emailDispatched = notifResult.success;
  }

  return {
    success: true,
    application: confirmedApp,
    emailDispatched,
  };
}

/**
 * Adds an internal admin note to the application and optionally logs to CRM activities.
 */
export async function addAdminTrainingNote(params: {
  idOrRef: string;
  note: string;
  actor?: string;
}): Promise<{ success: boolean; application?: TrainingApplicationRecord; error?: string }> {
  const { idOrRef, note, actor = "admin" } = params;
  if (!note || !note.trim()) {
    return { success: false, error: "Note content cannot be empty." };
  }

  const existingRes = await getAdminTrainingApplicationById(idOrRef);
  if (!existingRes.success || !existingRes.application) {
    return { success: false, error: existingRes.error || "Training application not found." };
  }

  const current = existingRes.application;
  const nowIso = new Date().toISOString();
  const cleanNote = sanitizeInput(note.trim());
  const entry = `[${nowIso} by ${actor}]: ${cleanNote}`;
  const updatedNotes = current.adminNotes ? `${current.adminNotes}\n\n${entry}` : entry;

  const updated: TrainingApplicationRecord = {
    ...current,
    adminNotes: updatedNotes,
    updatedAt: nowIso,
  };

  // Update Database
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { error: dbErr } = await client
          .from("training_applications")
          .update({ admin_notes: updatedNotes, updated_at: nowIso })
          .eq("application_reference", current.applicationReference);

        if (dbErr) {
          console.warn("[addAdminTrainingNote DB notice]:", dbErr.message);
        }

        // If CRM Lead exists, record CRM activity
        if (current.crmLeadId) {
          await client.from("crm_activities").insert({
            activity_type: "note_added",
            lead_id: current.crmLeadId,
            title: `Admissions Note (${current.applicationReference})`,
            description: cleanNote,
            status: "completed",
            completed_at: nowIso,
          });
        }
      } catch (err) {
        console.warn("[addAdminTrainingNote notice]:", err);
      }
    }
  }

  // Update local storage
  const stored = getStoredTrainingApplications();
  const idx = stored.findIndex((a) => a.applicationReference === current.applicationReference);
  if (idx >= 0) {
    stored[idx] = updated;
  } else {
    stored.unshift(updated);
  }
  saveStoredTrainingApplications(stored);

  // Record audit telemetry
  recordAuditEvent({
    eventType: "training.application.note_added" as any,
    entityType: "training_application",
    entityId: current.applicationReference,
    actorId: actor,
    actorRole: "admin",
    metadata: {
      applicationReference: current.applicationReference,
      actor,
    },
  });

  return { success: true, application: updated };
}

/**
 * Idempotently retries CRM synchronization for an organization training application.
 * Strictly rejects individual applications.
 */
export async function retryOrganizationTrainingCRM(
  applicationReference: string
): Promise<{ success: boolean; leadId?: string; error?: string }> {
  if (!applicationReference || !applicationReference.trim()) {
    return { success: false, error: "Application reference is required." };
  }

  const existingRes = await getAdminTrainingApplicationById(applicationReference);
  if (!existingRes.success || !existingRes.application) {
    return { success: false, error: existingRes.error || "Training application not found." };
  }

  const app = existingRes.application;

  if (app.applicantType !== "organization") {
    return {
      success: false,
      error: "Corporate CRM synchronization is strictly reserved for organization applicants.",
    };
  }

  if (!app.organizationName || !app.businessEmail) {
    return {
      success: false,
      error: "Missing required organization name or business email.",
    };
  }

  const crmResult = await linkOrganizationTrainingToCRM({
    applicationReference: app.applicationReference,
    organizationName: app.organizationName,
    businessEmail: app.businessEmail,
    course: app.course,
    customTrainingRequest: app.customTrainingRequest,
    preferredStartDate: app.preferredStartDate,
    trainingDays: app.trainingDays,
    preferredTime: app.preferredTime,
  });

  if (!crmResult.success || !crmResult.leadId) {
    return {
      success: false,
      error: crmResult.error || "Failed to link organization application to CRM.",
    };
  }

  const leadId = crmResult.leadId;

  // Update training application record
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        await client
          .from("training_applications")
          .update({ crm_lead_id: leadId, updated_at: new Date().toISOString() })
          .eq("application_reference", app.applicationReference);
      } catch (err) {
        console.warn("[retryOrganizationTrainingCRM update notice]:", err);
      }
    }
  }

  const stored = getStoredTrainingApplications();
  const idx = stored.findIndex((a) => a.applicationReference === app.applicationReference);
  if (idx >= 0) {
    stored[idx].crmLeadId = leadId;
    saveStoredTrainingApplications(stored);
  }

  recordAuditEvent({
    eventType: "training.crm_linkage.retried" as any,
    entityType: "training_application",
    entityId: app.applicationReference,
    metadata: {
      applicationReference: app.applicationReference,
      leadId,
    },
  });

  return { success: true, leadId };
}

// -----------------------------------------------------------------------------
// PHASE 73: PUBLIC APPLICANT STATUS VERIFICATION
// -----------------------------------------------------------------------------

export interface PublicTrainingStatusData {
  reference: string;
  applicantType: "individual" | "organization";
  applicantDisplayName?: string;
  course: string;
  preferredStartDate: string;
  trainingDays: string[];
  sessionDuration: string;
  sessionDurationMinutes: number;
  preferredTime: string;
  timezone: string;
  status: TrainingApplicationStatus | string;
  statusMessage: string;
  deliveryMode: string;
  certificateEligible: boolean;
  submittedAt: string;
  reviewedAt?: string | null;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
}

export interface PublicTrainingStatusResult {
  success: boolean;
  data?: PublicTrainingStatusData;
  error?: string;
}

let lastPublicStatusCheckTimestamp = 0;
const STATUS_CHECK_COOLDOWN_MS = 1000;

/**
 * Public applicant status inquiry. Requires BOTH application reference and matching email.
 * Rejects mismatched inputs with zero enumeration leakage (does not disclose if reference exists).
 * Never exposes admin notes, cancellation reasons, or internal CRM identifiers.
 */
export async function checkPublicTrainingStatus(
  reference: string,
  email: string
): Promise<PublicTrainingStatusResult> {
  const cleanRef = sanitizeInput(reference || "").trim().toUpperCase();
  const cleanEmail = sanitizeInput(email || "").trim().toLowerCase();

  if (!cleanRef || !cleanEmail) {
    return {
      success: false,
      error: "Please enter both your Application Reference and registered Email address.",
    };
  }

  // Rate limiting / abuse prevention
  const now = Date.now();
  if (now - lastPublicStatusCheckTimestamp < STATUS_CHECK_COOLDOWN_MS) {
    return {
      success: false,
      error: "Please wait a moment before querying application status again.",
    };
  }
  lastPublicStatusCheckTimestamp = now;

  // 1. Authoritative PostgreSQL RPC invocation (Security Definer)
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.rpc("get_public_training_status", {
          p_reference: cleanRef,
          p_email: cleanEmail,
        });

        if (!error && data) {
          if (data.success && data.data) {
            return {
              success: true,
              data: data.data,
            };
          }
          return {
            success: false,
            error: data.error || "No matching application located. Please verify your reference ID and the email address used during submission.",
          };
        }
      } catch (err) {
        console.warn("[checkPublicTrainingStatus RPC notice]:", err);
      }
    }
  }

  // 2. Local resilient fallback (strictly checks matching reference AND email)
  const stored = getStoredTrainingApplications();
  const match = stored.find((a) => {
    const refMatch = a.applicationReference.toUpperCase() === cleanRef;
    const emailMatch =
      (a.applicantType === "individual" && a.email?.toLowerCase() === cleanEmail) ||
      (a.applicantType === "organization" && a.businessEmail?.toLowerCase() === cleanEmail);
    return refMatch && emailMatch;
  });

  if (match) {
    let statusMessage = "Application received and queued for review by the Zakeem Admissions Desk.";
    if (match.status === "in_review") {
      statusMessage = "Application is currently under technical review and scheduling alignment.";
    } else if (match.status === "confirmed") {
      statusMessage = "Application officially confirmed! Cohort onboarding and virtual classroom credentials will be dispatched prior to your start date.";
    } else if (match.status === "cancelled") {
      statusMessage = "Application was cancelled. Please contact admissions@zakeemsolutions.com for assistance.";
    }

    return {
      success: true,
      data: {
        reference: match.applicationReference,
        applicantType: match.applicantType,
        applicantDisplayName: match.applicantType === "organization" ? match.organizationName : match.fullName,
        course: match.course,
        preferredStartDate: match.preferredStartDate,
        trainingDays: match.trainingDays,
        sessionDuration: "2 hours per session",
        sessionDurationMinutes: match.sessionDurationMinutes || 120,
        preferredTime: match.preferredTime,
        timezone: match.timezone || "Africa/Lagos",
        status: match.status,
        statusMessage,
        deliveryMode: "Fully Online (Live / Structured)",
        certificateEligible: true,
        submittedAt: match.createdAt,
        reviewedAt: match.reviewedAt || null,
        confirmedAt: match.confirmedAt || null,
        cancelledAt: match.cancelledAt || null,
      },
    };
  }

  return {
    success: false,
    error: "No matching application located. Please verify your reference ID and the email address used during submission.",
  };
}
