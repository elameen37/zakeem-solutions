import React from "react";
import { Smartphone, Download } from "lucide-react";
import { usePWA } from "@/context/PWAContext";
import { cn } from "@/lib/utils";

interface PWAInstallButtonProps {
  variant?: "button" | "link";
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = "link",
  className,
}) => {
  const { canInstall, isInstalled, promptInstall } = usePWA();

  // Gracefully hide if already installed or unsupported
  if (!canInstall || isInstalled) {
    return null;
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={promptInstall}
        className={cn(
          "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-[#e57804]/20 border border-white/15 hover:border-[#e57804]/40 text-xs font-semibold text-white transition-all cursor-pointer min-h-[44px]",
          className
        )}
        aria-label="Install Zakeem Solutions Progressive Web App"
      >
        <Smartphone className="w-4 h-4 text-[#e57804]" />
        <span>Install App</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={promptInstall}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer text-left focus:outline-none focus:underline",
        className
      )}
      aria-label="Install Zakeem Solutions Progressive Web App"
    >
      <Download className="w-3.5 h-3.5 text-[#e57804]" />
      <span>Install App</span>
    </button>
  );
};
