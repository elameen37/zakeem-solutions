import React from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, Code2, Layers, CheckCircle2, ArrowRight 
} from "lucide-react";
import { Badge } from "./Badge";
import { Button } from "./Button";

export const HomeValueSummary: React.FC = () => {
  const valuePillars = [
    {
      icon: ShieldCheck,
      iconColor: "text-[#e57804]",
      iconBg: "bg-[#e57804]/10 border-[#e57804]/30",
      title: "Sovereign Single-Tenant Architecture",
      alternativeContext: "Vs. Fragmented Multi-SaaS Subscriptions",
      description:
        "Zero multi-tenant data exposure, full source code escrow, and complete sovereign deployment across private bare-metal or sovereign cloud data centers.",
    },
    {
      icon: Code2,
      iconColor: "text-amber-300",
      iconBg: "bg-amber-500/10 border-amber-500/30",
      title: "Direct Senior Engineering Pods",
      alternativeContext: "Vs. Traditional Agency Outsourcing",
      description:
        "Senior principal systems architects and domain engineers embedded directly in your roadmap — eliminating trial-and-error agency code, junior turnover, and scope creep.",
    },
    {
      icon: Layers,
      iconColor: "text-[#e57804]",
      iconBg: "bg-[#e57804]/10 border-[#e57804]/30",
      title: "High-Consequence Domain Systems",
      alternativeContext: "Vs. Multi-Year Legacy Monoliths",
      description:
        "Production-grade microservices and event meshes tailored for African regulatory, logistics, and banking switches without multi-year deployment delays or vendor lock-in.",
    },
    {
      icon: CheckCircle2,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/30",
      title: "Guaranteed Delivery & Mathematical SLAs",
      alternativeContext: "Vs. Building Internally From Scratch",
      description:
        "99.99% mission-critical uptime guarantee, fixed milestone disbursements, and continuous automated verification without diverting core executive management focus.",
    },
  ];

  return (
    <section
      id="why-zakeem"
      data-surface="dark"
      className="py-16 lg:py-24 bg-[#040e1d] border-t border-white/10 relative overflow-hidden"
      aria-label="Why Enterprise Leaders Partner with Zakeem"
    >
      {/* Subtle Background Glow */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[300px] bg-[#e57804]/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="neon" className="mb-3">
            Strategic Value Assessment
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Why Enterprise Leaders{" "}
            <span className="bg-gradient-to-r from-white via-amber-200 to-[#e57804] bg-clip-text text-transparent">
              Partner with Zakeem.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300 mt-4 leading-relaxed">
            True enterprise software value is measured in business outcomes, zero transactional loss, and sovereign scalability — not upfront sticker price.
          </p>
        </div>

        {/* 4 Core Strategic Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {valuePillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-6 md:p-8 rounded-2xl bg-gradient-to-b from-[#081c38] to-[#040e1d] border border-white/10 hover:border-[#e57804]/50 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-11 h-11 rounded-xl border flex items-center justify-center ${pillar.iconBg}`}
                    >
                      <Icon className={`w-5 h-5 ${pillar.iconColor}`} />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      {pillar.alternativeContext}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-amber-200 transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Executive Continuation Bar */}
        <div className="p-6 md:p-8 rounded-2xl bg-[#06152b] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white">
              Want to review the complete dimension-by-dimension comparison?
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Explore our full structural comparison against multi-SaaS, traditional agencies, legacy monoliths, and internal builds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              href="/about#value-comparison"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="flex-1 sm:flex-none text-white border-white/20 hover:border-[#e57804] hover:bg-white/10"
              data-analytics-id="home-value-read-full-story-cta"
            >
              Read the Full Story
            </Button>
            <Button
              variant="primary"
              size="md"
              href="/request-demo"
              className="flex-1 sm:flex-none"
              data-analytics-id="home-value-request-demo-cta"
            >
              Request a Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
