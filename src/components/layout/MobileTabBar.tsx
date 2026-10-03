import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Layers, Sparkles, Building2, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { toggleMobileMenu, MOBILE_MENU_STATE_EVENT } from "@/lib/navEvents";

export const MobileTabBar: React.FC = () => {
  const { pathname } = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleState = (e: Event) => {
      const customEvent = e as CustomEvent<{ isOpen: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.isOpen === "boolean") {
        setIsMenuOpen(customEvent.detail.isOpen);
      }
    };

    window.addEventListener(MOBILE_MENU_STATE_EVENT, handleState);
    return () => window.removeEventListener(MOBILE_MENU_STATE_EVENT, handleState);
  }, []);

  // Determine active states
  const isHomeActive = pathname === "/";
  const isServicesActive = pathname.startsWith("/services");
  const isDemoActive = pathname === "/request-demo";
  const isPortalActive =
    pathname.startsWith("/portal") ||
    pathname.startsWith("/admin") ||
    pathname === "/login";

  // If on secondary pages (like /training, /about, /pricing, etc.) and not in the main 4, mark More as active
  const isMoreActive =
    isMenuOpen ||
    (!isHomeActive && !isServicesActive && !isDemoActive && !isPortalActive);

  const portalDestination = isAdmin
    ? "/admin/scheduling"
    : isAuthenticated
    ? "/portal"
    : "/portal";

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#081c38]/95 dark:bg-[#040e1f]/95 backdrop-blur-2xl border-t border-white/10 dark:border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.4)] pb-[env(safe-area-inset-bottom,0px)] transition-all duration-300 select-none"
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {/* 1. HOME TAB */}
        <Link
          to="/"
          aria-label="Home"
          className={cn(
            "flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e57804]/50 rounded-xl",
            isHomeActive
              ? "text-[#e57804] dark:text-[#e57804]"
              : "text-slate-400 hover:text-slate-200 dark:text-slate-400 dark:hover:text-slate-200"
          )}
        >
          <Home className="w-5 h-5 transition-transform duration-200" />
          <span className="text-[10px] font-mono tracking-tight mt-1 font-semibold">
            Home
          </span>
          {isHomeActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#e57804] shadow-[0_0_6px_#e57804] mt-0.5" />
          )}
        </Link>

        {/* 2. SERVICES TAB */}
        <Link
          to="/services"
          aria-label="Services"
          className={cn(
            "flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e57804]/50 rounded-xl",
            isServicesActive
              ? "text-[#e57804] dark:text-[#e57804]"
              : "text-slate-400 hover:text-slate-200 dark:text-slate-400 dark:hover:text-slate-200"
          )}
        >
          <Layers className="w-5 h-5 transition-transform duration-200" />
          <span className="text-[10px] font-mono tracking-tight mt-1 font-semibold">
            Services
          </span>
          {isServicesActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#e57804] shadow-[0_0_6px_#e57804] mt-0.5" />
          )}
        </Link>

        {/* 3. CENTER HERO ACTION: REQUEST A DEMO */}
        <Link
          to="/request-demo"
          aria-label="Request a Demo"
          className="flex-1 flex flex-col items-center justify-center min-h-[48px] relative group -mt-4 active:scale-90 transition-transform duration-200 focus:outline-none"
        >
          <div className="relative flex items-center justify-center">
            {/* Glow backing */}
            <div className="absolute -inset-1 rounded-full bg-[#e57804]/30 blur-sm group-hover:bg-[#e57804]/50 transition-colors" />
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-[#d97706] via-[#e57804] to-[#f59e0b] text-white flex items-center justify-center shadow-lg shadow-[#e57804]/40 border-2 border-white/20">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <span
            className={cn(
              "text-[9px] font-mono font-bold tracking-wider mt-1 uppercase",
              isDemoActive ? "text-[#e57804]" : "text-amber-300 group-hover:text-[#e57804]"
            )}
          >
            Demo
          </span>
        </Link>

        {/* 4. CLIENT PORTAL TAB */}
        <Link
          to={portalDestination}
          aria-label={isAdmin ? "Admin Desk" : "Client Portal"}
          className={cn(
            "flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e57804]/50 rounded-xl",
            isPortalActive
              ? "text-[#e57804] dark:text-[#e57804]"
              : "text-slate-400 hover:text-slate-200 dark:text-slate-400 dark:hover:text-slate-200"
          )}
        >
          <Building2 className="w-5 h-5 transition-transform duration-200" />
          <span className="text-[10px] font-mono tracking-tight mt-1 font-semibold truncate max-w-[56px] text-center">
            {isAdmin ? "Desk" : "Portal"}
          </span>
          {isPortalActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#e57804] shadow-[0_0_6px_#e57804] mt-0.5" />
          )}
        </Link>

        {/* 5. MORE (OPENS EXPANDED DRAWER) */}
        <button
          type="button"
          onClick={() => toggleMobileMenu()}
          aria-label={isMenuOpen ? "Close menu" : "More options"}
          aria-expanded={isMenuOpen}
          className={cn(
            "flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e57804]/50 rounded-xl cursor-pointer",
            isMoreActive
              ? "text-[#e57804] dark:text-[#e57804]"
              : "text-slate-400 hover:text-slate-200 dark:text-slate-400 dark:hover:text-slate-200"
          )}
        >
          {isMenuOpen ? (
            <X className="w-5 h-5 transition-transform duration-200" />
          ) : (
            <Menu className="w-5 h-5 transition-transform duration-200" />
          )}
          <span className="text-[10px] font-mono tracking-tight mt-1 font-semibold">
            More
          </span>
          {isMoreActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#e57804] shadow-[0_0_6px_#e57804] mt-0.5" />
          )}
        </button>
      </div>
    </nav>
  );
};
