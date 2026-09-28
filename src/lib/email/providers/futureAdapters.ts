/**
 * Zakeem Solutions — Future-Compatible Email Provider Adapters
 * Phase 69: Provider-Agnostic Extensibility Architecture
 *
 * Implements the EmailProvider contract for prospective enterprise email systems:
 * 1. Amazon SES (Simple Email Service)
 * 2. Postmark (ActiveCampaign)
 * 3. Brevo (formerly Sendinblue)
 * 4. Mailgun (Sinch)
 * 5. Custom Enterprise SMTP
 *
 * These adapters allow seamless future vendor integration without modifying
 * the core notificationService or application dispatch layer.
 */

import { EmailProvider, OutboundEmailParams, OutboundEmailResult, ProviderVerificationResult } from "../types";
import { EmailProviderStatus, EmailProviderType } from "@/types/notification";

abstract class BaseFutureProvider implements EmailProvider {
  abstract readonly id: EmailProviderType;
  abstract readonly name: string;
  readonly isFirstClass = false;

  isConfigured(): boolean {
    return false;
  }

  async sendEmail(params: OutboundEmailParams): Promise<OutboundEmailResult> {
    return {
      success: false,
      provider: this.id,
      error: `${this.name} adapter is prepared for enterprise activation. Server credentials pending configuration.`,
      timestamp: new Date().toISOString(),
    };
  }

  async verifyProvider(): Promise<ProviderVerificationResult> {
    return {
      success: false,
      status: "degraded",
      message: `${this.name} adapter registered. Pending server credentials.`,
    };
  }

  async getProviderStatus(): Promise<{ configured: boolean; status: EmailProviderStatus; note?: string }> {
    return {
      configured: false,
      status: "not_configured",
      note: `Adapter scaffolded. Configure server credentials to activate ${this.name}.`,
    };
  }

  normalizeError(error: unknown): string {
    return error instanceof Error ? error.message : `${this.name} error`;
  }
}

export class SESProvider extends BaseFutureProvider implements EmailProvider {
  readonly id = "ses" as const;
  readonly name = "Amazon SES";
}

export class PostmarkProvider extends BaseFutureProvider implements EmailProvider {
  readonly id = "postmark" as const;
  readonly name = "Postmark";
}

export class BrevoProvider extends BaseFutureProvider implements EmailProvider {
  readonly id = "brevo" as const;
  readonly name = "Brevo";
}

export class MailgunProvider extends BaseFutureProvider implements EmailProvider {
  readonly id = "mailgun" as const;
  readonly name = "Mailgun";
}

export class SMTPProvider extends BaseFutureProvider implements EmailProvider {
  readonly id = "smtp" as const;
  readonly name = "Custom Enterprise SMTP";
}
