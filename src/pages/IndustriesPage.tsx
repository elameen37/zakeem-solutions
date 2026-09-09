import React from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/seo/SEO";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SolutionCard } from "@/components/ui/SolutionCard";
import { CTASection } from "@/components/ui/CTASection";
import { SOLUTIONS } from "@/data/solutions";

export const IndustriesPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Industries — Zakeem Solutions"
        description="Comprehensive overview of African and emerging market industries empowered by Zakeem Solutions digital platforms."
        canonical="https://www.zakeemsolutions.com/industries"
      />
      <section className="pt-12 pb-20 md:pt-20 md:pb-28 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <SectionHeader
            badge="Sectors & Markets"
            title="Strategic Industry"
            highlightedWord="Footprint."
            description="Explore our specialized digital transformations across regulated, infrastructure-heavy, and transactional verticals."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {SOLUTIONS.map((sol) => (
              <SolutionCard key={sol.id} solution={sol} />
            ))}
          </div>
        </div>
      </section>
      <CTASection />
    </>
  );
};
