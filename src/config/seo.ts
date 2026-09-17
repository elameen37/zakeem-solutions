import { COMPANY_CONTACT, SOCIAL_LINKS } from "@/data/social";
import type { ServiceItem } from "@/data/services";
import type { ZakeemApplication } from "@/data/ecosystem";
import type { PricingFAQ } from "@/data/pricing";

export const CANONICAL_ORIGIN = "https://www.zakeemsolutions.com";
export const BRAND_NAME = "Zakeem Solutions";
export const DEFAULT_TITLE = "Zakeem Solutions — Technology • Intelligence • Delivery";
export const DEFAULT_DESCRIPTION =
  "Zakeem Solutions is an enterprise technology and digital transformation company delivering mission-critical software engineering, AI-powered systems, ERP solutions, and digital infrastructure across Nigeria and globally.";
export const DEFAULT_OG_IMAGE = `${CANONICAL_ORIGIN}/og-zakeem-solutions.png`;
export const DEFAULT_OG_IMAGE_ALT = "Zakeem Solutions — Technology • Innovation • Digital Transformation";
export const DEFAULT_LOCALE = "en_US";
export const DEFAULT_LANGUAGE = "en";

export const GEO_REGION = "NG";
export const GEO_PLACENAME = "Abuja / Lagos, Nigeria";

/**
 * Normalizes title to format: Page Title | Zakeem Solutions
 */
export function formatPageTitle(title?: string): string {
  if (!title) return DEFAULT_TITLE;
  if (title === DEFAULT_TITLE) return DEFAULT_TITLE;
  if (title.endsWith(`| ${BRAND_NAME}`)) return title;
  if (title.endsWith(`— ${BRAND_NAME}`)) {
    return title.replace(`— ${BRAND_NAME}`, `| ${BRAND_NAME}`);
  }
  if (title.includes(BRAND_NAME)) return title;
  return `${title} | ${BRAND_NAME}`;
}

/**
 * Normalizes canonical URL ensuring absolute canonical origin
 */
export function formatCanonicalUrl(urlOrPath?: string): string {
  if (!urlOrPath) return CANONICAL_ORIGIN;
  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
    return urlOrPath;
  }
  const cleanPath = urlOrPath.startsWith("/") ? urlOrPath : `/${urlOrPath}`;
  return `${CANONICAL_ORIGIN}${cleanPath === "/" ? "" : cleanPath}`;
}

/**
 * Centralized Schema.org Organization structured data
 */
export function getOrganizationSchema(): Record<string, unknown> {
  return {
    "@type": "Organization",
    "@id": `${CANONICAL_ORIGIN}/#organization`,
    name: BRAND_NAME,
    legalName: BRAND_NAME,
    url: CANONICAL_ORIGIN,
    logo: `${CANONICAL_ORIGIN}/assets/logos/brand-logo.png`,
    image: DEFAULT_OG_IMAGE,
    slogan: "Technology • Intelligence • Delivery",
    description: DEFAULT_DESCRIPTION,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Abuja / Lagos",
      addressCountry: "NG"
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: COMPANY_CONTACT.phone,
        contactType: "sales",
        email: COMPANY_CONTACT.salesEmail || COMPANY_CONTACT.email,
        areaServed: ["NG", "Global"],
        availableLanguage: ["English"]
      },
      {
        "@type": "ContactPoint",
        telephone: COMPANY_CONTACT.phone,
        contactType: "customer support",
        email: COMPANY_CONTACT.supportEmail,
        areaServed: ["NG", "Global"],
        availableLanguage: ["English"]
      }
    ],
    sameAs: SOCIAL_LINKS.map((item) => item.url)
  };
}

/**
 * Centralized Schema.org WebSite structured data
 */
export function getWebSiteSchema(): Record<string, unknown> {
  return {
    "@type": "WebSite",
    "@id": `${CANONICAL_ORIGIN}/#website`,
    url: CANONICAL_ORIGIN,
    name: BRAND_NAME,
    description: DEFAULT_DESCRIPTION,
    publisher: {
      "@id": `${CANONICAL_ORIGIN}/#organization`
    },
    inLanguage: "en-US"
  };
}

/**
 * Schema.org Service structured data for genuine engineering services
 */
export function getServiceSchema(service: ServiceItem): Record<string, unknown> {
  return {
    "@type": "Service",
    "@id": `${CANONICAL_ORIGIN}/services/${service.slug}#service`,
    name: service.title,
    serviceType: service.tagline,
    description: service.description,
    provider: {
      "@id": `${CANONICAL_ORIGIN}/#organization`
    },
    areaServed: {
      "@type": "Country",
      name: "Nigeria"
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${service.title} Deliverables`,
      itemListElement: service.deliverables.map((item, index) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: item
        },
        position: index + 1
      }))
    }
  };
}

/**
 * Schema.org SoftwareApplication / Product structured data
 */
export function getSoftwareApplicationSchema(product: ZakeemApplication): Record<string, unknown> {
  return {
    "@type": "SoftwareApplication",
    "@id": `${CANONICAL_ORIGIN}${product.route}#software`,
    name: product.name,
    operatingSystem: "Cloud / Web / Sovereign Enterprise Infrastructure",
    applicationCategory: product.category,
    softwareVersion: product.version,
    description: product.description,
    provider: {
      "@id": `${CANONICAL_ORIGIN}/#organization`
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "NGN",
      availability: "https://schema.org/InStock",
      price: "Contact for Enterprise Licensing"
    }
  };
}

/**
 * Schema.org FAQPage structured data for genuine visible FAQs
 */
export function getFAQPageSchema(faqs: PricingFAQ[]): Record<string, unknown> {
  return {
    "@type": "FAQPage",
    "@id": `${CANONICAL_ORIGIN}/pricing#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}

/**
 * Schema.org BreadcrumbList structured data
 */
export function getBreadcrumbSchema(items: { name: string; path: string }[]): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: formatCanonicalUrl(item.path)
    }))
  };
}

/**
 * Schema.org ContactPage structured data
 */
export function getContactPageSchema(): Record<string, unknown> {
  return {
    "@type": "ContactPage",
    "@id": `${CANONICAL_ORIGIN}/contact#contactpage`,
    name: `Contact Enterprise Sales & Leadership | ${BRAND_NAME}`,
    description: "Connect with Zakeem Solutions executive technology leaders, solutions architects, and commercial directors.",
    mainEntity: {
      "@id": `${CANONICAL_ORIGIN}/#organization`
    }
  };
}
