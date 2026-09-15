import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  KeyRound, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight 
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export const ResetPasswordPage: React.FC = () => {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!password || password.length < 8) {
      setFormError("Password must be at least 8 characters in length.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("The passwords you entered do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updatePassword(password);
      if (res.success) {
        setResetSuccess(true);
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2500);
      } else {
        setFormError(res.error || "Failed to update password. Your recovery link may have expired.");
      }
    } catch {
      setFormError("An unexpected error occurred. Please request a new recovery link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Set New Password — Zakeem Solutions"
        description="Establish your new secure password for the Zakeem Solutions client portal."
        canonical="https://www.zakeemsolutions.com/reset-password"
      />

      <section className="pt-16 pb-24 border-b border-white/10 min-h-[85vh] flex items-center justify-center">
        <div className="container mx-auto px-4 md:px-6 max-w-md">
          {resetSuccess ? (
            <div data-surface="dark" className="p-8 sm:p-10 rounded-3xl bg-[#081c38] border border-emerald-500/30 text-center space-y-5 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-white">Password Updated Successfully</h1>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Your credentials have been securely updated. Redirecting you to the sign-in gateway...
                </p>
              </div>

              <Button variant="primary" size="sm" href="/login" className="w-full">
                Proceed to Sign In
              </Button>
            </div>
          ) : (
            <div data-surface="dark" className="p-7 sm:p-9 rounded-3xl bg-[#081c38] border border-white/15 shadow-2xl space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#e57804]/20 border border-[#e57804]/30 flex items-center justify-center text-[#e57804]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <Badge variant="neon">Credential Security</Badge>
                </div>
                <h1 className="text-xl font-bold text-white">Set New Password</h1>
                <p className="text-xs text-slate-300 mt-1">
                  Choose a robust password with at least 8 characters to secure your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="new-password" className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-new-password" className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="confirm-new-password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804] transition-colors"
                    />
                  </div>
                </div>

                {formError && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  className="w-full mt-2"
                  disabled={isSubmitting}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Updating Password...
                    </span>
                  ) : (
                    "Save & Update Password"
                  )}
                </Button>
              </form>

              <div className="pt-2 border-t border-white/10 text-center">
                <Link to="/login" className="text-xs text-[#e57804] hover:underline">
                  Back to Client Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};
