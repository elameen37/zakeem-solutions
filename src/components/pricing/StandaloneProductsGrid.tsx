import React from "react";
import { 
  CheckCircle2, ArrowRight, ShieldCheck, 
  Building2, BrainCircuit, Scale, Workflow, Shield 
} from "lucide-react";
import { 
  BillingPeriod, calculateTierPricing, 
  PRODUCT_PRICING_TIERS, STANDALONE_PRODUCTS, 
  CommercialProductCategory 
} from "@/data/pricing";
import { PricingBillingToggle } from "@/components/ui/PricingBillingToggle";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface StandaloneProductsGridProps {
  category: CommercialProductCategory;
  billingPeriod: BillingPeriod;
  onBillingPeriodChange: (period: BillingPeriod) => void;
}

export const StandaloneProductsGrid: React.FC<StandaloneProductsGridProps> = ({
  category,
  billingPeriod,
  onBillingPeriodChange,
}) => {
  const renderProductIcon = (id: string) => {
    const iconClass = "w-5 h-5 text-[#e57804]";
    switch (id) {
      case "zakeem-realty-erp": return <Building2 className={iconClass} />;
      case "zakeem-cortex-ai": return <BrainCircuit className={iconClass} />;
      case "e-legal-justice": return <Scale className={iconClass} />;
      case "zakeem-flow": return <Workflow className={iconClass} />;
      case "zakeem-vault": return <Shield className={iconClass} />;
      default: return <Building2 className={iconClass} />;
    }
  };

  const showRealtyTiers = category === "all" || category === "real-estate";
  const otherProducts = STANDALONE_PRODUCTS.filter((p) => {
    if (category === "all") return p.id !== "zakeem-realty-erp";
    return p.category === category;
  });

  return (
    <div className="space-y-16">
      {/* 1. If showing Real Estate / All: Render Approved Realty ERP Tiers */}
      {showRealtyTiers && (
        <div>
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="neon">Flagship SaaS Platform</Badge>
              <Badge variant="outline" className="text-white border-white/20 bg-white/5">
                v2.4 Live in Production
              </Badge>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Zakeem Realty ERP Subscription Plans
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Consolidated real estate sales, dynamic land parcel allocation, tenant accounting, and milestone contractor procurement.
            </p>
          </div>

          {/* Billing Switcher */}
          <div className="flex justify-center mb-10">
            <PricingBillingToggle
              period={billingPeriod}
              onChange={onBillingPeriodChange}
            />
          </div>

          {/* 3-Tier Grid for Realty ERP */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {PRODUCT_PRICING_TIERS.map((tier) => {
              const pricing = calculateTierPricing(tier, billingPeriod);
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
                          {tier.priceModel}
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

                    {/* Capabilities */}
                    <div className="space-y-3 mb-6">
                      <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider block">
                        Included Platform Capabilities:
                      </span>
                      {tier.deliverables.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-[#e57804] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* SLA & Hosting */}
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 mb-6 text-xs font-mono text-slate-300">
                      <div className="flex items-center gap-1.5 text-amber-300">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{tier.sla}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        Hosting: {tier.hostingOptions.join(", ")}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant={tier.featured ? "primary" : "outline"}
                    size="lg"
                    href={dynamicCtaHref}
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
      )}

      {/* 2. Additional Confirmed Ecosystem Solutions / Standalone Products */}
      {otherProducts.length > 0 && (
        <div>
          {category === "all" && (
            <div className="text-center max-w-2xl mx-auto mb-8 pt-6 border-t border-white/10">
              <Badge variant="blue" className="mb-2">Expanding Enterprise Ecosystem</Badge>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                Additional Specialized Software & Solutions
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Explore our emerging AI cognition, legal operations, supply-chain, and institutional settlement rails.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {otherProducts.map((prod) => (
              <div
                key={prod.id}
                data-surface="dark"
                className="rounded-3xl bg-[#081c38] border border-white/10 p-6 sm:p-8 flex flex-col justify-between hover:border-[#e57804]/50 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        {renderProductIcon(prod.id)}
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold text-[#e57804] uppercase tracking-wider block">
                          {prod.categoryLabel}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {prod.version}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full font-semibold border bg-white/5 border-white/15 text-amber-300">
                      {prod.lifecycleBadge}
                    </span>
                  </div>

                  <h4 className="text-2xl font-extrabold text-white tracking-tight mb-2">
                    {prod.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                    {prod.valueProposition}
                  </p>

                  {/* Commercial State Card */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 mb-6">
                    <span className="text-xs font-mono text-slate-400 block uppercase">Commercial Model</span>
                    <span className="text-xl font-mono font-extrabold text-white block mt-0.5">
                      {prod.startingPriceDisplay}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono block mt-1">
                      {prod.billingFrequencyLabel}
                    </span>
                  </div>

                  {/* Included capabilities */}
                  <div className="space-y-2.5 mb-6">
                    <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider block">
                      Core Functional Highlights:
                    </span>
                    {prod.deliverables.map((d, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-[#e57804] shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 mb-6 text-xs font-mono text-slate-300 flex items-center gap-1.5 text-amber-300">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{prod.sla}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  href={prod.ctaHref}
                  className="w-full"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {prod.ctaLabel}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
