import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/ui/CTASection";

export const InsightsPage: React.FC = () => {
  const articles = [
    {
      title: "The Architecture of Pan-African Real Estate Digitization",
      date: "September 2026",
      readTime: "8 min read",
      category: "Real Estate Tech",
      summary: "How modern GIS beacon mapping, off-plan escrow accounting, and automated title registration are overcoming systemic real estate transaction friction."
    },
    {
      title: "Deploying Sovereign AI Models in Banking Environments",
      date: "August 2026",
      readTime: "11 min read",
      category: "AI & Cybersecurity",
      summary: "Guiding banks through on-premise LLM fine-tuning, NDPR data sovereignty, and real-time anti-money laundering inference."
    },
    {
      title: "Decoupling Legacy Government Cores into Event-Driven Microservices",
      date: "July 2026",
      readTime: "6 min read",
      category: "Enterprise Architecture",
      summary: "Lessons from digitizing public citizen registries processing millions of daily queries with zero scheduled downtime."
    }
  ];

  return (
    <>
      <SEO
        title="Insights & Architecture Whitepapers — Zakeem Solutions"
        description="Engineering insights, whitepapers, and strategic perspectives from Zakeem Solutions technology leadership."
        canonical="https://www.zakeemsolutions.com/insights"
      />
      <section className="pt-12 pb-20 md:pt-20 md:pb-28 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <SectionHeader
            badge="Engineering Perspectives"
            title="Insights, Whitepapers &"
            highlightedWord="Architecture."
            description="Deep technical analyses on high-scale software engineering, AI deployment in emerging markets, and enterprise system resilience."
          />
          <div className="space-y-6 mt-12">
            {articles.map((art, idx) => (
              <div key={idx} className="p-6 md:p-8 rounded-2xl bg-[#081c38] border border-white/10 hover:border-[#e57804]/50 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="blue">{art.category}</Badge>
                  <span className="text-xs font-mono text-slate-400">{art.date} • {art.readTime}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{art.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">{art.summary}</p>
                <Link to="/request-demo" className="text-xs font-semibold text-[#e57804] hover:text-[#e57804] inline-flex items-center gap-1">
                  <span>Read Briefing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CTASection />
    </>
  );
};
