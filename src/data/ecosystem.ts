export type ProductStatus =
  | "Available"
  | "Beta"
  | "Private Beta"
  | "Active Solution"
  | "In Development"
  | "Coming Soon"
  | "Pilot"
  | "Early Access"
  | "Roadmap";

export interface ZakeemApplication {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  shortDescription?: string;
  longDescription?: string;
  primaryValueProp: string;
  targetAudience?: string;
  capabilities?: string[];
  category: "Enterprise ERP" | "AI & Intelligence" | "Operations" | "Fintech" | "Infrastructure" | "Legal & Public Sector";
  status: ProductStatus;
  statusDetail?: string;
  featured: boolean;
  version: string;
  iconName: string;
  route: string;
  internalPath: string; // backwards compatibility
  ctaText: string;
  ctaDestination?: string;
  externalUrl?: string;
  stats?: { label: string; value: string }[];
  highlights: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export const ZAKEEM_APPLICATIONS: ZakeemApplication[] = [
  // ============================================================================
  // AVAILABLE PRODUCTS
  // ============================================================================

  // 1. Zakeem Realty ERP (Available)
  {
    id: "zakeem-realty-erp",
    name: "Zakeem Realty ERP",
    slug: "zakeem-realty-erp",
    tagline: "Enterprise Real Estate, Property Management & Sales Platform",
    description:
      "A unified multi-tenant ERP platform engineered specifically for modern real-estate developers, property managers, and land aggregators. Integrates full-lifecycle property sales, CRM, land registry, construction procurement, finance, and AI-driven predictive valuation.",
    shortDescription:
      "A unified multi-tenant ERP platform engineered specifically for modern real-estate developers, property managers, and land aggregators.",
    longDescription:
      "Zakeem Realty ERP (v2.4 Enterprise) is our flagship multi-tenant platform built for institutional real estate developers, property managers, and land aggregators across Africa. It consolidates sales, dynamic land parcel allocation, tenant lease accounting, construction procurement, and audited financial ledgers into an audit-proof system.",
    primaryValueProp: "Consolidate sales, construction procurement, accounting, and land registry into one audit-proof system.",
    targetAudience: "Institutional real estate developers, property management firms, land aggregators, and commercial REITs.",
    capabilities: [
      "Property Sales & Direct Payment Workflows",
      "Dynamic Land Subdivision & Plot Allocation",
      "Enterprise Tenant & Lease Accounting",
      "Integrated Zakky AI Valuation Engine",
      "Vendor Procurement & Construction Milestone Tracking",
      "Multi-tenant Audit-Proof Financial Ledger",
    ],
    category: "Enterprise ERP",
    status: "Available",
    statusDetail: "v2.4 Enterprise in Production",
    featured: true,
    version: "2.4 Enterprise",
    iconName: "Building2",
    route: "/products/zakeem-realty-erp",
    internalPath: "/products/zakeem-realty-erp",
    ctaText: "Explore Flagship Platform",
    ctaDestination: "/products/zakeem-realty-erp",
    externalUrl: "https://realty.zakeemsolutions.com",
    stats: [
      { label: "Core Modules", value: "14+" },
      { label: "Sales Accuracy", value: "99.9%" },
      { label: "Inventory Velocity", value: "3.4x" },
    ],
    highlights: [
      "Property Sales & Direct Payment Workflows",
      "Dynamic Land Subdivision & Plot Allocation",
      "Enterprise Tenant & Lease Accounting",
      "Integrated Zakky AI Valuation Engine",
      "Vendor Procurement & Construction Milestone Tracking",
    ],
    seoTitle: "Zakeem Realty ERP — Real Estate & Property Management Platform",
    seoDescription: "Flagship multi-tenant ERP for African real estate developers, property managers, land registries, and lease accounting.",
  },

  // 2. Zakeem Events Booking (Available)
  {
    id: "zakeem-events-booking",
    name: "Zakeem Events Booking",
    slug: "events-booking",
    tagline: "Intelligent Event Operations, Venue Scheduling & Corporate Reservations",
    description:
      "Enterprise event reservations, venue operations, and automated booking scheduling for corporate centers, hospitality properties, and institutional conference facilities.",
    shortDescription:
      "Enterprise event reservations, venue operations, and automated booking scheduling for corporate centers and hospitality venues.",
    longDescription:
      "Zakeem Events Booking is an operational platform engineered for corporate event centers, hospitality venues, and institutional conference facilities. It automates venue reservations, room allocations, catering logistics, equipment staging, and attendee registration workflows into a unified, conflict-free operations calendar.",
    primaryValueProp:
      "Eliminate venue double-bookings and coordinate complex multi-room event logistics with automated scheduling workflows.",
    targetAudience:
      "Corporate event centers, hotel banquet operations, conference facilities, university auditoriums, and private venue managers.",
    capabilities: [
      "Multi-venue and multi-room conflict-free scheduling calendar",
      "Automated attendee registration and ticketing check-in workflows",
      "Resource allocation and equipment provisioning (AV, staging, seating)",
      "Catering logistics, banquet orders, and vendor dispatch notifications",
      "Customer invoicing, deposit handling, and payment milestone tracking",
      "Operational run-of-show timeline coordination and attendant checklists",
    ],
    category: "Operations",
    status: "Available",
    statusDetail: "v1.0 Enterprise in Production",
    featured: false,
    version: "1.0 Enterprise",
    iconName: "CalendarDays",
    route: "/products/events-booking",
    internalPath: "/products/events-booking",
    ctaText: "Explore Platform",
    ctaDestination: "/products/events-booking",
    stats: [
      { label: "Scheduling Accuracy", value: "100%" },
      { label: "Check-in Velocity", value: "3.8x" },
    ],
    highlights: [
      "Multi-venue and multi-room conflict-free calendar",
      "Automated attendee registration and check-in workflows",
      "Resource allocation and equipment provisioning",
    ],
    seoTitle: "Zakeem Events Booking — Venue Scheduling & Event Operations Platform",
    seoDescription:
      "Automate venue reservations, event scheduling, equipment allocation, and attendee workflows with Zakeem Events Booking.",
  },

  // 3. Zakeem Forecourt (Available)
  {
    id: "zakeem-forecourt",
    name: "Zakeem Forecourt",
    slug: "forecourt",
    tagline: "Petroleum Forecourt Operations, Shift Reconciliation & Fuel Inventory Tracking",
    description:
      "Real-time downstream petroleum forecourt operations, attendant shift handovers, pump activity logging, and underground tank inventory tracking.",
    shortDescription:
      "Real-time downstream petroleum forecourt operations, attendant shift handovers, pump activity logging, and underground tank inventory tracking.",
    longDescription:
      "Zakeem Forecourt delivers operational visibility for downstream petroleum retail stations and fuel distributors. It centralizes pump readings, attendant shift reconciliations, underground tank dip-measurements, automated wet-stock variance alerts, and daily sales auditing without relying on unsupported regulatory claims.",
    primaryValueProp:
      "Prevent wet-stock inventory shrinkage, audit pump attendant cash handovers, and reconcile station shifts in real time.",
    targetAudience:
      "Downstream petroleum retail stations, multi-site fuel franchise operators, independent petroleum marketers, and energy station managers.",
    capabilities: [
      "Attendant shift handover, meter opening/closing logs, and cash reconciliation",
      "Underground fuel tank dip-measurement tracking and automated variance alarms",
      "Multi-nozzle and multi-dispenser volume logging and throughput analytics",
      "Lube bay, car-wash, and convenience mart cross-shift audit integration",
      "Centralized multi-station dashboard for executive operational oversight",
      "Tamper-evident audit logging for daily dip-to-pump reconciliation",
    ],
    category: "Operations",
    status: "Available",
    statusDetail: "v1.0 Enterprise in Production",
    featured: false,
    version: "1.0 Enterprise",
    iconName: "Fuel",
    route: "/products/forecourt",
    internalPath: "/products/forecourt",
    ctaText: "Explore Platform",
    ctaDestination: "/products/forecourt",
    stats: [
      { label: "Wet-Stock Visibility", value: "Real-time" },
      { label: "Shift Audit Time", value: "< 15m" },
    ],
    highlights: [
      "Attendant shift handover and cash reconciliation",
      "Underground tank dip tracking and variance alarms",
      "Multi-station executive operational dashboard",
    ],
    seoTitle: "Zakeem Forecourt — Petroleum Forecourt Operations & Inventory Tracking",
    seoDescription:
      "Operational software for retail petroleum forecourts: attendant shift handovers, pump activity logging, tank inventory tracking, and sales audits.",
  },

  // 4. Zakeem Smart Attendance (Available)
  {
    id: "zakeem-smart-attendance",
    name: "Zakeem Smart Attendance",
    slug: "smart-attendance",
    tagline: "Digital Attendance, Workforce Presence & Location-Aware Roster Visibility",
    description:
      "Modern digital workforce attendance with location-aware clock-in, shift rostering, and real-time operational visibility across field offices and sites.",
    shortDescription:
      "Modern digital workforce attendance with location-aware clock-in, shift rostering, and real-time operational visibility across field offices and sites.",
    longDescription:
      "Zakeem Smart Attendance replaces unreliable biometric hardware and paper punch-books with verifiable digital attendance. Built for distributed enterprise workforces, construction sites, field offices, and operational facilities, it provides geofenced check-ins, shift roster automation, absence tracking, and verifiable workforce presence logs.",
    primaryValueProp:
      "Verify distributed employee and contractor presence across remote sites without fragile proprietary biometric hardware.",
    targetAudience:
      "Enterprise operations managers, construction project directors, multi-branch retailers, healthcare facilities, and distributed field workforces.",
    capabilities: [
      "Location-aware geofenced check-in and check-out verification",
      "Multi-shift scheduling, roster planning, and automated shift swaps",
      "Overtime, tardiness, and absence tracking with supervisor sign-offs",
      "Offline-capable field check-ins with automatic cryptographic sync",
      "Role-based attendance dashboards for branch managers and HR teams",
      "One-click attendance report export for payroll reconciliation",
    ],
    category: "Operations",
    status: "Available",
    statusDetail: "v1.0 Enterprise in Production",
    featured: false,
    version: "1.0 Enterprise",
    iconName: "UserCheck",
    route: "/products/smart-attendance",
    internalPath: "/products/smart-attendance",
    ctaText: "Explore Platform",
    ctaDestination: "/products/smart-attendance",
    stats: [
      { label: "Roster Accuracy", value: "99.8%" },
      { label: "Sync Latency", value: "< 1s" },
    ],
    highlights: [
      "Location-aware geofenced check-in verification",
      "Multi-shift scheduling and roster management",
      "Offline-capable check-ins with automatic sync",
    ],
    seoTitle: "Zakeem Smart Attendance — Digital Workforce Presence & Rostering",
    seoDescription:
      "Location-aware digital attendance and workforce presence tracking for enterprises, distributed branches, and field operations.",
  },

  // 5. Zakeem Feedback (Available)
  {
    id: "zakeem-feedback",
    name: "Zakeem Feedback",
    slug: "feedback",
    tagline: "Structured Stakeholder Feedback Collection, Sentiment Intelligence & Analytics",
    description:
      "Multi-channel enterprise survey and feedback collection platform with automated sentiment categorization, NPS tracking, and issue escalation.",
    shortDescription:
      "Multi-channel enterprise survey and feedback collection platform with automated sentiment categorization, NPS tracking, and issue escalation.",
    longDescription:
      "Zakeem Feedback empowers institutions and commercial brands to capture structured stakeholder sentiment across digital and physical touchpoints. Featuring dynamic survey builders, QR-code kiosks, sentiment categorization, and automated ticket escalation, it turns raw customer input into prioritized operational fixes.",
    primaryValueProp:
      "Capture actionable customer and stakeholder feedback with automated sentiment analysis and rapid incident escalation.",
    targetAudience:
      "Customer experience leaders, retail operations teams, hospitality managers, public service desks, and corporate brand teams.",
    capabilities: [
      "Drag-and-drop multi-lingual survey and questionnaire builder",
      "QR-code, SMS, web widget, and on-site kiosk feedback capture channels",
      "Automated keyword and sentiment classification for incoming submissions",
      "Threshold-triggered alert workflows for critical complaints or service failures",
      "Net Promoter Score (NPS) and Customer Satisfaction (CSAT) trend dashboards",
      "Closed-loop ticket escalation integrating with support and service desks",
    ],
    category: "Operations",
    status: "Available",
    statusDetail: "v1.0 Enterprise in Production",
    featured: false,
    version: "1.0 Enterprise",
    iconName: "MessageSquare",
    route: "/products/feedback",
    internalPath: "/products/feedback",
    ctaText: "Explore Platform",
    ctaDestination: "/products/feedback",
    stats: [
      { label: "Response Rate", value: "Up to 4.2x" },
      { label: "Analysis Time", value: "Instant" },
    ],
    highlights: [
      "Multi-channel capture: QR-codes, web widgets, and kiosks",
      "Automated sentiment classification and critical alerts",
      "Closed-loop ticket escalation for customer service teams",
    ],
    seoTitle: "Zakeem Feedback — Enterprise Survey, Sentiment & Stakeholder Feedback",
    seoDescription:
      "Capture and analyze structured customer, employee, and citizen feedback with multi-channel surveys, sentiment categorization, and NPS tracking.",
  },

  // ============================================================================
  // BETA & ACTIVE SOLUTION PRODUCTS
  // ============================================================================

  // 6. Zakeem Cortex AI (Private Beta)
  {
    id: "zakeem-cortex-ai",
    name: "Zakeem Cortex AI",
    slug: "cortex-ai",
    tagline: "Enterprise Autonomous Workflow & Document Intelligence",
    description:
      "An intelligent automation orchestration layer that enables enterprise organizations to deploy fine-tuned domain models, document extraction pipelines, and automated decision flows across legacy infrastructure.",
    shortDescription:
      "An intelligent automation orchestration layer enabling enterprise organizations to deploy fine-tuned domain models and document extraction.",
    longDescription:
      "Zakeem Cortex AI is an enterprise document intelligence and workflow cognition engine. It automates natural-language document extraction for land title deeds, invoices, and bank statements, combined with localized predictive valuation models and autonomous anomaly detection pipelines.",
    primaryValueProp: "Automate complex document extraction and high-consequence business workflows with private VPC intelligence.",
    targetAudience: "Financial institutions, public registries, enterprise compliance teams, and legal departments.",
    capabilities: [
      "Domain-adaptive multi-modal OCR and cadastral deed extraction",
      "Automated bank statement reconciliation and anomaly detection",
      "Zakky AI localized valuation models trained on demographic trends",
      "Secure on-premise and private VPC deployment architecture",
      "Autonomous exception resolution pipelines with human-in-the-loop gates",
    ],
    category: "AI & Intelligence",
    status: "Private Beta",
    statusDetail: "Private Beta / Early Access",
    featured: false,
    version: "1.0 Beta",
    iconName: "BrainCircuit",
    route: "/products/cortex-ai",
    internalPath: "/products/cortex-ai",
    ctaText: "Request Early Access",
    ctaDestination: "/request-demo?product=cortex-ai",
    stats: [
      { label: "Extraction Accuracy", value: "99.4%" },
      { label: "Process Latency", value: "< 250ms" },
    ],
    highlights: [
      "Domain-adaptive multi-modal OCR",
      "Secure on-premise & private VPC deployment",
      "Autonomous exception resolution pipelines",
    ],
    seoTitle: "Zakeem Cortex AI — Enterprise Workflow & Document Intelligence",
    seoDescription: "Deploy fine-tuned domain models, document extraction pipelines, and automated decision flows with Zakeem Cortex AI.",
  },

  // 7. Zakeem Performance (Beta)
  {
    id: "zakeem-performance",
    name: "Zakeem Performance",
    slug: "performance",
    tagline: "Institutional Performance Management, KPI Scorecards & Accountability Architecture",
    description:
      "Institutional performance governance for government organizations and private parastatals, driving objective key results, scorecards, reviews, and verifiable reporting.",
    shortDescription:
      "Institutional performance governance for government organizations and private parastatals, driving objective key results and scorecards.",
    longDescription:
      "Zakeem Performance is an institutional governance and accountability platform built specifically for government organizations, public ministries, departments, and private parastatals. It aligns high-level policy objectives with departmental KPIs, automated quarterly scorecard tracking, multi-tier appraisal reviews, and transparent executive progress reporting without claiming unverified government certifications.",
    primaryValueProp:
      "Transform strategic mandates into transparent, quantifiable departmental KPIs with verifiable audit-ready scorecards.",
    targetAudience:
      "Government organizations and private parastatals, public ministries, departments, municipal councils, regulatory agencies, and institutional oversight bodies.",
    capabilities: [
      "Mandate cascading from high-level policy objectives to departmental KPIs",
      "Quarterly and annual institutional scorecards with multi-stage verification",
      "Directorate and agency deliverable tracking with automated variance reporting",
      "Verifiable evidence attachment vaults for audit-ready compliance",
      "Role-based executive briefing dashboards for ministers, directors, and boards",
      "Structured appraisal workflows with multi-tier approval boundaries",
    ],
    category: "Legal & Public Sector",
    status: "Beta",
    statusDetail: "Beta / Government & Parastatals",
    featured: false,
    version: "1.0 Beta",
    iconName: "TrendingUp",
    route: "/products/performance",
    internalPath: "/products/performance",
    ctaText: "Request Beta Access",
    ctaDestination: "/request-demo?product=performance",
    stats: [
      { label: "Policy Visibility", value: "100%" },
      { label: "Audit Readiness", value: "Instant" },
    ],
    highlights: [
      "Mandate cascading from policy objectives to departmental KPIs",
      "Quarterly scorecards with multi-stage verification",
      "Verifiable evidence attachment vaults for audit readiness",
    ],
    seoTitle: "Zakeem Performance — Institutional KPI Scorecards for Government & Parastatals",
    seoDescription:
      "Institutional performance management and accountability software for government agencies, public ministries, and private parastatals.",
  },

  // 8. Zakeem AI Automated HR (Beta)
  {
    id: "zakeem-ai-automated-hr",
    name: "Zakeem AI Automated HR",
    slug: "ai-automated-hr",
    tagline: "AI-Assisted Human Resource Operations, Employee Lifecycle & Payroll Workflows",
    description:
      "Next-generation HR automation platform combining employee lifecycle management, document intelligence, and compliance-ready payroll workflows.",
    shortDescription:
      "Next-generation HR automation platform combining employee lifecycle management, document intelligence, and compliance-ready payroll workflows.",
    longDescription:
      "Zakeem AI Automated HR transforms corporate HR administration into an intelligent, low-friction operation. From onboarding document extraction and digital employee dossiers to automated leave calculations and audited payroll preparation, the platform enhances human decision-making with AI intelligence while keeping critical financial authorizations strictly supervised.",
    primaryValueProp:
      "Streamline employee onboarding, document parsing, and monthly payroll computation with supervised AI intelligence.",
    targetAudience:
      "Corporate HR leaders, people operations teams, enterprise CFOs, and growing mid-market companies requiring structured HR automation.",
    capabilities: [
      "AI-assisted CV and onboarding document parsing with automatic profile generation",
      "Automated leave management, sick day tracking, and policy enforcement",
      "Employee digital dossier vault with contract expiry and appraisal reminders",
      "Configurable salary structures, statutory tax deductions (PAYE, Pension, NHF), and payroll schedules",
      "Self-service employee portal for pay slips, leave requests, and tax documentation",
      "Supervised payroll run generation with double-approval authorization workflows",
    ],
    category: "AI & Intelligence",
    status: "Beta",
    statusDetail: "Beta / HR & Payroll Automation",
    featured: false,
    version: "1.0 Beta",
    iconName: "Bot",
    route: "/products/ai-automated-hr",
    internalPath: "/products/ai-automated-hr",
    ctaText: "Request Beta Access",
    ctaDestination: "/request-demo?product=ai-automated-hr",
    stats: [
      { label: "Onboarding Time", value: "-75%" },
      { label: "Payroll Prep", value: "3x Faster" },
    ],
    highlights: [
      "AI-assisted employee onboarding and document parsing",
      "Statutory payroll schedules and tax deductions (PAYE, Pension)",
      "Self-service employee portal for pay slips and requests",
    ],
    seoTitle: "Zakeem AI Automated HR — HR Automation & Payroll Intelligence",
    seoDescription:
      "Streamline corporate HR administration, employee lifecycle, document extraction, and payroll workflows with Zakeem AI Automated HR.",
  },

  // 9. e-Legal & Justice Systems (Active Solution)
  {
    id: "e-legal-justice",
    name: "e-Legal & Justice Systems",
    slug: "e-legal",
    tagline: "Court Digitization, Case Intelligence & Legal Practice Management",
    description:
      "Modern digital infrastructure engineered for private law firms, corporate legal teams, and public justice ministries. Integrates case dossier tracking, automated court e-filing, cryptographic evidence vaults, and statutory research.",
    shortDescription:
      "Modern digital infrastructure engineered for private law firms, corporate legal teams, and public justice ministries.",
    longDescription:
      "e-Legal & Justice Systems provides sovereign case dossier lifecycle tracking, automated court e-filing, cryptographic evidence chain-of-custody, and trust accounting. Engineered to accelerate judicial workflows and protect legal custody without compromise.",
    primaryValueProp: "Unify legal case management, evidentiary custody, and trust accounting into an audit-grade sovereign platform.",
    targetAudience: "Private law firms, corporate legal departments, bar associations, and state ministries of justice.",
    capabilities: [
      "Comprehensive matter and case dossier lifecycle tracking",
      "Automated court e-filing and judicial registry interoperability",
      "Cryptographic evidence chain-of-custody and tamper-proof vaults",
      "Trust accounting and compliance ledger for legal retainers",
      "Statutory research assistant and statutory precedent indexing",
    ],
    category: "Legal & Public Sector",
    status: "Active Solution",
    statusDetail: "Active Institutional Solution",
    featured: false,
    version: "Enterprise Solution",
    iconName: "Scale",
    route: "/solutions/e-legal",
    internalPath: "/solutions/e-legal",
    ctaText: "Explore Legal Solution",
    ctaDestination: "/solutions/e-legal",
    stats: [
      { label: "Dossier Lifecycle", value: "100% Digital" },
      { label: "Filing Latency", value: "Instant" },
    ],
    highlights: [
      "Comprehensive matter & case dossier lifecycle management",
      "Automated court e-filing & judicial registry interoperability",
      "Cryptographic evidence chain-of-custody & tamper-proof vaults",
    ],
    seoTitle: "e-Legal & Justice Systems — Court Digitization & Legal Practice",
    seoDescription: "Case management, court e-filing, and practice automation for law firms, legal departments, and justice ministries.",
  },

  // ============================================================================
  // IN DEVELOPMENT PRODUCTS
  // ============================================================================

  // 10. Zakeem Secure Messaging (In Development)
  {
    id: "zakeem-secure-messaging",
    name: "Zakeem Secure Messaging",
    slug: "secure-messaging",
    tagline: "Controlled Enterprise Communication, Sovereign Message Vaults & Operational Broadcasts",
    description:
      "Protected enterprise messaging architecture for organizational communication, executive confidentiality, and operational emergency alerts.",
    shortDescription:
      "Protected enterprise messaging architecture for organizational communication, executive confidentiality, and operational emergency alerts.",
    longDescription:
      "Zakeem Secure Messaging provides an organizational communication infrastructure designed to keep sensitive institutional discussions off consumer chat apps. Offering sovereign data boundary isolation, controlled room membership, cryptographic message signing, message retention policies, and high-priority operational broadcast channels, it ensures confidential business continuity without unverified claims.",
    primaryValueProp:
      "Keep sensitive board, financial, and executive discussions inside sovereign enterprise boundaries with full audit compliance.",
    targetAudience:
      "Corporate executive committees, compliance officers, bank leadership, security teams, and distributed operational crisis desks.",
    capabilities: [
      "Private enterprise communication channels with directory-enforced access boundaries",
      "High-priority operational incident and emergency broadcast rails",
      "Configurable organizational message retention and legal discovery policies",
      "Watermarked media sharing and restricted copy/forward controls for confidential documents",
      "Cryptographic message integrity hashing and tamper-evident audit logging",
      "Sovereign on-premises appliance or dedicated private VPC deployment options",
    ],
    category: "Infrastructure",
    status: "In Development",
    statusDetail: "In Development / Sovereign Architecture",
    featured: false,
    version: "Architecture Phase",
    iconName: "Lock",
    route: "/products/secure-messaging",
    internalPath: "/products/secure-messaging",
    ctaText: "Request Security Briefing",
    ctaDestination: "/contact?product=secure-messaging&type=security-briefing",
    stats: [
      { label: "Data Residency", value: "100% Sovereign" },
      { label: "Broadcast Latency", value: "< 200ms" },
    ],
    highlights: [
      "Directory-enforced private enterprise channels",
      "Configurable message retention and legal discovery compliance",
      "Sovereign private VPC or on-premise appliance deployment",
    ],
    seoTitle: "Zakeem Secure Messaging — Sovereign Enterprise Communication & Alerts",
    seoDescription:
      "Controlled enterprise messaging infrastructure for corporate privacy, organizational communication, compliance retention, and operational broadcasts.",
  },

  // 11. Zakeem Flow (In Development)
  {
    id: "zakeem-flow-procure",
    name: "Zakeem Flow",
    slug: "flow-procure",
    tagline: "Intelligent Supply Chain & B2B Procurement Hub",
    description:
      "Next-generation digital procurement and supply-chain reconciliation platform connecting industrial manufacturers, public infrastructure contractors, and institutional vendors.",
    shortDescription:
      "Next-generation digital procurement and supply-chain reconciliation platform connecting manufacturers and vendors.",
    longDescription:
      "Zakeem Flow automates 3-way invoice matching, vendor pre-qualification, purchase requisition approvals, and transparent supplier compliance across multi-billion-dollar industrial and infrastructure supply chains.",
    primaryValueProp: "Automate 3-way invoice matching and transparent supplier compliance across multi-billion-dollar supply chains.",
    targetAudience: "Industrial manufacturers, infrastructure contractors, retail procurement divisions, and supply chain operators.",
    capabilities: [
      "Automated 3-way invoice matching (PO, Delivery Note, Invoice)",
      "Vendor pre-qualification, compliance tracking, and ESG verification",
      "Purchase requisition approval matrix with budget threshold enforcement",
      "Real-time supplier delivery milestone auditing",
      "Multi-currency procurement accounting with ERP connector integrations",
    ],
    category: "Operations",
    status: "In Development",
    statusDetail: "Roadmap Release Q4 2026",
    featured: false,
    version: "Coming Q4",
    iconName: "Workflow",
    route: "/products/flow-procure",
    internalPath: "/products/flow-procure",
    ctaText: "Join Roadmap Briefing",
    ctaDestination: "/contact?product=flow-procure&type=roadmap-briefing",
    stats: [
      { label: "Supplier Compliance", value: "100%" },
      { label: "Spend Transparency", value: "Real-time" },
    ],
    highlights: [
      "Automated 3-way invoice matching",
      "Smart contract escrow guarantees",
      "Carbon and ESG supplier verification",
    ],
    seoTitle: "Zakeem Flow — B2B Procurement Hub & Supplier Reconciliation",
    seoDescription: "Automate 3-way invoice matching, supplier compliance, and procurement approvals with Zakeem Flow.",
  },

  // 12. Zakeem Vault (In Development)
  {
    id: "zakeem-vault-pay",
    name: "Zakeem Vault",
    slug: "vault-pay",
    tagline: "Enterprise Treasury & Programmable Settlement Rail",
    description:
      "High-throughput multi-currency treasury management and automated merchant settlement rail built for cross-border African commerce and institutional liquidity.",
    shortDescription:
      "High-throughput multi-currency treasury management and automated merchant settlement rail for enterprise liquidity.",
    longDescription:
      "Zakeem Vault delivers programmable multi-currency treasury operations, automated bank switch reconciliations, automated FX hedging rules, and bank-grade HSM encryption for commercial conglomerates and fintechs.",
    primaryValueProp: "Programmable institutional multi-currency settlement with bank-grade HSM encryption and automated FX hedging.",
    targetAudience: "Commercial conglomerates, fintech operators, treasury departments, and cross-border commercial networks.",
    capabilities: [
      "Multi-currency virtual account aggregation across commercial banks",
      "Automated high-throughput merchant settlement and payout rails",
      "Real-time FX hedging rules and liquidity threshold alerts",
      "Hardware Security Module (HSM) key isolation and cryptographic ledger",
      "Direct regulatory transaction audit reporting and reconciliation",
    ],
    category: "Fintech",
    status: "In Development",
    statusDetail: "Architecture & Compliance Phase",
    featured: false,
    version: "Architecture Phase",
    iconName: "ShieldCheck",
    route: "/products/vault-pay",
    internalPath: "/products/vault-pay",
    ctaText: "Request Strategic Brief",
    ctaDestination: "/contact?product=vault-pay&type=strategic-brief",
    stats: [
      { label: "Settlement Time", value: "Instant" },
      { label: "Multi-Currency", value: "12+ Corridors" },
    ],
    highlights: [
      "Direct central bank and switch integrations",
      "Automated FX hedging protocols",
      "Bank-grade AES-256 HSM encryption",
    ],
    seoTitle: "Zakeem Vault — Enterprise Treasury & Settlement Rail",
    seoDescription: "Multi-currency enterprise treasury, programmable settlement rails, and automated liquidity management with Zakeem Vault.",
  },
];
