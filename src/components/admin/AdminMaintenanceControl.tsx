import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Power,
  X,
  FileText,
  Lock,
} from "lucide-react";
import { useMaintenance } from "@/context/MaintenanceContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  DEFAULT_MAINTENANCE_TITLE,
  DEFAULT_MAINTENANCE_MESSAGE,
} from "@/types/maintenance";

export const AdminMaintenanceControl: React.FC = () => {
  const { config, isLoading, updateStatus, refreshStatus } = useMaintenance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetState, setTargetState] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState(config.title || DEFAULT_MAINTENANCE_TITLE);
  const [customMessage, setCustomMessage] = useState(config.message || DEFAULT_MAINTENANCE_MESSAGE);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleOpenConfirmation = (enable: boolean) => {
    setTargetState(enable);
    setCustomTitle(config.title || DEFAULT_MAINTENANCE_TITLE);
    setCustomMessage(config.message || DEFAULT_MAINTENANCE_MESSAGE);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleConfirmAction = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await updateStatus(targetState, customTitle, customMessage);

    setIsSaving(false);
    if (result.success) {
      setIsModalOpen(false);
      setSuccessMessage(
        targetState
          ? "Maintenance Mode successfully ACTIVATED. Public visitors now see the maintenance screen."
          : "Maintenance Mode successfully DEACTIVATED. Full public access restored."
      );
      setTimeout(() => setSuccessMessage(null), 6000);
    } else {
      setErrorMessage(result.error || "Failed to update maintenance mode setting.");
    }
  };

  const formatTimestamp = (iso?: string) => {
    if (!iso) return "Not available";
    try {
      const d = new Date(iso);
      return d.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#06152b]/70 backdrop-blur-md p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-200/70 dark:border-white/10 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center border",
              config.enabled
                ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
            )}
          >
            {config.enabled ? (
              <ShieldAlert className="w-5 h-5" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Global Maintenance Mode
              </h3>
              <Badge
                variant={config.enabled ? "outline" : "outline"}
                className={cn(
                  "font-mono text-[10px] uppercase font-bold",
                  config.enabled
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                )}
              >
                {config.enabled ? "ACTIVE (SYSTEM RESTRICTED)" : "INACTIVE (PUBLIC LIVE)"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Control public access to Zakeem Solutions during scheduled infrastructure upgrades.
            </p>
          </div>
        </div>

        {/* Refresh button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshStatus()}
            disabled={isLoading}
            className="p-2 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-colors"
            title="Refresh current database state"
            aria-label="Refresh maintenance status"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="mt-4 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Body: State Summary & Switch */}
      <div className="py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Operational Overview
          </div>
          <div className="p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Current Status:</span>
              <span
                className={cn(
                  "font-semibold font-mono",
                  config.enabled ? "text-amber-500" : "text-emerald-500"
                )}
              >
                {config.enabled ? "Maintenance Active" : "Operational / Public Live"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Last Updated:</span>
              </span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {formatTimestamp(config.updatedAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Updated By:</span>
              </span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {config.updatedByName || (config.updatedBy ? "Administrator" : "Initial Seed")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Portal:</span>
              </span>
              <span className="font-mono text-emerald-500 font-medium">
                Always Accessible (Bypassed)
              </span>
            </div>
          </div>
        </div>

        {/* Action Toggle Panel */}
        <div className="space-y-3 flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Control Action
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {config.enabled
                ? "Disabling maintenance mode will restore normal public access to all website visitors immediately."
                : "Activating maintenance mode will immediately route all public visitors and client accounts to the Scheduled Maintenance screen."}
            </p>
          </div>

          <div className="pt-3">
            {config.enabled ? (
              <Button
                variant="outline"
                onClick={() => handleOpenConfirmation(false)}
                disabled={isLoading || isSaving}
                className="w-full sm:w-auto border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500 gap-2 font-mono text-xs py-2.5 px-5"
              >
                <Power className="w-4 h-4" />
                <span>Deactivate Maintenance Mode</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => handleOpenConfirmation(true)}
                disabled={isLoading || isSaving}
                className="w-full sm:w-auto border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500 gap-2 font-mono text-xs py-2.5 px-5"
              >
                <Power className="w-4 h-4" />
                <span>Activate Maintenance Mode</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="maintenance-modal-title"
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          >
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#07172e] shadow-2xl p-6 sm:p-7">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "p-2 rounded-xl border",
                    targetState
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                  )}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h4
                  id="maintenance-modal-title"
                  className="text-base font-semibold text-slate-900 dark:text-white"
                >
                  {targetState
                    ? "Confirm: Activate Maintenance Mode"
                    : "Confirm: Deactivate Maintenance Mode"}
                </h4>
              </div>
              <button
                onClick={() => !isSaving && setIsModalOpen(false)}
                disabled={isSaving}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed mb-6">
              {targetState ? (
                <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300 space-y-1">
                  <p className="font-semibold">Important Notice for Public Traffic:</p>
                  <p>
                    All public pages, solutions, pricing, and client portal routes will immediately
                    render the Scheduled Maintenance screen. Authenticated administrators retain
                    uninterrupted access to this admin suite.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 space-y-1">
                  <p className="font-semibold">Restoring Public Access:</p>
                  <p>
                    The maintenance screen will be removed immediately. Public visitors and client
                    accounts will resume normal access across all website routes.
                  </p>
                </div>
              )}

              {/* Editable Notification Text for Activation */}
              {targetState && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Configured Message (Optional Override)</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                      Header Title
                    </label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#e57804]"
                      placeholder="Scheduled System Maintenance"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                      Explanation Message
                    </label>
                    <textarea
                      rows={3}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#e57804] resize-none"
                      placeholder="Zakeem Solutions is temporarily unavailable while we perform scheduled maintenance..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/70 dark:border-white/10">
              <Button
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="text-xs font-mono py-2 px-4"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmAction}
                disabled={isSaving}
                className={cn(
                  "text-xs font-mono py-2 px-5 text-white gap-2",
                  targetState
                    ? "bg-amber-600 hover:bg-amber-500"
                    : "bg-emerald-600 hover:bg-emerald-500"
                )}
              >
                {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {targetState ? "Confirm & Activate Maintenance" : "Confirm & Restore Public Live"}
                </span>
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
