import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  X,
  Building2,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Sliders,
  ShieldAlert,
  Send,
  UserCheck,
  Tag,
  Globe,
  FileText,
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AdminNav } from "@/components/admin/AdminNav";
import { CRMActivityStream } from "@/components/admin/CRMActivityStream";
import { cn } from "@/lib/utils";
import {
  CRMLead,
  CRMActivity,
  LeadStatus,
} from "@/types/crm";
import {
  getAdminLeads,
  getLeadDetails,
  updateLeadStatus,
  convertLeadToOpportunity,
  addCRMNote,
} from "@/lib/crmService";
import { ZAKEEM_APPLICATIONS } from "@/data/ecosystem";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

type StatusFilter = "all" | LeadStatus;
type FormTypeFilter = "all" | "demo" | "contact";

export const AdminLeadsPage: React.FC = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [formTypeFilter, setFormTypeFilter] = useState<FormTypeFilter>("all");
  const [productFilter, setProductFilter] = useState<string>("all");

  // Lead Detail Drawer State
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null);
  const [leadActivities, setLeadActivities] = useState<CRMActivity[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Disqualification Modal State
  const [showDisqualifyModal, setShowDisqualifyModal] = useState(false);
  const [disqualifyReason, setDisqualifyReason] = useState("");
  const [disqualifyError, setDisqualifyError] = useState<string | null>(null);
  const [isSubmittingDisqualify, setIsSubmittingDisqualify] = useState(false);

  // Conversion Modal State
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [dealTitleInput, setDealTitleInput] = useState("");
  const [isSubmittingConvert, setIsSubmittingConvert] = useState(false);
  const [convertSuccessData, setConvertSuccessData] = useState<{ opportunityId: string } | null>(null);

  // Internal Note State
  const [internalNoteInput, setInternalNoteInput] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Load leads list
  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAdminLeads({
        status: statusFilter === "all" ? undefined : statusFilter,
        formType: formTypeFilter === "all" ? undefined : formTypeFilter,
        product: productFilter === "all" ? undefined : productFilter,
        search: searchQuery.trim() || undefined,
      });

      if (res.success) {
        setLeads(res.leads);
      } else {
        setError(res.error || "Failed to load CRM leads.");
      }
    } catch {
      setError("An unexpected error occurred while loading leads.");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, formTypeFilter, productFilter, searchQuery]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // Load full details for selected lead
  const loadLeadDetails = useCallback(async (leadId: string) => {
    setIsLoadingDetail(true);
    try {
      const res = await getLeadDetails(leadId);
      if (res.success && res.lead) {
        setSelectedLead(res.lead);
        setLeadActivities(res.activities);
      } else {
        setError(res.error || "Failed to load lead details.");
      }
    } catch {
      setError("Failed to fetch lead details.");
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  const handleSelectLead = (lead: CRMLead) => {
    setSelectedLeadId(lead.id);
    setSelectedLead(lead);
    loadLeadDetails(lead.id);
  };

  const handleCloseDrawer = () => {
    setSelectedLeadId(null);
    setSelectedLead(null);
    setLeadActivities([]);
    setInternalNoteInput("");
  };

  // Status transitions
  const handleTransitionStatus = async (newStatus: LeadStatus) => {
    if (!selectedLead) return;

    if (newStatus === "disqualified") {
      setShowDisqualifyModal(true);
      setDisqualifyReason("");
      setDisqualifyError(null);
      return;
    }

    if (newStatus === "converted") {
      const orgName = selectedLead.organization?.name || "Enterprise Account";
      const prodName = selectedLead.productInterest || "Solution Deal";
      setDealTitleInput(`${orgName} — ${prodName}`);
      setShowConvertModal(true);
      setConvertSuccessData(null);
      return;
    }

    // Direct transition (e.g. new -> contacted, contacted -> qualified)
    try {
      const res = await updateLeadStatus(selectedLead.id, newStatus);
      if (res.success) {
        setSuccessMessage(`Lead marked as ${newStatus.toUpperCase()}.`);
        setTimeout(() => setSuccessMessage(null), 3500);
        await loadLeadDetails(selectedLead.id);
        await loadLeads();
      } else {
        setError(res.error || "Failed to update lead status.");
        setTimeout(() => setError(null), 4000);
      }
    } catch {
      setError("Error during status transition.");
      setTimeout(() => setError(null), 4000);
    }
  };

  // Confirm disqualification
  const handleConfirmDisqualify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    if (!disqualifyReason.trim() || disqualifyReason.trim().length < 3) {
      setDisqualifyError("Please specify a reason of at least 3 characters.");
      return;
    }

    setIsSubmittingDisqualify(true);
    setDisqualifyError(null);

    try {
      const res = await updateLeadStatus(selectedLead.id, "disqualified", disqualifyReason.trim());
      if (res.success) {
        setShowDisqualifyModal(false);
        setSuccessMessage("Lead has been disqualified and reason recorded.");
        setTimeout(() => setSuccessMessage(null), 3500);
        await loadLeadDetails(selectedLead.id);
        await loadLeads();
      } else {
        setDisqualifyError(res.error || "Failed to disqualify lead.");
      }
    } catch {
      setDisqualifyError("An unexpected error occurred.");
    } finally {
      setIsSubmittingDisqualify(false);
    }
  };

  // Confirm conversion
  const handleConfirmConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    setIsSubmittingConvert(true);
    try {
      const res = await convertLeadToOpportunity(selectedLead.id, {
        dealTitle: dealTitleInput.trim() || undefined,
        primaryProduct: selectedLead.productInterest || undefined,
      });

      if (res.success && res.opportunityId) {
        setConvertSuccessData({ opportunityId: res.opportunityId });
        setSuccessMessage("Lead successfully converted to pipeline opportunity.");
        setTimeout(() => setSuccessMessage(null), 3500);
        await loadLeadDetails(selectedLead.id);
        await loadLeads();
      } else {
        setError(res.error || "Failed to convert lead into opportunity.");
      }
    } catch {
      setError("An unexpected error occurred during conversion.");
    } finally {
      setIsSubmittingConvert(false);
    }
  };

  // Save internal note
  const handleSaveInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !internalNoteInput.trim()) return;

    setIsSavingNote(true);
    try {
      const res = await addCRMNote({
        leadId: selectedLead.id,
        organizationId: selectedLead.organizationId || undefined,
        contactId: selectedLead.contactId || undefined,
        title: `Note by ${user?.email || "Admin"}`,
        notes: internalNoteInput.trim(),
      });

      if (res.success) {
        setInternalNoteInput("");
        setSuccessMessage("Internal administrative note saved to CRM stream.");
        setTimeout(() => setSuccessMessage(null), 3000);
        await loadLeadDetails(selectedLead.id);
      } else {
        setError(res.error || "Failed to save note.");
      }
    } catch {
      setError("Error saving note.");
    } finally {
      setIsSavingNote(false);
    }
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter((l) => l.status === "new").length;
    const contactedCount = leads.filter((l) => l.status === "contacted").length;
    const qualifiedCount = leads.filter((l) => l.status === "qualified").length;
    const convertedCount = leads.filter((l) => l.status === "converted").length;
    const disqualifiedCount = leads.filter((l) => l.status === "disqualified").length;
    return { total, newCount, contactedCount, qualifiedCount, convertedCount, disqualifiedCount };
  }, [leads]);

  // Helper for status badge styling
  const renderStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case "new":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            New
          </span>
        );
      case "contacted":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Contacted
          </span>
        );
      case "qualified":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            Qualified
          </span>
        );
      case "converted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3" />
            Converted
          </span>
        );
      case "disqualified":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            Disqualified
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30">
            {status}
          </span>
        );
    }
  };

  const getProductTitle = (slugOrId?: string | null) => {
    if (!slugOrId) return "Unspecified Solution";
    const found = ZAKEEM_APPLICATIONS.find((a) => a.slug === slugOrId || a.id === slugOrId);
    return found ? found.name : slugOrId;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "N/A";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <>
      <SEO
        title="CRM Inbound Leads Desk — Zakeem Solutions"
        description="Internal executive desk for inbound lead triage, qualification, and commercial deal conversion."
        canonical="https://www.zakeemsolutions.com/admin/crm/leads"
      />

      <section className="pt-12 pb-24 border-b border-white/10 min-h-screen">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl space-y-8">
          {/* Admin Navigation */}
          <AdminNav currentTab="leads" />

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                <Badge variant="neon">CRM Desk</Badge>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Canonical Model Active
                </span>
                {isSupabaseConfigured() ? (
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                    Supabase Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-[10px]">
                    Local Storage Mode
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                Inbound Leads & Qualification Desk
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
                Persistent B2B lead capture, commercial intent evaluation, and auditable status transitions.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={loadLeads}
                disabled={isLoading}
                leftIcon={<RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />}
                className="border-white/15 text-white hover:bg-white/10"
              >
                Refresh
              </Button>
              <Link to="/request-demo" target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                  View Live Form
                </Button>
              </Link>
            </div>
          </div>

          {/* Feedback Banners */}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-white/10">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Total Leads
              </span>
              <div className="text-2xl font-bold text-white">{metrics.total}</div>
            </div>

            <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-emerald-500/20">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1">
                New (Triage)
              </span>
              <div className="text-2xl font-bold text-emerald-300">{metrics.newCount}</div>
            </div>

            <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-amber-500/20">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-1">
                Contacted
              </span>
              <div className="text-2xl font-bold text-amber-300">{metrics.contactedCount}</div>
            </div>

            <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-sky-500/20">
              <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block mb-1">
                Qualified
              </span>
              <div className="text-2xl font-bold text-sky-300">{metrics.qualifiedCount}</div>
            </div>

            <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-emerald-500/30">
              <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-wider block mb-1">
                Converted Deals
              </span>
              <div className="text-2xl font-bold text-white">{metrics.convertedCount}</div>
            </div>

            <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-rose-500/20">
              <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block mb-1">
                Disqualified
              </span>
              <div className="text-2xl font-bold text-slate-400">{metrics.disqualifiedCount}</div>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-white/10 space-y-4">
            {/* Top row: Search and dropdown filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, company, ref ID..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#06152b] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#e57804]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Form Type Filter */}
              <div>
                <select
                  value={formTypeFilter}
                  onChange={(e) => setFormTypeFilter(e.target.value as FormTypeFilter)}
                  className="w-full px-3 py-2 rounded-xl bg-[#06152b] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e57804]"
                >
                  <option value="all">All Form Types</option>
                  <option value="demo">Demo Request Form</option>
                  <option value="contact">Contact Inquiry Form</option>
                </select>
              </div>

              {/* Product Filter */}
              <div>
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#06152b] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e57804]"
                >
                  <option value="all">All Products</option>
                  {ZAKEEM_APPLICATIONS.map((app) => (
                    <option key={app.id} value={app.slug}>
                      {app.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bottom row: Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-white/5 scrollbar-none">
              <span className="text-[10px] font-mono text-slate-400 uppercase mr-2 shrink-0 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Status:
              </span>
              {(
                [
                  { id: "all", label: "All Leads", count: metrics.total },
                  { id: "new", label: "New", count: metrics.newCount },
                  { id: "contacted", label: "Contacted", count: metrics.contactedCount },
                  { id: "qualified", label: "Qualified", count: metrics.qualifiedCount },
                  { id: "converted", label: "Converted", count: metrics.convertedCount },
                  { id: "disqualified", label: "Disqualified", count: metrics.disqualifiedCount },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 flex items-center gap-1.5",
                    statusFilter === tab.id
                      ? "bg-[#e57804] text-white"
                      : "bg-[#06152b] text-slate-400 hover:text-white hover:bg-white/5 border border-white/5"
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full",
                      statusFilter === tab.id ? "bg-black/20 text-white" : "bg-white/5 text-slate-400"
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Leads Table / Cards */}
          <div data-surface="dark" className="rounded-2xl bg-[#081c38] border border-white/10 overflow-hidden">
            {isLoading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#e57804]/20 border-t-[#e57804] animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-mono">Loading inbound leads desk...</p>
              </div>
            ) : leads.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Users className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-base font-semibold text-white">No Leads Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No inbound leads match the current filters. Clear filters or check back after new visitors submit inquiries.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#06152b]/80 border-b border-white/10 text-[10px] font-mono uppercase text-slate-400">
                    <tr>
                      <th className="py-3 px-4">Ref ID / Date</th>
                      <th className="py-3 px-4">Contact & Org</th>
                      <th className="py-3 px-4">Product Interest</th>
                      <th className="py-3 px-4">Form</th>
                      <th className="py-3 px-4">Lifecycle Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leads.map((lead) => {
                      const isSelected = selectedLeadId === lead.id;
                      return (
                        <tr
                          key={lead.id}
                          onClick={() => handleSelectLead(lead)}
                          className={cn(
                            "cursor-pointer transition-colors hover:bg-white/[0.03]",
                            isSelected && "bg-white/[0.06]"
                          )}
                        >
                          {/* Reference ID & Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-mono text-xs font-semibold text-white flex items-center gap-1.5">
                              <span>{lead.referenceId}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {formatDate(lead.createdAt)}
                            </div>
                          </td>

                          {/* Contact & Organization */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white">
                              {lead.contact?.fullName || "Anonymous Lead"}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>{lead.organization?.name || "Independent"}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {lead.contact?.email}
                            </div>
                          </td>

                          {/* Product Interest & Tier */}
                          <td className="py-3.5 px-4">
                            <div className="text-white font-medium">
                              {getProductTitle(lead.productInterest)}
                            </div>
                            {lead.tier && (
                              <span className="text-[10px] font-mono text-[#e57804] bg-[#e57804]/10 border border-[#e57804]/20 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                                {lead.tier}
                              </span>
                            )}
                          </td>

                          {/* Form Type */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="text-[11px] font-mono text-slate-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                              {lead.formType === "demo" ? "Demo Form" : "Inquiry Form"}
                            </span>
                          </td>

                          {/* Lifecycle Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {renderStatusBadge(lead.status)}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-white/10 hover:border-[#e57804]/40 hover:text-white py-1 px-2.5 text-xs h-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectLead(lead);
                              }}
                            >
                              <span>Inspect</span>
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* LEAD DETAIL DRAWER */}
      {/* ========================================================================= */}
      {selectedLead && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end transition-opacity"
          onClick={handleCloseDrawer}
        >
          <div
            className="w-full max-w-2xl bg-[#06152b] border-l border-white/10 h-full overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/10 bg-[#081c38] sticky top-0 z-10 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-xs font-mono font-bold text-[#e57804]">
                    {selectedLead.referenceId}
                  </span>
                  {renderStatusBadge(selectedLead.status)}
                  <span className="text-[10px] font-mono uppercase bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-300">
                    {selectedLead.formType === "demo" ? "Walkthrough Request" : "Contact Inquiry"}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  {selectedLead.contact?.fullName || "Lead Profile"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedLead.organization?.name || "Independent"}</span>
                  <span className="text-slate-600">•</span>
                  <span>Captured {formatDate(selectedLead.createdAt)}</span>
                </p>
              </div>

              <button
                onClick={handleCloseDrawer}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lifecycle Transition Action Bar */}
            <div className="p-4 bg-[#081c38]/90 border-b border-white/10">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-[#e57804]" />
                  Lifecycle Controls:
                </span>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status: new -> contacted */}
                  {selectedLead.status === "new" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTransitionStatus("contacted")}
                      className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 py-1 px-3 text-xs h-auto"
                    >
                      Mark Contacted
                    </Button>
                  )}

                  {/* Status: contacted -> qualified */}
                  {selectedLead.status === "contacted" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTransitionStatus("qualified")}
                      className="border-sky-500/40 text-sky-300 hover:bg-sky-500/10 py-1 px-3 text-xs h-auto"
                    >
                      Mark Qualified
                    </Button>
                  )}

                  {/* Status: qualified -> converted */}
                  {selectedLead.status === "qualified" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleTransitionStatus("converted")}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white py-1 px-3 text-xs h-auto"
                      leftIcon={<Sparkles className="w-3 h-3" />}
                    >
                      Convert to Deal
                    </Button>
                  )}

                  {/* Disqualify action available for non-terminal states */}
                  {selectedLead.status !== "converted" && selectedLead.status !== "disqualified" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTransitionStatus("disqualified")}
                      className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10 py-1 px-3 text-xs h-auto"
                    >
                      Disqualify
                    </Button>
                  )}

                  {/* Terminal status indicators */}
                  {selectedLead.status === "converted" && (
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Deal Pipeline Active
                    </span>
                  )}

                  {selectedLead.status === "disqualified" && (
                    <span className="text-xs font-mono text-rose-400 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      Disqualified
                    </span>
                  )}
                </div>
              </div>

              {/* Show reason if disqualified */}
              {selectedLead.status === "disqualified" && selectedLead.disqualificationReason && (
                <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <span className="font-semibold block font-mono text-[10px] uppercase text-rose-400">
                      Disqualification Reason:
                    </span>
                    <span>{selectedLead.disqualificationReason}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* 1. Identity & Organization Details */}
              <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-white/10 space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#e57804]" />
                  Contact & Organization
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Full Name:</span>
                    <span className="text-white font-medium">{selectedLead.contact?.fullName || "—"}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Job Title:</span>
                    <span className="text-white font-medium">{selectedLead.contact?.jobTitle || "Executive"}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Work Email:</span>
                    <a
                      href={`mailto:${selectedLead.contact?.email}`}
                      className="text-[#e57804] hover:underline font-mono flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" />
                      {selectedLead.contact?.email || "—"}
                    </a>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Phone Number:</span>
                    {selectedLead.contact?.phone ? (
                      <a
                        href={`tel:${selectedLead.contact.phone}`}
                        className="text-slate-300 hover:text-white font-mono flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        {selectedLead.contact.phone}
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Organization Name:</span>
                    <span className="text-white font-semibold flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {selectedLead.organization?.name || "Independent"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Domain / Industry:</span>
                    <span className="text-slate-300 font-mono">
                      {selectedLead.organization?.domain || selectedLead.organization?.industry || "Commercial B2B"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Commercial Intent & Solution Specs */}
              <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-white/10 space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#e57804]" />
                  Commercial Intent & Scope
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Target Solution:</span>
                    <span className="text-white font-semibold">
                      {getProductTitle(selectedLead.productInterest)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Deployment Model:</span>
                    <span className="text-slate-300 font-mono">
                      {selectedLead.deployment || "Cloud Managed"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Edition / Tier:</span>
                    <span className="text-slate-300 font-mono">
                      {selectedLead.tier || "Enterprise"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Billing Preference:</span>
                    <span className="text-slate-300 font-mono">
                      {selectedLead.billing || "Annual Contract"}
                    </span>
                  </div>
                </div>

                {selectedLead.notes && (
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-slate-400 block text-[11px] mb-1">Client Inbound Notes:</span>
                    <p className="text-slate-200 text-xs bg-[#06152b] p-3 rounded-xl border border-white/5 leading-relaxed whitespace-pre-wrap">
                      {selectedLead.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* 3. Cross-Entity CRM Associations */}
              <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-white/10 space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#e57804]" />
                  CRM Associations
                </h4>

                <div className="space-y-2.5">
                  {/* Linked Booking */}
                  {selectedLead.booking ? (
                    <div className="p-3 rounded-xl bg-[#06152b] border border-sky-500/20 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">
                            Demo Walkthrough Scheduled
                          </div>
                          <div className="text-[11px] font-mono text-sky-300">
                            {selectedLead.booking.bookingDate} at {selectedLead.booking.startTime} WAT
                          </div>
                        </div>
                      </div>
                      <Link to="/admin/scheduling">
                        <Button variant="outline" size="sm" className="border-sky-500/30 text-sky-300 py-1 px-2.5 text-xs h-auto">
                          View in Desk
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#06152b] border border-white/5 text-xs text-slate-400 flex items-center justify-between">
                      <span>No demo walkthrough scheduled yet.</span>
                      <Link to="/admin/scheduling" className="text-[#e57804] text-[11px] hover:underline font-mono">
                        Open Scheduler
                      </Link>
                    </div>
                  )}

                  {/* Linked Opportunity */}
                  {selectedLead.opportunity ? (
                    <div className="p-3 rounded-xl bg-[#06152b] border border-emerald-500/20 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">
                            {selectedLead.opportunity.title}
                          </div>
                          <div className="text-[11px] font-mono text-emerald-400">
                            Stage: {selectedLead.opportunity.stage.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Pipeline Deal
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#06152b] border border-white/5 text-xs text-slate-400">
                      Opportunity not yet created. Qualify lead to convert into pipeline.
                    </div>
                  )}

                  {/* Linked Invitation */}
                  {selectedLead.invitation ? (
                    <div className="p-3 rounded-xl bg-[#06152b] border border-amber-500/20 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">
                            Client Account Invitation
                          </div>
                          <div className="text-[11px] font-mono text-amber-300">
                            Status: {selectedLead.invitation.status.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        Expires: {formatDate(selectedLead.invitation.expiresAt)}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* 4. Attribution & Marketing Source */}
              {selectedLead.attribution && Object.keys(selectedLead.attribution).length > 0 && (
                <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-white/10 space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#e57804]" />
                    Attribution & Channel Data
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {Object.entries(selectedLead.attribution).map(([key, val]) => {
                      if (!val || typeof val === "object") return null;
                      return (
                        <div key={key} className="p-2 rounded bg-[#06152b] border border-white/5">
                          <span className="text-[10px] font-mono text-slate-400 uppercase block">
                            {key.replace(/_/g, " ")}
                          </span>
                          <span className="text-white font-mono text-[11px] truncate block">
                            {String(val)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. Add Internal Note Form */}
              <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-white/10 space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#e57804]" />
                  Record Administrative Note
                </h4>

                <form onSubmit={handleSaveInternalNote} className="space-y-2.5">
                  <textarea
                    rows={3}
                    value={internalNoteInput}
                    onChange={(e) => setInternalNoteInput(e.target.value)}
                    placeholder="Document client call details, requirement scope, or follow-up notes..."
                    className="w-full px-3 py-2 rounded-xl bg-[#06152b] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#e57804]"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={isSavingNote || !internalNoteInput.trim()}
                      leftIcon={<Send className="w-3 h-3" />}
                      className="py-1 px-3 text-xs h-auto"
                    >
                      {isSavingNote ? "Recording..." : "Save to CRM Stream"}
                    </Button>
                  </div>
                </form>
              </div>

              {/* 6. Activity Timeline Stream */}
              <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#e57804]" />
                    Auditable Activity Timeline
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    {leadActivities.length} Events
                  </span>
                </div>

                <CRMActivityStream
                  activities={leadActivities}
                  isLoading={isLoadingDetail}
                  emptyMessage="No activity events recorded for this lead yet."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DISQUALIFY REASON MODAL */}
      {/* ========================================================================= */}
      {showDisqualifyModal && selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            data-surface="dark"
            className="w-full max-w-md p-6 rounded-3xl bg-[#081c38] border border-rose-500/30 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Disqualify Lead</h3>
              </div>
              <button
                onClick={() => setShowDisqualifyModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Disqualifying a lead moves it into a terminal state. Per Zakeem CRM governance, an explicit justification is required and will be permanently recorded in the audit log.
            </p>

            {disqualifyError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {disqualifyError}
              </div>
            )}

            <form onSubmit={handleConfirmDisqualify} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                  Disqualification Justification (Required)
                </label>
                <textarea
                  rows={3}
                  required
                  value={disqualifyReason}
                  onChange={(e) => setDisqualifyReason(e.target.value)}
                  placeholder="e.g. Outside target geography, budget below minimum threshold, competitor testing, spam..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDisqualifyModal(false)}
                  disabled={isSubmittingDisqualify}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingDisqualify || disqualifyReason.trim().length < 3}
                  className="bg-rose-600 hover:bg-rose-500 text-white"
                >
                  {isSubmittingDisqualify ? "Saving..." : "Confirm Disqualification"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONVERT TO OPPORTUNITY MODAL */}
      {/* ========================================================================= */}
      {showConvertModal && selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            data-surface="dark"
            className="w-full max-w-md p-6 rounded-3xl bg-[#081c38] border border-emerald-500/30 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Convert Lead to Opportunity</h3>
              </div>
              <button
                onClick={() => setShowConvertModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {convertSuccessData ? (
              <div className="space-y-4 py-2 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Deal Successfully Created!</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    The lead has been converted and linked to commercial pipeline opportunity:
                  </p>
                  <span className="font-mono text-xs text-emerald-400 mt-1 block">
                    ID: {convertSuccessData.opportunityId}
                  </span>
                </div>
                <div className="pt-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowConvertModal(false)}
                    className="w-full"
                  >
                    Return to Desk
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Converting this qualified lead will initialize a sales deal in <code className="text-emerald-400 font-mono">crm_opportunities</code>.
                  It will preserve existing organization and contact linkages, and default the initial stage to <strong className="text-white">{selectedLead.booking ? "Demo Scheduled" : "Discovery"}</strong>.
                </p>

                <form onSubmit={handleConfirmConvert} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                      Opportunity Deal Title
                    </label>
                    <input
                      type="text"
                      required
                      value={dealTitleInput}
                      onChange={(e) => setDealTitleInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e57804]"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-[#06152b] border border-white/5 text-xs text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Account:</span>
                      <span className="text-white font-medium">{selectedLead.organization?.name || "Independent"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Primary Contact:</span>
                      <span className="text-white font-medium">{selectedLead.contact?.fullName || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Product:</span>
                      <span className="text-white font-medium">{getProductTitle(selectedLead.productInterest)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deal Stage:</span>
                      <span className="text-emerald-400 font-mono uppercase">
                        {selectedLead.booking ? "Demo Scheduled" : "Discovery"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowConvertModal(false)}
                      disabled={isSubmittingConvert}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={isSubmittingConvert || !dealTitleInput.trim()}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      {isSubmittingConvert ? "Creating Opportunity..." : "Convert to Deal"}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
