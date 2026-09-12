export type ProductStatus = "Available" | "Private Beta" | "Active Solution" | "In Development" | "Coming Soon";

export interface ZakeemApplication {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  primaryValueProp: string;
  category: "Enterprise ERP" | "AI & Intelligence" | "Operations" | "Fintech" | "Infrastructure" | "Legal & Public Sector";
  status: ProductStatus;
  statusDetail?: string;
  featured: boolean;
  version: string;
  iconName: string;
  route: string;
  internalPath: string; // backwards compatibility
  ctaText: string;
  externalUrl?: string;
  stats?: { label: string; value: string }[];
  highlights: string[];
}

export const ZAKEEM_APPLICATIONS: ZakeemApplication[] = [
  {
    id: "zakeem-realty-erp",
    name: "Zakeem Realty ERP",
    slug: "zakeem-realty-erp",
    tagline: "Enterprise Real Estate, Property Management & Sales Platform",
    description:
      "A unified multi-tenant ERP platform engineered specifically for modern real-estate developers, property managers, and land aggregators. Integrates full-lifecycle property sales, CRM, land registry, construction procurement, finance, and AI-driven predictive valuation.",
    primaryValueProp: "Consolidate sales, construction procurement, accounting, and land registry into one audit-proof system.",
    category: "Enterprise ERP",
    status: "Available",
    statusDetail: "v2.4 Enterprise in Production",
    featured: true,
    version: "2.4 Enterprise",
    iconName: "Building2",
    route: "/products/zakeem-realty-erp",
    internalPath: "/products/zakeem-realty-erp",
    ctaText: "Explore Flagship Platform",
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
  },
  {
    id: "zakeem-cortex-ai",
    name: "Zakeem Cortex AI",
    slug: "cortex-ai",
    tagline: "Enterprise Autonomous Workflow & Document Intelligence",
    description:
      "An intelligent automation orchestration layer that enables enterprise organizations to deploy fine-tuned domain models, document extraction pipelines, and automated decision flows across legacy infrastructure.",
    primaryValueProp: "Automate complex document extraction and high-consequence business workflows with private VPC intelligence.",
    category: "AI & Intelligence",
    status: "Private Beta",
    statusDetail: "Private Beta / Early Access",
    featured: false,
    version: "1.0 Beta",
    iconName: "BrainCircuit",
    route: "/request-demo?product=cortex-ai",
    internalPath: "/request-demo?product=cortex-ai",
    ctaText: "Request Early Access",
    stats: [
      { label: "Extraction Accuracy", value: "99.4%" },
      { label: "Process Latency", value: "< 250ms" },
    ],
    highlights: [
      "Domain-adaptive multi-modal OCR",
      "Secure on-premise & private VPC deployment",
      "Autonomous exception resolution pipelines",
    ],
  },
  {
    id: "e-legal-justice",
    name: "e-Legal & Justice Systems",
    slug: "e-legal",
    tagline: "Court Digitization, Case Intelligence & Legal Practice Management",
    description:
      "Modern digital infrastructure engineered for private law firms, corporate legal teams, and public justice ministries. Integrates case dossier tracking, automated court e-filing, cryptographic evidence vaults, and statutory research.",
    primaryValueProp: "Unify legal case management, evidentiary custody, and trust accounting into an audit-grade sovereign platform.",
    category: "Legal & Public Sector",
    status: "Active Solution",
    statusDetail: "Active Institutional Solution",
    featured: false,
    version: "Enterprise Solution",
    iconName: "Scale",
    route: "/solutions/e-legal",
    internalPath: "/solutions/e-legal",
    ctaText: "Explore Legal Solution",
    stats: [
      { label: "Dossier Lifecycle", value: "100% Digital" },
      { label: "Filing Latency", value: "Instant" },
    ],
    highlights: [
      "Comprehensive matter & case dossier lifecycle management",
      "Automated court e-filing & judicial registry interoperability",
      "Cryptographic evidence chain-of-custody & tamper-proof vaults",
    ],
  },
  {
    id: "zakeem-flow-procure",
    name: "Zakeem Flow",
    slug: "flow-procure",
    tagline: "Intelligent Supply Chain & B2B Procurement Hub",
    description:
      "Next-generation digital procurement and supply-chain reconciliation platform connecting industrial manufacturers, public infrastructure contractors, and institutional vendors.",
    primaryValueProp: "Automate 3-way invoice matching and transparent supplier compliance across multi-billion-dollar supply chains.",
    category: "Operations",
    status: "In Development",
    statusDetail: "Roadmap Release Q4 2026",
    featured: false,
    version: "Coming Q4",
    iconName: "Workflow",
    route: "/contact?product=flow-procure&type=roadmap-briefing",
    internalPath: "/contact?product=flow-procure&type=roadmap-briefing",
    ctaText: "Join Roadmap Briefing",
    stats: [
      { label: "Supplier Compliance", value: "100%" },
      { label: "Spend Transparency", value: "Real-time" },
    ],
    highlights: [
      "Automated 3-way invoice matching",
      "Smart contract escrow guarantees",
      "Carbon and ESG supplier verification",
    ],
  },
  {
    id: "zakeem-vault-pay",
    name: "Zakeem Vault",
    slug: "vault-pay",
    tagline: "Enterprise Treasury & Programmable Settlement Rail",
    description:
      "High-throughput multi-currency treasury management and automated merchant settlement rail built for cross-border African commerce and institutional liquidity.",
    primaryValueProp: "Programmable institutional multi-currency settlement with bank-grade HSM encryption and automated FX hedging.",
    category: "Fintech",
    status: "In Development",
    statusDetail: "Architecture & Compliance Phase",
    featured: false,
    version: "Architecture Phase",
    iconName: "ShieldCheck",
    route: "/contact?product=vault-pay&type=strategic-brief",
    internalPath: "/contact?product=vault-pay&type=strategic-brief",
    ctaText: "Request Strategic Brief",
    stats: [
      { label: "Settlement Time", value: "Instant" },
      { label: "Multi-Currency", value: "12+ Corridors" },
    ],
    highlights: [
      "Direct central bank and switch integrations",
      "Automated FX hedging protocols",
      "Bank-grade AES-256 HSM encryption",
    ],
  },
];
