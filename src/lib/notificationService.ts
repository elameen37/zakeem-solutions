/**
 * Zakeem Solutions — Outbound Notification Client Service
 * Phase 45: Controlled Commercial Pilot & Notification Architecture
 *
 * Provides client-side orchestration for transactional email and multi-channel
 * notifications. Integrates with the authoritative server-side Edge Function
 * while enforcing zero credential leakage, PII masking, CRLF injection defense,
 * and fail-safe audit telemetry.
 */

import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { recordAuditEvent } from "@/lib/auditTelemetry";
import {
  DeliveryAttempt,
  EmailProviderType,
  NotificationDeliveryStatus,
  NotificationDispatchPayload,
  NotificationDispatchResult,
  NotificationEventType,
  UnifiedNotificationRecord,
} from "@/types/notification";

// -----------------------------------------------------------------------------
// 1. PRIVACY & SANITIZATION UTILITIES (Zero-Leak Masking & Anti-CRLF)
// -----------------------------------------------------------------------------

/**
 * Masks an email address for safe display in administrative logs and UIs.
 * Examples:
 *   "john.doe@enterprise.com" -> "j***e@enterprise.com"
 *   "ab@acme.ng"              -> "a***@acme.ng"
 *   "invalid"                 -> "***@***"
 */
