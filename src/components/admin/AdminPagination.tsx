import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminPaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemName?: string;
  className?: string;
}

export const AdminPagination: React.FC<AdminPaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  itemName = "records",
  className,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems === 0) {
    return null;
  }

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with smart ellipsis windowing
  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "ellipsis", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "ellipsis",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      totalPages,
    ];
  };

  const pages = getPageNumbers();

  return (
    <nav
      aria-label={`${itemName} Pagination`}
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-200 dark:border-white/10",
        className
      )}
    >
      {/* Item count summary */}
      <div className="text-xs font-mono text-slate-200 dark:text-slate-400">
        Showing{" "}
        <span className="font-semibold text-white dark:text-white">
          {startIndex}–{endIndex}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-white dark:text-white">
          {totalItems}
        </span>{" "}
        {itemName}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {/* Previous Button */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all duration-150",
              currentPage <= 1
                ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-40 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-600"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:border-white/15 dark:bg-[#06152b] dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10 cursor-pointer shadow-2xs"
            )}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Numeric Page Buttons & Ellipses */}
          <div className="flex items-center gap-1">
            {pages.map((item, index) => {
              if (item === "ellipsis") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="w-7 h-7 flex items-center justify-center text-xs font-mono text-slate-400 dark:text-slate-500 select-none"
                  >
                    …
                  </span>
                );
              }

              const isCurrent = item === currentPage;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onPageChange(item)}
                  aria-current={isCurrent ? "page" : undefined}
                  aria-label={`Page ${item}`}
                  className={cn(
                    "w-7 h-7 rounded-lg text-xs font-mono font-medium transition-all duration-150 flex items-center justify-center border",
                    isCurrent
                      ? "bg-[#e57804] text-white border-[#e57804] shadow-sm font-bold"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:border-white/15 dark:bg-[#06152b] dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10 cursor-pointer shadow-2xs"
                  )}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all duration-150",
              currentPage >= totalPages
                ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-40 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-600"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:border-white/15 dark:bg-[#06152b] dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10 cursor-pointer shadow-2xs"
            )}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </nav>
  );
};
