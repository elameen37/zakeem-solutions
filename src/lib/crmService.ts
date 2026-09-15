/**
 * Zakeem Solutions — Canonical CRM Service Layer
 * Phase 26B: Centralized API for Leads, Organizations, Contacts, Opportunities & Activities
 */

import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import {
  CRMActivity,
  CRMContact,
  CRMLead,
  CRMOpportunity,
  CRMOrganization,
  CRMStats,
  LeadStatus,
  OpportunityStage,
} from "@/types/crm";

// Local storage keys for non-production / offline fallback
const STORAGE_KEYS = {
  LEADS: "zakeem_crm_leads",
  ORGANIZATIONS: "zakeem_crm_organizations",
  CONTACTS: "zakeem_crm_contacts",
  OPPORTUNITIES: "zakeem_crm_opportunities",
  ACTIVITIES: "zakeem_crm_activities",
};

function getStored<T>(key: string, defaultVal: T[]): T[] {
  if (typeof window === "undefined") return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStored<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Non-blocking
  }
}

// -----------------------------------------------------------------------------
// LEADS RETRIEVAL & MANAGEMENT
// -----------------------------------------------------------------------------

export async function getAdminLeads(filters?: {
  status?: LeadStatus;
  formType?: string;
}): Promise<{ success: boolean; leads: CRMLead[]; error?: string }> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, leads: [], error: "Database client unavailable." };
    }

    try {
      let query = client
        .from("crm_leads")
        .select(`
          id, reference_id, organization_id, contact_id, form_type, status,
          product_interest, tier, suite, billing, deployment, inquiry_category,
          notes, attribution, disqualification_reason, converted_at, created_at, updated_at,
          organization:crm_organizations(id, name, slug, domain, industry, status, created_at, updated_at),
          contact:crm_contacts(id, organization_id, email, full_name, phone, job_title, profile_id, is_primary, created_at, updated_at)
        `)
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.formType) {
        query = query.eq("form_type", filters.formType);
      }

      const { data, error } = await query;
      if (error) {
        return { success: false, leads: [], error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const leads: CRMLead[] = (data || []).map((row: any) => ({
        id: row.id,
        referenceId: row.reference_id,
        organizationId: row.organization_id,
        contactId: row.contact_id,
        formType: row.form_type,
        status: row.status,
        productInterest: row.product_interest,
        tier: row.tier,
        suite: row.suite,
        billing: row.billing,
        deployment: row.deployment,
        inquiryCategory: row.inquiry_category,
        notes: row.notes,
        attribution: row.attribution || {},
        disqualificationReason: row.disqualification_reason,
        convertedAt: row.converted_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        organization: row.organization
          ? {
              id: row.organization.id,
              name: row.organization.name,
              slug: row.organization.slug,
              domain: row.organization.domain,
              industry: row.organization.industry,
              status: row.organization.status,
              createdAt: row.organization.created_at,
              updatedAt: row.organization.updated_at,
            }
          : null,
        contact: row.contact
          ? {
              id: row.contact.id,
              organizationId: row.contact.organization_id,
              email: row.contact.email,
              fullName: row.contact.full_name,
              phone: row.contact.phone,
              jobTitle: row.contact.job_title,
              profileId: row.contact.profile_id,
              isPrimary: Boolean(row.contact.is_primary),
              createdAt: row.contact.created_at,
              updatedAt: row.contact.updated_at,
            }
          : null,
      }));

      return { success: true, leads };
    } catch (err: any) {
      return { success: false, leads: [], error: err?.message || "Failed to fetch leads." };
    }
  }

  // Local fallback
  let list = getStored<CRMLead>(STORAGE_KEYS.LEADS, []);
  if (filters?.status) {
    list = list.filter((l) => l.status === filters.status);
  }
  if (filters?.formType) {
    list = list.filter((l) => l.formType === filters.formType);
  }
  return { success: true, leads: list };
}

