import React from "react";
import { CheckCircle2, ArrowRight, ShieldCheck, Cpu } from "lucide-react";
import { SERVICE_ENGAGEMENT_MODELS } from "@/data/pricing";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const ServicesMatrix: React.FC = () => {
  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Badge variant="neon">Bespoke Engineering & Transformation</Badge>
        </div>
        <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Enterprise Services & Engineering Retainers
        </h3>
        <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
          For institutions requiring tailored software engineering pods, forensic architectural audits, legacy core modernization, or continuous 24/7 SRE monitoring.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {SERVICE_ENGAGEMENT_MODELS.map((model) => (
          <div
            key={model.id}
            data-surface="dark"
            className="rounded-3xl bg-[#081c38] border border-white/10 p-6 sm:p-8 flex flex-col justify-between hover:border-[#e57804]/50 transition-all duration-300"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-[#e57804] uppercase tracking-wider">
                  {model.category}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {model.duration}
                </span>
              </div>

              <h4 className="text-2xl font-extrabold text-white tracking-tight mb-2">
                {model.name}
              </h4>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 mb-6">
                <span className="text-xs font-mono text-slate-400 block">Investment Structure</span>
                <span className="text-xl font-mono font-bold text-amber-300 block mt-0.5">
                  {model.investmentTier}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                <strong className="text-white block mb-1">Target Application:</strong>
                {model.idealFor}
              </p>

              <div className="space-y-2.5 mb-6">
                <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider block">
                  Engagement Deliverables:
                </span>
                {model.deliverables.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#e57804] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 mb-6">
                <span className="text-xs font-mono font-semibold text-amber-300 block mb-1">
                  Guaranteed Outcomes:
                </span>
                <ul className="space-y-1">
                  {model.outcomes.map((out, idx) => (
                    <li key={idx} className="text-xs text-slate-300 list-disc list-inside">
                      {out}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              href={model.ctaHref}
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {model.ctaLabel}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
