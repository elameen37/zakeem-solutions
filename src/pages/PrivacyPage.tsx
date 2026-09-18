import React from "react";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/Button";
import { openCookiePreferences } from "@/lib/cookieConsent";
import { ShieldCheck, Sliders } from "lucide-react";

export const PrivacyPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Privacy Policy | Zakeem Solutions"
        description="Review the Zakeem Solutions enterprise privacy policy and data governance practices."
        canonical="https://www.zakeemsolutions.com/privacy"
      />
      <section className="py-20 container mx-auto px-4 md:px-6 max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white mb-6">Privacy Policy</h1>
        <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Effective Date: September 2026. Zakeem Solutions is committed to protecting the privacy and
            security of enterprise client data, adhering to strict corporate data protection standards and
            transparent governance practices.
          </p>
          <p>
            We do not sell customer or corporate telemetry data. All enterprise data processed through
            Zakeem Realty ERP and related platforms remains strictly under the cryptographic control of
            the subscribing institution.
          </p>

          {/* Cookie & Local Storage Preferences Section */}
          <div className="p-6 rounded-2xl bg-slate-100/70 dark:bg-[#06152b] border border-slate-200 dark:border-white/10 space-y-4 my-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#e57804]/10 border border-[#e57804]/20 flex items-center justify-center text-[#e57804]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Cookie & Local Storage Preferences
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage first-party essential cookies and optional performance telemetry settings.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              We distinguish between strictly essential storage (required for authentication, theme
              persistence, accessibility, and CSRF defense) and optional performance analytics used to
              monitor platform reliability. You may review and update your consent preferences at any time.
            </p>

            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openCookiePreferences}
                className="inline-flex items-center gap-2 text-xs"
                aria-label="Open cookie preferences dialog"
              >
                <Sliders className="w-3.5 h-3.5 text-[#e57804]" />
                Manage Cookie Preferences
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