export async function updateLeadStatus(
  leadId: string,
  newStatus: LeadStatus,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, error: "Database client unavailable." };
    }

    try {
      const updatePayload: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };
      if (newStatus === "disqualified" && reason) {
        updatePayload.disqualification_reason = reason;
      }
      if (newStatus === "converted") {
        updatePayload.converted_at = new Date().toISOString();
      }

      const { data: leadData, error: fetchErr } = await client
        .from("crm_leads")
        .select("id, organization_id, contact_id, reference_id")
        .eq("id", leadId)
        .single();

      if (fetchErr) {
        return { success: false, error: fetchErr.message };
      }

      const { error: updateErr } = await client
        .from("crm_leads")
        .update(updatePayload)
        .eq("id", leadId);

      if (updateErr) {
        return { success: false, error: updateErr.message };
      }

      // Record status change activity
      await client.from("crm_activities").insert({
        activity_type: "lead_status_changed",
        organization_id: leadData?.organization_id || null,
        contact_id: leadData?.contact_id || null,
        lead_id: leadId,
        title: `Lead status transitioned to ${newStatus}`,
        description: reason ? `Reason: ${reason}` : undefined,
        metadata: {
          new_status: newStatus,
          reference_id: leadData?.reference_id,
        },
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed to update lead status." };
    }
  }

  // Local fallback
  const list = getStored<CRMLead>(STORAGE_KEYS.LEADS, []);
  const idx = list.findIndex((l) => l.id === leadId);
  if (idx >= 0) {
    list[idx] = {
      ...list[idx],
      status: newStatus,
      disqualificationReason: newStatus === "disqualified" ? reason : list[idx].disqualificationReason,
      convertedAt: newStatus === "converted" ? new Date().toISOString() : list[idx].convertedAt,
      updatedAt: new Date().toISOString(),
    };
    setStored(STORAGE_KEYS.LEADS, list);
    return { success: true };
  }
  return { success: false, error: "Lead not found." };
}

// -----------------------------------------------------------------------------
// ORGANIZATIONS & ACCOUNTS
// -----------------------------------------------------------------------------

export async function getAdminOrganizations(): Promise<{
  success: boolean;
  organizations: CRMOrganization[];
  error?: string;
}> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, organizations: [], error: "Database client unavailable." };
    }

    try {
      const { data, error } = await client
        .from("crm_organizations")
        .select("id, name, slug, domain, industry, company_size, status, created_at, updated_at")
        .order("name", { ascending: true });

      if (error) {
        return { success: false, organizations: [], error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orgs: CRMOrganization[] = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        domain: row.domain,
        industry: row.industry,
        companySize: row.company_size,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      return { success: true, organizations: orgs };
    } catch (err: any) {
      return { success: false, organizations: [], error: err?.message || "Failed to fetch organizations." };
    }
  }

  return { success: true, organizations: getStored<CRMOrganization>(STORAGE_KEYS.ORGANIZATIONS, []) };
}

// -----------------------------------------------------------------------------
// CONTACTS & DECISION MAKERS
// -----------------------------------------------------------------------------

export async function getAdminContacts(): Promise<{
  success: boolean;
  contacts: CRMContact[];
  error?: string;
}> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, contacts: [], error: "Database client unavailable." };
    }

    try {
      const { data, error } = await client
        .from("crm_contacts")
        .select(`
          id, organization_id, email, full_name, phone, job_title, profile_id, is_primary, created_at, updated_at,
          organization:crm_organizations(id, name, slug, domain, industry, status, created_at, updated_at)
        `)
        .order("full_name", { ascending: true });

      if (error) {
        return { success: false, contacts: [], error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contacts: CRMContact[] = (data || []).map((row: any) => ({
        id: row.id,
        organizationId: row.organization_id,
        email: row.email,
        fullName: row.full_name,
        phone: row.phone,
        jobTitle: row.job_title,
        profileId: row.profile_id,
        isPrimary: Boolean(row.is_primary),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        organization: row.organization
          ? {
              id: row.organization.id,
              name: row.organization.name,
              slug: row.organization.slug,
              domain: row.organization.domain,
              industry: row.organization.industry,
              status: row.organization.status,
              createdAt: row.organization.created_at,
              updatedAt: row.organization.updated_at,
            }
          : null,
      }));

      return { success: true, contacts };
    } catch (err: any) {
      return { success: false, contacts: [], error: err?.message || "Failed to fetch contacts." };
    }
  }

  return { success: true, contacts: getStored<CRMContact>(STORAGE_KEYS.CONTACTS, []) };
}

// -----------------------------------------------------------------------------
// OPPORTUNITIES & DEALS
// -----------------------------------------------------------------------------

