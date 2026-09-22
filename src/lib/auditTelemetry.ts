/**
 * Zakeem Solutions — Production Audit Telemetry & Operational Observability
 * 
 * Strict Production Constraints:
 * 1. ZERO sensitive credential or token persistence (passwords, JWTs, reset tokens, keys).
 * 2. Non-blocking & fail-safe: Telemetry failures never interrupt business transactions.
 * 3. Authoritative server audit preservation: Does not duplicate server-side RPC logging.
 * 4. Zero public database pollution: Public events are isolated; no unauthenticated DB inserts.
 */

// -----------------------------------------------------------------------------
// 1. TYPED AUDIT EVENT TAXONOMY
// -----------------------------------------------------------------------------

export type AuthAuditEventType =
  | "auth.login.success"
  | "auth.login.failure"
  | "auth.admin_login.success"
  | "auth.admin_login.failure"
  | "auth.invitation.accepted"
  | "auth.password_reset.requested"
  | "auth.password_reset.completed"
  | "auth.signout";

export type CRMAuditEventType =
  | "crm.lead.created"
  | "crm.lead.status_changed"
  | "crm.lead.converted"
  | "crm.opportunity.created"
  | "crm.opportunity.stage_changed"
  | "crm.opportunity.owner_changed"
  | "crm.activity.created"
  | "crm.activity.completed";

export type SchedulingAuditEventType =
  | "booking.created"
  | "booking.conflict"
  | "booking.cancelled"
  | "booking.rescheduled"
  | "booking.lifecycle_changed"
  | "booking.notification_failed";

export type PlatformAuditEventType =
  | "maintenance.enabled"
  | "maintenance.disabled"
  | "application.unexpected_error";

export type NotificationAuditEventType =
  | "notification.queued"
  | "notification.sent"
  | "notification.failed"
  | "notification.retrying"
  | "invitation.delivery_requested"
  | "invitation.delivery_sent"
  | "invitation.delivery_failed";

export type AuditEventType =
  | AuthAuditEventType
  | CRMAuditEventType
  | SchedulingAuditEventType
  | PlatformAuditEventType
  | NotificationAuditEventType;

export type ErrorCategory =
  | "AUTHENTICATION"
  | "AUTHORIZATION"
  | "VALIDATION"
  | "NETWORK"
  | "CONFLICT"
  | "NOT_FOUND"
  | "SERVER"
  | "UNEXPECTED";

export type AuditEntityType =
  | "user"
  | "lead"
  | "opportunity"
  | "booking"
  | "organization"
  | "contact"
  | "activity"
  | "invitation"
  | "notification"
  | "system"
  | "application";

export interface AuditEventPayload {
  eventType: AuditEventType;
  entityType: AuditEntityType;
  entityId?: string | null;
  actorId?: string | null;
  actorRole?: "admin" | "client" | "anonymous" | "system";
  metadata?: Record<string, unknown>;
  errorCategory?: ErrorCategory;
}

export interface SanitizedAuditEvent {
  id: string;
  eventType: AuditEventType;
  entityType: AuditEntityType;
  entityId: string | null;
  actorId: string | null;
  actorRole: "admin" | "client" | "anonymous" | "system";
  errorCategory?: ErrorCategory;
  metadata: Record<string, unknown>;
  occurredAt: string;
}

// -----------------------------------------------------------------------------
// 2. SENSITIVE METADATA SANITIZATION ENGINE
// -----------------------------------------------------------------------------

const SENSITIVE_KEY_PATTERN =
  /^(password|pass|pwd|confirm_password|confirmpassword|token|access_token|refresh_token|jwt|secret|apikey|api_key|service_role|auth_header|authorization|cookie|credentials|raw_error|stack|sql|query)$/i;

const JWT_PATTERN = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;

/**
 * Recursively scrubs sensitive credentials, tokens, stack traces, and raw SQL.
 * Maximum recursion depth of 3 levels prevents circular structure issues.
 */
export function sanitizeMetadata(
  input?: Record<string, unknown> | null,
  depth = 0
): Record<string, unknown> {
  if (!input || typeof input !== "object" || depth > 3) {
    return {};
  }

  const clean: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    // 1. Scrub keys matching forbidden sensitive patterns
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      continue;
    }

    if (value === null || value === undefined) {
      continue;
    }

    // 2. Handle primitive types safely
    if (typeof value === "string") {
      // Scrub tokens or suspected JWT strings
      if (value.length > 30 && JWT_PATTERN.test(value)) {
        clean[key] = "[REDACTED_TOKEN]";
        continue;
      }
      // Scrub raw stack trace indicators
      if (value.includes("at ") && (value.includes(".ts:") || value.includes(".js:") || value.includes(".tsx:"))) {
        clean[key] = "[REDACTED_STACK_TRACE]";
        continue;
      }
      // Scrub raw SQL syntax
      if (/\b(select\s|insert\s+into|update\s|delete\s+from|drop\s+table)\b/i.test(value)) {
        clean[key] = "[REDACTED_SQL]";
        continue;
      }
      // Truncate long strings to prevent log inflation
      clean[key] = value.length > 500 ? value.substring(0, 500) + "..." : value;
    } else if (typeof value === "number" || typeof value === "boolean") {
      clean[key] = value;
    } else if (value instanceof Date) {
      clean[key] = value.toISOString();
    } else if (Array.isArray(value)) {
      clean[key] = value
        .slice(0, 20)
        .map((item) =>
          typeof item === "object" && item !== null
            ? sanitizeMetadata(item as Record<string, unknown>, depth + 1)
            : typeof item === "string" && item.length > 200
            ? item.substring(0, 200) + "..."
            : item
        );
    } else if (typeof value === "object") {
      clean[key] = sanitizeMetadata(value as Record<string, unknown>, depth + 1);
    }
  }

  return clean;
}

