import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "blue" | "neon" | "neutral" | "outline";
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "blue",
  className,
  icon
}) => {
  const variantStyles = {
    blue: "bg-[#e57804]/10 text-[#e57804] border-[#e57804]/30",
    neon: "bg-[#e57804]/15 text-[#e57804] border-[#e57804]/40 font-semibold",
    neutral:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/5 dark:text-slate-200 dark:border-white/15",
    outline:
      "bg-transparent text-slate-800 border-slate-300 dark:text-white dark:border-white/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-full border backdrop-blur-sm tracking-wide uppercase",
        variantStyles[variant],
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};