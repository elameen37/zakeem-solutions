export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  iconName: string;
  deliverables: string[];
  technologies: string[];
  engagementModel: string;
}

export const SERVICES: ServiceItem[] = [
  {
    id: "software-development",
    slug: "software-development",
    title: "Software Engineering",
    tagline: "Mission-Critical Systems, High-Concurrency APIs & Custom Platforms",
    description:
      "We design, build, and deploy enterprise-grade custom software architectures built to process millions of transactions without degradation. Using modern typed languages, reactive frameworks, and clean domain-driven design, our engineering teams deliver reliable systems that stand the test of high-scale commercial operation.",
    iconName: "Code2",
    deliverables: [
      "Custom Enterprise Core Applications",
      "High-Throughput Microservices & REST/gRPC APIs",
      "Scalable Web & Mobile Cross-Platform Products",
      "Event-Driven Distributed Messaging Architectures",
      "Legacy Refactoring & Database Re-Architecture"
    ],
    technologies: ["TypeScript", "Go", "Rust", "Python", "React", "PostgreSQL", "Kafka", "Docker"],
    engagementModel: "Dedicated Engineering Pods or Fixed-Scope Turnkey Delivery"
  },
  {
    id: "ai-automation",
    slug: "ai-automation",
    title: "AI & Automation",
    tagline: "Fine-Tuned Domain Models, Agentic Workflows & Cognitive Operations",
    description:
      "Transform manual bottlenecks into self-orchestrating intelligent pipelines. We engineer custom Retrieval-Augmented Generation (RAG) platforms, proprietary LLM fine-tuning, computer-vision quality checks, and autonomous agent workflows grounded in your enterprise security perimeter.",
    iconName: "Bot",
    deliverables: [
      "Enterprise Retrieval-Augmented Generation (RAG) Engines",
      "Domain-Specific Fine-Tuned Model Weights & Quantization",
      "Autonomous Multi-Agent Workflow Orchestration",
      "Computer Vision & Document Ingestion Pipelines",
      "Predictive Analytics & Forecasting Models"
    ],
    technologies: ["PyTorch", "Hugging Face", "LangChain", "vLLM", "Milvus", "OpenAI / Gemini", "Python"],
    engagementModel: "AI Discovery Sprint → Prototype → Enterprise Deployment"
  },
  {
    id: "enterprise-solutions",
    slug: "enterprise-solutions",
    title: "Enterprise Solutions",
    tagline: "ERP Implementation, Systems Integration & Business Architecture",
    description:
      "End-to-end modernization of the enterprise technology stack. We implement, configure, and extend enterprise resource planning, CRM, supply-chain execution, and financial clearing infrastructure that harmonizes cross-departmental operations.",
    iconName: "Layers",
    deliverables: [
      "Zakeem Realty ERP Custom Deployments & Integration",
      "Multi-Entity Financial Consolidation & General Ledger Engines",
      "Human Capital Management (HCM) & Payroll Automation",
      "Enterprise Service Bus & Cross-System Data Synchronization",
      "Comprehensive Change Management & Training Programs"
    ],
    technologies: ["Zakeem Realty ERP", "PostgreSQL", "Temporal.io", "GraphQL", "Redis", "Supabase"],
    engagementModel: "Phased Enterprise Rollout with Guaranteed Uptime SLA"
  },
  {
    id: "consulting",
    slug: "consulting",
    title: "Technology Consulting",
    tagline: "Strategic Architecture, Due Diligence & Digital Transformation",
    description:
      "Executive advisory and technical architecture consulting for boards, CTOs, and government leaders. We provide unbiased technological roadmaps, vendor audits, code quality audits, and digital transformation blueprints that maximize ROI on capital investments.",
    iconName: "Compass",
    deliverables: [
      "Enterprise Digital Transformation Roadmaps",
      "System Architecture & Scalability Audits",
      "Mergers & Acquisitions Technical Due Diligence",
      "Vendor & Software Selection Advisory",
      "CTO-as-a-Service & Technical Advisory Governance"
    ],
    technologies: ["Enterprise Architecture Frameworks", "TOGAF", "Cloud Maturity Models", "Agile at Scale"],
    engagementModel: "Retained Advisory or Targeted Strategic Assessment"
  },
  {
    id: "cloud-infrastructure",
    slug: "cloud-infrastructure",
    title: "Cloud & Infrastructure",
    tagline: "Sovereign Cloud, Hybrid Kubernetes & DevOps Engineering",
    description:
      "Building resilient, self-healing cloud foundations. We architect immutable Infrastructure-as-Code (IaC), zero-trust network topologies, multi-region Kubernetes clusters, and automated CI/CD pipelines ensuring 99.99% operational continuity.",
    iconName: "Cloud",
    deliverables: [
      "Multi-Cloud & Hybrid Architecture (AWS, GCP, Azure, Local Data Centers)",
      "Automated Infrastructure as Code (Terraform / Pulumi)",
      "High-Availability Kubernetes Cluster Orchestration",
      "Zero-Downtime Automated CI/CD Release Pipelines",
      "Disaster Recovery & Multi-Region Failover Architecture"
    ],
    technologies: ["Terraform", "Kubernetes", "Docker", "AWS", "Google Cloud", "GitHub Actions", "Prometheus"],
    engagementModel: "Infrastructure Buildout & 24/7 Site Reliability Management"
  },
  {
    id: "cybersecurity",
    slug: "cybersecurity",
    title: "Cybersecurity & Governance",
    tagline: "Zero-Trust Architecture, Threat Modeling & Compliance Readiness",
    description:
      "Defend institutional assets against sophisticated adversaries. Our cybersecurity practice conducts red-team penetration testing, cryptographic data-at-rest audits, ISO 27001/NDPR/GDPR compliance hardening, and 24/7 threat detection integration.",
    iconName: "Shield",
    deliverables: [
      "Comprehensive Penetration Testing & Vulnerability Assessment",
      "Zero-Trust Architecture & Micro-Segmentation",
      "Identity & Access Management (IAM) Privilege Audits",
      "Regulatory Compliance Audits (NDPR, GDPR, ISO 27001, PCI-DSS)",
      "Incident Response Playbooks & Threat Intelligence"
    ],
    technologies: ["Vault", "SonarQube", "Wazuh", "Crowdstrike", "OpenVAS", "OWASP ASVS"],
    engagementModel: "Security Audit, Hardening & Ongoing Managed SOC"
  },
  {
    id: "ui-ux",
    slug: "ui-ux",
    title: "UI/UX & Product Design",
    tagline: "High-Fidelity Enterprise Design Systems & Intuitive Workflows",
    description:
      "We replace clumsy enterprise software with razor-sharp, accessible interfaces that professionals love using. From complex multi-parameter dashboards to frictionless mobile onboarding, we elevate user engagement through systematic design thinking.",
    iconName: "Palette",
    deliverables: [
      "Scalable Enterprise Design Systems & Component Libraries",
      "Complex Workflow & Information Architecture Simplification",
      "Interactive High-Fidelity Prototypes & Usability Testing",
      "Accessible (WCAG 2.1 AAA) Responsive Interfaces",
      "Product Metrics & Funnel Conversion Optimization"
    ],
    technologies: ["Figma", "Design Tokens", "Tailwind CSS", "Radix UI", "Accessibility (a11y)"],
    engagementModel: "Design Sprint → Component System → Product Iteration"
  },
  {
    id: "training",
    slug: "training",
    title: "Training & Enablement",
    tagline: "Workforce Upskilling, Executive AI Literacy & Talent Engineering",
    description:
      "Technology fails without human adoption. We provide immersive, hands-on training academies for engineering teams, enterprise leadership, and operational staff, ensuring seamless adoption of AI tools, modern DevOps, and new enterprise platforms.",
    iconName: "GraduationCap",
    deliverables: [
      "Executive AI & Digital Leadership Masterclasses",
      "Advanced Engineering Upskilling (Cloud, Microservices, Security)",
      "End-User Enterprise System Onboarding & Certification",
      "Internal Center of Excellence (CoE) Setup",
      "Custom Interactive Learning Portals & Knowledge Bases"
    ],
    technologies: ["Interactive LMS", "Hands-on Sandboxes", "Certification Frameworks"],
    engagementModel: "Corporate Cohorts & Tailored Enterprise Bootcamps"
  }
];
