export type BillingPeriod = "monthly" | "annual";

export interface ProductPricingTier {
  id: string;
  name: string;
  tierCode: "STARTER" | "GROWTH" | "BUSINESS" | "ENTERPRISE";
  tagline: string;
  priceModel: "Starting from" | "Custom";
  baseMonthlyPrice?: number | null; // Authoritative monthly base in NGN
  priceAmount: string;
  billingPeriod?: string;
  targetScale: string;
  featured?: boolean;
  badge?: string;
  description: string;
  deliverables: string[];
  sla: string;
  hostingOptions: string[];
  ctaLabel: string;
  ctaHref: string;
}

export const formatNaira = (amount: number): string => {
  return "₦" + amount.toLocaleString("en-NG");
};

export interface ComputedTierPricing {
  displayAmount: string;
  billingPeriodLabel: string;
  monthlyRate: number | null;
  annualTotal: number | null;
  savingsAnnual: number | null;
  savingsPercentage: number;
  savingsAmount?: string;
  annualTotalDisplay?: string;
}

export const calculateTierPricing = (
  tier: ProductPricingTier,
  period: BillingPeriod
): ComputedTierPricing => {
  if (!tier.baseMonthlyPrice) {
    return {
      displayAmount: "Custom Agreement",
      billingPeriodLabel: "annual enterprise agreement (NGN)",
      monthlyRate: null,
      annualTotal: null,
      savingsAnnual: null,
      savingsPercentage: 0,
    };
  }

  const base = tier.baseMonthlyPrice;

  if (period === "monthly") {
    return {
      displayAmount: formatNaira(base),
      billingPeriodLabel: "per month (billed monthly in NGN)",
      monthlyRate: base,
      annualTotal: base * 12,
      savingsAnnual: 0,
      savingsPercentage: 0,
      annualTotalDisplay: `Total: ${formatNaira(base * 12)} / year`,
    };
  }

  // Annual billing: exact 20% discount on monthly rate
  const discountedMonthly = Math.round(base * 0.8);
  const annualTotal = discountedMonthly * 12;
  const fullYearBase = base * 12;
  const savingsAnnual = fullYearBase - annualTotal;

  return {
    displayAmount: formatNaira(discountedMonthly),
    billingPeriodLabel: "per month (billed annually in NGN)",
    monthlyRate: discountedMonthly,
    annualTotal,
    savingsAnnual,
    savingsPercentage: 20,
    savingsAmount: `Save ${formatNaira(savingsAnnual)} / yr`,
    annualTotalDisplay: `Billed annually at ${formatNaira(annualTotal)} / yr`,
  };
};

export interface ServiceEngagementModel {
  id: string;
  name: string;
  category: "Architectural Advisory" | "Dedicated Engineering Pods" | "Enterprise Modernization" | "24/7 Managed SRE & AI";
  duration: string;
  investmentTier: string;
  idealFor: string;
  deliverables: string[];
  outcomes: string[];
  ctaLabel: string;
  ctaHref: string;
}

export interface ValueComparisonDimension {
  dimension: string;
  description: string;
  zakeemApproach: string;
  disconnectedTools: string;
  traditionalAgency: string;
  legacyEnterpriseMonolith: string;
  internalBuild: string;
}

export interface PricingFAQ {
  id: string;
  question: string;
  answer: string;
  category: "Procurement" | "Licensing & IP" | "Security & Hosting" | "Billing";
}

