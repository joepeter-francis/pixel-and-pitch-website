import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { toast } from "sonner";
import {
  ShoppingBag, Zap, Check, ArrowRight, Menu, X, Sun, Moon,
  Mail, ChevronRight, Star,
  Globe, Paintbrush, TrendingUp, Headphones, Search, Database
} from "lucide-react";
import { trackEvent, identifyUser, getDistinctId } from "../lib/analytics";
import CookieBanner from "../components/CookieBanner";

const LOGO = "https://pub-0f4114fde3044f60b819543e9dc412f4.r2.dev/brand/2433c9af-017d-4205-86ed-bc283fc9ce87.png";
const API_URL = import.meta.env.VITE_API_URL || "https://api-marketplace.pixelndpitch.com";

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

const EXCLUSIVE_TIERS = [
  { tier: 1, name: "Static Site", emoji: "🗂️", best: "Landing pages, portfolios, docs", features: ["Up to 5 pages", "Responsive design", "Cloudflare CDN", "Custom domain + SSL"] },
  { tier: 2, name: "Marketing Site", emoji: "🚀", best: "Startups, SaaS, product launches", features: ["Up to 10 pages", "Animations & CMS", "Contact forms", "SEO fundamentals"] },
  { tier: 3, name: "Web Application", emoji: "⚙️", best: "SaaS dashboards, portals", features: ["Auth (JWT/OAuth)", "REST/GraphQL API", "AWS database", "Admin panel + RBAC"] },
  { tier: 4, name: "E-Commerce Platform", emoji: "🛒", best: "D2C brands, online stores", features: ["Product catalog + variants", "Cart, wishlist", "Razorpay / Stripe / ShipRocket", "Order & inventory management"] },
  { tier: 5, name: "Enterprise Platform", emoji: "🏗️", best: "Large-scale, multi-tenant", features: ["Custom architecture", "Microservices / monorepo", "Full AWS stack", "SLA & dedicated support"] },
];

const ADDONS = [
  { icon: <Paintbrush className="h-5 w-5" />, name: "UI/UX Design (Figma)", desc: "Wireframes & high-fidelity mockups before development" },
  { icon: <Search className="h-5 w-5" />, name: "SEO Optimisation", desc: "On-page SEO, sitemap, schema markup, Core Web Vitals" },
  { icon: <Database className="h-5 w-5" />, name: "CMS Integration", desc: "Contentful / Sanity / Strapi for non-dev content editing" },
  { icon: <ShoppingBag className="h-5 w-5" />, name: "Payment Gateway", desc: "Razorpay / Stripe with webhook handling and refund flows" },
  { icon: <Globe className="h-5 w-5" />, name: "AWS Infrastructure", desc: "VPC, RDS, S3, IAM, CloudWatch, auto-scaling setup" },
  { icon: <TrendingUp className="h-5 w-5" />, name: "Performance Audit", desc: "Lighthouse, bundle optimisation, CDN cache tuning" },
  { icon: <Headphones className="h-5 w-5" />, name: "Maintenance & Support", desc: "Monthly bug fixes, dependency updates, uptime monitoring" },
];

const PROCESS_STEPS = [
  { n: "01", title: "Discovery", desc: "Free 30-min call to understand your goals and requirements" },
  { n: "02", title: "Proposal", desc: "Detailed scope, milestones, timeline & fixed-price quote in 72h" },
  { n: "03", title: "Design", desc: "Figma wireframes & high-fidelity mockups for your approval" },
  { n: "04", title: "Build", desc: "Iterative development with weekly updates & staging preview" },
  { n: "05", title: "QA & Launch", desc: "Cross-browser testing, performance audit, go-live support" },
  { n: "06", title: "Handoff", desc: "Documentation, training & optional ongoing maintenance" },
];

type TimeSlot = "midnight" | "earlyMorning" | "morning" | "afternoon" | "evening" | "night";
type WeatherKey = "sunny" | "rainy" | "cloudy" | "foggy" | "snowy" | "stormy";

