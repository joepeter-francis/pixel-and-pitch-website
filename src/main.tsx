import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { PostHogProvider } from "@posthog/react";

// Apply saved theme preference
const saved = localStorage.getItem("theme");
if (saved === "light") {
  document.documentElement.classList.remove("dark");
} else {
  document.documentElement.classList.add("dark");
}

const posthogOptions = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST as string,
  defaults: "2026-01-30",
  // Opt out by default until user gives consent
  opt_out_capturing_by_default: localStorage.getItem("cookie_consent") !== "accepted",
} as const;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string}
      options={posthogOptions}
    >
      <App />
    </PostHogProvider>
  </StrictMode>
);
