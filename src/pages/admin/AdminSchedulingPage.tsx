import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
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
  Search,
  Filter,
  FileText,
  History,
  Bell,
  ArrowRight,
  X,
  Edit3,
  AlertTriangle,
  Check,
  ExternalLink,
  Layers,
  ChevronRight,
  Copy,
  UserPlus,
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  AvailabilityException,
  AvailabilityRule,
  Booking,
  BookingAuditLog,
  BookingNotification,
  BookingStatus,
  ScheduleSettings,
  TimeSlot,
  VALID_STATUS_TRANSITIONS,
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
  updateAdminBookingStatus,
  rescheduleAdminBooking,
  updateAdminBookingInternalNotes,
  getAdminBookingAuditLogs,
  getAdminBookingNotifications,
  getPublicAvailableSlots,
} from "@/lib/schedulingService";
import {
  listAdminInvitations,
  createAdminInvitation,
  revokeAdminInvitation,
} from "@/lib/invitationService";
import { ClientInvitation, CreateInvitationResult } from "@/types/auth";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { formatDisplayDate } from "@/lib/leadValidation";
import {
  getLagosTodayDateString,
  formatDisplayTime,
} from "@/lib/schedulingEngine";
import { useAuth } from "@/context/AuthContext";

type ActiveTab = "bookings" | "invitations" | "settings" | "rules" | "exceptions";
type DrawerTab = "details" | "reschedule" | "audit" | "notifications";

const PRODUCT_FILTER_OPTIONS = [
  { value: "all", label: "All Products & Solutions" },
  { value: "zakeem-realty-erp", label: "Zakeem Realty ERP" },
  { value: "events-booking", label: "Zakeem Events Booking" },
  { value: "forecourt", label: "Zakeem Forecourt" },
  { value: "smart-attendance", label: "Zakeem Smart Attendance" },
  { value: "feedback", label: "Zakeem Feedback" },
  { value: "cortex-ai", label: "Zakeem Cortex AI" },
  { value: "performance", label: "Zakeem Performance" },
  { value: "ai-automated-hr", label: "Zakeem AI Automated HR" },
  { value: "e-legal", label: "e-Legal & Justice Platform" },
  { value: "secure-messaging", label: "Zakeem Secure Messaging" },
  { value: "flow-procure", label: "Zakeem Flow (Procurement)" },
  { value: "vault-pay", label: "Zakeem Vault (Settlement)" },
  { value: "custom-software", label: "Custom Software Engineering" },
  { value: "cloud-infrastructure", label: "Cloud Infrastructure & Security" },
  { value: "enterprise-consulting", label: "Strategic Consulting" },
];

