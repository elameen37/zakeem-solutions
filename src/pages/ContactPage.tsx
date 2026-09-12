import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Globe,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { COMPANY_CONTACT, SOCIAL_LINKS } from "@/data/social";
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
  validateMessage,
  ValidationErrors,
} from "@/lib/leadValidation";
import { submitLead, generateLeadReferenceId } from "@/lib/leadSubmission";
import { LeadSubmissionPayload, SubmissionResult } from "@/types/lead";

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={cn("fill-current", className)} aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TikTokIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={cn("fill-current", className)} aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.33a6.33 6.33 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 0 0 0 6.33-6.34V8.71a8.18 8.18 0 0 0 4.78 1.52v-3.4a4.85 4.85 0 0 1-1-.14z" />
  </svg>
);

const getSocialIcon = (iconName: string) => {
  const props = { className: "w-4 h-4 text-slate-300 group-hover:text-[#e57804] transition-colors" };
  switch (iconName) {
    case "Linkedin": return <Linkedin {...props} />;
    case "X": return <XIcon {...props} />;
    case "Instagram": return <Instagram {...props} />;
    case "Facebook": return <Facebook {...props} />;
    case "TikTok": return <TikTokIcon {...props} />;
    case "YouTube": return <Youtube {...props} />;
    case "Youtube": return <Youtube {...props} />;
    default: return <Globe {...props} />;
  }
};

