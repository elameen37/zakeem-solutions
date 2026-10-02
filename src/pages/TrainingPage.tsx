import React, { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  GraduationCap,
  Laptop,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  Building2,
  User,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Check,
  BookOpen,
  Printer,
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  ApplicantType,
  TRAINING_COURSES,
  TRAINING_DAYS,
  TrainingCourse,
  TrainingDay,
} from "@/types/training";
import {
  getLagosTodayIsoDate,
  validateTrainingApplication,
  TrainingValidationErrors,
} from "@/lib/trainingValidation";
import { submitTrainingApplication } from "@/lib/trainingService";

const TIME_OPTIONS = [
  { value: "09:00", label: "09:00 AM (WAT)" },
  { value: "11:00", label: "11:00 AM (WAT)" },
  { value: "14:00", label: "02:00 PM (WAT)" },
  { value: "16:00", label: "04:00 PM (WAT)" },
  { value: "18:00", label: "06:00 PM (WAT)" },
  { value: "20:00", label: "08:00 PM (WAT)" },
];

export const TrainingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const paramCourse = searchParams.get("course");
  const paramType = searchParams.get("type");

  const initialCourse = useMemo<TrainingCourse | "">(() => {
    if (paramCourse && (TRAINING_COURSES as readonly string[]).includes(paramCourse)) {
      return paramCourse as TrainingCourse;
    }
    return "";
  }, [paramCourse]);

  const initialType = useMemo<ApplicantType>(() => {
    return paramType === "organization" ? "organization" : "individual";
  }, [paramType]);

  // Step 1: Participant Type
  const [applicantType, setApplicantType] = useState<ApplicantType>(initialType);

  // Step 2: Biodata
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");

  // Step 3: Course Selection
  const [course, setCourse] = useState<TrainingCourse | "">(initialCourse);
  const [customTrainingRequest, setCustomTrainingRequest] = useState("");

  // Step 4: Schedule
  const lagosToday = useMemo(() => getLagosTodayIsoDate(), []);
  const [preferredStartDate, setPreferredStartDate] = useState("");
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [preferredTime, setPreferredTime] = useState("");

  // Step 5: Acknowledgement
  const [acknowledgementAccepted, setAcknowledgementAccepted] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  // State & Feedback
  const [errors, setErrors] = useState<TrainingValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    reference?: string;
  } | null>(null);

  // Toggle training days with 3-day max validation
  const toggleTrainingDay = (day: TrainingDay) => {
    setTrainingDays((prev) => {
      let next: TrainingDay[];
      if (prev.includes(day)) {
        next = prev.filter((d) => d !== day);
      } else {
        if (prev.length >= 3) {
          // Replace oldest or cap at 3
          next = [...prev.slice(1), day];
        } else {
          next = [...prev, day];
        }
      }

      if (next.length === 3) {
        setErrors((e) => ({ ...e, trainingDays: undefined }));
      } else {
        setErrors((e) => ({
          ...e,
          trainingDays: `Please select exactly 3 training days (${next.length}/3 selected).`,
        }));
      }

      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      applicantType,
      fullName: applicantType === "individual" ? fullName : undefined,
      email: applicantType === "individual" ? email : undefined,
      organizationName: applicantType === "organization" ? organizationName : undefined,
      businessEmail: applicantType === "organization" ? businessEmail : undefined,
      course: course as TrainingCourse,
      customTrainingRequest: course === "Customized Training" ? customTrainingRequest : undefined,
      preferredStartDate,
      trainingDays,
      sessionDurationMinutes: 120,
      preferredTime,
      timezone: "Africa/Lagos",
      acknowledgementAccepted,
      honeypot,
    };

    const validation = validateTrainingApplication(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await submitTrainingApplication(payload);
      if (res.success && res.applicationReference) {
        setSubmissionResult({
          success: true,
          reference: res.applicationReference,
        });
      } else {
        setErrors({ general: res.error || "Submission could not be completed. Please try again." });
      }
    } catch {
      setErrors({ general: "An unexpected network error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setApplicantType("individual");
    setFullName("");
    setEmail("");
    setOrganizationName("");
    setBusinessEmail("");
    setCourse("");
    setCustomTrainingRequest("");
    setPreferredStartDate("");
    setTrainingDays([]);
    setPreferredTime("");
    setAcknowledgementAccepted(false);
    setErrors({});
    setSubmissionResult(null);
  };

  return (
    <>
      <SEO
        title="Zakeem IT Training — Fully Online Professional Technical Training"
        description="Enroll in Zakeem IT Training. Fully online, live structured sessions in Digital Literacy, FutureReadyAI, and Web Development using AI with certificate of completion."
        canonical="https://www.zakeemsolutions.com/training"
      />

      <section className="pt-12 pb-20 md:pt-20 md:pb-28 border-b border-white/10 print:hidden">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Context Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e57804]/10 border border-[#e57804]/30 text-xs font-semibold text-[#e57804]">
                <GraduationCap className="w-4 h-4" />
                ZAKEEM IT TRAINING
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight">
                Fully Online Technical Training.
              </h1>

              <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Accelerate your technological capabilities or upskill your enterprise workforce. Live, structured training delivered directly online by senior software engineers and AI architects.
              </p>

              <Link
                to="/it-training"
                className="group flex items-center justify-between p-3 rounded-xl bg-[#06152b] border border-white/10 hover:border-[#e57804]/40 transition-colors text-xs"
              >
                <div className="flex items-center gap-2 text-slate-300">
                  <BookOpen className="w-4 h-4 text-[#e57804]" />
                  <span>Need course details and syllabus?</span>
                </div>
                <span className="text-[#e57804] font-semibold flex items-center gap-1 group-hover:underline">
                  View All Courses <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>

              <Link
                to="/training/status"
                className="group flex items-center justify-between p-3 rounded-xl bg-[#06152b] border border-white/10 hover:border-emerald-500/40 transition-colors text-xs"
              >
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Already applied for a cohort?</span>
                </div>
                <span className="text-emerald-400 font-semibold flex items-center gap-1 group-hover:underline">
                  Check Status <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>

              {/* Core Highlights */}
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#06152b] border border-white/10 flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#e57804]/15 border border-[#e57804]/30 flex items-center justify-center shrink-0 text-[#e57804]">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">100% Fully Online</h2>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      Attend live interactive classes from anywhere. No physical commute required.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#06152b] border border-white/10 flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Live Structured Learning</h2>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      Engage directly with experienced practitioners with hands-on technical labs.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#06152b] border border-white/10 flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Certificate of Completion</h2>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      Issued upon successful finishing of the selected training programme.
                    </p>
                  </div>
                </div>
              </div>

              {/* Schedule Quick Spec */}
              <div className="p-4 rounded-2xl bg-[#06152b]/60 border border-white/5 space-y-2 text-xs text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Session Length:</span>
                  <span className="font-semibold text-white">2 hours per session</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Frequency:</span>
                  <span className="font-semibold text-white">3 days per week</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Timezone:</span>
                  <span className="font-mono text-[#e57804]">Africa/Lagos (WAT)</span>
                </div>
              </div>
            </div>

            {/* Right Form Card */}
            <div
              data-surface="dark"
              className="lg:col-span-7 p-6 sm:p-8 md:p-10 rounded-3xl bg-[#081c38] border border-white/15 shadow-2xl relative"
            >
              {submissionResult ? (
                /* Success State */
                <div className="text-center py-8 space-y-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Application Received
                    </div>
                    <h3 className="text-2xl font-bold text-white">Application Successfully Submitted</h3>
                    <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                      Thank you. Your IT training application has been registered with our admissions desk.
                    </p>
                  </div>

                  {/* Summary Card */}
                  <div className="p-5 rounded-2xl bg-[#06152b] border border-white/10 text-left space-y-3 max-w-md mx-auto">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                      <span className="text-slate-400">Application Reference:</span>
                      <span className="font-mono font-bold text-[#e57804] text-sm">
                        {submissionResult.reference}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                      <span className="text-slate-400">Applicant:</span>
                      <span className="text-white font-medium">
                        {applicantType === "organization" ? organizationName : fullName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                      <span className="text-slate-400">Enrolled Course:</span>
                      <span className="text-white font-medium">{course}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                      <span className="text-slate-400">Preferred Start Date:</span>
                      <span className="text-white font-medium">{preferredStartDate}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                      <span className="text-slate-400">Selected Days:</span>
                      <span className="text-white font-medium">{trainingDays.join(", ")}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Time & Duration:</span>
                      <span className="text-white font-medium">{preferredTime} WAT (2h/session)</span>
                    </div>
                  </div>

                  {/* Admissions Note */}
                  <div className="p-4 rounded-xl bg-[#06152b] border border-white/10 text-left text-xs text-slate-300 max-w-md mx-auto space-y-2">
                    <span className="text-white font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#e57804]" /> What Happens Next
                    </span>
                    <p className="text-[12px] text-slate-400 leading-relaxed">
                      A confirmation email has been dispatched to your submitted address. Our admissions desk will review your schedule and contact you directly with your virtual classroom access and cohort orientation schedule.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Link
                      to={`/training/status?ref=${encodeURIComponent(submissionResult.reference || "")}`}
                      className="w-full sm:w-auto"
                    >
                      <Button variant="primary" size="sm" className="w-full bg-[#e57804] hover:bg-[#cf6a02]">
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        Check Application Status
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="w-full sm:w-auto text-white border-white/20 hover:bg-white/10"
                    >
                      Apply for Another Course
                    </Button>
                    <Link to="/" className="w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="w-full text-slate-300 border-white/20 hover:bg-white/10">
                        Return to Homepage <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                /* Multi-Step Form */
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  {/* Form Header */}
                  <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#e57804]" />
                        Online Training Application
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Complete the details below to reserve your training schedule.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.print()}
                      className="border-white/20 text-slate-200 hover:text-white hover:bg-white/10 shrink-0 self-start sm:self-auto text-xs"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1.5 text-[#e57804]" />
                      Print Form / Save as PDF
                    </Button>
                  </div>

                  {/* Hardcopy Instruction Note */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-start gap-2.5">
                    <Printer className="w-4 h-4 text-[#e57804] shrink-0 mt-0.5" />
                    <span>
                      Prefer a hardcopy? Print this form or save it as PDF, complete it, and submit it through the indicated Zakeem channel.
                    </span>
                  </div>

                  {errors.general && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{errors.general}</span>
                    </div>
                  )}

                  {/* Honeypot Anti-Bot Field */}
                  <div style={{ position: "absolute", left: "-9999px", display: "none" }} aria-hidden="true">
                    <input
                      type="text"
                      name="hp_it_training"
                      tabIndex={-1}
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  {/* STEP 1: PARTICIPANT TYPE */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-white uppercase tracking-wider">
                      Step 1: I am applying as <span className="text-[#e57804]">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setApplicantType("individual");
                          setErrors((e) => ({ ...e, applicantType: undefined }));
                        }}
                        className={cn(
                          "p-3.5 rounded-xl border text-left transition-all flex items-center gap-3",
                          applicantType === "individual"
                            ? "bg-[#e57804]/15 border-[#e57804] text-white shadow-lg"
                            : "bg-[#06152b] border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                        )}
                      >
                        <User className={cn("w-5 h-5", applicantType === "individual" ? "text-[#e57804]" : "text-slate-500")} />
                        <div>
                          <div className="text-sm font-bold">Individual</div>
                          <div className="text-[11px] text-slate-400">Personal career growth</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setApplicantType("organization");
                          setErrors((e) => ({ ...e, applicantType: undefined }));
                        }}
                        className={cn(
                          "p-3.5 rounded-xl border text-left transition-all flex items-center gap-3",
                          applicantType === "organization"
                            ? "bg-[#e57804]/15 border-[#e57804] text-white shadow-lg"
                            : "bg-[#06152b] border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                        )}
                      >
                        <Building2 className={cn("w-5 h-5", applicantType === "organization" ? "text-[#e57804]" : "text-slate-500")} />
                        <div>
                          <div className="text-sm font-bold">Organization</div>
                          <div className="text-[11px] text-slate-400">Team / Corporate cohort</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* STEP 2: BIODATA */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold text-white uppercase tracking-wider">
                      Step 2: {applicantType === "individual" ? "Candidate Biodata" : "Organization Details"}{" "}
                      <span className="text-[#e57804]">*</span>
                    </label>

                    {applicantType === "individual" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300">
                            Full Name <span className="text-[#e57804]">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Ibrahim Al-Ameen"
                            value={fullName}
                            onChange={(e) => {
                              setFullName(e.target.value);
                              setErrors((err) => ({ ...err, fullName: undefined }));
                            }}
                            className={cn(
                              "w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#e57804]",
                              errors.fullName ? "border-red-500" : "border-white/15"
                            )}
                          />
                          {errors.fullName && <p className="text-[11px] text-red-400">{errors.fullName}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-300">
                            Email Address <span className="text-[#e57804]">*</span>
                          </label>
                          <input
                            type="email"
                            placeholder="e.g. candidate@example.com"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setErrors((err) => ({ ...err, email: undefined }));
                            }}
                            className={cn(
                              "w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#e57804]",
                              errors.email ? "border-red-500" : "border-white/15"
                            )}
                          />
                          {errors.email && <p className="text-[11px] text-red-400">{errors.email}</p>}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-300">
                            Organization Name <span className="text-[#e57804]">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Acme Corporation Limited"
                            value={organizationName}
                            onChange={(e) => {
                              setOrganizationName(e.target.value);
                              setErrors((err) => ({ ...err, organizationName: undefined }));
                            }}
                            className={cn(
                              "w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#e57804]",
                              errors.organizationName ? "border-red-500" : "border-white/15"
                            )}
                          />
                          {errors.organizationName && <p className="text-[11px] text-red-400">{errors.organizationName}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-300">
                            Business Email <span className="text-[#e57804]">*</span>
                          </label>
                          <input
                            type="email"
                            placeholder="e.g. hr@acmecorp.com"
                            value={businessEmail}
                            onChange={(e) => {
                              setBusinessEmail(e.target.value);
                              setErrors((err) => ({ ...err, businessEmail: undefined }));
                            }}
                            className={cn(
                              "w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#e57804]",
                              errors.businessEmail ? "border-red-500" : "border-white/15"
                            )}
                          />
                          {errors.businessEmail && <p className="text-[11px] text-red-400">{errors.businessEmail}</p>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* STEP 3: COURSE SELECTION */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold text-white uppercase tracking-wider">
                      Step 3: Select Training Course <span className="text-[#e57804]">*</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {TRAINING_COURSES.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setCourse(item);
                            setErrors((err) => ({ ...err, course: undefined }));
                          }}
                          className={cn(
                            "p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between",
                            course === item
                              ? "bg-[#e57804]/15 border-[#e57804] text-white font-semibold"
                              : "bg-[#06152b] border-white/10 text-slate-300 hover:border-white/20"
                          )}
                        >
                          <span>{item}</span>
                          {course === item && <Check className="w-4 h-4 text-[#e57804] shrink-0" />}
                        </button>
                      ))}
                    </div>
                    {errors.course && <p className="text-[11px] text-red-400">{errors.course}</p>}

                    {/* Conditional Customized Training Textarea */}
                    {course === "Customized Training" && (
                      <div className="space-y-1.5 pt-2">
                        <label className="text-xs text-slate-300 font-medium">
                          Tell us what training you need <span className="text-[#e57804]">*</span>
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Describe specific modules, tools, frameworks, or enterprise goals..."
                          value={customTrainingRequest}
                          onChange={(e) => {
                            setCustomTrainingRequest(e.target.value);
                            setErrors((err) => ({ ...err, customTrainingRequest: undefined }));
                          }}
                          className={cn(
                            "w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#e57804] resize-none",
                            errors.customTrainingRequest ? "border-red-500" : "border-white/15"
                          )}
                        />
                        {errors.customTrainingRequest && (
                          <p className="text-[11px] text-red-400">{errors.customTrainingRequest}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* STEP 4: TRAINING SCHEDULE */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-white uppercase tracking-wider">
                        Step 4: Training Schedule <span className="text-[#e57804]">*</span>
                      </label>
                      <span className="text-[11px] font-semibold text-[#e57804] px-2 py-0.5 rounded bg-[#e57804]/10 border border-[#e57804]/20">
                        Training is fully online
                      </span>
                    </div>

                    {/* Preferred Start Date */}
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#e57804]" /> Preferred Start Date{" "}
                        <span className="text-[#e57804]">*</span>
                      </label>
                      <input
                        type="date"
                        min={lagosToday}
                        value={preferredStartDate}
                        onChange={(e) => {
                          setPreferredStartDate(e.target.value);
                          setErrors((err) => ({ ...err, preferredStartDate: undefined }));
                        }}
                        className={cn(
                          "w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#e57804] [color-scheme:dark]",
                          errors.preferredStartDate ? "border-red-500" : "border-white/15"
                        )}
                      />
                      {errors.preferredStartDate && (
                        <p className="text-[11px] text-red-400">{errors.preferredStartDate}</p>
                      )}
                    </div>

                    {/* Training Days: Exactly 3 days */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-slate-300">
                          Select Exactly 3 Training Days Per Week <span className="text-[#e57804]">*</span>
                        </label>
                        <span className={cn(
                          "text-[11px] font-mono",
                          trainingDays.length === 3 ? "text-emerald-400" : "text-[#e57804]"
                        )}>
                          {trainingDays.length}/3 days selected
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {TRAINING_DAYS.map((day) => {
                          const isSelected = trainingDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleTrainingDay(day)}
                              className={cn(
                                "py-2 px-3 rounded-lg border text-xs text-center transition-all",
                                isSelected
                                  ? "bg-[#e57804] border-[#e57804] text-white font-bold shadow"
                                  : "bg-[#06152b] border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                              )}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                      {errors.trainingDays && (
                        <p className="text-[11px] text-red-400">{errors.trainingDays}</p>
                      )}
                    </div>

                    {/* Duration & Preferred Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-300">Training Duration</label>
                        <div className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b]/60 border border-white/10 text-sm text-slate-300 flex items-center justify-between">
                          <span>2 hours per session</span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                            Fixed
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#e57804]" /> Preferred Training Time{" "}
                          <span className="text-[#e57804]">*</span>
                        </label>
                        <select
                          value={preferredTime}
                          onChange={(e) => {
                            setPreferredTime(e.target.value);
                            setErrors((err) => ({ ...err, preferredTime: undefined }));
                          }}
                          className={cn(
                            "w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#e57804]",
                            errors.preferredTime ? "border-red-500" : "border-white/15"
                          )}
                        >
                          <option value="">Select a time slot...</option>
                          {TIME_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {errors.preferredTime && (
                          <p className="text-[11px] text-red-400">{errors.preferredTime}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* STEP 5: ACKNOWLEDGEMENT & AGREEMENT */}
                  <div className="space-y-3 pt-2 border-t border-white/10">
                    <label className="block text-xs font-bold text-white uppercase tracking-wider">
                      Step 5: Terms & Acknowledgement <span className="text-[#e57804]">*</span>
                    </label>

                    <div className="p-3.5 rounded-xl bg-[#06152b] border border-white/10 space-y-3">
                      <div className="flex items-start gap-2.5">
                        <input
                          id="acknowledgement"
                          type="checkbox"
                          checked={acknowledgementAccepted}
                          onChange={(e) => {
                            setAcknowledgementAccepted(e.target.checked);
                            setErrors((err) => ({ ...err, acknowledgementAccepted: undefined }));
                          }}
                          className="w-4 h-4 mt-0.5 rounded border-white/20 bg-[#081c38] text-[#e57804] focus:ring-[#e57804] accent-[#e57804]"
                        />
                        <label htmlFor="acknowledgement" className="text-xs text-slate-300 leading-relaxed cursor-pointer">
                          I acknowledge that the training is fully online and I agree to participate according to the selected schedule and complete the requirements for the programme.
                        </label>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-start gap-2 text-[11px] text-slate-400">
                        <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>
                          Certificate of completion will be issued upon successful completion of the selected training programme.
                        </span>
                      </div>
                    </div>
                    {errors.acknowledgementAccepted && (
                      <p className="text-[11px] text-red-400">{errors.acknowledgementAccepted}</p>
                    )}
                  </div>

                  {/* STEP 6: SUBMISSION */}
                  <div className="pt-2 space-y-3">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={isSubmitting}
                        className="w-full sm:flex-1 text-base font-bold shadow-xl"
                      >
                        {isSubmitting ? "Submitting Application..." : "Apply for IT Training"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => window.print()}
                        className="w-full sm:w-auto text-sm px-5 py-3 border-white/20 text-white hover:bg-white/10 shrink-0"
                      >
                        <Printer className="w-4 h-4 mr-2 text-[#e57804]" />
                        Print Form / Save as PDF
                      </Button>
                    </div>
                    <p className="text-center text-[11px] text-slate-400">
                      Applications are processed securely. You will receive a confirmation email upon submission.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* PRINTABLE BLANK FORM LAYOUT (Rendered ONLY when printing)        */}
      {/* ================================================================= */}
      <div className="hidden print:block printable-document bg-white text-slate-900 font-sans p-6 max-w-4xl mx-auto space-y-6">
        {/* Header with Logo & Institution Branding */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/logos/logo-color.png"
              alt="Zakeem Solutions"
              width={103}
              height={48}
              decoding="async"
              className="h-12 w-auto object-contain"
            />
            <div>
              <div className="text-xl font-extrabold tracking-tight text-slate-900">
                ZAKEEM SOLUTIONS
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Enterprise Technology & IT Training Directorate
              </div>
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-600 space-y-0.5">
            <div className="font-semibold text-slate-800">Admissions Desk</div>
            <div>admissions@zakeemsolutions.com</div>
            <div>www.zakeemsolutions.com/training</div>
          </div>
        </div>

        {/* Title & Official Notice */}
        <div className="text-center space-y-1 py-1">
          <h1 className="text-xl font-bold uppercase tracking-wide text-slate-950">
            Online IT Training Application Form
          </h1>
          <p className="text-xs text-slate-700 italic max-w-2xl mx-auto">
            Prefer a hardcopy? Print this form or save it as PDF, complete it, and submit it through the indicated Zakeem channel.
          </p>
        </div>

        {/* SECTION 1: PARTICIPANT TYPE */}
        <div className="border border-slate-300 rounded-lg p-3.5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex justify-between">
            <span>Step 1: Participant Classification (Select One)</span>
            <span className="text-[10px] text-slate-500 font-normal">* Mandatory</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs pt-1">
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-slate-800 rounded-sm" />
              <span className="font-semibold">Individual Applicant</span>
              <span className="text-slate-500 text-[11px]">(Personal career growth)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-slate-800 rounded-sm" />
              <span className="font-semibold">Organization / Corporate</span>
              <span className="text-slate-500 text-[11px]">(Team cohort)</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: BIODATA & CONTACT INFORMATION */}
        <div className="border border-slate-300 rounded-lg p-3.5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex justify-between">
            <span>Step 2: Candidate & Organization Biodata</span>
            <span className="text-[10px] text-slate-500 font-normal">* Mandatory</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <div className="text-slate-700 font-medium">Full Name (Individual / Contact Person):</div>
              <div className="border-b border-slate-400 min-h-[26px]" />
            </div>
            <div className="space-y-1">
              <div className="text-slate-700 font-medium">Organization / Company Name (if corporate):</div>
              <div className="border-b border-slate-400 min-h-[26px]" />
            </div>
            <div className="space-y-1">
              <div className="text-slate-700 font-medium">Email Address (Business or Personal):</div>
              <div className="border-b border-slate-400 min-h-[26px]" />
            </div>
            <div className="space-y-1">
              <div className="text-slate-700 font-medium">Phone / WhatsApp Number:</div>
              <div className="border-b border-slate-400 min-h-[26px]" />
            </div>
          </div>
        </div>

        {/* SECTION 3: COURSE SELECTION */}
        <div className="border border-slate-300 rounded-lg p-3.5 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex justify-between">
            <span>Step 3: Training Course Selection (Select One)</span>
            <span className="text-[10px] text-slate-500 font-normal">* Mandatory</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs pt-1">
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-slate-800 rounded-sm shrink-0" />
              <span>Digital Literacy <span className="text-slate-500 text-[11px]">(Foundational)</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-slate-800 rounded-sm shrink-0" />
              <span>FutureReadyAI <span className="text-slate-500 text-[11px]">(Prompting & Automation)</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-slate-800 rounded-sm shrink-0" />
              <span>Web Development using AI <span className="text-slate-500 text-[11px]">(Full-Stack)</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-slate-800 rounded-sm shrink-0" />
              <span>Python Programming & Data Automation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-slate-800 rounded-sm shrink-0" />
              <span>Prompt Engineering & Generative AI for Business</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-slate-800 rounded-sm shrink-0" />
              <span>Customized Training <span className="text-slate-500 text-[11px]">(Bespoke Cohort)</span></span>
            </div>
          </div>

          <div className="pt-2 space-y-1">
            <div className="text-[11px] text-slate-700 font-medium">
              If Customized Training is selected, please specify required modules or goals:
            </div>
            <div className="border-b border-slate-400 min-h-[24px]" />
          </div>
        </div>

        {/* SECTION 4: TRAINING SCHEDULE */}
        <div className="border border-slate-300 rounded-lg p-3.5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex justify-between">
            <span>Step 4: Training Schedule & Delivery Mode</span>
            <span className="text-[10px] text-slate-500 font-normal">Fully Online • 2h / session</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <div className="text-slate-700 font-medium">Preferred Start Date (YYYY-MM-DD):</div>
              <div className="border-b border-slate-400 min-h-[26px]" />
            </div>
            <div className="space-y-1">
              <div className="text-slate-700 font-medium">Delivery Mode:</div>
              <div className="font-semibold text-slate-800 pt-1">
                100% Fully Online (Virtual Interactive Classroom)
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="text-xs text-slate-800 font-medium">
              Select Exactly 3 Training Days Per Week (Tick 3 boxes):
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                <div key={d} className="border border-slate-300 rounded p-1">
                  <div className="text-[10px] font-bold text-slate-700">{d.slice(0, 3)}</div>
                  <div className="pt-1 flex justify-center">
                    <span className="inline-block w-3.5 h-3.5 border border-slate-800 rounded-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="text-xs text-slate-800 font-medium">
              Preferred Training Time Slot (2 hours per session, WAT / Africa-Lagos):
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-[11px]">
              {["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM", "08:00 PM"].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <span className="inline-block w-3.5 h-3.5 border border-slate-800 rounded-sm shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 5: ACKNOWLEDGEMENT & CERTIFICATION */}
        <div className="border border-slate-300 rounded-lg p-3.5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            Step 5: Terms & Acknowledgement
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-800 leading-relaxed pt-1">
            <span className="inline-block w-4 h-4 border-2 border-slate-800 rounded-sm shrink-0 mt-0.5" />
            <div>
              <strong>Mandatory Acknowledgement:</strong> I acknowledge that the training is fully online and I agree to participate according to the selected schedule and complete the requirements for the programme.
            </div>
          </div>
          <div className="text-[11px] text-slate-700 pl-6 border-t border-slate-100 pt-1.5">
            <strong>Certificate Statement:</strong> Certificate of completion will be issued upon successful completion of the selected training programme.
          </div>
        </div>

        {/* SECTION 6: SIGNATURE & MANUAL SUBMISSION */}
        <div className="border border-slate-300 rounded-lg p-3.5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            Step 6: Applicant / Signatory Authorization
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs pt-1">
            <div className="space-y-1">
              <div className="text-slate-700 font-medium">Print Applicant Name:</div>
              <div className="border-b border-slate-400 min-h-[26px]" />
            </div>
            <div className="space-y-1">
              <div className="text-slate-700 font-medium">Authorized Signature:</div>
              <div className="border-b border-slate-400 min-h-[26px]" />
            </div>
            <div className="space-y-1">
              <div className="text-slate-700 font-medium">Date (YYYY-MM-DD):</div>
              <div className="border-b border-slate-400 min-h-[26px]" />
            </div>
          </div>

          <div className="pt-2 text-[10px] text-slate-600 border-t border-slate-200 flex justify-between items-center">
            <span>
              Submit completed forms to: <strong>admissions@zakeemsolutions.com</strong> or online at <strong>www.zakeemsolutions.com/training</strong>
            </span>
            <span>
              Track application status at: <strong>www.zakeemsolutions.com/training/status</strong>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
