import React, { useState } from "react";
import { 
  CheckCircle2, ArrowRight, ShieldCheck, Shield, HelpCircle, 
  Layers, Cpu, Server, Lock, ChevronDown, ChevronUp,
  Building2, ArrowUpRight, PhoneCall
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { 
  PRODUCT_PRICING_TIERS, SERVICE_ENGAGEMENT_MODELS, PRICING_FAQS, 
  ProductPricingTier, ServiceEngagementModel, BillingPeriod, 
  calculateTierPricing, formatNaira 
} from "@/data/pricing";
import { PricingBillingToggle } from "@/components/ui/PricingBillingToggle";
import { cn } from "@/lib/utils";

export const PricingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"products" | "services">("products");
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("annual");
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq-1");

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <>
      <SEO
        title="Enterprise Pricing & Engagement Architecture — Zakeem Solutions"
        description="Predictable enterprise technology investment models. Review transparent subscription tiers for Zakeem Realty ERP and custom engineering engagement structures."
        canonical="https://www.zakeemsolutions.com/pricing"
      />

      {/* 1. PRICING HERO */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 border-b border-white/10 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#e57804]/20 via-[#06152b]/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <Badge variant="neon">Enterprise Commercial Architecture</Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-[1.15] mb-6">
              Predictable Engineering Investment.{" "}
              <span className="bg-gradient-to-r from-slate-950 via-amber-700 to-[#e57804] dark:from-white dark:via-amber-200 dark:to-[#e57804] bg-clip-text text-transparent">
                Sovereign Value.
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto mb-10">
              We design transparent commercial agreements centered on verifiable business outcomes, high-concurrency SLAs, and full intellectual property protection — with zero hidden seat penalties.
            </p>

            {/* Model Switcher Tabs */}
            <div className="flex flex-col sm:inline-flex sm:flex-row items-stretch sm:items-center p-1.5 rounded-2xl bg-[#081c38] border border-white/15 shadow-xl max-w-full gap-1 sm:gap-0">
              <button
                onClick={() => setActiveTab("products")}
                className={cn(
                  "px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2",
                  activeTab === "products"
                    ? "bg-[#e57804] text-slate-950 shadow-md shadow-[#e57804]/20"
                    : "text-slate-300 hover:text-white"
                )}
                aria-pressed={activeTab === "products"}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>Proprietary Software Subscriptions</span>
              </button>

              <button
                onClick={() => setActiveTab("services")}
                className={cn(
                  "px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2",
                  activeTab === "services"
                    ? "bg-[#e57804] text-slate-950 shadow-md shadow-[#e57804]/20"
                    : "text-slate-300 hover:text-white"
                )}
                aria-pressed={activeTab === "services"}
              >
                <Cpu className="w-4 h-4 shrink-0" />
                <span>Enterprise Engineering & Transformation</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRICING TIERS OR SERVICES MATRIX */}
      <section className="py-20 bg-[#040e1d] relative" data-surface="dark">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          {activeTab === "products" ? (
            <div>
              {/* Product Tiers Header */}
              <div className="text-center max-w-3xl mx-auto mb-10">
                <Badge variant="blue" className="mb-2">Software Licensing & Cloud Hosting</Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Zakeem Platform Subscription Tiers
                </h2>
                <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
                  Turnkey access to our core enterprise platforms (including Zakeem Realty ERP and AI modules). Built for single or multi-tenant operation.
                </p>
              </div>

              {/* Billing Period Switcher */}
              <div className="flex justify-center mb-12">
                <PricingBillingToggle
                  period={billingPeriod}
                  onChange={setBillingPeriod}
                />
              </div>

              {/* Tiers Grid */}
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
                          ? "bg-gradient-to-b from-[#0a2347] via-[#081c38] to-[#06152b] border-[#e57804] shadow-2xl shadow-[#e57804]/15 scale-[1.02] z-10"
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

                        <h3 className="text-2xl font-extrabold text-white tracking-tight mb-2">
                          {tier.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 min-h-[40px]">
                          {tier.tagline}
                        </p>

                        {/* Pricing Display */}
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

                        {/* Deliverables List */}
                        <div className="space-y-3 mb-8">
                          <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider block">
                            Platform Capabilities:
                          </span>
                          {tier.deliverables.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
                              <CheckCircle2 className="w-4 h-4 text-[#e57804] shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>

                        {/* SLA and Hosting */}
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 mb-6 text-xs font-mono text-slate-300">
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
          ) : (
            <div>
              {/* Services Header */}
              <div className="text-center max-w-3xl mx-auto mb-14">
                <Badge variant="neon" className="mb-2">Bespoke Engineering & Transformation</Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Enterprise Services & Engineering Retainers
                </h2>
                <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
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

                      <h3 className="text-2xl font-extrabold text-white tracking-tight mb-2">
                        {model.name}
                      </h3>

                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 mb-6">
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

                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 mb-6">
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
          )}
        </div>
      </section>

      {/* 3. ENTERPRISE ASSURANCE & SOVEREIGN GOVERNANCE */}
      <section className="py-16 bg-[#06152b] border-y border-white/10 relative" data-surface="dark">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="p-4 rounded-2xl bg-[#081c38] border border-white/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#e57804]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Full IP & Source Escrow</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Perpetual rights assignment and legal escrow options for institutional security.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#081c38] border border-white/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Server className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Air-Gapped Sovereign Hosting</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Deploy on your private bare-metal or sovereign government data centers.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#081c38] border border-white/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-[#e57804]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Bank-Grade Zero-Trust</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  End-to-end AES-256 HSM encryption, strict mTLS, and audit immutability.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#081c38] border border-white/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">99.99% Financial SLAs</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Mission-critical uptime backed by dedicated 24/7 Site Reliability Engineers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ENTERPRISE PROCUREMENT & LICENSING FAQS */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <SectionHeader
            badge="Frequently Answered Questions"
            title="Enterprise Procurement &"
            highlightedWord="Commercial FAQs."
            description="Clear answers to common questions regarding enterprise licensing, security audits, data sovereignty, and payment milestones."
            align="center"
          />

          <div className="space-y-4 mt-12">
            {PRICING_FAQS.map((faq) => {
              const isOpen = openFaqId === faq.id;

              return (
                <div
                  key={faq.id}
                  data-surface="dark"
                  className="rounded-2xl bg-[#081c38] border border-white/10 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#e57804]"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-[#e57804] px-2 py-0.5 rounded bg-[#e57804]/10 font-semibold shrink-0">
                        {faq.category}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        {faq.question}
                      </h3>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#e57804] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 bg-black/20">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. CONSULTATION CTA */}
      <section className="py-20 bg-[#040e1d] border-t border-white/10 relative" data-surface="dark">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl text-center">
          <Badge variant="neon" className="mb-4">Solutions Advisory</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Need a custom RFP or tailored enterprise assessment?
          </h2>
          <p className="text-base text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Our Enterprise Solutions Architects evaluate your current system topology and deliver a comprehensive commercial proposal within 5 business days.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              href="/contact?type=rfp-consultation"
              rightIcon={<PhoneCall className="w-4 h-4" />}
            >
              Schedule Commercial Briefing
            </Button>
            <Button
              variant="outline"
              size="lg"
              href="/request-demo"
              className="border-white/20 text-white hover:bg-white/10 hover:text-white"
              rightIcon={<ArrowUpRight className="w-4 h-4" />}
            >
              Request Platform Demo
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};
