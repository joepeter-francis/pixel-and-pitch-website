import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowRight, Menu, X, Sun, Moon, Mail, ChevronRight, Star,
  Globe, Users, Building2, GraduationCap, Boxes, ChefHat, ShoppingBag,
  Cake, Bot, Sparkles, Workflow, Database, MapPin, Check, Zap, MessageCircle,
  type LucideIcon
} from "lucide-react";
import { trackEvent, identifyUser, getDistinctId } from "../lib/analytics";
import CookieBanner from "../components/CookieBanner";

const LOGO = "https://pub-0f4114fde3044f60b819543e9dc412f4.r2.dev/brand/2433c9af-017d-4205-86ed-bc283fc9ce87.png";
const API_URL = import.meta.env.VITE_API_URL || "https://api-marketplace.pixelndpitch.com";
const SALES_EMAIL = "sales@pixelndpitch.com";

// HubSpot forms (public submission endpoint, no token needed in the browser)
const HUBSPOT_PORTAL_ID = "248128655";
const HUBSPOT_FORM_ID = "40833b4b-ff41-4490-8ef9-5db12655ed91";
const HUBSPOT_URL = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`;

// Maps the "I'm interested in" dropdown value to the label sent to HubSpot's industry field
const INTEREST_LABELS: Record<string, string> = {
  website: "Website or web app",
  crm: "Customised CRM",
  erp_business: "ERP for business",
  erp_college: "ERP for college",
  inventory: "Inventory management",
  ordering: "Ordering platform (restaurant / bakery)",
  ai: "AI solutions",
  general: "General inquiry",
};

// HubSpot tracking cookie, used only once the visitor has accepted cookies
function getHubspotUtk(): string | undefined {
  return document.cookie.split("; ").find(c => c.startsWith("hubspotutk="))?.split("=")[1];
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const SERVICES: { Icon: LucideIcon; title: string; desc: string; features: string[] }[] = [
  {
    Icon: Globe,
    title: "Websites & Web Apps",
    desc: "Fast, search-friendly websites and web applications built on modern frameworks and designed to convert visitors into customers.",
    features: ["Business and portfolio websites", "Web apps and client portals", "SEO and Core Web Vitals", "AI chat and lead capture"],
  },
  {
    Icon: Database,
    title: "Customised CRM",
    desc: "A CRM shaped around how your team sells, follows up and supports customers, rather than a generic template.",
    features: ["Lead and pipeline tracking", "Customer history and notes", "AI lead scoring and follow-up reminders", "Email, WhatsApp and payment integrations"],
  },
  {
    Icon: Building2,
    title: "ERP for Businesses",
    desc: "Finance, sales, inventory, HR and operations connected in one system, with reporting your management team can act on.",
    features: ["Accounting and GST-ready invoicing", "HR and payroll workflows", "Procurement and operations", "Role-based management dashboards"],
  },
  {
    Icon: GraduationCap,
    title: "ERP for Colleges",
    desc: "Admissions, student records, fees, attendance and examinations managed through one secure campus platform.",
    features: ["Admissions and student records", "Fee collection and receipts", "Attendance and timetables", "Student and parent portals"],
  },
  {
    Icon: Boxes,
    title: "Inventory Management",
    desc: "Live stock visibility across warehouses, shops and kitchens, with alerts before you run out or over-order.",
    features: ["Multi-location stock tracking", "Barcode and SKU management", "Low-stock and expiry alerts", "AI demand forecasting"],
  },
  {
    Icon: ShoppingBag,
    title: "Ordering Platforms",
    desc: "Online ordering, digital menus and kitchen workflows for restaurants, cafés, bakeries and small food brands.",
    features: ["Digital menu and online ordering", "Custom cake and pre-order requests", "UPI, card and cash on delivery", "Kitchen display and order tracking"],
  },
];

const INDUSTRIES: { Icon: LucideIcon; title: string; desc: string }[] = [
  { Icon: Building2, title: "Businesses & Enterprises", desc: "Operations, sales and finance teams that need one connected system instead of spreadsheets." },
  { Icon: GraduationCap, title: "Colleges & Universities", desc: "Institutions that want digital admissions, fee management and a single source of student data." },
  { Icon: ChefHat, title: "Restaurants & Cafés", desc: "Table, takeaway and delivery orders with menus that update in real time." },
  { Icon: Cake, title: "Bakeries & Small Food Brands", desc: "Simple online ordering, custom orders and stock tracking built for small teams." },
];

const AI_CAPABILITIES: string[] = [
  "AI assistants and chatbots trained on your own business data",
  "Workflow automation across your CRM, ERP and inventory",
  "Invoice and document extraction that removes manual data entry",
  "Demand forecasting and analytics dashboards",
  "AI-assisted SEO content and search visibility for your website",
  "Secure, private deployments that keep your data under your control",
];

const PROCESS_STEPS = [
  { n: "01", title: "Discovery", desc: "A free discovery call to understand your processes, goals and budget." },
  { n: "02", title: "Proposal", desc: "Clear scope, milestones and a fixed-price quote from our team." },
  { n: "03", title: "Design", desc: "Wireframes and mockups for your approval before any development starts." },
  { n: "04", title: "Build", desc: "Agile sprints with regular demos and a staging environment to review." },
  { n: "05", title: "Test & Launch", desc: "Security, performance and cross-device testing, followed by go-live support." },
  { n: "06", title: "Support", desc: "Training, documentation and optional maintenance, updates and AI improvements." },
];

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "What services does Pixel & Pitch offer?",
    a: "Pixel & Pitch is a boutique IT and AI services firm. We build websites and web applications, customised CRM systems, ERP systems for businesses and colleges, inventory management systems, and online ordering platforms for restaurants, cafés and bakeries.",
  },
  {
    q: "How do you use AI in your services?",
    a: "We build AI into the systems we deliver: AI assistants and chatbots trained on your business data, workflow automation, invoice and document extraction, demand forecasting, lead scoring and AI-assisted SEO for websites.",
  },
  {
    q: "Do you build custom CRM and ERP systems for small businesses?",
    a: "Yes. We design CRM and ERP systems around how your business actually runs, starting with the features you need and expanding as you grow.",
  },
  {
    q: "Can you build an ordering platform for my restaurant or bakery?",
    a: "Yes. We build online ordering platforms with digital menus, custom and pre-order requests, UPI and card payments, and kitchen order tracking for restaurants, cafés, bakeries and small food brands.",
  },
  {
    q: "Do you build management systems for colleges?",
    a: "Yes. We build ERP platforms for colleges and universities covering admissions, student records, fee collection, attendance, timetables and student and parent portals.",
  },
  {
    q: "How much does a project cost?",
    a: `Pricing depends on scope, so we do not publish fixed prices. Contact our team at ${SALES_EMAIL} or use the contact form on this page. After a discovery call we provide a tailored, fixed-price proposal.`,
  },
  {
    q: "Do you provide support after launch?",
    a: "Yes. We offer training, documentation and optional maintenance plans that cover bug fixes, security and dependency updates, and AI improvements.",
  },
];

type TimeSlot = "midnight" | "earlyMorning" | "morning" | "afternoon" | "evening" | "night";
type WeatherKey = "sunny" | "rainy" | "cloudy" | "foggy" | "snowy" | "stormy";

const RETURNING_TAGLINES: string[] = [
  "Oh look, you're back. The contact form missed you.",
  "Second visit? The form is literally right there. Scroll down. Go on.",
  "You came back. That means we did something right. The form is a hint.",
  "Returning visitor spotted. Our inbox is still empty. Coincidence?",
  "Bold move coming back without filling the form. Respect. Now fill it.",
  "You. Again. We like you. The form likes you too.",
  "Still browsing? The form takes 47 seconds. We timed it.",
  "Back again? Either you love us or you forgot to scroll to the form.",
  "Our analytics noticed. Our contact form is hurt. Please help.",
  "Round two. Are you going to fill the form this time or are we doing round three?",
  "You've seen the site. You like the site. The site has a form. Just saying.",
  "We're not saying you should fill the form. But the form is saying it.",
  "Third time lucky? Or just form-phobic? No judgment. Okay, a little judgment.",
  "You keep coming back like you own the place. You could — just fill the form.",
  "Our servers literally said 'oh it's you again'. Fill the form and make it official.",
  "You're basically family at this point. Family fills forms.",
  "We added a fun form. Okay it's a normal form. But it leads to great things.",
  "Still here? The form is 5 fields. Your attention span is longer than that.",
  "Every time you visit without contacting us, a pixel cries. Don't do it to the pixels.",
  "We noticed. We're not mad. We're just going to keep showing up until you do.",
];

function getVisitCount(): number {
  const raw = localStorage.getItem("pnp_visit_count");
  const count = raw ? parseInt(raw, 10) + 1 : 1;
  localStorage.setItem("pnp_visit_count", String(count));
  return count;
}

const TAGLINES: Record<TimeSlot, string[]> & { weather: Record<WeatherKey, string[]> } = {
  midnight: [
    "Midnight and still building? Legends work these hours.",
    "While the world sleeps, AI is still working for you.",
    "3am ideas are the ones that change how businesses run.",
    "The best operations teams never clock out.",
    "Dark outside. Smarter systems inside.",
  ],
  earlyMorning: [
    "Up before the sun? Your systems can be too.",
    "Early mornings are the perfect time to automate the routine.",
    "Coffee in hand. Dashboards ready. Let's build.",
    "Let AI do yesterday's data entry before your first meeting.",
    "Dawn belongs to builders.",
  ],
  morning: [
    "Good morning. Let's make today's workflow smarter.",
    "Your customers are online. Is your business ready for them?",
    "Rise and build something your team will love using.",
    "Fresh morning, fresh systems, fewer spreadsheets.",
    "Every great business runs on great software.",
  ],
  afternoon: [
    "Afternoon slump? Let automation pick up the slack.",
    "Halfway through the day. Halfway to a smarter business.",
    "Your competition is in a meeting. You're upgrading.",
    "Productivity peak hour. Let's put AI to work.",
    "Great systems don't wait for the right time.",
  ],
  evening: [
    "Clocking out? Your business can keep running smarter.",
    "Evening is when the best ideas for your business show up.",
    "Dinner can wait. Your inventory and orders can't.",
    "Golden hour for smarter operations.",
    "The best systems are built one thoughtful step at a time.",
  ],
  night: [
    "Night mode activated. Smarter business mode: on.",
    "The best ideas come after dark. So do the best systems.",
    "Your competition stopped hours ago. Your systems can keep going.",
    "After hours is where operations get automated.",
    "Silence + ambition = something great.",
  ],
  weather: {
    sunny: [
      "Bright day, brighter future. Let's build.",
      "Clear skies, clear vision. Today's the day.",
      "Sunshine and smart systems — unstoppable combo.",
    ],
    rainy: [
      "Rainy day? Perfect time to digitise your operations.",
      "Rain outside, fire inside. Let's go.",
      "Rainy days are made for big ideas.",
    ],
    cloudy: [
      "Grey skies, bright future.",
      "Clouds can't dim your vision.",
    ],
    stormy: [
      "Storms don't stop builders. They inspire them.",
      "The best systems survive every storm.",
    ],
    snowy: [
      "Snow day? Perfect time to build your next system.",
      "Cold outside, warm ambition inside.",
    ],
    foggy: [
      "Foggy morning, focused founder.",
      "Can't see far? Build anyway. The path clears when you move.",
    ],
  },
};

function getTimeSlot(): TimeSlot {
  const h = new Date().getHours();
  if (h >= 23 || h < 4) return "midnight";
  if (h < 8)  return "earlyMorning";
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 20) return "evening";
  return "night";
}

function getWeatherKey(wmoCode: number): WeatherKey | null {
  if (wmoCode === 0) return "sunny";
  if (wmoCode <= 3)  return "cloudy";
  if (wmoCode <= 48) return "foggy";
  if (wmoCode <= 67) return "rainy";
  if (wmoCode <= 77) return "snowy";
  if (wmoCode <= 82) return "rainy";
  if (wmoCode >= 95) return "stormy";
  return null;
}

function pickTagline(slot: TimeSlot, weather: WeatherKey | null, visitCount: number): string {
  if (visitCount >= 2) {
    return RETURNING_TAGLINES[Math.floor(Math.random() * RETURNING_TAGLINES.length)];
  }
  const base = TAGLINES[slot];
  const pool = weather ? [...base, ...TAGLINES.weather[weather]] : base;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function LandingPage() {
  const [dark, setDark] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", product_interest: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [tagline, setTagline] = useState("");
  const [displayedTagline, setDisplayedTagline] = useState("");
  const [formTouched, setFormTouched] = useState(false);
  const visitCount = useRef(getVisitCount());

  // Intro overlay — shown only on first ever visit
  const [showIntro, setShowIntro] = useState(() => localStorage.getItem("pnp_intro_seen") !== "1");
  const [introExiting, setIntroExiting] = useState(false);
  const [typingDone, setTypingDone] = useState(false);
  const dismissedRef = useRef(false);

  const dismissIntro = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    localStorage.setItem("pnp_intro_seen", "1");
    setIntroExiting(true);
    setTimeout(() => setShowIntro(false), 900);
  }, []);

  const servicesRef = useRef<HTMLElement>(null);
  const aiRef = useRef<HTMLElement>(null);
  const industriesRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [showBubble, setShowBubble] = useState(false);

  // Show the floating "Contact us" bubble once the first section (hero) has been scrolled past
  useEffect(() => {
    const onScroll = () => {
      const heroBottom = heroRef.current?.offsetHeight ?? window.innerHeight;
      setShowBubble(window.scrollY > heroBottom - 100);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved !== "light";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(async (d) => {
        const { latitude, longitude, country_name } = d;
        if (country_name) sessionStorage.setItem("pnp_country", country_name);
        let weather: WeatherKey | null = null;
        if (latitude && longitude) {
          try {
            const w = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=weather_code`
            ).then(r => r.json());
            weather = getWeatherKey(w?.current?.weather_code ?? -1);
          } catch {
            // weather is optional — silently ignore
          }
        }
        setTagline(pickTagline(getTimeSlot(), weather, visitCount.current));
      })
      .catch(() => {
        setTagline(pickTagline(getTimeSlot(), null, visitCount.current));
      });
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTagline(prev => prev || pickTagline(getTimeSlot(), null, visitCount.current));
    }, 2500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!tagline) return;
    setDisplayedTagline("");
    let i = 0;
    const speed = Math.max(30, 55 - Math.floor(tagline.length / 4));
    const timer = setInterval(() => {
      i++;
      setDisplayedTagline(tagline.slice(0, i));
      if (i >= tagline.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [tagline]);

  // Mark typing done — no auto-dismiss, user scrolls to continue
  useEffect(() => {
    if (!showIntro || !tagline || displayedTagline.length < tagline.length) return;
    setTypingDone(true);
  }, [displayedTagline, tagline, showIntro]);

  // Scroll or click anywhere on overlay to skip
  useEffect(() => {
    if (!showIntro) return;
    document.body.style.overflow = "hidden";
    // wheel fires even when body scroll is locked
    const onWheel = (e: WheelEvent) => { if (e.deltaY > 10) dismissIntro(); };
    // touch scroll for mobile
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const onTouchMove = (e: TouchEvent) => {
      if (touchStartY - e.touches[0].clientY > 20) dismissIntro();
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [showIntro, dismissIntro]);

  // Analytics: section viewed tracking via IntersectionObserver
  useEffect(() => {
    const observed = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const section = (entry.target as HTMLElement).dataset.section;
            if (section && !observed.has(section)) {
              observed.add(section);
              trackEvent(`${section}_section_viewed`);
            }
          }
        });
      },
      { threshold: 0.5 }
    );
    [servicesRef, aiRef, industriesRef, contactRef].forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) { toast.error("Name and email are required"); return; }
    setSubmitting(true);
    try {
      const consent = localStorage.getItem("cookie_consent") === "accepted";
      identifyUser(formData.email);
      trackEvent("contact_form_submitted", { product_interest: formData.product_interest });

      const projectId = import.meta.env.VITE_POSTHOG_PROJECT_ID as string;
      const enriched = {
        ...formData,
        ...(consent && {
          session_id: getDistinctId(),
          referrer: document.referrer || null,
          country: sessionStorage.getItem("pnp_country") || null,
          device: /Mobi/i.test(navigator.userAgent) ? "mobile" : "desktop",
          posthog_person_url: projectId
            ? `https://eu.posthog.com/project/${projectId}/persons/${encodeURIComponent(formData.email)}`
            : null,
        }),
      };

      // Split "Full name" into HubSpot's firstname / lastname fields
      const [firstname, ...rest] = formData.name.trim().split(/\s+/);
      const hubspotFields = [
        { name: "firstname", value: firstname },
        { name: "lastname", value: rest.join(" ") },
        { name: "email", value: formData.email },
        { name: "phone", value: formData.phone },
        { name: "message", value: formData.message },
        { name: "industry", value: INTEREST_LABELS[formData.product_interest] ?? "" },
      ].filter(f => f.value);
      const hubspotBody = {
        fields: hubspotFields,
        context: {
          pageUri: window.location.href,
          pageName: document.title,
          ...(consent && { hutk: getHubspotUtk() }),
        },
      };

      // Send to HubSpot and to the existing backend in parallel; succeed if either accepts the lead
      const [hubspotRes, backendRes] = await Promise.allSettled([
        fetch(HUBSPOT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(hubspotBody),
        }),
        fetch(`${API_URL}/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(enriched),
        }),
      ]);
      const accepted = (r: PromiseSettledResult<Response>) => r.status === "fulfilled" && r.value.ok;
      if (!accepted(hubspotRes) && !accepted(backendRes)) throw new Error("Failed");
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setFormData({ name: "", email: "", phone: "", product_interest: "", message: "" });
      setFormTouched(false);
    } catch {
      toast.error(`Something went wrong. Please email us at ${SALES_EMAIL}`);
    } finally {
      setSubmitting(false);
    }
  };

  const navLinks = [
    { label: "Services", href: "#services" },
    { label: "AI Solutions", href: "#ai" },
    { label: "Industries", href: "#industries" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 font-[Inter]">

      {/* ── INTRO OVERLAY (first visit only) ── */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            animate={{ opacity: introExiting ? 0 : 1 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
            style={{
              background: "linear-gradient(135deg, #1e0a3c 0%, #0f0720 45%, #030712 100%)",
            }}
          >
            {/* Radial glow */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(147,51,234,0.35) 0%, transparent 65%)" }} />
            {/* Grid texture */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

            {/* Logo */}
            <motion.img
              src={LOGO}
              alt="Pixel & Pitch"
              className="h-12 w-auto mb-10 relative z-10 opacity-90"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 0.9, y: 0 }}
              transition={{ duration: 0.7 }}
            />

            {/* Typewriter phrase */}
            <div className="relative z-10 text-center px-6 max-w-3xl">
              <p className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight min-h-[4rem]">
                <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-purple-400 bg-clip-text text-transparent">
                  {displayedTagline || <span className="opacity-0">.</span>}
                </span>
                {tagline && displayedTagline.length < tagline.length && (
                  <span className="animate-pulse text-purple-400">|</span>
                )}
                {!tagline && (
                  <span className="animate-pulse text-purple-400">|</span>
                )}
              </p>
            </div>

            {/* Scroll indicator — pill with bouncing bubble, appears after typing */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: typingDone ? 1 : 0 }}
              transition={{ duration: 0.7 }}
              className="absolute bottom-10 z-10 flex flex-col items-center gap-2"
            >
              <div className="w-6 h-10 rounded-full border-2 border-purple-400/40 flex items-start justify-center pt-1.5">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-purple-400/80"
                  animate={{ y: [0, 14, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <span className="text-[9px] font-semibold tracking-[0.3em] uppercase text-purple-400/40">scroll</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-2.5" aria-label="Pixel & Pitch home">
            <img src={LOGO} alt="Pixel & Pitch" className="h-8 w-auto" />
          </a>
          <nav aria-label="Main" className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} aria-label="Toggle colour theme" className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <a href="#contact"
              onClick={() => trackEvent("nav_cta_clicked", { button: "contact_sales" })}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-sm font-bold text-white transition-all shadow-lg shadow-purple-500/25">
              Contact Sales <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <button className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Open menu" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-4 space-y-3">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 py-2">{l.label}</a>
            ))}
            <a href="#contact" onClick={() => setMobileOpen(false)}
              className="block rounded-xl bg-purple-600 px-4 py-3 text-sm font-bold text-white text-center">
              Contact Sales →
            </a>
          </div>
        )}
      </header>

      <main>
        {/* ── HERO ── */}
        <section ref={heroRef} aria-labelledby="hero-heading" className="relative overflow-hidden pt-20 pb-32">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-950/50 via-gray-950 to-gray-950 dark:from-purple-950/60 dark:via-gray-950 dark:to-gray-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(147,51,234,0.15),transparent_60%)]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-300 mb-8">
                <Star className="h-3 w-3" aria-hidden="true" /> Boutique AI & IT services · Built in India
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="mb-8">
              <p className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-5 min-h-[3.5rem]">
                <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
                  {displayedTagline || " "}
                </span>
                {displayedTagline.length < tagline.length && (
                  <span className="animate-pulse text-purple-400">|</span>
                )}
              </p>
              <h1 id="hero-heading" className="text-2xl sm:text-3xl font-bold text-white/80 tracking-tight">
                AI-powered websites, CRMs and ERPs for growing businesses
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Pixel &amp; Pitch is a boutique team that builds websites, custom CRMs, ERPs, inventory
              systems and ordering platforms for businesses, colleges, restaurants and bakeries, with
              AI built into every layer.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <a href="#services"
                onClick={() => trackEvent("hero_cta_clicked", { button: "explore_services" })}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 px-8 py-4 font-bold text-white text-base shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] transition-all">
                <Zap className="h-4 w-4" aria-hidden="true" /> Explore Our Services <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href="#contact"
                onClick={() => trackEvent("hero_cta_clicked", { button: "talk_to_us" })}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-700 bg-gray-900/50 px-8 py-4 font-bold text-gray-200 text-base hover:border-purple-500/50 hover:bg-gray-800/50 transition-all">
                Talk to Our Team <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </motion.div>
          </div>
        </section>

        {/* ── SERVICES ── */}
        <section id="services" ref={servicesRef} data-section="services" aria-labelledby="services-heading" className="py-24 bg-gray-50 dark:bg-gray-900/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <FadeIn className="text-center mb-16">
              <p className="text-sm font-bold uppercase tracking-widest text-purple-500 mb-3">Our Services</p>
              <h2 id="services-heading" className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
                Software and websites, built around your business
              </h2>
              <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                From a professional website to a full ERP, we design and build the systems your team relies on every day.
              </p>
            </FadeIn>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SERVICES.map((s, i) => (
                <FadeIn key={s.title} delay={i * 0.06} className="h-full">
                  <article className="h-full rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-7 flex flex-col">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 mb-5">
                      <s.Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{s.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">{s.desc}</p>
                    <ul className="space-y-2 mt-auto">
                      {s.features.map(f => (
                        <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Check className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" aria-hidden="true" /> {f}
                        </li>
                      ))}
                    </ul>
                  </article>
                </FadeIn>
              ))}
            </div>
            <p className="mt-12 text-center text-gray-500 dark:text-gray-400 text-base max-w-2xl mx-auto leading-relaxed">
              And much more. These are our core services, not a limit. If you need custom software for another workflow, tell us what you have in mind and we will scope it with you.
            </p>
          </div>
        </section>

        {/* ── AI SOLUTIONS ── */}
        <section id="ai" ref={aiRef} data-section="ai" aria-labelledby="ai-heading" className="py-24 bg-white dark:bg-gray-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              <FadeIn>
                <p className="text-sm font-bold uppercase tracking-widest text-purple-500 mb-3">AI Solutions</p>
                <h2 id="ai-heading" className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-5">
                  AI that works inside your business
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-8">
                  We do not bolt on AI for show. We identify the repetitive, data-heavy parts of your
                  operations and build AI into your website, CRM, ERP and inventory systems where it saves
                  time and improves decisions.
                </p>
                <a href="#contact"
                  onClick={() => trackEvent("ai_cta_clicked")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 hover:bg-purple-500 px-6 py-3.5 font-bold text-white text-sm transition-all shadow-lg shadow-purple-500/20">
                  Discuss an AI project <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </FadeIn>

              <FadeIn delay={0.15}>
                <ul className="grid gap-3">
                  {AI_CAPABILITIES.map((c, i) => {
                    const Icon = [Bot, Workflow, Sparkles, Database, Globe, Check][i] ?? Check;
                    return (
                      <li key={c} className="flex items-start gap-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5">
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed pt-1.5">{c}</span>
                      </li>
                    );
                  })}
                </ul>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ── INDUSTRIES ── */}
        <section id="industries" ref={industriesRef} data-section="industries" aria-labelledby="industries-heading" className="py-24 bg-gray-50 dark:bg-gray-900/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <FadeIn className="text-center mb-14">
              <p className="text-sm font-bold uppercase tracking-widest text-purple-500 mb-3">Industries</p>
              <h2 id="industries-heading" className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
                Who we build for
              </h2>
            </FadeIn>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {INDUSTRIES.map((item, i) => (
                <FadeIn key={item.title} delay={i * 0.08} className="h-full">
                  <div className="h-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-7">
                    <item.Icon className="h-8 w-8 text-purple-500 mb-4" aria-hidden="true" />
                    <h3 className="font-black text-gray-900 dark:text-white text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
            <p className="mt-12 text-center text-gray-500 dark:text-gray-400 text-base max-w-2xl mx-auto leading-relaxed">
              And more. We work with any organisation that has a workflow worth digitising, from clinics and hotels to logistics, retail and manufacturing. Do not see your sector? Ask us.
            </p>
          </div>
        </section>

        {/* ── PROCESS ── */}
        <section aria-labelledby="process-heading" className="py-24 bg-white dark:bg-gray-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <FadeIn className="text-center mb-14">
              <p className="text-sm font-bold uppercase tracking-widest text-purple-500 mb-3">How We Work</p>
              <h2 id="process-heading" className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
                From first call to go-live
              </h2>
            </FadeIn>
            <ol className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
              {PROCESS_STEPS.map((s, i) => (
                <FadeIn key={s.n} delay={i * 0.07}>
                  <li className="flex gap-4 list-none">
                    <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center text-white text-xs font-black" aria-hidden="true">{s.n}</div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">{s.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{s.desc}</p>
                    </div>
                  </li>
                </FadeIn>
              ))}
            </ol>
          </div>
        </section>

        {/* ── WHY US ── */}
        <section aria-labelledby="why-heading" className="py-24 bg-gray-50 dark:bg-gray-900/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <FadeIn className="text-center mb-14">
              <p className="text-sm font-bold uppercase tracking-widest text-purple-500 mb-3">Why Pixel &amp; Pitch</p>
              <h2 id="why-heading" className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white">A boutique team, not a body shop</h2>
            </FadeIn>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { Icon: Users, title: "Senior, hands-on team", desc: "The people who scope your project are the people who build it." },
                { Icon: Sparkles, title: "AI-first engineering", desc: "AI is part of the design from day one, not an afterthought." },
                { Icon: MapPin, title: "Built for India", desc: "Local payments such as UPI, GST-ready invoicing and Indian business workflows." },
                { Icon: Workflow, title: "End-to-end ownership", desc: "From discovery and design to launch, support and improvements." },
              ].map((item, i) => (
                <FadeIn key={item.title} delay={i * 0.1} className="h-full">
                  <div className="h-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-7 text-center">
                    <div className="flex justify-center mb-4"><item.Icon className="h-8 w-8 text-purple-500" aria-hidden="true" /></div>
                    <h3 className="font-black text-gray-900 dark:text-white text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" aria-labelledby="pricing-heading" className="py-20 bg-white dark:bg-gray-950">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <FadeIn>
              <div className="rounded-3xl border border-purple-500/30 bg-purple-50 dark:bg-purple-950/20 p-8 sm:p-10 text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-purple-500 mb-3">Pricing</p>
                <h2 id="pricing-heading" className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
                  Every project is scoped to you
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-7">
                  We do not publish fixed prices because every business, college and kitchen is different.
                  Contact our team for a tailored, fixed-price quote.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href="#contact"
                    onClick={() => trackEvent("pricing_cta_clicked", { button: "fill_form" })}
                    className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 hover:bg-purple-500 px-6 py-3.5 font-bold text-white text-sm transition-all shadow-lg shadow-purple-500/20">
                    Fill in the form <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <a href={`mailto:${SALES_EMAIL}`}
                    onClick={() => trackEvent("pricing_cta_clicked", { button: "email_sales" })}
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-3.5 font-bold text-gray-800 dark:text-gray-200 text-sm hover:border-purple-500/50 transition-all">
                    <Mail className="h-4 w-4" aria-hidden="true" /> Email sales directly
                  </a>
                </div>
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">{SALES_EMAIL}</p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section id="contact" ref={contactRef} data-section="contact" aria-labelledby="contact-heading" className="scroll-mt-20 py-24 bg-white dark:bg-gray-950">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <FadeIn className="text-center mb-12">
              <p className="text-sm font-bold uppercase tracking-widest text-purple-500 mb-3">Get in Touch</p>
              <h2 id="contact-heading" className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white">Let's talk about your project</h2>
              <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg">
                Tell us what you need and our team will get back to you within 24 hours.
              </p>
            </FadeIn>

            <FadeIn>
              <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-8 sm:p-10 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Name *</label>
                      <input
                        id="contact-name"
                        type="text" required value={formData.name}
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        onFocus={() => { if (!formTouched) { trackEvent("contact_form_started"); setFormTouched(true); } }}
                        placeholder="Your name"
                        autoComplete="name"
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email *</label>
                      <input
                        id="contact-email"
                        type="email" required value={formData.email}
                        onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
                      <input
                        id="contact-phone"
                        type="tel" value={formData.phone}
                        onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+91 98765 43210"
                        autoComplete="tel"
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-interest" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">I'm interested in</label>
                      <select
                        id="contact-interest"
                        value={formData.product_interest}
                        onChange={e => setFormData(p => ({ ...p, product_interest: e.target.value }))}
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select...</option>
                        <option value="website">Website or web app</option>
                        <option value="crm">Customised CRM</option>
                        <option value="erp_business">ERP for business</option>
                        <option value="erp_college">ERP for college</option>
                        <option value="inventory">Inventory management</option>
                        <option value="ordering">Ordering platform (restaurant / bakery)</option>
                        <option value="ai">AI solutions</option>
                        <option value="general">General inquiry</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Message</label>
                    <textarea
                      id="contact-message"
                      rows={5} value={formData.message}
                      onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                      placeholder="Tell us about your business and what you need..."
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                  <button
                    type="submit" disabled={submitting}
                    className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 py-4 font-bold text-white text-base shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.01] transition-all disabled:opacity-60 disabled:scale-100"
                  >
                    {submitting ? "Sending..." : "Send Message →"}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-center">
                  <a href={`mailto:${SALES_EMAIL}`} className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-500 transition-colors">
                    <Mail className="h-4 w-4" aria-hidden="true" /> {SALES_EMAIL}
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
        {/* ── FAQ ── */}
        <section id="faq" aria-labelledby="faq-heading" className="py-24 bg-gray-50 dark:bg-gray-900/50">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <FadeIn className="text-center mb-12">
              <p className="text-sm font-bold uppercase tracking-widest text-purple-500 mb-3">FAQ</p>
              <h2 id="faq-heading" className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white">Common questions</h2>
            </FadeIn>
            <div className="space-y-4">
              {FAQ_ITEMS.map((item, i) => (
                <FadeIn key={item.q} delay={i * 0.05}>
                  <details className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all">
                    <summary className="flex items-center justify-between gap-4 cursor-pointer px-6 py-5 font-bold text-gray-900 dark:text-white text-sm list-none select-none">
                      {item.q}
                      <span className="shrink-0 text-purple-500 text-lg leading-none group-open:rotate-45 transition-transform duration-200" aria-hidden="true">+</span>
                    </summary>
                    <p className="px-6 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.a}</p>
                  </details>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* ── FLOATING CONTACT BUBBLE (after first section) ── */}
      <AnimatePresence>
        {showBubble && (
          <motion.a
            key="contact-bubble"
            href="#contact"
            onClick={() => trackEvent("contact_bubble_clicked")}
            aria-label="Contact us"
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-3.5 text-sm font-bold text-white shadow-2xl shadow-purple-500/40 hover:scale-105 transition-transform"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> Contact us
          </motion.a>
        )}
      </AnimatePresence>

      <CookieBanner />

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <img src={LOGO} alt="Pixel & Pitch" className="h-8 w-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Boutique AI and IT services</p>
              <address className="not-italic text-xs text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
                Abbigere, Bengaluru, Karnataka 560090, India
              </address>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Open 24 hours, Monday to Saturday. Closed on Sundays.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                <a href="tel:+918197179740" className="hover:text-purple-500 transition-colors">+91 81971 79740</a>
              </p>
              <p className="text-xs text-gray-400 mt-2">
                <a href={`mailto:${SALES_EMAIL}`} className="hover:text-purple-500 transition-colors">{SALES_EMAIL}</a>
              </p>
            </div>
            <nav aria-label="Footer" className="flex flex-wrap gap-8 text-sm">
              <div className="space-y-2">
                <p className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Services</p>
                <a href="#services" className="block text-gray-500 dark:text-gray-400 hover:text-purple-500 transition-colors">Websites &amp; Web Apps</a>
                <a href="#services" className="block text-gray-500 dark:text-gray-400 hover:text-purple-500 transition-colors">CRM &amp; ERP</a>
                <a href="#services" className="block text-gray-500 dark:text-gray-400 hover:text-purple-500 transition-colors">Inventory &amp; Ordering</a>
                <a href="#ai" className="block text-gray-500 dark:text-gray-400 hover:text-purple-500 transition-colors">AI Solutions</a>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Company</p>
                <a href="#industries" className="block text-gray-500 dark:text-gray-400 hover:text-purple-500 transition-colors">Industries</a>
                <a href="#pricing" className="block text-gray-500 dark:text-gray-400 hover:text-purple-500 transition-colors">Pricing</a>
                <a href="#faq" className="block text-gray-500 dark:text-gray-400 hover:text-purple-500 transition-colors">FAQ</a>
                <a href="#contact" className="block text-gray-500 dark:text-gray-400 hover:text-purple-500 transition-colors">Contact</a>
              </div>
            </nav>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-400">
            <p>© 2026 Pixel &amp; Pitch. All rights reserved.</p>
            <a href="/admin" className="hover:text-purple-400 transition-colors">Admin</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
