/**
 * Zakeem Solutions — Scheduling Service & Persistence
 * Phase 17: Supabase Integration with Local State Persistence Fallback
 */

import {
  AvailabilityException,
  AvailabilityRule,
  Booking,
  BookingAuditLog,
  BookingNotification,
  BookingRequest,
  BookingResponse,
  BookingStatus,
  RescheduleRequest,
  RescheduleResponse,
  ScheduleSettings,
  TimeSlot,
  VALID_STATUS_TRANSITIONS,
} from "@/types/scheduling";
import {
  computeAvailableSlots,
  DEFAULT_AVAILABILITY_RULES,
  DEFAULT_SCHEDULE_SETTINGS,
  generateBookingReferenceId,
} from "./schedulingEngine";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";
import { recordAuditEvent } from "./auditTelemetry";

export { isSupabaseConfigured };

const STORAGE_KEYS = {
  SETTINGS: "zakeem_schedule_settings",
  RULES: "zakeem_availability_rules",
  EXCEPTIONS: "zakeem_availability_exceptions",
  BOOKINGS: "zakeem_bookings",
  AUDIT_LOGS: "zakeem_booking_audit_logs",
  NOTIFICATIONS: "zakeem_booking_notifications",
};

// -----------------------------------------------------------------------------
// LOCAL STATE STORAGE (Used when Supabase credentials are not yet linked)
// -----------------------------------------------------------------------------

function getStoredSettings(): ScheduleSettings {
  if (typeof window === "undefined") return DEFAULT_SCHEDULE_SETTINGS;
  const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback on corrupt storage
    }
  }
  return DEFAULT_SCHEDULE_SETTINGS;
}

function getStoredRules(): AvailabilityRule[] {
  if (typeof window === "undefined") return DEFAULT_AVAILABILITY_RULES;
  const saved = localStorage.getItem(STORAGE_KEYS.RULES);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  return DEFAULT_AVAILABILITY_RULES;
}

function getStoredExceptions(): AvailabilityException[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(STORAGE_KEYS.EXCEPTIONS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  return [];
}

function getStoredBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  return [];
}

function saveStoredBookings(bookings: Booking[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }
}

function getStoredAuditLogs(): BookingAuditLog[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  return [];
}

function recordStoredAuditLog(log: BookingAuditLog): void {
  if (typeof window !== "undefined") {
    const current = getStoredAuditLogs();
    current.unshift(log);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(current));
  }
}

function getStoredNotifications(): BookingNotification[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  return [];
}

function recordStoredNotification(notification: BookingNotification): void {
  if (typeof window !== "undefined") {
    const current = getStoredNotifications();
    current.unshift(notification);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(current));
  }
}


// -----------------------------------------------------------------------------
// PUBLIC AVAILABILITY API
// -----------------------------------------------------------------------------

/**
 * Loads available appointment time slots for a specified date.
 * Enforces data minimization: never returns customer names or emails.
 */
export async function getPublicAvailableSlots(dateStr: string): Promise<TimeSlot[]> {
  // If Supabase is connected, invoke the server-side RPC get_public_availability
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.rpc("get_public_availability", {
          p_date_from: dateStr,
          p_date_to: dateStr,
        });

        if (error) {
          // In production mode, if the database returns an error, do not silently fallback to localStorage
          // eslint-disable-next-line no-console
          console.error("[Scheduling Service] Supabase RPC get_public_availability returned error:", error.message);
          return [];
        }

        if (data && Array.isArray(data)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return data.map((d: any) => ({
            slotDate: d.slot_date,
            startTime: typeof d.start_time === "string" ? d.start_time.slice(0, 5) : "",
            endTime: typeof d.end_time === "string" ? d.end_time.slice(0, 5) : "",
            displayTime: typeof d.start_time === "string" ? d.start_time.slice(0, 5) : "",
            displayEndTime: typeof d.end_time === "string" ? d.end_time.slice(0, 5) : "",
            isAvailable: Boolean(d.is_available),
          }));
        }

        return [];
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[Scheduling Service] Supabase RPC get_public_availability failed:", err);
        return [];
      }
    }
  }

  // Local calculation fallback using identical scheduling engine rules (ONLY when Supabase credentials are not configured)
  const settings = getStoredSettings();
  const rules = getStoredRules();
  const exceptions = getStoredExceptions();
  const bookings = getStoredBookings();

  return computeAvailableSlots(dateStr, bookings, settings, rules, exceptions);
}

