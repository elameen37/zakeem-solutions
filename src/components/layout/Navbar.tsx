import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ChevronDown, Menu, X, ArrowRight, Building2, BrainCircuit, Workflow, ShieldCheck,
  Building, Landmark, Home, Coins, Activity, Zap, Code2, Bot, Layers, Cloud, Shield, Compass, Search
} from "lucide-react";
import { MAIN_NAVIGATION } from "@/data/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { openGlobalSearch } from "@/components/search/GlobalSearchModal";

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  // Handle scroll styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderIcon = (name?: string) => {
    const iconClass = "w-4 h-4 text-[#e57804] group-hover:text-white transition-colors shrink-0";
    switch (name) {
      case "Building2": return <Building2 className={iconClass} />;
      case "BrainCircuit": return <BrainCircuit className={iconClass} />;
      case "Workflow": return <Workflow className={iconClass} />;
      case "ShieldCheck": return <ShieldCheck className={iconClass} />;
      case "Building": return <Building className={iconClass} />;
      case "Landmark": return <Landmark className={iconClass} />;
      case "Home": return <Home className={iconClass} />;
      case "Coins": return <Coins className={iconClass} />;
      case "Activity": return <Activity className={iconClass} />;
      case "Zap": return <Zap className={iconClass} />;
      case "Code2": return <Code2 className={iconClass} />;
      case "Bot": return <Bot className={iconClass} />;
      case "Layers": return <Layers className={iconClass} />;
      case "Cloud": return <Cloud className={iconClass} />;
      case "Shield": return <Shield className={iconClass} />;
      case "Compass": return <Compass className={iconClass} />;
      default: return <Layers className={iconClass} />;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-3 md:pt-4 px-3 sm:px-4 md:px-6 pointer-events-none transition-all duration-300">
      <div className="container mx-auto max-w-7xl">
        <div
          className={cn(
            "pointer-events-auto rounded-2xl border transition-all duration-300 px-4 md:px-6",
            "backdrop-blur-2xl backdrop-saturate-150 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)]",
            scrolled
              ? "bg-[#06152b]/85 border-white/20 shadow-2xl shadow-black/50 py-2.5"
              : "bg-[#06152b]/65 border-white/15 shadow-xl shadow-black/30 py-3 hover:bg-[#06152b]/75 hover:border-white/25"
          )}
        >
          <div className="flex items-center justify-between">
          {/* Brand Identity / Logo */}
          <Link to="/" className="flex items-center group py-0.5">
            <div className="relative h-8 md:h-9 w-auto flex items-center">
              {/* White Logo (Normal State) */}
              <img
                src="/assets/logos/logo-white.png"
                alt="Zakeem Solutions"
                className={cn(
                  "h-8 md:h-9 w-auto object-contain transition-opacity duration-300 group-hover:scale-[1.02]",
                  scrolled ? "opacity-0 absolute pointer-events-none" : "opacity-100 relative"
                )}
              />
              {/* Colored Logo (Scrolled State) */}
              <img
                src="/assets/logos/logo-color.png"
                alt="Zakeem Solutions"
                className={cn(
                  "h-8 md:h-9 w-auto object-contain transition-opacity duration-300 group-hover:scale-[1.02]",
                  scrolled ? "opacity-100 relative" : "opacity-0 absolute pointer-events-none"
                )}
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav ref={dropdownRef} className="hidden lg:flex items-center gap-1 xl:gap-2">
            {MAIN_NAVIGATION.map((item) => {
              const hasDropdown = Boolean(item.children && item.children.length > 0);
              const isActive = activeDropdown === item.label;

              if (!hasDropdown) {
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="px-3.5 py-2 text-sm font-medium text-slate-200 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <div key={item.label} className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(isActive ? null : item.label)}
                    className={cn(
                      "flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-all",
                      isActive
                        ? "text-white bg-white/10"
                        : "text-slate-200 hover:text-white hover:bg-white/5"
                    )}
                    aria-expanded={isActive}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-200 opacity-70",
                        isActive ? "rotate-180 text-[#e57804]" : ""
                      )}
                    />
                  </button>

                  {/* Desktop Dropdown Mega-Menu */}
                  {isActive && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[560px] p-4 rounded-2xl bg-[#081b37]/85 backdrop-blur-2xl backdrop-saturate-150 border border-white/20 shadow-2xl shadow-black/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                      <div className="px-3 py-2 border-b border-white/10 mb-3 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-mono uppercase tracking-wider text-[#e57804]">
                            {item.label} Overview
                          </div>
                          <div className="text-xs text-slate-300">{item.description}</div>
                        </div>
                        <Link
                          to={item.href}
                          className="text-xs font-semibold text-[#e57804] hover:text-white flex items-center gap-1 transition-colors"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <span>View all</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {item.children?.map((sub) => (
                          <Link
                            key={sub.label}
                            to={sub.href}
                            className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <div className="mt-0.5 p-2 rounded-lg bg-white/5 border border-white/10 group-hover:bg-[#e57804]/15 group-hover:border-[#e57804]/40 transition-all shrink-0">
                              {renderIcon(sub.icon)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white group-hover:text-[#e57804] transition-colors truncate">
                                  {sub.label}
                                </span>
                                {sub.badge && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#e57804]/10 text-[#e57804] border border-[#e57804]/20">
                                    {sub.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">
                                {sub.description}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* CTA Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              type="button"
              onClick={openGlobalSearch}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
              aria-label="Search site (Cmd/Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">Search</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-slate-400 border border-white/10">⌘K</kbd>
            </button>
            <Link
              to="/login"
              className="text-xs font-mono font-medium text-slate-200 hover:text-white px-3 py-2 rounded-lg transition-colors"
            >
              Client Login
            </Link>
            <Button variant="primary" size="sm" href="/request-demo">
              Request a Demo
            </Button>
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="flex lg:hidden items-center gap-1.5">
            <button
              type="button"
              onClick={openGlobalSearch}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Search site"
            >
              <Search className="w-5 h-5" />
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              className="p-2 text-white"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="lg:hidden mt-4 p-5 rounded-2xl bg-[#081b37]/90 backdrop-blur-2xl backdrop-saturate-150 border border-white/20 shadow-2xl shadow-black/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] space-y-6 max-h-[75vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Quick Search in Mobile Menu */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openGlobalSearch();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs font-medium"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#e57804]" />
                <span>Search products, solutions, careers...</span>
              </div>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-slate-400">⌘K</kbd>
            </button>

            <div className="space-y-4">
              {MAIN_NAVIGATION.map((item) => (
                <div key={item.label} className="border-b border-white/5 pb-3">
                  <Link
                    to={item.href}
                    className="text-base font-bold text-white block mb-2"
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="pl-3 space-y-2.5">
                      {item.children.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.href}
                          className="flex items-center justify-between text-xs text-slate-300 hover:text-white py-1"
                        >
                          <span>{sub.label}</span>
                          {sub.badge && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#e57804]/10 text-[#e57804]">
                              {sub.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 space-y-3 pb-2">
              <Button variant="primary" size="md" href="/request-demo" className="w-full">
                Request a Demo
              </Button>
              <Button variant="outline" size="md" href="/contact" className="w-full">
                Contact Sales
              </Button>
              <Button variant="ghost" size="sm" href="/login" className="w-full">
                Client Portal Login
              </Button>
            </div>
          </div>
        )}
        </div>
      </div>
    </header>
  );
};