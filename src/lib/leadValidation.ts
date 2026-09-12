/**
 * Zakeem Solutions — Lead Form Validation
 * Phase 15: Lead Capture, CRM Readiness & Conversion Infrastructure
 */

export interface ValidationErrors {
  fullName?: string;
  workEmail?: string;
  company?: string;
  phone?: string;
  message?: string;
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
