/**
 * Zakeem Solutions — SPA Analytics & Route Tracking Component
 *
 * Integrates Google Analytics 4 (GA4) with React Router:
 * - Initializes GA4 once on client mount
 * - Sends deduplicated page_view events on every client-side route transition
 * - Intercepts contact interaction links (tel:, mailto:, WhatsApp) site-wide
 * - Non-visual component (renders null)
 */

import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  initGA,
  trackPageView,
  trackPhoneClick,
  trackEmailClick,
  trackWhatsAppClick,
} from "@/lib/analytics";

export const AnalyticsTracker: React.FC = () => {
  const location = useLocation();
  const lastTrackedPathRef = useRef<string | null>(null);

  // 1. Initialize GA4 once on client mount
  useEffect(() => {
    initGA();
  }, []);

  // 2. Track route transitions without duplicating page_view events
  useEffect(() => {
    const currentPath = `${location.pathname}${location.search}`;

    if (currentPath === lastTrackedPathRef.current) {
      return;
    }

    lastTrackedPathRef.current = currentPath;

    // Defer slightly to allow child <SEO> tags to update document.title
    const timerId = window.setTimeout(() => {
      trackPageView(currentPath, document.title);
    }, 50);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [location.pathname, location.search]);

  // 3. Global delegated click interception for contact channels (tel:, mailto:, WhatsApp)
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Telephone link click
      if (href.startsWith("tel:")) {
        const cleanPhone = href.replace(/^tel:/, "").trim();
        const label = anchor.innerText?.trim() || cleanPhone || "Corporate Line";
        trackPhoneClick(label);
        return;
      }

      // Email link click
      if (href.startsWith("mailto:")) {
        const lowerHref = href.toLowerCase();
        let recipientType = "corporate";
        if (lowerHref.includes("sales")) {
          recipientType = "sales";
        } else if (lowerHref.includes("support")) {
          recipientType = "support";
        } else if (lowerHref.includes("careers")) {
          recipientType = "careers";
        }
        trackEmailClick(recipientType);
        return;
      }

      // WhatsApp link click
      if (
        href.includes("wa.me/") ||
        href.includes("api.whatsapp.com") ||
        href.includes("whatsapp.com")
      ) {
        trackWhatsAppClick("Direct WhatsApp Channel");
      }
    };

    document.addEventListener("click", handleDocumentClick, {
      capture: true,
      passive: true,
    });

    return () => {
      document.removeEventListener("click", handleDocumentClick, {
        capture: true,
      });
    };
  }, []);

  return null;
};
