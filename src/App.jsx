import { useState, useEffect, useRef, useCallback } from "react";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "https://usemimiai.com";
const A = (f) => `/assets/mimi-pixel-fal/${f}`;

const MAC_REPLIES = [
  "I've been waiting for a business like yours.",
  "Tell me more. What's your biggest bottleneck?",
  "I can handle that. What else keeps you up at night?",
  "Good. I was built for exactly this.",
  "Your competitors don't have me. Yet.",
];

const CRT_REPLIES = [
  "Interesting. What industry are you in?",
  "How many customers do you serve monthly?",
  "I can automate that entire workflow.",
  "Your business is exactly what I was built for.",
  "Let's get you deployed. Hit the waitlist below.",
];

function PixelImg({ file, alt, className = "pixel-img", style }) {
  const [bad, setBad] = useState(false);
  const src = A(file);
  if (bad) {
    return (
      <div
        className={className}
        style={{
          ...style,
          minHeight: 120,
          border: "2px solid #000",
          background: "#333",
          color: "#32cd32",
          fontFamily: "Inconsolata, monospace",
          fontSize: 11,
          padding: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        {file}
      </div>
    );
  }
  return (
    <img src={src} alt={alt || file} className={className} style={style} onError={() => setBad(true)} />
  );
}

const BOOT_LINES = [
  "// Incoming transmission...",
  "// Source: Unknown",
  "// Coordinates: 1993 → 2026",
  "// Package identified: MIMI_AI.exe",
  "// Initializing...",
  "System status: ONLINE",
];

function BootSequence() {
  const [text, setText] = useState("");
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    if (lineIdx >= BOOT_LINES.length) return;
    const line = BOOT_LINES[lineIdx];
    if (charIdx < line.length) {
      const t = setTimeout(() => {
        setText((prev) => prev + line[charIdx]);
        setCharIdx((c) => c + 1);
      }, 28);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setText((prev) => prev + "\n");
      setLineIdx((i) => i + 1);
      setCharIdx(0);
    }, 200);
    return () => clearTimeout(t);
  }, [lineIdx, charIdx]);

  return (
    <section
      className="section-border"
      style={{
        background: "#1a1a1a",
        padding: "24px 20px",
        minHeight: 200,
        fontFamily: "Inconsolata, monospace",
        fontSize: 13,
        color: "#32cd32",
        whiteSpace: "pre-wrap",
        borderBottom: "2px solid #000",
      }}
    >
      {text}
      <span className="boot-cursor">_</span>
      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
        .boot-cursor { animation: blink 1s step-end infinite; }
      `}</style>
    </section>
  );
}

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
    setTimeout(() => {
      setMsgs((m) => [...m, { role: "mimi", text: reply }]);
    }, 400);
  }, [input, replies]);

  return { msgs, input, setInput, send };
}

export default function App() {
  const forYouRef = useRef(null);
  const forThemRef = useRef(null);
  const [craneX, setCraneX] = useState(50);
  const [grabbed, setGrabbed] = useState(null);
  const [showExcited, setShowExcited] = useState(false);
  const [highlightYou, setHighlightYou] = useState(false);
  const [highlightThem, setHighlightThem] = useState(false);

  const macChat = useChatBot(MAC_REPLIES);
  const crtChat = useChatBot(CRT_REPLIES);

  const [arcadeEmail, setArcadeEmail] = useState("");
  const [nodeEmail, setNodeEmail] = useState("");
  const [wlBusiness, setWlBusiness] = useState("");
  const [wlEmail, setWlEmail] = useState("");
  const [wlUnit, setWlUnit] = useState("starter");
  const [wlStatus, setWlStatus] = useState("");

  const moveCrane = (d) => {
    setCraneX((x) => Math.max(8, Math.min(92, x + d)));
  };

  const dropCrane = () => {
    const left = craneX < 50;
    setGrabbed(left ? "you" : "them");
    setShowExcited(true);
    setHighlightYou(left);
    setHighlightThem(!left);
    const ref = left ? forYouRef : forThemRef;
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 500);
  };

  const enlist = async (e) => {
    e.preventDefault();
    setWlStatus("…");
    const plan = wlUnit === "for_them" ? "pro" : "starter";
    try {
      const res = await fetch(`${API_ORIGIN}/api/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          business_name: wlBusiness.trim() || "Mimi waitlist",
          industry: "Other",
          services: "Mimi AI enlist",
          email: wlEmail.trim(),
          contact_email: wlEmail.trim(),
          phone: "",
          brand_voice: "professional",
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
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

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* SECTION 1 */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 16px",
          background: "#a5a2a2",
          borderBottom: "2px solid #000",
          fontFamily: "Inconsolata, monospace",
          fontSize: 12,
          color: "#4c5a42",
        }}
      >
        <span>◆ File Edit View Fasters Window Help</span>
        <span style={{ color: "#000" }}>
          MIMI AI v1.0 ◼ Sent from the future.
        </span>
      </header>

      {/* SECTION 2 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: "8px 12px",
          background: "#000",
          color: "#32cd32",
          fontFamily: "Inconsolata, monospace",
          fontSize: 11,
          borderBottom: "2px solid #000",
        }}
      >
        <span style={{ display: "flex", gap: 6 }}>
          <span
            style={{
              width: 10,
              height: 10,
              border: "2px solid #32cd32",
              background: "#111",
            }}
          />
          <span
            style={{
              width: 10,
              height: 10,
              border: "2px solid #32cd32",
              background: "#111",
            }}
          />
          <span
            style={{
              width: 10,
              height: 10,
              border: "2px solid #32cd32",
              background: "#111",
            }}
          />
        </span>
        <span>MIMI_AI.exe — Comprehensive Unit of Intelligence</span>
      </div>

      <BootSequence />

      {/* SECTION 4 HERO */}
      <section
        className="section-border hero-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 0,
          background: "#a5a2a2",
          borderBottom: "2px solid #000",
        }}
      >
        <div
          style={{
            borderRight: "2px solid #000",
            padding: "32px 24px",
            textAlign: "center",
          }}
        >
          <PixelImg file="mimi_infinity_3.png" alt="Mimi" style={{ maxWidth: 220, margin: "0 auto 20px" }} />
          <div
            className="logotype"
            style={{ fontSize: 20, color: "#4c5a42", marginBottom: 16, lineHeight: 1.6 }}
          >
            MIMI AI
          </div>
          <p
            style={{
              fontFamily: "Inconsolata, monospace",
              color: "#4c5a42",
              fontSize: 15,
              fontWeight: 600,
              margin: "0 0 20px",
              lineHeight: 1.5,
            }}
          >
            Sent from the future.
            <br />
            Built for your business.
          </p>
          <a
            href="#enlist"
            style={{
              display: "inline-block",
              background: "#32cd32",
              color: "#000",
              padding: "12px 20px",
              fontFamily: "Inconsolata, monospace",
              fontWeight: 700,
              textDecoration: "none",
              border: "2px solid #000",
            }}
          >
            ENLIST_NOW();
          </a>
          <div style={{ marginTop: 20 }}>
            <PixelImg file="mimi-hero-1.png" alt="Mimi full body" style={{ maxWidth: 160, margin: "0 auto" }} />
          </div>
        </div>
        <div style={{ padding: "24px 20px", background: "#a5a2a2" }}>
          <pre
            style={{
              background: "#1a1a1a",
              color: "#32cd32",
              padding: 16,
              fontSize: 12,
              margin: 0,
              border: "2px solid #000",
              overflow: "auto",
              fontFamily: "Inconsolata, monospace",
            }}
          >
            {`function Mimi_Initialize() {
  return {
    origin: "1993",
    deployed: "2026",
    status: "ONLINE",
    mission: "your_business"
  };
}`}
          </pre>
          <div
            style={{
              marginTop: 16,
              fontSize: 11,
              fontFamily: "Inconsolata, monospace",
              color: "#4c5a42",
              border: "2px solid #000",
              padding: 12,
              background: "#9e9b9b",
            }}
          >
            MIMI AI™ — The AI Business Operating System
            <br />
            USPTO #99682177 · Patent Pending
            <br />
            Mimi AI LLC · Vermont
          </div>
        </div>
      </section>

      {/* SECTION 5 MAC CHAT */}
      <section>
        <div className="chapter-bar">CHAPTER 2: MAKE_CONTACT(); // She&apos;s been waiting.</div>
        <div
          style={{
            background: "#9e9b9b",
            padding: "32px 20px",
            borderBottom: "2px solid #000",
            textAlign: "center",
          }}
        >
          <div style={{ position: "relative", display: "inline-block", maxWidth: 420 }}>
            <PixelImg file="mimi-mac-1.png" alt="Mac" style={{ width: "100%" }} />
            <div
              style={{
                position: "absolute",
                left: "18%",
                top: "28%",
                width: "52%",
                height: "38%",
                background: "#0a150a",
                border: "2px solid #32cd32",
                padding: 8,
                textAlign: "left",
                fontSize: 10,
                color: "#32cd32",
                fontFamily: "Inconsolata, monospace",
                overflow: "auto",
              }}
            >
              MIMI AI v1.0
              <br />
              Loading from disk...
              <br />
              Connection established.
              <br />
              MIMI &gt; Hello. I&apos;ve been expecting you._
            </div>
          </div>
          <div
            style={{
              maxWidth: 480,
              margin: "16px auto 0",
              textAlign: "left",
              background: "#1a1a1a",
              border: "2px solid #000",
              padding: 12,
              minHeight: 120,
              color: "#32cd32",
              fontSize: 12,
              fontFamily: "Inconsolata, monospace",
            }}
          >
            {macChat.msgs.map((m, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                {m.role === "user" ? `YOU> ${m.text}` : `MIMI> ${m.text}`}
              </div>
            ))}
          </div>
          <div style={{ maxWidth: 480, margin: "12px auto", display: "flex", gap: 8 }}>
            <input
              value={macChat.input}
              onChange={(e) => macChat.setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && macChat.send()}
              placeholder="Type message..."
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={macChat.send}
              style={{ background: "#32cd32", fontWeight: 700 }}
            >
              SEND
            </button>
          </div>
          <p style={{ fontSize: 11, color: "#4c5a42", marginTop: 16 }}>
            // Insert Mimi AI v1.0, 1993
          </p>
          <PixelImg file="mimi-floppy-3.png" alt="Floppy" style={{ maxWidth: 100, margin: "8px auto 0" }} />
        </div>
      </section>

      {/* SECTION 6 CRANE */}
      <section>
        <div className="chapter-bar">CHAPTER 3: SELECT YOUR UNIT — MIMI_SELECT();</div>
        <div
          style={{
            background: "#a5a2a2",
            padding: "24px 16px 32px",
            borderBottom: "2px solid #000",
          }}
        >
          <div
            style={{
              border: "2px solid #000",
              background: "#888",
              padding: 24,
              maxWidth: 720,
              margin: "0 auto",
              position: "relative",
              minHeight: 280,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-start", marginTop: 40 }}>
              <div style={{ textAlign: "center" }}>
                <PixelImg file="mimi-treat-you-v2.png" alt="FOR_YOU" style={{ width: 100, margin: "0 auto", outline: grabbed === "you" ? "3px solid #32cd32" : "none" }} />
                <div style={{ fontSize: 11, fontWeight: 700, marginTop: 8 }}>FOR_YOU</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <PixelImg file="mimi-treat-them-1.png" alt="FOR_THEM" style={{ width: 100, margin: "0 auto", outline: grabbed === "them" ? "3px solid #32cd32" : "none" }} />
                <div style={{ fontSize: 11, fontWeight: 700, marginTop: 8 }}>FOR_THEM</div>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                top: 8,
                left: `${craneX}%`,
                transform: "translateX(-50%)",
                transition: grabbed ? "none" : "left 0.15s linear",
              }}
            >
              <div style={{ width: 4, height: 80, background: "#000", margin: "0 auto" }} />
              <div style={{ width: 40, height: 16, background: "#32cd32", border: "2px solid #000", margin: "0 auto" }} />
            </div>
            {showExcited && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <PixelImg file="mimi-excited-3.png" alt="excited" style={{ maxWidth: 120, margin: "0 auto" }} />
              </div>
            )}
          </div>
          <div style={{ textAlign: "center", marginTop: 16, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <button type="button" onClick={() => moveCrane(-8)} style={{ background: "#32cd32", padding: "10px 16px" }}>
              ◀ LEFT
            </button>
            <button type="button" onClick={dropCrane} style={{ background: "#32cd32", padding: "10px 16px" }}>
              DROP ▼
            </button>
            <button type="button" onClick={() => moveCrane(8)} style={{ background: "#32cd32", padding: "10px 16px" }}>
              RIGHT ▶
            </button>
          </div>
          <p style={{ textAlign: "center", fontSize: 12, color: "#4c5a42", marginTop: 12 }}>
            // Move the crane. Grab your treat. Choose your unit.
          </p>
        </div>
      </section>

      {/* SECTION 7 PRODUCTS */}
      <section>
        <div className="chapter-bar">CHAPTER 4: THE TWO UNITS</div>
        <div className="product-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "2px solid #000" }}>
          <div
            ref={forYouRef}
            id="product-for-you"
            style={{
              borderRight: "2px solid #000",
              padding: 24,
              background: "#a5a2a2",
              outline: highlightYou ? "4px solid #32cd32" : "none",
            }}
          >
            <PixelImg file="mimi-for-you-final.png" alt="For You" style={{ maxWidth: 200, marginBottom: 16 }} />
            <h2 style={{ fontSize: 14, color: "#4c5a42", margin: "0 0 12px", lineHeight: 1.8 }}>
              MIMI FOR YOU
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {["SALES", "PT", "Q&A", "MENTAL HEALTH"].map((t) => (
                <span
                  key={t}
                  style={{
                    background: "#32cd32",
                    color: "#000",
                    padding: "4px 8px",
                    fontSize: 11,
                    fontWeight: 700,
                    border: "2px solid #000",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
            <pre
              style={{
                background: "#1a1a1a",
                color: "#32cd32",
                padding: 12,
                fontSize: 11,
                border: "2px solid #000",
                overflow: "auto",
                fontFamily: "Inconsolata, monospace",
              }}
            >
              Mimi.startChat(&quot;Hello! How can I help you today?&quot;);
            </pre>
          </div>
          <div
            ref={forThemRef}
            id="product-for-them"
            style={{
              padding: 24,
              background: "#a5a2a2",
              outline: highlightThem ? "4px solid #32cd32" : "none",
            }}
          >
            <PixelImg file="mimi-for-them-final.png" alt="For Them" style={{ maxWidth: 200, marginBottom: 16 }} />
            <h2 style={{ fontSize: 14, color: "#32cd32", margin: "0 0 12px", lineHeight: 1.8 }}>
              MIMI FOR THEM
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {["HR", "INVENTORY", "OPS", "INTERFACING"].map((t) => (
                <span
                  key={t}
                  style={{
                    background: "#32cd32",
                    color: "#000",
                    padding: "4px 8px",
                    fontSize: 11,
                    fontWeight: 700,
                    border: "2px solid #000",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
            <pre
              style={{
                background: "#1a1a1a",
                color: "#32cd32",
                padding: 12,
                fontSize: 11,
                border: "2px solid #000",
                overflow: "auto",
                fontFamily: "Inconsolata, monospace",
              }}
            >
              Mimi.prompt(&quot;Update inventory for [Unit_A].&quot;);
            </pre>
          </div>
        </div>
      </section>

      {/* SECTION 8 CRT */}
      <section>
        <div className="chapter-bar">CHAPTER 5: CLOSE_DEAL(); // Ready to deploy Mimi?</div>
        <div style={{ background: "#888", padding: "32px 20px", borderBottom: "2px solid #000", textAlign: "center" }}>
          <div style={{ position: "relative", display: "inline-block", maxWidth: 900, width: "100%" }}>
            <PixelImg file="mimi-crt-monitor-1.png" alt="CRT" style={{ width: "100%" }} />
            <div
              style={{
                position: "absolute",
                left: "12%",
                top: "18%",
                width: "76%",
                height: "52%",
                background: "#0a120a",
                border: "2px solid #32cd32",
                padding: 12,
                textAlign: "left",
                fontSize: 12,
                color: "#32cd32",
                fontFamily: "Inconsolata, monospace",
                overflow: "auto",
              }}
            >
              {crtChat.msgs.map((m, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  {m.role === "user" ? `YOU> ${m.text}` : `MIMI> ${m.text}`}
                </div>
              ))}
              {crtChat.msgs.length === 0 && (
                <>MIMI &gt; Tell me about your business. What do you do?_</>
              )}
            </div>
          </div>
          <div style={{ maxWidth: 520, margin: "16px auto 0", display: "flex", gap: 8 }}>
            <input
              value={crtChat.input}
              onChange={(e) => crtChat.setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && crtChat.send()}
              placeholder="Your business..."
              style={{ flex: 1 }}
            />
            <button type="button" onClick={crtChat.send} style={{ background: "#32cd32", fontWeight: 700 }}>
              SEND
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 9 ARCADE */}
      <section>
        <div className="chapter-bar">CHAPTER 6: MIMI_ARCADE(); // Missions incoming.</div>
        <div style={{ background: "#1a1a1a", padding: "32px 20px", borderBottom: "2px solid #000" }}>
          <h2 style={{ fontSize: 16, color: "#32cd32", textAlign: "center", margin: "0 0 24px", lineHeight: 1.8 }}>
            MIMI ARCADE
          </h2>
          <div className="arcade-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, maxWidth: 900, margin: "0 auto" }}>
            {["MIMI RUNS", "ALIEN INVASION", "CRANE MASTER"].map((title) => (
              <div
                key={title}
                style={{
                  border: "2px solid #32cd32",
                  background: "#111",
                  padding: 20,
                  textAlign: "center",
                  color: "#32cd32",
                  fontFamily: "Inconsolata, monospace",
                  fontSize: 12,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#32cd32";
                  e.currentTarget.style.color = "#000";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#111";
                  e.currentTarget.style.color = "#32cd32";
                }}
              >
                <strong>{title}</strong>
                <br />
                // LOCKED
              </div>
            ))}
          </div>
          <form onSubmit={notifyArcade} style={{ maxWidth: 400, margin: "28px auto 0", textAlign: "center" }}>
            <label style={{ display: "block", color: "#32cd32", marginBottom: 8, fontSize: 12 }}>
              Notify me when arcade goes live:
            </label>
            <input
              type="email"
              value={arcadeEmail}
              onChange={(e) => setArcadeEmail(e.target.value)}
              style={{ width: "100%", marginBottom: 8 }}
            />
            <button type="submit" style={{ background: "#32cd32", width: "100%", padding: 12, fontWeight: 700 }}>
              NOTIFY_ME();
            </button>
          </form>
        </div>
      </section>

      {/* SECTION 10 NODE */}
      <section>
        <div className="chapter-bar">CHAPTER 7: MIMI_NODE(); // Hardware transmission incoming.</div>
        <div style={{ background: "#1a1a1a", padding: "32px 20px", borderBottom: "2px solid #000" }}>
          <div className="node-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 900, margin: "0 auto" }}>
            <div style={{ border: "2px solid #32cd32", padding: 20, color: "#32cd32", fontSize: 12 }}>
              <strong>MIMI NODE — OFF-GRID EDITION</strong>
              <br />
              <br />
              // No screen. No internet. Just Mimi.
              <br />
              // STATUS: IN DEVELOPMENT
            </div>
            <div style={{ border: "2px solid #32cd32", padding: 20, color: "#32cd32", fontSize: 12 }}>
              <strong>MIMI NODE — ELDER EDITION</strong>
              <br />
              <br />
              // Mila on your counter. Vitals on your wrist.
              <br />
              // STATUS: IN DEVELOPMENT
            </div>
          </div>
          <form onSubmit={notifyNode} style={{ maxWidth: 400, margin: "24px auto 0", textAlign: "center" }}>
            <input
              type="email"
              value={nodeEmail}
              onChange={(e) => setNodeEmail(e.target.value)}
              placeholder="email"
              style={{ width: "100%", marginBottom: 8 }}
            />
            <button type="submit" style={{ background: "#32cd32", width: "100%", padding: 10 }}>
              NOTIFY ON NODE
            </button>
          </form>
        </div>
      </section>

      {/* SECTION 11 VACATION */}
      <section>
        <div className="chapter-bar">CHAPTER 8: MISSION_COMPLETE();</div>
        <div style={{ position: "relative", borderBottom: "2px solid #000" }}>
          <PixelImg file="mimi-vacation.png" alt="Vacation" style={{ width: "100%", maxHeight: 480, objectFit: "cover" }} />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              top: 0,
              background: "rgba(0,0,0,0.65)",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              fontFamily: "Inconsolata, monospace",
              fontSize: 14,
              color: "#32cd32",
            }}
          >
            <div>// Mission complete.</div>
            <div>// Mila has been deployed.</div>
            <div>// Our work here is done.</div>
            <div style={{ marginTop: 12 }}>ALIENS &gt; Now go enjoy yourself.</div>
            <div>MILA &gt; Already on it._</div>
          </div>
        </div>
      </section>

      {/* SECTION 12 SYSTEM MAP */}
      <section>
        <div className="chapter-bar">SYSTEM MAP — ALL CONNECTIONS LIVE</div>
        <div style={{ background: "#a5a2a2", padding: 24, borderBottom: "2px solid #000" }}>
          <div
            className="system-grid-4"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
              maxWidth: 800,
              margin: "0 auto 20px",
            }}
          >
            {[
              { n: "ORCHESTRATOR", lime: false },
              { n: "SUPABASE", lime: false },
              { n: "CLAUDE API", lime: false },
              { n: "FAL.AI", lime: false },
              { n: "NETLIFY", lime: true },
              { n: "STRIPE", lime: true },
              { n: "TWILIO", lime: true },
              { n: "RESEND", lime: true },
            ].map(({ n, lime }) => (
              <div
                key={n}
                style={{
                  border: "2px solid #000",
                  padding: 12,
                  textAlign: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  background: lime ? "#32cd32" : "#4c5a42",
                  color: lime ? "#000" : "#a5a2a2",
                }}
              >
                {n}
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", fontSize: 12, color: "#4c5a42", fontWeight: 600 }}>
            ▶ SEO Engine (weekly) | ▶ Social Content (2x daily) | ▶ Health Monitor (continuous) | ▶ SMS Digest
            (6am)
          </p>
        </div>
      </section>

      {/* SECTION 13 WAITLIST */}
      <section id="enlist">
        <div className="chapter-bar">ENLIST — MIMI_ENLIST(); // Reserve your unit.</div>
        <div
          className="waitlist-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 0,
            background: "#a5a2a2",
            borderBottom: "2px solid #000",
          }}
        >
          <div style={{ borderRight: "2px solid #000", padding: 28 }}>
            <h2 style={{ fontSize: 14, color: "#4c5a42", marginTop: 0, lineHeight: 1.8 }}>RESERVE YOUR UNIT.</h2>
            <p style={{ fontSize: 13, color: "#4c5a42" }}>
              Deploy Mimi on your site and ops. Stripe-secured checkout. Agreement + onboarding follow payment.
            </p>
            <ul style={{ paddingLeft: 20, color: "#4c5a42", fontSize: 12 }}>
              <li style={{ marginBottom: 8 }}>
                ◼ AI sales + chat on your domain
              </li>
              <li style={{ marginBottom: 8 }}>
                ◼ Weekly SEO + social automation
              </li>
              <li style={{ marginBottom: 8 }}>
                ◼ Health monitoring + SMS digest
              </li>
            </ul>
          </div>
          <div style={{ padding: 28 }}>
            <form onSubmit={enlist}>
              <label style={{ display: "block", fontSize: 11, marginBottom: 4 }}>Business name</label>
              <input
                value={wlBusiness}
                onChange={(e) => setWlBusiness(e.target.value)}
                style={{ width: "100%", marginBottom: 12 }}
                required
              />
              <label style={{ display: "block", fontSize: 11, marginBottom: 4 }}>Email</label>
              <input
                type="email"
                value={wlEmail}
                onChange={(e) => setWlEmail(e.target.value)}
                style={{ width: "100%", marginBottom: 12 }}
                required
              />
              <label style={{ display: "block", fontSize: 11, marginBottom: 4 }}>Unit</label>
              <select value={wlUnit} onChange={(e) => setWlUnit(e.target.value)} style={{ width: "100%", marginBottom: 16 }}>
                <option value="starter">MIMI FOR YOU (Starter)</option>
                <option value="for_them">MIMI FOR THEM (Pro)</option>
              </select>
              {wlStatus && (
                <p style={{ fontSize: 11, color: "#000", marginBottom: 8 }}>{wlStatus}</p>
              )}
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: 14,
                  background: "#32cd32",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                ENLIST_NOW();
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* SECTION 14 FOOTER */}
      <footer
        style={{
          background: "#1a1a1a",
          color: "#32cd32",
          padding: "24px 20px",
          fontSize: 10,
          fontFamily: "Inconsolata, monospace",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 16,
          alignItems: "end",
        }}
      >
        <div>
          <div>MIMI AI ◼ Sent from the future. Built for your business.</div>
          <div style={{ marginTop: 8 }}>
            Designed in Cupertino ◼ Built in Vermont ◼ © 2026 Mimi AI LLC
          </div>
          <div style={{ marginTop: 8 }}>USPTO #99682177 ◼ Patent Pending</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <PixelImg file="mimi-alien-parents-1.png" alt="" style={{ width: 56, height: "auto" }} />
          <PixelImg file="mimi-floppy-3.png" alt="" style={{ width: 48, height: "auto" }} />
          <PixelImg file="mimi-mothership-3.png" alt="" style={{ width: 56, height: "auto" }} />
        </div>
      </footer>
    </div>
  );
}
