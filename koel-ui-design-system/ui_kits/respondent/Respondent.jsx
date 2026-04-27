/* Respondent UI kit — standalone flow for people taking a koel survey.

   Core insight: respondents never see "questions" as a list. The AI asks; they talk.
   The only things they tap are: Start → (Mic while talking) → End.

   Stages:
     landing     → brand, name of survey, "start" button
     permission  → microphone permission primer
     chatting    → live conversation with AI: transcript-style, big mic, AI speaks first
     ending      → confirmation before finishing
     thanks      → thank-you screen
*/

function Mark() {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <img src="../../assets/koel-logo.svg" alt="" style={{ height: 24, width: "auto", display: "block" }}/>
      <span style={{ fontFamily: "'Absans',serif", fontSize: 24, color: "#1A1A2E", letterSpacing: "-0.02em", lineHeight: 1 }}>koel</span>
    </div>
  );
}

function MicIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <path d="M12 19v3"/>
    </svg>
  );
}

function ArrowRight({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}

function CheckIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

/* A chrome header for all respondent stages — brand left, minimal on right. */
function Header({ right }) {
  return (
    <div style={{ padding: "22px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1160, margin: "0 auto" }}>
      <Mark/>
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12, color: "#6F685B" }}>{right}</div>
    </div>
  );
}

/* Button style consistent with rest of the system. */
function RespButton({ variant = "primary", children, onClick, style, disabled }) {
  const base = {
    fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 15,
    borderRadius: 999, padding: "14px 26px", border: "none",
    cursor: disabled ? "default" : "pointer",
    transition: "all 180ms cubic-bezier(0.22,1,0.36,1)", lineHeight: 1,
    display: "inline-flex", alignItems: "center", gap: 8,
    opacity: disabled ? 0.5 : 1,
  };
  const variants = {
    primary: { background: "#1A1A2E", color: "#FAF7F2" },
    gold:    { background: "#E8B04B", color: "#1A1A2E" },
    outline: { background: "transparent", color: "#1A1A2E", border: "1px solid rgba(26,26,46,0.20)", padding: "13px 25px" },
    ghost:   { background: "transparent", color: "#4A4538", padding: "13px 20px" },
  };
  return <button disabled={disabled} onClick={onClick} style={{ ...base, ...variants[variant], ...style }}>{children}</button>;
}

/* ──────────────────────────────── Root ──────────────────────────────── */

function RespondentApp() {
  const [stage, setStage] = React.useState("landing"); // landing | permission | chatting | ending | thanks

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", display: "flex", flexDirection: "column" }}>
      {stage !== "chatting" && <Header right={<span>hosted by <strong style={{ color: "#1A1A2E", fontWeight: 600 }}>roshi research</strong></span>}/>}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {stage === "landing"    && <Landing onStart={() => setStage("permission")}/>}
        {stage === "permission" && <Permission onAllow={() => setStage("chatting")} onBack={() => setStage("landing")}/>}
        {stage === "chatting"   && <Chatting onEnd={() => setStage("ending")}/>}
        {stage === "ending"     && <Ending onConfirm={() => setStage("thanks")} onCancel={() => setStage("chatting")}/>}
        {stage === "thanks"     && <Thanks onRestart={() => setStage("landing")}/>}
      </div>
      {stage !== "chatting" && <RespFooter/>}
    </div>
  );
}

function RespFooter() {
  return (
    <div style={{ padding: "20px 28px", fontSize: 12, color: "#6F685B", textAlign: "center", borderTop: "1px solid rgba(26,26,46,0.05)" }}>
      powered by <span style={{ color: "#1A1A2E", fontWeight: 600 }}>koel</span> · your voice is encrypted · <span style={{ cursor: "pointer", textDecoration: "underline" }}>privacy</span>
    </div>
  );
}

/* ──────────────────────────────── Landing ──────────────────────────────── */

