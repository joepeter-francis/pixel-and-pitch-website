// Google Tag Manager + Google Analytics 4.
// GTM only loads after the visitor clicks "Accept" on the cookie banner.
// Events are pushed to dataLayer; the tags, triggers and GA4 setup live in GTM.

const GTM_ID = "GTM-52K846ZN";

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

export function hasAnalyticsConsent(): boolean {
  return localStorage.getItem("cookie_consent") === "accepted";
}

let gtmLoaded = false;

export function loadGoogleTagManager() {
  if (gtmLoaded || !hasAnalyticsConsent()) return;
  gtmLoaded = true;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);
}

export function trackEvent(event: string, props?: Record<string, unknown>) {
  if (!hasAnalyticsConsent()) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...props });
}
