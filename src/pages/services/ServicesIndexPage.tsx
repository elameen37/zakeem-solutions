import React from "react";
import { SEO } from "@/components/seo/SEO";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { CTASection } from "@/components/ui/CTASection";
import { SERVICES } from "@/data/services";

export const ServicesIndexPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Services & Engineering Practice — Zakeem Solutions"
        description="Comprehensive technology services: Software Engineering, AI & Automation, Enterprise ERP Systems, Cloud Infrastructure, Cybersecurity, and Strategic Consulting."
        canonical="https://www.zakeemsolutions.com/services"
      />

      <section className="pt-12 pb-20 md:pt-20 md:pb-28 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <SectionHeader
            badge="Engineering & Advisory"
            title="World-Class Services."
            highlightedWord="Mathematical Delivery."
            description="Our engineering pods and advisory teams partner with enterprise leaders, CTOs, and public institutions to design, build, and run mission-critical digital systems."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {SERVICES.map((svc) => (
              <ServiceCard key={svc.id} service={svc} />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        badge="Engineering Pod Engagement"
        title="Looking for an Elite Dedicated Engineering Team?"
        description="Deploy senior full-stack pods, DevOps specialists, and AI engineers directly integrated with your enterprise roadmap."
      />
    </>
  );
};
