import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { 
  ShieldCheck, Lock, Mail, Building2, User, Eye, EyeOff, AlertCircle, 
  CheckCircle2, ArrowRight 
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { verifyInvitation, acceptInvitation } from "@/lib/invitationService";
import { useAuth } from "@/context/AuthContext";
import { InvitationVerificationResult } from "@/types/auth";

export const AcceptInvitationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [isVerifying, setIsVerifying] = useState(true);
  const [verification, setVerification] = useState<InvitationVerificationResult | null>(null);
  
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkToken() {
      if (!token.trim()) {
        if (isMounted) {
          setVerification({ valid: false, error: "No invitation token was provided in the URL." });
          setIsVerifying(false);
        }
        return;
      }

      setIsVerifying(true);
      try {
        const result = await verifyInvitation(token.trim());
        if (isMounted) {
          setVerification(result);
          if (result.valid && result.fullName) {
            setFullName(result.fullName);
          }
        }
      } catch {
        if (isMounted) {
          setVerification({ valid: false, error: "Network error during invitation verification." });
        }
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    }

    checkToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!verification?.valid || !verification.email) {
      setFormError("Invalid or missing invitation context.");
      return;
    }

    if (!fullName.trim()) {
      setFormError("Please provide your full legal or professional name.");
      return;
    }

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
      const res = await acceptInvitation(
        token.trim(),
        password,
        fullName.trim(),
        verification.organization
      );

      if (res.success) {
        setActivationSuccess(true);
        // Automatically sign in the client
        const signInRes = await signIn(verification.email, password);
        if (signInRes.success) {
          navigate("/portal", { replace: true });
        } else {
          // If auto sign-in needs email verification or manual sign-in:
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 2000);
        }
      } else {
        setFormError(res.error || "Failed to activate client account. Please try again.");
      }
    } catch {
      setFormError("An unexpected error occurred during account activation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Accept Enterprise Invitation — Zakeem Solutions"
        description="Activate your authorized Zakeem Solutions enterprise client portal account."
        canonical="https://www.zakeemsolutions.com/accept-invite"
      />

      <section className="pt-16 pb-24 border-b border-white/10 min-h-[85vh] flex items-center justify-center">
        <div className="container mx-auto px-4 md:px-6 max-w-lg">
          {/* Loading State */}
          {isVerifying ? (
            <div data-surface="dark" className="p-10 rounded-3xl bg-[#081c38] border border-white/10 text-center space-y-4">
              <div className="w-10 h-10 rounded-full border-2 border-[#e57804]/20 border-t-[#e57804] animate-spin mx-auto" />
              <div className="text-sm font-bold text-white">Verifying Invitation Token...</div>
              <p className="text-xs text-slate-400">Validating cryptographic credentials against Zakeem Identity.</p>
            </div>
          ) : !verification?.valid ? (
            /* Invalid / Expired State */
            <div data-surface="dark" className="p-8 sm:p-10 rounded-3xl bg-[#081c38] border border-rose-500/30 text-center space-y-5 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                <AlertCircle className="w-7 h-7" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-white">Invitation Unavailable</h1>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {verification?.error || "This invitation token is invalid, has expired, or has already been redeemed."}
                </p>
              </div>

              <div className="pt-3 flex flex-col gap-2.5">
                <Button variant="primary" size="md" href="/request-demo">
                  Request New Demo & Consultation
                </Button>
                <Button variant="ghost" size="sm" href="/login">
                  Return to Client Sign In
                </Button>
              </div>
            </div>
          ) : activationSuccess ? (
            /* Success State */
            <div data-surface="dark" className="p-8 sm:p-10 rounded-3xl bg-[#081c38] border border-emerald-500/30 text-center space-y-5 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-white">Account Successfully Activated</h1>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Your enterprise client profile for <strong>{verification.organization}</strong> has been provisioned. Redirecting you to your portal...
                </p>
              </div>

              <div className="w-6 h-6 rounded-full border-2 border-emerald-400/20 border-t-emerald-400 animate-spin mx-auto mt-4" />
            </div>
          ) : (
            /* Active Provisioning Form */
            <div data-surface="dark" className="p-7 sm:p-9 rounded-3xl bg-[#081c38] border border-white/15 shadow-2xl space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#e57804]/20 border border-[#e57804]/30 flex items-center justify-center text-[#e57804]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <Badge variant="neon">Enterprise Onboarding</Badge>
                </div>
                <h1 className="text-xl font-bold text-white">Activate Client Account</h1>
                <p className="text-xs text-slate-300 mt-1">
                  Complete your profile credentials to access your organization's dedicated environment.
                </p>
              </div>

              {/* Organization Header Banner */}
              <div className="p-3.5 rounded-2xl bg-[#06152b] border border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#e57804] shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Assigned Organization</span>
                  <div className="text-xs font-bold text-white truncate">{verification.organization}</div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Email Field (Read-Only) */}
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                    Authorized Work Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      readOnly
                      value={verification.email || ""}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/5 text-sm text-slate-300 cursor-not-allowed focus:outline-none"
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label htmlFor="client-fullname" className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="client-fullname"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804] transition-colors"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="client-new-password" className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                    Set Portal Password (Min. 8 Characters)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="client-new-password"
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

                {/* Confirm Password */}
                <div>
                  <label htmlFor="client-confirm-password" className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                    Confirm Portal Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="client-confirm-password"
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

                {/* Error Alert */}
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

                {/* Submit Button */}
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
                      Provisioning Account...
                    </span>
                  ) : (
                    "Activate Enterprise Account"
                  )}
                </Button>
              </form>

              <div className="pt-2 border-t border-white/10">
                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  By activating your account, you agree to Zakeem Solutions'{" "}
                  <Link to="/terms" className="text-[#e57804] hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-[#e57804] hover:underline">
                    Privacy Policy
                  </Link>.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};
