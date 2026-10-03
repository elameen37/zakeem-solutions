import React from "react";
import { Link } from "react-router-dom";
import { 
  Code2, Bot, Layers, Compass, Cloud, Shield, Palette, GraduationCap, ArrowRight, Check 
} from "lucide-react";
import { ServiceItem } from "@/data/services";

interface ServiceCardProps {
  service: ServiceItem;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const getIcon = (name: string) => {
    const props = { className: "w-6 h-6 text-[#e57804] group-hover:text-white transition-colors" };
    switch (name) {
      case "Code2": return <Code2 {...props} />;
      case "Bot": return <Bot {...props} />;
      case "Layers": return <Layers {...props} />;
      case "Compass": return <Compass {...props} />;
      case "Cloud": return <Cloud {...props} />;
      case "Shield": return <Shield {...props} />;
      case "Palette": return <Palette {...props} />;
      case "GraduationCap": return <GraduationCap {...props} />;
      default: return <Code2 {...props} />;
    }
  };

  return (
    <div
      data-surface="dark"
      className="group relative flex flex-col justify-between p-5 sm:p-6 md:p-8 rounded-2xl bg-[#081c38] border border-white/10 hover:border-[#e57804]/60 hover:bg-[#0c254c] active:scale-[0.99] transition-all duration-300"
    >
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 group-hover:bg-[#e57804]/15 group-hover:border-[#e57804]/30 transition-all">
            {getIcon(service.iconName)}
          </div>
          <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-white/5 border border-white/5">
            {service.engagementModel.split(" ")[0]}
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 group-hover:text-[#e57804] transition-colors">
          {service.title}
        </h3>
        <p className="text-xs font-mono text-[#e57804] mb-3">
          {service.tagline}
        </p>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
          {service.description}
        </p>

        <div className="space-y-2 mb-6">
          {service.deliverables.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
              <Check className="w-3.5 h-3.5 text-[#e57804] shrink-0" />
              <span className="truncate">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
        <Link
          to={`/services/${service.slug}`}
          className="text-xs font-semibold text-slate-200 group-hover:text-white flex items-center gap-2 transition-colors py-1.5 min-h-[44px]"
        >
          <span>Service Details</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#e57804] group-hover:translate-x-1 transition-transform" />
        </Link>
        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline-block">
          {service.engagementModel}
        </span>
      </div>
    </div>
  );
};