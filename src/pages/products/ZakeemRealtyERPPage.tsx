import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Building2, ShieldCheck, CheckCircle2, ArrowRight, ExternalLink, KeyRound, 
  MapPin, DollarSign, FileText, Cpu, Users, BarChart3, Wrench, Briefcase, 
  Layers, Lock, Database, Check
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CTASection } from "@/components/ui/CTASection";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

export const ZakeemRealtyERPPage: React.FC = () => {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);

  const modules = [
    {
      id: "sales",
      title: "Property Sales & Allocation",
      icon: DollarSign,
      highlight: "First-Class Sales Engine",
      description: "Complete off-plan reservation pipelines, dynamic pricing tiers, milestone installment schedules, digital payment receipts, and automated deed generation upon threshold settlement.",
      capabilities: [
        "Interactive unit availability & lock prevention",
        "Automated installment invoicing & arrears escalations",
        "Realtor & broker commission split calculation",
        "Direct bank webhook & payment gateway reconciliation"
      ]
    },
    {
      id: "land",
      title: "GIS Land Registry & Subdivision",
      icon: MapPin,
      highlight: "Acreage to Plot Layout",
      description: "Manage raw acreage acquisition, beacon survey coordinates, government title regularizations (C of O, Gazette, Governor's Consent), and dynamic graphical plot demarcation.",
      capabilities: [
        "Interactive SVG/GIS layout maps with live plot statuses",
        "Beacon number registration & boundary verification",
        "Excision & title documentation archives",
        "Automated Deed of Assignment drafting"
      ]
    },
    {
      id: "crm",
      title: "Client & Investor CRM",
      icon: Users,
      highlight: "Unified Lead-to-Buyer Lifecycle",
      description: "Single panoramic view of high-net-worth buyers, corporate tenants, real estate syndicates, and diaspora investors with integrated communication logs.",
      capabilities: [
        "KYC compliance document verification & approval workflows",
        "WhatsApp & Email automated notification dispatch",
        "Diaspora investor multi-currency tracking",
        "Investor portfolio equity and yield statements"
      ]
    },
    {
      id: "facility",
      title: "Property Management & Leasing",
      icon: Building2,
      highlight: "Operational Facility Command",
      description: "Comprehensive multi-tenant lease accounting, automated service charge billing, maintenance ticketing, visitor access control, and smart meter vending.",
      capabilities: [
        "Digital tenant lease agreements & digital signatures",
        "Automated annual/quarterly rent escalation indexing",
        "Preventative equipment maintenance work-orders",
        "Utility metering & vending payment gateways"
      ]
    },
    {
      id: "finance",
      title: "General Ledger & Construction Finance",
      icon: FileText,
      highlight: "Audit-Grade Accounting",
      description: "Multi-entity accounting built for property developers. Track site Bill of Quantities (BOQ), material purchase orders, contractor retention sums, and joint-venture accounts.",
      capabilities: [
        "Multi-company & JV consolidated balance sheets",
        "3-way purchase order, GRN, and invoice matching",
        "Contractor milestone sign-off & retention disbursements",
        "WHT, VAT, and company income tax reporting"
      ]
    },
    {
      id: "ai",
      title: "Zakky AI Predictive Intelligence",
      icon: Cpu,
      highlight: "Proprietary Real Estate AI",
      description: "Built-in machine learning models that analyze historical regional transaction data, estimate real-time market value appraisals, and predict tenant delinquency risk.",
      capabilities: [
        "Automated Comparative Market Analysis (CMA)",
        "Contract clause semantic extraction & risk review",
        "Predictive cashflow modeling for active construction sites",
        "Conversational natural-language query over property records"
      ]
    },
    {
      id: "procurement",
      title: "Site Procurement & Inventory",
      icon: Layers,
      highlight: "Supply Chain Transparency",
      description: "End-to-end management of construction site requisitions, cement/steel batch tracking, storekeeper logs, and supplier rate negotiation.",
      capabilities: [
        "Site store inventory tracking with min/max replenishment alerts",
        "Vendor pre-qualification & RFP evaluation matrix",
        "Material waste & site scrap audit logs",
        "Digital delivery notes with geo-tagged receiver signatures"
      ]
    },
    {
      id: "legal",
      title: "Legal & Title Governance",
      icon: ShieldCheck,
      highlight: "Contract Compliance",
      description: "Centralized legal repository for land litigation monitoring, perfection of titles, governor’s consent processing, and standardized contract templates.",
      capabilities: [
        "Statutory filing deadlines & renewal calendar alerts",
        "Standardized contract builder with version tracking",
        "Dispute tracking & legal retainer budget allocation",
        "Tamper-proof digital document hashing"
      ]
    }
  ];

  const activeModule = modules[activeModuleIndex];

  return (
    <>
      <SEO
        title="Zakeem Realty ERP — Enterprise Real Estate Platform"
        description="Flagship enterprise ERP built for real estate developers, property managers, and land aggregators. Integrates property sales, GIS land subdivision, lease accounting, construction finance, and Zakky AI."
        canonical="https://www.zakeemsolutions.com/products/zakeem-realty-erp"
        schema={{
          "@type": "SoftwareApplication",
          name: "Zakeem Realty ERP",
          applicationCategory: "Enterprise Real Estate Software",
          operatingSystem: "Cloud / Web / Private Cloud",
          softwareVersion: "2.4 Enterprise",
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "NGN",
            highPrice: "80000000",
            lowPrice: "150000",
            offerCount: "3"
          }
        }}
      />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden border-b border-white/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#e57804]/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="neon">
                Flagship Platform
              </Badge>
              <Badge variant="neutral">Release 2.4 Enterprise</Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight mb-6">
              The Digital Operating System for{" "}
              <span className="bg-gradient-to-r from-slate-950 via-amber-700 to-[#e57804] dark:from-white dark:via-amber-200 dark:to-[#e57804] bg-clip-text text-transparent">
                Modern Real Estate.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-200 font-normal leading-relaxed mb-8">
              Zakeem Realty ERP unifies property sales, GIS land registry, multi-tenant leasing, construction procurement, and financial accounting into an audit-grade, AI-accelerated platform.
            </p>

            <div className="flex flex-wrap items-center gap-3.5">
              <Button
                variant="primary"
                size="lg"
                href="/request-demo?product=zakeem-realty-erp"
                data-analytics-id="realty-hero-demo-cta"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Schedule Private Enterprise Demo
              </Button>
              <Button
                variant="secondary"
                size="lg"
                href="/pricing"
                data-analytics-id="realty-hero-pricing-cta"
              >
                View Subscription Pricing
              </Button>
              <Button
                variant="outline"
                size="lg"
                href="https://realty.zakeemsolutions.com"
                isExternal
                data-analytics-id="realty-hero-portal-cta"
                leftIcon={<KeyRound className="w-4 h-4 text-[#e57804]" />}
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Customer Portal Login
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="py-10 bg-[#040e1d] border-b border-white/10" data-surface="dark">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl font-extrabold font-mono text-white">
                <AnimatedNumber value="₦100B+" />
              </div>
              <div className="text-xs text-slate-300 font-mono mt-1">Real Estate Assets Tracked</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-extrabold font-mono text-[#e57804]">
                <AnimatedNumber value="99.9%" />
              </div>
              <div className="text-xs text-slate-300 font-mono mt-1">Allocation Accuracy</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-extrabold font-mono text-amber-300">
                <AnimatedNumber value="3.4x" />
              </div>
              <div className="text-xs text-slate-300 font-mono mt-1">Faster Sales Reconciliation</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-extrabold font-mono text-white">
                <AnimatedNumber value="14+" />
              </div>
              <div className="text-xs text-slate-300 font-mono mt-1">Integrated Core Modules</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Module Exploration */}
      <section className="py-20 lg:py-28 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <SectionHeader
            badge="Platform Architecture"
            title="Engineered Around Every Aspect of the"
            highlightedWord="Property Lifecycle."
            description="Unlike generic accounting software, Zakeem Realty ERP treats property sales, land parcels, and contractor procurement as first-class primitives."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Module Selector List */}
            <div data-surface="dark" className="lg:col-span-5 space-y-2">
              {modules.map((m, idx) => {
                const Icon = m.icon;
                const isSelected = activeModuleIndex === idx;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveModuleIndex(idx)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-[#0b1e3b] border-[#e57804] text-white shadow-lg shadow-[#e57804]/20"
                        : "bg-[#081c38] border-white/10 text-slate-300 hover:text-white hover:bg-[#0c254c]"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`p-2 rounded-lg ${isSelected ? "bg-[#e57804] text-white" : "bg-white/5 text-slate-300"}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold">{m.title}</div>
                        <div className="text-xs text-slate-400">{m.highlight}</div>
                      </div>
                    </div>
                    <ArrowRight className={`w-4 h-4 ${isSelected ? "text-[#e57804] translate-x-1" : "text-slate-500"} transition-transform`} />
                  </button>
                );
              })}
            </div>

            {/* Right Detailed Module Display */}
            <div data-surface="dark" className="lg:col-span-7 p-8 md:p-10 rounded-3xl bg-[#081c38] border border-white/15 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <Badge variant="neon">{activeModule.highlight}</Badge>
                <span className="text-xs font-mono text-slate-400">Module {activeModuleIndex + 1} of {modules.length}</span>
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {activeModule.title}
              </h3>

              <p className="text-sm md:text-base text-slate-200 leading-relaxed mb-8">
                {activeModule.description}
              </p>

              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-4">
                Core Capabilities & Workflows:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {activeModule.capabilities.map((cap, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-[#e57804] shrink-0 mt-0.5" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-4">
                <Button
                  variant="primary"
                  size="md"
                  href="/request-demo"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Request Live Walkthrough
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  href="/contact"
                  className="text-white hover:bg-white/10 hover:text-white"
                >
                  Consult Architecture Team
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Licensing & Deployment Architecture */}
      <section className="py-20 lg:py-28 bg-[#040e1d] border-t border-white/10" data-surface="dark">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <SectionHeader
            badge="Licensing & Deployment"
            title="Enterprise Deployment"
            highlightedWord="Models."
            description="Deploy Zakeem Realty ERP in the architecture that fits your governance, sovereignty, and data compliance standards."
            align="center"
            inverted={true}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {/* Tier 1 */}
            <div data-surface="dark" className="p-8 rounded-2xl bg-[#081c38] border border-white/10 flex flex-col justify-between">
              <div>
                <Badge variant="blue" className="mb-4">Zakeem Managed Cloud</Badge>
                <h4 className="text-xl font-bold text-white mb-2">Dedicated Cloud Instance</h4>
                <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                  Fully managed by Zakeem Solutions with automated continuous backups, 99.99% SLA, and zero DevOps overhead.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-200 mb-8">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#e57804]" /> Multi-tenant or Single-tenant isolation</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#e57804]" /> Automated security patches & quarterly releases</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#e57804]" /> 24/7 Monitoring & uptime guarantee</li>
                </ul>
              </div>
              <Button variant="outline" size="md" href="/request-demo" className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white">
                Select Cloud Deployment
              </Button>
            </div>

            {/* Tier 2 */}
            <div data-surface="dark" className="p-8 rounded-2xl bg-gradient-to-b from-[#0a2347] to-[#06152b] border border-[#e57804]/60 shadow-xl shadow-[#e57804]/15 flex flex-col justify-between relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="neon">Most Popular for Developers</Badge>
              </div>
              <div>
                <Badge variant="blue" className="mb-4 mt-2">Private VPC / Sovereign</Badge>
                <h4 className="text-xl font-bold text-white mb-2">Private VPC Sovereign Cloud</h4>
                <p className="text-xs text-slate-200 mb-6 leading-relaxed">
                  Deployed inside your institutional AWS, Azure, or Google Cloud private VPC. Complete data residency compliance.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-200 mb-8">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#e57804]" /> Strict sovereign Nigerian data residency</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#e57804]" /> Custom LDAP/Active Directory SSO integration</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#e57804]" /> Zakky AI on private secure tenant weights</li>
                </ul>
              </div>
              <Button variant="primary" size="md" href="/request-demo" className="w-full">
                Request Private VPC Demo
              </Button>
            </div>

            {/* Tier 3 */}
            <div data-surface="dark" className="p-8 rounded-2xl bg-[#081c38] border border-white/10 flex flex-col justify-between">
              <div>
                <Badge variant="neutral" className="mb-4">Institutional</Badge>
                <h4 className="text-xl font-bold text-white mb-2">On-Premise Appliance</h4>
                <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                  For sovereign state land ministries, institutional pension funds, and defense infrastructure requiring air-gapped security.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-200 mb-8">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#e57804]" /> Complete air-gapped physical data center rollout</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#e57804]" /> Full source audit & escrow agreements</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#e57804]" /> Onsite engineering enablement team</li>
                </ul>
              </div>
              <Button variant="outline" size="md" href="/contact" className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white">
                Talk to Enterprise Sales
              </Button>
            </div>
          </div>

          {/* Contextual Pricing Bridge Banner */}
          <div className="mt-12 p-6 rounded-2xl bg-[#081c38]/90 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-[#e57804] uppercase">Transparent Commercial Plans</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">From ₦150,000 / mo</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Explore verified subscription tiers: Starter, Growth, and Institutional custom licensing in Nigerian Naira.
              </p>
            </div>
            <Button
              variant="outline"
              size="md"
              href="/pricing"
              data-analytics-id="realty-licensing-view-pricing"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="shrink-0 border-[#e57804]/50 text-[#e57804] hover:bg-[#e57804]/10 hover:text-white"
            >
              View Subscription Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Flagship CTA */}
      <CTASection
        badge="Zakeem Realty ERP Onboarding"
        title="Transform Your Real Estate Operations."
        description="Schedule a technical architecture presentation with our product specialists and witness how Zakeem Realty ERP scales property sales and land management."
        primaryCtaText="Request a Private Demo"
        primaryCtaLink="/request-demo?product=zakeem-realty-erp"
        secondaryCtaText="Review Subscription Pricing"
        secondaryCtaLink="/pricing"
      />
    </>
  );
};