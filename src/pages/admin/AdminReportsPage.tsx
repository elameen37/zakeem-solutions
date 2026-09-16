import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  TrendingUp,
  Download,
  RefreshCw,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Briefcase,
  Building2,
  Users,
  Award,
  ArrowRight,
  ExternalLink,
  DollarSign,
  ShieldCheck,
  Target,
  Sparkles,
  PieChart,
  Globe,
  Sliders,
  Filter,
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AdminNav } from "@/components/admin/AdminNav";
import { cn } from "@/lib/utils";
import {
  CRMCommercialReport,
  OpportunityStage,
  OrganizationStatus,
  ReportDateRangeFilter,
  ReportDateRangeOption,
} from "@/types/crm";
import { getCRMCommercialReport } from "@/lib/crmService";
import { generateCRMReportCSV, downloadCSV } from "@/lib/csvExport";
import { isSupabaseConfigured } from "@/lib/supabase";

const STAGE_LABELS: Record<OpportunityStage, { label: string; color: string; border: string; bg: string }> = {
  discovery: { label: "Discovery", color: "text-sky-300", border: "border-sky-500/30", bg: "bg-sky-500/10" },
  demo_scheduled: { label: "Demo Scheduled", color: "text-blue-300", border: "border-blue-500/30", bg: "bg-blue-500/10" },
  demo_completed: { label: "Demo Completed", color: "text-indigo-300", border: "border-indigo-500/30", bg: "bg-indigo-500/10" },
  proposal: { label: "Proposal Out", color: "text-amber-300", border: "border-amber-500/30", bg: "bg-amber-500/10" },
  negotiation: { label: "Negotiation", color: "text-purple-300", border: "border-purple-500/30", bg: "bg-purple-500/10" },
  won: { label: "Closed Won", color: "text-emerald-300", border: "border-emerald-500/30", bg: "bg-emerald-500/10" },
  lost: { label: "Closed Lost", color: "text-rose-400", border: "border-rose-500/30", bg: "bg-rose-500/10" },
};

