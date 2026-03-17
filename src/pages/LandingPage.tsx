import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { toast } from "sonner";
import {
  ShoppingBag, Zap, Check, ArrowRight, Menu, X, Sun, Moon,
  Mail, Phone, MessageSquare, ChevronRight, Star, Layers,
  Globe, Code2, Paintbrush, TrendingUp, Headphones, Search, Database, Settings
} from "lucide-react";

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

export default function LandingPage() {
  const [dark, setDark] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", product_interest: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved !== "light";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
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
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setFormData({ name: "", email: "", phone: "", product_interest: "", message: "" });
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
              <Star className="h-3 w-3" /> Trusted by early-stage entrepreneurs across India
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.05] mb-6"
          >
            Your Gateway{" "}
            <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
              to the World
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Launch your brand online — fast, beautiful, and built to convert.
            Whether you need a store in minutes or a custom-built platform, we've got you covered.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a href="https://marketplace.pixelndpitch.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 px-8 py-4 font-bold text-white text-base shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] transition-all">
              🚀 Launch Your Store <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#contact"
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-700 bg-gray-900/50 px-8 py-4 font-bold text-gray-200 text-base hover:border-purple-500/50 hover:bg-gray-800/50 transition-all">
              Talk to Us <ChevronRight className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="products" className="py-24 bg-gray-50 dark:bg-gray-900/50">
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
      <section id="exclusive" className="py-24 bg-white dark:bg-gray-950">
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
      <section id="contact" className="py-24 bg-white dark:bg-gray-950">
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
