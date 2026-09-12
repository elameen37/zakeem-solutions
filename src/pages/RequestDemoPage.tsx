import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  normalizeCommercialParams,
  getCommercialContextSummary,
  getAttributionContext,
} from "@/lib/leadContext";
import {
  validateFullName,
  validateEmail,
  validateCompany,
  validatePhone,
  ValidationErrors,
} from "@/lib/leadValidation";
import { submitLead, generateLeadReferenceId } from "@/lib/leadSubmission";
import { LeadSubmissionPayload, SubmissionResult } from "@/types/lead";

export const RequestDemoPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const commercialParams = normalizeCommercialParams(searchParams);
  const contextSummary = getCommercialContextSummary(commercialParams);

  const getInitialInterest = () => {
    if (commercialParams.product) return commercialParams.product;
    if (commercialParams.suite) return "zakeem-realty-erp";
    if (commercialParams.tier) return "zakeem-realty-erp";
    return "zakeem-realty-erp";
  };

  const getInitialDeployment = (): "cloud" | "private-vpc" | "on-premise" => {
    if (
      commercialParams.deployment === "private-vpc" ||
      commercialParams.deployment === "on-premise"
    ) {
      return commercialParams.deployment;
    }
    return "cloud";
  };

  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [interest, setInterest] = useState(getInitialInterest());
  const [deploymentType, setDeploymentType] = useState<
    "cloud" | "private-vpc" | "on-premise"
  >(getInitialDeployment());
  const [notes, setNotes] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Anti-spam trap

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    fullName: string;
    workEmail: string;
    company: string;
    jobTitle?: string;
    interest: string;
    deploymentType: string;
    contextSummary: string | null;
  } | null>(null);

  useEffect(() => {
    setInterest(getInitialInterest());
    setDeploymentType(getInitialDeployment());
  }, [
    commercialParams.product,
    commercialParams.tier,
    commercialParams.suite,
    commercialParams.deployment,
  ]);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let err: string | null = null;
    if (field === "fullName") err = validateFullName(fullName);
    if (field === "workEmail") err = validateEmail(workEmail);
    if (field === "company") err = validateCompany(company);
    if (field === "phone") err = validatePhone(phone);

    setErrors((prev) => ({ ...prev, [field]: err || undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameErr = validateFullName(fullName);
    const emailErr = validateEmail(workEmail);
    const companyErr = validateCompany(company);
    const phoneErr = validatePhone(phone);

    const newErrors: ValidationErrors = {
      fullName: nameErr || undefined,
      workEmail: emailErr || undefined,
      company: companyErr || undefined,
      phone: phoneErr || undefined,
    };

    if (nameErr || emailErr || companyErr || phoneErr) {
      setErrors(newErrors);
      setTouched({
        fullName: true,
        workEmail: true,
        company: true,
        phone: true,
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const referenceId = generateLeadReferenceId();
    const attribution = getAttributionContext(searchParams);

    const payload: LeadSubmissionPayload = {
      id: referenceId,
      submittedAt: new Date().toISOString(),
      identity: {
        fullName: fullName.trim(),
        workEmail: workEmail.trim(),
        company: company.trim(),
        phone: phone.trim() || undefined,
        jobTitle: jobTitle.trim() || undefined,
      },
      commercial: {
        formType: "demo",
        product: interest,
        tier: commercialParams.tier || undefined,
        suite: commercialParams.suite || undefined,
        billing: commercialParams.billing || undefined,
        deployment: deploymentType,
        service: commercialParams.service || undefined,
        selectedModules:
          commercialParams.modules.length > 0 ? commercialParams.modules : undefined,
      },
      attribution,
      notes: notes.trim() || undefined,
      consent: true,
      honeypot: honeypot.trim() || undefined,
    };

    const result = await submitLead(payload);
    setIsSubmitting(false);

    if (result.success) {
      setSubmittedData({
        fullName: fullName.trim(),
        workEmail: workEmail.trim(),
        company: company.trim(),
        jobTitle: jobTitle.trim() || undefined,
        interest,
        deploymentType,
        contextSummary,
      });
      setSubmissionResult(result);
    } else {
      setErrors({
        general: result.error || "Failed to schedule session. Please try again.",
      });
    }
  };

  const handleReset = () => {
    setSubmissionResult(null);
    setSubmittedData(null);
    setFullName("");
    setWorkEmail("");
    setCompany("");
    setPhone("");
    setJobTitle("");
    setNotes("");
    setHoneypot("");
    setErrors({});
    setTouched({});
  };

  const getInterestLabel = (val: string) => {
    switch (val) {
      case "zakeem-realty-erp": return "Zakeem Realty ERP (Available v2.4)";
      case "cortex-ai": return "Zakeem Cortex AI (Private Beta)";
      case "e-legal": return "e-Legal & Justice Platform";
      case "flow-procure": return "Zakeem Flow (Procurement Hub)";
      case "vault-pay": return "Zakeem Vault (Treasury & Settlement)";
      case "custom-software": return "Custom Software Engineering";
      case "cloud-infrastructure": return "Cloud Infrastructure & Security";
      case "enterprise-consulting": return "Strategic Technology Consulting";
      default: return val;
    }
  };

  const getDeploymentLabel = (val: string) => {
    switch (val) {
      case "private-vpc": return "Dedicated Private VPC";
      case "on-premise": return "On-Premise Appliance";
      default: return "Zakeem Managed Cloud";
    }
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
            {/* Left Context Panel */}
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
              {submissionResult && submittedData ? (
                <div className="text-center py-6 space-y-6">
                  <div className="w-14 h-14 rounded-full bg-[#e57804]/20 border border-[#e57804]/40 flex items-center justify-center mx-auto text-[#e57804]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Session Reserved
                    </div>
                    <h3 className="text-2xl font-bold text-white">Demo Request Received</h3>
                    <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                      Thank you, <span className="text-white font-semibold">{submittedData.fullName}</span>. A Senior Solutions Architect will reach out to <span className="text-[#e57804] font-mono">{submittedData.workEmail}</span> within 4 business hours to confirm your private session.
                    </p>
                  </div>

                  {/* Submission Summary Card */}
                  <div className="p-4 rounded-2xl bg-[#06152b] border border-white/10 text-left space-y-3 max-w-lg mx-auto">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                      <span className="text-slate-400">Reference ID:</span>
                      <span className="font-mono text-[#e57804] font-semibold tracking-wider">
                        {submissionResult.leadId}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Organization:</span>
                      <span className="text-white font-medium">{submittedData.company}</span>
                    </div>
                    {submittedData.jobTitle && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Role:</span>
                        <span className="text-slate-300">{submittedData.jobTitle}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Solution Scope:</span>
                      <span className="text-slate-200 font-medium">{getInterestLabel(submittedData.interest)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Deployment:</span>
                      <span className="text-slate-300">{getDeploymentLabel(submittedData.deploymentType)}</span>
                    </div>
                    {submittedData.contextSummary && (
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                        <span className="text-slate-400">Configuration:</span>
                        <span className="text-amber-400 font-medium text-right truncate max-w-[240px]">
                          {submittedData.contextSummary}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleReset}
                      className="w-full sm:w-auto"
                    >
                      Schedule Another Session
                    </Button>
                    <Link to="/pricing" className="w-full sm:w-auto">
                      <Button variant="primary" size="sm" className="w-full">
                        Explore Pricing & Plans <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <form
                  id="demo-form"
                  data-analytics-id="demo-form"
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-4"
                >
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

                  {/* Honeypot Field for Spam / Bot Mitigation (Hidden) */}
                  <div
                    style={{
                      position: "absolute",
                      left: "-9999px",
                      opacity: 0,
                      pointerEvents: "none",
                      height: 0,
                      overflow: "hidden",
                    }}
                    aria-hidden="true"
                  >
                    <label htmlFor="demo-fax-trap">Do not fill this field</label>
                    <input
                      id="demo-fax-trap"
                      type="text"
                      name="organization_fax"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="demo-full-name" className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        id="demo-full-name"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (touched.fullName) handleBlur("fullName");
                        }}
                        onBlur={() => handleBlur("fullName")}
                        placeholder="Dr. Ibrahim Adeleke"
                        aria-invalid={touched.fullName && !!errors.fullName}
                        aria-describedby={touched.fullName && errors.fullName ? "error-demo-name" : undefined}
                        className={cn(
                          "w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border text-sm text-white focus:outline-none transition-colors",
                          touched.fullName && errors.fullName
                            ? "border-rose-500/70 focus:border-rose-500"
                            : "border-white/10 focus:border-[#e57804]"
                        )}
                      />
                      {touched.fullName && errors.fullName && (
                        <p id="error-demo-name" role="alert" className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {errors.fullName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="demo-work-email" className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                        Corporate Work Email *
                      </label>
                      <input
                        id="demo-work-email"
                        type="email"
                        required
                        value={workEmail}
                        onChange={(e) => {
                          setWorkEmail(e.target.value);
                          if (touched.workEmail) handleBlur("workEmail");
                        }}
                        onBlur={() => handleBlur("workEmail")}
                        placeholder="i.adeleke@enterprise.com"
                        aria-invalid={touched.workEmail && !!errors.workEmail}
                        aria-describedby={touched.workEmail && errors.workEmail ? "error-demo-email" : undefined}
                        className={cn(
                          "w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border text-sm text-white focus:outline-none transition-colors",
                          touched.workEmail && errors.workEmail
                            ? "border-rose-500/70 focus:border-rose-500"
                            : "border-white/10 focus:border-[#e57804]"
                        )}
                      />
                      {touched.workEmail && errors.workEmail && (
                        <p id="error-demo-email" role="alert" className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {errors.workEmail}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="demo-company" className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                        Organization / Company *
                      </label>
                      <input
                        id="demo-company"
                        type="text"
                        required
                        value={company}
                        onChange={(e) => {
                          setCompany(e.target.value);
                          if (touched.company) handleBlur("company");
                        }}
                        onBlur={() => handleBlur("company")}
                        placeholder="e.g. Landmark Properties Group"
                        aria-invalid={touched.company && !!errors.company}
                        aria-describedby={touched.company && errors.company ? "error-demo-company" : undefined}
                        className={cn(
                          "w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border text-sm text-white focus:outline-none transition-colors",
                          touched.company && errors.company
                            ? "border-rose-500/70 focus:border-rose-500"
                            : "border-white/10 focus:border-[#e57804]"
                        )}
                      />
                      {touched.company && errors.company && (
                        <p id="error-demo-company" role="alert" className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {errors.company}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="demo-phone" className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                        Phone <span className="text-slate-500 normal-case">(Optional)</span>
                      </label>
                      <input
                        id="demo-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (touched.phone) handleBlur("phone");
                        }}
                        onBlur={() => handleBlur("phone")}
                        placeholder="+234 800 000 0000"
                        aria-invalid={touched.phone && !!errors.phone}
                        aria-describedby={touched.phone && errors.phone ? "error-demo-phone" : undefined}
                        className={cn(
                          "w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border text-sm text-white focus:outline-none transition-colors",
                          touched.phone && errors.phone
                            ? "border-rose-500/70 focus:border-rose-500"
                            : "border-white/10 focus:border-[#e57804]"
                        )}
                      />
                      {touched.phone && errors.phone && (
                        <p id="error-demo-phone" role="alert" className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="demo-interest" className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                        Primary Interest *
                      </label>
                      <select
                        id="demo-interest"
                        value={interest}
                        onChange={(e) => setInterest(e.target.value)}
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
                        value={deploymentType}
                        onChange={(e) =>
                          setDeploymentType(
                            e.target.value as "cloud" | "private-vpc" | "on-premise"
                          )
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804]"
                      >
                        <option value="cloud">Zakeem Managed Cloud</option>
                        <option value="private-vpc">Dedicated Private VPC</option>
                        <option value="on-premise">On-Premise Appliance</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="demo-job-title" className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                      Job Title / Role <span className="text-slate-500 normal-case">(Optional)</span>
                    </label>
                    <input
                      id="demo-job-title"
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Chief Technology Officer / Managing Director"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804]"
                    />
                  </div>

                  <div>
                    <label htmlFor="demo-notes" className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                      Scope & Requirements <span className="text-slate-500 normal-case">(Optional)</span>
                    </label>
                    <textarea
                      id="demo-notes"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Estimated user count, legacy systems in place, timeline..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804]"
                    />
                  </div>

                  {errors.general && (
                    <div
                      role="alert"
                      className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{errors.general}</span>
                    </div>
                  )}

                  {/* Privacy & Confidentiality Consent */}
                  <div className="pt-2 text-xs text-slate-400 leading-relaxed border-t border-white/10">
                    <p>
                      By submitting this request, you agree to our{" "}
                      <Link to="/privacy" className="text-[#e57804] hover:underline">
                        Privacy Policy
                      </Link>
                      . Your contact details are kept strictly confidential and used exclusively for scheduling your technical briefing.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                    data-analytics-id="demo-submit-cta"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Scheduling Briefing...
                      </span>
                    ) : (
                      "Confirm & Schedule Briefing"
                    )}
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
