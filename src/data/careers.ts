export interface JobPosting {
  id: string;
  slug: string;
  title: string;
  departmentId: string;
  departmentName: string;
  location: string;
  locationType: "Remote" | "Hybrid" | "On-site";
  employmentType: "Full-time" | "Contract" | "Fellowship";
  experienceLevel: "Senior" | "Lead" | "Staff / Principal" | "Mid-Senior";
  salaryRange?: string;
  postedDate: string;
  isHot?: boolean;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  preferredSkills: string[];
  techStack: string[];
  benefits: string[];
}

export interface JobDepartment {
  id: string;
  name: string;
  description: string;
  openRolesCount?: number;
}

export interface CulturePillar {
  id: string;
  number: string;
  title: string;
  description: string;
  metric?: string;
}

export interface CompanyBenefit {
  id: string;
  category: "Compensation & Wealth" | "Health & Wellbeing" | "Growth & Mastery" | "Flexibility & Equipment";
  title: string;
  description: string;
  iconName: string;
}

export const CAREER_DEPARTMENTS: JobDepartment[] = [
  {
    id: "all",
    name: "All Departments",
    description: "Explore all open engineering, AI, product, and enterprise advisory roles."
  },
  {
    id: "engineering",
    name: "Systems & Cloud Engineering",
    description: "Distributed backends, high-throughput financial rails, and Kubernetes infrastructure."
  },
  {
    id: "ai-cognition",
    name: "AI & Machine Cognition",
    description: "Fine-tuned enterprise LLMs, document extraction pipelines, and autonomous agent systems."
  },
  {
    id: "product-design",
    name: "Product & Architecture",
    description: "Enterprise UX systems, complex ERP interaction models, and technical product management."
  },
  {
    id: "enterprise-solutions",
    name: "Enterprise Solutions & Advisory",
    description: "Client solution architecture, boardroom advisory, and implementation leadership."
  }
];

export const CULTURE_PILLARS: CulturePillar[] = [
  {
    id: "mathematical-rigor",
    number: "01",
    title: "Mathematical Rigor & Proofs",
    description: "We do not guess in production. Every architecture, distributed transaction, and concurrency boundary is formally reasoned, benchmarked, and load-tested.",
    metric: "99.99% Uptime SLA"
  },
  {
    id: "high-agency",
    number: "02",
    title: "High Agency & Autonomy",
    description: "Engineers at Zakeem are given full ownership of mission-critical subsystems. We hire domain leaders who operate with radical accountability and minimal bureaucracy.",
    metric: "Direct Production Ownership"
  },
  {
    id: "sovereign-impact",
    number: "03",
    title: "Sovereign African & Global Impact",
    description: "We are building foundational software infrastructure that powers African governments, multi-billion-dollar real estate developers, and institutional financial switches.",
    metric: "Millions Impacted Daily"
  },
  {
    id: "craftsmanship",
    number: "04",
    title: "Obsessive Craftsmanship",
    description: "From 60fps micro-interactions in our web interfaces to microsecond latency in distributed settlement engines, quality is non-negotiable.",
    metric: "< 250ms Target Latency"
  }
];

export const COMPANY_BENEFITS: CompanyBenefit[] = [
  {
    id: "comp-1",
    category: "Compensation & Wealth",
    title: "Top-Tier Competitive Remuneration",
    description: "Benchmarked against top global and continental technology leaders, with quarterly performance bonuses.",
    iconName: "TrendingUp"
  },
  {
    id: "comp-2",
    category: "Compensation & Wealth",
    title: "Equity & Partnership Incentives",
    description: "Meaningful equity ownership opportunities for senior contributors and long-term technical leaders.",
    iconName: "Coins"
  },
  {
    id: "growth-1",
    category: "Growth & Mastery",
    title: "₦3,500,000 Annual Learning Stipend",
    description: "Uncapped access to international tech conferences, specialized certifications, and deep research literature.",
    iconName: "GraduationCap"
  },
  {
    id: "growth-2",
    category: "Growth & Mastery",
    title: "Engineering Fellowship & Publishing",
    description: "Dedicated 20% research time to write whitepapers, contribute to open source, and present at global symposiums.",
    iconName: "BookOpen"
  },
  {
    id: "flex-1",
    category: "Flexibility & Equipment",
    title: "Modern Engineering Workstation Setup",
    description: "Latest Apple MacBook Pro M-series or custom high-spec Linux workstation plus multi-monitor home setup budget.",
    iconName: "Laptop"
  },
  {
    id: "flex-2",
    category: "Flexibility & Equipment",
    title: "Remote-First with Executive Hubs",
    description: "Work autonomously from anywhere, with full access to our physical executive innovation lounges in Abuja and Lagos.",
    iconName: "Globe"
  },
  {
    id: "health-1",
    category: "Health & Wellbeing",
    title: "Comprehensive Comprehensive Health Coverage",
    description: "Premium private health, dental, and optical insurance covering you and your immediate dependents.",
    iconName: "HeartPulse"
  },
  {
    id: "health-2",
    category: "Health & Wellbeing",
    title: "Annual Wellness & Sabbatical Leave",
    description: "25 days paid annual leave plus mandatory mental restoration days and sponsored wellness programs.",
    iconName: "ShieldCheck"
  }
];

