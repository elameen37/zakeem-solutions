/**
 * Zakeem Solutions — Transactional Notification & Outbound Dispatch Architecture
 * Phase 45 & Phase 69: Provider-Agnostic Transactional Email Infrastructure
 * 
 * Provider-neutral typed data models for enterprise outbound communications,
 * supporting multi-channel dispatch (Email, SMS, WhatsApp, Webhooks),
 * first-class email providers (Resend, SendGrid, Mailtrap), future-ready adapters
 * (SES, Postmark, Brevo, Mailgun, SMTP), idempotent delivery, and zero-leak masking.
 */

export type TransactionalChannel = "email" | "sms" | "whatsapp" | "webhook";

export type NotificationDeliveryStatus =
  | "pending"
  | "processing"
  | "delivered"
  | "failed"
  | "retrying"
  | "skipped";

export type BookingNotificationEventType =
  | "booking_created"
  | "booking_confirmed"
  | "booking_cancelled"
  | "booking_rescheduled"
  | "booking_completed"
  | "booking_no_show";

export type InvitationNotificationEventType =
  | "client_invitation_created"
  | "client_invitation_resent";

export type CommercialPilotNotificationEventType =
  | "commercial_pilot_welcome"
  | "commercial_demo_scheduled"
  | "commercial_agreement_ready"
  | "system_alert"
  | "test_email"
  | "custom_transactional";

export type TrainingNotificationEventType =
  | "it_training_internal_notification"
  | "it_training_applicant_confirmation";

export type NotificationEventType =
  | BookingNotificationEventType
  | InvitationNotificationEventType
  | CommercialPilotNotificationEventType
  | TrainingNotificationEventType;

/**
 * Supported email provider types:
 * First-class: resend, sendgrid, mailtrap
 * Future-ready: ses, postmark, brevo, mailgun, smtp
 */
export type EmailProviderType =
  | "resend"
  | "sendgrid"
  | "mailtrap"
  | "ses"
  | "postmark"
  | "brevo"
  | "mailgun"
  | "smtp"
  | "webhook"
  | "mock";

export type EmailProviderStatus =
  | "configured"
  | "not_configured"
  | "degraded"
  | "error";

export type EmailDomainVerificationStatus =
  | "verified"
  | "pending"
  | "not_configured"
  | "unknown";

export interface EmailDnsRecord {
  type: "TXT" | "CNAME" | "MX";
  name: string;
  value: string;
  status: EmailDomainVerificationStatus;
  description: string;
}

export interface EmailProviderMetadata {
  id: EmailProviderType;
  displayName: string;
  isFirstClass: boolean;
  isConfigured: boolean;
  status: EmailProviderStatus;
  isDefault: boolean;
  capabilities: string[];
  recommendedFor: "production" | "staging" | "development" | "all";
  documentationUrl?: string;
  note?: string;
}

export interface EmailInfrastructureConfig {
  environment: "development" | "staging" | "production";
  activeProvider: EmailProviderType;
  deliveryEnabled: boolean;
  senderEmail: string;
  senderName: string;
  replyToEmail: string;
  lastHealthCheck: string | null;
  lastHealthStatus: "healthy" | "degraded" | "error" | "unverified";
  domain: string;
  domainVerification: {
    spf: EmailDomainVerificationStatus;
    dkim: EmailDomainVerificationStatus;
    dmarc: EmailDomainVerificationStatus;
    domain: string;
  };
  dnsRequirements: EmailDnsRecord[];
  providers: Record<EmailProviderType, EmailProviderMetadata>;
  metrics: {
    queuedCount: number;
    sentCount: number;
    failedCount: number;
    retryCount: number;
    lastSuccessfulDelivery: string | null;
  };
}

export interface TestEmailRequest {
  recipientEmail: string;
  provider?: EmailProviderType;
  note?: string;
}

export interface TestEmailResult {
  success: boolean;
  provider: EmailProviderType;
  messageId?: string;
  error?: string;
  timestamp: string;
}

export interface HealthCheckResult {
  success: boolean;
  provider: EmailProviderType;
  status: "healthy" | "degraded" | "error";
  latencyMs?: number;
  error?: string;
  timestamp: string;
}

export interface DeliveryAttempt {
  attemptNumber: number;
  timestamp: string;
  provider: EmailProviderType;
  status: "success" | "failure";
  statusCode?: number;
  error?: string;
  latencyMs?: number;
}

export interface NotificationTemplateVariable {
  key: string;
  value: string | number | boolean;
}

export interface NotificationDispatchPayload {
  eventType: NotificationEventType;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  htmlContent?: string;
  textContent?: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
  referenceId?: string;
  bookingId?: string;
  invitationId?: string;
  leadId?: string;
  organizationId?: string;
  idempotencyKey: string;
}

export interface NotificationDispatchResult {
  success: boolean;
  notificationId?: string;
  provider?: EmailProviderType;
  providerMessageId?: string;
  status: NotificationDeliveryStatus;
  attempts: DeliveryAttempt[];
  error?: string;
  deliveredAt?: string;
}

export interface UnifiedNotificationRecord {
  id: string;
  referenceId: string;
  bookingId?: string;
  invitationId?: string;
  eventType: NotificationEventType;
  recipientEmail: string;
  recipientEmailMasked: string;
  recipientName: string;
  channel: TransactionalChannel;
  status: NotificationDeliveryStatus;
  payload: Record<string, unknown>;
  attempts?: DeliveryAttempt[];
  errorMessage?: string;
  createdAt: string;
  sentAt?: string;
}

export interface NotificationDispatcherConfig {
  defaultProvider: EmailProviderType;
  fromEmail: string;
  fromName: string;
  replyToEmail: string;
  maxRetryAttempts: number;
  initialBackoffMs: number;
  maxBackoffMs: number;
}