const TAGLINES: Record<TimeSlot, string[]> & { weather: Record<WeatherKey, string[]> } = {
  midnight: [
    "Midnight and still building? Legends work these hours.",
    "The world's asleep. You're three features ahead.",
    "3am ideas are the ones that change industries.",
    "Most dream it. You're coding it at midnight.",
    "The grind doesn't sleep. Neither do you.",
    "While others Netflix, you build empires.",
    "Your competition is asleep. You're not.",
    "Late night, big vision. You're exactly where you need to be.",
    "Startup hours: whenever inspiration strikes.",
    "The best founders work when nobody's watching.",
    "Dark outside. Bright future.",
    "No alarm needed when you love what you build.",
    "Midnight oil burns the brightest.",
    "Some call it insomnia. We call it ambition.",
    "The night shift is where businesses are born.",
  ],
  earlyMorning: [
    "Up before the sun? You're already ahead of most.",
    "5am and already here — that's founder energy.",
    "The city's still asleep, but you're already building.",
    "Early mornings are the entrepreneur's unfair advantage.",
    "Coffee in hand. Dreams on the line. Let's build.",
    "You woke up early. Your competition didn't.",
    "The alarm hasn't gone off for most. You didn't need one.",
    "Sunrise is your starting gun.",
    "While the world hits snooze, you're hitting launch.",
    "Dawn belongs to builders.",
    "Most people sleep through their breakthrough moment.",
    "It's early. You're early. That's the whole point.",
    "The morning belongs to those who claimed it.",
    "First light. First move. You're already winning.",
    "Early bird? No — early founder.",
  ],
  morning: [
    "Good morning, founder. Today's the day you launch.",
    "The hustle starts before the coffee kicks in.",
    "Morning energy hits different when you're building something real.",
    "The best time to start was yesterday. Second best? Right now.",
    "Today's to-do list: build something people love.",
    "A new day, a new chance to ship something great.",
    "Your store won't build itself. But we're pretty close.",
    "Rise and build.",
    "The market opens. So does your opportunity.",
    "Fresh morning, fresh start, fresh store.",
    "This morning, someone will discover your brand. Make sure it's live.",
    "Your brand has a story. Let's give it a home.",
    "Good things are built in the morning. Great ones too.",
    "Morning: when side projects become the main event.",
    "The world opens for business. So should you.",
  ],
  afternoon: [
    "Afternoon slump? Not for builders.",
    "Lunch break idea? Some of the best startups started here.",
    "The grind doesn't take a siesta.",
    "Halfway through the day. Halfway to launch?",
    "While others nap, you ship.",
    "Productivity peak hour. Use it.",
    "2pm fire. Build something worth staying for.",
    "Post-lunch momentum — the secret weapon of founders.",
    "Your competition is in a meeting. You're building.",
    "The afternoon is underrated. So is your idea — until it isn't.",
    "Still going strong. That's the founder mindset.",
    "Great ideas don't wait for the right time.",
    "Every afternoon is a chance to inch closer to launch.",
    "The clock's ticking. In a good way.",
    "Afternoon hustle. No one talks about it. Everyone needs it.",
  ],
  evening: [
    "The 9-to-5 is clocking out. You're just getting started.",
    "Side hustle hours. The best hours.",
    "After the day job comes the real work.",
    "Sunset doesn't mean stop — it means pivot.",
    "Golden hour for golden ideas.",
    "Office closed. Startup open.",
    "When the day job ends, the dream job begins.",
    "Evening: when side projects become the main character.",
    "You finished your day. Now start your destiny.",
    "The best businesses were built in evenings like this.",
    "Dinner can wait. Your brand can't.",
    "Prime time isn't on TV — it's in your browser right now.",
    "Evening builders are tomorrow's disruptors.",
    "Clocking out? Or clocking in — to your own thing?",
    "The best shift starts now.",
  ],
  night: [
    "True entrepreneurs are always night owls.",
    "Prime thinking hours for the ambitious mind.",
    "The best ideas come after dark.",
    "Night mode activated. Build mode: on.",
    "Burning the midnight oil never went out of style.",
    "The world slows down. You speed up.",
    "Stars are out. Ideas are flowing.",
    "Night is just daytime for founders.",
    "Your best work happens when the world goes quiet.",
    "Silence + ambition = something great.",
    "It's late. Your competition stopped hours ago.",
    "Night shift at your own company. All vision, no overtime.",
    "The internet never sleeps. Neither does opportunity.",
    "Some call it late. Founders call it prime time.",
    "After hours is where before-hours winners are made.",
  ],
  weather: {
    sunny: [
      "Bright day, brighter future. Let's build.",
      "The sun's out. Your ambition should be too.",
      "Clear skies, clear vision. Today's the day.",
      "Sunshine and startup energy — unstoppable combo.",
      "Good weather is wasted on people who aren't building something.",
    ],
    rainy: [
      "Even the rain can't stop a true builder.",
      "Perfect weather to stay in and launch something.",
      "Rain outside, fire inside. Let's go.",
      "Rainy days are made for big ideas.",
      "The best stores were built on rainy days just like this.",
    ],
    cloudy: [
      "Grey skies, bright future.",
      "Clouds can't dim your vision.",
      "Overcast outside. Crystal clear inside.",
    ],
    stormy: [
      "Storms don't stop builders. They inspire them.",
      "Thunder and lightning: nature's way of saying launch bold.",
      "The best ideas survive every storm.",
    ],
    snowy: [
      "Snow day? Perfect time to build your empire.",
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

function pickTagline(slot: TimeSlot, weather: WeatherKey | null): string {
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

  const productsRef = useRef<HTMLElement>(null);
  const exclusiveRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

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
        setTagline(pickTagline(getTimeSlot(), weather));
      })
      .catch(() => {
        setTagline(pickTagline(getTimeSlot(), null));
      });
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTagline(prev => prev || pickTagline(getTimeSlot(), null));
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

  // Analytics: fire pageview on mount for users who have already consented
  useEffect(() => {
    if (localStorage.getItem("cookie_consent") === "accepted") {
      trackEvent("$pageview", { $current_url: window.location.href });
    }
  }, []);

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
    [productsRef, exclusiveRef, contactRef].forEach(ref => {
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

      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enriched),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setFormData({ name: "", email: "", phone: "", product_interest: "", message: "" });
      setFormTouched(false);
    } catch {
      toast.error("Something went wrong. Please email us at admin@pixelndpitch.com");
    } finally {
      setSubmitting(false);
    }
  };

  const navLinks = [
    { label: "Products", href: "#products" },
    { label: "Exclusive", href: "#exclusive" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 font-[Inter]">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <img src={LOGO} alt="Pixel & Pitch" className="h-8 w-auto" />
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <a href="https://marketplace.pixelndpitch.com" target="_blank" rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-sm font-bold text-white transition-all shadow-lg shadow-purple-500/25">
              Launch Store <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <button className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
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
            <a href="https://marketplace.pixelndpitch.com" target="_blank" rel="noopener noreferrer"
              className="block rounded-xl bg-purple-600 px-4 py-3 text-sm font-bold text-white text-center">
              Launch Your Store →
            </a>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/50 via-gray-950 to-gray-950 dark:from-purple-950/60 dark:via-gray-950 dark:to-gray-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(147,51,234,0.15),transparent_60%)]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-300 mb-8">
              <Star className="h-3 w-3" /> Built in India with 💜 · For the world
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="mb-8">
            <p className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-5 min-h-[3.5rem]">
              <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
                {displayedTagline || "\u00A0"}
              </span>
              {displayedTagline.length < tagline.length && (
                <span className="animate-pulse text-purple-400">|</span>
              )}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white/80 tracking-tight">
              Your store, live in minutes.
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Launch your product catalog, accept payments, and start selling —
            no code, no hassle.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a href="https://marketplace.pixelndpitch.com" target="_blank" rel="noopener noreferrer"
              onClick={() => trackEvent("hero_cta_clicked", { button: "launch_store" })}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 px-8 py-4 font-bold text-white text-base shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] transition-all">
              🚀 Launch Your Store <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#contact"
              onClick={() => trackEvent("hero_cta_clicked", { button: "talk_to_us" })}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-700 bg-gray-900/50 px-8 py-4 font-bold text-gray-200 text-base hover:border-purple-500/50 hover:bg-gray-800/50 transition-all">
              Talk to Us <ChevronRight className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="products" ref={productsRef} data-section="products" className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FadeIn className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-purple-500 mb-3">Our Products</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
              Two ways to go online
            </h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
              Pick the product that fits your stage and ambition.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Marketplace Card */}
            <FadeIn delay={0.1}>
              <div className="relative h-full rounded-3xl border border-purple-500/30 bg-white dark:bg-gray-900 p-8 shadow-xl shadow-purple-500/5 flex flex-col overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-3xl" />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 dark:bg-purple-900/40 px-3 py-1 text-xs font-bold text-purple-700 dark:text-purple-300 mb-5">
                    <ShoppingBag className="h-3.5 w-3.5" /> Self-Serve · Live in Minutes
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Marketplace</h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                    Launch your product catalog in a few clicks. No coding required. Built for early-stage entrepreneurs who want a professional online presence without the hefty price tag.
                  </p>
                  <ul className="space-y-2.5 mb-8">
                    {[
                      "Drag-and-drop product catalog",
                      "10 brand color palettes",
                      "Hero banner with image & video",
                      "Razorpay & UPI payment integration",
                      "ShipRocket delivery management",
                      "Custom domain ready",
                    ].map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                        <Check className="h-4 w-4 text-purple-500 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>

                  {/* Pricing */}
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-5 mb-7">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">One-time setup</p>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">Basic</p>
                          <p className="text-xs text-gray-400">No payment gateway</p>
                        </div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">₹499</p>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-2.5 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-purple-600 dark:text-purple-400 text-sm">Pro</p>
                          <p className="text-xs text-gray-400">Gateway setup done by us</p>
                        </div>
                        <p className="text-2xl font-black text-purple-600 dark:text-purple-400">₹799</p>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-2.5 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">+ Analytics Dashboard</p>
                          <p className="text-xs text-gray-400">Visitor data, product views, funnel</p>
                        </div>
                        <p className="text-lg font-black text-gray-500 dark:text-gray-400">+₹99</p>
                      </div>
                    </div>
                  </div>

                  <a href="https://marketplace.pixelndpitch.com" target="_blank" rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-600 hover:bg-purple-500 px-6 py-3.5 font-bold text-white text-sm transition-all shadow-lg shadow-purple-500/20">
                    Start Building <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </FadeIn>

            {/* Exclusive Card */}
            <FadeIn delay={0.2}>
              <div className="relative h-full rounded-3xl border border-emerald-500/30 bg-white dark:bg-gray-900 p-8 shadow-xl shadow-emerald-500/5 flex flex-col overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-3xl" />
                <div className="relative flex-1 flex flex-col">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-5">
                    <Zap className="h-3.5 w-3.5" /> Custom Built · Tailored to You
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Exclusive</h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                    Custom digital solutions built from scratch. Five engagement tiers — from lightweight landing pages to full enterprise platforms. We handle design, development, and deployment.
                  </p>
                  <ul className="space-y-2.5 mb-8">
                    {[
                      "Static & marketing websites",
                      "Full-stack web applications",
                      "E-commerce platforms",
                      "Enterprise & multi-tenant systems",
                      "Figma design to pixel-perfect code",
                      "AWS + Vercel + Cloudflare stack",
                    ].map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-5 mb-7 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Service tiers</p>
                    <div className="space-y-2">
                      {["Static Site", "Marketing Site", "Web Application", "E-Commerce Platform", "Enterprise Platform"].map((t, i) => (
                        <div key={t} className="flex items-center gap-3 text-sm">
                          <span className="flex-shrink-0 h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-black flex items-center justify-center">{i + 1}</span>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">{t}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-xs text-gray-400 italic">Contact us for a quote — all projects are scoped individually.</p>
                  </div>
                  <a href="#contact"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3.5 font-bold text-white text-sm transition-all shadow-lg shadow-emerald-500/20">
                    Get a Quote <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── EXCLUSIVE DEEP-DIVE ── */}
      <section id="exclusive" ref={exclusiveRef} data-section="exclusive" className="py-24 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FadeIn className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-500 mb-3">Exclusive</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white">Custom web solutions,<br />built for you</h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
              Five service tiers — from a simple landing page to a full enterprise platform. All projects include Figma design, modern tech stack, and a dedicated point of contact.
            </p>
          </FadeIn>

          {/* Tiers */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-20">
            {EXCLUSIVE_TIERS.map((t, i) => (
              <FadeIn key={t.tier} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5 flex flex-col">
                  <div className="text-3xl mb-3">{t.emoji}</div>
                  <div className="inline-block rounded-full bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-[10px] font-black text-gray-500 dark:text-gray-400 mb-2 w-fit">TIER {t.tier}</div>
                  <h4 className="font-black text-gray-900 dark:text-white text-base mb-1">{t.name}</h4>
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">{t.best}</p>
                  <ul className="space-y-1.5 flex-1">
                    {t.features.map(f => (
                      <li key={f} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <Check className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-[10px] font-semibold text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">Contact for pricing →</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Add-ons */}
          <FadeIn>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white text-center mb-8">Add-On Services</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-20">
              {ADDONS.map((a, i) => (
                <FadeIn key={a.name} delay={i * 0.05}>
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mb-3">
                      {a.icon}
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">{a.name}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{a.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </FadeIn>

          {/* Process */}
          <FadeIn>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white text-center mb-10">How We Work</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {PROCESS_STEPS.map((s, i) => (
                <FadeIn key={s.n} delay={i * 0.07}>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center text-white text-xs font-black">{s.n}</div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{s.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── WHY P&P ── */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FadeIn className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest text-purple-500 mb-3">Why Pixel &amp; Pitch</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white">Built different</h2>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "⚡", title: "Fast Delivery", desc: "Launch in days, not months. We move fast without cutting corners." },
              { icon: "🇮🇳", title: "India-First", desc: "Razorpay, UPI, ShipRocket — built for how Indian businesses operate." },
              { icon: "🎨", title: "Modern Stack", desc: "React, Next.js, AWS, Vercel, Cloudflare — the tools top products use." },
              { icon: "🤝", title: "End-to-End", desc: "From idea to launch to support. One team, full accountability." },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-7 text-center">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h4 className="font-black text-gray-900 dark:text-white text-lg mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" ref={contactRef} data-section="contact" className="py-24 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FadeIn className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest text-purple-500 mb-3">Get in Touch</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white">Let's build something</h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg">
              Have a project in mind? Drop us a message and we'll get back within 24 hours.
            </p>
          </FadeIn>

          <FadeIn>
            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-8 sm:p-10 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Name *</label>
                    <input
                      type="text" required value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      onFocus={() => { if (!formTouched) { trackEvent("contact_form_started"); setFormTouched(true); } }}
                      placeholder="Your name"
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email *</label>
                    <input
                      type="email" required value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
                    <input
                      type="tel" value={formData.phone}
                      onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">I'm interested in</label>
                    <select
                      value={formData.product_interest}
                      onChange={e => setFormData(p => ({ ...p, product_interest: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select...</option>
                      <option value="marketplace">Marketplace</option>
                      <option value="exclusive_static">Exclusive — Static Site</option>
                      <option value="exclusive_marketing">Exclusive — Marketing Site</option>
                      <option value="exclusive_webapp">Exclusive — Web Application</option>
                      <option value="exclusive_ecommerce">Exclusive — E-Commerce</option>
                      <option value="exclusive_enterprise">Exclusive — Enterprise</option>
                      <option value="general">General Inquiry</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Message</label>
                  <textarea
                    rows={5} value={formData.message}
                    onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                    placeholder="Tell us about your project..."
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
                <a href="mailto:admin@pixelndpitch.com" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-500 transition-colors">
                  <Mail className="h-4 w-4" /> admin@pixelndpitch.com
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <CookieBanner />

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <img src={LOGO} alt="Pixel & Pitch" className="h-8 w-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Your Gateway to the World</p>
              <p className="text-xs text-gray-400 mt-2">admin@pixelndpitch.com</p>
            </div>
            <div className="flex flex-wrap gap-8 text-sm">
              <div className="space-y-2">
                <p className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Products</p>
                <a href="#products" className="block text-gray-500 dark:text-gray-400 hover:text-purple-500 transition-colors">Marketplace</a>
                <a href="#exclusive" className="block text-gray-500 dark:text-gray-400 hover:text-purple-500 transition-colors">Exclusive</a>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Company</p>
                <a href="#contact" className="block text-gray-500 dark:text-gray-400 hover:text-purple-500 transition-colors">Contact</a>
                <a href="https://marketplace.pixelndpitch.com" target="_blank" rel="noopener noreferrer" className="block text-gray-500 dark:text-gray-400 hover:text-purple-500 transition-colors">Launch Store</a>
              </div>
            </div>
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