// -----------------------------------------------------------------------------
// ATOMIC BOOKING SUBMISSION (DOUBLE-BOOKING PROTECTED)
// -----------------------------------------------------------------------------

/**
 * Creates an appointment reservation atomically.
 * Protects against race conditions and concurrent bookings.
 */
export async function createBookingReservation(
  request: BookingRequest
): Promise<BookingResponse> {
  const referenceId = request.referenceId || generateBookingReferenceId(request.bookingDate);

  // If Supabase is configured, execute the atomic PostgreSQL function create_booking_atomic
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.rpc("create_booking_atomic", {
          p_reference_id: referenceId,
          p_lead_id: request.leadId || null,
          p_full_name: request.fullName,
          p_email: request.email,
          p_organization: request.organization,
          p_phone: request.phone || null,
          p_job_title: request.jobTitle || null,
          p_product: request.product,
          p_tier: request.tier || null,
          p_suite: request.suite || null,
          p_deployment: request.deployment || "cloud",
          p_booking_date: request.bookingDate,
          p_start_time: request.startTime,
          p_end_time: request.endTime,
          p_notes: request.notes || null,
        });

        if (error) {
          const message = error.message || "";
          const isRace =
            message.toLowerCase().includes("no longer available") ||
            message.toLowerCase().includes("conflict") ||
            message.toLowerCase().includes("overlap");

          if (isRace) {
            recordAuditEvent({
              eventType: "booking.conflict",
              entityType: "booking",
              errorCategory: "CONFLICT",
              metadata: {
                product: request.product,
                bookingDate: request.bookingDate,
                startTime: request.startTime,
              },
            });
          }

          return {
            success: false,
            isRaceCollision: isRace,
            error: isRace
              ? "This time was just taken. Please select another available time."
              : "Booking could not be finalized. Please try another slot or contact our advisory desk.",
          };
        }

        if (data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = data as any;

          recordAuditEvent({
            eventType: "booking.created",
            entityType: "booking",
            entityId: result.booking_id,
            metadata: {
              referenceId: result.reference_id,
              product: request.product,
              deployment: request.deployment,
            },
          });

          const newBooking: Booking = {
            id: result.booking_id,
            referenceId: result.reference_id,
            leadId: request.leadId,
            fullName: request.fullName,
            email: request.email,
            organization: request.organization,
            phone: request.phone,
            jobTitle: request.jobTitle,
            product: request.product,
            tier: request.tier,
            suite: request.suite,
            deployment: request.deployment,
            bookingDate: request.bookingDate,
            startTime: request.startTime,
            endTime: request.endTime,
            timezone: "Africa/Lagos",
            status: "confirmed",
            notes: request.notes,
            organizationId: result.organization_id,
            contactId: result.contact_id,
            opportunityId: result.opportunity_id,
            createdAt: new Date().toISOString(),
          };
          return { success: true, booking: newBooking };
        }

        return {
          success: false,
          error: "No response received from booking server.",
        };
      } catch (err) {
        // In production mode, do NOT fall through to localStorage on network or server error
        // eslint-disable-next-line no-console
        console.error("[Scheduling Service] Remote Supabase booking transaction failed:", err);
        return {
          success: false,
          error: "Unable to connect to reservation database. Please check connection and try again.",
        };
      }
    }
  }

  // Atomic local transaction simulation (strictly active when Supabase credentials are NOT configured)
  const currentBookings = getStoredBookings();

  // Collision check (double-booking protection)
  const isSlotTaken = currentBookings.some(
    (b) =>
      b.bookingDate === request.bookingDate &&
      b.status !== "cancelled" &&
      b.startTime === request.startTime
  );

  if (isSlotTaken) {
    return {
      success: false,
      isRaceCollision: true,
      error: "This time was just taken. Please select another available time.",
    };
  }

  const newBooking: Booking = {
    id: `local-book-${Date.now()}`,
    referenceId,
    leadId: request.leadId,
    fullName: request.fullName,
    email: request.email,
    organization: request.organization,
    phone: request.phone,
    jobTitle: request.jobTitle,
    product: request.product,
    tier: request.tier,
    suite: request.suite,
    deployment: request.deployment,
    bookingDate: request.bookingDate,
    startTime: request.startTime,
    endTime: request.endTime,
    timezone: "Africa/Lagos",
    status: "confirmed",
    notes: request.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  currentBookings.push(newBooking);
  saveStoredBookings(currentBookings);

  return { success: true, booking: newBooking };
}

