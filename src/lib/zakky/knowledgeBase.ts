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
      { label: "Request Live ERP Demo", href: "/request-demo?product=zakeem-realty-erp" },
    ],
  },
  {
    topic: "Pricing & Billing",
    keywords: ["price", "pricing", "cost", "how much", "rate", "naira", "ngn", "subscription", "annual", "monthly", "tier", "starter", "business", "enterprise"],
    summary:
      "All platform pricing is denominated in Nigerian Naira (NGN) with transparent monthly and annual billing options.",
    details:
      "Zakeem Solutions provides transparent, multi-product enterprise pricing in Nigerian Naira (NGN):\n\n1. Zakeem Realty ERP:\n- Starter Tier: ₦150,000 / month (or ₦120,000 / month billed annually at ₦1,440,000 / year) for up to 10 active users.\n- Business Tier: ₦350,000 / month (or ₦280,000 / month billed annually at ₦3,360,000 / year) for up to 25 active users.\n- Enterprise Sovereign Tier: Custom agreement with unlimited users, air-gapped hosting, and dedicated SRE.\n\n2. Zakeem Business Suite (Bundles):\n- Growth Suite: ₦500,000 / month (or ₦400,000 / mo billed annually) for up to 20 users. Bundles ERP, Cortex AI Document Cognition Pilot, and Banking Switch.\n- Enterprise Suite: ₦800,000 / month (or ₦640,000 / mo billed annually) for up to 50 users. Bundles advanced ERP, Zakky AI, Cortex AI Pipeline, and Flow connector.\n- Institutional Sovereign Suite: Custom agreement across the entire software ecosystem.\n\n3. Specialized Ecosystem Platforms:\n- Zakeem Cortex AI: Private Beta with custom pilot agreements.\n- e-Legal & Justice Systems: Active Solution for private law firms and public justice ministries.\n- Zakeem Flow & Zakeem Vault: Strategic roadmap briefings and pilot scoping.\n\n4. Engineering Retainers & Stack Builder:\n- Architectural Forensic Audit: Starting from ₦2,000,000.\n- Dedicated Engineering Pod: Starting from ₦3,000,000 / month.\n- Build Your Stack: Modular customization with 20% multi-product bundle discount.\n- Annual Advantage: 20% pre-payment discount across all subscription plans.",
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
      { label: "Request Cortex AI Early Access", href: "/request-demo?product=cortex-ai" },
      { label: "Explore Enterprise AI Solutions", href: "/solutions/enterprise" },
    ],
  },
  {
    topic: "e-Legal & Justice Systems",
    keywords: ["legal", "court", "justice", "law firm", "case management", "dossier", "e-filing", "evidence vault", "statutory"],
    summary:
      "e-Legal & Justice Systems is an Active Solution engineered for private law firms, corporate legal teams, and public justice ministries.",
    details:
      "Key capabilities:\n- Matter & case dossier lifecycle tracking\n- Automated court e-filing & judicial registry interoperability\n- Cryptographic evidence chain-of-custody vaults\n- Trust accounting and statutory research assistants.",
    actions: [
      { label: "Explore Legal Solution", href: "/solutions/e-legal" },
      { label: "Consult Legal Architect", href: "/contact?solution=e-legal" },
    ],
  },
  {
    topic: "Zakeem Flow & Zakeem Vault",
    keywords: ["flow", "vault", "procurement", "supply chain", "treasury", "settlement", "fx hedging", "invoice matching"],
    summary:
      "Zakeem Flow (B2B Procurement) and Zakeem Vault (Enterprise Treasury & Settlement) are currently In Development on our institutional product roadmap.",
    details:
      "Zakeem Flow automates 3-way invoice matching and transparent supplier compliance.\nZakeem Vault provides high-throughput multi-currency treasury and automated settlement rails with bank-grade HSM encryption.\nBoth are available for roadmap briefings and architecture scoping.",
    actions: [
      { label: "Join Flow Roadmap Briefing", href: "/contact?product=flow-procure&type=roadmap-briefing" },
      { label: "Request Vault Strategic Brief", href: "/contact?product=vault-pay&type=strategic-brief" },
    ],
  },
  {
    topic: "Zakeem Events Booking",
    keywords: ["events", "event", "booking", "venue", "reservation", "conference", "banquet", "hall", "ticketing", "calendar"],
    summary:
      "Zakeem Events Booking is an Available enterprise operations platform engineered for multi-venue reservations, hall scheduling, and automated attendee check-in.",
    details:
      "Key capabilities include:\n- Real-time venue availability and conflict-free multi-hall reservation calendars\n- Automated booking deposits, milestone invoice schedules, and digital payment receipts\n- QR-code digital ticket generation and rapid scanner-based door access\n- Dynamic package customization for corporate conferences, banquets, and recurring civic assemblies\n\nCurrent Lifecycle: Available. Production enterprise deployments available for hospitality groups and event centers.",
    actions: [
      { label: "Explore Events Booking", href: "/products/events-booking" },
      { label: "Request Live Demo", href: "/request-demo?product=events-booking" },
    ],
  },
  {
    topic: "Zakeem Forecourt",
    keywords: ["forecourt", "petroleum", "fuel", "pump", "wet-stock", "shift", "tank", "dip-stick", "filling station", "retail oil"],
    summary:
      "Zakeem Forecourt is an Available operations management platform engineered for independent downstream petroleum retail networks and station forecourts.",
    details:
      "Key capabilities include:\n- Pump meter logging, pump attendant shift handovers, and cash-to-meter reconciliation\n- Underground storage tank (UST) wet-stock dip-stick tracking and variance discrepancy alerting\n- Multi-station centralized oversight with per-nozzle sales velocity reporting\n- Offline-resilient transaction capture with automatic cloud synchronization\n\nCurrent Lifecycle: Available. Production deployments available for petroleum retail operators.",
    actions: [
      { label: "Explore Forecourt Platform", href: "/products/forecourt" },
      { label: "Request Platform Demo", href: "/request-demo?product=forecourt" },
    ],
  },
  {
    topic: "Zakeem Performance",
    keywords: ["performance", "kpi", "scorecard", "mandate", "parastatal", "government", "appraisal", "institutional", "civil service"],
    summary:
      "Zakeem Performance is a Beta institutional performance management and KPI scorecard platform engineered for government organizations and private parastatals.",
    details:
      "Key capabilities include:\n- Multi-tiered organizational scorecard hierarchies with weighted KPI cascading\n- Evidence-backed milestone submissions with immutable multi-level review and sign-off workflows\n- Executive and ministerial dashboards tracking mandate delivery and project execution\n- Sovereign role-based permission tiers supporting government organizations, ministries, and private parastatals\n\nCurrent Lifecycle: Beta. Structured deployments available for government organizations and private parastatals.",
    actions: [
      { label: "Explore Performance Solution", href: "/products/performance" },
      { label: "Request Beta Briefing", href: "/request-demo?product=performance" },
    ],
  },
  {
    topic: "Zakeem Smart Attendance",
    keywords: ["attendance", "smart attendance", "roster", "geofence", "clock-in", "workforce", "presence", "shift", "timesheet"],
    summary:
      "Zakeem Smart Attendance is an Available workforce operations system delivering location-aware attendance verification and shift rostering.",
    details:
      "Key capabilities include:\n- Precision GPS geofencing and localized verification beacons to eliminate proxy clock-ins\n- Dynamic multi-shift rostering, rotational schedules, and overtime calculation\n- Automated exception tracking for tardiness, early exits, and unexcused absences\n- Seamless export and automated synchronization into enterprise payroll and HR workflows\n\nCurrent Lifecycle: Available. Production deployments available for institutional and field workforces.",
    actions: [
      { label: "Explore Smart Attendance", href: "/products/smart-attendance" },
      { label: "Request Workforce Demo", href: "/request-demo?product=smart-attendance" },
    ],
  },
  {
    topic: "Zakeem AI Automated HR",
    keywords: ["hr", "human resources", "payroll", "employee", "onboarding", "leave", "statutory", "pension", "tax deduction", "automated hr"],
    summary:
      "Zakeem AI Automated HR is a Beta AI & intelligence platform combining employee lifecycle management, document intelligence, and compliance-ready payroll workflows.",
    details:
      "Key capabilities include:\n- AI-assisted employee onboarding, credential ingestion, and automated personnel dossier filing\n- Automated payroll calculation with statutory tax brackets (PAYE, Pension, NHF), deductions, and direct pay slip generation\n- Self-service leave request administration, balance tracking, and approval hierarchies\n- Continuous workforce analytics, turnover risk signals, and policy compliance verification\n\nCurrent Lifecycle: Beta. Beta access available for enterprise HR and finance teams.",
    actions: [
      { label: "Explore AI HR Platform", href: "/products/ai-automated-hr" },
      { label: "Request Beta Access", href: "/request-demo?product=ai-automated-hr" },
    ],
  },
  {
    topic: "Zakeem Feedback",
    keywords: ["feedback", "survey", "nps", "csat", "sentiment", "kiosk", "stakeholder", "customer satisfaction", "incident report"],
    summary:
      "Zakeem Feedback is an Available operations platform for multi-channel stakeholder surveys, on-premise kiosk feedback, and automated sentiment scoring.",
    details:
      "Key capabilities include:\n- Multi-channel capture via QR kiosks, web prompts, SMS dispatch, and branded portal links\n- Natural language sentiment scoring and automated topic categorization for executive visibility\n- Automated escalation triggers transforming negative feedback into tracked operational tickets\n- Closed-loop stakeholder resolution tracking with satisfaction verification workflows\n\nCurrent Lifecycle: Available. Production deployments available for customer service, hospitality, and civic operations.",
    actions: [
      { label: "Explore Feedback Platform", href: "/products/feedback" },
      { label: "Request Feedback Demo", href: "/request-demo?product=feedback" },
    ],
  },
  {
    topic: "Zakeem Secure Messaging",
    keywords: ["messaging", "secure messaging", "chat", "secure", "communication", "confidential", "broadcast", "sovereign chat", "audit trail"],
    summary:
      "Zakeem Secure Messaging is an In Development infrastructure platform engineered for sovereign, high-assurance organizational communications and audit compliance.",
    details:
      "Key capabilities include:\n- End-to-end encrypted departmental chat channels, executive groups, and emergency broadcast alerts\n- Sovereign cryptographic key governance with organization-owned keys and strict data residency\n- Granular administrative audit retention policies, statutory legal holds, and immutable export logs\n- Zero third-party telemetry, self-hosted deployment options, and strict access boundaries\n\nCurrent Lifecycle: In Development. Architecture briefings available for security-conscious enterprises and government bodies.",
    actions: [
      { label: "Explore Secure Messaging", href: "/products/secure-messaging" },
      { label: "Request Architecture Briefing", href: "/contact?product=secure-messaging&type=security-briefing" },
    ],
  },
];

