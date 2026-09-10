import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, Check, Linkedin, Facebook, Instagram, Shield, Globe, Terminal
} from "lucide-react";
import { FOOTER_NAVIGATION } from "@/data/navigation";
import { SOCIAL_LINKS, COMPANY_CONTACT } from "@/data/social";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={cn("fill-current", className)} aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TikTokIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={cn("fill-current", className)} aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.33a6.33 6.33 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.71a8.18 8.18 0 0 0 4.78 1.52v-3.4a4.85 4.85 0 0 1-1-.14z" />
  </svg>
);

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const getSocialIcon = (iconName: string) => {
    const props = { className: "w-4 h-4 text-slate-300 hover:text-[#e57804] transition-colors" };
    switch (iconName) {
      case "Linkedin": return <Linkedin {...props} />;
      case "X": return <XIcon {...props} />;
      case "Instagram": return <Instagram {...props} />;
      case "Facebook": return <Facebook {...props} />;
      case "TikTok": return <TikTokIcon {...props} />;
      case "Twitter": return <XIcon {...props} />;
      default: return <Globe {...props} />;
    }
  };

  return (
    <footer data-surface="dark" className="bg-[#040e1d] border-t border-white/10 text-slate-300 text-sm relative z-20 overflow-hidden">
      {/* Subtle top architectural line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#e57804]/50 to-transparent" />

      {/* Main Enterprise Footer Content */}
      <div className="container mx-auto px-4 md:px-6 py-16 lg:py-20 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 pb-14 border-b border-white/10">
          {/* Brand & Mission Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="inline-block group">
              <div className="bg-white p-2.5 px-4 rounded-xl border border-white/20 shadow-lg shadow-black/40 inline-flex items-center group-hover:shadow-[#e57804]/25 group-hover:border-[#e57804]/50 transition-all">
                <img
                  src="/assets/logos/footer-logo.png"
                  alt="Zakeem Solutions"
                  className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                />
              </div>
            </Link>

            <p className="text-xs font-mono tracking-widest text-[#e57804] uppercase font-semibold">
              Technology • Intelligence • Delivery
            </p>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              Zakeem Solutions is an enterprise technology and digital transformation company delivering mission-critical software engineering, AI-powered automation, enterprise ERP platforms, and sovereign digital infrastructure.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-white block mb-2">
                Executive Tech & Architecture Briefing
              </span>
              {subscribed ? (
                <div className="flex items-center gap-2 text-xs text-[#e57804] bg-[#e57804]/10 px-3 py-2 rounded-lg border border-[#e57804]/30">
                  <Check className="w-4 h-4" />
                  <span>Subscribed to Executive Briefings.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@enterprise.com"
                    required
                    aria-label="Corporate work email for executive briefing"
                    className="flex-1 bg-[#06152b] border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-[#e57804]"
                  />
                  <Button variant="primary" size="sm" type="submit">
                    Join
                  </Button>
                </form>
              )}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow Zakeem Solutions on ${s.platform} (@${s.handle})`}
                  title={`${s.platform}: @${s.handle}`}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#e57804]/20 hover:border-[#e57804]/40 transition-all focus:outline-none focus:ring-2 focus:ring-[#e57804] focus:ring-offset-2 focus:ring-offset-[#040e1d]"
                >
                  {getSocialIcon(s.icon)}
                </a>
              ))}
            </div>
          </div>

          {/* Column: Products */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
              Products
            </h4>
            <ul className="space-y-2.5 text-xs">
              {FOOTER_NAVIGATION.products.map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="text-slate-300 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column: Solutions */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
              Solutions
            </h4>
            <ul className="space-y-2.5 text-xs">
              {FOOTER_NAVIGATION.solutions.map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="text-slate-300 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column: Services */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
              Services
            </h4>
            <ul className="space-y-2.5 text-xs">
              {FOOTER_NAVIGATION.services.map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="text-slate-300 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column: Company & Resources */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs">
              {FOOTER_NAVIGATION.company.map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="text-slate-300 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
              {FOOTER_NAVIGATION.resources.map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="text-slate-300 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Operational Status & Architecture Bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[#e57804]">
              <span className="w-2 h-2 rounded-full bg-[#e57804] animate-pulse" />
              All Systems Operational
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">99.99% Enterprise Uptime</span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <span>Engineering Hub: Abuja / Lagos</span>
            <span className="text-slate-500">|</span>
            <span>Domain: www.zakeemsolutions.com</span>
          </div>
        </div>

        {/* Bottom Legal & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} Zakeem Solutions. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/support" className="hover:text-white transition-colors">
              Support Center
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};