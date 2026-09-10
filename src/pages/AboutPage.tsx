import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Cpu, Globe, Target, Award, Users, CheckCircle2 } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/ui/CTASection";

export const AboutPage: React.FC = () => {
  return (
    <>
      <SEO
        title="About Zakeem Solutions — Technology • Intelligence • Delivery"
        description="Zakeem Solutions is an enterprise technology and digital transformation company delivering mission-critical software engineering, AI-powered systems, and digital infrastructure across Africa."
        canonical="https://www.zakeemsolutions.com/about"
      />

      <section className="pt-12 pb-20 md:pt-20 md:pb-28 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="flex justify-center mb-4">
              <Badge variant="neon">Company Overview</Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-950 dark:text-white tracking-tight mb-6">
              Engineering Africa's Most Consequential{" "}
              <span className="bg-gradient-to-r from-slate-950 via-amber-700 to-[#e57804] dark:from-white dark:via-amber-200 dark:to-[#e57804] bg-clip-text text-transparent">
                Digital Infrastructure.
              </span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Zakeem Solutions exists to build high-trust software and AI platforms capable of operating at national and continental scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div data-surface="dark" className="p-6 rounded-2xl bg-[#081c38] border border-white/10">
              <h3 className="text-lg font-bold text-white mb-2">Technology</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We believe software in emerging markets must be engineered with higher reliability and stronger fault-tolerance than anywhere else in the world.
              </p>
            </div>
            <div data-surface="dark" className="p-6 rounded-2xl bg-[#081c38] border border-white/10">
              <h3 className="text-lg font-bold text-white mb-2">Intelligence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Artificial intelligence is not a novelty; it is an economic force multiplier that bridges operational deficits and scales institutional decision-making.
              </p>
            </div>
            <div data-surface="dark" className="p-6 rounded-2xl bg-[#081c38] border border-white/10">
              <h3 className="text-lg font-bold text-white mb-2">Delivery</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Strategy without mathematical execution is friction. We hold a relentless standard for on-time, zero-defect software deployment.
              </p>
            </div>
          </div>

          <div data-surface="dark" className="p-8 md:p-12 rounded-3xl bg-[#081c38] border border-white/15 space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Our Strategic Dual Identity</h2>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Unlike traditional IT agencies that resell third-party platforms, or pure-play SaaS startups lacking enterprise integration capabilities, Zakeem Solutions is intentionally structured as both:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-base font-bold text-white mb-2">1. An Enterprise Services Practice</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Partnering directly with boards, ministries, and enterprise CTOs to architect custom cores, lead legacy modernization, and enforce strict cybersecurity postures.
                </p>
              </div>
              <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-base font-bold text-white mb-2">2. A Product Engineering Lab</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Building deep vertical platforms such as Zakeem Realty ERP, Cortex AI, and Flow Procure that solve structural market bottlenecks across African real estate, trade, and logistics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
};
