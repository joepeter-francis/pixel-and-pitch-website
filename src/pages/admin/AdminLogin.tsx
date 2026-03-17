import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { storeAuth, getStoredUser } from "../../lib/api";

const LOGO = "https://pub-0f4114fde3044f60b819543e9dc412f4.r2.dev/brand/2433c9af-017d-4205-86ed-bc283fc9ce87.png";
const API_URL = import.meta.env.VITE_API_URL || "https://api-marketplace.pixelndpitch.com";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@pixelndpitch.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    if (user?.email === "admin@pixelndpitch.com") navigate("/admin/dashboard");
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json() as { access_token?: string; user?: { id: string; email: string }; error?: string };
      if (!res.ok) throw new Error(data.error || "Login failed");
      if (data.user?.email !== "admin@pixelndpitch.com") {
        throw new Error("Access restricted to administrators");
      }
      storeAuth(data.access_token!, data.user!);
      navigate("/admin/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={LOGO} alt="Pixel & Pitch" className="h-10 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white">Admin Login</h1>
          <p className="text-sm text-gray-400 mt-1">Restricted access only</p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Email</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Password</label>
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 py-3 font-bold text-white text-sm transition-all disabled:opacity-60 mt-2">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-600 mt-6">
          <a href="/" className="hover:text-gray-400 transition-colors">← Back to website</a>
        </p>
      </div>
    </div>
  );
}
