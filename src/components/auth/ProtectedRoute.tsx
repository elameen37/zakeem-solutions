import React from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/auth";
import { ShieldAlert, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  // 1. Accessible loading state during authentication resolution
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" aria-live="polite" aria-busy="true">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#e57804]/20 border-t-[#e57804] animate-spin" />
          <span className="text-[11px] font-mono tracking-widest text-slate-500 dark:text-slate-400 uppercase">
            Verifying Credentials...
          </span>
        </div>
      </div>
    );
  }

  // 2. Redirect unauthenticated visitors, routing admin access to /zakeem-admin3100
  if (!isAuthenticated) {
    const redirectTarget = requiredRole === "admin" ? "/zakeem-admin3100" : "/login";
    return <Navigate to={redirectTarget} state={{ from: location }} replace />;
  }

  // 3. Strict Role-Based Access Control
  if (requiredRole && role !== requiredRole) {
    // If a client attempts to access an admin-only route, show an explicit unauthorized screen
    if (requiredRole === "admin" && role === "client") {
      return (
        <section className="pt-20 pb-28 min-h-[70vh] flex items-center justify-center">
          <div className="container mx-auto px-4 max-w-md">
            <div data-surface="dark" className="p-8 rounded-3xl bg-[#081c38] border border-rose-500/30 shadow-2xl space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                <ShieldAlert className="w-7 h-7" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-white">Administrative Access Required</h1>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Your authenticated session is authorized for the <strong>Client Portal</strong>. The requested administrative operations desk requires explicit systems administrator privileges.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <Button variant="primary" size="md" href="/portal" rel="nofollow" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Go to Client Portal
                </Button>
                <Button variant="ghost" size="sm" href="/" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Return to Home
                </Button>
              </div>
            </div>
          </div>
        </section>
      );
    }

    // If an admin accesses a client-intended route, allow or redirect
    if (requiredRole === "client" && role === "admin") {
      // Admins are permitted to view client portal
      return <>{children}</>;
    }
  }

  return <>{children}</>;
};
