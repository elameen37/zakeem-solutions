import React, { useState } from "react";
import { Link } from "react-router-dom";
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
  BookOpen,
  Bot,
  Code2,
  Layers,
  HelpCircle,
  Check,
  Globe,
  ChevronDown,
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface CourseDetail {
  id: string;
  title: string;
  badge: string;
  category: "foundation" | "ai" | "web" | "dual" | "custom";
  level: "Beginner" | "Intermediate" | "Advanced" | "Executive";
  summary: string;
  description: string;
  targetAudience: string;
  modules: string[];
  outcomes: string[];
  icon: typeof Laptop;
}

const COURSES: CourseDetail[] = [
  {
    id: "digital-literacy",
    title: "Digital Literacy",
    badge: "Foundational",
    category: "foundation",
    level: "Beginner",
    icon: Laptop,
    summary: "Essential computer fluency, cloud collaboration tools, and cybersecurity hygiene for modern digital workplaces.",
    description: "Designed for individuals, corporate administrative teams, and career starters looking to build solid digital workplace mastery. Learn computer operating systems, enterprise cloud suites, secure internet navigation, and professional communication.",
    targetAudience: "Working professionals, career changers, administrative personnel, and students transitioning to digital roles.",
    modules: [
      "Computer Architecture & Operating Systems (Windows / macOS / Linux)",
      "Cloud Productivity Suites (Google Workspace, Microsoft 365, Cloud Drives)",
      "Enterprise Communication & Collaboration (Slack, Teams, Professional Email Etiquette)",
      "Internet Security Hygiene, Phishing Defense & Data Privacy Principles",
      "Spreadsheet Fundamentals, Data Organization & Digital Filing Structures",
    ],
    outcomes: [
      "Confident day-to-day computer operations in corporate environments",
      "Seamless mastery of cloud document collaboration and file sharing",
      "Strong foundational defense against phishing and online security risks",
      "Eligibility for professional administrative and entry tech positions",
    ],
  },
  {
    id: "futureready-ai",
    title: "FutureReadyAI",
    badge: "Most Popular",
    category: "ai",
    level: "Intermediate",
    icon: Bot,
    summary: "Master generative AI, advanced prompt engineering, and intelligent workplace workflow automation.",
    description: "An intensive, practical deep-dive into state-of-the-art generative artificial intelligence. Learn how to leverage cutting-edge foundation models to 10x your research, writing, data analysis, and business operations.",
    targetAudience: "Knowledge workers, executives, managers, engineers, marketers, and researchers who want to master practical AI tooling.",
    modules: [
      "Foundations of Large Language Models (LLMs) & Generative AI Systems",
      "Advanced Prompt Engineering Methodologies (CoT, ReAct, Role-Based, Few-Shot)",
      "Frontline AI Tooling: ChatGPT, Claude, Gemini, Perplexity & Midjourney",
      "AI for Business Operations, Report Generation & Executive Decision Support",
      "Building Automated Workflows with AI Integrations & Zapier/Make",
      "Ethical AI Governance, Data Security & Corporate Compliance",
    ],
    outcomes: [
      "Ability to engineer high-precision prompts for complex analytical tasks",
      "Automate repetitive daily workflows using integrated AI tools",
      "10x productivity acceleration in research, content, and strategy",
      "Practical understanding of AI data governance and enterprise safety",
    ],
  },
  {
    id: "web-dev-ai",
    title: "Web Development using AI",
    badge: "High Impact",
    category: "web",
    level: "Intermediate",
    icon: Code2,
    summary: "Build, debug, and deploy modern full-stack web applications accelerated by cutting-edge AI coding agents.",
    description: "Learn modern full-stack web development through an AI-augmented lens. You will build modern web apps using HTML5, modern JavaScript/TypeScript, React, Tailwind CSS, and RESTful APIs, while mastering AI coding companions (Copilot, Cursor, agentic developer workflows) to write cleaner code faster.",
    targetAudience: "Aspiring developers, technical product managers, designers, and builders who want to launch web applications.",
    modules: [
      "Modern Web Foundations: Semantic HTML5, Responsive CSS3 & Modern JavaScript (ES6+)",
      "Component-Driven UI Architecture with React & Tailwind CSS",
      "TypeScript Essentials for Scalable Enterprise Applications",
      "Backend Integration: Consuming RESTful APIs, JSON Data & Async State",
      "AI-Assisted Development: Prompt-Driven Coding, Copilot, Cursor & Code Refactoring",
      "Deployment Pipelines: Git, GitHub, Vercel & Production Cloud Hosting",
    ],
    outcomes: [
      "Build responsive, interactive single-page web applications from scratch",
      "Leverage AI coding companions to accelerate development velocity by 300%",
      "Deploy live production web applications with custom domains and cloud CI/CD",
      "Portfolio of functional projects to showcase to employers or clients",
    ],
  },
  {
    id: "digital-literacy-futureready-ai",
    title: "Digital Literacy and FutureReadyAI",
    badge: "Dual Track",
    category: "dual",
    level: "Beginner",
    icon: Layers,
    summary: "Complete dual-track curriculum combining foundational digital fluency with state-of-the-art AI skills.",
    description: "A comprehensive dual-discipline curriculum that takes you from fundamental computer fluency directly into cutting-edge generative AI capability. Perfect for individuals or organizations wanting a unified, complete digital leap.",
    targetAudience: "Learners seeking a full-spectrum upgrade from computer basics to advanced generative AI mastery.",
    modules: [
      "Full Digital Literacy Foundations (Operating Systems, Cloud Drives, Security)",
      "Office & Cloud Productivity Mastery (Google Workspace, Microsoft 365)",
      "Introduction to Artificial Intelligence & Modern LLM Tooling",
      "Prompt Engineering Fundamentals & Everyday Workflow Automation",
      "Integrating AI into Workplace Documents, Presentations & Data Spreadsheets",
      "Capstone Project: End-to-end digital transformation of a business workflow",
    ],
    outcomes: [
      "Holistic digital proficiency across both traditional and AI-first software tools",
      "Eliminate manual digital bottlenecks in corporate or personal work",
      "Dual qualification certified on one comprehensive Zakeem credential",
      "Confident competitive advantage in any modern technology-driven role",
    ],
  },
  {
    id: "futureready-ai-web-dev",
    title: "FutureReadyAI and Web Development using AI",
    badge: "Mastery Track",
    category: "dual",
    level: "Advanced",
    icon: Sparkles,
    summary: "Full technical mastery combining advanced generative AI engineering with modern full-stack web architectures.",
    description: "Our flagship technical track designed for aspiring modern software architects and builders. Master both prompt-driven agentic engineering and production full-stack web development with React, TypeScript, API design, and AI integrations.",
    targetAudience: "Software developers, tech leads, digital creators, and technical entrepreneurs who want full-stack AI superpower.",
    modules: [
      "Advanced Large Language Model Architectures & API Integration",
      "Full-Stack Web Engineering with React, TypeScript & Tailwind CSS",
      "Agentic Coding Workflows: AI-Assisted Architecture, Testing & Code Generation",
      "Integrating AI APIs (OpenAI, Gemini, Anthropic) into Web Applications",
      "State Management, Authentication & Secure Database Persistence",
      "Production Deployment, Security Hardening & Continuous Delivery",
    ],
    outcomes: [
      "Architect and ship full-stack web applications with embedded AI capabilities",
      "Master agentic developer tooling to build software at extraordinary velocity",
      "Launch functional SaaS prototypes or enterprise internal tools",
      "Senior-level mastery of AI-augmented modern web engineering",
    ],
  },
  {
    id: "customized-training",
    title: "Customized Training",
    badge: "Corporate & Executive",
    category: "custom",
    level: "Executive",
    icon: Building2,
    summary: "Tailored curriculum and executive masterclasses curated specifically to your organization's technical mandates.",
    description: "Designed exclusively for corporate enterprises, financial institutions, government agencies, and growing teams. We partner with your technical leadership to craft a bespoke curriculum aligned with your technology stack, security policies, and business objectives.",
    targetAudience: "Enterprises, SMEs, government ministries, departments, agencies, and technical teams.",
    modules: [
      "Custom syllabus engineered to your organization's specific technical ecosystem",
      "Dedicated, private live online cohorts reserved exclusively for your workforce",
      "Targeted modules: Cloud Architecture, Enterprise AI, Security, or Internal Stack",
      "Cohort progress monitoring, milestone assessments & executive attendance reports",
      "Flexible schedule tailored to your enterprise's operational calendar",
    ],
    outcomes: [
      "Direct workforce capability uplift mapped to organizational OKRs",
      "Cohesive team alignment on modern AI tooling and engineering standards",
      "Custom corporate certification and institutional completion verification",
      "Dedicated Zakeem Lead Instructor and executive onboarding support",
    ],
  },
];

