import React from "react";
import { motion } from "motion/react";
import {
  Building2, BrainCircuit, ShieldCheck, DollarSign, BarChart3,
  Cloud, Workflow, Cpu, Layers, Database,
  Activity, Landmark, Truck, Zap, Sprout,
  Factory, GraduationCap, Coins, Lock, Compass
} from "lucide-react";

interface FloatingIconConfig {
  id: number;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  colorClass: string;
  initialDelay: number;
  duration: number;
  hiddenOnMobile?: boolean;
}

const ICONS_CONFIG: FloatingIconConfig[] = [
  // Left Perimeter (10 Icons)
  {
    id: 1,
    icon: Building2,
    label: "Real Estate ERP",
    top: "8%",
    left: "4%",
    colorClass: "text-[#e57804] border-[#e57804]/30 bg-[#e57804]/10 shadow-[0_0_25px_-5px_rgba(229,120,4,0.35)]",
    initialDelay: 0.2,
    duration: 7.2
  },
  {
    id: 2,
    icon: BrainCircuit,
    label: "Neural AI Models",
    top: "16%",
    left: "17%",
    colorClass: "text-[#efb273] border-[#efb273]/30 bg-[#efb273]/10 shadow-[0_0_25px_-5px_rgba(239,178,115,0.3)]",
    initialDelay: 1.8,
    duration: 7.6,
    hiddenOnMobile: true
  },
  {
    id: 3,
    icon: ShieldCheck,
    label: "Enterprise Security",
    top: "29%",
    left: "6%",
    colorClass: "text-white border-white/25 bg-white/10 shadow-[0_0_25px_-5px_rgba(255,255,255,0.25)]",
    initialDelay: 3.4,
    duration: 7.0
  },
  {
    id: 4,
    icon: DollarSign,
    label: "Financial Settlement",
    top: "40%",
    left: "18%",
    colorClass: "text-amber-400 border-amber-400/30 bg-amber-400/10 shadow-[0_0_25px_-5px_rgba(245,158,11,0.3)]",
    initialDelay: 0.9,
    duration: 7.4,
    hiddenOnMobile: true
  },
  {
    id: 5,
    icon: BarChart3,
    label: "Market Intelligence",
    top: "52%",
    left: "4%",
    colorClass: "text-[#38bdf8] border-[#38bdf8]/30 bg-[#38bdf8]/10 shadow-[0_0_25px_-5px_rgba(56,189,248,0.3)]",
    initialDelay: 2.5,
    duration: 7.8
  },
  {
    id: 6,
    icon: Cloud,
    label: "Sovereign Cloud",
    top: "64%",
    left: "16%",
    colorClass: "text-sky-400 border-sky-400/30 bg-sky-400/10 shadow-[0_0_25px_-5px_rgba(56,189,248,0.25)]",
    initialDelay: 4.1,
    duration: 7.1,
    hiddenOnMobile: true
  },
  {
    id: 7,
    icon: Workflow,
    label: "Autonomous Workflows",
    top: "76%",
    left: "7%",
    colorClass: "text-[#e57804] border-[#e57804]/30 bg-[#e57804]/10 shadow-[0_0_25px_-5px_rgba(229,120,4,0.35)]",
    initialDelay: 1.2,
    duration: 7.5
  },
  {
    id: 8,
    icon: Cpu,
    label: "Core Compute Engine",
    top: "86%",
    left: "19%",
    colorClass: "text-[#efb273] border-[#efb273]/30 bg-[#efb273]/10 shadow-[0_0_25px_-5px_rgba(239,178,115,0.3)]",
    initialDelay: 2.9,
    duration: 7.3,
    hiddenOnMobile: true
  },
  {
    id: 9,
    icon: Layers,
    label: "Full-Stack Platforms",
    top: "24%",
    left: "26%",
    colorClass: "text-white border-white/25 bg-white/10 shadow-[0_0_25px_-5px_rgba(255,255,255,0.25)]",
    initialDelay: 4.8,
    duration: 7.7,
    hiddenOnMobile: true
  },
  {
    id: 10,
    icon: Database,
    label: "Audit-Grade Data",
    top: "68%",
    left: "27%",
    colorClass: "text-amber-400 border-amber-400/30 bg-amber-400/10 shadow-[0_0_25px_-5px_rgba(245,158,11,0.3)]",
    initialDelay: 0.5,
    duration: 7.0,
    hiddenOnMobile: true
  },

  // Right Perimeter (10 Icons)
  {
    id: 11,
    icon: Activity,
    label: "Health Diagnostics",
    top: "7%",
    right: "5%",
    colorClass: "text-[#38bdf8] border-[#38bdf8]/30 bg-[#38bdf8]/10 shadow-[0_0_25px_-5px_rgba(56,189,248,0.3)]",
    initialDelay: 1.4,
    duration: 7.3
  },
  {
    id: 12,
    icon: Landmark,
    label: "GovTech Systems",
    top: "18%",
    right: "17%",
    colorClass: "text-[#e57804] border-[#e57804]/30 bg-[#e57804]/10 shadow-[0_0_25px_-5px_rgba(229,120,4,0.35)]",
    initialDelay: 3.1,
    duration: 7.5,
    hiddenOnMobile: true
  },
  {
    id: 13,
    icon: Truck,
    label: "Supply Chain Logistics",
    top: "28%",
    right: "6%",
    colorClass: "text-[#efb273] border-[#efb273]/30 bg-[#efb273]/10 shadow-[0_0_25px_-5px_rgba(239,178,115,0.3)]",
    initialDelay: 0.7,
    duration: 7.1
  },
  {
    id: 14,
    icon: Zap,
    label: "Energy Grid Operations",
    top: "41%",
    right: "19%",
    colorClass: "text-amber-400 border-amber-400/30 bg-amber-400/10 shadow-[0_0_25px_-5px_rgba(245,158,11,0.3)]",
    initialDelay: 2.2,
    duration: 7.6,
    hiddenOnMobile: true
  },
  {
    id: 15,
    icon: Sprout,
    label: "Agritech Automation",
    top: "53%",
    right: "5%",
    colorClass: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10 shadow-[0_0_25px_-5px_rgba(52,211,153,0.3)]",
    initialDelay: 3.8,
    duration: 7.4
  },
  {
    id: 16,
    icon: Factory,
    label: "Industrial Operations",
    top: "65%",
    right: "16%",
    colorClass: "text-white border-white/25 bg-white/10 shadow-[0_0_25px_-5px_rgba(255,255,255,0.25)]",
    initialDelay: 1.0,
    duration: 7.2,
    hiddenOnMobile: true
  },
  {
    id: 17,
    icon: GraduationCap,
    label: "Education Platforms",
    top: "77%",
    right: "7%",
    colorClass: "text-[#38bdf8] border-[#38bdf8]/30 bg-[#38bdf8]/10 shadow-[0_0_25px_-5px_rgba(56,189,248,0.3)]",
    initialDelay: 2.7,
    duration: 7.7
  },
  {
    id: 18,
    icon: Coins,
    label: "Digital Asset Banking",
    top: "87%",
    right: "19%",
    colorClass: "text-[#e57804] border-[#e57804]/30 bg-[#e57804]/10 shadow-[0_0_25px_-5px_rgba(229,120,4,0.35)]",
    initialDelay: 4.4,
    duration: 7.0,
    hiddenOnMobile: true
  },
  {
    id: 19,
    icon: Lock,
    label: "Vault Data Protection",
    top: "22%",
    right: "27%",
    colorClass: "text-[#efb273] border-[#efb273]/30 bg-[#efb273]/10 shadow-[0_0_25px_-5px_rgba(239,178,115,0.3)]",
    initialDelay: 1.6,
    duration: 7.5,
    hiddenOnMobile: true
  },
  {
    id: 20,
    icon: Compass,
    label: "Digital Transformation",
    top: "69%",
    right: "28%",
    colorClass: "text-white border-white/25 bg-white/10 shadow-[0_0_25px_-5px_rgba(255,255,255,0.25)]",
    initialDelay: 3.3,
    duration: 7.3,
    hiddenOnMobile: true
  }
];

export const HeroFloatingIcons: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
      {ICONS_CONFIG.map((item) => {
        const IconComponent = item.icon;

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{
              // Sequence: Appear (0.8s), Stay visible (2.8s), Disappear (0.8s), Delay pause (3.0s)
              opacity: [0, 0.95, 0.95, 0, 0],
              scale: [0.75, 1, 1.04, 0.75, 0.75],
              y: [10, 0, -6, -12, 10]
            }}
            transition={{
              duration: item.duration,
              times: [0, 0.12, 0.50, 0.60, 1],
              repeat: Infinity,
              delay: item.initialDelay,
              ease: "easeInOut"
            }}
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
              bottom: item.bottom
            }}
            className={`absolute ${item.hiddenOnMobile ? "hidden lg:block" : "block"}`}
          >
            <div
              title={item.label}
              className={`p-3 md:p-3.5 rounded-2xl border backdrop-blur-xl transition-transform ${item.colorClass}`}
            >
              <IconComponent className="w-6 h-6 md:w-7 md:h-7" strokeWidth={2.25} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
