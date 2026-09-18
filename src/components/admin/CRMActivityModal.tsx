import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  Phone,
  Video,
  FileText,
  CalendarClock,
  CheckCircle2,
  AlertCircle,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AdminUserSummary, CRMActivityType } from "@/types/crm";
import { createCRMActivity, getAdminUsers } from "@/lib/crmService";

interface CRMActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  leadId?: string | null;
  opportunityId?: string | null;
  organizationId?: string | null;
  contactId?: string | null;
  entityName?: string;
  defaultType?: CRMActivityType;
}

export const CRMActivityModal: React.FC<CRMActivityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  leadId,
  opportunityId,
  organizationId,
  contactId,
  entityName,
  defaultType = "follow_up",
}) => {
  const [activityType, setActivityType] = useState<CRMActivityType>(defaultType);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("10:00");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [adminUsers, setAdminUsers] = useState<AdminUserSummary[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActivityType(defaultType);
      setTitle("");
      setDescription("");
      setError(null);

      // Default date: tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(tomorrow.toISOString().split("T")[0]);

      getAdminUsers().then((users) => {
        setAdminUsers(users);
        if (users.length > 0 && !assignedTo) {
          setAssignedTo(users[0].id);
        }
      });
    }
  }, [isOpen, defaultType]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a concise title for this activity.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      let fullDueIso: string | null = null;
      if (dueDate) {
        fullDueIso = new Date(`${dueDate}T${dueTime || "10:00"}:00`).toISOString();
      }

      const isFuture = fullDueIso && new Date(fullDueIso) > new Date();

      const res = await createCRMActivity({
        activityType,
        title: title.trim(),
        description: description.trim() || undefined,
        organizationId: organizationId || undefined,
        contactId: contactId || undefined,
        leadId: leadId || undefined,
        opportunityId: opportunityId || undefined,
        dueDate: fullDueIso || undefined,
        assignedTo: assignedTo || undefined,
        status: isFuture ? "pending" : "completed",
      });

      if (!res.success) {
        setError(res.error || "Failed to register activity.");
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div
        data-surface="dark"
        className="w-full max-w-lg rounded-3xl bg-[#081c38] border border-white/15 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#e57804]/15 border border-[#e57804]/30 flex items-center justify-center text-[#e57804]">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Log CRM Activity / Follow-Up</h2>
              {entityName && (
                <p className="text-[11px] text-slate-400 font-mono truncate max-w-xs">{entityName}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Activity Type Picker */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Activity Classification
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { type: "follow_up" as CRMActivityType, label: "Follow-Up", icon: CalendarClock },
                { type: "call" as CRMActivityType, label: "Call", icon: Phone },
                { type: "meeting" as CRMActivityType, label: "Meeting", icon: Video },
                { type: "note_added" as CRMActivityType, label: "Note", icon: FileText },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = activityType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setActivityType(item.type)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 border transition-all ${
                      isSelected
                        ? "bg-[#e57804] text-white border-[#e57804] shadow-md shadow-[#e57804]/20"
                        : "bg-[#06152b] text-slate-300 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[10px]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Summary / Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Executive commercial sync, Pricing walkthrough..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#e57804]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Internal Notes & Agenda
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key talking points, client questions, commercial context..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#06152b] border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#e57804] resize-none"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Target Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#06152b] border border-white/15 text-xs text-white focus:outline-hidden focus:border-[#e57804]"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Target Time (WAT)
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#06152b] border border-white/15 text-xs text-white focus:outline-hidden focus:border-[#e57804]"
              />
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Assigned Administrator
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#06152b] border border-white/15 text-xs text-white focus:outline-hidden focus:border-[#e57804]"
            >
              {adminUsers.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.fullName} (Admin)
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/10">
            <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isSubmitting}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              {isSubmitting ? "Saving..." : "Save Activity"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
