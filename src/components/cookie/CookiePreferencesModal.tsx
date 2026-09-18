import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { X, ShieldCheck, BarChart3, Check, Lock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  CookieConsentPreferences,
  getStoredConsent,
  saveConsent,
  acceptAllCookies,
  rejectNonEssentialCookies,
} from "@/lib/cookieConsent";
import { cn } from "@/lib/utils";

interface CookiePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreferencesSaved?: (prefs: CookieConsentPreferences) => void;
}

export const CookiePreferencesModal: React.FC<CookiePreferencesModalProps> = ({
  isOpen,
  onClose,
  onPreferencesSaved,
}) => {
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Initialize switch state from stored preferences whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const current = getStoredConsent();
      setAnalyticsEnabled(Boolean(current?.analytics));
    }
  }, [isOpen]);

  // Trap focus and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Auto-focus close button or first action
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSaveCustom = () => {
    const record = saveConsent({
      analytics: analyticsEnabled,
      decision: "customized",
    });
    onPreferencesSaved?.(record);
    onClose();
  };

  const handleAcceptAll = () => {
    const record = acceptAllCookies();
    setAnalyticsEnabled(true);
    onPreferencesSaved?.(record);
    onClose();
  };

  const handleRejectNonEssential = () => {
    const record = rejectNonEssentialCookies();
    setAnalyticsEnabled(false);
    onPreferencesSaved?.(record);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-preferences-title"
        aria-describedby="cookie-preferences-desc"
        className="w-full max-w-2xl bg-white dark:bg-[#06152b] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900 dark:text-white transition-colors duration-200"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e57804]/10 border border-[#e57804]/20 flex items-center justify-center text-[#e57804] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="cookie-preferences-title"
                className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white"
              >
                Privacy & Cookie Preferences
              </h2>
              <p
                id="cookie-preferences-desc"
                className="text-xs text-slate-600 dark:text-slate-400 mt-0.5"
              >
                Configure how Zakeem Solutions stores first-party session and analytics data.
              </p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close privacy preferences dialog"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#e57804]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Category Cards */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          {/* Category 1: Strictly Essential */}
          <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-slate-900 dark:text-white">
                  Strictly Essential Storage
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Check className="w-3 h-3" />
                Always Active
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Essential technologies required for basic security, enterprise authentication sessions,
              CSRF protection, optical font scaling, and theme persistence (<code>zakeem-theme</code>).
              These operate strictly as first-party storage and cannot be disabled.
            </p>
          </div>

          {/* Category 2: Performance & Analytics */}
          <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#e57804]" />
                <span className="font-semibold text-slate-900 dark:text-white">
                  Performance & Usage Telemetry
                </span>
              </div>

              {/* Accessible Custom Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={analyticsEnabled}
                aria-label="Toggle performance and analytics telemetry"
                onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#e57804] focus:ring-offset-2 dark:focus:ring-offset-[#06152b]",
                  analyticsEnabled ? "bg-[#e57804]" : "bg-slate-300 dark:bg-slate-700"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                    analyticsEnabled ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Allows anonymous interaction metrics, feature diagnostic signals, and error telemetry to help
              our engineering team benchmark site speed and responsiveness. No third-party ad networks
              or cross-site advertising identifiers are used.
            </p>
          </div>

          {/* Transparency & Policy Disclosure */}
          <div className="pt-2 px-1 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Enterprise data governance & privacy controls.</span>
            <Link
              to="/privacy"
              onClick={onClose}
              className="inline-flex items-center gap-1 text-[#e57804] hover:underline font-medium"
            >
              Privacy Policy
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRejectNonEssential}
            className="w-full sm:w-auto text-xs"
          >
            Reject Non-Essential
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleSaveCustom}
            className="w-full sm:w-auto text-xs"
          >
            Save Preferences
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleAcceptAll}
            className="w-full sm:w-auto text-xs"
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
};
