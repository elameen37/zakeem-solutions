/**
 * Zakeem Solutions — Availability & Scheduling Engine
 * Phase 17: Pure Availability Calculation, Slot Generation & Timezone Management
 */

import {
  AvailabilityException,
  AvailabilityRule,
  Booking,
  ScheduleSettings,
  TimeSlot,
} from "@/types/scheduling";

export const DEFAULT_SCHEDULE_SETTINGS: ScheduleSettings = {
  id: "default-zakeem-schedule",
  name: "Executive Architecture Walkthroughs",
  timezone: "Africa/Lagos",
  slotDurationMinutes: 60,
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 15,
  minimumNoticeHours: 2,
  maximumBookingDays: 30,
  isActive: true,
};

export const DEFAULT_AVAILABILITY_RULES: AvailabilityRule[] = [
  { id: "rule-mon", scheduleId: "default-zakeem-schedule", dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isActive: true },
  { id: "rule-tue", scheduleId: "default-zakeem-schedule", dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isActive: true },
  { id: "rule-wed", scheduleId: "default-zakeem-schedule", dayOfWeek: 3, startTime: "09:00", endTime: "17:00", isActive: true },
  { id: "rule-thu", scheduleId: "default-zakeem-schedule", dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isActive: true },
  { id: "rule-fri", scheduleId: "default-zakeem-schedule", dayOfWeek: 5, startTime: "09:00", endTime: "17:00", isActive: true },
];

/**
 * Converts 24h time string (e.g. "09:00" or "14:15") to minutes from midnight.
 */
export function timeStringToMinutes(timeStr: string): number {
  const parts = timeStr.trim().split(":");
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

/**
 * Converts minutes from midnight to "HH:MM" 24h string.
 */
export function minutesToTimeString(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Converts 24h time string into 12h user-friendly display string (e.g. "09:00 AM").
 */
export function formatDisplayTime(timeStr: string): string {
  const parts = timeStr.trim().split(":");
  let hours = parseInt(parts[0], 10) || 0;
  const minutes = String(parts[1] || "00").padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  return `${String(hours).padStart(2, "0")}:${minutes} ${period}`;
}

/**
 * Generates an enterprise booking reference identifier.
 * Format: ZK-YYYYMMDD-XXXX (e.g., ZK-20260912-A7F3)
 */
export function generateBookingReferenceId(dateStr?: string): string {
  const now = new Date();
  const dateSegment = dateStr ? dateStr.replace(/-/g, "") : `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const randomSegment = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ZK-${dateSegment}-${randomSegment}`;
}

/**
 * Gets today's date in Africa/Lagos (WAT).
 */
export function getLagosTodayDateString(): string {
  const now = new Date();
  // Using en-CA for YYYY-MM-DD output format in Africa/Lagos timezone
  return now.toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });
}

/**
 * Checks whether a given date is permissible for appointment booking.
 */
export function isDateBookable(
  dateStr: string,
  settings: ScheduleSettings = DEFAULT_SCHEDULE_SETTINGS,
  rules: AvailabilityRule[] = DEFAULT_AVAILABILITY_RULES,
  exceptions: AvailabilityException[] = []
): { bookable: boolean; reason?: string } {
  const lagosToday = getLagosTodayDateString();

  if (dateStr < lagosToday) {
    return { bookable: false, reason: "Past dates cannot be scheduled." };
  }

  // Check maximum booking horizon
  const todayDate = new Date(`${lagosToday}T00:00:00Z`);
  const targetDate = new Date(`${dateStr}T00:00:00Z`);
  const diffDays = Math.round((targetDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays > settings.maximumBookingDays) {
    return {
      bookable: false,
      reason: `Date exceeds the ${settings.maximumBookingDays}-day booking horizon.`,
    };
  }

  // Check blackout exceptions
  const hasBlackout = exceptions.some(
    (e) => e.exceptionDate === dateStr && e.exceptionType === "unavailable"
  );
  if (hasBlackout) {
    return { bookable: false, reason: "Date is unavailable due to schedule exception." };
  }

  // Check day of week rule
  const dow = targetDate.getUTCDay();
  const hasRule = rules.some((r) => r.dayOfWeek === dow && r.isActive);
  if (!hasRule) {
    return { bookable: false, reason: "Weekend appointments are not scheduled." };
  }

  return { bookable: true };
}

/**
 * Computes all available time slots for a given date in Africa/Lagos (WAT).
 * Strictly filters out:
 * 1. Slots violating minimum notice window
 * 2. Slots colliding with existing confirmed bookings
 * 3. Slots falling outside weekly operational hours
 */
export function computeAvailableSlots(
  dateStr: string,
  existingBookings: Booking[] = [],
  settings: ScheduleSettings = DEFAULT_SCHEDULE_SETTINGS,
  rules: AvailabilityRule[] = DEFAULT_AVAILABILITY_RULES,
  exceptions: AvailabilityException[] = []
): TimeSlot[] {
  const dateCheck = isDateBookable(dateStr, settings, rules, exceptions);
  if (!dateCheck.bookable) {
    return [];
  }

  const targetDate = new Date(`${dateStr}T00:00:00Z`);
  const dow = targetDate.getUTCDay();
  const activeRule = rules.find((r) => r.dayOfWeek === dow && r.isActive);
  if (!activeRule) {
    return [];
  }

  const windowStartMinutes = timeStringToMinutes(activeRule.startTime);
  const windowEndMinutes = timeStringToMinutes(activeRule.endTime);
  const duration = settings.slotDurationMinutes;
  const stride = duration + settings.bufferAfterMinutes;

  const lagosToday = getLagosTodayDateString();
  const now = new Date();
  // Get current time in Lagos as minutes from midnight if date is today
  const lagosTimeString = now.toLocaleTimeString("en-GB", {
    timeZone: "Africa/Lagos",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
  const currentLagosMinutes = timeStringToMinutes(lagosTimeString);
  const minNoticeMinutes = settings.minimumNoticeHours * 60;

  // Find active bookings on this date
  const activeBookingsOnDate = existingBookings.filter(
    (b) => b.bookingDate === dateStr && b.status !== "cancelled"
  );

  const slots: TimeSlot[] = [];
  let slotStartMinutes = windowStartMinutes;

  while (slotStartMinutes + duration <= windowEndMinutes) {
    const slotEndMinutes = slotStartMinutes + duration;

    // Check minimum notice if target date is today
    const isNoticeSufficient =
      dateStr > lagosToday ||
      slotStartMinutes >= currentLagosMinutes + minNoticeMinutes;

    if (isNoticeSufficient) {
      // Check collision with any existing confirmed booking
      const hasConflict = activeBookingsOnDate.some((b) => {
        const bStart = timeStringToMinutes(b.startTime);
        const bEnd = timeStringToMinutes(b.endTime);
        return (
          (bStart <= slotStartMinutes && bEnd > slotStartMinutes) ||
          (bStart < slotEndMinutes && bEnd >= slotEndMinutes) ||
          (bStart >= slotStartMinutes && bEnd <= slotEndMinutes)
        );
      });

      if (!hasConflict) {
        const startTimeStr = minutesToTimeString(slotStartMinutes);
        const endTimeStr = minutesToTimeString(slotEndMinutes);
        slots.push({
          slotDate: dateStr,
          startTime: startTimeStr,
          endTime: endTimeStr,
          displayTime: formatDisplayTime(startTimeStr),
          displayEndTime: formatDisplayTime(endTimeStr),
          isAvailable: true,
        });
      }
    }

    slotStartMinutes += stride;
  }

  return slots;
}
