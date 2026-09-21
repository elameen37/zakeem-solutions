import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Building2,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  X,
  Mail,
  Phone,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  UserCheck,
  Tag,
  Globe,
  FileText,
  DollarSign,
  TrendingUp,
  Award,
  Users,
  Briefcase,
  Shield,
  ArrowRight,
  Plus,
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { CRMActivityStream } from "@/components/admin/CRMActivityStream";
import { cn } from "@/lib/utils";
import {
  CRMOrganization,
  CRMOrganizationDetail,
  OrganizationStatus,
  CRMContact,
  CRMLead,
  CRMOpportunity,
} from "@/types/crm";
import {
  getAdminOrganizations,
  getOrganizationDetails,
  addCRMNote,
  createAdminOrganization,
  updateAdminOrganization,
} from "@/lib/crmService";
import { isSupabaseConfigured } from "@/lib/supabase";

type StatusFilter = "all" | OrganizationStatus;

const STATUS_CONFIG: Record<
  OrganizationStatus,
  { label: string; border: string; bg: string; text: string }
> = {
  customer: {
    label: "Active Client",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
  },
  prospect: {
    label: "Qualified Prospect",
    border: "border-indigo-500/30",
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
  },
  lead: {
    label: "Inbound Lead",
    border: "border-sky-500/30",
    bg: "bg-sky-500/10",
    text: "text-sky-400",
  },
  partner: {
    label: "Strategic Partner",
    border: "border-purple-500/30",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
  },
  churned: {
    label: "Former / Churned",
    border: "border-slate-700",
    bg: "bg-slate-800/40",
    text: "text-slate-400",
  },
};

