import React from "react";
import { SEO } from "@/components/seo/SEO";

export const TermsPage: React.FC = () => {
  return (
    <>
      <SEO title="Terms of Service — Zakeem Solutions" canonical="https://www.zakeemsolutions.com/terms" />
      <section className="py-20 container mx-auto px-4 md:px-6 max-w-4xl">
        <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>Effective Date: September 2026. These Terms of Service govern the usage of the Zakeem Solutions corporate website (www.zakeemsolutions.com) and access points to Zakeem proprietary software platforms.</p>
          <p>Enterprise subscription contracts, Master Service Agreements (MSAs), and dedicated Service Level Agreements (SLAs) take precedence over general public website terms for authenticated software users.</p>
        </div>
      </section>
    </>
  );
};
