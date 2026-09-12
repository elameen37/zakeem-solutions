import React from "react";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { Button } from "./Button";
import { Badge } from "./Badge";

interface CTASectionProps {
  badge?: string;
  title?: string;
  description?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({
  badge = "Enterprise Partnership",
  title = "Ready to Build High-Consequence Digital Infrastructure?",
  description = "Partner with Zakeem Solutions to engineer mission-critical enterprise systems, deploy domain AI workflows, or integrate the flagship Zakeem Realty ERP platform.",
  primaryCtaText = "Request a Confidential Demo",
  primaryCtaLink = "/request-demo",
  secondaryCtaText = "Talk to Our Solutions Architect",
  secondaryCtaLink = "/contact"
}) => {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#e57804]/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#e57804]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-6xl">
        <div data-surface="dark" className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#0b1e3b] to-[#040e1d] p-8 md:p-14 lg:p-16 text-center shadow-2xl relative overflow-hidden">

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <Badge variant="neon">
                {badge}
              </Badge>
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
              {title}
            </h2>

            <p className="text-base md:text-lg text-slate-200 font-normal leading-relaxed mb-10">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                href={primaryCtaLink}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
                data-analytics-id="global-cta-primary"
              >
                {primaryCtaText}
              </Button>
              <Button
                variant="outline"
                size="lg"
                href={secondaryCtaLink}
                className="w-full sm:w-auto text-white border-white/20 hover:border-[#e57804] hover:bg-white/10"
                data-analytics-id="global-cta-secondary"
              >
                {secondaryCtaText}
              </Button>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-8 text-xs font-mono text-slate-300">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#e57804]" />
                Engineered to ISO 27001 & NDPR Standards
              </span>
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#e57804]" />
                Guaranteed 99.99% Core System SLA
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};