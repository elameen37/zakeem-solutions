/**
 * Zakeem Solutions — Canonical CRM Types & Entities
 * Phase 26C: Persistent Lead, Organization, Contact, Opportunity & Activity Foundation
 */

export type OrganizationStatus =
  | "lead"
  | "prospect"
  | "customer"
  | "churned"
  | "partner";

export interface CRMOrganization {
  id: string;
  name: string;
  slug: string;
  domain?: string | null;
  industry?: string | null;
  companySize?: string | null;
  status: OrganizationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CRMContact {
  id: string;
  organizationId?: string | null;
  organization?: CRMOrganization | null;
  email: string;
  fullName: string;
  phone?: string | null;
  jobTitle?: string | null;
  profileId?: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "disqualified";

/**
 * Strict CRM Lead Lifecycle Governance Transitions.
 * Terminal states (converted, disqualified) cannot be transitioned further.
 */
export const VALID_LEAD_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  new: ["contacted", "disqualified"],
  contacted: ["qualified", "disqualified"],
  qualified: ["converted", "disqualified"],
  converted: [], // Terminal
  disqualified: [], // Terminal
};

export interface CRMLeadBookingSummary {
  id: string;
  referenceId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface CRMLeadOpportunitySummary {
  id: string;
  title: string;
  stage: OpportunityStage;
  dealValueNgn?: number | null;
}

export interface CRMLeadInvitationSummary {
  id: string;
  status: string;
  expiresAt: string;
  acceptedAt?: string | null;
}

export interface CRMLead {
  id: string;
  referenceId: string; // Format: ZK-YYYYMM-XXXX
  organizationId?: string | null;
  organization?: CRMOrganization | null;
  contactId?: string | null;
  contact?: CRMContact | null;
  formType: "contact" | "demo";
  status: LeadStatus;
  productInterest?: string | null;
  tier?: string | null;
  suite?: string | null;
  billing?: string | null;
  deployment?: string | null;
  inquiryCategory?: string | null;
  notes?: string | null;
  attribution: Record<string, unknown>;
  disqualificationReason?: string | null;
  convertedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  // Associated entities (when resolved)
  booking?: CRMLeadBookingSummary | null;
  opportunity?: CRMLeadOpportunitySummary | null;
  invitation?: CRMLeadInvitationSummary | null;
}

export type OpportunityStage =
  | "discovery"
  | "demo_scheduled"
  | "demo_completed"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

/**
 * Strict CRM Opportunity Stage Governance Transitions.
 * Terminal states (won, lost) cannot be transitioned further.
 */
export const VALID_OPPORTUNITY_TRANSITIONS: Record<OpportunityStage, OpportunityStage[]> = {
  discovery: ["demo_scheduled", "demo_completed", "proposal", "lost"],
  demo_scheduled: ["demo_completed", "proposal", "lost"],
  demo_completed: ["proposal", "negotiation", "lost"],
  proposal: ["negotiation", "won", "lost"],
  negotiation: ["won", "lost"],
  won: [], // Terminal
  lost: [], // Terminal
};

export interface CRMOpportunity {
  id: string;
  organizationId: string;
  organization?: CRMOrganization | null;
  contactId?: string | null;
  contact?: CRMContact | null;
  leadId?: string | null;
  lead?: CRMLead | null;
  title: string;
  primaryProduct: string;
  stage: OpportunityStage;
  dealValueNgn?: number | null;
  closeDate?: string | null;
  lossReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CRMOpportunityDetail extends CRMOpportunity {
  booking?: CRMLeadBookingSummary | null;
  activities: CRMActivity[];
}

export interface CRMOrganizationDetail extends CRMOrganization {
  contacts: CRMContact[];
  leads: CRMLead[];
  opportunities: CRMOpportunity[];
  bookings: CRMLeadBookingSummary[];
  contactsCount: number;
  leadsCount: number;
  opportunitiesCount: number;
  activeOpportunitiesCount: number;
}

export interface CRMContactDetail extends CRMContact {
  leads: CRMLead[];
  opportunities: CRMOpportunity[];
  bookings: CRMLeadBookingSummary[];
}

export type CRMActivityType =
  | "lead_created"
  | "lead_status_changed"
  | "demo_booked"
  | "demo_rescheduled"
  | "demo_cancelled"
  | "demo_completed"
  | "opportunity_created"
  | "stage_changed"
  | "invitation_sent"
  | "invitation_accepted"
  | "invitation_revoked"
  | "note_added"
  | "email_sent";

export interface CRMActivity {
  id: string;
  activityType: CRMActivityType;
  organizationId?: string | null;
  organization?: CRMOrganization | null;
  contactId?: string | null;
  contact?: CRMContact | null;
  leadId?: string | null;
  bookingId?: string | null;
  opportunityId?: string | null;
  actorId?: string | null;
  title: string;
  description?: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface CRMStats {
  totalLeads: number;
  newLeads: number;
  activeOpportunities: number;
  totalOrganizations: number;
  totalContacts: number;
}
