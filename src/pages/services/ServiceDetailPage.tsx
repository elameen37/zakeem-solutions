import React from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ArrowRight, Code2, Terminal } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CTASection } from "@/components/ui/CTASection";
import { SERVICES } from "@/data/services";

export const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const service = SERVICES.find((s) => s.slug === slug);

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  return (
    <>
      <SEO
        title={`${service.title} Practice — Zakeem Solutions`}
        description={service.description}
        canonical={`https://www.zakeemsolutions.com/services/${service.slug}`}
      />

      <section className="pt-12 pb-20 md:pt-16 md:pb-28 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Services</span>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <Badge variant="blue">Engineering Practice</Badge>
            <span className="text-xs font-mono text-slate-400">{service.engagementModel}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            {service.title}
          </h1>

          <p className="text-base sm:text-lg font-mono text-[#e57804] mb-6">
            {service.tagline}
          </p>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-10">
            {service.description}
          </p>

          {/* Deliverables */}
          <div className="p-6 md:p-8 rounded-2xl bg-[#081c38] border border-white/15 mb-10">
            <h3 className="text-lg font-bold text-white mb-6">Key Engineering Deliverables:</h3>
            <div className="space-y-3">
              {service.deliverables.map((deliv, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-[#e57804] shrink-0 mt-0.5" />
                  <span>{deliv}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack Matrix */}
          <div className="p-6 rounded-2xl bg-[#040e1d] border border-white/10 mb-10">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4">
              Core Technologies & Tooling:
            </h4>
            <div className="flex flex-wrap gap-2">
              {service.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="lg" href="/request-demo" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Initiate Project Scoping
            </Button>
            <Button variant="outline" size="lg" href="/contact">
              Talk to Engineering Lead
            </Button>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
};
