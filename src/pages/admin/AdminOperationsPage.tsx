import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Briefcase,
  Users,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building2,
  PhoneCall,
  Video,
  Presentation,
  FileCheck,
  Handshake,
  UserPlus,
  CircleDot,
  Send,
  CalendarClock,
  UserCheck,
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AdminNav } from "@/components/admin/AdminNav";
import { CRMOwnerSelect } from "@/components/admin/CRMOwnerSelect";
import { CRMActivityModal } from "@/components/admin/CRMActivityModal";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import {
  FollowUpIntelligence,
  FollowUpItem,
  StaleOpportunityItem,
  UnassignedLeadItem,
  UnassignedOpportunityItem,
  CRMActivityType,
} from "@/types/crm";
import {
  getFollowUpIntelligence,
  assignLeadOwner,
  assignOpportunityOwner,
  completeCRMActivity,
} from "@/lib/crmService";
import { isSupabaseConfigured } from "@/lib/supabase";

type ActiveQueueTab = "overdue" | "today" | "upcoming" | "stale" | "unassigned";

function getActivityIcon(type: CRMActivityType) {
  switch (type) {
    case "call":
      return <PhoneCall className="w-3.5 h-3.5 text-blue-400" />;
    case "meeting":
      return <Video className="w-3.5 h-3.5 text-indigo-400" />;
    case "demo":
    case "demo_booked":
      return <Presentation className="w-3.5 h-3.5 text-purple-400" />;
    case "proposal":
      return <FileCheck className="w-3.5 h-3.5 text-teal-400" />;
    case "negotiation":
      return <Handshake className="w-3.5 h-3.5 text-[#e57804]" />;
    case "owner_assigned":
      return <UserPlus className="w-3.5 h-3.5 text-cyan-400" />;
    case "follow_up":
    default:
      return <CalendarClock className="w-3.5 h-3.5 text-amber-400" />;
  }
}

