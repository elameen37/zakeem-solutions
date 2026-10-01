/**
 * Zakeem Solutions — IT Training Application Type Definitions
 * Phase 71B: Zakeem IT Training Fully Online Application & Delivery
 */

export type ApplicantType = "individual" | "organization";

export const TRAINING_COURSES = [
  "Digital Literacy",
  "FutureReadyAI",
  "Web Development using AI",
  "Digital Literacy and FutureReadyAI",
  "FutureReadyAI and Web Development using AI",
  "Customized Training",
] as const;

export type TrainingCourse = (typeof TRAINING_COURSES)[number];

export const TRAINING_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type TrainingDay = (typeof TRAINING_DAYS)[number];

export interface TrainingApplicationFormValues {
  applicantType: ApplicantType;
  fullName: string;
  email: string;
  organizationName: string;
  businessEmail: string;
  course: TrainingCourse | "";
  customTrainingRequest: string;
  preferredStartDate: string;
  trainingDays: TrainingDay[];
  sessionDurationMinutes: number; // Always 120 (2 hours)
  preferredTime: string; // e.g. "10:00"
  timezone: string; // "Africa/Lagos"
  acknowledgementAccepted: boolean;
  honeypot?: string;
}

export interface TrainingApplicationPayload {
  applicantType: ApplicantType;
  fullName?: string;
  email?: string;
  organizationName?: string;
  businessEmail?: string;
  course: TrainingCourse;
  customTrainingRequest?: string;
  preferredStartDate: string;
  trainingDays: TrainingDay[];
  sessionDurationMinutes: number;
  preferredTime: string;
  timezone: string;
  acknowledgementAccepted: boolean;
  applicationReference?: string;
  honeypot?: string;
}

export type TrainingApplicationStatus = "submitted" | "in_review" | "confirmed" | "cancelled";

export const VALID_TRAINING_STATUS_TRANSITIONS: Record<
  TrainingApplicationStatus,
  TrainingApplicationStatus[]
> = {
  submitted: ["in_review", "confirmed", "cancelled"],
  in_review: ["confirmed", "cancelled"],
  confirmed: [], // Terminal
  cancelled: [], // Terminal
};

export interface TrainingApplicationRecord extends TrainingApplicationPayload {
  id: string;
  applicationReference: string;
  acknowledgementAcceptedAt: string;
  status: TrainingApplicationStatus;
  crmLeadId?: string;
  cancellationReason?: string;
  adminNotes?: string;
  reviewedAt?: string;
  confirmedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  // CRM expansion metadata (if joined)
  crmOrganizationName?: string;
  crmContactName?: string;
  crmLeadStatus?: string;
}

export interface TrainingSubmissionResult {
  success: boolean;
  applicationReference?: string;
  record?: TrainingApplicationRecord;
  error?: string;
  crmLeadId?: string;
  internalEmailDispatched?: boolean;
  applicantEmailDispatched?: boolean;
}

export interface TrainingApplicationFilter {
  applicantType?: "all" | ApplicantType;
  status?: "all" | TrainingApplicationStatus;
  course?: "all" | TrainingCourse;
  crmStatus?: "all" | "linked" | "unlinked";
  search?: string;
  startDateFrom?: string;
  startDateTo?: string;
}

export interface TrainingKPIStats {
  totalApplications: number;
  submitted: number;
  inReview: number;
  confirmed: number;
  cancelled: number;
  organizations: number;
  individuals: number;
}
