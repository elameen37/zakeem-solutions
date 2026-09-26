import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Building2, ShieldCheck, LogOut, ArrowRight, Calendar, LifeBuoy, BookOpen, Layers, 
  Clock, CheckCircle2, AlertCircle, FileText, Cpu, Fuel, Sparkles, ChevronRight,
  UserCheck, ExternalLink, Activity
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export const ClientPortalPage: React.FC = () => {
  const { user, profile, role, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const displayName = profile?.fullName || user?.email?.split("@")[0] || "Executive Client";
  const displayEmail = user?.email || "Authenticated Session";
  const displayOrg = profile?.organization || "Enterprise Partner";
  const displayJobTitle = profile?.jobTitle || "Executive Account Holder";

  return (
    <>
      <SEO
        title="Client Portal — Zakeem Solutions"
        description="Authenticated enterprise client portal for Zakeem Solutions platforms, technical advisory, and deployments."
        canonical="https://www.zakeemsolutions.com/portal"
        noindex={true}
      />

      <section className="pt-10 pb-24 border-b border-white/10 min-h-[85vh]">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl space-y-10">
          
          {/* 1. Welcome & Identity Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
                <Badge variant="neon">Enterprise Client Portal</Badge>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Enterprise Session
                </span>
                {isAdmin && (
                  <Badge variant="blue" className="text-[10px]">
                    Admin Privilege Active
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                Welcome, {displayName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-900 dark:text-white">{displayOrg}</span>
                <span>•</span>
                <span className="text-slate-500 dark:text-slate-400">{displayJobTitle}</span>
                <span>•</span>
                <span className="font-mono text-slate-500 dark:text-slate-400">{displayEmail}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {isAdmin && (
                <Button variant="outline" size="sm" href="/admin/scheduling">
                  Admin Scheduling Desk
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                leftIcon={<LogOut className="w-4 h-4" />}
                className="text-slate-400 hover:text-rose-400 border border-white/10"
              >
                Sign Out
              </Button>
            </div>
          </div>

          {/* 2. Enterprise Onboarding & Engagement Milestone Horizon */}
          <div data-surface="dark" className="p-6 rounded-3xl bg-[#081c38] border border-white/10 space-y-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Commercial Engagement & Onboarding Horizon</h2>
                  <p className="text-xs text-slate-400">Authoritative lifecycle tracking for {displayOrg}</p>
                </div>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Active Discovery Phase
              </span>
            </div>

            {/* 5-Step Progress Stepper */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-black/30 border border-emerald-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">Phase 1</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Enterprise Invitation</h3>
                  <p className="text-[11px] text-slate-400 mt-1">Dispatched, cryptographically verified, and accepted.</p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-emerald-400">
                  Status: Completed
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/30 border border-emerald-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">Phase 2</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Identity & Access</h3>
                  <p className="text-[11px] text-slate-400 mt-1">Client profile provisioned with sovereign zero-trust boundary.</p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-emerald-400">
                  Status: Verified Partner
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/40 ring-1 ring-amber-500/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">Phase 3</span>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  </div>
                  <h3 className="text-xs font-bold text-white">Solution Discovery</h3>
                  <p className="text-[11px] text-slate-300 mt-1">Operational scoping, station audits, and requirements discovery.</p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-amber-400 font-bold">
                  Status: In Progress
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5 opacity-70 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Phase 4</span>
                    <Clock className="w-4 h-4 text-slate-500" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-300">Technical Blueprint</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Architecture walkthrough, customized SLAs, and proposal sign-off.</p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-slate-500">
                  Status: Next Step
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5 opacity-60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Phase 5</span>
                    <Cpu className="w-4 h-4 text-slate-500" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-300">VPC Rollout (Roadmap)</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Planned production staging, station hardware linking, and team onboarding.</p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 text-[10px] font-mono text-slate-500">
                  Status: Future Horizon
                </div>
              </div>
            </div>
          </div>

          {/* 3. Active Solution Engagement Context: Zakeem Forecourt */}
          <div data-surface="dark" className="p-6 md:p-8 rounded-3xl bg-[#06152b] border border-[#e57804]/30 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#e57804]/15 border border-[#e57804]/30 flex items-center justify-center text-[#e57804] shrink-0 mt-0.5">
                  <Fuel className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="blue">Selected Enterprise Solution</Badge>
                    <span className="text-xs font-mono text-slate-400">Category: Downstream Operations</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Zakeem Forecourt (Enterprise)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    Petroleum Forecourt Operations, Shift Reconciliation & Fuel Inventory Tracking.
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Discovery Phase Active
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Target Discovery Horizon: October 2026</span>
              </div>
            </div>

            {/* Architectural Highlights Grid (Strictly traceable to canonical ecosystem specifications) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#e57804]">Shift Management</span>
                <div className="text-sm font-bold text-white">Pump Attendant Shift Reconciliation</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Attendant shift handover, meter opening/closing logs, and cash reconciliation audited in &lt; 15 minutes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#e57804]">Inventory Control</span>
                <div className="text-sm font-bold text-white">Underground Tank Dip Tracking</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Underground fuel tank dip-measurement tracking, automated wet-stock variance alerts, and daily dip-to-pump reconciliation.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#e57804]">Multi-Site Oversight</span>
                <div className="text-sm font-bold text-white">Centralized Station Telemetry</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Centralized multi-station dashboard for executive operational oversight with tamper-evident audit logging.
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
              <div className="text-xs text-slate-300">
                Ready to review technical integration requirements or schedule a station demonstration?
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="sm"
                  href="/request-demo"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full sm:w-auto"
                >
                  Book Technical Walkthrough
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  href="/products/forecourt"
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10"
                >
                  Platform Specs
                </Button>
              </div>
            </div>
          </div>

          {/* 4. Executive Consultation & Walkthrough Desk */}
          <div data-surface="dark" className="p-6 rounded-3xl bg-[#081c38] border border-white/10 space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Executive Architecture Consultation Desk</h2>
                  <p className="text-xs text-slate-400">Dedicated systems advisory & architectural alignment sessions</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                href="/request-demo"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="border-sky-500/30 text-sky-300 hover:bg-sky-500/10"
              >
                Schedule Consultation Slot
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-black/25 border border-white/5">
                <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Timezone Coordination</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All executive walkthroughs operate in <strong>Africa/Lagos (WAT)</strong> business hours.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/25 border border-white/5">
                <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Executive Attendance</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Led directly by a Zakeem Solutions Lead Systems Architect and Enterprise Solutions Director.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/25 border border-white/5">
                <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                  <FileText className="w-3.5 h-3.5 text-[#e57804]" />
                  <span>Meeting Coordination</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Meeting coordination will be provided through the approved scheduling/communication workflow.
                </p>
              </div>
            </div>
          </div>

          {/* 5. Account Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div data-surface="dark" className="p-5 rounded-2xl bg-[#081c38] border border-white/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#e57804]/15 border border-[#e57804]/30 flex items-center justify-center text-[#e57804] shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Security Architecture</span>
                <div className="text-base font-bold text-white mt-0.5">Enterprise Identity Boundary</div>
                <p className="text-[11px] text-slate-300 mt-1">
                  End-to-end encrypted session with role isolation. Sovereign VPC deployment is scheduled on the Phase 5 roadmap.
                </p>
              </div>
            </div>

            <div data-surface="dark" className="p-5 rounded-2xl bg-[#081c38] border border-white/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Account Standing</span>
                <div className="text-base font-bold text-white mt-0.5">Verified Enterprise Partner</div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Direct technical advisory, dedicated architecture review, and priority SLA access.
                </p>
              </div>
            </div>

            <div data-surface="dark" className="p-5 rounded-2xl bg-[#081c38] border border-white/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Operational Horizon</span>
                <div className="text-base font-bold text-white mt-0.5">Africa/Lagos (WAT)</div>
                <p className="text-[11px] text-slate-300 mt-1">
                  All support SLAs, technical sprints, and commercial operations synchronized in WAT.
                </p>
              </div>
            </div>
          </div>

          {/* 6. Quick Action Matrix */}
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white mb-4 flex items-center gap-2">
              <span>Operational Capabilities & Resources</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/request-demo"
                className="group p-5 rounded-2xl bg-[#06152b] border border-white/10 hover:border-[#e57804]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-[#e57804]/15 flex items-center justify-center text-[#e57804] mb-3 group-hover:bg-[#e57804] group-hover:text-white transition-colors">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#e57804] transition-colors">
                    Schedule Architecture Walkthrough
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Book an executive technical demonstration with our lead architects.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center text-xs text-[#e57804] font-medium gap-1">
                  <span>Book Slot</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                to="/support"
                className="group p-5 rounded-2xl bg-[#06152b] border border-white/10 hover:border-[#e57804]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-400 mb-3 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                    <LifeBuoy className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#e57804] transition-colors">
                    Executive Service Desk
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Submit mission-critical incident reports or SLA escalations 24/7/365.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center text-xs text-sky-400 font-medium gap-1">
                  <span>Contact Desk</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                to="/pricing"
                className="group p-5 rounded-2xl bg-[#06152b] border border-white/10 hover:border-[#e57804]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#e57804] transition-colors">
                    Commercial Licensing
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Review transparent platform tiers and enterprise retainer agreements.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center text-xs text-emerald-400 font-medium gap-1">
                  <span>View Rates</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                to="/insights"
                className="group p-5 rounded-2xl bg-[#06152b] border border-white/10 hover:border-[#e57804]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400 mb-3 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#e57804] transition-colors">
                    Architecture Whitepapers
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Access technical frameworks for pan-African digital infrastructure.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center text-xs text-purple-400 font-medium gap-1">
                  <span>Read Briefings</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>

          {/* 7. Coming Online Modules Roadmap Notice */}
          <div data-surface="dark" className="p-6 rounded-3xl bg-[#081c38] border border-white/10 space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-5 h-5 text-[#e57804]" />
                <h3 className="text-base font-bold text-white">Client Portal Roadmap Modules</h3>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Phase 24 Deployment Pipeline
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              The following operational modules are actively being integrated into your dedicated client experience:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white">Dedicated Engineering Pods</span>
                  <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">In Development</span>
                </div>
                <p className="text-[11px] text-slate-400">Live sprint burn-downs, pod roster, and deliverable sign-offs.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/30 border border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white">Direct Invoice & Billing Vault</span>
                  <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">In Development</span>
                </div>
                <p className="text-[11px] text-slate-400">Reconciled Naira and USD invoices, tax receipts, and payment rails.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/30 border border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white">Sovereign Telemetry & SLA</span>
                  <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">In Development</span>
                </div>
                <p className="text-[11px] text-slate-400">Uptime guarantees, latency dashboards, and cryptographic audit logs.</p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
};
