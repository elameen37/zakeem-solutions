import React from "react";
import { ArrowDown, PhoneCall, ShieldCheck, CheckCircle2, Lock, Landmark } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface PricingHeroProps {
  onExplorePlans: () => void;
}

export const PricingHero: React.FC<PricingHeroProps> = ({ onExplorePlans }) => {
  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 border-b border-white/10 overflow-hidden">
      {/* Ambient Radial Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-[#e57804]/20 via-[#06152b]/10 to-transparent rounded-full blur-[130px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <Badge variant="neon">Commercial Architecture • Nigeria & Pan-Africa</Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-[1.12] mb-6">
            Powerful software.{" "}
            <span className="bg-gradient-to-r from-slate-950 via-amber-700 to-[#e57804] dark:from-white dark:via-amber-200 dark:to-[#e57804] bg-clip-text text-transparent">
              Pricing that grows with you.
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto mb-8">
            Deploy an individual high-impact product, consolidate operations under a multi-product business suite, or engage an elite dedicated engineering pod. Predictable investments in Nigerian Naira with zero hidden seat penalties.
          </p>

          {/* Primary & Secondary Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12">
            <Button
              variant="primary"
              size="lg"
              onClick={onExplorePlans}
              rightIcon={<ArrowDown className="w-4 h-4" />}
            >
              Explore Plans
            </Button>
            <Button
              variant="outline"
              size="lg"
              href="/contact?type=commercial-advisory"
              rightIcon={<PhoneCall className="w-4 h-4" />}
            >
              Talk to Sales
            </Button>
          </div>

          {/* Trust & Transparency Value Pillars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-4 text-left">
            <div className="p-3.5 rounded-2xl bg-[#081c38]/60 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-[#e57804] mb-1">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold text-white font-mono">Zero Seat Penalties</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Transparent scale limits without surprise per-user billing spikes.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#081c38]/60 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-amber-300 mb-1">
                <Landmark className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold text-white font-mono">Nigeria-First NGN</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Denominated in Naira with direct institutional bank treasury rails.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#081c38]/60 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold text-white font-mono">Contractual SLAs</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                99.9% to 99.99% high-availability guarantees with dedicated SRE pods.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#081c38]/60 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <Lock className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold text-white font-mono">Sovereignty & VPC</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Air-gapped on-premise, sovereign GovCloud, or isolated private cloud.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