export const PRODUCT_PRICING_TIERS: ProductPricingTier[] = [
  {
    id: "tier-starter",
    name: "Growth Enterprise",
    tierCode: "STARTER",
    tagline: "For mid-market operators establishing digital core automation",
    priceModel: "Starting from",
    baseMonthlyPrice: 150000,
    priceAmount: "₦150,000",
    billingPeriod: "per month (billed annually in NGN)",
    targetScale: "Up to 10 active users • Single Business Entity",
    featured: false,
    description: "Full-suite access to core Zakeem ERP workflows, property/inventory management, automated accounting, and customer portal.",
    deliverables: [
      "Core ERP Suite (Inventory, Sales, CRM & Tenant Accounting)",
      "Standard Payment Switch & Bank Reconciliation",
      "Role-Based Access Control & Audit Log (90-day retention)",
      "Automated Daily Encrypted Backups",
      "Standard Business Hours Engineering Support (Email & Desk)",
      "Turnkey 3-Week Assisted Onboarding & Data Importer"
    ],
    sla: "99.9% Operational Uptime SLA",
    hostingOptions: ["Secure Zakeem Cloud (AWS / DigitalOcean West Africa/EU)"],
    ctaLabel: "Request Growth Proposal",
    ctaHref: "/request-demo?tier=growth"
  },
  {
    id: "tier-business",
    name: "Business Scale",
    tierCode: "BUSINESS",
    tagline: "For high-volume multi-branch enterprises and developers",
    priceModel: "Starting from",
    baseMonthlyPrice: 350000,
    priceAmount: "₦350,000",
    billingPeriod: "per month (billed annually in NGN)",
    targetScale: "Up to 25 active users • Multi-Entity / Subsidiary Support",
    featured: true,
    badge: "Most Selected for ERP",
    description: "Engineered for high-throughput real estate developers, asset aggregators, and commercial distributors requiring customized workflows and multi-branch consolidation.",
    deliverables: [
      "Everything in Growth Enterprise, plus:",
      "Integrated Zakky AI Predictive Valuation & Analytics Engine",
      "Multi-Entity Financial Consolidation & Intercompany Ledger",
      "Dynamic GIS Land Subdivision & Spatial Plot Allocation",
      "Vendor Procurement & Milestone Construction Tracking",
      "Custom REST & Webhook Event Mesh for 3rd-Party Systems",
      "Dedicated Technical Account Manager & Priority 4hr Response"
    ],
    sla: "99.95% High-Availability Uptime SLA",
    hostingOptions: ["Zakeem Managed Cloud", "Isolated Virtual Private Cloud (VPC)"],
    ctaLabel: "Request Business Demo",
    ctaHref: "/request-demo?tier=business"
  },
  {
    id: "tier-enterprise",
    name: "Institutional Sovereign",
    tierCode: "ENTERPRISE",
    tagline: "For institutional conglomerates, financial institutions & government bodies",
    priceModel: "Custom",
    baseMonthlyPrice: null,
    priceAmount: "Custom Agreement",
    billingPeriod: "annual enterprise agreement (NGN)",
    targetScale: "Unlimited Users • Institutional & National Scope",
    featured: false,
    badge: "Air-Gapped / Sovereign",
    description: "Mission-critical deployment tailored to sovereign security boundaries, air-gapped on-premise infrastructure, custom module development, and dedicated SRE pods.",
    deliverables: [
      "Full Source Code Escrow & Perpetual Licensing Options",
      "Dedicated Private Bare-Metal or Sovereign Data Center Deployment",
      "Custom Machine Learning Pipeline Training on Private Corpora",
      "Zero-Trust Architecture & Hardware Security Module (HSM) Integration",
      "24/7/365 Dedicated Site Reliability Engineering (SRE) Pod",
      "Guaranteed 15-Minute Critical Incident Response Time",
      "Full Data Sovereignty & Regulatory Compliance Attestation"
    ],
    sla: "99.99% Financial-Grade SLA with Financial Penalties",
    hostingOptions: ["Air-gapped On-Premise", "Sovereign GovCloud", "Dedicated Private VPC"],
    ctaLabel: "Talk to Solutions Architect",
    ctaHref: "/contact?type=enterprise-sovereign"
  }
];

export const SERVICE_ENGAGEMENT_MODELS: ServiceEngagementModel[] = [
  {
    id: "eng-audit",
    name: "Architectural Forensic Audit",
    category: "Architectural Advisory",
    duration: "2 – 4 Weeks",
    investmentTier: "Starting from ₦2,000,000",
    idealFor: "Organizations facing systemic performance bottlenecks, security vulnerabilities, or planning major platform modernization.",
    deliverables: [
      "Forensic source code & microservice telemetry inspection",
      "Relational data model & query optimization review",
      "Zero-trust security & compliance vulnerability matrix",
      "C4 Architecture Blueprint & 12-Month Technical Roadmap",
      "Executive Boardroom Delivery Presentation"
    ],
    outcomes: [
      "Clear identification of critical failure points before cutover",
      "Quantified cost-reduction opportunities across cloud infrastructure",
      "De-risked executive investment decision-making"
    ],
    ctaLabel: "Schedule Forensic Audit",
    ctaHref: "/contact?service=architectural-audit"
  },
  {
    id: "eng-pod",
    name: "Dedicated Engineering Pod",
    category: "Dedicated Engineering Pods",
    duration: "Quarterly / Annual Retainers",
    investmentTier: "Starting from ₦3,000,000 / mo",
    idealFor: "Enterprises needing an elite, autonomous software engineering pod (Architect, Senior Distributed Engineers, QA, DevOps) to accelerate core software development.",
    deliverables: [
      "Complete dedicated pod: 1 Lead Architect, 2-4 Senior Engineers, 1 DevOps/SRE",
      "Two-week sprint cycles with strict CI/CD automated test verification",
      "Direct Slack/Teams integration with client engineering leadership",
      "Complete IP and source code assignment on each release cycle",
      "Bi-weekly executive velocity & architecture steering reviews"
    ],
    outcomes: [
      "Instant senior engineering velocity without months of hiring delays",
      "Zero legacy technical debt; typed domain-driven codebase",
      "Predictable release cadence backed by formal SLAs"
    ],
    ctaLabel: "Configure Engineering Pod",
    ctaHref: "/contact?service=dedicated-pod"
  },
  {
    id: "eng-modernization",
    name: "Turnkey Enterprise Modernization",
    category: "Enterprise Modernization",
    duration: "3 – 9 Months",
    investmentTier: "Custom Milestone-Based Contract (NGN)",
    idealFor: "Large enterprises replacing legacy mainframe, fragmented spreadsheets, or bloated legacy ERP systems with a bespoke, scalable platform.",
    deliverables: [
      "End-to-end data migration with zero transactional loss",
      "Custom microservice or modular monolith architecture design",
      "Legacy system shadow-mode execution & reconciliation",
      "User enablement workshops & comprehensive operational playbooks",
      "Post-launch 90-day hypercare warranty & 24/7 incident response"
    ],
    outcomes: [
      "Flawless cutover with guaranteed zero business downtime",
      "Complete operational transparency for executive leadership",
      "Radical reduction in legacy licensing and maintenance fees"
    ],
    ctaLabel: "Request Modernization Scoping",
    ctaHref: "/contact?service=enterprise-modernization"
  }
];

