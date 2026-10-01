import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  GraduationCap,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  X,
  Building2,
  Mail,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  Send,
  RotateCw,
  AlertCircle,
  Info,
  ShieldCheck,
  Layers,
  Sparkles,
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  ApplicantType,
  TRAINING_COURSES,
  TrainingApplicationFilter,
  TrainingApplicationRecord,
  TrainingApplicationStatus,
  TrainingCourse,
  TrainingKPIStats,
} from "@/types/training";
import {
  addAdminTrainingNote,
  confirmAdminTrainingApplication,
  getAdminTrainingApplications,
  getAdminTrainingApplicationById,
  retryOrganizationTrainingCRM,
  updateAdminTrainingStatus,
} from "@/lib/trainingService";

export const AdminTrainingPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlRef = searchParams.get("ref");

  const [applications, setApplications] = useState<TrainingApplicationRecord[]>([]);
  const [kpiStats, setKpiStats] = useState<TrainingKPIStats>({
    totalApplications: 0,
    submitted: 0,
    inReview: 0,
    confirmed: 0,
    cancelled: 0,
    organizations: 0,
    individuals: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TrainingApplicationStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | ApplicantType>("all");
  const [courseFilter, setCourseFilter] = useState<"all" | TrainingCourse>("all");
  const [crmFilter, setCrmFilter] = useState<"all" | "linked" | "unlinked">("all");

  // Pagination
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Detail Drawer State
  const [selectedAppRef, setSelectedAppRef] = useState<string | null>(urlRef);
  const [selectedApp, setSelectedApp] = useState<TrainingApplicationRecord | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  // Note State
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  // CRM Retry State
  const [isRetryingCRM, setIsRetryingCRM] = useState(false);

  // Load applications
  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: TrainingApplicationFilter = {
        search: searchQuery,
        status: statusFilter,
        applicantType: typeFilter,
        course: courseFilter,
        crmStatus: crmFilter,
      };

      const result = await getAdminTrainingApplications(filters);
      if (result.success) {
        setApplications(result.data);
        setKpiStats(result.stats);
      } else {
        setError(result.error || "Failed to load training applications.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching applications.");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, typeFilter, courseFilter, crmFilter]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  // Handle URL ref query parameter sync
  useEffect(() => {
    if (urlRef) {
      setSelectedAppRef(urlRef);
    }
  }, [urlRef]);

  // Load selected application detail
  useEffect(() => {
    if (!selectedAppRef) {
      setSelectedApp(null);
      return;
    }

    let isMounted = true;
    setIsLoadingDetail(true);

    getAdminTrainingApplicationById(selectedAppRef)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.application) {
          setSelectedApp(res.application);
        } else {
          setSelectedApp(null);
        }
      })
      .catch(() => {
        if (isMounted) setSelectedApp(null);
      })
      .finally(() => {
        if (isMounted) setIsLoadingDetail(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedAppRef]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter, courseFilter, crmFilter]);

  // Paginated records
  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return applications.slice(startIndex, startIndex + PAGE_SIZE);
  }, [applications, currentPage]);

  const handleOpenDetail = (app: TrainingApplicationRecord) => {
    setSelectedAppRef(app.applicationReference);
    setSelectedApp(app);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("ref", app.applicationReference);
      return p;
    });
  };

  const handleCloseDetail = () => {
    setSelectedAppRef(null);
    setSelectedApp(null);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.delete("ref");
      return p;
    });
  };

  const handleCopyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // Status Action: Move to In Review
  const handleMoveToReview = async () => {
    if (!selectedApp) return;
    setIsLoadingDetail(true);
    try {
      const res = await updateAdminTrainingStatus({
        idOrRef: selectedApp.applicationReference,
        newStatus: "in_review",
        actor: user?.email || "admin",
      });

      if (res.success && res.application) {
        setSelectedApp(res.application);
        setSuccessMessage(`Application ${selectedApp.applicationReference} moved to In Review.`);
        await loadApplications();
      } else {
        setError(res.error || "Failed to update status to In Review.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error transitioning status.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Status Action: Confirm Application
  const handleConfirmApplication = async () => {
    if (!selectedApp) return;
    setIsSubmittingConfirm(true);
    setError(null);
    try {
      const res = await confirmAdminTrainingApplication({
        application: selectedApp,
        actor: user?.email || "admin",
      });

      if (res.success && res.application) {
        setSelectedApp(res.application);
        setShowConfirmModal(false);
        setSuccessMessage(
          `Application ${selectedApp.applicationReference} confirmed! ${
            res.emailDispatched ? "Confirmation email dispatched to applicant." : ""
          }`
        );
        await loadApplications();
      } else {
        setError(res.error || "Failed to confirm training application.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error confirming application.");
    } finally {
      setIsSubmittingConfirm(false);
    }
  };

  // Status Action: Cancel Application
  const handleCancelApplication = async () => {
    if (!selectedApp) return;
    if (!cancelReason.trim()) {
      setCancelError("A valid, non-empty cancellation reason is mandatory.");
      return;
    }

    setIsSubmittingCancel(true);
    setCancelError(null);
    try {
      const res = await updateAdminTrainingStatus({
        idOrRef: selectedApp.applicationReference,
        newStatus: "cancelled",
        reason: cancelReason.trim(),
        actor: user?.email || "admin",
      });

      if (res.success && res.application) {
        setSelectedApp(res.application);
        setShowCancelModal(false);
        setCancelReason("");
        setSuccessMessage(`Application ${selectedApp.applicationReference} has been cancelled.`);
        await loadApplications();
      } else {
        setCancelError(res.error || "Failed to cancel application.");
      }
    } catch (err: unknown) {
      setCancelError(err instanceof Error ? err.message : "Error cancelling application.");
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // Add Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !newNote.trim()) return;

    setIsAddingNote(true);
    try {
      const res = await addAdminTrainingNote({
        idOrRef: selectedApp.applicationReference,
        note: newNote.trim(),
        actor: user?.email || "admin",
      });

      if (res.success && res.application) {
        setSelectedApp(res.application);
        setNewNote("");
        setSuccessMessage("Note added successfully.");
        await loadApplications();
      } else {
        setError(res.error || "Failed to add note.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error adding note.");
    } finally {
      setIsAddingNote(false);
    }
  };

  // Retry CRM
  const handleRetryCRM = async () => {
    if (!selectedApp || selectedApp.applicantType !== "organization") return;
    setIsRetryingCRM(true);
    setError(null);
    try {
      const res = await retryOrganizationTrainingCRM(selectedApp.applicationReference);
      if (res.success) {
        setSuccessMessage("CRM synchronization completed successfully.");
        // Reload detail and list
        const updated = await getAdminTrainingApplicationById(selectedApp.applicationReference);
        if (updated.success && updated.application) {
          setSelectedApp(updated.application);
        }
        await loadApplications();
      } else {
        setError(res.error || "CRM retry failed.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error during CRM retry.");
    } finally {
      setIsRetryingCRM(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setCourseFilter("all");
    setCrmFilter("all");
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    courseFilter !== "all" ||
    crmFilter !== "all";

  // Helpers for badges
  const renderStatusBadge = (status: TrainingApplicationStatus) => {
    switch (status) {
      case "submitted":
        return <Badge variant="outline" className="font-mono text-[11px] uppercase tracking-wider text-amber-500 border-amber-500/30 bg-amber-500/10">Submitted</Badge>;
      case "in_review":
        return <Badge variant="outline" className="font-mono text-[11px] uppercase tracking-wider text-sky-500 border-sky-500/30 bg-sky-500/10">In Review</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="font-mono text-[11px] uppercase tracking-wider text-emerald-500 border-emerald-500/30 bg-emerald-500/10">Confirmed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="font-mono text-[11px] uppercase tracking-wider text-red-500 border-red-500/30 bg-red-500/10">Cancelled</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030d1a] text-slate-900 dark:text-slate-100 pb-16 pt-24">
      <SEO
        title="IT Training Admissions Desk | Zakeem Admin"
        description="Operational management and admissions dispatch for online IT training cohorts."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <AdminNav currentTab="training" activeDesk="training" />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#e57804]/10 text-[#e57804] border border-[#e57804]/20">
                <GraduationCap className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                IT Training Admissions Desk
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Operational review, admissions verification, and cohort scheduling for online IT training applicants.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadApplications()}
              disabled={isLoading}
              className="font-mono text-xs gap-1.5"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
              <span>Refresh</span>
            </Button>
            <Link to="/training" target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="bg-[#e57804] hover:bg-[#e57804]/90 text-white font-mono text-xs gap-1.5 shadow-sm">
                <span>Public Form</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-3 text-red-700 dark:text-red-300 text-xs sm:text-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1">{error}</div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
            <div className="flex-1 font-mono">{successMessage}</div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* KPI Operational Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {/* Total */}
          <div className="p-4 rounded-2xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#06152b]/60 backdrop-blur-md">
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Total Applications</div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
              {kpiStats.totalApplications}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">All Time Submissions</div>
          </div>

          {/* Submitted (New) */}
          <div className="p-4 rounded-2xl border border-amber-200/60 bg-amber-500/5 dark:border-amber-500/20 dark:bg-amber-500/5 backdrop-blur-md">
            <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400">New / Submitted</div>
            <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-300 mt-1">
              {kpiStats.submitted}
            </div>
            <div className="text-[10px] text-amber-600/70 dark:text-amber-400/60 mt-0.5 font-mono">Awaiting Review</div>
          </div>

          {/* In Review */}
          <div className="p-4 rounded-2xl border border-sky-200/60 bg-sky-500/5 dark:border-sky-500/20 dark:bg-sky-500/5 backdrop-blur-md">
            <div className="text-[11px] font-mono text-sky-600 dark:text-sky-400">In Review</div>
            <div className="text-2xl font-bold font-mono text-sky-600 dark:text-sky-300 mt-1">
              {kpiStats.inReview}
            </div>
            <div className="text-[10px] text-sky-600/70 dark:text-sky-400/60 mt-0.5 font-mono">Under Assessment</div>
          </div>

          {/* Confirmed */}
          <div className="p-4 rounded-2xl border border-emerald-200/60 bg-emerald-500/5 dark:border-emerald-500/20 dark:bg-emerald-500/5 backdrop-blur-md">
            <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">Confirmed</div>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-300 mt-1">
              {kpiStats.confirmed}
            </div>
            <div className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60 mt-0.5 font-mono">Cohort Confirmed</div>
          </div>

          {/* Organizations */}
          <div className="p-4 rounded-2xl border border-purple-200/60 bg-purple-500/5 dark:border-purple-500/20 dark:bg-purple-500/5 backdrop-blur-md">
            <div className="text-[11px] font-mono text-purple-600 dark:text-purple-400">Organizations</div>
            <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-300 mt-1">
              {kpiStats.organizations}
            </div>
            <div className="text-[10px] text-purple-600/70 dark:text-purple-400/60 mt-0.5 font-mono">Corporate Teams</div>
          </div>

          {/* Individuals */}
          <div className="p-4 rounded-2xl border border-indigo-200/60 bg-indigo-500/5 dark:border-indigo-500/20 dark:bg-indigo-500/5 backdrop-blur-md">
            <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">Individuals</div>
            <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-300 mt-1">
              {kpiStats.individuals}
            </div>
            <div className="text-[10px] text-indigo-600/70 dark:text-indigo-400/60 mt-0.5 font-mono">Direct Applicants</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="border border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-[#06152b]/60 backdrop-blur-md rounded-2xl p-4 mb-6 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search reference, name, org, email, course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl text-xs font-mono bg-white dark:bg-[#081c38]/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#e57804]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div>
              <select
                aria-label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-[#081c38]/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e57804]"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="in_review">In Review</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Applicant Type Filter */}
            <div>
              <select
                aria-label="Filter by Applicant Type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-[#081c38]/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e57804]"
              >
                <option value="all">All Applicant Types</option>
                <option value="individual">Individual Applicants</option>
                <option value="organization">Organization Applicants</option>
              </select>
            </div>

            {/* Course Filter */}
            <div>
              <select
                aria-label="Filter by Course"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-[#081c38]/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e57804]"
              >
                <option value="all">All Courses</option>
                {TRAINING_COURSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Secondary filter & reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-white/5 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">CRM Link:</span>
              <button
                type="button"
                onClick={() => setCrmFilter("all")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-colors",
                  crmFilter === "all" ? "bg-[#e57804]/20 text-[#e57804] font-medium" : "text-slate-400 hover:text-white"
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setCrmFilter("linked")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-colors",
                  crmFilter === "linked" ? "bg-emerald-500/20 text-emerald-400 font-medium" : "text-slate-400 hover:text-white"
                )}
              >
                CRM Linked
              </button>
              <button
                type="button"
                onClick={() => setCrmFilter("unlinked")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-colors",
                  crmFilter === "unlinked" ? "bg-amber-500/20 text-amber-400 font-medium" : "text-slate-400 hover:text-white"
                )}
              >
                Not Linked
              </button>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[#e57804] hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset all filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Table / List Container */}
        <div className="border border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-[#06152b]/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="p-8 text-center font-mono text-sm text-slate-400 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#e57804]" />
              <span>Loading training applications...</span>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center font-mono">
              <GraduationCap className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-50" />
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No training applications found
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {hasActiveFilters
                  ? "No applications matched your active search and filter criteria."
                  : "No IT training applications have been registered yet."}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-4 font-mono text-xs"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#081c38]/40 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Reference</th>
                      <th className="py-3.5 px-4 font-semibold">Applicant</th>
                      <th className="py-3.5 px-4 font-semibold">Type</th>
                      <th className="py-3.5 px-4 font-semibold">Course</th>
                      <th className="py-3.5 px-4 font-semibold">Schedule</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold">CRM</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                    {paginatedApplications.map((app) => {
                      const isOrg = app.applicantType === "organization";
                      return (
                        <tr
                          key={app.applicationReference}
                          onClick={() => handleOpenDetail(app)}
                          className={cn(
                            "cursor-pointer hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors",
                            selectedAppRef === app.applicationReference && "bg-[#e57804]/5 dark:bg-[#e57804]/10"
                          )}
                        >
                          {/* Reference */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{app.applicationReference}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </div>
                          </td>

                          {/* Applicant */}
                          <td className="py-3.5 px-4 max-w-[200px] truncate">
                            {isOrg ? (
                              <div>
                                <div className="font-medium text-slate-900 dark:text-slate-200 truncate flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-purple-400 shrink-0" />
                                  <span className="truncate">{app.organizationName}</span>
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                  {app.businessEmail}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="font-medium text-slate-900 dark:text-slate-200 truncate flex items-center gap-1">
                                  <User className="w-3 h-3 text-cyan-400 shrink-0" />
                                  <span className="truncate">{app.fullName}</span>
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                  {app.email}
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Type */}
                          <td className="py-3.5 px-4">
                            <span
                              className={cn(
                                "inline-block px-2 py-0.5 rounded-md text-[10px] uppercase font-semibold",
                                isOrg
                                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                                  : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                              )}
                            >
                              {app.applicantType}
                            </span>
                          </td>

                          {/* Course */}
                          <td className="py-3.5 px-4 max-w-[220px]">
                            <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                              {app.course}
                            </div>
                            {app.course === "Customized Training" && (
                              <div className="text-[10px] text-[#e57804] truncate">
                                Customized Request
                              </div>
                            )}
                          </td>

                          {/* Schedule */}
                          <td className="py-3.5 px-4">
                            <div className="text-slate-800 dark:text-slate-200">
                              {app.preferredStartDate}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                              {app.trainingDays.join(", ")} &bull; {app.preferredTime} WAT
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            {renderStatusBadge(app.status)}
                          </td>

                          {/* CRM */}
                          <td className="py-3.5 px-4">
                            {isOrg ? (
                              app.crmLeadId ? (
                                <Badge variant="outline" className="font-mono text-[10px] text-emerald-500 border-emerald-500/30">
                                  CRM Linked
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="font-mono text-[10px] text-amber-500 border-amber-500/30">
                                  Needs Sync
                                </Badge>
                              )
                            ) : (
                              <span className="text-slate-400 text-[10px]">Direct</span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="font-mono text-xs text-[#e57804] hover:text-[#e57804]/80 hover:bg-[#e57804]/10 h-7 px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetail(app);
                              }}
                            >
                              <span>Manage</span>
                              <ChevronRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-slate-200/60 dark:divide-white/5">
                {paginatedApplications.map((app) => {
                  const isOrg = app.applicantType === "organization";
                  return (
                    <div
                      key={app.applicationReference}
                      onClick={() => handleOpenDetail(app)}
                      className="p-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                            {app.applicationReference}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {renderStatusBadge(app.status)}
                      </div>

                      <div className="text-xs mb-2">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {isOrg ? app.organizationName : app.fullName}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                          {isOrg ? app.businessEmail : app.email}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-300 mb-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5">
                          {app.course}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5">
                          Start: {app.preferredStartDate}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/5">
                        <div>
                          {isOrg && (
                            <span className="text-[10px] font-mono text-slate-400">
                              {app.crmLeadId ? "✓ CRM Linked" : "⚠ CRM Sync Required"}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-mono text-xs text-[#e57804] h-7 px-2"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-slate-200 dark:border-white/10">
                <AdminPagination
                  currentPage={currentPage}
                  totalItems={applications.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCurrentPage}
                  itemName="applications"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Application Detail Drawer */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn">
          <div className="w-full max-w-2xl bg-white dark:bg-[#06152b] border-l border-slate-200 dark:border-white/10 shadow-2xl h-full flex flex-col overflow-hidden">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-[#081c38]/60">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-lg text-slate-900 dark:text-white">
                    {selectedApp.applicationReference}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyRef(selectedApp.applicationReference)}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    title="Copy Reference"
                  >
                    {copiedRef ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  {renderStatusBadge(selectedApp.status)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  Submitted on {new Date(selectedApp.createdAt).toLocaleString()}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseDetail}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* APPLICANT SECTION */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-[#081c38]/40">
                <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#e57804]" />
                  <span>Applicant Information ({selectedApp.applicantType})</span>
                </div>
                {selectedApp.applicantType === "organization" ? (
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Organization:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedApp.organizationName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Business Email:</span>
                      <a href={`mailto:${selectedApp.businessEmail}`} className="text-[#e57804] hover:underline">
                        {selectedApp.businessEmail}
                      </a>
                    </div>
                    {selectedApp.crmContactName && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Contact Person:</span>
                        <span className="text-slate-800 dark:text-slate-200">{selectedApp.crmContactName}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Full Name:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedApp.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Personal Email:</span>
                      <a href={`mailto:${selectedApp.email}`} className="text-[#e57804] hover:underline">
                        {selectedApp.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* TRAINING SPECIFICATIONS */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-[#081c38]/40">
                <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#e57804]" />
                  <span>Training Specifications</span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Enrolled Course:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedApp.course}</span>
                  </div>
                  {selectedApp.customTrainingRequest && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-white/5">
                      <span className="text-slate-500 dark:text-slate-400 block mb-1">Custom Training Requirements:</span>
                      <div className="p-2.5 rounded-lg bg-white dark:bg-[#06152b] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {selectedApp.customTrainingRequest}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500 dark:text-slate-400">Delivery Mode:</span>
                    <span className="text-emerald-500 font-semibold">Fully Online (Live / Structured)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Preferred Start Date:</span>
                    <span className="text-slate-900 dark:text-white font-medium">{selectedApp.preferredStartDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Selected 3 Days:</span>
                    <span className="text-slate-900 dark:text-white font-medium">{selectedApp.trainingDays.join(", ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Session Duration:</span>
                    <span className="text-slate-900 dark:text-white">2 hours per session</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Preferred Time:</span>
                    <span className="text-slate-900 dark:text-white">{selectedApp.preferredTime} ({selectedApp.timezone})</span>
                  </div>
                </div>
              </div>

              {/* ACKNOWLEDGEMENT */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-[#081c38]/40">
                <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Applicant Acknowledgement</span>
                </div>
                <div className="text-xs font-mono space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Candidate confirmed 3-day weekly online attendance & requirements.</span>
                  </div>
                  <div className="text-[10px] text-slate-400 pl-6">
                    Accepted at: {new Date(selectedApp.acknowledgementAcceptedAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* CRM LINKAGE */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-[#081c38]/40">
                <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    <span>CRM Synchronization</span>
                  </div>
                  {selectedApp.applicantType === "organization" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRetryCRM}
                      disabled={isRetryingCRM}
                      className="h-6 text-[10px] font-mono text-[#e57804] hover:text-[#e57804] gap-1 p-1"
                    >
                      <RotateCw className={cn("w-3 h-3", isRetryingCRM && "animate-spin")} />
                      <span>{selectedApp.crmLeadId ? "Re-sync" : "Sync to CRM"}</span>
                    </Button>
                  )}
                </div>

                {selectedApp.applicantType === "organization" ? (
                  selectedApp.crmLeadId ? (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400">CRM Lead ID:</span>
                        <span className="text-slate-800 dark:text-slate-200">{selectedApp.crmLeadId}</span>
                      </div>
                      {selectedApp.crmLeadStatus && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 dark:text-slate-400">Lead Status:</span>
                          <span className="capitalize text-emerald-500 font-semibold">{selectedApp.crmLeadStatus}</span>
                        </div>
                      )}
                      <div className="pt-2">
                        <Link
                          to={`/admin/crm/leads?search=${selectedApp.applicationReference}`}
                          className="text-[#e57804] hover:underline flex items-center gap-1 text-[11px]"
                        >
                          <span>Open CRM Lead Record</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-600 dark:text-amber-400 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold">CRM synchronization requires attention</div>
                        <p className="text-[11px] mt-0.5 opacity-90">
                          This organization applicant has not been linked to a canonical CRM lead record.
                        </p>
                        <Button
                          size="sm"
                          onClick={handleRetryCRM}
                          disabled={isRetryingCRM}
                          className="mt-2 h-7 bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs gap-1.5"
                        >
                          <RotateCw className={cn("w-3 h-3", isRetryingCRM && "animate-spin")} />
                          <span>Retry CRM Synchronization</span>
                        </Button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Individual Candidate — Direct Training (No Corporate CRM Record)</span>
                  </div>
                )}
              </div>

              {/* ADMIN NOTES */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-[#081c38]/40">
                <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#e57804]" />
                  <span>Internal Admissions Notes</span>
                </div>

                {selectedApp.adminNotes ? (
                  <div className="p-3 rounded-lg bg-white dark:bg-[#06152b] border border-slate-200 dark:border-white/5 text-xs font-mono whitespace-pre-wrap text-slate-800 dark:text-slate-200 mb-3 max-h-48 overflow-y-auto">
                    {selectedApp.adminNotes}
                  </div>
                ) : (
                  <div className="text-xs font-mono text-slate-400 italic mb-3">
                    No administrative notes recorded yet.
                  </div>
                )}

                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Record internal admissions note (e.g. Schedule approved, custom curriculum required)..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full p-2.5 rounded-lg text-xs font-mono bg-white dark:bg-[#06152b] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#e57804]"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isAddingNote || !newNote.trim()}
                      className="font-mono text-xs h-7 bg-[#e57804] hover:bg-[#e57804]/90 text-white"
                    >
                      {isAddingNote ? "Saving..." : "Add Note"}
                    </Button>
                  </div>
                </form>
              </div>

              {/* STATUS BANNERS & TIMESTAMPS */}
              {selectedApp.status === "confirmed" && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Application Confirmed</div>
                    <p className="text-[11px] mt-0.5">
                      Admissions confirmation has been processed. Confirmation email has been dispatched to the candidate.
                    </p>
                    {selectedApp.confirmedAt && (
                      <div className="text-[10px] text-emerald-500/70 mt-1">
                        Confirmed at: {new Date(selectedApp.confirmedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedApp.status === "cancelled" && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-600 dark:text-red-400 flex items-start gap-2.5">
                  <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Application Cancelled</div>
                    <p className="text-[11px] mt-0.5 font-medium">
                      Reason: {selectedApp.cancellationReason || "No reason specified."}
                    </p>
                    {selectedApp.cancelledAt && (
                      <div className="text-[10px] text-red-500/70 mt-1">
                        Cancelled at: {new Date(selectedApp.cancelledAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#081c38]/60 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-mono text-slate-400">
                Ref: {selectedApp.applicationReference}
              </div>

              <div className="flex items-center gap-2">
                {selectedApp.status === "submitted" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMoveToReview}
                    disabled={isLoadingDetail}
                    className="font-mono text-xs"
                  >
                    Move to Review
                  </Button>
                )}

                {(selectedApp.status === "submitted" || selectedApp.status === "in_review") && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCancelModal(true)}
                      disabled={isLoadingDetail}
                      className="font-mono text-xs text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-500/10 border-red-200 dark:border-red-900/40"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShowConfirmModal(true)}
                      disabled={isLoadingDetail}
                      className="font-mono text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Application</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#06152b] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-emerald-500 mb-4">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="font-mono font-bold text-base text-slate-900 dark:text-white">
                Confirm Training Application
              </h3>
            </div>

            <p className="text-xs font-mono text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Are you sure you want to officially confirm application{" "}
              <strong className="text-slate-900 dark:text-white">{selectedApp.applicationReference}</strong> for{" "}
              <strong>{selectedApp.applicantType === "organization" ? selectedApp.organizationName : selectedApp.fullName}</strong>?
            </p>

            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-700 dark:text-emerald-300 mb-4 space-y-1">
              <div>&bull; Status will transition to <strong>Confirmed</strong>.</div>
              <div>&bull; Official confirmation email will be dispatched to <strong>{selectedApp.applicantType === "organization" ? selectedApp.businessEmail : selectedApp.email}</strong>.</div>
              <div>&bull; Deterministic idempotency protects against duplicate dispatches.</div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmittingConfirm}
                className="font-mono text-xs"
              >
                Go Back
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmApplication}
                disabled={isSubmittingConfirm}
                className="font-mono text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              >
                {isSubmittingConfirm ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{isSubmittingConfirm ? "Confirming..." : "Confirm & Send Email"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {showCancelModal && selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#06152b] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-mono font-bold text-base text-slate-900 dark:text-white">
                Cancel Training Application
              </h3>
            </div>

            <p className="text-xs font-mono text-slate-600 dark:text-slate-300 mb-4">
              Please enter the operational reason for cancelling application{" "}
              <strong>{selectedApp.applicationReference}</strong>. A cancellation reason is mandatory.
            </p>

            {cancelError && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-600 dark:text-red-400">
                {cancelError}
              </div>
            )}

            <div className="mb-4">
              <textarea
                rows={3}
                placeholder="Reason for cancellation (e.g. Candidate withdrew application, cohort capacity reached)..."
                value={cancelReason}
                onChange={(e) => {
                  setCancelReason(e.target.value);
                  setCancelError(null);
                }}
                className="w-full p-2.5 rounded-lg text-xs font-mono bg-white dark:bg-[#081c38]/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                  setCancelError(null);
                }}
                disabled={isSubmittingCancel}
                className="font-mono text-xs"
              >
                Go Back
              </Button>
              <Button
                size="sm"
                onClick={handleCancelApplication}
                disabled={isSubmittingCancel || !cancelReason.trim()}
                className="font-mono text-xs bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmittingCancel ? "Cancelling..." : "Confirm Cancellation"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
