import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Search, Compass, Code2, Network, Rocket, Activity, 
  CheckCircle2, ArrowRight, Terminal, Shield, Cpu, Layers,
  ChevronRight, Pause, Play
} from "lucide-react";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface WorkflowStage {
  id: string;
  stepNumber: string;
  code: string;
  title: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  enterpriseTransformation: string;
  deliverables: string[];
  metrics: { label: string; value: string }[];
  consoleTitle: string;
  consoleSnippet: string;
  verificationBadge: string;
}

const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: "discover",
    stepNumber: "01",
    code: "PHASE: AUDIT",
    title: "DISCOVER",
    tagline: "Forensic Architecture & Systems Audit",
    icon: Search,
    description:
      "We dissect legacy data schemas, transaction pipelines, compliance obligations, and operational bottlenecks before drafting a single line of production code.",
    enterpriseTransformation:
      "Eliminates speculative development. Replaces assumptions with mathematical audits of real transaction volumes and failure modes.",
    deliverables: [
      "Full Forensic Data Schema Profiler",
      "Network & Security Attack Surface Map",
      "Legacy Concurrency & Latency Stress Profile",
      "Regulatory & Sovereign Compliance Matrix"
    ],
    metrics: [
      { label: "Schema Coverage", value: "100%" },
      { label: "Uncovered Bottlenecks", value: "Audit-Proven" },
      { label: "Spec Accuracy", value: "Mathematical" }
    ],
    consoleTitle: "zakeem-audit --profile=enterprise-core --format=telemetry",
    consoleSnippet: `[AUDIT_INIT] Scanning relational topologies (PostgreSQL, Oracle, MSSQL)...
[INSPECT] Identified 1,482 table definitions across 12 legacy silos.
[DISCOVERY] Detected 3 unindexed foreign-key cascades causing lock timeouts.
[SECURITY] Flagged 14 perimeter endpoints lacking mutual-TLS enforcement.
[SYNTHESIS] Generated formal domain invariant specification -> audit_v2.json
[STATUS] Discovery complete. Zero architectural ambiguities remaining.`,
    verificationBadge: "Audit Signed & Verified"
  },
  {
    id: "architect",
    stepNumber: "02",
    code: "PHASE: DESIGN",
    title: "ARCHITECT",
    tagline: "Typed Domain Design & Zero-Trust Threat Modeling",
    icon: Compass,
    description:
      "We engineer the blueprint using domain-driven design, immutable event logs, formal concurrency boundaries, and cryptographic security fabrics.",
    enterpriseTransformation:
      "Transitions your enterprise from brittle monolithic dependencies to cleanly isolated, self-healing bounded contexts.",
    deliverables: [
      "C4 System Architecture & Data Flow Blueprints",
      "Zero-Trust Mutual-TLS & HSM Security Spec",
      "Strict Typed Schema Contracts (Protobuf/OpenAPI)",
      "High-Availability Multi-Region Failover Strategy"
    ],
    metrics: [
      { label: "Fault Isolation", value: "100% Air-Tapped" },
      { label: "Security Posture", value: "Zero-Trust" },
      { label: "API Contracts", value: "Strictly Typed" }
    ],
    consoleTitle: "zakeem-spec --validate --model=domain-contracts.proto",
    consoleSnippet: `syntax = "proto3";
package zakeem.enterprise.v1;

message SettlementLedger {
  string transaction_id = 1 [(validate.rules).string.uuid = true];
  int64 amount_cents = 2 [(validate.rules).int64.gt = 0];
  Currency currency = 3;
  bytes cryptographic_attestation = 4;
  google.protobuf.Timestamp settled_at = 5;
}
// [VERIFIED] All 48 microservice interfaces bounded. 0 untyped payloads.`,
    verificationBadge: "C4 Architecture Approved"
  },
  {
    id: "build",
    stepNumber: "03",
    code: "PHASE: IMPLEMENT",
    title: "BUILD",
    tagline: "High-Consequence Software & Automated CI/CD",
    icon: Code2,
    description:
      "Our senior engineering pods build production backends, distributed data pipelines, and responsive interfaces with strict unit, integration, and fuzz testing.",
    enterpriseTransformation:
      "Replaces superficial agency code with mission-critical systems engineering engineered for decades of high-concurrency operation.",
    deliverables: [
      "Idiomatic Microservices (Go, Rust, TypeScript)",
      "Automated CI/CD Pipelines with Static Analysis",
      "Fuzz Testing & Concurrency Race Detectors",
      "Embedded Zakky & Cortex AI Inference Pipelines"
    ],
    metrics: [
      { label: "Test Coverage", value: "> 95% Branch" },
      { label: "Target Latency", value: "< 250ms p99" },
      { label: "Race Conditions", value: "0 Detected" }
    ],
    consoleTitle: "zakeem-ci --run-suite=enterprise-all --strict",
    consoleSnippet: `=== RUN   TestConcurrentDoubleEntryPosting
=== PASS  TestConcurrentDoubleEntryPosting (0.04s)
=== RUN   TestHSMKeyRotationUnderLoad
=== PASS  TestHSMKeyRotationUnderLoad (0.12s)
PASS: 1,842 unit, 312 integration, 40 fuzz tests passed.
Coverage: 96.8% of statements. 0 race conditions detected.
Build artifact: docker.zakeem.internal/core:v2.4.0-release`,
    verificationBadge: "CI/CD Strict Pass"
  },
  {
    id: "integrate",
    stepNumber: "04",
    code: "PHASE: MESH",
    title: "INTEGRATE",
    tagline: "Legacy Core Bridging & Real-Time Event Mesh",
    icon: Network,
    description:
      "We connect the new platform directly into your existing banking switches, payment gateways, ERP registries, and government portals without disrupting live operations.",
    enterpriseTransformation:
      "Unifies previously disconnected corporate tools into a single, synchronized operational nervous system.",
    deliverables: [
      "Kafka / Redpanda Distributed Event Mesh",
      "Commercial Banking Switch Adapters (ISO 20022)",
      "Bi-Directional Real-Time Schema Synchronization",
      "Idempotent Event Deduplication Rails"
    ],
    metrics: [
      { label: "Data Integrity", value: "100.0%" },
      { label: "Event Latency", value: "< 15ms" },
      { label: "Packet Loss", value: "Zero Loss" }
    ],
    consoleTitle: "zakeem-mesh --status --cluster=primary-event-rail",
    consoleSnippet: `[MESH_STATUS] Active cluster: 5 brokers across 3 sovereign AZs.
[TOPIC: ledger.transactions] Ingress: 14,280 msg/sec | Lag: 0ms
[BRIDGE: legacy-sap-sync] Stream replay active (0 drift, 100% matched)
[CONNECTOR: nip-switch] Mutual-TLS handshake verified. 99.999% ACK.
[HEALTH] Zero dropped packets across 48,000,000 processed events.`,
    verificationBadge: "Event Mesh Synchronized"
  },
  {
    id: "launch",
    stepNumber: "05",
    code: "PHASE: CUTOVER",
    title: "LAUNCH",
    tagline: "Zero-Downtime Sovereign Cutover",
    icon: Rocket,
    description:
      "We orchestrate canary cutovers, shadow-mode parallel runs, and blue/green traffic shifts with automated rollback safeguards and real-time reconciliation.",
    enterpriseTransformation:
      "De-risks production cutovers completely. No midnight outages, no data loss, and no disrupted end-users.",
    deliverables: [
      "Blue/Green Sovereign Kubernetes Rollout",
      "Automated Parallel Shadow-Mode Ledger Run",
      "Zero-Downtime DNS & Traffic Canary Shift",
      "Instant Automated Rollback Safety Rail"
    ],
    metrics: [
      { label: "Downtime", value: "0 Seconds" },
      { label: "Ledger Parity", value: "100% Reconciled" },
      { label: "Canary Rollout", value: "10% -> 100%" }
    ],
    consoleTitle: "zakeem-deploy --target=sovereign-production --canary",
    consoleSnippet: `[CANARY] Shifting 10% live traffic to v2.4.0 blue cluster...
[TELEMETRY] HTTP 200 rate: 99.998% | Latency p99: 42ms | Error rate: 0.00%
[RECONCILIATION] Validated 50,000 parallel ledger transactions: 0 discrepancy.
[CANARY_ADVANCE] Shifting traffic: 50% -> 100% cutover.
[SUCCESS] Traffic fully migrated. Green cluster scaled to standby.
[STATUS] Zero downtime observed during cutover window.`,
    verificationBadge: "Zero-Downtime Cutover"
  },
  {
    id: "scale",
    stepNumber: "06",
    code: "PHASE: EXPAND",
    title: "SCALE",
    tagline: "Autonomous Telemetry, SRE SLAs & Elastic Self-Healing",
    icon: Activity,
    description:
      "Post-launch, our dedicated Site Reliability Engineering pods provide 24/7 proactive monitoring, autonomous horizontal scaling, and continuous performance tuning.",
    enterpriseTransformation:
      "Your technology platform becomes a durable, expanding competitive moat that effortlessly scales as your transaction volume multiplies 10x.",
    deliverables: [
      "Multi-Region Autoscaling & Load Rebalancing",
      "eBPF Kernel-Level Deep Observability",
      "24/7 Dedicated SRE Pod with 15-Min Response",
      "Quarterly Architecture Expansion Sprints"
    ],
    metrics: [
      { label: "Guaranteed SLA", value: "Up to 99.99%" },
      { label: "Critical Response", value: "< 15 Mins" },
      { label: "Autoscale Range", value: "10x Burst" }
    ],
    consoleTitle: "zakeem-sre --cluster-health --metrics=realtime",
    consoleSnippet: `[AUTOSCALER] Horizontal pod autoscaler active. Current pods: 48 / 120 max.
[OBSERVABILITY] Prometheus / Grafana eBPF probes: 0 kernel drops.
[SRE_WATCH] 24/7 on-call pod assigned: Primary Engineer + Lead Architect.
[PERFORMANCE] p99 response time: 38ms (Target: < 250ms).
[SLA_ATTESTATION] Rolling 365-day uptime: 99.992% compliance verified.`,
    verificationBadge: "SRE 24/7 SLAs Active"
  }
];

