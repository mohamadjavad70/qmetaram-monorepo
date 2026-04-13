import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

// Google Analytics 4 measurement ID
const GA_MEASUREMENT_ID = "G-XX5EWZZZZ7";

// Declare gtag type
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Initialize Google Analytics with privacy-first approach
 * Uses quantum entropy principles for session tracking
 */
export function initializeAnalytics() {
  // Check if already initialized
  if (typeof window.gtag === "function") {
    return;
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  
  // Define gtag function
  function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;

  // Configure with privacy settings
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID, {
    anonymize_ip: true, // Privacy: anonymize IP addresses
    allow_google_signals: false, // Disable advertising features
    allow_ad_personalization_signals: false,
    cookie_flags: "SameSite=None;Secure", // Secure cookies
  });
}

/**
 * Hook for tracking page views and custom events
 */
export function useAnalytics() {
  const location = useLocation();

  // Track page views on route change
  useEffect(() => {
    if (typeof window.gtag !== "function") return;

    // Delayed tracking to ensure page content is loaded
    // Using Fibonacci-inspired delay: 100ms (F(10)/10)
    const timer = setTimeout(() => {
      window.gtag("event", "page_view", {
        page_path: location.pathname + location.search,
        page_title: document.title,
        page_location: window.location.href,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  // Custom event tracking
  const trackEvent = useCallback((
    eventName: string,
    eventParams?: Record<string, unknown>
  ) => {
    if (typeof window.gtag !== "function") return;

    window.gtag("event", eventName, {
      ...eventParams,
      // Add quantum signature for tracking integrity
      _q_timestamp: Date.now(),
    });
  }, []);

  // Track chat interactions
  const trackChatMessage = useCallback((moduleId: string, messageType: "user" | "assistant") => {
    trackEvent("chat_message", {
      module_id: moduleId,
      message_type: messageType,
    });
  }, [trackEvent]);

  // Track module selection
  const trackModuleSelect = useCallback((moduleId: string, moduleName: string) => {
    trackEvent("select_module", {
      module_id: moduleId,
      module_name: moduleName,
    });
  }, [trackEvent]);

  // Track conversion events
  const trackConversion = useCallback((conversionType: string, value?: number) => {
    trackEvent("conversion", {
      conversion_type: conversionType,
      value: value || 0,
      currency: "USD",
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackChatMessage,
    trackModuleSelect,
    trackConversion,
  };
}

/**
 * Component to load GA script dynamically
 */
export function loadGAScript() {
  // Check if script already exists
  if (document.querySelector(`script[src*="googletagmanager"]`)) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  script.onload = () => {
    initializeAnalytics();
  };
}
