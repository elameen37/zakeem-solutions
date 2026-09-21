import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Sliders,
  Calendar,
  RefreshCw,
  XCircle,
  Award,
  Briefcase,
  TrendingUp,
  Mail,
  UserCheck,
  Ban,
  FileText,
  Clock,
  CircleDot,
  PhoneCall,
  Users,
  CalendarClock,
  Presentation,
  FileCheck,
  Handshake,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  User,
} from "lucide-react";
import { CRMActivity, CRMActivityType } from "@/types/crm";
import { getAdminActivities, completeCRMActivity } from "@/lib/crmService";
import { cn } from "@/lib/utils";

interface CRMActivityStreamProps {
  activities?: CRMActivity[];
  organizationId?: string;
  contactId?: string;
  leadId?: string;
  opportunityId?: string;
  refreshTrigger?: number;
  isLoading?: boolean;
  className?: string;
  emptyMessage?: string;
  onActivityCompleted?: () => void;
}

function getActivityIcon(type: CRMActivityType) {
  switch (type) {
    case "lead_created":
      return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
    case "lead_status_changed":
      return <Sliders className="w-3.5 h-3.5 text-amber-400" />;
    case "call":
      return <PhoneCall className="w-3.5 h-3.5 text-blue-400" />;
    case "meeting":
      return <Users className="w-3.5 h-3.5 text-indigo-400" />;
    case "follow_up":
      return <CalendarClock className="w-3.5 h-3.5 text-amber-400" />;
    case "demo":
      return <Presentation className="w-3.5 h-3.5 text-purple-400" />;
    case "proposal":
      return <FileCheck className="w-3.5 h-3.5 text-teal-400" />;
    case "negotiation":
      return <Handshake className="w-3.5 h-3.5 text-[#e57804]" />;
    case "owner_assigned":
      return <UserPlus className="w-3.5 h-3.5 text-cyan-400" />;
    case "demo_booked":
      return <Calendar className="w-3.5 h-3.5 text-sky-400" />;
    case "demo_rescheduled":
      return <RefreshCw className="w-3.5 h-3.5 text-purple-400" />;
    case "demo_cancelled":
      return <XCircle className="w-3.5 h-3.5 text-rose-400" />;
    case "demo_completed":
      return <Award className="w-3.5 h-3.5 text-emerald-400" />;
    case "opportunity_created":
      return <Briefcase className="w-3.5 h-3.5 text-[#e57804]" />;
    case "stage_changed":
      return <TrendingUp className="w-3.5 h-3.5 text-sky-400" />;
    case "invitation_sent":
      return <Mail className="w-3.5 h-3.5 text-amber-400" />;
    case "invitation_accepted":
      return <UserCheck className="w-3.5 h-3.5 text-emerald-400" />;
    case "invitation_revoked":
      return <Ban className="w-3.5 h-3.5 text-rose-400" />;
    case "note_added":
      return <FileText className="w-3.5 h-3.5 text-slate-300" />;
    case "email_sent":
      return <Mail className="w-3.5 h-3.5 text-sky-400" />;
    default:
      return <CircleDot className="w-3.5 h-3.5 text-slate-400" />;
  }
}

function getActivityBadgeLabel(type: CRMActivityType): string {
  switch (type) {
    case "lead_created": return "Lead Created";
    case "lead_status_changed": return "Status Transition";
    case "call": return "Call Log";
    case "meeting": return "Meeting";
    case "follow_up": return "Follow-up Task";
    case "demo": return "Product Demo";
    case "proposal": return "Proposal";
    case "negotiation": return "Negotiation";
    case "owner_assigned": return "Ownership Assigned";
    case "demo_booked": return "Demo Scheduled";
    case "demo_rescheduled": return "Demo Rescheduled";
    case "demo_cancelled": return "Demo Cancelled";
    case "demo_completed": return "Demo Completed";
    case "opportunity_created": return "Opportunity Created";
    case "stage_changed": return "Pipeline Update";
    case "invitation_sent": return "Invitation Issued";
    case "invitation_accepted": return "Account Activated";
    case "invitation_revoked": return "Invitation Revoked";
    case "note_added": return "Internal Note";
    case "email_sent": return "Email Log";
    default: return "Activity";
  }
}

