/**
 * Zakeem Solutions — Transactional Notification & Outbound Dispatch Architecture
 * Phase 45: Controlled Commercial Pilot & Notification Architecture
 * 
 * Provider-neutral typed data models for enterprise outbound communications,
 * supporting multi-channel dispatch (Email, SMS, WhatsApp, Webhooks),
 * idempotent delivery, retry backoff tracking, and zero-leak masking.
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
  | "custom_transactional";

export type NotificationEventType =
  | BookingNotificationEventType
  | InvitationNotificationEventType
  | CommercialPilotNotificationEventType;

export type EmailProviderType =
  | "resend"
  | "sendgrid"
  | "smtp"
  | "webhook"
  | "mock";

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