export async function getAdminOpportunities(): Promise<{
  success: boolean;
  opportunities: CRMOpportunity[];
  error?: string;
}> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, opportunities: [], error: "Database client unavailable." };
    }

    try {
      const { data, error } = await client
        .from("crm_opportunities")
        .select(`
          id, organization_id, contact_id, lead_id, title, primary_product, stage,
          deal_value_ngn, close_date, loss_reason, created_at, updated_at,
          organization:crm_organizations(id, name, slug, domain, status, created_at, updated_at),
          contact:crm_contacts(id, email, full_name, phone, job_title, created_at, updated_at)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        return { success: false, opportunities: [], error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const opps: CRMOpportunity[] = (data || []).map((row: any) => ({
        id: row.id,
        organizationId: row.organization_id,
        contactId: row.contact_id,
        leadId: row.lead_id,
        title: row.title,
        primaryProduct: row.primary_product,
        stage: row.stage,
        dealValueNgn: row.deal_value_ngn ? Number(row.deal_value_ngn) : null,
        closeDate: row.close_date,
        lossReason: row.loss_reason,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        organization: row.organization
          ? {
              id: row.organization.id,
              name: row.organization.name,
              slug: row.organization.slug,
              domain: row.organization.domain,
              status: row.organization.status,
              createdAt: row.organization.created_at,
              updatedAt: row.organization.updated_at,
            }
          : null,
        contact: row.contact
          ? {
              id: row.contact.id,
              organizationId: row.organization_id,
              email: row.contact.email,
              fullName: row.contact.full_name,
              phone: row.contact.phone,
              jobTitle: row.contact.job_title,
              isPrimary: false,
              createdAt: row.contact.created_at,
              updatedAt: row.contact.updated_at,
            }
          : null,
      }));

      return { success: true, opportunities: opps };
    } catch (err: any) {
      return { success: false, opportunities: [], error: err?.message || "Failed to fetch opportunities." };
    }
  }

  return { success: true, opportunities: getStored<CRMOpportunity>(STORAGE_KEYS.OPPORTUNITIES, []) };
}

export async function updateOpportunityStage(
  opportunityId: string,
  newStage: OpportunityStage,
  options?: { dealValueNgn?: number; lossReason?: string; closeDate?: string }
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, error: "Database client unavailable." };
    }

    try {
      const updatePayload: Record<string, unknown> = {
        stage: newStage,
        updated_at: new Date().toISOString(),
      };
      if (options?.dealValueNgn !== undefined) {
        updatePayload.deal_value_ngn = options.dealValueNgn;
      }
      if (options?.lossReason) {
        updatePayload.loss_reason = options.lossReason;
      }
      if (options?.closeDate) {
        updatePayload.close_date = options.closeDate;
      }

      const { data: opp, error: fetchErr } = await client
        .from("crm_opportunities")
        .select("id, organization_id, contact_id, lead_id, title, primary_product")
        .eq("id", opportunityId)
        .single();

      if (fetchErr) {
        return { success: false, error: fetchErr.message };
      }

      const { error: updateErr } = await client
        .from("crm_opportunities")
        .update(updatePayload)
        .eq("id", opportunityId);

      if (updateErr) {
        return { success: false, error: updateErr.message };
      }

      // Record stage_changed activity
      await client.from("crm_activities").insert({
        activity_type: "stage_changed",
        organization_id: opp?.organization_id || null,
        contact_id: opp?.contact_id || null,
        lead_id: opp?.lead_id || null,
        opportunity_id: opportunityId,
        title: `Opportunity stage updated to ${newStage}`,
        description: options?.lossReason ? `Loss reason: ${options.lossReason}` : undefined,
        metadata: {
          new_stage: newStage,
          title: opp?.title,
          deal_value_ngn: options?.dealValueNgn,
        },
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed to update opportunity stage." };
    }
  }

  // Local fallback
  const list = getStored<CRMOpportunity>(STORAGE_KEYS.OPPORTUNITIES, []);
  const idx = list.findIndex((o) => o.id === opportunityId);
  if (idx >= 0) {
    list[idx] = {
      ...list[idx],
      stage: newStage,
      dealValueNgn: options?.dealValueNgn !== undefined ? options.dealValueNgn : list[idx].dealValueNgn,
      lossReason: options?.lossReason || list[idx].lossReason,
      closeDate: options?.closeDate || list[idx].closeDate,
      updatedAt: new Date().toISOString(),
    };
    setStored(STORAGE_KEYS.OPPORTUNITIES, list);
    return { success: true };
  }
  return { success: false, error: "Opportunity not found." };
}

// -----------------------------------------------------------------------------
// ACTIVITIES & TIMELINE
// -----------------------------------------------------------------------------

export async function getAdminActivities(filters?: {
  organizationId?: string;
  contactId?: string;
  leadId?: string;
  opportunityId?: string;
  limit?: number;
}): Promise<{ success: boolean; activities: CRMActivity[]; error?: string }> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, activities: [], error: "Database client unavailable." };
    }

    try {
      let query = client
        .from("crm_activities")
        .select("id, activity_type, organization_id, contact_id, lead_id, booking_id, opportunity_id, actor_id, title, description, metadata, created_at")
        .order("created_at", { ascending: false })
        .limit(filters?.limit || 50);

      if (filters?.organizationId) {
        query = query.eq("organization_id", filters.organizationId);
      }
      if (filters?.contactId) {
        query = query.eq("contact_id", filters.contactId);
      }
      if (filters?.leadId) {
        query = query.eq("lead_id", filters.leadId);
      }
      if (filters?.opportunityId) {
        query = query.eq("opportunity_id", filters.opportunityId);
      }

      const { data, error } = await query;
      if (error) {
        return { success: false, activities: [], error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const activities: CRMActivity[] = (data || []).map((row: any) => ({
        id: row.id,
        activityType: row.activity_type,
        organizationId: row.organization_id,
        contactId: row.contact_id,
        leadId: row.lead_id,
        bookingId: row.booking_id,
        opportunityId: row.opportunity_id,
        actorId: row.actor_id,
        title: row.title,
        description: row.description,
        metadata: row.metadata || {},
        createdAt: row.created_at,
      }));

      return { success: true, activities };
    } catch (err: any) {
      return { success: false, activities: [], error: err?.message || "Failed to fetch activities." };
    }
  }

  return { success: true, activities: getStored<CRMActivity>(STORAGE_KEYS.ACTIVITIES, []) };
}

export async function addCRMNote(params: {
  organizationId?: string;
  contactId?: string;
  leadId?: string;
  opportunityId?: string;
  title: string;
  notes: string;
}): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, error: "Database client unavailable." };
    }

    try {
      const { error } = await client.from("crm_activities").insert({
        activity_type: "note_added",
        organization_id: params.organizationId || null,
        contact_id: params.contactId || null,
        lead_id: params.leadId || null,
        opportunity_id: params.opportunityId || null,
        title: params.title.trim(),
        description: params.notes.trim(),
        metadata: {},
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed to record CRM note." };
    }
  }

  return { success: true };
}

// -----------------------------------------------------------------------------
// SUMMARY & STATISTICS
// -----------------------------------------------------------------------------

export async function getCRMStats(): Promise<{
  success: boolean;
  stats: CRMStats;
  error?: string;
}> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (!client) {
      return {
        success: false,
        stats: { totalLeads: 0, newLeads: 0, activeOpportunities: 0, totalOrganizations: 0, totalContacts: 0 },
        error: "Database client unavailable.",
      };
    }

    try {
      const [leadsRes, newLeadsRes, oppsRes, orgsRes, contactsRes] = await Promise.all([
        client.from("crm_leads").select("id", { count: "exact", head: true }),
        client.from("crm_leads").select("id", { count: "exact", head: true }).eq("status", "new"),
        client.from("crm_opportunities").select("id", { count: "exact", head: true }).not("stage", "in", '("won","lost")'),
        client.from("crm_organizations").select("id", { count: "exact", head: true }),
        client.from("crm_contacts").select("id", { count: "exact", head: true }),
      ]);

      return {
        success: true,
        stats: {
          totalLeads: leadsRes.count || 0,
          newLeads: newLeadsRes.count || 0,
          activeOpportunities: oppsRes.count || 0,
          totalOrganizations: orgsRes.count || 0,
          totalContacts: contactsRes.count || 0,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        stats: { totalLeads: 0, newLeads: 0, activeOpportunities: 0, totalOrganizations: 0, totalContacts: 0 },
        error: err?.message || "Failed to fetch CRM statistics.",
      };
    }
  }

  const leads = getStored<CRMLead>(STORAGE_KEYS.LEADS, []);
  const opps = getStored<CRMOpportunity>(STORAGE_KEYS.OPPORTUNITIES, []);
  const orgs = getStored<CRMOrganization>(STORAGE_KEYS.ORGANIZATIONS, []);
  const contacts = getStored<CRMContact>(STORAGE_KEYS.CONTACTS, []);

  return {
    success: true,
    stats: {
      totalLeads: leads.length,
      newLeads: leads.filter((l) => l.status === "new").length,
      activeOpportunities: opps.filter((o) => o.stage !== "won" && o.stage !== "lost").length,
      totalOrganizations: orgs.length,
      totalContacts: contacts.length,
    },
  };
}
