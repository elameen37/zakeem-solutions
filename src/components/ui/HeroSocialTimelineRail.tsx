import React from "react";
import { Linkedin, Facebook, Instagram, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialNode {
  platform: string;
  handle: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  ariaLabel: string;
}

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    className={cn("fill-current", className)}
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TikTokIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    className={cn("fill-current", className)}
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.33a6.33 6.33 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.71a8.18 8.18 0 0 0 4.78 1.52v-3.4a4.85 4.85 0 0 1-1-.14z" />
  </svg>
);

const HERO_SOCIAL_ACCOUNTS: SocialNode[] = [
  {
    platform: "LinkedIn",
    handle: "zakeemsolutions",
    url: "https://linkedin.com/company/zakeemsolutions",
    icon: Linkedin,
    ariaLabel: "Connect with Zakeem Solutions on LinkedIn (zakeemsolutions)",
  },
  {
    platform: "X",
    handle: "zakeemsolutions",
    url: "https://x.com/zakeemsolutions",
    icon: XIcon,
    ariaLabel: "Follow Zakeem Solutions on X (zakeemsolutions)",
  },
  {
    platform: "Instagram",
    handle: "zakeemsolutions",
    url: "https://instagram.com/zakeemsolutions",
    icon: Instagram,
    ariaLabel: "Follow Zakeem Solutions on Instagram (zakeemsolutions)",
  },
  {
    platform: "Facebook",
    handle: "zakeemsolutions",
    url: "https://facebook.com/zakeemsolutions",
    icon: Facebook,
    ariaLabel: "Follow Zakeem Solutions on Facebook (zakeemsolutions)",
  },
  {
    platform: "TikTok",
    handle: "zakeem_solutions",
    url: "https://tiktok.com/@zakeem_solutions",
    icon: TikTokIcon,
    ariaLabel: "Follow Zakeem Solutions on TikTok (zakeem_solutions)",
  },
  {
    platform: "YouTube",
    handle: "zakeemsolutions",
    url: "https://youtube.com/@zakeemsolutions",
    icon: Youtube,
    ariaLabel: "Subscribe to Zakeem Solutions on YouTube (zakeemsolutions)",
  },
];

export const HeroSocialTimelineRail: React.FC = () => {
  return (
    <aside
      aria-label="Official Social Profiles"
      className="hidden md:flex flex-col items-center absolute left-3 md:left-5 lg:left-8 top-1/2 -translate-y-1/2 z-20 pointer-events-auto select-none"
    >
      {/* Top Architectural Telemetry Label */}
      <div className="flex flex-col items-center mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-[#e57804] animate-pulse mb-2 shadow-[0_0_8px_rgba(229,120,4,0.6)]" />
        <span className="text-[9px] font-mono tracking-widest uppercase text-slate-400 dark:text-slate-500 [writing-mode:vertical-lr] rotate-180 font-medium">
          Official
        </span>
      </div>

      {/* Timeline Container with Continuous Connecting Line */}
      <div className="relative flex flex-col items-center py-1">
        {/* Subtle Vertical Timeline Line */}
        <div
          aria-hidden="true"
          className="absolute top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-slate-300 dark:via-white/15 to-transparent pointer-events-none"
        />

        {/* Milestone Nodes */}
        <div className="flex flex-col items-center space-y-4 relative z-10">
          {HERO_SOCIAL_ACCOUNTS.map((account) => {
            const IconComponent = account.icon;

            return (
              <div key={account.platform} className="relative group flex items-center">
                <a
                  href={account.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={account.ariaLabel}
                  className={cn(
                    "relative flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-xl border transition-all duration-200 backdrop-blur-xl cursor-pointer",
                    "focus:outline-none focus:ring-2 focus:ring-[#e57804] focus:ring-offset-2 focus:ring-offset-[var(--bg-base)]",
                    // Theme Styles
                    "bg-white/80 dark:bg-[#06152b]/85",
                    "border-slate-200/90 dark:border-white/15",
                    "text-slate-600 dark:text-slate-300",
                    // Hover & Motion
                    "hover:text-slate-950 dark:hover:text-white",
                    "hover:border-[#e57804] dark:hover:border-[#e57804]",
                    "hover:bg-slate-50 dark:hover:bg-[#091f3d]",
                    "hover:scale-110 hover:shadow-md hover:shadow-[#e57804]/20",
                    "motion-reduce:transition-none motion-reduce:hover:scale-100"
                  )}
                >
                  <IconComponent className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </a>

                {/* Refined Floating Tooltip on Hover */}
                <div
                  role="tooltip"
                  className={cn(
                    "absolute left-full ml-3 px-2.5 py-1 rounded-lg border text-[11px] font-mono whitespace-nowrap pointer-events-none z-50",
                    "opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200",
                    "shadow-lg backdrop-blur-xl",
                    "bg-slate-900 text-white border-slate-700 shadow-slate-900/40",
                    "dark:bg-[#081c38] dark:text-white dark:border-white/15 dark:shadow-black/60",
                    "motion-reduce:transition-none motion-reduce:translate-x-0"
                  )}
                >
                  <span className="font-semibold text-[#e57804] mr-1.5">{account.platform}</span>
                  <span className="text-slate-300 dark:text-slate-300">
                    {account.platform === "TikTok" ? `@${account.handle}` : `@${account.handle}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Milestone Anchor Indicator */}
      <div className="flex flex-col items-center mt-3">
        <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600" />
      </div>
    </aside>
  );
};

export const HeroSocialMobileRow: React.FC = () => {
  return (
    <div
      aria-label="Official Social Profiles"
      className="flex md:hidden flex-col items-center justify-center mt-10 pt-6 border-t border-slate-200/60 dark:border-white/10 w-full"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-[#e57804] animate-pulse shadow-[0_0_6px_rgba(229,120,4,0.6)]" />
        <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 dark:text-slate-400 font-semibold">
          Official Channels
        </span>
      </div>

      <div className="relative flex items-center justify-center px-2 py-1">
        {/* Subtle Horizontal Timeline Connecting Line */}
        <div
          aria-hidden="true"
          className="absolute left-3 right-3 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-white/15 to-transparent pointer-events-none"
        />

        {/* Social Nodes */}
        <div className="flex items-center gap-3 relative z-10">
          {HERO_SOCIAL_ACCOUNTS.map((account) => {
            const IconComponent = account.icon;

            return (
              <a
                key={account.platform}
                href={account.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={account.ariaLabel}
                className={cn(
                  "relative flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-200 backdrop-blur-xl",
                  "focus:outline-none focus:ring-2 focus:ring-[#e57804] focus:ring-offset-2 focus:ring-offset-[var(--bg-base)]",
                  // Theme Styles
                  "bg-white/90 dark:bg-[#06152b]/90",
                  "border-slate-200 dark:border-white/15",
                  "text-slate-700 dark:text-slate-300",
                  // Active/Hover
                  "active:scale-95 hover:border-[#e57804] dark:hover:border-[#e57804]",
                  "hover:text-[#e57804] dark:hover:text-white"
                )}
              >
                <IconComponent className="w-4 h-4" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};
