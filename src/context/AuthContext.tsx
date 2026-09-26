import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { AuthContextValue, UserProfile, UserRole } from "@/types/auth";
import { recordAuditEvent } from "@/lib/auditTelemetry";

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Resolves user role strictly from explicit authorization.
 * NEVER uses user_metadata, email domain, or unverified frontend parameters.
 */
function resolveExplicitRole(user: User | null, profileRole?: UserRole | null): UserRole | null {
  if (!user) return null;

  const appMeta = user.app_metadata || {};

  // 1. Explicit admin check via app_metadata (Phase 23B hardened security model)
  const hasAdminRole = appMeta.role === "admin";
  const hasAdminInRolesArray = Array.isArray(appMeta.roles) && appMeta.roles.includes("admin");
  const hasAdminBoolean = appMeta.is_admin === true;

  if (hasAdminRole || hasAdminInRolesArray || hasAdminBoolean) {
    return "admin";
  }

  // 2. Explicit admin check via database-verified profiles table
  // (governed strictly by PostgreSQL RLS where users cannot elevate their own role)
  if (profileRole === "admin") {
    return "admin";
  }

  // 3. Authenticated standard user defaults to client
  return "client";
}

/**
 * Asynchronously resolves server-authoritative role.
 * Queries app_metadata, profile table, and the PostgreSQL is_admin() RPC.
 * Returns the resolved role and whether it was authoritatively confirmed.
 */
