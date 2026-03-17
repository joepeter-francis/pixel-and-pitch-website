import posthog from "posthog-js";

export function trackPage(url?: string) {
  posthog.capture("$pageview", { $current_url: url ?? window.location.href });
}

export function trackEvent(event: string, props?: Record<string, unknown>) {
  posthog.capture(event, props);
}

export function identifyUser(email: string, props?: Record<string, unknown>) {
  posthog.identify(email, props);
}

export function resetUser() {
  posthog.reset();
}

export function getDistinctId(): string | null {
  try {
    return posthog.get_distinct_id() ?? null;
  } catch {
    return null;
  }
}
