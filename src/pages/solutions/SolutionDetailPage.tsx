import React from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CTASection } from "@/components/ui/CTASection";
import { SOLUTIONS } from "@/data/solutions";

export const SolutionDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const solution = SOLUTIONS.find((s) => s.slug === slug);

  if (!solution) {
    return <Navigate to="/solutions" replace />;
  }

  return (
    <>
      <SEO
        title={`${solution.title} — Zakeem Solutions`}
        description={solution.description}
        canonical={`https://www.zakeemsolutions.com/solutions/${solution.slug}`}
      />

      <section className="pt-12 pb-20 md:pt-16 md:pb-28 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <Link
            to="/solutions"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Solutions</span>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <Badge variant="neon">Industry Solution</Badge>
            <span className="text-xs font-mono text-slate-400">{solution.stats.label}: {solution.stats.value}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            {solution.title}
          </h1>

          <p className="text-base sm:text-lg font-mono text-[#e57804] mb-6">
            {solution.tagline}
          </p>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-10">
            {solution.description}
          </p>

          <div className="p-6 md:p-8 rounded-2xl bg-[#081c38] border border-white/15 mb-12">
            <h3 className="text-lg font-bold text-white mb-6">Core Transformation Capabilities:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {solution.capabilities.map((cap, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-[#e57804] shrink-0 mt-0.5" />
                  <span>{cap}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#e57804]/15 to-[#e57804]/10 border border-white/10 mb-10">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#e57804] mb-2">
              Transformational Impact
            </h4>
            <p className="text-sm md:text-base text-slate-200">
              {solution.transformationImpact}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="lg" href="/request-demo" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Request Solution Architecture Brief
            </Button>
            <Button variant="outline" size="lg" href="/contact">
              Speak with Sector Lead
            </Button>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
};
