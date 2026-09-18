export interface MaintenanceConfig {
  enabled: boolean;
  title: string;
  message: string;
  secondaryMessage?: string;
  updatedAt?: string;
  updatedBy?: string | null;
  updatedByName?: string | null;
}

export interface MaintenanceContextValue {
  config: MaintenanceConfig;
  isLoading: boolean;
  isMaintenanceActive: boolean; // True when enabled AND current user is NOT an admin
  isUnderMaintenance: boolean; // Raw enabled state from database
  isAdminBypassed: boolean; // True when enabled AND current user IS an admin
  refreshStatus: () => Promise<void>;
  updateStatus: (
    enabled: boolean,
    title?: string,
    message?: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export const DEFAULT_MAINTENANCE_TITLE = "Scheduled System Maintenance";
export const DEFAULT_MAINTENANCE_MESSAGE =
  "Zakeem Solutions is temporarily unavailable while we perform scheduled maintenance and platform improvements. We’ll be back shortly.";
export const DEFAULT_MAINTENANCE_SECONDARY = "Thank you for your patience.";