export const VALUE_COMPARISON_DIMENSIONS: ValueComparisonDimension[] = [
  {
    dimension: "Implementation Complexity",
    description: "Time and organizational friction required to go from blueprint to full production rollout.",
    zakeemApproach: "Turnkey & Phased: Pre-built enterprise foundation with modular domain adapters. Live in weeks, not years.",
    disconnectedTools: "Extremely High: Fragile multi-tool integration, mismatched data schemas, endless webhook maintenance.",
    traditionalAgency: "High: Trial-and-error development. Agencies build from scratch with junior teams, resulting in protracted delays.",
    legacyEnterpriseMonolith: "Severe: Typical rollouts take 18–36 months, require armies of certified consultants, and disrupt core operations.",
    internalBuild: "High: Distracts internal staff, requires 6–12 months of hiring, and frequently misses initial deadlines."
  },
  {
    dimension: "System Integration",
    description: "Cohesion between financial ledgers, operational workflows, customer portals, and telemetry.",
    zakeemApproach: "Unified Single Pane: Real-time event mesh seamlessly binding ERP, CRM, procurement, and AI cognition.",
    disconnectedTools: "Fragmented: 8-15 separate apps requiring third-party sync connectors that break silently.",
    traditionalAgency: "Shallow: Basic REST API connectors without event deduplication or transactional rollback guarantees.",
    legacyEnterpriseMonolith: "Rigid: Proprietary integration layers that require expensive proprietary middleware.",
    internalBuild: "Ad-hoc: Built incrementally over time, often lacking unified logging and transaction tracing."
  },
  {
    dimension: "Customization & Flexibility",
    description: "Ability to adapt workflows to unique African and global institutional regulatory realities.",
    zakeemApproach: "Deep & Native: Configurable business rules, dynamic field extensions, and domain-tailored workflows.",
    disconnectedTools: "Inflexible: Rigid off-the-shelf templates; cannot modify core logic or database schemas.",
    traditionalAgency: "Full but Unstable: Will write whatever is requested without enforcing enterprise domain boundaries.",
    legacyEnterpriseMonolith: "Prohibitively Expensive: Minor customization requires thousands of consulting billing hours.",
    internalBuild: "High: Fully custom, but ongoing maintenance and feature iteration overburden internal staff."
  },
  {
    dimension: "AI & Automation Readiness",
    description: "Operational readiness to leverage autonomous reasoning, document cognition, and predictive engines.",
    zakeemApproach: "Day-One Native: Embedded domain AI (Zakky AI & Cortex) with private VPC inference and automated data pipelines.",
    disconnectedTools: "Gimmicky: Surface-level chatbot add-ons without deep contextual awareness of proprietary database records.",
    traditionalAgency: "Experimental: Unvetted wrapper scripts around third-party APIs with high hallucination risk.",
    legacyEnterpriseMonolith: "Slow & Costly: Proprietary AI add-ons priced at exorbitant per-query premiums.",
    internalBuild: "Complex: Requires scarce senior machine learning researchers and expensive GPU cluster management."
  },
  {
    dimension: "Scalability & Concurrency",
    description: "System behavior under heavy concurrent user sessions, peak transaction volume, and data growth.",
    zakeemApproach: "Architecturally Proven: Horizontally autoscaling Kubernetes pods, partitioned read replicas, sub-250ms latency.",
    disconnectedTools: "Varies Wildly: System fails at the weakest integration point or webhook rate limit.",
    traditionalAgency: "Questionable: Rarely load-tested beyond basic staging environments; prone to concurrency deadlocks.",
    legacyEnterpriseMonolith: "Reliable but Heavy: Scales vertically by buying massive hardware licenses.",
    internalBuild: "Untested: Performance bottlenecks emerge in production when data volume grows 10x."
  },
  {
    dimension: "Support, SLAs & Accountability",
    description: "Operational assurances, incident response guarantees, and ongoing engineering stewardship.",
    zakeemApproach: "Institutional Accountability: Tiered SLAs up to 99.99% with dedicated SRE pods and direct architect access.",
    disconnectedTools: "Finger-Pointing: Each SaaS vendor blames the other when data synchronization fails.",
    traditionalAgency: "Post-Launch Abandonment: Agencies move to the next project once warranty expires.",
    legacyEnterpriseMonolith: "Tiered & Impersonal: Support tickets navigate layers of offshore bureaucracy.",
    internalBuild: "Key-Person Risk: Maintenance hinges on a few engineers whose departure leaves the system stranded."
  },
  {
    dimension: "IP & Data Sovereignty",
    description: "Legal ownership of business data, customer records, and core proprietary software assets.",
    zakeemApproach: "Absolute Sovereignty: On-premise air-gapped options, private VPC isolation, full data ownership.",
    disconnectedTools: "Vendor Lock-in: Business data scattered across multiple multi-tenant US/EU cloud providers.",
    traditionalAgency: "Unclear: Often utilizes copy-pasted boilerplate or unclear open-source license encumbrances.",
    legacyEnterpriseMonolith: "Complete Lock-in: High switching costs designed to lock organizations into decades of contracts.",
    internalBuild: "Full Ownership: Organization owns IP, but bears total liability and maintenance cost."
  },
  {
    dimension: "Total Cost of Ownership (TCO)",
    description: "Comprehensive financial commitment spanning licensing, development, infrastructure, and maintenance.",
    zakeemApproach: "Predictable Value & Fast ROI: Clear transparent tiers, zero hidden seat traps, and fast time-to-market.",
    disconnectedTools: "Compounding: Starts cheap, but ballooning seat licenses and integration tools quickly exceed ₦15,000,000+/mo.",
    traditionalAgency: "Unpredictable Scope Creep: Fixed-price estimates turn into endless change-order invoices.",
    legacyEnterpriseMonolith: "Millions in CapEx: Multi-million upfront fees plus 20-25% mandatory annual maintenance charges.",
    internalBuild: "Deceptively Expensive: Salaries, recruitment, benefits, compute, and opportunity costs add up rapidly."
  }
];

