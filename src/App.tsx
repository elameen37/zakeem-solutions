import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "@/pages/HomePage";

import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Lazy-loaded non-critical route pages for optimized initial payload
const AboutPage = React.lazy(() => import("@/pages/AboutPage").then((m) => ({ default: m.AboutPage })));
const ProductsIndexPage = React.lazy(() => import("@/pages/products/ProductsIndexPage").then((m) => ({ default: m.ProductsIndexPage })));
const ZakeemRealtyERPPage = React.lazy(() => import("@/pages/products/ZakeemRealtyERPPage").then((m) => ({ default: m.ZakeemRealtyERPPage })));
const ProductDetailPage = React.lazy(() => import("@/pages/products/ProductDetailPage").then((m) => ({ default: m.ProductDetailPage })));
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
const AcceptInvitationPage = React.lazy(() => import("@/pages/auth/AcceptInvitationPage").then((m) => ({ default: m.AcceptInvitationPage })));
const ResetPasswordPage = React.lazy(() => import("@/pages/auth/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage })));
const ClientPortalPage = React.lazy(() => import("@/pages/portal/ClientPortalPage").then((m) => ({ default: m.ClientPortalPage })));
const SupportPage = React.lazy(() => import("@/pages/SupportPage").then((m) => ({ default: m.SupportPage })));
const PrivacyPage = React.lazy(() => import("@/pages/PrivacyPage").then((m) => ({ default: m.PrivacyPage })));
const TermsPage = React.lazy(() => import("@/pages/TermsPage").then((m) => ({ default: m.TermsPage })));
const AdminSchedulingPage = React.lazy(() => import("@/pages/admin/AdminSchedulingPage").then((m) => ({ default: m.AdminSchedulingPage })));
const AdminOperationsPage = React.lazy(() => import("@/pages/admin/AdminOperationsPage").then((m) => ({ default: m.default || m.AdminOperationsPage })));
const AdminLeadsPage = React.lazy(() => import("@/pages/admin/AdminLeadsPage").then((m) => ({ default: m.default || m.AdminLeadsPage })));
const AdminPipelinePage = React.lazy(() => import("@/pages/admin/AdminPipelinePage").then((m) => ({ default: m.default || m.AdminPipelinePage })));
const AdminOrganizationsPage = React.lazy(() => import("@/pages/admin/AdminOrganizationsPage").then((m) => ({ default: m.default || m.AdminOrganizationsPage })));
const AdminContactsPage = React.lazy(() => import("@/pages/admin/AdminContactsPage").then((m) => ({ default: m.default || m.AdminContactsPage })));
const AdminReportsPage = React.lazy(() => import("@/pages/admin/AdminReportsPage").then((m) => ({ default: m.default || m.AdminReportsPage })));
const NotFoundPage = React.lazy(() => import("@/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })));

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
      <AuthProvider>
        <Layout>
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />

              {/* Products */}
              <Route path="/products" element={<ProductsIndexPage />} />
              <Route path="/products/zakeem-realty-erp" element={<ZakeemRealtyERPPage />} />
              <Route path="/products/:slug" element={<ProductDetailPage />} />

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
              <Route path="/accept-invite" element={<AcceptInvitationPage />} />
              <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route
                path="/portal"
                element={
                  <ProtectedRoute requiredRole="client">
                    <ClientPortalPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* Internal Admin Operations */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Navigate to="/admin/crm/leads" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/invitations"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Navigate to="/admin/scheduling?tab=invitations" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/crm/operations"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminOperationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/operations"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminOperationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/crm/leads"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminLeadsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/crm/pipeline"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPipelinePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/crm/organizations"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminOrganizationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/crm/contacts"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminContactsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/crm/reports"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/scheduling"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminSchedulingPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback 404 route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
