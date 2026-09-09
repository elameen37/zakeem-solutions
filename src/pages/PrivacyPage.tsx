import React from "react";
import { SEO } from "@/components/seo/SEO";

export const PrivacyPage: React.FC = () => {
  return (
    <>
      <SEO title="Privacy Policy — Zakeem Solutions" canonical="https://www.zakeemsolutions.com/privacy" />
      <section className="py-20 container mx-auto px-4 md:px-6 max-w-4xl">
        <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>Effective Date: September 2026. Zakeem Solutions is committed to protecting the privacy and security of enterprise client data in full compliance with the Nigeria Data Protection Act (NDPA), NDPR, and global GDPR standards.</p>
          <p>We do not sell customer or corporate telemetry data. All enterprise data processed through Zakeem Realty ERP and related platforms remains strictly under the cryptographic control of the subscribing institution.</p>
        </div>
      </section>
    </>
  );
};
