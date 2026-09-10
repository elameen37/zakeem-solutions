import React from "react";
import { Link } from "react-router-dom";
import { 
  Building, Landmark, Home, Coins, Activity, GraduationCap, Zap, Sprout, Factory, Truck, 
  ArrowRight 
} from "lucide-react";
import { SolutionItem } from "@/data/solutions";

interface SolutionCardProps {
  solution: SolutionItem;
}

export const SolutionCard: React.FC<SolutionCardProps> = ({ solution }) => {
  const getIcon = (iconName: string) => {
    const props = { className: "w-6 h-6 text-[#e57804] group-hover:text-white transition-colors" };
    switch (iconName) {
      case "Building": return <Building {...props} />;
      case "Landmark": return <Landmark {...props} />;
      case "Home": return <Home {...props} />;
      case "Coins": return <Coins {...props} />;
      case "Activity": return <Activity {...props} />;
      case "GraduationCap": return <GraduationCap {...props} />;
      case "Zap": return <Zap {...props} />;
      case "Sprout": return <Sprout {...props} />;
      case "Factory": return <Factory {...props} />;
      case "Truck": return <Truck {...props} />;
      default: return <Building {...props} />;
    }
  };

  return (
    <Link
      to={`/solutions/${solution.slug}`}
      data-surface="dark"
      className="group relative flex flex-col justify-between p-6 md:p-8 rounded-2xl bg-[#081c38] border border-white/10 hover:border-[#e57804]/60 hover:bg-[#0c254c] transition-all duration-300"
    >
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 group-hover:bg-[#e57804]/15 group-hover:border-[#e57804]/30 transition-all">
            {getIcon(solution.iconName)}
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-white/5 text-slate-300 border border-white/10">
            {solution.stats.value}
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#e57804] transition-colors">
          {solution.title}
        </h3>
        <p className="text-xs font-mono text-[#e57804] mb-4">
          {solution.tagline}
        </p>
        <p className="text-sm text-slate-300 leading-relaxed mb-6 line-clamp-3">
          {solution.description}
        </p>
      </div>

      <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
        <span>Explore Architecture</span>
        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-[#e57804] group-hover:text-white" />
      </div>
    </Link>
  );
};