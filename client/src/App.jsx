import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, Radar, PieChart, Pie, Cell
} from "recharts";
import {
  User, Lock, Mail, Eye, EyeOff, LayoutDashboard, Cpu, Settings,
  ShoppingCart, Newspaper, LogOut, Menu, X, ArrowRight, Check,
  TrendingUp, TrendingDown, Camera, ChevronRight, Bot, Zap,
  ExternalLink, CreditCard, Star, AlertCircle, ArrowLeft
} from "lucide-react";
import { api } from "./api";

/* ============================================================
   MECHAPULSE — Robotics AI Company Platform
   Design tokens:
   --void:#0A0A0A  --paper:#FFFFFF  --panel:#141416  --panel-2:#1C1C1F
   --line:#2A2A2E  --steel:#8E8E93  --steel-lt:#C7C7CC  --ghost:#4B4B4F
   Display: Space Grotesk / Body: Inter / Mono/HUD: JetBrains Mono
   Signature: cursor-tracking robot visor hero + ring cursor +
   rotating hex-loader page transitions
   ============================================================ */

const FONTS_LINK = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap";

/* ---------------- Global style injection ---------------- */
function GlobalStyle() {
  return (
    <style>{`
      @import url('${FONTS_LINK}');
      * { box-sizing: border-box; }
      .mp-root {
        --void:#0A0A0A; --paper:#FFFFFF; --panel:#141416; --panel-2:#1C1C1F;
        --line:#2A2A2E; --steel:#8E8E93; --steel-lt:#C7C7CC; --ghost:#4B4B4F;
        font-family:'Inter',sans-serif; background:var(--void); color:var(--paper);
        min-height:100vh; position:relative; cursor:none;
        overflow-x:hidden;
      }
      .mp-root ::selection{ background:#fff; color:#000; }
      .mp-display{ font-family:'Space Grotesk',sans-serif; }
      .mp-mono{ font-family:'JetBrains Mono',monospace; }

      /* Mac-style ring cursor */
      .mp-cursor{
        position:fixed; width:18px; height:18px; border-radius:50%;
        border:1.5px solid #fff; pointer-events:none; z-index:9999;
        transform:translate(-50%,-50%); transition:width .15s,height .15s,background .15s, border-color .15s;
        mix-blend-mode:difference;
      }
      .mp-cursor.hover{ width:38px; height:38px; background:#fff; }
      .mp-cursor-dot{
        position:fixed; width:4px; height:4px; border-radius:50%;
        background:#fff; pointer-events:none; z-index:9999; transform:translate(-50%,-50%);
        mix-blend-mode:difference;
      }

      .mp-btn{
        cursor:none; font-family:'Space Grotesk',sans-serif; font-weight:600;
        letter-spacing:.02em; border-radius:2px; transition:all .2s ease;
      }
      .mp-btn-primary{
        background:#fff; color:#000; border:1px solid #fff; padding:13px 28px;
      }
      .mp-btn-primary:hover{ background:transparent; color:#fff; }
      .mp-btn-ghost{
        background:transparent; color:#fff; border:1px solid var(--line); padding:12px 26px;
      }
      .mp-btn-ghost:hover{ border-color:#fff; }

      input.mp-input{
        cursor:none; background:var(--panel-2); border:1px solid var(--line); color:#fff;
        font-family:'Inter',sans-serif; padding:14px 16px; border-radius:2px; width:100%;
        transition:border-color .2s;
      }
      input.mp-input:focus{ outline:none; border-color:#fff; }
      input.mp-input::placeholder{ color:var(--ghost); }

      a, button, [role="button"], .clickable { cursor:none; }

      .mp-scanline{
        position:absolute; inset:0; pointer-events:none;
        background:repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px);
      }

      .mp-grid-bg{
        background-image: linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
        background-size: 48px 48px;
      }

      .mp-fadein{ animation: mpFadeIn .6s ease both; }
      @keyframes mpFadeIn{ from{opacity:0; transform:translateY(14px);} to{opacity:1; transform:translateY(0);} }

      .mp-blink{ animation: mpBlink 1.6s ease-in-out infinite; }
      @keyframes mpBlink{ 0%,92%,100%{ transform:scaleY(1);} 96%{ transform:scaleY(0.1);} }

      ::-webkit-scrollbar{ width:8px; height:8px; }
      ::-webkit-scrollbar-track{ background:var(--void); }
      ::-webkit-scrollbar-thumb{ background:var(--line); border-radius:4px; }
      ::-webkit-scrollbar-thumb:hover{ background:var(--ghost); }

      .mp-hexload-wrap{
        position:fixed; inset:0; background:#000; z-index:200;
        display:flex; align-items:center; justify-content:center; flex-direction:column; gap:28px;
      }
      .mp-hex-spin{ animation: mpSpin 1.1s linear infinite; }
      @keyframes mpSpin{ to{ transform:rotate(360deg);} }
      .mp-dotline{ display:flex; gap:8px; }
      .mp-dotline span{
        width:6px;height:6px;border-radius:50%;background:var(--ghost);
        animation: mpDot 1.2s ease-in-out infinite;
      }
      .mp-dotline span:nth-child(1){animation-delay:0s;}
      .mp-dotline span:nth-child(2){animation-delay:.15s;}
      .mp-dotline span:nth-child(3){animation-delay:.3s;}
      .mp-dotline span:nth-child(4){animation-delay:.45s;}
      .mp-dotline span:nth-child(5){animation-delay:.6s;}
      @keyframes mpDot{ 0%,100%{background:var(--ghost); transform:scale(1);} 50%{background:#fff; transform:scale(1.4);} }

      .mp-sidebar-item{
        display:flex; align-items:center; gap:12px; padding:13px 18px; color:var(--steel);
        border-left:2px solid transparent; transition:all .18s; font-size:14px; font-weight:500;
      }
      .mp-sidebar-item:hover{ color:#fff; background:var(--panel-2); }
      .mp-sidebar-item.active{ color:#fff; border-left-color:#fff; background:var(--panel-2); }

      .mp-card{
        background:var(--panel); border:1px solid var(--line); border-radius:3px;
        transition:border-color .2s;
      }
      .mp-card:hover{ border-color:var(--ghost); }

      .mp-tag{
        font-family:'JetBrains Mono',monospace; font-size:10.5px; letter-spacing:.08em;
        text-transform:uppercase; padding:3px 9px; border:1px solid var(--line); border-radius:20px; color:var(--steel);
      }

      .mp-pulse-dot{
        width:7px; height:7px; border-radius:50%; background:#fff; position:relative;
      }
      .mp-pulse-dot::after{
        content:''; position:absolute; inset:-4px; border-radius:50%; border:1px solid #fff;
        animation: mpPulse 1.8s ease-out infinite;
      }
      @keyframes mpPulse{ 0%{transform:scale(.5); opacity:1;} 100%{transform:scale(2.2); opacity:0;} }

      @media (max-width: 860px){
        .mp-hide-mobile{ display:none !important; }
      }
    `}</style>
  );
}

