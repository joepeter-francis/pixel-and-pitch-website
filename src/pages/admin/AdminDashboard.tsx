import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api, getStoredUser, clearAuth } from "../../lib/api";
import { LogOut, Plus, Trash2, RefreshCw, ExternalLink, Globe, Smartphone, Monitor, Link2, Store, Search, Star, Megaphone, TrendingUp, MousePointerClick, Video, Clock, ArrowDownRight } from "lucide-react";

const LOGO = "https://pub-0f4114fde3044f60b819543e9dc412f4.r2.dev/brand/2433c9af-017d-4205-86ed-bc283fc9ce87.png";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  product_interest: string | null;
  message: string | null;
  status: string;
  notes: string | null;
  referrer: string | null;
  country: string | null;
  device: string | null;
  posthog_person_url: string | null;
  created_at: string;
}

interface AnalyticsSummary {
  totalPageviews: number;
  uniqueVisitors: number;
  contactFormViews: number;
  contactFormStarts: number;
  contactFormSubmits: number;
  conversionRate: string;
  topReferrers: { referrer: string; count: number }[];
  byDevice: { device: string; count: number }[];
  byCountry: { country: string; count: number }[];
  byDay: { date: string; pageviews: number; visitors: number }[];
}

interface FunnelData {
  funnel: { step: string; count: number }[];
  utmSources: { source: string; visitors: number }[];
  utmMediums: { medium: string; visitors: number }[];
}

interface EngagementData {
  avgScrollDepth: number;
  scrollBuckets: { bucket: string; sessions: number }[];
  sectionViews: { event: string; uniqueViewers: number }[];
  heroCtas: { button: string; clicks: number }[];
  formInterests: { interest: string; count: number }[];
}

interface SessionData {
  sessions: {
    id: string;
    duration: number;
    startTime: string;
    country: string | null;
    device: string | null;
    startUrl: string | null;
    activeMs: number;
    posthogUrl: string;
  }[];
}

interface LeadStatus {
  id: string;
  label: string;
  color: string;
  order_index: number;
}

interface AdminTenant {
  id: string;
  company_name: string;
  slug: string;
  is_published: boolean;
  is_disabled: boolean;
  is_featured: boolean;
  is_recommended: boolean;
  created_at: string;
  owner_email: string | null;
}

const STATUS_DISPLAY: Record<string, string> = {
  new: "New",
  pursuing: "Pursuing",
  demo_given: "Demo Given",
  proposal_sent: "Proposal Sent",
  won: "Won",
  lost: "Lost",
};

