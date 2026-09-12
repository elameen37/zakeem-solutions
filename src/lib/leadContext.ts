/**
 * Zakeem Solutions — Commercial Parameter Normalization & Context Helper
 * Phase 15: Lead Capture, CRM Readiness & Conversion Infrastructure
 */

import { LeadAttribution } from "@/types/lead";

export interface NormalizedCommercialParams {
  product: string | null;
  tier: string | null;
  suite: string | null;
  billing: "monthly" | "annual" | null;
  deployment: "cloud" | "private-vpc" | "on-premise" | null;
  service: string | null;
  type: string | null;
  solution: string | null;
  modules: string[];
}

/**
 * Normalizes all supported incoming commercial query parameters across the website.
 * Prevents pages from independently implementing diverging parameter parsing logic.
 */
export function normalizeCommercialParams(searchParams: URLSearchParams): NormalizedCommercialParams {
  const rawProduct = searchParams.get("product") || searchParams.get("interest");
  const rawTier = searchParams.get("tier");
  const rawSuite = searchParams.get("suite");
  const rawBilling = searchParams.get("billing");
  const rawDeployment = searchParams.get("deployment");
  const rawService = searchParams.get("service");
  const rawType = searchParams.get("type");
  const rawSolution = searchParams.get("solution");
  const rawModules = searchParams.get("modules");

  // Normalize product slug
  let product: string | null = null;
  if (rawProduct) {
    const p = rawProduct.toLowerCase().trim();
    if (p.includes("cortex")) product = "cortex-ai";
    else if (p.includes("legal")) product = "e-legal";
    else if (p.includes("flow")) product = "flow-procure";
    else if (p.includes("vault")) product = "vault-pay";
    else if (p.includes("realty")) product = "zakeem-realty-erp";
    else product = p;
  }

  // Normalize tier
  let tier: string | null = null;
  if (rawTier) {
    const t = rawTier.toLowerCase().trim();
    if (t.includes("starter")) tier = "starter";
    else if (t.includes("business")) tier = "business";
    else if (t.includes("enterprise") || t.includes("sovereign")) tier = "enterprise";
    else tier = t;
  }

  // Normalize suite
  let suite: string | null = null;
  if (rawSuite) {
    const s = rawSuite.toLowerCase().trim();
    if (s.includes("growth")) suite = "growth";
    else if (s.includes("enterprise") || s.includes("scale")) suite = "enterprise";
    else if (s.includes("institutional") || s.includes("sovereign")) suite = "institutional";
    else suite = s;
  }

  // Normalize billing
  let billing: "monthly" | "annual" | null = null;
  if (rawBilling) {
    const b = rawBilling.toLowerCase().trim();
    if (b === "annual" || b === "yearly") billing = "annual";
    else if (b === "monthly") billing = "monthly";
  }

  // Normalize deployment
  let deployment: "cloud" | "private-vpc" | "on-premise" | null = null;
  if (rawDeployment) {
    const d = rawDeployment.toLowerCase().trim();
    if (d === "private-vpc" || d === "vpc") deployment = "private-vpc";
    else if (d === "on-premise" || d === "appliance") deployment = "on-premise";
    else if (d === "cloud") deployment = "cloud";
  }

  // Normalize service
  let service: string | null = null;
  if (rawService) {
    const s = rawService.toLowerCase().trim();
    if (s.includes("audit")) service = "architectural-audit";
    else if (s.includes("pod")) service = "dedicated-pod";
    else if (s.includes("modernization")) service = "enterprise-modernization";
    else service = s;
  }

  // Normalize modules
  const modules: string[] = rawModules
    ? rawModules
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean)
    : [];

  return {
    product,
    tier,
    suite,
    billing,
    deployment,
    service,
    type: rawType ? rawType.toLowerCase().trim() : null,
    solution: rawSolution ? rawSolution.toLowerCase().trim() : null,
    modules,
  };
}

/**
 * Produces a unified human-readable summary badge string for UI presentation.
 */
