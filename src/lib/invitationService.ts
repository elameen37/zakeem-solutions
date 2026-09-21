/**
 * Zakeem Solutions — Client Account Provisioning & Invitation Service
 * Phase 24B: Controlled B2B Client Onboarding & Identity Governance
 */

import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { isAnalyticsConsentGranted } from "@/lib/cookieConsent";
import {
  AcceptInvitationResult,
  ClientInvitation,
  CreateInvitationPayload,
  CreateInvitationResult,
  InvitationVerificationResult,
} from "@/types/auth";

/**
 * Generates a high-entropy cryptographically secure one-time invite token.
 */
function generateSecureToken(): string {
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const buffer = new Uint8Array(24);
    window.crypto.getRandomValues(buffer);
    return Array.from(buffer)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback
  return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
}

/**
 * Computes SHA-256 hex string using browser crypto.subtle.
 */
async function sha256Hex(plainText: string): Promise<string> {
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return plainText;
}

const LOCAL_STORAGE_INVITATIONS_KEY = "zakeem_mock_invitations";

function getLocalInvitations(): ClientInvitation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_INVITATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalInvitations(invitations: ClientInvitation[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_INVITATIONS_KEY, JSON.stringify(invitations));
  } catch {
    // Non-blocking
  }
}

function emitAnalyticsEvent(name: string, detail: Record<string, unknown>): void {
  if (typeof window !== "undefined" && isAnalyticsConsentGranted()) {
    try {
      window.dispatchEvent(
        new CustomEvent(name, {
          bubbles: true,
          detail,
        })
      );
    } catch {
      // Non-blocking
    }
  }
}

/**
 * Verifies an invitation token via Supabase RPC or local fallback.
 * Never leaks administrative metadata to anonymous callers.
 */
export async function verifyInvitation(token: string): Promise<InvitationVerificationResult> {
  const trimmed = token.trim();
  emitAnalyticsEvent("invitation-verification-started", {
    hasToken: Boolean(trimmed),
    timestamp: new Date().toISOString(),
  });

  if (!trimmed) {
    emitAnalyticsEvent("invitation-verification-failed", {
      reason: "missing_token",
      timestamp: new Date().toISOString(),
    });
    return { valid: false, error: "Invitation token parameter is required." };
  }

  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (!client) {
      emitAnalyticsEvent("invitation-verification-failed", {
        reason: "db_unavailable",
        timestamp: new Date().toISOString(),
      });
      return { valid: false, error: "Database client is unavailable." };
    }

    try {
      const { data, error } = await client.rpc("verify_client_invitation", {
        p_token: trimmed,
      });

      if (error) {
        emitAnalyticsEvent("invitation-verification-failed", {
          reason: "rpc_error",
          timestamp: new Date().toISOString(),
        });
        return { valid: false, error: error.message };
      }

      if (!data || data.valid === false) {
        const errorMsg = (data?.error || "Invalid or expired invitation token.").toLowerCase();
        let derivedStatus: "expired" | "revoked" | "accepted" | undefined = undefined;
        let failReason = "invalid_token";

        if (errorMsg.includes("expired")) {
          derivedStatus = "expired";
          failReason = "expired";
        } else if (errorMsg.includes("revoked")) {
          derivedStatus = "revoked";
          failReason = "revoked";
        } else if (errorMsg.includes("already") || errorMsg.includes("accepted")) {
          derivedStatus = "accepted";
          failReason = "already_accepted";
        }

        emitAnalyticsEvent("invitation-verification-failed", {
          reason: failReason,
          timestamp: new Date().toISOString(),
        });

        return {
          valid: false,
          status: derivedStatus,
          error: data?.error || "Invalid or expired invitation token.",
        };
      }

      return {
        valid: true,
        email: data.email,
        organization: data.organization,
        fullName: data.full_name,
        leadId: data.lead_id,
        status: "pending",
      };
    } catch {
      emitAnalyticsEvent("invitation-verification-failed", {
        reason: "network_error",
        timestamp: new Date().toISOString(),
      });
      return { valid: false, error: "Unable to verify invitation. Please try again later." };
    }
  }

  // Local development fallback
  const localList = getLocalInvitations();
  const found = localList.find((inv) => inv.id === trimmed || (inv as any).token === trimmed);
  if (found) {
    if (found.status !== "pending") {
      emitAnalyticsEvent("invitation-verification-failed", {
        reason: found.status,
        timestamp: new Date().toISOString(),
      });
      return {
        valid: false,
        status: found.status,
        error: `Invitation status is ${found.status}.`,
      };
    }
    return {
      valid: true,
      email: found.email,
      organization: found.organization,
      fullName: found.fullName,
      leadId: found.leadId,
      status: "pending",
    };
  }

  // If testing locally with any sample token:
  if (trimmed.length >= 8) {
    return {
      valid: true,
      email: "partner@enterprise-client.com",
      organization: "Enterprise Partner Ltd",
      fullName: "Lead Executive",
      leadId: "ZK-202609-TEST",
      status: "pending",
    };
  }

  emitAnalyticsEvent("invitation-verification-failed", {
    reason: "token_not_found",
    timestamp: new Date().toISOString(),
  });
  return { valid: false, error: "Invalid invitation token." };
}

