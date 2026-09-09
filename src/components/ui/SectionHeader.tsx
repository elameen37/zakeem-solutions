import React from "react";
import { Badge } from "./Badge";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  badge?: string;
  badgeVariant?: "blue" | "neon" | "neutral";
  title: string;
  highlightedWord?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  badgeVariant = "blue",
  title,
  highlightedWord,
  description,
  align = "left",
  className
}) => {
  return (
    <div
      className={cn(
        "max-w-3xl mb-12 lg:mb-16",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      {badge && (
        <div className={cn("mb-4", align === "center" ? "flex justify-center" : "")}>
          <Badge variant={badgeVariant}>{badge}</Badge>
        </div>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
        {title}{" "}
        {highlightedWord && (
          <span className="bg-gradient-to-r from-white via-amber-200 to-[#e57804] bg-clip-text text-transparent">
            {highlightedWord}
          </span>
        )}
      </h2>
      {description && (
        <p className="mt-4 text-base md:text-lg text-slate-300 font-normal leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};