import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  GraduationCap,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Calendar,
  Award,
  Laptop,
  ArrowRight,
  Copy,
  Check,
  Building2,
  User,
  ShieldCheck,
  Mail,
  Printer,
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  checkPublicTrainingStatus,
  PublicTrainingStatusData,
} from "@/lib/trainingService";

export const TrainingStatusPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRef = searchParams.get("ref") || "";
  const initialEmail = searchParams.get("email") || "";

  const [reference, setReference] = useState(initialRef);
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<PublicTrainingStatusData | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Auto-search if both parameters are provided in URL
  useEffect(() => {
    if (initialRef && initialEmail) {
      handleLookup(initialRef, initialEmail);
    }
  }, []);

  const handleLookup = async (refVal: string, emailVal: string) => {
    const cleanRef = refVal.trim();
    const cleanEmail = emailVal.trim();

    if (!cleanRef || !cleanEmail) {
      setError("Please provide both your Application Reference and registered Email address.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await checkPublicTrainingStatus(cleanRef, cleanEmail);
      if (result.success && result.data) {
        setStatusData(result.data);
        setError(null);
        // Sync URL query params cleanly
        setSearchParams({ ref: cleanRef, email: cleanEmail }, { replace: true });
      } else {
        setStatusData(null);
        setError(
          result.error ||
            "No matching application located. Please verify your reference ID and the email address used during submission."
        );
      }
    } catch (err: unknown) {
      setStatusData(null);
      setError("Unable to verify status at this moment. Please check your network and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookup(reference, email);
  };

  const handleCopyRef = (refText: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(refText);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const getStatusConfig = (status: string | undefined) => {
    const normalized = (status || "").toLowerCase().trim();
    switch (normalized) {
      case "submitted":
        return {
          label: "Application Submitted",
          badgeLabel: "Application Submitted",
          badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
          bannerClass: "border-amber-500/30 bg-amber-500/5",
          icon: <Clock className="w-4 h-4 text-amber-400" />,
          overviewDescription:
            "Your application has been received and queued for review by the Zakeem Admissions Desk.",
        };
      case "in_review":
        return {
          label: "Under Review",
          badgeLabel: "Under Review",
          badgeClass: "bg-sky-500/15 text-sky-400 border-sky-500/30",
          bannerClass: "border-sky-500/30 bg-sky-500/5",
          icon: <Clock className="w-4 h-4 text-sky-400" />,
          overviewDescription:
            "Your application is currently under technical review and scheduling alignment with our admissions team.",
        };
      case "confirmed":
        return {
          label: "Confirmed",
          badgeLabel: "Confirmed",
          badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          bannerClass: "border-emerald-500/30 bg-emerald-500/5",
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          overviewDescription:
            "Application officially confirmed! Cohort onboarding and virtual classroom credentials will be dispatched prior to your start date.",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          badgeLabel: "Cancelled",
          badgeClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
          bannerClass: "border-rose-500/30 bg-rose-500/5",
          icon: <XCircle className="w-4 h-4 text-rose-400" />,
          overviewDescription:
            "Application was cancelled. Please contact admissions@zakeemsolutions.com for assistance or re-application guidance.",
        };
      default:
        return {
          label: "Status Update Available",
          badgeLabel: "Status Update Available",
          badgeClass: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
          bannerClass: "border-indigo-500/30 bg-indigo-500/5",
          icon: <AlertCircle className="w-4 h-4 text-indigo-400" />,
          overviewDescription:
            "A status update is available for your application. Please review the details below or contact the admissions desk.",
          isUnknown: true,
        };
    }
  };

  const formatTimestamp = (isoString?: string | null): string | null => {
    if (!isoString) return null;
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const cfg = getStatusConfig(status);
    return (
      <span
        data-testid="status-badge"
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border",
          cfg.badgeClass
        )}
      >
        {cfg.icon}
        {cfg.badgeLabel}
      </span>
    );
  };

  return (
    <>
      <SEO
        title="Check IT Training Application Status — Zakeem Solutions"
        description="Verify your Zakeem Online IT Training application progress, cohort schedule, and admission status using your reference ID."
        canonical="https://www.zakeemsolutions.com/training/status"
      />

      <section className="pt-12 pb-24 border-b border-white/10 min-h-[80vh]">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl space-y-10">
          {/* Header */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2">
              <Badge variant="neon">Zakeem IT Training Desk</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Application Status Verification
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Track your admission status for Zakeem Online IT Training. Enter your application reference ID and the email address used during submission.
            </p>
          </div>

          {/* Verification Form Card */}
          <div
            data-surface="dark"
            className="p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl bg-[#081c38] border border-white/15 shadow-2xl space-y-6"
          >
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="referenceInput" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-[#e57804]" /> Application Reference ID{" "}
                    <span className="text-[#e57804]">*</span>
                  </label>
                  <input
                    id="referenceInput"
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value.toUpperCase())}
                    placeholder="e.g. ZIT-202610-A4B2"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/15 text-sm text-white font-mono placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#e57804] uppercase"
                  />
                  <p className="text-[11px] text-slate-400">
                    Format: <span className="font-mono text-slate-300">ZIT-YYYYMM-XXXX</span> (provided in your confirmation email)
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="emailInput" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#e57804]" /> Registered Email Address{" "}
                    <span className="text-[#e57804]">*</span>
                  </label>
                  <input
                    id="emailInput"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com or corporate email"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#e57804]"
                  />
                  <p className="text-[11px] text-slate-400">
                    Use the exact candidate or business email used when applying
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isLoading}
                  leftIcon={<Search className="w-4 h-4" />}
                  className="w-full sm:w-auto font-bold px-8 shadow-lg min-h-[48px]"
                >
                  {isLoading ? "Verifying..." : "Verify Application Status"}
                </Button>

                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Secure zero-knowledge credential verification</span>
                </div>
              </div>
            </form>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-rose-200">Verification Notice</p>
                  <p className="leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {/* Result Presentation */}
            {statusData && (
              <div className="pt-4 border-t border-white/10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                      Application Status Result
                    </span>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <span>{statusData.applicantDisplayName || "Applicant Record"}</span>
                    </h2>
                  </div>
                  <div>{getStatusBadge(statusData.status)}</div>
                </div>

                {/* PROMINENT CURRENT STATUS HERO CARD */}
                {(() => {
                  const statusCfg = getStatusConfig(statusData.status);

                  return (
                    <div
                      data-testid="current-status-card"
                      data-raw-status={statusData.status}
                      className={cn(
                        "p-6 rounded-2xl border transition-all space-y-4",
                        statusCfg.bannerClass
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 shrink-0">
                            {statusCfg.icon}
                          </div>
                          <div>
                            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                              Current Application Status
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight">
                              {statusCfg.label}
                            </h3>
                          </div>
                        </div>
                        <div>
                          <span
                            data-testid="status-badge"
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border",
                              statusCfg.badgeClass
                            )}
                          >
                            {statusCfg.icon}
                            {statusCfg.badgeLabel}
                          </span>
                        </div>
                      </div>

                      {/* Application Acknowledgement / Context */}
                      <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-300">Application Received:</span>
                          <span className="font-mono text-slate-200">
                            {formatTimestamp(statusData.submittedAt) || "Recorded in Registry"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Reference:</span>
                          <span className="font-mono font-bold text-[#e57804]">{statusData.reference}</span>
                        </div>
                      </div>

                      {/* Status Overview / Message */}
                      <p className="text-sm text-slate-200 leading-relaxed pt-1">
                        {statusData.statusMessage || statusCfg.overviewDescription}
                      </p>
                    </div>
                  );
                })()}

                {/* ADMISSIONS LIFECYCLE TIMELINE */}
                {(() => {
                  const normalizedStatus = (statusData.status || "").toLowerCase().trim();

                  return (
                    <div className="p-6 rounded-2xl bg-[#06152b] border border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#e57804]" />
                          Admissions Lifecycle Progress
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {statusData.reference}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        {/* Stage 1: Application Submitted */}
                        <div className="relative p-4 rounded-xl bg-black/25 border border-emerald-500/30 flex flex-col justify-between space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              1. Application Submitted
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Completed
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            Application received and registered in Zakeem admissions system.
                          </p>
                          {statusData.submittedAt && (
                            <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
                              {formatTimestamp(statusData.submittedAt)}
                            </div>
                          )}
                        </div>

                        {/* Stage 2: Under Review */}
                        {(() => {
                          const isCurrent = normalizedStatus === "in_review";
                          const isPast = normalizedStatus === "confirmed" || normalizedStatus === "cancelled";

                          return (
                            <div
                              className={cn(
                                "relative p-4 rounded-xl bg-black/25 flex flex-col justify-between space-y-2 border",
                                isCurrent
                                  ? "border-sky-500/50 bg-sky-500/5 shadow-lg shadow-sky-500/10"
                                  : isPast
                                  ? "border-emerald-500/30"
                                  : "border-white/10 opacity-70"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                  {isPast ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  ) : isCurrent ? (
                                    <Clock className="w-4 h-4 text-sky-400 animate-pulse" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-slate-500" />
                                  )}
                                  2. Under Review
                                </span>
                                <span
                                  className={cn(
                                    "text-[10px] font-mono px-2 py-0.5 rounded border",
                                    isCurrent
                                      ? "bg-sky-500/15 text-sky-300 border-sky-500/30"
                                      : isPast
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                      : "bg-white/5 text-slate-400 border-white/10"
                                  )}
                                >
                                  {isCurrent ? "In Progress" : isPast ? "Completed" : "Pending"}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300 leading-relaxed">
                                {isCurrent
                                  ? "Technical evaluation and schedule verification underway."
                                  : isPast
                                  ? "Admissions evaluation completed."
                                  : "Awaiting technical review by admissions lead."}
                              </p>
                              {statusData.reviewedAt && (
                                <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
                                  {formatTimestamp(statusData.reviewedAt)}
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Stage 3: Confirmed / Cancelled */}
                        {(() => {
                          if (normalizedStatus === "cancelled") {
                            return (
                              <div className="relative p-4 rounded-xl bg-black/25 border border-rose-500/40 bg-rose-500/5 flex flex-col justify-between space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                                    <XCircle className="w-4 h-4 text-rose-400" />
                                    3. Cancelled
                                  </span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                                    Closed
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-300 leading-relaxed">
                                  Application was cancelled. Contact admissions desk for assistance.
                                </p>
                                {statusData.cancelledAt && (
                                  <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
                                    {formatTimestamp(statusData.cancelledAt)}
                                  </div>
                                )}
                              </div>
                            );
                          }

                          const isConfirmed = normalizedStatus === "confirmed";

                          return (
                            <div
                              className={cn(
                                "relative p-4 rounded-xl bg-black/25 flex flex-col justify-between space-y-2 border",
                                isConfirmed
                                  ? "border-emerald-500/50 bg-emerald-500/5 shadow-lg shadow-emerald-500/10"
                                  : "border-white/10 opacity-70"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                  {isConfirmed ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <Award className="w-4 h-4 text-slate-500" />
                                  )}
                                  3. Confirmed
                                </span>
                                <span
                                  className={cn(
                                    "text-[10px] font-mono px-2 py-0.5 rounded border",
                                    isConfirmed
                                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                      : "bg-white/5 text-slate-400 border-white/10"
                                  )}
                                >
                                  {isConfirmed ? "Confirmed" : "Pending"}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300 leading-relaxed">
                                {isConfirmed
                                  ? "Cohort seat secured. Virtual classroom onboarding prepared."
                                  : "Cohort seat allocation and final registration confirmation."}
                              </p>
                              {statusData.confirmedAt && (
                                <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
                                  {formatTimestamp(statusData.confirmedAt)}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })()}

                {/* Detailed Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Reference */}
                  <div className="p-4 rounded-xl bg-black/25 border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Application Reference
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-white">
                        {statusData.reference}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyRef(statusData.reference)}
                        className="text-slate-400 hover:text-[#e57804] transition-colors p-1 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/5 cursor-pointer"
                        aria-label="Copy application reference"
                        title="Copy Reference"
                      >
                        {copiedRef ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Applicant Type */}
                  <div className="p-4 rounded-xl bg-black/25 border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Applicant Category
                    </span>
                    <div className="text-sm font-bold text-white capitalize flex items-center gap-1.5">
                      {statusData.applicantType === "organization" ? (
                        <>
                          <Building2 className="w-4 h-4 text-[#e57804]" /> Corporate Track
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4 text-sky-400" /> Individual Track
                        </>
                      )}
                    </div>
                  </div>

                  {/* Enrolled Course */}
                  <div className="p-4 rounded-xl bg-black/25 border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Selected Course Track
                    </span>
                    <div className="text-sm font-bold text-white">
                      {statusData.course}
                    </div>
                  </div>

                  {/* Preferred Start Date */}
                  <div className="p-4 rounded-xl bg-black/25 border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Preferred Start Date
                    </span>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#e57804]" />
                      <span>{statusData.preferredStartDate}</span>
                    </div>
                  </div>

                  {/* Weekly Schedule */}
                  <div className="p-4 rounded-xl bg-black/25 border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Weekly Schedule (3 Days)
                    </span>
                    <div className="text-sm font-bold text-white">
                      {statusData.trainingDays.join(", ")}
                    </div>
                  </div>

                  {/* Session Duration & Time */}
                  <div className="p-4 rounded-xl bg-black/25 border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Session Time & Duration
                    </span>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#e57804]" />
                      <span>
                        {statusData.preferredTime} WAT ({statusData.sessionDuration})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Certificate & Delivery Notice */}
                <div className="p-4 rounded-2xl bg-[#e57804]/10 border border-[#e57804]/25 flex items-start gap-3 text-xs text-slate-200">
                  <Award className="w-5 h-5 text-[#e57804] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-white">
                      Professional Certification & Sovereign Virtual Classroom
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                      Training is delivered 100% online through live interactive instruction with Zakeem technical leads. A cryptographically verifiable Certificate of Completion is awarded upon fulfilling all course modules.
                    </p>
                  </div>
                </div>

                {/* Print & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.print()}
                      leftIcon={<Printer className="w-4 h-4 text-slate-300" />}
                      className="border-white/15 text-slate-300 hover:text-white"
                    >
                      Print Status Confirmation
                    </Button>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      href="/it-training"
                      className="text-slate-300 hover:text-white"
                    >
                      Explore Courses
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      href="/training"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      className="border-[#e57804]/40 text-[#e57804] hover:bg-[#e57804]/10"
                    >
                      Submit New Application
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Guidance / FAQ Card */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#e57804]" />
              Need Assistance With Your Application?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              If you have questions regarding your training start date, scheduling adjustments, or corporate group enrollments, please contact our admissions office directly at{" "}
              <a
                href="mailto:info@zakeemsolutions.com"
                className="text-[#e57804] font-mono hover:underline"
              >
                info@zakeemsolutions.com
              </a>{" "}
              quoting your application reference ID.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};
