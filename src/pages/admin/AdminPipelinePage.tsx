import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Briefcase,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  X,
  Building2,
  Mail,
  Phone,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Sliders,
  Send,
  UserCheck,
  Tag,
  Globe,
  FileText,
  DollarSign,
  TrendingUp,
  Award,
  ArrowRight,
  Edit3,
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { CRMActivityStream } from "@/components/admin/CRMActivityStream";
import { cn } from "@/lib/utils";
import {
  CRMOpportunity,
  CRMOpportunityDetail,
  CRMActivity,
  OpportunityStage,
  VALID_OPPORTUNITY_TRANSITIONS,
} from "@/types/crm";
import {
  getAdminOpportunities,
  getOpportunityDetails,
  updateOpportunityStage,
  updateOpportunityDetails,
  addCRMNote,
} from "@/lib/crmService";
import { ZAKEEM_APPLICATIONS } from "@/data/ecosystem";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

type StageFilter = "all" | OpportunityStage;

const STAGE_CONFIG: Record<
  OpportunityStage,
  { label: string; color: string; border: string; bg: string; text: string }
> = {
  discovery: {
    label: "Discovery",
    color: "sky",
    border: "border-sky-500/30",
    bg: "bg-sky-500/10",
    text: "text-sky-300",
  },
  demo_scheduled: {
    label: "Demo Scheduled",
    color: "blue",
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
    text: "text-blue-300",
  },
  demo_completed: {
    label: "Demo Completed",
    color: "indigo",
    border: "border-indigo-500/30",
    bg: "bg-indigo-500/10",
    text: "text-indigo-300",
  },
  proposal: {
    label: "Proposal Out",
    color: "amber",
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    text: "text-amber-300",
  },
  negotiation: {
    label: "Negotiation",
    color: "purple",
    border: "border-purple-500/30",
    bg: "bg-purple-500/10",
    text: "text-purple-300",
  },
  won: {
    label: "Closed Won",
    color: "emerald",
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/15",
    text: "text-emerald-300",
  },
  lost: {
    label: "Closed Lost",
    color: "rose",
    border: "border-rose-500/30",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
  },
};