export const PRICING_FAQS: PricingFAQ[] = [
  {
    id: "faq-1",
    question: "Can Zakeem products and platforms be deployed on sovereign or on-premise infrastructure?",
    answer: "Yes. For institutional, financial, and government clients, we provide turnkey deployment into client-owned sovereign data centers, air-gapped private bare-metal environments, or isolated Virtual Private Clouds (VPC). We ensure zero external data leakage and provide full compliance documentation.",
    category: "Security & Hosting"
  },
  {
    id: "faq-2",
    question: "How does Zakeem ensure predictable implementation timelines without scope creep?",
    answer: "We utilize our proprietary 'Zakeem Standard' delivery methodology. Every project begins with a structured Architectural Discovery phase where domain models and integration points are formalized into signed technical specifications before execution begins. Work is delivered in verifiable two-week increments with automated regression tests.",
    category: "Procurement"
  },
  {
    id: "faq-3",
    question: "Who owns the Intellectual Property (IP) and data in custom software engagements?",
    answer: "You do. For custom software engineering and enterprise modernization engagements, all source code, database schemas, and proprietary IP created for your organization are fully assigned to your business upon milestone settlement. We also offer source code escrow options for our enterprise product tiers.",
    category: "Licensing & IP"
  },
  {
    id: "faq-4",
    question: "What currencies and payment structures does Zakeem accept?",
    answer: "All enterprise plans and solutions are denominated in Nigerian Naira (NGN). Invoicing and settlement are processed via commercial bank transfers, letters of credit, and institutional treasury rails. Flexible milestone-linked, quarterly, or annual billing agreements are available.",
    category: "Billing"
  },
  {
    id: "faq-5",
    question: "How do you handle migration from legacy ERP systems or legacy databases?",
    answer: "We employ automated schema extraction and ETL pipelines to validate, cleanse, and reconcile legacy records against the target schema in shadow mode. We guarantee zero data loss and run parallel reconciliations before any production cutover.",
    category: "Procurement"
  },
  {
    id: "faq-6",
    question: "What level of post-launch engineering support and SLAs do you provide?",
    answer: "Our SLAs range from 99.9% uptime for Growth plans up to 99.99% high-availability guarantees for Institutional Enterprise agreements. Enterprise agreements include 24/7/365 dedicated Site Reliability Engineering (SRE) pods with a 15-minute guaranteed response time for critical incidents.",
    category: "Security & Hosting"
  }
];

// ==========================================
// MULTI-PRODUCT COMMERCIAL REGISTRY
// ==========================================

export type CommercialProductCategory = "all" | "real-estate" | "ai" | "legal" | "operations" | "fintech";

export interface ProductCategoryOption {
  id: CommercialProductCategory;
  label: string;
  badge?: string;
}

export const PRODUCT_CATEGORIES: ProductCategoryOption[] = [
  { id: "all", label: "All Solutions" },
  { id: "real-estate", label: "Real Estate & Land", badge: "Live ERP" },
  { id: "ai", label: "AI & Intelligence", badge: "Beta" },
  { id: "legal", label: "Legal Systems", badge: "Solution" },
  { id: "operations", label: "Operations & Supply Chain", badge: "Roadmap" },
  { id: "fintech", label: "Fintech & Treasury", badge: "Architecture" },
];

export type CommercialLifecycleStatus = "Available" | "Private Beta" | "In Development" | "Active Solution";

export interface StandaloneProductItem {
  id: string;
  name: string;
  category: CommercialProductCategory;
  categoryLabel: string;
  tagline: string;
  valueProposition: string;
  lifecycleStatus: CommercialLifecycleStatus;
  lifecycleBadge: string;
  version: string;
  hasPublicPricing: boolean;
  baseMonthlyPrice?: number | null;
  startingPriceDisplay: string;
  billingFrequencyLabel: string;
  targetScale: string;
  deliverables: string[];
  sla: string;
  ctaLabel: string;
  ctaHref: string;
  internalRoute: string;
  featured?: boolean;
}