const INTEREST_DISPLAY: Record<string, string> = {
  marketplace: "Marketplace",
  exclusive_static: "Exclusive — Static",
  exclusive_marketing: "Exclusive — Marketing",
  exclusive_webapp: "Exclusive — Web App",
  exclusive_ecommerce: "Exclusive — E-Commerce",
  exclusive_enterprise: "Exclusive — Enterprise",
  general: "General Inquiry",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"analytics" | "leads" | "statuses" | "stores">("analytics");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [statuses, setStatuses] = useState<LeadStatus[]>([]);
  const [stores, setStores] = useState<AdminTenant[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [storeSearch, setStoreSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  // Status form
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("#8b5cf6");
  const [addingStatus, setAddingStatus] = useState(false);
  // Analytics
  const [analyticsRange, setAnalyticsRange] = useState<"7d" | "30d" | "90d">("7d");
  const [analyticsSubTab, setAnalyticsSubTab] = useState<"overview" | "funnel" | "engagement" | "sessions">("overview");
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [funnelLoading, setFunnelLoading] = useState(false);
  const [funnelError, setFunnelError] = useState<string | null>(null);
  const [engagement, setEngagement] = useState<EngagementData | null>(null);
  const [engagementLoading, setEngagementLoading] = useState(false);
  const [engagementError, setEngagementError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionData | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  const checkAuth = useCallback(() => {
    const user = getStoredUser();
    if (!user || user.email !== "admin@pixelndpitch.com") {
      navigate("/admin");
      return false;
    }
    return true;
  }, [navigate]);

  const loadAll = useCallback(async () => {
    if (!checkAuth()) return;
    setLoading(true);
    try {
      const [l, s] = await Promise.all([
        api.get<Lead[]>("/admin/leads"),
        api.get<LeadStatus[]>("/admin/statuses"),
      ]);
      setLeads(l);
      setStatuses(s);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("401")) { clearAuth(); navigate("/admin"); }
      else toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [checkAuth, navigate]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const data = await api.get<AnalyticsSummary & { error?: string }>(`/admin/analytics?range=${analyticsRange}`);
      if ("error" in data && data.error) {
        setAnalyticsError(data.error as string);
        setAnalytics(null);
      } else {
        setAnalytics(data as AnalyticsSummary);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("401")) { clearAuth(); navigate("/admin"); return; }
      setAnalyticsError("Failed to load analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  }, [analyticsRange]);

  const loadFunnel = useCallback(async () => {
    setFunnelLoading(true);
    setFunnelError(null);
    try {
      const data = await api.get<FunnelData & { error?: string }>(`/admin/analytics/funnel?range=${analyticsRange}`);
      if ("error" in data && data.error) { setFunnelError(data.error as string); setFunnel(null); }
      else setFunnel(data as FunnelData);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("401")) { clearAuth(); navigate("/admin"); return; }
      setFunnelError("Failed to load funnel data");
    } finally { setFunnelLoading(false); }
  }, [analyticsRange, navigate]);

  const loadEngagement = useCallback(async () => {
    setEngagementLoading(true);
    setEngagementError(null);
    try {
      const data = await api.get<EngagementData & { error?: string }>(`/admin/analytics/engagement?range=${analyticsRange}`);
      if ("error" in data && data.error) { setEngagementError(data.error as string); setEngagement(null); }
      else setEngagement(data as EngagementData);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("401")) { clearAuth(); navigate("/admin"); return; }
      setEngagementError("Failed to load engagement data");
    } finally { setEngagementLoading(false); }
  }, [analyticsRange, navigate]);

  const loadSessions = useCallback(async () => {
    if (sessions) return; // already loaded — sessions has no range
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const data = await api.get<SessionData & { error?: string }>("/admin/analytics/sessions");
      if ("error" in data && data.error) { setSessionsError(data.error as string); setSessions(null); }
      else setSessions(data as SessionData);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("401")) { clearAuth(); navigate("/admin"); return; }
      setSessionsError("Failed to load sessions");
    } finally { setSessionsLoading(false); }
  }, [sessions, navigate]);

  useEffect(() => {
    if (tab !== "analytics") return;
    if (analyticsSubTab === "overview") loadAnalytics();
    else if (analyticsSubTab === "funnel") loadFunnel();
    else if (analyticsSubTab === "engagement") loadEngagement();
    else if (analyticsSubTab === "sessions") loadSessions();
  }, [tab, analyticsSubTab, analyticsRange, loadAnalytics, loadFunnel, loadEngagement, loadSessions]);

  const updateLead = async (id: string, update: { status?: string; notes?: string }) => {
    try {
      const updated = await api.patch<Lead>(`/admin/leads/${id}`, update);
      setLeads(prev => prev.map(l => l.id === id ? updated : l));
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("401")) { clearAuth(); navigate("/admin"); return; }
      toast.error("Failed to update lead");
    }
  };

  const handleNotesBlur = (lead: Lead) => {
    const notes = editingNotes[lead.id];
    if (notes !== undefined && notes !== lead.notes) {
      updateLead(lead.id, { notes });
    }
  };

  const handleAddStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    setAddingStatus(true);
    try {
      const s = await api.post<LeadStatus>("/admin/statuses", { label: newLabel.trim().toLowerCase().replace(/\s+/g, "_"), color: newColor });
      setStatuses(prev => [...prev, s]);
      setNewLabel("");
      setNewColor("#8b5cf6");
      toast.success("Status added");
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("401")) { clearAuth(); navigate("/admin"); return; }
      toast.error(err instanceof Error ? err.message : "Failed to add status");
    } finally { setAddingStatus(false); }
  };

  const handleDeleteStatus = async (id: string) => {
    if (!confirm("Delete this status?")) return;
    try {
      await api.delete(`/admin/statuses/${id}`);
      setStatuses(prev => prev.filter(s => s.id !== id));
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("401")) { clearAuth(); navigate("/admin"); return; }
      toast.error("Failed to delete status");
    }
  };

  const handleLogout = () => { clearAuth(); navigate("/admin"); };

  const loadStores = useCallback(async () => {
    setStoresLoading(true);
    try {
      const data = await api.get<AdminTenant[]>("/admin/tenants");
      setStores(data);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("401")) { clearAuth(); navigate("/admin"); return; }
      toast.error("Failed to load stores");
    } finally {
      setStoresLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (tab === "stores") loadStores();
  }, [tab, loadStores]);

  const toggleDisabled = async (id: string, currentValue: boolean) => {
    try {
      const updated = await api.patch<AdminTenant>(`/admin/tenants/${id}/disable`, { is_disabled: !currentValue });
      setStores(prev => prev.map(s => s.id === id ? { ...s, is_disabled: updated.is_disabled } : s));
      toast.success(updated.is_disabled ? "Store disabled" : "Store re-enabled");
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("401")) { clearAuth(); navigate("/admin"); return; }
      toast.error("Failed to update store");
    }
  };

  const toggleFeatured = async (id: string, currentValue: boolean) => {
    try {
      const updated = await api.patch<AdminTenant>(`/admin/tenants/${id}/feature`, { is_featured: !currentValue });
      setStores(prev => prev.map(s => s.id === id ? { ...s, is_featured: updated.is_featured } : s));
      toast.success(updated.is_featured ? "Store marked as Featured (Ad)" : "Store removed from Featured");
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("401")) { clearAuth(); navigate("/admin"); return; }
      toast.error("Failed to update store");
    }
  };

  const toggleRecommended = async (id: string, currentValue: boolean) => {
    try {
      const updated = await api.patch<AdminTenant>(`/admin/tenants/${id}/feature`, { is_recommended: !currentValue });
      setStores(prev => prev.map(s => s.id === id ? { ...s, is_recommended: updated.is_recommended } : s));
      toast.success(updated.is_recommended ? "Store added to P&P Picks" : "Store removed from P&P Picks");
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("401")) { clearAuth(); navigate("/admin"); return; }
      toast.error("Failed to update store");
    }
  };

  const filteredLeads = filterStatus === "all" ? leads : leads.filter(l => l.status === filterStatus);

  const allStatusLabels = [
    ...Object.entries(STATUS_DISPLAY).map(([v, l]) => ({ value: v, label: l, color: "" })),
    ...statuses.filter(s => !STATUS_DISPLAY[s.label]).map(s => ({ value: s.label, label: s.label, color: s.color })),
  ];

  const getStatusColor = (status: string) => {
    const custom = statuses.find(s => s.label === status);
    if (custom) return custom.color;
    const defaults: Record<string, string> = { new: "#6b7280", pursuing: "#3b82f6", demo_given: "#8b5cf6", proposal_sent: "#f59e0b", won: "#10b981", lost: "#ef4444" };
    return defaults[status] || "#6b7280";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-pulse text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  const stats = [
    { label: "Total Leads", value: leads.length, color: "text-purple-400" },
    { label: "New", value: leads.filter(l => l.status === "new").length, color: "text-blue-400" },
    { label: "Pursuing", value: leads.filter(l => l.status === "pursuing").length, color: "text-violet-400" },
    { label: "Won", value: leads.filter(l => l.status === "won").length, color: "text-emerald-400" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-50 font-[Inter]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-950/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="" className="h-7 w-auto" />
            <span className="font-bold text-white text-sm">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadAll} className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors">
              <RefreshCw className="h-4 w-4" />
            </button>
            <a href="/" className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors">
              <ExternalLink className="h-4 w-4" />
            </a>
            <button onClick={handleLogout} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-all">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-gray-900 p-1 mb-6 w-fit flex-wrap">
          {(["analytics", "leads", "statuses", "stores"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all ${tab === t ? "bg-gray-800 text-white shadow-sm" : "text-gray-400 hover:text-gray-200"}`}>
              {t === "analytics" ? "Analytics" : t === "leads" ? "Leads" : t === "statuses" ? "Status Config" : "Stores"}
            </button>
          ))}
        </div>

        {/* Analytics Tab */}
        {tab === "analytics" && (
          <div>
            {/* Controls row: range + sub-tabs */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {/* Range selector — hidden for sessions sub-tab */}
              {analyticsSubTab !== "sessions" && (
                <div className="flex gap-2">
                  {(["7d", "30d", "90d"] as const).map(r => (
                    <button key={r} onClick={() => setAnalyticsRange(r)}
                      className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${analyticsRange === r ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                      {r === "7d" ? "7 days" : r === "30d" ? "30 days" : "90 days"}
                    </button>
                  ))}
                </div>
              )}
              {/* Sub-tab pills */}
              <div className="flex gap-1 rounded-xl bg-gray-900 p-1">
                {([
                  { id: "overview", icon: Globe, label: "Overview" },
                  { id: "funnel", icon: TrendingUp, label: "Funnel" },
                  { id: "engagement", icon: MousePointerClick, label: "Engagement" },
                  { id: "sessions", icon: Video, label: "Sessions" },
                ] as const).map(({ id, icon: Icon, label }) => (
                  <button key={id} onClick={() => setAnalyticsSubTab(id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${analyticsSubTab === id ? "bg-gray-800 text-white shadow-sm" : "text-gray-400 hover:text-gray-200"}`}>
                    <Icon className="h-3.5 w-3.5" />{label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Overview ── */}
            {analyticsSubTab === "overview" && (
              <>
                {analyticsLoading && (
                  <div className="text-center py-20 text-gray-500 text-sm animate-pulse">Loading analytics...</div>
                )}
                {analyticsError && (
                  <div className="rounded-2xl border border-yellow-800 bg-yellow-900/20 p-6 text-center">
                    <p className="text-yellow-400 font-semibold mb-1">
                      {analyticsError === "PostHog not configured" ? "PostHog not configured yet" : "Failed to load analytics"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {analyticsError === "PostHog not configured"
                        ? "Add POSTHOG_API_KEY and POSTHOG_PROJECT_ID to the backend .env and Vercel settings."
                        : analyticsError}
                    </p>
                  </div>
                )}
                {analytics && !analyticsLoading && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      {[
                        { label: "Unique Visitors", value: analytics.uniqueVisitors, color: "text-purple-400" },
                        { label: "Page Views", value: analytics.totalPageviews, color: "text-blue-400" },
                        { label: "Form Views", value: analytics.contactFormViews, color: "text-violet-400" },
                        { label: "Form Starts", value: analytics.contactFormStarts, color: "text-amber-400" },
                        { label: "Submitted", value: analytics.contactFormSubmits, color: "text-emerald-400" },
                      ].map(card => (
                        <div key={card.label} className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
                          <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
                          <p className="text-xs text-gray-400 mt-1">{card.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl border border-emerald-800 bg-emerald-900/20 px-6 py-4 flex items-center justify-between">
                      <p className="text-sm text-gray-300 font-medium">Visitor → Submission Conversion</p>
                      <p className="text-2xl font-black text-emerald-400">{analytics.conversionRate}</p>
                    </div>
                    {analytics.byDay.length > 0 && (
                      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Daily Page Views</p>
                        <div className="flex items-end gap-1 h-24">
                          {(() => {
                            const maxPv = Math.max(...analytics.byDay.map(d => d.pageviews), 1);
                            return analytics.byDay.map(d => (
                              <div key={d.date as string} className="flex-1 flex flex-col items-center gap-1 group" title={`${d.date}: ${d.pageviews} views`}>
                                <div className="w-full rounded-t bg-purple-600 group-hover:bg-purple-400 transition-colors min-h-[2px]"
                                  style={{ height: `${(d.pageviews / maxPv) * 88}px` }} />
                              </div>
                            ));
                          })()}
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] text-gray-600">
                          <span>{String(analytics.byDay[0]?.date ?? "").slice(5)}</span>
                          <span>{String(analytics.byDay[analytics.byDay.length - 1]?.date ?? "").slice(5)}</span>
                        </div>
                      </div>
                    )}
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Top Referrers</p>
                        {analytics.topReferrers.length === 0
                          ? <p className="text-xs text-gray-600">No data yet</p>
                          : analytics.topReferrers.map(r => (
                            <div key={r.referrer} className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0">
                              <span className="text-xs text-gray-300 truncate flex-1 mr-2">{r.referrer}</span>
                              <span className="text-xs font-bold text-purple-400 shrink-0">{r.count}</span>
                            </div>
                          ))
                        }
                      </div>
                      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">By Country</p>
                        {analytics.byCountry.length === 0
                          ? <p className="text-xs text-gray-600">No data yet</p>
                          : analytics.byCountry.map(c => (
                            <div key={c.country} className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0">
                              <span className="text-xs text-gray-300">{c.country}</span>
                              <span className="text-xs font-bold text-blue-400">{c.count}</span>
                            </div>
                          ))
                        }
                      </div>
                      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">By Device</p>
                        {analytics.byDevice.length === 0
                          ? <p className="text-xs text-gray-600">No data yet</p>
                          : (() => {
                            const total = analytics.byDevice.reduce((s, d) => s + d.count, 0) || 1;
                            return analytics.byDevice.map(d => (
                              <div key={d.device} className="mb-3">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-300 capitalize">{d.device}</span>
                                  <span className="text-gray-400">{((d.count / total) * 100).toFixed(0)}%</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
                                  <div className="h-full rounded-full bg-violet-500" style={{ width: `${(d.count / total) * 100}%` }} />
                                </div>
                              </div>
                            ));
                          })()
                        }
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── Funnel ── */}
            {analyticsSubTab === "funnel" && (
              <>
                {funnelLoading && <div className="text-center py-20 text-gray-500 text-sm animate-pulse">Loading funnel...</div>}
                {funnelError && (
                  <div className="rounded-2xl border border-yellow-800 bg-yellow-900/20 p-6 text-center">
                    <p className="text-yellow-400 font-semibold mb-1">
                      {funnelError === "PostHog not configured" ? "PostHog not configured yet" : "Failed to load funnel data"}
                    </p>
                    <p className="text-xs text-gray-400">{funnelError === "PostHog not configured" ? "Add POSTHOG_API_KEY and POSTHOG_PROJECT_ID to the backend .env." : funnelError}</p>
                  </div>
                )}
                {funnel && !funnelLoading && (
                  <div className="space-y-6">
                    {/* Funnel steps */}
                    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-5">Conversion Funnel</p>
                      <div className="space-y-3">
                        {funnel.funnel.map((step, i) => {
                          const topCount = funnel.funnel[0]?.count || 1;
                          const prevCount = i > 0 ? (funnel.funnel[i - 1]?.count || 1) : null;
                          const dropOff = prevCount ? (((prevCount - step.count) / prevCount) * 100).toFixed(0) : null;
                          const widthPct = (step.count / topCount) * 100;
                          const barColors = ["bg-purple-600", "bg-purple-500", "bg-purple-400", "bg-purple-300"];
                          return (
                            <div key={step.step}>
                              <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-gray-300 font-medium">{step.step}</span>
                                <div className="flex items-center gap-3">
                                  {dropOff !== null && (
                                    <span className="inline-flex items-center gap-0.5 text-red-400">
                                      <ArrowDownRight className="h-3 w-3" />−{dropOff}%
                                    </span>
                                  )}
                                  <span className="font-bold text-white">{step.count.toLocaleString()}</span>
                                </div>
                              </div>
                              <div className="h-7 rounded-lg bg-gray-700/50 overflow-hidden">
                                <div className={`h-full rounded-lg ${barColors[i]} transition-all`} style={{ width: `${widthPct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* UTM Sources + Mediums */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">UTM Sources</p>
                        {funnel.utmSources.length === 0
                          ? <p className="text-xs text-gray-600">No data yet</p>
                          : funnel.utmSources.map(s => (
                            <div key={s.source} className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0">
                              <span className="text-xs text-gray-300 truncate flex-1 mr-2">{s.source}</span>
                              <span className="text-xs font-bold text-purple-400 shrink-0">{s.visitors}</span>
                            </div>
                          ))
                        }
                      </div>
                      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">UTM Mediums</p>
                        {funnel.utmMediums.length === 0
                          ? <p className="text-xs text-gray-600">No data yet</p>
                          : funnel.utmMediums.map(m => (
                            <div key={m.medium} className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0">
                              <span className="text-xs text-gray-300 truncate flex-1 mr-2">{m.medium}</span>
                              <span className="text-xs font-bold text-blue-400 shrink-0">{m.visitors}</span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── Engagement ── */}
            {analyticsSubTab === "engagement" && (
              <>
                {engagementLoading && <div className="text-center py-20 text-gray-500 text-sm animate-pulse">Loading engagement...</div>}
                {engagementError && (
                  <div className="rounded-2xl border border-yellow-800 bg-yellow-900/20 p-6 text-center">
                    <p className="text-yellow-400 font-semibold mb-1">
                      {engagementError === "PostHog not configured" ? "PostHog not configured yet" : "Failed to load engagement data"}
                    </p>
                    <p className="text-xs text-gray-400">{engagementError === "PostHog not configured" ? "Add POSTHOG_API_KEY and POSTHOG_PROJECT_ID to the backend .env." : engagementError}</p>
                  </div>
                )}
                {engagement && !engagementLoading && (
                  <div className="space-y-6">
                    {/* KPI + section views */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="rounded-2xl border border-emerald-800 bg-emerald-900/20 p-5 col-span-2 sm:col-span-1">
                        <p className="text-3xl font-black text-emerald-400">{engagement.avgScrollDepth}%</p>
                        <p className="text-xs text-gray-400 mt-1">Avg Scroll Depth</p>
                      </div>
                      {engagement.sectionViews.map(sv => {
                        const label = sv.event === "products_section_viewed" ? "Products Viewed"
                          : sv.event === "exclusive_section_viewed" ? "Exclusive Viewed"
                          : "Contact Viewed";
                        return (
                          <div key={sv.event} className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
                            <p className="text-3xl font-black text-violet-400">{sv.uniqueViewers}</p>
                            <p className="text-xs text-gray-400 mt-1">{label}</p>
                          </div>
                        );
                      })}
                    </div>
                    {/* Scroll depth buckets */}
                    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Scroll Depth Buckets</p>
                      {engagement.scrollBuckets.length === 0
                        ? <p className="text-xs text-gray-600">No data yet</p>
                        : (() => {
                          const total = engagement.scrollBuckets.reduce((s, b) => s + b.sessions, 0) || 1;
                          return engagement.scrollBuckets.map(b => (
                            <div key={b.bucket} className="mb-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-300">{b.bucket}</span>
                                <span className="text-gray-400">{b.sessions} sessions ({((b.sessions / total) * 100).toFixed(0)}%)</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
                                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(b.sessions / total) * 100}%` }} />
                              </div>
                            </div>
                          ));
                        })()
                      }
                    </div>
                    {/* Hero CTAs + Form Interests */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Hero CTA Clicks</p>
                        {engagement.heroCtas.length === 0
                          ? <p className="text-xs text-gray-600">No clicks yet</p>
                          : engagement.heroCtas.map(c => (
                            <div key={c.button} className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0">
                              <span className="text-xs text-gray-300 truncate flex-1 mr-2">{c.button}</span>
                              <span className="text-xs font-bold text-amber-400 shrink-0">{c.clicks}</span>
                            </div>
                          ))
                        }
                      </div>
                      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Form Interest Breakdown</p>
                        {engagement.formInterests.length === 0
                          ? <p className="text-xs text-gray-600">No submissions yet</p>
                          : (() => {
                            const total = engagement.formInterests.reduce((s, f) => s + f.count, 0) || 1;
                            return engagement.formInterests.map(f => (
                              <div key={f.interest} className="mb-3">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-300">{INTEREST_DISPLAY[f.interest] || f.interest}</span>
                                  <span className="text-gray-400">{f.count}</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
                                  <div className="h-full rounded-full bg-purple-500" style={{ width: `${(f.count / total) * 100}%` }} />
                                </div>
                              </div>
                            ));
                          })()
                        }
                      </div>
                    </div>
                    {/* Heatmap link */}
                    <a href="https://eu.posthog.com/project/142777/heatmaps" target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-4 rounded-2xl border border-gray-700 bg-gray-900 px-6 py-4 hover:border-purple-500 transition-all group">
                      <div className="rounded-xl bg-purple-600/20 p-3 group-hover:bg-purple-600/30 transition-colors">
                        <MousePointerClick className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">View Heatmaps in PostHog →</p>
                        <p className="text-xs text-gray-500 mt-0.5">Click maps, scroll maps, and rage click analysis</p>
                      </div>
                    </a>
                  </div>
                )}
              </>
            )}

            {/* ── Sessions ── */}
            {analyticsSubTab === "sessions" && (
              <>
                {sessionsLoading && <div className="text-center py-20 text-gray-500 text-sm animate-pulse">Loading sessions...</div>}
                {sessionsError && (
                  <div className="rounded-2xl border border-yellow-800 bg-yellow-900/20 p-6 text-center">
                    <p className="text-yellow-400 font-semibold mb-1">
                      {sessionsError === "PostHog not configured" ? "PostHog not configured yet" : "Failed to load sessions"}
                    </p>
                    <p className="text-xs text-gray-400">{sessionsError === "PostHog not configured" ? "Add POSTHOG_API_KEY and POSTHOG_PROJECT_ID to the backend .env." : sessionsError}</p>
                  </div>
                )}
                {sessions && !sessionsLoading && (
                  sessions.sessions.length === 0 ? (
                    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-12 text-center">
                      <Video className="mx-auto mb-3 h-8 w-8 text-gray-600" />
                      <p className="text-gray-400 font-semibold mb-1">No recordings yet</p>
                      <p className="text-xs text-gray-600">Enable Session Recording in PostHog → Project Settings.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sessions.sessions.map(s => {
                        const mins = Math.floor(s.duration / 60);
                        const secs = s.duration % 60;
                        const activePct = s.duration > 0 ? Math.round((s.activeMs / 1000 / s.duration) * 100) : 0;
                        const startedAgo = (() => {
                          const diff = Date.now() - new Date(s.startTime).getTime();
                          const h = Math.floor(diff / 3600000);
                          const d = Math.floor(diff / 86400000);
                          if (d > 0) return `${d}d ago`;
                          if (h > 0) return `${h}h ago`;
                          return `${Math.floor(diff / 60000)}m ago`;
                        })();
                        return (
                          <div key={s.id} className="rounded-2xl border border-gray-800 bg-gray-900 px-5 py-4 flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2 shrink-0">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-bold text-white">{mins}m {secs}s</span>
                            </div>
                            <span className="text-xs text-gray-500">{startedAgo}</span>
                            {s.country && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-800 px-2.5 py-0.5 text-[10px] font-semibold text-gray-300">
                                <Globe className="h-3 w-3" />{s.country}
                              </span>
                            )}
                            {s.device && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-800 px-2.5 py-0.5 text-[10px] font-semibold text-gray-300">
                                {s.device === "Mobile" ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}{s.device}
                              </span>
                            )}
                            {s.startUrl && (
                              <span className="text-xs text-gray-500 truncate max-w-[200px]">{String(s.startUrl).replace(/^https?:\/\/[^/]+/, "")}</span>
                            )}
                            <span className="text-xs text-gray-500 ml-auto shrink-0">{activePct}% active</span>
                            <a href={s.posthogUrl} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600/20 px-3 py-1.5 text-xs font-bold text-purple-400 hover:bg-purple-600/40 transition-all shrink-0">
                              <Video className="h-3.5 w-3.5" /> Watch →
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </>
            )}
          </div>
        )}

        {/* Leads Tab */}
        {tab === "leads" && (
          <div>
            {/* Filter */}
            <div className="flex gap-2 flex-wrap mb-5">
              <button onClick={() => setFilterStatus("all")}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${filterStatus === "all" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                All ({leads.length})
              </button>
              {allStatusLabels.map(s => {
                const count = leads.filter(l => l.status === s.value).length;
                if (count === 0 && filterStatus !== s.value) return null;
                return (
                  <button key={s.value} onClick={() => setFilterStatus(s.value)}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${filterStatus === s.value ? "text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                    style={filterStatus === s.value ? { backgroundColor: getStatusColor(s.value) } : {}}>
                    {STATUS_DISPLAY[s.value] || s.label} ({count})
                  </button>
                );
              })}
            </div>

            {filteredLeads.length === 0 ? (
              <div className="text-center py-20 text-gray-500">No leads yet</div>
            ) : (
              <div className="space-y-3">
                {filteredLeads.map(lead => (
                  <div key={lead.id} className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                          <h4 className="font-bold text-white text-sm">{lead.name}</h4>
                          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                            style={{ backgroundColor: getStatusColor(lead.status) }}>
                            {STATUS_DISPLAY[lead.status] || lead.status}
                          </span>
                          {lead.product_interest && (
                            <span className="rounded-full bg-gray-800 px-2.5 py-0.5 text-[10px] font-semibold text-gray-300">
                              {INTEREST_DISPLAY[lead.product_interest] || lead.product_interest}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3 flex-wrap">
                          <a href={`mailto:${lead.email}`} className="hover:text-purple-400 transition-colors">{lead.email}</a>
                          {lead.phone && <span>{lead.phone}</span>}
                          <span>{new Date(lead.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                        {(lead.country || lead.device || lead.referrer || lead.posthog_person_url) && (
                          <div className="flex items-center gap-2 flex-wrap mb-3">
                            {lead.country && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-800 px-2.5 py-0.5 text-[10px] font-semibold text-gray-300">
                                <Globe className="h-3 w-3" /> {lead.country}
                              </span>
                            )}
                            {lead.device && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-800 px-2.5 py-0.5 text-[10px] font-semibold text-gray-300">
                                {lead.device === "mobile" ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />} {lead.device}
                              </span>
                            )}
                            {lead.referrer && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-800 px-2.5 py-0.5 text-[10px] font-semibold text-gray-300">
                                <Link2 className="h-3 w-3" /> {lead.referrer.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
                              </span>
                            )}
                            {lead.posthog_person_url && (
                              <a href={lead.posthog_person_url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-full bg-purple-900/40 px-2.5 py-0.5 text-[10px] font-semibold text-purple-300 hover:text-purple-200 transition-colors">
                                View in PostHog →
                              </a>
                            )}
                          </div>
                        )}
                        {lead.message && (
                          <p className="text-xs text-gray-400 bg-gray-800/50 rounded-lg px-3 py-2 mb-3 leading-relaxed">{lead.message}</p>
                        )}
                        <div>
                          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Notes</label>
                          <textarea
                            rows={2}
                            value={editingNotes[lead.id] ?? lead.notes ?? ""}
                            onChange={e => setEditingNotes(p => ({ ...p, [lead.id]: e.target.value }))}
                            onBlur={() => handleNotesBlur(lead)}
                            placeholder="Add internal notes..."
                            className="w-full mt-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                          />
                        </div>
                      </div>
                      <div className="shrink-0">
                        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Status</label>
                        <select
                          value={lead.status}
                          onChange={e => updateLead(lead.id, { status: e.target.value })}
                          className="rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-xs font-bold text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                          {allStatusLabels.map(s => (
                            <option key={s.value} value={s.value}>
                              {STATUS_DISPLAY[s.value] || s.label}
                            </option>
                          ))}
                          {statuses.filter(s => !STATUS_DISPLAY[s.label]).map(s => (
                            <option key={s.id} value={s.label}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stores Tab */}
        {tab === "stores" && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  value={storeSearch}
                  onChange={e => setStoreSearch(e.target.value)}
                  placeholder="Search stores..."
                  className="w-full rounded-xl border border-gray-700 bg-gray-800 pl-9 pr-4 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button onClick={loadStores} className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {storesLoading ? (
              <div className="text-center py-20 text-gray-500 text-sm animate-pulse">Loading stores...</div>
            ) : (
              <div className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Store</th>
                      <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 hidden sm:table-cell">Owner</th>
                      <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 hidden lg:table-cell">Spotlight</th>
                      <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 hidden md:table-cell">Created</th>
                      <th className="text-right px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores
                      .filter(s => !storeSearch || s.company_name.toLowerCase().includes(storeSearch.toLowerCase()) || s.slug.toLowerCase().includes(storeSearch.toLowerCase()))
                      .map(store => (
                        <tr key={store.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition-colors">
                          <td className="px-5 py-4">
                            <p className="font-semibold text-white text-sm">{store.company_name}</p>
                            <p className="text-xs text-gray-500">/{store.slug}</p>
                          </td>
                          <td className="px-5 py-4 hidden sm:table-cell">
                            <p className="text-xs text-gray-400 truncate max-w-[160px]">{store.owner_email || "—"}</p>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1">
                              <span className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-bold ${store.is_published ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                                {store.is_published ? "Live" : "Draft"}
                              </span>
                              {store.is_disabled && (
                                <span className="w-fit rounded-full px-2 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-400">
                                  Disabled
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4 hidden lg:table-cell">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => toggleFeatured(store.id, store.is_featured)}
                                title={store.is_featured ? "Remove from Featured (Ad)" : "Mark as Featured (Ad)"}
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all w-fit ${
                                  store.is_featured
                                    ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/40"
                                    : "bg-gray-700 text-gray-500 hover:bg-gray-600 hover:text-gray-300"
                                }`}
                              >
                                <Megaphone className="h-3 w-3" />
                                {store.is_featured ? "Ad" : "Ad?"}
                              </button>
                              <button
                                onClick={() => toggleRecommended(store.id, store.is_recommended)}
                                title={store.is_recommended ? "Remove from P&P Picks" : "Add to P&P Picks"}
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all w-fit ${
                                  store.is_recommended
                                    ? "bg-violet-500/20 text-violet-400 hover:bg-violet-500/40"
                                    : "bg-gray-700 text-gray-500 hover:bg-gray-600 hover:text-gray-300"
                                }`}
                              >
                                <Star className="h-3 w-3" />
                                {store.is_recommended ? "Pick" : "Pick?"}
                              </button>
                            </div>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <p className="text-xs text-gray-500">
                              {new Date(store.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={`https://marketplace.pixelndpitch.com/${store.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-700 transition-all"
                                title="View store"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                              <button
                                onClick={() => toggleDisabled(store.id, store.is_disabled)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                  store.is_disabled
                                    ? "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40"
                                    : "bg-red-600/20 text-red-400 hover:bg-red-600/40"
                                }`}
                              >
                                {store.is_disabled ? "Re-enable" : "Disable"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {stores.filter(s => !storeSearch || s.company_name.toLowerCase().includes(storeSearch.toLowerCase()) || s.slug.toLowerCase().includes(storeSearch.toLowerCase())).length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-16 text-center">
                          <Store className="mx-auto mb-3 h-8 w-8 text-gray-600" />
                          <p className="text-gray-500 text-sm">{storeSearch ? "No matching stores" : "No stores yet"}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Status Config Tab */}
        {tab === "statuses" && (
          <div className="max-w-lg space-y-6">
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
              <h3 className="font-bold text-white mb-4">Add New Status</h3>
              <form onSubmit={handleAddStatus} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5">Label (used as ID)</label>
                  <input
                    type="text" value={newLabel} onChange={e => setNewLabel(e.target.value)}
                    placeholder="e.g. negotiating"
                    className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 block mb-1.5">Color</label>
                    <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)}
                      className="h-10 w-20 rounded-lg border border-gray-700 bg-gray-800 cursor-pointer" />
                  </div>
                  <div className="flex-1 flex items-end">
                    <button type="submit" disabled={addingStatus || !newLabel.trim()}
                      className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-2.5 text-sm font-bold text-white transition-all disabled:opacity-50">
                      <Plus className="h-4 w-4" /> Add Status
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
              <h3 className="font-bold text-white mb-4">All Statuses</h3>
              <div className="space-y-2">
                {/* Built-in statuses */}
                {Object.entries(STATUS_DISPLAY).map(([value, label]) => (
                  <div key={value} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: (() => {
                          const d: Record<string, string> = { new: "#6b7280", pursuing: "#3b82f6", demo_given: "#8b5cf6", proposal_sent: "#f59e0b", won: "#10b981", lost: "#ef4444" };
                          return d[value] || "#6b7280";
                        })() }} />
                      <span className="text-sm font-medium text-gray-200">{label}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded">built-in</span>
                  </div>
                ))}
                {/* Custom statuses */}
                {statuses.filter(s => !STATUS_DISPLAY[s.label]).map(s => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-sm font-medium text-gray-200">{s.label}</span>
                    </div>
                    <button onClick={() => handleDeleteStatus(s.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors p-1 rounded">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
