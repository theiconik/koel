/* App UI kit — survey creator dashboard + respondent voice session */

function Icon({ name, size = 20, stroke = 1.75 }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    mic: <><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/></>,
    home: <><path d="M3 12 12 3l9 9"/><path d="M5 10v10h14V10"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    search: <><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    chart: <><path d="M3 12h3m12 0h3"/><path d="M7 6v12M17 6v12"/><path d="M10 9v6M14 9v6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    folder: <><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></>,
    check: <><path d="M20 6 9 17l-5-5"/></>,
    play: <><polygon points="6 4 20 12 6 20 6 4"/></>,
    send: <><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7z"/></>,
    chevron: <><polyline points="9 18 15 12 9 6"/></>,
    bird: <><path d="M3 13c3-6 8-7 12-5 1 2 3 3 6 3-1 3-5 6-10 6-4 0-7-1-8-4z"/><circle cx="15" cy="10" r=".6" fill="currentColor"/></>,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></>,
  };
  return <svg {...props}>{paths[name]}</svg>;
}

function AppBrand({ size = 26 }) {
  // Pair logo mark + "koel" wordmark, sized to visually match.
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px" }}>
      <img src="../../assets/koel-logo.svg" alt="" style={{ height: size, width: "auto", display: "block", flexShrink: 0 }}/>
      <span style={{ fontFamily: "'Absans',serif", fontSize: size, letterSpacing: "-0.02em", color: "#1A1A2E", lineHeight: 1 }}>koel</span>
    </div>
  );
}

function Sidebar({ active, onSelect }) {
  const items = [
    { k: "home", i: "home", l: "Home" },
    { k: "responses", i: "mic", l: "Responses" },
    { k: "insights", i: "chart", l: "Insights" },
    { k: "settings", i: "settings", l: "Settings" },
  ];
  return (
    <aside style={{ width: 240, background: "#F2EEE6", borderRight: "1px solid rgba(26,26,46,0.08)", padding: "20px 12px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
      <AppBrand/>
      <div style={{ height: 12 }}/>
      <button onClick={() => onSelect("new")} style={{
        display: "flex", alignItems: "center", gap: 8, background: "#1A1A2E", color: "#FAF7F2",
        border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer",
        fontFamily: "'Manrope',sans-serif", margin: "6px 4px 14px"
      }}>
        <Icon name="plus" size={16}/> New survey
      </button>
      {items.map(it => (
        <button key={it.k} onClick={() => onSelect(it.k)} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
          background: active === it.k ? "rgba(26,26,46,0.06)" : "transparent",
          border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "'Manrope',sans-serif",
          fontSize: 14, fontWeight: active === it.k ? 600 : 500, color: "#1A1A2E", textAlign: "left",
        }}>
          <span style={{ color: active === it.k ? "#1A1A2E" : "#6F685B" }}><Icon name={it.i} size={18}/></span>
          {it.l}
        </button>
      ))}
      <div style={{ flex: 1 }}/>
      <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#4A4538" }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#D4CCBB" }}/>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontWeight: 600, color: "#1A1A2E" }}>priya m.</div>
          <div style={{ fontSize: 12, color: "#6F685B" }}>roshi research</div>
        </div>
      </div>
    </aside>
  );
}

function AppTopBar({ title, crumbs, cta }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 36px", borderBottom: "1px solid rgba(26,26,46,0.08)", background: "#FAF7F2" }}>
      <div>
        {crumbs && <div style={{ fontSize: 12, color: "#6F685B", letterSpacing: "0.04em", marginBottom: 4 }}>{crumbs}</div>}
        <h1 style={{ fontFamily: "'Absans',serif", fontSize: 32, letterSpacing: "-0.015em", color: "#1A1A2E", margin: 0, lineHeight: 1.1 }}>{title}</h1>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6F685B" }}><Icon name="search" size={16}/></span>
          <input placeholder="Search surveys, responses..." style={{
            fontFamily: "'Manrope',sans-serif", fontSize: 14, padding: "9px 14px 9px 34px",
            border: "1px solid rgba(26,26,46,0.15)", borderRadius: 10, background: "#fff", width: 260, color: "#1A1A2E"
          }}/>
        </div>
        {cta}
      </div>
    </div>
  );
}

function StatusChip({ status }) {
  const map = {
    live:   { bg: "#EAF1EC", fg: "#4A7C59", dot: "#4A7C59", label: "live" },
    draft:  { bg: "#F2EEE6", fg: "#4A4538", dot: "#A79E8C", label: "draft" },
    closed: { bg: "#F7E6E0", fg: "#B3412B", dot: "#B3412B", label: "closed" },
  };
  const s = map[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: s.bg, color: s.fg, padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }}/> {s.label}
    </span>
  );
}

