import React from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, ShieldCheck, Cpu, Code2, Bot, Layers, 
  CheckCircle2, Building2, BarChart2, Globe, Server, Terminal, Lock
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { ProductCard } from "@/components/ui/ProductCard";
import { SolutionCard } from "@/components/ui/SolutionCard";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { ZakeemRealtyERPHighlight } from "@/components/ui/ZakeemRealtyERPHighlight";
import { TheZakeemStandard } from "@/components/ui/TheZakeemStandard";
import { HomeValueComparison } from "@/components/ui/HomeValueComparison";
import { CTASection } from "@/components/ui/CTASection";
import { ShinyText } from "@/components/ui/ShinyText";
import { HeroFloatingIcons } from "@/components/ui/HeroFloatingIcons";
import { ZAKEEM_APPLICATIONS } from "@/data/ecosystem";
import { SOLUTIONS } from "@/data/solutions";
import { SERVICES } from "@/data/services";

export const HomePage: React.FC = () => {
  return (
    <>
      <SEO
        title="Zakeem Solutions — Technology • Intelligence • Delivery"
        description="Premium African technology and digital transformation company delivering enterprise software engineering, AI-powered automation, Zakeem Realty ERP, and mission-critical cloud infrastructure."
      />

      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 lg:pt-24 lg:pb-36 overflow-hidden">
        {/* Architectural Ambient Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-[#e57804]/20 via-[#e57804]/5 to-transparent rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* 20 Core Business Floating Ambient Icons */}
        <HeroFloatingIcons />

        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Top Brand Pill */}
            <div className="flex justify-center mb-6">
              <Badge variant="neon">
                <ShinyText
                  text="Technology • Intelligence • Delivery"
                  speed={2.5}
                  delay={0}
                  color="#e57804"
                  shineColor="#efb273"
                  spread={120}
                  direction="left"
                  yoyo={false}
                  pauseOnHover={true}
                />
              </Badge>
            </div>

            {/* Hero Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-[1.1] mb-6">
              Technology that moves{" "}
              <span className="bg-gradient-to-r from-slate-950 via-amber-700 to-[#e57804] dark:from-white dark:via-amber-200 dark:to-[#e57804] bg-clip-text text-transparent">
                enterprises forward.
              </span>
            </h1>

            {/* Value Proposition */}
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-200 font-normal leading-relaxed max-w-2xl mx-auto mb-10">
              Zakeem Solutions engineers high-consequence software, deployable AI automation, and proprietary enterprise platforms designed for the world’s most demanding industries.
            </p>

            {/* Core Action Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button
                variant="primary"
                size="lg"
                href="/request-demo"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Request a Demo
              </Button>
              <Button
                variant="outline"
                size="lg"
                href="/solutions"
                className="w-full sm:w-auto"
              >
                Explore Solutions
              </Button>
            </div>

            {/* Four Strategic Pillars Bar */}
            <div data-surface="dark" className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 p-3 rounded-2xl bg-[#081c38]/90 border border-white/10 backdrop-blur-xl max-w-3xl mx-auto text-left">
              <div className="p-3 border-r border-white/10 last:border-0">
                <div className="text-xs font-mono text-[#e57804] font-semibold">01 / SOFTWARE</div>
                <div className="text-sm font-bold text-white mt-0.5">Core Engineering</div>
              </div>
              <div className="p-3 border-r border-white/10 last:border-0">
                <div className="text-xs font-mono text-amber-300 font-semibold">02 / AI</div>
                <div className="text-sm font-bold text-white mt-0.5">Domain Intelligence</div>
              </div>
              <div className="p-3 border-r border-white/10 last:border-0">
                <div className="text-xs font-mono text-white font-semibold">03 / TRANSFORMATION</div>
                <div className="text-sm font-bold text-white mt-0.5">Enterprise Scale</div>
              </div>
              <div className="p-3">
                <div className="text-xs font-mono text-[#e57804] font-semibold">04 / PRODUCTS</div>
                <div className="text-sm font-bold text-white mt-0.5">SaaS Platforms</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CREDIBILITY & MEASURABLE OUTCOMES BAR */}
      <section data-surface="dark" className="py-12 bg-[#040e1d] border-y border-white/10 relative z-20">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              value="99.99%"
              label="Core System SLA"
              subtext="Mission-critical uptime guarantee for tier-1 enterprises"
              trend="Guaranteed"
            />
            <MetricCard
              value="14+"
              label="Enterprise ERP Modules"
              subtext="Turnkey sales, land registry, and financial control"
              trend="v2.4 Live"
            />
            <MetricCard
              value="<250ms"
              label="AI Inference Latency"
              subtext="Locally fine-tuned domain cognitive models"
              trend="Ultra-Fast"
            />
            <MetricCard
              value="10+"
              label="Regulated Sectors"
              subtext="Banking, Real Estate, Government, Energy, & Health"
              trend="Pan-African"
            />
          </div>
        </div>
      </section>

      {/* 3. DUAL IDENTITY: SERVICES + PLATFORM ECOSYSTEM */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <SectionHeader
            badge="The Zakeem Architecture"
            title="Two Pillars. One Unified"
            highlightedWord="Technology Force."
            description="Zakeem Solutions operates at the intersection of elite custom engineering and high-leverage digital products. We don't just advise; we architect and deploy."
            align="center"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pillar 1: Enterprise Technology Services */}
            <div data-surface="dark" className="p-8 md:p-10 rounded-3xl bg-gradient-to-b from-[#081c38] to-[#040e1d] border border-white/15 relative overflow-hidden group hover:border-[#e57804]/60 transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#e57804]/15 border border-[#e57804]/30 flex items-center justify-center">
                  <Code2 className="w-6 h-6 text-[#e57804]" />
                </div>
                <Badge variant="blue">Pillar I</Badge>
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Technology Services & Delivery
              </h3>
              <p className="text-sm md:text-base text-slate-200 leading-relaxed mb-6">
                Dedicated engineering pods, board-level technical advisory, and sovereign cloud infrastructure for institutions undertaking mission-critical digital modernization.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-xs md:text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#e57804]" />
                  <span>Custom High-Concurrency Software Engineering</span>
                </div>
                <div className="flex items-center gap-3 text-xs md:text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#e57804]" />
                  <span>Private LLM Fine-Tuning & Autonomous Workflows</span>
                </div>
                <div className="flex items-center gap-3 text-xs md:text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#e57804]" />
                  <span>Zero-Trust Cybersecurity & Regulatory Compliance</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="md"
                href="/services"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto text-white border-white/20 hover:border-[#e57804] hover:bg-white/10"
              >
                Explore Services Practice
              </Button>
            </div>

            {/* Pillar 2: Proprietary Digital Products */}
            <div data-surface="dark" className="p-8 md:p-10 rounded-3xl bg-gradient-to-b from-[#081c38] to-[#040e1d] border border-white/15 relative overflow-hidden group hover:border-[#e57804]/60 transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#e57804]/20 border border-[#e57804]/40 flex items-center justify-center">
                  <Layers className="w-6 h-6 text-[#e57804]" />
                </div>
                <Badge variant="neon">Pillar II</Badge>
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Proprietary Product Platforms
              </h3>
              <p className="text-sm md:text-base text-slate-200 leading-relaxed mb-6">
                Deep vertical platforms engineered to solve stubborn structural inefficiencies in African and emerging-market industries. Led by our flagship Zakeem Realty ERP.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-xs md:text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#e57804]" />
                  <span>Zakeem Realty ERP — Complete Real Estate Operating System</span>
                </div>
                <div className="flex items-center gap-3 text-xs md:text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#e57804]" />
                  <span>Zakeem Cortex AI — Document Intelligence & Cognition</span>
                </div>
                <div className="flex items-center gap-3 text-xs md:text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#e57804]" />
                  <span>Zakeem Flow — B2B Procurement & Supplier Reconciliation</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                href="/products"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Explore Product Platforms
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FLAGSHIP PRODUCT EXPERIENCE: ZAKEEM REALTY ERP */}
      <ZakeemRealtyERPHighlight />

      {/* 5. PRODUCT ECOSYSTEM GRID */}
      <section className="py-20 lg:py-28 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <SectionHeader
            badge="Product Ecosystem"
            title="Engineered for Autonomy."
            highlightedWord="Built for Scale."
            description="Our software products are built on a shared enterprise foundation: multi-tenant architecture, bank-grade encryption, and granular permission boundaries."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {ZAKEEM_APPLICATIONS.map((app) => (
              <ProductCard key={app.id} product={app} featured={app.featured} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. INDUSTRY SOLUTIONS MATRIX */}
      <section data-surface="dark" className="py-20 lg:py-28 bg-[#040e1d] border-y border-white/10 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
            <SectionHeader
              badge="Industry Solutions"
              title="Tailored Transformation Across"
              highlightedWord="10 Core Sectors."
              description="We combine deep industry operational knowledge with modern software engineering to resolve stubborn regulatory, logistics, and data bottlenecks."
              className="mb-0"
              inverted={true}
            />
            <Button variant="outline" size="md" href="/solutions" rightIcon={<ArrowRight className="w-4 h-4" />} className="text-white border-white/20 hover:border-[#e57804] hover:bg-white/10">
              View All 10 Solutions
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SOLUTIONS.slice(0, 6).map((sol) => (
              <SolutionCard key={sol.id} solution={sol} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. SERVICES CAPABILITIES */}
      <section className="py-20 lg:py-28 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <SectionHeader
            badge="Engineering & Advisory"
            title="World-Class Services."
            highlightedWord="Predictable Delivery."
            description="From initial architectural audits to large-scale distributed implementations, our teams operate with rigorous mathematical precision and code transparency."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.slice(0, 4).map((svc) => (
              <ServiceCard key={svc.id} service={svc} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button variant="secondary" size="md" href="/services" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All Engineering & Advisory Services
            </Button>
          </div>
        </div>
      </section>

      {/* 8. ADVANCED WORKFLOW: THE ZAKEEM STANDARD */}
      <TheZakeemStandard />

      {/* 9. STRATEGIC VALUE & COMPARISON (WHY ZAKEEM) */}
      <HomeValueComparison />

      {/* 10. HIGH-CONVERSION ENTERPRISE CTA */}
      <CTASection />
    </>
  );
};