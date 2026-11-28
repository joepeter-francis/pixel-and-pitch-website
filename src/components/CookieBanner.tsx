import { useState, useEffect } from "react";
import { loadGoogleTagManager } from "../lib/analytics";

export default function CookieBanner() {
  // Shown until the visitor accepts or declines. Lazy init avoids a state update inside an effect.
  const [visible, setVisible] = useState(() => !localStorage.getItem("cookie_consent"));

  // Stop the page scrolling behind the modal until the visitor makes a choice
  useEffect(() => {
    if (!visible) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-consent-title"
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-2xl"
      >
        <h2 id="cookie-consent-title" className="text-lg font-bold text-gray-900 dark:text-gray-50">
          Your privacy choices
        </h2>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          We use cookies and similar tools to understand how visitors use this website and to improve it.
          Please choose whether to accept them before continuing.
        </p>

        <ul className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <li>
            <span className="font-semibold text-gray-800 dark:text-gray-200">Google Tag Manager and Google Analytics 4:</span>{" "}
            measure visits, page views, clicks and contact form submissions. These set cookies and collect
            information such as pages viewed, approximate location, device type and the site you came from.
          </li>
          <li>
            <span className="font-semibold text-gray-800 dark:text-gray-200">Apollo.io website tracker:</span>{" "}
            identifies the companies that visit this website. For some U.S. visitors it may also identify
            individuals.
          </li>
          <li>
            <span className="font-semibold text-gray-800 dark:text-gray-200">HubSpot:</span>{" "}
            when you send the contact form, HubSpot's tracking cookie links the submission to your visit.
          </li>
        </ul>

        <p className="mt-4 text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
          If you decline, these tools will not load and no analytics or tracking data will be collected from
          your visit. You can still use the site and contact us as normal. Your choice is saved in this
          browser; to change it, clear this site's data in your browser settings.
        </p>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            onClick={decline}
            className="rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:border-gray-400 transition-all"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2.5 text-sm font-bold text-white transition-all"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