const FAQS = [
  {
    q: "Is the training delivered fully online or in-person?",
    a: "All Zakeem IT Training programmes are 100% fully online. Sessions are conducted live in interactive virtual classrooms with real-time screen sharing, live code walk-throughs, and interactive Q&A led by senior Zakeem engineering instructors.",
  },
  {
    q: "What is the weekly schedule and session duration?",
    a: "Training is scheduled for exactly 3 days per week, with each session lasting 2 focused hours (120 minutes). When applying, you select your preferred 3 days (e.g. Monday/Wednesday/Friday or Tuesday/Thursday/Saturday) and your preferred time slot.",
  },
  {
    q: "What timezone are the sessions scheduled in?",
    a: "All sessions are scheduled in West Africa Time (WAT / Africa/Lagos timezone, UTC+1). We offer morning, afternoon, and evening slots to accommodate working professionals and university students across Africa and international remote participants.",
  },
  {
    q: "Will I receive a Certificate of Completion?",
    a: "Yes. Every participant who completes the required course sessions, practical assignments, and capstone project receives an official, verifiable Zakeem Solutions Certificate of Completion with a unique digital credential ID.",
  },
  {
    q: "Can my company or organization enroll multiple employees?",
    a: "Yes. When applying, select 'Organization' on the form. Organizations can enroll teams in any of our standard tracks or request 'Customized Training' to receive a private virtual classroom cohort, custom syllabus, and executive progress tracking.",
  },
  {
    q: "What technical equipment or prerequisites do I need?",
    a: "You need a laptop or desktop computer with a reliable internet connection, a modern web browser (Google Chrome, Microsoft Edge, or Firefox), and a working microphone for live interactive discussions. Specific software tools (such as VS Code or Git) will be set up during your onboarding.",
  },
];