// -----------------------------------------------------------------------------
// ADMIN SCHEDULING DESK OPERATIONS
// -----------------------------------------------------------------------------

export async function getAdminBookings(): Promise<Booking[]> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      const { data, error } = await client
        .from("bookings")
        .select("*")
        .order("booking_date", { ascending: false });

      if (error) {
        // eslint-disable-next-line no-console
        console.error("[Scheduling Service] Admin bookings fetch error:", error.message);
        return [];
      }

      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.map((b: any) => ({
          id: b.id,
          referenceId: b.reference_id,
          leadId: b.lead_id,
          fullName: b.full_name,
          email: b.email,
          organization: b.organization,
          phone: b.phone,
          jobTitle: b.job_title,
          product: b.product,
          tier: b.tier,
          suite: b.suite,
          deployment: b.deployment,
          bookingDate: b.booking_date,
          startTime: typeof b.start_time === "string" ? b.start_time.slice(0, 5) : "",
          endTime: typeof b.end_time === "string" ? b.end_time.slice(0, 5) : "",
          timezone: b.timezone,
          status: b.status,
          notes: b.notes,
          internalNotes: b.internal_notes || undefined,
          rescheduledFromId: b.rescheduled_from_id || undefined,
          rescheduledAt: b.rescheduled_at || undefined,
          rescheduleCount: b.reschedule_count || 0,
          cancellationReason: b.cancellation_reason,
          cancelledAt: b.cancelled_at,
          createdAt: b.created_at,
          updatedAt: b.updated_at,
        }));
      }
      return [];
    }
  }

  return getStoredBookings().sort((a, b) => {
    return `${b.bookingDate} ${b.startTime}`.localeCompare(`${a.bookingDate} ${a.startTime}`);
  });
}

/**
 * Updates booking lifecycle status atomically with audit logging and notification queueing.
 */
export async function updateAdminBookingStatus(
  bookingId: string,
  newStatus: BookingStatus,
  reason?: string,
  actor: string = "admin"
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      const { error } = await client.rpc("update_booking_status_atomic", {
        p_booking_id: bookingId,
        p_new_status: newStatus,
        p_reason: reason || null,
        p_actor: actor,
      });

      if (error) {
        // eslint-disable-next-line no-console
        console.error("[Scheduling Service] Admin update booking status error:", error.message);
        const isAuthError =
          error.code === "42501" ||
          error.message?.toLowerCase().includes("access denied") ||
          error.message?.toLowerCase().includes("administrative authorization");
        return {
          success: false,
          error: isAuthError
            ? "Access denied. Administrative authorization required."
            : error.message,
        };
      }

      return { success: true };
    }
  }

  // Local storage fallback simulation
  const bookings = getStoredBookings();
  const target = bookings.find((b) => b.id === bookingId);
  if (!target) {
    return { success: false, error: "Booking record not found." };
  }

  const allowed = VALID_STATUS_TRANSITIONS[target.status] || [];
  if (!allowed.includes(newStatus)) {
    return {
      success: false,
      error: `Invalid status transition from ${target.status} to ${newStatus}.`,
    };
  }

  const previousStatus = target.status;
  target.status = newStatus;
  target.updatedAt = new Date().toISOString();
  if (newStatus === "cancelled") {
    target.cancellationReason = reason || "Cancelled by solutions administrator";
    target.cancelledAt = new Date().toISOString();
  }

  saveStoredBookings(bookings);

  recordStoredAuditLog({
    id: `audit-${Date.now()}`,
    bookingId,
    referenceId: target.referenceId,
    action: "status_updated",
    actor,
    previousStatus,
    newStatus,
    details: { reason },
    createdAt: new Date().toISOString(),
  });

  return { success: true };
}

