import posthog from "posthog-js";

let _ready = false;

export function initAnalytics(key: string, options?: object) {
  if (_ready || !key) return;
  posthog.init(key, {
    api_host: "https://eu.i.posthog.com",
    persistence: "localStorage+cookie",
    autocapture: false,
    capture_pageview: false,
    ...options,
  });
  _ready = true;
}

export function trackPage(url?: string) {
  if (!_ready) return;
  posthog.capture("$pageview", { $current_url: url ?? window.location.href });
}

export function trackEvent(event: string, props?: Record<string, unknown>) {
  if (!_ready) return;
  posthog.capture(event, props);
}

export function identifyUser(email: string, props?: Record<string, unknown>) {
  if (!_ready) return;
  posthog.identify(email, props);
}

export function resetUser() {
  if (!_ready) return;
  posthog.reset();
}

export function getDistinctId(): string | null {
  if (!_ready) return null;
  try {
    return posthog.get_distinct_id() ?? null;
  } catch {
    return null;
  }
}
