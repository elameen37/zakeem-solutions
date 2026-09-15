import React, { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { 
  ArrowLeft, CheckCircle2, ArrowRight, ShieldCheck, Layers, Building2, 
  ExternalLink, CalendarDays, Fuel, TrendingUp, UserCheck, Bot, 
  MessageSquare, Lock 
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CTASection } from "@/components/ui/CTASection";
import { ZAKEEM_APPLICATIONS, ZakeemApplication } from "@/data/ecosystem";

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Flagship Realty ERP has its own dedicated rich landing page
  if (slug === "zakeem-realty-erp") {
    return <Navigate to="/products/zakeem-realty-erp" replace />;
  }

  const product = ZAKEEM_APPLICATIONS.find((p) => p.slug === slug);

  useEffect(() => {
    if (typeof window !== "undefined" && product) {
      window.dispatchEvent(
        new CustomEvent("product-view", {
          bubbles: true,
          detail: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            category: product.category,
            status: product.status,
          },
        })
      );
    }
  }, [product]);

  if (!product) {
    return <Navigate to="/products" replace />;
  }

  const getProductIcon = (name: string) => {
    const iconClass = "w-8 h-8 text-[#e57804]";
    switch (name) {
      case "Building2":
        return <Building2 className={iconClass} />;
      case "CalendarDays":
        return <CalendarDays className={iconClass} />;
      case "Fuel":
        return <Fuel className="w-8 h-8 text-amber-400" />;
      case "TrendingUp":
        return <TrendingUp className="w-8 h-8 text-emerald-400" />;
      case "UserCheck":
        return <UserCheck className="w-8 h-8 text-sky-400" />;
      case "Bot":
        return <Bot className="w-8 h-8 text-purple-400" />;
      case "MessageSquare":
        return <MessageSquare className={iconClass} />;
      case "Lock":
        return <Lock className="w-8 h-8 text-emerald-400" />;
      default:
        return <Layers className={iconClass} />;
    }
  };

  const getStatusBadge = (status: ZakeemApplication["status"]) => {
    switch (status) {
      case "Available":
        return (
          <Badge variant="neon" className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Available</span>
          </Badge>
        );
      case "Pilot":
        return (
          <Badge variant="blue" className="inline-flex items-center gap-1.5 border-sky-500/30 text-sky-300 bg-sky-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>Pilot Phase</span>
          </Badge>
        );
      case "Early Access":
        return (
          <Badge variant="blue" className="inline-flex items-center gap-1.5 border-amber-500/30 text-amber-300 bg-amber-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Early Access</span>
          </Badge>
        );
      case "Active Solution":
        return (
          <Badge variant="blue" className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e57804]" />
            <span>Active Solution</span>
          </Badge>
        );
      case "Beta":
      case "Private Beta":
        return (
          <Badge variant="blue" className="inline-flex items-center gap-1.5 border-amber-500/30 text-amber-300 bg-amber-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>{status === "Beta" ? "Beta Phase" : "Private Beta"}</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" className="inline-flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>In Development</span>
          </Badge>
        );
    }
  };

  // Find 2 other related products from ecosystem
  const relatedProducts = ZAKEEM_APPLICATIONS.filter(
    (p) => p.slug !== product.slug && p.slug !== "zakeem-realty-erp"
  ).slice(0, 2);

  const targetCtaUrl = product.ctaDestination || product.route;

  return (
    <>
      <SEO
        title={product.seoTitle || `${product.name} — Zakeem Solutions`}
        description={product.seoDescription || product.description}
        canonical={`https://www.zakeemsolutions.com/products/${product.slug}`}
      />

      <section className="pt-12 pb-20 md:pt-16 md:pb-28 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          {/* Breadcrumb Navigation */}
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Product Ecosystem</span>
          </Link>

          {/* Identity Header */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              {getProductIcon(product.iconName)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="blue">{product.category}</Badge>
                {getStatusBadge(product.status)}
                <span className="text-xs font-mono text-slate-400">
                  {product.statusDetail || product.version}
                </span>
              </div>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight mb-4">
            {product.name}
          </h1>

          <p className="text-base sm:text-lg font-mono text-[#e57804] mb-6 leading-snug">
            {product.tagline}
          </p>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
            {product.longDescription || product.description}
          </p>

          {/* Value Proposition Box */}
          {product.primaryValueProp && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#e57804]/15 to-[#e57804]/5 border border-amber-500/20 dark:border-white/10 mb-10">
              <h2 className="text-xs font-mono uppercase tracking-wider text-[#e57804] font-semibold mb-2">
                Operational Value Proposition
              </h2>
              <p className="text-sm md:text-base text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                {product.primaryValueProp}
              </p>
            </div>
          )}

          {/* Target Institutional Audience */}
          {product.targetAudience && (
            <div data-surface="dark" className="p-6 rounded-2xl bg-[#06152b] border border-white/10 mb-10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#e57804] shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Target Institutional Audience
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {product.targetAudience}
                </p>
              </div>
            </div>
          )}

          {/* Stats Grid (if available) */}
          {product.stats && product.stats.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-10">
              {product.stats.map((stat, i) => (
                <div
                  key={i}
                  data-surface="dark"
                  className="p-5 rounded-2xl bg-[#081c38] border border-white/10 text-center"
                >
                  <div className="text-2xl font-bold font-mono text-[#e57804] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-300 font-mono uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Core Capabilities */}
          <div data-surface="dark" className="p-6 md:p-8 rounded-3xl bg-[#081c38] border border-white/15 mb-10">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#e57804]" />
              <span>Key Operational Capabilities:</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(product.capabilities || product.highlights).map((cap, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#e57804] shrink-0 mt-1" />
                  <span className="leading-relaxed">{cap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deployment & Trust Callout */}
          <div data-surface="dark" className="p-6 rounded-2xl bg-[#040e1d] border border-white/10 mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Enterprise Deployment Horizon
              </span>
              <div className="text-sm font-bold text-white">
                Sovereign Cloud VPC & On-Premises Isolation Options Available
              </div>
              <p className="text-xs text-slate-400 mt-1">
                All Zakeem software deployments adhere to sovereign tenant isolation, role-based encryption boundaries, and zero-trust policies.
              </p>
            </div>
            <Badge variant="neon" className="shrink-0 self-start sm:self-auto">
              Sovereign Stack
            </Badge>
          </div>

          {/* CTA Group */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              href={targetCtaUrl}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {product.ctaText || "Request Product Briefing"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              href={`/contact?product=${product.slug}`}
              className="text-slate-900 dark:text-white border-slate-300 dark:border-white/20 hover:border-[#e57804]"
            >
              Consult Solutions Lead
            </Button>
          </div>

          {/* Related Products Discovery */}
          {relatedProducts.length > 0 && (
            <div className="mt-16 pt-12 border-t border-white/10">
              <h3 className="text-base font-bold text-slate-950 dark:text-white mb-6 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#e57804]" />
                <span>Related Products in Ecosystem</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedProducts.map((rel) => (
                  <Link
                    key={rel.id}
                    to={rel.route}
                    className="p-5 rounded-2xl bg-[#06152b] border border-white/10 hover:border-[#e57804]/40 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">{rel.category}</span>
                        {getStatusBadge(rel.status)}
                      </div>
                      <div className="text-sm font-bold text-white group-hover:text-[#e57804] transition-colors">
                        {rel.name}
                      </div>
                      <p className="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                        {rel.description}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center text-xs text-[#e57804] font-medium gap-1">
                      <span>Explore Product</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <CTASection
        badge="Product Integration"
        title="Need a Custom Product Implementation?"
        description="Our engineering teams configure and deploy dedicated tenant clusters for your enterprise with custom business logic and integrations."
      />
    </>
  );
};
