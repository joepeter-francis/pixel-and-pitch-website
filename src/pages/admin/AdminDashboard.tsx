import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api, getStoredUser, clearAuth } from "../../lib/api";
import { LogOut, Plus, Trash2, RefreshCw, ExternalLink, Globe, Smartphone, Monitor, Link2 } from "lucide-react";

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

interface LeadStatus {
  id: string;
  label: string;
  color: string;
  order_index: number;
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
  const [tab, setTab] = useState<"analytics" | "leads" | "statuses">("analytics");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [statuses, setStatuses] = useState<LeadStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  // Status form
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("#8b5cf6");
  const [addingStatus, setAddingStatus] = useState(false);
  // Analytics
  const [analyticsRange, setAnalyticsRange] = useState<"7d" | "30d" | "90d">("7d");
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

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

  useEffect(() => {
    if (tab === "analytics") loadAnalytics();
  }, [tab, analyticsRange, loadAnalytics]);

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
        <div className="flex gap-1 rounded-xl bg-gray-900 p-1 mb-6 w-fit">
          {(["analytics", "leads", "statuses"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all ${tab === t ? "bg-gray-800 text-white shadow-sm" : "text-gray-400 hover:text-gray-200"}`}>
              {t === "analytics" ? "Analytics" : t === "leads" ? "Leads" : "Status Config"}
            </button>
          ))}
        </div>

        {/* Analytics Tab */}
        {tab === "analytics" && (
          <div>
            {/* Range selector */}
            <div className="flex gap-2 mb-6">
              {(["7d", "30d", "90d"] as const).map(r => (
                <button key={r} onClick={() => setAnalyticsRange(r)}
                  className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${analyticsRange === r ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                  {r === "7d" ? "7 days" : r === "30d" ? "30 days" : "90 days"}
                </button>
              ))}
            </div>

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
                {/* Overview cards */}
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

                {/* Conversion rate banner */}
                <div className="rounded-2xl border border-emerald-800 bg-emerald-900/20 px-6 py-4 flex items-center justify-between">
                  <p className="text-sm text-gray-300 font-medium">Visitor → Submission Conversion</p>
                  <p className="text-2xl font-black text-emerald-400">{analytics.conversionRate}</p>
                </div>

                {/* Daily chart */}
                {analytics.byDay.length > 0 && (
                  <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Daily Page Views</p>
                    <div className="flex items-end gap-1 h-24">
                      {(() => {
                        const maxPv = Math.max(...analytics.byDay.map(d => d.pageviews), 1);
                        return analytics.byDay.map(d => (
                          <div key={d.date as string} className="flex-1 flex flex-col items-center gap-1 group" title={`${d.date}: ${d.pageviews} views`}>
                            <div
                              className="w-full rounded-t bg-purple-600 group-hover:bg-purple-400 transition-colors min-h-[2px]"
                              style={{ height: `${(d.pageviews / maxPv) * 88}px` }}
                            />
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

                {/* Three columns */}
                <div className="grid sm:grid-cols-3 gap-4">
                  {/* Top Referrers */}
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

                  {/* By Country */}
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

                  {/* By Device */}
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

                {/* PostHog link */}
                <div className="text-center pt-2">
                  <a href="https://eu.posthog.com" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-700 px-5 py-2.5 text-sm font-semibold text-gray-300 hover:border-purple-500 hover:text-purple-400 transition-all">
                    Open PostHog for funnels &amp; session replays
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
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
