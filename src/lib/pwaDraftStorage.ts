/**
 * Zakeem Solutions — PWA Safe Offline Action Queue & Draft Recovery
 * Phase 81.2: Client-side draft persistence for public non-authenticated forms
 * 
 * Storage Namespace: zakeem:pwa:draft:<form>:v1
 * 
 * Security Guardrails:
 * 1. Strictly allowlisted public fields only per form.
 * 2. Zero serialization of arbitrary state, DOM elements, or honeypot traps.
 * 3. NEVER persists passwords, tokens, API keys, Supabase credentials, admin info,
 *    portal info, CRM internal IDs, or sensitive customer records.
 * 4. Drafts are NEVER placed into service-worker cache, URLs, or analytics events.
 * 5. Versioned (v1) schema with automated corruption/version mismatch eviction.
 * 6. Graceful memory fallback when localStorage is blocked, full, or unavailable.
 */

export type PublicFormKey = "request-demo" | "contact" | "training";

export const DRAFT_STORAGE_VERSION = "v1" as const;

// Storage prefix
export function getDraftStorageKey(formKey: PublicFormKey): string {
  return `zakeem:pwa:draft:${formKey}:${DRAFT_STORAGE_VERSION}`;
}

// =============================================================================
// ALLOWLISTED DRAFT DATA INTERFACES
// =============================================================================

export interface RequestDemoDraftData {
  fullName: string;
  workEmail: string;
  company: string;
  phone: string;
  jobTitle: string;
  interest: string;
  deploymentType: "cloud" | "private-vpc" | "on-premise";
  notes: string;
  selectedDate: string;
  selectedSlot: {
    slotDate: string;
    startTime: string;
    endTime: string;
    displayTime: string;
    displayEndTime: string;
    isAvailable: boolean;
  } | null;
}

export interface ContactDraftData {
  fullName: string;
  workEmail: string;
  company: string;
  phone: string;
  category: string;
  message: string;
}

export interface TrainingDraftData {
  applicantType: "individual" | "organization";
  fullName: string;
  email: string;
  organizationName: string;
  businessEmail: string;
  course: string;
  customTrainingRequest: string;
  preferredStartDate: string;
  trainingDays: string[];
  preferredTime: string;
  acknowledgementAccepted: boolean;
}

export type FormDraftDataMap = {
  "request-demo": RequestDemoDraftData;
  contact: ContactDraftData;
  training: TrainingDraftData;
};

export interface FormDraftEnvelope<T> {
  version: typeof DRAFT_STORAGE_VERSION;
  formKey: PublicFormKey;
  savedAt: string; // ISO 8601 string
  data: T;
}

// =============================================================================
// IN-MEMORY STORAGE FALLBACK
// =============================================================================
const memoryStorage = new Map<string, string>();

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Storage access blocked (e.g. private mode, cookies disabled)
  }
  return memoryStorage.get(key) ?? null;
}

