import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "navbar" | "mobile" | "compact";
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  variant = "navbar",
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  if (variant === "mobile") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={cn(
          "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all duration-200 text-xs font-medium",
          isDark
            ? "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:text-white"
            : "bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200 hover:text-slate-950",
          className
        )}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span className="flex items-center gap-2">
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
          <span>Theme Mode</span>
        </span>
        <span
          className={cn(
            "text-[10px] font-mono px-2 py-0.5 rounded-full border",
            isDark
              ? "bg-[#e57804]/15 text-[#e57804] border-[#e57804]/30"
              : "bg-slate-200 text-slate-700 border-slate-300"
          )}
        >
          {isDark ? "Dark" : "Light"}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "relative p-2 rounded-lg border transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-[#e57804]",
        isDark
          ? "text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border-white/10"
          : "text-slate-600 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border-slate-200 shadow-sm",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {/* Sun Icon (shown in dark mode to prompt switching to light) */}
        <Sun
          className={cn(
            "w-4 h-4 transition-all duration-300 text-amber-400 transform",
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0 absolute"
          )}
        />
        {/* Moon Icon (shown in light mode to prompt switching to dark) */}
        <Moon
          className={cn(
            "w-4 h-4 transition-all duration-300 text-slate-700 transform",
            !isDark
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0 absolute"
          )}
        />
      </div>
    </button>
  );
};
