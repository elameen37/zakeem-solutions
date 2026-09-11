import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, CheckCircle2, ArrowRight, Linkedin, Facebook, Instagram, Youtube, Globe } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { COMPANY_CONTACT, SOCIAL_LINKS } from "@/data/social";
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

const getSocialIcon = (iconName: string) => {
  const props = { className: "w-4 h-4 text-slate-300 group-hover:text-[#e57804] transition-colors" };
  switch (iconName) {
    case "Linkedin": return <Linkedin {...props} />;
    case "X": return <XIcon {...props} />;
    case "Instagram": return <Instagram {...props} />;
    case "Facebook": return <Facebook {...props} />;
    case "TikTok": return <TikTokIcon {...props} />;
    case "YouTube": return <Youtube {...props} />;
    case "Youtube": return <Youtube {...props} />;
    default: return <Globe {...props} />;
  }
};

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <SEO
        title="Contact Enterprise Sales & Architecture — Zakeem Solutions"
        description="Initiate an engagement with Zakeem Solutions enterprise sales and technical leadership."
        canonical="https://www.zakeemsolutions.com/contact"
      />

      <section className="pt-12 pb-20 md:pt-20 md:pb-28 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <SectionHeader
            badge="Direct Engagement"
            title="Connect with Our Leadership &"
            highlightedWord="Solutions Architecture."
            description="Whether you require an executive technology consultation, enterprise software deployment, or technical partnership, our directors are available to assist."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
            {/* Contact Details */}
            <div data-surface="dark" className="lg:col-span-5 p-8 rounded-3xl bg-[#081c38] border border-white/10 space-y-6">
              <h3 className="text-xl font-bold text-white">Direct Contact</h3>

              <div className="space-y-4 text-xs md:text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#e57804] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">General & Corporate</div>
                    <a href={`mailto:${COMPANY_CONTACT.email}`} className="text-slate-400 hover:text-white transition-colors">
                      {COMPANY_CONTACT.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#e57804] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Enterprise Sales</div>
                    <a href={`mailto:${COMPANY_CONTACT.salesEmail}`} className="text-slate-400 hover:text-white transition-colors">
                      {COMPANY_CONTACT.salesEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#e57804] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Direct Line / Mobile</div>
                    <a href={`tel:${COMPANY_CONTACT.mobile.replace(/\s+/g, '')}`} className="text-slate-400 hover:text-white transition-colors font-mono">
                      {COMPANY_CONTACT.mobile}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Headquarters</div>
                    <div className="text-slate-400">{COMPANY_CONTACT.address}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Operating Hours</div>
                    <div className="text-slate-400">{COMPANY_CONTACT.hours}</div>
                  </div>
                </div>

                {/* Official Social Channels */}
                <div className="pt-4 border-t border-white/10">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
                    Official Social Channels
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {SOCIAL_LINKS.map((s) => (
                      <a
                        key={s.platform}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Connect with Zakeem Solutions on ${s.platform} (@${s.handle})`}
                        title={`${s.platform}: @${s.handle}`}
                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-[#e57804] hover:bg-[#e57804]/20 hover:border-[#e57804]/40 transition-all focus:outline-none focus:ring-2 focus:ring-[#e57804]"
                      >
                        {getSocialIcon(s.icon)}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div data-surface="dark" className="lg:col-span-7 p-8 rounded-3xl bg-[#081c38] border border-white/15">
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-[#e57804] mx-auto" />
                  <h3 className="text-2xl font-bold text-white">Message Transmitted</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Thank you. Your enquiry has been routed directly to our Executive Technology Desk.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-2">Send Message</h3>

                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Full Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Engr. Farouk Bello"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804]"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="farouk@institution.org"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804]"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Message *
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your inquiry..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804]"
                    />
                  </div>

                  <Button variant="primary" size="md" type="submit" className="w-full">
                    Submit Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
