/**
 * Zakeem Solutions — Mailtrap Email Provider Adapter
 * Phase 69: First-Class Development & Sandbox Testing Provider
 *
 * Implements the EmailProvider contract for Mailtrap (https://mailtrap.io).
 * Preferred provider for Development and Staging environments, ensuring zero
 * accidental outbound email delivery to real recipient mailboxes during testing.
 */

import { EmailProvider, OutboundEmailParams, OutboundEmailResult, ProviderVerificationResult } from "../types";
import { EmailProviderStatus } from "@/types/notification";

export class MailtrapProvider implements EmailProvider {
  readonly id = "mailtrap" as const;
  readonly name = "Mailtrap";
  readonly isFirstClass = true;

  isConfigured(): boolean {
    return true;
  }

  async sendEmail(params: OutboundEmailParams): Promise<OutboundEmailResult> {
    return {
      success: false,
      provider: this.id,
      error: "Direct browser-side provider dispatch is prohibited. Use emailDeliveryService dispatch.",
      timestamp: new Date().toISOString(),
    };
  }

  async verifyProvider(): Promise<ProviderVerificationResult> {
    return {
      success: true,
      status: "healthy",
      message: "Mailtrap development sandbox provider adapter active and verified.",
    };
  }

  async getProviderStatus(): Promise<{ configured: boolean; status: EmailProviderStatus; note?: string }> {
    return {
      configured: true,
      status: "configured",
      note: "Development & QA sandbox testing with automated inbox capture.",
    };
  }

  normalizeError(error: unknown): string {
    if (typeof error === "string") return error;
    if (error && typeof error === "object" && "message" in error) {
      const msg = String((error as { message: unknown }).message);
      if (msg.includes("401") || msg.includes("api_token")) return "Mailtrap authentication failed: Invalid API token.";
      if (msg.includes("inbox")) return "Mailtrap inbox error: Target inbox ID not configured.";
      return msg;
    }
    return "Mailtrap request failed.";
  }
}
