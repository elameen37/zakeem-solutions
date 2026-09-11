import React, { useEffect } from "react";
import { COMPANY_CONTACT } from "@/data/social";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: string;
  image?: string;
  schema?: Record<string, unknown>;
}

export const SEO: React.FC<SEOProps> = ({
  title = "Zakeem Solutions — Technology • Intelligence • Delivery",
  description = "Zakeem Solutions is an enterprise technology and digital transformation company delivering mission-critical software engineering, AI-powered systems, ERP solutions, and digital infrastructure across Africa and globally.",
  canonical = "https://www.zakeemsolutions.com",
  type = "website",
  image = "https://www.zakeemsolutions.com/assets/logos/brand-logo.png",
  schema
}) => {
  useEffect(() => {
    document.title = title.includes("Zakeem Solutions") ? title : `${title} | Zakeem Solutions`;

    const setMeta = (nameOrProperty: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${nameOrProperty}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, nameOrProperty);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", type, true);
    setMeta("og:url", canonical, true);
    setMeta("og:image", image, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);

    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute("href", canonical);

    // Schema.org structured data injection
    const defaultSchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://www.zakeemsolutions.com/#organization",
          name: "Zakeem Solutions",
          url: "https://www.zakeemsolutions.com",
          logo: "https://www.zakeemsolutions.com/assets/logos/brand-logo.png",
          slogan: "Technology • Intelligence • Delivery",
          description: "Enterprise technology, software engineering, AI, and digital transformation company.",
          contactPoint: {
            "@type": "ContactPoint",
            telephone: COMPANY_CONTACT.phone,
            contactType: "sales",
            availableLanguage: ["English"]
          }
        },
        {
          "@type": "WebSite",
          "@id": "https://www.zakeemsolutions.com/#website",
          url: "https://www.zakeemsolutions.com",
          name: "Zakeem Solutions",
          publisher: {
            "@id": "https://www.zakeemsolutions.com/#organization"
          }
        },
        schema || {
          "@type": "SoftwareApplication",
          name: "Zakeem Realty ERP",
          operatingSystem: "Cloud-based / Web",
          applicationCategory: "BusinessApplication",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "NGN"
          }
        }
      ]
    };

    let script = document.getElementById("zakeem-schema-jsonld") as HTMLScriptElement;
    if (!script) {
      script = document.createElement("script");
      script.id = "zakeem-schema-jsonld";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(defaultSchema);
  }, [title, description, canonical, type, image, schema]);

  return null;
};
