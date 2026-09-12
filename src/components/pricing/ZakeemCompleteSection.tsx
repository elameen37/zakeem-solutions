import React from "react";
import { 
  Sparkles, CheckCircle2, ArrowRight, ShieldCheck, 
  Server, Lock, Cpu, Landmark, Clock 
} from "lucide-react";
import { ZAKEEM_COMPLETE_CONFIG } from "@/data/pricing";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const ZakeemCompleteSection: React.FC = () => {
  const config = ZAKEEM_COMPLETE_CONFIG;

  return (
    <div className="space-y-10">
      <div className="text-center max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Badge variant="neon">Flagship Sovereign Offering</Badge>
        </div>
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          {config.headline}
        </h3>
        <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
          {config.positioning}
        </p>
      </div>

      {/* Main Complete Platform Architecture Card */}
      <div 
        data-surface="dark"
        className="rounded-3xl bg-gradient-to-b from-[#0a2347] via-[#081c38] to-[#040e1d] border border-[#e57804]/60 p-8 sm:p-12 shadow-2xl shadow-[#e57804]/15 relative overflow-hidden"
      >
        {/* Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#e57804]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start relative z-10">
          {/* Left Column: Scope Breakdown */}
          <div className="lg:col-span-8 space-y-8">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#e57804] block mb-1">
                {config.tagline}
              </span>
              <h4 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Consolidate Your Entire Enterprise Technology Stack
              </h4>
            </div>

            {/* Two Sub-Columns: Available Today vs Roadmap Inclusions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Available Today */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                    Available Today (Production)
                  </span>
                </div>
                <div className="space-y-2.5">
                  {config.availableToday.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continuous Inclusions & Roadmap */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                    Roadmap & Beta Inclusions
                  </span>
                </div>
                <div className="space-y-2.5">
                  {config.roadmapInclusions.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Enterprise Guarantees List */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-3">
                Master Service Institutional Assurances:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {config.enterpriseAssurances.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#e57804] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Commercial Arrangement & Direct Action */}
          <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-[#081c38] border border-white/15 space-y-6 flex flex-col justify-between h-full">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                Engagement Model
              </span>
              <h5 className="text-xl font-bold text-white mt-1">
                Annual Master Agreement
              </h5>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Tailored for multi-entity holdings, sovereign agencies, and high-concurrency property groups.
              </p>

              <div className="my-6 p-4 rounded-2xl bg-black/50 border border-white/10">
                <span className="text-xs font-mono text-slate-400 block">Investment Structure</span>
                <span className="text-2xl font-mono font-extrabold text-white block mt-1">
                  Custom Enterprise Quote
                </span>
                <span className="text-[11px] text-[#e57804] font-mono block mt-1">
                  Denominated in Nigerian Naira (NGN)
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex items-center gap-2">
                  <Landmark className="w-3.5 h-3.5 text-[#e57804]" />
                  <span>Consolidated Invoicing & In-Country Settlement</span>
                </div>
                <div className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-amber-300" />
                  <span>Dedicated SRE Pod & Priority 15min SLA</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#e57804]" />
                  <span>Full Intellectual Property Escrow Options</span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              href={config.ctaHref}
              data-analytics-id="pricing-complete-cta"
              className="w-full mt-4"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {config.ctaLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
