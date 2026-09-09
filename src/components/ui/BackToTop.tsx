import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Calculate scroll progress percentage (0 - 100)
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }

      // Show button after 280px scroll
      setIsVisible(scrollY > 280);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  // SVG Circular progress math
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div
      className={cn(
        "fixed bottom-8 left-1/2 -translate-x-1/2 z-40 transition-all duration-300",
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-6 pointer-events-none"
      )}
    >
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top of page"
        title="Back to top"
        className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-[#06152b]/90 hover:bg-[#091f3d] backdrop-blur-xl border border-white/15 hover:border-[#e57804]/60 shadow-xl shadow-black/50 hover:shadow-[#e57804]/25 transition-all duration-300 active:scale-90 hover:-translate-y-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#e57804] focus:ring-offset-2 focus:ring-offset-[#06152b]"
      >
        {/* Circular Progress Ring */}
        <svg
          className="absolute inset-0 w-12 h-12 -rotate-90 transform pointer-events-none"
          viewBox="0 0 48 48"
        >
          {/* Background Track */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            className="stroke-white/10"
            strokeWidth="2"
            fill="transparent"
          />
          {/* Animated Progress Fill */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            className="stroke-[#e57804] transition-all duration-150 ease-out"
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Arrow Icon */}
        <ArrowUp className="w-4 h-4 text-white group-hover:text-[#e57804] transform group-hover:-translate-y-0.5 transition-all duration-200" />
      </button>
    </div>
  );
};