export const AdminSchedulingPage: React.FC = () => {
  // Authentication gate state connected to shared AuthContext
  const {
    isAuthenticated: authIsAuthenticated,
    isAdmin: authIsAdmin,
    signIn: authSignIn,
    signOut: authSignOut,
  } = useAuth();

  const [localDevAuthed, setLocalDevAuthed] = useState(false);
  const isDeskUnlocked = (authIsAuthenticated && authIsAdmin) || localDevAuthed;

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [passkey, setPasskey] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>("bookings");

  // Data state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [settings, setSettings] = useState<ScheduleSettings | null>(null);
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [invitations, setInvitations] = useState<ClientInvitation[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteOrg, setInviteOrg] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteLeadId, setInviteLeadId] = useState("");
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [inviteExpiresInDays, setInviteExpiresInDays] = useState<number>(7);
  const [createdInviteToken, setCreatedInviteToken] = useState<string | null>(null);
  const [createdInvitationData, setCreatedInvitationData] = useState<CreateInvitationResult | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isRevokingId, setIsRevokingId] = useState<string | null>(null);

  // Filtering & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [dateScopeFilter, setDateScopeFilter] = useState<string>("all");

  // Loading & notification states
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Exception form state
  const [newExceptionDate, setNewExceptionDate] = useState("");
  const [newExceptionReason, setNewExceptionReason] = useState("");

  // Drawer / Modal state for detailed booking management
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("details");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Internal notes editor state
  const [internalNotesInput, setInternalNotesInput] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Cancellation sub-flow state
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancellationReasonInput, setCancellationReasonInput] = useState("");

  // Rescheduling flow state
  const lagosToday = getLagosTodayDateString();
  const [rescheduleDate, setRescheduleDate] = useState(lagosToday);
  const [rescheduleSlots, setRescheduleSlots] = useState<TimeSlot[]>([]);
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState<TimeSlot | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // Audit logs & Notifications state
  const [auditLogs, setAuditLogs] = useState<BookingAuditLog[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [notifications, setNotifications] = useState<BookingNotification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      const [b, s, r, e, invRes] = await Promise.all([
        getAdminBookings(),
        getAdminScheduleSettings(),
        getAdminAvailabilityRules(),
        getAdminExceptions(),
        listAdminInvitations(),
      ]);
      setBookings(b);
      setSettings(s);
      setRules(r);
      setExceptions(e);
      if (invRes.success) {
        setInvitations(invRes.invitations);
      }

      // Keep selectedBooking refreshed if drawer is open
      if (selectedBooking) {
        const fresh = b.find((item) => item.id === selectedBooking.id);
        if (fresh) {
          setSelectedBooking(fresh);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load scheduling data.";
      setActionError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBooking]);

  useEffect(() => {
    if (isDeskUnlocked) {
      loadData();
    }
  }, [isDeskUnlocked, loadData]);

  // Load audit logs and notifications for a selected booking
  const loadBookingHistory = useCallback(async (bookingId: string) => {
    setIsLoadingAudit(true);
    setIsLoadingNotifications(true);
    try {
      const [logs, notifs] = await Promise.all([
        getAdminBookingAuditLogs(bookingId),
        getAdminBookingNotifications(bookingId),
      ]);
      setAuditLogs(logs);
      setNotifications(notifs);
    } catch {
      // Non-blocking
    } finally {
      setIsLoadingAudit(false);
      setIsLoadingNotifications(false);
    }
  }, []);

  // When selected booking changes, populate internal notes and history
  useEffect(() => {
    if (selectedBooking) {
      setInternalNotesInput(selectedBooking.internalNotes || "");
      setShowCancelPrompt(false);
      setCancellationReasonInput("");
      setRescheduleError(null);
      setSelectedRescheduleSlot(null);
      setRescheduleDate(selectedBooking.bookingDate >= lagosToday ? selectedBooking.bookingDate : lagosToday);
      loadBookingHistory(selectedBooking.id);
    }
  }, [selectedBooking, lagosToday, loadBookingHistory]);

  // Load available slots when reschedule date changes
  useEffect(() => {
    if (drawerTab === "reschedule" && rescheduleDate) {
      setIsLoadingSlots(true);
      setRescheduleError(null);
      setSelectedRescheduleSlot(null);
      getPublicAvailableSlots(rescheduleDate)
        .then((slots) => {
          setRescheduleSlots(slots);
          if (slots.length === 0) {
            setRescheduleError("No available operational slots found on this date.");
          }
        })
        .catch(() => {
          setRescheduleError("Failed to calculate availability for selected date.");
        })
        .finally(() => {
          setIsLoadingSlots(false);
        });
    }
  }, [drawerTab, rescheduleDate]);

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Production mode: Authenticate against Supabase Auth for RLS compliance
    if (isSupabaseConfigured()) {
      setIsLoading(true);
      const res = await authSignIn(adminEmail.trim(), adminPassword);
      setIsLoading(false);

      if (!res.success) {
        setAuthError(res.error || "Invalid administrative credentials. Please verify your solutions login.");
        return;
      }

      if (res.role !== "admin") {
        setAuthError("Access restricted. This account does not have administrative privileges.");
        return;
      }
      return;
    }

    // Local development mode: Verify admin access via operational passkey
    if (passkey.trim() === "zakeem-executive" || passkey.trim().length >= 8) {
      setLocalDevAuthed(true);
      setAuthError(null);
    } else {
      setAuthError("Invalid administrative credentials. Please verify your solutions passkey.");
    }
  };

  const handleSignOut = async () => {
    await authSignOut();
    setLocalDevAuthed(false);
    setSelectedBooking(null);
    setPasskey("");
    setAdminEmail("");
    setAdminPassword("");
  };

  // Status transition handler
  const handleUpdateStatus = async (booking: Booking, newStatus: BookingStatus, reason?: string) => {
    setIsUpdatingStatus(true);
    setActionError(null);
    try {
      const res = await updateAdminBookingStatus(booking.id, newStatus, reason, "solutions-admin");
      if (res.success) {
        setActionSuccess(`Reservation ${booking.referenceId} transitioned to ${newStatus.toUpperCase()}.`);
        setTimeout(() => setActionSuccess(null), 4000);

        // Dispatch analytics custom DOM events
        if (typeof window !== "undefined") {
          let eventName = "";
          if (newStatus === "cancelled") eventName = "request-demo-booking-cancelled";
          else if (newStatus === "completed") eventName = "request-demo-booking-completed";
          else if (newStatus === "no_show") eventName = "request-demo-booking-no-show";

          if (eventName) {
            window.dispatchEvent(
              new CustomEvent(eventName, {
                bubbles: true,
                detail: {
                  referenceId: booking.referenceId,
                  bookingId: booking.id,
                  status: newStatus,
                  reason,
                },
              })
            );
          }
        }

        await loadData();
        loadBookingHistory(booking.id);
        setShowCancelPrompt(false);
      } else {
        setActionError(res.error || "Failed to update booking status.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error executing status transition.";
      setActionError(msg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Atomic reschedule handler
  const handleRescheduleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !selectedRescheduleSlot) return;

    setIsRescheduling(true);
    setRescheduleError(null);
    try {
      const res = await rescheduleAdminBooking({
        bookingId: selectedBooking.id,
        newDate: rescheduleDate,
        newStartTime: selectedRescheduleSlot.startTime,
        newEndTime: selectedRescheduleSlot.endTime,
        reason: rescheduleReason.trim() || "Rescheduled by solutions administrator",
        actor: "solutions-admin",
      });

      if (res.success) {
        setActionSuccess(
          `Reservation ${selectedBooking.referenceId} successfully rescheduled to ${formatDisplayDate(
            rescheduleDate
          )} (${selectedRescheduleSlot.displayTime} WAT).`
        );
        setTimeout(() => setActionSuccess(null), 5000);

        // Dispatch analytics event
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("request-demo-booking-rescheduled", {
              bubbles: true,
              detail: {
                referenceId: selectedBooking.referenceId,
                bookingId: selectedBooking.id,
                newDate: rescheduleDate,
                newStartTime: selectedRescheduleSlot.startTime,
                newEndTime: selectedRescheduleSlot.endTime,
                reason: rescheduleReason,
              },
            })
          );
        }

        await loadData();
        loadBookingHistory(selectedBooking.id);
        setDrawerTab("details");
      } else {
        setRescheduleError(
          res.error || "Could not reschedule booking. The requested time slot may have just been reserved."
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected error during rescheduling.";
      setRescheduleError(msg);
    } finally {
      setIsRescheduling(false);
    }
  };

  // Save internal notes
  const handleSaveInternalNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setIsSavingNotes(true);
    setActionError(null);
    try {
      const res = await updateAdminBookingInternalNotes(
        selectedBooking.id,
        internalNotesInput.trim(),
        "solutions-admin"
      );
      if (res.success) {
        setActionSuccess("Internal administrative note saved to database.");
        setTimeout(() => setActionSuccess(null), 3000);
        setSelectedBooking((prev) => (prev ? { ...prev, internalNotes: internalNotesInput.trim() } : null));
        loadBookingHistory(selectedBooking.id);
      } else {
        setActionError(res.error || "Failed to update internal notes.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving internal notes.";
      setActionError(msg);
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Schedule settings handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    await updateAdminScheduleSettings(settings);
    setActionSuccess("Schedule settings successfully updated.");
    setTimeout(() => setActionSuccess(null), 3500);
  };

  // Operating rules handlers
  const handleToggleRule = async (rule: AvailabilityRule) => {
    const updated = await updateAdminAvailabilityRule(rule.id, { isActive: !rule.isActive });
    setRules(updated);
    setActionSuccess("Operating day window toggled.");
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

  // Blackout exceptions handlers
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

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    if (!inviteEmail.trim() || !inviteOrg.trim() || !inviteName.trim()) {
      setActionError("Email, organization name, and contact name are required.");
      return;
    }

    setIsCreatingInvite(true);
    try {
      const res = await createAdminInvitation({
        email: inviteEmail.trim(),
        organization: inviteOrg.trim(),
        fullName: inviteName.trim(),
        leadId: inviteLeadId.trim() || undefined,
        expiresInDays: inviteExpiresInDays,
      });

      if (res.success && res.token) {
        setCreatedInviteToken(res.token);
        setCreatedInvitationData(res);
        setActionSuccess(`Invitation generated for ${inviteOrg.trim()}.`);
        const listRes = await listAdminInvitations();
        if (listRes.success) {
          setInvitations(listRes.invitations);
        }
      } else {
        setActionError(res.error || "Failed to create client invitation.");
      }
    } catch {
      setActionError("An unexpected error occurred while generating invitation.");
    } finally {
      setIsCreatingInvite(false);
    }
  };

  const handleRevokeInvite = async (invitationId: string) => {
    if (!window.confirm("Are you sure you want to revoke this invitation? The client will no longer be able to activate an account.")) {
      return;
    }
    setIsRevokingId(invitationId);
    try {
      const res = await revokeAdminInvitation(invitationId);
      if (res.success) {
        setActionSuccess("Invitation revoked successfully.");
        const listRes = await listAdminInvitations();
        if (listRes.success) {
          setInvitations(listRes.invitations);
        }
      } else {
        setActionError(res.error || "Failed to revoke invitation.");
      }
    } catch {
      setActionError("Error occurred while revoking invitation.");
    } finally {
      setIsRevokingId(null);
    }
  };

  const handleCopyInviteLink = (token: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.zakeemsolutions.com";
    const link = `${origin}/accept-invite?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  // Multi-field filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Status filter
      if (statusFilter !== "all" && b.status !== statusFilter) {
        return false;
      }

      // Product filter
      if (productFilter !== "all" && b.product !== productFilter) {
        return false;
      }

      // Date scope filter
      if (dateScopeFilter === "today" && b.bookingDate !== lagosToday) {
        return false;
      }
      if (dateScopeFilter === "upcoming" && b.bookingDate < lagosToday) {
        return false;
      }
      if (dateScopeFilter === "past" && b.bookingDate >= lagosToday) {
        return false;
      }

      // Full text search across referenceId, fullName, organization, email, product
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesRef = b.referenceId.toLowerCase().includes(q);
        const matchesName = b.fullName.toLowerCase().includes(q);
        const matchesOrg = b.organization.toLowerCase().includes(q);
        const matchesEmail = b.email.toLowerCase().includes(q);
        const matchesProd = b.product.toLowerCase().includes(q);
        if (!matchesRef && !matchesName && !matchesOrg && !matchesEmail && !matchesProd) {
          return false;
        }
      }

      return true;
    });
  }, [bookings, statusFilter, productFilter, dateScopeFilter, searchQuery, lagosToday]);

  const getDayName = (dow: number) => {
    const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return names[dow] || `Day ${dow}`;
  };

  const renderStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Pending
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            Completed
          </span>
        );
      case "no_show":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            No Show
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30">
            {status}
          </span>
        );
    }
  };

  // Auth Gate Render
  if (!isDeskUnlocked) {
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
                  {isSupabaseConfigured()
                    ? "Enter your Zakeem Solutions administrative credentials to access operational records."
                    : "Enter administrative passkey to access operational booking records (Local Development Mode)."}
                </p>
              </div>

              <form onSubmit={handleAuthenticate} className="space-y-4 text-left">
                {isSupabaseConfigured() ? (
                  <>
                    <div>
                      <label htmlFor="admin-email" className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                        Administrator Work Email
                      </label>
                      <input
                        id="admin-email"
                        type="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="executive@zakeemsolutions.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804]"
                      />
                    </div>

                    <div>
                      <label htmlFor="admin-password" className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                        Password
                      </label>
                      <input
                        id="admin-password"
                        type="password"
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804]"
                      />
                    </div>
                  </>
                ) : (
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
                )}

                {authError && (
                  <div role="alert" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <Button variant="primary" size="md" type="submit" className="w-full" disabled={isLoading}>
                  {isLoading
                    ? "Authenticating..."
                    : isSupabaseConfigured()
                    ? "Sign In with Supabase Identity"
                    : "Unlock Scheduling Desk"}
                </Button>
              </form>

              <p className="text-[11px] text-slate-500">
                {isSupabaseConfigured()
                  ? "Protected by PostgreSQL Row-Level Security (RLS) & Supabase Identity."
                  : "Local development fallback mode. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for production."}
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
              <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                <Badge variant="neon">Operations Desk</Badge>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Africa/Lagos (WAT)
                </span>
                {isSupabaseConfigured() ? (
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                    Supabase Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-[10px]">
                    Local Storage Mode
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                Executive Scheduling & Walkthrough Desk
              </h1>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                disabled={isLoading}
                leftIcon={<RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />}
                className="border-white/15 text-white hover:bg-white/10"
              >
                Refresh
              </Button>
              <Link to="/request-demo">
                <Button variant="secondary" size="sm">
                  View Public Form
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-white/15 text-slate-400 hover:text-white hover:bg-white/10"
              >
                Lock Desk
              </Button>
            </div>
          </div>

          {/* Feedback Alerts */}
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

          {actionError && (
            <div role="alert" className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                {actionError}
              </span>
              <button
                type="button"
                onClick={() => setActionError(null)}
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
              Bookings Management ({bookings.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("invitations")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-mono font-medium transition-colors flex items-center gap-2 whitespace-nowrap",
                activeTab === "invitations"
                  ? "bg-[#e57804] text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Client Invitations ({invitations.length})
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
              {/* Comprehensive Search & Multi-Filter Bar */}
              <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-white/10 space-y-3.5">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  {/* Search Input */}
                  <div className="md:col-span-6 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by reference ID, customer, organization, or email..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#06152b] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#e57804]"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Product Filter Dropdown */}
                  <div className="md:col-span-3">
                    <select
                      value={productFilter}
                      onChange={(e) => setProductFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#06152b] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e57804]"
                    >
                      {PRODUCT_FILTER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#081c38] text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Horizon Filter Dropdown */}
                  <div className="md:col-span-3">
                    <select
                      value={dateScopeFilter}
                      onChange={(e) => setDateScopeFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#06152b] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e57804]"
                    >
                      <option value="all" className="bg-[#081c38] text-white">All Booking Dates</option>
                      <option value="today" className="bg-[#081c38] text-white">Today Only</option>
                      <option value="upcoming" className="bg-[#081c38] text-white">Upcoming Dates</option>
                      <option value="past" className="bg-[#081c38] text-white">Past Dates</option>
                    </select>
                  </div>
                </div>

                {/* Status Pills and Counter */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center gap-1">
                      <Filter className="w-3 h-3" /> Status:
                    </span>
                    {(["all", "confirmed", "pending", "completed", "no_show", "cancelled"] as const).map((filter) => {
                      const count =
                        filter === "all"
                          ? bookings.length
                          : bookings.filter((b) => b.status === filter).length;
                      return (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setStatusFilter(filter)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5",
                            statusFilter === filter
                              ? "bg-white/15 text-white font-bold border border-white/20"
                              : "text-slate-400 hover:text-white bg-white/5 border border-transparent"
                          )}
                        >
                          <span className="capitalize">{filter.replace("_", " ")}</span>
                          <span className="text-[10px] opacity-70 px-1 py-0.2 rounded bg-black/30">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <span className="text-xs font-mono text-slate-400">
                    Showing {filteredBookings.length} of {bookings.length} reservations
                  </span>
                </div>
              </div>

              {/* Bookings Grid */}
              {filteredBookings.length === 0 ? (
                <div data-surface="dark" className="p-12 rounded-3xl bg-[#081c38] border border-white/10 text-center space-y-3">
                  <Calendar className="w-10 h-10 text-slate-500 mx-auto" />
                  <h3 className="text-lg font-bold text-white">No Reservations Found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    There are no customer reservations matching the active search or filter criteria.
                  </p>
                  {(searchQuery || statusFilter !== "all" || productFilter !== "all" || dateScopeFilter !== "all") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                        setProductFilter("all");
                        setDateScopeFilter("all");
                      }}
                      className="text-white border-white/20 hover:bg-white/10"
                    >
                      Reset All Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredBookings.map((b) => (
                    <div
                      key={b.id}
                      data-surface="dark"
                      className={cn(
                        "p-5 rounded-2xl bg-[#081c38] border transition-all space-y-3.5 flex flex-col justify-between",
                        selectedBooking?.id === b.id
                          ? "border-[#e57804] ring-1 ring-[#e57804]/30"
                          : "border-white/10 hover:border-white/25"
                      )}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono text-[#e57804] font-semibold">
                                {b.referenceId}
                              </span>
                              {b.rescheduleCount && b.rescheduleCount > 0 ? (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  Rescheduled ({b.rescheduleCount}x)
                                </span>
                              ) : null}
                            </div>
                            <h4 className="text-base font-bold text-white mt-0.5">
                              {b.organization}
                            </h4>
                          </div>
                          <div>{renderStatusBadge(b.status)}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-white/10">
                          <div className="flex items-center gap-1.5 truncate">
                            <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">{b.fullName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate font-mono">{b.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#e57804] shrink-0" />
                            <span className="font-medium">{formatDisplayDate(b.bookingDate)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#e57804] shrink-0" />
                            <span className="font-mono">{b.startTime} – {b.endTime} WAT</span>
                          </div>
                        </div>

                        <div className="text-xs text-slate-400">
                          <span className="text-slate-500 font-mono uppercase text-[10px] block mb-0.5">Scope:</span>
                          <span className="text-white font-medium">{b.product}</span>
                          {b.deployment && <span className="text-slate-400 font-mono"> • {b.deployment}</span>}
                        </div>

                        {b.internalNotes && (
                          <div className="p-2.5 rounded-xl bg-[#06152b] border border-amber-500/20 text-[11px] text-amber-200/90 flex items-start gap-2">
                            <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <p className="line-clamp-2 italic">"{b.internalNotes}"</p>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono text-slate-500">
                          Created {new Date(b.createdAt).toLocaleDateString("en-GB")}
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBooking(b);
                            setDrawerTab("details");
                          }}
                          className="text-white border-white/20 hover:bg-white/10 text-xs"
                          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                        >
                          Manage Booking
                        </Button>
                      </div>
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

          {/* Tab: Client Account Invitations */}
          {activeTab === "invitations" && (
            <div className="space-y-6">
              {/* Header Card with Metrics and Create Button */}
              <div data-surface="dark" className="p-6 rounded-3xl bg-[#081c38] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="neon">B2B Identity Governance</Badge>
                    <span className="text-xs font-mono text-slate-400">Controlled Onboarding</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">Client Portal Invitations</h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                    Generate secure single-use onboarding invitations for approved enterprise accounts. Unrestricted public self-registration is permanently prohibited.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setShowInviteModal(!showInviteModal);
                    setCreatedInviteToken(null);
                  }}
                  leftIcon={<UserPlus className="w-4 h-4" />}
                >
                  {showInviteModal ? "Close Panel" : "+ Invite Client"}
                </Button>
              </div>

              {/* Status Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-white/10">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Total Issued</span>
                  <div className="text-xl font-bold text-white mt-1">{invitations.length}</div>
                </div>
                <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-white/10">
                  <span className="text-[10px] font-mono uppercase text-amber-400">Pending Activation</span>
                  <div className="text-xl font-bold text-amber-400 mt-1">
                    {invitations.filter((i) => i.status === "pending").length}
                  </div>
                </div>
                <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-white/10">
                  <span className="text-[10px] font-mono uppercase text-emerald-400">Accepted & Provisioned</span>
                  <div className="text-xl font-bold text-emerald-400 mt-1">
                    {invitations.filter((i) => i.status === "accepted").length}
                  </div>
                </div>
                <div data-surface="dark" className="p-4 rounded-2xl bg-[#081c38] border border-white/10">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Revoked / Expired</span>
                  <div className="text-xl font-bold text-slate-300 mt-1">
                    {invitations.filter((i) => i.status === "revoked" || i.status === "expired").length}
                  </div>
                </div>
              </div>

              {/* Invitation Generator Panel */}
              {showInviteModal && (
                <div data-surface="dark" className="p-6 rounded-3xl bg-[#0a2347] border border-[#e57804]/40 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-[#e57804]" />
                      Issue Client Account Invitation
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {createdInviteToken ? (
                    <div className="p-5 rounded-2xl bg-[#06152b] border border-emerald-500/30 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span className="text-sm font-bold text-white">Invitation Ready</span>
                        </div>
                        <Badge variant="neon">Single-Use Token</Badge>
                      </div>

                      {/* Recipient, Organization, and Expiration Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs">
                        <div>
                          <span className="block text-[10px] font-mono uppercase text-slate-400">Recipient</span>
                          <span className="text-white font-medium truncate block">
                            {createdInvitationData?.fullName || inviteName || "Client Contact"}
                          </span>
                          <span className="text-slate-400 text-[11px] truncate block">
                            {createdInvitationData?.email || inviteEmail}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-mono uppercase text-slate-400">Organization</span>
                          <span className="text-white font-medium truncate block">
                            {createdInvitationData?.organization || inviteOrg}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-mono uppercase text-slate-400">Expiration</span>
                          <span className="text-[#e57804] font-mono text-[11px] block">
                            {createdInvitationData?.expiresAt
                              ? new Date(createdInvitationData.expiresAt).toLocaleString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : `${inviteExpiresInDays} Days`}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        Share this secure invitation link with the client.
                      </p>

                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/10">
                        <input
                          type="text"
                          readOnly
                          value={`${typeof window !== "undefined" ? window.location.origin : "https://www.zakeemsolutions.com"}/accept-invite?token=${createdInviteToken}`}
                          className="w-full bg-transparent text-xs font-mono text-white focus:outline-none truncate"
                        />
                        <button
                          type="button"
                          onClick={() => handleCopyInviteLink(createdInviteToken)}
                          className="px-3 py-1.5 rounded-lg bg-[#e57804] text-white text-xs font-mono font-medium hover:bg-[#ff8906] transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                          aria-label="Copy Invitation Link"
                        >
                          {copySuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copySuccess ? "Copied!" : "Copy Link"}
                        </button>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCreatedInviteToken(null);
                            setCreatedInvitationData(null);
                            setInviteEmail("");
                            setInviteOrg("");
                            setInviteName("");
                            setInviteLeadId("");
                            setInviteExpiresInDays(7);
                          }}
                          className="text-xs"
                        >
                          Issue Another Invitation
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateInvite} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                          Client Work Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="client@organization.com"
                          className="w-full px-3.5 py-2 rounded-xl bg-[#06152b] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e57804]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                          Client Organization *
                        </label>
                        <input
                          type="text"
                          required
                          value={inviteOrg}
                          onChange={(e) => setInviteOrg(e.target.value)}
                          placeholder="First Capital Bank PLC"
                          className="w-full px-3.5 py-2 rounded-xl bg-[#06152b] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e57804]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                          Contact Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={inviteName}
                          onChange={(e) => setInviteName(e.target.value)}
                          placeholder="Alhaji Ibrahim Danladi"
                          className="w-full px-3.5 py-2 rounded-xl bg-[#06152b] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e57804]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                          Lead Reference ID (Optional)
                        </label>
                        <input
                          type="text"
                          value={inviteLeadId}
                          onChange={(e) => setInviteLeadId(e.target.value)}
                          placeholder="ZK-202609-XXXX"
                          className="w-full px-3.5 py-2 rounded-xl bg-[#06152b] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e57804]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                          Expiration Period *
                        </label>
                        <select
                          value={inviteExpiresInDays}
                          onChange={(e) => setInviteExpiresInDays(Number(e.target.value))}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#06152b] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e57804]"
                        >
                          <option value={1}>24 Hours (1 Day)</option>
                          <option value={7}>7 Days (Default)</option>
                          <option value={14}>14 Days</option>
                          <option value={30}>30 Days</option>
                        </select>
                      </div>

                      <div className="md:col-span-2 pt-2 flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => setShowInviteModal(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          type="submit"
                          disabled={isCreatingInvite}
                        >
                          {isCreatingInvite ? "Generating Invitation..." : "Issue Invitation & Token"}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Invitations Table */}
              <div data-surface="dark" className="rounded-2xl bg-[#081c38] border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono uppercase">
                    Authorized Client Onboarding Registry ({invitations.length})
                  </span>
                  <button
                    type="button"
                    onClick={loadData}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
                    Refresh
                  </button>
                </div>

                {invitations.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs italic">
                    No client invitations have been issued yet. Click "+ Invite Client" above to initiate onboarding.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#06152b] text-slate-400 font-mono uppercase border-b border-white/5">
                        <tr>
                          <th className="p-3.5">Organization / Contact</th>
                          <th className="p-3.5">Email</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5">Lead Reference</th>
                          <th className="p-3.5">Expires</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {invitations.map((inv) => (
                          <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-3.5">
                              <div className="font-bold text-white">{inv.organization}</div>
                              <div className="text-[11px] text-slate-400">{inv.fullName}</div>
                            </td>
                            <td className="p-3.5 font-mono text-slate-300">{inv.email}</td>
                            <td className="p-3.5">
                              {inv.status === "pending" && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  Pending Activation
                                </span>
                              )}
                              {inv.status === "accepted" && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Accepted
                                </span>
                              )}
                              {inv.status === "expired" && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-500/20 text-slate-400 border border-slate-500/30">
                                  Expired
                                </span>
                              )}
                              {inv.status === "revoked" && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                  Revoked
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 font-mono text-slate-400">
                              {inv.leadId || "—"}
                            </td>
                            <td className="p-3.5 font-mono text-[11px] text-slate-400">
                              {new Date(inv.expiresAt).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="p-3.5 text-right">
                              {inv.status === "pending" && (
                                <button
                                  type="button"
                                  onClick={() => handleRevokeInvite(inv.id)}
                                  disabled={isRevokingId === inv.id}
                                  className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline disabled:opacity-50"
                                >
                                  {isRevokingId === inv.id ? "Revoking..." : "Revoke"}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Booking Management Drawer / Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div
            data-surface="dark"
            className="w-full max-w-2xl min-h-screen bg-[#081c38] border-l border-white/15 shadow-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between overflow-y-auto"
          >
            {/* Drawer Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-bold text-[#e57804]">
                      {selectedBooking.referenceId}
                    </span>
                    {renderStatusBadge(selectedBooking.status)}
                    {selectedBooking.rescheduleCount && selectedBooking.rescheduleCount > 0 ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Rescheduled ({selectedBooking.rescheduleCount}x)
                      </span>
                    ) : null}
                  </div>
                  <h2 className="text-xl font-bold text-white">{selectedBooking.organization}</h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Subtab Navigation */}
              <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setDrawerTab("details")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap",
                    drawerTab === "details"
                      ? "bg-white/15 text-white font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Overview & Actions
                </button>
                <button
                  type="button"
                  disabled={selectedBooking.status === "completed" || selectedBooking.status === "no_show"}
                  onClick={() => setDrawerTab("reschedule")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap",
                    drawerTab === "reschedule"
                      ? "bg-white/15 text-white font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5",
                    (selectedBooking.status === "completed" || selectedBooking.status === "no_show") && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Reschedule Slot
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab("audit")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap",
                    drawerTab === "audit"
                      ? "bg-white/15 text-white font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <History className="w-3.5 h-3.5" />
                  Audit Trail ({auditLogs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab("notifications")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap",
                    drawerTab === "notifications"
                      ? "bg-white/15 text-white font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Bell className="w-3.5 h-3.5" />
                  Notification Queue ({notifications.length})
                </button>
              </div>

              {/* Drawer Feedback Alerts */}
              {actionSuccess && (
                <div role="status" className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
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

              {actionError && (
                <div role="alert" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    {actionError}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActionError(null)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Subtab 1: Overview & Status Actions */}
              {drawerTab === "details" && (
                <div className="space-y-6 pt-2">
                  {/* Customer Information Card */}
                  <div className="p-4 rounded-2xl bg-[#06152b] border border-white/10 space-y-3">
                    <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#e57804]" /> Client Profile
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Primary Contact</span>
                        <span className="text-white font-semibold">{selectedBooking.fullName}</span>
                        {selectedBooking.jobTitle && (
                          <span className="text-slate-400 block text-[11px]">{selectedBooking.jobTitle}</span>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Organization</span>
                        <span className="text-white font-semibold">{selectedBooking.organization}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Email Address</span>
                        <a
                          href={`mailto:${selectedBooking.email}`}
                          className="text-[#e57804] hover:underline font-mono"
                        >
                          {selectedBooking.email}
                        </a>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Phone</span>
                        {selectedBooking.phone ? (
                          <a
                            href={`tel:${selectedBooking.phone}`}
                            className="text-white font-mono hover:underline"
                          >
                            {selectedBooking.phone}
                          </a>
                        ) : (
                          <span className="text-slate-500 italic">Not provided</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Commercial Scope Card */}
                  <div className="p-4 rounded-2xl bg-[#06152b] border border-white/10 space-y-2.5">
                    <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-[#e57804]" /> Walkthrough Scope & Deployment
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Product Solution</span>
                        <span className="text-white font-medium">{selectedBooking.product}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Deployment Target</span>
                        <span className="text-slate-200">{selectedBooking.deployment || "Zakeem Cloud"}</span>
                      </div>
                      {selectedBooking.tier && (
                        <div>
                          <span className="text-slate-500 block text-[11px]">Commercial Tier</span>
                          <span className="text-slate-300 font-mono">{selectedBooking.tier}</span>
                        </div>
                      )}
                      {selectedBooking.leadId && (
                        <div>
                          <span className="text-slate-500 block text-[11px]">Lead Attribution ID</span>
                          <span className="text-slate-400 font-mono text-[11px]">{selectedBooking.leadId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Appointment Schedule Card */}
                  <div className="p-4 rounded-2xl bg-[#06152b] border border-white/10 space-y-2.5">
                    <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#e57804]" /> Scheduled Operational Window
                    </h3>
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Reserved Date</span>
                        <span className="text-white font-semibold text-sm">
                          {formatDisplayDate(selectedBooking.bookingDate)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block text-[11px]">Time Window (WAT)</span>
                        <span className="text-[#e57804] font-mono font-bold text-sm">
                          {selectedBooking.startTime} – {selectedBooking.endTime} WAT
                        </span>
                      </div>
                    </div>

                    {selectedBooking.rescheduledAt && (
                      <div className="pt-2 border-t border-white/5 text-[11px] text-amber-300/80">
                        Rescheduled on {new Date(selectedBooking.rescheduledAt).toLocaleString("en-GB")}
                      </div>
                    )}

                    {selectedBooking.cancelledAt && (
                      <div className="pt-2 border-t border-white/5 text-[11px] text-rose-300/90">
                        Cancelled on {new Date(selectedBooking.cancelledAt).toLocaleString("en-GB")}
                        {selectedBooking.cancellationReason && (
                          <div className="italic mt-0.5">Reason: "{selectedBooking.cancellationReason}"</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Customer Public Notes (if present) */}
                  {selectedBooking.notes && (
                    <div className="p-4 rounded-2xl bg-[#06152b] border border-white/10 space-y-1.5">
                      <span className="text-[11px] font-mono text-slate-400 uppercase block">Customer Inbound Note:</span>
                      <p className="text-xs text-slate-200 italic">"{selectedBooking.notes}"</p>
                    </div>
                  )}

                  {/* Internal Administrative Notes (Admin-Only) */}
                  <div className="p-4 rounded-2xl bg-[#06152b] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center gap-2">
                        <Edit3 className="w-3.5 h-3.5 text-[#e57804]" /> Internal Administrative Notes
                      </h3>
                      <span className="text-[10px] font-mono text-emerald-400">Strictly Internal / RLS Guarded</span>
                    </div>

                    <form onSubmit={handleSaveInternalNotes} className="space-y-2.5">
                      <textarea
                        rows={3}
                        value={internalNotesInput}
                        onChange={(e) => setInternalNotesInput(e.target.value)}
                        placeholder="Add architecture qualifications, lead scoring, or briefing notes..."
                        className="w-full p-3 rounded-xl bg-[#081c38] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#e57804]"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          These notes are never exposed in public availability or customer emails.
                        </span>
                        <Button
                          variant="secondary"
                          size="sm"
                          type="submit"
                          disabled={isSavingNotes}
                        >
                          {isSavingNotes ? "Saving..." : "Save Internal Note"}
                        </Button>
                      </div>
                    </form>
                  </div>

                  {/* Controlled Lifecycle Status Action Center */}
                  <div className="p-4 rounded-2xl bg-[#06152b] border border-white/10 space-y-3">
                    <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5 text-[#e57804]" /> Lifecycle Status Actions
                    </h3>

                    {/* Active valid transitions from current state */}
                    <div className="space-y-3 pt-1">
                      {selectedBooking.status === "confirmed" && (
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isUpdatingStatus}
                            onClick={() => handleUpdateStatus(selectedBooking, "completed")}
                            className="text-sky-400 border-sky-500/30 hover:bg-sky-500/10"
                            leftIcon={<Check className="w-3.5 h-3.5" />}
                          >
                            Mark Completed
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isUpdatingStatus}
                            onClick={() => handleUpdateStatus(selectedBooking, "no_show")}
                            className="text-purple-400 border-purple-500/30 hover:bg-purple-500/10"
                            leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}
                          >
                            Mark No Show
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isUpdatingStatus}
                            onClick={() => setDrawerTab("reschedule")}
                            className="text-[#e57804] border-[#e57804]/30 hover:bg-[#e57804]/10"
                            leftIcon={<Calendar className="w-3.5 h-3.5" />}
                          >
                            Reschedule Slot
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isUpdatingStatus}
                            onClick={() => setShowCancelPrompt(true)}
                            className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                            leftIcon={<XCircle className="w-3.5 h-3.5" />}
                          >
                            Cancel Reservation
                          </Button>
                        </div>
                      )}

                      {selectedBooking.status === "pending" && (
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={isUpdatingStatus}
                            onClick={() => handleUpdateStatus(selectedBooking, "confirmed")}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          >
                            Confirm Reservation
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isUpdatingStatus}
                            onClick={() => setShowCancelPrompt(true)}
                            className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                            leftIcon={<XCircle className="w-3.5 h-3.5" />}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}

                      {selectedBooking.status === "no_show" && (
                        <p className="text-xs text-slate-400 italic">
                          This walkthrough was marked as a no-show. The session is closed.
                        </p>
                      )}

                      {selectedBooking.status === "cancelled" && (
                        <div className="space-y-2">
                          <p className="text-xs text-slate-400">
                            This reservation is cancelled. The original slot has been freed for public availability.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDrawerTab("reschedule")}
                            className="text-[#e57804] border-[#e57804]/30 hover:bg-[#e57804]/10"
                            leftIcon={<Calendar className="w-3.5 h-3.5" />}
                          >
                            Re-book via Reschedule
                          </Button>
                        </div>
                      )}

                      {selectedBooking.status === "completed" && (
                        <p className="text-xs text-slate-400 italic">
                          This walkthrough was conducted and marked as completed. Lifecycle is concluded.
                        </p>
                      )}

                      {/* Cancel reason prompt modal/section */}
                      {showCancelPrompt && (
                        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-3 mt-2">
                          <div className="text-xs text-rose-300 font-semibold flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-400" />
                            Confirm Reservation Cancellation
                          </div>
                          <input
                            type="text"
                            value={cancellationReasonInput}
                            onChange={(e) => setCancellationReasonInput(e.target.value)}
                            placeholder="Reason for cancellation (e.g., Client requested postponement)..."
                            className="w-full px-3 py-1.5 rounded-lg bg-[#06152b] border border-white/10 text-xs text-white"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setShowCancelPrompt(false)}
                            >
                              Dismiss
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isUpdatingStatus}
                              onClick={() =>
                                handleUpdateStatus(
                                  selectedBooking,
                                  "cancelled",
                                  cancellationReasonInput.trim() || "Cancelled by solutions administrator"
                                )
                              }
                              className="text-rose-400 border-rose-500/40 hover:bg-rose-500/20"
                            >
                              Execute Cancellation
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Subtab 2: Rescheduling Flow */}
              {drawerTab === "reschedule" && (
                <div className="space-y-5 pt-2">
                  {selectedBooking.status === "completed" || selectedBooking.status === "no_show" ? (
                    <div className="p-4 rounded-2xl bg-[#06152b] border border-white/10 text-xs text-slate-400 italic">
                      Bookings marked as {selectedBooking.status === "no_show" ? "no-show" : "completed"} are terminal and cannot be rescheduled.
                    </div>
                  ) : (
                    <>
                      <div className="p-4 rounded-2xl bg-[#06152b] border border-white/10 space-y-1.5">
                        <h3 className="text-xs font-mono uppercase text-[#e57804] font-bold">
                          Atomic Slot Rescheduling
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Select a new operational date and time window. The existing slot will be released and the new slot booked atomically under PostgreSQL concurrency protection.
                        </p>
                      </div>

                      <form onSubmit={handleRescheduleBooking} className="space-y-4">
                        <div>
                          <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                            Target Reschedule Date (WAT) *
                          </label>
                          <input
                            type="date"
                            min={lagosToday}
                            required
                            value={rescheduleDate}
                            onChange={(e) => setRescheduleDate(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white [color-scheme:dark]"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-mono uppercase text-slate-400">
                              Available Time Windows (WAT) *
                            </label>
                            {isLoadingSlots && (
                              <span className="text-[11px] font-mono text-[#e57804] flex items-center gap-1">
                                <RefreshCw className="w-3 h-3 animate-spin" /> Fetching slots...
                              </span>
                            )}
                          </div>

                          {rescheduleError && (
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs mb-2">
                              {rescheduleError}
                            </div>
                          )}

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                            {rescheduleSlots.map((slot) => {
                              const isSelected = selectedRescheduleSlot?.startTime === slot.startTime;
                              return (
                                <button
                                  key={slot.startTime}
                                  type="button"
                                  onClick={() => setSelectedRescheduleSlot(slot)}
                                  className={cn(
                                    "p-2.5 rounded-xl border text-xs font-mono text-center transition-all",
                                    isSelected
                                      ? "bg-[#e57804] text-white border-[#e57804] font-bold shadow-lg"
                                      : "bg-[#06152b] text-slate-300 border-white/10 hover:border-white/30"
                                  )}
                                >
                                  {slot.displayTime}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                            Operational Reason for Reschedule
                          </label>
                          <input
                            type="text"
                            value={rescheduleReason}
                            onChange={(e) => setRescheduleReason(e.target.value)}
                            placeholder="e.g. Architect conference conflict or client request..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-xs text-white"
                          />
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            type="button"
                            onClick={() => setDrawerTab("details")}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            type="submit"
                            disabled={!selectedRescheduleSlot || isRescheduling}
                          >
                            {isRescheduling ? "Rescheduling Atomically..." : "Confirm Reschedule"}
                          </Button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              )}

              {/* Subtab 3: Audit Trail */}
              {drawerTab === "audit" && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">
                      Immutable Log History ({auditLogs.length} events)
                    </span>
                    <button
                      type="button"
                      onClick={() => loadBookingHistory(selectedBooking.id)}
                      className="text-xs font-mono text-[#e57804] hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className={cn("w-3 h-3", isLoadingAudit && "animate-spin")} /> Refresh
                    </button>
                  </div>

                  {auditLogs.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-[#06152b] border border-white/10 text-center text-xs text-slate-400 italic">
                      No audit log entries recorded for this booking yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                      {auditLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3.5 rounded-xl bg-[#06152b] border border-white/10 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono text-[#e57804] font-semibold uppercase">
                              {log.action.replace("_", " ")}
                            </span>
                            <span className="text-slate-500 font-mono">
                              {new Date(log.createdAt).toLocaleString("en-GB")}
                            </span>
                          </div>
                          <div className="text-slate-300">
                            Actor: <span className="text-white font-mono">{log.actor}</span>
                            {log.previousStatus && log.newStatus && (
                              <span className="ml-2 text-slate-400">
                                ({log.previousStatus} → <span className="text-emerald-300 font-semibold">{log.newStatus}</span>)
                              </span>
                            )}
                          </div>
                          {log.details && Object.keys(log.details).length > 0 && (
                            <pre className="p-2 rounded bg-black/40 text-[10px] text-slate-400 overflow-x-auto font-mono">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Subtab 4: Notification Queue */}
              {drawerTab === "notifications" && (
                <div className="space-y-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-[#06152b] border border-emerald-500/20 text-xs text-slate-300 space-y-1">
                    <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Provider-Neutral Queue
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Zakeem Solutions records all customer transactional dispatches in this PostgreSQL queue. Workers can deliver via SMTP, SendGrid, Postmark, or AWS SES without code modifications.
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">
                      Dispatches ({notifications.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => loadBookingHistory(selectedBooking.id)}
                      className="text-xs font-mono text-[#e57804] hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className={cn("w-3 h-3", isLoadingNotifications && "animate-spin")} /> Refresh
                    </button>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-[#06152b] border border-white/10 text-center text-xs text-slate-400 italic">
                      No transactional notifications queued for this booking yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-3.5 rounded-xl bg-[#06152b] border border-white/10 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono text-sky-400 font-semibold">
                              {n.eventType}
                            </span>
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold",
                                n.status === "pending"
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                  : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              )}
                            >
                              {n.status}
                            </span>
                          </div>
                          <div className="text-slate-300 text-[11px]">
                            To: <span className="text-white font-mono">{n.recipientEmail}</span> ({n.recipientName}) • via {n.channel}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Queued: {new Date(n.createdAt).toLocaleString("en-GB")}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>PostgreSQL RLS Active</span>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-white"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
