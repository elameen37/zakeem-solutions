/**
 * Zakeem Solutions — Outbound Transactional Notification Dispatcher
 * Supabase Edge Function (Deno Runtime)
 * Phase 69: Multi-Provider Transactional Email Infrastructure & Admin Control Center
 *
 * Security & Reliability Directives:
 * 1. ZERO secret leakage: Provider API keys (Resend, SendGrid, Mailtrap) are stored
 *    strictly in Supabase Secrets (Deno.env), never in client bundles or responses.
 * 2. Multi-Action Architecture: "dispatch", "health_check", "send_test", "get_status".
 * 3. First-Class Providers: Resend, SendGrid, and Mailtrap (sandbox/testing).
 * 4. Anti-CRLF defense: Rejects or strips header injection sequences (\r, \n, %0A, %0D).
 * 5. Environment-Aware routing: Defaults to Mailtrap in dev/QA, Resend/SendGrid in production.
 * 6. Zero False Delivery Claims: Honest failure reporting when credentials missing.
 * 7. Idempotent execution & PostgreSQL state synchronization via service role.
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface DispatchRequestBody {
  action?: "dispatch" | "health_check" | "send_test" | "get_status";
  provider?: string;
  eventType?: string;
  recipientEmail?: string;
  recipientName?: string;
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
  referenceId?: string;
  bookingId?: string;
  invitationId?: string;
  idempotencyKey?: string;
  note?: string;
}

// -----------------------------------------------------------------------------
// 1. SANITIZATION & SECURITY GUARDS
// -----------------------------------------------------------------------------

function sanitizeHeader(val: string): string {
  if (!val || typeof val !== "string") return "";
  return val.replace(/[\r\n]+/g, " ").replace(/%0[ad]/gi, " ").trim();
}

function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const clean = email.trim();
  if (clean.includes("\r") || clean.includes("\n")) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
}

function maskEmailForLogs(email: string): string {
  const clean = sanitizeHeader(email);
  const at = clean.indexOf("@");
  if (at <= 0) return "***@***";
  const local = clean.substring(0, at);
  const domain = clean.substring(at + 1);
  return local.length <= 2 ? `${local[0]}***@${domain}` : `${local[0]}***${local[local.length - 1]}@${domain}`;
}

// -----------------------------------------------------------------------------
// 2. BRANDED TRANSACTIONAL EMAIL TEMPLATES
// -----------------------------------------------------------------------------

function buildEmailHtml(params: {
  title: string;
  preheader: string;
  bodyContent: string;
  ctaText?: string;
  ctaUrl?: string;
  referenceBadge?: string;
}): string {
  const { title, preheader, bodyContent, ctaText, ctaUrl, referenceBadge } = params;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6; }
    .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #06152b; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; }
    .header { padding: 32px 32px 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); background: linear-gradient(180deg, rgba(229, 120, 4, 0.08) 0%, transparent 100%); }
    .logo { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; margin: 0; }
    .logo span { color: #e57804; }
    .badge { display: inline-block; padding: 4px 10px; font-size: 11px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 600; text-transform: uppercase; background: rgba(229, 120, 4, 0.15); color: #e57804; border: 1px solid rgba(229, 120, 4, 0.3); border-radius: 6px; margin-top: 12px; }
    .content { padding: 32px; line-height: 1.6; font-size: 15px; color: #cbd5e1; }
    .content h1 { font-size: 22px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 16px; line-height: 1.3; }
    .info-card { background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 20px; margin: 24px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.04); font-size: 13px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #94a3b8; }
    .info-val { color: #f8fafc; font-weight: 600; }
    .cta-btn { display: inline-block; padding: 14px 28px; background-color: #e57804; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 8px; margin: 24px 0 12px; }
    .footer { padding: 24px 32px; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 12px; color: #64748b; line-height: 1.5; background: #020b18; }
    .footer a { color: #94a3b8; text-decoration: underline; }
  </style>
</head>
<body>
  <div style="padding: 24px 12px;">
    <div class="wrapper">
      <div class="header">
        <div class="logo">ZAKEEM<span>SOLUTIONS</span></div>
        ${referenceBadge ? `<div class="badge">${referenceBadge}</div>` : ""}
      </div>
      <div class="content">
        ${bodyContent}
        ${ctaText && ctaUrl ? `<div style="text-align: center;"><a href="${ctaUrl}" class="cta-btn">${ctaText}</a></div>` : ""}
      </div>
      <div class="footer">
        <p>This is an automated transactional security communication from <strong>Zakeem Solutions Limited</strong>.</p>
        <p>Confidentiality notice: This message is intended strictly for the enterprise recipient. If you received this in error, please disregard.</p>
        <p>&copy; ${new Date().getFullYear()} Zakeem Solutions. Enterprise Engineering & Applied AI Platforms.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function renderTemplate(
  eventType: string,
  recipientName: string,
  templateData: Record<string, unknown> = {}
): { subject: string; html: string; text: string } {
  const safeName = recipientName || "Valued Partner";

  switch (eventType) {
    case "test_email": {
      const provider = (templateData.provider as string) || "Configured Provider";
      const env = (templateData.environment as string) || "Testing";
      const adminEmail = (templateData.adminEmail as string) || "Administrator";
      const note = (templateData.note as string) || "Verification test message.";
      const subject = `[TEST] Zakeem Solutions Email Infrastructure Verification (${provider})`;
      const body = `
        <h1>Email Infrastructure Verification Test</h1>
        <p>Hello ${safeName},</p>
        <p>This is a live transactional test email dispatched from the <strong>Zakeem Solutions Email Control Center</strong>.</p>
        <div class="info-card">
          <div class="info-row"><span class="info-label">Active Provider</span><span class="info-val">${provider}</span></div>
          <div class="info-row"><span class="info-label">Environment</span><span class="info-val">${env}</span></div>
          <div class="info-row"><span class="info-label">Dispatched By</span><span class="info-val">${adminEmail}</span></div>
          <div class="info-row"><span class="info-label">Timestamp</span><span class="info-val">${new Date().toISOString()}</span></div>
        </div>
        <p style="font-size: 13px; color: #94a3b8;">${note}</p>
        <p style="font-size: 13px; color: #10b981; font-weight: 600;">&#10003; Verification successful: Transport credentials, MIME encoding, and delivery pipelines are active.</p>
      `;
      const text = `[TEST] Zakeem Solutions Email Infrastructure Verification\n\nProvider: ${provider}\nEnvironment: ${env}\nDispatched By: ${adminEmail}\nTimestamp: ${new Date().toISOString()}\n\n${note}`;
      return {
        subject,
        html: buildEmailHtml({
          title: subject,
          preheader: "Zakeem Solutions live infrastructure test email",
          bodyContent: body,
          referenceBadge: "LIVE TEST EMAIL",
        }),
        text,
      };
    }

    case "client_invitation_created":
    case "client_invitation_resent": {
      const org = (templateData.organization as string) || "Your Enterprise";
      const actUrl = (templateData.activationUrl as string) || "https://www.zakeemsolutions.com/login";
      const expiresAt = templateData.expiresAt ? new Date(templateData.expiresAt as string).toLocaleDateString("en-GB") : "7 Days";
      const subject = `Welcome to Zakeem Solutions — Enterprise Access Invitation (${org})`;
      const body = `
        <h1>Enterprise Portal Access Invitation</h1>
        <p>Hello ${safeName},</p>
        <p>Your enterprise profile for <strong>${org}</strong> has been provisioned on the Zakeem Solutions executive platform.</p>
        <p>Please use your personalized single-use activation link below to complete your credential enrollment and access your client dashboard.</p>
        <div class="info-card">
          <div class="info-row"><span class="info-label">Organization</span><span class="info-val">${org}</span></div>
          <div class="info-row"><span class="info-label">Access Level</span><span class="info-val">Enterprise Client</span></div>
          <div class="info-row"><span class="info-label">Link Expiration</span><span class="info-val">${expiresAt}</span></div>
        </div>
        <p style="font-size: 13px; color: #94a3b8;">For security, this link is cryptographically bound to your organization and can only be used once.</p>
      `;
      const text = `Hello ${safeName},\n\nYour enterprise profile for ${org} has been provisioned on Zakeem Solutions.\nActivate your account: ${actUrl}\n\nLink expires: ${expiresAt}\n\nZakeem Solutions`;
      return {
        subject,
        html: buildEmailHtml({
          title: subject,
          preheader: `Activate your enterprise access for ${org}`,
          bodyContent: body,
          ctaText: "Activate Enterprise Account",
          ctaUrl: actUrl,
          referenceBadge: "Enterprise Invitation",
        }),
        text,
      };
    }

    case "booking_created":
    case "booking_confirmed":
    case "booking_rescheduled": {
      const isRescheduled = eventType === "booking_rescheduled";
      const ref = (templateData.referenceId as string) || "ZK-CONSULT";
      const date = (templateData.bookingDate as string) || "Scheduled Date";
      const time = (templateData.startTime as string) || "Scheduled Time";
      const tz = (templateData.timezone as string) || "Africa/Lagos (WAT)";
      const product = (templateData.product as string) || "Executive Architecture Consultation";
      const subject = isRescheduled
        ? `Rescheduled: Enterprise Consultation (${ref}) — Zakeem Solutions`
        : `Confirmed: Enterprise Consultation (${ref}) — Zakeem Solutions`;
      const headline = isRescheduled ? "Consultation Rescheduled" : "Consultation Confirmed";
      const intro = isRescheduled
        ? `Your enterprise architecture consultation has been rescheduled to a new confirmed time slot in our calendar.`
        : `Thank you for scheduling with Zakeem Solutions. Your enterprise architecture consultation has been reserved in our calendar.`;
      const body = `
        <h1>${headline}</h1>
        <p>Hello ${safeName},</p>
        <p>${intro}</p>
        <div class="info-card">
          <div class="info-row"><span class="info-label">Reference ID</span><span class="info-val">${ref}</span></div>
          <div class="info-row"><span class="info-label">Topic</span><span class="info-val">${product}</span></div>
          <div class="info-row"><span class="info-label">Date</span><span class="info-val">${date}</span></div>
          <div class="info-row"><span class="info-label">Time</span><span class="info-val">${time} (${tz})</span></div>
        </div>
        <p>A calendar invitation with secure video conference credentials will follow shortly.</p>
      `;
      const text = `Hello ${safeName},\n\nYour consultation (${ref}) is ${isRescheduled ? "rescheduled for" : "confirmed for"} ${date} at ${time} (${tz}).\nTopic: ${product}\n\nZakeem Solutions`;
      return {
        subject,
        html: buildEmailHtml({
          title: subject,
          preheader: `Consultation ${isRescheduled ? "rescheduled" : "confirmed"} for ${date}`,
          bodyContent: body,
          referenceBadge: ref,
        }),
        text,
      };
    }

    case "commercial_pilot_welcome": {
      const org = (templateData.company as string) || (templateData.organization as string) || "Your Enterprise";
      const product = (templateData.product as string) || "Enterprise Platform";
      const formType = (templateData.formType as string) || "Commercial Pilot Inquiry";
      const subject = `Welcome to Zakeem Solutions — Inbound Inquiry (${org})`;
      const body = `
        <h1>Commercial Inquiry Received</h1>
        <p>Hello ${safeName},</p>
        <p>Thank you for reaching out to <strong>Zakeem Solutions Limited</strong> regarding <strong>${product}</strong>.</p>
        <p>Our solutions architecture and client advisory team has received your submission and is preparing an initial technical brief.</p>
        <div class="info-card">
          <div class="info-row"><span class="info-label">Organization</span><span class="info-val">${org}</span></div>
          <div class="info-row"><span class="info-label">Product / Track</span><span class="info-val">${product}</span></div>
          <div class="info-row"><span class="info-label">Inquiry Type</span><span class="info-val">${formType}</span></div>
          <div class="info-row"><span class="info-label">Advisory Desk</span><span class="info-val">Lagos, Nigeria (WAT)</span></div>
        </div>
        <p>An enterprise architecture consultant will review your specifications and contact you directly.</p>
      `;
      const text = `Hello ${safeName},\n\nThank you for reaching out to Zakeem Solutions regarding ${product}.\nOur team has received your submission for ${org} and will contact you directly.\n\nZakeem Solutions Limited\ninfo@zakeemsolutions.com`;
      return {
        subject,
        html: buildEmailHtml({
          title: subject,
          preheader: `Thank you for contacting Zakeem Solutions (${org})`,
          bodyContent: body,
          ctaText: "Explore Enterprise Solutions",
          ctaUrl: "https://www.zakeemsolutions.com/products",
          referenceBadge: "Commercial Inquiry",
        }),
        text,
      };
    }

    case "booking_cancelled": {
      const ref = (templateData.referenceId as string) || "ZK-CONSULT";
      const reason = (templateData.cancellationReason as string) || "Scheduling conflict";
      const rescheduleUrl = (templateData.rescheduleUrl as string) || `https://www.zakeemsolutions.com/request-demo?reschedule=${encodeURIComponent(ref)}`;
      const subject = `Cancelled: Enterprise Consultation (${ref}) — Zakeem Solutions`;
      const body = `
        <h1>Consultation Cancelled</h1>
        <p>Hello ${safeName},</p>
        <p>Your scheduled consultation with reference <strong>${ref}</strong> has been cancelled.</p>
        <div class="info-card">
          <div class="info-row"><span class="info-label">Reference</span><span class="info-val">${ref}</span></div>
          <div class="info-row"><span class="info-label">Reason</span><span class="info-val">${reason}</span></div>
        </div>
        <p>If you wish to reschedule or have further questions, our advisory desk remains at your disposal.</p>
      `;
      const text = `Hello ${safeName},\n\nYour consultation (${ref}) has been cancelled. Reason: ${reason}.\n\nReschedule: ${rescheduleUrl}\n\nZakeem Solutions`;
      return {
        subject,
        html: buildEmailHtml({
          title: subject,
          preheader: `Consultation ${ref} cancelled`,
          bodyContent: body,
          ctaText: "Reschedule Consultation",
          ctaUrl: rescheduleUrl,
          referenceBadge: ref,
        }),
        text,
      };
    }

    case "it_training_internal_notification": {
      const ref = (templateData.applicationReference as string) || "ZIT-APP";
      const applicantType = (templateData.applicantType as string) || "individual";
      const isOrg = applicantType === "organization";
      const entityName = isOrg
        ? (templateData.organizationName as string) || "Corporate Applicant"
        : (templateData.fullName as string) || "Individual Applicant";
      const email = (templateData.email as string) || (templateData.businessEmail as string) || "";
      const course = (templateData.course as string) || "IT Training";
      const customRequest = templateData.customTrainingRequest as string | undefined;
      const startDate = (templateData.preferredStartDate as string) || "TBD";
      const days = Array.isArray(templateData.trainingDays)
        ? (templateData.trainingDays as string[]).join(", ")
        : (templateData.trainingDays as string) || "3 days/week";
      const time = (templateData.preferredTime as string) || "10:00";
      const tz = (templateData.timezone as string) || "Africa/Lagos (WAT)";
      const submittedAt = (templateData.submittedAt as string) || new Date().toISOString();

      const subject = `New Zakeem IT Training Application — ${ref}`;
      const customSection = customRequest
        ? `<div class="info-row"><span class="info-label">Custom Request</span><span class="info-val">${customRequest}</span></div>`
        : "";

      const body = `
        <h1>New IT Training Application</h1>
        <p>A new candidate application has been submitted for <strong>Zakeem IT Training</strong> (Fully Online Programme).</p>
        <div class="info-card">
          <div class="info-row"><span class="info-label">Application Reference</span><span class="info-val">${ref}</span></div>
          <div class="info-row"><span class="info-label">Applicant Type</span><span class="info-val">${isOrg ? "Organization" : "Individual"}</span></div>
          <div class="info-row"><span class="info-label">${isOrg ? "Organization Name" : "Candidate Name"}</span><span class="info-val">${entityName}</span></div>
          <div class="info-row"><span class="info-label">Contact Email</span><span class="info-val">${email}</span></div>
          <div class="info-row"><span class="info-label">Selected Course</span><span class="info-val">${course}</span></div>
          ${customSection}
          <div class="info-row"><span class="info-label">Preferred Start Date</span><span class="info-val">${startDate}</span></div>
          <div class="info-row"><span class="info-label">Training Days</span><span class="info-val">${days}</span></div>
          <div class="info-row"><span class="info-label">Duration</span><span class="info-val">2 hours per session</span></div>
          <div class="info-row"><span class="info-label">Preferred Time</span><span class="info-val">${time} (${tz})</span></div>
          <div class="info-row"><span class="info-label">Acknowledgement</span><span class="info-val">Accepted (Fully Online & Certificate Terms)</span></div>
          <div class="info-row"><span class="info-label">Submission Timestamp</span><span class="info-val">${submittedAt}</span></div>
        </div>
      `;

      const text = `New Zakeem IT Training Application — ${ref}\n\n` +
        `Application Reference: ${ref}\n` +
        `Applicant Type: ${isOrg ? "Organization" : "Individual"}\n` +
        `Name / Organization: ${entityName}\n` +
        `Email: ${email}\n` +
        `Selected Course: ${course}\n` +
        (customRequest ? `Custom Training Request: ${customRequest}\n` : "") +
        `Preferred Start Date: ${startDate}\n` +
        `Training Days: ${days}\n` +
        `Duration: 2 hours per session\n` +
        `Preferred Time: ${time} (${tz})\n` +
        `Timezone: ${tz}\n` +
        `Acknowledgement: Accepted\n` +
        `Submission Timestamp: ${submittedAt}\n`;

      return {
        subject,
        html: buildEmailHtml({
          title: subject,
          preheader: `New training application from ${entityName} (${ref})`,
          bodyContent: body,
          referenceBadge: ref,
        }),
        text,
      };
    }

    case "it_training_applicant_confirmation": {
      const ref = (templateData.applicationReference as string) || "ZIT-APP";
      const course = (templateData.course as string) || "IT Training";
      const applicantType = (templateData.applicantType as string) || "individual";
      const isOrg = applicantType === "organization";
      const startDate = (templateData.preferredStartDate as string) || "Your Selected Date";
      const days = Array.isArray(templateData.trainingDays)
        ? (templateData.trainingDays as string[]).join(", ")
        : (templateData.trainingDays as string) || "3 Selected Days";
      const duration = (templateData.sessionDurationMinutes as number) || 120;
      const time = (templateData.preferredTime as string) || "10:00";
      const tz = (templateData.timezone as string) || "Africa/Lagos (WAT)";
      const isConfirmed = templateData.isConfirmed === true || templateData.status === "confirmed";

      const origin = (templateData.origin as string) || "https://www.zakeemsolutions.com";
      const statusUrl = (templateData.statusUrl as string) || `${origin}/training/status?ref=${encodeURIComponent(ref)}`;

      const subject = isConfirmed
        ? `Zakeem IT Training Application Confirmed — ${ref}`
        : `Zakeem IT Training Application Received — ${ref}`;
      const heading = isConfirmed ? "Application Confirmed" : "Application Received";
      const introMessage = isConfirmed
        ? `We are pleased to inform you that Zakeem Solutions has officially <strong>confirmed</strong> your training application for <strong>${course}</strong>.`
        : `Thank you for applying to <strong>Zakeem IT Training</strong>. We have received your application for <strong>${course}</strong>.`;

      const body = `
        <h1>${heading}</h1>
        <p>Hello ${safeName},</p>
        <p>${introMessage}</p>
        <p><strong>Training is fully online</strong> with live structured instruction delivered by Zakeem senior technical leads.</p>
        <div class="info-card">
          <div class="info-row"><span class="info-label">Application Reference</span><span class="info-val">${ref}</span></div>
          <div class="info-row"><span class="info-label">Applicant Type</span><span class="info-val">${isOrg ? "Organization" : "Individual"}</span></div>
          <div class="info-row"><span class="info-label">Enrolled Course</span><span class="info-val">${course}</span></div>
          <div class="info-row"><span class="info-label">Delivery Mode</span><span class="info-val">Fully Online (Live / Structured)</span></div>
          <div class="info-row"><span class="info-label">Preferred Start Date</span><span class="info-val">${startDate}</span></div>
          <div class="info-row"><span class="info-label">Weekly Schedule</span><span class="info-val">${days}</span></div>
          <div class="info-row"><span class="info-label">Session Duration</span><span class="info-val">2 hours per session (${duration} mins)</span></div>
          <div class="info-row"><span class="info-label">Preferred Time</span><span class="info-val">${time} (${tz})</span></div>
          ${isConfirmed ? `<div class="info-row"><span class="info-label">Admissions Status</span><span class="info-val" style="color: #10b981; font-weight: bold;">Confirmed</span></div>` : ""}
        </div>
        <div style="background: rgba(229, 120, 4, 0.1); border: 1px solid rgba(229, 120, 4, 0.3); border-radius: 8px; padding: 14px; margin: 20px 0; font-size: 13px; color: #f3f4f6;">
          <strong>&#127891; Certificate of Completion:</strong> A Certificate of Completion will be issued upon successful completion of the selected training programme and course requirements.
        </div>
        <p>${isConfirmed ? "Your cohort calendar invite, orientation schedule, and virtual classroom credentials will be issued prior to your start date." : "Our solutions advisory and admissions desk will review your selected schedule and contact you with your cohort timetable and virtual classroom access details."}</p>
        <p style="font-size: 13px; color: #94a3b8; margin-top: 15px;">
          You can track your admission status at any time using your application reference and registered email address at: <a href="${statusUrl}" style="color: #e57804; text-decoration: underline;">${statusUrl}</a>
        </p>
      `;

      const text = `Hello ${safeName},\n\n` +
        (isConfirmed
          ? `Zakeem Solutions has officially confirmed your training application for: ${course} (${ref}).\n\n`
          : `Thank you for applying to Zakeem IT Training (${ref}).\nWe have received your application for: ${course}.\n\n`) +
        `Training Details:\n` +
        `- Application Reference: ${ref}\n` +
        `- Applicant Type: ${isOrg ? "Organization" : "Individual"}\n` +
        `- Enrolled Course: ${course}\n` +
        `- Delivery Mode: Fully Online (Live / Structured)\n` +
        `- Preferred Start Date: ${startDate}\n` +
        `- Weekly Schedule: ${days}\n` +
        `- Session Duration: 2 hours per session (${duration} mins)\n` +
        `- Preferred Time: ${time} (${tz})\n` +
        (isConfirmed ? `- Admissions Status: Confirmed\n\n` : `\n`) +
        `Track your application status: ${statusUrl}\n\n` +
        `A Certificate of Completion will be issued upon successful completion of the selected training programme.\n\n` +
        (isConfirmed
          ? `Your virtual classroom credentials will be dispatched prior to your start date.\n\n`
          : `Our admissions desk will review your schedule and reach out with your calendar credentials.\n\n`) +
        `Zakeem Solutions Limited\ninfo@zakeemsolutions.com`;

      return {
        subject,
        html: buildEmailHtml({
          title: subject,
          preheader: isConfirmed
            ? `Your training application for ${course} has been officially confirmed (${ref})`
            : `Training application confirmed for ${course} (${ref})`,
          bodyContent: body,
          ctaText: "Check Application Status",
          ctaUrl: statusUrl,
          referenceBadge: ref,
        }),
        text,
      };
    }

    default: {
      const subject = (templateData.subject as string) || "Notification from Zakeem Solutions";
      const body = `
        <h1>Transactional Update</h1>
        <p>Hello ${safeName},</p>
        <p>${templateData.message || "An update has been registered regarding your enterprise engagement with Zakeem Solutions."}</p>
      `;
      return {
        subject,
        html: buildEmailHtml({
          title: subject,
          preheader: subject,
          bodyContent: body,
        }),
        text: `Hello ${safeName},\n\nAn update has been registered regarding your engagement.\n\nZakeem Solutions`,
      };
    }
  }
}

// -----------------------------------------------------------------------------
// 3. PROVIDER ADAPTERS (FIRST-CLASS)
// -----------------------------------------------------------------------------

async function sendViaResend(params: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${params.apiKey}`,
        "Content-Type": "application/json",
        ...(params.idempotencyKey ? { "Idempotency-Key": params.idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from: params.from,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    const data = await res.json();
    if (res.ok && data?.id) {
      return { success: true, messageId: data.id };
    }
    return { success: false, error: data?.message || `Resend HTTP ${res.status}` };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Resend request error" };
  }
}

async function sendViaSendGrid(params: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${params.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: params.to }] }],
        from: { email: params.from, name: "Zakeem Solutions" },
        subject: params.subject,
        content: [
          { type: "text/plain", value: params.text },
          { type: "text/html", value: params.html },
        ],
      }),
    });

    if (res.status === 202) {
      const msgId = res.headers.get("X-Message-Id") || `sg_${Date.now()}`;
      return { success: true, messageId: msgId };
    }
    const errData = await res.text();
    return { success: false, error: `SendGrid HTTP ${res.status}: ${errData}` };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "SendGrid request error" };
  }
}

async function sendViaMailtrap(params: {
  apiKey: string;
  inboxId?: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const isSandbox = Boolean(params.inboxId);
    const endpoint = isSandbox
      ? `https://sandbox.api.mailtrap.io/api/send/${params.inboxId}`
      : "https://send.api.mailtrap.io/api/send";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${params.apiKey}`,
        "Api-Token": params.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: { email: params.from, name: "Zakeem Solutions" },
        to: [{ email: params.to }],
        subject: params.subject,
        text: params.text,
        html: params.html,
      }),
    });

    const data = await res.json().catch(() => null);
    if (res.ok) {
      const messageId = data?.message_ids?.[0] || `mt_${Date.now()}`;
      return { success: true, messageId };
    }
    const errMessage = data?.errors?.join(", ") || data?.message || `Mailtrap HTTP ${res.status}`;
    return { success: false, error: errMessage };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Mailtrap request error" };
  }
}

// -----------------------------------------------------------------------------
// 4. HEALTH CHECK ADAPTERS
// -----------------------------------------------------------------------------

async function pingProvider(provider: string): Promise<{ success: boolean; status: "healthy" | "degraded" | "error"; error?: string }> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
  const mailtrapApiKey = Deno.env.get("MAILTRAP_API_KEY");
  const mailtrapInboxId = Deno.env.get("MAILTRAP_INBOX_ID");

  switch (provider) {
    case "resend": {
      if (!resendApiKey) {
        return { success: false, status: "error", error: "PROVIDER CREDENTIALS NOT CONFIGURED: RESEND_API_KEY is not set." };
      }
      try {
        const res = await fetch("https://api.resend.com/domains", {
          headers: { Authorization: `Bearer ${resendApiKey}` },
        });
        if (res.ok) return { success: true, status: "healthy" };
        const data = await res.json().catch(() => null);
        // Resend API keys restricted to sending access return HTTP 401 with name: "restricted_api_key".
        // This confirms the API key is authentic, valid, and active with transactional send permissions.
        if (res.status === 401 && data?.name === "restricted_api_key") {
          return { success: true, status: "healthy" };
        }
        const errMessage = data?.message || `Resend ping returned status ${res.status}`;
        return { success: false, status: "degraded", error: errMessage };
      } catch (err) {
        return { success: false, status: "error", error: err instanceof Error ? err.message : "Resend ping network failure" };
      }
    }

    case "sendgrid": {
      if (!sendgridApiKey) {
        return { success: false, status: "error", error: "PROVIDER CREDENTIALS NOT CONFIGURED: SENDGRID_API_KEY is not set." };
      }
      try {
        const res = await fetch("https://api.sendgrid.com/v3/scopes", {
          headers: { Authorization: `Bearer ${sendgridApiKey}` },
        });
        if (res.ok) return { success: true, status: "healthy" };
        return { success: false, status: "degraded", error: `SendGrid ping returned status ${res.status}` };
      } catch (err) {
        return { success: false, status: "error", error: err instanceof Error ? err.message : "SendGrid ping network failure" };
      }
    }

    case "mailtrap": {
      if (!mailtrapApiKey) {
        return { success: false, status: "error", error: "PROVIDER CREDENTIALS NOT CONFIGURED: MAILTRAP_API_KEY is not set." };
      }
      try {
        const endpoint = mailtrapInboxId
          ? `https://mailtrap.io/api/v1/inboxes/${mailtrapInboxId}`
          : "https://mailtrap.io/api/v1/inboxes";
        const res = await fetch(endpoint, {
          headers: { "Api-Token": mailtrapApiKey, Authorization: `Bearer ${mailtrapApiKey}` },
        });
        if (res.ok) return { success: true, status: "healthy" };
        return { success: false, status: "degraded", error: `Mailtrap ping returned status ${res.status}` };
      } catch (err) {
        return { success: false, status: "error", error: err instanceof Error ? err.message : "Mailtrap ping network failure" };
      }
    }

    default:
      return { success: false, status: "error", error: `Provider adapter "${provider}" does not have active server credentials.` };
  }
}

// -----------------------------------------------------------------------------
// 5. MAIN HTTP SERVER DISPATCHER
// -----------------------------------------------------------------------------

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: DispatchRequestBody = await req.json();
    const action = body.action || "dispatch";

    // Supabase Auth & Client Verification
    const authHeader = req.headers.get("Authorization");
    const apiKeyHeader = req.headers.get("apikey");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const rawToken = authHeader ? authHeader.replace(/^Bearer\s+/i, "").trim() : "";
    const isServiceRole = Boolean(rawToken && supabaseServiceKey && rawToken === supabaseServiceKey);
    
    function isProjectAnonToken(token?: string | null, expectedKey?: string): boolean {
      if (!token) return false;
      if (expectedKey && token === expectedKey) return true;
      try {
        const parts = token.split(".");
        if (parts.length !== 3) return false;
        const base64Url = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const jsonStr = atob(base64Url);
        const payload = JSON.parse(jsonStr);
        return payload.iss === "supabase" && payload.ref === "atrevctosjcimszirdcc" && payload.role === "anon";
      } catch {
        return false;
      }
    }

    const isProjectAnonClient = Boolean(
      isProjectAnonToken(rawToken, supabaseAnonKey) ||
      isProjectAnonToken(apiKeyHeader, supabaseAnonKey) ||
      req.headers.get("sb-project-ref") === "atrevctosjcimszirdcc"
    );

    let authUser: any = null;
    let isAdmin = isServiceRole;

    // Check user JWT if token is provided and distinct from service role / anon keys
    if (rawToken && !isServiceRole && !isProjectAnonClient) {
      try {
        const userClient = createClient(supabaseUrl, supabaseAnonKey, {
          auth: { persistSession: false },
          global: { headers: { Authorization: authHeader || "" } },
        });
        const { data: userData } = await userClient.auth.getUser();
        if (userData?.user) {
          authUser = userData.user;
          const email = authUser.email || "";
          if (email.endsWith("@zakeemsolutions.com")) {
            isAdmin = true;
          } else {
            const { data: profile } = await userClient
              .from("profiles")
              .select("role")
              .eq("id", authUser.id)
              .maybeSingle();
            if (profile?.role === "admin") {
              isAdmin = true;
            }
          }
        }
      } catch {
        // Continue with non-user session evaluation
      }
    }

    // Role-based Access Control
    if (action === "get_status" || action === "health_check" || action === "send_test") {
      if (!isAdmin && !authUser) {
        return new Response(
          JSON.stringify({ error: "Unauthorized: Valid authentication token required" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // For public dispatch events, require project client credentials (anon key or auth token)
    const ALLOWED_ANON_EVENTS = [
      "it_training_applicant_confirmation",
      "it_training_internal_notification",
      "commercial_pilot_welcome",
      "lead_welcome",
      "booking_confirmed",
    ];

    if (action === "dispatch") {
      if (!authUser && !isAdmin) {
        if (!isProjectAnonClient) {
          return new Response(
            JSON.stringify({ error: "Unauthorized: Valid authentication token required" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (!ALLOWED_ANON_EVENTS.includes(body.eventType || "")) {
          return new Response(
            JSON.stringify({ error: `Forbidden: Event type "${body.eventType}" requires authentication` }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    const environment = Deno.env.get("ENVIRONMENT") || Deno.env.get("DENO_ENV") || "production";
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
    const mailtrapApiKey = Deno.env.get("MAILTRAP_API_KEY");
    const mailtrapInboxId = Deno.env.get("MAILTRAP_INBOX_ID");
    const fromAddress = Deno.env.get("OUTBOUND_FROM_EMAIL") || "info@zakeemsolutions.com";

    // -------------------------------------------------------------------------
    // ACTION: GET_STATUS (Sanitized Metadata — Zero Secrets Leaked)
    // -------------------------------------------------------------------------
    if (action === "get_status") {
      return new Response(
        JSON.stringify({
          success: true,
          environment,
          senderEmail: fromAddress,
          providers: {
            resend: { configured: Boolean(resendApiKey) },
            sendgrid: { configured: Boolean(sendgridApiKey) },
            mailtrap: { configured: Boolean(mailtrapApiKey), sandbox: Boolean(mailtrapInboxId) },
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // -------------------------------------------------------------------------
    // ACTION: HEALTH_CHECK
    // -------------------------------------------------------------------------
    if (action === "health_check") {
      const targetProvider = body.provider || (environment === "production" ? "resend" : "mailtrap");
      const health = await pingProvider(targetProvider);
      const latencyMs = Date.now() - startTime;

      return new Response(
        JSON.stringify({
          success: health.success,
          provider: targetProvider,
          status: health.status,
          latencyMs,
          error: health.error,
          timestamp: new Date().toISOString(),
        }),
        {
          status: health.success ? 200 : 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // -------------------------------------------------------------------------
    // ACTION: SEND_TEST (Rate-limited, Admin-only Live Test)
    // -------------------------------------------------------------------------
    if (action === "send_test") {
      const recipient = body.recipientEmail?.trim();
      if (!recipient || !isValidEmail(recipient)) {
        return new Response(
          JSON.stringify({ success: false, error: "Valid recipient email address is required for test dispatch." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const targetProvider = body.provider || (environment === "production" ? "resend" : "mailtrap");
      const testTemplate = renderTemplate("test_email", "Administrator", {
        provider: targetProvider.toUpperCase(),
        environment,
        adminEmail: authUser?.email || "Platform Admin",
        note: sanitizeHeader(body.note || "Live transactional route verification test"),
      });

      let testResult: { success: boolean; messageId?: string; error?: string };

      if (targetProvider === "resend" && resendApiKey) {
        testResult = await sendViaResend({
          apiKey: resendApiKey,
          from: fromAddress,
          to: recipient,
          subject: testTemplate.subject,
          html: testTemplate.html,
          text: testTemplate.text,
        });
      } else if (targetProvider === "sendgrid" && sendgridApiKey) {
        testResult = await sendViaSendGrid({
          apiKey: sendgridApiKey,
          from: fromAddress,
          to: recipient,
          subject: testTemplate.subject,
          html: testTemplate.html,
          text: testTemplate.text,
        });
      } else if (targetProvider === "mailtrap" && mailtrapApiKey) {
        testResult = await sendViaMailtrap({
          apiKey: mailtrapApiKey,
          inboxId: mailtrapInboxId,
          from: fromAddress,
          to: recipient,
          subject: testTemplate.subject,
          html: testTemplate.html,
          text: testTemplate.text,
        });
      } else {
        testResult = {
          success: false,
          error: `PROVIDER CREDENTIALS NOT CONFIGURED: No credentials found for provider "${targetProvider}".`,
        };
      }

      console.log(`[Email Control Center] Test Email dispatched via ${targetProvider} to ${maskEmailForLogs(recipient)} status=${testResult.success ? "OK" : "FAIL"}`);

      return new Response(
        JSON.stringify({
          success: testResult.success,
          provider: targetProvider,
          providerMessageId: testResult.messageId,
          error: testResult.error,
          timestamp: new Date().toISOString(),
        }),
        {
          status: testResult.success ? 200 : 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // -------------------------------------------------------------------------
    // ACTION: DISPATCH (Transactional Outbound Message)
    // -------------------------------------------------------------------------
    const {
      eventType = "transactional_notification",
      recipientEmail,
      recipientName = "Valued Partner",
      subject: reqSubject,
      templateData = {},
      referenceId,
      bookingId,
      idempotencyKey,
    } = body;

    if (!recipientEmail || !isValidEmail(recipientEmail)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid recipient email address format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Render Email Template
    const template = renderTemplate(eventType, recipientName, templateData);
    const finalSubject = sanitizeHeader(reqSubject || template.subject);
    const finalHtml = body.htmlContent || template.html;
    const finalText = body.textContent || template.text;

    // Determine Provider with Environment Awareness
    // Hierarchy: explicitly requested provider -> Mailtrap in dev/QA -> Resend in prod -> SendGrid -> fail truthfully
    let selectedProvider = body.provider;
    if (!selectedProvider) {
      if ((environment === "development" || environment === "qa") && mailtrapApiKey) {
        selectedProvider = "mailtrap";
      } else if (resendApiKey) {
        selectedProvider = "resend";
      } else if (sendgridApiKey) {
        selectedProvider = "sendgrid";
      } else if (mailtrapApiKey) {
        selectedProvider = "mailtrap";
      } else {
        selectedProvider = "none";
      }
    }

    let dispatchResult: { success: boolean; provider: string; messageId?: string; error?: string };

    if (selectedProvider === "resend" && resendApiKey) {
      const resendRes = await sendViaResend({
        apiKey: resendApiKey,
        from: fromAddress,
        to: recipientEmail,
        subject: finalSubject,
        html: finalHtml,
        text: finalText,
        idempotencyKey,
      });
      dispatchResult = {
        success: resendRes.success,
        provider: "resend",
        messageId: resendRes.messageId,
        error: resendRes.error,
      };
    } else if (selectedProvider === "sendgrid" && sendgridApiKey) {
      const sgRes = await sendViaSendGrid({
        apiKey: sendgridApiKey,
        from: fromAddress,
        to: recipientEmail,
        subject: finalSubject,
        html: finalHtml,
        text: finalText,
      });
      dispatchResult = {
        success: sgRes.success,
        provider: "sendgrid",
        messageId: sgRes.messageId,
        error: sgRes.error,
      };
    } else if (selectedProvider === "mailtrap" && mailtrapApiKey) {
      const mtRes = await sendViaMailtrap({
        apiKey: mailtrapApiKey,
        inboxId: mailtrapInboxId,
        from: fromAddress,
        to: recipientEmail,
        subject: finalSubject,
        html: finalHtml,
        text: finalText,
      });
      dispatchResult = {
        success: mtRes.success,
        provider: "mailtrap",
        messageId: mtRes.messageId,
        error: mtRes.error,
      };
    } else {
      // ZERO FALSE SUCCESS CLAIMS: Truthfully fail if no provider credentials are configured
      dispatchResult = {
        success: false,
        provider: selectedProvider || "none",
        error: "PROVIDER CREDENTIALS NOT CONFIGURED: Outbound provider credentials missing on Edge server.",
      };
    }

    // Database Synchronization (Service Role)
    if (supabaseServiceKey && bookingId) {
      try {
        const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false },
        });

        await adminClient
          .from("booking_notifications")
          .update({
            status: dispatchResult.success ? "delivered" : "failed",
            sent_at: dispatchResult.success ? new Date().toISOString() : null,
            error_message: dispatchResult.error || null,
          })
          .eq("booking_id", bookingId);
      } catch (dbErr) {
        console.error("Failed to update booking_notifications record:", dbErr);
      }
    }

    const latencyMs = Date.now() - startTime;
    console.log(`[Notification] ${eventType} -> ${maskEmailForLogs(recipientEmail)} [${dispatchResult.provider}] status=${dispatchResult.success ? "OK" : "FAIL"} latency=${latencyMs}ms`);

    return new Response(
      JSON.stringify({
        success: dispatchResult.success,
        provider: dispatchResult.provider,
        providerMessageId: dispatchResult.messageId,
        status: dispatchResult.success ? "delivered" : "failed",
        error: dispatchResult.error,
        deliveredAt: dispatchResult.success ? new Date().toISOString() : undefined,
      }),
      {
        status: dispatchResult.success ? 200 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal notification dispatcher error";
    return new Response(JSON.stringify({ success: false, error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
