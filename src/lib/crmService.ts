/**
 * Zakeem Solutions — Canonical CRM Service Layer
 * Phase 26C: Centralized API for Leads, Organizations, Contacts, Opportunities & Activities
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
  VALID_LEAD_TRANSITIONS,
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

function emitAnalyticsEvent(name: string, detail: Record<string, unknown>): void {
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(
        new CustomEvent(name, {
          bubbles: true,
          detail,
        })
      );
    } catch {
      // Non-blocking
    }
  }
}

// -----------------------------------------------------------------------------
// LEADS RETRIEVAL & MANAGEMENT
// -----------------------------------------------------------------------------

export async function getAdminLeads(filters?: {
  status?: LeadStatus;
  formType?: string;
  product?: string;
  search?: string;
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
      if (filters?.product) {
        query = query.eq("product_interest", filters.product);
      }

      const { data, error } = await query;
      if (error) {
        return { success: false, leads: [], error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let leads: CRMLead[] = (data || []).map((row: any) => ({
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

      // Apply client-side search filtering if present
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        leads = leads.filter(
          (l) =>
            l.referenceId.toLowerCase().includes(q) ||
            l.contact?.fullName.toLowerCase().includes(q) ||
            l.contact?.email.toLowerCase().includes(q) ||
            l.organization?.name.toLowerCase().includes(q) ||
            (l.productInterest && l.productInterest.toLowerCase().includes(q))
        );
      }

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
  if (filters?.product) {
    list = list.filter((l) => l.productInterest === filters.product);
  }
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (l) =>
        l.referenceId.toLowerCase().includes(q) ||
        l.contact?.fullName.toLowerCase().includes(q) ||
        l.contact?.email.toLowerCase().includes(q) ||
        l.organization?.name.toLowerCase().includes(q) ||
        (l.productInterest && l.productInterest.toLowerCase().includes(q))
    );
  }
  return { success: true, leads: list };
}

/**
 * Retrieves comprehensive detail for a single lead, including associated
 * booking, opportunity, invitation, and activities.
 */