export function getCommercialContextSummary(params: NormalizedCommercialParams): string | null {
  const parts: string[] = [];

  // 1. Primary commercial structure
  if (params.type === "custom-stack") {
    const count = params.modules.length;
    parts.push(`Custom Stack Architecture (${count > 0 ? `${count} Modules Selected` : "Configured"})`);
  } else if (params.type === "zakeem-complete") {
    parts.push("Zakeem Complete — Unified Enterprise Operating Platform");
  } else if (params.type === "institutional-suite" || params.suite === "institutional") {
    parts.push("Institutional Sovereign Suite Consultation");
  } else if (params.type === "rfp-consultation") {
    parts.push("Custom RFP & Enterprise Architecture Assessment");
  } else if (params.service) {
    if (params.service === "architectural-audit") parts.push("Architectural Forensic Audit Engagement");
    else if (params.service === "dedicated-pod") parts.push("Dedicated Engineering Pod Retainer");
    else if (params.service === "enterprise-modernization") parts.push("Turnkey Enterprise Modernization");
    else parts.push(`Service: ${params.service}`);
  } else if (params.suite) {
    if (params.suite === "growth") parts.push("Growth Business Suite");
    else if (params.suite === "enterprise") parts.push("Enterprise Business Suite");
    else parts.push(`Suite: ${params.suite}`);
  } else if (params.tier) {
    if (params.tier === "starter") parts.push("Realty ERP Starter Tier");
    else if (params.tier === "business") parts.push("Realty ERP Business Tier");
    else if (params.tier === "enterprise") parts.push("Realty ERP Enterprise Tier");
    else parts.push(`Tier: ${params.tier}`);
  } else if (params.product) {
    if (params.product === "cortex-ai") parts.push("Zakeem Cortex AI Early Access");
    else if (params.product === "e-legal") parts.push("e-Legal & Justice Platform");
    else if (params.product === "flow-procure") parts.push("Zakeem Flow (Procurement Hub Briefing)");
    else if (params.product === "vault-pay") parts.push("Zakeem Vault (Settlement & Treasury Briefing)");
    else if (params.product === "zakeem-realty-erp") parts.push("Zakeem Realty ERP Flagship");
    else parts.push(`Product: ${params.product}`);
  } else if (params.solution) {
    if (params.solution.includes("legal")) parts.push("e-Legal & Justice Platform");
    else parts.push(`Solution: ${params.solution}`);
  } else if (params.type === "commercial-advisory") {
    parts.push("Strategic Commercial & Licensing Advisory");
  }

  // 2. Deployment commitment
  if (params.deployment) {
    if (params.deployment === "private-vpc") parts.push("Private VPC Deployment");
    else if (params.deployment === "on-premise") parts.push("On-Premise Appliance");
    else if (params.deployment === "cloud") parts.push("Managed Cloud");
  }

  // 3. Billing cadence
  if (params.billing) {
    parts.push(`${params.billing.charAt(0).toUpperCase() + params.billing.slice(1)} Commitment`);
  }

  return parts.length > 0 ? parts.join(" • ") : null;
}

/**
 * Safely captures marketing attribution (UTM parameters and referrer).
 */
export function getAttributionContext(searchParams: URLSearchParams): LeadAttribution {
  const utmSource = searchParams.get("utm_source") || undefined;
  const utmMedium = searchParams.get("utm_medium") || undefined;
  const utmCampaign = searchParams.get("utm_campaign") || undefined;
  const utmTerm = searchParams.get("utm_term") || undefined;
  const utmContent = searchParams.get("utm_content") || undefined;

  let landingPage: string | undefined;
  let referrer: string | undefined;

  if (typeof window !== "undefined") {
    landingPage = window.location.pathname + window.location.search;
    if (document.referrer && !document.referrer.includes(window.location.host)) {
      referrer = document.referrer;
    }
  }

  return {
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
    landingPage,
    referrer,
  };
}
