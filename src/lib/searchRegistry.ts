import { ZAKEEM_APPLICATIONS } from "../data/ecosystem";
import { SOLUTIONS } from "../data/solutions";
import { SERVICES } from "../data/services";
import { JOB_POSTINGS } from "../data/careers";
import { PRODUCT_PRICING_TIERS, SUITE_TIERS } from "../data/pricing";

export type SearchCategory = "Product" | "Solution" | "Service" | "Career" | "Pricing" | "Page";

export interface SearchItem {
  id: string;
  title: string;
  category: SearchCategory;
  description: string;
  href: string;
  tags: string[];
  badge?: string;
}

export const STATIC_PAGES: SearchItem[] = [
  {
    id: "page-home",
    title: "Home",
    category: "Page",
    description: "Zakeem Solutions corporate portal, platforms, and technological leadership.",
    href: "/",
    tags: ["homepage", "overview", "enterprise", "zakeem"],
  },
  {
    id: "page-about",
    title: "About Zakeem Solutions",
    category: "Page",
    description: "Our corporate mission, engineering philosophy, pan-African reach, and leadership team.",
    href: "/about",
    tags: ["mission", "values", "executives", "leadership", "offices", "history"],
  },
  {
    id: "page-solutions",
    title: "Industry Solutions Overview",
    category: "Page",
    description: "Industry-tailored digital transformation for public and private enterprise sectors.",
    href: "/solutions",
    tags: ["industries", "government", "banking", "real estate", "healthcare", "energy"],
  },
  {
    id: "page-services",
    title: "Engineering Services & Retainers",
    category: "Page",
    description: "Mission-critical custom software engineering, cloud infrastructure, and 24/7 SRE.",
    href: "/services",
    tags: ["consulting", "engineering", "devops", "cloud", "architecture", "cybersecurity"],
  },
  {
    id: "page-pricing",
    title: "Pricing & Commercial Licensing",
    category: "Page",
    description: "Transparent platform subscription tiers in Nigerian Naira (NGN) and bespoke engineering models.",
    href: "/pricing",
    tags: ["cost", "license", "naira", "annual", "monthly", "plans", "starter", "business", "enterprise"],
  },
  {
    id: "page-careers",
    title: "Careers & Life at Zakeem",
    category: "Page",
    description: "Join our world-class engineering, product, and leadership teams across Lagos, Abuja, and Remote.",
    href: "/careers",
    tags: ["jobs", "openings", "culture", "hiring", "work", "engineering", "fellowship"],
  },
  {
    id: "page-contact",
    title: "Contact & RFP Inquiries",
    category: "Page",
    description: "Initiate commercial discussions, enterprise RFPs, and executive consultations.",
    href: "/contact",
    tags: ["rfp", "sales", "support", "inquiry", "procurement", "office", "email"],
  },
];

export function getAllSearchItems(): SearchItem[] {
  const items: SearchItem[] = [...STATIC_PAGES];

  // Products
  for (const app of ZAKEEM_APPLICATIONS) {
    items.push({
      id: `product-${app.id}`,
      title: app.name,
      category: "Product",
      description: app.tagline || app.description,
      href: app.route,
      tags: [app.category, app.version, app.status, ...(app.highlights || [])],
      badge: app.status === "Available" ? "Available" : "Preview",
    });
  }

  // Solutions
  for (const sol of SOLUTIONS) {
    items.push({
      id: `solution-${sol.id}`,
      title: sol.title,
      category: "Solution",
      description: sol.tagline,
      href: `/solutions/${sol.slug}`,
      tags: [sol.title, ...(sol.capabilities || [])],
    });
  }

  // Services
  for (const svc of SERVICES) {
    items.push({
      id: `service-${svc.id}`,
      title: svc.title,
      category: "Service",
      description: svc.tagline,
      href: `/services#${svc.slug}`,
      tags: [...svc.technologies, ...svc.deliverables],
    });
  }

  // Careers
  for (const job of JOB_POSTINGS) {
    items.push({
      id: `career-${job.id}`,
      title: job.title,
      category: "Career",
      description: `${job.departmentName} • ${job.location} (${job.locationType})`,
      href: `/careers/${job.slug}`,
      tags: [job.departmentName, job.experienceLevel, job.employmentType, ...job.techStack],
      badge: job.isHot ? "Hot Role" : job.locationType,
    });
  }

  // Pricing
  for (const tier of PRODUCT_PRICING_TIERS) {
    items.push({
      id: `pricing-${tier.id}`,
      title: `${tier.name} Subscription Tier`,
      category: "Pricing",
      description: `${tier.tagline} (${tier.tierCode} - ${tier.targetScale})`,
      href: `/pricing`,
      tags: [tier.tierCode, tier.targetScale, tier.priceModel, ...tier.deliverables],
      badge: tier.badge || undefined,
    });
  }

  // Business Suite Pricing
  for (const suite of SUITE_TIERS) {
    items.push({
      id: `pricing-${suite.id}`,
      title: `${suite.name} (Multi-Product Bundle)`,
      category: "Pricing",
      description: `${suite.tagline} (${suite.targetScale})`,
      href: `/pricing`,
      tags: ["suite", "bundle", "multi-product", suite.tierCode, suite.targetScale, ...suite.includedSolutions],
      badge: suite.badge || "Suite",
    });
  }

  return items;
}

export function searchItems(query: string, items: SearchItem[]): SearchItem[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  const tokens = clean.split(/\s+/).filter(Boolean);

  const scored = items.map((item) => {
    let score = 0;
    const titleLower = item.title.toLowerCase();
    const descLower = item.description.toLowerCase();
    const categoryLower = item.category.toLowerCase();
    const tagsCombined = item.tags.join(" ").toLowerCase();

    // Exact title match
    if (titleLower === clean) score += 100;
    else if (titleLower.startsWith(clean)) score += 60;
    else if (titleLower.includes(clean)) score += 40;

    // Tokens matching
    let allTokensMatch = true;
    for (const token of tokens) {
      let tokenMatched = false;
      if (titleLower.includes(token)) {
        score += 25;
        tokenMatched = true;
      }
      if (categoryLower.includes(token)) {
        score += 15;
        tokenMatched = true;
      }
      if (tagsCombined.includes(token)) {
        score += 10;
        tokenMatched = true;
      }
      if (descLower.includes(token)) {
        score += 5;
        tokenMatched = true;
      }

      if (!tokenMatched) {
        allTokensMatch = false;
      }
    }

    // Boost if all tokens match anywhere
    if (allTokensMatch) score += 30;

    return { item, score };
  });

  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);
}