export const AdminPipelinePage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [opportunities, setOpportunities] = useState<CRMOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<StageFilter>("all");
  const [productFilter, setProductFilter] = useState<string>("all");

  // Pagination
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, stageFilter, productFilter]);

  // Selected Opportunity Detail Drawer
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  const [selectedOpp, setSelectedOpp] = useState<CRMOpportunityDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Closed Lost Modal State
  const [showLostModal, setShowLostModal] = useState(false);
  const [lossReasonInput, setLossReasonInput] = useState("");
  const [isSubmittingLost, setIsSubmittingLost] = useState(false);

  // Edit Opportunity Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editValueNgn, setEditValueNgn] = useState<string>("");
  const [editCloseDate, setEditCloseDate] = useState<string>("");
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  // Internal Note State
  const [internalNoteInput, setInternalNoteInput] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Load opportunities
  const loadOpportunities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAdminOpportunities({
        stage: stageFilter === "all" ? undefined : stageFilter,
        product: productFilter === "all" ? undefined : productFilter,
        search: searchQuery.trim() || undefined,
      });

      if (res.success) {
        setOpportunities(res.opportunities);
      } else {
        setError(res.error || "Failed to load sales opportunities.");
      }
    } catch {
      setError("An unexpected error occurred while loading opportunities.");
    } finally {
      setIsLoading(false);
    }
  }, [stageFilter, productFilter, searchQuery]);

  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  // Load opportunity detail
  const loadOppDetails = useCallback(async (id: string) => {
    setIsLoadingDetail(true);
    try {
      const res = await getOpportunityDetails(id);
      if (res.success && res.opportunity) {
        setSelectedOpp(res.opportunity);
      } else {
        setError(res.error || "Failed to load opportunity details.");
      }
    } catch {
      setError("Error loading opportunity profile.");
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  // Handle URL deep-link query parameter (?oppId=...)
  useEffect(() => {
    const oppParam = searchParams.get("oppId");
    if (oppParam) {
      setSelectedOppId(oppParam);
      loadOppDetails(oppParam);
    }
  }, [searchParams, loadOppDetails]);

  const handleSelectOpp = (opp: CRMOpportunity) => {
    setSelectedOppId(opp.id);
    loadOppDetails(opp.id);
  };

  const handleCloseDrawer = () => {
    setSelectedOppId(null);
    setSelectedOpp(null);
    setInternalNoteInput("");
  };

  // Stage transition handler
  const handleTransitionStage = async (newStage: OpportunityStage) => {
    if (!selectedOpp) return;

    if (newStage === "lost") {
      setShowLostModal(true);
      setLossReasonInput("");
      return;
    }

    try {
      const res = await updateOpportunityStage(selectedOpp.id, newStage);
      if (res.success) {
        setSuccessMessage(`Deal advanced to ${STAGE_CONFIG[newStage].label.toUpperCase()}.`);
        setTimeout(() => setSuccessMessage(null), 3500);
        await loadOppDetails(selectedOpp.id);
        await loadOpportunities();
      } else {
        setError(res.error || "Failed to advance stage.");
        setTimeout(() => setError(null), 4000);
      }
    } catch {
      setError("Error during stage transition.");
      setTimeout(() => setError(null), 4000);
    }
  };

  // Confirm Mark Lost
  const handleConfirmLost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp) return;

    setIsSubmittingLost(true);
    try {
      const res = await updateOpportunityStage(
        selectedOpp.id,
        "lost",
        lossReasonInput.trim() || undefined
      );

      if (res.success) {
        setShowLostModal(false);
        setSuccessMessage("Opportunity marked Closed-Lost.");
        setTimeout(() => setSuccessMessage(null), 3500);
        await loadOppDetails(selectedOpp.id);
        await loadOpportunities();
      } else {
        setError(res.error || "Failed to mark deal lost.");
      }
    } catch {
      setError("Error during deal closure.");
    } finally {
      setIsSubmittingLost(false);
    }
  };

  // Save deal details (title, value, close date)
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp) return;

    setIsSavingDetails(true);
    try {
      const parsedValue = editValueNgn.trim() ? Number(editValueNgn.trim()) : null;
      const res = await updateOpportunityDetails(selectedOpp.id, {
        title: editTitle.trim() || undefined,
        dealValueNgn: parsedValue,
        closeDate: editCloseDate.trim() || null,
      });

      if (res.success) {
        setShowEditModal(false);
        setSuccessMessage("Deal details updated successfully.");
        setTimeout(() => setSuccessMessage(null), 3000);
        await loadOppDetails(selectedOpp.id);
        await loadOpportunities();
      } else {
        setError(res.error || "Failed to update details.");
      }
    } catch {
      setError("Error saving deal details.");
    } finally {
      setIsSavingDetails(false);
    }
  };

  // Open edit modal
  const handleOpenEditModal = () => {
    if (!selectedOpp) return;
    setEditTitle(selectedOpp.title);
    setEditValueNgn(selectedOpp.dealValueNgn !== null && selectedOpp.dealValueNgn !== undefined ? String(selectedOpp.dealValueNgn) : "");
    setEditCloseDate(selectedOpp.closeDate || "");
    setShowEditModal(true);
  };

  // Save internal note
  const handleSaveInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp || !internalNoteInput.trim()) return;

    setIsSavingNote(true);
    try {
      const res = await addCRMNote({
        opportunityId: selectedOpp.id,
        organizationId: selectedOpp.organizationId,
        contactId: selectedOpp.contactId || undefined,
        leadId: selectedOpp.leadId || undefined,
        title: `Note by ${user?.email || "Admin"}`,
        notes: internalNoteInput.trim(),
      });

      if (res.success) {
        setInternalNoteInput("");
        setSuccessMessage("Note recorded to opportunity timeline.");
        setTimeout(() => setSuccessMessage(null), 3000);
        await loadOppDetails(selectedOpp.id);
      } else {
        setError(res.error || "Failed to record note.");
      }
    } catch {
      setError("Error recording note.");
    } finally {
      setIsSavingNote(false);
    }
  };

  // Pipeline metrics
  const metrics = useMemo(() => {
    const total = opportunities.length;
    const open = opportunities.filter((o) => o.stage !== "won" && o.stage !== "lost").length;
    const proposal = opportunities.filter((o) => o.stage === "proposal").length;
    const negotiation = opportunities.filter((o) => o.stage === "negotiation").length;
    const won = opportunities.filter((o) => o.stage === "won").length;
    const lost = opportunities.filter((o) => o.stage === "lost").length;
    return { total, open, proposal, negotiation, won, lost };
  }, [opportunities]);

  // Paginated opportunities slice
  const paginatedOpportunities = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return opportunities.slice(start, start + PAGE_SIZE);
  }, [opportunities, currentPage]);

  const getProductTitle = (slugOrId?: string | null) => {
    if (!slugOrId) return "Unspecified Solution";
    const found = ZAKEEM_APPLICATIONS.find((a) => a.slug === slugOrId || a.id === slugOrId);
    return found ? found.name : slugOrId;
  };

  const formatCurrency = (val?: number | null) => {
    if (val === null || val === undefined || isNaN(val)) return "Value pending qualification";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "N/A";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <>
      <SEO
        title="Commercial Opportunity Pipeline — Zakeem Solutions"
        description="Internal executive desk for sales pipeline management, enterprise deal tracking, and stage governance."
        canonical="https://www.zakeemsolutions.com/admin/crm/pipeline"
      />

      <section className="pt-12 pb-24 border-b border-white/10 min-h-screen">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl space-y-8">
          {/* Admin Navigation Suite */}
          <AdminNav currentTab="opportunities" />

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                <Badge variant="neon">Commercial Pipeline</Badge>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Stage Governance Enforced
                </span>
                {isSupabaseConfigured() ? (
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Secured Connection
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-[10px]">
                    Local Storage Mode
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                Sales Pipeline & Deal Management
              </h1>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                Structured stage progression from discovery to closed-won, backed by verified relational accounts and contacts.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={loadOpportunities}
                disabled={isLoading}
                leftIcon={<RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />}
                className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
              >
                Refresh
              </Button>
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

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-white/10">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Total Deals
              </span>
              <div className="text-2xl font-bold text-white">{metrics.total}</div>
            </div>

            <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-sky-500/20">
              <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block mb-1">
                Open Pipeline
              </span>
              <div className="text-2xl font-bold text-sky-300">{metrics.open}</div>
            </div>

            <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-amber-500/20">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-1">
                In Proposal
              </span>
              <div className="text-2xl font-bold text-amber-300">{metrics.proposal}</div>
            </div>

            <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-purple-500/20">
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block mb-1">
                In Negotiation
              </span>
              <div className="text-2xl font-bold text-purple-300">{metrics.negotiation}</div>
            </div>

            <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-emerald-500/30">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1">
                Closed Won
              </span>
              <div className="text-2xl font-bold text-emerald-300">{metrics.won}</div>
            </div>

            <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-rose-500/20">
              <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block mb-1">
                Closed Lost
              </span>
              <div className="text-2xl font-bold text-slate-400">{metrics.lost}</div>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-white/10 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search deals by title, company, contact, solution..."
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

              {/* Product Filter */}
              <div>
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#06152b] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e57804]"
                >
                  <option value="all">All Solutions</option>
                  {ZAKEEM_APPLICATIONS.map((app) => (
                    <option key={app.id} value={app.slug}>
                      {app.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stage Filter Dropdown */}
              <div>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value as StageFilter)}
                  className="w-full px-3 py-2 rounded-xl bg-[#06152b] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e57804]"
                >
                  <option value="all">All Stages</option>
                  {Object.entries(STAGE_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stage Pill Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-white/5 scrollbar-none">
              <span className="text-[10px] font-mono text-slate-400 uppercase mr-2 shrink-0 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter Stage:
              </span>
              <button
                onClick={() => setStageFilter("all")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0",
                  stageFilter === "all"
                    ? "bg-[#e57804] text-white"
                    : "bg-[#06152b] text-slate-400 hover:text-white hover:bg-white/5 border border-white/5"
                )}
              >
                All Deals ({metrics.total})
              </button>
              {(Object.keys(STAGE_CONFIG) as OpportunityStage[]).map((stg) => {
                const count = opportunities.filter((o) => o.stage === stg).length;
                return (
                  <button
                    key={stg}
                    onClick={() => setStageFilter(stg)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 flex items-center gap-1.5",
                      stageFilter === stg
                        ? "bg-[#e57804] text-white"
                        : "bg-[#06152b] text-slate-400 hover:text-white hover:bg-white/5 border border-white/5"
                    )}
                  >
                    <span>{STAGE_CONFIG[stg].label}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/5 text-slate-400">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Opportunities Table */}
          <div data-surface="dark" className="rounded-2xl bg-[#081c38] border border-white/10 overflow-hidden">
            {isLoading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#e57804]/20 border-t-[#e57804] animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-mono">Loading opportunity pipeline...</p>
              </div>
            ) : opportunities.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Briefcase className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-base font-semibold text-white">No Opportunities Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No sales deals match current filters. Qualified inbound leads can be converted into opportunities from the Inbound Leads desk.
                </p>
                <div className="pt-2">
                  <Link to="/admin/crm/leads">
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                      Go to Inbound Leads
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#06152b]/80 border-b border-white/10 text-[10px] font-mono uppercase text-slate-400">
                    <tr>
                      <th className="py-3 px-4">Opportunity & Solution</th>
                      <th className="py-3 px-4">Account & Primary Contact</th>
                      <th className="py-3 px-4">Stage</th>
                      <th className="py-3 px-4">Commercial Value</th>
                      <th className="py-3 px-4">Target Close</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paginatedOpportunities.map((opp) => {
                      const isSelected = selectedOppId === opp.id;
                      const cfg = STAGE_CONFIG[opp.stage] || STAGE_CONFIG.discovery;
                      return (
                        <tr
                          key={opp.id}
                          onClick={() => handleSelectOpp(opp)}
                          className={cn(
                            "cursor-pointer transition-colors hover:bg-white/[0.03]",
                            isSelected && "bg-white/[0.06]"
                          )}
                        >
                          {/* Title & Product */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white text-xs">
                              {opp.title}
                            </div>
                            <div className="text-[11px] font-mono text-[#e57804] mt-0.5">
                              {getProductTitle(opp.primaryProduct)}
                            </div>
                          </td>

                          {/* Account & Contact */}
                          <td className="py-3.5 px-4">
                            <div className="text-white font-medium flex items-center gap-1.5">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>{opp.organization?.name || "Independent Account"}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                              {opp.contact?.fullName || opp.contact?.email || "Primary Contact Pending"}
                            </div>
                          </td>

                          {/* Stage Badge */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border",
                                cfg.bg,
                                cfg.border,
                                cfg.text
                              )}
                            >
                              {opp.stage === "won" && <CheckCircle2 className="w-3 h-3" />}
                              {opp.stage === "lost" && <XCircle className="w-3 h-3" />}
                              {cfg.label}
                            </span>
                          </td>

                          {/* Deal Value */}
                          <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs">
                            {opp.dealValueNgn !== null && opp.dealValueNgn !== undefined ? (
                              <span className="text-emerald-300 font-semibold">
                                {formatCurrency(opp.dealValueNgn)}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic text-[11px]">
                                Value pending
                              </span>
                            )}
                          </td>

                          {/* Close Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-400 text-xs">
                            {formatDate(opp.closeDate)}
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-white/20 text-white hover:text-white hover:border-[#e57804] hover:bg-[#e57804]/15 py-1 px-2.5 text-xs h-auto transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectOpp(opp);
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

            {/* Pagination Controls */}
            {!isLoading && opportunities.length > 0 && (
              <AdminPagination
                currentPage={currentPage}
                totalItems={opportunities.length}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
                itemName="deals"
              />
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* OPPORTUNITY DETAIL DRAWER */}
      {/* ========================================================================= */}
      {selectedOpp && (
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
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border",
                      STAGE_CONFIG[selectedOpp.stage]?.bg,
                      STAGE_CONFIG[selectedOpp.stage]?.border,
                      STAGE_CONFIG[selectedOpp.stage]?.text
                    )}
                  >
                    {STAGE_CONFIG[selectedOpp.stage]?.label}
                  </span>
                  <span className="text-[10px] font-mono text-[#e57804] bg-[#e57804]/10 border border-[#e57804]/20 px-2 py-0.5 rounded">
                    {getProductTitle(selectedOpp.primaryProduct)}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>{selectedOpp.title}</span>
                  <button
                    onClick={handleOpenEditModal}
                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                    title="Edit deal title, value or close date"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <Link
                    to={`/admin/crm/organizations?orgId=${selectedOpp.organizationId}`}
                    className="hover:text-[#e57804] underline underline-offset-2"
                  >
                    {selectedOpp.organization?.name || "Account Profile"}
                  </Link>
                  <span className="text-slate-600">•</span>
                  <span>Created {formatDate(selectedOpp.createdAt)}</span>
                </p>
              </div>

              <button
                onClick={handleCloseDrawer}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stage Transition Toolbar */}
            <div className="p-4 bg-[#081c38]/90 border-b border-white/10">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-[#e57804]" />
                  Stage Progression:
                </span>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Transition buttons based on VALID_OPPORTUNITY_TRANSITIONS */}
                  {(VALID_OPPORTUNITY_TRANSITIONS[selectedOpp.stage] || []).map((targetStage) => {
                    const cfg = STAGE_CONFIG[targetStage];
                    const isWin = targetStage === "won";
                    const isLoss = targetStage === "lost";

                    return (
                      <Button
                        key={targetStage}
                        variant="outline"
                        size="sm"
                        onClick={() => handleTransitionStage(targetStage)}
                        className={cn(
                          "py-1 px-2.5 text-xs h-auto",
                          isWin && "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10",
                          isLoss && "border-rose-500/40 text-rose-400 hover:bg-rose-500/10",
                          !isWin && !isLoss && "border-white/15 text-slate-300 hover:text-white"
                        )}
                      >
                        <span>{cfg.label}</span>
                      </Button>
                    );
                  })}

                  {/* Terminal status notices */}
                  {selectedOpp.stage === "won" && (
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Deal Closed Won
                    </span>
                  )}

                  {selectedOpp.stage === "lost" && (
                    <span className="text-xs font-mono text-rose-400 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      Deal Closed Lost
                    </span>
                  )}
                </div>
              </div>

              {selectedOpp.stage === "lost" && selectedOpp.lossReason && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                  <span className="font-semibold block font-mono text-[10px] uppercase text-rose-400">
                    Loss Reason:
                  </span>
                  <span>{selectedOpp.lossReason}</span>
                </div>
              )}
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Commercial Summary Card */}
              <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#e57804]" />
                    Commercial Summary
                  </h4>
                  <button
                    onClick={handleOpenEditModal}
                    className="text-xs text-[#e57804] hover:underline font-mono"
                  >
                    Edit Details
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Deal Value:</span>
                    <span className="text-white font-mono font-bold text-sm">
                      {formatCurrency(selectedOpp.dealValueNgn)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Primary Solution:</span>
                    <span className="text-white font-semibold">
                      {getProductTitle(selectedOpp.primaryProduct)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Target Close Date:</span>
                    <span className="text-slate-300 font-mono">
                      {formatDate(selectedOpp.closeDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Relational Accounts & Contacts */}
              <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-white/10 space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#e57804]" />
                  Account & Primary Contact
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Account */}
                  <div className="p-3 rounded-xl bg-[#06152b] border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      Enterprise Account
                    </span>
                    <Link
                      to={`/admin/crm/organizations?orgId=${selectedOpp.organizationId}`}
                      className="text-white font-semibold hover:text-[#e57804] flex items-center gap-1"
                    >
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedOpp.organization?.name || "Independent"}</span>
                      <ExternalLink className="w-3 h-3 ml-0.5 text-slate-500" />
                    </Link>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {selectedOpp.organization?.domain || selectedOpp.organization?.industry || "Commercial B2B"}
                    </div>
                  </div>

                  {/* Primary Contact */}
                  <div className="p-3 rounded-xl bg-[#06152b] border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      Decision-Maker Contact
                    </span>
                    {selectedOpp.contact ? (
                      <>
                        <Link
                          to={`/admin/crm/contacts?contactId=${selectedOpp.contact.id}`}
                          className="text-white font-semibold hover:text-[#e57804] flex items-center gap-1"
                        >
                          <span>{selectedOpp.contact.fullName}</span>
                          <ExternalLink className="w-3 h-3 ml-0.5 text-slate-500" />
                        </Link>
                        <a
                          href={`mailto:${selectedOpp.contact.email}`}
                          className="text-[11px] font-mono text-[#e57804] hover:underline block truncate"
                        >
                          {selectedOpp.contact.email}
                        </a>
                      </>
                    ) : (
                      <span className="text-slate-400 text-xs italic">No primary contact mapped</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Cross-Entity Associations (Source Lead, Booking) */}
              <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-white/10 space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#e57804]" />
                  Cross-Entity Linkages
                </h4>

                <div className="space-y-2.5">
                  {/* Source Lead */}
                  {selectedOpp.lead ? (
                    <div className="p-3 rounded-xl bg-[#06152b] border border-white/5 flex items-center justify-between gap-3 flex-wrap text-xs">
                      <div>
                        <div className="text-white font-medium flex items-center gap-2">
                          <span>Origin Lead:</span>
                          <span className="font-mono text-[#e57804] font-bold">
                            {selectedOpp.lead.referenceId}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Status: {selectedOpp.lead.status.toUpperCase()} • Captured {formatDate(selectedOpp.lead.createdAt)}
                        </div>
                      </div>
                      <Link to={`/admin/crm/leads?leadId=${selectedOpp.lead.id}`}>
                        <Button variant="outline" size="sm" className="border-white/20 text-white hover:border-[#e57804] hover:bg-[#e57804]/15 py-1 px-2.5 text-xs h-auto transition-colors">
                          Open Lead Desk
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#06152b] border border-white/5 text-xs text-slate-400">
                      Directly created deal (no origin lead record).
                    </div>
                  )}

                  {/* Linked Booking */}
                  {selectedOpp.booking ? (
                    <div className="p-3 rounded-xl bg-[#06152b] border border-sky-500/20 flex items-center justify-between gap-3 flex-wrap text-xs">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-sky-400" />
                        <div>
                          <div className="text-white font-medium">Demo Walkthrough Scheduled</div>
                          <div className="text-[11px] text-sky-300 font-mono">
                            {selectedOpp.booking.bookingDate} at {selectedOpp.booking.startTime} WAT
                          </div>
                        </div>
                      </div>
                      <Link to="/admin/scheduling">
                        <Button variant="outline" size="sm" className="border-sky-500/30 text-sky-300 py-1 px-2.5 text-xs h-auto">
                          View in Scheduler
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#06152b] border border-white/5 text-xs text-slate-400 flex items-center justify-between">
                      <span>No demo walkthrough booked.</span>
                      <Link to="/admin/scheduling" className="text-[#e57804] text-[11px] hover:underline font-mono">
                        Open Scheduler
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Record Note Form */}
              <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-white/10 space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#e57804]" />
                  Record Deal Note
                </h4>

                <form onSubmit={handleSaveInternalNote} className="space-y-2.5">
                  <textarea
                    rows={3}
                    value={internalNoteInput}
                    onChange={(e) => setInternalNoteInput(e.target.value)}
                    placeholder="Document meeting recap, pricing negotiation, legal terms, or next steps..."
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
                      {isSavingNote ? "Recording..." : "Save to Timeline"}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Chronological Activity Timeline */}
              <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#e57804]" />
                    Auditable Deal Timeline
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    {selectedOpp.activities.length} Events
                  </span>
                </div>

                <CRMActivityStream
                  activities={selectedOpp.activities}
                  isLoading={isLoadingDetail}
                  emptyMessage="No activity events recorded for this opportunity yet."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MARK LOST MODAL */}
      {/* ========================================================================= */}
      {showLostModal && selectedOpp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            data-surface="dark"
            className="w-full max-w-md p-6 rounded-3xl bg-[#081c38] border border-rose-500/30 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400">
                <XCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Mark Deal Closed-Lost</h3>
              </div>
              <button
                onClick={() => setShowLostModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Moving a deal to Closed-Lost terminates the opportunity progression. Document the loss reason for commercial audit and future win-back campaigns.
            </p>

            <form onSubmit={handleConfirmLost} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                  Reason for Loss (Optional but Recommended)
                </label>
                <textarea
                  rows={3}
                  value={lossReasonInput}
                  onChange={(e) => setLossReasonInput(e.target.value)}
                  placeholder="e.g. Budget constraints, selected alternative vendor, timeline postponed to next fiscal year..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLostModal(false)}
                  disabled={isSubmittingLost}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingLost}
                  className="bg-rose-600 hover:bg-rose-500 text-white"
                >
                  {isSubmittingLost ? "Saving..." : "Confirm Closed-Lost"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT OPPORTUNITY DETAILS MODAL */}
      {/* ========================================================================= */}
      {showEditModal && selectedOpp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            data-surface="dark"
            className="w-full max-w-md p-6 rounded-3xl bg-[#081c38] border border-white/15 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Edit3 className="w-5 h-5 text-[#e57804]" />
                <h3 className="text-base font-bold text-white">Update Opportunity Terms</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDetails} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                  Opportunity Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e57804]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                  Deal Value (NGN) — Leave empty if not yet determined
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={editValueNgn}
                  onChange={(e) => setEditValueNgn(e.target.value)}
                  placeholder="e.g. 15000000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e57804] font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                  Target Close Date (Optional)
                </label>
                <input
                  type="date"
                  value={editCloseDate}
                  onChange={(e) => setEditCloseDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e57804] font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                  disabled={isSavingDetails}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSavingDetails || !editTitle.trim()}
                >
                  {isSavingDetails ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPipelinePage;
