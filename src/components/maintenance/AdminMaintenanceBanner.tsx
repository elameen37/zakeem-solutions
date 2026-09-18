import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Settings, ArrowRight } from "lucide-react";
import { useMaintenance } from "@/context/MaintenanceContext";

export const AdminMaintenanceBanner: React.FC = () => {
  const { isAdminBypassed } = useMaintenance();

  if (!isAdminBypassed) {
    return null;
  }

  return (
    <div
      role="status"
      aria-label="Admin Maintenance Mode Alert"
      className="bg-gradient-to-r from-amber-600 via-amber-500 to-[#e57804] text-white text-xs font-mono font-medium py-2 px-4 shadow-md sticky top-0 z-[60] flex items-center justify-between gap-3 flex-wrap"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
        <span className="font-semibold uppercase tracking-wider">
          Maintenance Mode Active:
        </span>
        <span className="opacity-95 hidden sm:inline">
          Public visitors and client accounts are currently presented with the maintenance screen.
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Link
          to="/admin/settings"
          className="inline-flex items-center gap-1 bg-black/20 hover:bg-black/30 text-white px-2.5 py-1 rounded-md transition-colors text-[11px]"
        >
          <Settings className="w-3 h-3" />
          <span>Platform Settings</span>
          <ArrowRight className="w-3 h-3 ml-0.5" />
        </Link>
      </div>
    </div>
  );
};
