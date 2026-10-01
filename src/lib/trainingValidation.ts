/**
 * Zakeem Solutions — IT Training Application Validation & Sanitization
 * Phase 71B: Zakeem IT Training Application Rules & Integrity
 */

import {
  ApplicantType,
  TRAINING_COURSES,
  TRAINING_DAYS,
  TrainingApplicationPayload,
  TrainingCourse,
  TrainingDay,
} from "@/types/training";

export interface TrainingValidationErrors {
  applicantType?: string;
  fullName?: string;
  email?: string;
  organizationName?: string;
  businessEmail?: string;
  course?: string;
  customTrainingRequest?: string;
  preferredStartDate?: string;
  trainingDays?: string;
  preferredTime?: string;
  acknowledgementAccepted?: string;
  general?: string;
}

export function sanitizeInput(val: string): string {
  if (!val || typeof val !== "string") return "";
  return val.replace(/[\r\n\t]+/g, " ").replace(/%0[ad]/gi, " ").trim();
}

export function isValidEmailAddress(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const clean = sanitizeInput(email);
  if (clean.length < 5 || clean.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
}

export function getLagosTodayIsoDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function generateTrainingReferenceId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const randomSeg = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ZIT-${year}${month}-${randomSeg}`;
}

export function validateTrainingApplication(
  data: Partial<TrainingApplicationPayload>
): {
  isValid: boolean;
  errors: TrainingValidationErrors;
} {
  const errors: TrainingValidationErrors = {};

  // 1. Participant Type
  if (!data.applicantType || !["individual", "organization"].includes(data.applicantType)) {
    errors.applicantType = "Please select whether you are applying as an Individual or an Organization.";
  }

  // 2. Biodata
  if (data.applicantType === "individual") {
    const cleanName = sanitizeInput(data.fullName || "");
    if (!cleanName || cleanName.length < 2) {
      errors.fullName = "Full name is required (minimum 2 characters).";
    }

    const cleanEmail = sanitizeInput(data.email || "");
    if (!cleanEmail || !isValidEmailAddress(cleanEmail)) {
      errors.email = "A valid email address is required.";
    }
  } else if (data.applicantType === "organization") {
    const cleanOrg = sanitizeInput(data.organizationName || "");
    if (!cleanOrg || cleanOrg.length < 2) {
      errors.organizationName = "Organization name is required (minimum 2 characters).";
    }

    const cleanBizEmail = sanitizeInput(data.businessEmail || "");
    if (!cleanBizEmail || !isValidEmailAddress(cleanBizEmail)) {
      errors.businessEmail = "A valid business email address is required.";
    }
  }

  // 3. Course Selection
  if (!data.course || !TRAINING_COURSES.includes(data.course as TrainingCourse)) {
    errors.course = "Please select a valid IT training course.";
  } else if (data.course === "Customized Training") {
    const customReq = sanitizeInput(data.customTrainingRequest || "");
    if (!customReq || customReq.length < 5) {
      errors.customTrainingRequest = "Please describe what training you or your organization needs.";
    }
  }

  // 4. Training Schedule
  if (!data.preferredStartDate) {
    errors.preferredStartDate = "Please select a preferred start date.";
  } else {
    const today = getLagosTodayIsoDate();
    if (data.preferredStartDate < today) {
      errors.preferredStartDate = "Preferred start date cannot be in the past.";
    }
  }

  // Training Days: EXACTLY 3 days per week
  if (!data.trainingDays || !Array.isArray(data.trainingDays) || data.trainingDays.length !== 3) {
    errors.trainingDays = "Please select exactly 3 training days.";
  } else {
    const allValidDays = data.trainingDays.every((d) => TRAINING_DAYS.includes(d as TrainingDay));
    if (!allValidDays) {
      errors.trainingDays = "Invalid training day selection.";
    }
  }

  // Preferred Training Time
  const cleanTime = sanitizeInput(data.preferredTime || "");
  if (!cleanTime) {
    errors.preferredTime = "Please select your preferred training time.";
  }

  // 5. Acknowledgement & Agreement
  if (data.acknowledgementAccepted !== true) {
    errors.acknowledgementAccepted = "You must acknowledge and agree to the training terms before submitting.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
