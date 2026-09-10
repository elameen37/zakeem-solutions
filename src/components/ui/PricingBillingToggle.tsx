import React from "react";
import { Calendar, Check } from "lucide-react";
import { BillingPeriod } from "@/data/pricing";
import { cn } from "@/lib/utils";

interface PricingBillingToggleProps {
  period: BillingPeriod;
  onChange: (period: BillingPeriod) => void;
  className?: string;
}

export const PricingBillingToggle: React.FC<PricingBillingToggleProps> = ({
  period,
  onChange,
  className
}) => {
  return (
    <div className={cn("inline-flex flex-col items-center gap-2", className)}>
      <div 
        role="radiogroup" 
        aria-label="Billing cycle frequency"
        className="relative inline-flex items-center p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300 dark:bg-[#081c38] dark:border-white/15 shadow-lg backdrop-blur-xl"
      >
        {/* Monthly Option */}
        <button
          type="button"
          role="radio"
          aria-checked={period === "monthly"}
          onClick={() => onChange("monthly")}
          className={cn(
            "relative z-10 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#e57804]",
            period === "monthly"
              ? "text-black font-bold"
              : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
          )}
        >
          <span>Monthly Billing</span>
        </button>

        {/* Annual Option */}
        <button
          type="button"
          role="radio"
          aria-checked={period === "annual"}
          onClick={() => onChange("annual")}
          className={cn(
            "relative z-10 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#e57804]",
            period === "annual"
              ? "text-black font-bold"
              : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
          )}
        >
          <span>Annual Billing</span>
          <span 
            className={cn(
              "text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider transition-colors",
              period === "annual" 
                ? "bg-black/20 text-black border border-black/20" 
                : "bg-[#e57804]/20 text-[#e57804] border border-[#e57804]/30"
            )}
          >
            Save 20%
          </span>
        </button>

        {/* Animated Active Pill Indicator */}
        <div
          className={cn(
            "absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-[#e57804] shadow-md shadow-[#e57804]/30 transition-all duration-300 ease-out z-0",
            period === "monthly"
              ? "left-1.5 w-[calc(50%-6px)]"
              : "left-[calc(50%+3px)] w-[calc(50%-6px)]"
          )}
        />
      </div>

      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
        <span>Annual commitments include 20% discount & priority provisioning</span>
      </div>
    </div>
  );
};
