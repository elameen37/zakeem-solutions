import React from "react";
import { SEO } from "@/components/seo/SEO";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProductCard } from "@/components/ui/ProductCard";
import { CTASection } from "@/components/ui/CTASection";
import { ZAKEEM_APPLICATIONS } from "@/data/ecosystem";

export const ProductsIndexPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Product Ecosystem — Zakeem Solutions"
        description="Explore the Zakeem suite of digital products and enterprise platforms, led by Zakeem Realty ERP, Cortex AI, Flow, and Vault."
        canonical="https://www.zakeemsolutions.com/products"
      />

      <section className="pt-12 pb-20 md:pt-20 md:pb-28 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <SectionHeader
            badge="Product Ecosystem"
            title="Sovereign Digital Products."
            highlightedWord="Enterprise Grade."
            description="Our software products are engineered to solve core operational, transactional, and intelligence bottlenecks across high-growth African and emerging market sectors."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {ZAKEEM_APPLICATIONS.map((app) => (
              <ProductCard key={app.id} product={app} featured={app.featured} />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        badge="Product Integration"
        title="Need a Custom Product Implementation?"
        description="Our product engineering teams configure and deploy dedicated tenant clusters for your enterprise with custom business logic and integrations."
      />
    </>
  );
};
