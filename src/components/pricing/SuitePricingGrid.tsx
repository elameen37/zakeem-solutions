import React from "react";
import { CheckCircle2, ArrowRight, ShieldCheck, Layers, Sparkles } from "lucide-react";
import { BillingPeriod, calculateSuitePricing, SUITE_TIERS } from "@/data/pricing";
import { PricingBillingToggle } from "@/components/ui/PricingBillingToggle";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface SuitePricingGridProps {
  billingPeriod: BillingPeriod;
  onBillingPeriodChange: (period: BillingPeriod) => void;
}

export const SuitePricingGrid: React.FC<SuitePricingGridProps> = ({
  billingPeriod,
  onBillingPeriodChange,
}) => {
  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Badge variant="neon">Unified Multi-Solution Bundle</Badge>
        </div>
        <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Zakeem Business Suite Packages
        </h3>
        <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
          Combine core real estate ERP, AI document cognition, contractor procurement, and financial settlement into a single, unified enterprise subscription.
        </p>
      </div>

      {/* Billing Switcher */}
      <div className="flex justify-center">
        <PricingBillingToggle
          period={billingPeriod}
          onChange={onBillingPeriodChange}
        />
      </div>

      {/* Suite Tiers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {SUITE_TIERS.map((tier) => {
          const pricing = calculateSuitePricing(tier, billingPeriod);
          const dynamicCtaHref = tier.ctaHref.includes("?")
            ? `${tier.ctaHref}&billing=${billingPeriod}`
            : `${tier.ctaHref}?billing=${billingPeriod}`;

          return (
            <div
              key={tier.id}
              data-surface="dark"
              className={cn(
                "rounded-3xl border p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative",
                tier.featured
                  ? "bg-gradient-to-b from-[#0a2347] via-[#081c38] to-[#06152b] border-[#e57804] shadow-2xl shadow-[#e57804]/20 scale-[1.02] z-10"
                  : "bg-[#081c38] border-white/10 hover:border-white/20"
              )}
            >
              {tier.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge variant="neon">{tier.badge}</Badge>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-[#e57804] uppercase tracking-wider">
                    {tier.tierCode}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {tier.targetScale}
                  </span>
                </div>

                <h4 className="text-2xl font-extrabold text-white tracking-tight mb-1">
                  {tier.name}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 min-h-[38px]">
                  {tier.tagline}
                </p>

                {/* Pricing Box */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400 block">
                      Suite Investment
                    </span>
                    {pricing.savingsAmount && (
                      <span className="inline-flex items-center text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Save 20%
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl sm:text-4xl font-mono font-extrabold text-white">
                      {pricing.displayAmount}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono block mt-1">
                    {pricing.billingPeriodLabel}
                  </span>
                  {pricing.annualTotalDisplay && (
                    <span className="text-[11px] text-[#e57804] font-mono block mt-1">
                      {pricing.annualTotalDisplay}
                    </span>
                  )}
                </div>

                {/* Included Solutions Pillar */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 mb-6">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 uppercase tracking-wider mb-2">
                    <Layers className="w-3.5 h-3.5 shrink-0" />
                    <span>Included Solutions in Bundle:</span>
                  </div>
                  <div className="space-y-1.5">
                    {tier.includedSolutions.map((sol, idx) => (
                      <div key={idx} className="text-xs font-semibold text-white flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#e57804]" />
                        <span>{sol}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Capabilities */}
                <div className="space-y-2.5 mb-6">
                  <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider block">
                    Enterprise Capabilities:
                  </span>
                  {tier.coreCapabilities.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-200 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-[#e57804] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* SLA & Hosting */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 mb-6 text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{tier.supportLevel}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Hosting: {tier.hostingModel}
                  </div>
                </div>
              </div>

              <Button
                variant={tier.featured ? "primary" : "outline"}
                size="lg"
                href={dynamicCtaHref}
                data-analytics-id={`pricing-suite-${tier.id}-cta`}
                className={cn("w-full", !tier.featured && "border-white/20 text-white hover:bg-white/10 hover:text-white")}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {tier.ctaLabel}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
