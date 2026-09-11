import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "@/pages/HomePage";

// Lazy-loaded non-critical route pages for optimized initial payload
const AboutPage = React.lazy(() => import("@/pages/AboutPage").then((m) => ({ default: m.AboutPage })));
const ProductsIndexPage = React.lazy(() => import("@/pages/products/ProductsIndexPage").then((m) => ({ default: m.ProductsIndexPage })));
const ZakeemRealtyERPPage = React.lazy(() => import("@/pages/products/ZakeemRealtyERPPage").then((m) => ({ default: m.ZakeemRealtyERPPage })));
const SolutionsIndexPage = React.lazy(() => import("@/pages/solutions/SolutionsIndexPage").then((m) => ({ default: m.SolutionsIndexPage })));
const SolutionDetailPage = React.lazy(() => import("@/pages/solutions/SolutionDetailPage").then((m) => ({ default: m.SolutionDetailPage })));
const ServicesIndexPage = React.lazy(() => import("@/pages/services/ServicesIndexPage").then((m) => ({ default: m.ServicesIndexPage })));
const ServiceDetailPage = React.lazy(() => import("@/pages/services/ServiceDetailPage").then((m) => ({ default: m.ServiceDetailPage })));
const IndustriesPage = React.lazy(() => import("@/pages/IndustriesPage").then((m) => ({ default: m.IndustriesPage })));
const InsightsPage = React.lazy(() => import("@/pages/InsightsPage").then((m) => ({ default: m.InsightsPage })));
const CaseStudiesPage = React.lazy(() => import("@/pages/CaseStudiesPage").then((m) => ({ default: m.CaseStudiesPage })));
const CareersPage = React.lazy(() => import("@/pages/CareersPage").then((m) => ({ default: m.CareersPage })));
const PricingPage = React.lazy(() => import("@/pages/PricingPage").then((m) => ({ default: m.PricingPage })));
const ContactPage = React.lazy(() => import("@/pages/ContactPage").then((m) => ({ default: m.ContactPage })));
const RequestDemoPage = React.lazy(() => import("@/pages/RequestDemoPage").then((m) => ({ default: m.RequestDemoPage })));
const LoginPage = React.lazy(() => import("@/pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const SupportPage = React.lazy(() => import("@/pages/SupportPage").then((m) => ({ default: m.SupportPage })));
const PrivacyPage = React.lazy(() => import("@/pages/PrivacyPage").then((m) => ({ default: m.PrivacyPage })));
const TermsPage = React.lazy(() => import("@/pages/TermsPage").then((m) => ({ default: m.TermsPage })));

// Minimal on-brand loading fallback for seamless route transitions
const RouteLoadingFallback: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center" aria-live="polite" aria-busy="true">
    <div className="flex flex-col items-center gap-3">
      <div className="w-7 h-7 rounded-full border-2 border-[#e57804]/20 border-t-[#e57804] animate-spin" />
      <span className="text-[11px] font-mono tracking-widest text-slate-500 dark:text-slate-400 uppercase">
        Loading...
      </span>
    </div>
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />

            {/* Products */}
            <Route path="/products" element={<ProductsIndexPage />} />
            <Route path="/products/zakeem-realty-erp" element={<ZakeemRealtyERPPage />} />
            <Route path="/products/:slug" element={<ProductsIndexPage />} />

            {/* Solutions */}
            <Route path="/solutions" element={<SolutionsIndexPage />} />
            <Route path="/solutions/:slug" element={<SolutionDetailPage />} />

            {/* Services */}
            <Route path="/services" element={<ServicesIndexPage />} />
            <Route path="/services/:slug" element={<ServiceDetailPage />} />

            {/* Additional core routes */}
            <Route path="/industries" element={<IndustriesPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/case-studies" element={<CaseStudiesPage />} />
            
            {/* Careers */}
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/careers/:slug" element={<CareersPage />} />

            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/request-demo" element={<RequestDemoPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* Fallback 404 route */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