/**
 * Cancels a booking reservation via controlled admin lifecycle action.
 */
export async function cancelAdminBooking(
  bookingId: string,
  cancellationReason?: string
): Promise<{ success: boolean; error?: string }> {
  return updateAdminBookingStatus(
    bookingId,
    "cancelled",
    cancellationReason || "Cancelled by solutions administrator"
  );
}

/**
 * Reschedules a confirmed reservation to a new time slot atomically.
 */
export async function rescheduleAdminBooking(
  request: RescheduleRequest
): Promise<RescheduleResponse> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      const { error } = await client.rpc("reschedule_booking_atomic", {
        p_booking_id: request.bookingId,
        p_new_date: request.newDate,
        p_new_start_time: request.newStartTime,
        p_new_end_time: request.newEndTime,
        p_reason: request.reason || null,
        p_actor: request.actor || "admin",
      });

      if (error) {
        const message = error.message || "";
        const isAuthError =
          error.code === "42501" ||
          message.toLowerCase().includes("access denied") ||
          message.toLowerCase().includes("administrative authorization");
        if (isAuthError) {
          return {
            success: false,
            error: "Access denied. Administrative authorization required.",
          };
        }
        const isRace =
          message.toLowerCase().includes("no longer available") ||
          message.toLowerCase().includes("conflict") ||
          message.toLowerCase().includes("overlap");

        return {
          success: false,
          isRaceCollision: isRace,
          error: isRace
            ? "Selected time slot is no longer available. Please choose another slot."
            : message,
        };
      }

      return { success: true };
    }
  }

  // Local storage fallback simulation
  const bookings = getStoredBookings();
  const target = bookings.find((b) => b.id === request.bookingId);
  if (!target) {
    return { success: false, error: "Booking record not found." };
  }

  if (!["confirmed", "pending", "cancelled"].includes(target.status)) {
    return {
      success: false,
      error: `Bookings with status "${target.status}" cannot be rescheduled.`,
    };
  }

  // Check collision with any existing active booking on new date & slot
  const hasConflict = bookings.some(
    (b) =>
      b.id !== request.bookingId &&
      b.bookingDate === request.newDate &&
      b.status !== "cancelled" &&
      b.startTime === request.newStartTime
  );

  if (hasConflict) {
    return {
      success: false,
      isRaceCollision: true,
      error: "Selected time slot is no longer available. Please choose another slot.",
    };
  }

  const oldDate = target.bookingDate;
  const oldStart = target.startTime;
  const oldEnd = target.endTime;

  target.bookingDate = request.newDate;
  target.startTime = request.newStartTime;
  target.endTime = request.newEndTime;
  target.status = "confirmed";
  target.rescheduledAt = new Date().toISOString();
  target.rescheduleCount = (target.rescheduleCount || 0) + 1;
  target.cancellationReason = undefined;
  target.cancelledAt = undefined;
  target.updatedAt = new Date().toISOString();

  saveStoredBookings(bookings);

  recordStoredAuditLog({
    id: `audit-${Date.now()}`,
    bookingId: request.bookingId,
    referenceId: target.referenceId,
    action: "booking_rescheduled",
    actor: request.actor || "admin",
    previousStatus: "confirmed",
    newStatus: "confirmed",
    details: {
      previousDate: oldDate,
      previousStartTime: oldStart,
      previousEndTime: oldEnd,
      newDate: request.newDate,
      newStartTime: request.newStartTime,
      newEndTime: request.newEndTime,
      reason: request.reason,
    },
    createdAt: new Date().toISOString(),
  });

  return { success: true, booking: target };
}

/**
 * Updates internal administrative notes for a booking.
 */
