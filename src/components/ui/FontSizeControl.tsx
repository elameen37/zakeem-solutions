import React, { useState, useEffect } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

const MIN_SCALE = 85;
const MAX_SCALE = 125;
const DEFAULT_SCALE = 85;
const STEP = 5;
const IDLE_DELAY_MS = 3500;

export const FontSizeControl: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [scale, setScale] = useState<number>(DEFAULT_SCALE);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Initialize from localStorage or default
  useEffect(() => {
    try {
      const stored = localStorage.getItem("zakeem-font-size");
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= MIN_SCALE && parsed <= MAX_SCALE) {
          setScale(parsed);
          document.documentElement.style.fontSize = `${parsed}%`;
          return;
        }
      }
      setScale(DEFAULT_SCALE);
      document.documentElement.style.fontSize = `${DEFAULT_SCALE}%`;
    } catch (e) {}
  }, []);

  // Autohide to the right when idle
  useEffect(() => {
    if (isHovered || isFocused || isExpanded) {
      setIsIdle(false);
      return;
    }

    let timer: ReturnType<typeof setTimeout>;

    const handleActivity = () => {
      setIsIdle((prev) => (prev ? false : prev));
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsIdle(true);
      }, IDLE_DELAY_MS);
    };

    timer = setTimeout(() => {
      setIsIdle(true);
    }, IDLE_DELAY_MS);

    const events = ["mousemove", "mousedown", "scroll", "keydown", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));

    return () => {
      clearTimeout(timer);
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
    };
  }, [isHovered, isFocused, isExpanded]);

  const applyScale = (newScale: number) => {
    const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale));
    setScale(clamped);
    document.documentElement.style.fontSize = `${clamped}%`;
    try {
      localStorage.setItem("zakeem-font-size", clamped.toString());
    } catch (e) {}
  };

  const handleIncrease = () => applyScale(scale + STEP);
  const handleDecrease = () => applyScale(scale - STEP);
  const handleReset = () => applyScale(DEFAULT_SCALE);

  return (
    <aside
      aria-label="Global Text Size Control"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsFocused(false);
        }
      }}
      className={cn(
        "fixed right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 select-none print:hidden transition-all duration-300 ease-out",
        "motion-reduce:transition-none",
        "focus-within:translate-x-0 focus-within:opacity-100 focus-within:pointer-events-auto",
        isIdle
          ? "translate-x-[calc(100%+1.5rem)] opacity-0 pointer-events-none"
          : "translate-x-0 opacity-100 pointer-events-auto"
      )}
    >
      <div
        role="region"
        aria-label="Page Font Size Settings"
        className={cn(
          "flex flex-col items-center gap-1.5 p-1.5 rounded-2xl border transition-all duration-300 backdrop-blur-xl shadow-xl",
          isDark
            ? "bg-[#06152b]/90 border-white/15 text-slate-200 shadow-black/60 hover:border-[#e57804]/50"
            : "bg-white/95 border-slate-200 text-slate-700 shadow-slate-300/50 hover:border-[#e57804]/60"
        )}
      >
        {/* Toggle Collapse on Mobile / Small Screens */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "sm:hidden p-1.5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#e57804]",
            isDark ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-900"
          )}
          aria-expanded={isExpanded}
          aria-label="Toggle text size controls"
          title="Toggle text size controls"
        >
          <Type className="w-4 h-4 text-[#e57804]" />
        </button>

        <div className={cn("flex flex-col items-center gap-1.5", !isExpanded && "hidden sm:flex")}>
          {/* Increase Button */}
          <button
            type="button"
            onClick={handleIncrease}
            disabled={scale >= MAX_SCALE}
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#e57804] disabled:opacity-30 disabled:pointer-events-none",
              isDark
                ? "bg-white/5 hover:bg-[#e57804] hover:text-white text-slate-200"
                : "bg-slate-100 hover:bg-[#e57804] hover:text-white text-slate-800"
            )}
            aria-label="Increase text size"
            title="Increase font size (A+)"
          >
            <span className="text-xs font-bold font-mono">A+</span>
          </button>

          {/* Vertical Slider Bar */}
          <div className="py-1 flex flex-col items-center gap-1">
            <input
              type="range"
              min={MIN_SCALE}
              max={MAX_SCALE}
              step={STEP}
              value={scale}
              onChange={(e) => applyScale(parseInt(e.target.value, 10))}
              aria-label="Adjust font size slider"
              aria-valuenow={scale}
              aria-valuemin={MIN_SCALE}
              aria-valuemax={MAX_SCALE}
              aria-valuetext={`${scale}% text size`}
              className="h-20 w-1.5 appearance-none bg-slate-300 dark:bg-white/20 rounded-full cursor-pointer accent-[#e57804] [writing-mode:vertical-lr] [direction:rtl]"
              style={{
                WebkitAppearance: "slider-vertical",
              }}
            />
            <span
              className={cn(
                "text-[10px] font-mono font-semibold",
                scale !== DEFAULT_SCALE ? "text-[#e57804]" : "text-slate-400"
              )}
            >
              {scale}%
            </span>
          </div>

          {/* Decrease Button */}
          <button
            type="button"
            onClick={handleDecrease}
            disabled={scale <= MIN_SCALE}
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#e57804] disabled:opacity-30 disabled:pointer-events-none",
              isDark
                ? "bg-white/5 hover:bg-[#e57804] hover:text-white text-slate-200"
                : "bg-slate-100 hover:bg-[#e57804] hover:text-white text-slate-800"
            )}
            aria-label="Decrease text size"
            title="Decrease font size (A-)"
          >
            <span className="text-xs font-bold font-mono">A-</span>
          </button>

          {/* Reset Button (only shown when non-default) */}
          {scale !== DEFAULT_SCALE && (
            <button
              type="button"
              onClick={handleReset}
              className={cn(
                "p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#e57804]",
                isDark ? "hover:bg-white/10 text-slate-300 hover:text-white" : "hover:bg-slate-100 text-slate-600 hover:text-slate-950"
              )}
              aria-label={`Reset font size to default ${DEFAULT_SCALE}%`}
              title={`Reset font size to default (${DEFAULT_SCALE}%)`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
