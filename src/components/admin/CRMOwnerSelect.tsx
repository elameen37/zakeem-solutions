import React, { useState, useEffect } from "react";
import { UserCheck, Shield, ChevronDown, Check } from "lucide-react";
import { AdminUserSummary } from "@/types/crm";
import { getAdminUsers } from "@/lib/crmService";
import { cn } from "@/lib/utils";

interface CRMOwnerSelectProps {
  currentOwnerId?: string | null;
  currentOwnerName?: string | null;
  onSelectOwner: (ownerId: string | null) => Promise<void> | void;
  disabled?: boolean;
  className?: string;
}

export const CRMOwnerSelect: React.FC<CRMOwnerSelectProps> = ({
  currentOwnerId,
  currentOwnerName,
  onSelectOwner,
  disabled = false,
  className,
}) => {
  const [adminUsers, setAdminUsers] = useState<AdminUserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    getAdminUsers()
      .then((users) => {
        if (mounted) setAdminUsers(users);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSelect = async (newOwnerId: string | null) => {
    if (newOwnerId === currentOwnerId) {
      setIsOpen(false);
      return;
    }

    try {
      setIsUpdating(true);
      await onSelectOwner(newOwnerId);
      setIsOpen(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const resolvedName =
    currentOwnerName ||
    adminUsers.find((u) => u.id === currentOwnerId)?.fullName ||
    (currentOwnerId ? "Assigned Admin" : "Unassigned");

  return (
    <div className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        disabled={disabled || isUpdating || isLoading}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border",
          currentOwnerId
            ? "bg-[#06152b] text-emerald-300 border-emerald-500/30 hover:border-emerald-500/50"
            : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10 dark:hover:bg-white/10",
          (disabled || isUpdating) && "opacity-50 cursor-not-allowed"
        )}
      >
        <UserCheck className="w-3.5 h-3.5" />
        <span className="truncate max-w-[140px] font-medium">{resolvedName}</span>
        <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop dismiss */}
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />

          <div
            data-surface="dark"
            className="absolute left-0 mt-1.5 w-60 rounded-2xl bg-[#081c38] border border-white/15 shadow-2xl z-40 py-2 divide-y divide-white/10 animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-[#e57804]" />
              <span>Assign Admin Owner</span>
            </div>

            <div className="py-1 max-h-56 overflow-y-auto scrollbar-thin">
              {/* Unassigned Option */}
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className={cn(
                  "w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-white/5 transition-colors",
                  !currentOwnerId ? "text-[#e57804] font-medium" : "text-slate-300"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <span>Unassigned</span>
                </div>
                {!currentOwnerId && <Check className="w-3.5 h-3.5 text-[#e57804]" />}
              </button>

              {/* Admin Users */}
              {adminUsers.map((admin) => {
                const isSelected = admin.id === currentOwnerId;
                return (
                  <button
                    key={admin.id}
                    type="button"
                    onClick={() => handleSelect(admin.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-white/5 transition-colors",
                      isSelected ? "text-emerald-400 font-medium" : "text-slate-200"
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{admin.fullName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {admin.role === "admin" ? "Administrator" : admin.role}
                      </span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
