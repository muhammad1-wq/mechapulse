// Real API client — talks to the MechaPulse backend (server/server.js).
// Set VITE_API_URL if the backend isn't on localhost:4000.
const BASE = import.meta.env?.VITE_API_URL || "http://localhost:4000";

function authHeaders() {
  const token = localStorage.getItem("mp_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(opts.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  register: (email, password) => req("/api/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),
  login: (email, password) => req("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => req("/api/auth/me"),
  updateAccount: (payload) => req("/api/account", { method: "PUT", body: JSON.stringify(payload) }),
  uploadAvatar: async (file) => {
    const form = new FormData();
    form.append("avatar", file);
    const res = await fetch(`${BASE}/api/account/avatar`, { method: "POST", headers: authHeaders(), body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data;
  },
  robots: () => req("/api/robots"),
  aiTools: () => req("/api/ai-tools"),
  robotsTrend: () => req("/api/analytics/robots-trend"),
  aiTrend: () => req("/api/analytics/ai-trend"),
  readerInterest: () => req("/api/analytics/reader-interest"),
  articles: () => req("/api/articles"),
  placeOrder: (robotName, marketplace, price) => req("/api/orders", { method: "POST", body: JSON.stringify({ robotName, marketplace, price }) }),
  myOrders: () => req("/api/orders"),
  subscribe: (toolName, plan) => req("/api/subscriptions", { method: "POST", body: JSON.stringify({ toolName, plan }) }),
  mySubscriptions: () => req("/api/subscriptions"),
  unsubscribe: (toolName) => req(`/api/subscriptions/${encodeURIComponent(toolName)}`, { method: "DELETE" }),
  markRead: (title) => req("/api/articles/read", { method: "POST", body: JSON.stringify({ title }) }),
  fileUrl: (path) => (path ? `${BASE}${path}` : null),
  BASE,
};
