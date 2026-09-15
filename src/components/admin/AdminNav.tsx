import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Users,
  Calendar,
  Briefcase,
  Building2,
  Contact,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminNavProps {
  currentTab?: "leads" | "opportunities" | "organizations" | "contacts" | "scheduling";
}

export const AdminNav: React.FC<AdminNavProps> = ({ currentTab }) => {
  const location = useLocation();
  const path = location.pathname;

  const isLeads = currentTab === "leads" || path.startsWith("/admin/crm/leads");
  const isScheduling = currentTab === "scheduling" || path.startsWith("/admin/scheduling");

  return (
    <nav aria-label="Admin Suite Navigation" className="border-b border-white/10 bg-[#06152b]/60 backdrop-blur-md rounded-2xl p-2 mb-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Core CRM & Operations Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {/* Active: Leads Desk */}
          <Link
            to="/admin/crm/leads"
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 whitespace-nowrap",
              isLeads
                ? "bg-[#e57804] text-white shadow-lg shadow-[#e57804]/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Inbound Leads</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </Link>

          {/* Active: Scheduling Desk */}
          <Link
            to="/admin/scheduling"
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 whitespace-nowrap",
              isScheduling
                ? "bg-[#e57804] text-white shadow-lg shadow-[#e57804]/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Scheduling & Walkthroughs</span>
          </Link>

          {/* Future: Deals Pipeline (Phase 26D) */}
          <div
            className="px-3 py-2 rounded-xl text-xs font-mono text-slate-500 flex items-center gap-2 whitespace-nowrap cursor-not-allowed select-none opacity-60"
            title="Commercial Opportunity Pipeline — Scheduled for Phase 26D"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Pipeline</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-400 font-mono">
              Phase 26D
            </span>
          </div>

          {/* Future: Organizations (Phase 26D) */}
          <div
            className="px-3 py-2 rounded-xl text-xs font-mono text-slate-500 flex items-center gap-2 whitespace-nowrap cursor-not-allowed select-none opacity-60"
            title="B2B Organizations Directory — Scheduled for Phase 26D"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Accounts</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-400 font-mono">
              Phase 26D
            </span>
          </div>

          {/* Future: Contacts (Phase 26D) */}
          <div
            className="px-3 py-2 rounded-xl text-xs font-mono text-slate-500 flex items-center gap-2 whitespace-nowrap cursor-not-allowed select-none opacity-60"
            title="Decision-Maker Contacts — Scheduled for Phase 26D"
          >
            <Contact className="w-3.5 h-3.5" />
            <span>Contacts</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-400 font-mono">
              Phase 26D
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/request-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono text-slate-400 hover:text-[#e57804] flex items-center gap-1 transition-colors px-2 py-1"
          >
            <span>Live Form</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </nav>
  );
};