export const STANDALONE_PRODUCTS: StandaloneProductItem[] = [
  {
    id: "zakeem-realty-erp",
    name: "Zakeem Realty ERP",
    category: "real-estate",
    categoryLabel: "Real Estate & Property Tech",
    tagline: "Flagship Real Estate, Property Management & Land Sales Platform",
    valueProposition: "Consolidate sales, land allocation, construction procurement, and accounting into one sovereign system.",
    lifecycleStatus: "Available",
    lifecycleBadge: "v2.4 Live in Production",
    version: "2.4 Enterprise",
    hasPublicPricing: true,
    baseMonthlyPrice: 150000,
    startingPriceDisplay: "From ₦150,000 / mo",
    billingFrequencyLabel: "Monthly or Annual billing in NGN",
    targetScale: "10 to 25+ users (Starter & Business) • Unlimited for Enterprise",
    deliverables: [
      "Turnkey Property Sales, Direct Payments & Tenant Portals",
      "Dynamic GIS Land Subdivision & Plot Allocation Registry",
      "Automated Lease Accounting, Bank Reconciliation & Invoicing",
      "Integrated Zakky AI Predictive Property Valuation",
      "Milestone Construction Procurement & Expense Tracking"
    ],
    sla: "99.95% High-Availability Cloud SLA",
    ctaLabel: "View ERP Plans & Request Demo",
    ctaHref: "/products/zakeem-realty-erp",
    internalRoute: "/products/zakeem-realty-erp",
    featured: true,
  },
  {
    id: "zakeem-cortex-ai",
    name: "Zakeem Cortex AI",
    category: "ai",
    categoryLabel: "AI Cognition & Automation",
    tagline: "Autonomous Workflow Execution & Intelligent Document Cognition",
    valueProposition: "Deploy domain-specialized LLMs, automated document extraction, and high-consequence decision flows inside private VPCs.",
    lifecycleStatus: "Private Beta",
    lifecycleBadge: "Private Beta / Early Access",
    version: "1.0 Beta",
    hasPublicPricing: false,
    baseMonthlyPrice: null,
    startingPriceDisplay: "Private Beta Access",
    billingFrequencyLabel: "Custom pilot agreement during beta",
    targetScale: "Pilot cohorts (5 to 25+ operators) • Private VPC & GPU clusters",
    deliverables: [
      "Domain-Adaptive Multi-Modal OCR for deeds, contracts & invoices",
      "Private VPC & Sovereign On-Premise GPU Execution",
      "Automated Cadastral & Banking Statement Reconciliation",
      "Autonomous Workflow Exception Triage & Human-in-the-Loop",
      "Zero Data Leakage Guarantee with Strict Sovereign Boundaries"
    ],
    sla: "< 250ms Processing Latency SLA",
    ctaLabel: "Request Early Beta Access",
    ctaHref: "/request-demo?product=cortex-ai",
    internalRoute: "/products/cortex-ai",
  },
  {
    id: "e-legal-justice",
    name: "e-Legal & Justice Systems",
    category: "legal",
    categoryLabel: "Legal & Public Sector",
    tagline: "Practice Management, Case Intelligence & Court Digitization",
    valueProposition: "Modern digital infrastructure for private law firms, corporate legal teams, and public justice ministries.",
    lifecycleStatus: "Active Solution",
    lifecycleBadge: "Institutional Solution",
    version: "Enterprise Solution",
    hasPublicPricing: false,
    baseMonthlyPrice: null,
    startingPriceDisplay: "Custom Institutional Scoping",
    billingFrequencyLabel: "Tailored institutional deployment (NGN)",
    targetScale: "Private law firms (5 to 50+ practitioners) & Justice Ministries",
    deliverables: [
      "Comprehensive Matter & Case Dossier Lifecycle Management",
      "Automated Court e-Filing & Judicial Registry Interoperability",
      "Cryptographic Evidence Chain-of-Custody & Tamper-Proof Vaults",
      "AI-Powered Statutory Research & Contract Analysis",
      "Trust Accounting, Billable Hours & Court Fee Reconciliation"
    ],
    sla: "Institutional High-Security SLA",
    ctaLabel: "Consult Legal Solutions Architect",
    ctaHref: "/contact?solution=e-legal",
    internalRoute: "/solutions/e-legal",
  },
  {
    id: "zakeem-flow",
    name: "Zakeem Flow",
    category: "operations",
    categoryLabel: "Supply Chain & Operations",
    tagline: "Intelligent Supply Chain & B2B Procurement Hub",
    valueProposition: "Automate 3-way invoice matching and transparent vendor compliance across complex multi-contractor supply chains.",
    lifecycleStatus: "In Development",
    lifecycleBadge: "Roadmap Release Q4 2026",
    version: "Roadmap Q4",
    hasPublicPricing: false,
    baseMonthlyPrice: null,
    startingPriceDisplay: "Roadmap Briefing",
    billingFrequencyLabel: "Pre-release enterprise pilot scoping",
    targetScale: "Procurement & operations teams (10 to 100+ vendor contractors)",
    deliverables: [
      "Automated 3-Way Purchase Order, Receipt & Invoice Matching",
      "Smart Milestone Escrow & Supplier Delivery Confirmation",
      "Vendor Statutory Compliance & Tax Verification Integration",
      "Real-Time Multi-Project Spend Transparency & Analytics",
      "Direct ERP Ledger Sync & Automated Payment Triggers"
    ],
    sla: "Enterprise Pilot SLA",
    ctaLabel: "Join Roadmap Briefing",
    ctaHref: "/contact?product=flow-procure&type=roadmap-briefing",
    internalRoute: "/products/flow-procure",
  },
  {
    id: "zakeem-vault",
    name: "Zakeem Vault",
    category: "fintech",
    categoryLabel: "Treasury & Payments",
    tagline: "Enterprise Treasury & Programmable Settlement Rail",
    valueProposition: "High-throughput multi-currency treasury and settlement rail built for cross-border liquidity and statutory compliance.",
    lifecycleStatus: "In Development",
    lifecycleBadge: "Architecture & Compliance Phase",
    version: "Architecture Phase",
    hasPublicPricing: false,
    baseMonthlyPrice: null,
    startingPriceDisplay: "Architecture Briefing",
    billingFrequencyLabel: "Strategic enterprise advisory",
    targetScale: "Institutional treasury teams & multi-currency controllers",
    deliverables: [
      "Direct Central Bank & Payment Switch Interoperability",
      "Automated Multi-Currency FX Hedging & Liquidity Pooling",
      "Bank-Grade Hardware Security Module (HSM) AES-256 Encryption",
      "Instant Settlement Validation with Dual-Key Authorizations",
      "Complete Sovereign Regulatory Audit Trail & Telemetry"
    ],
    sla: "Financial-Grade 99.99% Architecture Target",
    ctaLabel: "Request Strategic Brief",
    ctaHref: "/contact?product=vault-pay&type=strategic-brief",
    internalRoute: "/products/vault-pay",
  }
];