function safeSetItem(key: string, value: string): boolean {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
      return true;
    }
  } catch {
    // Quota exceeded or storage blocked -> fallback to memory
  }
  try {
    memoryStorage.set(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemoveItem(key: string): boolean {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore
  }
  memoryStorage.delete(key);
  return true;
}

// =============================================================================
// STRICT FIELD ALLOWLIST SANITIZERS
// =============================================================================

function sanitizeString(val: unknown, maxLen = 1000): string {
  if (typeof val !== "string") return "";
  return val.trim().slice(0, maxLen);
}

export function sanitizeRequestDemoDraft(raw: unknown): RequestDemoDraftData {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const rawDeployment = obj.deploymentType;
  const deploymentType =
    rawDeployment === "private-vpc" || rawDeployment === "on-premise"
      ? rawDeployment
      : "cloud";

  let selectedSlot: RequestDemoDraftData["selectedSlot"] = null;
  if (obj.selectedSlot && typeof obj.selectedSlot === "object") {
    const s = obj.selectedSlot as Record<string, unknown>;
    if (typeof s.startTime === "string" && typeof s.endTime === "string") {
      selectedSlot = {
        slotDate: sanitizeString(s.slotDate, 30),
        startTime: sanitizeString(s.startTime, 50),
        endTime: sanitizeString(s.endTime, 50),
        displayTime: sanitizeString(s.displayTime, 50) || sanitizeString(s.startTime, 50),
        displayEndTime: sanitizeString(s.displayEndTime, 50) || sanitizeString(s.endTime, 50),
        isAvailable: typeof s.isAvailable === "boolean" ? s.isAvailable : true,
      };
    }
  }

  return {
    fullName: sanitizeString(obj.fullName, 120),
    workEmail: sanitizeString(obj.workEmail, 150),
    company: sanitizeString(obj.company, 150),
    phone: sanitizeString(obj.phone, 50),
    jobTitle: sanitizeString(obj.jobTitle, 100),
    interest: sanitizeString(obj.interest, 80) || "zakeem-realty-erp",
    deploymentType,
    notes: sanitizeString(obj.notes, 1000),
    selectedDate: sanitizeString(obj.selectedDate, 30),
    selectedSlot,
  };
}

export function sanitizeContactDraft(raw: unknown): ContactDraftData {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    fullName: sanitizeString(obj.fullName, 120),
    workEmail: sanitizeString(obj.workEmail, 150),
    company: sanitizeString(obj.company, 150),
    phone: sanitizeString(obj.phone, 50),
    category: sanitizeString(obj.category, 80) || "general-inquiry",
    message: sanitizeString(obj.message, 2500),
  };
}

export function sanitizeTrainingDraft(raw: unknown): TrainingDraftData {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const applicantType = obj.applicantType === "organization" ? "organization" : "individual";
  const trainingDays: string[] = [];
  if (Array.isArray(obj.trainingDays)) {
    obj.trainingDays.forEach((d) => {
      if (typeof d === "string" && d.length <= 20) {
        trainingDays.push(d);
      }
    });
  }

  return {
    applicantType,
    fullName: sanitizeString(obj.fullName, 120),
    email: sanitizeString(obj.email, 150),
    organizationName: sanitizeString(obj.organizationName, 150),
    businessEmail: sanitizeString(obj.businessEmail, 150),
    course: sanitizeString(obj.course, 120),
    customTrainingRequest: sanitizeString(obj.customTrainingRequest, 1000),
    preferredStartDate: sanitizeString(obj.preferredStartDate, 30),
    trainingDays: trainingDays.slice(0, 3), // max 3 days
    preferredTime: sanitizeString(obj.preferredTime, 50),
    acknowledgementAccepted: Boolean(obj.acknowledgementAccepted),
  };
}

export function sanitizeFormDraft<K extends PublicFormKey>(
  formKey: K,
  raw: unknown
): FormDraftDataMap[K] {
  switch (formKey) {
    case "request-demo":
      return sanitizeRequestDemoDraft(raw) as FormDraftDataMap[K];
    case "contact":
      return sanitizeContactDraft(raw) as FormDraftDataMap[K];
    case "training":
      return sanitizeTrainingDraft(raw) as FormDraftDataMap[K];
    default:
      throw new Error(`Unsupported formKey for draft storage: ${formKey}`);
  }
}

// =============================================================================
// PUBLIC API: SAVE / LOAD / CLEAR / CHECK
// =============================================================================

export function isDraftEmpty<K extends PublicFormKey>(
  formKey: K,
  data: Partial<FormDraftDataMap[K]>
): boolean {
  if (!data || typeof data !== "object") return true;

  switch (formKey) {
    case "request-demo": {
      const d = data as Partial<RequestDemoDraftData>;
      return (
        !d.fullName?.trim() &&
        !d.workEmail?.trim() &&
        !d.company?.trim() &&
        !d.phone?.trim() &&
        !d.jobTitle?.trim() &&
        !d.notes?.trim() &&
        !d.selectedSlot
      );
    }
    case "contact": {
      const d = data as Partial<ContactDraftData>;
      return (
        !d.fullName?.trim() &&
        !d.workEmail?.trim() &&
        !d.company?.trim() &&
        !d.phone?.trim() &&
        !d.message?.trim()
      );
    }
    case "training": {
      const d = data as Partial<TrainingDraftData>;
      return (
        !d.fullName?.trim() &&
        !d.email?.trim() &&
        !d.organizationName?.trim() &&
        !d.businessEmail?.trim() &&
        !d.course?.trim() &&
        !d.customTrainingRequest?.trim() &&
        !d.preferredStartDate?.trim() &&
        (!d.trainingDays || d.trainingDays.length === 0)
      );
    }
    default:
      return true;
  }
}