export async function updateAdminBookingInternalNotes(
  bookingId: string,
  internalNotes: string,
  actor: string = "admin"
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      const { error } = await client.rpc("update_booking_notes_atomic", {
        p_booking_id: bookingId,
        p_internal_notes: internalNotes,
        p_actor: actor,
      });

      if (error) {
        // eslint-disable-next-line no-console
        console.error("[Scheduling Service] Admin update notes error:", error.message);
        const isAuthError =
          error.code === "42501" ||
          error.message?.toLowerCase().includes("access denied") ||
          error.message?.toLowerCase().includes("administrative authorization");
        return {
          success: false,
          error: isAuthError
            ? "Access denied. Administrative authorization required."
            : error.message,
        };
      }

      return { success: true };
    }
  }

  const bookings = getStoredBookings();
  const target = bookings.find((b) => b.id === bookingId);
  if (!target) {
    return { success: false, error: "Booking record not found." };
  }

  target.internalNotes = internalNotes;
  target.updatedAt = new Date().toISOString();
  saveStoredBookings(bookings);

  recordStoredAuditLog({
    id: `audit-${Date.now()}`,
    bookingId,
    referenceId: target.referenceId,
    action: "note_updated",
    actor,
    details: { noteLength: internalNotes.length },
    createdAt: new Date().toISOString(),
  });

  return { success: true };
}

/**
 * Fetches audit log records for administrative review.
 */
export async function getAdminBookingAuditLogs(
  bookingId?: string
): Promise<BookingAuditLog[]> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      let query = client
        .from("booking_audit_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (bookingId) {
        query = query.eq("booking_id", bookingId);
      }

      const { data, error } = await query;
      if (!error && data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.map((d: any) => ({
          id: d.id,
          bookingId: d.booking_id,
          referenceId: d.reference_id,
          action: d.action,
          actor: d.actor,
          previousStatus: d.previous_status,
          newStatus: d.new_status,
          details: d.details,
          createdAt: d.created_at,
        }));
      }
      return [];
    }
  }

  const logs = getStoredAuditLogs();
  if (bookingId) {
    return logs.filter((l) => l.bookingId === bookingId);
  }
  return logs;
}

/**
 * Fetches notification records for administrative review.
 */
export async function getAdminBookingNotifications(
  bookingId?: string
): Promise<BookingNotification[]> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      let query = client
        .from("booking_notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (bookingId) {
        query = query.eq("booking_id", bookingId);
      }

      const { data, error } = await query;
      if (!error && data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.map((d: any) => ({
          id: d.id,
          bookingId: d.booking_id,
          referenceId: d.reference_id,
          eventType: d.event_type,
          recipientEmail: d.recipient_email,
          recipientName: d.recipient_name,
          channel: d.channel,
          status: d.status,
          payload: d.payload,
          errorMessage: d.error_message,
          createdAt: d.created_at,
          sentAt: d.sent_at,
        }));
      }
      return [];
    }
  }

  const notifs = getStoredNotifications();
  if (bookingId) {
    return notifs.filter((n) => n.bookingId === bookingId);
  }
  return notifs;
}


export async function getAdminScheduleSettings(): Promise<ScheduleSettings> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      const { data, error } = await client
        .from("schedule_settings")
        .select("*")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          timezone: data.timezone,
          slotDurationMinutes: data.slot_duration_minutes,
          bufferBeforeMinutes: data.buffer_before_minutes,
          bufferAfterMinutes: data.buffer_after_minutes,
          minimumNoticeHours: data.minimum_notice_hours,
          maximumBookingDays: data.maximum_booking_days,
          isActive: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }
  }

  return getStoredSettings();
}