// ==========================================
// ZAKEEM BUSINESS SUITE TIERS
// ==========================================

export interface SuiteTier {
  id: string;
  name: string;
  tierCode: "STARTER" | "GROWTH" | "BUSINESS" | "ENTERPRISE";
  tagline: string;
  targetScale: string;
  baseMonthlyPrice: number | null;
  featured?: boolean;
  badge?: string;
  includedSolutions: string[];
  coreCapabilities: string[];
  supportLevel: string;
  hostingModel: string;
  ctaLabel: string;
  ctaHref: string;
}

export const SUITE_TIERS: SuiteTier[] = [
  {
    id: "suite-growth",
    name: "Growth Business Suite",
    tierCode: "GROWTH",
    tagline: "For scaling operators combining core ERP with AI document automation",
    targetScale: "Up to 20 active users • 1 Commercial Entity",
    baseMonthlyPrice: 500000,
    featured: false,
    includedSolutions: [
      "Zakeem Realty ERP (Core Suite)",
      "Zakeem Cortex AI Document Cognition Pilot",
      "Standard Banking Switch & Automated Reconciliation"
    ],
    coreCapabilities: [
      "Complete real estate property inventory, sales & tenant management",
      "AI-driven automated document and lease deed extraction",
      "Automated bank ledger matching and NGN payment verification",
      "Role-based access control with 90-day immutable audit logs",
      "Standard 3-week guided data migration and team onboarding"
    ],
    supportLevel: "Standard Business Hours Support (99.9% Uptime SLA)",
    hostingModel: "Zakeem Sovereign Cloud (West Africa / EU)",
    ctaLabel: "Request Growth Suite Demo",
    ctaHref: "/request-demo?suite=growth",
  },
  {
    id: "suite-scale",
    name: "Enterprise Business Suite",
    tierCode: "BUSINESS",
    tagline: "For high-volume multi-branch enterprises, property groups and developers",
    targetScale: "Up to 50 active users • Multi-Entity & Branch Governance",
    baseMonthlyPrice: 800000,
    featured: true,
    badge: "MOST POPULAR SUITE",
    includedSolutions: [
      "Full Zakeem Realty ERP (Advanced Modules)",
      "Zakky AI Predictive Valuation & Analytics Engine",
      "Zakeem Cortex AI Enterprise Document Pipeline",
      "Zakeem Flow Early Access & Procurement Connector"
    ],
    coreCapabilities: [
      "Everything in Growth Suite, plus:",
      "Multi-entity financial consolidation & intercompany clearing ledger",
      "Interactive GIS plot allocation and dynamic land parcel registry",
      "Continuous contractor procurement & construction milestone tracking",
      "High-throughput REST API & webhook event mesh for 3rd-party software",
      "Dedicated Technical Account Manager with guaranteed 4-hour response"
    ],
    supportLevel: "Priority 24/7 Monitoring & 99.95% High-Availability SLA",
    hostingModel: "Dedicated Private VPC or Managed Sovereign Cloud",
    ctaLabel: "Schedule Suite Walkthrough",
    ctaHref: "/request-demo?suite=enterprise",
  },
  {
    id: "suite-institutional",
    name: "Institutional Sovereign Suite",
    tierCode: "ENTERPRISE",
    tagline: "For national conglomerates, financial institutions and ministries",
    targetScale: "Unlimited Users • National & Multi-Jurisdictional Scope",
    baseMonthlyPrice: null,
    featured: false,
    badge: "AIR-GAPPED / SOVEREIGN",
    includedSolutions: [
      "Entire Zakeem Software Ecosystem",
      "e-Legal & Justice Practice Adapters",
      "Dedicated Private AI Models Trained on Client Corpora",
      "Custom Microservice Engineering & Core Decoupling"
    ],
    coreCapabilities: [
      "Full source code escrow and perpetual licensing options",
      "Deployment to client-owned sovereign bare-metal data centers",
      "Hardware Security Module (HSM) zero-trust encryption",
      "Custom integration with central bank or national identity registers",
      "Dedicated 24/7/365 Site Reliability Engineering (SRE) pod",
      "Guaranteed 15-minute critical incident response SLA"
    ],
    supportLevel: "Dedicated SRE Pod & 99.99% Financial SLA with Penalties",
    hostingModel: "Air-Gapped Sovereign On-Premise or Sovereign GovCloud",
    ctaLabel: "Talk to Solutions Architect",
    ctaHref: "/contact?type=institutional-suite",
  }
];

