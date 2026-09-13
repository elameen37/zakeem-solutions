/**
 * Zakeem Solutions — Scheduling Service & Persistence
 * Phase 17: Supabase Integration with Local State Persistence Fallback
 */

import {
  AvailabilityException,
  AvailabilityRule,
  Booking,
  BookingRequest,
  BookingResponse,
  ScheduleSettings,
  TimeSlot,
} from "@/types/scheduling";
import {
  computeAvailableSlots,
  DEFAULT_AVAILABILITY_RULES,
  DEFAULT_SCHEDULE_SETTINGS,
  generateBookingReferenceId,
} from "./schedulingEngine";

const STORAGE_KEYS = {
  SETTINGS: "zakeem_schedule_settings",
  RULES: "zakeem_availability_rules",
  EXCEPTIONS: "zakeem_availability_exceptions",
  BOOKINGS: "zakeem_bookings",
};

/**
 * Checks if Supabase configuration credentials are present in environment variables.
 */
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("your-project") && key.length > 20);
}

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
    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        apikey: key || "",
        Authorization: `Bearer ${key || ""}`,
      };
      const res = await fetch(`${url}/rest/v1/rpc/get_public_availability`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          p_date_from: dateStr,
          p_date_to: dateStr,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.map((d: any) => ({
          slotDate: d.slot_date,
          startTime: d.start_time.slice(0, 5),
          endTime: d.end_time.slice(0, 5),
          displayTime: d.start_time.slice(0, 5),
          displayEndTime: d.end_time.slice(0, 5),
          isAvailable: d.is_available,
        }));
      }

      // In production mode, if the database returns an error, do not silently fallback to localStorage
      // eslint-disable-next-line no-console
      console.error("[Scheduling Service] Supabase RPC get_public_availability returned error:", res.status, res.statusText);
      return [];
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[Scheduling Service] Supabase RPC get_public_availability failed:", err);
      return [];
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
    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        apikey: key || "",
        Authorization: `Bearer ${key || ""}`,
      };
      const res = await fetch(`${url}/rest/v1/rpc/create_booking_atomic`, {
        method: "POST",
        headers,
        body: JSON.stringify({
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
        }),
      });

      if (res.ok) {
        const result = await res.json();
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
          createdAt: new Date().toISOString(),
        };
        return { success: true, booking: newBooking };
      }

      const errorData = await res.json().catch(() => ({}));
      const message = errorData.message || errorData.details || "";
      const isRace =
        message.toLowerCase().includes("no longer available") ||
        message.toLowerCase().includes("conflict") ||
        message.toLowerCase().includes("overlap");

      return {
        success: false,
        isRaceCollision: isRace,
        error: isRace
          ? "This time was just taken. Please select another available time."
          : message || "Booking could not be finalized. Please try another slot.",
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
  return getStoredBookings().sort((a, b) => {
    return `${b.bookingDate} ${b.startTime}`.localeCompare(`${a.bookingDate} ${a.startTime}`);
  });
}

export async function cancelAdminBooking(
  bookingId: string,
  cancellationReason?: string
): Promise<{ success: boolean; error?: string }> {
  const bookings = getStoredBookings();
  const target = bookings.find((b) => b.id === bookingId);
  if (!target) {
    return { success: false, error: "Booking record not found." };
  }

  target.status = "cancelled";
  target.cancellationReason = cancellationReason || "Cancelled by solutions administrator";
  target.cancelledAt = new Date().toISOString();
  target.updatedAt = new Date().toISOString();

  saveStoredBookings(bookings);
  return { success: true };
}

export async function getAdminScheduleSettings(): Promise<ScheduleSettings> {
  return getStoredSettings();
}

export async function updateAdminScheduleSettings(
  updates: Partial<ScheduleSettings>
): Promise<ScheduleSettings> {
  const current = getStoredSettings();
  const updated: ScheduleSettings = { ...current, ...updates, updatedAt: new Date().toISOString() };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  }
  return updated;
}

export async function getAdminAvailabilityRules(): Promise<AvailabilityRule[]> {
  return getStoredRules();
}

export async function updateAdminAvailabilityRule(
  ruleId: string,
  updates: Partial<AvailabilityRule>
): Promise<AvailabilityRule[]> {
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
  return getStoredExceptions();
}

export async function addAdminException(
  exception: Omit<AvailabilityException, "id">
): Promise<AvailabilityException[]> {
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
  const exceptions = getStoredExceptions().filter((e) => e.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.EXCEPTIONS, JSON.stringify(exceptions));
  }
  return exceptions;
}
