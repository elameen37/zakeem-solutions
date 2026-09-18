import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  MaintenanceConfig,
  MaintenanceContextValue,
} from "@/types/maintenance";
import {
  getMaintenanceStatus,
  setMaintenanceStatus,
  getDefaultMaintenanceConfig,
  subscribeToMaintenanceChanges,
} from "@/lib/maintenanceService";

const MaintenanceContext = createContext<MaintenanceContextValue | null>(null);

export const MaintenanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role } = useAuth();
  const [config, setConfig] = useState<MaintenanceConfig>(() => getDefaultMaintenanceConfig());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStatus = useCallback(async (force = false) => {
    try {
      const liveConfig = await getMaintenanceStatus(force);
      setConfig(liveConfig);
    } catch {
      // Graceful fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    // Subscribe to cross-tab / window updates and visibility revalidation
    const unsubscribe = subscribeToMaintenanceChanges((updatedConfig) => {
      setConfig(updatedConfig);
    });

    // Background interval check every 60 seconds
    const intervalId = setInterval(() => {
      fetchStatus(true);
    }, 60_000);

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [fetchStatus]);

  const updateStatus = useCallback(
    async (enabled: boolean, title?: string, message?: string) => {
      const result = await setMaintenanceStatus(enabled, title, message);
      if (result.success && result.config) {
        setConfig(result.config);
      }
      return { success: result.success, error: result.error };
    },
    []
  );

  const isUnderMaintenance = config.enabled;
  const isAdmin = role === "admin";
  const isAdminBypassed = isUnderMaintenance && isAdmin;
  const isMaintenanceActive = isUnderMaintenance && !isAdmin;

  const value = useMemo<MaintenanceContextValue>(
    () => ({
      config,
      isLoading,
      isMaintenanceActive,
      isUnderMaintenance,
      isAdminBypassed,
      refreshStatus: () => fetchStatus(true),
      updateStatus,
    }),
    [config, isLoading, isMaintenanceActive, isUnderMaintenance, isAdminBypassed, fetchStatus, updateStatus]
  );

  return <MaintenanceContext.Provider value={value}>{children}</MaintenanceContext.Provider>;
};

export function useMaintenance(): MaintenanceContextValue {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error("useMaintenance must be used within a MaintenanceProvider");
  }
  return context;
}
