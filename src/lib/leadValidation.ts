/**
 * Zakeem Solutions — Lead Form Validation
 * Phase 15 & 16: Lead Capture, CRM Readiness & Conversion Infrastructure
 */

export interface ValidationErrors {
  fullName?: string;
  workEmail?: string;
  company?: string;
  phone?: string;
  message?: string;
  preferredDate?: string;
  preferredTime?: string;
  general?: string;
}

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,16}$/;

export function validateFullName(name: string): string | null {
  const trimmed = (name || "").trim();
  if (!trimmed) {
    return "Full name is required.";
  }
  if (trimmed.length < 2) {
    return "Please enter a valid full name (minimum 2 characters).";
  }
  if (trimmed.length > 100) {
    return "Name must not exceed 100 characters.";
  }
  return null;
}

export function validateEmail(email: string): string | null {
  const trimmed = (email || "").trim();
  if (!trimmed) {
    return "Corporate work email is required.";
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return "Please enter a valid corporate email address (e.g. name@enterprise.com).";
  }
  return null;
}

export function validateCompany(company: string): string | null {
  const trimmed = (company || "").trim();
  if (!trimmed) {
    return "Organization or company name is required.";
  }
  if (trimmed.length < 2) {
    return "Organization name must be at least 2 characters.";
  }
  if (trimmed.length > 120) {
    return "Organization name must not exceed 120 characters.";
  }
  return null;
}

export function validatePhone(phone?: string): string | null {
  if (!phone || !phone.trim()) {
    return null; // Phone is optional
  }
  const trimmed = phone.trim();
  if (!PHONE_REGEX.test(trimmed)) {
    return "Please enter a valid phone number (e.g. +234 800 000 0000).";
  }
  return null;
}

export function validateMessage(message: string, minLength = 10): string | null {
  const trimmed = (message || "").trim();
  if (!trimmed) {
    return "Please provide a brief description of your inquiry or requirements.";
  }
  if (trimmed.length < minLength) {
    return `Message must be at least ${minLength} characters.`;
  }
  return null;
}

/**
 * Returns today's date formatted as YYYY-MM-DD for native HTML5 date input 'min' constraint.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Validates requested preferred session date.
 * Ensures the date is well-formed and not in the past.
 */
export function validatePreferredDate(dateStr?: string): string | null {
  if (!dateStr || !dateStr.trim()) {
    return null; // Date is optional
  }
  const trimmed = dateStr.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return "Please enter a valid date (YYYY-MM-DD).";
  }
  const today = getTodayDateString();
  if (trimmed < today) {
    return "Preferred date cannot be in the past.";
  }
  return null;
}

/**
 * Validates preferred session time.
 */
export function validatePreferredTime(timeStr?: string): string | null {
  if (!timeStr || !timeStr.trim()) {
    return null; // Time is optional
  }
  return null;
}

/**
 * Cross-field validator ensuring that if one scheduling field is selected,
 * the corresponding counterpart is also chosen to make the requested session actionable.
 */
export function validateSchedulingPair(
  dateStr?: string,
  timeStr?: string
): { dateError?: string; timeError?: string } {
  const hasDate = Boolean(dateStr && dateStr.trim());
  const hasTime = Boolean(timeStr && timeStr.trim());

  if (hasDate && !hasTime) {
    return { timeError: "Please select a preferred time for your requested session date." };
  }
  if (!hasDate && hasTime) {
    return { dateError: "Please select a preferred date for your requested session time." };
  }
  return {};
}

/**
 * Formats a normalized date string (YYYY-MM-DD) into an executive human-readable format.
 * Example: "2026-09-12" -> "12 September 2026"
 */
export function formatDisplayDate(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
