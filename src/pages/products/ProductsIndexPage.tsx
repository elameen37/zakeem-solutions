import React, { useEffect, useMemo } from "react";
import { useParams, useLocation, useSearchParams, Navigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProductCard } from "@/components/ui/ProductCard";
import { CTASection } from "@/components/ui/CTASection";
import { ZAKEEM_APPLICATIONS, ZakeemApplication } from "@/data/ecosystem";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 6;

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

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE) || 1;
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : Math.min(pageParam, totalPages);

  // Handle anchor link or slug targeting
  useEffect(() => {
    const targetId = slug || (location.hash ? location.hash.replace("#", "") : null);
    if (targetId && targetId !== "zakeem-realty-erp") {
      const targetIndex = sortedProducts.findIndex(
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
  }, [slug, location.hash, sortedProducts, currentPage, setSearchParams]);

  if (slug === "zakeem-realty-erp") {
    return <Navigate to="/products/zakeem-realty-erp" replace />;
  }

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = sortedProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

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
        className="pt-12 pb-20 md:pt-20 md:pb-28 border-b border-white/10 scroll-mt-20"
      >
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <SectionHeader
            badge="Product Ecosystem"
            title="Sovereign Digital Products."
            highlightedWord="Enterprise Grade."
            description="Our software products are engineered to solve core operational, transactional, and intelligence bottlenecks across high-growth African and emerging market sectors."
          />

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {paginatedProducts.map((app) => (
              <ProductCard key={app.id} product={app} featured={app.featured} />
            ))}
          </div>

          {/* Pagination Navigation */}
          {totalPages > 1 && (
            <nav
              aria-label="Products Pagination"
              className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-white/10"
            >
              <div className="text-xs font-mono text-slate-400">
                Showing{" "}
                <span className="text-white font-semibold">
                  {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, sortedProducts.length)}
                </span>{" "}
                of{" "}
                <span className="text-white font-semibold">
                  {sortedProducts.length}
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
                      ? "border-white/5 bg-white/[0.02] text-slate-600 cursor-not-allowed opacity-50"
                      : "border-white/10 bg-white/5 text-slate-300 hover:text-white hover:border-[#e57804]/50 hover:bg-white/10 cursor-pointer"
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
                            : "border-white/10 bg-white/5 text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/10 cursor-pointer"
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
                      ? "border-white/5 bg-white/[0.02] text-slate-600 cursor-not-allowed opacity-50"
                      : "border-white/10 bg-white/5 text-slate-300 hover:text-white hover:border-[#e57804]/50 hover:bg-white/10 cursor-pointer"
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
