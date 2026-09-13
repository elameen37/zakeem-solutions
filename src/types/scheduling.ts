/**
 * Zakeem Solutions — Self-Managed Scheduling Engine Types
 * Phase 17: Appointment Scheduling, Double-Booking Protection & Availability Model
 */

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export interface ScheduleSettings {
  id: string;
  name: string;
  timezone: string; // "Africa/Lagos" (WAT)
  slotDurationMinutes: number; // e.g. 60
  bufferBeforeMinutes: number; // e.g. 0
  bufferAfterMinutes: number; // e.g. 15
  minimumNoticeHours: number; // e.g. 2
  maximumBookingDays: number; // e.g. 30
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AvailabilityRule {
  id: string;
  scheduleId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday ... 6 = Saturday
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  isActive: boolean;
}

export interface AvailabilityException {
  id: string;
  scheduleId: string;
  exceptionDate: string; // "YYYY-MM-DD"
  startTime?: string;
  endTime?: string;
  exceptionType: "unavailable" | "custom_hours";
  reason?: string;
}

export interface Booking {
  id: string;
  referenceId: string; // e.g. ZK-20260912-A7F3
  leadId?: string;
  fullName: string;
  email: string;
  organization: string;
  phone?: string;
  jobTitle?: string;
  product: string;
  tier?: string;
  suite?: string;
  deployment?: string;
  bookingDate: string; // "YYYY-MM-DD"
  startTime: string; // "09:00" or "09:00 AM"
  endTime: string; // "10:00" or "10:00 AM"
  timezone: string; // "Africa/Lagos"
  status: BookingStatus;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TimeSlot {
  slotDate: string; // "YYYY-MM-DD"
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  displayTime: string; // "09:00 AM"
  displayEndTime: string; // "10:00 AM"
  isAvailable: boolean;
}

export interface BookingRequest {
  referenceId: string;
  leadId?: string;
  fullName: string;
  email: string;
  organization: string;
  phone?: string;
  jobTitle?: string;
  product: string;
  tier?: string;
  suite?: string;
  deployment?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface BookingResponse {
  success: boolean;
  booking?: Booking;
  error?: string;
  isRaceCollision?: boolean;
}