export const ContactPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const commercialParams = normalizeCommercialParams(searchParams);
  const contextSummary = getCommercialContextSummary(commercialParams);

  const getInitialCategory = () => {
    if (commercialParams.type === "custom-stack") return "custom-stack";
    if (
      commercialParams.type === "commercial-advisory" ||
      commercialParams.type === "zakeem-complete" ||
      commercialParams.type === "institutional-suite"
    ) {
      return "commercial-advisory";
    }
    if (
      commercialParams.type?.includes("roadmap") ||
      commercialParams.type?.includes("brief")
    ) {
      return "product-briefing";
    }
    if (
      commercialParams.solution ||
      commercialParams.service ||
      commercialParams.type?.includes("consulting") ||
      commercialParams.type?.includes("rfp")
    ) {
      return "strategic-consulting";
    }
    return "general-inquiry";
  };

  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState(getInitialCategory());
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Anti-bot trap

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    fullName: string;
    workEmail: string;
    company: string;
    category: string;
    contextSummary: string | null;
  } | null>(null);

  useEffect(() => {
    setCategory(getInitialCategory());
  }, [
    commercialParams.type,
    commercialParams.product,
    commercialParams.solution,
    commercialParams.service,
  ]);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let err: string | null = null;
    if (field === "fullName") err = validateFullName(fullName);
    if (field === "workEmail") err = validateEmail(workEmail);
    if (field === "company") err = validateCompany(company);
    if (field === "phone") err = validatePhone(phone);
    if (field === "message") err = validateMessage(message);

    setErrors((prev) => ({ ...prev, [field]: err || undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameErr = validateFullName(fullName);
    const emailErr = validateEmail(workEmail);
    const companyErr = validateCompany(company);
    const phoneErr = validatePhone(phone);
    const msgErr = validateMessage(message);

    const newErrors: ValidationErrors = {
      fullName: nameErr || undefined,
      workEmail: emailErr || undefined,
      company: companyErr || undefined,
      phone: phoneErr || undefined,
      message: msgErr || undefined,
    };

    if (nameErr || emailErr || companyErr || phoneErr || msgErr) {
      setErrors(newErrors);
      setTouched({
        fullName: true,
        workEmail: true,
        company: true,
        phone: true,
        message: true,
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
      },
      commercial: {
        formType: "contact",
        product: commercialParams.product || undefined,
        tier: commercialParams.tier || undefined,
        suite: commercialParams.suite || undefined,
        billing: commercialParams.billing || undefined,
        deployment: commercialParams.deployment || undefined,
        service: commercialParams.service || undefined,
        inquiryCategory: category,
        selectedModules:
          commercialParams.modules.length > 0 ? commercialParams.modules : undefined,
      },
      attribution,
      message: message.trim(),
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
        category,
        contextSummary,
      });
      setSubmissionResult(result);
    } else {
      setErrors({
        general: result.error || "Failed to transmit message. Please try again.",
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
    setMessage("");
    setHoneypot("");
    setErrors({});
    setTouched({});
  };

  return (
    <>
      <SEO
        title="Contact Enterprise Sales & Architecture — Zakeem Solutions"
        description="Initiate an engagement with Zakeem Solutions enterprise sales and technical leadership."
        canonical="https://www.zakeemsolutions.com/contact"
      />

      <section className="pt-12 pb-20 md:pt-20 md:pb-28 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <SectionHeader
            badge="Direct Engagement"
            title="Connect with Our Leadership &"
            highlightedWord="Solutions Architecture."
            description="Whether you require an executive technology consultation, enterprise software deployment, or technical partnership, our directors are available to assist."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
            {/* Contact Details */}
            <div data-surface="dark" className="lg:col-span-5 p-8 rounded-3xl bg-[#081c38] border border-white/10 space-y-6">
              <h3 className="text-xl font-bold text-white">Direct Contact</h3>

              <div className="space-y-4 text-xs md:text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#e57804] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">General & Corporate</div>
                    <a href={`mailto:${COMPANY_CONTACT.email}`} className="text-slate-400 hover:text-white transition-colors">
                      {COMPANY_CONTACT.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#e57804] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Enterprise Sales</div>
                    <a href={`mailto:${COMPANY_CONTACT.salesEmail}`} className="text-slate-400 hover:text-white transition-colors">
                      {COMPANY_CONTACT.salesEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#e57804] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Direct Line / Mobile</div>
                    <a href={`tel:${COMPANY_CONTACT.mobile.replace(/\s+/g, '')}`} className="text-slate-400 hover:text-white transition-colors font-mono">
                      {COMPANY_CONTACT.mobile}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Headquarters</div>
                    <div className="text-slate-400">{COMPANY_CONTACT.address}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Operating Hours</div>
                    <div className="text-slate-400">{COMPANY_CONTACT.hours}</div>
                  </div>
                </div>

                {/* Official Social Channels */}
                <div className="pt-4 border-t border-white/10">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
                    Official Social Channels
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {SOCIAL_LINKS.map((s) => (
                      <a
                        key={s.platform}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Connect with Zakeem Solutions on ${s.platform} (@${s.handle})`}
                        title={`${s.platform}: @${s.handle}`}
                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-[#e57804] hover:bg-[#e57804]/20 hover:border-[#e57804]/40 transition-all focus:outline-none focus:ring-2 focus:ring-[#e57804]"
                      >
                        {getSocialIcon(s.icon)}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Container */}
            <div data-surface="dark" className="lg:col-span-7 p-8 rounded-3xl bg-[#081c38] border border-white/15">
              {submissionResult && submittedData ? (
                <div className="text-center py-6 space-y-6">
                  <div className="w-14 h-14 rounded-full bg-[#e57804]/20 border border-[#e57804]/40 flex items-center justify-center mx-auto text-[#e57804]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Transmission Confirmed
                    </div>
                    <h3 className="text-2xl font-bold text-white">Inquiry Securely Received</h3>
                    <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                      Thank you, <span className="text-white font-semibold">{submittedData.fullName}</span>. Your enquiry has been routed directly to our Executive Technology Desk.
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
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Corporate Email:</span>
                      <span className="text-slate-300 font-mono">{submittedData.workEmail}</span>
                    </div>
                    {submittedData.contextSummary && (
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                        <span className="text-slate-400">Context:</span>
                        <span className="text-amber-400 font-medium text-right truncate max-w-[240px]">
                          {submittedData.contextSummary}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                      <span className="text-slate-400">Response Target:</span>
                      <span className="text-slate-300">Within 4 Business Hours</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleReset}
                      className="w-full sm:w-auto"
                    >
                      Submit Another Inquiry
                    </Button>
                    <Link to="/products" className="w-full sm:w-auto">
                      <Button variant="primary" size="sm" className="w-full">
                        Explore Products <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <form
                  id="contact-form"
                  data-analytics-id="contact-form"
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">Send Message</h3>
                    <span className="text-xs font-mono text-[#e57804] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e57804] animate-pulse" />
                      Executive Desk
                    </span>
                  </div>

                  {contextSummary && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#e57804] text-white font-bold shrink-0">
                        Context
                      </span>
                      <p className="text-xs text-slate-300">
                        Inquiry tailored to: <span className="text-white font-medium">{contextSummary}</span>
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
                    <label htmlFor="contact-website-url">Do not fill this field</label>
                    <input
                      id="contact-website-url"
                      type="text"
                      name="website_url"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-mono uppercase text-slate-400 mb-1">
                        Full Name *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (touched.fullName) handleBlur("fullName");
                        }}
                        onBlur={() => handleBlur("fullName")}
                        placeholder="Engr. Farouk Bello"
                        aria-invalid={touched.fullName && !!errors.fullName}
                        aria-describedby={touched.fullName && errors.fullName ? "error-contact-name" : undefined}
                        className={cn(
                          "w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border text-sm text-white focus:outline-none transition-colors",
                          touched.fullName && errors.fullName
                            ? "border-rose-500/70 focus:border-rose-500"
                            : "border-white/10 focus:border-[#e57804]"
                        )}
                      />
                      {touched.fullName && errors.fullName && (
                        <p id="error-contact-name" role="alert" className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-mono uppercase text-slate-400 mb-1">
                        Work Email *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={workEmail}
                        onChange={(e) => {
                          setWorkEmail(e.target.value);
                          if (touched.workEmail) handleBlur("workEmail");
                        }}
                        onBlur={() => handleBlur("workEmail")}
                        placeholder="farouk@institution.org"
                        aria-invalid={touched.workEmail && !!errors.workEmail}
                        aria-describedby={touched.workEmail && errors.workEmail ? "error-contact-email" : undefined}
                        className={cn(
                          "w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border text-sm text-white focus:outline-none transition-colors",
                          touched.workEmail && errors.workEmail
                            ? "border-rose-500/70 focus:border-rose-500"
                            : "border-white/10 focus:border-[#e57804]"
                        )}
                      />
                      {touched.workEmail && errors.workEmail && (
                        <p id="error-contact-email" role="alert" className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {errors.workEmail}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-company" className="block text-xs font-mono uppercase text-slate-400 mb-1">
                        Organization / Company *
                      </label>
                      <input
                        id="contact-company"
                        type="text"
                        required
                        value={company}
                        onChange={(e) => {
                          setCompany(e.target.value);
                          if (touched.company) handleBlur("company");
                        }}
                        onBlur={() => handleBlur("company")}
                        placeholder="Apex Holdings Ltd"
                        aria-invalid={touched.company && !!errors.company}
                        aria-describedby={touched.company && errors.company ? "error-contact-company" : undefined}
                        className={cn(
                          "w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border text-sm text-white focus:outline-none transition-colors",
                          touched.company && errors.company
                            ? "border-rose-500/70 focus:border-rose-500"
                            : "border-white/10 focus:border-[#e57804]"
                        )}
                      />
                      {touched.company && errors.company && (
                        <p id="error-contact-company" role="alert" className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {errors.company}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="contact-phone" className="block text-xs font-mono uppercase text-slate-400 mb-1">
                        Direct Phone <span className="text-slate-500 normal-case">(Optional)</span>
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (touched.phone) handleBlur("phone");
                        }}
                        onBlur={() => handleBlur("phone")}
                        placeholder="+234 800 000 0000"
                        aria-invalid={touched.phone && !!errors.phone}
                        aria-describedby={touched.phone && errors.phone ? "error-contact-phone" : undefined}
                        className={cn(
                          "w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border text-sm text-white focus:outline-none transition-colors",
                          touched.phone && errors.phone
                            ? "border-rose-500/70 focus:border-rose-500"
                            : "border-white/10 focus:border-[#e57804]"
                        )}
                      />
                      {touched.phone && errors.phone && (
                        <p id="error-contact-phone" role="alert" className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-category" className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Inquiry Category *
                    </label>
                    <select
                      id="contact-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804]"
                    >
                      <option value="commercial-advisory">Commercial Advisory & Licensing</option>
                      <option value="custom-stack">Custom Stack Proposal</option>
                      <option value="product-briefing">Roadmap & Product Briefing</option>
                      <option value="strategic-consulting">Strategic Technology Consulting / Custom Software</option>
                      <option value="general-inquiry">General Executive Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Message *
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (touched.message) handleBlur("message");
                      }}
                      onBlur={() => handleBlur("message")}
                      placeholder="Describe your enterprise requirements, scope, or timeline..."
                      aria-invalid={touched.message && !!errors.message}
                      aria-describedby={touched.message && errors.message ? "error-contact-message" : undefined}
                      className={cn(
                        "w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border text-sm text-white focus:outline-none transition-colors",
                        touched.message && errors.message
                          ? "border-rose-500/70 focus:border-rose-500"
                          : "border-white/10 focus:border-[#e57804]"
                      )}
                    />
                    {touched.message && errors.message && (
                      <p id="error-contact-message" role="alert" className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.message}
                      </p>
                    )}
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
                      By submitting this message, you consent to Zakeem Solutions contacting you regarding your enterprise inquiry. We adhere to enterprise confidentiality and data privacy practices. View our{" "}
                      <Link to="/privacy" className="text-[#e57804] hover:underline">
                        Privacy Policy
                      </Link>.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                    data-analytics-id="contact-submit-cta"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Transmitting Inquiry...
                      </span>
                    ) : (
                      "Submit Message"
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