export async function getLeadDetails(
  leadId: string
): Promise<{ success: boolean; lead?: CRMLead; activities: CRMActivity[]; error?: string }> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, activities: [], error: "Database client unavailable." };
    }

    try {
      // 1. Fetch lead
      const { data: row, error: leadErr } = await client
        .from("crm_leads")
        .select(`
          id, reference_id, organization_id, contact_id, form_type, status,
          product_interest, tier, suite, billing, deployment, inquiry_category,
          notes, attribution, disqualification_reason, converted_at, created_at, updated_at,
          organization:crm_organizations(id, name, slug, domain, industry, company_size, status, created_at, updated_at),
          contact:crm_contacts(id, organization_id, email, full_name, phone, job_title, profile_id, is_primary, created_at, updated_at)
        `)
        .eq("id", leadId)
        .single();

      if (leadErr || !row) {
        return { success: false, activities: [], error: leadErr?.message || "Lead not found." };
      }

      // 2. Fetch associated booking (if any)
      const { data: bookingRow } = await client
        .from("bookings")
        .select("id, reference_id, booking_date, start_time, end_time, status")
        .or(`lead_id.eq.${row.reference_id},contact_id.eq.${row.contact_id || '00000000-0000-0000-0000-000000000000'}`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // 3. Fetch associated opportunity (if any)
      const { data: oppRow } = await client
        .from("crm_opportunities")
        .select("id, title, stage, deal_value_ngn")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // 4. Fetch associated invitation (if any)
      const { data: invRow } = await client
        .from("client_invitations")
        .select("id, status, expires_at, accepted_at")
        .or(`lead_id.eq.${row.reference_id},contact_id.eq.${row.contact_id || '00000000-0000-0000-0000-000000000000'}`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // 5. Fetch associated activities
      const { data: actRows } = await client
        .from("crm_activities")
        .select("id, activity_type, organization_id, contact_id, lead_id, booking_id, opportunity_id, actor_id, title, description, metadata, created_at")
        .or(`lead_id.eq.${leadId},contact_id.eq.${row.contact_id || '00000000-0000-0000-0000-000000000000'}`)
        .order("created_at", { ascending: false })
        .limit(40);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lead: CRMLead = {
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
        organization: (row as any).organization
          ? {
              id: (row as any).organization.id,
              name: (row as any).organization.name,
              slug: (row as any).organization.slug,
              domain: (row as any).organization.domain,
              industry: (row as any).organization.industry,
              companySize: (row as any).organization.company_size,
              status: (row as any).organization.status,
              createdAt: (row as any).organization.created_at,
              updatedAt: (row as any).organization.updated_at,
            }
          : null,
        contact: (row as any).contact
          ? {
              id: (row as any).contact.id,
              organizationId: (row as any).contact.organization_id,
              email: (row as any).contact.email,
              fullName: (row as any).contact.full_name,
              phone: (row as any).contact.phone,
              jobTitle: (row as any).contact.job_title,
              profileId: (row as any).contact.profile_id,
              isPrimary: Boolean((row as any).contact.is_primary),
              createdAt: (row as any).contact.created_at,
              updatedAt: (row as any).contact.updated_at,
            }
          : null,
        booking: bookingRow
          ? {
              id: bookingRow.id,
              referenceId: bookingRow.reference_id,
              bookingDate: bookingRow.booking_date,
              startTime: bookingRow.start_time,
              endTime: bookingRow.end_time,
              status: bookingRow.status,
            }
          : null,
        opportunity: oppRow
          ? {
              id: oppRow.id,
              title: oppRow.title,
              stage: oppRow.stage,
              dealValueNgn: oppRow.deal_value_ngn ? Number(oppRow.deal_value_ngn) : null,
            }
          : null,
        invitation: invRow
          ? {
              id: invRow.id,
              status: invRow.status,
              expiresAt: invRow.expires_at,
              acceptedAt: invRow.accepted_at,
            }
          : null,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const activities: CRMActivity[] = (actRows || []).map((a: any) => ({
        id: a.id,
        activityType: a.activity_type,
        organizationId: a.organization_id,
        contactId: a.contact_id,
        leadId: a.lead_id,
        bookingId: a.booking_id,
        opportunityId: a.opportunity_id,
        actorId: a.actor_id,
        title: a.title,
        description: a.description,
        metadata: a.metadata || {},
        createdAt: a.created_at,
      }));

      emitAnalyticsEvent("crm:lead_viewed", {
        leadId,
        referenceId: lead.referenceId,
        status: lead.status,
      });

      return { success: true, lead, activities };
    } catch (err: any) {
      return { success: false, activities: [], error: err?.message || "Failed to load lead details." };
    }
  }

  // Local fallback
  const list = getStored<CRMLead>(STORAGE_KEYS.LEADS, []);
  const found = list.find((l) => l.id === leadId);
  if (!found) {
    return { success: false, activities: [], error: "Lead not found." };
  }
  const allActs = getStored<CRMActivity>(STORAGE_KEYS.ACTIVITIES, []);
  const leadActs = allActs.filter((a) => a.leadId === leadId);
  return { success: true, lead: found, activities: leadActs };
}

/**
 * Executes a controlled, validated lifecycle status transition for a lead.
 * Enforces strict transition rules and requires a reason for disqualification.
 */
export async function updateLeadStatus(
  leadId: string,
  newStatus: LeadStatus,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Client-side state machine validation
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, error: "Database client unavailable." };
    }

    try {
      // First attempt the atomic database RPC for lifecycle enforcement
      const { data: rpcData, error: rpcErr } = await client.rpc("update_lead_status_atomic", {
        p_lead_id: leadId,
        p_new_status: newStatus,
        p_reason: reason || null,
      });

      if (!rpcErr && rpcData) {
        if (rpcData.success === false) {
          return { success: false, error: rpcData.error || "Transition rejected by database rules." };
        }
        emitAnalyticsEvent("crm:lead_status_changed", {
          leadId,
          newStatus,
          reason,
        });
        if (newStatus === "disqualified") {
          emitAnalyticsEvent("crm:lead_disqualified", { leadId, reason });
        }
        return { success: true };
      }

      // Fallback if RPC migration is not yet pushed to remote instance:
      // Perform strict validation and direct update under RLS
      const { data: leadData, error: fetchErr } = await client
        .from("crm_leads")
        .select("id, reference_id, organization_id, contact_id, status")
        .eq("id", leadId)
        .single();

      if (fetchErr || !leadData) {
        return { success: false, error: fetchErr?.message || "Lead not found." };
      }

      const currentStatus = leadData.status as LeadStatus;
      const allowed = VALID_LEAD_TRANSITIONS[currentStatus] || [];
      if (!allowed.includes(newStatus)) {
        return {
          success: false,
          error: `Invalid lifecycle transition: cannot move from [${currentStatus}] to [${newStatus}].`,
        };
      }

      if (newStatus === "disqualified" && (!reason || reason.trim().length < 3)) {
        return { success: false, error: "A specific disqualification reason (minimum 3 characters) is required." };
      }

      const updatePayload: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };
      if (newStatus === "disqualified") {
        updatePayload.disqualification_reason = reason!.trim();
      }
      if (newStatus === "converted") {
        updatePayload.converted_at = new Date().toISOString();
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
        organization_id: leadData.organization_id || null,
        contact_id: leadData.contact_id || null,
        lead_id: leadId,
        title: `Lead status transitioned to ${newStatus}`,
        description: reason ? `Reason: ${reason.trim()}` : undefined,
        metadata: {
          previous_status: currentStatus,
          new_status: newStatus,
          reason: reason?.trim(),
          reference_id: leadData.reference_id,
        },
      });

      emitAnalyticsEvent("crm:lead_status_changed", {
        leadId,
        newStatus,
        reason,
      });
      if (newStatus === "disqualified") {
        emitAnalyticsEvent("crm:lead_disqualified", { leadId, reason });
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed to update lead status." };
    }
  }

  // Local development fallback
  const list = getStored<CRMLead>(STORAGE_KEYS.LEADS, []);
  const idx = list.findIndex((l) => l.id === leadId);
  if (idx < 0) {
    return { success: false, error: "Lead not found." };
  }

  const current = list[idx].status;
  const allowed = VALID_LEAD_TRANSITIONS[current] || [];
  if (!allowed.includes(newStatus)) {
    return {
      success: false,
      error: `Invalid lifecycle transition: cannot move from [${current}] to [${newStatus}].`,
    };
  }

  if (newStatus === "disqualified" && (!reason || reason.trim().length < 3)) {
    return { success: false, error: "A specific disqualification reason (minimum 3 characters) is required." };
  }

  list[idx] = {
    ...list[idx],
    status: newStatus,
    disqualificationReason: newStatus === "disqualified" ? reason!.trim() : list[idx].disqualificationReason,
    convertedAt: newStatus === "converted" ? new Date().toISOString() : list[idx].convertedAt,
    updatedAt: new Date().toISOString(),
  };
  setStored(STORAGE_KEYS.LEADS, list);

  // Record mock activity
  const activities = getStored<CRMActivity>(STORAGE_KEYS.ACTIVITIES, []);
  activities.unshift({
    id: `act-${Date.now()}`,
    activityType: "lead_status_changed",
    organizationId: list[idx].organizationId,
    contactId: list[idx].contactId,
    leadId: list[idx].id,
    title: `Lead status transitioned to ${newStatus}`,
    description: reason ? `Reason: ${reason.trim()}` : undefined,
    metadata: { previous_status: current, new_status: newStatus },
    createdAt: new Date().toISOString(),
  });
  setStored(STORAGE_KEYS.ACTIVITIES, activities);

  return { success: true };
}

