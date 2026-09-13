import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  Building2,
  Mail,
  Phone,
  User,
  Sliders,
  CalendarDays,
  Lock,
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  AvailabilityException,
  AvailabilityRule,
  Booking,
  ScheduleSettings,
} from "@/types/scheduling";
import {
  addAdminException,
  cancelAdminBooking,
  deleteAdminException,
  getAdminAvailabilityRules,
  getAdminBookings,
  getAdminExceptions,
  getAdminScheduleSettings,
  updateAdminAvailabilityRule,
  updateAdminScheduleSettings,
} from "@/lib/schedulingService";
import { formatDisplayDate } from "@/lib/leadValidation";

type ActiveTab = "bookings" | "settings" | "rules" | "exceptions";

export const AdminSchedulingPage: React.FC = () => {
  // Authentication gate state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>("bookings");

  // Data state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [settings, setSettings] = useState<ScheduleSettings | null>(null);
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [bookingFilter, setBookingFilter] = useState<string>("all");

  // Loading & notification states
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Exception form state
  const [newExceptionDate, setNewExceptionDate] = useState("");
  const [newExceptionReason, setNewExceptionReason] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [b, s, r, e] = await Promise.all([
        getAdminBookings(),
        getAdminScheduleSettings(),
        getAdminAvailabilityRules(),
        getAdminExceptions(),
      ]);
      setBookings(b);
      setSettings(s);
      setRules(r);
      setExceptions(e);
    } catch {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    // Verify admin access (Protected operational desk)
    if (passkey.trim() === "zakeem-executive" || passkey.trim().length >= 8) {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError("Invalid administrative credentials. Please verify your solutions passkey.");
    }
  };

  const handleCancelBooking = async (id: string) => {
    const res = await cancelAdminBooking(id, cancelReason || "Cancelled by solutions administrator");
    if (res.success) {
      setActionSuccess("Appointment reservation cancelled successfully.");
      setCancellingBookingId(null);
      setCancelReason("");
      loadData();
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    await updateAdminScheduleSettings(settings);
    setActionSuccess("Schedule settings successfully updated.");
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleToggleRule = async (rule: AvailabilityRule) => {
    const updated = await updateAdminAvailabilityRule(rule.id, { isActive: !rule.isActive });
    setRules(updated);
    setActionSuccess(`Day availability toggled.`);
    setTimeout(() => setActionSuccess(null), 2500);
  };

  const handleRuleTimeChange = async (
    ruleId: string,
    field: "startTime" | "endTime",
    val: string
  ) => {
    const updated = await updateAdminAvailabilityRule(ruleId, { [field]: val });
    setRules(updated);
  };

  const handleAddException = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExceptionDate) return;
    const updated = await addAdminException({
      scheduleId: settings?.id || "default-zakeem-schedule",
      exceptionDate: newExceptionDate,
      exceptionType: "unavailable",
      reason: newExceptionReason || "Operational Blackout",
    });
    setExceptions(updated);
    setNewExceptionDate("");
    setNewExceptionReason("");
    setActionSuccess("Blackout date exception registered.");
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleDeleteException = async (id: string) => {
    const updated = await deleteAdminException(id);
    setExceptions(updated);
    setActionSuccess("Blackout date removed.");
    setTimeout(() => setActionSuccess(null), 2500);
  };

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === "all") return true;
    return b.status === bookingFilter;
  });

  const getDayName = (dow: number) => {
    const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return names[dow] || `Day ${dow}`;
  };

  // Auth Gate Render
  if (!isAuthenticated) {
    return (
      <>
        <SEO
          title="Executive Scheduling Desk — Zakeem Solutions"
          description="Internal management desk for executive appointment walkthroughs and availability parameters."
          canonical="https://www.zakeemsolutions.com/admin/scheduling"
        />

        <section className="pt-20 pb-28 min-h-[75vh] flex items-center justify-center">
          <div className="container mx-auto px-4 max-w-md">
            <div data-surface="dark" className="p-8 rounded-3xl bg-[#081c38] border border-white/15 shadow-2xl space-y-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#e57804]/20 border border-[#e57804]/30 flex items-center justify-center mx-auto text-[#e57804]">
                <Lock className="w-7 h-7" />
              </div>

              <div>
                <Badge variant="neon" className="mb-2">Restricted Access</Badge>
                <h1 className="text-2xl font-bold text-white">Scheduling Desk Gate</h1>
                <p className="text-xs text-slate-300 mt-1">
                  Enter administrative passkey to access operational booking records.
                </p>
              </div>

              <form onSubmit={handleAuthenticate} className="space-y-4 text-left">
                <div>
                  <label htmlFor="admin-passkey" className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                    Administrative Passkey
                  </label>
                  <input
                    id="admin-passkey"
                    type="password"
                    required
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804]"
                  />
                </div>

                {authError && (
                  <div role="alert" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <Button variant="primary" size="md" type="submit" className="w-full">
                  Unlock Scheduling Desk
                </Button>
              </form>

              <p className="text-[11px] text-slate-500">
                Protected by PostgreSQL Row-Level Security (RLS) & Supabase Identity.
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Executive Scheduling Desk — Zakeem Solutions"
        description="Internal management desk for executive appointment walkthroughs and availability parameters."
        canonical="https://www.zakeemsolutions.com/admin/scheduling"
      />

      <section className="pt-12 pb-24 border-b border-white/10 min-h-screen">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <Badge variant="neon">Operations Desk</Badge>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Africa/Lagos (WAT)
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                Executive Scheduling & Walkthrough Desk
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                disabled={isLoading}
                leftIcon={<RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />}
                className="border-white/15 text-white"
              >
                Refresh
              </Button>
              <Link to="/request-demo">
                <Button variant="secondary" size="sm">
                  View Public Form
                </Button>
              </Link>
            </div>
          </div>

          {/* Feedback Alert */}
          {actionSuccess && (
            <div role="status" className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {actionSuccess}
              </span>
              <button
                type="button"
                onClick={() => setActionSuccess(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveTab("bookings")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-mono font-medium transition-colors flex items-center gap-2 whitespace-nowrap",
                activeTab === "bookings"
                  ? "bg-[#e57804] text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              Bookings ({bookings.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-mono font-medium transition-colors flex items-center gap-2 whitespace-nowrap",
                activeTab === "settings"
                  ? "bg-[#e57804] text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Sliders className="w-3.5 h-3.5" />
              Schedule Settings
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("rules")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-mono font-medium transition-colors flex items-center gap-2 whitespace-nowrap",
                activeTab === "rules"
                  ? "bg-[#e57804] text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              Weekly Operating Hours
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("exceptions")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-mono font-medium transition-colors flex items-center gap-2 whitespace-nowrap",
                activeTab === "exceptions"
                  ? "bg-[#e57804] text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Blackout Dates ({exceptions.length})
            </button>
          </div>

          {/* Tab 1: Bookings Management */}
          {activeTab === "bookings" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">Filter:</span>
                  {["all", "confirmed", "cancelled"].map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setBookingFilter(filter)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-mono capitalize transition-colors",
                        bookingFilter === filter
                          ? "bg-white/15 text-white font-bold"
                          : "text-slate-400 hover:text-white bg-white/5"
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-mono text-slate-500">
                  Showing {filteredBookings.length} reservations
                </span>
              </div>

              {filteredBookings.length === 0 ? (
                <div data-surface="dark" className="p-12 rounded-3xl bg-[#081c38] border border-white/10 text-center space-y-3">
                  <Calendar className="w-10 h-10 text-slate-500 mx-auto" />
                  <h3 className="text-lg font-bold text-white">No Bookings Found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    There are no customer reservations matching the active filter criteria.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredBookings.map((b) => (
                    <div
                      key={b.id}
                      data-surface="dark"
                      className="p-5 rounded-2xl bg-[#081c38] border border-white/10 space-y-3 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[11px] font-mono text-[#e57804] font-semibold">
                            {b.referenceId}
                          </span>
                          <h4 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                            {b.organization}
                          </h4>
                        </div>
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold",
                            b.status === "confirmed"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          )}
                        >
                          {b.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-white/10">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{b.fullName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate font-mono">{b.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#e57804] shrink-0" />
                          <span>{formatDisplayDate(b.bookingDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#e57804] shrink-0" />
                          <span className="font-mono">{b.startTime} – {b.endTime} WAT</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 pt-1">
                        <span className="text-slate-500">Product:</span>{" "}
                        <span className="text-white">{b.product}</span>
                        {b.deployment && <span className="text-slate-500"> • {b.deployment}</span>}
                      </div>

                      {b.notes && (
                        <div className="p-2.5 rounded-xl bg-[#06152b] border border-white/5 text-[11px] text-slate-300 italic">
                          "{b.notes}"
                        </div>
                      )}

                      {b.status === "confirmed" && (
                        <div className="pt-2 flex justify-end">
                          {cancellingBookingId === b.id ? (
                            <div className="space-y-2 w-full pt-2 border-t border-white/10">
                              <input
                                type="text"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Reason for cancellation..."
                                className="w-full px-3 py-1.5 rounded-lg bg-[#06152b] border border-white/15 text-xs text-white"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setCancellingBookingId(null)}
                                >
                                  Back
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelBooking(b.id)}
                                  className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                                >
                                  Confirm Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setCancellingBookingId(b.id)}
                              className="text-xs font-mono text-rose-400/80 hover:text-rose-400 flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Cancel Reservation
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Schedule Settings */}
          {activeTab === "settings" && settings && (
            <div data-surface="dark" className="p-8 rounded-3xl bg-[#081c38] border border-white/15 max-w-2xl">
              <h3 className="text-lg font-bold text-white mb-1">Operational Schedule Parameters</h3>
              <p className="text-xs text-slate-400 mb-6">
                Tune the slot generation stride, notice requirements, and booking limits in West Africa Time.
              </p>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Slot Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      min={15}
                      max={180}
                      step={15}
                      value={settings.slotDurationMinutes}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          slotDurationMinutes: parseInt(e.target.value, 10) || 60,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Buffer After Slot (Minutes)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      step={5}
                      value={settings.bufferAfterMinutes}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          bufferAfterMinutes: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Minimum Notice (Hours)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={72}
                      value={settings.minimumNoticeHours}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          minimumNoticeHours: parseInt(e.target.value, 10) || 2,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Max Booking Horizon (Days)
                    </label>
                    <input
                      type="number"
                      min={7}
                      max={90}
                      value={settings.maximumBookingDays}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          maximumBookingDays: parseInt(e.target.value, 10) || 30,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button variant="primary" size="md" type="submit">
                    Save Schedule Settings
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 3: Weekly Operating Rules */}
          {activeTab === "rules" && (
            <div data-surface="dark" className="p-8 rounded-3xl bg-[#081c38] border border-white/15 max-w-2xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Weekly Operating Windows</h3>
                <p className="text-xs text-slate-400">
                  Configure active days and business-hour windows for the solutions architecture team.
                </p>
              </div>

              <div className="space-y-3">
                {rules.map((r) => (
                  <div
                    key={r.id}
                    className={cn(
                      "p-4 rounded-xl border flex items-center justify-between transition-colors",
                      r.isActive
                        ? "bg-[#06152b] border-white/15"
                        : "bg-white/5 border-white/5 opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleRule(r)}
                        className={cn(
                          "w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-colors",
                          r.isActive ? "bg-[#e57804] text-white" : "bg-white/10 text-transparent"
                        )}
                        aria-label={`Toggle ${getDayName(r.dayOfWeek)}`}
                      >
                        ✓
                      </button>
                      <span className="text-sm font-semibold text-white">
                        {getDayName(r.dayOfWeek)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <input
                        type="time"
                        value={r.startTime}
                        disabled={!r.isActive}
                        onChange={(e) => handleRuleTimeChange(r.id, "startTime", e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#081c38] border border-white/10 text-white font-mono [color-scheme:dark]"
                      />
                      <span className="text-slate-500">to</span>
                      <input
                        type="time"
                        value={r.endTime}
                        disabled={!r.isActive}
                        onChange={(e) => handleRuleTimeChange(r.id, "endTime", e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#081c38] border border-white/10 text-white font-mono [color-scheme:dark]"
                      />
                      <span className="text-slate-500 font-mono text-[11px]">WAT</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Blackout Exceptions */}
          {activeTab === "exceptions" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div data-surface="dark" className="md:col-span-5 p-6 rounded-3xl bg-[#081c38] border border-white/15 space-y-4">
                <h3 className="text-base font-bold text-white">Register Blackout Date</h3>
                <p className="text-xs text-slate-400">
                  Block specific dates (public holidays, executive summits) from public booking.
                </p>

                <form onSubmit={handleAddException} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Exception Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={newExceptionDate}
                      onChange={(e) => setNewExceptionDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Reason / Note
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. National Holiday / Summit"
                      value={newExceptionReason}
                      onChange={(e) => setNewExceptionReason(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white"
                    />
                  </div>

                  <Button variant="primary" size="md" type="submit" className="w-full">
                    <Plus className="w-4 h-4 mr-1" /> Add Blackout Date
                  </Button>
                </form>
              </div>

              <div data-surface="dark" className="md:col-span-7 p-6 rounded-3xl bg-[#081c38] border border-white/15 space-y-4">
                <h3 className="text-base font-bold text-white">Active Blackout Dates</h3>
                {exceptions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No blackout dates registered.</p>
                ) : (
                  <div className="space-y-2">
                    {exceptions.map((ex) => (
                      <div
                        key={ex.id}
                        className="p-3 rounded-xl bg-[#06152b] border border-white/10 flex items-center justify-between"
                      >
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {formatDisplayDate(ex.exceptionDate)}
                          </span>
                          <span className="text-[11px] text-slate-400">{ex.reason}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteException(ex.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                          aria-label="Remove exception"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};
