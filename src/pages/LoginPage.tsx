import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { 
  KeyRound, ShieldCheck, ExternalLink, ArrowRight, Building2, Eye, EyeOff, 
  AlertCircle, Lock, Mail, CheckCircle2, ArrowLeft, UserPlus, Sparkles
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

type AuthTab = "signin" | "create_account";
type LoginMode = "signin" | "forgot_password";

function extractInvitationToken(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  try {
    if (
      trimmed.includes("?") ||
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("/")
    ) {
      const url = new URL(
        trimmed,
        typeof window !== "undefined" ? window.location.origin : "https://www.zakeemsolutions.com"
      );
      const token = url.searchParams.get("token");
      if (token) return token.trim();
    }
  } catch {
    const match = trimmed.match(/[?&]token=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return match[1].trim();
  }
  return trimmed;
}

export const LoginPage: React.FC = () => {
  const { isAuthenticated, isAdmin, signIn, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<AuthTab>("signin");
  const [mode, setMode] = useState<LoginMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Invitation token input state for Create Account tab
  const [inviteInput, setInviteInput] = useState("");
  const [inviteInputError, setInviteInputError] = useState<string | null>(null);

  // Sync tab with URL search parameter (?tab=signup or ?tab=create-account)
  useEffect(() => {
    const tabParam = (searchParams.get("tab") || searchParams.get("mode") || "").toLowerCase();
    if (
      tabParam === "signup" ||
      tabParam === "create-account" ||
      tabParam === "create_account" ||
      tabParam === "register"
    ) {
      setActiveTab("create_account");
      if (typeof window !== "undefined") {
        try {
          window.dispatchEvent(
            new CustomEvent("signup-started", {
              bubbles: true,
              detail: {
                source: "url_parameter",
                timestamp: new Date().toISOString(),
              },
            })
          );
        } catch {
          // Non-blocking
        }
      }
    }
  }, [searchParams]);

  // If already authenticated, redirect to appropriate destination
  useEffect(() => {
    if (isAuthenticated) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const from = (location.state as any)?.from?.pathname;
      if (from && from !== "/login") {
        navigate(from, { replace: true });
      } else if (isAdmin) {
        navigate("/admin/scheduling", { replace: true });
      } else {
        navigate("/portal", { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, navigate, location]);

  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab);
    setAuthError(null);
    setInviteInputError(null);
    if (tab === "create_account") {
      if (typeof window !== "undefined") {
        try {
          window.dispatchEvent(
            new CustomEvent("signup-started", {
              bubbles: true,
              detail: {
                source: "login_tab_switcher",
                timestamp: new Date().toISOString(),
              },
            })
          );
        } catch {
          // Non-blocking
        }
      }
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!email.trim() || !password) {
      setAuthError("Please enter both your work email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signIn(email.trim(), password);
      if (res.success) {
        if (res.role === "admin") {
          navigate("/admin/scheduling", { replace: true });
        } else {
          navigate("/portal", { replace: true });
        }
      } else {
        setAuthError(res.error || "Authentication failed. Please verify your credentials.");
      }
    } catch {
      setAuthError("An unexpected error occurred during sign-in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!email.trim()) {
      setAuthError("Please provide your registered work email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword(email.trim());
      if (res.success) {
        setResetSuccess(true);
      } else {
        setAuthError(res.error || "Could not process password recovery. Please verify your email.");
      }
    } catch {
      setAuthError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvitationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteInputError(null);

    const extracted = extractInvitationToken(inviteInput);
    if (!extracted) {
      setInviteInputError("Please enter your invitation code or paste your invitation link.");
      return;
    }

    navigate(`/accept-invite?token=${encodeURIComponent(extracted)}`);
  };

  return (
    <>
      <SEO
        title="Client & Customer Portal Gateway — Zakeem Solutions"
        description="Access your dedicated Zakeem product instances, including Zakeem Realty ERP and Customer Portal."
        canonical="https://www.zakeemsolutions.com/login"
      />

      <section className="pt-12 pb-20 md:pt-20 md:pb-28 border-b border-white/10 min-h-[85vh]">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          {/* Header */}
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="flex justify-center mb-4">
              <Badge variant="blue">Ecosystem Access Gate</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight mb-4">
              Zakeem Identity & Product Gateway
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Sign in to your client portal, activate your account via invitation, or select your dedicated enterprise product environment.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Primary Column: Client Portal Gateway (Sign In / Create Account) */}
            <div className="lg:col-span-7">
              <div
                data-surface="dark"
                className="p-7 sm:p-9 rounded-3xl bg-[#081c38] border border-white/15 shadow-2xl space-y-6"
              >
                {/* Segmented Tab Switcher */}
                <div className="flex p-1 rounded-2xl bg-[#06152b] border border-white/10">
                  <button
                    type="button"
                    onClick={() => handleTabChange("signin")}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      activeTab === "signin"
                        ? "bg-[#e57804] text-white shadow-md shadow-[#e57804]/20"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange("create_account")}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      activeTab === "create_account"
                        ? "bg-[#e57804] text-white shadow-md shadow-[#e57804]/20"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Create Account
                  </button>
                </div>

                {/* TAB 1: SIGN IN */}
                {activeTab === "signin" && (
                  <>
                    {mode === "signin" ? (
                      <>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-[#e57804]/20 border border-[#e57804]/30 flex items-center justify-center text-[#e57804]">
                              <Lock className="w-4 h-4" />
                            </div>
                            <Badge variant="neon">Client Sign In</Badge>
                          </div>
                          <h2 className="text-xl font-bold text-white">Client Portal Authentication</h2>
                          <p className="text-xs text-slate-300 mt-1">
                            Enter your authorized Zakeem credentials to access your organization's portal.
                          </p>
                        </div>

                        <form onSubmit={handleSignInSubmit} className="space-y-4" noValidate>
                          {/* Email Field */}
                          <div>
                            <label htmlFor="client-email" className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                              Work Email
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Mail className="w-4 h-4" />
                              </div>
                              <input
                                id="client-email"
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="client@organization.com"
                                aria-invalid={authError ? "true" : "false"}
                                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804] transition-colors"
                              />
                            </div>
                          </div>

                          {/* Password Field */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label htmlFor="client-password" className="block text-xs font-mono uppercase text-slate-400">
                                Password
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setMode("forgot_password");
                                  setAuthError(null);
                                  setResetSuccess(false);
                                }}
                                className="text-[11px] text-[#e57804] hover:underline cursor-pointer"
                              >
                                Forgot password?
                              </button>
                            </div>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <KeyRound className="w-4 h-4" />
                              </div>
                              <input
                                id="client-password"
                                type={showPassword ? "text" : "password"}
                                required
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                aria-invalid={authError ? "true" : "false"}
                                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804] transition-colors"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Error Alert */}
                          {authError && (
                            <div
                              role="alert"
                              aria-live="assertive"
                              className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200"
                            >
                              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                              <span>{authError}</span>
                            </div>
                          )}

                          {/* Submit Button */}
                          <Button
                            variant="primary"
                            size="md"
                            type="submit"
                            className="w-full mt-2"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                Authenticating...
                              </span>
                            ) : (
                              "Sign In to Portal"
                            )}
                          </Button>
                        </form>
                      </>
                    ) : (
                      <>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <button
                              type="button"
                              onClick={() => {
                                setMode("signin");
                                setAuthError(null);
                                setResetSuccess(false);
                              }}
                              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                            </button>
                          </div>
                          <h2 className="text-xl font-bold text-white">Reset Account Password</h2>
                          <p className="text-xs text-slate-300 mt-1">
                            Enter your registered work email to receive a secure recovery link.
                          </p>
                        </div>

                        {resetSuccess ? (
                          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-3">
                            <div className="flex items-center gap-2 font-semibold text-emerald-400">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              <span>Recovery Email Dispatched</span>
                            </div>
                            <p className="leading-relaxed">
                              If an active account exists for <strong>{email}</strong>, a secure password reset link has been sent. Please inspect your inbox and spam filters.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setMode("signin");
                                setResetSuccess(false);
                              }}
                              className="w-full border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                            >
                              Return to Sign In
                            </Button>
                          </div>
                        ) : (
                          <form onSubmit={handleResetSubmit} className="space-y-4" noValidate>
                            <div>
                              <label htmlFor="reset-email" className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                                Work Email
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                  <Mail className="w-4 h-4" />
                                </div>
                                <input
                                  id="reset-email"
                                  type="email"
                                  required
                                  autoComplete="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  placeholder="client@organization.com"
                                  aria-invalid={authError ? "true" : "false"}
                                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804] transition-colors"
                                />
                              </div>
                            </div>

                            {authError && (
                              <div
                                role="alert"
                                aria-live="assertive"
                                className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200"
                              >
                                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                <span>{authError}</span>
                              </div>
                            )}

                            <Button
                              variant="primary"
                              size="md"
                              type="submit"
                              className="w-full mt-2"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                  Dispatching Link...
                                </span>
                              ) : (
                                "Send Password Reset Link"
                              )}
                            </Button>
                          </form>
                        )}
                      </>
                    )}

                    <div className="pt-2 border-t border-white/10">
                      <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                        Access is provisioned exclusively for enterprise clients and authorized personnel. For account onboarding, please contact your Zakeem account manager or{" "}
                        <Link to="/contact" className="text-[#e57804] hover:underline">
                          contact sales
                        </Link>.
                      </p>
                    </div>
                  </>
                )}

                {/* TAB 2: CREATE ACCOUNT (INVITATION-CONTROLLED) */}
                {activeTab === "create_account" && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-[#e57804]/20 border border-[#e57804]/30 flex items-center justify-center text-[#e57804]">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <Badge variant="neon">Invitation-Based Access</Badge>
                      </div>
                      <h2 className="text-xl font-bold text-white">Create Client Account</h2>
                    </div>

                    {/* Explanatory Callout */}
                    <div className="p-4 rounded-2xl bg-[#06152b] border border-[#e57804]/30 space-y-1.5">
                      <p className="text-xs font-semibold text-white">
                        Have a Zakeem invitation?
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Use your secure invitation link to create your client account. Enter your authorization token or paste your complete invitation link below.
                      </p>
                    </div>

                    {/* Token / Link Input Form */}
                    <form onSubmit={handleInvitationSubmit} className="space-y-4" noValidate>
                      <div>
                        <label htmlFor="invite-token-input" className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                          Invitation Token or Secure Link
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <KeyRound className="w-4 h-4" />
                          </div>
                          <input
                            id="invite-token-input"
                            type="text"
                            required
                            value={inviteInput}
                            onChange={(e) => {
                              setInviteInput(e.target.value);
                              if (inviteInputError) setInviteInputError(null);
                            }}
                            placeholder="Paste your 48-character code or full invitation link"
                            aria-invalid={inviteInputError ? "true" : "false"}
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804] transition-colors"
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          You can paste either the raw 48-character token or the complete URL from your invitation message.
                        </p>
                      </div>

                      {inviteInputError && (
                        <div
                          role="alert"
                          aria-live="assertive"
                          className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200"
                        >
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>{inviteInputError}</span>
                        </div>
                      )}

                      <Button
                        variant="primary"
                        size="md"
                        type="submit"
                        className="w-full mt-2"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Continue with Invitation
                      </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#081c38] px-3 font-mono text-[10px] text-slate-400 tracking-wider">
                          Don't Have an Invitation?
                        </span>
                      </div>
                    </div>

                    {/* Uninvited Visitor Callout */}
                    <div className="p-4 rounded-2xl bg-[#06152b] border border-white/10 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <Sparkles className="w-4 h-4 text-[#e57804] shrink-0" />
                        <span>Enterprise Qualification & Onboarding</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Zakeem client accounts are enterprise-managed and provisioned exclusively following solution qualification, consultation, and enterprise deployment agreement.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        href="/request-demo"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        className="w-full border-[#e57804]/50 text-[#e57804] hover:bg-[#e57804]/10 hover:text-white"
                      >
                        Request Access
                      </Button>
                      <div className="text-center pt-1">
                        <Link to="/contact" className="text-[11px] text-slate-400 hover:text-white hover:underline transition-colors">
                          Speak with Solutions Team →
                        </Link>
                      </div>
                    </div>

                    {/* Return to Sign In */}
                    <div className="pt-2 border-t border-white/10 text-center">
                      <button
                        type="button"
                        onClick={() => handleTabChange("signin")}
                        className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Already have an activated account?{" "}
                        <span className="text-[#e57804] font-medium underline">Sign In</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Secondary Column: External Product & Service Gateways */}
            <div className="lg:col-span-5 space-y-6">
              {/* Zakeem Realty ERP Card */}
              <div
                data-surface="dark"
                className="p-6 rounded-3xl bg-gradient-to-b from-[#0a2347] to-[#040e1d] border border-[#e57804]/40 shadow-xl flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#e57804]/20 border border-[#e57804]/30 flex items-center justify-center mb-3 text-[#e57804]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <Badge variant="neon" className="mb-2">Flagship ERP Platform</Badge>
                  <h3 className="text-lg font-bold text-white">Zakeem Realty ERP</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    Direct access to property sales, land parcel registry, lease accounting, and tenant portal deployments.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  href="https://realty.zakeemsolutions.com"
                  isExternal
                  leftIcon={<KeyRound className="w-4 h-4" />}
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  className="w-full"
                >
                  Sign In to Realty ERP
                </Button>
              </div>

              {/* Executive Support Card */}
              <div
                data-surface="dark"
                className="p-6 rounded-3xl bg-[#081c38] border border-white/10 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-[#e57804]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <Badge variant="neutral" className="mb-2">Service Desk</Badge>
                  <h3 className="text-lg font-bold text-white">Executive Support Desk</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    24/7 mission-critical SLA escalation, cloud infrastructure support, and incident reporting.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  href="/support"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white"
                >
                  Access Support Desk
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
