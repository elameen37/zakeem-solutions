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
      data-surface="dark"
      className={cn(
        "p-4 sm:p-6 rounded-2xl bg-[#081c38]/90 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:border-[#e57804]/40 transition-all flex flex-row items-center sm:block gap-3.5 sm:gap-0",
        className
      )}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#e57804]/10 rounded-full blur-2xl group-hover:bg-[#e57804]/20 transition-all pointer-events-none" />

      {/* Metric value and badge */}
      <div className="shrink-0 w-[105px] sm:w-auto flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 sm:mb-1 border-r border-white/10 sm:border-r-0 pr-3 sm:pr-0">
        <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold font-mono tracking-tight text-white leading-none sm:leading-normal">
          <AnimatedNumber value={value} />
        </span>
        {trend && (
          <span className="text-[10px] sm:text-xs font-mono font-semibold text-[#e57804] bg-[#e57804]/15 border border-[#e57804]/30 px-1.5 sm:px-2 py-0.5 rounded w-fit inline-block">
            {trend}
          </span>
        )}
      </div>

      {/* Label and subtext */}
      <div className="min-w-0 flex-1">
        <h4 className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider font-mono">
          {label}
        </h4>
        {subtext && (
          <p className="text-[11px] sm:text-xs text-slate-300 mt-1 sm:mt-2 leading-snug sm:leading-normal">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};