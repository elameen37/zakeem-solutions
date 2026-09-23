import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "pulse" | "shimmer";
}

/**
 * Core Skeleton primitive with responsive shimmer animation.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "shimmer",
  ...props
}) => {
  return (
    <div
      className={cn(
        "rounded-lg bg-slate-800/40 dark:bg-white/[0.06] relative overflow-hidden",
        variant === "pulse" && "animate-pulse bg-white/10",
        variant === "shimmer" &&
          "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.08] before:to-transparent",
        className
      )}
      {...props}
    />
  );
};

/**
 * Full page skeleton for route transitions in Suspense fallbacks.
 * Matches Zakeem Solutions' enterprise dark architectural design system.
 */
export const PageSkeleton: React.FC = () => {
  return (
    <div
      className="min-h-[75vh] container mx-auto px-4 md:px-6 max-w-7xl py-12 space-y-12 animate-fadeIn"
      aria-busy="true"
      aria-label="Loading page content"
    >
      {/* Hero section skeleton */}
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-6 w-36 rounded-full" />
        <Skeleton className="h-12 sm:h-14 w-3/4 rounded-xl" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-5/6 rounded-md" />
        <div className="flex items-center gap-4 pt-4">
          <Skeleton className="h-11 w-40 rounded-xl" />
          <Skeleton className="h-11 w-32 rounded-xl" />
        </div>
      </div>

      {/* Metric / Feature cards grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-[#081c38]/60 border border-white/10 space-y-3 relative overflow-hidden"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-3 w-full rounded-md" />
          </div>
        ))}
      </div>

      {/* Content panel skeleton */}
      <div className="p-6 rounded-2xl bg-[#06152b]/60 border border-white/10 space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <Skeleton className="h-6 w-48 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        <div className="space-y-3 pt-2">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-11/12 rounded-md" />
          <Skeleton className="h-4 w-4/5 rounded-md" />
        </div>
      </div>
    </div>
  );
};

/**
 * Card skeleton for component-level loading queues.
 */
export const CardSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className,
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
        >
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/3 rounded-md" />
            <Skeleton className="h-3 w-1/2 rounded-md" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg ml-4 shrink-0" />
        </div>
      ))}
    </div>
  );
};

/**
 * Table skeleton for tabular data ledgers and audit records.
 */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number; className?: string }> = ({
  rows = 5,
  columns = 4,
  className,
}) => {
  return (
    <div className={cn("w-full space-y-3 p-4 rounded-2xl bg-[#081c38]/60 border border-white/10", className)}>
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-white/10">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 rounded-md" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-2 border-b border-white/5 last:border-b-0">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1 rounded-md" />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Dashboard skeleton for client portal and admin desk views.
 */
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-7 w-28 rounded" />
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-[#081c38]/60 border border-white/10 space-y-4">
        <Skeleton className="h-5 w-40 rounded" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
};
