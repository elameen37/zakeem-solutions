import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { AuthContextValue, UserProfile, UserRole } from "@/types/auth";

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

  // 2. Profile role if explicitly set to admin AND verified against app_metadata
  if (profileRole === "admin" && (hasAdminRole || hasAdminInRolesArray || hasAdminBoolean)) {
    return "admin";
  }

  // 3. Authenticated standard user defaults to client
  return "client";
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Local development mock user state for when Supabase is unconfigured
  const [localDevRole, setLocalDevRole] = useState<UserRole | null>(() => {
    if (typeof window !== "undefined" && !isSupabaseConfigured()) {
      const saved = localStorage.getItem("zakeem_local_auth_role");
      return saved === "admin" || saved === "client" ? saved : null;
    }
    return null;
  });

  const fetchProfile = useCallback(async (activeUser: User): Promise<UserProfile | null> => {
    if (!isSupabaseConfigured()) return null;
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from("profiles")
        .select("id, full_name, organization, role, created_at, updated_at")
        .eq("id", activeUser.id)
        .maybeSingle();

      if (error) {
        // Non-blocking: table might be empty or in setup
        return null;
      }

      if (data) {
        return {
          id: data.id,
          fullName: data.full_name,
          organization: data.organization || undefined,
          role: data.role as UserRole,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch {
      // Graceful fallback
    }

    return null;
  }, []);

  const handleSessionResolution = useCallback(
    async (currentSession: Session | null) => {
      if (currentSession?.user) {
        const activeUser = currentSession.user;
        setUser(activeUser);
        setSession(currentSession);

        const userProfile = await fetchProfile(activeUser);
        setProfile(userProfile);

        const resolvedRole = resolveExplicitRole(activeUser, userProfile?.role);
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
    } = client.auth.onAuthStateChange((_event, newSession) => {
      handleSessionResolution(newSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleSessionResolution]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
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
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("client-login-failed", {
                bubbles: true,
                detail: { email: email.trim(), error: error.message },
              })
            );
          }
          return { success: false, error: error.message || "Invalid authentication credentials." };
        }

        if (data.session?.user) {
          const activeUser = data.session.user;
          const userProfile = await fetchProfile(activeUser);
          const resolvedRole = resolveExplicitRole(activeUser, userProfile?.role);

          setUser(activeUser);
          setSession(data.session);
          setProfile(userProfile);
          setRole(resolvedRole);

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

        return { success: false, error: "Unable to establish user session." };
      }

      // 2. Local Development Fallback Mode (unconfigured Supabase credentials)
      if (password.trim() === "zakeem-executive" || password.trim().length >= 8) {
        const devRole: UserRole = email.includes("admin") || password.trim() === "zakeem-executive" ? "admin" : "client";
        setLocalDevRole(devRole);
        setRole(devRole);
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

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("client-login-failed", {
            bubbles: true,
            detail: { email, error: "Invalid local passkey" },
          })
        );
      }

      return { success: false, error: "Invalid credentials. Provide a valid local passkey (min 8 characters)." };
    },
    [fetchProfile]
  );

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        await client.auth.signOut();
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

    setLocalDevRole(null);
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  }, []);

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
      signIn,
      signOut,
      refreshSession,
    }),
    [user, session, profile, role, isAuthenticated, isAdmin, isClient, loading, signIn, signOut, refreshSession]
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
