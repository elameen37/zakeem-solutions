import React, { useRef, useState, useEffect, useCallback } from "react";
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
  Settings,
  UserPlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminNavProps {
  currentTab?: "operations" | "leads" | "opportunities" | "organizations" | "contacts" | "scheduling" | "invitations" | "reports" | "settings";
  activeDesk?: "operations" | "workspace" | "leads" | "opportunities" | "organizations" | "contacts" | "scheduling" | "invitations" | "pipeline" | "accounts" | "reports" | "settings";
}

export const AdminNav: React.FC<AdminNavProps> = ({ currentTab, activeDesk }) => {
  const location = useLocation();
  const path = location.pathname;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const active = activeDesk || currentTab;
  const isOperations = active === "operations" || active === "workspace" || path === "/admin/crm/operations" || path.startsWith("/admin/crm/operations");
  const isLeads = active === "leads" || path.startsWith("/admin/crm/leads");
  const isPipeline = active === "opportunities" || active === "pipeline" || path.startsWith("/admin/crm/pipeline");
  const isOrgs = active === "organizations" || active === "accounts" || path.startsWith("/admin/crm/organizations");
  const isContacts = active === "contacts" || path.startsWith("/admin/crm/contacts");
  const isScheduling = (active === "scheduling" && !location.search.includes("tab=invitations")) || (path.startsWith("/admin/scheduling") && !location.search.includes("tab=invitations"));
  const isInvitations = active === "invitations" || path === "/admin/invitations" || (path.startsWith("/admin/scheduling") && location.search.includes("tab=invitations"));
  const isReports = active === "reports" || path.startsWith("/admin/crm/reports");
  const isSettings = active === "settings" || path.startsWith("/admin/settings");

  // Check scroll positions
  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  // Update on mount, resize, and element dimension change
  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleResize = () => checkScroll();
    window.addEventListener("resize", handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => checkScroll());
      resizeObserver.observe(el);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
    };
  }, [checkScroll]);

  // Active Tab Visibility: Automatically scroll active tab into view when active changes
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const timer = setTimeout(() => {
      const activeEl = el.querySelector<HTMLElement>('[data-active="true"]');
      if (activeEl) {
        const containerRect = el.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();

        // Check if tab is outside or close to the edge of the viewport
        if (activeRect.left < containerRect.left + 32 || activeRect.right > containerRect.right - 32) {
          activeEl.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
        }
      }
      checkScroll();
    }, 60);

    return () => clearTimeout(timer);
  }, [active, path, location.search, checkScroll]);

  // Translate vertical wheel scroll to horizontal scrolling on tabs container
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth) {
        const atLeft = el.scrollLeft <= 0 && e.deltaY < 0;
        const atRight = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1 && e.deltaY > 0;
        if (!atLeft && !atRight) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
          checkScroll();
        }
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [checkScroll]);

  const scrollByAmount = (amount: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <nav
      aria-label="Admin Suite Navigation"
      className="border border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-[#06152b]/60 backdrop-blur-md rounded-2xl p-2 mb-6 shadow-xs dark:shadow-none relative max-w-full overflow-hidden"
    >
      <div className="flex items-center justify-between gap-3 min-w-0 max-w-full">
        {/* Scrollable Tabs Viewport */}
        <div className="relative min-w-0 flex-1 overflow-hidden">
          {/* Left Fade + Indicator */}
          {canScrollLeft && (
            <div
              className="absolute left-0 top-0 bottom-0 z-10 flex items-center pl-0.5 pr-6 bg-gradient-to-r from-white via-white/90 to-transparent dark:from-[#06152b] dark:via-[#06152b]/95 dark:to-transparent pointer-events-none transition-opacity duration-200"
              aria-hidden="true"
            >
              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.preventDefault();
                  scrollByAmount(-200);
                }}
                aria-label="Scroll tabs left"
                className="pointer-events-auto p-1 rounded-lg bg-white/90 dark:bg-[#081c38]/90 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200/80 dark:border-white/10 shadow-xs hover:scale-105 transition-all focus:outline-none"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Core CRM & Operations Tabs — Guaranteed single row */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none scroll-smooth flex-nowrap min-w-0 max-w-full"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* Operations Commercial Workspace */}
            <Link
              to="/admin/crm/operations"
              data-active={isOperations ? "true" : undefined}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 whitespace-nowrap shrink-0",
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
              data-active={isLeads ? "true" : undefined}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 whitespace-nowrap shrink-0",
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
              data-active={isPipeline ? "true" : undefined}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 whitespace-nowrap shrink-0",
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
              data-active={isOrgs ? "true" : undefined}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 whitespace-nowrap shrink-0",
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
              data-active={isContacts ? "true" : undefined}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 whitespace-nowrap shrink-0",
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
              data-active={isScheduling ? "true" : undefined}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 whitespace-nowrap shrink-0",
                isScheduling
                  ? "bg-[#e57804] text-white shadow-lg shadow-[#e57804]/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Scheduling</span>
            </Link>

            {/* Client Account Invitations */}
            <Link
              to="/admin/invitations"
              data-active={isInvitations ? "true" : undefined}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 whitespace-nowrap shrink-0",
                isInvitations
                  ? "bg-[#e57804] text-white shadow-lg shadow-[#e57804]/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
              )}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invitations</span>
            </Link>

            {/* Commercial Intelligence & Reports */}
            <Link
              to="/admin/crm/reports"
              data-active={isReports ? "true" : undefined}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 whitespace-nowrap shrink-0",
                isReports
                  ? "bg-[#e57804] text-white shadow-lg shadow-[#e57804]/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
              )}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Reports</span>
            </Link>

            {/* Platform Settings & Maintenance */}
            <Link
              to="/admin/settings"
              data-active={isSettings ? "true" : undefined}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 whitespace-nowrap shrink-0",
                isSettings
                  ? "bg-[#e57804] text-white shadow-lg shadow-[#e57804]/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
              )}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </Link>
          </div>

          {/* Right Fade + Indicator */}
          {canScrollRight && (
            <div
              className="absolute right-0 top-0 bottom-0 z-10 flex items-center pr-0.5 pl-6 bg-gradient-to-l from-white via-white/90 to-transparent dark:from-[#06152b] dark:via-[#06152b]/95 dark:to-transparent pointer-events-none transition-opacity duration-200"
              aria-hidden="true"
            >
              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.preventDefault();
                  scrollByAmount(200);
                }}
                aria-label="Scroll tabs right"
                className="pointer-events-auto p-1 rounded-lg bg-white/90 dark:bg-[#081c38]/90 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200/80 dark:border-white/10 shadow-xs hover:scale-105 transition-all focus:outline-none"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-2 shrink-0 pl-1 border-l border-slate-200 dark:border-white/10">
          <Link
            to="/request-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono text-slate-600 hover:text-[#e57804] dark:text-slate-400 dark:hover:text-[#e57804] flex items-center gap-1 transition-colors px-2 py-1"
            title="Open demo request form in new tab"
          >
            <span className="hidden sm:inline">Live Form</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </nav>
  );
};
