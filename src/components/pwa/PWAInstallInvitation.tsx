import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Smartphone, X, Download } from "lucide-react";
import { usePWA } from "@/context/PWAContext";
import { cn } from "@/lib/utils";

/**
 * Checks whether the current path is a protected or authentication-sensitive route
 * where public installation invitations must be strictly suppressed.
 */
function isProtectedPath(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/zakeem-admin3100") ||
    pathname === "/portal" ||
    pathname === "/client-portal" ||
    pathname === "/login" ||
    pathname === "/accept-invite" ||
    pathname === "/accept-invitation" ||
    pathname === "/reset-password"
  );
}

export const PWAInstallInvitation: React.FC = () => {
  const { pathname } = useLocation();
  const {
    canInstall,
    isInstalled,
    isNative,
    isOnline,
    hasUpdate,
    installDismissed,
    dismissInstallInvitation,
    promptInstall,
  } = usePWA();

  const [hasEngaged, setHasEngaged] = useState<boolean>(false);

  // Engagement Trigger: Trigger after 10 seconds OR after meaningful scroll (>300px)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasEngaged || installDismissed || isInstalled || isNative) return;

    // 1. Time-based engagement trigger (10 seconds)
    const timer = setTimeout(() => {
      setHasEngaged(true);
    }, 10000);

    // 2. Interaction-based engagement trigger (meaningful scroll)
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setHasEngaged(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasEngaged, installDismissed, isInstalled, isNative]);

  const handleInstall = useCallback(async () => {
    // Dismiss the prompt view and trigger the native installation dialog
    dismissInstallInvitation();
    await promptInstall();
  }, [dismissInstallInvitation, promptInstall]);

  const handleDismiss = useCallback(() => {
    dismissInstallInvitation();
  }, [dismissInstallInvitation]);

  // Strict Guard Conditions:
  // 1. Browser/Platform must support installation (canInstall)
  // 2. App must not already be installed (!isInstalled)
  // 3. Must not be inside native shell wrapper (!isNative)
  // 4. Must be online (!isOffline)
  // 5. Must not have an active software update toast taking priority (!hasUpdate)
  // 6. Must not have been dismissed recently (!installDismissed)
  // 7. Must not be on private/protected administrative routes (!isProtectedPath)
  // 8. User must have meaningfully engaged with the site (hasEngaged)
  if (
    !canInstall ||
    isInstalled ||
    isNative ||
    !isOnline ||
    hasUpdate ||
    installDismissed ||
    isProtectedPath(pathname) ||
    !hasEngaged
  ) {
    return null;
  }

  return (
    <aside
      role="region"
      aria-label="Application installation invitation"
      className={cn(
        "fixed z-45 transition-all duration-300 animate-slide-up",
        // Mobile layout: clears MobileTabBar (bottom-0 h-16) and BackToTop / ZakkyAI (bottom-20)
        "bottom-36 left-4 right-4",
        // Tablet / Desktop layout: anchors to bottom-right above ZakkyAI (md:bottom-24 md:right-8)
        "sm:left-auto sm:right-6 sm:max-w-sm md:bottom-24 md:right-8"
      )}
    >
      <div
        data-surface="dark"
        className={cn(
          "relative p-4 rounded-2xl shadow-2xl border transition-all duration-200",
          "bg-[#06152b]/95 dark:bg-[#040e1d]/95 backdrop-blur-xl",
          "border-[#e57804]/30 dark:border-white/15",
          "shadow-[0_12px_36px_rgba(0,0,0,0.5)]"
        )}
      >
        {/* Dismiss Button (Accessible touch target >= 44px) */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Dismiss app installation invitation"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Icon and Title */}
        <div className="flex items-start gap-3 pr-8">
          <div className="w-9 h-9 rounded-xl bg-[#e57804]/15 border border-[#e57804]/30 flex items-center justify-center shrink-0 text-[#e57804] mt-0.5">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Install Zakeem Solutions
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mt-1">
              Get faster access to our enterprise platform, IT Training and client services.
            </p>
          </div>
        </div>

        {/* Actions (Both buttons enforce >= 44px touch targets) */}
        <div className="flex items-center gap-2.5 mt-3.5 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={handleInstall}
            className={cn(
              "flex-1 min-h-[44px] px-4 py-2.5 rounded-xl font-medium text-xs text-white",
              "bg-[#e57804] hover:bg-[#cf6a02] active:scale-95",
              "shadow-md shadow-[#e57804]/30 transition-all cursor-pointer",
              "flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#e57804]/50"
            )}
            aria-label="Install Zakeem Solutions App"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className={cn(
              "min-h-[44px] px-3.5 py-2.5 rounded-xl font-medium text-xs text-slate-300",
              "hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer",
              "flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/20"
            )}
            aria-label="Dismiss installation"
          >
            Not now
          </button>
        </div>
      </div>
    </aside>
  );
};
