import React from "react";
import { ArrowUpRight, CheckCircle2, Building2, BrainCircuit, Workflow, ShieldCheck, Layers, ExternalLink } from "lucide-react";
import { ZakeemApplication } from "@/data/ecosystem";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { AnimatedNumber } from "./AnimatedNumber";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: ZakeemApplication;
  featured?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, featured = false }) => {
  const getIcon = (name: string) => {
    switch (name) {
      case "Building2":
        return <Building2 className="w-6 h-6 text-[#e57804]" />;
      case "BrainCircuit":
        return <BrainCircuit className="w-6 h-6 text-amber-300" />;
      case "Workflow":
        return <Workflow className="w-6 h-6 text-[#e57804]" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-6 h-6 text-amber-400" />;
      default:
        return <Layers className="w-6 h-6 text-[#e57804]" />;
    }
  };

  const getStatusBadge = (status: ZakeemApplication["status"]) => {
    switch (status) {
      case "Available":
        return <Badge variant="neon">Available</Badge>;
      case "Coming Soon":
        return <Badge variant="blue">Coming Soon</Badge>;
      case "In Development":
        return <Badge variant="neutral">In Development</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const targetPath = product.route || product.internalPath;

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border transition-all duration-300 p-6 md:p-8",
        featured
          ? "bg-gradient-to-b from-[#0a2347] to-[#06152b] border-[#e57804]/50 shadow-xl shadow-[#e57804]/10 hover:border-[#e57804]"
          : "bg-[#081c38] border-white/10 hover:border-white/20 hover:bg-[#0c254c]"
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              {getIcon(product.iconName)}
            </div>
            <div>
              <span className="text-xs font-mono text-slate-300 uppercase tracking-wider block">
                {product.category}
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                {product.name}
              </h3>
            </div>
          </div>
          <div>{getStatusBadge(product.status)}</div>
        </div>

        <p className="text-sm md:text-base text-slate-200 mb-4 line-clamp-3 leading-relaxed">
          {product.description}
        </p>

        {product.primaryValueProp && (
          <div className="mb-6 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-white font-semibold block mb-0.5">Value Proposition:</strong>
            {product.primaryValueProp}
          </div>
        )}

        {product.stats && product.stats.length > 0 && (
          <div className="grid grid-cols-3 gap-2 py-4 px-3 mb-6 rounded-xl bg-black/40 border border-white/5">
            {product.stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-base font-bold font-mono text-white">
                  <AnimatedNumber value={stat.value} />
                </div>
                <div className="text-[11px] text-slate-300 truncate">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2.5 mb-8">
          {product.highlights.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-[#e57804] shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-white/5">
        <Button
          variant={featured ? "primary" : "secondary"}
          size="md"
          href={targetPath}
          className="flex-1"
          rightIcon={<ArrowUpRight className="w-4 h-4" />}
        >
          {product.ctaText || (featured ? "Explore Flagship Platform" : "View Architecture")}
        </Button>
        {product.externalUrl && (
          <Button
            variant="outline"
            size="md"
            href={product.externalUrl}
            isExternal={true}
            rightIcon={<ExternalLink className="w-4 h-4" />}
            title="Launch live web application"
          >
            Launch App
          </Button>
        )}
      </div>
    </div>
  );
};