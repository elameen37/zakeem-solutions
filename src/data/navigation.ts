export interface NavItem {
  label: string;
  href: string;
  description?: string;
  badge?: string;
  children?: {
    label: string;
    href: string;
    description: string;
    icon?: string;
    badge?: string;
  }[];
}

export const MAIN_NAVIGATION: NavItem[] = [
  {
    label: "Solutions",
    href: "/solutions",
    description: "Industry-tailored digital transformation and enterprise systems.",
    children: [
      {
        label: "Enterprise Systems",
        href: "/solutions/enterprise",
        description: "Core modernization, microservices, and unified governance.",
        icon: "Building"
      },
      {
        label: "Public Sector & Government",
        href: "/solutions/government",
        description: "Citizen portals, digital registry, and sovereign data infrastructure.",
        icon: "Landmark"
      },
      {
        label: "Real Estate & Infrastructure",
        href: "/solutions/real-estate",
        description: "Property sales, land parcel subdivision, and asset automation.",
        icon: "Home",
        badge: "Flagship"
      },
      {
        label: "Banking & Financial Services",
        href: "/solutions/finance",
        description: "High-throughput settlement, AI fraud detection, and open banking.",
        icon: "Coins"
      },
      {
        label: "Healthcare & Life Sciences",
        href: "/solutions/healthcare",
        description: "Interoperable clinical records, telemedicine, and pharma tracking.",
        icon: "Activity"
      },
      {
        label: "Energy & Utilities",
        href: "/solutions/energy",
        description: "Smart grid analytics, automated power vending, and IoT monitoring.",
        icon: "Zap"
      }
    ]
  },
  {
    label: "Products",
    href: "/products",
    description: "Proprietary enterprise platforms and SaaS tools built by Zakeem.",
    children: [
      {
        label: "Zakeem Realty ERP",
        href: "/products/zakeem-realty-erp",
        description: "End-to-end real estate sales, land allocation, CRM, and accounting.",
        icon: "Building2",
        badge: "v2.4 Live"
      },
      {
        label: "Zakeem Cortex AI",
        href: "/products/cortex-ai",
        description: "Autonomous workflow execution and intelligent document cognition.",
        icon: "BrainCircuit",
        badge: "Preview"
      },
      {
        label: "Zakeem Flow",
        href: "/products/flow-procure",
        description: "B2B procurement, supplier compliance, and invoice reconciliation.",
        icon: "Workflow",
        badge: "Q4 Roadmap"
      },
      {
        label: "All Product Ecosystem",
        href: "/products",
        description: "Explore the complete Zakeem suite of digital products.",
        icon: "Layers"
      }
    ]
  },
  {
    label: "Services",
    href: "/services",
    description: "End-to-end engineering, cloud, AI, and strategic technology consulting.",
    children: [
      {
        label: "Software Engineering",
        href: "/services/software-development",
        description: "Bespoke mission-critical backends, mobile apps, and distributed APIs.",
        icon: "Code2"
      },
      {
        label: "AI & Automation",
        href: "/services/ai-automation",
        description: "Fine-tuned enterprise models, RAG pipelines, and agent systems.",
        icon: "Bot"
      },
      {
        label: "Enterprise Solutions",
        href: "/services/enterprise-solutions",
        description: "Comprehensive ERP deployment, systems integration, and migration.",
        icon: "Layers"
      },
      {
        label: "Cloud & Infrastructure",
        href: "/services/cloud-infrastructure",
        description: "High-availability Kubernetes, multi-cloud IaC, and SRE resilience.",
        icon: "Cloud"
      },
      {
        label: "Cybersecurity & Governance",
        href: "/services/cybersecurity",
        description: "Zero-trust hardening, penetration testing, and compliance readiness.",
        icon: "Shield"
      },
      {
        label: "Technology Consulting",
        href: "/services/consulting",
        description: "Boardroom technology strategy, architecture audits, and CTO advisory.",
        icon: "Compass"
      }
    ]
  },
  {
    label: "Pricing",
    href: "/pricing"
  },
  {
    label: "Industries",
    href: "/industries"
  },
  {
    label: "Insights",
    href: "/insights"
  },
  {
    label: "Company",
    href: "/about"
  }
];

export const FOOTER_NAVIGATION = {
  products: [
    { label: "Zakeem Realty ERP", href: "/products/zakeem-realty-erp" },
    { label: "Zakeem Cortex AI", href: "/products/cortex-ai" },
    { label: "Zakeem Flow", href: "/products/flow-procure" },
    { label: "Zakeem Vault", href: "/products/vault-pay" },
    { label: "Product Roadmap", href: "/products" },
    { label: "Enterprise Pricing", href: "/pricing" }
  ],
  solutions: [
    { label: "Enterprise Systems", href: "/solutions/enterprise" },
    { label: "Public Sector & Government", href: "/solutions/government" },
    { label: "Real Estate & Land", href: "/solutions/real-estate" },
    { label: "Banking & Financial Services", href: "/solutions/finance" },
    { label: "Healthcare & Life Sciences", href: "/solutions/healthcare" },
    { label: "Energy & Utilities", href: "/solutions/energy" },
    { label: "Agriculture & Food Security", href: "/solutions/agriculture" }
  ],
  services: [
    { label: "Software Engineering", href: "/services/software-development" },
    { label: "AI & Automation", href: "/services/ai-automation" },
    { label: "Enterprise Solutions", href: "/services/enterprise-solutions" },
    { label: "Technology Consulting", href: "/services/consulting" },
    { label: "Cloud & Infrastructure", href: "/services/cloud-infrastructure" },
    { label: "Cybersecurity", href: "/services/cybersecurity" },
    { label: "UI/UX & Product Design", href: "/services/ui-ux" },
    { label: "Training & Enablement", href: "/services/training" }
  ],
  company: [
    { label: "About Zakeem", href: "/about" },
    { label: "Leadership & Vision", href: "/about#leadership" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Careers & Fellowship", href: "/careers" },
    { label: "Pricing & Engagements", href: "/pricing" },
    { label: "Contact Sales", href: "/contact" },
    { label: "Request a Demo", href: "/request-demo" }
  ],
  resources: [
    { label: "Insights & Whitepapers", href: "/insights" },
    { label: "Client Support Portal", href: "/support" },
    { label: "Client Login", href: "/login" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" }
  ]
};