export function maskRecipientEmail(email: string): string {
  if (!email || typeof email !== "string") return "***@***";
  const trimmed = email.trim();
  const atIndex = trimmed.indexOf("@");
  if (atIndex <= 0 || atIndex === trimmed.length - 1) return "***@***";

  const localPart = trimmed.substring(0, atIndex);
  const domainPart = trimmed.substring(atIndex + 1);

  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domainPart}`;
  }

  const firstChar = localPart[0];
  const lastChar = localPart[localPart.length - 1];
  return `${firstChar}***${lastChar}@${domainPart}`;
}

/**
 * Masks a recipient name for safe logging and telemetry display.
 * Examples:
 *   "Alexander Wright" -> "A*** W***"
 *   "John"             -> "J***"
 */
export function maskRecipientName(name: string): string {
  if (!name || typeof name !== "string") return "***";
  const parts = name.trim().split(/\s+/);
  return parts
    .map((p) => (p.length > 0 ? `${p[0]}***` : ""))
    .filter(Boolean)
    .join(" ");
}

/**
 * Strips carriage returns, newlines, and encoded line feeds to prevent
 * email header injection attacks (CWE-93 / CRLF injection).
 */
export function sanitizeEmailHeaderValue(val: string): string {
  if (!val || typeof val !== "string") return "";
  return val
    .replace(/[\r\n]+/g, " ")
    .replace(/%0[ad]/gi, " ")
    .trim();
}

/**
 * Generates a deterministic idempotency key to prevent duplicate dispatches.
 */
export function generateNotificationIdempotencyKey(
  eventType: string,
  referenceId: string,
  customSeed?: string
): string {
  const cleanRef = sanitizeEmailHeaderValue(referenceId).replace(/[^a-zA-Z0-9-_]/g, "");
  const cleanEvent = sanitizeEmailHeaderValue(eventType).replace(/[^a-zA-Z0-9-_]/g, "");
  const suffix = customSeed ? `_${customSeed}` : "";
  return `zk_notif_${cleanEvent}_${cleanRef}${suffix}`;
}

// -----------------------------------------------------------------------------
// 2. OUTBOUND DISPATCH CLIENT BRIDGES
// -----------------------------------------------------------------------------

/**
 * Dispatches a transactional notification via the Supabase Edge Function
 * or client-side fallback with full telemetry tracking.
 */
export async function dispatchNotification(
  payload: NotificationDispatchPayload
): Promise<NotificationDispatchResult> {
  const startTime = Date.now();
  const maskedEmail = maskRecipientEmail(payload.recipientEmail);
  const maskedName = maskRecipientName(payload.recipientName);
  const sanitizedSubject = sanitizeEmailHeaderValue(payload.subject);

  // 1. Telemetry: Record initial dispatch request
  recordAuditEvent({
    eventType: "notification.queued",
    entityType: "notification",
    entityId: payload.referenceId || payload.bookingId || null,
    metadata: {
      eventType: payload.eventType,
      recipient: maskedEmail,
      recipientName: maskedName,
      subject: sanitizedSubject,
      idempotencyKey: payload.idempotencyKey,
      bookingId: payload.bookingId || null,
      invitationId: payload.invitationId || null,
    },
  });

  const attempts: DeliveryAttempt[] = [];

  // 2. Attempt Edge Function invocation via Supabase client
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client && client.functions) {
      try {
        const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();
        const session = client.auth ? (await client.auth.getSession()).data.session : null;
        const authHeader = session?.access_token ? `Bearer ${session.access_token}` : `Bearer ${anonKey}`;

        const { data, error } = await client.functions.invoke("dispatch-notification", {
          headers: {
            apikey: anonKey,
            Authorization: authHeader,
          },
          body: {
            ...payload,
            subject: sanitizedSubject,
          },
        });

        const latencyMs = Date.now() - startTime;

        if (!error && data && data.success) {
          const attempt: DeliveryAttempt = {
            attemptNumber: 1,
            timestamp: new Date().toISOString(),
            provider: (data.provider as EmailProviderType) || "resend",
            status: "success",
            statusCode: 200,
            latencyMs,
          };
          attempts.push(attempt);

          recordAuditEvent({
            eventType: "notification.sent",
            entityType: "notification",
            entityId: payload.referenceId || payload.bookingId || null,
            metadata: {
              eventType: payload.eventType,
              recipient: maskedEmail,
              provider: attempt.provider,
              latencyMs,
              messageId: data.providerMessageId || null,
            },
          });

          return {
            success: true,
            notificationId: data.notificationId || payload.referenceId,
            provider: attempt.provider,
            providerMessageId: data.providerMessageId,
            status: "delivered",
            attempts,
            deliveredAt: new Date().toISOString(),
          };
        }

        // Edge function returned an operational or provider error
        const attempt: DeliveryAttempt = {
          attemptNumber: 1,
          timestamp: new Date().toISOString(),
          provider: (data?.provider as EmailProviderType) || "mock",
          status: "failure",
          statusCode: error ? 500 : 400,
          error: error ? error.message : (data?.error || "Edge Function dispatch failed"),
          latencyMs,
        };
        attempts.push(attempt);

      } catch (err: unknown) {
        const latencyMs = Date.now() - startTime;
        const errMsg = err instanceof Error ? err.message : "Edge function network failure";
        attempts.push({
          attemptNumber: 1,
          timestamp: new Date().toISOString(),
          provider: "mock",
          status: "failure",
          statusCode: 503,
          error: errMsg,
          latencyMs,
        });
      }
    }
  }

  // 3. Truthful Status Reporting (Zero False Success Claims)
  // When Edge Function is unavailable or provider credentials are missing, fail truthfully.
  const lastAttempt = attempts[attempts.length - 1];
  const errorMessage = lastAttempt?.error || (isSupabaseConfigured() ? "PROVIDER CREDENTIALS NOT CONFIGURED: Edge Function dispatch failed or provider returned error" : "PROVIDER CREDENTIALS NOT CONFIGURED: Supabase client unconfigured in this runtime");
  const finalProvider = (lastAttempt?.provider as EmailProviderType) || "mock";
  const totalLatency = Date.now() - startTime;

  if (attempts.length === 0) {
    attempts.push({
      attemptNumber: 1,
      timestamp: new Date().toISOString(),
      provider: "mock",
      status: "failure",
      statusCode: 503,
      error: errorMessage,
      latencyMs: totalLatency,
    });
  }

  recordAuditEvent({
    eventType: "notification.failed",
    entityType: "notification",
    entityId: payload.referenceId || payload.bookingId || null,
    metadata: {
      eventType: payload.eventType,
      recipient: maskedEmail,
      provider: finalProvider,
      isFallback: true,
      error: errorMessage,
      latencyMs: totalLatency,
    },
    errorCategory: lastAttempt?.statusCode === 503 ? "NETWORK" : "CONFIGURATION",
  });

  return {
    success: false,
    notificationId: payload.referenceId,
    provider: finalProvider,
    status: "failed",
    error: errorMessage,
    attempts,
  };
}

/**
 * Dispatches an automated onboarding invitation email to an enterprise client.
 */
export async function dispatchInvitationNotification(payload: {
  email: string;
  fullName: string;
  organization: string;
  inviteToken: string;
  expiresAt: string;
  leadId?: string;
}): Promise<NotificationDispatchResult> {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.zakeemsolutions.com";
  const activationUrl = `${origin}/accept-invite?token=${encodeURIComponent(payload.inviteToken)}`;
  const maskedEmail = maskRecipientEmail(payload.email);
  const maskedName = maskRecipientName(payload.fullName);

  recordAuditEvent({
    eventType: "invitation.delivery_requested",
    entityType: "invitation",
    entityId: payload.inviteToken.substring(0, 8),
    metadata: {
      recipient: maskedEmail,
      organization: payload.organization,
      expiresAt: payload.expiresAt,
    },
  });

  const subject = `Your Zakeem Solutions Enterprise Invitation — ${sanitizeEmailHeaderValue(payload.organization)}`;
  const idempotencyKey = generateNotificationIdempotencyKey(
    "client_invitation_created",
    payload.inviteToken.substring(0, 16)
  );

  const dispatchPayload: NotificationDispatchPayload = {
    eventType: "client_invitation_created",
    recipientEmail: payload.email,
    recipientName: payload.fullName,
    subject,
    templateId: "client_invitation",
    templateData: {
      fullName: payload.fullName,
      organization: payload.organization,
      activationUrl,
      expiresAt: payload.expiresAt,
    },
    idempotencyKey,
    leadId: payload.leadId,
  };

  const result = await dispatchNotification(dispatchPayload);

  recordAuditEvent({
    eventType: result.success ? "invitation.delivery_sent" : "invitation.delivery_failed",
    entityType: "invitation",
    entityId: payload.inviteToken.substring(0, 8),
    metadata: {
      recipient: maskedEmail,
      organization: payload.organization,
      provider: result.provider,
      status: result.status,
      error: result.error,
    },
    errorCategory: result.success ? undefined : "NETWORK",
  });

  return result;
}

/**
 * Retries a failed transactional notification with exponential backoff awareness.
 */
export async function retryNotificationDispatch(
  notification: UnifiedNotificationRecord | {
    id: string;
    bookingId?: string;
    referenceId: string;
    eventType: NotificationEventType;
    recipientEmail: string;
    recipientName: string;
    payload?: Record<string, unknown>;
  }
): Promise<NotificationDispatchResult> {
  recordAuditEvent({
    eventType: "notification.retrying",
    entityType: "notification",
    entityId: notification.referenceId || notification.id,
    metadata: {
      notificationId: notification.id,
      eventType: notification.eventType,
      recipient: maskRecipientEmail(notification.recipientEmail),
    },
  });

  const subject = `Resent: Update regarding reference ${sanitizeEmailHeaderValue(notification.referenceId)}`;
  const idempotencyKey = generateNotificationIdempotencyKey(
    notification.eventType,
    notification.referenceId,
    `retry_${Date.now()}`
  );

  const dispatchPayload: NotificationDispatchPayload = {
    eventType: notification.eventType,
    recipientEmail: notification.recipientEmail,
    recipientName: notification.recipientName,
    subject,
    templateData: notification.payload || {},
    referenceId: notification.referenceId,
    bookingId: notification.bookingId,
    idempotencyKey,
  };

  return dispatchNotification(dispatchPayload);
}

export interface DispatchBookingNotificationParams {
  bookingId: string;
  referenceId: string;
  eventType: "booking_confirmed" | "booking_cancelled" | "booking_rescheduled";
  recipientEmail: string;
  recipientName: string;
  product?: string;
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  cancellationReason?: string;
}

/**
 * Dispatches an automated booking lifecycle notification (confirmation, cancellation, or reschedule).
 */
export async function dispatchBookingNotification(
  params: DispatchBookingNotificationParams
): Promise<NotificationDispatchResult> {
  const maskedEmail = maskRecipientEmail(params.recipientEmail);
  const cleanRef = sanitizeEmailHeaderValue(params.referenceId);
  const cleanReason = sanitizeEmailHeaderValue(params.cancellationReason || "Operational adjustment");

  let subject = `Confirmed: Enterprise Consultation (${cleanRef}) — Zakeem Solutions`;
  let message = `Thank you for scheduling with Zakeem Solutions. Your enterprise architecture consultation has been reserved for ${params.bookingDate || "the scheduled date"} at ${params.startTime || "the scheduled time"} (${params.timezone || "Africa/Lagos WAT"}). Topic: ${params.product || "Enterprise Consultation"}.`;
  if (params.eventType === "booking_cancelled") {
    subject = `Cancelled: Enterprise Consultation (${cleanRef}) — Zakeem Solutions`;
    message = `Your scheduled consultation with reference ${cleanRef} has been cancelled. Reason: ${cleanReason}. If you wish to reschedule, our advisory desk remains at your disposal.`;
  } else if (params.eventType === "booking_rescheduled") {
    subject = `Rescheduled: Enterprise Consultation (${cleanRef}) — Zakeem Solutions`;
    message = `Your enterprise architecture consultation (${cleanRef}) has been rescheduled to ${params.bookingDate || "the updated date"} at ${params.startTime || "the updated time"} (${params.timezone || "Africa/Lagos WAT"}). Topic: ${params.product || "Enterprise Consultation"}.`;
  }

  const idempotencyKey = generateNotificationIdempotencyKey(
    params.eventType,
    params.referenceId,
    String(Date.now())
  );

  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.zakeemsolutions.com";
  const rescheduleUrl = `${origin}/request-demo?reschedule=${encodeURIComponent(cleanRef)}`;

  const templateData: Record<string, unknown> = {
    referenceId: params.referenceId,
    product: params.product || "Enterprise Consultation",
    bookingDate: params.bookingDate || "",
    startTime: params.startTime || "",
    endTime: params.endTime || "",
    timezone: params.timezone || "Africa/Lagos (WAT)",
    cancellationReason: cleanReason,
    rescheduleUrl: params.eventType === "booking_cancelled" ? rescheduleUrl : undefined,
    subject,
    message,
  };

  const dispatchPayload: NotificationDispatchPayload = {
    eventType: params.eventType,
    recipientEmail: params.recipientEmail,
    recipientName: params.recipientName,
    subject,
    templateData,
    referenceId: params.referenceId,
    bookingId: params.bookingId,
    idempotencyKey,
  };

  const result = await dispatchNotification(dispatchPayload);

  if (!result.success) {
    recordAuditEvent({
      eventType: "booking.notification_failed",
      entityType: "booking",
      entityId: params.bookingId,
      metadata: {
        eventType: params.eventType,
        recipient: maskedEmail,
        referenceId: cleanRef,
        provider: result.provider,
        status: result.status,
        error: result.error,
      },
      errorCategory: "NETWORK",
    });
  }

  return result;
}

export interface DispatchLeadWelcomeNotificationParams {
  leadId: string;
  recipientEmail: string;
  recipientName: string;
  company: string;
  product?: string;
  formType?: string;
}

/**
 * Dispatches an automated commercial welcome / acknowledgment notification to an inbound CRM lead.
 */
export async function dispatchLeadWelcomeNotification(
  params: DispatchLeadWelcomeNotificationParams
): Promise<NotificationDispatchResult> {
  const maskedEmail = maskRecipientEmail(params.recipientEmail);
  const cleanCompany = sanitizeEmailHeaderValue(params.company);
  const cleanProduct = sanitizeEmailHeaderValue(params.product || "Enterprise Platform");
  const cleanFormType = sanitizeEmailHeaderValue(params.formType || "Inquiry");

  const subject = `Welcome to Zakeem Solutions — Inbound Inquiry (${cleanCompany})`;
  const message = `Thank you for contacting Zakeem Solutions Limited regarding ${cleanProduct}. Our solutions architecture and client advisory team has received your inquiry for ${cleanCompany} and is preparing an initial technical brief. An enterprise consultant will contact you shortly.`;

  const idempotencyKey = generateNotificationIdempotencyKey(
    "lead_welcome",
    params.leadId,
    String(Date.now())
  );

  const templateData: Record<string, unknown> = {
    company: cleanCompany,
    product: cleanProduct,
    formType: cleanFormType,
    subject,
    message,
  };

  const dispatchPayload: NotificationDispatchPayload = {
    eventType: "commercial_pilot_welcome",
    recipientEmail: params.recipientEmail,
    recipientName: params.recipientName,
    subject,
    templateData,
    referenceId: params.leadId,
    leadId: params.leadId,
    idempotencyKey,
  };

  return dispatchNotification(dispatchPayload);
}

export interface DispatchTrainingNotificationsParams {
  applicationReference: string;
  applicantType: "individual" | "organization";
  fullName?: string;
  email?: string;
  organizationName?: string;
  businessEmail?: string;
  course: string;
  customTrainingRequest?: string;
  preferredStartDate: string;
  trainingDays: string[];
  sessionDurationMinutes?: number;
  preferredTime: string;
  timezone?: string;
  submittedAt?: string;
}

/**
 * Dispatches internal admissions notification and applicant confirmation for Zakeem IT Training.
 * Uses deterministic idempotency keys to prevent duplicate sends on retries.
 */
export async function dispatchTrainingApplicationNotifications(
  params: DispatchTrainingNotificationsParams
): Promise<{
  internalResult: NotificationDispatchResult;
  applicantResult: NotificationDispatchResult;
}> {
  const isOrg = params.applicantType === "organization";
  const applicantEmail = sanitizeEmailHeaderValue(
    (isOrg ? params.businessEmail : params.email) || ""
  );
  const applicantName = sanitizeEmailHeaderValue(
    (isOrg ? params.organizationName : params.fullName) || "Candidate"
  );
  const internalRecipient = "info@zakeemsolutions.com";
  const cleanRef = sanitizeEmailHeaderValue(params.applicationReference);
  const duration = params.sessionDurationMinutes || 120;
  const timezone = params.timezone || "Africa/Lagos";
  const submittedAt = params.submittedAt || new Date().toISOString();

  // 1. Dispatch Internal Notification to info@zakeemsolutions.com
  const internalSubject = `New Zakeem IT Training Application — ${cleanRef}`;
  const internalIdempotencyKey = generateNotificationIdempotencyKey(
    "training_internal",
    cleanRef
  );

  const internalPayload: NotificationDispatchPayload = {
    eventType: "it_training_internal_notification",
    recipientEmail: internalRecipient,
    recipientName: "Zakeem Admissions Desk",
    subject: internalSubject,
    templateData: {
      applicationReference: cleanRef,
      applicantType: params.applicantType,
      fullName: params.fullName ? sanitizeEmailHeaderValue(params.fullName) : undefined,
      email: params.email ? sanitizeEmailHeaderValue(params.email) : undefined,
      organizationName: params.organizationName ? sanitizeEmailHeaderValue(params.organizationName) : undefined,
      businessEmail: params.businessEmail ? sanitizeEmailHeaderValue(params.businessEmail) : undefined,
      course: sanitizeEmailHeaderValue(params.course),
      customTrainingRequest: params.customTrainingRequest ? sanitizeEmailHeaderValue(params.customTrainingRequest) : undefined,
      preferredStartDate: sanitizeEmailHeaderValue(params.preferredStartDate),
      trainingDays: params.trainingDays,
      sessionDurationMinutes: duration,
      preferredTime: sanitizeEmailHeaderValue(params.preferredTime),
      timezone,
      submittedAt,
    },
    referenceId: cleanRef,
    idempotencyKey: internalIdempotencyKey,
  };

  const internalResult = await dispatchNotification(internalPayload);

  // 2. Dispatch Confirmation Email to Applicant
  let applicantResult: NotificationDispatchResult;
  if (applicantEmail) {
    const applicantSubject = `Zakeem IT Training Application Received — ${cleanRef}`;
    const applicantIdempotencyKey = generateNotificationIdempotencyKey(
      "training_applicant",
      cleanRef
    );

    const origin = typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://www.zakeemsolutions.com";
    const statusUrl = `${origin}/training/status?ref=${encodeURIComponent(cleanRef)}&email=${encodeURIComponent(applicantEmail)}`;

    const applicantPayload: NotificationDispatchPayload = {
      eventType: "it_training_applicant_confirmation",
      recipientEmail: applicantEmail,
      recipientName: applicantName,
      subject: applicantSubject,
      templateData: {
        applicationReference: cleanRef,
        applicantType: params.applicantType,
        course: sanitizeEmailHeaderValue(params.course),
        preferredStartDate: sanitizeEmailHeaderValue(params.preferredStartDate),
        trainingDays: params.trainingDays,
        sessionDurationMinutes: duration,
        preferredTime: sanitizeEmailHeaderValue(params.preferredTime),
        timezone,
        statusUrl,
        origin,
        status: "submitted",
      },
      referenceId: cleanRef,
      idempotencyKey: applicantIdempotencyKey,
    };

    applicantResult = await dispatchNotification(applicantPayload);
  } else {
    applicantResult = {
      success: false,
      notificationId: cleanRef,
      status: "failed",
      error: "Missing applicant email address",
      attempts: [],
    };
  }

  return { internalResult, applicantResult };
}


