/**
 * MechaPulse API — real backend
 * Auth (JWT + bcrypt), persistent JSON datastore, avatar uploads,
 * robots / AI tools / subscriptions / articles data, analytics endpoints.
 */
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const db = require("./db");

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "mechapulse-dev-secret-change-me";
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOAD_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) return cb(new Error("Only image files are allowed"));
    cb(null, true);
  },
});

function validatePassword(pw) {
  const errs = [];
  if (!pw || pw.length < 8) errs.push("At least 8 characters");
  if (pw && pw.length > 16) errs.push("No more than 16 characters");
  if (!/[A-Z]/.test(pw || "")) errs.push("One uppercase letter");
  if (!/[a-z]/.test(pw || "")) errs.push("One lowercase letter");
  if (!/[0-9]/.test(pw || "")) errs.push("One number");
  if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(pw || "")) errs.push("One special character");
  return errs;
}
function validEmail(e) {
  return /^\S+@\S+\.\S+$/.test(e || "");
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
function publicUser(u) {
  return { id: u.id, email: u.email, avatarUrl: u.avatarUrl };
}

/* ===================== AUTH ===================== */
app.post("/api/auth/register", (req, res) => {
  const { email, password } = req.body;
  if (!validEmail(email)) return res.status(400).json({ error: "Enter a valid email address" });
  const pwErrors = validatePassword(password);
  if (pwErrors.length) return res.status(400).json({ error: "Password doesn't meet requirements", details: pwErrors });
  if (db.findUserByEmail(email)) return res.status(409).json({ error: "An account with this email already exists" });

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = db.createUser({ email, passwordHash });
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ token, user: publicUser(user) });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.findUserByEmail(email || "");
  if (!user || !bcrypt.compareSync(password || "", user.passwordHash)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: publicUser(user) });
});

// Real Google/Apple sign-in requires an OAuth app registered with each
// provider plus a live redirect domain, which can't exist inside this
// sandbox. This endpoint documents the contract so real credentials can be
// dropped in later without changing the frontend.
app.post("/api/auth/oauth/:provider", (req, res) => {
  res.status(501).json({
    error: `${req.params.provider} sign-in isn't configured yet`,
    detail: "Add real OAuth client credentials for this provider to enable it.",
  });
});

app.get("/api/auth/me", authRequired, (req, res) => {
  const user = db.findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: publicUser(user) });
});

/* ===================== ACCOUNT ===================== */
app.put("/api/account", authRequired, (req, res) => {
  const { currentPassword, newEmail, newPassword } = req.body;
  const user = db.findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!currentPassword || !bcrypt.compareSync(currentPassword, user.passwordHash)) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }
  const patch = {};
  if (newEmail && newEmail !== user.email) {
    if (!validEmail(newEmail)) return res.status(400).json({ error: "Enter a valid email address" });
    const taken = db.findUserByEmail(newEmail);
    if (taken && taken.id !== user.id) return res.status(409).json({ error: "That email is already in use" });
    patch.email = newEmail;
  }
  if (newPassword) {
    const errs = validatePassword(newPassword);
    if (errs.length) return res.status(400).json({ error: "New password doesn't meet requirements", details: errs });
    patch.passwordHash = bcrypt.hashSync(newPassword, 10);
  }
  const updated = db.updateUser(user.id, patch);
  res.json({ user: publicUser(updated) });
});

app.post("/api/account/avatar", authRequired, (req, res) => {
  upload.single("avatar")(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const url = `/uploads/${req.file.filename}`;
    db.updateUser(req.user.id, { avatarUrl: url });
    res.json({ avatarUrl: url });
  });
});

/* ============= ROBOTS / AI TOOLS / ARTICLES ============= */
const ROBOTS = [
  { name: "Walker S2", maker: "UBTech", price: 95000, trendBase: 18, desc: "Bipedal humanoid for industrial logistics & inspection.", grade: "A+" },
  { name: "Optimus Gen 3", maker: "Tesla", price: 20000, trendBase: 42, desc: "General-purpose humanoid for home and factory tasks.", grade: "A+" },
  { name: "Atlas HD", maker: "Boston Dynamics", price: 150000, trendBase: 9, desc: "Hydraulic humanoid built for dynamic mobility research.", grade: "A" },
  { name: "Digit v5", maker: "Agility Robotics", price: 65000, trendBase: 21, desc: "Warehouse-ready biped for pick-and-place operations.", grade: "A" },
  { name: "Figure 02", maker: "Figure AI", price: 85000, trendBase: 31, desc: "Vision-language humanoid for manufacturing lines.", grade: "A+" },
  { name: "H1", maker: "Unitree", price: 18500, trendBase: 27, desc: "Affordable full-size humanoid research platform.", grade: "B+" },
];
const AI_TOOLS = [
  { name: "Claude", maker: "Anthropic", price: "$20/mo", trendBase: 24, desc: "Reasoning-first assistant for coding, research & writing." },
  { name: "Gemini", maker: "Google DeepMind", price: "$19/mo", trendBase: 19, desc: "Multimodal assistant integrated across Google Workspace." },
  { name: "GPT-5", maker: "OpenAI", price: "$20/mo", trendBase: 15, desc: "General-purpose model with broad plugin ecosystem." },
];
const ARTICLES = [
  { title: "Humanoid Robots Cross the Cost Threshold", tag: "ANALYSIS", excerpt: "Unit prices for general-purpose humanoids have fallen sharply as battery and actuator costs drop, putting robots within reach of mid-size warehouses for the first time.", read: "6 min" },
  { title: "Claude Adoption Surges in Enterprise Coding", tag: "AI TOOLS", excerpt: "Engineering teams report faster review cycles after adopting agentic coding assistants, with reasoning-first models pulling ahead in complex refactors.", read: "4 min" },
  { title: "Walker S2 Now Handles Two-Handed Assembly", tag: "ROBOTICS", excerpt: "A firmware update gives Walker S2 finer bimanual coordination, closing the gap with hydraulic platforms on delicate assembly tasks.", read: "5 min" },
];

