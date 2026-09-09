import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Building2, CheckCircle2, ArrowRight, ShieldCheck, BarChart3, 
  MapPin, Users, DollarSign, FileText, Cpu, ExternalLink, KeyRound
} from "lucide-react";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { cn } from "@/lib/utils";

export const ZakeemRealtyERPHighlight: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"sales" | "land" | "management" | "finance" | "ai">("sales");

  const tabs = [
    { id: "sales", label: "Property Sales & CRM", icon: DollarSign },
    { id: "land", label: "Land & Plot Subdivision", icon: MapPin },
    { id: "management", label: "Lease & Facility Ops", icon: Building2 },
    { id: "finance", label: "Procurement & Accounting", icon: FileText },
    { id: "ai", label: "Zakky AI Valuation", icon: Cpu }
  ] as const;

  const tabContent = {
    sales: {
      headline: "Property Sales as a First-Class Citizen",
      tagline: "Turnkey reservation workflows, installment milestones, and broker commissions",
      description: "Unlike generic ERPs that treat real estate as simple inventory items, Zakeem Realty ERP models the true complexity of property transactions: off-plan payment plans, automated allocation upon payment thresholds, dynamic reservation locks, and broker attribution.",
      features: [
        "Real-time unit reservation lock preventing double-allocation",
        "Configurable installment schedules & automated client payment reminders",
        "Direct payment gateway settlement with auto-generated digital receipts",
        "Broker & realtor commission tracking with milestone disbursement"
      ],
      badge: "Core Flagship Engine"
    },
    land: {
      headline: "Dynamic GIS Land Registry & Plot Subdivision",
      tagline: "Digitize large acreage, estate layout schemes, and boundary beacons",
      description: "Manage raw land acquisition through to multi-phase plot demarcation. Connect survey beacon coordinates, track title documentation (C of O, Governor's Consent, Gazette), and allocate individual plots instantly.",
      features: [
        "Interactive graphical layout maps with live plot availability status",
        "Beacon coordinate mapping & survey plan documentation archive",
        "Deed of assignment & contract of sale automated drafting",
        "Excision and title regularization progress tracking"
      ],
      badge: "GIS Land Management"
    },
    management: {
      headline: "Enterprise Multi-Tenant Asset & Lease Operations",
      tagline: "Automated tenant onboarding, maintenance ticketing, and utility billing",
      description: "Complete operational visibility over commercial complexes, residential towers, and gated communities. From service charge reconciliation to proactive equipment maintenance lifecycles.",
      features: [
        "Automated lease renewals, escalation indexing, and notice generation",
        "Tenant self-service portal for payments, visitor passes & service requests",
        "Vendor work-order dispatch & contractor SLA management",
        "Smart meter utility reconciliation & automated vending"
      ],
      badge: "Facility Automation"
    },
    finance: {
      headline: "Audit-Grade Financial Ledger & Construction Procurement",
      tagline: "Milestone-based contractor disbursements and multi-entity consolidation",
      description: "Full general ledger accounting tailored for real estate developers. Track site bill of quantities (BOQ), material requisitions, contractor certificates of completion, and multi-bank escrow reconciliations.",
      features: [
        "Multi-company & joint-venture financial consolidation",
        "3-way purchase order, delivery note, and vendor invoice matching",
        "Retention sum tracking & phased milestone disbursement sign-offs",
        "Tax compliance, withholding tax (WHT), and VAT calculation engines"
      ],
      badge: "Financial Governance"
    },
    ai: {
      headline: "Zakky AI — Predictive Valuation & Demand Intelligence",
      tagline: "Autonomous property intelligence and automated documentation assistant",
      description: "Equipped with Zakeem's proprietary Zakky AI engine. Analyzes historical regional transaction comps, forecasts neighborhood yield trajectories, and autonomously drafts legal lease clauses and client correspondence.",
      features: [
        "Automated comparative market analysis (CMA) with confidence intervals",
        "Tenant churn & default probability risk scoring",
        "Natural-language query interface across all property contracts and records",
        "Automated appraisal reports generated in seconds"
      ],
      badge: "Proprietary AI"
    }
  };

  const current = tabContent[activeTab];

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden bg-[#040e1d] border-y border-white/10">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#e57804]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 lg:mb-16 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="neon">
                Flagship Enterprise Product
              </Badge>
              <span className="text-xs font-mono text-slate-300">Release v2.4 Enterprise</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              ZAKEEM <span className="text-[#e57804]">REALTY ERP</span>
            </h2>
            <p className="mt-4 text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed">
              The unified digital operating system for real estate developers, property management conglomerates, and land aggregators.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="md"
              href="https://realty.zakeemsolutions.com"
              isExternal
              leftIcon={<KeyRound className="w-4 h-4 text-[#e57804]" />}
              rightIcon={<ExternalLink className="w-3.5 h-3.5 text-slate-300" />}
            >
              Access ERP Portal
            </Button>
            <Button
              variant="primary"
              size="md"
              href="/products/zakeem-realty-erp"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Full Product Experience
            </Button>
          </div>
        </div>

        {/* Interactive Module Tabs */}
        <div className="flex overflow-x-auto gap-2 p-1.5 bg-[#06152b] border border-white/10 rounded-2xl mb-8 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs md:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0",
                  isSelected
                    ? "bg-[#e57804] text-white shadow-lg shadow-[#e57804]/25 border border-[#e57804]"
                    : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
                )}
              >
                <Icon className={cn("w-4 h-4", isSelected ? "text-white" : "text-slate-300")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Showcase Canvas Card */}
        <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#091f3d] to-[#040e1d] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6">
              <Badge variant="neon">{current.badge}</Badge>
              <h3 className="text-2xl md:text-3xl font-bold text-white leading-snug">
                {current.headline}
              </h3>
              <p className="text-xs md:text-sm font-mono text-[#e57804]">
                {current.tagline}
              </p>
              <p className="text-sm md:text-base text-slate-200 leading-relaxed">
                {current.description}
              </p>

              <div className="space-y-3 pt-2">
                {current.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#e57804] shrink-0 mt-0.5" />
                    <span className="text-xs md:text-sm text-slate-200">{feat}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Button
                  variant="primary"
                  size="md"
                  href="/request-demo"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Schedule ERP Walkthrough
                </Button>
                <Link
                  to="/products/zakeem-realty-erp"
                  className="text-xs font-mono text-slate-300 hover:text-[#e57804] underline underline-offset-4 flex items-center gap-1.5"
                >
                  <span>View All 14 Modules</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Architectural Preview Mockup */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-white/15 bg-[#06152b] p-4 md:p-6 shadow-2xl relative group">
                {/* Window header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-[11px] text-slate-400">realty.zakeemsolutions.com/dashboard</span>
                  </div>
                  <Badge variant="neutral">Secure SSL 256-bit</Badge>
                </div>

                {/* Dashboard Mock Content */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-[11px] text-slate-300">Gross Sales (YTD)</div>
                      <div className="text-lg font-bold font-mono text-white mt-1">₦4.85B</div>
                      <div className="text-[10px] text-[#e57804] font-mono mt-0.5">+34.2% MoM</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-[11px] text-slate-300">Allocated Units</div>
                      <div className="text-lg font-bold font-mono text-white mt-1">342 / 410</div>
                      <div className="text-[10px] text-white font-mono mt-0.5">83.4% Occupancy</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-[11px] text-slate-300">Escrow Balance</div>
                      <div className="text-lg font-bold font-mono text-white mt-1">₦1.12B</div>
                      <div className="text-[10px] text-[#e57804] font-mono mt-0.5">Reconciled</div>
                    </div>
                  </div>

                  {/* Visual module preview */}
                  <div className="p-4 rounded-xl bg-[#040e1d] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                      <span className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#e57804]" />
                        Active Estate Development Projects
                      </span>
                      <span className="font-mono text-[#e57804]">Live Stream</span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-2.5 rounded-lg bg-white/5 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-white">Eko Atlantic Horizon Towers</div>
                          <div className="text-[11px] text-slate-300">Phase II Construction • 94% Sold</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-[#e57804]/15 text-[#e57804] font-mono text-[10px] border border-[#e57804]/30">
                          On Schedule
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white/5 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-white">Maitama Hills Land Subdivision</div>
                          <div className="text-[11px] text-slate-300">120 Plots • Beacon Demarcation Complete</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] border border-white/20">
                          Allocating
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Assistant Preview */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-[#e57804]/20 to-amber-500/10 border border-[#e57804]/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#e57804]/20 flex items-center justify-center">
                        <Cpu className="w-4 h-4 text-[#e57804]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Zakky AI Valuation Assistant</div>
                        <div className="text-[11px] text-slate-300">Predicted yield: +14.8% over 3-year horizon</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-[#e57804]">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};