export const TheZakeemStandard: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeStage = WORKFLOW_STAGES[activeIndex];

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % WORKFLOW_STAGES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + WORKFLOW_STAGES.length) % WORKFLOW_STAGES.length);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      setIsAutoPlaying(false);
      handleNext();
    } else if (e.key === "ArrowLeft") {
      setIsAutoPlaying(false);
      handlePrev();
    }
  };

  // Auto-play timer (pauses on user interaction, respects reduced motion)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mediaQuery.matches) {
        setIsAutoPlaying(false);
        return;
      }
    }

    if (!isAutoPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      handleNext();
    }, 6500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlaying, handleNext]);

  return (
    <section 
      id="the-zakeem-standard" 
      className="py-20 lg:py-32 bg-[#040e1d] border-t border-white/10 relative overflow-hidden"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="The Zakeem Standard: Enterprise Delivery Workflow"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#e57804]/10 via-[#06152b]/5 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <Badge variant="neon">Enterprise Delivery Framework</Badge>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            The Zakeem Standard:{" "}
            <span className="bg-gradient-to-r from-white via-amber-200 to-[#e57804] bg-clip-text text-transparent">
              Zero-Failure Transformation.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300 mt-4 leading-relaxed">
            World-class enterprise software is not built by chance. We follow a mathematically structured, 6-stage transformation pipeline engineered to eliminate technical risk and guarantee high-concurrency uptime.
          </p>

          {/* Controls pill bar */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-slate-300 bg-white/5 border border-white/10 hover:border-[#e57804]/50 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#e57804]"
              aria-label={isAutoPlaying ? "Pause auto-advancing stages" : "Resume auto-advancing stages"}
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="w-3 h-3 text-[#e57804]" />
                  <span>Autoplay Active (6.5s)</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-emerald-400" />
                  <span>Autoplay Paused</span>
                </>
              )}
            </button>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Use ← / → keys to navigate
            </span>
          </div>
        </div>

        {/* 6-STAGE INTERACTIVE PROGRESSION RAIL */}
        <div className="relative mb-10">
          {/* Connecting Track Bar */}
          <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-0.5 bg-white/10 -translate-y-1/2 z-0" />
          <div 
            className="hidden lg:block absolute top-1/2 left-4 h-0.5 bg-gradient-to-r from-[#e57804] via-amber-300 to-[#e57804] -translate-y-1/2 transition-all duration-500 z-0"
            style={{ width: `${(activeIndex / (WORKFLOW_STAGES.length - 1)) * 95}%` }}
          />

          {/* Stage Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 relative z-10" role="tablist">
            {WORKFLOW_STAGES.map((stage, idx) => {
              const isActive = idx === activeIndex;
              const isPassed = idx < activeIndex;
              const Icon = stage.icon;

              return (
                <button
                  key={stage.id}
                  role="tab"
                  id={`tab-${stage.id}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${stage.id}`}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setActiveIndex(idx);
                  }}
                  className={cn(
                    "flex flex-col items-start p-3 sm:p-4 rounded-xl border text-left transition-all duration-300 relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#e57804]",
                    isActive
                      ? "bg-[#081c38] border-[#e57804] shadow-lg shadow-[#e57804]/15 scale-[1.02]"
                      : isPassed
                      ? "bg-[#06152b]/80 border-white/20 hover:border-white/40"
                      : "bg-[#051122]/60 border-white/5 hover:border-white/15 opacity-80 hover:opacity-100"
                  )}
                >
                  {/* Top indicators */}
                  <div className="flex items-center justify-between w-full mb-2">
                    <span 
                      className={cn(
                        "text-xs font-mono font-bold px-1.5 py-0.5 rounded",
                        isActive
                          ? "bg-[#e57804] text-black"
                          : isPassed
                          ? "bg-amber-400/20 text-amber-300"
                          : "bg-white/5 text-slate-400"
                      )}
                    >
                      {stage.stepNumber}
                    </span>
                    <div 
                      className={cn(
                        "w-6 h-6 rounded-md flex items-center justify-center transition-colors",
                        isActive 
                          ? "bg-[#e57804]/20 text-[#e57804]" 
                          : isPassed 
                          ? "text-amber-300" 
                          : "text-slate-400 group-hover:text-white"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Stage Title */}
                  <div className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block mb-0.5">
                    {stage.code}
                  </div>
                  <div className={cn("text-sm sm:text-base font-bold tracking-tight", isActive ? "text-white" : "text-slate-300")}>
                    {stage.title}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE STAGE DEEP INSPECTION STAGE CARD */}
        <div 
          id={`panel-${activeStage.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeStage.id}`}
          className="rounded-3xl bg-gradient-to-br from-[#081c38] via-[#06152b] to-[#040e1d] border border-white/15 p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Stage Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#e57804]/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Column: Stage Narrative & Deliverables */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-[#e57804] px-2 py-0.5 rounded bg-[#e57804]/10 border border-[#e57804]/30">
                    STAGE {activeStage.stepNumber} OF 06
                  </span>
                  <Badge variant="blue">{activeStage.verificationBadge}</Badge>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {activeStage.tagline}
                </h3>
                <p className="text-sm sm:text-base text-slate-200 mt-3 leading-relaxed">
                  {activeStage.description}
                </p>
              </div>

              {/* Enterprise Transformation Callout */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#e57804] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-mono font-semibold text-amber-300 uppercase tracking-wider mb-1">
                      Business Outcome Guarantee
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {activeStage.enterpriseTransformation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Deliverables List */}
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Core Stage Deliverables & Artifacts:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeStage.deliverables.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-[#e57804] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stage Outcome Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                {activeStage.metrics.map((metric, i) => (
                  <div key={i}>
                    <div className="text-base sm:text-lg font-mono font-extrabold text-white">
                      {metric.value}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Next Step Guidance */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  href="/request-demo"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Schedule Architectural Consultation
                </Button>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                >
                  <span>Next: {WORKFLOW_STAGES[(activeIndex + 1) % WORKFLOW_STAGES.length].title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#e57804]" />
                </button>
              </div>
            </div>

            {/* Right Column: Interactive Telemetry & Deliverable Console */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-[#030913] border border-white/15 overflow-hidden shadow-2xl">
                {/* Console Window Chrome */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#061120] border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="text-xs font-mono text-slate-400 ml-2 hidden sm:inline">
                      zakeem-pipeline-monitor // stage-0{activeStage.stepNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>VERIFIED</span>
                  </div>
                </div>

                {/* Console Command Bar */}
                <div className="px-4 py-2 bg-black/60 border-b border-white/5 flex items-center gap-2 text-xs font-mono text-amber-300/90">
                  <Terminal className="w-3.5 h-3.5 text-[#e57804]" />
                  <span className="truncate">{activeStage.consoleTitle}</span>
                </div>

                {/* Console Output Screen */}
                <div className="p-4 sm:p-5 font-mono text-xs sm:text-[13px] leading-relaxed text-slate-300 overflow-x-auto min-h-[220px] max-h-[300px]">
                  <pre className="whitespace-pre-wrap font-mono">
                    <code>{activeStage.consoleSnippet}</code>
                  </pre>
                </div>

                {/* Console Footer Status */}
                <div className="px-4 py-2.5 bg-[#061120] border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-[#e57804]" />
                    <span>Engine: Zakeem Automated Verification Mesh</span>
                  </div>
                  <span className="text-[#e57804] font-semibold">STAGE 0{activeStage.stepNumber}/06</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
