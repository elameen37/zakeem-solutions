import React from "react";
import { SEO } from "@/components/seo/SEO";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/ui/CTASection";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

export const CaseStudiesPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Case Studies & Enterprise Deployments — Zakeem Solutions"
        description="Review documented client outcomes, architecture transformations, and deployment metrics."
        canonical="https://www.zakeemsolutions.com/case-studies"
      />
      <section className="pt-12 pb-20 md:pt-20 md:pb-28 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <SectionHeader
            badge="Client Impact"
            title="Documented Outcomes."
            highlightedWord="Enterprise Proof."
            description="How Zakeem Solutions delivers tangible speed, financial reconciliation accuracy, and scale for institutional clients."
          />
          <div className="p-8 md:p-12 rounded-3xl bg-[#081c38] border border-white/15 space-y-6 mt-12">
            <Badge variant="neon">Flagship Case Study</Badge>
            <h3 className="text-2xl md:text-3xl font-bold text-white">
              Tier-1 Real Estate Development Conglomerate
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Consolidated 18 disconnected Excel sales sheets, 4 disparate property management tools, and manual bank reconciliation into a single unified deployment of <strong className="text-white">Zakeem Realty ERP</strong>.
            </p>
            <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-black/40 border border-white/5 text-center font-mono">
              <div>
                <div className="text-2xl font-bold text-[#e57804]">
                  <AnimatedNumber value="100%" />
                </div>
                <div className="text-xs text-slate-400">Elimination of Double-Allocation</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#e57804]">
                  <AnimatedNumber value="3.4x" />
                </div>
                <div className="text-xs text-slate-400">Faster Installment Collection</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  <AnimatedNumber value="₦12B+" />
                </div>
                <div className="text-xs text-slate-400">Transactions Reconciled</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <CTASection />
    </>
  );
};
