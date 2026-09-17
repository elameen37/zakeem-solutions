import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2, Compass, Layers, Mail, ShieldAlert } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/Button";

export const NotFoundPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Page Not Found | Zakeem Solutions"
        description="The requested route does not exist or has been moved. Explore Zakeem Solutions enterprise platforms, software engineering services, and architecture."
        noindex={true}
      />

      <section className="relative min-h-[75vh] flex items-center justify-center py-20 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#e57804]/10 via-[#e57804]/5 to-transparent rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 max-w-3xl relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e57804]/10 border border-[#e57804]/30 text-[#e57804] text-xs font-mono mb-6">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ERROR 404 // ROUTE_NOT_FOUND</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-950 dark:text-white tracking-tight mb-4">
            System Route Not Located.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
            The endpoint or resource you attempted to access does not exist on this gateway, has been repositioned, or requires elevated authorization.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Button href="/" variant="primary" size="lg" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Return to Homepage
            </Button>
            <Button href="/contact" variant="secondary" size="lg" leftIcon={<Mail className="w-4 h-4" />}>
              Contact Support
            </Button>
          </div>

          {/* Quick Navigation Directory */}
          <div className="pt-8 border-t border-slate-200 dark:border-white/10 text-left">
            <p className="text-xs font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 text-center mb-6">
              Authorized Public Portals
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                to="/products"
                className="p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-[#e57804]/50 bg-slate-50 dark:bg-[#081c38]/60 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-[#e57804]" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-[#e57804] transition-colors">
                    Products Suite
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Explore Zakeem Realty ERP and commercial apps.
                </p>
              </Link>

              <Link
                to="/solutions"
                className="p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-[#e57804]/50 bg-slate-50 dark:bg-[#081c38]/60 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-[#e57804]" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-[#e57804] transition-colors">
                    Industry Solutions
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Sovereign systems, e-legal, and enterprise frameworks.
                </p>
              </Link>

              <Link
                to="/services"
                className="p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-[#e57804]/50 bg-slate-50 dark:bg-[#081c38]/60 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Compass className="w-4 h-4 text-[#e57804]" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-[#e57804] transition-colors">
                    Engineering Services
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Custom software, AI automation, and cloud architecture.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default NotFoundPage;
