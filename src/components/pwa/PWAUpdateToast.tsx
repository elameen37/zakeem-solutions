import React from "react";
import { RefreshCw, X, Sparkles } from "lucide-react";
import { usePWA } from "@/context/PWAContext";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export const PWAUpdateToast: React.FC = () => {
  const { hasUpdate, isUpdating, isOnline, updateApp, dismissUpdate } = usePWA();

  // Never render update toast if no update is available or if currently offline
  if (!hasUpdate || !isOnline) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-label="Application update available"
      data-surface="dark"
      className={cn(
        "fixed z-50 p-4 rounded-2xl bg-gradient-to-r from-[#081c38] to-[#0c2850] border border-cyan-500/40 shadow-2xl backdrop-blur-xl animate-fade-in",
        // Responsive floating placement clearing BackToTop & ZakkyAI across all 10 breakpoints
        "bottom-36 sm:bottom-32 md:bottom-24 left-4 right-4 md:left-auto md:right-8 md:w-96"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0 pr-8">
          <h4 className="text-sm font-bold text-white tracking-tight">
            New Version Ready
          </h4>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
            An updated release of Zakeem Solutions is available.
          </p>

          <div className="flex items-center gap-2.5 mt-3">
            <Button
              variant="primary"
              size="sm"
              onClick={updateApp}
              disabled={isUpdating}
              leftIcon={
                <RefreshCw
                  className={cn("w-3.5 h-3.5", isUpdating && "animate-spin")}
                />
              }
              className="text-xs min-h-[44px] py-2 px-3.5 shadow-md shadow-[#e57804]/20"
            >
              {isUpdating ? "Updating..." : "Update Now"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissUpdate}
              disabled={isUpdating}
              className="text-xs min-h-[44px] py-2 px-3 text-slate-300 hover:text-white disabled:opacity-50"
            >
              Later
            </Button>
          </div>
        </div>

        <button
          type="button"
          onClick={dismissUpdate}
          disabled={isUpdating}
          className="absolute top-2.5 right-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-40"
          aria-label="Dismiss update notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
