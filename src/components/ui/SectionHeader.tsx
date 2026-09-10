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
  inverted?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  badgeVariant,
  title,
  highlightedWord,
  description,
  align = "left",
  className,
  inverted = false
}) => {
  return (
    <div
      className={cn(
        "max-w-3xl mb-12 lg:mb-16",
        inverted ? "section-header-inverted" : "section-header-light",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      {badge && (
        <div className={cn("mb-4", align === "center" ? "flex justify-center" : "")}>
          <Badge variant={badgeVariant || (inverted ? "neon" : "blue")}>
            {badge}
          </Badge>
        </div>
      )}
      <h2
        className={cn(
          "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight",
          inverted
            ? "!text-white"
            : "!text-slate-950 dark:!text-white"
        )}
      >
        <span
          className={cn(
            inverted
              ? "!text-white"
              : "!text-slate-950 dark:!text-white"
          )}
        >
          {title}{" "}
        </span>
        {highlightedWord && (
          <span
            className={cn(
              "bg-clip-text text-transparent inline-block",
              inverted
                ? "bg-gradient-to-r from-white via-amber-200 to-[#e57804]"
                : "bg-gradient-to-r from-slate-950 via-amber-700 to-[#e57804] dark:from-white dark:via-amber-200 dark:to-[#e57804]"
            )}
          >
            {highlightedWord}
          </span>
        )}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-base md:text-lg font-normal leading-relaxed",
            inverted
              ? "!text-slate-300"
              : "!text-slate-600 dark:!text-slate-300"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
};