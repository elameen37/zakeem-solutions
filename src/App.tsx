import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "@/pages/HomePage";
import { AboutPage } from "@/pages/AboutPage";
import { ProductsIndexPage } from "@/pages/products/ProductsIndexPage";
import { ZakeemRealtyERPPage } from "@/pages/products/ZakeemRealtyERPPage";
import { SolutionsIndexPage } from "@/pages/solutions/SolutionsIndexPage";
import { SolutionDetailPage } from "@/pages/solutions/SolutionDetailPage";
import { ServicesIndexPage } from "@/pages/services/ServicesIndexPage";
import { ServiceDetailPage } from "@/pages/services/ServiceDetailPage";
import { IndustriesPage } from "@/pages/IndustriesPage";
import { InsightsPage } from "@/pages/InsightsPage";
import { CaseStudiesPage } from "@/pages/CaseStudiesPage";
import { CareersPage } from "@/pages/CareersPage";
import { PricingPage } from "@/pages/PricingPage";
import { ContactPage } from "@/pages/ContactPage";
import { RequestDemoPage } from "@/pages/RequestDemoPage";
import { LoginPage } from "@/pages/LoginPage";
import { SupportPage } from "@/pages/SupportPage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { TermsPage } from "@/pages/TermsPage";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
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
          <Route path="/careers" element={<CareersPage />} />
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
      </Layout>
    </BrowserRouter>
  );
};

export default App;
