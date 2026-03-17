import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api, getStoredUser, clearAuth } from "../../lib/api";
import { LogOut, Plus, Trash2, RefreshCw, ExternalLink } from "lucide-react";

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
  created_at: string;
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
  const [tab, setTab] = useState<"leads" | "statuses">("leads");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [statuses, setStatuses] = useState<LeadStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  // Status form
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState("#8b5cf6");
  const [addingStatus, setAddingStatus] = useState(false);

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

  const updateLead = async (id: string, update: { status?: string; notes?: string }) => {
    try {
      const updated = await api.patch<Lead>(`/admin/leads/${id}`, update);
      setLeads(prev => prev.map(l => l.id === id ? updated : l));
    } catch { toast.error("Failed to update lead"); }
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
      toast.error(err instanceof Error ? err.message : "Failed to add status");
    } finally { setAddingStatus(false); }
  };

  const handleDeleteStatus = async (id: string) => {
    if (!confirm("Delete this status?")) return;
    try {
      await api.delete(`/admin/statuses/${id}`);
      setStatuses(prev => prev.filter(s => s.id !== id));
    } catch { toast.error("Failed to delete status"); }
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
          {(["leads", "statuses"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all ${tab === t ? "bg-gray-800 text-white shadow-sm" : "text-gray-400 hover:text-gray-200"}`}>
              {t === "leads" ? "Leads" : "Status Config"}
            </button>
          ))}
        </div>

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