async function resolveAuthoritativeRole(
  user: User | null,
  profileRole: UserRole | null | undefined,
  client?: ReturnType<typeof getSupabaseClient>
): Promise<{ role: UserRole; isAuthoritative: boolean }> {
  if (!user) return { role: "client", isAuthoritative: false };

  // 1. Fast check: app_metadata or database profile already shows admin
  const explicitRole = resolveExplicitRole(user, profileRole);
  if (explicitRole === "admin") {
    return { role: "admin", isAuthoritative: true };
  }

  // 2. If profile explicitly confirmed client:
  if (profileRole === "client") {
    return { role: "client", isAuthoritative: true };
  }

  // 3. If profile was null/undefined or not yet determined, query server-side is_admin() RPC
  if (client) {
    try {
      const { data: rpcIsAdmin, error: rpcError } = await client.rpc("is_admin");
      if (!rpcError && typeof rpcIsAdmin === "boolean") {
        if (rpcIsAdmin === true) {
          return { role: "admin", isAuthoritative: true };
        } else {
          return { role: "client", isAuthoritative: true };
        }
      }
    } catch {
      // Non-blocking: transient RPC network error
    }
  }

  // 4. Default authenticated user fallback
  return { role: "client", isAuthoritative: profileRole !== undefined && profileRole !== null };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRecoverySession, setIsRecoverySession] = useState<boolean>(false);

  // Local development mock user state for when Supabase is unconfigured
  const [localDevRole, setLocalDevRole] = useState<UserRole | null>(() => {
    if (typeof window !== "undefined" && !isSupabaseConfigured()) {
      const saved = localStorage.getItem("zakeem_local_auth_role");
      return saved === "admin" || saved === "client" ? saved : null;
    }
    return null;
  });

  // Ref to track role requirement during active login to prevent unauthorized session flashing
  const pendingAllowedRoleRef = useRef<UserRole | null>(null);

  // Ref to track active signIn execution to prevent race condition with onAuthStateChange
  const isSigningInRef = useRef<boolean>(false);

  const fetchProfile = useCallback(async (activeUser: User): Promise<UserProfile | null> => {
    if (!isSupabaseConfigured()) return null;
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      // 1. Primary query: full profile with extended organizational columns
      const { data, error } = await client
        .from("profiles")
        .select("id, full_name, organization, organization_id, phone, job_title, role, created_at, updated_at")
        .eq("id", activeUser.id)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          fullName: data.full_name,
          organization: data.organization || undefined,
          organizationId: data.organization_id || undefined,
          phone: data.phone || undefined,
          jobTitle: data.job_title || undefined,
          role: data.role as UserRole,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }

      // 2. Fallback query: core profile columns if extended query fails (e.g. schema variance)
      if (error) {
        const { data: coreData, error: coreError } = await client
          .from("profiles")
          .select("id, full_name, organization, role, created_at, updated_at")
          .eq("id", activeUser.id)
          .maybeSingle();

        if (!coreError && coreData) {
          return {
            id: coreData.id,
            fullName: coreData.full_name,
            organization: coreData.organization || undefined,
            role: coreData.role as UserRole,
            createdAt: coreData.created_at,
            updatedAt: coreData.updated_at,
          };
        }
      }

      // 3. Brief single retry if record was momentarily inaccessible right at auth establishment
      await new Promise((res) => setTimeout(res, 120));
      const { data: retryData, error: retryError } = await client
        .from("profiles")
        .select("id, full_name, organization, organization_id, phone, job_title, role, created_at, updated_at")
        .eq("id", activeUser.id)
        .maybeSingle();

      if (!retryError && retryData) {
        return {
          id: retryData.id,
          fullName: retryData.full_name,
          organization: retryData.organization || undefined,
          organizationId: retryData.organization_id || undefined,
          phone: retryData.phone || undefined,
          jobTitle: retryData.job_title || undefined,
          role: retryData.role as UserRole,
          createdAt: retryData.created_at,
          updatedAt: retryData.updated_at,
        };
      }
    } catch {
      // Graceful fallback on network glitch
    }

    return null;
  }, []);

  const handleSessionResolution = useCallback(
    async (currentSession: Session | null) => {
      // If an active signIn() call is currently managing the auth handshake, yield to signIn()
      if (isSigningInRef.current) {
        return;
      }

      if (currentSession?.user) {
        const activeUser = currentSession.user;
        const client = getSupabaseClient();
        const userProfile = await fetchProfile(activeUser);
        const explicitRole = resolveExplicitRole(activeUser, userProfile?.role);
        const { role: resolvedRole } = await resolveAuthoritativeRole(
          activeUser,
          userProfile?.role,
          client || undefined
        );

        // If an explicit role constraint is currently being enforced (e.g. client login or admin login)
        if (pendingAllowedRoleRef.current && resolvedRole !== pendingAllowedRoleRef.current) {
          // Do NOT populate React state with an unauthorized session.
          // This completely prevents premature isAuthenticated=true state or route flashing.
          setLoading(false);
          return;
        }

        // Atomic update of user, session, profile, and role
        setUser(activeUser);
        setSession(currentSession);
        setProfile(userProfile);
        setRole(resolvedRole);
      } else {
        setUser(null);
        setSession(null);
        setProfile(null);
        setRole(localDevRole);
      }
      setLoading(false);
    },
    [fetchProfile, localDevRole]
  );

  const refreshSession = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await client.auth.getSession();
      await handleSessionResolution(data.session);
    } catch {
      setLoading(false);
    }
  }, [handleSessionResolution]);

  // Initialize and subscribe to Supabase Auth state changes
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      setLoading(false);
      return;
    }

    // Initial check
    client.auth.getSession().then(({ data: { session: initialSession } }) => {
      handleSessionResolution(initialSession);
    });

    // Reactive subscription to login/logout/refresh events
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, newSession) => {
      // PASSWORD_RECOVERY: Supabase detected a recovery token in the URL hash.
      // Set recovery flag so ResetPasswordPage can display the form,
      // and skip normal role resolution to prevent redirect away from /reset-password.
      if (event === "PASSWORD_RECOVERY" && newSession?.user) {
        setIsRecoverySession(true);
        setUser(newSession.user);
        setSession(newSession);
        setLoading(false);
        return;
      }

      // Any non-recovery auth event explicitly clears recovery mode to prevent leakage
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "SIGNED_OUT") {
        setIsRecoverySession(false);
      }

      // If an active signIn() call is managing auth, yield to signIn() to avoid race
      if (isSigningInRef.current) {
        return;
      }

      handleSessionResolution(newSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleSessionResolution]);

  const signIn = useCallback(
    async (
      email: string,
      password: string,
      allowedRole?: UserRole
    ): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
      isSigningInRef.current = true;
      pendingAllowedRoleRef.current = allowedRole || null;
      setIsRecoverySession(false);

      try {
        // 1. Production Mode: Supabase Auth
        if (isSupabaseConfigured()) {
          const client = getSupabaseClient();
          if (!client) {
            return { success: false, error: "Database client is unavailable." };
          }

          const { data, error } = await client.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

          if (error) {
            recordAuditEvent({
              eventType: allowedRole === "admin" ? "auth.admin_login.failure" : "auth.login.failure",
              entityType: "user",
              actorRole: "anonymous",
              errorCategory: "AUTHENTICATION",
              metadata: { reason: "invalid_credentials" },
            });

            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("client-login-failed", {
                  bubbles: true,
                  detail: { email: email.trim(), error: error.message },
                })
              );
            }
            return {
              success: false,
              error:
                error.message === "Invalid login credentials"
                  ? "Invalid email or password. Please verify your credentials and try again."
                  : error.message || "Invalid authentication credentials.",
            };
          }

          if (data.session?.user) {
            const activeUser = data.session.user;
            const userProfile = await fetchProfile(activeUser);
            const explicitRole = resolveExplicitRole(activeUser, userProfile?.role);
            const { role: resolvedRole, isAuthoritative } = await resolveAuthoritativeRole(
              activeUser,
              userProfile?.role,
              client
            );

            // Role enforcement check: If the login portal restricts roles
            if (allowedRole && resolvedRole !== allowedRole) {
              // Only purge session if role determination was authoritative.
              // A transient profile/network error must NOT sign the administrator out.
              if (isAuthoritative) {
                await client.auth.signOut();
                setUser(null);
                setSession(null);
                setProfile(null);
                setRole(null);
                setLoading(false);

                recordAuditEvent({
                  eventType: allowedRole === "admin" ? "auth.admin_login.failure" : "auth.login.failure",
                  entityType: "user",
                  actorRole: "anonymous",
                  errorCategory: "AUTHORIZATION",
                  metadata: { reason: "role_mismatch", attemptedRole: allowedRole },
                });

                if (allowedRole === "client" && resolvedRole === "admin") {
                  return {
                    success: false,
                    error: "Access restricted: Administrator accounts cannot sign in through the Client Portal. Please use the authorized administration URL.",
                  };
                }

                if (allowedRole === "admin" && resolvedRole !== "admin") {
                  return {
                    success: false,
                    error: "Administrative access denied. Your authenticated account does not possess systems administrator privileges.",
                  };
                }
              } else {
                // Non-authoritative / transient resolution failure:
                // Do NOT purge session; inform the user gracefully.
                setLoading(false);
                return {
                  success: false,
                  error: "Unable to verify administrative authorization due to a temporary network condition. Please verify your connection and try again.",
                };
              }
            }

            // Successfully authenticated and role verified
            setUser(activeUser);
            setSession(data.session);
            setProfile(userProfile);
            setRole(resolvedRole);
            setLoading(false);

            recordAuditEvent({
              eventType: resolvedRole === "admin" ? "auth.admin_login.success" : "auth.login.success",
              entityType: "user",
              entityId: activeUser.id,
              actorId: activeUser.id,
              actorRole: resolvedRole || "client",
              metadata: { emailDomain: activeUser.email?.split("@")[1] || "unknown" },
            });

            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("client-login-success", {
                  bubbles: true,
                  detail: { userId: activeUser.id, role: resolvedRole },
                })
              );
            }

            return { success: true, role: resolvedRole || "client" };
          }

          recordAuditEvent({
            eventType: allowedRole === "admin" ? "auth.admin_login.failure" : "auth.login.failure",
            entityType: "user",
            actorRole: "anonymous",
            errorCategory: "SERVER",
            metadata: { reason: "session_establishment_failed" },
          });

          return { success: false, error: "Unable to establish user session." };
        }

        // 2. Local Development Fallback Mode (unconfigured Supabase credentials)
        const isMasterAdmin = password.trim() === "zakeem-executive";
        const isMasterClient = password.trim() === "zakeem-client" && !email.includes("admin");

        if (isMasterAdmin || isMasterClient) {
          const devRole: UserRole = isMasterAdmin ? "admin" : "client";

          if (allowedRole && devRole !== allowedRole) {
            recordAuditEvent({
              eventType: allowedRole === "admin" ? "auth.admin_login.failure" : "auth.login.failure",
              entityType: "user",
              actorRole: "anonymous",
              errorCategory: "AUTHORIZATION",
              metadata: { reason: "role_mismatch", attemptedRole: allowedRole, mode: "local-development" },
            });

            if (allowedRole === "client" && devRole === "admin") {
              return {
                success: false,
                error: "Access restricted: Administrator accounts cannot sign in through the Client Portal. Please use the authorized administration URL.",
              };
            }
            if (allowedRole === "admin" && devRole !== "admin") {
              return {
                success: false,
                error: "Administrative access denied. Your authenticated account does not possess systems administrator privileges.",
              };
            }
          }

          setLocalDevRole(devRole);
          setRole(devRole);
          setLoading(false);

          recordAuditEvent({
            eventType: devRole === "admin" ? "auth.admin_login.success" : "auth.login.success",
            entityType: "user",
            entityId: "local-dev-user",
            actorRole: devRole,
            metadata: { mode: "local-development" },
          });

          if (typeof window !== "undefined") {
            localStorage.setItem("zakeem_local_auth_role", devRole);
            window.dispatchEvent(
              new CustomEvent("client-login-success", {
                bubbles: true,
                detail: { userId: "local-dev-user", role: devRole },
              })
            );
          }
          return { success: true, role: devRole };
        }

        recordAuditEvent({
          eventType: allowedRole === "admin" ? "auth.admin_login.failure" : "auth.login.failure",
          entityType: "user",
          actorRole: "anonymous",
          errorCategory: "AUTHENTICATION",
          metadata: { reason: "invalid_credentials", mode: "local-development" },
        });

        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("client-login-failed", {
              bubbles: true,
              detail: { email, error: "Invalid credentials" },
            })
          );
        }

        return { success: false, error: "Invalid email or password. Please verify your credentials and try again." };
      } finally {
        isSigningInRef.current = false;
        pendingAllowedRoleRef.current = null;
      }
    },
    [fetchProfile]
  );

  const signOut = useCallback(async () => {
    isSigningInRef.current = false;
    pendingAllowedRoleRef.current = null;
    setIsRecoverySession(false);

    const currentUserId = user?.id || null;
    const currentRole = role || "anonymous";

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          await client.auth.signOut();
        } catch (err) {
          console.warn("[Auth] Supabase signOut interrupted by network, proceeding with local purge:", err);
        }
      }
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("zakeem_local_auth_role");
      window.dispatchEvent(
        new CustomEvent("client-logout", {
          bubbles: true,
        })
      );
    }

    recordAuditEvent({
      eventType: "auth.signout",
      entityType: "user",
      entityId: currentUserId,
      actorId: currentUserId,
      actorRole: currentRole,
    });

    setLocalDevRole(null);
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
    setLoading(false);
  }, [user, role]);

  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return { success: false, error: "Please provide a valid work email address." };
    }

    recordAuditEvent({
      eventType: "auth.password_reset.requested",
      entityType: "user",
      actorRole: "anonymous",
      metadata: { emailDomain: trimmedEmail.split("@")[1] || "unknown" },
    });

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (!client) {
        return { success: false, error: "Database client is unavailable." };
      }

      try {
        const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;
        const { error } = await client.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo,
        });

        if (error) {
          return { success: false, error: error.message };
        }
      } catch (err) {
        return { success: false, error: "Network error occurred while requesting password reset. Please try again." };
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("client-password-reset-requested", {
            bubbles: true,
            detail: { email: trimmedEmail },
          })
        );
      }

      return { success: true };
    }

    // Local development fallback simulation
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("client-password-reset-requested", {
          bubbles: true,
          detail: { email: trimmedEmail },
        })
      );
    }
    return { success: true };
  }, []);

  const clearRecoverySession = useCallback(() => {
    setIsRecoverySession(false);
  }, []);

  const updatePassword = useCallback(async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: "Password must be at least 8 characters in length." };
    }

    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (!client) {
        return { success: false, error: "Database client is unavailable." };
      }

      try {
        const { error } = await client.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          return { success: false, error: error.message };
        }
      } catch (err) {
        return { success: false, error: "Network error occurred while updating password. Please try again." };
      }

      recordAuditEvent({
        eventType: "auth.password_reset.completed",
        entityType: "user",
        entityId: user?.id || null,
        actorId: user?.id || null,
        actorRole: role || "client",
      });

      return { success: true };
    }

    recordAuditEvent({
      eventType: "auth.password_reset.completed",
      entityType: "user",
      entityId: user?.id || null,
      actorId: user?.id || null,
      actorRole: role || "client",
      metadata: { mode: "local-development" },
    });

    // Local development fallback simulation
    return { success: true };
  }, [user, role]);

  const isAuthenticated = useMemo(() => {
    if (isSupabaseConfigured()) {
      return Boolean(user && session);
    }
    return Boolean(localDevRole);
  }, [user, session, localDevRole]);

  const isAdmin = useMemo(() => role === "admin", [role]);
  const isClient = useMemo(() => role === "client", [role]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      role,
      isAuthenticated,
      isAdmin,
      isClient,
      loading,
      isRecoverySession,
      signIn,
      signOut,
      refreshSession,
      resetPassword,
      updatePassword,
      clearRecoverySession,
    }),
    [
      user,
      session,
      profile,
      role,
      isAuthenticated,
      isAdmin,
      isClient,
      loading,
      isRecoverySession,
      signIn,
      signOut,
      refreshSession,
      resetPassword,
      updatePassword,
      clearRecoverySession,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