function seededJitter(seedStr, spread = 4) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
  return ((h % 1000) / 1000 - 0.5) * 2 * spread;
}
const today = new Date().toISOString().slice(0, 10);

app.get("/api/robots", (req, res) => {
  res.json({ robots: ROBOTS.map((r) => ({ ...r, trend: +(r.trendBase + seededJitter(today + r.name)).toFixed(1) })) });
});
app.get("/api/ai-tools", (req, res) => {
  res.json({ tools: AI_TOOLS.map((t) => ({ ...t, trend: +(t.trendBase + seededJitter(today + t.name)).toFixed(1) })) });
});
app.get("/api/analytics/robots-trend", (req, res) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  res.json({
    series: months.map((m, i) => ({
      m,
      walker: +(40 + i * 11 + seededJitter(m + "walker", 3)).toFixed(1),
      optimus: +(30 + i * 14 + seededJitter(m + "optimus", 3)).toFixed(1),
      atlas: +(48 + i * 1.5 + seededJitter(m + "atlas", 3)).toFixed(1),
      digit: +(20 + i * 6.5 + seededJitter(m + "digit", 3)).toFixed(1),
    })),
  });
});
app.get("/api/analytics/ai-trend", (req, res) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  res.json({
    series: months.map((m, i) => ({
      m,
      claude: +(55 + i * 9 + seededJitter(m + "claude", 3)).toFixed(1),
      gemini: +(40 + i * 8 + seededJitter(m + "gemini", 3)).toFixed(1),
      gpt: +(70 + i * 3 + seededJitter(m + "gpt", 3)).toFixed(1),
    })),
  });
});
app.get("/api/articles", (req, res) => res.json({ articles: ARTICLES }));

/* ===================== ORDERS (Buy) ===================== */
app.post("/api/orders", authRequired, (req, res) => {
  const { robotName, marketplace, price } = req.body;
  if (!robotName || !marketplace || !price) return res.status(400).json({ error: "Missing order fields" });
  const order = db.createOrder(req.user.id, robotName, marketplace, price);
  const marketplaceUrls = {
    Amazon: `https://www.amazon.com/s?k=${encodeURIComponent(robotName)}`,
    Daraz: `https://www.daraz.pk/catalog/?q=${encodeURIComponent(robotName)}`,
    AliBaba: `https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(robotName)}`,
  };
  res.status(201).json({ orderId: order.id, redirectUrl: marketplaceUrls[marketplace] || null });
});
app.get("/api/orders", authRequired, (req, res) => res.json({ orders: db.listOrders(req.user.id) }));

/* ===================== SUBSCRIPTIONS ===================== */
app.post("/api/subscriptions", authRequired, (req, res) => {
  const { toolName, plan } = req.body;
  if (!toolName || !plan) return res.status(400).json({ error: "Missing subscription fields" });
  const sub = db.upsertSubscription(req.user.id, toolName, plan);
  res.status(201).json({ subscription: sub });
});
app.get("/api/subscriptions", authRequired, (req, res) => res.json({ subscriptions: db.listSubscriptions(req.user.id) }));
app.delete("/api/subscriptions/:toolName", authRequired, (req, res) => {
  db.deleteSubscription(req.user.id, req.params.toolName);
  res.json({ ok: true });
});

/* ============= ARTICLE READS -> reader interest chart ============= */
app.post("/api/articles/read", authRequired, (req, res) => {
  const rec = db.recordRead(req.user.id, req.body.title || "unknown");
  res.status(201).json(rec);
});
app.get("/api/analytics/reader-interest", (req, res) => {
  const reads = db.allReads();
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const base = [180, 320, 410, 380, 460, 520, 300];
  const counts = new Array(7).fill(0);
  reads.forEach((r) => { counts[new Date(r.createdAt).getDay()]++; });
  const series = labels.map((d, i) => ({ d, reads: base[i] + counts[i] * 15 }));
  res.json({ series: [...series.slice(1), series[0]] }); // Mon..Sun
});

app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.listen(PORT, () => console.log(`MechaPulse API listening on http://localhost:${PORT}`));