export interface FormattedActivityTime {
  date: string;       // e.g. "21 Sep 2026"
  time: string;       // e.g. "14:35"
  full: string;       // e.g. "21 Sep 2026, 14:35"
  relative: string;   // e.g. "12m ago", "2h ago", "Just now"
}

/**
 * Formats an authoritative ISO timestamp with both date and time
 * using Nigeria / West Africa Time (WAT = UTC+1).
 */
export function formatActivityTimestamp(isoString?: string | null): FormattedActivityTime | null {
  if (!isoString) return null;
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;

    // Use Nigeria / West Africa Time (WAT = UTC+1)
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Lagos",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(d).reduce<Record<string, string>>((acc, p) => {
      acc[p.type] = p.value;
      return acc;
    }, {});

    const day = parts.day || "";
    const month = (parts.month || "").replace("Sept", "Sep");
    const year = parts.year || "";
    const hour = parts.hour || "00";
    const minute = parts.minute || "00";

    const date = `${day} ${month} ${year}`.trim();
    const time = `${hour}:${minute}`;
    const full = `${date}, ${time}`;

    // Compute relative time if in past
    const diff = Date.now() - d.getTime();
    let relative = "";
    if (diff >= 0) {
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) relative = "Just now";
      else if (minutes < 60) relative = `${minutes}m ago`;
      else {
        const hours = Math.floor(minutes / 60);
        if (hours < 24) relative = `${hours}h ago`;
        else {
          const days = Math.floor(hours / 24);
          if (days < 30) relative = `${days}d ago`;
        }
      }
    }

    return { date, time, full, relative };
  } catch {
    return null;
  }
}

