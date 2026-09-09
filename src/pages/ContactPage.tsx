import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { COMPANY_CONTACT } from "@/data/social";

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
            <div className="lg:col-span-5 p-8 rounded-3xl bg-[#081c38] border border-white/10 space-y-6">
              <h3 className="text-xl font-bold text-white">Direct Contact</h3>

              <div className="space-y-4 text-xs md:text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#e57804] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">General & Corporate</div>
                    <a href={`mailto:${COMPANY_CONTACT.email}`} className="text-slate-400 hover:text-white">
                      {COMPANY_CONTACT.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#e57804] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Enterprise Sales</div>
                    <a href={`mailto:${COMPANY_CONTACT.salesEmail}`} className="text-slate-400 hover:text-white">
                      {COMPANY_CONTACT.salesEmail}
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
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-7 p-8 rounded-3xl bg-[#081c38] border border-white/15">
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
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Engr. Farouk Bello"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="farouk@institution.org"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06152b] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e57804]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Message *
                    </label>
                    <textarea
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
