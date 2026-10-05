import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { isNativeApp } from "../lib/nativeBridge";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAContextType {
  isOnline: boolean;
  isReconnecting: boolean;
  reconnectedRecently: boolean;
  hasUpdate: boolean;
  isUpdating: boolean;
  canInstall: boolean;
  isInstalled: boolean;
  isNative: boolean;
  isIOS: boolean;
  showIOSInstallGuide: boolean;
  setShowIOSInstallGuide: (show: boolean) => void;
  updateApp: () => void;
  dismissUpdate: () => void;
  promptInstall: () => Promise<void>;
  checkConnection: () => Promise<boolean>;
  installDismissed: boolean;
  dismissInstallInvitation: () => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isNative = isNativeApp();
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [reconnectedRecently, setReconnectedRecently] = useState<boolean>(false);
  const [hasUpdateRaw, setHasUpdateRaw] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateDismissed, setUpdateDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem("zakeem:pwa:update_dismissed_session") === "true";
    } catch {
      return false;
    }
  });
  const [installDismissed, setInstallDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const sessionDismissed = sessionStorage.getItem("zakeem:pwa:install_dismissed_session") === "true";
      const localUntil = parseInt(localStorage.getItem("zakeem:pwa:install_dismissed_until") || "0", 10);
      return sessionDismissed || (localUntil > Date.now());
    } catch {
      return false;
    }
  });
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(isNative);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSInstallGuide, setShowIOSInstallGuide] = useState<boolean>(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  // Suppress update prompt when offline or dismissed in the active session
  const hasUpdate = hasUpdateRaw && !updateDismissed && isOnline;

  // 1. Online / Offline Status
  useEffect(() => {
    if (typeof window === "undefined") return;

    let restoredTimer: ReturnType<typeof setTimeout> | undefined;

    const handleOnline = () => {
      setIsOnline(true);
      setReconnectedRecently(true);
      restoredTimer = setTimeout(() => {
        setReconnectedRecently(false);
      }, 4000);
      window.dispatchEvent(new CustomEvent("zakeem-online-restored"));
    };

    const handleOffline = () => {
      setIsOnline(false);
      setReconnectedRecently(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (restoredTimer) clearTimeout(restoredTimer);
    };
  }, []);

  // 2. Standalone & Platform Detection
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect standalone mode (already installed) or native wrapper
    const isStandaloneMode =
      isNative ||
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes("android-app://");

    setIsInstalled(isStandaloneMode);

    // Detect iOS / iPadOS browser (only when NOT in native wrapper and NOT already installed)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    setIsIOS(!isNative && isAppleDevice && !isStandaloneMode);

    const displayModeQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsInstalled(isNative || e.matches);
    };

    displayModeQuery.addEventListener?.("change", handleDisplayModeChange);
    return () => {
      displayModeQuery.removeEventListener?.("change", handleDisplayModeChange);
    };
  }, [isNative]);

  // 3. BeforeInstallPrompt Capture (Chromium / Android / Desktop)
  useEffect(() => {
    if (typeof window === "undefined" || isNative) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isNative]);

  // 4. Service Worker Registration & Update Detection
  useEffect(() => {
    if (isNative || typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    let updateInterval: ReturnType<typeof setInterval> | undefined;

    // Register service worker after page load to not compete with critical resources
    const registerSW = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          // If a worker is already waiting, an update is ready
          if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setHasUpdateRaw(true);
          }

          // Detect new worker being discovered
          registration.addEventListener("updatefound", () => {
            const installing = registration.installing;
            if (!installing) return;

            installing.addEventListener("statechange", () => {
              if (installing.state === "installed" && navigator.serviceWorker.controller) {
                setWaitingWorker(installing);
                setHasUpdateRaw(true);
              }
            });
          });

          // Check for service worker updates periodically (e.g., hourly) when online
          updateInterval = setInterval(() => {
            if (navigator.onLine) {
              registration.update().catch(() => {});
            }
          }, 60 * 60 * 1000);
        })
        .catch((err) => {
          console.warn("[PWA] Service worker registration error:", err);
        });

      // Reload smoothly when new worker takes over with loop prevention
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          const lastReload = (() => {
            try {
              return parseInt(sessionStorage.getItem("zakeem:pwa:last_sw_reload") || "0", 10);
            } catch {
              return 0;
            }
          })();
          const now = Date.now();
          if (now - lastReload > 5000) {
            try {
              sessionStorage.setItem("zakeem:pwa:last_sw_reload", String(now));
            } catch {}
            window.location.reload();
          } else {
            console.warn("[PWA] Controllerchange reload suppressed to prevent reload loop.");
          }
        }
      });
    };

    if (document.readyState === "complete") {
      registerSW();
    } else {
      window.addEventListener("load", registerSW);
    }

    return () => {
      window.removeEventListener("load", registerSW);
      if (updateInterval) clearInterval(updateInterval);
    };
  }, []);

  // 5. Update Application Trigger
  const updateApp = useCallback(() => {
    if (!isOnline) return;
    setIsUpdating(true);
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      // Safety fallback: If controllerchange does not fire within 3.5s, trigger reload
      setTimeout(() => {
        try {
          sessionStorage.setItem("zakeem:pwa:last_sw_reload", String(Date.now()));
        } catch {}
        window.location.reload();
      }, 3500);
    } else {
      try {
        sessionStorage.setItem("zakeem:pwa:last_sw_reload", String(Date.now()));
      } catch {}
      window.location.reload();
    }
  }, [waitingWorker, isOnline]);

  const dismissUpdate = useCallback(() => {
    setUpdateDismissed(true);
    try {
      sessionStorage.setItem("zakeem:pwa:update_dismissed_session", "true");
    } catch {}
  }, []);

  // 6. Manual Reconnection Check (Zero destructive reload)
  const checkConnection = useCallback(async (): Promise<boolean> => {
    setIsReconnecting(true);
    try {
      const res = await fetch("/favicon.svg?_zk=" + Date.now(), {
        method: "HEAD",
        cache: "no-store",
      });
      if (res.ok) {
        setIsOnline(true);
        setReconnectedRecently(true);
        setTimeout(() => setReconnectedRecently(false), 4000);
        setIsReconnecting(false);
        window.dispatchEvent(new CustomEvent("zakeem-online-restored"));
        return true;
      }
    } catch {
      // Still offline
    }
    setIsOnline(false);
    setIsReconnecting(false);
    return false;
  }, []);

  // 7. Install Trigger (Native or iOS modal guide)
  const promptInstall = useCallback(async () => {
    if (isNative) return;
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSInstallGuide(true);
    }
  }, [deferredPrompt, isIOS, isNative]);

  const dismissInstallInvitation = useCallback(() => {
    setInstallDismissed(true);
    try {
      sessionStorage.setItem("zakeem:pwa:install_dismissed_session", "true");
      // 7-day cooldown
      localStorage.setItem("zakeem:pwa:install_dismissed_until", String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    } catch {}
  }, []);

  const canInstall = !isNative && (Boolean(deferredPrompt) || (isIOS && !isInstalled));

  return (
    <PWAContext.Provider
      value={{
        isOnline,
        isReconnecting,
        reconnectedRecently,
        hasUpdate,
        isUpdating,
        canInstall,
        isInstalled,
        isNative,
        isIOS,
        showIOSInstallGuide,
        setShowIOSInstallGuide,
        updateApp,
        dismissUpdate,
        promptInstall,
        checkConnection,
        installDismissed,
        dismissInstallInvitation,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = (): PWAContextType => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error("usePWA must be used within a PWAProvider");
  }
  return context;
};
