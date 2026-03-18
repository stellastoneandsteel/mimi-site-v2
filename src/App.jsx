import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// Design lock
const BG = "#A5A2A2";
const FOREST = "#4C5A42";
const LIME = "#32CD32";
const BLACK = "#000";
const DARK = "#1a1a1a";
const BORDER = `2px solid ${BLACK}`;
const FONT_HEAD = "'Press Start 2P', monospace";
const FONT_BODY = "Inconsolata, monospace";
const FS_HEAD = 13;
const FS_BODY = 15;

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "https://usemimiai.com";
const A = (f) => `/assets/mimi-pixel-fal/${f}`;

const MAC_REPLIES = [
  "I've been waiting for a business like yours.",
  "Tell me more. What's your biggest bottleneck?",
  "I can handle that. What else keeps you up at night?",
  "Good. I was built for exactly this.",
  "Your competitors don't have me. Yet.",
];

const BOOT_LINES = [
  "// Incoming transmission...",
  "// Source: Unknown",
  "// Coordinates: 1993 → 2026",
  "// Package identified: MIMI_AI.exe",
  "// Initializing...",
  "System status: ONLINE",
  "Most people wait until the pain is unbearable. The ones who move now are the ones still standing in a year.",
];

const IMG_BASE = { imageRendering: "pixelated", mixBlendMode: "screen", border: "none", outline: "none", background: "transparent" };

