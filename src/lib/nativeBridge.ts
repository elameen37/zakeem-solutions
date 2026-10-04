/**
 * Zakeem Solutions — Native App Bridge
 * Provides cross-platform detection, platform abstraction, and safe webview/native bridge execution.
 * 
 * Works seamlessly in both standard web/PWA mode and within the Tauri 2 native shell.
 */

export type NativePlatform = "windows" | "macos" | "linux" | "android" | "ios" | "web";

export interface NativeAppInfo {
  isNative: boolean;
  platform: NativePlatform;
  appName: string;
  appVersion: string;
}

declare global {
  interface Window {
    __TAURI__?: Record<string, unknown>;
    __TAURI_INTERNALS__?: Record<string, unknown>;
  }
}

/**
 * Checks whether the application is running inside the Tauri native wrapper.
 */
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.__TAURI__ || window.__TAURI_INTERNALS__);
}

/**
 * Identifies the host platform of the running application.
 */
export function getNativePlatform(): NativePlatform {
  if (typeof window === "undefined") return "web";
  if (!isNativeApp()) return "web";

  const userAgent = (window.navigator?.userAgent || "").toLowerCase();
  const platform = (window.navigator?.platform || "").toLowerCase();

  if (/android/.test(userAgent)) return "android";
  if (/iphone|ipad|ipod/.test(userAgent) || (platform === "macintel" && navigator.maxTouchPoints > 1)) {
    return "ios";
  }
  if (/win/.test(platform) || /windows/.test(userAgent)) return "windows";
  if (/mac/.test(platform) || /macintosh/.test(userAgent)) return "macos";
  if (/linux/.test(platform) || /linux/.test(userAgent)) return "linux";

  return "web";
}

/**
 * Retrieves comprehensive metadata about the native application runtime.
 */
export function getNativeAppInfo(): NativeAppInfo {
  const isNative = isNativeApp();
  const platform = getNativePlatform();

  return {
    isNative,
    platform,
    appName: "Zakeem Solutions",
    appVersion: "1.0.0",
  };
}

/**
 * Safely opens an external URL outside the application context.
 * In a native webview, this prevents navigating the root webview away from the application.
 */
export async function openExternalUrl(url: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    // If running in Tauri with opener available
    const tauri = window.__TAURI__;
    if (tauri && typeof (tauri as any).opener?.openUrl === "function") {
      await (tauri as any).opener.openUrl(url);
      return true;
    }

    // Default web behavior: open in new tab with noopener/noreferrer
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    return Boolean(opened);
  } catch (err) {
    console.warn("[NativeBridge] Failed to open external URL:", url, err);
    return false;
  }
}
