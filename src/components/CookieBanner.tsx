import { useState, useEffect } from "react";
import posthog from "posthog-js";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookie_consent")) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    posthog.opt_in_capturing();
    // Manually fire pageview since the initial one was suppressed while opted-out
    posthog.capture("$pageview", { $current_url: window.location.href });
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", "declined");
    posthog.opt_out_capturing();
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-4 shadow-2xl">
      <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed flex-1">
          We use anonymous analytics to improve this site. No personal data is collected without your consent.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={decline}
            className="rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:border-gray-400 transition-all"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-sm font-bold text-white transition-all"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
