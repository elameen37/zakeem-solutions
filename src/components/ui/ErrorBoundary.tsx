import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { recordAuditEvent } from "@/lib/auditTelemetry";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Enterprise Application Error Boundary
 * Catches unhandled runtime exceptions in the component tree,
 * prevents blank white screens, and offers user-friendly session recovery.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    recordAuditEvent({
      eventType: "application.unexpected_error",
      entityType: "application",
      errorCategory: "UNEXPECTED",
      metadata: {
        errorName: error.name || "RuntimeError",
        errorMessage: error.message ? error.message.substring(0, 200) : "Unknown component error",
        pathname: typeof window !== "undefined" ? window.location.pathname : "/",
      },
    });

    // In dev / audit environments, log to console for debugging
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary caught component crash]:", error, errorInfo);
    }
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  private handleGoHome = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-[#e57804]/30 selection:text-white">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#081c38]/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden text-center">
            {/* Ambient glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#e57804]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Status indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono mb-6">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>SYSTEM INTERFACE INTERRUPTED</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
              Application Interface Failure
            </h1>

            <p className="text-sm sm:text-base text-slate-300 mb-8 leading-relaxed">
              An unexpected runtime exception interrupted the rendering interface. The system prevented state corruption and logged the operational boundary.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                onClick={this.handleReset}
                className="w-full sm:w-auto"
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Reload Session
              </Button>
              <Button
                variant="secondary"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto"
                leftIcon={<Home className="w-4 h-4" />}
              >
                Return to Home
              </Button>
            </div>

            {/* Non-sensitive debug view in development mode only */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mt-6 text-left p-3 rounded-xl bg-black/40 border border-white/5 overflow-auto max-h-32 text-xs font-mono text-slate-400">
                <span className="text-red-400 font-semibold">{this.state.error.name}: </span>
                {this.state.error.message}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
