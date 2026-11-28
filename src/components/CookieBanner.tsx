import { useState } from "react";
import { Link } from "react-router-dom";
import { loadGoogleTagManager } from "../lib/analytics";

export default function CookieBanner() {
  // Shown until the visitor accepts or declines. The rest of the page stays scrollable.
  const [visible, setVisible] = useState(() => !localStorage.getItem("cookie_consent"));

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    loadGoogleTagManager();
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[10000] min-h-[10vh] flex items-center border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-2xl px-4 py-3"
    >
      <div className="mx-auto w-full max-w-5xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
          We use cookies and similar tools to measure and improve this site.{" "}
          <Link to="/cookie-consent-details" className="underline text-purple-500 hover:text-purple-400">
            Read our cookie details
          </Link>
          .
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