export const calculateSuitePricing = (
  tier: SuiteTier,
  period: BillingPeriod
): ComputedTierPricing => {
  if (!tier.baseMonthlyPrice) {
    return {
      displayAmount: "Custom Agreement",
      billingPeriodLabel: "annual enterprise agreement (NGN)",
      monthlyRate: null,
      annualTotal: null,
      savingsAnnual: null,
      savingsPercentage: 0,
    };
  }

  const base = tier.baseMonthlyPrice;

  if (period === "monthly") {
    return {
      displayAmount: formatNaira(base),
      billingPeriodLabel: "per month (billed monthly in NGN)",
      monthlyRate: base,
      annualTotal: base * 12,
      savingsAnnual: 0,
      savingsPercentage: 0,
      annualTotalDisplay: `Total: ${formatNaira(base * 12)} / year`,
    };
  }

  // Annual billing: exact 20% discount on monthly rate
  const discountedMonthly = Math.round(base * 0.8);
  const annualTotal = discountedMonthly * 12;
  const fullYearBase = base * 12;
  const savingsAnnual = fullYearBase - annualTotal;

  return {
    displayAmount: formatNaira(discountedMonthly),
    billingPeriodLabel: "per month (billed annually in NGN)",
    monthlyRate: discountedMonthly,
    annualTotal,
    savingsAnnual,
    savingsPercentage: 20,
    savingsAmount: `Save ${formatNaira(savingsAnnual)} / yr`,
    annualTotalDisplay: `Billed annually at ${formatNaira(annualTotal)} / yr`,
  };
};

// ==========================================
// ZAKEEM COMPLETE CONFIGURATION
// ==========================================

export interface ZakeemCompleteConfig {
  headline: string;
  tagline: string;
  positioning: string;
  availableToday: string[];
  roadmapInclusions: string[];
  enterpriseAssurances: string[];
  commercialStructure: string;
  ctaLabel: string;
  ctaHref: string;
}

export const ZAKEEM_COMPLETE_CONFIG: ZakeemCompleteConfig = {
  headline: "One Platform for Running Your Entire Business.",
  tagline: "The Sovereign Unified Enterprise Operating Platform",
  positioning: "A single, comprehensive commercial relationship delivering the complete Zakeem software ecosystem, priority roadmap onboarding, and bespoke engineering stewardship under one sovereign roof.",
  availableToday: [
    "Full Zakeem Realty ERP (Sales, Inventory, Plot Subdivision, Tenant Portals)",
    "Zakky AI Valuation & Predictive Land Analytics Engine",
    "Automated Bank Reconciliation & Multi-Tenant Accounting Core",
    "Multi-Branch Consolidation & Intercompany Corporate Governance",
    "Turnkey Data Migration from Legacy Spreadsheets or ERPs",
    "99.95% High-Availability Cloud Infrastructure"
  ],
  roadmapInclusions: [
    "Zakeem Cortex AI Document Cognition & Extraction (Private Beta Included)",
    "Zakeem Flow B2B Supply Chain & 3-Way Invoice Reconciliation (Priority Rollout)",
    "Zakeem Vault Programmable Treasury Management & Multi-Currency Settlement",
    "e-Legal & Justice System Case Management & Evidence Vault Connectors"
  ],
  enterpriseAssurances: [
    "Single master service agreement with consolidated invoicing in Nigerian Naira (NGN)",
    "Sovereign hosting choice: AWS/DigitalOcean West Africa, Private VPC, or On-Premise",
    "Full intellectual property security, perpetual licensing & source code escrow options",
    "Dedicated Executive Solutions Director & assigned Site Reliability Engineering pod",
    "Continuous quarterly feature updates across all deployed software modules"
  ],
  commercialStructure: "Annual Master Commercial Agreement (Denominated in NGN)",
  ctaLabel: "Consult Enterprise Solutions Director",
  ctaHref: "/contact?type=zakeem-complete",
};

// ==========================================
// BUILD YOUR ZAKEEM STACK (STACK BUILDER)
// ==========================================

export const BUNDLE_DISCOUNT_PERCENT = 20; // 20% discount for bundling 2 or more priced modules
export const ANNUAL_DISCOUNT_PERCENT = 20; // 20% discount for annual billing

