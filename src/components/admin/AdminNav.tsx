import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Users,
  Calendar,
  Briefcase,
  Building2,
  Contact,
  BarChart3,
  ExternalLink,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminNavProps {
  currentTab?: "operations" | "leads" | "opportunities" | "organizations" | "contacts" | "scheduling" | "reports";
  activeDesk?: "operations" | "workspace" | "leads" | "opportunities" | "organizations" | "contacts" | "scheduling" | "pipeline" | "accounts" | "reports";
}

export const AdminNav: React.FC<AdminNavProps> = ({ currentTab, activeDesk }) => {
  const location = useLocation();
  const path = location.pathname;

  const active = activeDesk || currentTab;
  const isOperations = active === "operations" || active === "workspace" || path === "/admin/crm/operations" || path.startsWith("/admin/crm/operations");
  const isLeads = active === "leads" || path.startsWith("/admin/crm/leads");
  const isScheduling = active === "scheduling" || path.startsWith("/admin/scheduling");
  const isPipeline = active === "opportunities" || active === "pipeline" || path.startsWith("/admin/crm/pipeline");
  const isOrgs = active === "organizations" || active === "accounts" || path.startsWith("/admin/crm/organizations");
  const isContacts = active === "contacts" || path.startsWith("/admin/crm/contacts");
  const isReports = active === "reports" || path.startsWith("/admin/crm/reports");

  return (
    <nav aria-label="Admin Suite Navigation" className="border border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-[#06152b]/60 backdrop-blur-md rounded-2xl p-2 mb-6 shadow-xs dark:shadow-none">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Core CRM & Operations Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {/* Operations Commercial Workspace */}
          <Link
            to="/admin/crm/operations"
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 whitespace-nowrap",
              isOperations
                ? "bg-[#e57804] text-white shadow-lg shadow-[#e57804]/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
            )}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Operations Desk</span>
          </Link>

          {/* Leads Desk */}
          <Link
            to="/admin/crm/leads"
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 whitespace-nowrap",
              isLeads
                ? "bg-[#e57804] text-white shadow-lg shadow-[#e57804]/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
            )}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Inbound Leads</span>
          </Link>

          {/* Deals Pipeline */}
          <Link
            to="/admin/crm/pipeline"
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 whitespace-nowrap",
              isPipeline
                ? "bg-[#e57804] text-white shadow-lg shadow-[#e57804]/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
            )}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Pipeline</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </Link>

          {/* Accounts / Organizations */}
          <Link
            to="/admin/crm/organizations"
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 whitespace-nowrap",
              isOrgs
                ? "bg-[#e57804] text-white shadow-lg shadow-[#e57804]/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
            )}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Accounts</span>
          </Link>

          {/* Contacts */}
          <Link
            to="/admin/crm/contacts"
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 whitespace-nowrap",
              isContacts
                ? "bg-[#e57804] text-white shadow-lg shadow-[#e57804]/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
            )}
          >
            <Contact className="w-3.5 h-3.5" />
            <span>Contacts</span>
          </Link>

          {/* Scheduling Desk */}
          <Link
            to="/admin/scheduling"
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 whitespace-nowrap",
              isScheduling
                ? "bg-[#e57804] text-white shadow-lg shadow-[#e57804]/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
            )}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Scheduling</span>
          </Link>

          {/* Commercial Intelligence & Reports */}
          <Link
            to="/admin/crm/reports"
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 whitespace-nowrap",
              isReports
                ? "bg-[#e57804] text-white shadow-lg shadow-[#e57804]/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
            )}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Reports</span>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/request-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono text-slate-600 hover:text-[#e57804] dark:text-slate-400 dark:hover:text-[#e57804] flex items-center gap-1 transition-colors px-2 py-1"
          >
            <span>Live Form</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </nav>
  );
};
