import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, CornerDownLeft, ArrowRight, Layers, Cpu, Briefcase, FileText, Building2, Tag, Compass } from "lucide-react";
import { getAllSearchItems, searchItems, SearchItem, SearchCategory } from "../../lib/searchRegistry";
import { cn } from "../../lib/utils";
import { useTheme } from "../../context/ThemeContext";

export const OPEN_SEARCH_EVENT = "zakeem:open-global-search";

export function openGlobalSearch(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT));
  }
}

const CATEGORY_COLORS: Record<SearchCategory, { badge: string; icon: React.ReactNode }> = {
  Product: {
    badge: "bg-blue-500/15 text-blue-500 dark:text-blue-400 border-blue-500/30",
    icon: <Building2 className="w-3.5 h-3.5" />,
  },
  Solution: {
    badge: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    icon: <Layers className="w-3.5 h-3.5" />,
  },
  Service: {
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    icon: <Cpu className="w-3.5 h-3.5" />,
  },
  Career: {
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    icon: <Briefcase className="w-3.5 h-3.5" />,
  },
  Pricing: {
    badge: "bg-[#e57804]/15 text-[#e57804] border-[#e57804]/30",
    icon: <Tag className="w-3.5 h-3.5" />,
  },
  Page: {
    badge: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30",
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
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const hasOpenedRef = useRef(false);

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
        setIsOpen((prev) => {
          if (!prev) {
            previouslyFocusedElement.current = document.activeElement as HTMLElement | null;
            return true;
          } else {
            return false;
          }
        });
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      previouslyFocusedElement.current = document.activeElement as HTMLElement | null;
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener(OPEN_SEARCH_EVENT, handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener(OPEN_SEARCH_EVENT, handleCustomOpen);
    };
  }, [isOpen]);

  // Trap focus inside modal when open
  useEffect(() => {
    if (!isOpen) return;

    const handleModalKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (!modalRef.current) return;
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const focusable = Array.from(focusableElements).filter(
        (el) => !el.hasAttribute("disabled") && el.offsetParent !== null
      );

      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement || !modalRef.current.contains(document.activeElement)) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement || !modalRef.current.contains(document.activeElement)) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener("keydown", handleModalKeyDown);
    return () => window.removeEventListener("keydown", handleModalKeyDown);
  }, [isOpen]);

  // Autofocus input when opened and restore focus when closed
  useEffect(() => {
    if (isOpen) {
      hasOpenedRef.current = true;
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      if (hasOpenedRef.current && previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
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
        ref={modalRef}
        className={cn(
          "w-full max-w-2xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150",
          isDark ? "bg-[#07172e] border-white/15" : "bg-white border-slate-200 text-slate-900"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          className={cn(
            "relative flex items-center px-4 py-3.5 border-b",
            isDark ? "border-white/10 bg-[#0a1e3b]/80" : "border-slate-200 bg-slate-50"
          )}
        >
          <Search className={cn("w-5 h-5 shrink-0 mr-3", isDark ? "text-slate-400" : "text-slate-500")} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search products, solutions, services, pricing, careers..."
            className={cn(
              "w-full bg-transparent text-sm sm:text-base focus:outline-none focus:ring-0 font-sans",
              isDark ? "text-white placeholder-slate-400" : "text-slate-900 placeholder-slate-500"
            )}
            aria-label="Search"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className={cn(
                "p-1 rounded-md transition-colors",
                isDark ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200"
              )}
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div
              className={cn(
                "flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border",
                isDark ? "text-slate-400 bg-white/5 border-white/10" : "text-slate-600 bg-white border-slate-200 shadow-2xs"
              )}
            >
              <span>ESC</span>
            </div>
          )}
        </div>

        {/* Suggested Queries Pill Row (shown if query is empty) */}
        {!query && (
          <div
            className={cn(
              "px-4 py-2.5 border-b flex items-center gap-2 overflow-x-auto no-scrollbar",
              isDark ? "border-white/5 bg-[#040e1d]/60" : "border-slate-200 bg-slate-100/70"
            )}
          >
            <span
              className={cn(
                "text-[11px] font-mono uppercase shrink-0 flex items-center gap-1",
                isDark ? "text-slate-400" : "text-slate-600"
              )}
            >
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
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap",
                  isDark
                    ? "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border-white/5"
                    : "bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-200 border-slate-200 shadow-2xs"
                )}
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
              <div
                className={cn(
                  "px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider",
                  isDark ? "text-slate-400" : "text-slate-500"
                )}
              >
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
                        ? isDark
                          ? "bg-white/10 border border-[#e57804]/40"
                          : "bg-slate-100 border border-[#e57804]/60"
                        : isDark
                        ? "hover:bg-white/5 border border-transparent"
                        : "hover:bg-slate-50 border border-transparent"
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
                          <span
                            className={cn(
                              "text-sm font-semibold truncate group-hover:text-[#e57804] transition-colors",
                              isDark ? "text-white" : "text-slate-900"
                            )}
                          >
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
                            <span
                              className={cn(
                                "text-[10px] font-mono px-1.5 py-0.2 rounded",
                                isDark
                                  ? "bg-white/10 text-slate-300"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className={cn(
                            "text-xs line-clamp-1 mt-0.5",
                            isDark ? "text-slate-400" : "text-slate-600"
                          )}
                        >
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
                          "w-4 h-4 transition-transform duration-150",
                          isSelected
                            ? "text-[#e57804] translate-x-1"
                            : isDark
                            ? "text-slate-500 group-hover:text-slate-300"
                            : "text-slate-400 group-hover:text-slate-700"
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Search className={cn("w-10 h-10 mx-auto mb-3", isDark ? "text-slate-600" : "text-slate-400")} />
              <p className={cn("text-sm font-medium", isDark ? "text-slate-300" : "text-slate-800")}>
                No results found for &ldquo;{query}&rdquo;
              </p>
              <p className={cn("text-xs mt-1 max-w-sm mx-auto", isDark ? "text-slate-500" : "text-slate-500")}>
                Try searching for &ldquo;Realty ERP&rdquo;, &ldquo;Pricing&rdquo;, &ldquo;Solutions&rdquo;, or &ldquo;Careers&rdquo;.
              </p>
            </div>
          )}
        </div>

        {/* Footer Shortcut Legend */}
        <div
          className={cn(
            "px-4 py-2.5 border-t flex items-center justify-between text-[11px] font-mono",
            isDark ? "bg-[#040e1d] border-white/10 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
          )}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd
                className={cn(
                  "px-1.5 py-0.5 rounded border",
                  isDark ? "bg-white/10 border-white/15 text-slate-300" : "bg-white border-slate-300 text-slate-700 shadow-2xs"
                )}
              >
                ↑
              </kbd>
              <kbd
                className={cn(
                  "px-1.5 py-0.5 rounded border",
                  isDark ? "bg-white/10 border-white/15 text-slate-300" : "bg-white border-slate-300 text-slate-700 shadow-2xs"
                )}
              >
                ↓
              </kbd>
              <span className="ml-0.5">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd
                className={cn(
                  "px-1.5 py-0.5 rounded border",
                  isDark ? "bg-white/10 border-white/15 text-slate-300" : "bg-white border-slate-300 text-slate-700 shadow-2xs"
                )}
              >
                ↵
              </kbd>
              <span className="ml-0.5">Open</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd
                className={cn(
                  "px-1.5 py-0.5 rounded border",
                  isDark ? "bg-white/10 border-white/15 text-slate-300" : "bg-white border-slate-300 text-slate-700 shadow-2xs"
                )}
              >
                ESC
              </kbd>
              <span className="ml-0.5">Close</span>
            </span>
          </div>
          <span className="text-[#e57804] font-medium hidden sm:inline">Zakeem Search</span>
        </div>
      </div>
    </div>
  );
};