function Landing({ onStart }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 28px" }}>
      <div style={{ maxWidth: 680, textAlign: "center", animation: "slideUp 400ms cubic-bezier(0.22,1,0.36,1)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F2EEE6", color: "#4A4538", padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E8B04B" }}/> a voice survey · 3 min
        </div>
        <h1 style={{ fontFamily: "'Absans',serif", fontSize: "clamp(40px, 6vw, 64px)", lineHeight: 1.08, color: "#1A1A2E", letterSpacing: "-0.02em", marginTop: 24, marginBottom: 16, textWrap: "balance" }}>
          we'd love to hear how your first week with roshi went.
        </h1>
        <p style={{ fontSize: 17, color: "#4A4538", lineHeight: 1.65, maxWidth: 560, margin: "0 auto 36px" }}>
          instead of a form, we'll have a short conversation. koel — our AI — will speak first and listen as you answer. no typing, no multiple choice. just talk.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <RespButton variant="gold" onClick={onStart}>
            start survey <ArrowRight size={16}/>
          </RespButton>
          <RespButton variant="outline">read what we do with your voice</RespButton>
        </div>

        <div style={{ marginTop: 56, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, maxWidth: 560, margin: "56px auto 0", textAlign: "left" }}>
          {[
            { n: "01", t: "tap start", d: "we'll ask for your mic — nothing else." },
            { n: "02", t: "just talk", d: "koel speaks first. you answer. pause as much as you need." },
            { n: "03", t: "end when ready", d: "tap end survey at the top to wrap up. that's it." },
          ].map(x => (
            <div key={x.n}>
              <div style={{ fontFamily: "'Absans',serif", fontSize: 20, color: "#E8B04B", lineHeight: 1 }}>{x.n}</div>
              <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 14, color: "#1A1A2E", marginTop: 8 }}>{x.t}</div>
              <div style={{ fontSize: 13, color: "#6F685B", marginTop: 4, lineHeight: 1.5 }}>{x.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────── Permission ──────────────────────────────── */

function Permission({ onAllow, onBack }) {
  const [state, setState] = React.useState("idle"); // idle | requesting | granted
  function grant() {
    setState("requesting");
    setTimeout(() => { setState("granted"); setTimeout(onAllow, 400); }, 900);
  }
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 28px" }}>
      <div style={{ maxWidth: 520, textAlign: "center", animation: "slideUp 400ms cubic-bezier(0.22,1,0.36,1)" }}>
        <div style={{
          width: 128, height: 128, borderRadius: "50%", background: state === "granted" ? "#EAF1EC" : "#fff",
          border: "1px solid rgba(26,26,46,0.10)", display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 32px", color: state === "granted" ? "#4A7C59" : "#1A1A2E",
          transition: "all 220ms", animation: state === "requesting" ? "pulse 1.1s ease-in-out infinite" : "none",
        }}>
          {state === "granted" ? <CheckIcon size={48}/> : <MicIcon size={48}/>}
        </div>
        <h2 style={{ fontFamily: "'Absans',serif", fontSize: 36, lineHeight: 1.12, color: "#1A1A2E", letterSpacing: "-0.015em", margin: "0 0 14px", textWrap: "balance" }}>
          {state === "granted" ? "thank you. let's begin." : "koel needs your microphone."}
        </h2>
        <p style={{ fontSize: 15, color: "#4A4538", lineHeight: 1.65, margin: "0 auto 28px", maxWidth: 420 }}>
          {state === "granted"
            ? "connecting you to the conversation…"
            : "when you tap allow, your browser will ask permission. we only record while you're talking."}
        </p>
        {state !== "granted" && (
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <RespButton variant="ghost" onClick={onBack}>back</RespButton>
            <RespButton variant="primary" onClick={grant} disabled={state === "requesting"}>
              {state === "requesting" ? "asking your browser…" : "allow microphone"}
            </RespButton>
          </div>
        )}
        <div style={{ marginTop: 28, fontSize: 12, color: "#6F685B" }}>
          you can stop at any time. nothing is shared without your consent.
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────── Chatting (voice-first) ────────────────────────────────

   No chat bubbles. No transcript. The respondent talks, koel talks back.
   The whole screen is a single living orb on a midnight surface — the orb breathes
   while koel speaks, ripples while koel listens, and quiets while koel thinks.

   States: koel-speaking → listening → thinking → koel-speaking → …
   The user can interrupt by tapping the orb (cuts koel off, switches to listening).
   The only durable affordance is the small "end survey" pill, top-right.
*/

function Chatting({ onEnd }) {
  // Conversation script. ElevenLabs would drive this in production; here we run it on a timer.
  const script = React.useRef([
    "hi — i'm koel. before we get into it, tell me a bit about yourself. what do you do, and how'd you end up trying roshi?",
    "that makes sense. when you say it felt softer than what you'd tried — what were the sharp edges with the old way?",
    "and now that you've run a few surveys with koel — have the answers been different? any moment you remember?",
    "if a friend running a similar team asked you, should i try this — what would you actually say to them?",
    "thank you — really. that's everything i wanted to ask. whenever you're ready, you can end the survey by tapping the button at the top.",
  ]);

  // mode: 'speaking' (koel talking) | 'listening' (user talking) | 'thinking' (processing)
  const [mode, setMode] = React.useState("speaking");
  const [turn, setTurn] = React.useState(0);          // index into script
  const [elapsed, setElapsed] = React.useState(0);
  const [level, setLevel] = React.useState(0.3);      // 0..1, drives orb intensity
  const [captionVisible, setCaptionVisible] = React.useState(true);
  const lastTurn = turn >= script.current.length - 1;

  // Wall clock
  React.useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Drive a "level" oscillation per mode — simulates voice amplitude.
  React.useEffect(() => {
    let raf;
    let t = 0;
    const tick = () => {
      t += 0.05;
      let v;
      if (mode === "speaking")      v = 0.55 + 0.35 * (Math.sin(t * 1.7) * 0.5 + 0.5) + (Math.random() - 0.5) * 0.08;
      else if (mode === "listening") v = 0.35 + Math.random() * 0.55;
      else                           v = 0.18 + (Math.sin(t * 0.9) * 0.5 + 0.5) * 0.12;
      setLevel(Math.max(0.05, Math.min(1, v)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  // Scripted turn-taking timeline: speaking → listening → thinking → next turn.
  React.useEffect(() => {
    if (mode === "speaking") {
      // koel speaks for a duration based on text length
      const dur = 2200 + script.current[turn].length * 32;
      const id = setTimeout(() => {
        if (lastTurn) return; // hold on the closing line; user taps "end survey"
        setMode("listening");
      }, dur);
      return () => clearTimeout(id);
    }
    if (mode === "listening") {
      // simulate user answering for a beat
      const id = setTimeout(() => setMode("thinking"), 6500);
      return () => clearTimeout(id);
    }
    if (mode === "thinking") {
      const id = setTimeout(() => {
        setTurn(n => n + 1);
        setMode("speaking");
      }, 1600);
      return () => clearTimeout(id);
    }
  }, [mode, turn, lastTurn]);

  // Caption fade-out → in on turn change while koel speaks.
  React.useEffect(() => {
    if (mode === "speaking") {
      setCaptionVisible(false);
      const id = setTimeout(() => setCaptionVisible(true), 60);
      return () => clearTimeout(id);
    }
  }, [turn, mode]);

  function tapOrb() {
    // Tapping mid-koel-speech interrupts; tapping while listening is a no-op (always-on mic).
    if (mode === "speaking") setMode("listening");
  }

  const mm = Math.floor(elapsed / 60);
  const ss = String(elapsed % 60).padStart(2, "0");

  const status = mode === "speaking" ? "koel is speaking"
              : mode === "listening" ? "koel is listening"
              : "thinking…";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0E0E1C", color: "#FAF7F2", position: "relative", overflow: "hidden" }}>

      {/* Atmospheric backdrop — three soft tinted blobs that drift behind the orb. Adds depth without imagery. */}
      <BackdropAtmosphere/>

      {/* Top chrome — minimal: wordmark left, timer + end survey right */}
      <div style={{ position: "relative", zIndex: 2, padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <img src="../../assets/koel-logo.svg" alt="" style={{ height: 22, width: "auto", filter: "invert(1) brightness(1.2)" }}/>
          <span style={{ fontFamily: "'Absans',serif", fontSize: 22, color: "#FAF7F2", letterSpacing: "-0.02em", lineHeight: 1 }}>koel</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(250,247,242,0.55)", fontFamily: "ui-monospace, monospace", letterSpacing: "0.04em" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: mode === "listening" ? "#F08A63" : mode === "speaking" ? "#E8B04B" : "rgba(250,247,242,0.4)", boxShadow: mode === "listening" ? "0 0 12px #F08A63" : mode === "speaking" ? "0 0 10px #E8B04B" : "none", transition: "background 220ms, box-shadow 220ms" }}/>
            {mm}:{ss}
          </div>
          <button onClick={onEnd} style={{
            background: "rgba(250,247,242,0.06)", border: "1px solid rgba(250,247,242,0.18)",
            color: "#FAF7F2", cursor: "pointer", fontSize: 13, padding: "8px 16px",
            borderRadius: 999, fontFamily: "'Manrope',sans-serif", fontWeight: 500,
            transition: "all 180ms cubic-bezier(0.22,1,0.36,1)", display: "inline-flex", alignItems: "center", gap: 8,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(240,138,99,0.18)"; e.currentTarget.style.borderColor = "rgba(240,138,99,0.5)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(250,247,242,0.06)"; e.currentTarget.style.borderColor = "rgba(250,247,242,0.18)"; }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: "#F08A63" }}/>
            end survey
          </button>
        </div>
      </div>

      {/* Stage */}
      <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px 40px", textAlign: "center" }}>

        {/* The orb */}
        <Orb mode={mode} level={level} onTap={tapOrb}/>

        {/* Status pill */}
        <div style={{ marginTop: 56, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 16px", background: "rgba(250,247,242,0.06)", border: "1px solid rgba(250,247,242,0.12)", borderRadius: 999, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, color: "rgba(250,247,242,0.78)" }}>
          {mode === "thinking"
            ? <ThinkingDots/>
            : <span style={{ width: 6, height: 6, borderRadius: "50%", background: mode === "listening" ? "#F08A63" : "#E8B04B", boxShadow: mode === "listening" ? "0 0 10px #F08A63" : "0 0 10px #E8B04B" }}/>}
          {status}
        </div>

        {/* Caption — what koel is saying, or a hint if listening */}
        <div style={{ marginTop: 28, maxWidth: 640, minHeight: 96 }}>
          {mode === "speaking" && (
            <div key={turn} style={{
              fontFamily: "'Absans',serif", fontSize: "clamp(22px, 2.6vw, 30px)",
              lineHeight: 1.32, letterSpacing: "-0.01em", color: "#FAF7F2",
              textWrap: "pretty",
              animation: captionVisible ? "captionIn 360ms cubic-bezier(0.22,1,0.36,1) both" : "none",
              opacity: captionVisible ? 1 : 0,
            }}>
              {script.current[turn]}
            </div>
          )}
          {mode === "listening" && (
            <div style={{ animation: "captionIn 320ms cubic-bezier(0.22,1,0.36,1)" }}>
              <div style={{ fontFamily: "'Absans',serif", fontSize: "clamp(22px, 2.6vw, 30px)", lineHeight: 1.32, color: "rgba(250,247,242,0.92)", letterSpacing: "-0.01em" }}>
                go ahead — i'm listening.
              </div>
              <div style={{ marginTop: 10, fontSize: 13, color: "rgba(250,247,242,0.5)" }}>
                pause as much as you want. i'll wait.
              </div>
            </div>
          )}
          {mode === "thinking" && (
            <div style={{ animation: "captionIn 320ms cubic-bezier(0.22,1,0.36,1)", fontFamily: "'Absans',serif", fontSize: "clamp(22px, 2.6vw, 30px)", color: "rgba(250,247,242,0.7)", letterSpacing: "-0.01em" }}>
              hmm — let me think for a second.
            </div>
          )}
        </div>

        {/* Footnote */}
        <div style={{ position: "absolute", bottom: 32, left: 0, right: 0, fontSize: 11, color: "rgba(250,247,242,0.42)", letterSpacing: "0.06em", textAlign: "center" }}>
          {mode === "speaking" ? "tap the orb to interrupt · " : ""}
          your voice is encrypted · nothing is recorded after you end
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────── Orb ──────────────────────────────── */

function Orb({ mode, level, onTap }) {
  const SIZE = 280;

  // Scale based on level — much more pronounced when speaking.
  const speakScale = mode === "speaking" ? 1 + level * 0.06 : 1;
  const listenScale = mode === "listening" ? 1 + level * 0.025 : 1;
  const thinkScale = mode === "thinking" ? 0.95 : 1;
  const scale = speakScale * listenScale * thinkScale;

  // Color identity per mode (within brand):
  //   speaking  → coral + mango (warm, expressive)
  //   listening → mango + cream (open, calm; mango is the "active" voice color)
  //   thinking  → cool indigo wash (dim, recede)
  const palette = {
    speaking:  { c1: "#F8C173", c2: "#F08A63", c3: "#E8B04B", glow: "rgba(240,138,99,0.55)" },
    listening: { c1: "#FAF7F2", c2: "#E8B04B", c3: "#C48B23", glow: "rgba(232,176,75,0.45)" },
    thinking:  { c1: "#3A3A6A", c2: "#22223D", c3: "#1A1A2E", glow: "rgba(58,58,106,0.35)" },
  }[mode];

  return (
    <div style={{ position: "relative", width: SIZE, height: SIZE, display: "flex", alignItems: "center", justifyContent: "center" }}>

      {/* Outer ripples — only when listening, bursting outward */}
      {mode === "listening" && [0, 1, 2].map(i => (
        <div key={i} style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "1px solid rgba(232,176,75,0.45)",
          animation: `ringPulse 2.4s ${i * 0.8}s ease-out infinite`,
        }}/>
      ))}

      {/* Big diffuse glow halo */}
      <div style={{
        position: "absolute", inset: -60, borderRadius: "50%",
        background: `radial-gradient(circle, ${palette.glow} 0%, transparent 65%)`,
        opacity: mode === "thinking" ? 0.35 : 0.7 + level * 0.3,
        filter: "blur(8px)",
        transition: "opacity 220ms",
      }}/>

      {/* Outer ring — slow rotation, only visible while speaking */}
      {mode === "speaking" && (
        <div style={{
          position: "absolute", inset: -10, borderRadius: "50%",
          background: `conic-gradient(from 0deg, transparent 0deg, ${palette.c1} 60deg, transparent 120deg, ${palette.c2} 200deg, transparent 260deg, ${palette.c3} 320deg, transparent 360deg)`,
          opacity: 0.35,
          filter: "blur(10px)",
          animation: "spinSlow 8s linear infinite",
        }}/>
      )}

      {/* Reactive radial bars — listening only, around the orb */}
      {mode === "listening" && <RadialBars size={SIZE} level={level}/>}

      {/* The orb itself */}
      <button onClick={onTap} aria-label={mode === "speaking" ? "interrupt" : "voice orb"} style={{
        position: "relative",
        width: SIZE, height: SIZE,
        borderRadius: "50%",
        border: "none",
        cursor: mode === "speaking" ? "pointer" : "default",
        padding: 0,
        background: `
          radial-gradient(circle at 30% 28%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.10) 22%, transparent 38%),
          radial-gradient(circle at 70% 75%, ${palette.c3} 0%, transparent 55%),
          radial-gradient(circle at 50% 50%, ${palette.c1} 0%, ${palette.c2} 45%, ${palette.c3} 100%)
        `,
        boxShadow: `
          inset 0 0 60px rgba(255,255,255,0.18),
          inset -30px -40px 80px rgba(26,26,46,0.45),
          0 30px 80px ${palette.glow},
          0 0 0 1px rgba(255,255,255,0.08)
        `,
        transform: `scale(${scale})`,
        transition: "transform 100ms linear, background 400ms",
        animation: mode === "speaking" ? "orbSpeak 0.9s ease-in-out infinite" : "orbBreathe 4s ease-in-out infinite",
        overflow: "hidden",
      }}>
        {/* Internal flowing color blobs — gives the surface life */}
        <div style={{
          position: "absolute", inset: "-20%", borderRadius: "50%",
          background: `radial-gradient(circle at 30% 40%, ${palette.c1} 0%, transparent 35%)`,
          mixBlendMode: "screen", opacity: 0.7,
          animation: "drift1 7s ease-in-out infinite",
        }}/>
        <div style={{
          position: "absolute", inset: "-20%", borderRadius: "50%",
          background: `radial-gradient(circle at 70% 60%, ${palette.c2} 0%, transparent 40%)`,
          mixBlendMode: "screen", opacity: 0.6,
          animation: "drift2 9s ease-in-out infinite",
        }}/>
        <div style={{
          position: "absolute", inset: "-20%", borderRadius: "50%",
          background: `radial-gradient(circle at 50% 80%, ${palette.c3} 0%, transparent 40%)`,
          mixBlendMode: "screen", opacity: 0.5,
          animation: "drift3 11s ease-in-out infinite",
        }}/>
        {/* Highlight gloss on top */}
        <div style={{
          position: "absolute", top: "8%", left: "18%", width: "44%", height: "30%",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, transparent 70%)",
          filter: "blur(2px)",
        }}/>
      </button>
    </div>
  );
}

/* Reactive radial bars surrounding the orb, ear-like — only during listening */
function RadialBars({ size, level }) {
  const COUNT = 64;
  // Generate a stable per-bar phase + a live amplitude jitter
  const seeds = React.useMemo(() => Array.from({ length: COUNT }, (_, i) => Math.sin(i * 12.9898) * 43758.5453 % 1), []);
  return (
    <div style={{ position: "absolute", inset: -36, pointerEvents: "none" }}>
      {Array.from({ length: COUNT }).map((_, i) => {
        const angle = (i / COUNT) * 360;
        const seed = Math.abs(seeds[i] || 0.5);
        const amp = 0.4 + seed * 0.6;
        const len = 6 + level * 22 * amp + Math.random() * 4;
        return (
          <div key={i} style={{
            position: "absolute", left: "50%", top: "50%",
            width: 2, height: len, marginLeft: -1, marginTop: -(size/2 + 4 + len),
            background: "linear-gradient(to bottom, #E8B04B, rgba(232,176,75,0))",
            borderRadius: 2,
            transform: `rotate(${angle}deg)`,
            transformOrigin: `1px ${size/2 + 4 + len}px`,
            opacity: 0.7,
          }}/>
        );
      })}
    </div>
  );
}

/* Ambient backdrop blobs */
function BackdropAtmosphere() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 1, pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "60%", height: "60%", borderRadius: "50%", background: "radial-gradient(circle, rgba(240,138,99,0.10) 0%, transparent 65%)", filter: "blur(40px)", animation: "drift1 18s ease-in-out infinite" }}/>
      <div style={{ position: "absolute", bottom: "-25%", right: "-15%", width: "70%", height: "70%", borderRadius: "50%", background: "radial-gradient(circle, rgba(232,176,75,0.08) 0%, transparent 65%)", filter: "blur(50px)", animation: "drift2 22s ease-in-out infinite" }}/>
      <div style={{ position: "absolute", top: "20%", right: "10%", width: "40%", height: "40%", borderRadius: "50%", background: "radial-gradient(circle, rgba(74,124,89,0.06) 0%, transparent 65%)", filter: "blur(40px)", animation: "drift3 26s ease-in-out infinite" }}/>
    </div>
  );
}

function ThinkingDots() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      {[0,1,2].map(i => (
        <span key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(250,247,242,0.7)", animation: `thinkDot 1.2s ${i * 0.15}s ease-in-out infinite` }}/>
      ))}
    </span>
  );
}

/* ──────────────────────────────── Ending confirmation ──────────────────────────────── */

function Ending({ onConfirm, onCancel }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 28px" }}>
      <div style={{ maxWidth: 520, textAlign: "center", animation: "slideUp 320ms cubic-bezier(0.22,1,0.36,1)" }}>
        <h2 style={{ fontFamily: "'Absans',serif", fontSize: 36, lineHeight: 1.15, color: "#1A1A2E", letterSpacing: "-0.015em", margin: "0 0 14px", textWrap: "balance" }}>
          ready to wrap up?
        </h2>
        <p style={{ fontSize: 15, color: "#4A4538", lineHeight: 1.65, margin: "0 auto 32px", maxWidth: 420 }}>
          we'll send your conversation to the team at roshi research. you won't be able to add more after this.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <RespButton variant="outline" onClick={onCancel}>not yet — keep talking</RespButton>
          <RespButton variant="primary" onClick={onConfirm}>yes, i'm done <CheckIcon size={14}/></RespButton>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────── Thanks ──────────────────────────────── */

function Thanks({ onRestart }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 28px" }}>
      <div style={{ maxWidth: 620, textAlign: "center", animation: "slideUp 400ms cubic-bezier(0.22,1,0.36,1)" }}>
        <div style={{
          width: 88, height: 88, borderRadius: "50%", background: "#EAF1EC",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 28px", color: "#4A7C59",
        }}>
          <CheckIcon size={40}/>
        </div>
        <h1 style={{ fontFamily: "'Absans',serif", fontSize: "clamp(36px, 5vw, 52px)", lineHeight: 1.1, color: "#1A1A2E", letterSpacing: "-0.015em", margin: "0 0 16px", textWrap: "balance" }}>
          thank you for your voice.
        </h1>
        <p style={{ fontSize: 16, color: "#4A4538", lineHeight: 1.7, margin: "0 auto 32px", maxWidth: 500 }}>
          roshi research has your conversation. they read every response — a real person, not a dashboard. it makes a difference. really.
        </p>

        <div style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.10)", borderRadius: 16, padding: 22, textAlign: "left", maxWidth: 440, margin: "0 auto 28px" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6F685B", fontWeight: 600, marginBottom: 10 }}>WHAT HAPPENS NEXT</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "your audio is encrypted and sent to the team.",
              "koel transcribes and organizes it alongside other voices.",
              "you'll get a copy of the transcript by email if you want one.",
            ].map((x, i) => (
              <div key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: "#1A1A2E", lineHeight: 1.5 }}>
                <span style={{ fontFamily: "'Absans',serif", color: "#E8B04B", flexShrink: 0 }}>{String(i+1).padStart(2,"0")}</span>
                <span>{x}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <RespButton variant="outline" onClick={onRestart}>email me a transcript</RespButton>
          <RespButton variant="ghost" onClick={onRestart}>start over (demo)</RespButton>
        </div>

        <div style={{ marginTop: 40, fontSize: 12, color: "#6F685B" }}>
          want to run your own voice surveys? <a href="../marketing/index.html" style={{ color: "#1A1A2E", fontWeight: 600, textDecoration: "underline" }}>learn about koel</a>
        </div>
      </div>
    </div>
  );
}
