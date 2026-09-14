import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Building2, ShieldCheck, LogOut, ArrowRight, Calendar, LifeBuoy, BookOpen, Layers, 
  Clock, CheckCircle2, AlertCircle, FileText, Cpu
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

  return (
    <>
      <SEO
        title="Client Portal — Zakeem Solutions"
        description="Authenticated enterprise client portal for Zakeem Solutions platforms, technical advisory, and deployments."
        canonical="https://www.zakeemsolutions.com/portal"
      />

      <section className="pt-12 pb-24 border-b border-white/10 min-h-[85vh]">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl space-y-8">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                <Badge variant="neon">Client Portal</Badge>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Enterprise Session
                </span>
                {isAdmin && (
                  <Badge variant="blue" className="text-[10px]">
                    Admin Privilege
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                Welcome, {displayName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                {displayOrg} • <span className="font-mono text-slate-400">{displayEmail}</span>
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

          {/* Account Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div data-surface="dark" className="p-5 rounded-2xl bg-[#081c38] border border-white/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#e57804]/15 border border-[#e57804]/30 flex items-center justify-center text-[#e57804] shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Security Tier</span>
                <div className="text-base font-bold text-white mt-0.5">Sovereign Cloud VPC</div>
                <p className="text-[11px] text-slate-300 mt-1">End-to-end encrypted identity verification active.</p>
              </div>
            </div>

            <div data-surface="dark" className="p-5 rounded-2xl bg-[#081c38] border border-white/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Account Standing</span>
                <div className="text-base font-bold text-white mt-0.5">Verified Partner</div>
                <p className="text-[11px] text-slate-300 mt-1">Full access to consultation & support infrastructure.</p>
              </div>
            </div>

            <div data-surface="dark" className="p-5 rounded-2xl bg-[#081c38] border border-white/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Timezone Horizon</span>
                <div className="text-base font-bold text-white mt-0.5">Africa/Lagos (WAT)</div>
                <p className="text-[11px] text-slate-300 mt-1">Support SLAs and meetings operate in WAT time.</p>
              </div>
            </div>
          </div>

          {/* Quick Action Matrix */}
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

          {/* Coming Online Modules Roadmap Notice */}
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
