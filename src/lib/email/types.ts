/**
 * Zakeem Solutions — Email Provider Interface & Abstraction Layer
 * Phase 69: Provider-Agnostic Transactional Email Architecture
 *
 * Defines the canonical contract for transactional email providers.
 * Decouples the application from concrete vendors (Resend, SendGrid, Mailtrap, SES, etc.)
 */

import {
  EmailProviderStatus,
  EmailProviderType,
  NotificationDispatchPayload,
} from "@/types/notification";

export interface OutboundEmailParams {
  to: string;
  recipientName?: string;
  from: string;
  fromName?: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey?: string;
  tags?: Record<string, string>;
}

export interface OutboundEmailResult {
  success: boolean;
  provider: EmailProviderType;
  messageId?: string;
  error?: string;
  statusCode?: number;
  timestamp: string;
}

export interface ProviderVerificationResult {
  success: boolean;
  status: "healthy" | "degraded" | "error";
  latencyMs?: number;
  message?: string;
  error?: string;
}

/**
 * Canonical interface that all email provider adapters must implement.
 */
export interface EmailProvider {
  /** Unique provider identifier */
  readonly id: EmailProviderType;

  /** Human-readable display label */
  readonly name: string;

  /** Whether this is a primary supported first-class provider */
  readonly isFirstClass: boolean;

  /** Checks if the provider is configured in the current runtime context */
  isConfigured(): boolean;

  /** Sends a transactional email through this provider */
  sendEmail(params: OutboundEmailParams): Promise<OutboundEmailResult>;

  /** Verifies API connectivity and credentials */
  verifyProvider(): Promise<ProviderVerificationResult>;

  /** Returns sanitized configuration and health status */
  getProviderStatus(): Promise<{
    configured: boolean;
    status: EmailProviderStatus;
    note?: string;
  }>;

  /** Normalizes provider-specific errors into sanitized user-safe messages */
  normalizeError(error: unknown): string;
}