const ORG_STATUS_LABELS: Record<OrganizationStatus, { label: string; color: string; border: string; bg: string }> = {
  customer: { label: "Active Clients", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" },
  prospect: { label: "Prospects", color: "text-indigo-400", border: "border-indigo-500/30", bg: "bg-indigo-500/10" },
  lead: { label: "Inbound Leads", color: "text-sky-400", border: "border-sky-500/30", bg: "bg-sky-500/10" },
  partner: { label: "Partners", color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/10" },
  churned: { label: "Former / Churned", color: "text-slate-400", border: "border-slate-700", bg: "bg-slate-800/40" },
};

export default function AdminReportsPage() {
  const [selectedRange, setSelectedRange] = useState<ReportDateRangeOption>("30d");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const [report, setReport] = useState<CRMCommercialReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filter: ReportDateRangeFilter = {
        option: selectedRange,
        customStartDate: selectedRange === "custom" && customStartDate ? customStartDate : undefined,
        customEndDate: selectedRange === "custom" && customEndDate ? customEndDate : undefined,
      };

      const res = await getCRMCommercialReport(filter);
      if (res.success && res.report) {
        setReport(res.report);
      } else {
        setReport(null);
        setError(res.error || "Failed to compile commercial report.");
      }
    } catch (err: any) {
      setReport(null);
      setError(err?.message || "An unexpected error occurred while loading reports.");
    } finally {
      setLoading(false);
    }
  }, [selectedRange, customStartDate, customEndDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleRangeChange = (range: ReportDateRangeOption) => {
    setSelectedRange(range);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("crm-report-filter-changed", {
          bubbles: true,
          detail: { dateRange: range },
        })
      );
    }
  };

  const handleExportCSV = () => {
    if (!report) return;
    setIsExporting(true);
    try {
      const csv = generateCRMReportCSV(report);
      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `zakeem-crm-report-${selectedRange}-${dateStr}.csv`;
      downloadCSV(csv, filename);

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("crm-report-exported", {
            bubbles: true,
            detail: { format: "csv", filename },
          })
        );
      }
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-brand-500/20">
      <SEO
        title="CRM Commercial Intelligence & Reports | Zakeem Solutions Admin"
        description="Comprehensive commercial reporting, lead funnel metrics, pipeline velocity, product demand, and scheduling intelligence."
        canonical="/admin/crm/reports"
      />

      <AdminNav activeDesk="reports" />

      <main className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                  Commercial Intelligence & Reports
                  {!isSupabaseConfigured() && (
                    <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10 text-xs">
                      Local Mode
                    </Badge>
                  )}
                </h1>
                <p className="text-sm text-slate-400">
                  Audit-grade operational intelligence across lead capture, pipeline valuation, product demand, and bookings.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchReport}
              disabled={loading}
              className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportCSV}
              disabled={loading || !report || isExporting}
              className="bg-brand-600 hover:bg-brand-500 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "Exporting..." : "Export CSV"}
            </Button>
          </div>
        </div>

        {/* Date Filter Strip */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 backdrop-blur-sm space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Quick Range Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {(
                [
                  { id: "7d", label: "Last 7 Days" },
                  { id: "30d", label: "Last 30 Days" },
                  { id: "90d", label: "Last 90 Days" },
                  { id: "ytd", label: "Year to Date" },
                  { id: "all", label: "All Time" },
                  { id: "custom", label: "Custom Range" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleRangeChange(tab.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                    selectedRange === tab.id
                      ? "bg-brand-500 text-white shadow-sm font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Basis & Semantics Notice */}
            <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono shrink-0">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{report?.dateRange.timestampBasis || "Africa/Lagos WAT timestamps"}</span>
            </div>
          </div>

          {/* Custom Date Inputs */}
          {selectedRange === "custom" && (
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80 animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">From:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">To:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchReport}
                disabled={loading || (!customStartDate && !customEndDate)}
                className="text-xs border-slate-700 hover:bg-slate-800"
              >
                Apply Custom Range
              </Button>
            </div>
          )}
        </div>

        {/* Error Alert (Top Banner for background refresh warnings) */}
        {error && report && (
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Dedicated Non-Destructive Database Error State: Displayed when database reporting fails */}
        {error && !report ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-8 text-center backdrop-blur-sm max-w-2xl mx-auto space-y-5 my-8">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Database Reporting Query Failed</h2>
              <p className="text-xs text-rose-300 font-mono bg-rose-950/40 p-3 rounded-xl border border-rose-500/20 text-left overflow-x-auto whitespace-pre-wrap">
                {error}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed pt-2">
                Production reporting requires verified database data from Supabase. To protect financial and operational integrity, synthetic or mock metrics are strictly rejected when database connectivity, table evaluation, or RPC invocation fails.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={fetchReport}
                disabled={loading}
                className="bg-brand-600 hover:bg-brand-500 text-white"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                Retry Database Query
              </Button>
              <Link to="/admin/crm/leads">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300"
                >
                  Return to Leads Desk
                </Button>
              </Link>
            </div>
          </div>
        ) : loading && !report ? (
          <div className="p-20 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-brand-400" />
            <p className="text-sm">Compiling commercial intelligence report from database...</p>
          </div>
        ) : report ? (
          <>
            {/* ========================================================================= */}
            {/* SECTION 1: EXECUTIVE CRM SUMMARY STRIP (11 KPIs) */}
            {/* ========================================================================= */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Target className="w-4 h-4 text-brand-400" />
                  Executive CRM Summary ({report.dateRange.rangeLabel})
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {/* Total Leads */}
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-sm shadow-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Total Leads</span>
                  <p className="text-2xl font-bold text-white mt-1">{report.summary.totalLeads}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Inbound captures</p>
                </div>

                {/* New Leads */}
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-sm shadow-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400 block">New Leads</span>
                  <p className="text-2xl font-bold text-sky-300 mt-1">{report.summary.newLeads}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Awaiting triage</p>
                </div>

                {/* Qualified Leads */}
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-sm shadow-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 block">Qualified</span>
                  <p className="text-2xl font-bold text-indigo-300 mt-1">{report.summary.qualifiedLeads}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Fit confirmed</p>
                </div>

                {/* Converted Deals */}
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-sm shadow-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 block">Converted</span>
                  <p className="text-2xl font-bold text-emerald-300 mt-1">{report.summary.convertedLeads}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Commercial opportunities</p>
                </div>

                {/* Disqualified */}
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-sm shadow-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400 block">Disqualified</span>
                  <p className="text-2xl font-bold text-rose-300 mt-1">{report.summary.disqualifiedLeads}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Unviable prospects</p>
                </div>

                {/* Open Deals */}
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-sm shadow-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 block">Open Deals</span>
                  <p className="text-2xl font-bold text-amber-300 mt-1">{report.summary.openOpportunities}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Active in pipeline</p>
                </div>

                {/* Won Deals */}
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-sm shadow-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 block">Won Deals</span>
                  <p className="text-2xl font-bold text-emerald-300 mt-1">{report.summary.wonOpportunities}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Closed-won clients</p>
                </div>

                {/* Lost Deals */}
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-sm shadow-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Lost Deals</span>
                  <p className="text-2xl font-bold text-slate-300 mt-1">{report.summary.lostOpportunities}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Closed-lost pipeline</p>
                </div>

                {/* Managed Accounts */}
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-sm shadow-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Accounts</span>
                  <p className="text-2xl font-bold text-white mt-1">{report.summary.totalOrganizations}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Managed organizations</p>
                </div>

                {/* Contacts */}
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-sm shadow-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Contacts</span>
                  <p className="text-2xl font-bold text-white mt-1">{report.summary.totalContacts}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Stakeholder directory</p>
                </div>

                {/* Scheduled Walkthroughs */}
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5 backdrop-blur-sm shadow-sm sm:col-span-2 lg:col-span-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400 block">Scheduled Walkthroughs</span>
                  <p className="text-2xl font-bold text-sky-300 mt-1">{report.summary.scheduledWalkthroughs}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Total booked sessions</p>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SECTION 2: LEAD CONVERSION FUNNEL */}
            {/* ========================================================================= */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-brand-400" />
                    Lead Lifecycle & Conversion Funnel
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Stage-by-stage progression from inbound inquiry to commercial deal conversion.
                  </p>
                </div>

                <Link
                  to="/admin/crm/leads"
                  className="text-xs text-brand-400 hover:underline flex items-center gap-1 font-medium self-start sm:self-auto"
                >
                  Inspect Inbound Leads Desk
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Visual Funnel Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* 1. New */}
                <div className="bg-slate-950/70 border border-sky-500/30 rounded-xl p-4 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">1. New Capture</span>
                    <Badge variant="outline" className="text-[10px] border-sky-500/30 text-sky-300 bg-sky-500/10">
                      Step 1
                    </Badge>
                  </div>
                  <p className="text-3xl font-extrabold text-white mt-2">{report.leadFunnel.new}</p>
                  <p className="text-xs text-slate-400 mt-1">Pending initial outreach</p>
                </div>

                {/* 2. Contacted */}
                <div className="bg-slate-950/70 border border-blue-500/30 rounded-xl p-4 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">2. Contacted</span>
                    <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-300 bg-blue-500/10">
                      Step 2
                    </Badge>
                  </div>
                  <p className="text-3xl font-extrabold text-white mt-2">{report.leadFunnel.contacted}</p>
                  <p className="text-xs text-slate-400 mt-1">Active engagement</p>
                </div>

                {/* 3. Qualified */}
                <div className="bg-slate-950/70 border border-indigo-500/30 rounded-xl p-4 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">3. Qualified</span>
                    <Badge variant="outline" className="text-[10px] border-indigo-500/30 text-indigo-300 bg-indigo-500/10">
                      Step 3
                    </Badge>
                  </div>
                  <p className="text-3xl font-extrabold text-white mt-2">{report.leadFunnel.qualified}</p>
                  <p className="text-xs text-slate-400 mt-1">Scope & budget fit confirmed</p>
                </div>

                {/* 4. Converted */}
                <div className="bg-slate-950/70 border border-emerald-500/30 rounded-xl p-4 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">4. Converted</span>
                    <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                      Converted
                    </Badge>
                  </div>
                  <p className="text-3xl font-extrabold text-emerald-300 mt-2">{report.leadFunnel.converted}</p>
                  <p className="text-xs text-slate-400 mt-1">Promoted to sales deals</p>
                </div>
              </div>

              {/* Rates Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/50 border border-slate-800 rounded-xl p-4">
                <div>
                  <span className="text-xs text-slate-400 block">Lead Qualification Rate</span>
                  <p className="text-xl font-bold text-white mt-0.5">
                    {report.leadFunnel.qualificationRatePercent !== null
                      ? `${report.leadFunnel.qualificationRatePercent}%`
                      : "N/A (0 leads)"}
                  </p>
                  <span className="text-[10px] text-slate-500">(Qualified + Converted) / Total</span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block">Lead Conversion to Deal Rate</span>
                  <p className="text-xl font-bold text-emerald-400 mt-0.5">
                    {report.leadFunnel.conversionRatePercent !== null
                      ? `${report.leadFunnel.conversionRatePercent}%`
                      : "N/A (0 leads)"}
                  </p>
                  <span className="text-[10px] text-slate-500">Converted Deals / Total Leads</span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block">Disqualified Leads</span>
                  <p className="text-xl font-bold text-rose-400 mt-0.5">{report.leadFunnel.disqualified}</p>
                  <span className="text-[10px] text-slate-500">Documented exclusion reasons</span>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SECTION 3: OPPORTUNITY PIPELINE & COMMERCIAL VALUE */}
            {/* ========================================================================= */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Opportunity Pipeline & Commercial Valuation
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Actual commercial deal values and stage distribution across the 7 pipeline stages.
                  </p>
                </div>

                <Link
                  to="/admin/crm/pipeline"
                  className="text-xs text-brand-400 hover:underline flex items-center gap-1 font-medium self-start sm:self-auto"
                >
                  Inspect Pipeline Desk
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Valuation Integrity Notice & Strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Populated Value */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Total Populated Value</span>
                  <p className="text-2xl font-extrabold text-white mt-1">
                    {report.pipeline.totalPopulatedValueNgn !== null
                      ? `₦${report.pipeline.totalPopulatedValueNgn.toLocaleString()}`
                      : "Pending qualification"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Based on {report.pipeline.dealsWithKnownValueCount} deals with allocated value
                  </p>
                </div>

                {/* Open Pipeline Value */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-amber-400 uppercase tracking-wider block">Open Pipeline Value</span>
                  <p className="text-2xl font-extrabold text-amber-300 mt-1">
                    {report.pipeline.openPopulatedValueNgn !== null
                      ? `₦${report.pipeline.openPopulatedValueNgn.toLocaleString()}`
                      : "Pending qualification"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Active, unclosed commercial negotiations</p>
                </div>

                {/* Closed Won Value */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs text-emerald-400 uppercase tracking-wider block">Closed Won Value</span>
                  <p className="text-2xl font-extrabold text-emerald-300 mt-1">
                    {report.pipeline.wonPopulatedValueNgn !== null
                      ? `₦${report.pipeline.wonPopulatedValueNgn.toLocaleString()}`
                      : "Pending qualification"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Confirmed signed enterprise revenue</p>
                </div>
              </div>

              {/* Known Value vs Unallocated Notice */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-400 flex items-center justify-between flex-wrap gap-2">
                <span>
                  <strong>Data Integrity Rule:</strong> Unallocated deals are preserved as <em>Value pending qualification</em> rather than assumed ₦0.
                </span>
                <span className="font-mono text-[11px] text-slate-300">
                  {report.pipeline.dealsWithKnownValueCount} allocated • {report.pipeline.dealsWithoutValueCount} pending
                </span>
              </div>

              {/* 7-Stage Pipeline Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(Object.keys(STAGE_LABELS) as OpportunityStage[]).map((stageKey) => {
                  const stageData = report.pipeline.stages[stageKey] || {
                    count: 0,
                    populatedValueNgn: null,
                    knownValueCount: 0,
                    unallocatedValueCount: 0,
                  };
                  const cfg = STAGE_LABELS[stageKey];

                  return (
                    <div
                      key={stageKey}
                      className={cn(
                        "bg-slate-950/60 border rounded-xl p-3.5 space-y-2 flex flex-col justify-between",
                        cfg.border
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className={cn("text-xs font-semibold uppercase tracking-wider", cfg.color)}>
                            {cfg.label}
                          </span>
                          <Badge variant="outline" className={cn("text-[10px] py-0 px-1.5", cfg.border, cfg.bg, cfg.color)}>
                            {stageData.count} {stageData.count === 1 ? "deal" : "deals"}
                          </Badge>
                        </div>
                        <p className="text-lg font-bold text-white mt-1">
                          {stageData.populatedValueNgn !== null
                            ? `₦${stageData.populatedValueNgn.toLocaleString()}`
                            : "Pending qualification"}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {stageData.knownValueCount} valued • {stageData.unallocatedValueCount} unvalued
                        </p>
                      </div>

                      <Link
                        to={`/admin/crm/pipeline?stage=${stageKey}`}
                        className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 pt-2 border-t border-slate-800/80 transition-colors"
                      >
                        <span>Filter pipeline</span>
                        <ExternalLink className="w-3 h-3 ml-auto text-slate-500" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SECTION 4: CANONICAL PRODUCT DEMAND MATRIX */}
            {/* ========================================================================= */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-brand-400" />
                    Canonical Product Demand Matrix
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Directly mapped to canonical <code>ZAKEEM_APPLICATIONS</code> registry. Zero values indicate registered modules with no activity in this range.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Application / Solution</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-center">Lead Inquiries</th>
                      <th className="py-3 px-4 text-center">Active Deals</th>
                      <th className="py-3 px-4 text-center">Converted</th>
                      <th className="py-3 px-4 text-right">Drilldown</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {report.productDemand.map((prod) => (
                      <tr key={prod.productId} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-medium text-white">
                          <div className="flex items-center gap-2">
                            <span>{prod.productName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400">{prod.category}</td>
                        <td className="py-3 px-4 text-center font-mono">
                          <span className={cn(prod.leadCount > 0 ? "text-brand-300 font-bold" : "text-slate-500")}>
                            {prod.leadCount}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          <span className={cn(prod.opportunityCount > 0 ? "text-amber-300 font-bold" : "text-slate-500")}>
                            {prod.opportunityCount}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          <span className={cn(prod.convertedCount > 0 ? "text-emerald-300 font-bold" : "text-slate-500")}>
                            {prod.convertedCount}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/admin/crm/leads?product=${prod.slug}`}
                              className="text-[11px] text-slate-400 hover:text-brand-400 hover:underline"
                              title="Inspect leads for this product"
                            >
                              Leads
                            </Link>
                            <span className="text-slate-700">•</span>
                            <Link
                              to={`/admin/crm/pipeline?product=${prod.productId}`}
                              className="text-[11px] text-slate-400 hover:text-amber-400 hover:underline"
                              title="Inspect deals for this product"
                            >
                              Deals
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SECTION 5 & 6: SCHEDULING & ACCOUNT/CONTACT INTELLIGENCE */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Scheduling & Walkthrough Operations */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-sky-400" />
                      Demo & Walkthrough Operations
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Operational walkthrough volume and status breakdown.
                    </p>
                  </div>
                  <Link
                    to="/admin/scheduling"
                    className="text-xs text-brand-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    Scheduling Desk
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                    <span className="text-[11px] text-slate-400 uppercase block">Total</span>
                    <p className="text-2xl font-bold text-white mt-1">{report.scheduling.totalBookings}</p>
                  </div>
                  <div className="bg-slate-950/60 border border-blue-500/30 rounded-xl p-3">
                    <span className="text-[11px] text-blue-400 uppercase block">Confirmed</span>
                    <p className="text-2xl font-bold text-blue-300 mt-1">{report.scheduling.confirmed}</p>
                  </div>
                  <div className="bg-slate-950/60 border border-emerald-500/30 rounded-xl p-3">
                    <span className="text-[11px] text-emerald-400 uppercase block">Completed</span>
                    <p className="text-2xl font-bold text-emerald-300 mt-1">{report.scheduling.completed}</p>
                  </div>
                  <div className="bg-slate-950/60 border border-amber-500/30 rounded-xl p-3">
                    <span className="text-[11px] text-amber-400 uppercase block">Pending</span>
                    <p className="text-2xl font-bold text-amber-300 mt-1">{report.scheduling.pending}</p>
                  </div>
                  <div className="bg-slate-950/60 border border-rose-500/30 rounded-xl p-3">
                    <span className="text-[11px] text-rose-400 uppercase block">Cancelled</span>
                    <p className="text-2xl font-bold text-rose-300 mt-1">{report.scheduling.cancelled}</p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-700 rounded-xl p-3">
                    <span className="text-[11px] text-slate-400 uppercase block">No Show</span>
                    <p className="text-2xl font-bold text-slate-300 mt-1">{report.scheduling.noShow}</p>
                  </div>
                </div>
              </div>

              {/* Account & Contact Intelligence */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-brand-400" />
                      Account & Contact Intelligence
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Enterprise account lifecycle and stakeholder decision roles.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/admin/crm/organizations"
                      className="text-xs text-brand-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      Accounts
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Org Lifecycle Breakdown */}
                  <div>
                    <span className="font-semibold text-slate-300 block mb-2">Organizations by Lifecycle Status</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(Object.keys(ORG_STATUS_LABELS) as OrganizationStatus[]).map((st) => {
                        const count = report.accountContact.organizationsByStatus[st] || 0;
                        const cfg = ORG_STATUS_LABELS[st];
                        return (
                          <div
                            key={st}
                            className={cn(
                              "p-2.5 rounded-lg border bg-slate-950/50 flex items-center justify-between",
                              cfg.border
                            )}
                          >
                            <span className={cn("font-medium", cfg.color)}>{cfg.label}</span>
                            <span className="font-bold text-white font-mono">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stakeholder Contacts */}
                  <div className="pt-2 border-t border-slate-800">
                    <span className="font-semibold text-slate-300 block mb-2">Stakeholder Decision Roles</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-2">
                        <span className="text-[10px] text-slate-500 block">Total Stakeholders</span>
                        <span className="text-base font-bold text-white">{report.accountContact.contactsTotal}</span>
                      </div>
                      <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-2">
                        <span className="text-[10px] text-slate-500 block">Linked to Account</span>
                        <span className="text-base font-bold text-brand-300">{report.accountContact.contactsWithOrg}</span>
                      </div>
                      <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-2">
                        <span className="text-[10px] text-slate-500 block">Primary Decision Makers</span>
                        <span className="text-base font-bold text-emerald-400">{report.accountContact.primaryDecisionMakers}</span>
                      </div>
                      <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-2">
                        <span className="text-[10px] text-slate-500 block">Secondary Contacts</span>
                        <span className="text-base font-bold text-slate-300">{report.accountContact.secondaryStakeholders}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SECTION 7: INBOUND SOURCE & ATTRIBUTION */}
            {/* ========================================================================= */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-brand-400" />
                  Inbound Source & Attribution
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real captured UTM tracking parameters on inbound inquiries.
                </p>
              </div>

              {report.attribution.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 italic bg-slate-950/40 rounded-xl border border-slate-800">
                  No UTM marketing attribution tags recorded on inbound leads in this date range.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold">
                        <th className="py-2.5 px-4">Source</th>
                        <th className="py-2.5 px-4">Medium</th>
                        <th className="py-2.5 px-4">Campaign</th>
                        <th className="py-2.5 px-4 text-right">Lead Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {report.attribution.map((att, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-4 text-white font-medium">{att.source}</td>
                          <td className="py-2.5 px-4 text-slate-300">{att.medium}</td>
                          <td className="py-2.5 px-4 text-slate-400 font-mono">{att.campaign}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-brand-400 font-mono">{att.leadCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* SECTION 8: VOLUME & ENGAGEMENT TRENDS */}
            {/* ========================================================================= */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-400" />
                  Volume & Commercial Engagement Trends
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Daily creation timestamps of inbound leads, opportunities, and walkthrough sessions.
                </p>
              </div>

              {report.trends.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 italic bg-slate-950/40 rounded-xl border border-slate-800">
                  Insufficient historical activity records for trend aggregation in this date range.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold">
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4 text-center">New Leads</th>
                        <th className="py-2.5 px-4 text-center">New Opportunities</th>
                        <th className="py-2.5 px-4 text-center">Bookings Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {report.trends.map((t) => (
                        <tr key={t.date} className="hover:bg-slate-800/30 font-mono">
                          <td className="py-2.5 px-4 text-slate-300 font-sans">{t.date}</td>
                          <td className="py-2.5 px-4 text-center font-bold text-brand-400">{t.leads}</td>
                          <td className="py-2.5 px-4 text-center font-bold text-amber-400">{t.opportunities}</td>
                          <td className="py-2.5 px-4 text-center font-bold text-sky-400">{t.bookings}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}

export { AdminReportsPage };
