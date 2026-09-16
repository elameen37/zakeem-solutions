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
} from "lucide-react";
import { CRMActivity, CRMActivityType } from "@/types/crm";
import { getAdminActivities } from "@/lib/crmService";
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
}

function getActivityIcon(type: CRMActivityType) {
  switch (type) {
    case "lead_created":
      return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
    case "lead_status_changed":
      return <Sliders className="w-3.5 h-3.5 text-amber-400" />;
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

function formatRelativeTime(isoString: string): string {
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(isoString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoString;
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
}) => {
  const [internalActivities, setInternalActivities] = useState<CRMActivity[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);

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
          return (
            <div key={act.id} className="relative group">
              {/* Timeline Marker Dot */}
              <div
                className={cn(
                  "absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border transition-all",
                  isNewest
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
                  isNewest
                    ? "bg-[#081c38] border-white/15 hover:border-[#e57804]/40"
                    : "bg-[#06152b]/80 border-white/5 hover:border-white/10"
                )}
              >
                <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{act.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-white/5 border border-white/10 text-slate-300">
                      {getActivityBadgeLabel(act.activityType)}
                    </span>
                    {isNewest && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Latest
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(act.createdAt)}
                  </span>
                </div>

                {act.description && (
                  <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                    {act.description}
                  </p>
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
