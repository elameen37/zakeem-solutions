import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MobileTabBar } from "./MobileTabBar";
import { BackToTop } from "@/components/ui/BackToTop";
import { FontSizeControl } from "@/components/ui/FontSizeControl";
import { CookieConsentBanner } from "@/components/cookie/CookieConsentBanner";

const GlobalSearchModal = React.lazy(() =>
  import("@/components/search/GlobalSearchModal").then((m) => ({ default: m.GlobalSearchModal }))
);
const ZakkyAIChatWidget = React.lazy(() =>
  import("@/components/zakky/ZakkyAIChatWidget").then((m) => ({ default: m.ZakkyAIChatWidget }))
);
import { useMaintenance } from "@/context/MaintenanceContext";
import { AdminMaintenanceBanner } from "@/components/maintenance/AdminMaintenanceBanner";
import { MaintenancePage } from "@/components/maintenance/MaintenancePage";
import { PWAUpdateToast } from "@/components/pwa/PWAUpdateToast";
import { PWAOfflineIndicator } from "@/components/pwa/PWAOfflineIndicator";
import { PWAInstallModal } from "@/components/pwa/PWAInstallModal";

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
  // Retain /login, /zakeem-admin3100, and /reset-password so administrators can authenticate
  if (
    isMaintenanceActive &&
    pathname !== "/login" &&
    pathname !== "/zakeem-admin3100" &&
    pathname !== "/reset-password"
  ) {
    return <MaintenancePage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] selection:bg-[#e57804] selection:text-white transition-colors duration-200">
      <PWAOfflineIndicator />
      <AdminMaintenanceBanner />
      <Navbar />
      <main className="flex-1 pt-24 md:pt-28 pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileTabBar />
      <BackToTop />
      <React.Suspense fallback={null}>
        <GlobalSearchModal />
        <ZakkyAIChatWidget />
      </React.Suspense>
      <FontSizeControl />
      <CookieConsentBanner />
      <PWAUpdateToast />
      <PWAInstallModal />
    </div>
  );
};