// -----------------------------------------------------------------------------
// 3. IN-MEMORY RING BUFFER & DISPATCH LOGIC
// -----------------------------------------------------------------------------

const MAX_IN_MEMORY_EVENTS = 50;
const inMemoryAuditBuffer: SanitizedAuditEvent[] = [];

/**
 * Returns a copy of recent in-memory audit events for administrative inspection.
 */
export function getRecentAuditEvents(): SanitizedAuditEvent[] {
  return [...inMemoryAuditBuffer];
}

/**
 * Clears the in-memory audit buffer (primarily for unit test isolation).
 */
export function clearAuditBuffer(): void {
  inMemoryAuditBuffer.length = 0;
}

/**
 * Categorizes an error message into the standardized error taxonomy.
 */
export function categorizeError(error: unknown): ErrorCategory {
  if (!error) return "UNEXPECTED";

  const message = (
    typeof error === "string"
      ? error
      : error instanceof Error
      ? error.message
      : String(error)
  ).toLowerCase();

  if (
    message.includes("invalid login") ||
    message.includes("invalid credentials") ||
    message.includes("session expired") ||
    message.includes("jwt") ||
    message.includes("unauthenticated")
  ) {
    return "AUTHENTICATION";
  }

  if (
    message.includes("access denied") ||
    message.includes("unauthorized") ||
    message.includes("administrative authorization required") ||
    message.includes("42501") ||
    message.includes("forbidden")
  ) {
    return "AUTHORIZATION";
  }

  if (
    message.includes("required") ||
    message.includes("invalid email") ||
    message.includes("password must be") ||
    message.includes("validation")
  ) {
    return "VALIDATION";
  }

  if (
    message.includes("network") ||
    message.includes("fetch failed") ||
    message.includes("failed to fetch") ||
    message.includes("timeout") ||
    message.includes("offline")
  ) {
    return "NETWORK";
  }

  if (
    message.includes("no longer available") ||
    message.includes("conflict") ||
    message.includes("overlap") ||
    message.includes("already taken") ||
    message.includes("23505")
  ) {
    return "CONFLICT";
  }

  if (message.includes("not found") || message.includes("404")) {
    return "NOT_FOUND";
  }

  if (
    message.includes("500") ||
    message.includes("internal server") ||
    message.includes("database client is unavailable")
  ) {
    return "SERVER";
  }

  return "UNEXPECTED";
}

/**
 * Centralized Audit Telemetry Logger.
 * 
 * Guarantees:
 * - Always non-blocking (business operation always takes precedence).
 * - Never throws or bubbles exceptions to the caller.
 * - Deeply sanitizes all metadata payloads.
 * - Dispatches 'zakeem:audit-event' custom DOM event for reactive observability.
 */
export function recordAuditEvent(payload: AuditEventPayload): SanitizedAuditEvent {
  try {
    const sanitizedMetadata = sanitizeMetadata(payload.metadata);

    const event: SanitizedAuditEvent = {
      id: "aud_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
      eventType: payload.eventType,
      entityType: payload.entityType,
      entityId: payload.entityId || null,
      actorId: payload.actorId || null,
      actorRole: payload.actorRole || "anonymous",
      errorCategory: payload.errorCategory,
      metadata: sanitizedMetadata,
      occurredAt: new Date().toISOString(),
    };

    // 1. Maintain in-memory ring buffer
    inMemoryAuditBuffer.unshift(event);
    if (inMemoryAuditBuffer.length > MAX_IN_MEMORY_EVENTS) {
      inMemoryAuditBuffer.pop();
    }

    // 2. Dispatch DOM event for reactive telemetry subscribers
    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(
          new CustomEvent("zakeem:audit-event", {
            bubbles: true,
            detail: event,
          })
        );
      } catch {
        // Non-blocking browser event dispatch
      }
    }

    // 3. Dev-mode diagnostic logging
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info(`[Audit Telemetry: ${event.eventType}]`, {
        entity: `${event.entityType}:${event.entityId || "none"}`,
        actor: `${event.actorRole}:${event.actorId || "anonymous"}`,
        category: event.errorCategory || "OK",
        metadata: sanitizedMetadata,
      });
    }

    return event;
  } catch (telemetryError) {
    // Fail-safe guarantee: Telemetry error never interrupts business execution
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn("[Audit Telemetry Error]:", telemetryError);
    }

    return {
      id: "aud_fallback",
      eventType: payload.eventType,
      entityType: payload.entityType,
      entityId: null,
      actorId: null,
      actorRole: "anonymous",
      metadata: {},
      occurredAt: new Date().toISOString(),
    };
  }
}
