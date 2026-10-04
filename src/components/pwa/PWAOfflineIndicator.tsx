import React from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { usePWA } from "@/context/PWAContext";

export const PWAOfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      data-surface="dark"
      className="fixed top-0 left-0 right-0 z-[60] bg-[#081c38]/95 border-b border-amber-500/40 text-amber-200 px-4 py-2 text-xs font-mono backdrop-blur-md shadow-lg flex items-center justify-between"
    >
      <div className="container mx-auto max-w-7xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          <span>
            Offline Mode — Browsing cached content. Reconnecting automatically...
          </span>
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span className="hidden sm:inline">Retry</span>
        </button>
      </div>
    </div>
  );
};
