import React from "react";
import { CommercialProductCategory, PRODUCT_CATEGORIES } from "@/data/pricing";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  activeCategory: CommercialProductCategory;
  onChange: (category: CommercialProductCategory) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeCategory,
  onChange,
}) => {
  return (
    <div className="flex items-center justify-center flex-wrap gap-2 py-2">
      {PRODUCT_CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            data-analytics-id={`pricing-filter-${cat.id}`}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#e57804]",
              isActive
                ? "bg-[#e57804]/20 border border-[#e57804] text-[#e57804] shadow-sm shadow-[#e57804]/20"
                : "bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
            )}
            aria-pressed={isActive}
          >
            <span>{cat.label}</span>
            {cat.badge && (
              <span
                className={cn(
                  "text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase",
                  isActive
                    ? "bg-[#e57804] text-slate-950"
                    : "bg-white/10 text-slate-400"
                )}
              >
                {cat.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
