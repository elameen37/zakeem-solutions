import { Session, User } from "@supabase/supabase-js";

export type UserRole = "admin" | "client";

export interface UserProfile {
  id: string;
  fullName: string;
  organization?: string;
  organizationId?: string;
  phone?: string;
  jobTitle?: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export interface ClientInvitation {
  id: string;
  email: string;
  organization: string;
  fullName: string;
  status: InvitationStatus;
  invitedBy?: string;
  leadId?: string;
  organizationId?: string;
  contactId?: string;
  bookingId?: string;
  acceptedUserId?: string;
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string;
}

export interface InvitationVerificationResult {
  valid: boolean;
  email?: string;
  organization?: string;
  organizationId?: string;
  contactId?: string;
  fullName?: string;
  leadId?: string;
  status?: InvitationStatus;
  error?: string;
}

export interface AcceptInvitationResult {
  success: boolean;
  error?: string;
  isExistingAccount?: boolean;
}

export interface CreateInvitationPayload {
  email: string;
  organization: string;
  fullName: string;
  leadId?: string;
  organizationId?: string;
  contactId?: string;
  bookingId?: string;
  expiresInDays?: number;
}

export interface CreateInvitationResult {
  success: boolean;
  token?: string;
  expiresAt?: string;
  email?: string;
  organization?: string;
  fullName?: string;
  error?: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isClient: boolean;
  loading: boolean;
}

export interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string, allowedRole?: UserRole) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
}
