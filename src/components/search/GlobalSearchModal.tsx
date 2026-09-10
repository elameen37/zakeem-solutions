import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, CornerDownLeft, ArrowRight, Layers, Cpu, Briefcase, FileText, Building2, Tag, Compass } from "lucide-react";
import { getAllSearchItems, searchItems, SearchItem, SearchCategory } from "../../lib/searchRegistry";
import { cn } from "../../lib/utils";

export const OPEN_SEARCH_EVENT = "zakeem:open-global-search";

export function openGlobalSearch(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT));
  }
}

const CATEGORY_COLORS: Record<SearchCategory, { badge: string; icon: React.ReactNode }> = {
  Product: {
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    icon: <Building2 className="w-3.5 h-3.5" />,
  },
  Solution: {
    badge: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    icon: <Layers className="w-3.5 h-3.5" />,
  },
  Service: {
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    icon: <Cpu className="w-3.5 h-3.5" />,
  },
  Career: {
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    icon: <Briefcase className="w-3.5 h-3.5" />,
  },
  Pricing: {
    badge: "bg-[#e57804]/15 text-[#e57804] border-[#e57804]/30",
    icon: <Tag className="w-3.5 h-3.5" />,
  },
  Page: {
    badge: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    icon: <FileText className="w-3.5 h-3.5" />,
  },
};

const SUGGESTED_QUICK_SEARCHES = [
  "Zakeem Realty ERP",
  "Pricing in Naira",
  "Careers Lagos Abuja",
  "Cloud Modernization",
  "Public Sector Registry",
];

export const GlobalSearchModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // All searchable items
  const allItems = useMemo(() => getAllSearchItems(), []);

  // Filtered items
  const results = useMemo(() => {
    if (!query.trim()) {
      // Default curated items when query is empty
      return allItems.filter((i) =>
        [
          "product-zakeem-realty-erp",
          "page-pricing",
          "page-solutions",
          "page-services",
          "page-careers",
          "page-contact",
        ].includes(i.id)
      );
    }
    return searchItems(query, allItems).slice(0, 8);
  }, [query, allItems]);

  // Handle global shortcut (Cmd/Ctrl + K) & custom event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener(OPEN_SEARCH_EVENT, handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener(OPEN_SEARCH_EVENT, handleCustomOpen);
    };
  }, [isOpen]);

  // Autofocus input when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset selected index on result change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector<HTMLElement>(`[data-search-index="${selectedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  const handleSelect = (item: SearchItem) => {
    setIsOpen(false);
    if (item.href.startsWith("http")) {
      window.open(item.href, "_blank", "noopener,noreferrer");
    } else {
      navigate(item.href);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length ? (prev + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md transition-opacity duration-200"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Global Search"
    >
      <div
        className="w-full max-w-2xl bg-[#07172e] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-white/10 bg-[#0a1e3b]/80">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search products, solutions, services, pricing, careers..."
            className="w-full bg-transparent text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-0 font-sans"
            aria-label="Search"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
              <span>ESC</span>
            </div>
          )}
        </div>

        {/* Suggested Queries Pill Row (shown if query is empty) */}
        {!query && (
          <div className="px-4 py-2.5 border-b border-white/5 bg-[#040e1d]/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-mono uppercase text-slate-400 shrink-0 flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#e57804]" /> Suggested:
            </span>
            {SUGGESTED_QUICK_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setQuery(term);
                  inputRef.current?.focus();
                }}
                className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5 transition-colors whitespace-nowrap"
              >
                {term}
              </button>
            ))}
          </div>
        )}

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[50vh]">
          {results.length > 0 ? (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                {query ? `Results (${results.length})` : "Quick Links & Popular Portals"}
              </div>
              {results.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const catMeta = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Page;

                return (
                  <div
                    key={item.id}
                    data-search-index={idx}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors duration-150 group",
                      isSelected
                        ? "bg-white/10 border border-[#e57804]/40"
                        : "hover:bg-white/5 border border-transparent"
                    )}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5",
                          catMeta.badge
                        )}
                      >
                        {catMeta.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white truncate group-hover:text-[#e57804] transition-colors">
                            {item.title}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-mono px-1.5 py-0.2 rounded border",
                              catMeta.badge
                            )}
                          >
                            {item.category}
                          </span>
                          {item.badge && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-3 shrink-0">
                      {isSelected && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-[#e57804]">
                          <span>Select</span>
                          <CornerDownLeft className="w-3 h-3" />
                        </span>
                      )}
                      <ArrowRight
                        className={cn(
                          "w-4 h-4 text-slate-500 transition-transform duration-150",
                          isSelected ? "text-[#e57804] translate-x-1" : "group-hover:text-slate-300"
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-300">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try searching for &ldquo;Realty ERP&rdquo;, &ldquo;Pricing&rdquo;, &ldquo;Solutions&rdquo;, or &ldquo;Careers&rdquo;.
              </p>
            </div>
          )}
        </div>

        {/* Footer Shortcut Legend */}
        <div className="px-4 py-2.5 bg-[#040e1d] border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-slate-300">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-slate-300">↓</kbd>
              <span className="ml-0.5">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-slate-300">↵</kbd>
              <span className="ml-0.5">Open</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-slate-300">ESC</kbd>
              <span className="ml-0.5">Close</span>
            </span>
          </div>
          <span className="text-[#e57804] font-medium hidden sm:inline">Zakeem Search</span>
        </div>
      </div>
    </div>
  );
};
