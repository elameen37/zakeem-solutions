import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { BackToTop } from "@/components/ui/BackToTop";
import { GlobalSearchModal } from "@/components/search/GlobalSearchModal";
import { ZakkyAIChatWidget } from "@/components/zakky/ZakkyAIChatWidget";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] selection:bg-[#e57804] selection:text-white transition-colors duration-200">
      <Navbar />
      <main className="flex-1 pt-24 md:pt-28">{children}</main>
      <Footer />
      <BackToTop />
      <GlobalSearchModal />
      <ZakkyAIChatWidget />
    </div>
  );
};