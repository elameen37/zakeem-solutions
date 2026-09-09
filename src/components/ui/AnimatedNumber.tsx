import React, { useState, useEffect, useRef } from "react";

interface AnimatedNumberProps {
  value: string;
  duration?: number;
  className?: string;
}

interface ParsedMetric {
  prefix: string;
  target: number;
  decimals: number;
  suffix: string;
}

function parseMetric(val: string): ParsedMetric | null {
  const trimmed = val.trim();
  // Matches:
  // Group 1: Non-numeric prefix (e.g. "<", "₦", "$", "~")
  // Group 2: Numeric part including optional decimal (e.g. "99.99", "14", "250")
  // Group 3: Suffix (e.g. "%", "+", "ms", "B+", "x")
  const match = trimmed.match(/^([^0-9.]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
  if (!match) return null;

  const prefix = match[1] || "";
  const target = parseFloat(match[2]);
  if (isNaN(target)) return null;

  const suffix = match[3] || "";
  const decimalPart = match[2].split(".")[1];
  const decimals = decimalPart ? decimalPart.length : 0;

  return { prefix, target, decimals, suffix };
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 2000,
  className
}) => {
  const [displayValue, setDisplayValue] = useState<string>(value);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Respect reduced motion settings
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    const parsed = parseMetric(value);
    if (!parsed) {
      setDisplayValue(value);
      return;
    }

    const { prefix, target, decimals, suffix } = parsed;

    // Set initial state to 0 with appropriate formatting
    setDisplayValue(`${prefix}${(0).toFixed(decimals)}${suffix}`);

    const element = elementRef.current;
    if (!element) return;

    let animationFrameId: number;

    const startAnimation = () => {
      let startTime: number | null = null;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Exponential ease-out curve for natural deceleration
        const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentNumber = target * easedProgress;

        setDisplayValue(`${prefix}${currentNumber.toFixed(decimals)}${suffix}`);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        } else {
          // Guarantee exact match at completion
          setDisplayValue(value);
        }
      };

      animationFrameId = requestAnimationFrame(animate);
    };

    // If IntersectionObserver is not supported, animate immediately
    if (!("IntersectionObserver" in window)) {
      startAnimation();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          startAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value, duration]);

  return (
    <span ref={elementRef} className={className}>
      {displayValue}
    </span>
  );
};