export async function updateAdminScheduleSettings(
  updates: Partial<ScheduleSettings>
): Promise<ScheduleSettings> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client && updates.id) {
      const dbPayload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name !== undefined) dbPayload.name = updates.name;
      if (updates.timezone !== undefined) dbPayload.timezone = updates.timezone;
      if (updates.slotDurationMinutes !== undefined) dbPayload.slot_duration_minutes = updates.slotDurationMinutes;
      if (updates.bufferBeforeMinutes !== undefined) dbPayload.buffer_before_minutes = updates.bufferBeforeMinutes;
      if (updates.bufferAfterMinutes !== undefined) dbPayload.buffer_after_minutes = updates.bufferAfterMinutes;
      if (updates.minimumNoticeHours !== undefined) dbPayload.minimum_notice_hours = updates.minimumNoticeHours;
      if (updates.maximumBookingDays !== undefined) dbPayload.maximum_booking_days = updates.maximumBookingDays;
      if (updates.isActive !== undefined) dbPayload.is_active = updates.isActive;

      const { data, error } = await client
        .from("schedule_settings")
        .update(dbPayload)
        .eq("id", updates.id)
        .select()
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          timezone: data.timezone,
          slotDurationMinutes: data.slot_duration_minutes,
          bufferBeforeMinutes: data.buffer_before_minutes,
          bufferAfterMinutes: data.buffer_after_minutes,
          minimumNoticeHours: data.minimum_notice_hours,
          maximumBookingDays: data.maximum_booking_days,
          isActive: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }
  }

  const current = getStoredSettings();
  const updated: ScheduleSettings = { ...current, ...updates, updatedAt: new Date().toISOString() };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  }
  return updated;
}

export async function getAdminAvailabilityRules(): Promise<AvailabilityRule[]> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      const { data, error } = await client
        .from("availability_rules")
        .select("*")
        .order("day_of_week", { ascending: true });

      if (!error && data && data.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.map((r: any) => ({
          id: r.id,
          scheduleId: r.schedule_id,
          dayOfWeek: r.day_of_week,
          startTime: typeof r.start_time === "string" ? r.start_time.slice(0, 5) : "09:00",
          endTime: typeof r.end_time === "string" ? r.end_time.slice(0, 5) : "17:00",
          isActive: Boolean(r.is_active),
        }));
      }
    }
  }

  return getStoredRules();
}

export async function updateAdminAvailabilityRule(
  ruleId: string,
  updates: Partial<AvailabilityRule>
): Promise<AvailabilityRule[]> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      const dbPayload: Record<string, unknown> = {};
      if (updates.isActive !== undefined) dbPayload.is_active = updates.isActive;
      if (updates.startTime !== undefined) dbPayload.start_time = updates.startTime;
      if (updates.endTime !== undefined) dbPayload.end_time = updates.endTime;

      await client.from("availability_rules").update(dbPayload).eq("id", ruleId);
      return getAdminAvailabilityRules();
    }
  }

  const rules = getStoredRules();
  const target = rules.find((r) => r.id === ruleId);
  if (target) {
    Object.assign(target, updates);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
    }
  }
  return rules;
}

export async function getAdminExceptions(): Promise<AvailabilityException[]> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      const { data, error } = await client
        .from("availability_exceptions")
        .select("*")
        .order("exception_date", { ascending: true });

      if (!error && data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.map((e: any) => ({
          id: e.id,
          scheduleId: e.schedule_id,
          exceptionDate: e.exception_date,
          startTime: e.start_time ? String(e.start_time).slice(0, 5) : undefined,
          endTime: e.end_time ? String(e.end_time).slice(0, 5) : undefined,
          exceptionType: e.exception_type,
          reason: e.reason,
        }));
      }
    }
  }

  return getStoredExceptions();
}

export async function addAdminException(
  exception: Omit<AvailabilityException, "id">
): Promise<AvailabilityException[]> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      await client.from("availability_exceptions").insert({
        schedule_id: exception.scheduleId,
        exception_date: exception.exceptionDate,
        start_time: exception.startTime || null,
        end_time: exception.endTime || null,
        exception_type: exception.exceptionType,
        reason: exception.reason || null,
      });
      return getAdminExceptions();
    }
  }

  const exceptions = getStoredExceptions();
  const newEx: AvailabilityException = {
    ...exception,
    id: `ex-${Date.now()}`,
  };
  exceptions.push(newEx);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.EXCEPTIONS, JSON.stringify(exceptions));
  }
  return exceptions;
}

export async function deleteAdminException(id: string): Promise<AvailabilityException[]> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      await client.from("availability_exceptions").delete().eq("id", id);
      return getAdminExceptions();
    }
  }

  const exceptions = getStoredExceptions().filter((e) => e.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.EXCEPTIONS, JSON.stringify(exceptions));
  }
  return exceptions;
}
