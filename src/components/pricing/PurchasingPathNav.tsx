import React from "react";
import { Package, Layers, Sparkles, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

export type CommercialPath = "standalone" | "suite" | "complete" | "services";

interface PurchasingPathNavProps {
  activePath: CommercialPath;
  onChange: (path: CommercialPath) => void;
}

export const PurchasingPathNav: React.FC<PurchasingPathNavProps> = ({
  activePath,
  onChange,
}) => {
  const paths: { id: CommercialPath; label: string; sub: string; icon: React.ComponentType<{ className?: string }> }[] = [
    {
      id: "standalone",
      label: "Standalone Products",
      sub: "Choose specific tools",
      icon: Package,
    },
    {
      id: "suite",
      label: "Zakeem Business Suite",
      sub: "Multi-solution bundle",
      icon: Layers,
    },
    {
      id: "complete",
      label: "Zakeem Complete",
      sub: "All-in-one platform",
      icon: Sparkles,
    },
    {
      id: "services",
      label: "Engineering Retainers",
      sub: "Bespoke pods & audits",
      icon: Cpu,
    },
  ];

  return (
    <div className="w-full flex justify-center">
      <div 
        role="tablist"
        aria-label="Commercial engagement model"
        className="grid grid-cols-2 md:grid-cols-4 p-1.5 rounded-2xl bg-[#081c38] border border-white/15 shadow-2xl max-w-4xl w-full gap-1.5"
      >
        {paths.map((p) => {
          const Icon = p.icon;
          const isActive = activePath === p.id;

          return (
            <button
              key={p.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(p.id)}
              className={cn(
                "p-3 rounded-xl transition-all duration-200 cursor-pointer flex flex-col items-center text-center gap-1 focus:outline-none focus:ring-2 focus:ring-[#e57804]",
                isActive
                  ? "bg-[#e57804] text-slate-950 shadow-md shadow-[#e57804]/25 font-bold"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-1.5">
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-slate-950" : "text-[#e57804]")} />
                <span className="text-xs sm:text-sm tracking-tight">{p.label}</span>
              </div>
              <span className={cn("text-[10px] hidden sm:block", isActive ? "text-slate-900 font-medium" : "text-slate-400 font-mono")}>
                {p.sub}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
