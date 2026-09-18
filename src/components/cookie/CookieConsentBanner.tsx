import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Sliders, Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  hasUserConsented,
  acceptAllCookies,
  rejectNonEssentialCookies,
  OPEN_COOKIE_PREFERENCES_EVENT,
} from "@/lib/cookieConsent";
import { CookiePreferencesModal } from "./CookiePreferencesModal";

export const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Check consent state on mount
  useEffect(() => {
    // Only display if user has not yet recorded a valid choice
    if (!hasUserConsented()) {
      setShowBanner(true);
    }
  }, []);

  // Listen for global event to reopen preferences modal from Footer or elsewhere
  useEffect(() => {
    const handleOpenModal = () => {
      setIsModalOpen(true);
    };

    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpenModal);
    return () => {
      window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpenModal);
    };
  }, []);

  const handleAcceptAll = () => {
    acceptAllCookies();
    setShowBanner(false);
  };

  const handleRejectNonEssential = () => {
    rejectNonEssentialCookies();
    setShowBanner(false);
  };

  const handleOpenCustomize = () => {
    setIsModalOpen(true);
  };

  const handlePreferencesSaved = () => {
    setShowBanner(false);
  };

  return (
    <>
      {/* Floating Bottom Consent Banner */}
      {showBanner && (
        <div
          role="region"
          aria-label="Cookie and Privacy Consent"
          className="fixed bottom-0 inset-x-0 z-[90] p-4 sm:p-6 pointer-events-none animate-in slide-in-from-bottom-5 duration-300"
        >
          <div className="max-w-4xl mx-auto pointer-events-auto bg-white/95 dark:bg-[#06152b]/95 border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/60 backdrop-blur-md p-5 sm:p-6 text-slate-900 dark:text-white transition-colors duration-200">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              {/* Informational Copy */}
              <div className="flex items-start gap-3.5 max-w-2xl">
                <div className="w-9 h-9 rounded-xl bg-[#e57804]/10 border border-[#e57804]/20 flex items-center justify-center text-[#e57804] shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                    Privacy & First-Party Storage
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Zakeem Solutions utilizes strictly essential cookies for secure authentication and theme
                    persistence, and optional performance telemetry to benchmark platform reliability. We do
                    not run third-party advertising trackers or sell telemetry. Learn more in our{" "}
                    <Link
                      to="/privacy"
                      className="text-[#e57804] hover:underline font-medium focus:outline-none focus:ring-1 focus:ring-[#e57804] rounded"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>

              {/* Action Buttons (Non-coercive, balanced hierarchy) */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleOpenCustomize}
                  className="w-full sm:w-auto text-xs flex items-center justify-center gap-1.5"
                  aria-label="Customize cookie preferences"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#e57804]" />
                  Customize
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleRejectNonEssential}
                  className="w-full sm:w-auto text-xs"
                  aria-label="Reject non-essential cookies"
                >
                  Reject Non-Essential
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleAcceptAll}
                  className="w-full sm:w-auto text-xs"
                  aria-label="Accept all cookies"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Dialog / Panel */}
      <CookiePreferencesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPreferencesSaved={handlePreferencesSaved}
      />
    </>
  );
};
