import React from "react";
import { SEO } from "@/components/seo/SEO";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminMaintenanceControl } from "@/components/admin/AdminMaintenanceControl";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Shield, Database, Lock, Server, Globe } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export const AdminSettingsPage: React.FC = () => {
  const isDbConfigured = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030d1c] py-8 px-4 sm:px-6 lg:px-8">
      <SEO title="Platform Settings | Zakeem Solutions Admin" noindex={true} />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation */}
        <AdminNav activeDesk="settings" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#e57804]/10 border border-[#e57804]/20 text-[#e57804]">
                <Shield className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono uppercase tracking-widest text-[#e57804] font-semibold">
                Platform Administration
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              System Settings & Controls
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure global platform availability, operational parameters, and view enterprise infrastructure telemetry.
            </p>
          </div>
        </div>

        {/* Global Maintenance Mode Control */}
        <AdminMaintenanceControl />

        {/* System & Infrastructure Posture */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Database Status */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#06152b]/70 backdrop-blur-md p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                <Database className="w-4 h-4 text-blue-500" />
                <span>Supabase Database</span>
              </div>
              <Badge
                variant="outline"
                className={isDbConfigured ? "border-emerald-500/30 text-emerald-500" : "border-amber-500/30 text-amber-500"}
              >
                {isDbConfigured ? "Connected" : "Local Mock"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enterprise PostgreSQL instance hosted on dedicated cluster. Schema migrations and RLS policies enforced.
            </p>
          </div>

          {/* Card 2: Security & RBAC */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#06152b]/70 backdrop-blur-md p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                <Lock className="w-4 h-4 text-[#e57804]" />
                <span>Admin Authorization</span>
              </div>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-500">
                Strict (app_metadata)
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Admin privileges verified via server-side database profiles and signed JWT claims. Zero client elevation allowed.
            </p>
          </div>

          {/* Card 3: Public Edge */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#06152b]/70 backdrop-blur-md p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                <Globe className="w-4 h-4 text-purple-500" />
                <span>Edge & CDN Gateway</span>
              </div>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-500">
                Operational
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Global TLS termination, edge caching, and asset acceleration with automated HTTP/2 support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
