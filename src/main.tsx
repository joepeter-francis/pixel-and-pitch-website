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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string}
      options={{
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST as string,
        opt_out_capturing_by_default: localStorage.getItem("cookie_consent") !== "accepted",
        persistence: "localStorage+cookie",
      }}
    >
      <App />
    </PostHogProvider>
  </StrictMode>
);