/**
 * Accepts an invitation and provisions the client profile.
 */
export async function acceptInvitation(
  token: string,
  password: string,
  fullName?: string,
  organization?: string
): Promise<AcceptInvitationResult> {
  const trimmedToken = token.trim();

  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (!client) {
      emitAnalyticsEvent("signup-failed", {
        reason: "db_unavailable",
        timestamp: new Date().toISOString(),
      });
      return { success: false, error: "Database client is unavailable." };
    }

    // 1. Verify token to retrieve authoritative email
    const verification = await verifyInvitation(trimmedToken);
    if (!verification.valid || !verification.email) {
      emitAnalyticsEvent("signup-failed", {
        reason: "invalid_invitation",
        timestamp: new Date().toISOString(),
      });
      return { success: false, error: verification.error || "Invalid invitation token." };
    }

    const email = verification.email;
    const finalFullName = (fullName || verification.fullName || "Client").trim();
    const finalOrg = (organization || verification.organization || "Enterprise").trim();

    // 2. Sign up / establish auth account
    const { data: authData, error: authError } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: finalFullName,
          organization: finalOrg,
        },
      },
    });

    if (authError) {
      const msg = (authError.message || "").toLowerCase();
      const isExisting =
        msg.includes("already registered") ||
        msg.includes("already exists") ||
        msg.includes("user already") ||
        (authError as any).status === 422;

      if (isExisting) {
        emitAnalyticsEvent("signup-failed", {
          reason: "existing_account",
          timestamp: new Date().toISOString(),
        });
        return {
          success: false,
          error: "An account with this email address already exists. Please sign in or reset your password.",
          isExistingAccount: true,
        };
      }

      emitAnalyticsEvent("signup-failed", {
        reason: "auth_signup_error",
        timestamp: new Date().toISOString(),
      });
      return { success: false, error: authError.message };
    }

    // Check for duplicate account where Supabase returns empty identities array
    if (authData?.user && Array.isArray(authData.user.identities) && authData.user.identities.length === 0) {
      emitAnalyticsEvent("signup-failed", {
        reason: "existing_account",
        timestamp: new Date().toISOString(),
      });
      return {
        success: false,
        error: "An account with this email address already exists. Please sign in or reset your password.",
        isExistingAccount: true,
      };
    }

    const userId = authData.user?.id;
    if (!userId) {
      emitAnalyticsEvent("signup-failed", {
        reason: "missing_user_id",
        timestamp: new Date().toISOString(),
      });
      return { success: false, error: "User profile registration could not be established." };
    }

    // 3. Call secure server-side RPC to transition invitation and provision profile
    const { data: rpcData, error: rpcError } = await client.rpc("accept_client_invitation", {
      p_token: trimmedToken,
      p_user_id: userId,
      p_full_name: finalFullName,
      p_organization: finalOrg,
    });

    if (rpcError) {
      // Non-fatal if signup succeeded, but report warning
      console.warn("[Provisioning Notice]:", rpcError.message);
    } else if (rpcData && rpcData.success === false) {
      emitAnalyticsEvent("signup-failed", {
        reason: "invitation_state_error",
        timestamp: new Date().toISOString(),
      });
      return {
        success: false,
        error: rpcData.error || "Invitation could not be finalized.",
      };
    }

    // 4. Dispatch analytics event (Privacy-safe: no tokens, passwords, emails, or personal names)
    emitAnalyticsEvent("signup-completed", {
      role: "client",
      hasOrganization: Boolean(finalOrg),
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  // Local development fallback
  const localList = getLocalInvitations();
  const updated = localList.map((inv) =>
    inv.id === trimmedToken || (inv as any).token === trimmedToken
      ? { ...inv, status: "accepted" as const, acceptedAt: new Date().toISOString() }
      : inv
  );
  saveLocalInvitations(updated);

  if (typeof window !== "undefined") {
    localStorage.setItem("zakeem_local_auth_role", "client");
  }

  emitAnalyticsEvent("signup-completed", {
    role: "client",
    hasOrganization: Boolean(organization),
    timestamp: new Date().toISOString(),
  });

  return { success: true };
}

/**
 * Creates an invitation for an approved enterprise client (Admin only).
 */
export async function createAdminInvitation(
  payload: CreateInvitationPayload
): Promise<CreateInvitationResult> {
  const rawToken = generateSecureToken();
  const tokenHash = await sha256Hex(rawToken);

  const trimmedEmail = payload.email.trim().toLowerCase();
  const trimmedOrg = payload.organization.trim();
  const trimmedName = payload.fullName.trim();
  const trimmedLeadId = payload.leadId?.trim() || undefined;
  const days = payload.expiresInDays && payload.expiresInDays > 0 ? payload.expiresInDays : 7;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, error: "Database client is unavailable." };
    }

    try {
      const { data: authData } = await client.auth.getUser();
      const invitedBy = authData?.user?.id || null;

      const { error } = await client.from("client_invitations").insert({
        email: trimmedEmail,
        organization: trimmedOrg,
        full_name: trimmedName,
        token_hash: tokenHash,
        lead_id: trimmedLeadId,
        organization_id: payload.organizationId || null,
        contact_id: payload.contactId || null,
        booking_id: payload.bookingId || null,
        invited_by: invitedBy,
        status: "pending",
        expires_at: expiresAt,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("client-invitation-created", {
            bubbles: true,
            detail: {
              organization: trimmedOrg,
              leadId: trimmedLeadId,
              expiresAt,
            },
          })
        );
      }

      return {
        success: true,
        token: rawToken,
        expiresAt,
        email: trimmedEmail,
        organization: trimmedOrg,
        fullName: trimmedName,
      };
    } catch {
      return { success: false, error: "Failed to persist client invitation." };
    }
  }

  // Local development fallback
  const localList = getLocalInvitations();
  const newLocalInv: ClientInvitation & { token: string } = {
    id: `inv-${Date.now()}`,
    token: rawToken,
    email: trimmedEmail,
    organization: trimmedOrg,
    fullName: trimmedName,
    leadId: trimmedLeadId,
    status: "pending",
    createdAt: new Date().toISOString(),
    expiresAt,
  };

  saveLocalInvitations([newLocalInv, ...localList]);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("client-invitation-created", {
        bubbles: true,
        detail: {
          organization: trimmedOrg,
          leadId: trimmedLeadId,
          expiresAt,
        },
      })
    );
  }

  return {
    success: true,
    token: rawToken,
    expiresAt,
    email: trimmedEmail,
    organization: trimmedOrg,
    fullName: trimmedName,
  };
}

