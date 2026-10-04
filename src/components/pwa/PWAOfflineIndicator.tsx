import React from "react";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";
import { usePWA } from "@/context/PWAContext";
import { cn } from "@/lib/utils";

export const PWAOfflineIndicator: React.FC = () => {
  const { isOnline, isReconnecting, reconnectedRecently, checkConnection } = usePWA();

  if (isOnline && !reconnectedRecently) return null;

  // 1. Connection Restored State (Temporary celebratory banner)
  if (reconnectedRecently) {
    return (
      <aside
        role="status"
        aria-live="polite"
        data-surface="dark"
        className="fixed top-0 left-0 right-0 z-[60] h-11 bg-[#052317]/95 border-b border-emerald-500/40 text-emerald-200 px-3 sm:px-4 md:px-6 text-xs font-mono backdrop-blur-md shadow-lg flex items-center justify-between transition-all duration-300 animate-in fade-in slide-in-from-top-2"
      >
        <div className="container mx-auto max-w-7xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">
              Connection restored — Back online
            </span>
          </div>
          <span className="text-[11px] text-emerald-300/80 hidden sm:inline">
            Live services synchronized
          </span>
        </div>
      </aside>
    );
  }

  // 2. Offline Mode State
  return (
    <aside
      role="alert"
      aria-live="assertive"
      data-surface="dark"
      className="fixed top-0 left-0 right-0 z-[60] h-11 bg-[#081c38]/95 border-b border-amber-500/40 text-amber-200 px-3 sm:px-4 md:px-6 text-xs font-mono backdrop-blur-md shadow-lg flex items-center justify-between transition-all duration-300"
    >
      <div className="container mx-auto max-w-7xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="truncate">
            <span className="hidden md:inline">
              Offline Mode — Browsing cached content. Reconnecting automatically...
            </span>
            <span className="hidden sm:inline md:hidden">
              Offline Mode — Browsing cached pages
            </span>
            <span className="sm:hidden">
              Offline — Cached Mode
            </span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!isReconnecting) {
              checkConnection();
            }
          }}
          disabled={isReconnecting}
          aria-label="Retry network connection"
          className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 active:bg-amber-500/35 transition-colors cursor-pointer shrink-0 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-[#081c38]"
        >
          <RefreshCw className={cn("w-3.5 h-3.5 shrink-0", isReconnecting && "animate-spin")} />
          <span className="text-xs font-semibold">{isReconnecting ? "Checking..." : "Retry"}</span>
        </button>
      </div>
    </aside>
  );
};
