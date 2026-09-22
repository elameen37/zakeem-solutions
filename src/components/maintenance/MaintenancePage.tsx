import React from "react";
import { Link } from "react-router-dom";
import { Wrench, Activity } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { useTheme } from "@/context/ThemeContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useMaintenance } from "@/context/MaintenanceContext";
import {
  DEFAULT_MAINTENANCE_TITLE,
  DEFAULT_MAINTENANCE_MESSAGE,
  DEFAULT_MAINTENANCE_SECONDARY,
} from "@/types/maintenance";

export const MaintenancePage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { config } = useMaintenance();

  const title = config.title || DEFAULT_MAINTENANCE_TITLE;
  const message = config.message || DEFAULT_MAINTENANCE_MESSAGE;
  const secondary = config.secondaryMessage || DEFAULT_MAINTENANCE_SECONDARY;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-[#030d1c] text-slate-900 dark:text-white transition-colors duration-300 relative overflow-hidden selection:bg-[#e57804] selection:text-white">
      <SEO
        title={`${title} | Zakeem Solutions`}
        description={message}
        noindex={true}
      />

      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#e57804]/10 dark:bg-[#e57804]/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
        <Link to="/" className="flex items-center group">
          <div className="relative h-9 w-auto flex items-center">
            <img
              src={isDark ? "/assets/logos/logo-white.png" : "/assets/logos/logo-color.png"}
              alt="Zakeem Solutions"
              className="h-8 md:h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Card */}
      <main
        role="main"
        className="flex-1 flex items-center justify-center px-4 py-12"
        aria-live="polite"
      >
        <div className="w-full max-w-xl mx-auto text-center">
          {/* Card Container */}
          <div className="relative rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#06152b]/80 backdrop-blur-xl p-8 sm:p-12 shadow-xl dark:shadow-2xl dark:shadow-black/50">
            {/* Status Pulse Indicator */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 dark:border-amber-400/25 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 text-xs font-mono font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span>PLATFORM STATUS: SCHEDULED MAINTENANCE</span>
            </div>

            {/* Central Visual Icon */}
            <div className="mx-auto mb-8 w-20 h-20 rounded-2xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-slate-100 to-slate-200/50 dark:from-white/5 dark:to-white/10 flex items-center justify-center shadow-inner group">
              <div className="relative flex items-center justify-center">
                <Wrench className="w-8 h-8 text-[#e57804] transition-transform duration-500 group-hover:rotate-12" />
                <Activity className="w-4 h-4 text-amber-500 absolute -bottom-1 -right-1 animate-pulse" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
              {title}
            </h1>

            {/* Primary Description */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-4 max-w-md mx-auto">
              {message}
            </p>

            {/* Restrained Secondary Line */}
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mb-8">
              {secondary}
            </p>

            {/* Tasteful Progress Aesthetic Bar (no fake numbers) */}
            <div className="w-full max-w-xs mx-auto mb-8">
              <div
                className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative"
                aria-label="System maintenance in progress"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="h-full bg-gradient-to-r from-[#e57804] via-amber-400 to-[#e57804] w-1/2 rounded-full animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
              </div>
              <div className="flex justify-between items-center mt-2 px-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>Platform Optimization</span>
                <span className="text-[#e57804] font-semibold">Active</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© {new Date().getFullYear()} Zakeem Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
};
