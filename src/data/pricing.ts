export interface ProductPricingTier {
  id: string;
  name: string;
  tierCode: "STARTER" | "GROWTH" | "BUSINESS" | "ENTERPRISE";
  tagline: string;
  priceModel: "Starting from" | "Custom";
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
    priceAmount: "₦2,500,000",
    billingPeriod: "per month (billed annually in NGN)",
    targetScale: "Up to 50 active users • Single Business Entity",
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
    priceAmount: "₦6,000,000",
    billingPeriod: "per month (billed annually in NGN)",
    targetScale: "Up to 250 active users • Multi-Entity / Subsidiary Support",
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
    investmentTier: "Starting from ₦18,500,000",
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
    investmentTier: "Starting from ₦28,000,000 / mo",
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
