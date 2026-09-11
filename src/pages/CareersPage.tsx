import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Briefcase, Search, MapPin, Clock, ArrowRight, CheckCircle2, 
  Shield, Cpu, Code2, Globe, HeartPulse, GraduationCap, 
  TrendingUp, Laptop, X, Send, Filter, AlertCircle, ChevronRight
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { 
  JOB_POSTINGS, CAREER_DEPARTMENTS, CULTURE_PILLARS, COMPANY_BENEFITS, 
  JobPosting, CompanyBenefit 
} from "@/data/careers";
import { cn } from "@/lib/utils";

export const CareersPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();

  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [activeJobModal, setActiveJobModal] = useState<JobPosting | null>(null);
  const [isTalentModalOpen, setIsTalentModalOpen] = useState<boolean>(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState<boolean>(false);

  // Synchronize route slug with active job modal
  useEffect(() => {
    if (slug) {
      const found = JOB_POSTINGS.find((j) => j.slug === slug);
      if (found) {
        setActiveJobModal(found);
      } else {
        setActiveJobModal(null);
      }
    } else {
      setActiveJobModal(null);
    }
  }, [slug]);

  // Gracefully close modal and restore /careers route if on deep-link
  const handleCloseJobModal = () => {
    setActiveJobModal(null);
    setApplicationSubmitted(false);
    if (slug) {
      navigate("/careers", { replace: true });
    }
  };

  // Keyboard Escape listener for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeJobModal) {
        handleCloseJobModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeJobModal, slug]);

  const isInvalidSlug = Boolean(slug && !JOB_POSTINGS.some((j) => j.slug === slug));

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return JOB_POSTINGS.filter((job) => {
      const matchesDept = selectedDept === "all" || job.departmentId === selectedDept;
      const matchesLocation = 
        locationFilter === "all" || 
        job.locationType.toLowerCase() === locationFilter.toLowerCase();
      const matchesSearch = 
        searchQuery === "" || 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesDept && matchesLocation && matchesSearch;
    });
  }, [selectedDept, locationFilter, searchQuery]);

  const getBenefitIcon = (name: string) => {
    switch (name) {
      case "TrendingUp":
        return <TrendingUp className="w-5 h-5 text-[#e57804]" />;
      case "Coins":
        return <CheckCircle2 className="w-5 h-5 text-amber-300" />;
      case "GraduationCap":
        return <GraduationCap className="w-5 h-5 text-[#e57804]" />;
      case "BookOpen":
        return <Cpu className="w-5 h-5 text-amber-300" />;
      case "Laptop":
        return <Laptop className="w-5 h-5 text-[#e57804]" />;
      case "Globe":
        return <Globe className="w-5 h-5 text-amber-300" />;
      case "HeartPulse":
        return <HeartPulse className="w-5 h-5 text-[#e57804]" />;
      default:
        return <Shield className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <>
      <SEO
        title={activeJobModal ? `${activeJobModal.title} — Careers — Zakeem Solutions` : "Careers & Engineering Fellowship — Zakeem Solutions"}
        description={activeJobModal ? activeJobModal.summary : "Join an elite engineering culture building mission-critical software systems, sovereign cloud platforms, and enterprise AI automation across Africa and globally."}
        canonical={activeJobModal ? `https://www.zakeemsolutions.com/careers/${activeJobModal.slug}` : "https://www.zakeemsolutions.com/careers"}
      />

      {/* 1. CAREERS HERO */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 border-b border-white/10 overflow-hidden">
        {/* Ambient Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#e57804]/20 via-[#e57804]/5 to-transparent rounded-full blur-[140px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <Badge variant="neon">Engineering Fellowship & Open Roles</Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-[1.15] mb-6">
              Build high-consequence technology with{" "}
              <span className="bg-gradient-to-r from-slate-950 via-amber-700 to-[#e57804] dark:from-white dark:via-amber-200 dark:to-[#e57804] bg-clip-text text-transparent">
                exceptional minds.
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto mb-10">
              We are assembling an elite team of distributed systems engineers, AI researchers, product architects, and enterprise advisory leaders who reject superficial code and build software for multi-decade durability.
            </p>

            {/* Quick Metrics */}
            <div data-surface="dark" className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto p-3 rounded-2xl bg-[#081c38]/80 border border-white/10 backdrop-blur-xl">
              <div className="p-3 border-r border-white/10">
                <div className="text-xs font-mono text-[#e57804] font-semibold">CULTURE</div>
                <div className="text-sm font-bold text-white mt-0.5">High Agency</div>
              </div>
              <div className="p-3 border-r border-white/10">
                <div className="text-xs font-mono text-amber-300 font-semibold">WORKSTATION</div>
                <div className="text-sm font-bold text-white mt-0.5">M-Series / Linux</div>
              </div>
              <div className="p-3 border-r border-white/10">
                <div className="text-xs font-mono text-white font-semibold">FELLOWSHIP</div>
                <div className="text-sm font-bold text-white mt-0.5">20% Research</div>
              </div>
              <div className="p-3">
                <div className="text-xs font-mono text-[#e57804] font-semibold">LOCATION</div>
                <div className="text-sm font-bold text-white mt-0.5">Remote & Hubs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CULTURE & WHY ZAKEEM */}
      <section className="py-20 bg-[#040e1d] border-b border-white/10 relative" data-surface="dark">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <SectionHeader
            badge="Engineering Philosophy"
            title="The Principles That Govern"
            highlightedWord="Our Work."
            description="We do not operate like a traditional agency. We work with the intellectual rigor of a research lab and the precision of an aerospace contractor."
            align="center"
            inverted={true}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {CULTURE_PILLARS.map((pillar) => (
              <div 
                key={pillar.id}
                data-surface="dark"
                className="p-6 rounded-2xl bg-[#081c38] border border-white/10 hover:border-[#e57804]/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <span className="text-3xl font-mono font-extrabold text-[#e57804] block mb-3">
                    {pillar.number}
                  </span>
                  <h3 className="text-lg font-bold text-white mb-2">{pillar.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                    {pillar.description}
                  </p>
                </div>
                {pillar.metric && (
                  <div className="pt-3 border-t border-white/10 text-xs font-mono text-amber-300 font-semibold">
                    {pillar.metric}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. OPEN POSITIONS ARCHITECTURE */}
      <section id="open-positions" className="py-20 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
            <SectionHeader
              badge="Active Openings"
              title="Current Opportunities Across"
              highlightedWord="Core Disciplines."
              description="Review open senior opportunities. Every application is reviewed directly by our CTO and lead engineering panel."
              className="mb-0"
            />
            
            <button
              onClick={() => setIsTalentModalOpen(true)}
              data-surface="dark"
              className="px-4 py-2.5 rounded-xl border border-white/15 bg-[#081c38] hover:bg-[#0c254c] text-xs font-semibold text-white transition-colors shrink-0 flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4 text-[#e57804]" />
              <span>Join Speculative Talent Network</span>
            </button>
          </div>

          {/* Invalid Role Slug Notice */}
          {isInvalidSlug && (
            <div data-surface="dark" className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-8 flex items-start gap-3.5">
              <AlertCircle className="w-5 h-5 text-[#e57804] shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-white mb-0.5">Position Not Found</p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The requested career opening <code className="text-amber-300 font-mono">"{slug}"</code> is no longer active or could not be found. Please review our current open positions below.
                </p>
              </div>
            </div>
          )}

          {/* Department Filters & Search Controls */}
          <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-white/10 mb-8 space-y-4">
            {/* Department Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {CAREER_DEPARTMENTS.map((dept) => {
                const isSelected = selectedDept === dept.id;
                return (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDept(dept.id)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer",
                      isSelected
                        ? "bg-[#e57804] text-black font-bold shadow-md shadow-[#e57804]/20"
                        : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {dept.name}
                  </button>
                );
              })}
            </div>

            {/* Search Bar and Location Type Filters */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-white/5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by role title, keyword or technology stack (e.g. Go, PyTorch, Kubernetes)..."
                  className="w-full bg-[#040e1d] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#e57804] transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 hidden sm:inline" />
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="bg-[#040e1d] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-[#e57804]"
                >
                  <option value="all">All Locations (Remote & Hubs)</option>
                  <option value="remote">Remote Only</option>
                  <option value="hybrid">Hybrid (Abuja / Lagos)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Listings Grid */}
          {filteredJobs.length === 0 ? (
            <div data-surface="dark" className="p-12 rounded-2xl bg-[#081c38]/50 border border-white/10 text-center max-w-xl mx-auto">
              <AlertCircle className="w-8 h-8 text-[#e57804] mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No Openings Matching Filter</h3>
              <p className="text-xs text-slate-300 mb-6">
                We couldn't find an open position matching your exact keywords. Consider joining our general talent network.
              </p>
              <Button variant="primary" size="sm" onClick={() => setIsTalentModalOpen(true)}>
                Submit Speculative Application
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  data-surface="dark"
                  className="group p-6 rounded-2xl bg-[#081c38] border border-white/10 hover:border-[#e57804]/50 hover:bg-[#0a2347] transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-[#e57804] px-2 py-0.5 rounded bg-[#e57804]/10">
                        {job.departmentName}
                      </span>
                      {job.isHot && (
                        <Badge variant="neon">High Priority Role</Badge>
                      )}
                      <span className="text-xs text-slate-400 font-mono">
                        Posted {job.postedDate}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-amber-200 transition-colors">
                      {job.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 max-w-3xl leading-relaxed">
                      {job.summary}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#e57804]" />
                        {job.location} ({job.locationType})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-300" />
                        {job.employmentType}
                      </span>
                      <span>•</span>
                      <span className="text-slate-300 font-semibold">
                        {job.experienceLevel}
                      </span>
                    </div>

                    {/* Tech Stack Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.techStack.map((tech, i) => (
                        <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/40 border border-white/5 text-slate-300">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-stretch sm:items-end justify-between gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                    {job.salaryRange && (
                      <span className="text-xs font-mono text-amber-300/90 font-medium hidden md:inline-block">
                        {job.salaryRange}
                      </span>
                    )}
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => {
                        setActiveJobModal(job);
                        navigate(`/careers/${job.slug}`);
                      }}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      className="w-full sm:w-auto"
                    >
                      View Role & Apply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. COMPREHENSIVE BENEFITS & WELLBEING */}
      <section className="py-20 bg-[#040e1d] border-t border-white/10 relative" data-surface="dark">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <SectionHeader
            badge="Fellowship Inclusions"
            title="Engineered to Support"
            highlightedWord="Peak Performance."
            description="We believe engineers do their best work when fully empowered, well-compensated, and freed from operational friction."
            align="center"
            inverted={true}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {COMPANY_BENEFITS.map((b) => (
              <div
                key={b.id}
                data-surface="dark"
                className="p-6 rounded-2xl bg-[#081c38] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    {getBenefitIcon(b.iconName)}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    {b.category}
                  </span>
                  <h3 className="text-base font-bold text-white mb-2">{b.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SPECULATIVE TALENT NETWORK CTA */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div data-surface="dark" className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#0a2347] via-[#081c38] to-[#040e1d] border border-[#e57804]/40 shadow-2xl relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <Badge variant="neon" className="mb-3">General Talent Network</Badge>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Don’t see your exact role listed?
              </h3>
              <p className="text-sm text-slate-200 mt-2 leading-relaxed">
                We always make room for world-class systems architects, high-throughput backend engineers, and AI researchers. Submit your background directly to our engineering leadership.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsTalentModalOpen(true)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="shrink-0"
            >
              Submit Credentials
            </Button>
          </div>
        </div>
      </section>

      {/* INTERACTIVE JOB SPECIFICATION MODAL */}
      {activeJobModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="job-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseJobModal();
            }
          }}
        >
          <div
            data-surface="dark"
            className="relative w-full max-w-3xl rounded-3xl bg-[#081c38] border border-white/20 p-6 sm:p-8 md:p-10 max-h-[90vh] overflow-y-auto shadow-2xl my-8"
          >
            {/* Close Button */}
            <button
              onClick={handleCloseJobModal}
              className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close role details modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-6 pr-8">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-mono text-[#e57804] px-2.5 py-0.5 rounded bg-[#e57804]/10 font-semibold">
                  {activeJobModal.departmentName}
                </span>
                <Badge variant="neon">{activeJobModal.employmentType}</Badge>
                <span className="text-xs font-mono text-slate-400">
                  {activeJobModal.experienceLevel} Level
                </span>
              </div>

              <h2 id="job-modal-title" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeJobModal.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 mt-2">
                <span className="flex items-center gap-1 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-[#e57804]" />
                  {activeJobModal.location}
                </span>
                {activeJobModal.salaryRange && (
                  <span className="text-amber-300 font-semibold">
                    {activeJobModal.salaryRange}
                  </span>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 mb-8">
              <h4 className="text-xs font-mono font-semibold text-amber-300 uppercase tracking-wider mb-1">
                Executive Overview
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {activeJobModal.summary}
              </p>
            </div>

            {/* Responsibilities */}
            <div className="mb-8">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-3">
                Key Responsibilities:
              </h3>
              <div className="space-y-2.5">
                {activeJobModal.responsibilities.map((r, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-[#e57804] shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="mb-8">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-3">
                Candidate Prerequisites:
              </h3>
              <div className="space-y-2.5">
                {activeJobModal.requirements.map((req, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div className="mb-8">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-3">
                Primary Technology Stack:
              </h3>
              <div className="flex flex-wrap gap-2">
                {activeJobModal.techStack.map((tech, idx) => (
                  <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded bg-black/50 border border-white/10 text-slate-200">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Role Benefits */}
            <div className="mb-8">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-3">
                Role Inclusions & Compensation:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeJobModal.benefits.map((b, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#e57804] shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Section */}
            <div className="p-6 rounded-2xl bg-[#040e1d] border border-[#e57804]/30">
              {applicationSubmitted ? (
                <div className="text-center py-4 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-[#e57804] mx-auto" />
                  <h4 className="text-base font-bold text-white">Application Received</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Your profile has been routed to our technical recruiting desk. If your credentials meet our engineering bar, a partner will reach out within 72 hours.
                  </p>
                </div>
              ) : (
                <div>
                  <h4 className="text-base font-bold text-white mb-2">Apply for this Position</h4>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    Submit your details below or email directly to{" "}
                    <a href={`mailto:careers@zakeemsolutions.com?subject=Application: ${activeJobModal.title}`} className="text-[#e57804] underline">
                      careers@zakeemsolutions.com
                    </a>
                  </p>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      setApplicationSubmitted(true);
                    }} 
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        required
                        type="text"
                        placeholder="Full Name"
                        className="bg-[#081c38] border border-white/10 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#e57804]"
                      />
                      <input
                        required
                        type="email"
                        placeholder="Work Email Address"
                        className="bg-[#081c38] border border-white/10 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#e57804]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        required
                        type="url"
                        placeholder="GitHub / Portfolio / LinkedIn URL"
                        className="bg-[#081c38] border border-white/10 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#e57804]"
                      />
                      <input
                        type="text"
                        placeholder="Current Location (City, Country)"
                        className="bg-[#081c38] border border-white/10 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#e57804]"
                      />
                    </div>

                    <textarea
                      rows={3}
                      placeholder="Brief note on the most complex technical system or product you have engineered..."
                      className="w-full bg-[#081c38] border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#e57804]"
                    />

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Data protected by Zakeem Security Policy.
                      </span>
                      <Button variant="primary" size="md" type="submit" rightIcon={<Send className="w-4 h-4" />}>
                        Transmit Application
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SPECULATIVE TALENT NETWORK MODAL */}
      {isTalentModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="talent-modal-title"
        >
          <div
            data-surface="dark"
            className="relative w-full max-w-2xl rounded-3xl bg-[#081c38] border border-white/20 p-6 sm:p-8 md:p-10 shadow-2xl my-8"
          >
            <button
              onClick={() => setIsTalentModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              aria-label="Close talent network modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <Badge variant="neon" className="mb-2">General Talent Roster</Badge>
              <h3 id="talent-modal-title" className="text-2xl font-bold text-white">
                Submit Speculative Application
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Tell us about your core technical specializations. We retain exceptional profiles for upcoming strategic expansions.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thank you. Your credentials have been routed to our technical talent pool.");
                setIsTalentModalOpen(false);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  required
                  type="text"
                  placeholder="Full Name"
                  className="bg-[#040e1d] border border-white/10 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#e57804]"
                />
                <input
                  required
                  type="email"
                  placeholder="Primary Email"
                  className="bg-[#040e1d] border border-white/10 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#e57804]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  className="bg-[#040e1d] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-[#e57804]"
                >
                  <option>Primary Domain: Distributed Backend (Go/Rust)</option>
                  <option>Primary Domain: AI & Machine Learning</option>
                  <option>Primary Domain: Cloud & SRE / DevOps</option>
                  <option>Primary Domain: Frontend & Product Design</option>
                  <option>Primary Domain: Enterprise Solutions Architecture</option>
                </select>

                <input
                  required
                  type="url"
                  placeholder="GitHub / LinkedIn / Portfolio URL"
                  className="bg-[#040e1d] border border-white/10 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#e57804]"
                />
              </div>

              <textarea
                rows={3}
                placeholder="Summarize your engineering expertise and the types of problems you want to solve at Zakeem..."
                className="w-full bg-[#040e1d] border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#e57804]"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="md"
                  type="button"
                  onClick={() => setIsTalentModalOpen(false)}
                  className="border-white/20 text-white hover:bg-white/10 hover:text-white"
                >
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit" rightIcon={<Send className="w-4 h-4" />}>
                  Register in Talent Network
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