function SurveyCard({ survey, onOpen }) {
  return (
    <div onClick={onOpen} style={{
      background: "#fff", border: "1px solid rgba(26,26,46,0.10)", borderRadius: 16, padding: 22,
      cursor: "pointer", transition: "all 200ms cubic-bezier(0.22,1,0.36,1)",
      boxShadow: "0 2px 8px rgba(26,26,46,0.06)",
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,26,46,0.08)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(26,26,46,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 17, color: "#1A1A2E", lineHeight: 1.3 }}>{survey.title}</div>
        <StatusChip status={survey.status}/>
      </div>
      <div style={{ fontSize: 13, color: "#6F685B", marginTop: 6 }}>{survey.desc}</div>
      <div style={{ display: "flex", gap: 24, marginTop: 20, fontFamily: "'Manrope',sans-serif" }}>
        <div><div style={{ fontFamily: "'Absans',serif", fontSize: 22, color: "#1A1A2E", lineHeight: 1 }}>{survey.responses}</div><div style={{ fontSize: 11, color: "#6F685B", marginTop: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>voices</div></div>
        <div><div style={{ fontFamily: "'Absans',serif", fontSize: 22, color: "#1A1A2E", lineHeight: 1 }}>{survey.duration}</div><div style={{ fontSize: 11, color: "#6F685B", marginTop: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>avg time</div></div>
        <div><div style={{ fontFamily: "'Absans',serif", fontSize: 22, color: "#1A1A2E", lineHeight: 1 }}>{survey.completion}</div><div style={{ fontSize: 11, color: "#6F685B", marginTop: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>completion</div></div>
      </div>
    </div>
  );
}

function DashboardHome({ onOpenSurvey, onNew }) {
  const surveys = [
    { id: 1, title: "onboarding feedback — v3", desc: "how new signups found their feet in week 1.", status: "live", responses: 37, duration: "3m 42s", completion: "84%" },
    { id: 2, title: "pricing page research", desc: "what confuses people at the moment of decision.", status: "live", responses: 12, duration: "5m 10s", completion: "71%" },
    { id: 3, title: "churn exit interviews", desc: "a quiet, unscripted conversation before they go.", status: "draft", responses: 0, duration: "—", completion: "—" },
    { id: 4, title: "q3 customer advisory", desc: "12 of our most thoughtful users, 20 minutes each.", status: "closed", responses: 12, duration: "18m 04s", completion: "100%" },
  ];
  return (
    <>
      <AppTopBar
        title="good afternoon, priya."
        crumbs="HOME"
        cta={<Button variant="primary" onClick={onNew}><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="plus" size={16}/> New survey</span></Button>}
      />
      <div style={{ padding: "32px 36px", display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <StatCard label="ACTIVE SURVEYS" value="2" note="+1 this week"/>
          <StatCard label="VOICES THIS WEEK" value="49" note="vs 32 last week"/>
          <StatCard label="HOURS OF AUDIO" value="4.2" note="transcribed · auto-tagged"/>
          <StatCard label="COMPLETION" value="82%" note="above benchmark"/>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 18, color: "#1A1A2E" }}>your surveys</div>
            <button style={{ background: "transparent", border: "none", color: "#4A4538", fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>view all <Icon name="chevron" size={14}/></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
            {surveys.map(s => <SurveyCard key={s.id} survey={s} onOpen={() => onOpenSurvey(s)}/>)}
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value, note }) {
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.10)", borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6F685B", fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: "'Absans',serif", fontSize: 38, color: "#1A1A2E", letterSpacing: "-0.02em", marginTop: 8, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#6F685B", marginTop: 8 }}>{note}</div>
    </div>
  );
}

function ResponsesView({ onBack, onOpenResponse }) {
  const responses = [
    { id: 1, name: "maya r.", role: "pm, fintech", quote: "honestly, the pricing page confused me more than the product did.", time: "3m 42s", tags: ["pricing", "confusion"], ago: "2h ago" },
    { id: 2, name: "daniel k.", role: "founder, logistics", quote: "i thought the voice thing was gimmicky. then i realized i was talking about the real problem.", time: "4m 18s", tags: ["onboarding", "surprise"], ago: "5h ago" },
    { id: 3, name: "anon · id 0041", role: "—", quote: "set up was easy. the part where i got stuck was inviting my team — i couldn't find the link.", time: "2m 55s", tags: ["onboarding", "invite"], ago: "1d ago" },
    { id: 4, name: "ritika s.", role: "ux researcher", quote: "i've been using typeform for six years. this felt like reading someone's diary by comparison — in a good way.", time: "6m 12s", tags: ["comparison", "delight"], ago: "2d ago" },
  ];
  return (
    <>
      <AppTopBar
        title="onboarding feedback — v3"
        crumbs={<span><span style={{ cursor: "pointer" }} onClick={onBack}>HOME</span> · SURVEY</span>}
        cta={<><Button variant="outline"><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="copy" size={14}/> Copy link</span></Button><Button variant="midnight">Share</Button></>}
      />
      <div style={{ padding: "32px 36px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 28 }}>
        <div>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 18 }}>
            <StatusChip status="live"/>
            <div style={{ fontSize: 13, color: "#6F685B" }}>37 voices · 84% completion · avg 3m 42s</div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 18, borderBottom: "1px solid rgba(26,26,46,0.08)" }}>
            <TabBtn active>voices</TabBtn>
            <TabBtn>themes</TabBtn>
            <TabBtn>questions</TabBtn>
            <TabBtn>settings</TabBtn>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {responses.map(r => <ResponseCard key={r.id} r={r} onOpen={() => onOpenResponse(r)}/>)}
          </div>
        </div>
        <ThemesPanel/>
      </div>
    </>
  );
}

function TabBtn({ children, active }) {
  return (
    <button style={{
      background: "transparent", border: "none", padding: "12px 4px", marginRight: 20,
      fontFamily: "'Manrope',sans-serif", fontSize: 14, fontWeight: active ? 600 : 500,
      color: active ? "#1A1A2E" : "#6F685B", cursor: "pointer",
      borderBottom: active ? "2px solid #E8B04B" : "2px solid transparent", marginBottom: -1,
    }}>{children}</button>
  );
}

function ResponseCard({ r, onOpen }) {
  return (
    <div onClick={onOpen} style={{
      background: "#fff", border: "1px solid rgba(26,26,46,0.10)", borderRadius: 14, padding: "20px 22px",
      cursor: "pointer", transition: "all 200ms cubic-bezier(0.22,1,0.36,1)",
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,26,46,0.08)"}
    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6F685B" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#D4CCBB" }}/>
          <span style={{ color: "#1A1A2E", fontWeight: 600, fontSize: 13 }}>{r.name}</span>
          <span>·</span>
          <span>{r.role}</span>
        </div>
        <div>{r.ago} · {r.time}</div>
      </div>
      <div style={{ fontFamily: "'Absans',serif", fontSize: 20, lineHeight: 1.25, color: "#1A1A2E", marginTop: 12, letterSpacing: "-0.005em" }}>
        &ldquo;{r.quote}&rdquo;
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
        {r.tags.map(t => <span key={t} style={{ fontSize: 11, fontWeight: 600, color: "#4A4538", background: "#F2EEE6", padding: "3px 10px", borderRadius: 999 }}>{t}</span>)}
      </div>
    </div>
  );
}

function ThemesPanel() {
  const themes = [
    { name: "pricing clarity", count: 14, color: "#E8B04B" },
    { name: "onboarding", count: 11, color: "#4A7C59" },
    { name: "team invites", count: 8, color: "#F08A63" },
    { name: "voice novelty", count: 6, color: "#1A1A2E" },
    { name: "integrations", count: 4, color: "#A79E8C" },
  ];
  const max = 14;
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.10)", borderRadius: 16, padding: 22, alignSelf: "flex-start", boxShadow: "0 2px 8px rgba(26,26,46,0.04)" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6F685B", fontWeight: 600 }}>AUTO-THEMES</div>
      <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 16, fontWeight: 600, color: "#1A1A2E", marginTop: 6 }}>what people keep coming back to</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
        {themes.map(t => (
          <div key={t.name}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#1A1A2E", marginBottom: 4 }}>
              <span style={{ fontWeight: 500 }}>{t.name}</span>
              <span style={{ color: "#6F685B", fontFamily: "ui-monospace, monospace" }}>{t.count}</span>
            </div>
            <div style={{ height: 6, background: "#F2EEE6", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${(t.count / max) * 100}%`, height: "100%", background: t.color, borderRadius: 3 }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewSurveyView({ onBack, onPublish }) {
  const [questions, setQuestions] = React.useState([
    "tell me about the last time you set up a survey — what was the first thing that tripped you up?",
    "what were you hoping koel would do differently from what you've tried before?",
  ]);
  const [title, setTitle] = React.useState("onboarding feedback — v3");
  return (
    <>
      <AppTopBar
        title="new survey"
        crumbs={<span style={{ cursor: "pointer" }} onClick={onBack}>HOME · NEW</span>}
        cta={<><Button variant="outline">Preview</Button><Button variant="primary" onClick={onPublish}>Publish</Button></>}
      />
      <div style={{ padding: "32px 36px", display: "grid", gridTemplateColumns: "1fr 360px", gap: 28, maxWidth: 1200 }}>
        <div>
          <div style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.10)", borderRadius: 16, padding: 28 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#1A1A2E" }}>Survey title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} style={{
              display: "block", width: "100%", marginTop: 6, padding: "11px 14px",
              border: "1px solid rgba(26,26,46,0.15)", borderRadius: 10, fontSize: 16,
              fontFamily: "'Manrope',sans-serif", color: "#1A1A2E", boxSizing: "border-box"
            }}/>
          </div>
          <div style={{ marginTop: 20, background: "#fff", border: "1px solid rgba(26,26,46,0.10)", borderRadius: 16, padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 17, fontWeight: 600, color: "#1A1A2E" }}>questions</div>
              <div style={{ fontSize: 12, color: "#6F685B" }}>plain english — koel handles follow-ups</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {questions.map((q, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ fontFamily: "'Absans',serif", fontSize: 22, color: "#E8B04B", width: 32, lineHeight: 1.3, flexShrink: 0 }}>{String(i+1).padStart(2,"0")}</div>
                  <textarea defaultValue={q} rows={2} style={{
                    flex: 1, padding: "11px 14px", border: "1px solid rgba(26,26,46,0.12)",
                    borderRadius: 10, fontSize: 15, fontFamily: "'Manrope',sans-serif",
                    color: "#1A1A2E", resize: "vertical", lineHeight: 1.5,
                  }}/>
                </div>
              ))}
            </div>
            <button onClick={() => setQuestions([...questions, ""])} style={{
              marginTop: 14, background: "transparent", border: "1px dashed rgba(26,26,46,0.20)",
              borderRadius: 10, padding: "10px 16px", color: "#4A4538", cursor: "pointer",
              fontFamily: "'Manrope',sans-serif", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <Icon name="plus" size={14}/> add question
            </button>
          </div>
        </div>
        <div style={{ alignSelf: "flex-start", background: "#1A1A2E", borderRadius: 16, padding: 24, color: "#FAF7F2", boxShadow: "0 8px 24px rgba(26,26,46,0.12)", position: "sticky", top: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#E8B04B", fontWeight: 600 }}>PREVIEW</div>
          <div style={{ fontFamily: "'Absans',serif", fontSize: 22, lineHeight: 1.2, marginTop: 12 }}>{title || "untitled"}</div>
          <div style={{ fontSize: 13, color: "rgba(250,247,242,0.65)", marginTop: 8 }}>{questions.length} questions · ~{Math.round(questions.length * 1.8)} min</div>
          <div style={{ borderTop: "1px solid rgba(250,247,242,0.12)", margin: "18px 0 14px" }}/>
          <div style={{ fontSize: 13, color: "rgba(250,247,242,0.85)", lineHeight: 1.6 }}>respondents get a single link. no account needed. we ask for the microphone — nothing else.</div>
        </div>
      </div>
    </>
  );
}

function RespondentSession({ onBack }) {
  const [recording, setRecording] = React.useState(false);
  const [bars, setBars] = React.useState(Array.from({ length: 28 }, () => 40));
  React.useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setBars(b => b.map(() => 30 + Math.random() * 70)), 120);
    return () => clearInterval(id);
  }, [recording]);
  return (
    <div style={{ minHeight: "100%", background: "#FAF7F2", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px 36px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(26,26,46,0.08)" }}>
        <AppBrand/>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: "#4A4538", cursor: "pointer", fontSize: 13 }}>exit preview ×</button>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <div style={{ maxWidth: 640, width: "100%" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6F685B", fontWeight: 600 }}>QUESTION 1 OF 2</div>
          <div style={{ fontFamily: "'Absans',serif", fontSize: 40, lineHeight: 1.15, letterSpacing: "-0.015em", color: "#1A1A2E", marginTop: 16, textWrap: "pretty" }}>
            tell me about the last time you set up a survey — what was the first thing that tripped you up?
          </div>
          <div style={{ fontSize: 15, color: "#4A4538", marginTop: 16, lineHeight: 1.6 }}>
            speak whenever you're ready. there's no timer. pause as much as you like — we keep listening.
          </div>
          <div style={{ marginTop: 48, background: recording ? "#1A1A2E" : "#fff", color: recording ? "#FAF7F2" : "#1A1A2E", borderRadius: 20, padding: 28, display: "flex", alignItems: "center", gap: 22, border: recording ? "1px solid #E8B04B" : "1px solid rgba(26,26,46,0.10)", boxShadow: "0 8px 24px rgba(26,26,46,0.08)", transition: "all 220ms cubic-bezier(0.22,1,0.36,1)" }}>
            <button onClick={() => setRecording(!recording)} style={{
              width: 72, height: 72, borderRadius: "50%", background: recording ? "#E8B04B" : "#1A1A2E",
              border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              transition: "all 180ms",
            }}>
              {recording
                ? <div style={{ width: 20, height: 20, borderRadius: 4, background: "#1A1A2E" }}/>
                : <span style={{ color: "#FAF7F2" }}><Icon name="mic" size={28} stroke={1.5}/></span>}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: recording ? "#E8B04B" : "#6F685B", fontWeight: 600 }}>
                {recording ? "RECORDING · 00:24" : "TAP TO SPEAK"}
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 34, marginTop: 10 }}>
                {bars.map((h, i) => (
                  <div key={i} style={{ width: 3, height: `${recording ? h : 18}%`, background: recording ? "#E8B04B" : "rgba(26,26,46,0.2)", borderRadius: 2, transition: "height 120ms linear" }}/>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
            <button style={{ background: "transparent", border: "none", color: "#6F685B", cursor: "pointer", fontSize: 14 }}>skip this question</button>
            <Button variant="midnight">next →</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Button({ variant = "primary", children, onClick, style }) {
  const base = { fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 14, borderRadius: 10, padding: "10px 18px", border: "none", cursor: "pointer", transition: "all 180ms cubic-bezier(0.22,1,0.36,1)", lineHeight: 1 };
  const variants = {
    primary:  { background: "#E8B04B", color: "#1A1A2E" },
    midnight: { background: "#1A1A2E", color: "#FAF7F2" },
    outline:  { background: "transparent", color: "#1A1A2E", border: "1px solid rgba(26,26,46,0.20)", padding: "9px 17px" },
    ghost:    { background: "transparent", color: "#1A1A2E", padding: "10px 12px" },
  };
  return <button onClick={onClick} style={{ ...base, ...variants[variant], ...style }}>{children}</button>;
}

/* ─────────────────────────────────────── Insights (chatbot) ─────────────────────────────────────── */

function InsightsView() {
  const surveys = [
    { id: 1, title: "onboarding feedback — v3", voices: 37, status: "live" },
    { id: 2, title: "pricing page research", voices: 12, status: "live" },
    { id: 3, title: "q3 customer advisory", voices: 12, status: "closed" },
    { id: 4, title: "churn exit interviews", voices: 8, status: "closed" },
  ];
  const [selected, setSelected] = React.useState(surveys[0]);
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState([
    { role: "koel", text: "i've been listening to 37 voices from " + "onboarding feedback — v3" + ". what would you like to understand?" , suggestions: ["what themes came up most?", "where did people get stuck?", "what surprised respondents?"] },
  ]);
  const scrollRef = React.useRef(null);
  React.useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const canned = {
    themes: { text: "three themes recur across the 37 conversations. the largest is pricing clarity — 14 respondents hesitated at the pricing page, most commonly on the \"per voice\" line. onboarding comes second (11 mentions) and centers on finding the team-invite link. a smaller but emotional thread: six respondents described the voice format as \"surprising\" or \"unexpectedly personal.\"", quotes: [
      { q: "honestly, the pricing page confused me more than the product did.", who: "maya r. · 2h ago" },
      { q: "i couldn't find the link to invite my team — that was the part where i got stuck.", who: "anon · 1d ago" },
    ]},
    stuck: { text: "the most common friction moment was between signup and first-survey-publish. 9 respondents described pausing on the invite step; 5 mentioned not knowing whether to pick \"draft\" or \"live\" for their first test.", quotes: [
      { q: "set up was easy. the part where i got stuck was inviting my team.", who: "anon · 1d ago" },
    ]},
    surprise: { text: "the voice format itself was the biggest surprise. multiple respondents arrived expecting a gimmick and left describing the experience as a \"real conversation\" or \"oddly thoughtful.\" this cohort also had the highest completion rate (91% vs 84% overall).", quotes: [
      { q: "i thought the voice thing was gimmicky. then i realized i was talking about the real problem.", who: "daniel k. · 5h ago" },
    ]},
  };
  function pickReply(q) {
    const s = q.toLowerCase();
    if (s.includes("stuck") || s.includes("friction")) return canned.stuck;
    if (s.includes("surpris")) return canned.surprise;
    return canned.themes;
  }
  function send(text) {
    if (!text.trim()) return;
    const reply = pickReply(text);
    setMessages(m => [...m, { role: "user", text }]);
    setInput("");
    setTimeout(() => setMessages(m => [...m, { role: "koel", ...reply }]), 600);
  }

  return (
    <>
      <AppTopBar
        title="insights"
        crumbs="HOME · INSIGHTS"
        cta={<Button variant="outline"><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="copy" size={14}/> Export thread</span></Button>}
      />
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", height: "calc(100% - 89px)", minHeight: 0 }}>
        {/* Survey picker rail */}
        <div style={{ borderRight: "1px solid rgba(26,26,46,0.08)", padding: "20px 16px", overflow: "auto", background: "#FAF7F2" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6F685B", fontWeight: 600, padding: "4px 10px 12px" }}>ASK ABOUT A SURVEY</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {surveys.map(s => {
              const active = selected.id === s.id;
              return (
                <button key={s.id} onClick={() => { setSelected(s); setMessages([{ role: "koel", text: `i've been listening to ${s.voices} voices from ${s.title}. what would you like to understand?`, suggestions: ["what themes came up most?", "where did people get stuck?", "what surprised respondents?"] }]); }} style={{
                  textAlign: "left", padding: "12px 14px", borderRadius: 10,
                  background: active ? "#1A1A2E" : "transparent", color: active ? "#FAF7F2" : "#1A1A2E",
                  border: "none", cursor: "pointer", fontFamily: "'Manrope',sans-serif",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: active ? "rgba(250,247,242,0.6)" : "#6F685B", marginTop: 4 }}>{s.voices} voices · {s.status}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat column */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0, background: "#FAF7F2" }}>
          <div ref={scrollRef} style={{ flex: 1, overflow: "auto", padding: "28px 48px" }}>
            <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
              {messages.map((m, i) => m.role === "user"
                ? <UserBubble key={i} text={m.text}/>
                : <KoelBubble key={i} msg={m} onSuggest={send}/>
              )}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(26,26,46,0.08)", padding: "16px 48px 24px", background: "#FAF7F2" }}>
            <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 10, alignItems: "flex-end", background: "#fff", border: "1px solid rgba(26,26,46,0.15)", borderRadius: 14, padding: "10px 12px 10px 16px", boxShadow: "0 2px 10px rgba(26,26,46,0.04)" }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder={`ask about "${selected.title}"…`}
                rows={1}
                style={{ flex: 1, border: "none", outline: "none", resize: "none", fontFamily: "'Manrope',sans-serif", fontSize: 15, color: "#1A1A2E", background: "transparent", padding: "6px 0", minHeight: 24, maxHeight: 120, lineHeight: 1.5 }}
              />
              <button onClick={() => send(input)} style={{
                background: input.trim() ? "#1A1A2E" : "rgba(26,26,46,0.1)", color: input.trim() ? "#FAF7F2" : "#6F685B",
                border: "none", borderRadius: 10, width: 36, height: 36, cursor: input.trim() ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center", transition: "all 180ms",
              }}>
                <Icon name="send" size={16}/>
              </button>
            </div>
            <div style={{ maxWidth: 720, margin: "8px auto 0", fontSize: 11, color: "#6F685B", textAlign: "center" }}>
              answers cite the exact moments they came from. nothing is made up.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function UserBubble({ text }) {
  return (
    <div style={{ alignSelf: "flex-end", maxWidth: "75%", background: "#1A1A2E", color: "#FAF7F2", padding: "12px 18px", borderRadius: "16px 16px 4px 16px", fontSize: 15, lineHeight: 1.5, fontFamily: "'Manrope',sans-serif" }}>
      {text}
    </div>
  );
}

