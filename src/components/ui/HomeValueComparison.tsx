import React, { useState } from "react";
import { 
  CheckCircle2, XCircle, AlertCircle, ArrowRight, ShieldCheck, 
  Layers, Building, Users, HelpCircle, ChevronRight
} from "lucide-react";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { VALUE_COMPARISON_DIMENSIONS } from "@/data/pricing";
import { cn } from "@/lib/utils";

type AlternativeKey = "disconnectedTools" | "traditionalAgency" | "legacyEnterpriseMonolith" | "internalBuild";

interface AlternativeOption {
  key: AlternativeKey;
  label: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  riskSummary: string;
}

const ALTERNATIVES: AlternativeOption[] = [
  {
    key: "disconnectedTools",
    label: "Fragmented Multi-SaaS Tools",
    tagline: "Stitching 8-15 separate off-the-shelf software tools with webhooks",
    icon: Layers,
    riskSummary: "Compounding seat fees, constant integration breakdowns, data silos, and zero domain customization."
  },
  {
    key: "traditionalAgency",
    label: "Traditional Agency Outsourcing",
    tagline: "Hiring creative or generalist software agencies to build custom apps",
    icon: Users,
    riskSummary: "Junior turnover, trial-and-error architecture, scope-creep invoices, and post-launch abandonment."
  },
  {
    key: "legacyEnterpriseMonolith",
    label: "Legacy Enterprise Monoliths",
    tagline: "Procuring massive multi-decade enterprise legacy software suites",
    icon: Building,
    riskSummary: "Multi-million dollar CapEx, 18-36 month deployment delays, rigid architectures, and vendor lock-in."
  },
  {
    key: "internalBuild",
    label: "Building Internally From Scratch",
    tagline: "Recruiting an in-house software engineering team from ground zero",
    icon: HelpCircle,
    riskSummary: "6-12 months of recruitment delays, key-person risk, immense overhead, and diverted core business focus."
  }
];

export const HomeValueComparison: React.FC = () => {
  const [selectedAlt, setSelectedAlt] = useState<AlternativeKey>("disconnectedTools");

  const currentAlt = ALTERNATIVES.find((a) => a.key === selectedAlt) || ALTERNATIVES[0];

  return (
    <section 
      id="value-comparison" 
      data-surface="dark"
      className="py-20 lg:py-28 bg-[#040e1d] border-t border-white/10 relative overflow-hidden"
      aria-label="Enterprise Value Comparison: Why Zakeem"
    >
      {/* Subtle Background Glow */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[300px] bg-[#e57804]/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="neon" className="mb-3">Strategic Value Assessment</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Why Enterprise Leaders{" "}
            <span className="bg-gradient-to-r from-white via-amber-200 to-[#e57804] bg-clip-text text-transparent">
              Partner with Zakeem.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300 mt-4 leading-relaxed">
            True enterprise software value is measured in business outcomes, zero transactional loss, and sovereign scalability — not just upfront sticker price. Compare the structural realities below.
          </p>
        </div>

        {/* Alternative Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10 max-w-4xl mx-auto">
          {ALTERNATIVES.map((alt) => {
            const isSelected = alt.key === selectedAlt;
            const Icon = alt.icon;

            return (
              <button
                key={alt.key}
                onClick={() => setSelectedAlt(alt.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#e57804]",
                  isSelected
                    ? "bg-[#081c38] border-[#e57804] text-white shadow-lg shadow-[#e57804]/10"
                    : "bg-[#06152b]/60 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                )}
                aria-pressed={isSelected}
              >
                <Icon className={cn("w-4 h-4", isSelected ? "text-[#e57804]" : "text-slate-400")} />
                <span>Vs. {alt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Comparison Board */}
        <div className="rounded-3xl bg-gradient-to-b from-[#081c38] to-[#040e1d] border border-white/15 overflow-hidden shadow-2xl">
          {/* Board Header Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-white/10">
            {/* Zakeem Column Title */}
            <div className="p-6 md:p-8 bg-[#0a2347]/80 border-b md:border-b-0 md:border-r border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-[#e57804] tracking-widest uppercase block mb-1">
                  The Zakeem Unified Standard
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  Zakeem Solutions Platform
                  <ShieldCheck className="w-5 h-5 text-[#e57804]" />
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Production-grade enterprise software, embedded AI & sovereign reliability.
                </p>
              </div>
              <Badge variant="neon" className="shrink-0 hidden sm:inline-flex">High Outcome</Badge>
            </div>

            {/* Alternative Column Title */}
            <div className="p-6 md:p-8 bg-black/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400 tracking-widest uppercase block mb-1">
                  Alternative Model
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-300">
                  {currentAlt.label}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {currentAlt.tagline}
                </p>
              </div>
              <Badge variant="neutral" className="shrink-0 hidden sm:inline-flex">Structural Trade-off</Badge>
            </div>
          </div>

          {/* Alternative Risk Overview Bar */}
          <div className="p-4 bg-amber-500/5 border-b border-white/5 px-6 md:px-8 flex items-center gap-3 text-xs sm:text-sm text-amber-200/90">
            <AlertCircle className="w-4 h-4 text-[#e57804] shrink-0" />
            <span>
              <strong className="text-white font-semibold">Inherent Risk Factor: </strong>
              {currentAlt.riskSummary}
            </span>
          </div>

          {/* Dimension-by-Dimension Comparison Rows */}
          <div className="divide-y divide-white/5">
            {VALUE_COMPARISON_DIMENSIONS.map((item, idx) => (
              <div 
                key={idx} 
                className="grid grid-cols-1 md:grid-cols-12 hover:bg-white/[0.02] transition-colors"
              >
                {/* Dimension Metadata Label (span 4 on tablet/desktop) */}
                <div className="md:col-span-4 p-5 md:p-6 bg-white/[0.01] border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-center">
                  <span className="text-xs font-mono text-[#e57804] font-semibold mb-1">
                    DIMENSION 0{idx + 1}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    {item.dimension}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Zakeem Advantage (span 4) */}
                <div className="md:col-span-4 p-5 md:p-6 bg-[#0a2347]/30 border-b md:border-b-0 md:border-r border-white/5 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#e57804] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-mono font-bold text-[#e57804] uppercase tracking-wider block mb-1">
                      Zakeem Execution
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                      {item.zakeemApproach}
                    </p>
                  </div>
                </div>

                {/* Alternative Drawback (span 4) */}
                <div className="md:col-span-4 p-5 md:p-6 bg-black/20 flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Alternative Drawback
                    </span>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {item[selectedAlt]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Board Footer & Direct Conversion CTAs */}
          <div className="p-6 md:p-8 bg-[#06152b] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-white font-bold text-base sm:text-lg">
                Ready to review custom enterprise pricing or request a tailored RFP?
              </div>
              <div className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Speak directly with an enterprise solutions architect — no sales junior scripts.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                href="/request-demo"
                className="flex-1 sm:flex-none"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Request a Demo
              </Button>
              <Button
                variant="outline"
                size="md"
                href="/pricing"
                className="flex-1 sm:flex-none text-white border-white/20 hover:border-[#e57804] hover:bg-white/10"
              >
                View Detailed Pricing
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
