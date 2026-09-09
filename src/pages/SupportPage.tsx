import React from "react";
import { LifeBuoy, Mail, MessageSquare, Phone } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const SupportPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Enterprise Support & Service Desk — Zakeem Solutions"
        description="Dedicated client support, SLA escalation, and incident reporting for Zakeem platform subscribers."
        canonical="https://www.zakeemsolutions.com/support"
      />
      <section className="pt-12 pb-20 md:pt-20 md:pb-28 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <SectionHeader
            badge="Client Care"
            title="Enterprise Service Desk &"
            highlightedWord="SLA Support."
            description="Our round-the-clock site reliability engineering and product support team guarantees rapid incident triage."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="p-6 rounded-2xl bg-[#081c38] border border-white/10">
              <LifeBuoy className="w-8 h-8 text-[#e57804] mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Zakeem Realty ERP Support</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Assistance with tenant portal onboarding, accounting reconciliation, or user permission settings.
              </p>
              <a href="mailto:support@zakeemsolutions.com" className="text-xs font-mono text-[#e57804]">
                support@zakeemsolutions.com
              </a>
            </div>
            <div className="p-6 rounded-2xl bg-[#081c38] border border-white/10">
              <MessageSquare className="w-8 h-8 text-[#e57804] mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Emergency Incident Escalation</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Dedicated direct hotline for tier-1 enterprises with active 99.99% mission-critical SLAs.
              </p>
              <span className="text-xs font-mono text-slate-400">Available 24/7/365 to designated account managers.</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
