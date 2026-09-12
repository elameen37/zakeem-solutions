import React, { useState } from "react";
import { 
  ShieldCheck, Server, Lock, Cpu, 
  ChevronDown, ChevronUp, PhoneCall, ArrowUpRight 
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { 
  BillingPeriod, CommercialProductCategory, 
  PRICING_FAQS 
} from "@/data/pricing";
import { PricingHero } from "@/components/pricing/PricingHero";
import { PurchasingPathNav, CommercialPath } from "@/components/pricing/PurchasingPathNav";
import { CategoryFilter } from "@/components/pricing/CategoryFilter";
import { StandaloneProductsGrid } from "@/components/pricing/StandaloneProductsGrid";
import { SuitePricingGrid } from "@/components/pricing/SuitePricingGrid";
import { ZakeemCompleteSection } from "@/components/pricing/ZakeemCompleteSection";
import { StackBuilder } from "@/components/pricing/StackBuilder";
import { ServicesMatrix } from "@/components/pricing/ServicesMatrix";

export const PricingPage: React.FC = () => {
  const [purchasingPath, setPurchasingPath] = useState<CommercialPath>("standalone");
  const [category, setCategory] = useState<CommercialProductCategory>("all");
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("annual");
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq-1");

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const handleExplorePlans = () => {
    const el = document.getElementById("pricing-catalog");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <SEO
        title="Enterprise Pricing & Multi-Product Architecture — Zakeem Solutions"
        description="Transparent, predictable enterprise software investment models. Review verified subscription tiers for Zakeem Realty ERP, multi-product business suites, and engineering retainers in Nigeria."
        canonical="https://www.zakeemsolutions.com/pricing"
      />

      {/* 1. CONVERSION-FOCUSED HERO */}
      <PricingHero onExplorePlans={handleExplorePlans} />

      {/* 2. COMMERCIAL CATALOG & PURCHASING PATHS */}
      <section id="pricing-catalog" className="py-20 bg-[#040e1d] relative" data-surface="dark">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl space-y-12">
          {/* Navigation between Standalone, Suite, Complete, and Services */}
          <PurchasingPathNav
            activePath={purchasingPath}
            onChange={setPurchasingPath}
          />

          {/* Conditional Path Experience */}
          {purchasingPath === "standalone" && (
            <div className="space-y-10">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Choose Exactly What Your Business Needs
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2">
                  Select an individual specialized platform or domain solution with transparent, predictable licensing.
                </p>
              </div>

              {/* Category Filter Pills */}
              <CategoryFilter
                activeCategory={category}
                onChange={setCategory}
              />

              {/* Products & Approved Tiers Grid */}
              <StandaloneProductsGrid
                category={category}
                billingPeriod={billingPeriod}
                onBillingPeriodChange={setBillingPeriod}
              />
            </div>
          )}

          {purchasingPath === "suite" && (
            <SuitePricingGrid
              billingPeriod={billingPeriod}
              onBillingPeriodChange={setBillingPeriod}
            />
          )}

          {purchasingPath === "complete" && (
            <ZakeemCompleteSection />
          )}

          {purchasingPath === "services" && (
            <ServicesMatrix />
          )}
        </div>
      </section>

      {/* 3. INTERACTIVE STACK BUILDER */}
      <StackBuilder />

      {/* 4. ENTERPRISE ASSURANCE & SOVEREIGN GOVERNANCE */}
      <section className="py-16 bg-[#040e1d] border-b border-white/10 relative" data-surface="dark">
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

      {/* 5. ENTERPRISE PROCUREMENT & LICENSING FAQS */}
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

      {/* 6. CONSULTATION CTA */}
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
              data-analytics-id="pricing-bottom-rfp-cta"
              rightIcon={<PhoneCall className="w-4 h-4" />}
            >
              Schedule Commercial Briefing
            </Button>
            <Button
              variant="outline"
              size="lg"
              href="/request-demo"
              data-analytics-id="pricing-bottom-demo-cta"
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