export const JOB_POSTINGS: JobPosting[] = [
  {
    id: "eng-dist-01",
    slug: "senior-distributed-systems-engineer",
    title: "Senior Distributed Systems Engineer (Go / Rust)",
    departmentId: "engineering",
    departmentName: "Systems & Cloud Engineering",
    location: "Remote (Global) / Abuja Hub",
    locationType: "Remote",
    employmentType: "Full-time",
    experienceLevel: "Senior",
    salaryRange: "Highly Competitive Enterprise Package",
    postedDate: "2026-03-01",
    isHot: true,
    summary: "Lead the core architecture of Zakeem's high-throughput transaction engines, multi-tenant state replication, and distributed consensus services underpinning our fintech and ERP platforms.",
    responsibilities: [
      "Design, implement, and maintain distributed backend services written in Go and Rust with microsecond SLAs.",
      "Architect multi-region active-active database clustering, partitioned event sourcing, and WAL stream processors.",
      "Enforce rigorous zero-trust mutual TLS, secret rotation, and hardware security module (HSM) integrations.",
      "Conduct chaos engineering, distributed load simulations, and network partition resilience audits.",
      "Mentor mid-level engineers and drive RFC-based architectural decision processes across the company."
    ],
    requirements: [
      "5+ years of experience designing and operating distributed systems in production environments.",
      "Deep proficiency with Go, Rust, or modern low-latency systems programming.",
      "Proven expertise in distributed consensus protocols (Raft, Paxos), Kafka / Redpanda event streams, and PostgreSQL internals.",
      "Hands-on experience with Kubernetes orchestration, eBPF telemetry, and multi-tenant isolation.",
      "B.Sc. or equivalent practical mastery in Computer Science, Distributed Systems, or related engineering disciplines."
    ],
    preferredSkills: [
      "Experience with financial settlement rails (ISO 20022, ACH, NIP).",
      "Familiarity with WebAssembly runtime sandboxing."
    ],
    techStack: ["Go", "Rust", "PostgreSQL", "Kafka", "Redis", "Docker", "Kubernetes", "gRPC", "Prometheus"],
    benefits: [
      "Executive remuneration with performance upside",
      "M-series MacBook Pro + ₦2,500,000 home workstation allocation",
      "Full family health & dental cover",
      "Annual international tech conference budget"
    ]
  },
  {
    id: "ai-staff-01",
    slug: "staff-ai-ml-engineer",
    title: "Staff AI/ML Engineer (LLMs, vLLM & Agent Systems)",
    departmentId: "ai-cognition",
    departmentName: "AI & Machine Cognition",
    location: "Remote / Lagos Innovation Hub",
    locationType: "Hybrid",
    employmentType: "Full-time",
    experienceLevel: "Staff / Principal",
    salaryRange: "Executive Tier (Equity + Performance Bonus)",
    postedDate: "2026-03-03",
    isHot: true,
    summary: "Architect the proprietary cognition layer powering Zakeem Cortex AI and Zakky AI (Realty ERP valuation engine), specializing in fine-tuning open-weights models and high-consequence agent workflows.",
    responsibilities: [
      "Train, fine-tune, and quantize open-source enterprise foundation models (Llama, Mistral, Qwen) for legal, land, and financial domains.",
      "Build sub-200ms RAG pipelines with hybrid sparse/dense vector search and graph-augmented context retrieval.",
      "Deploy self-hosted GPU inference clusters using vLLM, TensorRT-LLM, and Triton Inference Server on sovereign private cloud.",
      "Develop deterministic guardrails, structured JSON output validation, and automated hallucination evaluation benchmarks.",
      "Collaborate directly with the CTO and enterprise clients to define agentic automation blueprints."
    ],
    requirements: [
      "6+ years in software engineering with 3+ years dedicated to deep learning, NLP, and enterprise LLM production deployments.",
      "High proficiency in Python, PyTorch, Hugging Face ecosystem, vLLM, and LangChain/LangGraph or custom agent orchestrators.",
      "Deep understanding of attention mechanisms, LoRA/QLoRA fine-tuning, flash-attention, and speculative decoding.",
      "Experience deploying models on Kubernetes with NVIDIA GPU operator and custom Triton engines.",
      "Strong publication or production track record in applied AI systems."
    ],
    preferredSkills: [
      "Experience with multimodal OCR pipelines for unstructured deed and survey documents.",
      "Background in financial time-series forecasting."
    ],
    techStack: ["Python", "PyTorch", "vLLM", "Triton", "Qdrant", "PostgreSQL (pgvector)", "Kubernetes", "NVIDIA CUDA"],
    benefits: [
      "Dedicated GPU research compute budget (H100/A100 instances)",
      "Top-tier compensation with generous equity",
      "Annual research sabbatical and paper publishing support",
      "Comprehensive executive healthcare"
    ]
  },
  {
    id: "sol-arch-01",
    slug: "lead-enterprise-solutions-architect",
    title: "Lead Enterprise Solutions Architect (GovTech & Real Estate)",
    departmentId: "enterprise-solutions",
    departmentName: "Enterprise Solutions & Advisory",
    location: "Abuja Executive Office (Hybrid)",
    locationType: "Hybrid",
    employmentType: "Full-time",
    experienceLevel: "Lead",
    salaryRange: "Executive Base + Client Success Bonus",
    postedDate: "2026-02-28",
    isHot: false,
    summary: "Bridge executive boardroom strategy and technical implementation by leading the architectural delivery of Zakeem Realty ERP and public sector digital transformation programs.",
    responsibilities: [
      "Lead architectural discovery workshops with C-suite stakeholders, state commissioners, and enterprise executives.",
      "Author end-to-end Enterprise Solution Blueprints including migration roadmaps, security compliance, and integration specs.",
      "Direct technical delivery pods during complex enterprise ERP cutovers and data migrations.",
      "Serve as the trusted technical advisor for multimillion-dollar real estate developers and government agencies.",
      "Establish enterprise deployment governance and quality assurance standards across customer engagements."
    ],
    requirements: [
      "7+ years in enterprise software architecture, technical consulting, or systems engineering.",
      "Demonstrated track record delivering large-scale ERP, GovTech, or institutional banking implementations.",
      "Comprehensive knowledge of TOGAF / DDD architecture frameworks, cloud migration patterns, and relational database modeling.",
      "Exceptional verbal and written communication skills with executive presence.",
      "Proven ability to translate complex business workflows into scalable microservices and typed data structures."
    ],
    preferredSkills: [
      "Prior experience implementing SAP, Oracle, or large custom ERP systems.",
      "Deep understanding of Nigerian and West African regulatory, land registry, and tax compliance frameworks."
    ],
    techStack: ["Enterprise ERP Architecture", "PostgreSQL", "UML/C4 Modeling", "Kubernetes", "OAuth2/OIDC", "REST/gRPC"],
    benefits: [
      "Executive compensation package with performance-based bonuses",
      "Official vehicle / executive mobility allowance",
      "Access to private boardroom lounges and corporate clubs",
      "Full family private medical coverage"
    ]
  },
  {
    id: "prod-des-01",
    slug: "lead-enterprise-product-designer",
    title: "Lead Enterprise Product Designer (Design Systems & B2B)",
    departmentId: "product-design",
    departmentName: "Product & Architecture",
    location: "Remote / Lagos Hub",
    locationType: "Remote",
    employmentType: "Full-time",
    experienceLevel: "Lead",
    salaryRange: "Competitive Senior Tech Package",
    postedDate: "2026-03-05",
    isHot: false,
    summary: "Lead the visual language, design system, and multi-tenant UX architecture across Zakeem's enterprise suites, transforming complex workflows into intuitive, high-density interfaces.",
    responsibilities: [
      "Evolve the unified Zakeem Design System across web, desktop, and mobile platforms.",
      "Design complex data-dense tables, real-time telemetry dashboards, and interactive GIS land allocation interfaces.",
      "Conduct deep qualitative and quantitative user research with enterprise operators, CFOs, and site supervisors.",
      "Partner closely with frontend engineers to ensure pixel-perfect CSS execution, micro-interactions, and a11y compliance.",
      "Maintain a world-class standard of typographical hierarchy, contrast, and dark-mode aesthetics."
    ],
    requirements: [
      "5+ years of experience designing complex B2B SaaS, developer tools, or enterprise financial platforms.",
      "World-class portfolio demonstrating mastery of typographic hierarchy, information density, and interactive prototypes.",
      "Deep expertise in Figma, design token pipelines, and headless UI architectures.",
      "Firm grasp of HTML5, CSS/Tailwind capabilities, and web accessibility standards (WCAG 2.1 AA).",
      "Strong understanding of user mental models in data-intensive enterprise domains."
    ],
    preferredSkills: [
      "Experience designing GIS or CAD-style spatial interfaces.",
      "Ability to write clean React/Tailwind code for rapid prototyping."
    ],
    techStack: ["Figma", "Design Tokens", "Tailwind CSS", "React", "Radix UI", "Motion", "Storybook"],
    benefits: [
      "Comprehensive international health cover",
      "High-spec Apple Studio Display and MacBook Pro workstation",
      "Annual design conference pass (Config, Framer Loupe, etc.)",
      "Flexible, outcome-driven working environment"
    ]
  }
];