/* ---------------- Custom cursor ---------------- */
function CustomCursor() {
  const ref = useRef(null);
  const dotRef = useRef(null);
  useEffect(() => {
    const move = (e) => {
      if (ref.current) { ref.current.style.left = e.clientX + "px"; ref.current.style.top = e.clientY + "px"; }
      if (dotRef.current) { dotRef.current.style.left = e.clientX + "px"; dotRef.current.style.top = e.clientY + "px"; }
    };
    const over = (e) => {
      if (e.target.closest("button, a, input, [role='button'], .clickable")) {
        ref.current?.classList.add("hover");
      }
    };
    const out = (e) => {
      if (e.target.closest("button, a, input, [role='button'], .clickable")) {
        ref.current?.classList.remove("hover");
      }
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("mouseout", out);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mouseout", out);
    };
  }, []);
  return (
    <>
      <div ref={ref} className="mp-cursor" />
      <div ref={dotRef} className="mp-cursor-dot" />
    </>
  );
}

/* ---------------- Hex loader (page transition) ---------------- */
function HexLoader({ label = "Loading module" }) {
  return (
    <div className="mp-hexload-wrap mp-fadein">
      <svg width="86" height="86" viewBox="0 0 100 100" className="mp-hex-spin">
        <polygon points="50,4 90,27 90,73 50,96 10,73 10,27" fill="none" stroke="#2A2A2E" strokeWidth="2" />
        <polygon points="50,20 76,35 76,65 50,80 24,65 24,35" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="10 6" />
        <circle cx="50" cy="50" r="6" fill="#fff" />
      </svg>
      <div className="mp-mono" style={{ color: "#8E8E93", fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div className="mp-dotline">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
    </div>
  );
}

function withTransition(setPage, target, setLoading) {
  setLoading(true);
  setTimeout(() => {
    setPage(target);
    setLoading(false);
    window.scrollTo(0, 0);
  }, 2000);
}

/* ---------------- Robot Visor Hero (cursor-tracking head) ---------------- */
function RobotHero({ onSignIn, onSignUp }) {
  const wrapRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [pupil, setPupil] = useState({ x: 0, y: 0 });

  const handleMove = useCallback((e) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height * 0.38;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;
    setTilt({ x: Math.max(-10, Math.min(10, dx * 18)), y: Math.max(-6, Math.min(6, dy * 14)) });
    setPupil({ x: Math.max(-6, Math.min(6, dx * 14)), y: Math.max(-4, Math.min(4, dy * 10)) });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [handleMove]);

  return (
    <div ref={wrapRef} style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }} className="mp-grid-bg">
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.06), transparent 60%)" }} />
      <div className="mp-scanline" />

      {/* Nav */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "26px 48px", position: "relative", zIndex: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, border: "1.5px solid #fff", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="mp-pulse-dot" />
          </div>
          <span className="mp-display" style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.01em" }}>MECHAPULSE</span>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <button className="mp-btn mp-btn-ghost" onClick={onSignIn}>Sign In</button>
          <button className="mp-btn mp-btn-primary" onClick={onSignUp}>Sign Up</button>
        </div>
      </nav>

      {/* Hero content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", padding: "20px 24px" }}>
        <div className="mp-mono mp-fadein" style={{ color: "#8E8E93", fontSize: 12, letterSpacing: ".2em", marginBottom: 18, textTransform: "uppercase" }}>
          UNIT: WALKER S2 &nbsp;•&nbsp; STATUS: ONLINE
        </div>

        {/* Robot head SVG, tracks cursor */}
        <div style={{ perspective: 900, marginBottom: 8 }}>
          <svg
            width="360" height="360" viewBox="0 0 360 360"
            style={{ transform: `rotateY(${tilt.x}deg) rotateX(${-tilt.y}deg)`, transition: "transform .08s linear", filter: "drop-shadow(0 30px 60px rgba(0,0,0,.6))" }}
          >
            {/* Neck/shoulders */}
            <path d="M110 300 Q180 270 250 300 L270 360 L90 360 Z" fill="#141416" stroke="#2A2A2E" strokeWidth="2" />
            <rect x="150" y="255" width="60" height="55" fill="#1C1C1F" stroke="#2A2A2E" strokeWidth="2" rx="6" />
            {/* Head shell */}
            <rect x="85" y="70" width="190" height="200" rx="46" fill="#101012" stroke="#3a3a3e" strokeWidth="2.5" />
            <rect x="85" y="70" width="190" height="200" rx="46" fill="none" stroke="#fff" strokeOpacity="0.05" strokeWidth="1" />
            {/* Ear modules */}
            <circle cx="88" cy="150" r="14" fill="#1C1C1F" stroke="#3a3a3e" strokeWidth="2" />
            <circle cx="272" cy="150" r="14" fill="#1C1C1F" stroke="#3a3a3e" strokeWidth="2" />
            {/* Visor */}
            <rect x="105" y="130" width="150" height="70" rx="18" fill="#000" stroke="#fff" strokeWidth="1.5" />
            {/* Eyes (pupils track cursor) */}
            <g style={{ transform: `translate(${pupil.x}px, ${pupil.y}px)`, transition: "transform .05s linear" }}>
              <rect x="128" y="153" width="34" height="10" rx="5" fill="#fff" className="mp-blink" />
              <rect x="198" y="153" width="34" height="10" rx="5" fill="#fff" className="mp-blink" />
            </g>
            {/* Face plate lines */}
            <line x1="180" y1="210" x2="180" y2="240" stroke="#3a3a3e" strokeWidth="2" />
            <circle cx="180" cy="225" r="3" fill="#fff" />
            {/* Top antenna/sensor strip */}
            <rect x="150" y="55" width="60" height="10" rx="5" fill="#1C1C1F" stroke="#3a3a3e" strokeWidth="1.5" />
            <circle cx="180" cy="45" r="6" fill="#fff" opacity="0.9" />
            {/* Side panel seams */}
            <line x1="85" y1="110" x2="275" y2="110" stroke="#2A2A2E" strokeWidth="1" />
            <line x1="85" y1="230" x2="275" y2="230" stroke="#2A2A2E" strokeWidth="1" />
          </svg>
        </div>

        <h1 className="mp-display mp-fadein" style={{ fontSize: "clamp(38px,6vw,72px)", fontWeight: 700, textAlign: "center", letterSpacing: "-.03em", lineHeight: 1.02, margin: "6px 0 14px" }}>
          MECHAPULSE
        </h1>
        <p className="mp-fadein" style={{ color: "#C7C7CC", fontSize: 18, letterSpacing: ".04em", marginBottom: 34 }}>
          An AI Robotics Company
        </p>
        <div style={{ display: "flex", gap: 14 }} className="mp-fadein">
          <button className="mp-btn mp-btn-primary" onClick={onSignUp}>
            Get Started <ArrowRight size={16} style={{ display: "inline", marginLeft: 8, verticalAlign: "-2px" }} />
          </button>
          <button className="mp-btn mp-btn-ghost" onClick={onSignIn}>Sign In</button>
        </div>

        <div className="mp-mono" style={{ position: "absolute", bottom: 18, color: "#4B4B4F", fontSize: 11, letterSpacing: ".15em" }}>
          MOVE CURSOR — HEAD TRACKS IN REAL TIME
        </div>
      </div>
    </div>
  );
}