export const ITTrainingPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const filteredCourses = activeCategory === "all"
    ? COURSES
    : COURSES.filter((c) => c.category === activeCategory || (activeCategory === "dual" && c.category === "dual"));

  return (
    <>
      <SEO
        title="Zakeem IT Training | Online AI & Software Certification Programmes"
        description="Advance your career or upskill your enterprise team with Zakeem Solutions IT Training. 100% fully online, live structured sessions, and verified Certificate of Completion."
        canonical="https://www.zakeemsolutions.com/it-training"
      />

      <div className="relative min-h-screen bg-[#030d1a] text-slate-100 overflow-hidden pt-24 pb-20">
        {/* Ambient Glow Effects */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[850px] h-[350px] bg-gradient-to-r from-[#e57804]/15 via-blue-600/10 to-indigo-600/15 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-96 right-10 w-[450px] h-[450px] bg-[#e57804]/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="container mx-auto px-4 max-w-7xl relative z-10 space-y-20">
          
          {/* ================================================================= */}
          {/* 1. HERO SECTION                                                   */}
          {/* ================================================================= */}
          <section className="text-center max-w-4xl mx-auto space-y-6 pt-4 sm:pt-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e57804]/15 border border-[#e57804]/30 text-[#e57804] text-xs font-mono font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              100% Fully Online • Live Structured Learning
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Professional IT Training for <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#e57804]">
                Modern Engineers & Leaders
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Cohort-driven technology programmes delivered live online by senior engineering architects.
              Master digital literacy, generative AI workflows, and modern web development from anywhere.
            </p>

            {/* Core Feature Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200">
                <Laptop className="w-3.5 h-3.5 text-[#e57804]" /> 100% Fully Online
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200">
                <Calendar className="w-3.5 h-3.5 text-[#e57804]" /> 3 Days Per Week
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200">
                <Clock className="w-3.5 h-3.5 text-[#e57804]" /> 2 Hours Per Session
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200">
                <Award className="w-3.5 h-3.5 text-emerald-400" /> Certificate of Completion
              </span>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                variant="primary"
                size="lg"
                href="/training"
                className="w-full sm:w-auto text-sm px-8 py-3.5 shadow-xl shadow-[#e57804]/20 group"
              >
                Apply for IT Training
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                href="#courses"
                className="w-full sm:w-auto text-sm px-7 py-3.5 border-white/20 text-white hover:bg-white/10"
              >
                <BookOpen className="w-4 h-4 mr-2 text-[#e57804]" />
                Explore All 6 Courses
              </Button>
              <Button
                variant="outline"
                size="lg"
                href="/training/status"
                className="w-full sm:w-auto text-sm px-7 py-3.5 border-white/20 text-slate-200 hover:text-white hover:bg-white/10"
              >
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />
                Track Application Status
              </Button>
            </div>
          </section>

          {/* ================================================================= */}
          {/* 2. CORE VALUE PILLARS                                             */}
          {/* ================================================================= */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#06152b] border border-white/10 hover:border-white/20 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#e57804]/10 border border-[#e57804]/30 flex items-center justify-center text-[#e57804]">
                <Laptop className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Live Virtual Classrooms</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Zero pre-recorded passive lectures. Join live, interactive online sessions with real-time Q&A, active screen sharing, and hands-on coding demonstrations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#06152b] border border-white/10 hover:border-white/20 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Predictable 3-Day Schedule</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Structured for busy professionals and students. Exactly 3 training days per week, 2 hours per session, scheduled in West Africa Time (Africa/Lagos).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#06152b] border border-white/10 hover:border-white/20 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Verifiable Certification</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Earn an official Zakeem Solutions Certificate of Completion upon finishing coursework, validating your practical competencies to hiring managers and teams.
              </p>
            </div>
          </section>

          {/* ================================================================= */}
          {/* 3. COURSE CATALOG SECTION                                         */}
          {/* ================================================================= */}
          <section id="courses" className="space-y-8 scroll-mt-28">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <Badge variant="outline" className="border-[#e57804]/40 text-[#e57804]">
                Course Curriculum
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Comprehensive Technology Programmes
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                From core digital literacy to cutting-edge generative AI and web architecture, each programme delivers practical mastery designed for immediate workplace impact.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
              {[
                { id: "all", label: "All Courses (6)" },
                { id: "foundation", label: "Foundations" },
                { id: "ai", label: "Artificial Intelligence" },
                { id: "web", label: "Web Development" },
                { id: "dual", label: "Dual & Mastery Tracks" },
                { id: "custom", label: "Corporate / Custom" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                    activeCategory === tab.id
                      ? "bg-[#e57804] text-white shadow-lg shadow-[#e57804]/30"
                      : "bg-[#06152b] border border-white/10 text-slate-300 hover:text-white hover:border-white/20"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Course Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredCourses.map((course) => {
                const IconComponent = course.icon;
                const applyUrl = `/training?course=${encodeURIComponent(course.title)}${course.category === "custom" ? "&type=organization" : ""}`;

                return (
                  <div
                    key={course.id}
                    className="p-6 sm:p-8 rounded-3xl bg-[#06152b] border border-white/10 hover:border-[#e57804]/40 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-xl relative group"
                  >
                    <div className="space-y-5">
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[#e57804] group-hover:bg-[#e57804]/15 group-hover:border-[#e57804]/30 transition-colors">
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                              {course.level} Level
                            </span>
                            <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#e57804] transition-colors">
                              {course.title}
                            </h3>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#e57804]/15 border border-[#e57804]/30 text-[#e57804] font-semibold shrink-0">
                          {course.badge}
                        </span>
                      </div>

                      <p className="text-sm text-slate-300 leading-relaxed">
                        {course.description}
                      </p>

                      {/* Specs Pill List */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5 text-xs text-slate-300">
                        <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                          <strong>Mode:</strong> 100% Online
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                          <strong>Schedule:</strong> 3 Days / Week
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                          <strong>Duration:</strong> 2 Hours / Session
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-emerald-400">
                          <strong>Credential:</strong> Certificate
                        </span>
                      </div>

                      {/* Target Audience */}
                      <div className="text-xs bg-white/5 p-3 rounded-xl border border-white/5 text-slate-300">
                        <strong className="text-white block mb-0.5">Target Audience:</strong>
                        {course.targetAudience}
                      </div>

                      {/* Syllabus Modules */}
                      <div className="space-y-2 pt-2">
                        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                          Key Curriculum Modules:
                        </h4>
                        <ul className="space-y-1.5 text-xs text-slate-300">
                          {course.modules.map((mod, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#e57804] shrink-0 mt-0.5" />
                              <span>{mod}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Outcomes */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                          Measurable Outcomes:
                        </h4>
                        <ul className="space-y-1 text-xs text-slate-300">
                          {course.outcomes.map((out, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{out}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Card Action Link to Form */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                      <span className="text-xs text-slate-400 font-mono">
                        Applications open for next cohort
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        href={applyUrl}
                        className="text-xs px-4 py-2 group/btn"
                      >
                        Apply for this Course
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ================================================================= */}
          {/* 4. AUDIENCE TRACKS (INDIVIDUALS VS ORGANIZATIONS)                 */}
          {/* ================================================================= */}
          <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#06152b] via-[#081c38] to-[#06152b] border border-white/15 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <Badge variant="outline" className="border-blue-400/40 text-blue-400">
                Enrollment Pathways
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Engineered for Both Individuals & Corporate Teams
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Choose the application stream tailored to your career transformation or institutional objectives.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Individual Track */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#e57804]/20 border border-[#e57804]/40 flex items-center justify-center text-[#e57804]">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Individual Professionals & Students</h3>
                    <p className="text-xs text-slate-400">Direct personal career upskilling</p>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#e57804] shrink-0 mt-0.5" />
                    <span>Personalized mentor feedback on coding and AI prompt assignments.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#e57804] shrink-0 mt-0.5" />
                    <span>Cohort interaction with fellow ambitious tech builders across regions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#e57804] shrink-0 mt-0.5" />
                    <span>Direct credential issuance shareable on LinkedIn and digital resumes.</span>
                  </li>
                </ul>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    href="/training?type=individual"
                    className="w-full text-xs border-white/20 text-white hover:bg-white/10"
                  >
                    Apply as an Individual
                  </Button>
                </div>
              </div>

              {/* Organization Track */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Enterprises, SMEs & Institutions</h3>
                    <p className="text-xs text-slate-400">Corporate workforce capability transformation</p>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>Dedicated private virtual classrooms tailored to your staff timetable.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>Automated CRM lead tracking, corporate invoicing, and progress reporting.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>Customized curriculum aligned with internal tools, data privacy, and goals.</span>
                  </li>
                </ul>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    href="/training?type=organization"
                    className="w-full text-xs"
                  >
                    Apply as an Organization
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* ================================================================= */}
          {/* 5. HOW IT WORKS (APPLICATION TO CERTIFICATION)                    */}
          {/* ================================================================= */}
          <section className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-400">
                Simple Roadmap
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                How Zakeem IT Training Works
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Four clear steps from online application to certified credential.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: "01",
                  title: "Submit Online Application",
                  desc: "Complete the form at /training in 3 minutes. Choose your course, individual or corporate status, and preferred 3 days & time slot.",
                },
                {
                  step: "02",
                  title: "Admissions & Schedule",
                  desc: "Our admissions desk reviews your schedule preferences, confirms your cohort timetable, and sends your virtual classroom access.",
                },
                {
                  step: "03",
                  title: "Live Virtual Sessions",
                  desc: "Attend 3 interactive live sessions weekly (2 hours each) led by senior Zakeem engineering leads with practical exercises.",
                },
                {
                  step: "04",
                  title: "Earn Your Certificate",
                  desc: "Complete your practical capstone deliverables and receive an official, verifiable Zakeem Solutions Certificate of Completion.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#06152b] border border-white/10 relative space-y-3"
                >
                  <span className="text-3xl font-mono font-black text-[#e57804]/40 block">
                    {item.step}
                  </span>
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ================================================================= */}
          {/* 6. CERTIFICATE OF COMPLETION SHOWCASE                             */}
          {/* ================================================================= */}
          <section className="p-8 sm:p-10 rounded-3xl bg-[#06152b] border border-[#e57804]/30 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
                  <Award className="w-3.5 h-3.5" />
                  Verified Digital Credential
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  Issued Upon Successful Completion
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Every participant who attends the live online sessions and demonstrates competence through assignments receives the official <strong>Zakeem Solutions Certificate of Completion</strong>.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Unique verifiable digital credential reference number.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Signed and authorized by Zakeem Solutions senior engineering executives.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Recognized validation for LinkedIn profiles, CVs, and corporate promotions.</span>
                  </li>
                </ul>
              </div>

              {/* Certificate Mock Card */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#081c38] border border-amber-500/30 shadow-2xl relative space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#e57804] flex items-center justify-center font-bold text-white text-xs">
                      ZS
                    </div>
                    <span className="font-bold text-sm text-white tracking-wider">ZAKEEM SOLUTIONS</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    VERIFIED CREDENTIAL
                  </span>
                </div>

                <div className="text-center py-4 space-y-1">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[#e57804]">Certificate of Completion</p>
                  <p className="text-xs text-slate-300">This is to certify that</p>
                  <p className="text-lg font-bold text-white font-serif">Candidate Name</p>
                  <p className="text-xs text-slate-300">has successfully completed the live online programme</p>
                  <p className="text-sm font-semibold text-[#e57804]">FutureReadyAI and Web Development using AI</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[10px] font-mono text-slate-400">
                  <span>ID: ZIT-CERT-XXXXX</span>
                  <span>WAT / Africa/Lagos</span>
                  <span>Issued by Zakeem Solutions</span>
                </div>
              </div>
            </div>
          </section>

          {/* ================================================================= */}
          {/* 7. FAQS SECTION                                                   */}
          {/* ================================================================= */}
          <section className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <Badge variant="outline" className="border-white/20 text-slate-300">
                Frequently Asked Questions
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Everything You Need to Know
              </h2>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl bg-[#06152b] border border-white/10 overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-white hover:text-[#e57804] transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <HelpCircle className="w-4 h-4 text-[#e57804] shrink-0" />
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200",
                          isOpen ? "rotate-180 text-[#e57804]" : ""
                        )}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 animate-in fade-in duration-200">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ================================================================= */}
          {/* 8. BOTTOM CONVERSION CTA BANNER                                   */}
          {/* ================================================================= */}
          <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#081c38] via-[#06152b] to-[#081c38] border border-[#e57804]/40 text-center space-y-6 shadow-2xl relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e57804]/10 border border-[#e57804]/30 text-[#e57804] text-xs font-mono font-semibold">
              <GraduationCap className="w-4 h-4" /> Next Cohort Enrollment Is Open
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white max-w-2xl mx-auto leading-tight">
              Ready to Accelerate Your Technical Capabilities?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Complete the quick online application form to reserve your course and schedule preferences.
              Sessions are 100% online, 3 days per week, and 2 hours per session.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                href="/training"
                className="w-full sm:w-auto text-sm px-8 py-3.5 shadow-xl shadow-[#e57804]/30 group"
              >
                Go to Online Application Form
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                href="/training/status"
                className="w-full sm:w-auto text-sm px-7 py-3.5 border-white/20 text-white hover:bg-white/10"
              >
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />
                Track Application Status
              </Button>
              <Button
                variant="outline"
                size="lg"
                href="/contact"
                className="w-full sm:w-auto text-sm px-7 py-3.5 border-white/20 text-white hover:bg-white/10"
              >
                Contact Admissions Desk
              </Button>
            </div>
          </section>

        </div>
      </div>
    </>
  );
};
