import React from "react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "./AnimatedNumber";

interface MetricCardProps {
  value: string;
  label: string;
  subtext?: string;
  trend?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  value,
  label,
  subtext,
  trend,
  className
}) => {
  return (
    <div
      className={cn(
        "p-6 rounded-2xl bg-[#081c38]/90 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:border-[#e57804]/40 transition-all",
        className
      )}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#e57804]/10 rounded-full blur-2xl group-hover:bg-[#e57804]/20 transition-all pointer-events-none" />
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-mono tracking-tight text-white">
          <AnimatedNumber value={value} />
        </span>
        {trend && (
          <span className="text-xs font-mono font-semibold text-[#e57804] bg-[#e57804]/15 border border-[#e57804]/30 px-2 py-0.5 rounded">
            {trend}
          </span>
        )}
      </div>
      <h4 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
        {label}
      </h4>
      {subtext && <p className="text-xs text-slate-300 mt-2">{subtext}</p>}
    </div>
  );
};