import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ChevronDown, Menu, X, ArrowRight, Building2, BrainCircuit, Workflow, ShieldCheck,
  Building, Landmark, Home, Coins, Activity, Zap, Code2, Bot, Layers, Cloud, Shield, Compass, Search, Scale,
  Linkedin, Facebook, Instagram, Youtube, Globe
} from "lucide-react";
import { MAIN_NAVIGATION } from "@/data/navigation";
import { SOCIAL_LINKS } from "@/data/social";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { openGlobalSearch } from "@/components/search/GlobalSearchModal";
import { useTheme } from "@/context/ThemeContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={cn("fill-current", className)} aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TikTokIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={cn("fill-current", className)} aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.33a6.33 6.33 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.71a8.18 8.18 0 0 0 4.78 1.52v-3.4a4.85 4.85 0 0 1-1-.14z" />
  </svg>
);

const renderSocialIcon = (iconName: string) => {
  const props = { className: "w-3.5 h-3.5 text-slate-300 group-hover:text-[#e57804] transition-colors" };
  switch (iconName) {
    case "Linkedin": return <Linkedin {...props} />;
    case "X": return <XIcon {...props} />;
    case "Instagram": return <Instagram {...props} />;
    case "Facebook": return <Facebook {...props} />;
    case "TikTok": return <TikTokIcon {...props} />;
    case "YouTube": return <Youtube {...props} />;
    case "Youtube": return <Youtube {...props} />;
    default: return <Globe {...props} />;
  }
};

