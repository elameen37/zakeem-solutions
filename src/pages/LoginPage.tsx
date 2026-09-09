import React from "react";
import { Link } from "react-router-dom";
import { KeyRound, ShieldCheck, ExternalLink, ArrowRight, Building2, BrainCircuit } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const LoginPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Client & Customer Portal Gateway — Zakeem Solutions"
        description="Access your dedicated Zakeem product instances, including Zakeem Realty ERP and Customer Portal."
        canonical="https://www.zakeemsolutions.com/login"
      />

      <section className="pt-12 pb-20 md:pt-20 md:pb-28 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="flex justify-center mb-4">
              <Badge variant="blue">Ecosystem Access Gate</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Zakeem Identity & Product Gateway
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Select your deployed application or authenticated client environment to proceed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Zakeem Realty ERP Gateway */}
            <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-b from-[#0a2347] to-[#040e1d] border border-[#e57804]/50 shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#e57804]/20 border border-[#e57804]/30 flex items-center justify-center mb-4 text-[#e57804]">
                  <Building2 className="w-6 h-6" />
                </div>
                <Badge variant="neon" className="mb-2">Flagship ERP</Badge>
                <h3 className="text-xl font-bold text-white mb-2">Zakeem Realty ERP</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  Log in to your developer, property management, or tenant portal instance.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                href="https://realty.zakeemsolutions.com"
                isExternal
                leftIcon={<KeyRound className="w-4 h-4" />}
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                className="w-full"
              >
                Sign In to Realty ERP
              </Button>
            </div>

            {/* Enterprise Support & Admin Portal */}
            <div className="p-6 md:p-8 rounded-2xl bg-[#081c38] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-[#e57804]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <Badge variant="neutral" className="mb-2">Client Portal</Badge>
                <h3 className="text-xl font-bold text-white mb-2">Executive Support</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Manage ongoing software engineering pods, tickets, and cloud SLAs.
                </p>
              </div>

              <Button
                variant="outline"
                size="md"
                href="/support"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full"
              >
                Access Support Desk
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