/* ---------------- Landing showcase section (robots + AI tools) ---------------- */
const ROBOTS = [
  { name: "Walker S2", maker: "UBTech", price: "$95,000", trend: "+18%", desc: "Bipedal humanoid for industrial logistics & inspection.", grade: "A+" },
  { name: "Optimus Gen 3", maker: "Tesla", price: "$20,000", trend: "+42%", desc: "General-purpose humanoid for home and factory tasks.", grade: "A+" },
  { name: "Atlas HD", maker: "Boston Dynamics", price: "$150,000", trend: "+9%", desc: "Hydraulic humanoid built for dynamic mobility research.", grade: "A" },
  { name: "Digit v5", maker: "Agility Robotics", price: "$65,000", trend: "+21%", desc: "Warehouse-ready biped for pick-and-place operations.", grade: "A" },
  { name: "Figure 02", maker: "Figure AI", price: "$85,000", trend: "+31%", desc: "Vision-language humanoid for manufacturing lines.", grade: "A+" },
  { name: "H1", maker: "Unitree", price: "$18,500", trend: "+27%", desc: "Affordable full-size humanoid research platform.", grade: "B+" },
];

const AI_TOOLS = [
  { name: "Claude", maker: "Anthropic", price: "$20/mo", trend: "+24%", desc: "Reasoning-first assistant for coding, research & writing." },
  { name: "Gemini", maker: "Google DeepMind", price: "$19/mo", trend: "+19%", desc: "Multimodal assistant integrated across Google Workspace." },
  { name: "GPT-5", maker: "OpenAI", price: "$20/mo", trend: "+15%", desc: "General-purpose model with broad plugin ecosystem." },
];

