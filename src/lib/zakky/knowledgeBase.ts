export interface KnowledgeFact {
  topic: string;
  keywords: string[];
  summary: string;
  details: string;
  actions: { label: string; href: string }[];
}

export const ZAKKY_KNOWLEDGE_BASE: KnowledgeFact[] = [
  {
    topic: "Zakeem Realty ERP",
    keywords: ["realty", "erp", "real estate", "property", "tenant", "land", "allocation", "subdivision", "sales", "mortgage"],
    summary:
      "Zakeem Realty ERP (v2.4 Enterprise) is our flagship multi-tenant platform built for institutional real estate developers, property managers, and land aggregators across Africa.",
    details:
      "Key modules include:\n- Property Sales & Direct Payment Workflows\n- Dynamic Land Subdivision & Plot Allocation\n- Enterprise Tenant & Lease Accounting\n- Zakky AI Predictive Valuation Engine\n- Vendor Procurement & Milestone Billing\n- Multi-organization Audit-Proof Ledger\n\nIt delivers 99.9% sales record accuracy and accelerates inventory velocity by 3.4x.",
    actions: [
      { label: "Explore Realty ERP Platform", href: "/products/zakeem-realty-erp" },
      { label: "Request Live ERP Demo", href: "/request-demo" },
    ],
  },
  {
    topic: "Pricing & Billing",
    keywords: ["price", "pricing", "cost", "how much", "rate", "naira", "ngn", "subscription", "annual", "monthly", "tier", "starter", "business", "enterprise"],
    summary:
      "All platform pricing is denominated in Nigerian Naira (NGN) with transparent monthly and annual billing options.",
    details:
      "Subscription Tiers:\n- Starter Tier: ₦2,500,000 / month (or ₦2,000,000 / month billed annually at ₦24,000,000 / year). Built for single-entity firms managing up to 250 units or 50 plots.\n- Business Tier: ₦6,000,000 / month (or ₦4,800,000 / month billed annually at ₦57,600,000 / year). Engineered for multi-project developers with up to 2,500 active units.\n- Enterprise Tier: Custom scoped for sovereign agencies and regional REITs with unlimited units and dedicated VPCs.\n\n*Annual Billing Advantage:* Choosing annual billing unlocks an authoritative 20% discount on monthly subscription costs.",
    actions: [
      { label: "View Complete Pricing Matrix", href: "/pricing" },
      { label: "Contact Sales for Enterprise Quote", href: "/contact" },
    ],
  },
  {
    topic: "Engineering Services",
    keywords: ["services", "custom software", "devops", "cloud", "sre", "consulting", "modernization", "architecture", "microservices"],
    summary:
      "Zakeem Solutions provides mission-critical enterprise engineering pods, legacy core decoupling, and sovereign cloud infrastructure.",
    details:
      "Engineering Practices:\n- Custom Software Engineering: High-concurrency Go, Rust, TypeScript, and Python systems.\n- Cloud Architecture & DevOps: Kubernetes orchestration, automated GitOps pipelines, multi-region redundancy.\n- Legacy Modernization: Strangler fig microservices migration and database re-architecting.\n- 24/7 SRE & Security: Sovereign zero-trust security and continuous compliance.",
    actions: [
      { label: "Explore Engineering Services", href: "/services" },
      { label: "Submit RFP Inquiry", href: "/contact" },
    ],
  },
  {
    topic: "Public Sector & Sovereign Systems",
    keywords: ["government", "public sector", "citizen", "revenue", "ministry", "state", "sovereign", "identity", "biometric"],
    summary:
      "We engineer sovereign, high-throughput digital public infrastructure for ministries, state revenue boards, and civil registries.",
    details:
      "Capabilities include biometric verification gates, automated regional tax and stamp duty collection rails, digital land registries, and inter-agency encrypted data fabrics with 100% on-premises data residency compliance.",
    actions: [
      { label: "Public Sector Solutions", href: "/solutions/government" },
      { label: "Schedule Executive Briefing", href: "/contact" },
    ],
  },
  {
    topic: "Careers & Open Positions",
    keywords: ["career", "careers", "jobs", "hiring", "openings", "work", "apply", "engineer", "frontend", "backend", "fellowship", "salary"],
    summary:
      "We are actively recruiting world-class engineers, architects, and technical leaders for our offices in Lagos, Abuja, and Remote roles.",
    details:
      "Open Roles Include:\n- Lead Distributed Systems Architect (Lagos / Hybrid)\n- Staff ERP Core Engineer (Abuja / Hybrid)\n- Senior Full-Stack Engineer (Remote / Nigeria)\n- Principal Security & Zero-Trust Architect (Lagos / Hybrid)\n- Enterprise Solutions Architect (Abuja / On-site)\n- Graduate Engineering Fellowship 2026 (Lagos & Abuja)\n\nBenefits include top-percentile Naira or USD-pegged comp, private executive healthcare, equity options, and continuous R&D grants.",
    actions: [
      { label: "Browse Open Job Roles", href: "/careers" },
      { label: "Life & Culture at Zakeem", href: "/about" },
    ],
  },
  {
    topic: "Corporate Offices & Locations",
    keywords: ["office", "location", "address", "lagos", "abuja", "where", "visit", "headquarters", "contact"],
    summary:
      "Zakeem Solutions operates corporate headquarters in Lagos and an executive sovereign systems facility in Abuja, Nigeria.",
    details:
      "Locations:\n- Lagos Corporate Headquarters:\n  Zakeem Innovation Tower, Level 14, Victoria Island, Lagos, Nigeria.\n\n- Abuja Public Sector & Sovereign Systems Lab:\n  Zakeem Federal Pavilion, Central Business District, Abuja, FCT, Nigeria.\n\nPhone: +234 806 3291 667\nEmail: info@zakeemsolutions.com / enterprise@zakeemsolutions.com",
    actions: [
      { label: "View Office Details & Contact", href: "/contact" },
      { label: "Book a Physical Consultation", href: "/contact" },
    ],
  },
  {
    topic: "Cortex AI & Machine Learning",
    keywords: ["cortex", "ai", "machine learning", "automation", "intelligence", "llm", "predictive", "zakky"],
    summary:
      "Zakeem Cortex AI is our autonomous document parsing, workflow intelligence, and predictive valuation system embedded across our software stack.",
    details:
      "Key features:\n- Natural language document reconciliation for land title deeds and bank statements\n- Automated anomaly detection for revenue collections and procurement\n- Zakky AI valuation models trained on localized demographic and cadastral trends.",
    actions: [
      { label: "Explore AI Solutions", href: "/solutions/enterprise" },
      { label: "Test ZakkyAI Assistant", href: "#" },
    ],
  },
];