export interface StackModule {
  id: string;
  name: string;
  category: string;
  tagline: string;
  hasPrice: boolean;
  monthlyPrice: number | null; // NGN if approved
  statusBadge: string;
  statusType: "approved" | "pilot" | "roadmap";
  description: string;
}

export const STACK_MODULES: StackModule[] = [
  {
    id: "stack-erp-core",
    name: "Realty ERP: Core Platform",
    category: "Real Estate & ERP",
    tagline: "Property sales, tenant management, automated billing & payments",
    hasPrice: true,
    monthlyPrice: 150000,
    statusBadge: "Live Production",
    statusType: "approved",
    description: "Foundational real estate operations, customer portal & payment switch."
  },
  {
    id: "stack-erp-scale",
    name: "Realty ERP: Multi-Entity & GIS",
    category: "Real Estate & ERP",
    tagline: "Multi-branch intercompany ledger, dynamic GIS plot allocation",
    hasPrice: true,
    monthlyPrice: 200000,
    statusBadge: "Live Production",
    statusType: "approved",
    description: "Advanced consolidation, land subdivision & milestone contractor tracking."
  },
  {
    id: "stack-cortex-ai",
    name: "Zakeem Cortex AI Module",
    category: "AI & Intelligence",
    tagline: "Autonomous document OCR, deed parsing & exception workflows",
    hasPrice: false,
    monthlyPrice: null,
    statusBadge: "Private Beta",
    statusType: "pilot",
    description: "Domain-trained models. Quoted as custom pilot during enterprise scoping."
  },
  {
    id: "stack-legal-ops",
    name: "e-Legal Practice Module",
    category: "Legal Systems",
    tagline: "Court e-filing, cryptographic evidence vault & trust accounting",
    hasPrice: false,
    monthlyPrice: null,
    statusBadge: "Active Solution",
    statusType: "pilot",
    description: "Bespoke institutional legal workflows. Quoted per firm/ministry requirements."
  },
  {
    id: "stack-flow-procure",
    name: "Zakeem Flow: B2B Procurement",
    category: "Operations",
    tagline: "3-way invoice matching, supplier compliance & milestone escrow",
    hasPrice: false,
    monthlyPrice: null,
    statusBadge: "Q4 Roadmap",
    statusType: "roadmap",
    description: "Industrial supply-chain module. Included in early roadmap onboarding."
  },
  {
    id: "stack-vault-treasury",
    name: "Zakeem Vault: Treasury Rails",
    category: "Fintech",
    tagline: "Programmable multi-currency settlement & automated FX hedging",
    hasPrice: false,
    monthlyPrice: null,
    statusBadge: "Architecture Phase",
    statusType: "roadmap",
    description: "Institutional financial infrastructure. Custom architectural integration."
  }
];

export interface ComputedStackPricing {
  standaloneMonthlyTotal: number;
  bundleMonthlyTotal: number;
  effectiveMonthlyPrice: number;
  annualBillingTotal: number;
  monthlySavings: number;
  annualSavings: number;
  bundleDiscountApplied: boolean;
  annualDiscountApplied: boolean;
  pricedItemCount: number;
  unpricedItemCount: number;
  unpricedItemNames: string[];
}

export const calculateStackPricing = (
  selectedIds: string[],
  billingPeriod: BillingPeriod
): ComputedStackPricing => {
  const selectedModules = STACK_MODULES.filter((m) => selectedIds.includes(m.id));
  const pricedModules = selectedModules.filter((m) => m.hasPrice && typeof m.monthlyPrice === "number");
  const unpricedModules = selectedModules.filter((m) => !m.hasPrice || m.monthlyPrice === null);

  const standaloneMonthlyTotal = pricedModules.reduce((acc, curr) => acc + (curr.monthlyPrice || 0), 0);

  // Apply bundle discount if 2 or more priced modules are selected
  const bundleDiscountApplied = pricedModules.length >= 2;
  const bundleMonthlyTotal = bundleDiscountApplied
    ? Math.round(standaloneMonthlyTotal * (1 - BUNDLE_DISCOUNT_PERCENT / 100))
    : standaloneMonthlyTotal;

  // Annual calculation
  const annualDiscountApplied = billingPeriod === "annual";
  const effectiveMonthlyPrice = annualDiscountApplied
    ? Math.round(bundleMonthlyTotal * (1 - ANNUAL_DISCOUNT_PERCENT / 100))
    : bundleMonthlyTotal;

  const annualBillingTotal = effectiveMonthlyPrice * 12;
  const fullUnbundledAnnual = standaloneMonthlyTotal * 12;
  const annualSavings = fullUnbundledAnnual - annualBillingTotal;
  const monthlySavings = standaloneMonthlyTotal - effectiveMonthlyPrice;

  return {
    standaloneMonthlyTotal,
    bundleMonthlyTotal,
    effectiveMonthlyPrice,
    annualBillingTotal,
    monthlySavings,
    annualSavings,
    bundleDiscountApplied,
    annualDiscountApplied,
    pricedItemCount: pricedModules.length,
    unpricedItemCount: unpricedModules.length,
    unpricedItemNames: unpricedModules.map((m) => m.name),
  };
};

