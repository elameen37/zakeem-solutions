import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  KeyRound,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

type LoginMode = "signin" | "forgot_password";

export const AdminLoginPage: React.FC = () => {
  const { isAuthenticated, isAdmin, signIn, signOut, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<LoginMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // If already authenticated as administrator, redirect to admin operations desk
  useEffect(() => {
    if (isAuthenticated) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const from = (location.state as any)?.from?.pathname;
      if (from && from !== "/zakeem-admin3100" && from !== "/login") {
        navigate(from, { replace: true });
      } else if (isAdmin) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/portal", { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, navigate, location]);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!email.trim() || !password) {
      setAuthError("Please enter both your administrator work email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signIn(email.trim(), password, "admin");
      if (res.success) {
        if (res.role === "admin") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const from = (location.state as any)?.from?.pathname;
          navigate(from && from.startsWith("/admin") ? from : "/admin", { replace: true });
        } else {
          // Explicit admin authorization check failed
          await signOut();
          setAuthError(
            "Administrative access denied. Your authenticated account does not possess systems administrator privileges. If you are an enterprise client, please use the Client Portal."
          );
        }
      } else {
        setAuthError(res.error || "Authentication failed. Please verify your administrator credentials.");
      }
    } catch {
      setAuthError("An unexpected error occurred during administrative sign-in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!email.trim()) {
      setAuthError("Please provide your registered administrator email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword(email.trim());
      if (res.success) {
        setResetSuccess(true);
      } else {
        setAuthError(res.error || "Could not process administrator password recovery. Please verify your email.");
      }
    } catch {
      setAuthError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Systems Administration Gateway — Zakeem Solutions"
        description="Restricted administrative access gateway."
        canonical="https://www.zakeemsolutions.com/zakeem-admin3100"
        noindex={true}
      />

      <section className="pt-12 pb-20 md:pt-20 md:pb-28 border-b border-white/10 min-h-[85vh] flex items-center justify-center">
        <div className="container mx-auto px-4 md:px-6 max-w-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <Badge variant="neon" className="border-[#e57804]/40 text-[#e57804]">
                Restricted Administration Gate
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight mb-2">
              Systems Administration Gateway
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Restricted to authorized systems administrators, site reliability engineers, and technical operations personnel.
            </p>
          </div>

          {/* Primary Admin Authentication Card */}
          <div
            data-surface="dark"
            className="p-7 sm:p-9 rounded-3xl bg-[#081c38] border border-white/15 shadow-2xl space-y-6"
          >
            {mode === "signin" ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#e57804]/20 border border-[#e57804]/30 flex items-center justify-center text-[#e57804] shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Administrator Authentication</h2>
                    <p className="text-xs text-slate-400">
                      Sign in with your verified operational credentials.
                    </p>
                  </div>
                </div>

                {/* Explicit Admin Authorization Notice */}
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed text-[11px]">
                    Administrator authorization is cryptographically verified via server-side RBAC claims. All authentication events and access attempts are audited.
                  </span>
                </div>

                <form onSubmit={handleSignInSubmit} className="space-y-4" noValidate>
                  <div>
                    <label
                      htmlFor="admin-email"
                      className="block text-xs font-mono uppercase text-slate-400 mb-1.5"
                    >
                      Administrator Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="admin-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@zakeemsolutions.com"
                        aria-invalid={authError ? "true" : "false"}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="admin-password"
                        className="block text-xs font-mono uppercase text-slate-400"
                      >
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
                        id="admin-password"
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
                    className="w-full mt-2 bg-[#e57804] hover:bg-[#cf6b03] text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Verifying Admin Authorization...
                      </span>
                    ) : (
                      "Authenticate Administrator"
                    )}
                  </Button>
                </form>
              </>
            ) : (
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
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Administrator Sign In
                  </button>
                </div>
                <h2 className="text-xl font-bold text-white">Reset Administrator Password</h2>
                <p className="text-xs text-slate-300 mt-1">
                  Enter your registered administrator work email to receive a secure recovery token.
                </p>

                {resetSuccess ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-3 mt-4">
                    <div className="flex items-center gap-2 font-semibold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Recovery Email Dispatched</span>
                    </div>
                    <p className="leading-relaxed">
                      If an administrator account exists for <strong>{email}</strong>, a secure password reset link has been dispatched.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMode("signin");
                        setAuthError(null);
                        setResetSuccess(false);
                      }}
                      className="w-full border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                    >
                      Return to Sign In
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleResetSubmit} className="space-y-4 mt-4" noValidate>
                    <div>
                      <label
                        htmlFor="admin-reset-email"
                        className="block text-xs font-mono uppercase text-slate-400 mb-1.5"
                      >
                        Administrator Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          id="admin-reset-email"
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="admin@zakeemsolutions.com"
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
                      className="w-full mt-2 bg-[#e57804] hover:bg-[#cf6b03] text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Sending Recovery Link...
                        </span>
                      ) : (
                        "Send Recovery Link"
                      )}
                    </Button>
                  </form>
                )}
              </div>
            )}

            {/* Back to Public Gateway link */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <Link
                to="/login"
                className="hover:text-white transition-colors flex items-center gap-1 font-mono"
              >
                <Lock className="w-3.5 h-3.5 text-[#e57804]" />
                <span>Client Portal Login</span>
              </Link>
              <Link
                to="/"
                className="hover:text-white transition-colors flex items-center gap-1 font-mono"
              >
                <span>Main Website</span>
                <ArrowRight className="w-3 h-3 text-[#e57804]" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
