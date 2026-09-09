export interface SolutionItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  iconName: string;
  stats: { label: string; value: string };
  capabilities: string[];
  transformationImpact: string;
}

export const SOLUTIONS: SolutionItem[] = [
  {
    id: "enterprise",
    slug: "enterprise",
    title: "Enterprise Systems",
    tagline: "Modernization, Core Scalability & Unified Governance",
    description: "Architecting resilient digital backbones for multi-tier enterprises. We replace legacy monolithic drag with modern event-driven microservices, high-throughput data fabrics, and automated workflows.",
    iconName: "Building",
    stats: { label: "System Efficiency", value: "+45%" },
    capabilities: [
      "Legacy Core Decoupling & Cloud Migration",
      "Enterprise Service Bus & API Gateway Infrastructure",
      "Unified Identity & Access Governance (IAM)",
      "Continuous Compliance & Regulatory Reporting Engines"
    ],
    transformationImpact: "Enables large organizations to innovate at startup velocity while maintaining rigid enterprise security and governance."
  },
  {
    id: "government",
    slug: "government",
    title: "Public Sector & Government",
    tagline: "Citizen Services, Digital Identity & Sovereign Infrastructure",
    description: "Secure, transparent public digital infrastructure built to process citizen identification, automated revenue collection, registry digitization, and sovereign data governance.",
    iconName: "Landmark",
    stats: { label: "Citizen Reach", value: "10M+" },
    capabilities: [
      "Digital Identity & Biometric Verification Gates",
      "National & Regional Revenue Collection Portals",
      "Civil Registry & Land Title Digitization",
      "Inter-Agency Secure Messaging & Document Rails"
    ],
    transformationImpact: "Eliminates administrative bottlenecks, reduces leakages, and restores citizen trust through frictionless digital service delivery."
  },
  {
    id: "real-estate",
    slug: "real-estate",
    title: "Real Estate & Infrastructure",
    tagline: "End-to-End Asset Lifecycle, Property Sales & Land Management",
    description: "From raw land acquisition and multi-tier plot subdivision to multi-channel property sales, digital leasing, and predictive maintenance powered by our flagship Zakeem Realty ERP platform.",
    iconName: "Home",
    stats: { label: "Transaction Velocity", value: "4x Faster" },
    capabilities: [
      "Turnkey Property Sales & Payment Allocation Portals",
      "Interactive GIS Land Registry & Plot Boundary Tracking",
      "Automated Lease Accounting, Invoicing & Escalations",
      "Construction Procurement & Milestone Disbursement Control"
    ],
    transformationImpact: "Consolidates disconnected spreadsheets, broker silos, and payment delays into a high-octane real estate operating engine."
  },
  {
    id: "finance",
    slug: "finance",
    title: "Banking & Financial Services",
    tagline: "High-Volume Settlement Rails, Fraud Detection & Core Fintech",
    description: "Architecting low-latency transactional cores, automated reconciliation systems, and regulatory-grade AI fraud surveillance models for tier-one financial institutions.",
    iconName: "Coins",
    stats: { label: "Reconciliation Speed", value: "Real-time" },
    capabilities: [
      "Real-time Clearing & Settlement Integration",
      "AI-Powered Anti-Money Laundering (AML) & Fraud Heuristics",
      "Open Banking APIs & ISO 20022 Financial Messaging",
      "Embedded Lending & Automated Credit Scoring Engines"
    ],
    transformationImpact: "Empowers financial institutions to process millions of transactions per second with mathematical accuracy and compliance."
  },
  {
    id: "healthcare",
    slug: "healthcare",
    title: "Healthcare & Life Sciences",
    tagline: "Interoperable Clinical Records & Health Logistics",
    description: "Digitizing hospital management, telemedicine pipelines, pharmaceutical traceability, and patient registry systems with strict HIPAA and GDPR-grade cryptographic controls.",
    iconName: "Activity",
    stats: { label: "Patient Turnaround", value: "-60%" },
    capabilities: [
      "Electronic Health Record (EHR) Interoperability (HL7/FHIR)",
      "Secure Tele-consultation & Remote Patient Triage",
      "Pharmaceutical Inventory Serialization & Anti-Counterfeit Tracking",
      "AI Diagnostic Clinical Decision Support Systems"
    ],
    transformationImpact: "Elevates clinical outcomes, eliminates record loss, and builds resilient healthcare distribution networks across emerging markets."
  },
  {
    id: "education",
    slug: "education",
    title: "Education & EdTech",
    tagline: "Scalable Learning Management & Campus Automation",
    description: "Next-generation institutional software uniting student lifecycle management, digital examinations, tuition disbursement, and adaptive AI-driven learning pathways.",
    iconName: "GraduationCap",
    stats: { label: "Campus Productivity", value: "+55%" },
    capabilities: [
      "Enterprise Campus Information Systems (SIS)",
      "High-Concurrency Digital Assessment & Anti-Cheat Protocols",
      "Automated Tuition Billing & Financial Aid Reconciliation",
      "Personalized Learning Analytics & Student Retention Forecasting"
    ],
    transformationImpact: "Modernizes higher-education operations and bridges educational access across broad student demographics."
  },
  {
    id: "energy",
    slug: "energy",
    title: "Energy & Utilities",
    tagline: "Grid Intelligence, Smart Metering & Asset Monitoring",
    description: "IoT-enabled telematics, smart grid distribution analytics, predictive asset maintenance, and automated utility billing for energy generation and distribution providers.",
    iconName: "Zap",
    stats: { label: "Downtime Prevention", value: "98.2%" },
    capabilities: [
      "IoT Smart Meter Telemetry & Real-Time Ingestion",
      "Predictive Grid Anomaly & Fault Localization",
      "Automated Power Vending & Multi-Gateway Tariff Settlement",
      "Renewable Asset (Solar/Hydro) Performance Optimization"
    ],
    transformationImpact: "Provides continuous operational visibility over distributed energy assets while minimizing aggregate commercial and technical losses."
  },
  {
    id: "agriculture",
    slug: "agriculture",
    title: "AgriTech & Food Security",
    tagline: "Supply Chain Traceability & Yield Forecasting",
    description: "Connecting smallholder farmer cooperatives with commercial agro-processors through mobile crop aggregation, commodity warehousing receipts, and satellite-guided yield estimation.",
    iconName: "Sprout",
    stats: { label: "Supply Transparency", value: "100%" },
    capabilities: [
      "Digital Outgrower Scheme Management & Farm Mapping",
      "Electronic Warehouse Receipt & Commodity Trading Portals",
      "Satellite & Weather-Data Driven Micro-Insurance Scoring",
      "Cold-Chain Logistics Sensor Telemetry"
    ],
    transformationImpact: "Drives food security and economic empowerment by giving agricultural value chains digital accountability and market access."
  },
  {
    id: "manufacturing",
    slug: "manufacturing",
    title: "Industrial Manufacturing",
    tagline: "Smart Factory Automation & Quality Assurance",
    description: "Shop-floor MES integration, machine downtime prediction, automated bill-of-materials tracking, and computer-vision defect inspection for industrial plants.",
    iconName: "Factory",
    stats: { label: "OEE Improvement", value: "+28%" },
    capabilities: [
      "Manufacturing Execution Systems (MES) & SCADA Bridging",
      "Computer Vision High-Speed Defect Detection",
      "Predictive Machine Tool Maintenance Scheduling",
      "Just-In-Time (JIT) Raw Material Inventory Orchestration"
    ],
    transformationImpact: "Transforms traditional manufacturing operations into lean, highly predictable digital plants with minimal scrap rates."
  },
  {
    id: "logistics",
    slug: "logistics",
    title: "Logistics & Supply Chain",
    tagline: "Fleet Telematics, Route Optimization & Port Clearing",
    description: "Automating multimodal freight forwarding, port clearance documentation, dynamic delivery routing, and last-mile dispatch across complex African transport corridors.",
    iconName: "Truck",
    stats: { label: "Fuel & Route Savings", value: "22%" },
    capabilities: [
      "Dynamic Fleet Dispatch & AI Fuel Route Optimization",
      "Automated Customs Clearance & Cargo Manifest Tracking",
      "Real-time Cold-Chain & Fragile Asset Shock Telematics",
      "Decentralized Hub & Spoke Last-Mile Delivery Network"
    ],
    transformationImpact: "Cuts cross-border shipping delays and dramatically reduces the cost per ton-kilometer across pan-African transit routes."
  }
];
