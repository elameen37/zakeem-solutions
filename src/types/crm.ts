/**
 * Zakeem Solutions — Canonical CRM Types & Entities
 * Phase 26B: Persistent Lead, Organization, Contact, Opportunity & Activity Foundation
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
}

export type OpportunityStage =
  | "discovery"
  | "demo_scheduled"
  | "demo_completed"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

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
