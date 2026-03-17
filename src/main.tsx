import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { PostHogProvider } from "@posthog/react";
import posthog from "posthog-js";

// Apply saved theme preference
const saved = localStorage.getItem("theme");
if (saved === "light") {
  document.documentElement.classList.remove("dark");
} else {
  document.documentElement.classList.add("dark");
}

// Initialize PostHog synchronously at module level — avoids React useEffect timing gaps.
// Opted out by default until cookie consent is given.
posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string, {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST as string,
  opt_out_capturing_by_default: localStorage.getItem("cookie_consent") !== "accepted",
  persistence: "localStorage+cookie",
  capture_pageview: true,  // auto-capture pageview on init (sent immediately, not batched)
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      <App />
    </PostHogProvider>
  </StrictMode>
);