export const Navbar: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  // Close menus on route change
  useEffect(() => {
    wasOpenRef.current = false;
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

  // Handle body scroll lock, Escape key, focus trapping & restoration when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      document.body.style.overflow = "hidden";

      // Focus first focusable element inside the drawer after opening
      const focusTimer = setTimeout(() => {
        if (mobileMenuRef.current) {
          const focusables = Array.from(
            mobileMenuRef.current.querySelectorAll<HTMLElement>(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
          ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
          focusables[0]?.focus();
        }
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          setIsOpen(false);
          menuTriggerRef.current?.focus();
        } else if (e.key === "Tab" && mobileMenuRef.current) {
          const focusables = Array.from(
            mobileMenuRef.current.querySelectorAll<HTMLElement>(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
          ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);

          if (focusables.length === 0) {
            e.preventDefault();
            return;
          }

          const firstEl = focusables[0];
          const lastEl = focusables[focusables.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstEl || !mobileMenuRef.current.contains(document.activeElement)) {
              e.preventDefault();
              lastEl.focus();
            }
          } else {
            if (document.activeElement === lastEl || !mobileMenuRef.current.contains(document.activeElement)) {
              e.preventDefault();
              firstEl.focus();
            }
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        clearTimeout(focusTimer);
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
      if (wasOpenRef.current) {
        menuTriggerRef.current?.focus();
      }
    }
  }, [isOpen]);

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
      case "Scale": return <Scale className={iconClass} />;
      default: return <Layers className={iconClass} />;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-3 md:pt-4 px-3 sm:px-4 md:px-6 pointer-events-none transition-all duration-300">
      <div className="container mx-auto max-w-7xl">
        <div
          className={cn(
            "pointer-events-auto rounded-2xl border transition-all duration-300 px-4 md:px-6",
            "backdrop-blur-2xl backdrop-saturate-150",
            isDark
              ? cn(
                  "shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)]",
                  scrolled
                    ? "bg-[#06152b]/85 border-white/20 shadow-2xl shadow-black/50 py-2.5"
                    : "bg-[#06152b]/65 border-white/15 shadow-xl shadow-black/30 py-3 hover:bg-[#06152b]/75 hover:border-white/25"
                )
              : cn(
                  "shadow-[0_8px_24px_0_rgba(15,23,42,0.08)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]",
                  scrolled
                    ? "bg-white/90 border-slate-200/90 shadow-lg shadow-slate-200/50 py-2.5"
                    : "bg-white/80 border-slate-200/70 shadow-md shadow-slate-200/30 py-3 hover:bg-white/90 hover:border-slate-300"
                )
          )}
        >
          <div className="flex items-center justify-between">
          {/* Brand Identity / Logo */}
          <Link to="/" className="flex items-center group py-0.5">
            <div className="relative h-8 md:h-9 w-auto flex items-center">
              <img
                src={isDark ? "/assets/logos/logo-white.png" : "/assets/logos/logo-color.png"}
                alt="Zakeem Solutions"
                className="h-8 md:h-9 w-auto object-contain transition-all duration-300 group-hover:scale-[1.02]"
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
                    className={cn(
                      "px-3.5 py-2 text-sm font-medium rounded-lg transition-colors",
                      isDark
                        ? "text-slate-200 hover:text-white hover:bg-white/5"
                        : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                    )}
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
                        ? isDark
                          ? "text-white bg-white/10"
                          : "text-slate-950 bg-slate-100 font-semibold"
                        : isDark
                        ? "text-slate-200 hover:text-white hover:bg-white/5"
                        : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
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
                    <div
                      className={cn(
                        "absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[560px] p-4 rounded-2xl backdrop-blur-2xl backdrop-saturate-150 border animate-in fade-in slide-in-from-top-2 duration-200 z-50",
                        isDark
                          ? "bg-[#081b37]/90 border-white/20 shadow-2xl shadow-black/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
                          : "bg-white/95 border-slate-200 shadow-2xl shadow-slate-300/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] text-slate-900"
                      )}
                    >
                      <div className={cn("px-3 py-2 border-b mb-3 flex items-center justify-between", isDark ? "border-white/10" : "border-slate-200")}>
                        <div>
                          <div className="text-xs font-mono uppercase tracking-wider text-[#e57804]">
                            {item.label} Overview
                          </div>
                          <div className={cn("text-xs", isDark ? "text-slate-300" : "text-slate-600")}>{item.description}</div>
                        </div>
                        <Link
                          to={item.href}
                          className="text-xs font-semibold text-[#e57804] hover:text-[#cf6a02] flex items-center gap-1 transition-colors"
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
                            className={cn(
                              "group flex items-start gap-3 p-2.5 rounded-xl transition-colors",
                              isDark ? "hover:bg-white/5" : "hover:bg-slate-100"
                            )}
                            onClick={() => setActiveDropdown(null)}
                          >
                            <div
                              className={cn(
                                "mt-0.5 p-2 rounded-lg border transition-all shrink-0",
                                isDark
                                  ? "bg-white/5 border-white/10 group-hover:bg-[#e57804]/15 group-hover:border-[#e57804]/40"
                                  : "bg-slate-100 border-slate-200 group-hover:bg-[#e57804]/10 group-hover:border-[#e57804]/30"
                              )}
                            >
                              {renderIcon(sub.icon)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "text-sm font-semibold group-hover:text-[#e57804] transition-colors truncate",
                                    isDark ? "text-white" : "text-slate-900"
                                  )}
                                >
                                  {sub.label}
                                </span>
                                {sub.badge && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#e57804]/10 text-[#e57804] border border-[#e57804]/20">
                                    {sub.badge}
                                  </span>
                                )}
                              </div>
                              <p className={cn("text-xs line-clamp-2 mt-0.5", isDark ? "text-slate-300" : "text-slate-600")}>
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
          <div className="hidden lg:flex items-center gap-2.5">
            <button
              type="button"
              onClick={openGlobalSearch}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border transition-all",
                isDark
                  ? "text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border-white/10"
                  : "text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border-slate-200 shadow-sm"
              )}
              aria-label="Search site (Cmd/Ctrl + K)"
            >
              <Search className={cn("w-3.5 h-3.5", isDark ? "text-slate-400" : "text-slate-500")} />
              <span className="font-medium">Search</span>
              <kbd
                className={cn(
                  "text-[10px] font-mono px-1.5 py-0.5 rounded border",
                  isDark
                    ? "bg-black/40 text-slate-400 border-white/10"
                    : "bg-white text-slate-600 border-slate-300 shadow-2xs"
                )}
              >
                ⌘K
              </kbd>
            </button>
            <ThemeToggle />
            <Link
              to="/login"
              className={cn(
                "text-xs font-mono font-medium px-3 py-2 rounded-lg transition-colors",
                isDark
                  ? "text-slate-200 hover:text-white hover:bg-white/5"
                  : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
              )}
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
              className={cn(
                "min-w-[44px] min-h-[44px] p-2.5 flex items-center justify-center rounded-lg transition-colors",
                isDark
                  ? "text-slate-300 hover:text-white hover:bg-white/10"
                  : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
              )}
              aria-label="Search site"
            >
              <Search className="w-5 h-5" />
            </button>
            <ThemeToggle />
            <Button
              ref={menuTriggerRef}
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              className={cn("min-w-[44px] min-h-[44px] p-2.5 flex items-center justify-center", isDark ? "text-white hover:bg-white/10" : "text-slate-900 hover:bg-slate-100")}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div
            ref={mobileMenuRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            className={cn(
              "lg:hidden mt-4 p-5 rounded-2xl backdrop-blur-2xl backdrop-saturate-150 border space-y-5 max-h-[75vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200",
              isDark
                ? "bg-[#081b37]/90 border-white/20 shadow-2xl shadow-black/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] text-white"
                : "bg-[#06152b]/95 border-white/15 shadow-2xl shadow-navy-950/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] text-white"
            )}
          >
            {/* Quick Search in Mobile Menu */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openGlobalSearch();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 text-xs font-medium transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#e57804]" />
                <span>Search products, solutions, careers...</span>
              </div>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border bg-black/40 border-white/10 text-slate-400">
                ⌘K
              </kbd>
            </button>

            <div className="space-y-4">
              {MAIN_NAVIGATION.map((item) => (
                <div key={item.label} className="border-b border-white/10 pb-3">
                  <Link
                    to={item.href}
                    className="text-base font-bold block mb-2 text-white hover:text-[#e57804] transition-colors"
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="pl-3 space-y-2.5">
                      {item.children.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.href}
                          className="flex items-center justify-between text-xs py-1.5 text-slate-300 hover:text-white transition-colors"
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
              <Button variant="outline" size="md" href="/contact" className="w-full border-white/20 text-white hover:bg-white/10">
                Contact Sales
              </Button>
              <Button variant="ghost" size="sm" href="/login" className="w-full text-slate-300 hover:text-white hover:bg-white/5">
                Client Portal Login
              </Button>
            </div>

            {/* Official Social Channels */}
            <div className="pt-3 border-t border-white/10">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2.5">
                Official Channels
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow Zakeem Solutions on ${s.platform} (@${s.handle})`}
                    title={`${s.platform}: @${s.handle}`}
                    className="w-11 h-11 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-[#e57804] hover:bg-[#e57804]/20 hover:border-[#e57804]/40 transition-all focus:outline-none focus:ring-2 focus:ring-[#e57804]"
                  >
                    {renderSocialIcon(s.icon)}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </header>
  );
};