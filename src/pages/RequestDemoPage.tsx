import React, { useState } from "react";
import { CheckCircle2, ShieldCheck, ArrowRight, Building2, Calendar } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const RequestDemoPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    workEmail: "",
    company: "",
    interest: "zakeem-realty-erp",
    deploymentType: "cloud",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <SEO
        title="Request a Confidential Enterprise Demo — Zakeem Solutions"
        description="Schedule a technical architecture walkthrough of Zakeem Realty ERP or our enterprise software and AI solutions."
        canonical="https://www.zakeemsolutions.com/request-demo"
      />

      <section className="pt-12 pb-20 md:pt-20 md:pb-28 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Context */}
            <div className="lg:col-span-5 space-y-6">
              <Badge variant="neon">Enterprise Briefing</Badge>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Request a Confidential Technical Walkthrough.
              </h1>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed">
                Connect directly with a Lead Solutions Architect. We will tailor the session around your organization’s specific workflows, data schemas, and security requirements.
              </p>

              <div className="space-y-3.5 pt-4">
                <div className="flex items-start gap-3 text-xs md:text-sm text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-[#e57804] shrink-0 mt-0.5" />
                  <span>Live demonstration of Zakeem Realty ERP or AI models</span>
                </div>
                <div className="flex items-start gap-3 text-xs md:text-sm text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-[#e57804] shrink-0 mt-0.5" />
                  <span>Architecture, cloud VPC, and security review</span>
                </div>
                <div className="flex items-start gap-3 text-xs md:text-sm text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-[#e57804] shrink-0 mt-0.5" />
                  <span>Custom migration and pricing roadmap</span>
                </div>
              </div>
            </div>

            {/* Right Form Card */}
            <div className="lg:col-span-7 p-8 md:p-10 rounded-3xl bg-[#081c38] border border-white/15 shadow-2xl">
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#e57804]/20 border border-[#e57804]/40 flex items-center justify-center mx-auto text-[#e57804]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Demo Request Received</h3>
                  <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                    Thank you, <span className="text-white font-semibold">{formData.fullName}</span>. A Senior Solutions Architect will reach out to <span className="text-[#e57804] font-mono">{formData.workEmail}</span> within 4 business hours to confirm your private session.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-2">Schedule Session</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Dr. Ibrahim Adeleke"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                        Corporate Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.workEmail}
                        onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                        placeholder="i.adeleke@enterprise.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                      Organization / Company *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. Landmark Properties Group"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                        Primary Interest *
                      </label>
                      <select
                        value={formData.interest}
                        onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804]"
                      >
                        <option value="zakeem-realty-erp">Zakeem Realty ERP</option>
                        <option value="cortex-ai">Zakeem Cortex AI</option>
                        <option value="custom-software">Custom Software Engineering</option>
                        <option value="cloud-infrastructure">Cloud & Cybersecurity</option>
                        <option value="enterprise-consulting">Technology Consulting</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                        Deployment Model
                      </label>
                      <select
                        value={formData.deploymentType}
                        onChange={(e) => setFormData({ ...formData, deploymentType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804]"
                      >
                        <option value="cloud">Zakeem Managed Cloud</option>
                        <option value="private-vpc">Dedicated Private VPC</option>
                        <option value="on-premise">On-Premise Appliance</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                      Scope & Requirements (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Briefly describe your current systems, scale, and expected timeline..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804]"
                    />
                  </div>

                  <Button variant="primary" size="lg" type="submit" className="w-full">
                    Confirm & Schedule Briefing
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