/**
 * Converts a qualified lead into a commercial opportunity in the pipeline.
 * Links to existing organization & contact, sets initial stage, and marks lead converted.
 */
export async function convertLeadToOpportunity(
  leadId: string,
  options?: { dealTitle?: string; primaryProduct?: string }
): Promise<{ success: boolean; opportunityId?: string; error?: string }> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, error: "Database client unavailable." };
    }

    try {
      // 1. Attempt atomic RPC
      const { data: rpcData, error: rpcErr } = await client.rpc("convert_lead_to_opportunity_atomic", {
        p_lead_id: leadId,
        p_deal_title: options?.dealTitle || null,
        p_product: options?.primaryProduct || null,
      });

      if (!rpcErr && rpcData) {
        if (rpcData.success === false) {
          return { success: false, error: rpcData.error || "Conversion rejected by database." };
        }
        emitAnalyticsEvent("crm:lead_converted", {
          leadId,
          opportunityId: rpcData.opportunity_id,
        });
        return { success: true, opportunityId: rpcData.opportunity_id };
      }

      // 2. Direct fallback
      const { data: lead, error: fetchErr } = await client
        .from("crm_leads")
        .select(`
          id, reference_id, organization_id, contact_id, status, product_interest, tier,
          organization:crm_organizations(id, name)
        `)
        .eq("id", leadId)
        .single();

      if (fetchErr || !lead) {
        return { success: false, error: fetchErr?.message || "Lead not found." };
      }

      if (lead.status === "converted") {
        return { success: false, error: "Duplicate conversion rejected: Lead has already been converted." };
      }

      if (lead.status !== "qualified") {
        return {
          success: false,
          error: `Invalid conversion: Only qualified leads can be converted to opportunities (current status: [${lead.status}]).`,
        };
      }

      // Check for existing opportunity
      const { data: existingOpp } = await client
        .from("crm_opportunities")
        .select("id")
        .eq("lead_id", leadId)
        .limit(1)
        .maybeSingle();

      if (existingOpp) {
        return { success: false, error: "Duplicate conversion rejected: An opportunity already exists for this lead." };
      }

      if (!lead.organization_id) {
        return { success: false, error: "Lead must have an associated organization before conversion." };
      }

      const orgName = (lead.organization as any)?.name || "Enterprise Account";
      const targetProduct = options?.primaryProduct || lead.product_interest || "zakeem-realty-erp";

      // Check if demo booking exists
      const { data: booking } = await client
        .from("bookings")
        .select("id")
        .or(`lead_id.eq.${lead.reference_id},contact_id.eq.${lead.contact_id || '00000000-0000-0000-0000-000000000000'}`)
        .not("status", "eq", "cancelled")
        .limit(1)
        .maybeSingle();

      const stage: OpportunityStage = booking ? "demo_scheduled" : "discovery";
      const title = options?.dealTitle || `${orgName} — ${targetProduct} (${lead.tier || "Enterprise"})`;

      // Insert opportunity
      const { data: newOpp, error: oppErr } = await client
        .from("crm_opportunities")
        .insert({
          organization_id: lead.organization_id,
          contact_id: lead.contact_id,
          lead_id: leadId,
          title,
          primary_product: targetProduct,
          stage,
        })
        .select("id")
        .single();

      if (oppErr) {
        return { success: false, error: oppErr.message };
      }

      // Transition lead
      await client
        .from("crm_leads")
        .update({
          status: "converted",
          converted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", leadId);

      // Record activity
      await client.from("crm_activities").insert({
        activity_type: "opportunity_created",
        organization_id: lead.organization_id,
        contact_id: lead.contact_id,
        lead_id: leadId,
        opportunity_id: newOpp.id,
        title: "Commercial Opportunity Created",
        description: `Converted from lead ${lead.reference_id} with initial stage [${stage}]`,
        metadata: { opportunity_id: newOpp.id, stage, product: targetProduct },
      });

      emitAnalyticsEvent("crm:lead_converted", {
        leadId,
        opportunityId: newOpp.id,
      });

      return { success: true, opportunityId: newOpp.id };
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed to convert lead." };
    }
  }

  // Local fallback
  const list = getStored<CRMLead>(STORAGE_KEYS.LEADS, []);
  const idx = list.findIndex((l) => l.id === leadId);
  if (idx < 0) return { success: false, error: "Lead not found." };

  if (list[idx].status === "converted") {
    return { success: false, error: "Duplicate conversion rejected: Lead has already been converted." };
  }

  if (list[idx].status !== "qualified") {
    return {
      success: false,
      error: `Invalid conversion: Only qualified leads can be converted to opportunities (current status: [${list[idx].status}]).`,
    };
  }

  const opps = getStored<CRMOpportunity>(STORAGE_KEYS.OPPORTUNITIES, []);
  const existingOpp = opps.find((o) => o.leadId === leadId);
  if (existingOpp) {
    return { success: false, error: "Duplicate conversion rejected: An opportunity already exists for this lead." };
  }

  const oppId = `opp-${Date.now()}`;
  opps.push({
    id: oppId,
    organizationId: list[idx].organizationId || "org-default",
    contactId: list[idx].contactId,
    leadId,
    title: options?.dealTitle || `${list[idx].organization?.name || "Enterprise"} — ${list[idx].productInterest || "Solution"}`,
    primaryProduct: options?.primaryProduct || list[idx].productInterest || "zakeem-realty-erp",
    stage: "discovery",
    dealValueNgn: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  setStored(STORAGE_KEYS.OPPORTUNITIES, opps);

  list[idx] = {
    ...list[idx],
    status: "converted",
    convertedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  setStored(STORAGE_KEYS.LEADS, list);

  return { success: true, opportunityId: oppId };
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
        isPrimary: Boolean(row.contact_is_primary || row.is_primary),
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

  const activities = getStored<CRMActivity>(STORAGE_KEYS.ACTIVITIES, []);
  activities.unshift({
    id: `act-${Date.now()}`,
    activityType: "note_added",
    organizationId: params.organizationId,
    contactId: params.contactId,
    leadId: params.leadId,
    opportunityId: params.opportunityId,
    title: params.title.trim(),
    description: params.notes.trim(),
    metadata: {},
    createdAt: new Date().toISOString(),
  });
  setStored(STORAGE_KEYS.ACTIVITIES, activities);
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
