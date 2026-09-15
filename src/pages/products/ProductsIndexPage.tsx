import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useSearchParams, Navigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProductCard } from "@/components/ui/ProductCard";
import { CTASection } from "@/components/ui/CTASection";
import { ZAKEEM_APPLICATIONS, ZakeemApplication } from "@/data/ecosystem";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 6;

export type ProductStatusFilter = "ALL" | "AVAILABLE" | "PRIVATE BETA" | "BETA" | "IN DEVELOPMENT";

const STATUS_FILTERS: { label: ProductStatusFilter; display: string }[] = [
  { label: "ALL", display: "All" },
  { label: "AVAILABLE", display: "Available" },
  { label: "PRIVATE BETA", display: "Private Beta" },
  { label: "BETA", display: "Beta" },
  { label: "IN DEVELOPMENT", display: "In Development" },
];

// Sorting priority: Available -> Beta / Private Beta -> Active Solution / Pilot / Early Access -> In Development / Roadmap
const STATUS_PRIORITY: Record<string, number> = {
  Available: 0,
  Beta: 1,
  "Private Beta": 1,
  "Active Solution": 2,
  Pilot: 2,
  "Early Access": 2,
  "In Development": 3,
  "Coming Soon": 3,
  Roadmap: 3,
};

export const ProductsIndexPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedFilter, setSelectedFilter] = useState<ProductStatusFilter>("ALL");

  // Sort products strictly from AVAILABLE to IN DEVELOPMENT
  const sortedProducts = useMemo<ZakeemApplication[]>(() => {
    return [...ZAKEEM_APPLICATIONS].sort((a, b) => {
      const priorityA = STATUS_PRIORITY[a.status] ?? 99;
      const priorityB = STATUS_PRIORITY[b.status] ?? 99;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return 0; // preserve defined ecosystem array order within same tier
    });
  }, []);

  // Filter products by selected status
  const filteredProducts = useMemo<ZakeemApplication[]>(() => {
    if (selectedFilter === "ALL") return sortedProducts;
    return sortedProducts.filter((p) => {
      const s = p.status.toUpperCase();
      if (selectedFilter === "AVAILABLE") {
        return s === "AVAILABLE" || s === "ACTIVE SOLUTION";
      }
      if (selectedFilter === "PRIVATE BETA") {
        return s === "PRIVATE BETA";
      }
      if (selectedFilter === "BETA") {
        return s === "BETA";
      }
      if (selectedFilter === "IN DEVELOPMENT") {
        return s === "IN DEVELOPMENT" || s === "ROADMAP" || s === "COMING SOON";
      }
      return false;
    });
  }, [sortedProducts, selectedFilter]);

  const filterCounts = useMemo(() => {
    return {
      ALL: sortedProducts.length,
      AVAILABLE: sortedProducts.filter((p) =>
        ["AVAILABLE", "ACTIVE SOLUTION"].includes(p.status.toUpperCase())
      ).length,
      "PRIVATE BETA": sortedProducts.filter((p) => p.status.toUpperCase() === "PRIVATE BETA").length,
      BETA: sortedProducts.filter((p) => p.status.toUpperCase() === "BETA").length,
      "IN DEVELOPMENT": sortedProducts.filter((p) =>
        ["IN DEVELOPMENT", "ROADMAP", "COMING SOON"].includes(p.status.toUpperCase())
      ).length,
    };
  }, [sortedProducts]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : Math.min(pageParam, totalPages);

  // Handle anchor link or slug targeting
  useEffect(() => {
    const targetId = slug || (location.hash ? location.hash.replace("#", "") : null);
    if (targetId && targetId !== "zakeem-realty-erp") {
      const targetIndex = filteredProducts.findIndex(
        (p) => p.slug === targetId || p.id === targetId
      );
      if (targetIndex !== -1) {
        const targetPage = Math.floor(targetIndex / ITEMS_PER_PAGE) + 1;
        if (targetPage !== currentPage) {
          setSearchParams({ page: targetPage.toString() });
          return;
        }
      }
      const timer = setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [slug, location.hash, filteredProducts, currentPage, setSearchParams]);

  if (slug === "zakeem-realty-erp") {
    return <Navigate to="/products/zakeem-realty-erp" replace />;
  }

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleFilterSelect = (filter: ProductStatusFilter) => {
    setSelectedFilter(filter);
    setSearchParams({ page: "1" });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setSearchParams({ page: newPage.toString() });
    const catalogHeader = document.getElementById("products-catalog-anchor");
    if (catalogHeader) {
      catalogHeader.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <SEO
        title="Product Ecosystem — Zakeem Solutions"
        description="Explore the Zakeem suite of digital products and enterprise platforms, including Zakeem Realty ERP, Events Booking, Forecourt, Performance, Smart Attendance, and Cortex AI."
        canonical="https://www.zakeemsolutions.com/products"
      />

      <section
        id="products-catalog-anchor"
        className="pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200 dark:border-white/10 scroll-mt-20"
      >
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <SectionHeader
            badge="Product Ecosystem"
            title="Sovereign Digital Products."
            highlightedWord="Enterprise Grade."
            description="Our software products are engineered to solve core operational, transactional, and intelligence bottlenecks across high-growth African and emerging market sectors."
          />

          {/* Status Filter Bar */}
          <div
            className="flex flex-wrap items-center justify-center gap-2 mt-8 mb-4"
            role="group"
            aria-label="Filter products by status"
          >
            {STATUS_FILTERS.map((filter) => {
              const isActive = selectedFilter === filter.label;
              const count = filterCounts[filter.label];
              return (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => handleFilterSelect(filter.label)}
                  aria-pressed={isActive}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all duration-200 flex items-center gap-2 border cursor-pointer",
                    isActive
                      ? "bg-[#e57804] text-white border-[#e57804] shadow-md shadow-[#e57804]/20"
                      : "bg-slate-100 text-slate-700 border-slate-200 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-200/70 dark:bg-[#081c38]/60 dark:text-slate-400 dark:border-white/10 dark:hover:text-white dark:hover:border-white/20 dark:hover:bg-white/5"
                  )}
                >
                  <span>{filter.label}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-md text-[10px] font-mono",
                      isActive
                        ? "bg-black/30 text-white"
                        : "bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-400"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-slate-600 font-mono text-xs dark:text-slate-400">
              No products found matching status filter "{selectedFilter}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              {paginatedProducts.map((app) => (
                <ProductCard key={app.id} product={app} featured={app.featured} />
              ))}
            </div>
          )}

          {/* Pagination Navigation */}
          {totalPages > 1 && (
            <nav
              aria-label="Products Pagination"
              className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-slate-200 dark:border-white/10"
            >
              <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                Showing{" "}
                <span className="text-slate-900 font-semibold dark:text-white">
                  {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)}
                </span>{" "}
                of{" "}
                <span className="text-slate-900 font-semibold dark:text-white">
                  {filteredProducts.length}
                </span>{" "}
                Products
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  aria-label="Previous page"
                  className={cn(
                    "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all duration-200",
                    currentPage <= 1
                      ? "border-slate-200/60 bg-slate-100/40 text-slate-400 cursor-not-allowed opacity-50 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-600"
                      : "border-slate-200 bg-slate-100 text-slate-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-200/80 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white dark:hover:border-[#e57804]/50 dark:hover:bg-white/10 cursor-pointer"
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        aria-current={isActive ? "page" : undefined}
                        aria-label={`Page ${pageNum}`}
                        className={cn(
                          "w-8 h-8 rounded-lg text-xs font-mono font-medium transition-all duration-200 flex items-center justify-center border",
                          isActive
                            ? "bg-[#e57804] text-white border-[#e57804] shadow-md shadow-[#e57804]/25"
                            : "border-slate-200 bg-slate-100 text-slate-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-200/80 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white dark:hover:border-white/20 dark:hover:bg-white/10 cursor-pointer"
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  aria-label="Next page"
                  className={cn(
                    "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all duration-200",
                    currentPage >= totalPages
                      ? "border-slate-200/60 bg-slate-100/40 text-slate-400 cursor-not-allowed opacity-50 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-600"
                      : "border-slate-200 bg-slate-100 text-slate-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-200/80 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white dark:hover:border-[#e57804]/50 dark:hover:bg-white/10 cursor-pointer"
                  )}
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </nav>
          )}
        </div>
      </section>

      <CTASection
        badge="Product Integration"
        title="Need a Custom Product Implementation?"
        description="Our product engineering teams configure and deploy dedicated tenant clusters for your enterprise with custom business logic and integrations."
      />
    </>
  );
};