export const AdminOperationsPage: React.FC = () => {
  const [data, setData] = useState<FollowUpIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveQueueTab>("overdue");
  const [completingId, setCompletingId] = useState<string | null>(null);

  // Modal State for scheduling follow-up
  const [selectedEntityForActivity, setSelectedEntityForActivity] = useState<{
    leadId?: string | null;
    opportunityId?: string | null;
    organizationId?: string | null;
    contactId?: string | null;
    entityName?: string;
  } | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getFollowUpIntelligence();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error || "Failed to load commercial operations intelligence.");
      }
    } catch {
      setError("An unexpected error occurred loading operations intelligence.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCompleteActivity = async (id: string) => {
    setCompletingId(id);
    try {
      const res = await completeCRMActivity(id);
      if (res.success) {
        setSuccessMessage("Task marked completed.");
        setTimeout(() => setSuccessMessage(null), 3500);
        await loadData();
      } else {
        setError(res.error || "Failed to mark task completed.");
      }
    } catch {
      setError("Error completing activity.");
    } finally {
      setCompletingId(null);
    }
  };

  const handleAssignLead = async (leadId: string, newOwnerId: string | null) => {
    try {
      const res = await assignLeadOwner(leadId, newOwnerId);
      if (res.success) {
        setSuccessMessage("Lead ownership updated.");
        setTimeout(() => setSuccessMessage(null), 3000);
        await loadData();
      } else {
        setError(res.error || "Failed to assign lead owner.");
      }
    } catch {
      setError("Error updating lead owner.");
    }
  };

  const handleAssignOpportunity = async (oppId: string, newOwnerId: string | null) => {
    try {
      const res = await assignOpportunityOwner(oppId, newOwnerId);
      if (res.success) {
        setSuccessMessage("Deal ownership updated.");
        setTimeout(() => setSuccessMessage(null), 3000);
        await loadData();
      } else {
        setError(res.error || "Failed to assign deal owner.");
      }
    } catch {
      setError("Error updating deal owner.");
    }
  };

  const counts = data?.counts || {
    overdueFollowUps: 0,
    todayFollowUps: 0,
    upcomingFollowUps: 0,
    staleOpportunities: 0,
    unassignedLeads: 0,
    unassignedOpportunities: 0,
  };

  const totalUnassigned = counts.unassignedLeads + counts.unassignedOpportunities;

  return (
    <>
      <SEO
        title="Commercial Operations Desk | Zakeem Solutions Admin"
        description="Enterprise sales management, follow-up intelligence queues, and deal ownership control."
        noindex={true}
      />

      <section className="pt-12 pb-24 border-b border-white/10 min-h-screen">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl space-y-8">
          {/* Admin Navigation */}
          <AdminNav currentTab="operations" />

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                <Badge variant="neon">Operations Command</Badge>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Real-Time Follow-up Intelligence
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
                Commercial Operations & Action Queues
              </h1>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                Daily triage inbox for overdue follow-ups, today&apos;s commercial tasks, stale opportunity risk mitigation, and unassigned records.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                disabled={isLoading}
                leftIcon={<RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />}
                className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
              >
                Refresh Queue
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

          {/* Metric Summary Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* Overdue */}
            <button
              type="button"
              onClick={() => setActiveTab("overdue")}
              data-surface="dark"
              className={cn(
                "p-4 rounded-2xl border text-left transition-all",
                counts.overdueFollowUps > 0
                  ? "bg-rose-950/40 border-rose-500/40 hover:border-rose-500"
                  : "bg-[#081c38] border-white/10"
              )}
            >
              <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block mb-1">
                Overdue Actions
              </span>
              <div className="text-2xl font-bold text-rose-400">
                {counts.overdueFollowUps}
              </div>
            </button>

            {/* Today */}
            <button
              type="button"
              onClick={() => setActiveTab("today")}
              data-surface="dark"
              className={cn(
                "p-4 rounded-2xl border text-left transition-all",
                activeTab === "today" ? "ring-2 ring-amber-500" : "",
                "bg-[#081c38] border-amber-500/30 hover:border-amber-500"
              )}
            >
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-1">
                Due Today
              </span>
              <div className="text-2xl font-bold text-amber-300">
                {counts.todayFollowUps}
              </div>
            </button>

            {/* Upcoming */}
            <button
              type="button"
              onClick={() => setActiveTab("upcoming")}
              data-surface="dark"
              className={cn(
                "p-4 rounded-2xl border text-left transition-all",
                activeTab === "upcoming" ? "ring-2 ring-sky-500" : "",
                "bg-[#081c38] border-sky-500/20 hover:border-sky-500/50"
              )}
            >
              <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block mb-1">
                Upcoming (7d)
              </span>
              <div className="text-2xl font-bold text-sky-300">
                {counts.upcomingFollowUps}
              </div>
            </button>

            {/* Stale Deals */}
            <button
              type="button"
              onClick={() => setActiveTab("stale")}
              data-surface="dark"
              className={cn(
                "p-4 rounded-2xl border text-left transition-all",
                counts.staleOpportunities > 0
                  ? "bg-amber-950/30 border-amber-500/40 hover:border-amber-500"
                  : "bg-[#081c38] border-white/10"
              )}
            >
              <span className="text-[10px] font-mono text-[#e57804] uppercase tracking-wider block mb-1">
                Stale Deals (&gt;14d)
              </span>
              <div className="text-2xl font-bold text-[#e57804]">
                {counts.staleOpportunities}
              </div>
            </button>

            {/* Unassigned Leads */}
            <button
              type="button"
              onClick={() => setActiveTab("unassigned")}
              data-surface="dark"
              className={cn(
                "p-4 rounded-2xl border text-left transition-all",
                activeTab === "unassigned" ? "ring-2 ring-purple-500" : "",
                "bg-[#081c38] border-purple-500/20 hover:border-purple-500/50"
              )}
            >
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block mb-1">
                Unassigned Leads
              </span>
              <div className="text-2xl font-bold text-purple-300">
                {counts.unassignedLeads}
              </div>
            </button>

            {/* Unassigned Deals */}
            <button
              type="button"
              onClick={() => setActiveTab("unassigned")}
              data-surface="dark"
              className={cn(
                "p-4 rounded-2xl border text-left transition-all",
                activeTab === "unassigned" ? "ring-2 ring-cyan-500" : "",
                "bg-[#081c38] border-cyan-500/20 hover:border-cyan-500/50"
              )}
            >
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
                Unassigned Deals
              </span>
              <div className="text-2xl font-bold text-cyan-300">
                {counts.unassignedOpportunities}
              </div>
            </button>
          </div>

          {/* Action Inbox Section */}
          <div data-surface="dark" className="rounded-2xl bg-[#081c38] border border-white/10 overflow-hidden space-y-4 p-5">
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto border-b border-white/10 pb-3 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab("overdue")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 shrink-0",
                  activeTab === "overdue"
                    ? "bg-rose-500 text-white shadow font-bold"
                    : "bg-[#06152b] text-rose-400 hover:text-white border border-rose-500/30"
                )}
              >
                <span>Overdue Follow-Ups</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-bold">
                  {counts.overdueFollowUps}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("today")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 shrink-0",
                  activeTab === "today"
                    ? "bg-[#e57804] text-white shadow font-bold"
                    : "bg-[#06152b] text-slate-300 hover:text-white border border-white/10"
                )}
              >
                <span>Today&apos;s Follow-Ups</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-bold">
                  {counts.todayFollowUps}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("upcoming")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 shrink-0",
                  activeTab === "upcoming"
                    ? "bg-sky-600 text-white shadow font-bold"
                    : "bg-[#06152b] text-slate-300 hover:text-white border border-white/10"
                )}
              >
                <span>Upcoming (Next 7 Days)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-bold">
                  {counts.upcomingFollowUps}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("stale")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 shrink-0",
                  activeTab === "stale"
                    ? "bg-amber-600 text-white shadow font-bold"
                    : "bg-[#06152b] text-slate-300 hover:text-white border border-white/10"
                )}
              >
                <span>Stale Deals (&gt;14d)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-bold">
                  {counts.staleOpportunities}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("unassigned")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 shrink-0",
                  activeTab === "unassigned"
                    ? "bg-purple-600 text-white shadow font-bold"
                    : "bg-[#06152b] text-slate-300 hover:text-white border border-white/10"
                )}
              >
                <span>Unassigned Records</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-bold">
                  {totalUnassigned}
                </span>
              </button>
            </div>

            {/* Tab Contents */}
            {isLoading ? (
              <div className="py-6 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <div className="w-4 h-4 rounded-full border-2 border-[#e57804]/20 border-t-[#e57804] animate-spin" />
                  <span>Loading operational intelligence queue...</span>
                </div>
                <CardSkeleton count={4} />
              </div>
            ) : (
              <>
                {/* 1. OVERDUE TAB */}
                {activeTab === "overdue" && (
                  <div className="space-y-3">
                    {data?.overdueFollowUps.length === 0 ? (
                      <div className="py-14 text-center space-y-2 text-slate-400 text-xs">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                        <p className="font-medium text-white">Zero Overdue Actions</p>
                        <p>All scheduled commercial follow-ups are up-to-date.</p>
                      </div>
                    ) : (
                      data?.overdueFollowUps.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl bg-[#150a0e] border border-rose-500/30 flex items-center justify-between gap-4 flex-wrap"
                        >
                          <div className="space-y-1 min-w-[240px]">
                            <div className="flex items-center gap-2">
                              {getActivityIcon(item.activityType)}
                              <span className="font-semibold text-white text-xs">{item.title}</span>
                              <span className="px-2 py-0.2 rounded text-[9px] font-mono uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                Overdue
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2">
                              {item.organizationName && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-slate-500" />
                                  {item.organizationName}
                                </span>
                              )}
                              {item.contactName && <span>• {item.contactName}</span>}
                              {item.dueDate && (
                                <span className="font-mono text-rose-400 font-medium">
                                  • Due: {new Date(item.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                </span>
                              )}
                              {item.assigneeName && <span>• Assigned: {item.assigneeName}</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {item.leadId && (
                              <Link to={`/admin/crm/leads?leadId=${item.leadId}`}>
                                <Button variant="outline" size="sm" className="border-white/10 text-slate-300 py-1 px-2.5 text-xs h-auto">
                                  Lead Desk
                                </Button>
                              </Link>
                            )}
                            {item.opportunityId && (
                              <Link to={`/admin/crm/pipeline?oppId=${item.opportunityId}`}>
                                <Button variant="outline" size="sm" className="border-white/10 text-slate-300 py-1 px-2.5 text-xs h-auto">
                                  Deal Desk
                                </Button>
                              </Link>
                            )}
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={completingId === item.id}
                              onClick={() => handleCompleteActivity(item.id)}
                              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white py-1 px-3 text-xs h-auto"
                            >
                              {completingId === item.id ? "Completing..." : "Mark Complete"}
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 2. TODAY TAB */}
                {activeTab === "today" && (
                  <div className="space-y-3">
                    {data?.todayFollowUps.length === 0 ? (
                      <div className="py-14 text-center space-y-2 text-slate-400 text-xs">
                        <Calendar className="w-8 h-8 text-amber-400 mx-auto" />
                        <p className="font-medium text-white">No Tasks Scheduled for Today</p>
                        <p>Check upcoming follow-ups or schedule new commercial actions from the pipeline desk.</p>
                      </div>
                    ) : (
                      data?.todayFollowUps.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl bg-[#141007] border border-amber-500/30 flex items-center justify-between gap-4 flex-wrap"
                        >
                          <div className="space-y-1 min-w-[240px]">
                            <div className="flex items-center gap-2">
                              {getActivityIcon(item.activityType)}
                              <span className="font-semibold text-white text-xs">{item.title}</span>
                              <span className="px-2 py-0.2 rounded text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                Due Today
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2">
                              {item.organizationName && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-slate-500" />
                                  {item.organizationName}
                                </span>
                              )}
                              {item.contactName && <span>• {item.contactName}</span>}
                              {item.assigneeName && <span>• Assigned: {item.assigneeName}</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {item.leadId && (
                              <Link to={`/admin/crm/leads?leadId=${item.leadId}`}>
                                <Button variant="outline" size="sm" className="border-white/10 text-slate-300 py-1 px-2.5 text-xs h-auto">
                                  Lead Desk
                                </Button>
                              </Link>
                            )}
                            {item.opportunityId && (
                              <Link to={`/admin/crm/pipeline?oppId=${item.opportunityId}`}>
                                <Button variant="outline" size="sm" className="border-white/10 text-slate-300 py-1 px-2.5 text-xs h-auto">
                                  Deal Desk
                                </Button>
                              </Link>
                            )}
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={completingId === item.id}
                              onClick={() => handleCompleteActivity(item.id)}
                              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white py-1 px-3 text-xs h-auto"
                            >
                              {completingId === item.id ? "Completing..." : "Mark Complete"}
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 3. UPCOMING TAB */}
                {activeTab === "upcoming" && (
                  <div className="space-y-3">
                    {data?.upcomingFollowUps.length === 0 ? (
                      <div className="py-14 text-center space-y-2 text-slate-400 text-xs">
                        <CalendarClock className="w-8 h-8 text-sky-400 mx-auto" />
                        <p className="font-medium text-white">No Upcoming Follow-Ups in the Next 7 Days</p>
                        <p>Schedule proactive touchpoints with active prospects.</p>
                      </div>
                    ) : (
                      data?.upcomingFollowUps.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl bg-[#06152b] border border-white/10 flex items-center justify-between gap-4 flex-wrap hover:border-sky-500/40 transition-colors"
                        >
                          <div className="space-y-1 min-w-[240px]">
                            <div className="flex items-center gap-2">
                              {getActivityIcon(item.activityType)}
                              <span className="font-semibold text-white text-xs">{item.title}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2">
                              {item.organizationName && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-slate-500" />
                                  {item.organizationName}
                                </span>
                              )}
                              {item.dueDate && (
                                <span className="font-mono text-sky-300">
                                  • Due: {new Date(item.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", weekday: "short" })}
                                </span>
                              )}
                              {item.assigneeName && <span>• Assigned: {item.assigneeName}</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {item.leadId && (
                              <Link to={`/admin/crm/leads?leadId=${item.leadId}`}>
                                <Button variant="outline" size="sm" className="border-white/10 text-slate-300 py-1 px-2.5 text-xs h-auto">
                                  Lead Desk
                                </Button>
                              </Link>
                            )}
                            {item.opportunityId && (
                              <Link to={`/admin/crm/pipeline?oppId=${item.opportunityId}`}>
                                <Button variant="outline" size="sm" className="border-white/10 text-slate-300 py-1 px-2.5 text-xs h-auto">
                                  Deal Desk
                                </Button>
                              </Link>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={completingId === item.id}
                              onClick={() => handleCompleteActivity(item.id)}
                              leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                              className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 py-1 px-3 text-xs h-auto"
                            >
                              Complete Early
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 4. STALE DEALS TAB */}
                {activeTab === "stale" && (
                  <div className="space-y-3">
                    {data?.staleOpportunities.length === 0 ? (
                      <div className="py-14 text-center space-y-2 text-slate-400 text-xs">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                        <p className="font-medium text-white">Healthy Pipeline Velocity</p>
                        <p>Zero opportunities have been inactive for more than 14 days.</p>
                      </div>
                    ) : (
                      data?.staleOpportunities.map((opp) => (
                        <div
                          key={opp.id}
                          className="p-4 rounded-xl bg-[#140e06] border border-amber-500/30 flex items-center justify-between gap-4 flex-wrap hover:border-amber-500/60 transition-colors"
                        >
                          <div className="space-y-1 min-w-[240px]">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white text-xs">{opp.title}</span>
                              <span className="px-2 py-0.2 rounded text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                {opp.stage.replace(/_/g, " ")}
                              </span>
                              <span className="px-2 py-0.2 rounded text-[9px] font-mono uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                                {opp.daysInactive}d inactive
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2">
                              {opp.organizationName && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-slate-500" />
                                  {opp.organizationName}
                                </span>
                              )}
                              {opp.dealValueNgn && (
                                <span className="font-mono text-emerald-300">
                                  • ₦{opp.dealValueNgn.toLocaleString()}
                                </span>
                              )}
                              <span>• Owner: {opp.ownerName || "Unassigned"}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setSelectedEntityForActivity({
                                  opportunityId: opp.id,
                                  entityName: opp.title,
                                })
                              }
                              leftIcon={<CalendarClock className="w-3.5 h-3.5 text-[#e57804]" />}
                              className="border-[#e57804]/40 text-[#e57804] hover:bg-[#e57804]/10 py-1 px-3 text-xs h-auto"
                            >
                              Schedule Action
                            </Button>
                            <Link to={`/admin/crm/pipeline?oppId=${opp.id}`}>
                              <Button variant="primary" size="sm" className="bg-[#e57804] hover:bg-[#cc6a03] text-white py-1 px-3 text-xs h-auto">
                                Inspect Deal
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 5. UNASSIGNED RECORDS TAB */}
                {activeTab === "unassigned" && (
                  <div className="space-y-6">
                    {/* Unassigned Leads */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-mono uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        Unassigned Inbound Leads ({counts.unassignedLeads})
                      </h3>
                      {data?.unassignedLeads.length === 0 ? (
                        <p className="text-xs text-slate-400 italic p-4 rounded-xl bg-[#06152b] border border-white/5">
                          All leads have assigned admin owners.
                        </p>
                      ) : (
                        data?.unassignedLeads.map((lead) => (
                          <div
                            key={lead.id}
                            className="p-3.5 rounded-xl bg-[#06152b] border border-purple-500/20 flex items-center justify-between gap-4 flex-wrap"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-semibold text-white">{lead.referenceId}</span>
                                <span className="px-2 py-0.2 rounded text-[9px] font-mono uppercase bg-white/5 text-slate-300">
                                  {lead.status}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                                {lead.organizationName && <span>{lead.organizationName}</span>}
                                {lead.contactName && <span>• {lead.contactName}</span>}
                                {lead.productInterest && <span>• Interest: {lead.productInterest}</span>}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <CRMOwnerSelect
                                currentOwnerId={null}
                                onSelectOwner={(newOwner) => handleAssignLead(lead.id, newOwner)}
                              />
                              <Link to={`/admin/crm/leads?leadId=${lead.id}`}>
                                <Button variant="outline" size="sm" className="border-white/10 text-slate-300 py-1 px-2.5 text-xs h-auto">
                                  Inspect
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Unassigned Opportunities */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        Unassigned Sales Deals ({counts.unassignedOpportunities})
                      </h3>
                      {data?.unassignedOpportunities.length === 0 ? (
                        <p className="text-xs text-slate-400 italic p-4 rounded-xl bg-[#06152b] border border-white/5">
                          All deals have assigned admin owners.
                        </p>
                      ) : (
                        data?.unassignedOpportunities.map((opp) => (
                          <div
                            key={opp.id}
                            className="p-3.5 rounded-xl bg-[#06152b] border border-cyan-500/20 flex items-center justify-between gap-4 flex-wrap"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-white">{opp.title}</span>
                                <span className="px-2 py-0.2 rounded text-[9px] font-mono uppercase bg-white/5 text-slate-300">
                                  {opp.stage.replace(/_/g, " ")}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                                {opp.organizationName && <span>{opp.organizationName}</span>}
                                {opp.dealValueNgn && <span>• ₦{opp.dealValueNgn.toLocaleString()}</span>}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <CRMOwnerSelect
                                currentOwnerId={null}
                                onSelectOwner={(newOwner) => handleAssignOpportunity(opp.id, newOwner)}
                              />
                              <Link to={`/admin/crm/pipeline?oppId=${opp.id}`}>
                                <Button variant="outline" size="sm" className="border-white/10 text-slate-300 py-1 px-2.5 text-xs h-auto">
                                  Inspect
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Schedule Activity / Follow-Up Modal */}
      {selectedEntityForActivity && (
        <CRMActivityModal
          isOpen={Boolean(selectedEntityForActivity)}
          onClose={() => setSelectedEntityForActivity(null)}
          onSuccess={() => {
            setSelectedEntityForActivity(null);
            setSuccessMessage("Follow-up action scheduled successfully.");
            setTimeout(() => setSuccessMessage(null), 3500);
            loadData();
          }}
          leadId={selectedEntityForActivity.leadId}
          opportunityId={selectedEntityForActivity.opportunityId}
          organizationId={selectedEntityForActivity.organizationId}
          contactId={selectedEntityForActivity.contactId}
          entityName={selectedEntityForActivity.entityName}
        />
      )}
    </>
  );
};

export default AdminOperationsPage;
