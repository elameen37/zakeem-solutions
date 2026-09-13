import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Calendar,
  Clock,
  ShieldCheck,
  Building2,
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
  formatDisplayDate,
  ValidationErrors,
} from "@/lib/leadValidation";
import { submitLead, generateLeadReferenceId } from "@/lib/leadSubmission";
import { LeadSubmissionPayload } from "@/types/lead";
import { Booking, TimeSlot } from "@/types/scheduling";
import {
  createBookingReservation,
  getPublicAvailableSlots,
} from "@/lib/schedulingService";
import {
  getLagosTodayDateString,
  generateBookingReferenceId,
} from "@/lib/schedulingEngine";

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

  // Form identity and commercial fields
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

  // Self-managed scheduling state
  const lagosToday = getLagosTodayDateString();
  const [selectedDate, setSelectedDate] = useState(lagosToday);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // Submission and error state
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    setInterest(getInitialInterest());
    setDeploymentType(getInitialDeployment());
  }, [
    commercialParams.product,
    commercialParams.tier,
    commercialParams.suite,
    commercialParams.deployment,
  ]);

  // Load actual available slots when date changes
  const loadSlotsForDate = useCallback(async (date: string) => {
    if (!date) return;
    setIsLoadingSlots(true);
    setSlotsError(null);
    setSelectedSlot(null);

    try {
      const slots = await getPublicAvailableSlots(date);
      setAvailableSlots(slots);
      if (slots.length === 0) {
        setSlotsError("No available slots on this date. Please select another business day (Mon–Fri, 09:00–17:00 WAT).");
      }
    } catch {
      setSlotsError("Unable to calculate availability. Please choose another date.");
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    loadSlotsForDate(selectedDate);
  }, [selectedDate, loadSlotsForDate]);

  // Field blur validation
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

    let dateErr: string | undefined;
    let slotErr: string | undefined;

    if (!selectedDate) {
      dateErr = "Please select a preferred date for your walkthrough.";
    }
    if (!selectedSlot) {
      slotErr = "Please select an available appointment time slot.";
    }

    const newErrors: ValidationErrors = {
      fullName: nameErr || undefined,
      workEmail: emailErr || undefined,
      company: companyErr || undefined,
      phone: phoneErr || undefined,
      preferredDate: dateErr,
      preferredTime: slotErr,
    };

    if (nameErr || emailErr || companyErr || phoneErr || dateErr || slotErr) {
      setErrors(newErrors);
      setTouched({
        fullName: true,
        workEmail: true,
        company: true,
        phone: true,
        preferredDate: true,
        preferredTime: true,
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const referenceId = generateBookingReferenceId(selectedDate);
    const leadReferenceId = generateLeadReferenceId();
    const attribution = getAttributionContext(searchParams);

    // 1. Double-booking protected atomic reservation
    const bookingResult = await createBookingReservation({
      referenceId,
      leadId: leadReferenceId,
      fullName: fullName.trim(),
      email: workEmail.trim(),
      organization: company.trim(),
      phone: phone.trim() || undefined,
      jobTitle: jobTitle.trim() || undefined,
      product: interest,
      tier: commercialParams.tier || undefined,
      suite: commercialParams.suite || undefined,
      deployment: deploymentType,
      bookingDate: selectedDate,
      startTime: selectedSlot!.startTime,
      endTime: selectedSlot!.endTime,
      notes: notes.trim() || undefined,
    });

    if (!bookingResult.success) {
      setIsSubmitting(false);
      if (bookingResult.isRaceCollision) {
        setErrors({
          general: "This time was just taken. Please select another available time.",
        });
        // Immediately reload slots to reflect collision
        loadSlotsForDate(selectedDate);
      } else {
        setErrors({
          general: bookingResult.error || "Failed to schedule session. Please try again.",
        });
      }
      return;
    }

    // 2. Lead Infrastructure Integration (Phase 15 Lead Contract + Phase 16)
    const leadPayload: LeadSubmissionPayload = {
      id: leadReferenceId,
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
      scheduling: {
        preferredDate: selectedDate,
        preferredTime: `${selectedSlot!.displayTime} WAT`,
        preferredTimezone: "Africa/Lagos",
      },
      preferredDate: selectedDate,
      preferredTime: `${selectedSlot!.displayTime} WAT`,
      preferredTimezone: "Africa/Lagos",
      attribution,
      notes: notes.trim() || undefined,
      consent: true,
      honeypot: honeypot.trim() || undefined,
    };

    // Submits lead and emits zakeem:lead_capture DOM analytics event
    await submitLead(leadPayload);

    setIsSubmitting(false);
    setConfirmedBooking(bookingResult.booking || null);
  };

  const handleReset = () => {
    setConfirmedBooking(null);
    setFullName("");
    setWorkEmail("");
    setCompany("");
    setPhone("");
    setJobTitle("");
    setSelectedSlot(null);
    setNotes("");
    setHoneypot("");
    setErrors({});
    setTouched({});
    loadSlotsForDate(lagosToday);
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

  // Compute maximum booking horizon date (30 days from today)
  const maxHorizonDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });
  })();

  return (
    <>
      <SEO
        title="Schedule a Confidential Technical Walkthrough — Zakeem Solutions"
        description="Book a dedicated executive walkthrough of Zakeem Realty ERP or our enterprise software platforms with a Lead Solutions Architect."
        canonical="https://www.zakeemsolutions.com/request-demo"
      />

      <section className="pt-12 pb-20 md:pt-20 md:pb-28 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Context Panel */}
            <div className="lg:col-span-5 space-y-6">
              <Badge variant="neon">Executive Architecture Desk</Badge>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight">
                Schedule a Confidential Technical Walkthrough.
              </h1>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Connect directly with a Lead Solutions Architect in West Africa Time (WAT). Choose your operational window to secure an atomic reservation tailored to your organization’s schemas and security requirements.
              </p>

              <div className="space-y-3.5 pt-4">
                <div className="flex items-start gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-[#e57804] shrink-0 mt-0.5" />
                  <span>Real-time availability directly managed by Zakeem systems</span>
                </div>
                <div className="flex items-start gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-[#e57804] shrink-0 mt-0.5" />
                  <span>Double-booking protected atomic reservation</span>
                </div>
                <div className="flex items-start gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-[#e57804] shrink-0 mt-0.5" />
                  <span>Live demonstration of Zakeem Realty ERP or AI models</span>
                </div>
                <div className="flex items-start gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-[#e57804] shrink-0 mt-0.5" />
                  <span>Architecture, cloud VPC, and security review</span>
                </div>
              </div>
            </div>

            {/* Right Form Card */}
            <div data-surface="dark" className="lg:col-span-7 p-8 md:p-10 rounded-3xl bg-[#081c38] border border-white/15 shadow-2xl">
              {confirmedBooking ? (
                <div className="text-center py-6 space-y-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Booking Confirmed
                    </div>
                    <h3 className="text-2xl font-bold text-white">Technical Briefing Reserved</h3>
                    <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                      Thank you, <span className="text-white font-semibold">{confirmedBooking.fullName}</span>. Your private technical walkthrough has been confirmed and scheduled with our Lead Solutions Architect.
                    </p>
                  </div>

                  {/* Confirmed Booking Summary Card */}
                  <div className="p-5 rounded-2xl bg-[#06152b] border border-white/10 text-left space-y-3.5 max-w-lg mx-auto">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                      <span className="text-slate-400">Booking Reference:</span>
                      <span className="font-mono text-[#e57804] font-semibold tracking-wider text-sm">
                        {confirmedBooking.referenceId}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Organization:</span>
                      <span className="text-white font-medium">{confirmedBooking.organization}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Lead Contact:</span>
                      <span className="text-slate-300 font-mono">{confirmedBooking.email}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Product Scope:</span>
                      <span className="text-slate-200 font-medium">{getInterestLabel(confirmedBooking.product)}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Deployment Model:</span>
                      <span className="text-slate-300">{getDeploymentLabel(confirmedBooking.deployment || "cloud")}</span>
                    </div>

                    <div className="flex items-start justify-between text-xs pt-2 border-t border-white/10">
                      <div>
                        <span className="text-slate-400 block">Confirmed Appointment:</span>
                        <span className="text-[11px] font-mono text-emerald-400">Reserved (West Africa Time)</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-medium block text-sm">
                          {formatDisplayDate(confirmedBooking.bookingDate)}
                        </span>
                        <span className="text-[#e57804] font-mono text-xs font-semibold">
                          {confirmedBooking.startTime} – {confirmedBooking.endTime} WAT
                        </span>
                      </div>
                    </div>
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
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Available Times — WAT
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

                  {/* 1. Identity Fields */}
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

                  {/* 2. Commercial Context Fields */}
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

                  {/* 3. Date Selection (Constrained by Minimum Notice & 30-Day Horizon) */}
                  <div className="space-y-1.5">
                    <label htmlFor="demo-preferred-date" className="block text-xs font-mono uppercase text-slate-400 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#e57804]" />
                        Select Date *
                      </span>
                      <span className="text-slate-500 normal-case font-sans">(Mon–Fri, within 30 days)</span>
                    </label>
                    <input
                      id="demo-preferred-date"
                      type="date"
                      required
                      min={lagosToday}
                      max={maxHorizonDate}
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        if (touched.preferredDate) handleBlur("preferredDate");
                      }}
                      onBlur={() => handleBlur("preferredDate")}
                      aria-invalid={touched.preferredDate && !!errors.preferredDate}
                      aria-describedby={touched.preferredDate && errors.preferredDate ? "error-demo-date" : undefined}
                      data-analytics-id="request-demo-date-selected"
                      className={cn(
                        "w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border text-sm text-white focus:outline-none transition-colors [color-scheme:dark]",
                        touched.preferredDate && errors.preferredDate
                          ? "border-rose-500/70 focus:border-rose-500"
                          : "border-white/10 focus:border-[#e57804]"
                      )}
                    />
                    {touched.preferredDate && errors.preferredDate && (
                      <p id="error-demo-date" role="alert" className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.preferredDate}
                      </p>
                    )}
                  </div>

                  {/* 4. Real-Time Available Time Slots (Calculated by Scheduling Engine) */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#e57804]" />
                        Available Times (WAT) *
                      </label>
                      {isLoadingSlots && (
                        <span className="text-[11px] font-mono text-[#e57804] flex items-center gap-1 animate-pulse" aria-live="polite">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Calculating Availability...
                        </span>
                      )}
                    </div>

                    {slotsError && !isLoadingSlots ? (
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{slotsError}</span>
                      </div>
                    ) : (
                      <div
                        className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                        role="radiogroup"
                        aria-label="Available appointment time slots"
                      >
                        {availableSlots.map((slot) => {
                          const isSelected = selectedSlot?.startTime === slot.startTime;
                          return (
                            <button
                              key={slot.startTime}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              onClick={() => {
                                setSelectedSlot(slot);
                                if (errors.preferredTime) {
                                  setErrors((prev) => ({ ...prev, preferredTime: undefined }));
                                }
                              }}
                              data-analytics-id="request-demo-slot-selected"
                              className={cn(
                                "min-h-[44px] px-3 py-2.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center justify-center border",
                                isSelected
                                  ? "bg-[#e57804] text-white border-[#e57804] shadow-md shadow-[#e57804]/20 font-bold"
                                  : "bg-[#06152b] text-slate-200 border-white/10 hover:border-[#e57804]/50 hover:bg-white/5"
                              )}
                            >
                              {slot.displayTime}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {touched.preferredTime && errors.preferredTime && (
                      <p id="error-demo-time" role="alert" className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.preferredTime}
                      </p>
                    )}
                  </div>

                  {/* 5. Role & Scope Fields */}
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
                      By scheduling this briefing, you agree to our{" "}
                      <Link to="/privacy" className="text-[#e57804] hover:underline">
                        Privacy Policy
                      </Link>
                      . Your session reservation is confirmed in real time and protected against duplicate bookings.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    disabled={isSubmitting || !selectedSlot}
                    className="w-full"
                    data-analytics-id="demo-submit-cta"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Reserving Walkthrough...
                      </span>
                    ) : selectedSlot ? (
                      `Confirm & Reserve ${selectedSlot.displayTime} WAT`
                    ) : (
                      "Select a Time Slot to Reserve"
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
