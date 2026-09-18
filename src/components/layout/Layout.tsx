import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { BackToTop } from "@/components/ui/BackToTop";
import { GlobalSearchModal } from "@/components/search/GlobalSearchModal";
import { ZakkyAIChatWidget } from "@/components/zakky/ZakkyAIChatWidget";
import { FontSizeControl } from "@/components/ui/FontSizeControl";
import { CookieConsentBanner } from "@/components/cookie/CookieConsentBanner";
import { useMaintenance } from "@/context/MaintenanceContext";
import { AdminMaintenanceBanner } from "@/components/maintenance/AdminMaintenanceBanner";
import { MaintenancePage } from "@/components/maintenance/MaintenancePage";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const { isMaintenanceActive } = useMaintenance();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  // Intercept all public & client routes when maintenance mode is active
  // Retain /login and /reset-password so administrators can authenticate
  if (isMaintenanceActive && pathname !== "/login" && pathname !== "/reset-password") {
    return <MaintenancePage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] selection:bg-[#e57804] selection:text-white transition-colors duration-200">
      <AdminMaintenanceBanner />
      <Navbar />
      <main className="flex-1 pt-24 md:pt-28">{children}</main>
      <Footer />
      <BackToTop />
      <GlobalSearchModal />
      <ZakkyAIChatWidget />
      <FontSizeControl />
      <CookieConsentBanner />
    </div>
  );
};