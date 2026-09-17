import React, { useEffect } from "react";
import {
  BRAND_NAME,
  CANONICAL_ORIGIN,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_TITLE,
  GEO_PLACENAME,
  GEO_REGION,
  formatCanonicalUrl,
  formatPageTitle,
  getBreadcrumbSchema,
  getOrganizationSchema,
  getWebSiteSchema
} from "@/config/seo";

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageType?: string;
  noindex?: boolean;
  breadcrumbs?: { name: string; path: string }[];
  schema?: Record<string, unknown> | Record<string, unknown>[];
}

export const SEO: React.FC<SEOProps> = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonical,
  type = "website",
  image = DEFAULT_OG_IMAGE,
  imageAlt = DEFAULT_OG_IMAGE_ALT,
  imageWidth = 1200,
  imageHeight = 630,
  imageType = "image/png",
  noindex = false,
  breadcrumbs,
  schema
}) => {
  useEffect(() => {
    // 1. Resolve formatted title and canonical URL
    const formattedTitle = formatPageTitle(title);
    document.title = formattedTitle;

    const resolvedCanonical = formatCanonicalUrl(
      canonical || (typeof window !== "undefined" ? window.location.pathname : CANONICAL_ORIGIN)
    );

    // 2. Helper to set or create meta tags
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

    // 3. Primary Meta Tags
    setMeta("description", description);
    if (noindex) {
      setMeta("robots", "noindex, nofollow");
    } else {
      setMeta("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    }

    // 4. Open Graph Tags (WhatsApp, Facebook, LinkedIn, Slack, Telegram, etc.)
    setMeta("og:site_name", BRAND_NAME, true);
    setMeta("og:type", type, true);
    setMeta("og:title", formattedTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:url", resolvedCanonical, true);
    setMeta("og:image", image, true);
    setMeta("og:image:secure_url", image, true);
    setMeta("og:image:alt", imageAlt, true);
    setMeta("og:image:width", String(imageWidth), true);
    setMeta("og:image:height", String(imageHeight), true);
    setMeta("og:image:type", imageType, true);

    // 5. Twitter / X Card Tags
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:site", "@zakeemsolutions");
    setMeta("twitter:title", formattedTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);
    setMeta("twitter:image:alt", imageAlt);

    // 6. Geographic & Regional Entity Signals
    setMeta("geo.region", GEO_REGION);
    setMeta("geo.placename", GEO_PLACENAME);

    // 7. Canonical Link Tag
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute("href", resolvedCanonical);

    // 8. Schema.org Structured Data Injection
    if (!noindex) {
      const graphList: Record<string, unknown>[] = [
        getOrganizationSchema(),
        getWebSiteSchema()
      ];

      if (breadcrumbs && breadcrumbs.length > 0) {
        graphList.push(getBreadcrumbSchema(breadcrumbs));
      }

      if (schema) {
        if (Array.isArray(schema)) {
          graphList.push(...schema);
        } else {
          graphList.push(schema);
        }
      }

      const structuredData = {
        "@context": "https://schema.org",
        "@graph": graphList
      };

      let script = document.getElementById("zakeem-schema-jsonld") as HTMLScriptElement;
      if (!script) {
        script = document.createElement("script");
        script.id = "zakeem-schema-jsonld";
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    } else {
      // Remove or neutralize schema for private/unindexed routes
      const script = document.getElementById("zakeem-schema-jsonld");
      if (script) {
        script.textContent = "";
      }
    }
  }, [
    title,
    description,
    canonical,
    type,
    image,
    imageAlt,
    imageWidth,
    imageHeight,
    imageType,
    noindex,
    breadcrumbs,
    schema
  ]);

  return null;
};

export default SEO;