/**
 * Lists all invitations for the administrator operations desk.
 */
export async function listAdminInvitations(): Promise<{
  success: boolean;
  invitations: ClientInvitation[];
  error?: string;
}> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, invitations: [], error: "Database client is unavailable." };
    }

    try {
      const { data, error } = await client
        .from("client_invitations")
        .select("id, email, organization, full_name, status, lead_id, organization_id, contact_id, booking_id, accepted_user_id, invited_by, expires_at, created_at, accepted_at")
        .order("created_at", { ascending: false });

      if (error) {
        return { success: false, invitations: [], error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped: ClientInvitation[] = (data || []).map((row: any) => ({
        id: row.id,
        email: row.email,
        organization: row.organization,
        fullName: row.full_name,
        status: row.status,
        leadId: row.lead_id || undefined,
        organizationId: row.organization_id || undefined,
        contactId: row.contact_id || undefined,
        bookingId: row.booking_id || undefined,
        acceptedUserId: row.accepted_user_id || undefined,
        invitedBy: row.invited_by || undefined,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
        acceptedAt: row.accepted_at || undefined,
      }));

      return { success: true, invitations: mapped };
    } catch {
      return { success: false, invitations: [], error: "Failed to retrieve invitations list." };
    }
  }

  // Local development fallback
  const localList = getLocalInvitations();
  if (localList.length === 0) {
    // Seed initial demo invitation for local preview
    const sample: ClientInvitation = {
      id: "demo-invitation-token",
      email: "director@firstcapital.ng",
      organization: "First Capital Bank PLC",
      fullName: "Alhaji Ibrahim Danladi",
      leadId: "ZK-202609-F91A",
      status: "pending",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    };
    saveLocalInvitations([sample]);
    return { success: true, invitations: [sample] };
  }

  return { success: true, invitations: localList };
}

/**
 * Revokes a pending invitation (Admin only).
 */
export async function revokeAdminInvitation(
  invitationId: string
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, error: "Database client is unavailable." };
    }

    try {
      const { data, error } = await client.rpc("admin_revoke_client_invitation", {
        p_invitation_id: invitationId,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data || data.success === false) {
        return { success: false, error: data?.error || "Could not revoke invitation." };
      }

      return { success: true };
    } catch {
      return { success: false, error: "Failed to revoke invitation." };
    }
  }

  // Local development fallback
  const localList = getLocalInvitations();
  const updated = localList.map((inv) =>
    inv.id === invitationId ? { ...inv, status: "revoked" as const } : inv
  );
  saveLocalInvitations(updated);
  return { success: true };
}
