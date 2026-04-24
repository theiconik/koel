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
          instead of a form, we'll have a short conversation. koel — our AI — will ask you a couple of things and listen. you just talk. no typing, no multiple choice.
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
            { n: "02", t: "just talk", d: "koel asks, you answer. pause as much as you need." },
            { n: "03", t: "tap to end", d: "when you're done, tap end. that's it." },
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

/* ──────────────────────────────── Chatting (the main event) ──────────────────────────────── */

function Chatting({ onEnd }) {
  // Conversation script — the AI asks, user answers via voice. We simulate a chat transcript.
  // User interactions: hold the mic / toggle recording; "I'm done" to end.
  const [turns, setTurns] = React.useState([
    { who: "koel", text: "hi — i'm koel. before we get into it, tell me a bit about yourself. what do you do, and how'd you end up trying roshi?", spoken: true },
  ]);
  const [recording, setRecording] = React.useState(false);
  const [aiSpeaking, setAiSpeaking] = React.useState(false);
  const [bars, setBars] = React.useState(Array.from({ length: 48 }, () => 24));
  const [elapsed, setElapsed] = React.useState(0);

  // Elapsed clock
  React.useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Animated waveform while recording
  React.useEffect(() => {
    if (!recording) { setBars(b => b.map(() => 14)); return; }
    const id = setInterval(() => setBars(b => b.map(() => 20 + Math.random() * 80)), 110);
    return () => clearInterval(id);
  }, [recording]);

  // Simulated script — each time the user "finishes speaking", push their line + an AI follow-up.
  const script = React.useRef([
    { user: "i'm a product lead at a fintech startup. we were looking for something softer than typeform for our onboarding feedback — something that felt like talking to a person.", ai: "that makes sense. when you say \"softer\" — what were the sharp edges with what you'd tried before?" },
    { user: "typeform is great, but the questions felt like a checklist. people gave short answers because the format invited short answers. i wanted stories.", ai: "and now that you've run a few surveys with koel — have the answers been different? any specific moment you remember?" },
    { user: "yeah, one of our users talked for four minutes straight about how confused they were by our pricing page. i don't think we'd have gotten that in a text box. that one response made us rewrite a whole section.", ai: "that's exactly what we hope for. one last thing — if a friend running a similar team asked you \"should i try this?\", what would you actually say to them?" },
    { user: "i'd tell them it pays for itself the first time a real person says something you didn't expect. it's a different kind of research — less like gathering data, more like having a conversation you wouldn't have had otherwise.", ai: "thank you — really. that's everything i wanted to ask. take your time, and tap \"i'm done\" when you're ready." },
  ]);
  const turnIdxRef = React.useRef(0);

  function toggleMic() {
    if (aiSpeaking) return;
    if (!recording) {
      setRecording(true);
    } else {
      // User just finished speaking.
      setRecording(false);
      const next = script.current[turnIdxRef.current];
      if (!next) return;
      turnIdxRef.current += 1;
      // Append user turn, then after a pause, AI "thinks" then responds.
      setTurns(t => [...t, { who: "user", text: next.user }]);
      setAiSpeaking(true);
      setTimeout(() => {
        setTurns(t => [...t, { who: "koel", text: next.ai, spoken: true }]);
        setAiSpeaking(false);
      }, 1400);
    }
  }

  const scrollRef = React.useRef(null);
  React.useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [turns, aiSpeaking]);

  const mm = Math.floor(elapsed / 60);
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#FAF7F2" }}>
      {/* Minimal top bar — just the timer and "end survey" affordance. */}
      <div style={{ padding: "18px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(26,26,46,0.06)" }}>
        <Mark/>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6F685B", fontFamily: "ui-monospace, monospace" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: recording ? "#B3412B" : "#4A7C59", animation: recording ? "pulse 1.2s ease-in-out infinite" : "none" }}/>
            {mm}:{ss}
          </div>
          <button onClick={onEnd} style={{ background: "transparent", border: "1px solid rgba(26,26,46,0.15)", color: "#4A4538", cursor: "pointer", fontSize: 13, padding: "7px 14px", borderRadius: 999, fontFamily: "'Manrope',sans-serif" }}>i'm done</button>
        </div>
      </div>

      {/* Conversation transcript — fills the available space, scrolls. */}
      <div ref={scrollRef} style={{ flex: 1, overflow: "auto", padding: "32px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
          {turns.map((t, i) => (
            <ChatTurn key={i} turn={t}/>
          ))}
          {aiSpeaking && <ThinkingBubble/>}
        </div>
      </div>

      {/* The mic dock — the one thing a respondent actually interacts with. */}
      <div style={{ borderTop: "1px solid rgba(26,26,46,0.08)", background: "#FAF7F2", padding: "24px 24px 32px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", gap: 20 }}>
          <button onClick={toggleMic} disabled={aiSpeaking} style={{
            width: 80, height: 80, borderRadius: "50%", border: "none", flexShrink: 0,
            background: recording ? "#E8B04B" : aiSpeaking ? "rgba(26,26,46,0.15)" : "#1A1A2E",
            color: recording ? "#1A1A2E" : "#FAF7F2",
            cursor: aiSpeaking ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: recording ? "0 0 0 8px rgba(232,176,75,0.20), 0 12px 32px rgba(26,26,46,0.18)" : "0 8px 24px rgba(26,26,46,0.14)",
            transition: "all 200ms cubic-bezier(0.22,1,0.36,1)",
            animation: recording ? "pulse 1.3s ease-in-out infinite" : "none",
          }}>
            {recording
              ? <div style={{ width: 22, height: 22, borderRadius: 4, background: "#1A1A2E" }}/>
              : <MicIcon size={32}/>}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: recording ? "#B3412B" : aiSpeaking ? "#6F685B" : "#4A4538", fontWeight: 700 }}>
              {aiSpeaking ? "KOEL IS THINKING" : recording ? "LISTENING · TAP WHEN DONE" : "TAP TO SPEAK"}
            </div>
            <div style={{ fontSize: 13, color: "#6F685B", marginTop: 4 }}>
              {aiSpeaking ? "she'll be right with a follow-up." : recording ? "take your time. pauses are fine." : "koel will ask a follow-up after each answer."}
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 28, marginTop: 10 }}>
              {bars.map((h, i) => <div key={i} style={{ width: 3, height: `${h}%`, background: recording ? "#E8B04B" : "rgba(26,26,46,0.18)", borderRadius: 2, transition: "height 110ms linear" }}/>)}
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 720, margin: "16px auto 0", fontSize: 11, color: "#6F685B", textAlign: "center", letterSpacing: "0.04em" }}>
          you can end any time · nothing is recorded when the mic is off
        </div>
      </div>
    </div>
  );
}

