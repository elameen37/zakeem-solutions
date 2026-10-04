import React from "react";
import { RefreshCw, X, Sparkles } from "lucide-react";
import { usePWA } from "@/context/PWAContext";
import { Button } from "@/components/ui/Button";

export const PWAUpdateToast: React.FC = () => {
  const { hasUpdate, updateApp, dismissUpdate } = usePWA();

  if (!hasUpdate) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-label="Application update available"
      data-surface="dark"
      className="fixed z-50 bottom-24 md:bottom-6 right-4 left-4 md:left-auto md:w-96 p-4 rounded-2xl bg-gradient-to-r from-[#081c38] to-[#0c2850] border border-cyan-500/40 shadow-2xl backdrop-blur-xl animate-fade-in"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0 pr-6">
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
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="text-xs min-h-[36px] py-1 px-3 shadow-md shadow-[#e57804]/20"
            >
              Update Now
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissUpdate}
              className="text-xs min-h-[36px] py-1 px-2.5 text-slate-300 hover:text-white"
            >
              Later
            </Button>
          </div>
        </div>

        <button
          type="button"
          onClick={dismissUpdate}
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Dismiss update notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
