import React from "react";
import {
  WifiOff,
  RotateCcw,
  Trash2,
  Save,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDraftTime, PublicFormKey } from "@/lib/pwaDraftStorage";
import { cn } from "@/lib/utils";

export interface PWADraftNoticeProps {
  formKey: PublicFormKey;
  hasDraft: boolean;
  draftSavedAt?: string | null;
  onRestore: () => void;
  onDiscard: () => void;
  isOfflineBlocked?: boolean;
  isReconnected?: boolean;
  onSaveDraft?: () => void;
  isDraftRestored?: boolean;
  isDraftSavedFeedback?: boolean;
  onDismissBlockedNotice?: () => void;
  className?: string;
}

export const PWADraftNotice: React.FC<PWADraftNoticeProps> = ({
  formKey,
  hasDraft,
  draftSavedAt,
  onRestore,
  onDiscard,
  isOfflineBlocked = false,
  isReconnected = false,
  onSaveDraft,
  isDraftRestored = false,
  isDraftSavedFeedback = false,
  onDismissBlockedNotice,
  className,
}) => {
  // 1. Offline Interception Banner (Highest Priority)
  if (isOfflineBlocked) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className={cn(
          "p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 shadow-lg text-amber-200 transition-all duration-300",
          className
        )}
      >
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400">
            <WifiOff className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-amber-200 tracking-tight">
                Offline — Submission Unavailable
              </h3>
              {onDismissBlockedNotice && (
                <button
                  type="button"
                  onClick={onDismissBlockedNotice}
                  aria-label="Dismiss offline alert"
                  className="p-1 rounded-lg text-amber-400/80 hover:text-amber-200 hover:bg-amber-500/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-xs text-amber-300/90 mt-1 leading-relaxed">
              Your inputs have been safely preserved as a local offline draft on this device.
              Network transmission requires an active connection. Reconnect to submit your request.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 mt-3 pt-2 border-t border-amber-500/20">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-300/80 font-medium">
                <Clock className="w-3.5 h-3.5" />
                Draft saved locally {draftSavedAt ? formatDraftTime(draftSavedAt) : "just now"}
              </span>
              {onSaveDraft && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onSaveDraft}
                  className="min-h-[44px] px-3 text-xs bg-amber-900/30 border-amber-500/40 text-amber-200 hover:bg-amber-800/40 hover:text-white"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save Draft Again
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Draft Restored Success Notice
  if (isDraftRestored) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 shadow-sm flex items-center justify-between gap-3 transition-all duration-300",
          className
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          <span className="text-xs font-semibold text-emerald-200 truncate">
            Draft content restored to form fields.
          </span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onDiscard}
          className="min-h-[44px] px-3 text-xs border-red-500/30 text-red-300 hover:bg-red-950/30 hover:text-red-200 shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
          Discard Draft
        </Button>
      </div>
    );
  }

  // 3. Draft Saved Feedback Notice
  if (isDraftSavedFeedback) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2.5 transition-all duration-300",
          className
        )}
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Draft safely stored locally on this device. Zero data transmitted.</span>
      </div>
    );
  }

  // 4. Reconnection Reminder Notice
  if (isReconnected && hasDraft) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "p-4 rounded-2xl bg-[#06152b] border border-emerald-500/40 shadow-md text-emerald-200 transition-all duration-300",
          className
        )}
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-emerald-300">
              Connection Restored — Draft Available
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              You have an offline draft from {draftSavedAt ? formatDraftTime(draftSavedAt) : "earlier"}. Review and submit when ready.
            </p>
            <div className="flex items-center gap-2.5 mt-2.5">
              <Button
                type="button"
                size="sm"
                onClick={onRestore}
                className="min-h-[44px] px-3.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Restore Draft
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onDiscard}
                className="min-h-[44px] px-3 text-xs border-white/10 text-slate-300 hover:text-white"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Discard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. Existing Draft Available Notice (on Mount)
  if (hasDraft) {
    return (
      <div
        role="region"
        aria-label="Saved draft recovery notice"
        className={cn(
          "p-4 rounded-2xl bg-[#06152b] border border-[#e57804]/40 shadow-md text-slate-200 transition-all duration-300",
          className
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#e57804]/15 border border-[#e57804]/30 flex items-center justify-center shrink-0 text-[#e57804]">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white">
                Unsaved local draft found
              </p>
              <p className="text-[11px] text-slate-400">
                Last saved {draftSavedAt ? formatDraftTime(draftSavedAt) : "locally"}. Would you like to restore your progress?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              size="sm"
              onClick={onRestore}
              className="min-h-[44px] px-3.5 text-xs bg-[#e57804] hover:bg-[#c96600] text-white font-semibold shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Restore Draft
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onDiscard}
              className="min-h-[44px] px-3 text-xs border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/30"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Discard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