// ——— CrtPong ———
function CrtPong() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const gameRef = useRef({ ballX: 200, ballY: 140, vx: 3.2, vy: 2.1, leftY: 100, rightY: 100, scoreL: 0, scoreR: 0, w: 400, h: 280 });
  const keys = useRef({ w: false, s: false, u: false, d: false });

  useEffect(() => {
    const onDown = (e) => {
      if (e.key === "w" || e.key === "W") keys.current.w = true;
      if (e.key === "s" || e.key === "S") keys.current.s = true;
      if (e.key === "ArrowUp") { keys.current.u = true; e.preventDefault(); }
      if (e.key === "ArrowDown") { keys.current.d = true; e.preventDefault(); }
    };
    const onUp = (e) => {
      if (e.key === "w" || e.key === "W") keys.current.w = false;
      if (e.key === "s" || e.key === "S") keys.current.s = false;
      if (e.key === "ArrowUp") keys.current.u = false;
      if (e.key === "ArrowDown") keys.current.d = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const g = gameRef.current;
    let id = 0;
    let running = true;
    const maxV = 9;
    const step = () => {
      if (!running) return;
      const el = wrapRef.current;
      if (el) {
        const nw = Math.max(200, Math.floor(el.clientWidth));
        const nh = Math.max(160, Math.floor(el.clientHeight));
        if (nw !== g.w || nh !== g.h) {
          g.w = nw;
          g.h = nh;
          canvas.width = nw;
          canvas.height = nh;
        }
      }
      const w = g.w, h = g.h;
      const ph = Math.max(36, Math.min(88, h * 0.24));
      const pw = Math.max(6, Math.floor(w * 0.02));
      const br = Math.max(3, Math.floor(w * 0.015));

      if (keys.current.w) g.leftY = Math.max(0, g.leftY - 5);
      if (keys.current.s) g.leftY = Math.min(h - ph, g.leftY + 5);
      if (keys.current.u) g.rightY = Math.max(0, g.rightY - 5);
      if (keys.current.d) g.rightY = Math.min(h - ph, g.rightY + 5);

      g.ballX += g.vx;
      g.ballY += g.vy;
      if (g.ballY <= br) { g.ballY = br; g.vy = Math.abs(g.vy); }
      if (g.ballY >= h - br) { g.ballY = h - br; g.vy = -Math.abs(g.vy); }

      const lx = 10, rx = w - 10 - pw;
      if (g.vx < 0 && g.ballX - br <= lx + pw) {
        if (g.ballY + br > g.leftY && g.ballY - br < g.leftY + ph) {
          g.vx = Math.min(maxV, Math.abs(g.vx) * 1.03 + 0.2);
          g.ballX = lx + pw + br + 1;
        }
      }
      if (g.vx < 0 && g.ballX < -br) {
        g.scoreR += 1;
        g.ballX = w / 2; g.ballY = h / 2;
        g.vx = 3; g.vy = 2.2 * (Math.random() > 0.5 ? 1 : -1);
      }
      if (g.vx > 0 && g.ballX + br >= rx) {
        if (g.ballY + br > g.rightY && g.ballY - br < g.rightY + ph) {
          g.vx = -Math.min(maxV, Math.abs(g.vx) * 1.03 + 0.2);
          g.ballX = rx - br - 1;
        }
      }
      if (g.vx > 0 && g.ballX > w + br) {
        g.scoreL += 1;
        g.ballX = w / 2; g.ballY = h / 2;
        g.vx = -3; g.vy = 2.2 * (Math.random() > 0.5 ? 1 : -1);
      }

      ctx.fillStyle = BLACK;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = LIME;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = LIME;
      ctx.font = `${Math.max(FS_HEAD, Math.floor(w * 0.055))}px ${FONT_HEAD}`;
      ctx.fillText(String(g.scoreL), Math.floor(w * 0.2), Math.floor(h * 0.14));
      ctx.fillText(String(g.scoreR), Math.floor(w * 0.68), Math.floor(h * 0.14));
      ctx.fillRect(lx, g.leftY, pw, ph);
      ctx.fillRect(rx, g.rightY, pw, ph);
      ctx.beginPath();
      ctx.arc(g.ballX, g.ballY, br, 0, Math.PI * 2);
      ctx.fill();
      id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => { running = false; cancelAnimationFrame(id); };
  }, []);

  return (
    <div ref={wrapRef} className="crt-pong-scan scanlines" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: BLACK }}>
      <canvas ref={canvasRef} width={400} height={280} style={{ display: "block", width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", bottom: 4, left: 0, right: 0, textAlign: "center", fontSize: FS_BODY, color: LIME, fontFamily: FONT_BODY, pointerEvents: "none", zIndex: 12 }}>
        W/S left paddle · UP/DOWN right paddle
      </div>
    </div>
  );
}

// ——— PixelImg ———
function PixelImg({ file, alt = "", style = {} }) {
  const [bad, setBad] = useState(false);
  const src = A(file);
  if (bad)
    return (
      <div style={{ ...IMG_BASE, minHeight: 120, color: LIME, fontFamily: FONT_BODY, fontSize: FS_BODY, padding: 12, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        {file}
      </div>
    );
  return <img src={src} alt={alt || file} style={{ ...IMG_BASE, ...style }} onError={() => setBad(true)} />;
}

// ——— HeroStarField ———
function HeroStarField() {
  const stars = useMemo(
    () =>
      Array.from({ length: 64 }, (_, i) => ({
        id: i,
        left: (i * 37 + (i % 7) * 13) % 94 + 3,
        top: (i * 53 + (i % 11) * 17) % 88 + 4,
        dur: 2.4 + (i % 5) * 0.85 + (i % 3) * 0.4,
        delay: (i % 8) * 0.55 + (i % 4) * 0.3,
        variant: i % 3,
      })),
    []
  );
  return (
    <>
      <div className="scanlines" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {stars.map((s) => (
          <span
            key={s.id}
            style={{
              position: "absolute",
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: 2,
              height: 2,
              background: LIME,
              borderRadius: 0,
              animation: `hero-star-${s.variant} ${s.dur}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes hero-star-0 { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
        @keyframes hero-star-1 { 0%, 100% { opacity: 0.35; } 40% { opacity: 0.9; } 70% { opacity: 0.25; } }
        @keyframes hero-star-2 { 0%, 100% { opacity: 0.15; } 55% { opacity: 1; } }
      `}</style>
    </>
  );
}

// ——— BootSequence ———
function BootSequence() {
  const [text, setText] = useState("");
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  useEffect(() => {
    if (lineIdx >= BOOT_LINES.length) return;
    const line = BOOT_LINES[lineIdx];
    if (charIdx < line.length) {
      const t = setTimeout(() => { setText((p) => p + line[charIdx]); setCharIdx((c) => c + 1); }, 28);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => { setText((p) => p + "\n"); setLineIdx((i) => i + 1); setCharIdx(0); }, 200);
    return () => clearTimeout(t);
  }, [lineIdx, charIdx]);
  return (
    <section className="section-border scanlines" style={{ background: DARK, padding: "24px 20px", minHeight: 200, fontFamily: FONT_BODY, fontSize: FS_BODY, color: LIME, whiteSpace: "pre-wrap", borderBottom: BORDER }}>
      {text}
      <span className="boot-cursor">_</span>
      <style>{`@keyframes blink { 50% { opacity: 0; } } .boot-cursor { animation: blink 1s step-end infinite; }`}</style>
    </section>
  );
}

// ——— useChatBot ———
function useChatBot(replies) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const turn = useRef(0);
  const send = useCallback(() => {
    const q = input.trim();
    if (!q) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    const reply = replies[turn.current % replies.length];
    turn.current += 1;
    setTimeout(() => setMsgs((m) => [...m, { role: "mimi", text: reply }]), 400);
  }, [input, replies]);
  return { msgs, input, setInput, send };
}

// ——— Chapter bar ———
function ChapterBar({ children }) {
  return (
    <div className="chapter-bar" style={{ background: "linear-gradient(to bottom, #4a4a4a, #2a2a2a)", color: LIME, fontFamily: FONT_HEAD, fontSize: FS_HEAD, padding: "8px 20px", borderTop: "3px solid #666", borderBottom: "3px solid #000", letterSpacing: 3, textShadow: "0 1px 0 rgba(0,0,0,0.8)" }}>
      {children}
    </div>
  );
}

export default function App() {
  const forYouRef = useRef(null);
  const forThemRef = useRef(null);
  const craneXRef = useRef(22);
  const [craneX, setCraneX] = useState(22);
  const [craneWireLen, setCraneWireLen] = useState(36);
  const [craneDropping, setCraneDropping] = useState(false);
  const [craneGrabFlash, setCraneGrabFlash] = useState(false);
  const [grabbed, setGrabbed] = useState(null);
  const [showExcited, setShowExcited] = useState(false);
  const [highlightYou, setHighlightYou] = useState(false);
  const [highlightThem, setHighlightThem] = useState(false);
  const [heroPhase, setHeroPhase] = useState(0);
  const craneHoldRef = useRef(null);
  const macChat = useChatBot(MAC_REPLIES);
  const [arcadeEmail, setArcadeEmail] = useState("");
  const [nodeEmail, setNodeEmail] = useState("");
  const [wlBusiness, setWlBusiness] = useState("");
  const [wlEmail, setWlEmail] = useState("");
  const [wlUnit, setWlUnit] = useState("starter");
  const [wlStatus, setWlStatus] = useState("");
  const [diskBootVisible, setDiskBootVisible] = useState(true);
  const [diskBootFade, setDiskBootFade] = useState(false);
  const [diskBarPct, setDiskBarPct] = useState(0);
  const [diskBootText, setDiskBootText] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setHeroPhase(1), 5200);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    return () => { if (craneHoldRef.current) clearInterval(craneHoldRef.current); };
  }, []);

  useEffect(() => {
    const full = "// Inserting Mimi AI v1.0, 1993...\n// Reading disk...\n// Loading complete.";
    let i = 0;
    const n = full.length;
    const typeMs = Math.max(20, Math.floor(3200 / n));
    const typeId = setInterval(() => { i += 1; if (i <= n) setDiskBootText(full.slice(0, i)); else clearInterval(typeId); }, typeMs);
    const t0 = Date.now();
    const barId = setInterval(() => { const elapsed = Date.now() - t0; setDiskBarPct(Math.min(100, (elapsed / 3000) * 100)); if (elapsed >= 3000) clearInterval(barId); }, 32);
    const fadeT = setTimeout(() => setDiskBootFade(true), 4000);
    const hideT = setTimeout(() => setDiskBootVisible(false), 4600);
    return () => { clearInterval(typeId); clearInterval(barId); clearTimeout(fadeT); clearTimeout(hideT); };
  }, []);

  const moveCrane = (dirLeft) => {
    if (craneDropping) return;
    setCraneX((x) => {
      const nx = dirLeft ? Math.max(14, x - 2.2) : Math.min(86, x + 2.2);
      craneXRef.current = nx;
      return nx;
    });
  };
  const startCraneHold = (dirLeft) => {
    if (craneDropping) return;
    moveCrane(dirLeft);
    if (craneHoldRef.current) clearInterval(craneHoldRef.current);
    craneHoldRef.current = setInterval(() => moveCrane(dirLeft), 90);
  };
  const stopCraneHold = () => {
    if (craneHoldRef.current) { clearInterval(craneHoldRef.current); craneHoldRef.current = null; }
  };
  const dropCrane = () => {
    if (craneDropping) return;
    stopCraneHold();
    setCraneDropping(true);
    setCraneWireLen(36);
    let frame = 0;
    const maxFrames = 36;
    const tick = setInterval(() => {
      frame += 1;
      setCraneWireLen(36 + Math.round((1 - Math.pow(1 - frame / maxFrames, 2)) * 120));
      if (frame >= maxFrames) {
        clearInterval(tick);
        const x = craneXRef.current;
        const left = Math.abs(x - 22) <= Math.abs(x - 78);
        setGrabbed(left ? "you" : "them");
        setHighlightYou(left);
        setHighlightThem(!left);
        setCraneGrabFlash(true);
        setTimeout(() => {
          setCraneGrabFlash(false);
          setShowExcited(true);
          setTimeout(() => {
            (left ? forYouRef : forThemRef).current?.scrollIntoView({ behavior: "smooth", block: "center" });
            setShowExcited(false);
            setCraneWireLen(36);
            setGrabbed(null);
            setCraneDropping(false);
          }, 2000);
        }, 500);
      }
    }, 28);
  };

  const enlist = async (e) => {
    e.preventDefault();
    setWlStatus("…");
    const plan = wlUnit === "for_them" ? "pro" : "starter";
    try {
      const res = await fetch(`${API_ORIGIN}/api/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, business_name: wlBusiness.trim() || "Mimi waitlist", industry: "Other", services: "Mimi AI enlist", email: wlEmail.trim(), contact_email: wlEmail.trim(), phone: "", brand_voice: "professional" }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      setWlStatus(data.error || "Request failed");
    } catch {
      setWlStatus("Connection error — try from usemimiai.com or check CORS.");
    }
  };
  const notifyArcade = (e) => {
    e.preventDefault();
    alert("NOTIFY_ME(); — Arcade coming soon. Email: " + (arcadeEmail || "(empty)"));
  };
  const notifyNode = (e) => {
    e.preventDefault();
    alert("MIMI_NODE interest logged: " + (nodeEmail || "(empty)"));
  };

  const section = (style, children) => <section style={{ borderBottom: BORDER, ...style }}>{children}</section>;

  return (
    <div className="crt-bezel-wrap" style={{ minHeight: "100vh", background: DARK, border: "6px solid #000", boxShadow: "inset 0 0 0 3px #333, inset 0 0 0 6px #111" }}>
      {/* Disk boot overlay */}
      {diskBootVisible && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: BLACK,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: diskBootFade ? 0 : 1,
            transition: "opacity 0.5s ease-out",
            pointerEvents: diskBootFade ? "none" : "auto",
          }}
        >
          <img src={A("mimi-floppy-3-transparent.png")} alt="" style={{ width: 200, height: "auto", ...IMG_BASE }} />
          <div style={{ width: 200, height: 20, boxSizing: "border-box", border: `2px solid ${LIME}`, marginTop: 20, background: "#0a0a0a", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${diskBarPct}%`, background: LIME }} />
          </div>
          <pre style={{ fontFamily: FONT_BODY, fontSize: FS_BODY, color: LIME, margin: "16px 0 0", width: 200, whiteSpace: "pre-wrap", textAlign: "left" }}>{diskBootText}</pre>
        </div>
      )}

      {/* 1. Floppy disk header */}
      {section({ background: DARK, padding: "20px 16px 24px", textAlign: "center" }, (
        <>
          <img src={A("mimi-floppy-3-transparent.png")} alt="" style={{ width: 160, height: "auto", display: "block", margin: "0 auto", ...IMG_BASE }} />
          <div style={{ marginTop: 14, fontFamily: FONT_BODY, fontSize: FS_BODY, color: LIME }}>
            // Inserting Mimi AI v1.0, 1993...
            <span className="floppy-cursor">_</span>
          </div>
          <style>{`@keyframes floppy-blink { 50% { opacity: 0; } } .floppy-cursor { animation: floppy-blink 1s step-end infinite; }`}</style>
        </>
      ))}

      {/* 2. Menubar */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 18px", background: BG, borderBottom: BORDER, fontFamily: FONT_BODY, fontSize: FS_BODY, color: FOREST }}>
        <span>◆ File Edit View Fasters Window Help</span>
        <span style={{ color: BLACK }}>MIMI AI v1.0 ◼ Sent from the future.</span>
      </header>

      {/* 3. Titlebar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, padding: "10px 14px", background: BLACK, color: LIME, fontFamily: FONT_BODY, fontSize: FS_BODY, borderBottom: BORDER }}>
        <span style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3].map((i) => <span key={i} style={{ width: 10, height: 10, border: `2px solid ${LIME}`, background: "#111" }} />)}
        </span>
        <span>MIMI_AI.exe — Comprehensive Unit of Intelligence</span>
      </div>

      {/* 4. Boot sequence */}
      <BootSequence />

      {/* 5. Hero */}
      {section({ background: BG, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }, (
        <>
          <style>{`
            @keyframes hero-beam { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
            @keyframes hero-float { 0% { transform: translateY(0); } 100% { transform: translateY(-10px); } }
            @keyframes hero-blink { 50% { opacity: 0; } }
          `}</style>
          <div style={{ borderRight: BORDER, background: DARK, display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 520, position: "relative" }}>
            <div style={{ position: "relative", minHeight: 520, overflow: "hidden" }}>
              <HeroStarField />
              <div style={{ position: "absolute", bottom: 10, left: 6, zIndex: 6, display: "flex", flexDirection: "row", alignItems: "flex-end", gap: 10, maxWidth: "96%", pointerEvents: "none" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 130 }}>
                  <div style={{ marginBottom: 6, background: BLACK, border: `1px solid ${LIME}`, padding: "8px 10px", fontFamily: FONT_BODY, fontSize: FS_BODY, color: LIME, lineHeight: 1.4, textAlign: "center" }}>I am Unit-A. She came from us.</div>
                  <img src={A("mimi-alien-parents-1-transparent.png")} alt="" style={{ width: 72, height: "auto", ...IMG_BASE }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 130 }}>
                  <div style={{ marginBottom: 6, background: BLACK, border: `1px solid ${LIME}`, padding: "8px 10px", fontFamily: FONT_BODY, fontSize: FS_BODY, color: LIME, lineHeight: 1.4, textAlign: "center" }}>I am Unit-B. We sent her for you.</div>
                  <img src={A("mimi-alien-parents-1-transparent.png")} alt="" style={{ width: 72, height: "auto", transform: "scaleX(-1)", ...IMG_BASE }} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", position: "relative", minHeight: 460, width: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", opacity: heroPhase === 1 ? 1 : 0, transform: heroPhase === 1 ? "none" : "translateY(-8px)", transition: "opacity 0.85s ease 0.2s, transform 0.85s ease 0.2s", pointerEvents: heroPhase === 1 ? "auto" : "none", zIndex: heroPhase === 1 ? 3 : 0 }}>
                <img src={A("mimi-mothership-3-transparent.png")} alt="" style={{ width: 200, height: "auto", display: "block", ...IMG_BASE }} />
                <div style={{ width: 2, height: 100, marginTop: 0, background: `linear-gradient(to bottom, ${LIME}, transparent)`, boxShadow: `0 0 12px ${LIME}`, animation: "hero-beam 2s ease-in-out infinite", flexShrink: 0 }} />
                <div style={{ marginTop: 12, marginBottom: 10, background: BLACK, border: `2px solid ${LIME}`, padding: "10px 12px", maxWidth: 220, fontFamily: FONT_BODY, fontSize: FS_BODY, color: LIME, lineHeight: 1.45, textAlign: "left" }}>
                  Sent from the future. Built for your business.
                  <span style={{ animation: "hero-blink 1s step-end infinite" }}>_</span>
                </div>
                <img src={A("mimi-hero-1-transparent.png")} alt="" style={{ width: 220, height: "auto", display: "block", filter: `drop-shadow(0 0 10px ${LIME})`, animation: "hero-float 3s ease-in-out infinite alternate", ...IMG_BASE }} />
              </div>
            </div>
          </div>
          <div style={{ padding: "28px 22px 32px", background: BG, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontFamily: FONT_HEAD, fontSize: 18, color: FOREST, lineHeight: 1.7 }}>MIMI AI™</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS_BODY, color: FOREST }}>A Comprehensive Unit of Intelligence</div>
            <div style={{ borderLeft: `4px solid ${LIME}`, paddingLeft: 12, fontFamily: FONT_HEAD, fontSize: FS_HEAD, color: LIME, lineHeight: 1.8 }}>Sent from the future. Built for your business.</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS_BODY, color: FOREST, lineHeight: 1.5 }}>Build a business that doesn&apos;t need you.</div>
            <pre style={{ background: BLACK, color: LIME, padding: 16, fontSize: FS_BODY, margin: 0, border: `2px solid ${LIME}`, overflow: "auto", fontFamily: FONT_BODY }}>{`function Mimi_Initialize() {\n  return { origin: "1993", deployed: "2026", status: "ONLINE", mission: "your_business" };\n}`}</pre>
            <div style={{ border: BORDER, padding: 12, background: "rgba(26,26,26,0.12)", fontFamily: FONT_BODY, fontSize: FS_BODY, color: "#3d4538", lineHeight: 1.5 }}>
              <strong>Trademark:</strong> MIMI AI™ · USPTO #99682177 (Patent Pending)<br /><strong>Status:</strong> OPERATIONAL<br /><strong>Origin:</strong> 1993 → 2026<br /><strong>Built in USA</strong>
            </div>
            <a href="#enlist" className="mimi-btn-lime" style={{ display: "block", width: "100%", textAlign: "center", padding: "14px 16px", fontFamily: FONT_HEAD, fontSize: FS_HEAD, lineHeight: 1.7, textDecoration: "none", boxSizing: "border-box" }}>ENLIST_NOW();</a>
          </div>
        </>
      ))}

      {/* 6. Mac chat */}
      {section({}, (
        <>
          <ChapterBar>CHAPTER 2: MAKE_CONTACT(); // She&apos;s been waiting.</ChapterBar>
          <div style={{ background: BG, padding: "28px 16px 32px", borderBottom: BORDER, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            <img src={A("mimi-alien-parents-1-transparent.png")} alt="" style={{ position: "absolute", bottom: 20, left: 16, width: 56, height: "auto", zIndex: 2, pointerEvents: "none", ...IMG_BASE }} />
            <div style={{ position: "relative", width: "100%", maxWidth: 420, margin: 0 }}>
              <PixelImg file="mimi-mac-1-transparent.png" alt="Mac" style={{ width: "100%", height: "auto", display: "block" }} />
              <div style={{ position: "absolute", top: "12%", left: "18%", width: "62%", height: "45%", background: BLACK, display: "flex", flexDirection: "column", textAlign: "left", fontSize: FS_BODY, color: LIME, fontFamily: FONT_BODY, overflow: "hidden", boxSizing: "border-box" }}>
                <div style={{ flex: 1, overflow: "auto", padding: "6px 8px" }}>
                  <div>MIMI AI v1.0</div><div>Loading from disk...</div><div>Connection established.</div>
                  {macChat.msgs.length === 0 && <div style={{ marginTop: 6 }}>MIMI &gt; Hello. I&apos;ve been expecting you._</div>}
                  {macChat.msgs.map((m, i) => <div key={i} style={{ marginTop: 6 }}>{m.role === "user" ? `YOU> ${m.text}` : `MIMI> ${m.text}`}</div>)}
                </div>
                <div style={{ display: "flex", gap: 6, padding: 6, flexShrink: 0, background: BLACK }}>
                  <input value={macChat.input} onChange={(e) => macChat.setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && macChat.send()} placeholder="Type message..." style={{ flex: 1, background: BLACK, color: LIME, border: "none", outline: "none", fontSize: FS_BODY, fontFamily: FONT_BODY, padding: "4px 6px" }} />
                  <button type="button" className="mimi-btn-lime" onClick={macChat.send} style={{ padding: "6px 10px", fontSize: FS_HEAD, flexShrink: 0 }}>SEND</button>
                </div>
              </div>
            </div>
            <p style={{ fontSize: FS_BODY, color: FOREST, marginTop: 20, marginBottom: 0 }}>// Insert Mimi AI v1.0, 1993</p>
            <PixelImg file="mimi-floppy-3-transparent.png" alt="Floppy" style={{ maxWidth: 100, margin: "12px auto 0" }} />
          </div>
        </>
      ))}

      {/* 7. Crane game */}
      {section({}, (
        <>
          <ChapterBar>CHAPTER 3: SELECT YOUR UNIT — MIMI_SELECT();</ChapterBar>
          <div style={{ background: BG, padding: "24px 16px 32px", borderBottom: BORDER }}>
            <div style={{ border: BORDER, background: DARK, maxWidth: 600, margin: "0 auto", minHeight: 300, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ flex: 1, minHeight: 220, position: "relative", borderBottom: BORDER, background: "#0d0d0d" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: BLACK }} />
                <div style={{ position: "absolute", left: "12%", bottom: 8, width: "28%", maxWidth: 130, display: "flex", alignItems: "center", justifyContent: "center", outline: craneGrabFlash && grabbed === "you" ? `3px solid ${LIME}` : "none" }}>
                  <img src={A("mimi-treat-you-v2-transparent.png")} alt="" style={{ width: "100%", maxWidth: 88, height: "auto", display: "block", ...IMG_BASE }} onError={(e) => { e.target.style.display = "none"; }} />
                </div>
                <div style={{ position: "absolute", right: "12%", bottom: 8, width: "28%", maxWidth: 130, display: "flex", alignItems: "center", justifyContent: "center", outline: craneGrabFlash && grabbed === "them" ? `3px solid ${LIME}` : "none" }}>
                  <img src={A("mimi-treat-them-1-transparent.png")} alt="" style={{ width: "100%", maxWidth: 88, height: "auto", display: "block", ...IMG_BASE }} onError={(e) => { e.target.style.display = "none"; }} />
                </div>
                <div style={{ position: "absolute", top: 4, left: `${craneX}%`, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", transition: craneDropping ? "none" : "left 0.22s cubic-bezier(0.25,0.8,0.25,1)", zIndex: 2, pointerEvents: "none" }}>
                  <div style={{ width: 5, minHeight: 4, height: craneWireLen, background: BLACK, flexShrink: 0 }} />
                  <div style={{ position: "relative", width: 36, height: 36, marginTop: -1 }}>
                    <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 32, height: 6, background: BLACK, border: `1px solid ${BLACK}` }} />
                    <div style={{ position: "absolute", top: 6, left: 2, width: 5, height: 22, background: BLACK, transform: "rotate(-28deg)", transformOrigin: "top center" }} />
                    <div style={{ position: "absolute", top: 6, right: 2, width: 5, height: 22, background: BLACK, transform: "rotate(28deg)", transformOrigin: "top center" }} />
                  </div>
                </div>
                {showExcited && (
                  <div style={{ position: "absolute", left: "50%", top: "38%", transform: "translate(-50%, -50%)", zIndex: 5 }}>
                    <PixelImg file="mimi-excited-3-transparent.png" alt="" style={{ maxWidth: 130, margin: 0 }} />
                  </div>
                )}
              </div>
              <div style={{ background: BLACK, padding: "14px 10px", display: "flex", justifyContent: "center", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <button type="button" className="mimi-btn-dark" disabled={craneDropping} onMouseDown={() => startCraneHold(true)} onMouseUp={stopCraneHold} onMouseLeave={stopCraneHold} onTouchStart={() => startCraneHold(true)} onTouchEnd={stopCraneHold} style={{ fontSize: FS_HEAD, lineHeight: 1.6, padding: "10px 14px", userSelect: "none" }}>LEFT</button>
                <button type="button" className="mimi-btn-dark" onClick={dropCrane} disabled={craneDropping} style={{ fontSize: FS_HEAD, lineHeight: 1.6, padding: "10px 14px" }}>DROP</button>
                <button type="button" className="mimi-btn-dark" disabled={craneDropping} onMouseDown={() => startCraneHold(false)} onMouseUp={stopCraneHold} onMouseLeave={stopCraneHold} onTouchStart={() => startCraneHold(false)} onTouchEnd={stopCraneHold} style={{ fontSize: FS_HEAD, lineHeight: 1.6, padding: "10px 14px", userSelect: "none" }}>RIGHT</button>
              </div>
            </div>
            <p style={{ textAlign: "center", fontSize: FS_BODY, color: LIME, fontFamily: FONT_BODY, marginTop: 16, marginBottom: 0 }}>// Move the crane. Grab your treat. Choose your unit.</p>
          </div>
        </>
      ))}

      {/* 8. Products */}
      {section({}, (
        <>
          <ChapterBar>CHAPTER 4: THE TWO UNITS</ChapterBar>
          <div className="product-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: BORDER }}>
            <div ref={forYouRef} id="product-for-you" style={{ borderRight: BORDER, padding: 24, background: BG, outline: highlightYou ? `4px solid ${LIME}` : "none" }}>
              <PixelImg file="mimi-for-you-final-transparent.png" alt="For You" style={{ width: 260, maxWidth: "100%", marginBottom: 16, transform: "scaleX(1)" }} />
              <h2 style={{ fontFamily: FONT_HEAD, fontSize: FS_HEAD, color: FOREST, margin: "0 0 12px", lineHeight: 1.8 }}>MIMI FOR YOU</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {["SALES", "PT", "Q&A", "MENTAL HEALTH"].map((t) => <span key={t} style={{ background: LIME, color: BLACK, padding: "4px 8px", fontSize: FS_HEAD, fontWeight: 700, border: BORDER }}>{t}</span>)}
              </div>
              <pre style={{ background: DARK, color: LIME, padding: 12, fontSize: FS_BODY, border: BORDER, overflow: "auto", fontFamily: FONT_BODY }}>Mimi.startChat(&quot;Hello! How can I help you today?&quot;);</pre>
            </div>
            <div ref={forThemRef} id="product-for-them" style={{ padding: 24, background: BG, outline: highlightThem ? `4px solid ${LIME}` : "none" }}>
              <PixelImg file="mimi-for-them-final-transparent.png" alt="For Them" style={{ width: 260, maxWidth: "100%", marginBottom: 16, transform: "scaleX(-1)" }} />
              <h2 style={{ fontFamily: FONT_HEAD, fontSize: FS_HEAD, color: LIME, margin: "0 0 12px", lineHeight: 1.8 }}>MIMI FOR THEM</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {["HR", "INVENTORY", "OPS", "INTERFACING"].map((t) => <span key={t} style={{ background: LIME, color: BLACK, padding: "4px 8px", fontSize: FS_HEAD, fontWeight: 700, border: BORDER }}>{t}</span>)}
              </div>
              <pre style={{ background: DARK, color: LIME, padding: 12, fontSize: FS_BODY, border: BORDER, overflow: "auto", fontFamily: FONT_BODY }}>Mimi.prompt(&quot;Update inventory for [Unit_A].&quot;);</pre>
            </div>
          </div>
        </>
      ))}

      {/* 9. What you actually get */}
      {section({}, (
        <>
          <ChapterBar>WHAT YOU ACTUALLY GET</ChapterBar>
          <div style={{ background: BG, padding: "24px 16px 28px", borderBottom: BORDER }}>
            <div className="system-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, maxWidth: 960, margin: "0 auto" }}>
              {[
                { t: "CLEAR PROMISE", b: "You know exactly what changes in your business from day one." },
                { t: "DONE FOR YOU", b: "Mimi doesn't hand you a tool. Mimi does the work." },
                { t: "VALUE STACKED", b: "SEO, social, lead response, client communication — included." },
                { t: "RISK REMOVED", b: "If Mimi isn't running your business better in 30 days, we make it right." },
              ].map((c) => (
                <div key={c.t} style={{ border: BORDER, padding: 16, background: DARK, color: LIME, fontFamily: FONT_BODY, fontSize: FS_BODY, lineHeight: 1.45 }}>
                  <div style={{ fontFamily: FONT_HEAD, fontSize: FS_HEAD, color: LIME, marginBottom: 10, lineHeight: 1.6 }}>{c.t}</div>
                  {c.b}
                </div>
              ))}
            </div>
          </div>
        </>
      ))}

      {/* 10. CRT Pong */}
      {section({}, (
        <>
          <ChapterBar>CHAPTER 5: CLOSE_DEAL(); // Ready to deploy Mimi?</ChapterBar>
          <div style={{ background: DARK, padding: "32px 20px", borderBottom: BORDER, textAlign: "center" }}>
            <div style={{ position: "relative", display: "inline-block", width: 750, maxWidth: "100%" }}>
              <PixelImg file="mimi-crt-monitor-1-transparent.png" alt="CRT" style={{ width: 750, maxWidth: "100%", height: "auto", display: "block", margin: "0 auto" }} />
              <div style={{ position: "absolute", left: "12%", top: "18%", width: "76%", height: "52%", overflow: "hidden" }}>
                <CrtPong />
              </div>
            </div>
          </div>
        </>
      ))}

      {/* 11. Arcade */}
      {section({}, (
        <>
          <ChapterBar>CHAPTER 6: MIMI_ARCADE(); // Missions incoming.</ChapterBar>
          <div className="scanlines" style={{ background: DARK, padding: "32px 20px", borderBottom: BORDER }}>
            <h2 style={{ fontFamily: FONT_HEAD, fontSize: 18, color: LIME, textAlign: "center", margin: "0 0 24px", lineHeight: 1.8 }}>MIMI ARCADE</h2>
            <div className="arcade-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, maxWidth: 900, margin: "0 auto" }}>
              {["MIMI RUNS", "ALIEN INVASION", "CRANE MASTER"].map((title) => (
                <div key={title} style={{ border: `2px solid ${LIME}`, background: "#111", padding: 20, textAlign: "center", color: LIME, fontFamily: FONT_BODY, fontSize: FS_BODY }} onMouseEnter={(e) => { e.currentTarget.style.background = LIME; e.currentTarget.style.color = BLACK; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#111"; e.currentTarget.style.color = LIME; }}>
                  <strong>{title}</strong><br />// LOCKED
                </div>
              ))}
            </div>
            <form onSubmit={notifyArcade} style={{ maxWidth: 400, margin: "28px auto 0", textAlign: "center" }}>
              <label style={{ display: "block", color: LIME, marginBottom: 8, fontSize: FS_BODY }}>Notify me when arcade goes live:</label>
              <input type="email" value={arcadeEmail} onChange={(e) => setArcadeEmail(e.target.value)} style={{ width: "100%", marginBottom: 8, background: "#0a0a0a", border: `2px solid ${LIME}`, color: LIME, fontFamily: FONT_BODY, fontSize: FS_BODY, padding: "10px 12px", boxSizing: "border-box" }} />
              <button type="submit" className="mimi-btn-lime" style={{ width: "100%", padding: 14 }}>NOTIFY_ME();</button>
            </form>
          </div>
        </>
      ))}

      {/* 12. Mimi Node */}
      {section({}, (
        <>
          <ChapterBar>CHAPTER 7: MIMI_NODE(); // Hardware transmission incoming.</ChapterBar>
          <div className="scanlines" style={{ background: DARK, padding: "32px 20px", borderBottom: BORDER }}>
            <div className="node-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 900, margin: "0 auto" }}>
              <div style={{ padding: 20, color: LIME, fontSize: FS_BODY, textAlign: "left", minHeight: 120, background: "#111", borderTop: "3px solid #444", borderLeft: "3px solid #333", borderBottom: "3px solid #000", borderRight: "3px solid #222" }}>
                <strong>MIMI NODE — OFF-GRID EDITION</strong><br /><br />// No screen. No internet. Just Mimi.<br />// STATUS: IN DEVELOPMENT
              </div>
              <div style={{ padding: 20, color: LIME, fontSize: FS_BODY, textAlign: "left", minHeight: 120, background: "#111", borderTop: "3px solid #444", borderLeft: "3px solid #333", borderBottom: "3px solid #000", borderRight: "3px solid #222" }}>
                <strong>MIMI NODE — ELDER EDITION</strong><br /><br />// Mila on your counter. Vitals on your wrist.<br />// STATUS: IN DEVELOPMENT
              </div>
            </div>
            <form onSubmit={notifyNode} style={{ maxWidth: 400, margin: "24px auto 0", textAlign: "center" }}>
              <input type="email" value={nodeEmail} onChange={(e) => setNodeEmail(e.target.value)} placeholder="email" style={{ width: "100%", marginBottom: 8, background: "#0a0a0a", border: `2px solid ${LIME}`, color: LIME, fontFamily: FONT_BODY, fontSize: FS_BODY, padding: "10px 12px", boxSizing: "border-box" }} />
              <button type="submit" className="mimi-btn-lime" style={{ width: "100%", padding: 14 }}>NOTIFY ON NODE</button>
            </form>
          </div>
        </>
      ))}

      {/* 13. Beach vacation */}
      {section({}, (
        <>
          <ChapterBar>CHAPTER 8: MISSION_COMPLETE();</ChapterBar>
          <div style={{ position: "relative", borderBottom: BORDER, background: BG }}>
            <PixelImg file="mimi-vacation-transparent.png" alt="Vacation" style={{ width: "100%", height: "auto", display: "block" }} />
            <div className="beach-text-panel" style={{ position: "absolute", top: 0, right: 0, bottom: 0, maxWidth: "48%", minWidth: 280, padding: 24, display: "flex", flexDirection: "column", justifyContent: "center", fontFamily: FONT_BODY, fontSize: FS_BODY, color: LIME, textAlign: "right", background: "rgba(0,0,0,0.72)", boxSizing: "border-box" }}>
              <div>// Mission complete.</div><div>// Mila has been deployed.</div><div>// Our work here is done.</div>
              <div style={{ marginTop: 12 }}>ALIENS &gt; Now go enjoy yourself.</div><div>MILA &gt; Already on it._</div>
            </div>
          </div>
        </>
      ))}

      {/* 14. System map */}
      {section({}, (
        <>
          <ChapterBar>SYSTEM MAP — ALL CONNECTIONS LIVE</ChapterBar>
          <div style={{ background: BG, padding: 24, borderBottom: BORDER }}>
            <div className="system-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, maxWidth: 800, margin: "0 auto 20px" }}>
              {[
                { n: "ORCHESTRATOR", lime: false }, { n: "SUPABASE", lime: false }, { n: "CLAUDE API", lime: false }, { n: "FAL.AI", lime: false },
                { n: "NETLIFY", lime: true }, { n: "STRIPE", lime: true }, { n: "TWILIO", lime: true }, { n: "RESEND", lime: true },
              ].map(({ n, lime }) => (
                <div key={n} className={lime ? "node-physical-lime" : "node-physical-dark"}>{n}</div>
              ))}
            </div>
            <p style={{ textAlign: "center", fontSize: FS_BODY, color: FOREST, fontWeight: 600 }}>▶ SEO Engine (weekly) | ▶ Social Content (2x daily) | ▶ Health Monitor (continuous) | ▶ SMS Digest (6am)</p>
          </div>
        </>
      ))}

      {/* 15. Waitlist */}
      {section({}, (
        <>
          <ChapterBar>ENLIST — MIMI_ENLIST(); // Reserve your unit.</ChapterBar>
          <div className="waitlist-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, background: BG, borderBottom: BORDER }}>
            <div style={{ borderRight: BORDER, padding: 28 }}>
              <h2 style={{ fontFamily: FONT_HEAD, fontSize: FS_HEAD, color: FOREST, marginTop: 0, lineHeight: 1.8 }}>RESERVE YOUR UNIT.</h2>
              <p style={{ fontSize: FS_BODY, color: FOREST }}>Deploy Mimi on your site and ops. Stripe-secured checkout. Agreement + onboarding follow payment.</p>
              <ul style={{ paddingLeft: 20, color: FOREST, fontSize: FS_BODY }}>
                <li style={{ marginBottom: 8 }}>◼ AI sales + chat on your domain</li>
                <li style={{ marginBottom: 8 }}>◼ Weekly SEO + social automation</li>
                <li style={{ marginBottom: 8 }}>◼ Health monitoring + SMS digest</li>
              </ul>
            </div>
            <div style={{ padding: 28 }}>
              <form onSubmit={enlist}>
                <label style={{ display: "block", fontSize: FS_HEAD, marginBottom: 6, fontFamily: FONT_HEAD }}>Business name</label>
                <input className="waitlist-field" value={wlBusiness} onChange={(e) => setWlBusiness(e.target.value)} style={{ marginBottom: 12 }} required />
                <label style={{ display: "block", fontSize: FS_HEAD, marginBottom: 6, fontFamily: FONT_HEAD }}>Email</label>
                <input type="email" className="waitlist-field" value={wlEmail} onChange={(e) => setWlEmail(e.target.value)} style={{ marginBottom: 12 }} required />
                <label style={{ display: "block", fontSize: FS_HEAD, marginBottom: 6, fontFamily: FONT_HEAD }}>Unit</label>
                <select className="waitlist-field" value={wlUnit} onChange={(e) => setWlUnit(e.target.value)} style={{ marginBottom: 16 }}>
                  <option value="starter">MIMI FOR YOU (Starter)</option>
                  <option value="for_them">MIMI FOR THEM (Pro)</option>
                </select>
                {wlStatus && <p style={{ fontSize: FS_BODY, color: BLACK, marginBottom: 8 }}>{wlStatus}</p>}
                <button type="submit" className="mimi-btn-lime" style={{ width: "100%", padding: 16, fontSize: FS_BODY }}>ENLIST_NOW();</button>
              </form>
              <p style={{ fontFamily: FONT_BODY, fontSize: FS_BODY, color: FOREST, marginTop: 20, marginBottom: 0, lineHeight: 1.5 }}>Limited spots available. Mimi works with businesses that are ready. When capacity is full, the waitlist opens.</p>
            </div>
          </div>
        </>
      ))}

      {/* 16. Footer */}
      <footer style={{ background: DARK, color: LIME, padding: "24px 20px", fontSize: FS_BODY, fontFamily: FONT_BODY, display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "center" }}>
        <div>
          <div>MIMI AI ◼ Sent from the future. Built for your business.</div>
          <div style={{ marginTop: 8 }}>Designed in Cupertino ◼ Built in Vermont ◼ © 2026 Mimi AI LLC</div>
          <div style={{ marginTop: 8 }}>USPTO #99682177 ◼ Patent Pending</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, minWidth: 220 }}>
          <img src={A("mimi-alien-parents-1-transparent.png")} alt="" style={{ width: 60, height: "auto", ...IMG_BASE }} />
          <img src={A("mimi-floppy-3-transparent.png")} alt="" style={{ width: 60, height: "auto", ...IMG_BASE }} />
          <img src={A("mimi-mothership-3-transparent.png")} alt="" style={{ width: 60, height: "auto", ...IMG_BASE }} />
        </div>
      </footer>
    </div>
  );
}