function ShowcaseSection({ title, eyebrow, items, kind }) {
  return (
    <section style={{ padding: "80px 48px", borderTop: "1px solid #1C1C1F" }}>
      <div className="mp-mono" style={{ color: "#8E8E93", fontSize: 12, letterSpacing: ".2em", marginBottom: 10 }}>{eyebrow}</div>
      <h2 className="mp-display" style={{ fontSize: 34, fontWeight: 700, marginBottom: 36, letterSpacing: "-.01em" }}>{title}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 20 }}>
        {items.map((it, i) => (
          <div key={i} className="mp-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ width: 46, height: 46, border: "1px solid #2A2A2E", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {kind === "robot" ? <Bot size={22} /> : <Zap size={22} />}
              </div>
              <span className="mp-tag" style={{ color: "#fff", borderColor: "#fff" }}>{it.trend} <TrendingUp size={10} style={{ display: "inline", verticalAlign: "-1px" }} /></span>
            </div>
            <div className="mp-display" style={{ fontSize: 19, fontWeight: 700, marginBottom: 2 }}>{it.name}</div>
            <div className="mp-mono" style={{ fontSize: 11, color: "#8E8E93", marginBottom: 12, letterSpacing: ".04em" }}>{it.maker}</div>
            <p style={{ fontSize: 13.5, color: "#C7C7CC", lineHeight: 1.6, marginBottom: 18, minHeight: 42 }}>{it.desc}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #2A2A2E", paddingTop: 14 }}>
              <span className="mp-display" style={{ fontWeight: 700, fontSize: 16 }}>{it.price}</span>
              <span style={{ fontSize: 12.5, color: "#8E8E93", display: "flex", alignItems: "center", gap: 4 }}>Details <ChevronRight size={14} /></span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LandingPage({ setPage, setLoading }) {
  return (
    <div>
      <RobotHero
        onSignIn={() => withTransition(setPage, "signin", setLoading)}
        onSignUp={() => withTransition(setPage, "signup", setLoading)}
      />
      <ShowcaseSection eyebrow="// FEATURED HARDWARE" title="Trending Robots This Week" items={ROBOTS.slice(0, 6)} kind="robot" />
      <ShowcaseSection eyebrow="// AI SYSTEMS" title="Trending AI Tools" items={AI_TOOLS} kind="ai" />
      <footer style={{ padding: "40px 48px", borderTop: "1px solid #1C1C1F", display: "flex", justifyContent: "space-between", color: "#4B4B4F", fontSize: 12.5 }}>
        <span className="mp-mono">© 2026 MECHAPULSE — AI ROBOTICS</span>
        <span className="mp-mono">BUILD 2.6.0-STABLE</span>
      </footer>
    </div>
  );
}

/* ---------------- Password validation ---------------- */
function validatePassword(pw) {
  const errs = [];
  if (pw.length < 8) errs.push("At least 8 characters");
  if (pw.length > 16) errs.push("No more than 16 characters");
  if (!/[A-Z]/.test(pw)) errs.push("One uppercase letter");
  if (!/[a-z]/.test(pw)) errs.push("One lowercase letter");
  if (!/[0-9]/.test(pw)) errs.push("One number");
  if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(pw)) errs.push("One special character");
  return errs;
}

/* ---------------- Auth (Sign In / Sign Up) ---------------- */
function AuthPage({ mode, setPage, setLoading, onAuthed }) {
  const isSignUp = mode === "signup";
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const pwErrors = validatePassword(pw);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    const errs = {};
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid email address";
    if (pwErrors.length) errs.pw = "Password doesn't meet requirements";
    if (isSignUp && pw !== confirmPw) errs.confirm = "Passwords don't match";
    setErrors(errs);
    if (Object.keys(errs).length !== 0) return;

    setSubmitting(true);
    try {
      const data = isSignUp ? await api.register(email, pw) : await api.login(email, pw);
      localStorage.setItem("mp_token", data.token);
      onAuthed(data.user);
      withTransition(setPage, "dashboard", setLoading);
    } catch (err) {
      setErrors({ server: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOAuth = (provider) => {
    setErrors({ server: `${provider} sign-in needs a real OAuth app + live domain — not available in this preview.` });
  };

  return (
    <div className="mp-grid-bg" style={{ minHeight: "100vh", display: "flex" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 24, position: "relative" }}>
        <button onClick={() => withTransition(setPage, "landing", setLoading)} className="clickable" style={{ position: "absolute", top: 28, left: 32, background: "none", border: "none", color: "#8E8E93", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <ArrowLeft size={15} /> Back to home
        </button>

        <div style={{ width: "100%", maxWidth: 400 }} className="mp-fadein">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 34, justifyContent: "center" }}>
            <div style={{ width: 30, height: 30, border: "1.5px solid #fff", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div className="mp-pulse-dot" />
            </div>
            <span className="mp-display" style={{ fontSize: 19, fontWeight: 700 }}>MECHAPULSE</span>
          </div>

          <h1 className="mp-display" style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 6 }}>
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p style={{ textAlign: "center", color: "#8E8E93", fontSize: 13.5, marginBottom: 30 }}>
            {isSignUp ? "Join MechaPulse to track robots and AI tools." : "Sign in to access your dashboard."}
          </p>

          <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
            <button type="button" onClick={() => handleOAuth("Google")} className="mp-btn mp-btn-ghost" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#fff" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.6 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/></svg>
              Google
            </button>
            <button type="button" onClick={() => handleOAuth("Apple")} className="mp-btn mp-btn-ghost" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <svg width="15" height="15" viewBox="0 0 384 512" fill="#fff"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141 0 184.8 0 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 37.1 59 128 107.2 126.4 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-83.5 102.6-120.7-65.2-30.7-57.7-90-57.7-91.7zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
              Apple
            </button>
          </div>
          {errors.server && (
            <div className="mp-mono" style={{ background: "#1C1C1F", border: "1px solid #2A2A2E", padding: "10px 14px", borderRadius: 4, fontSize: 12, color: "#fff", marginBottom: 16, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} /> {errors.server}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0", color: "#4B4B4F", fontSize: 12 }}>
            <div style={{ flex: 1, height: 1, background: "#2A2A2E" }} /> OR <div style={{ flex: 1, height: 1, background: "#2A2A2E" }} />
          </div>

          <form onSubmit={handleSubmit}>
            <label className="mp-mono" style={{ fontSize: 11, color: "#8E8E93", letterSpacing: ".08em", textTransform: "uppercase" }}>Email</label>
            <div style={{ position: "relative", margin: "8px 0 4px" }}>
              <Mail size={16} style={{ position: "absolute", left: 14, top: 15, color: "#4B4B4F" }} />
              <input className="mp-input" style={{ paddingLeft: 40 }} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {touched && errors.email && <div style={{ color: "#fff", fontSize: 12, marginBottom: 8, display:'flex', alignItems:'center', gap:4 }}><AlertCircle size={12}/>{errors.email}</div>}

            <label className="mp-mono" style={{ fontSize: 11, color: "#8E8E93", letterSpacing: ".08em", textTransform: "uppercase" }}>Password</label>
            <div style={{ position: "relative", margin: "8px 0 4px" }}>
              <Lock size={16} style={{ position: "absolute", left: 14, top: 15, color: "#4B4B4F" }} />
              <input className="mp-input" style={{ paddingLeft: 40, paddingRight: 40 }} type={showPw ? "text" : "password"} placeholder="8–16 characters, strong" value={pw} onChange={(e) => setPw(e.target.value)} maxLength={16} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: 13, background: "none", border: "none", color: "#8E8E93" }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {isSignUp && pw.length > 0 && (
              <div style={{ margin: "8px 0 12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                {["At least 8 characters", "No more than 16 characters", "One uppercase letter", "One lowercase letter", "One number", "One special character"].map((rule) => (
                  <div key={rule} className="mp-mono" style={{ fontSize: 10.5, display: "flex", alignItems: "center", gap: 5, color: pwErrors.includes(rule) ? "#4B4B4F" : "#fff" }}>
                    {pwErrors.includes(rule) ? <X size={11} /> : <Check size={11} />} {rule}
                  </div>
                ))}
              </div>
            )}
            {touched && errors.pw && <div style={{ color: "#fff", fontSize: 12, marginBottom: 8 }}>{errors.pw}</div>}

            {isSignUp && (
              <>
                <label className="mp-mono" style={{ fontSize: 11, color: "#8E8E93", letterSpacing: ".08em", textTransform: "uppercase" }}>Confirm Password</label>
                <div style={{ position: "relative", margin: "8px 0 4px" }}>
                  <Lock size={16} style={{ position: "absolute", left: 14, top: 15, color: "#4B4B4F" }} />
                  <input className="mp-input" style={{ paddingLeft: 40 }} type={showPw ? "text" : "password"} placeholder="Re-enter password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} maxLength={16} />
                </div>
                {touched && errors.confirm && <div style={{ color: "#fff", fontSize: 12, marginBottom: 8 }}>{errors.confirm}</div>}
              </>
            )}

            <button type="submit" disabled={submitting} className="mp-btn mp-btn-primary" style={{ width: "100%", marginTop: 14, opacity: submitting ? 0.6 : 1 }}>
              {submitting ? "Please wait…" : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 13, color: "#8E8E93", marginTop: 22 }}>
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <span className="clickable" style={{ color: "#fff", fontWeight: 600 }} onClick={() => withTransition(setPage, isSignUp ? "signin" : "signup", setLoading)}>
              {isSignUp ? "Sign in" : "Sign up"}
            </span>
          </p>
        </div>
      </div>

      <div className="mp-hide-mobile" style={{ flex: 1, position: "relative", borderLeft: "1px solid #1C1C1F", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div className="mp-scanline" />
        <svg width="280" height="280" viewBox="0 0 360 360" style={{ opacity: 0.9 }}>
          <rect x="85" y="70" width="190" height="200" rx="46" fill="#101012" stroke="#3a3a3e" strokeWidth="2.5" />
          <rect x="105" y="130" width="150" height="70" rx="18" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <rect x="128" y="153" width="34" height="10" rx="5" fill="#fff" />
          <rect x="198" y="153" width="34" height="10" rx="5" fill="#fff" />
          <circle cx="88" cy="150" r="14" fill="#1C1C1F" stroke="#3a3a3e" strokeWidth="2" />
          <circle cx="272" cy="150" r="14" fill="#1C1C1F" stroke="#3a3a3e" strokeWidth="2" />
        </svg>
        <div className="mp-mono" style={{ position: "absolute", bottom: 40, color: "#4B4B4F", fontSize: 11, letterSpacing: ".15em" }}>WALKER S2 — SECURE AUTH NODE</div>
      </div>
    </div>
  );
}

/* ---------------- Dashboard Layout & Sidebar ---------------- */
function Sidebar({ active, setPage, setLoading, mobileOpen, setMobileOpen, onLogout }) {
  const items = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "aitools", label: "AI Tools", icon: Cpu },
    { key: "buy", label: "Buy Robots", icon: ShoppingCart },
    { key: "subscriptions", label: "Subscriptions", icon: CreditCard },
    { key: "today", label: "What's Today", icon: Newspaper },
    { key: "settings", label: "Settings", icon: Settings },
  ];
  return (
    <>
      {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 40 }} />}
      <aside style={{
        width: 240, background: "#0D0D0E", borderRight: "1px solid #1C1C1F", position: "fixed", top: 0, bottom: 0, left: 0,
        display: "flex", flexDirection: "column", zIndex: 50,
        transform: mobileOpen ? "translateX(0)" : undefined,
      }} className={mobileOpen ? "" : "mp-hide-mobile-sidebar"}>
        <div style={{ padding: "24px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #1C1C1F" }}>
          <div style={{ width: 28, height: 28, border: "1.5px solid #fff", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="mp-pulse-dot" />
          </div>
          <span className="mp-display" style={{ fontWeight: 700, fontSize: 16 }}>MECHAPULSE</span>
          <button className="mp-hide-mobile" onClick={() => setMobileOpen(false)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#8E8E93" }}><X size={18}/></button>
        </div>
        <nav style={{ flex: 1, padding: "14px 0" }}>
          {items.map((it) => (
            <div key={it.key} className={`mp-sidebar-item clickable ${active === it.key ? "active" : ""}`}
              onClick={() => { withTransition(setPage, it.key, setLoading); setMobileOpen(false); }}>
              <it.icon size={17} /> {it.label}
            </div>
          ))}
        </nav>
        <div className="mp-sidebar-item clickable" style={{ borderTop: "1px solid #1C1C1F" }} onClick={onLogout}>
          <LogOut size={17} /> Log Out
        </div>
      </aside>
    </>
  );
}

function TopBar({ title, setMobileOpen, user }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 32px", borderBottom: "1px solid #1C1C1F" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => setMobileOpen(true)} style={{ background: "none", border: "1px solid #2A2A2E", borderRadius: 6, padding: 8, color: "#fff" }}><Menu size={16} /></button>
        <h1 className="mp-display" style={{ fontSize: 21, fontWeight: 700 }}>{title}</h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="mp-mono" style={{ fontSize: 11, color: "#8E8E93" }}>{user.email}</div>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#1C1C1F", border: "1px solid #2A2A2E", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {user.avatar ? <img src={user.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={16} />}
        </div>
      </div>
    </div>
  );
}

function DashShell({ title, active, setPage, setLoading, mobileOpen, setMobileOpen, user, onLogout, children }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A" }}>
      <Sidebar active={active} setPage={setPage} setLoading={setLoading} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} onLogout={onLogout} />
      <div style={{ marginLeft: 240 }} className="mp-dash-main">
        <TopBar title={title} setMobileOpen={setMobileOpen} user={user} />
        <div style={{ padding: 32 }} className="mp-fadein">{children}</div>
      </div>
      <style>{`
        @media (max-width: 860px){
          aside{ transition: transform .25s ease; }
          .mp-dash-main{ margin-left:0 !important; }
        }
      `}</style>
    </div>
  );
}

/* ---------------- Dashboard (robot analytics) ---------------- */
const trendData = [
  { m: "Jan", walker: 40, optimus: 30, atlas: 50, digit: 20 },
  { m: "Feb", walker: 52, optimus: 45, atlas: 48, digit: 28 },
  { m: "Mar", walker: 58, optimus: 60, atlas: 47, digit: 35 },
  { m: "Apr", walker: 70, optimus: 72, atlas: 50, digit: 40 },
  { m: "May", walker: 82, optimus: 88, atlas: 53, digit: 46 },
  { m: "Jun", walker: 95, optimus: 100, atlas: 55, digit: 52 },
];

const priceCompare = ROBOTS.map(r => ({ name: r.name.split(" ")[0], price: parseInt(r.price.replace(/[$,]/g, "")) }));

function StatCard({ label, value, delta, up = true }) {
  return (
    <div className="mp-card" style={{ padding: 20 }}>
      <div className="mp-mono" style={{ fontSize: 11, color: "#8E8E93", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 10 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <div className="mp-display" style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
        <div style={{ fontSize: 12.5, color: up ? "#fff" : "#8E8E93", display: "flex", alignItems: "center", gap: 3 }}>
          {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {delta}
        </div>
      </div>
    </div>
  );
}

function Dashboard(props) {
  const [robots, setRobots] = useState(ROBOTS);
  const [trend, setTrend] = useState(trendData);

  useEffect(() => {
    api.robots().then((d) => setRobots(d.robots)).catch(() => {});
    api.robotsTrend().then((d) => setTrend(d.series)).catch(() => {});
  }, []);

  const livePriceCompare = robots.map((r) => ({ name: r.name.split(" ")[0], price: typeof r.price === "number" ? r.price : parseInt(String(r.price).replace(/[$,]/g, "")) }));

  return (
    <DashShell title="Dashboard" active="dashboard" {...props}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 18, marginBottom: 28 }}>
        <StatCard label="Trending Unit" value="Walker S2" delta="+18% this month" />
        <StatCard label="Avg. Market Price" value="$72.2K" delta="+4.1%" />
        <StatCard label="Units Tracked" value="24" delta="+3 new" />
        <StatCard label="Active AI Tools" value="9" delta="+2 new" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, marginBottom: 18 }} className="mp-dash-grid">
        <div className="mp-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div className="mp-display" style={{ fontWeight: 700, fontSize: 17 }}>Popularity Trend by Unit</div>
              <div className="mp-mono" style={{ fontSize: 11, color: "#8E8E93" }}>Search & interest index, last 6 months</div>
            </div>
            <span className="mp-tag">LIVE</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trend}>
              <CartesianGrid stroke="#1C1C1F" vertical={false} />
              <XAxis dataKey="m" stroke="#4B4B4F" fontSize={11} tickLine={false} axisLine={{ stroke: "#2A2A2E" }} />
              <YAxis stroke="#4B4B4F" fontSize={11} tickLine={false} axisLine={{ stroke: "#2A2A2E" }} />
              <Tooltip contentStyle={{ background: "#141416", border: "1px solid #2A2A2E", borderRadius: 4, fontSize: 12 }} />
              <Line type="monotone" dataKey="walker" name="Walker S2" stroke="#fff" strokeWidth={2.4} dot={false} />
              <Line type="monotone" dataKey="optimus" name="Optimus" stroke="#8E8E93" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="atlas" name="Atlas HD" stroke="#4B4B4F" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="digit" name="Digit v5" stroke="#2A2A2E" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mp-card" style={{ padding: 24 }}>
          <div className="mp-display" style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Walker S2 Capabilities</div>
          <div className="mp-mono" style={{ fontSize: 11, color: "#8E8E93", marginBottom: 8 }}>Functionality radar</div>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={[
              { subject: "Mobility", A: 92 }, { subject: "Dexterity", A: 85 },
              { subject: "AI Vision", A: 90 }, { subject: "Battery", A: 78 },
              { subject: "Payload", A: 88 }, { subject: "Safety", A: 95 },
            ]}>
              <PolarGrid stroke="#2A2A2E" />
              <PolarAngleAxis dataKey="subject" stroke="#8E8E93" fontSize={11} />
              <Radar dataKey="A" stroke="#fff" fill="#fff" fillOpacity={0.15} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mp-card" style={{ padding: 24, marginBottom: 18 }}>
        <div className="mp-display" style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Price Comparison Across Units</div>
        <div className="mp-mono" style={{ fontSize: 11, color: "#8E8E93", marginBottom: 14 }}>USD, base configuration</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={livePriceCompare}>
            <CartesianGrid stroke="#1C1C1F" vertical={false} />
            <XAxis dataKey="name" stroke="#4B4B4F" fontSize={11} tickLine={false} axisLine={{ stroke: "#2A2A2E" }} />
            <YAxis stroke="#4B4B4F" fontSize={11} tickLine={false} axisLine={{ stroke: "#2A2A2E" }} />
            <Tooltip contentStyle={{ background: "#141416", border: "1px solid #2A2A2E", borderRadius: 4, fontSize: 12 }} />
            <Bar dataKey="price" fill="#fff" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mp-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #1C1C1F", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="mp-display" style={{ fontWeight: 700, fontSize: 17 }}>Robot Directory</div>
          <span className="mp-tag">{robots.length} UNITS</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 640 }}>
            <thead>
              <tr className="mp-mono" style={{ color: "#8E8E93", fontSize: 11, textTransform: "uppercase", textAlign: "left" }}>
                <th style={{ padding: "12px 24px" }}>Unit</th><th>Maker</th><th>Price</th><th>Trend</th><th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {robots.map((r, i) => (
                <tr key={i} style={{ borderTop: "1px solid #1C1C1F" }}>
                  <td style={{ padding: "14px 24px", fontWeight: 600 }}>{r.name}</td>
                  <td style={{ color: "#C7C7CC" }}>{r.maker}</td>
                  <td className="mp-mono">{typeof r.price === "number" ? `$${r.price.toLocaleString()}` : r.price}</td>
                  <td style={{ color: "#fff" }}>+{r.trend}%</td>
                  <td><span className="mp-tag">{r.grade}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashShell>
  );
}

/* ---------------- AI Tools Analytics ---------------- */
const aiTrend = [
  { m: "Jan", claude: 55, gemini: 40, gpt: 70 },
  { m: "Feb", claude: 62, gemini: 48, gpt: 72 },
  { m: "Mar", claude: 70, gemini: 55, gpt: 75 },
  { m: "Apr", claude: 80, gemini: 63, gpt: 78 },
  { m: "May", claude: 90, gemini: 72, gpt: 82 },
  { m: "Jun", claude: 100, gemini: 80, gpt: 85 },
];
const aiShare = [
  { name: "Claude", value: 34 }, { name: "GPT-5", value: 38 }, { name: "Gemini", value: 28 },
];
const AI_COLORS = ["#fff", "#8E8E93", "#4B4B4F"];

function AiToolsPage(props) {
  const [tools, setTools] = useState(AI_TOOLS);
  const [trend, setTrend] = useState(aiTrend);

  useEffect(() => {
    api.aiTools().then((d) => setTools(d.tools)).catch(() => {});
    api.aiTrend().then((d) => setTrend(d.series)).catch(() => {});
  }, []);

  return (
    <DashShell title="AI Tools" active="aitools" {...props}>
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, marginBottom: 18 }} className="mp-dash-grid">
        <div className="mp-card" style={{ padding: 24 }}>
          <div className="mp-display" style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Adoption Trend</div>
          <div className="mp-mono" style={{ fontSize: 11, color: "#8E8E93", marginBottom: 14 }}>Relative usage index, last 6 months</div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="claudeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fff" stopOpacity={0.35} /><stop offset="100%" stopColor="#fff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1C1C1F" vertical={false} />
              <XAxis dataKey="m" stroke="#4B4B4F" fontSize={11} tickLine={false} axisLine={{ stroke: "#2A2A2E" }} />
              <YAxis stroke="#4B4B4F" fontSize={11} tickLine={false} axisLine={{ stroke: "#2A2A2E" }} />
              <Tooltip contentStyle={{ background: "#141416", border: "1px solid #2A2A2E", borderRadius: 4, fontSize: 12 }} />
              <Area type="monotone" dataKey="claude" name="Claude" stroke="#fff" fill="url(#claudeGrad)" strokeWidth={2.4} />
              <Line type="monotone" dataKey="gpt" name="GPT-5" stroke="#8E8E93" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="gemini" name="Gemini" stroke="#4B4B4F" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mp-card" style={{ padding: 24 }}>
          <div className="mp-display" style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Market Share</div>
          <div className="mp-mono" style={{ fontSize: 11, color: "#8E8E93", marginBottom: 8 }}>By active subscriptions</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={aiShare} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {aiShare.map((_, i) => <Cell key={i} fill={AI_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#141416", border: "1px solid #2A2A2E", borderRadius: 4, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 6 }}>
            {aiShare.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: AI_COLORS[i] }} /> {s.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
        {tools.map((tool, i) => (
          <div key={i} className="mp-card" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div className="mp-display" style={{ fontWeight: 700, fontSize: 17 }}>{tool.name}</div>
              <span className="mp-tag">{tool.trend}</span>
            </div>
            <div className="mp-mono" style={{ fontSize: 11, color: "#8E8E93", marginBottom: 10 }}>{tool.maker}</div>
            <p style={{ fontSize: 13, color: "#C7C7CC", marginBottom: 16, lineHeight: 1.6 }}>{tool.desc}</p>
            <ResponsiveContainer width="100%" height={70}>
              <LineChart data={trend}>
                <Line type="monotone" dataKey={tool.name === "Claude" ? "claude" : tool.name === "Gemini" ? "gemini" : "gpt"} stroke="#fff" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #2A2A2E", paddingTop: 12, marginTop: 8 }}>
              <span className="mp-display" style={{ fontWeight: 700 }}>{tool.price}</span>
              <span style={{ fontSize: 12.5, color: "#8E8E93" }}>View subscription →</span>
            </div>
          </div>
        ))}
      </div>
    </DashShell>
  );
}

/* ---------------- Settings ---------------- */
function SettingsPage(props) {
  const { user, setUser } = props;
  const [prevPw, setPrevPw] = useState("");
  const [newEmail, setNewEmail] = useState(user.email);
  const [newPw, setNewPw] = useState("");
  const [msg, setMsg] = useState("");
  const [msgIsError, setMsgIsError] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { avatarUrl } = await api.uploadAvatar(file);
      setUser((u) => ({ ...u, avatar: api.fileUrl(avatarUrl) }));
      setMsg("Profile photo updated."); setMsgIsError(false);
    } catch (err) {
      setMsg(err.message); setMsgIsError(true);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!prevPw) { setMsg("Enter your current password to confirm changes."); setMsgIsError(true); return; }
    if (newPw) {
      const errs = validatePassword(newPw);
      if (errs.length) { setMsg("New password doesn't meet the strength requirements."); setMsgIsError(true); return; }
    }
    setSaving(true);
    try {
      const { user: updated } = await api.updateAccount({ currentPassword: prevPw, newEmail, newPassword: newPw || undefined });
      setUser((u) => ({ ...u, email: updated.email }));
      setMsg("Account details updated successfully."); setMsgIsError(false);
      setPrevPw(""); setNewPw("");
    } catch (err) {
      setMsg(err.message); setMsgIsError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashShell title="Settings" active="settings" {...props}>
      <div style={{ maxWidth: 560 }}>
        <div className="mp-card" style={{ padding: 28, marginBottom: 20 }}>
          <div className="mp-display" style={{ fontWeight: 700, fontSize: 17, marginBottom: 18 }}>Profile Photo</div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 74, height: 74, borderRadius: "50%", background: "#1C1C1F", border: "1px solid #2A2A2E", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {user.avatar ? <img src={user.avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="avatar"/> : <User size={30} />}
            </div>
            <div>
              <button className="mp-btn mp-btn-ghost" onClick={() => fileRef.current.click()} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Camera size={15} /> Upload new photo
              </button>
              <input type="file" accept="image/*" ref={fileRef} onChange={handleUpload} style={{ display: "none" }} />
            </div>
          </div>
        </div>

        <div className="mp-card" style={{ padding: 28 }}>
          <div className="mp-display" style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Account Details</div>
          <p style={{ fontSize: 12.5, color: "#8E8E93", marginBottom: 20 }}>Confirm your current password to update your email or password.</p>
          <form onSubmit={handleSave}>
            <label className="mp-mono" style={{ fontSize: 11, color: "#8E8E93" }}>CURRENT PASSWORD</label>
            <input className="mp-input" style={{ margin: "8px 0 16px" }} type="password" placeholder="Required to confirm changes" value={prevPw} onChange={(e) => setPrevPw(e.target.value)} />

            <label className="mp-mono" style={{ fontSize: 11, color: "#8E8E93" }}>EMAIL ADDRESS</label>
            <input className="mp-input" style={{ margin: "8px 0 16px" }} type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />

            <label className="mp-mono" style={{ fontSize: 11, color: "#8E8E93" }}>NEW PASSWORD (optional, 8–16 chars, strong)</label>
            <input className="mp-input" style={{ margin: "8px 0 16px" }} type="password" maxLength={16} placeholder="Leave blank to keep current" value={newPw} onChange={(e) => setNewPw(e.target.value)} />

            <button type="submit" disabled={saving} className="mp-btn mp-btn-primary" style={{ opacity: saving ? 0.6 : 1 }}>{saving ? "Saving…" : "Save Changes"}</button>
            {msg && <div className="mp-mono" style={{ marginTop: 14, fontSize: 12.5, color: msgIsError ? "#fff" : "#8E8E93", border: "1px solid #2A2A2E", background: "#141416", padding: "8px 12px", borderRadius: 4 }}>{msg}</div>}
          </form>
        </div>
      </div>
    </DashShell>
  );
}

/* ---------------- Buy Robots ---------------- */
const MARKETPLACES = ["Amazon", "Daraz", "AliBaba"];
function BuyPage(props) {
  const [robots, setRobots] = useState(ROBOTS);
  const [orderMsg, setOrderMsg] = useState("");

  useEffect(() => { api.robots().then((d) => setRobots(d.robots)).catch(() => {}); }, []);

  const handleBuy = async (robot, marketplace) => {
    setOrderMsg("");
    try {
      const { redirectUrl } = await api.placeOrder(robot.name, marketplace, `$${robot.price?.toLocaleString?.() ?? robot.price}`);
      setOrderMsg(`Order recorded — opening ${marketplace} for ${robot.name}.`);
      if (redirectUrl) window.open(redirectUrl, "_blank", "noopener");
    } catch (err) {
      setOrderMsg(err.message);
    }
  };

  return (
    <DashShell title="Buy a Robot" active="buy" {...props}>
      <p style={{ color: "#8E8E93", fontSize: 13.5, marginBottom: 12, maxWidth: 620 }}>
        Compare humanoid and industrial robots, then complete your purchase through a trusted marketplace partner.
      </p>
      {orderMsg && <div className="mp-mono" style={{ fontSize: 12, color: "#fff", background: "#141416", border: "1px solid #2A2A2E", padding: "10px 14px", borderRadius: 4, marginBottom: 20, maxWidth: 620 }}>{orderMsg}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
        {robots.map((r, i) => (
          <div key={i} className="mp-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ height: 160, background: "#101012", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #1C1C1F" }}>
              <svg width="100" height="100" viewBox="0 0 360 360">
                <rect x="85" y="70" width="190" height="200" rx="46" fill="#1C1C1F" stroke="#3a3a3e" strokeWidth="2.5" />
                <rect x="105" y="130" width="150" height="70" rx="18" fill="#000" stroke="#fff" strokeWidth="1.5" />
                <rect x="128" y="153" width="34" height="10" rx="5" fill="#fff" />
                <rect x="198" y="153" width="34" height="10" rx="5" fill="#fff" />
              </svg>
            </div>
            <div style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div className="mp-display" style={{ fontWeight: 700, fontSize: 17 }}>{r.name}</div>
                <span className="mp-tag">{r.grade}</span>
              </div>
              <div className="mp-mono" style={{ fontSize: 11, color: "#8E8E93", margin: "4px 0 10px" }}>{r.maker}</div>
              <p style={{ fontSize: 13, color: "#C7C7CC", marginBottom: 14, lineHeight: 1.55 }}>{r.desc}</p>
              <div className="mp-display" style={{ fontWeight: 700, fontSize: 20, marginBottom: 14 }}>
                {typeof r.price === "number" ? `$${r.price.toLocaleString()}` : r.price}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {MARKETPLACES.map((mk) => (
                  <button key={mk} onClick={() => handleBuy(r, mk)} className="mp-btn mp-btn-ghost" style={{ fontSize: 12, padding: "9px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                    {mk} <ExternalLink size={12} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashShell>
  );
}

/* ---------------- Subscriptions ---------------- */
const SUBS = [
  { name: "Claude", plan: "Pro", price: "$20/mo", perks: ["Extended reasoning", "Priority access", "Larger context window"] },
  { name: "Gemini", plan: "Advanced", price: "$19/mo", perks: ["Workspace integration", "2M token context", "Multimodal input"] },
  { name: "GPT-5", plan: "Plus", price: "$20/mo", perks: ["Plugin ecosystem", "Voice mode", "Custom GPTs"] },
];
function SubscriptionsPage(props) {
  const [mySubs, setMySubs] = useState([]);
  const [msg, setMsg] = useState("");

  const refresh = () => api.mySubscriptions().then((d) => setMySubs(d.subscriptions)).catch(() => {});
  useEffect(() => { refresh(); }, []);

  const isSubbed = (name) => mySubs.some((s) => s.toolName === name);

  const handleToggle = async (s) => {
    try {
      if (isSubbed(s.name)) {
        await api.unsubscribe(s.name);
        setMsg(`Unsubscribed from ${s.name}.`);
      } else {
        await api.subscribe(s.name, s.plan);
        setMsg(`Subscribed to ${s.name} ${s.plan} — ${s.price}.`);
      }
      refresh();
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <DashShell title="AI Subscriptions" active="subscriptions" {...props}>
      <p style={{ color: "#8E8E93", fontSize: 13.5, marginBottom: 12, maxWidth: 620 }}>
        Manage or start subscriptions to leading AI tools directly from MechaPulse. This creates a real subscription record tied to your account.
      </p>
      {msg && <div className="mp-mono" style={{ fontSize: 12, color: "#fff", background: "#141416", border: "1px solid #2A2A2E", padding: "10px 14px", borderRadius: 4, marginBottom: 20, maxWidth: 620 }}>{msg}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
        {SUBS.map((s, i) => {
          const subbed = isSubbed(s.name);
          return (
            <div key={i} className="mp-card" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div className="mp-display" style={{ fontWeight: 700, fontSize: 18 }}>{s.name}</div>
                <Star size={16} />
              </div>
              <div className="mp-mono" style={{ fontSize: 11, color: "#8E8E93", marginBottom: 16 }}>{s.plan} PLAN{subbed ? " — ACTIVE" : ""}</div>
              <div style={{ marginBottom: 18 }}>
                {s.perks.map((p, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#C7C7CC", marginBottom: 8 }}>
                    <Check size={13} /> {p}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #2A2A2E", paddingTop: 16 }}>
                <span className="mp-display" style={{ fontWeight: 700, fontSize: 18 }}>{s.price}</span>
                <button onClick={() => handleToggle(s)} className={subbed ? "mp-btn mp-btn-ghost" : "mp-btn mp-btn-primary"} style={{ fontSize: 13, padding: "9px 18px" }}>
                  {subbed ? "Unsubscribe" : "Subscribe"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </DashShell>
  );
}

/* ---------------- What's Today (articles) ---------------- */
const ARTICLES = [
  { title: "Humanoid Robots Cross the Cost Threshold", tag: "ANALYSIS", excerpt: "Unit prices for general-purpose humanoids have fallen sharply as battery and actuator costs drop, putting robots within reach of mid-size warehouses for the first time.", read: "6 min" },
  { title: "Claude 4.8 Adoption Surges in Enterprise Coding", tag: "AI TOOLS", excerpt: "Engineering teams report faster review cycles after adopting agentic coding assistants, with reasoning-first models pulling ahead in complex refactors.", read: "4 min" },
  { title: "Walker S2 Now Handles Two-Handed Assembly", tag: "ROBOTICS", excerpt: "A firmware update gives Walker S2 finer bimanual coordination, closing the gap with hydraulic platforms on delicate assembly tasks.", read: "5 min" },
];
const readerData = [
  { d: "Mon", reads: 320 }, { d: "Tue", reads: 410 }, { d: "Wed", reads: 380 },
  { d: "Thu", reads: 460 }, { d: "Fri", reads: 520 }, { d: "Sat", reads: 610 }, { d: "Sun", reads: 590 },
];

function TodayPage(props) {
  const [articles, setArticles] = useState(ARTICLES);
  const [reader, setReader] = useState(readerData);
  const [readTitles, setReadTitles] = useState([]);

  const loadReaderStats = () => api.readerInterest().then((d) => setReader(d.series)).catch(() => {});
  useEffect(() => {
    api.articles().then((d) => setArticles(d.articles)).catch(() => {});
    loadReaderStats();
  }, []);

  const handleReadMore = async (title) => {
    try {
      await api.markRead(title);
      setReadTitles((t) => [...t, title]);
      loadReaderStats();
    } catch { /* not logged in edge case, ignore */ }
  };

  return (
    <DashShell title="What's Today" active="today" {...props}>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24 }} className="mp-dash-grid">
        <div>
          {articles.map((a, i) => (
            <div key={i} className="mp-card" style={{ padding: 24, marginBottom: 18 }}>
              <span className="mp-tag">{a.tag}</span>
              <div className="mp-display" style={{ fontWeight: 700, fontSize: 19, margin: "12px 0 8px" }}>{a.title}</div>
              <p style={{ fontSize: 13.5, color: "#C7C7CC", lineHeight: 1.65, marginBottom: 14 }}>{a.excerpt}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="mp-mono" style={{ fontSize: 11, color: "#8E8E93" }}>{a.read} read</span>
                <span className="clickable" onClick={() => handleReadMore(a.title)} style={{ fontSize: 12.5, display: "flex", alignItems: "center", gap: 4, color: readTitles.includes(a.title) ? "#8E8E93" : "#fff" }}>
                  {readTitles.includes(a.title) ? "Marked as read" : "Read more"} <ChevronRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div className="mp-card" style={{ padding: 22, marginBottom: 18 }}>
            <div className="mp-display" style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Weekly Reader Interest</div>
            <div className="mp-mono" style={{ fontSize: 11, color: "#8E8E93", marginBottom: 10 }}>Article engagement — updates as you read</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={reader}>
                <XAxis dataKey="d" stroke="#4B4B4F" fontSize={10} tickLine={false} axisLine={{ stroke: "#2A2A2E" }} />
                <Tooltip contentStyle={{ background: "#141416", border: "1px solid #2A2A2E", borderRadius: 4, fontSize: 12 }} />
                <Bar dataKey="reads" fill="#fff" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mp-card" style={{ padding: 22 }}>
            <div className="mp-display" style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Recommended For You</div>
            {["Optimus Gen 3 spec sheet", "Gemini vs Claude: coding benchmark", "Figure 02 factory pilot results"].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: i > 0 ? "1px solid #1C1C1F" : "none", fontSize: 13 }}>
                {r} <ChevronRight size={14} color="#8E8E93" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashShell>
  );
}

/* ---------------- Root App ---------------- */
export default function MechaPulseApp() {
  const [page, setPage] = useState("landing");
  const [loading, setLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState({ email: "", avatar: null });
  const [checkingSession, setCheckingSession] = useState(true);

  // On load: if a token exists, validate it against the real backend and
  // restore the session instead of forcing a re-login every refresh.
  useEffect(() => {
    const token = localStorage.getItem("mp_token");
    if (!token) { setCheckingSession(false); return; }
    api.me()
      .then(({ user: u }) => {
        setUser({ email: u.email, avatar: api.fileUrl(u.avatarUrl) });
        setAuthed(true);
        setPage((p) => (p === "landing" ? "dashboard" : p));
      })
      .catch(() => localStorage.removeItem("mp_token"))
      .finally(() => setCheckingSession(false));
  }, []);

  const handleAuthed = (u) => {
    setUser({ email: u.email, avatar: api.fileUrl(u.avatarUrl) });
    setAuthed(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("mp_token");
    setAuthed(false);
    setUser({ email: "", avatar: null });
    withTransition(setPage, "landing", setLoading);
  };

  const dashProps = { setPage, setLoading, mobileOpen, setMobileOpen, user, setUser, onLogout: handleLogout };

  if (checkingSession) return <div className="mp-root"><GlobalStyle /><HexLoader label="Restoring session" /></div>;

  let content;
  if (page === "landing") content = <LandingPage setPage={setPage} setLoading={setLoading} />;
  else if (page === "signin" || page === "signup") content = <AuthPage mode={page} setPage={setPage} setLoading={setLoading} onAuthed={handleAuthed} />;
  else if (!authed) content = <AuthPage mode="signin" setPage={setPage} setLoading={setLoading} onAuthed={handleAuthed} />;
  else if (page === "dashboard") content = <Dashboard {...dashProps} />;
  else if (page === "aitools") content = <AiToolsPage {...dashProps} />;
  else if (page === "settings") content = <SettingsPage {...dashProps} />;
  else if (page === "buy") content = <BuyPage {...dashProps} />;
  else if (page === "subscriptions") content = <SubscriptionsPage {...dashProps} />;
  else if (page === "today") content = <TodayPage {...dashProps} />;
  else content = <LandingPage setPage={setPage} setLoading={setLoading} />;

  return (
    <div className="mp-root">
      <GlobalStyle />
      <CustomCursor />
      {loading && <HexLoader label={`Loading ${page}`} />}
      {!loading && content}
    </div>
  );
}