export const CRMActivityStream: React.FC<CRMActivityStreamProps> = ({
  activities: externalActivities,
  organizationId,
  contactId,
  leadId,
  opportunityId,
  refreshTrigger = 0,
  isLoading = false,
  className,
  emptyMessage = "No activities recorded yet for this entity.",
  onActivityCompleted,
}) => {
  const [internalActivities, setInternalActivities] = useState<CRMActivity[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  useEffect(() => {
    if (externalActivities !== undefined) return;
    if (!organizationId && !contactId && !leadId && !opportunityId) return;

    let isMounted = true;
    setInternalLoading(true);
    getAdminActivities({
      organizationId,
      contactId,
      leadId,
      opportunityId,
      limit: 50,
    })
      .then((res) => {
        if (isMounted && res.success) {
          setInternalActivities(res.activities);
        }
      })
      .finally(() => {
        if (isMounted) setInternalLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [externalActivities, organizationId, contactId, leadId, opportunityId, refreshTrigger]);

  const handleComplete = async (actId: string) => {
    setCompletingId(actId);
    try {
      const res = await completeCRMActivity(actId);
      if (res.success) {
        setInternalActivities((prev) =>
          prev.map((a) =>
            a.id === actId
              ? { ...a, status: "completed", completedAt: new Date().toISOString() }
              : a
          )
        );
        onActivityCompleted?.();
      }
    } finally {
      setCompletingId(null);
    }
  };

  const activeActivities = externalActivities !== undefined ? externalActivities : internalActivities;
  const activeLoading = isLoading || (externalActivities === undefined && internalLoading);

  if (activeLoading) {
    return (
      <div className="py-8 text-center space-y-2">
        <div className="w-6 h-6 rounded-full border-2 border-[#e57804]/20 border-t-[#e57804] animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Loading activity timeline...</p>
      </div>
    );
  }

  if (activeActivities.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-[#06152b] border border-white/5 text-center text-xs text-slate-400 italic">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
        {activeActivities.map((act, index) => {
          const isNewest = index === 0;
          const isPending = act.status === "pending";
          const isOverdue =
            isPending &&
            act.dueDate &&
            new Date(act.dueDate).getTime() < Date.now();
          const formattedCreated = formatActivityTimestamp(act.createdAt);

          return (
            <div key={act.id} className="relative group">
              {/* Timeline Marker Dot */}
              <div
                className={cn(
                  "absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border transition-all",
                  isPending
                    ? isOverdue
                      ? "bg-rose-950/80 border-rose-500 ring-2 ring-rose-500/30"
                      : "bg-amber-950/80 border-amber-500 ring-2 ring-amber-500/30"
                    : isNewest
                    ? "bg-[#081c38] border-[#e57804] ring-2 ring-[#e57804]/30"
                    : "bg-[#06152b] border-white/20"
                )}
              >
                {getActivityIcon(act.activityType)}
              </div>

              {/* Activity Card */}
              <div
                data-surface="dark"
                className={cn(
                  "p-3.5 rounded-xl border text-xs transition-colors",
                  isPending
                    ? isOverdue
                      ? "bg-[#18090d] border-rose-500/30 hover:border-rose-500/50"
                      : "bg-[#161208] border-amber-500/30 hover:border-amber-500/50"
                    : isNewest
                    ? "bg-[#081c38] border-white/15 hover:border-[#e57804]/40"
                    : "bg-[#06152b]/80 border-white/5 hover:border-white/10"
                )}
              >
                <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">{act.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-white/5 border border-white/10 text-slate-300">
                      {getActivityBadgeLabel(act.activityType)}
                    </span>
                    {isPending && (
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[9px] font-mono uppercase border",
                          isOverdue
                            ? "bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse"
                            : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        )}
                      >
                        {isOverdue ? "Overdue" : "Pending"}
                      </span>
                    )}
                    {!isPending && act.status === "completed" && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Done
                      </span>
                    )}
                    {isNewest && !isPending && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Latest
                      </span>
                    )}
                  </div>

                  {/* Authoritative Persisted Activity Timestamp */}
                  {formattedCreated ? (
                    <div className="text-right shrink-0 flex flex-col items-end">
                      <span
                        className="text-[11px] font-mono text-slate-300 font-medium flex items-center gap-1"
                        title={`${formattedCreated.full} (WAT / UTC+1)`}
                      >
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{formattedCreated.full}</span>
                      </span>
                      {formattedCreated.relative && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {formattedCreated.relative}
                        </span>
                      )}
                    </div>
                  ) : act.createdAt ? (
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      {act.createdAt}
                    </span>
                  ) : null}
                </div>

                {act.description && (
                  <p className="text-slate-300 text-xs mt-1 leading-relaxed whitespace-pre-wrap">
                    {act.description}
                  </p>
                )}

                {/* Completed Timestamp if completed */}
                {!isPending && act.status === "completed" && act.completedAt && (
                  <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Completed: {formatActivityTimestamp(act.completedAt)?.full || act.completedAt}</span>
                  </div>
                )}

                {/* Due Date & Assignee */}
                {(act.dueDate || act.assignee?.fullName) && (
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-3 flex-wrap">
                    {act.dueDate && (
                      <div className="flex items-center gap-1.5 text-[11px] font-mono">
                        <CalendarClock
                          className={cn(
                            "w-3.5 h-3.5",
                            isOverdue ? "text-rose-400" : "text-slate-400"
                          )}
                        />
                        <span
                          className={cn(
                            isOverdue ? "text-rose-400 font-semibold" : "text-slate-300"
                          )}
                        >
                          Due: {formatActivityTimestamp(act.dueDate)?.full || act.dueDate}
                        </span>
                      </div>
                    )}
                    {act.assignee?.fullName && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        <User className="w-3 h-3 text-cyan-400" />
                        <span>
                          Assigned: <strong className="text-white">{act.assignee.fullName}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Mark Complete Action if pending */}
                {isPending && (
                  <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "text-[10px] font-mono flex items-center gap-1",
                        isOverdue ? "text-rose-400" : "text-amber-400"
                      )}
                    >
                      <AlertCircle className="w-3 h-3" />
                      {isOverdue ? "Action overdue" : "Action required"}
                    </span>
                    <button
                      type="button"
                      disabled={completingId === act.id}
                      onClick={() => handleComplete(act.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all disabled:opacity-50 active:scale-95"
                    >
                      {completingId === act.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      Mark Complete
                    </button>
                  </div>
                )}

                {/* Metadata Chips if present */}
                {act.metadata && Object.keys(act.metadata).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-2 flex-wrap">
                    {Object.entries(act.metadata).map(([key, val]) => {
                      if (val === null || val === undefined || typeof val === "object") return null;
                      return (
                        <span
                          key={key}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#06152b] border border-white/5 text-slate-400"
                        >
                          <span className="text-slate-500">{key}:</span> {String(val)}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
