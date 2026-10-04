import React from "react";
import { Share, PlusSquare, CheckCircle2, X } from "lucide-react";
import { usePWA } from "@/context/PWAContext";
import { Button } from "@/components/ui/Button";

export const PWAInstallModal: React.FC = () => {
  const { showIOSInstallGuide, setShowIOSInstallGuide } = usePWA();

  if (!showIOSInstallGuide) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-install-title"
      className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in"
      onClick={() => setShowIOSInstallGuide(false)}
    >
      <div
        data-surface="dark"
        className="w-full max-w-md rounded-3xl bg-gradient-to-b from-[#081c38] to-[#040e1d] border border-white/20 p-6 sm:p-8 shadow-2xl relative space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setShowIOSInstallGuide(false)}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Close install guide"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e57804]/15 border border-[#e57804]/30 text-[#e57804] text-[11px] font-mono font-semibold">
            Install Web App
          </div>
          <h3 id="ios-install-title" className="text-xl font-bold text-white">
            Add to Home Screen
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Install Zakeem Solutions on your Apple device for fast standalone access, instant loading, and fullscreen enterprise workflows.
          </p>
        </div>

        <div className="space-y-3.5 pt-2">
          <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400 mt-0.5">
              <Share className="w-4 h-4" />
            </div>
            <div className="text-xs leading-relaxed">
              <span className="font-semibold text-white block">1. Tap the Share button</span>
              <span className="text-slate-300">Located at the bottom menu in Safari (the square with an arrow pointing up).</span>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5">
              <PlusSquare className="w-4 h-4" />
            </div>
            <div className="text-xs leading-relaxed">
              <span className="font-semibold text-white block">2. Select Add to Home Screen</span>
              <span className="text-slate-300">Scroll down through the share sheet options and tap "Add to Home Screen".</span>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-xs leading-relaxed">
              <span className="font-semibold text-white block">3. Tap Add</span>
              <span className="text-slate-300">Tap "Add" in the top-right corner to complete installation.</span>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setShowIOSInstallGuide(false)}
            className="w-full min-h-[44px]"
          >
            Got It
          </Button>
        </div>
      </div>
    </div>
  );
};
