import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, ShieldCheck, ArrowRight, Building2, Calendar, Sparkles } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const RequestDemoPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const productParam = searchParams.get("product") || searchParams.get("interest");
  const tierParam = searchParams.get("tier");
  const suiteParam = searchParams.get("suite");
  const billingParam = searchParams.get("billing");

  const getInitialInterest = () => {
    if (suiteParam) return "zakeem-realty-erp";
    if (!productParam && !tierParam) return "zakeem-realty-erp";
    const p = (productParam || "").toLowerCase();
    const t = (tierParam || "").toLowerCase();
    if (p.includes("cortex")) return "cortex-ai";
    if (p.includes("legal")) return "e-legal";
    if (p.includes("flow")) return "flow-procure";
    if (p.includes("vault")) return "vault-pay";
    if (p.includes("realty") || t.includes("realty")) return "zakeem-realty-erp";
    return "zakeem-realty-erp";
  };

  const getContextSummary = () => {
    const parts: string[] = [];
    if (suiteParam) {
      if (suiteParam.includes("growth")) parts.push("Growth Business Suite");
      else if (suiteParam.includes("scale") || suiteParam.includes("enterprise")) parts.push("Enterprise Business Suite");
      else parts.push(`Suite: ${suiteParam}`);
    } else if (tierParam) {
      if (tierParam.includes("starter")) parts.push("Realty ERP Starter Tier");
      else if (tierParam.includes("growth")) parts.push("Realty ERP Growth Tier");
      else if (tierParam.includes("business")) parts.push("Realty ERP Business Tier");
      else if (tierParam.includes("enterprise")) parts.push("Realty ERP Enterprise Tier");
      else parts.push(`Tier: ${tierParam}`);
    } else if (productParam) {
      if (productParam.includes("cortex")) parts.push("Zakeem Cortex AI Early Access");
      else if (productParam.includes("legal")) parts.push("e-Legal & Justice Platform");
      else if (productParam.includes("flow")) parts.push("Zakeem Flow Briefing");
      else if (productParam.includes("vault")) parts.push("Zakeem Vault Briefing");
      else if (productParam.includes("realty")) parts.push("Zakeem Realty ERP Platform");
    }
    if (billingParam) {
      parts.push(`${billingParam.charAt(0).toUpperCase() + billingParam.slice(1)} Commitment`);
    }
    return parts.length > 0 ? parts.join(" • ") : null;
  };

  const contextSummary = getContextSummary();

  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    workEmail: "",
    company: "",
    interest: getInitialInterest(),
    deploymentType: "cloud",
    notes: ""
  });

  useEffect(() => {
    const matched = getInitialInterest();
    setFormData((prev) => ({ ...prev, interest: matched }));
  }, [productParam, tierParam]);

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
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight">
                Request a Confidential Technical Walkthrough.
              </h1>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Connect directly with a Lead Solutions Architect. We will tailor the session around your organization’s specific workflows, data schemas, and security requirements.
              </p>

              <div className="space-y-3.5 pt-4">
                <div className="flex items-start gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-[#e57804] shrink-0 mt-0.5" />
                  <span>Live demonstration of Zakeem Realty ERP or AI models</span>
                </div>
                <div className="flex items-start gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-[#e57804] shrink-0 mt-0.5" />
                  <span>Architecture, cloud VPC, and security review</span>
                </div>
                <div className="flex items-start gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-[#e57804] shrink-0 mt-0.5" />
                  <span>Custom migration and pricing roadmap</span>
                </div>
              </div>
            </div>

            {/* Right Form Card */}
            <div data-surface="dark" className="lg:col-span-7 p-8 md:p-10 rounded-3xl bg-[#081c38] border border-white/15 shadow-2xl">
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
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">Schedule Session</h3>
                    <span className="text-xs font-mono text-emerald-400/90 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Slots Open
                    </span>
                  </div>

                  {contextSummary && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#e57804] text-white font-bold shrink-0">
                        Selection
                      </span>
                      <p className="text-xs text-slate-300">
                        Pre-configured for: <span className="text-white font-medium">{contextSummary}</span>
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="demo-full-name" className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        id="demo-full-name"
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Dr. Ibrahim Adeleke"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804]"
                      />
                    </div>
                    <div>
                      <label htmlFor="demo-work-email" className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                        Corporate Work Email *
                      </label>
                      <input
                        id="demo-work-email"
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
                    <label htmlFor="demo-company" className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                      Organization / Company *
                    </label>
                    <input
                      id="demo-company"
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
                      <label htmlFor="demo-interest" className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                        Primary Interest *
                      </label>
                      <select
                        id="demo-interest"
                        value={formData.interest}
                        onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804]"
                      >
                        <option value="zakeem-realty-erp">Zakeem Realty ERP (Available v2.4)</option>
                        <option value="cortex-ai">Zakeem Cortex AI (Private Beta)</option>
                        <option value="e-legal">e-Legal & Justice Systems (Active Solution)</option>
                        <option value="flow-procure">Zakeem Flow (Procurement Hub)</option>
                        <option value="vault-pay">Zakeem Vault (Treasury & Settlement)</option>
                        <option value="custom-software">Custom Software Engineering</option>
                        <option value="cloud-infrastructure">Cloud Infrastructure & Security</option>
                        <option value="enterprise-consulting">Strategic Technology Consulting</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="demo-deployment" className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                        Deployment Model
                      </label>
                      <select
                        id="demo-deployment"
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
                    <label htmlFor="demo-notes" className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                      Scope & Requirements (Optional)
                    </label>
                    <textarea
                      id="demo-notes"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Estimated user count, legacy systems in place, timeline..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804]"
                    />
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    className="w-full"
                    data-analytics-id="demo-submit-cta"
                  >
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
