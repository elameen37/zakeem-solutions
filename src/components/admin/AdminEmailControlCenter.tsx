import React, { useState, useEffect, useCallback } from "react";
import {
  Mail,
  ShieldAlert,
  ShieldCheck,
  Server,
  Activity,
  Send,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Info,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Power,
  Globe,
  Sliders,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  EmailInfrastructureConfig,
  EmailProviderType,
  HealthCheckResult,
  TestEmailResult,
} from "@/types/notification";
import {
  getEmailInfrastructureConfig,
  updateActiveProvider,
  toggleEmailDelivery,
  runProviderHealthCheck,
  sendTestEmail,
  ZAKEEM_EMAIL_DNS_RECORDS,
} from "@/lib/email/emailDeliveryService";

export const AdminEmailControlCenter: React.FC = () => {
  const [config, setConfig] = useState<EmailInfrastructureConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"providers" | "dns" | "test">("providers");

  // Health check state
  const [healthCheckingProvider, setHealthCheckingProvider] = useState<string | null>(null);
  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null);

  // Switching provider state
  const [isSwitching, setIsSwitching] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Toggle delivery state
  const [isTogglingDelivery, setIsTogglingDelivery] = useState(false);

  // Test email state
  const [testRecipient, setTestRecipient] = useState("info@zakeemsolutions.com");
  const [testProvider, setTestProvider] = useState<EmailProviderType>("resend");
  const [testNote, setTestNote] = useState("Administrative transport integrity test");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<TestEmailResult | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // DNS copy feedback
  const [copiedRecordKey, setCopiedRecordKey] = useState<string | null>(null);
  const [showFutureProviders, setShowFutureProviders] = useState(false);

  // Load configuration
  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getEmailInfrastructureConfig();
      setConfig(data);
      setTestProvider(data.activeProvider);
    } catch (err) {
      console.error("Failed to load email config:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Handle Cooldown Timer
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  const handleSwitchProvider = async (provider: EmailProviderType) => {
    if (isSwitching) return;
    setIsSwitching(true);
    setActionMessage(null);
    try {
      const res = await updateActiveProvider(provider);
      if (res.success) {
        setActionMessage({
          type: "success",
          text: `Active transactional provider successfully switched to ${provider.toUpperCase()}.`,
        });
        await loadConfig();
      } else {
        setActionMessage({
          type: "error",
          text: res.error || `Failed to switch to provider ${provider}.`,
        });
      }
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error switching provider.",
      });
    } finally {
      setIsSwitching(false);
      setTimeout(() => setActionMessage(null), 7000);
    }
  };

  const handleToggleDelivery = async () => {
    if (!config || isTogglingDelivery) return;
    setIsTogglingDelivery(true);
    setActionMessage(null);
    try {
      const newState = !config.deliveryEnabled;
      const res = await toggleEmailDelivery(newState);
      if (res.success) {
        setActionMessage({
          type: "success",
          text: newState
            ? "Outbound transactional email delivery is now ENABLED."
            : "Outbound transactional email delivery has been PAUSED.",
        });
        await loadConfig();
      } else {
        setActionMessage({
          type: "error",
          text: res.error || "Failed to update delivery state.",
        });
      }
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error updating delivery state.",
      });
    } finally {
      setIsTogglingDelivery(false);
      setTimeout(() => setActionMessage(null), 7000);
    }
  };

  const handleHealthCheck = async (provider: EmailProviderType) => {
    setHealthCheckingProvider(provider);
    setHealthResult(null);
    try {
      const result = await runProviderHealthCheck(provider);
      setHealthResult(result);
      await loadConfig();
    } catch (err) {
      setHealthResult({
        success: false,
        provider,
        status: "error",
        error: err instanceof Error ? err.message : "Health check execution failed.",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setHealthCheckingProvider(null);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSendingTest || cooldownRemaining > 0) return;

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const result = await sendTestEmail({
        recipientEmail: testRecipient,
        provider: testProvider,
        note: testNote,
      });
      setTestResult(result);
      setCooldownRemaining(15);
      await loadConfig();
    } catch (err) {
      setTestResult({
        success: false,
        provider: testProvider,
        error: err instanceof Error ? err.message : "Unexpected test dispatch error.",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRecordKey(key);
    setTimeout(() => setCopiedRecordKey(null), 3000);
  };

  if (isLoading && !config) {
    return (
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#06152b]/80 p-8 shadow-sm">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin text-[#e57804]" />
          <span className="text-sm font-medium">Loading Email Infrastructure Telemetry...</span>
        </div>
      </div>
    );
  }

  const env = config?.environment || "production";
  const activeProvider = config?.activeProvider || "resend";
  const deliveryEnabled = config?.deliveryEnabled ?? true;

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#06152b]/80 shadow-sm backdrop-blur-md overflow-hidden">
      {/* 1. Header Bar */}
      <div className="p-6 border-b border-slate-200/80 dark:border-white/10 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-[#06152b] dark:via-[#081c38] dark:to-[#06152b]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="p-2.5 rounded-xl bg-[#e57804]/10 border border-[#e57804]/30 text-[#e57804] shrink-0 mt-0.5">
              <Mail className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Email Infrastructure & Control Center
                </h2>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider",
                    env === "production"
                      ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                      : env === "staging"
                      ? "border-blue-500/40 text-blue-400 bg-blue-500/10"
                      : "border-amber-500/40 text-amber-400 bg-amber-500/10"
                  )}
                >
                  {env}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider",
                    deliveryEnabled
                      ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                      : "border-red-500/40 text-red-400 bg-red-500/10"
                  )}
                >
                  {deliveryEnabled ? "Delivery Active" : "Delivery Paused"}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Provider-agnostic transactional email engine supporting Resend, SendGrid, and Mailtrap with server-side health monitoring and zero credential exposure.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={loadConfig}
              leftIcon={<RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />}
              className="border-slate-200 dark:border-white/10 text-xs"
            >
              Refresh
            </Button>
            <Button
              variant={deliveryEnabled ? "outline" : "primary"}
              size="sm"
              onClick={handleToggleDelivery}
              disabled={isTogglingDelivery}
              leftIcon={<Power className="w-3.5 h-3.5" />}
              className={cn(
                "text-xs transition-colors",
                deliveryEnabled
                  ? "border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
              )}
            >
              {isTogglingDelivery ? "Updating..." : deliveryEnabled ? "Pause Delivery" : "Resume Delivery"}
            </Button>
          </div>
        </div>

        {/* Global Operational Message */}
        {actionMessage && (
          <div
            className={cn(
              "mt-4 p-3 rounded-xl border text-xs flex items-center gap-2",
              actionMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            )}
          >
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* 2. Telemetry KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-200/60 dark:border-white/5">
          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-black/25 border border-slate-200/60 dark:border-white/5">
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Active Provider
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white capitalize">
                {activeProvider}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5 block truncate">
              From: {config?.senderEmail}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-black/25 border border-slate-200/60 dark:border-white/5">
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Delivered
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-sm sm:text-base font-bold text-emerald-500 dark:text-emerald-400">
                {config?.metrics.sentCount ?? 0}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/80" />
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5 block">
              Queued: {config?.metrics.queuedCount ?? 0}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-black/25 border border-slate-200/60 dark:border-white/5">
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Failures
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={cn(
                  "text-sm sm:text-base font-bold",
                  (config?.metrics.failedCount ?? 0) > 0 ? "text-red-500" : "text-slate-700 dark:text-slate-300"
                )}
              >
                {config?.metrics.failedCount ?? 0}
              </span>
              {(config?.metrics.failedCount ?? 0) > 0 && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5 block">
              Retries logged: {config?.metrics.retryCount ?? 0}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-black/25 border border-slate-200/60 dark:border-white/5">
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Route Health
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-sm sm:text-base font-bold text-emerald-500 dark:text-emerald-400 uppercase">
                {config?.lastHealthStatus === "healthy" ? "Healthy" : config?.lastHealthStatus || "Operational"}
              </span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5 block truncate">
              {config?.lastHealthCheck
                ? new Date(config.lastHealthCheck).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "Continuous Monitoring"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-[#030d1c]/50 px-6 flex items-center gap-2">
        <button
          onClick={() => setActiveTab("providers")}
          className={cn(
            "px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
            activeTab === "providers"
              ? "border-[#e57804] text-[#e57804] font-semibold"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <Server className="w-4 h-4" />
          <span>Provider Adapters</span>
        </button>

        <button
          onClick={() => setActiveTab("dns")}
          className={cn(
            "px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
            activeTab === "dns"
              ? "border-[#e57804] text-[#e57804] font-semibold"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Domain & DNS Authentication</span>
        </button>

        <button
          onClick={() => setActiveTab("test")}
          className={cn(
            "px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
            activeTab === "test"
              ? "border-[#e57804] text-[#e57804] font-semibold"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <Send className="w-4 h-4" />
          <span>Live Test Dispatcher</span>
        </button>
      </div>

      {/* 4. Tab Contents */}
      <div className="p-6">
        {/* TAB 1: PROVIDERS */}
        {activeTab === "providers" && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
                    First-Class Provider Adapters
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Fully implemented adapters with native API payloads, webhook capabilities, and sandbox capture.
                  </p>
                </div>
              </div>

              {/* First-Class Providers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Resend */}
                <div
                  className={cn(
                    "rounded-xl border p-4.5 transition-all flex flex-col justify-between",
                    activeProvider === "resend"
                      ? "border-[#e57804] bg-[#e57804]/5 dark:bg-[#e57804]/10 shadow-sm"
                      : "border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/20"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-base">Resend</span>
                        {activeProvider === "resend" && (
                          <Badge variant="neon" className="text-[10px] px-2 py-0.5">
                            Active
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">
                        First-Class
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      Modern developer email platform built for exceptional deliverability and real-time telemetry. Default for Production.
                    </p>

                    <div className="space-y-1 mb-4">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e57804]" />
                        <span>Transactional HTML & Idempotency</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e57804]" />
                        <span>Recommended for: Production</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-200/60 dark:border-white/5">
                    {activeProvider !== "resend" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isSwitching}
                        onClick={() => handleSwitchProvider("resend")}
                        className="w-full text-xs"
                      >
                        Set Active
                      </Button>
                    ) : (
                      <div className="text-xs font-mono text-[#e57804] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Active Provider</span>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={healthCheckingProvider === "resend"}
                      onClick={() => handleHealthCheck("resend")}
                      className="text-xs shrink-0"
                      title="Ping provider endpoint"
                    >
                      {healthCheckingProvider === "resend" ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Activity className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* 2. SendGrid */}
                <div
                  className={cn(
                    "rounded-xl border p-4.5 transition-all flex flex-col justify-between",
                    activeProvider === "sendgrid"
                      ? "border-[#e57804] bg-[#e57804]/5 dark:bg-[#e57804]/10 shadow-sm"
                      : "border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/20"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-base">SendGrid</span>
                        {activeProvider === "sendgrid" && (
                          <Badge variant="neon" className="text-[10px] px-2 py-0.5">
                            Active
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">
                        First-Class
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      Twilio SendGrid enterprise cloud dispatch with dedicated IP pools, subuser scoping, and high-volume delivery.
                    </p>

                    <div className="space-y-1 mb-4">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e57804]" />
                        <span>Enterprise SLA & Dedicated IPs</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e57804]" />
                        <span>Recommended for: High Volume</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-200/60 dark:border-white/5">
                    {activeProvider !== "sendgrid" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isSwitching}
                        onClick={() => handleSwitchProvider("sendgrid")}
                        className="w-full text-xs"
                      >
                        Set Active
                      </Button>
                    ) : (
                      <div className="text-xs font-mono text-[#e57804] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Active Provider</span>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={healthCheckingProvider === "sendgrid"}
                      onClick={() => handleHealthCheck("sendgrid")}
                      className="text-xs shrink-0"
                      title="Ping provider endpoint"
                    >
                      {healthCheckingProvider === "sendgrid" ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Activity className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* 3. Mailtrap */}
                <div
                  className={cn(
                    "rounded-xl border p-4.5 transition-all flex flex-col justify-between",
                    activeProvider === "mailtrap"
                      ? "border-[#e57804] bg-[#e57804]/5 dark:bg-[#e57804]/10 shadow-sm"
                      : "border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/20"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-base">Mailtrap</span>
                        {activeProvider === "mailtrap" && (
                          <Badge variant="neon" className="text-[10px] px-2 py-0.5">
                            Active
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400">
                        First-Class
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      Sandbox testing & capture platform. Ensures zero accidental outbound email leakage to real recipient inboxes in dev and staging.
                    </p>

                    <div className="space-y-1 mb-4">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span>Safe Sandbox Capture & Zero Leakage</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span>Recommended for: Dev & QA</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-200/60 dark:border-white/5">
                    {activeProvider !== "mailtrap" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isSwitching}
                        onClick={() => handleSwitchProvider("mailtrap")}
                        className="w-full text-xs"
                      >
                        Set Active
                      </Button>
                    ) : (
                      <div className="text-xs font-mono text-[#e57804] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Active Provider</span>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={healthCheckingProvider === "mailtrap"}
                      onClick={() => handleHealthCheck("mailtrap")}
                      className="text-xs shrink-0"
                      title="Ping provider endpoint"
                    >
                      {healthCheckingProvider === "mailtrap" ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Activity className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Check Result Feedback */}
            {healthResult && (
              <div
                className={cn(
                  "p-4 rounded-xl border text-xs space-y-1",
                  healthResult.success
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-red-500/10 border-red-500/30 text-red-300"
                )}
              >
                <div className="flex items-center justify-between font-semibold">
                  <div className="flex items-center gap-1.5">
                    {healthResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span>
                      Health Check: {healthResult.provider.toUpperCase()} — {healthResult.status.toUpperCase()}
                    </span>
                  </div>
                  {healthResult.latencyMs !== undefined && (
                    <span className="font-mono text-[11px] opacity-80">{healthResult.latencyMs}ms latency</span>
                  )}
                </div>
                {healthResult.error ? (
                  <p className="text-[11px] text-red-400 pl-5">{healthResult.error}</p>
                ) : (
                  <p className="text-[11px] text-emerald-400/90 pl-5">
                    Endpoint reached successfully. Provider API credentials verified and transport pipeline active.
                  </p>
                )}
              </div>
            )}

            {/* Future Ready Providers Section */}
            <div className="pt-2 border-t border-slate-200/80 dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowFutureProviders(!showFutureProviders)}
                className="flex items-center justify-between w-full text-left py-2 group"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">
                    Future-Ready Provider Adapters (SES, Postmark, Brevo, Mailgun, SMTP)
                  </span>
                </div>
                {showFutureProviders ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showFutureProviders && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-3 pt-2">
                  {[
                    { id: "ses", name: "Amazon SES", desc: "AWS high-scale transactional engine with dedicated IP pools." },
                    { id: "postmark", name: "Postmark (ActiveCampaign)", desc: "Sub-second transactional delivery SLA." },
                    { id: "brevo", name: "Brevo (Sendinblue)", desc: "European data sovereignty & unified email APIs." },
                    { id: "mailgun", name: "Mailgun (Sinch)", desc: "Advanced email routing and parsing engine." },
                    { id: "smtp", name: "Enterprise Custom SMTP", desc: "Direct MTA protocol with TLS 1.3 encryption." },
                  ].map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50/30 dark:bg-black/10"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{p.name}</span>
                        <Badge variant="outline" className="text-[9px] border-slate-500/30 text-slate-400">
                          Scaffolded
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">{p.desc}</p>
                      <span className="text-[10px] font-mono text-slate-400">Contract Ready &bull; Zero App Coupling</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DOMAIN & DNS AUTHENTICATION */}
        {activeTab === "dns" && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
                  Domain Authentication & Anti-Spoofing Records
                </h3>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  Domain: <strong className="text-slate-900 dark:text-white">zakeemsolutions.com</strong>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                To guarantee inbox delivery and protect against executive email spoofing, configure the following DNS records at your domain registrar.
              </p>
            </div>

            {/* DNS Security Callout */}
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-200/90 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-amber-300 block">
                  Authoritative Verification Status: Pending Domain Registrar Propagation
                </span>
                <p className="text-[11px] leading-relaxed text-amber-200/80">
                  Per Zakeem Solutions Security Protocols, domain verification status is reported truthfully. Until cryptographic DKIM keys and SPF records are resolved across public recursive resolvers, status remains <strong className="font-mono text-amber-300">Pending Verification</strong>.
                </p>
              </div>
            </div>

            {/* Records Table */}
            <div className="rounded-xl border border-slate-200/80 dark:border-white/10 overflow-hidden bg-slate-50/50 dark:bg-black/20">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      <th className="py-2.5 px-4 font-semibold">Record Type</th>
                      <th className="py-2.5 px-4 font-semibold">Host / Name</th>
                      <th className="py-2.5 px-4 font-semibold">Value / Target</th>
                      <th className="py-2.5 px-4 font-semibold">Status</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-white/5 font-mono">
                    {ZAKEEM_EMAIL_DNS_RECORDS.map((rec, idx) => (
                      <tr key={idx} className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-[#e57804]/10 text-[#e57804] border border-[#e57804]/20 font-bold text-[10px]">
                            {rec.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium max-w-[200px] truncate">
                          {rec.name}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-normal max-w-[320px] break-all">
                          {rec.value}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className="text-[10px] border-amber-500/30 text-amber-400 bg-amber-500/10"
                          >
                            Pending
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyText(`record_${idx}`, rec.value)}
                            leftIcon={
                              copiedRecordKey === `record_${idx}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )
                            }
                            className="text-xs h-7 px-2.5"
                          >
                            {copiedRecordKey === `record_${idx}` ? "Copied" : "Copy Value"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DMARC Policy Guidance */}
            <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-black/25 border border-slate-200/60 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[11px] block uppercase tracking-wider">
                Enterprise DMARC Alignment Standard
              </span>
              <p className="text-[11px] leading-relaxed">
                The Zakeem DMARC policy mandates <strong className="text-slate-800 dark:text-slate-200">p=quarantine</strong> at 100% enforcement, instructing receiving mail transfer agents (Google Workspace, Microsoft 365, Apple Mail) to sequester unauthenticated messages originating from non-authorized IPs.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: LIVE TEST DISPATCHER */}
        {activeTab === "test" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-mono">
                Live Transactional Test Email Dispatcher
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Send an authenticated, rate-limited test email through the server-side transport pipeline to verify end-to-end delivery integrity.
              </p>
            </div>

            <form onSubmit={handleSendTest} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Recipient Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    placeholder="info@zakeemsolutions.com"
                    className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-slate-50 dark:bg-[#030d1c] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#e57804] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Transport Provider <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={testProvider}
                    onChange={(e) => setTestProvider(e.target.value as EmailProviderType)}
                    className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-slate-50 dark:bg-[#030d1c] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#e57804]"
                  >
                    <option value="resend">Resend (Production Default)</option>
                    <option value="sendgrid">SendGrid (Twilio Enterprise)</option>
                    <option value="mailtrap">Mailtrap (Sandbox & Capture)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Verification Audit Note
                </label>
                <input
                  type="text"
                  value={testNote}
                  onChange={(e) => setTestNote(e.target.value)}
                  placeholder="Reason for verification dispatch"
                  className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-slate-50 dark:bg-[#030d1c] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#e57804]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSendingTest || cooldownRemaining > 0}
                  leftIcon={
                    isSendingTest ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )
                  }
                  className="text-xs"
                >
                  {isSendingTest
                    ? "Dispatching..."
                    : cooldownRemaining > 0
                    ? `Cooldown (${cooldownRemaining}s)`
                    : "Dispatch Live Test Email"}
                </Button>

                {cooldownRemaining > 0 && (
                  <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Rate limit active: 15s protection cooldown</span>
                  </span>
                )}
              </div>
            </form>

            {/* Test Email Output Feedback */}
            {testResult && (
              <div
                className={cn(
                  "p-4 rounded-xl border text-xs space-y-2 mt-4 max-w-2xl",
                  testResult.success
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-red-500/10 border-red-500/30 text-red-300"
                )}
              >
                <div className="flex items-center gap-2 font-semibold">
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>
                    Test Email Result: {testResult.success ? "DELIVERED SUCCESSFULLY" : "DISPATCH FAILED"}
                  </span>
                </div>

                <div className="font-mono text-[11px] space-y-1 pl-6">
                  <div>
                    Provider: <strong className="text-white uppercase">{testResult.provider}</strong>
                  </div>
                  {testResult.messageId && (
                    <div>
                      Message ID: <strong className="text-emerald-300">{testResult.messageId}</strong>
                    </div>
                  )}
                  {testResult.error && (
                    <div className="text-red-400">
                      Error: <strong className="text-red-300">{testResult.error}</strong>
                    </div>
                  )}
                  <div>Timestamp: {testResult.timestamp}</div>
                </div>

                {!testResult.success && (
                  <p className="text-[11px] text-slate-400 pl-6 border-t border-red-500/20 pt-2">
                    Notice: Zakeem Solutions email architecture reports authentic errors and never simulates false delivery success. Verify that provider API credentials are configured in your Supabase Edge Function environment secrets.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
