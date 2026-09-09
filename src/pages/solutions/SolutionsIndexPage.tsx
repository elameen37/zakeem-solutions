import React from "react";
import { SEO } from "@/components/seo/SEO";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SolutionCard } from "@/components/ui/SolutionCard";
import { CTASection } from "@/components/ui/CTASection";
import { SOLUTIONS } from "@/data/solutions";

export const SolutionsIndexPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Industry Solutions — Zakeem Solutions"
        description="Explore how Zakeem Solutions transforms 10 critical industries through bespoke software engineering, enterprise ERP, and AI-driven automation."
        canonical="https://www.zakeemsolutions.com/solutions"
      />

      <section className="pt-12 pb-20 md:pt-20 md:pb-28 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <SectionHeader
            badge="Industry Transformation"
            title="Strategic Technology Tailored for"
            highlightedWord="10 Core Sectors."
            description="From sovereign government registry digitization and banking settlement backbones to real estate lifecycle management, explore our domain solutions."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {SOLUTIONS.map((sol) => (
              <SolutionCard key={sol.id} solution={sol} />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        badge="Custom Sector Engagement"
        title="Don't See Your Specific Industry Architecture?"
        description="Our systems architects design bespoke digital infrastructure tailored to unusual compliance, cross-border regulatory, or distributed operational environments."
      />
    </>
  );
};