function ChatTurn({ turn }) {
  if (turn.who === "koel") {
    return (
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", animation: "slideUp 300ms cubic-bezier(0.22,1,0.36,1)" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1A1A2E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
          <img src="../../assets/koel-logo.svg" alt="" style={{ height: 26, width: "auto", filter: "invert(1)", maxWidth: "none" }}/>
        </div>
        <div style={{ flex: 1, paddingTop: 4 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6F685B", fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            KOEL {turn.spoken && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#4A7C59", textTransform: "none", letterSpacing: 0, fontWeight: 500 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 5 6 9H2v6h4l5 4V5zM19 12c0-2-1-3.5-2-4.5M16 8c.6.7 1 1.7 1 3"/></svg>
              speaking
            </span>}
          </div>
          <div style={{ fontFamily: "'Absans',serif", fontSize: 22, lineHeight: 1.35, color: "#1A1A2E", letterSpacing: "-0.005em", textWrap: "pretty" }}>{turn.text}</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", animation: "slideUp 300ms cubic-bezier(0.22,1,0.36,1)" }}>
      <div style={{ maxWidth: "78%", background: "#1A1A2E", color: "#FAF7F2", padding: "14px 18px", borderRadius: "16px 16px 4px 16px", fontSize: 15, lineHeight: 1.55, fontFamily: "'Manrope',sans-serif" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(250,247,242,0.55)", fontWeight: 600, marginBottom: 4 }}>YOU · transcribed</div>
        {turn.text}
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1A1A2E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
        <img src="../../assets/koel-logo.svg" alt="" style={{ height: 26, width: "auto", filter: "invert(1)", maxWidth: "none" }}/>
      </div>
      <div style={{ padding: "14px 0", display: "flex", alignItems: "center", gap: 6 }}>
        {[0,1,2].map(i => (
          <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#6F685B", animation: `thinkDot 1.2s ${i * 0.15}s ease-in-out infinite` }}/>
        ))}
      </div>
    </div>
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
