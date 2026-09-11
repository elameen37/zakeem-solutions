import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "neon";
  size?: "sm" | "md" | "lg";
  href?: string;
  isExternal?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      href,
      isExternal = false,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-base)] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none text-center cursor-pointer";

    const variantStyles = {
      primary:
        "bg-[#e57804] hover:bg-[#cf6a02] text-white shadow-lg shadow-[#e57804]/25 hover:shadow-[#e57804]/40 border border-[#e57804] focus:ring-[#e57804] btn-keep-white",
      secondary:
        "bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200 dark:bg-[#0b1e3b] dark:hover:bg-[#10284d] dark:text-white dark:border-white/10 focus:ring-slate-400 dark:focus:ring-white",
      outline:
        "bg-transparent hover:bg-slate-100 text-slate-800 border-slate-300 hover:border-[#e57804] dark:hover:bg-white/10 dark:text-white dark:border-white/20 dark:hover:border-[#e57804]/60 focus:ring-[#e57804]",
      ghost:
        "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-950 dark:hover:bg-white/5 dark:text-slate-300 dark:hover:text-white border-transparent focus:ring-slate-400",
      neon:
        "bg-[#e57804] hover:bg-[#cf6a02] text-white font-semibold shadow-lg shadow-[#e57804]/20 hover:shadow-[#e57804]/40 border border-[#e57804] focus:ring-[#e57804] btn-keep-white",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5 h-8",
      md: "text-sm px-4 py-2.5 gap-2 h-10",
      lg: "text-base px-6 py-3.5 gap-2.5 h-12"
    };

    const combined = cn(baseStyles, variantStyles[variant], sizeStyles[size], className);

    if (href) {
      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={combined}
          >
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </a>
        );
      }
      return (
        <Link to={href} className={combined}>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </Link>
      );
    }

    return (
      <button ref={ref} className={combined} {...props}>
        {leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";