function KoelBubble({ msg, onSuggest }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1A1A2E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, overflow: "hidden" }}>
        <img src="../../assets/koel-logo.svg" alt="" style={{ height: 22, width: "auto", filter: "invert(1)", maxWidth: "none" }}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6F685B", fontWeight: 600, marginBottom: 6 }}>KOEL</div>
        <div style={{ fontSize: 15, lineHeight: 1.65, color: "#1A1A2E", fontFamily: "'Manrope',sans-serif" }}>{msg.text}</div>
        {msg.quotes && (
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {msg.quotes.map((q, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.10)", borderLeft: "3px solid #E8B04B", borderRadius: "4px 10px 10px 4px", padding: "12px 16px" }}>
                <div style={{ fontFamily: "'Absans',serif", fontSize: 16, lineHeight: 1.35, color: "#1A1A2E" }}>&ldquo;{q.q}&rdquo;</div>
                <div style={{ fontSize: 12, color: "#6F685B", marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{q.who}</span>
                  <span>·</span>
                  <span style={{ color: "#4A7C59", cursor: "pointer", fontWeight: 500 }}>▸ play</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {msg.suggestions && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
            {msg.suggestions.map(s => (
              <button key={s} onClick={() => onSuggest(s)} style={{
                background: "#fff", border: "1px solid rgba(26,26,46,0.15)", borderRadius: 999,
                padding: "7px 14px", fontSize: 13, color: "#1A1A2E", cursor: "pointer",
                fontFamily: "'Manrope',sans-serif", transition: "all 180ms",
              }}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────── Settings ─────────────────────────────────────── */

function SettingsView() {
  const [section, setSection] = React.useState("profile");
  const sections = [
    { k: "profile", l: "Profile" },
    { k: "workspace", l: "Workspace" },
    { k: "voice", l: "Voice & transcription" },
    { k: "notifications", l: "Notifications" },
    { k: "billing", l: "Billing" },
    { k: "integrations", l: "Integrations" },
    { k: "danger", l: "Danger zone" },
  ];
  return (
    <>
      <AppTopBar title="settings" crumbs="HOME · SETTINGS"/>
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 0, padding: "0" }}>
        <nav style={{ padding: "28px 20px", borderRight: "1px solid rgba(26,26,46,0.08)", display: "flex", flexDirection: "column", gap: 2, position: "sticky", top: 89, alignSelf: "flex-start" }}>
          {sections.map(s => (
            <button key={s.k} onClick={() => setSection(s.k)} style={{
              textAlign: "left", padding: "9px 12px", borderRadius: 8,
              background: section === s.k ? "rgba(26,26,46,0.06)" : "transparent",
              border: "none", cursor: "pointer", fontFamily: "'Manrope',sans-serif",
              fontSize: 14, fontWeight: section === s.k ? 600 : 500,
              color: s.k === "danger" ? "#B3412B" : "#1A1A2E",
            }}>{s.l}</button>
          ))}
        </nav>
        <div style={{ padding: "32px 48px", maxWidth: 760 }}>
          {section === "profile" && <ProfileSettings/>}
          {section === "workspace" && <WorkspaceSettings/>}
          {section === "voice" && <VoiceSettings/>}
          {section === "notifications" && <NotificationSettings/>}
          {section === "billing" && <BillingSettings/>}
          {section === "integrations" && <IntegrationsSettings/>}
          {section === "danger" && <DangerSettings/>}
        </div>
      </div>
    </>
  );
}

function SettingRow({ label, hint, children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 40, padding: "20px 0", borderBottom: "1px solid rgba(26,26,46,0.06)" }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: "#6F685B", marginTop: 4, lineHeight: 1.5 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Field({ value, placeholder, type = "text" }) {
  return (
    <input type={type} defaultValue={value} placeholder={placeholder} style={{
      width: "100%", padding: "10px 14px", border: "1px solid rgba(26,26,46,0.15)",
      borderRadius: 10, fontSize: 14, fontFamily: "'Manrope',sans-serif", color: "#1A1A2E",
      boxSizing: "border-box", background: "#fff",
    }}/>
  );
}

function Toggle({ defaultOn }) {
  const [on, setOn] = React.useState(defaultOn);
  return (
    <button onClick={() => setOn(!on)} style={{
      width: 42, height: 24, borderRadius: 999, border: "none", cursor: "pointer",
      background: on ? "#4A7C59" : "rgba(26,26,46,0.2)", position: "relative", transition: "all 180ms", padding: 0,
    }}>
      <span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "all 180ms", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}/>
    </button>
  );
}

function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <h2 style={{ fontFamily: "'Absans',serif", fontSize: 26, letterSpacing: "-0.015em", color: "#1A1A2E", margin: 0 }}>{title}</h2>
      {sub && <div style={{ fontSize: 14, color: "#6F685B", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function ProfileSettings() {
  return (
    <div>
      <SectionHeader title="profile" sub="how you show up in koel."/>
      <div style={{ marginTop: 12 }}>
        <SettingRow label="Avatar" hint="PNG or JPG, at least 128×128.">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#D4CCBB", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Absans',serif", fontSize: 22, color: "#1A1A2E" }}>pm</div>
            <Button variant="outline">Upload</Button>
          </div>
        </SettingRow>
        <SettingRow label="Full name"><Field value="Priya Menon"/></SettingRow>
        <SettingRow label="Email" hint="used for sign-in and weekly digests."><Field value="priya@roshi.co" type="email"/></SettingRow>
        <SettingRow label="Role"><Field value="Head of research"/></SettingRow>
        <SettingRow label="Timezone"><Field value="Asia/Kolkata · GMT+5:30"/></SettingRow>
        <div style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="outline">Cancel</Button>
          <Button variant="primary">Save changes</Button>
        </div>
      </div>
    </div>
  );
}

function WorkspaceSettings() {
  return (
    <div>
      <SectionHeader title="workspace" sub="settings for roshi research."/>
      <div style={{ marginTop: 12 }}>
        <SettingRow label="Workspace name"><Field value="Roshi Research"/></SettingRow>
        <SettingRow label="Slug" hint="used in survey links: koel.to/{slug}/…"><Field value="roshi"/></SettingRow>
        <SettingRow label="Default language" hint="applies to new surveys.">
          <select defaultValue="en" style={{ width: "100%", padding: "10px 14px", border: "1px solid rgba(26,26,46,0.15)", borderRadius: 10, fontSize: 14, fontFamily: "'Manrope',sans-serif", color: "#1A1A2E", background: "#fff" }}>
            <option value="en">English</option><option value="hi">Hindi</option><option value="es">Spanish</option><option value="de">German</option>
          </select>
        </SettingRow>
        <SettingRow label="Branding" hint="add your logo to respondent pages."><Button variant="outline">Upload workspace logo</Button></SettingRow>
      </div>
    </div>
  );
}

function VoiceSettings() {
  return (
    <div>
      <SectionHeader title="voice & transcription" sub="how koel listens and what it keeps."/>
      <div style={{ marginTop: 12 }}>
        <SettingRow label="Follow-up style" hint="how koel decides to ask the next question.">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { t: "gentle", d: "one follow-up, if there's obvious emotion or ambiguity." },
              { t: "curious", d: "follow up on anything unexpected. (default)" },
              { t: "thorough", d: "dig into every answer — longer sessions." },
            ].map((o, i) => (
              <label key={o.t} style={{ display: "flex", gap: 12, padding: "12px 14px", border: "1px solid rgba(26,26,46,0.12)", borderRadius: 10, cursor: "pointer", background: i === 1 ? "rgba(232,176,75,0.1)" : "#fff", borderColor: i === 1 ? "#E8B04B" : "rgba(26,26,46,0.12)" }}>
                <input type="radio" name="followup" defaultChecked={i === 1} style={{ marginTop: 4 }}/>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#1A1A2E" }}>{o.t}</div>
                  <div style={{ fontSize: 13, color: "#6F685B", marginTop: 2 }}>{o.d}</div>
                </div>
              </label>
            ))}
          </div>
        </SettingRow>
        <SettingRow label="Preserve pauses" hint="keep the um's, ah's and silences — useful for verbatim review."><Toggle defaultOn={true}/></SettingRow>
        <SettingRow label="Auto-tag themes" hint="koel proposes tags; you can edit them any time."><Toggle defaultOn={true}/></SettingRow>
        <SettingRow label="Retention" hint="how long we keep raw audio. transcripts stay indefinitely.">
          <select defaultValue="90" style={{ width: "100%", padding: "10px 14px", border: "1px solid rgba(26,26,46,0.15)", borderRadius: 10, fontSize: 14, fontFamily: "'Manrope',sans-serif", color: "#1A1A2E", background: "#fff" }}>
            <option value="30">30 days</option><option value="90">90 days</option><option value="365">1 year</option><option value="0">Keep until deleted</option>
          </select>
        </SettingRow>
      </div>
    </div>
  );
}

function NotificationSettings() {
  const rows = [
    { t: "New response", d: "when someone completes a voice session.", on: true },
    { t: "Weekly digest", d: "a monday summary of what voices said.", on: true },
    { t: "Theme spike", d: "when a new theme crosses 5+ mentions.", on: true },
    { t: "Survey closed", d: "when a survey reaches its response cap.", on: false },
    { t: "Team activity", d: "when a collaborator edits or comments.", on: false },
  ];
  return (
    <div>
      <SectionHeader title="notifications" sub="you'll get these by email. slack available on flock."/>
      <div style={{ marginTop: 12 }}>
        {rows.map(r => <SettingRow key={r.t} label={r.t} hint={r.d}><div style={{ display: "flex", justifyContent: "flex-end" }}><Toggle defaultOn={r.on}/></div></SettingRow>)}
      </div>
    </div>
  );
}

function BillingSettings() {
  return (
    <div>
      <SectionHeader title="billing" sub="you're on flock — renews 14 apr 2026."/>
      <div style={{ marginTop: 20, background: "#1A1A2E", color: "#FAF7F2", borderRadius: 16, padding: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#E8B04B", fontWeight: 600 }}>CURRENT PLAN</div>
          <div style={{ fontFamily: "'Absans',serif", fontSize: 32, marginTop: 8 }}>flock</div>
          <div style={{ fontSize: 13, color: "rgba(250,247,242,0.65)", marginTop: 4 }}>$79 / month · 500 voices included</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Absans',serif", fontSize: 28, color: "#E8B04B" }}>317 / 500</div>
          <div style={{ fontSize: 12, color: "rgba(250,247,242,0.55)", marginTop: 2 }}>voices this month</div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <SettingRow label="Payment method" hint="we'll email before any overage charges.">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", border: "1px solid rgba(26,26,46,0.12)", borderRadius: 10, background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14 }}>
              <div style={{ width: 36, height: 24, background: "#1A1A2E", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#E8B04B", fontWeight: 700, letterSpacing: 1 }}>VISA</div>
              <span>•••• 4242</span><span style={{ color: "#6F685B" }}>· exp 08/28</span>
            </div>
            <Button variant="outline">Update</Button>
          </div>
        </SettingRow>
        <SettingRow label="Billing email"><Field value="finance@roshi.co" type="email"/></SettingRow>
        <SettingRow label="Invoices" hint="download past invoices as PDF.">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["Mar 2026 · $79.00","Feb 2026 · $79.00","Jan 2026 · $79.00"].map(x => (
              <div key={x} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", border: "1px solid rgba(26,26,46,0.08)", borderRadius: 10, fontSize: 13, color: "#1A1A2E", background: "#fff" }}>
                <span>{x}</span><span style={{ color: "#4A7C59", cursor: "pointer", fontWeight: 600 }}>Download</span>
              </div>
            ))}
          </div>
        </SettingRow>
      </div>
    </div>
  );
}

function IntegrationsSettings() {
  const apps = [
    { name: "Slack", desc: "post new responses to a channel.", connected: true, dot: "#4A148C" },
    { name: "Linear", desc: "turn insights into issues.", connected: true, dot: "#5E6AD2" },
    { name: "Notion", desc: "sync themes to a research database.", connected: false, dot: "#1A1A2E" },
    { name: "Zapier", desc: "3,000+ downstream workflows.", connected: false, dot: "#E8B04B" },
    { name: "Webhooks", desc: "post events to any https endpoint.", connected: false, dot: "#4A7C59" },
  ];
  return (
    <div>
      <SectionHeader title="integrations" sub="pipe koel into the rest of your stack."/>
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        {apps.map(a => (
          <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", background: "#fff", border: "1px solid rgba(26,26,46,0.10)", borderRadius: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: a.dot + "22", display: "flex", alignItems: "center", justifyContent: "center", color: a.dot, fontFamily: "'Absans',serif", fontSize: 18, flexShrink: 0 }}>{a.name[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>{a.name}</div>
              <div style={{ fontSize: 12, color: "#6F685B", marginTop: 2 }}>{a.desc}</div>
            </div>
            {a.connected
              ? <div style={{ display: "flex", gap: 10, alignItems: "center" }}><StatusChip status="live"/><Button variant="outline">Configure</Button></div>
              : <Button variant="midnight">Connect</Button>}
          </div>
        ))}
      </div>
    </div>
  );
}

function DangerSettings() {
  return (
    <div>
      <SectionHeader title="danger zone" sub="these actions can't be undone."/>
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 20, border: "1px solid rgba(179,65,43,0.3)", borderRadius: 12, background: "rgba(179,65,43,0.04)" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>Export and delete all data</div>
            <div style={{ fontSize: 13, color: "#6F685B", marginTop: 4 }}>we'll email you a ZIP of every transcript, then purge the workspace.</div>
          </div>
          <button style={{ padding: "10px 18px", background: "transparent", color: "#B3412B", border: "1px solid #B3412B", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope',sans-serif" }}>Export & delete</button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 20, border: "1px solid rgba(179,65,43,0.3)", borderRadius: 12, background: "rgba(179,65,43,0.04)" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>Delete workspace</div>
            <div style={{ fontSize: 13, color: "#6F685B", marginTop: 4 }}>permanent. billing stops immediately.</div>
          </div>
          <button style={{ padding: "10px 18px", background: "#B3412B", color: "#FAF7F2", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope',sans-serif" }}>Delete workspace</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Icon, AppBrand, Sidebar, AppTopBar, StatusChip, SurveyCard, DashboardHome, StatCard, ResponsesView, TabBtn, ResponseCard, ThemesPanel, NewSurveyView, RespondentSession, Button, InsightsView, SettingsView });
