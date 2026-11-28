import { Link } from "react-router-dom";

const LAST_UPDATED = "28 November 2026";

export default function CookieConsentDetails() {
  const changeChoice = () => {
    localStorage.removeItem("cookie_consent");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 font-[Inter]">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-3xl px-6 py-5 flex items-center justify-between">
          <Link to="/" className="text-sm font-semibold text-purple-500 hover:text-purple-400">
            ← Back to Pixel &amp; Pitch
          </Link>
          <span className="text-xs text-gray-500">Last updated {LAST_UPDATED}</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12 space-y-10 leading-relaxed">
        <section>
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-50">Cookie and analytics details</h1>
          <p className="mt-4 text-base text-gray-600 dark:text-gray-400">
            This page explains, in plain language, what we measure on this website, which tools help us do it,
            how the information is used, and how you can change your mind at any time. You don't need to read
            all of it. The short version is below, and the sections after it give the full details.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">The short version</h2>
          <ul className="mt-3 list-disc pl-5 space-y-2 text-sm">
            <li>We use Google Analytics to see which pages are useful and how people move around the site.</li>
            <li>We use Apollo.io to understand which businesses visit the site, so we can show relevant services.</li>
            <li>We use HubSpot to receive and follow up on contact form enquiries.</li>
            <li>You can accept or decline. Declining means none of these measurement tools load on your visit.</li>
            <li>You can change your choice at any time, using the button further down this page.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Why we use these tools</h2>
          <p className="mt-3">
            Pixel &amp; Pitch is a small team. We want the website to be useful to the people who visit it, and
            that's hard to judge without some information. Are visitors finding the services page? Do they reach
            the contact form? Which parts of the site do people skip? Analytics answers these questions, so we
            can fix confusing pages and make the useful ones easier to find.
          </p>
          <p className="mt-3">
            We don't use these tools to sell your information, to show you adverts from other companies, or to
            build profiles of individuals for marketing. The purpose is to make this website better and to
            respond properly to businesses that get in touch.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">The tools we use</h2>

          <div className="mt-4 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Google Tag Manager and Google Analytics 4</h3>
              <p className="mt-2">
                Google Tag Manager is a small piece of software that lets us add and manage measurement tools
                without changing the website's code each time. Google Analytics 4 is the tool that turns those
                measurements into reports. Together they tell us how many people visit, which pages they look at,
                how long they stay, what they click, and where they come from.
              </p>
              <p className="mt-2">
                The events we record include page views, clicks on our main calls to action, clicks on email and
                phone links, the start and completion of the contact form, and which sections of a page you
                scroll to. We do not record the text you type into the form. Google processes this information on
                our behalf under its own terms, which you can read at{" "}
                <a className="underline text-purple-500 hover:text-purple-400" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                  policies.google.com/privacy
                </a>.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Apollo.io website tracker</h3>
              <p className="mt-2">
                Apollo is a sales intelligence platform. Its website tracker recognises the company a visit comes
                from, based on the network the visit is made over, and matches it against business information.
                This helps us understand which organisations are looking at our services. For visitors in the
                United States, the tracker may also recognise the individual person, where that information is
                available to Apollo.
              </p>
              <p className="mt-2">
                We use this to spot businesses that may be interested in what we build, so that our team can
                reply with something relevant. We don't use it to contact people who have not got in touch with
                us, and we don't share visitor information with other companies. Apollo's own privacy information
                is at{" "}
                <a className="underline text-purple-500 hover:text-purple-400" href="https://www.apollo.io/privacy-policy" target="_blank" rel="noopener noreferrer">
                  apollo.io/privacy-policy
                </a>.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">HubSpot</h3>
              <p className="mt-2">
                HubSpot is the system where we keep contact form enquiries. When you send the form and you have
                accepted cookies, HubSpot's tracking cookie is attached to your submission. This lets us see which
                pages you looked at before getting in touch, so the reply can be relevant to you. If you decline,
                the form still works: we receive your message, but without that link to your visit.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">What information is involved</h2>
          <p className="mt-3">
            Depending on your choice, the tools may record some of the following. Most of it is general
            information about the visit, not about you as a person.
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-2">
            <li><span className="font-semibold">Visit information:</span> the pages you open, the order you open them in, how long you stay, and whether you scroll.</li>
            <li><span className="font-semibold">Interaction information:</span> which buttons and links you click, including the contact form, email and phone links.</li>
            <li><span className="font-semibold">Device and browser information:</span> the type of device (phone, tablet or computer), the browser, and the screen size.</li>
            <li><span className="font-semibold">Location information:</span> an approximate location, such as a city or region, derived from your network. We don't get your exact address.</li>
            <li><span className="font-semibold">Referral information:</span> the website or search you came from, if your browser shares it.</li>
            <li><span className="font-semibold">Company information:</span> for Apollo, the organisation a visit appears to come from.</li>
            <li><span className="font-semibold">Contact details you choose to send:</span> your name, email, phone number, company interest and message, if you submit the contact form.</li>
          </ul>
          <p className="mt-4 text-sm text-gray-500">
            We never ask for, and the tools are not set up to collect, passwords, payment details or government
            identifiers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Cookies on this site</h2>
          <p className="mt-3">
            A cookie is a small text file a website stores in your browser. Some cookies only help a site work;
            others measure usage or recognise a returning visitor. The table below lists the ones these tools can
            set. Names and lengths can change when a provider updates its service.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                  <th className="py-2 pr-4 font-semibold">Name</th>
                  <th className="py-2 pr-4 font-semibold">Provider</th>
                  <th className="py-2 pr-4 font-semibold">What it does</th>
                  <th className="py-2 font-semibold">How long</th>
                </tr>
              </thead>
              <tbody className="align-top">
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <td className="py-2 pr-4">_ga and _ga_*</td>
                  <td className="py-2 pr-4">Google Analytics</td>
                  <td className="py-2 pr-4">Tells apart different visitors and visits so we can count them correctly.</td>
                  <td className="py-2">Up to 2 years</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <td className="py-2 pr-4">hubspotutk</td>
                  <td className="py-2 pr-4">HubSpot</td>
                  <td className="py-2 pr-4">Links a contact form submission to the visit that came before it.</td>
                  <td className="py-2">Up to 13 months</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">cookie_consent</td>
                  <td className="py-2 pr-4">This website</td>
                  <td className="py-2 pr-4">Remembers whether you accepted or declined, so we don't ask again. It is stored in your browser, not sent to us.</td>
                  <td className="py-2">Until you clear it</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Apollo and Google Tag Manager may also use technical storage in your browser while they run. Their
            own privacy information lists the details.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">How long we keep information</h2>
          <p className="mt-3">
            Analytics data is kept only as long as it's useful for understanding trends. Google Analytics data is
            kept for a limited period set in our account, and then removed automatically. Contact form enquiries
            are kept for as long as they are needed to reply and to follow up on a business relationship. You can
            ask us to delete yours at any time (see below).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Who sees the information</h2>
          <p className="mt-3">
            Our team, and the providers that run these tools for us: Google, Apollo and HubSpot. They process the
            information only to provide their services to us. We don't sell visitor information, and we don't
            share it with other businesses for their own marketing.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Your choice and your rights</h2>
          <p className="mt-3">
            Using this website doesn't depend on accepting these tools. You can decline, and you can change your
            mind later. You can also ask us what we hold about you, ask us to correct or delete it, or ask us to
            stop using it. Write to{" "}
            <a className="underline text-purple-500 hover:text-purple-400" href="mailto:sales@pixelndpitch.com">sales@pixelndpitch.com</a>{" "}
            and we'll reply.
          </p>

          <div className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
            <p className="text-sm">
              Your current choice is stored in this browser. Changing it below will show the cookie message again
              when the page reloads. Cookies that were already set stay until they expire, unless you clear them
              in your browser.
            </p>
            <button
              onClick={changeChoice}
              className="rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2.5 text-sm font-bold text-white transition-all"
            >
              Change my cookie choice
            </button>
          </div>

          <p className="mt-6 text-sm">
            If you only want to stop Google Analytics, Google offers a free browser add-on at{" "}
            <a className="underline text-purple-500 hover:text-purple-400" href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
              tools.google.com/dlpage/gaoptout
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Questions</h2>
          <p className="mt-3">
            If anything here is unclear, email{" "}
            <a className="underline text-purple-500 hover:text-purple-400" href="mailto:sales@pixelndpitch.com">sales@pixelndpitch.com</a>{" "}
            and a person will answer you.
          </p>
        </section>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-3xl px-6 py-6 text-xs text-gray-500">
          © 2026 Pixel &amp; Pitch. <Link to="/" className="underline hover:text-purple-400">Back to the home page</Link>
        </div>
      </footer>
    </div>
  );
}