export default function AdminOrganizationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlOrgId = searchParams.get("orgId");

  const [organizations, setOrganizations] = useState<CRMOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");

  // Pagination
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, industryFilter]);

  // Drawer / Selection
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(urlOrgId);
  const [detailOrg, setDetailOrg] = useState<CRMOrganizationDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Note creation
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);
  const [activityRefreshTrigger, setActivityRefreshTrigger] = useState(0);

  // Create Account Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgDomain, setNewOrgDomain] = useState("");
  const [newOrgIndustry, setNewOrgIndustry] = useState("");
  const [newOrgCompanySize, setNewOrgCompanySize] = useState("");
  const [newOrgStatus, setNewOrgStatus] = useState<OrganizationStatus>("prospect");
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [createOrgError, setCreateOrgError] = useState<string | null>(null);

  // Status update in drawer state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);

  // Synchronize URL param with selectedOrgId
  useEffect(() => {
    if (urlOrgId && urlOrgId !== selectedOrgId) {
      setSelectedOrgId(urlOrgId);
    }
  }, [urlOrgId, selectedOrgId]);

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminOrganizations({
        status: statusFilter === "all" ? undefined : statusFilter,
        industry: industryFilter === "all" ? undefined : industryFilter,
        search: searchQuery || undefined,
      });

      if (res.success) {
        setOrganizations(res.organizations);
      } else {
        setError(res.error || "Failed to load accounts.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load accounts.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, industryFilter, searchQuery]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Fetch details for drawer
  const fetchDetails = useCallback(async (orgId: string) => {
    setLoadingDetail(true);
    setDetailError(null);
    try {
      const res = await getOrganizationDetails(orgId);
      if (res.success && res.organization) {
        setDetailOrg(res.organization);
      } else {
        setDetailError(res.error || "Failed to load account details.");
      }
    } catch (err: any) {
      setDetailError(err?.message || "Failed to load account details.");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    if (selectedOrgId) {
      fetchDetails(selectedOrgId);
    } else {
      setDetailOrg(null);
    }
  }, [selectedOrgId, fetchDetails]);

  const handleSelectOrg = (orgId: string) => {
    setSelectedOrgId(orgId);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("orgId", orgId);
    setSearchParams(newParams);
  };

  const handleCloseDrawer = () => {
    setSelectedOrgId(null);
    setDetailOrg(null);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("orgId");
    setSearchParams(newParams);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgId || !noteTitle.trim() || !noteContent.trim()) return;

    setSubmittingNote(true);
    try {
      const res = await addCRMNote({
        organizationId: selectedOrgId,
        title: noteTitle.trim(),
        notes: noteContent.trim(),
      });

      if (res.success) {
        setNoteTitle("");
        setNoteContent("");
        setNoteSuccess(true);
        setActivityRefreshTrigger((prev) => prev + 1);
        setTimeout(() => setNoteSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    setIsCreatingOrg(true);
    setCreateOrgError(null);
    try {
      const res = await createAdminOrganization({
        name: newOrgName.trim(),
        domain: newOrgDomain.trim() || undefined,
        industry: newOrgIndustry.trim() || undefined,
        companySize: newOrgCompanySize.trim() || undefined,
        status: newOrgStatus,
      });

      if (res.success && res.organization) {
        setShowCreateModal(false);
        setNewOrgName("");
        setNewOrgDomain("");
        setNewOrgIndustry("");
        setNewOrgCompanySize("");
        setNewOrgStatus("prospect");
        await fetchOrganizations();
        handleSelectOrg(res.organization.id);
      } else {
        setCreateOrgError(res.error || "Failed to create account.");
      }
    } catch (err: any) {
      setCreateOrgError(err?.message || "An unexpected error occurred while creating account.");
    } finally {
      setIsCreatingOrg(false);
    }
  };

  const handleUpdateOrgStatus = async (newStatus: OrganizationStatus) => {
    if (!selectedOrgId || !detailOrg) return;
    setIsUpdatingStatus(true);
    try {
      const res = await updateAdminOrganization(selectedOrgId, { status: newStatus });
      if (res.success) {
        setStatusUpdateSuccess(true);
        setTimeout(() => setStatusUpdateSuccess(false), 3000);
        await fetchDetails(selectedOrgId);
        await fetchOrganizations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Extract unique industries for filter
  const uniqueIndustries = useMemo(() => {
    const set = new Set<string>();
    organizations.forEach((o) => {
      if (o.industry) set.add(o.industry);
    });
    return Array.from(set).sort();
  }, [organizations]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const total = organizations.length;
    const active = organizations.filter((o) => o.status === "customer").length;
    const leads = organizations.filter((o) => o.status === "lead" || o.status === "prospect").length;
    const inactive = organizations.filter((o) => o.status === "churned").length;
    return { total, active, leads, inactive };
  }, [organizations]);

  // Paginated organizations slice
  const paginatedOrganizations = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return organizations.slice(start, start + PAGE_SIZE);
  }, [organizations, currentPage]);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-brand-500/20">
      <SEO
        title="Accounts & Organizations | Zakeem Solutions Admin"
        description="Comprehensive directory of client organizations, enterprise accounts, and commercial relationships."
        canonical="/admin/crm/organizations"
        noindex={true}
      />

      <AdminNav activeDesk="accounts" />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                  Accounts & Organizations
                  {!isSupabaseConfigured() && (
                    <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10 text-xs">
                      Local Mode
                    </Badge>
                  )}
                </h1>
                <p className="text-sm text-slate-400">
                  Manage enterprise client profiles, track company hierarchies, and inspect commercial relationships.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setShowCreateModal(true);
                setCreateOrgError(null);
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create Account
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchOrganizations}
              disabled={loading}
              className="border-slate-300 bg-white hover:bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:bg-slate-800 dark:text-slate-300"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Create Account Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-white font-bold text-base">
                  <Building2 className="w-5 h-5 text-brand-400" />
                  <span>Register Enterprise Account</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {createOrgError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{createOrgError}</span>
                </div>
              )}

              <form onSubmit={handleCreateOrganization} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                    Organization / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zenith Bank PLC"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                      Web Domain
                    </label>
                    <input
                      type="text"
                      placeholder="zenithbank.com"
                      value={newOrgDomain}
                      onChange={(e) => setNewOrgDomain(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                      Industry Sector
                    </label>
                    <select
                      value={newOrgIndustry}
                      onChange={(e) => setNewOrgIndustry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500 text-xs"
                    >
                      <option value="">General Commercial</option>
                      <option value="Financial Services">Financial Services & Banking</option>
                      <option value="Real Estate & Property">Real Estate & Property</option>
                      <option value="Energy & Oil/Gas">Energy & Oil / Gas</option>
                      <option value="Public Sector & Legal">Public Sector & Legal</option>
                      <option value="Healthcare">Healthcare & Life Sciences</option>
                      <option value="Technology & Media">Technology & Digital Media</option>
                      <option value="Retail & Consumer Goods">Commercial Retail & FMCG</option>
                      <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                      <option value="Other">Other Enterprise Sector</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                      Initial Commercial Status
                    </label>
                    <select
                      value={newOrgStatus}
                      onChange={(e) => setNewOrgStatus(e.target.value as OrganizationStatus)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500 text-xs"
                    >
                      <option value="lead">Inbound Lead</option>
                      <option value="prospect">Qualified Prospect</option>
                      <option value="customer">Active Client</option>
                      <option value="partner">Strategic Partner</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                      Company Scale / Tier
                    </label>
                    <select
                      value={newOrgCompanySize}
                      onChange={(e) => setNewOrgCompanySize(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500 text-xs"
                    >
                      <option value="startup">Startup / Growth Stage</option>
                      <option value="smb">SMB / Commercial Mid-Tier</option>
                      <option value="mid_market">Mid-Market Enterprise</option>
                      <option value="enterprise">Tier-1 Enterprise / Multicorp</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    disabled={isCreatingOrg}
                  >
                    {isCreatingOrg ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Accounts</span>
              <Building2 className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">{kpis.total}</p>
            <p className="text-xs text-slate-500 mt-1">Managed organizations</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Active Clients</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-300 mt-2">{kpis.active}</p>
            <p className="text-xs text-slate-500 mt-1">Live customer accounts</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">Prospect Accounts</span>
              <TrendingUp className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-2xl font-bold text-sky-300 mt-2">{kpis.leads}</p>
            <p className="text-xs text-slate-500 mt-1">Pipeline & lead stage</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Former / Inactive</span>
              <Clock className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-2xl font-bold text-slate-300 mt-2">{kpis.inactive}</p>
            <p className="text-xs text-slate-500 mt-1">Dormant profiles</p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 backdrop-blur-sm space-y-3 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by company name, domain, industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500/50 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 hidden md:block" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500/50"
              >
                <option value="all">All Statuses</option>
                <option value="customer">Active Clients</option>
                <option value="prospect">Qualified Prospects</option>
                <option value="lead">Inbound Leads</option>
                <option value="partner">Partners</option>
                <option value="churned">Former / Churned</option>
              </select>
            </div>

            {/* Industry Filter */}
            {uniqueIndustries.length > 0 && (
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500/50"
              >
                <option value="all">All Industries</option>
                {uniqueIndustries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            )}

            {(searchQuery || statusFilter !== "all" || industryFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setIndustryFilter("all");
                }}
                className="text-slate-400 hover:text-white"
              >
                Reset
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>
              Showing {organizations.length} {organizations.length === 1 ? "organization" : "organizations"}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Accounts Directory Table */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-brand-400" />
              <p className="text-sm">Loading accounts directory...</p>
            </div>
          ) : organizations.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Building2 className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              <p className="text-base font-medium text-slate-300">No organizations found</p>
              <p className="text-sm text-slate-500 mt-1">
                {searchQuery || statusFilter !== "all" || industryFilter !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "Accounts will automatically appear here as inbound leads and opportunities are registered."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Organization</th>
                    <th className="py-3.5 px-4">Industry</th>
                    <th className="py-3.5 px-4">Size / Tier</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginatedOrganizations.map((org) => {
                    const statusCfg = STATUS_CONFIG[org.status] || STATUS_CONFIG.lead;
                    const isSelected = selectedOrgId === org.id;

                    return (
                      <tr
                        key={org.id}
                        onClick={() => handleSelectOrg(org.id)}
                        className={cn(
                          "hover:bg-slate-800/40 cursor-pointer transition-colors group",
                          isSelected && "bg-brand-500/5 border-l-2 border-brand-500"
                        )}
                      >
                        {/* Org Name & Domain */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center text-brand-400 font-bold text-xs uppercase">
                              {org.name.slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium text-white group-hover:text-brand-300 transition-colors">
                                {org.name}
                              </p>
                              {org.domain ? (
                                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Globe className="w-3 h-3 text-slate-500" />
                                  {org.domain}
                                </p>
                              ) : (
                                <p className="text-xs text-slate-500 italic mt-0.5">No domain recorded</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Industry */}
                        <td className="py-3.5 px-4 text-slate-300">
                          {org.industry || <span className="text-slate-500 italic">Not specified</span>}
                        </td>

                        {/* Size */}
                        <td className="py-3.5 px-4">
                          <span className="text-xs text-slate-300 capitalize bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/50">
                            {org.companySize || "Standard"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                              statusCfg.border,
                              statusCfg.bg,
                              statusCfg.text
                            )}
                          >
                            {statusCfg.label}
                          </span>
                        </td>

                        {/* Created Date */}
                        <td className="py-3.5 px-4 text-xs text-slate-400">
                          {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : "—"}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectOrg(org.id);
                            }}
                            className="text-slate-200 hover:text-white hover:bg-slate-800"
                          >
                            View Profile
                            <ChevronRight className="w-4 h-4 ml-1" />
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
          {!loading && organizations.length > 0 && (
            <AdminPagination
              currentPage={currentPage}
              totalItems={organizations.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
              itemName="organizations"
            />
          )}
        </div>
      </main>

      {/* Organization Detail Drawer */}
      {selectedOrgId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 space-y-6 shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-lg uppercase flex-shrink-0">
                  {detailOrg?.name ? detailOrg.name.slice(0, 2) : "AC"}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {detailOrg?.name || "Account Profile"}
                    {detailOrg?.status && (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium border",
                          STATUS_CONFIG[detailOrg.status]?.border,
                          STATUS_CONFIG[detailOrg.status]?.bg,
                          STATUS_CONFIG[detailOrg.status]?.text
                        )}
                      >
                        {STATUS_CONFIG[detailOrg.status]?.label || detailOrg.status}
                      </span>
                    )}
                  </h2>
                  {detailOrg?.domain && (
                    <a
                      href={detailOrg.domain.startsWith("http") ? detailOrg.domain : `https://${detailOrg.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-400 hover:underline flex items-center gap-1 mt-1"
                    >
                      <Globe className="w-3 h-3" />
                      {detailOrg.domain}
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  )}

                  {detailOrg?.status && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-slate-500 font-mono uppercase">Lifecycle:</span>
                      <select
                        value={detailOrg.status}
                        onChange={(e) => handleUpdateOrgStatus(e.target.value as OrganizationStatus)}
                        disabled={isUpdatingStatus}
                        className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                      >
                        <option value="lead">Inbound Lead</option>
                        <option value="prospect">Qualified Prospect</option>
                        <option value="customer">Active Client</option>
                        <option value="partner">Strategic Partner</option>
                        <option value="churned">Former / Churned</option>
                      </select>
                      {statusUpdateSuccess && (
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3 h-3" /> Updated
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleCloseDrawer}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="py-16 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-brand-400" />
                <p className="text-sm">Loading account details...</p>
              </div>
            ) : detailError ? (
              <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <p className="text-sm">{detailError}</p>
              </div>
            ) : detailOrg ? (
              <div className="space-y-6">
                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-center">
                    <span className="text-xs text-slate-400">Contacts</span>
                    <p className="text-xl font-bold text-white mt-1">{detailOrg.contactsCount || detailOrg.contacts.length}</p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-center">
                    <span className="text-xs text-slate-400">Open Deals</span>
                    <p className="text-xl font-bold text-brand-400 mt-1">{detailOrg.activeOpportunitiesCount}</p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-center">
                    <span className="text-xs text-slate-400">Inbound Leads</span>
                    <p className="text-xl font-bold text-sky-400 mt-1">{detailOrg.leadsCount || detailOrg.leads.length}</p>
                  </div>
                </div>

                {/* Account Details Box */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-brand-400" />
                    Account Attributes
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Industry</span>
                      <span className="text-slate-200 font-medium">{detailOrg.industry || "General Commercial"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Company Tier</span>
                      <span className="text-slate-200 font-medium capitalize">{detailOrg.companySize || "Standard"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Internal ID</span>
                      <span className="text-slate-400 font-mono text-[10px] break-all">{detailOrg.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Created On</span>
                      <span className="text-slate-200">{new Date(detailOrg.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Linked Contacts */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Users className="w-4 h-4 text-brand-400" />
                      Associated Contacts ({detailOrg.contacts.length})
                    </h3>
                  </div>

                  {detailOrg.contacts.length === 0 ? (
                    <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 text-center text-xs text-slate-500">
                      No contacts currently linked to this account.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {detailOrg.contacts.map((c) => (
                        <div
                          key={c.id}
                          className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-3.5 flex items-center justify-between hover:border-slate-700 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-white">{c.fullName}</p>
                              {c.isPrimary && (
                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-brand-500/30 bg-brand-500/10 text-brand-300">
                                  Primary
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                              {c.jobTitle && <span>{c.jobTitle}</span>}
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-500" />
                                {c.email}
                              </span>
                              {c.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-500" />
                                  {c.phone}
                                </span>
                              )}
                            </div>
                          </div>

                          <Link
                            to={`/admin/crm/contacts?contactId=${c.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Open Contact Profile"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pipeline & Opportunities */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-brand-400" />
                      Pipeline & Opportunities ({detailOrg.opportunities.length})
                    </h3>
                  </div>

                  {detailOrg.opportunities.length === 0 ? (
                    <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 text-center text-xs text-slate-500">
                      No commercial opportunities currently active for this account.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {detailOrg.opportunities.map((opp) => (
                        <div
                          key={opp.id}
                          className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-3.5 flex items-center justify-between hover:border-slate-700 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-white">{opp.title}</p>
                              <Badge variant="outline" className="text-[10px] py-0 capitalize">
                                {opp.stage.replace("_", " ")}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                              <span>Product: {opp.primaryProduct || "Multi-Suite"}</span>
                              <span>
                                Value: {opp.dealValueNgn ? `₦${opp.dealValueNgn.toLocaleString()}` : "Pending qualification"}
                              </span>
                            </div>
                          </div>

                          <Link
                            to={`/admin/crm/pipeline?oppId=${opp.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Open in Pipeline Desk"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Inbound Leads */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-brand-400" />
                      Inbound Leads ({detailOrg.leads.length})
                    </h3>
                  </div>

                  {detailOrg.leads.length === 0 ? (
                    <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 text-center text-xs text-slate-500">
                      No inbound leads recorded for this account.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {detailOrg.leads.map((l) => (
                        <div
                          key={l.id}
                          className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-3.5 flex items-center justify-between hover:border-slate-700 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-brand-400">{l.referenceId}</span>
                              <Badge variant="outline" className="text-[10px] py-0 capitalize">
                                {l.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              Interest: {l.productInterest || "General Platform"} • {new Date(l.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <Link
                            to={`/admin/crm/leads?leadId=${l.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Open Lead"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Quick Note Form */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-400" />
                    Log Account Interaction / Note
                  </h3>
                  <form onSubmit={handleAddNote} className="space-y-2.5">
                    <input
                      type="text"
                      placeholder="Note subject / summary..."
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500/50"
                      required
                    />
                    <textarea
                      placeholder="Enter detailed executive notes, context, or next actions..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500/50 resize-none"
                      required
                    />
                    <div className="flex items-center justify-between">
                      {noteSuccess && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Note saved to account timeline
                        </span>
                      )}
                      <Button
                        type="submit"
                        size="sm"
                        disabled={submittingNote || !noteTitle.trim() || !noteContent.trim()}
                        className="ml-auto bg-brand-600 hover:bg-brand-500 text-white text-xs"
                      >
                        <Send className="w-3 h-3 mr-1.5" />
                        {submittingNote ? "Saving..." : "Log Note"}
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Activity Stream */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-400" />
                    Account Activity Timeline
                  </h3>
                  <CRMActivityStream
                    organizationId={detailOrg.id}
                    refreshTrigger={activityRefreshTrigger}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export { AdminOrganizationsPage };
