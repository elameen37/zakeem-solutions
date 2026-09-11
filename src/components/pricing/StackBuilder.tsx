import React, { useState } from "react";
import { 
  CheckSquare, Square, Calculator, Sparkles, 
  ArrowRight, ShieldCheck, HelpCircle, CheckCircle2 
} from "lucide-react";
import { 
  STACK_MODULES, calculateStackPricing, 
  formatNaira, BillingPeriod, 
  BUNDLE_DISCOUNT_PERCENT, ANNUAL_DISCOUNT_PERCENT 
} from "@/data/pricing";
import { PricingBillingToggle } from "@/components/ui/PricingBillingToggle";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export const StackBuilder: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    "stack-erp-core",
    "stack-erp-scale",
  ]);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("annual");

  const toggleModule = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const pricing = calculateStackPricing(selectedIds, billingPeriod);

  const dynamicCtaHref = `/contact?type=custom-stack&modules=${encodeURIComponent(
    selectedIds.join(",")
  )}&billing=${billingPeriod}`;

  return (
    <section className="py-16 bg-[#06152b] border-y border-white/10 relative" data-surface="dark">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge variant="neon">Interactive Commercial Calculator</Badge>
            <Badge variant="blue">Configurable Savings</Badge>
          </div>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Build Your Zakeem Stack
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Select the software modules and specialized solutions your organization needs. Combine 2 or more platform modules to automatically unlock bundle savings, plus an additional 20% on annual billing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Module Selection Checklist */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Available Platform Modules:
              </span>
              <span className="text-xs font-mono text-[#e57804]">
                {selectedIds.length} Selected
              </span>
            </div>

            <div className="space-y-3">
              {STACK_MODULES.map((mod) => {
                const isSelected = selectedIds.includes(mod.id);

                return (
                  <div
                    key={mod.id}
                    onClick={() => toggleModule(mod.id)}
                    className={cn(
                      "p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start justify-between gap-4",
                      isSelected
                        ? "bg-[#081c38] border-[#e57804] shadow-md shadow-[#e57804]/10"
                        : "bg-[#081c38]/50 border-white/10 hover:border-white/20"
                    )}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5 text-[#e57804] shrink-0">
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-[#e57804]" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-bold text-white">
                            {mod.name}
                          </h4>
                          <span
                            className={cn(
                              "text-[10px] font-mono px-2 py-0.5 rounded font-semibold border",
                              mod.statusType === "approved"
                                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                                : "bg-amber-500/15 border-amber-500/30 text-amber-300"
                            )}
                          >
                            {mod.statusBadge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                          {mod.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {mod.hasPrice && mod.monthlyPrice ? (
                        <div>
                          <span className="text-sm sm:text-base font-mono font-bold text-white block">
                            {formatNaira(mod.monthlyPrice)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            / month base
                          </span>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-xs font-mono font-semibold text-amber-300 block">
                            Custom Scoping
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            Pilot quote
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Dynamic Calculation Summary Card */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#081c38] border border-white/15 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#e57804]" />
                <h4 className="text-base font-bold text-white">Stack Estimate</h4>
              </div>
              <PricingBillingToggle
                period={billingPeriod}
                onChange={setBillingPeriod}
              />
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3 text-xs sm:text-sm font-mono">
              <div className="flex items-center justify-between text-slate-300">
                <span>Standalone List Total:</span>
                <span className="text-white font-bold">
                  {pricing.pricedItemCount > 0
                    ? formatNaira(pricing.standaloneMonthlyTotal) + " / mo"
                    : "₦0"}
                </span>
              </div>

              {/* Bundle Discount Line */}
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span>Multi-Product Bundle (-{BUNDLE_DISCOUNT_PERCENT}%):</span>
                  {pricing.bundleDiscountApplied && (
                    <span className="text-[10px] text-emerald-400 font-sans">Active</span>
                  )}
                </span>
                <span className={pricing.bundleDiscountApplied ? "text-emerald-400 font-bold" : "text-slate-500"}>
                  {pricing.bundleDiscountApplied
                    ? `-${formatNaira(pricing.standaloneMonthlyTotal - pricing.bundleMonthlyTotal)} / mo`
                    : "Requires 2+ priced modules"}
                </span>
              </div>

              {/* Annual Billing Line */}
              {billingPeriod === "annual" && (
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span>Annual Pre-payment (-{ANNUAL_DISCOUNT_PERCENT}%):</span>
                    <span className="text-[10px] text-emerald-400 font-sans">Active</span>
                  </span>
                  <span className="text-emerald-400 font-bold">
                    -{formatNaira(pricing.bundleMonthlyTotal - pricing.effectiveMonthlyPrice)} / mo
                  </span>
                </div>
              )}

              {/* Net Price Display */}
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 mt-4">
                <span className="text-xs text-slate-400 block uppercase">
                  Effective Investment Rate
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold text-white">
                    {pricing.pricedItemCount > 0
                      ? formatNaira(pricing.effectiveMonthlyPrice)
                      : "Custom Quote"}
                  </span>
                  {pricing.pricedItemCount > 0 && (
                    <span className="text-xs text-slate-400">/ month</span>
                  )}
                </div>

                {billingPeriod === "annual" && pricing.pricedItemCount > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Billed annually:</span>
                    <span className="text-[#e57804] font-bold">
                      {formatNaira(pricing.annualBillingTotal)} / yr
                    </span>
                  </div>
                )}

                {pricing.annualSavings > 0 && (
                  <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Total Annual Savings: {formatNaira(pricing.annualSavings)}</span>
                  </div>
                )}
              </div>

              {/* Unpriced / Pilot Modules Note */}
              {pricing.unpricedItemCount > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-sans text-amber-200 space-y-1">
                  <div className="font-semibold flex items-center gap-1 text-amber-300">
                    <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Selected Custom / Pilot Modules ({pricing.unpricedItemCount}):</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    {pricing.unpricedItemNames.join(", ")}. These will be scoped and quoted alongside your core subscription without arbitrary markups.
                  </p>
                </div>
              )}
            </div>

            <Button
              variant="primary"
              size="lg"
              href={dynamicCtaHref}
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Request Custom Stack Proposal
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