export function saveFormDraft<K extends PublicFormKey>(
  formKey: K,
  data: FormDraftDataMap[K]
): { success: boolean; savedAt: string; error?: string } {
  try {
    const sanitized = sanitizeFormDraft(formKey, data);
    const key = getDraftStorageKey(formKey);
    const savedAt = new Date().toISOString();

    const envelope: FormDraftEnvelope<FormDraftDataMap[K]> = {
      version: DRAFT_STORAGE_VERSION,
      formKey,
      savedAt,
      data: sanitized,
    };

    const serialized = JSON.stringify(envelope);
    const stored = safeSetItem(key, serialized);

    if (stored) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("zakeem-draft-updated", {
            detail: { formKey, action: "saved", savedAt },
          })
        );
      }
      return { success: true, savedAt };
    }
    return { success: false, savedAt, error: "Storage write failed" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown storage error";
    return { success: false, savedAt: new Date().toISOString(), error: msg };
  }
}

export function loadFormDraft<K extends PublicFormKey>(
  formKey: K
): FormDraftEnvelope<FormDraftDataMap[K]> | null {
  try {
    const key = getDraftStorageKey(formKey);
    const raw = safeGetItem(key);
    if (!raw) return null;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Malformed JSON -> safely purge
      safeRemoveItem(key);
      return null;
    }

    if (!parsed || typeof parsed !== "object") {
      safeRemoveItem(key);
      return null;
    }

    const envelope = parsed as Record<string, unknown>;

    // Version mismatch check
    if (envelope.version !== DRAFT_STORAGE_VERSION || envelope.formKey !== formKey) {
      safeRemoveItem(key);
      return null;
    }

    if (!envelope.data || typeof envelope.data !== "object") {
      safeRemoveItem(key);
      return null;
    }

    const sanitizedData = sanitizeFormDraft(formKey, envelope.data);
    const savedAt =
      typeof envelope.savedAt === "string" ? envelope.savedAt : new Date().toISOString();

    return {
      version: DRAFT_STORAGE_VERSION,
      formKey,
      savedAt,
      data: sanitizedData,
    };
  } catch {
    return null;
  }
}

export function clearFormDraft(formKey: PublicFormKey): boolean {
  try {
    const key = getDraftStorageKey(formKey);
    const result = safeRemoveItem(key);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("zakeem-draft-updated", {
          detail: { formKey, action: "cleared" },
        })
      );
    }
    return result;
  } catch {
    return false;
  }
}

export function hasFormDraft(formKey: PublicFormKey): boolean {
  try {
    const draft = loadFormDraft(formKey);
    if (!draft) return false;
    return !isDraftEmpty(formKey, draft.data);
  } catch {
    return false;
  }
}

/**
 * Formats ISO savedAt timestamp for friendly user display
 */
export function formatDraftTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Recently";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "Recently";
  }
}

export const PUBLIC_FORM_KEYS: PublicFormKey[] = ["request-demo", "contact", "training"];

export function listPendingDrafts(): Array<{ formKey: PublicFormKey; savedAt: string }> {
  const result: Array<{ formKey: PublicFormKey; savedAt: string }> = [];
  PUBLIC_FORM_KEYS.forEach((formKey) => {
    const draft = loadFormDraft(formKey);
    if (draft && !isDraftEmpty(formKey, draft.data)) {
      result.push({ formKey, savedAt: draft.savedAt });
    }
  });
  return result;
}

export function getPendingDraftCount(): number {
  return listPendingDrafts().length;
}
