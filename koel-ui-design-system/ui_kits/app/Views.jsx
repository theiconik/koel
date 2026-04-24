/* App UI kit — views: Home, AllSurveys, NewSurvey, Published, SurveyDetail (tabs + response drawer), Respondent flow, Insights, Settings */

/* ─────────────────────────────────────── Home ─────────────────────────────────────── */

function DashboardHome({ onOpenSurvey, onNew, onViewAll }) {
  const surveys = SAMPLE_SURVEYS.slice(0, 4);
  return (
    <>
      <AppTopBar
        title="good afternoon, priya."
        crumbs="HOME"
        cta={<Button variant="primary" onClick={onNew}><Icon name="plus" size={16}/> New survey</Button>}
      />
      <div style={{ padding: "32px 36px", display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <StatCard label="ACTIVE SURVEYS" value="3" note="+1 this week"/>
          <StatCard label="VOICES THIS WEEK" value="49" note="vs 32 last week"/>
          <StatCard label="HOURS OF AUDIO" value="4.2" note="transcribed · auto-tagged"/>
          <StatCard label="COMPLETION" value="82%" note="above benchmark"/>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 18, color: "#1A1A2E" }}>your surveys</div>
            <button onClick={onViewAll} style={{ background: "transparent", border: "none", color: "#4A4538", fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "'Manrope',sans-serif" }}>view all <Icon name="chevron" size={14}/></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
            {surveys.map(s => <SurveyCard key={s.id} survey={s} onOpen={() => onOpenSurvey(s)}/>)}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────── All Surveys ─────────────────────────────────────── */

function AllSurveysView({ onBack, onOpenSurvey, onNew }) {
  const [q, setQ] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const matches = SAMPLE_SURVEYS.filter(s =>
    (filter === "all" || s.status === filter) &&
    (q === "" || (s.title + s.desc).toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <>
      <AppTopBar
        title="all surveys"
        crumbs={<span><span style={{ cursor: "pointer" }} onClick={onBack}>HOME</span> · ALL</span>}
        search
        searchPlaceholder="Search surveys…"
        onSearch={setQ}
        cta={<Button variant="primary" onClick={onNew}><Icon name="plus" size={16}/> New survey</Button>}
      />
      <div style={{ padding: "28px 36px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[
            { k: "all", l: `All · ${SAMPLE_SURVEYS.length}` },
            { k: "live", l: `Live · ${SAMPLE_SURVEYS.filter(s => s.status === "live").length}` },
            { k: "draft", l: `Draft · ${SAMPLE_SURVEYS.filter(s => s.status === "draft").length}` },
            { k: "closed", l: `Closed · ${SAMPLE_SURVEYS.filter(s => s.status === "closed").length}` },
          ].map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)} style={{
              padding: "8px 14px", borderRadius: 999, border: "1px solid " + (filter === f.k ? "#1A1A2E" : "rgba(26,26,46,0.15)"),
              background: filter === f.k ? "#1A1A2E" : "transparent", color: filter === f.k ? "#FAF7F2" : "#1A1A2E",
              fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'Manrope',sans-serif",
            }}>{f.l}</button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
          {matches.map(s => <SurveyCard key={s.id} survey={s} onOpen={() => onOpenSurvey(s)}/>)}
        </div>
        {matches.length === 0 && (
          <div style={{ padding: "60px 0", textAlign: "center", color: "#6F685B", fontSize: 14 }}>nothing matches "{q}". try a different word.</div>
        )}
      </div>
    </>
  );
}

/* ─────────────────────────────────────── New Survey ─────────────────────────────────────── */

function NewSurveyView({ onBack, onPublish, onPreview }) {
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
        cta={<><Button variant="outline" onClick={onPreview}>Preview</Button><Button variant="primary" onClick={onPublish}>Publish</Button></>}
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

/* ─────────────────────────────────────── Published ─────────────────────────────────────── */

function PublishedView({ survey, onCopy, onShare, onDone }) {
  const s = survey || { title: "onboarding feedback — v3", slug: "onboarding-v3" };
  const url = `https://koel.to/roshi/${s.slug}`;
  const [copied, setCopied] = React.useState(false);
  function copy() {
    navigator.clipboard && navigator.clipboard.writeText(url);
    setCopied(true); setTimeout(() => setCopied(false), 1600);
    onCopy && onCopy();
  }
  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px 36px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(26,26,46,0.08)" }}>
        <AppBrand/>
        <button onClick={onDone} style={{ background: "transparent", border: "none", color: "#4A4538", cursor: "pointer", fontSize: 13, fontFamily: "'Manrope',sans-serif" }}>go to dashboard →</button>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ maxWidth: 640, width: "100%", animation: "slideUp 400ms cubic-bezier(0.22,1,0.36,1)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#EAF1EC", color: "#4A7C59", padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            <span style={{ display: "inline-flex" }}><Icon name="check" size={14} stroke={2.5}/></span> published & listening
          </div>
          <h1 style={{ fontFamily: "'Absans',serif", fontSize: 48, lineHeight: 1.1, color: "#1A1A2E", letterSpacing: "-0.015em", marginTop: 20, marginBottom: 12 }}>your survey is live.<br/><span style={{ color: "#6F685B" }}>send it to the people whose voice you want.</span></h1>
          <div style={{ fontSize: 15, color: "#4A4538", lineHeight: 1.6, marginBottom: 28 }}>koel opens the conversation, asks follow-ups, and transcribes everything. you'll see responses appear as they come in.</div>

          <div style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.12)", borderRadius: 16, padding: 6, display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 10px rgba(26,26,46,0.05)" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "12px 6px 12px 16px", minWidth: 0 }}>
              <span style={{ color: "#6F685B", display: "inline-flex", flexShrink: 0 }}><Icon name="link" size={16}/></span>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 13, color: "#1A1A2E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</div>
            </div>
            <Button variant="outline" onClick={copy}>
              <Icon name={copied ? "check" : "copy"} size={14}/> {copied ? "copied" : "Copy link"}
            </Button>
            <Button variant="midnight" onClick={onShare}>Share</Button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 28 }}>
            {[
              { n: "01", t: "share the link", d: "email, slack, dm — wherever your people are." },
              { n: "02", t: "respondents speak", d: "they tap the mic. koel listens and follows up." },
              { n: "03", t: "responses roll in", d: "each voice arrives transcribed and themed." },
            ].map(x => (
              <div key={x.n} style={{ background: "rgba(26,26,46,0.03)", borderRadius: 12, padding: 16 }}>
                <div style={{ fontFamily: "'Absans',serif", fontSize: 18, color: "#E8B04B" }}>{x.n}</div>
                <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 14, color: "#1A1A2E", marginTop: 6 }}>{x.t}</div>
                <div style={{ fontSize: 12, color: "#6F685B", marginTop: 4, lineHeight: 1.5 }}>{x.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────── Survey Detail (tabs + response drawer) ─────────────────────────────────────── */

const SAMPLE_RESPONSES = [
  { id: 1, name: "maya r.", role: "pm, fintech", quote: "honestly, the pricing page confused me more than the product did.", time: "3m 42s", duration: 222, tags: ["pricing", "confusion"], ago: "2h ago", date: "apr 23, 2026 · 2:14pm", sentiment: "frustrated", completed: true },
  { id: 2, name: "daniel k.", role: "founder, logistics", quote: "i thought the voice thing was gimmicky. then i realized i was talking about the real problem.", time: "4m 18s", duration: 258, tags: ["onboarding", "surprise"], ago: "5h ago", date: "apr 23, 2026 · 11:28am", sentiment: "delighted", completed: true },
  { id: 3, name: "anon · id 0041", role: "—", quote: "set up was easy. the part where i got stuck was inviting my team — i couldn't find the link.", time: "2m 55s", duration: 175, tags: ["onboarding", "invite"], ago: "1d ago", date: "apr 22, 2026 · 6:02pm", sentiment: "neutral", completed: true },
  { id: 4, name: "ritika s.", role: "ux researcher", quote: "i've been using typeform for six years. this felt like reading someone's diary by comparison — in a good way.", time: "6m 12s", duration: 372, tags: ["comparison", "delight"], ago: "2d ago", date: "apr 21, 2026 · 10:47am", sentiment: "delighted", completed: true },
];

function SurveyDetail({ survey, tab, onTab, onBack, onOpenResponse, onCopy, onShare, showResponse, respondent, onCloseResponse }) {
  const s = survey || SAMPLE_SURVEYS[0];
  return (
    <>
      <AppTopBar
        title={s.title}
        crumbs={<span><span style={{ cursor: "pointer" }} onClick={onBack}>HOME</span> · SURVEY</span>}
        cta={<>
          <Button variant="outline" onClick={onCopy}><Icon name="copy" size={14}/> Copy link</Button>
          <Button variant="midnight" onClick={onShare}>Share</Button>
        </>}
      />
      <div style={{ padding: "24px 36px 12px" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 18 }}>
          <StatusChip status={s.status}/>
          <div style={{ fontSize: 13, color: "#6F685B" }}>{s.responses} voices · {s.completion} completion · avg {s.duration}</div>
        </div>
        <div style={{ display: "flex", borderBottom: "1px solid rgba(26,26,46,0.08)" }}>
          <TabBtn active={tab === "voices"} onClick={() => onTab("voices")}>voices</TabBtn>
          <TabBtn active={tab === "themes"} onClick={() => onTab("themes")}>themes</TabBtn>
          <TabBtn active={tab === "questions"} onClick={() => onTab("questions")}>questions</TabBtn>
          <TabBtn active={tab === "settings"} onClick={() => onTab("settings")}>settings</TabBtn>
        </div>
      </div>
      <div style={{ padding: "8px 36px 36px" }}>
        {tab === "voices" && <VoicesTab onOpenResponse={onOpenResponse}/>}
        {tab === "themes" && <ThemesTab/>}
        {tab === "questions" && <QuestionsTab/>}
        {tab === "settings" && <SurveySettingsTab/>}
      </div>
      {showResponse && <ResponseDrawer r={respondent} onClose={onCloseResponse}/>}
    </>
  );
}

function VoicesTab({ onOpenResponse }) {
  const [q, setQ] = React.useState("");
  const rows = SAMPLE_RESPONSES.filter(r => q === "" || (r.name + r.quote + r.tags.join(" ")).toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28 }}>
      <div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6F685B" }}><Icon name="search" size={16}/></span>
            <input onChange={e => setQ(e.target.value)} placeholder="Search responses…" style={{ width: "100%", padding: "9px 14px 9px 34px", border: "1px solid rgba(26,26,46,0.15)", borderRadius: 10, fontSize: 14, fontFamily: "'Manrope',sans-serif", color: "#1A1A2E", background: "#fff" }}/>
          </div>
          <div style={{ fontSize: 13, color: "#6F685B" }}>{rows.length} of {SAMPLE_RESPONSES.length}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {rows.map(r => <ResponseCard key={r.id} r={r} onOpen={() => onOpenResponse(r)}/>)}
        </div>
      </div>
      <ThemesSidePanel/>
    </div>
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
      <div style={{ fontFamily: "'Absans',serif", fontSize: 20, lineHeight: 1.25, color: "#1A1A2E", marginTop: 12, letterSpacing: "-0.005em" }}>&ldquo;{r.quote}&rdquo;</div>
      <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
        {r.tags.map(t => <span key={t} style={{ fontSize: 11, fontWeight: 600, color: "#4A4538", background: "#F2EEE6", padding: "3px 10px", borderRadius: 999 }}>{t}</span>)}
      </div>
    </div>
  );
}

function ThemesSidePanel() {
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

/* ─────────────────────────────────────── Themes tab ─────────────────────────────────────── */

function ThemesTab() {
  const themes = [
    { name: "pricing clarity", count: 14, color: "#E8B04B", summary: "respondents hesitate at the \"per voice\" pricing line. several described not knowing whether a 5-minute interview counted as one voice or five.", quotes: [
      { q: "i couldn't tell if i was being charged per interview or per minute.", who: "maya r." },
      { q: "the pricing was the one place i had to re-read the copy.", who: "anon · 0038" },
    ]},
    { name: "onboarding", count: 11, color: "#4A7C59", summary: "setup itself was smooth. the friction clustered around one moment: inviting the team. 9 respondents mentioned not finding the invite link.", quotes: [
      { q: "set up was easy. the part where i got stuck was inviting my team.", who: "anon · 0041" },
    ]},
    { name: "team invites", count: 8, color: "#F08A63", summary: "a sub-theme of onboarding, but worth calling out — people kept looking for the invite action in settings, not on the home screen.", quotes: [] },
    { name: "voice novelty", count: 6, color: "#1A1A2E", summary: "this cohort expected a gimmick and left surprised. the same six respondents had the highest completion rate (91% vs 84% overall).", quotes: [
      { q: "i thought the voice thing was gimmicky. then i realized i was talking about the real problem.", who: "daniel k." },
    ]},
    { name: "integrations", count: 4, color: "#A79E8C", summary: "mostly asks for slack and notion — both already supported. a documentation problem, not a product one.", quotes: [] },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {themes.map(t => (
        <div key={t.name} style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.10)", borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: t.color }}/>
              <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 17, fontWeight: 600, color: "#1A1A2E" }}>{t.name}</div>
            </div>
            <div style={{ fontFamily: "'Absans',serif", fontSize: 24, color: "#1A1A2E" }}>{t.count}</div>
          </div>
          <div style={{ fontSize: 14, color: "#4A4538", lineHeight: 1.55 }}>{t.summary}</div>
          {t.quotes.length > 0 && (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              {t.quotes.map((q, i) => (
                <div key={i} style={{ borderLeft: "2px solid " + t.color, paddingLeft: 12 }}>
                  <div style={{ fontFamily: "'Absans',serif", fontSize: 15, color: "#1A1A2E", lineHeight: 1.35 }}>&ldquo;{q.q}&rdquo;</div>
                  <div style={{ fontSize: 11, color: "#6F685B", marginTop: 3 }}>{q.who}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────── Questions tab ─────────────────────────────────────── */

function QuestionsTab() {
  const questions = [
    { n: 1, q: "tell me about the last time you set up a survey — what was the first thing that tripped you up?", asked: 37, completed: 36, followups: 1.6, topTag: "onboarding" },
    { n: 2, q: "what were you hoping koel would do differently from what you've tried before?", asked: 36, completed: 31, followups: 1.2, topTag: "voice novelty" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {questions.map(it => (
        <div key={it.n} style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.10)", borderRadius: 16, padding: 28, display: "grid", gridTemplateColumns: "60px 1fr 220px", gap: 20 }}>
          <div style={{ fontFamily: "'Absans',serif", fontSize: 40, color: "#E8B04B", lineHeight: 1 }}>{String(it.n).padStart(2,"0")}</div>
          <div>
            <div style={{ fontFamily: "'Absans',serif", fontSize: 22, color: "#1A1A2E", lineHeight: 1.3, letterSpacing: "-0.005em" }}>{it.q}</div>
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#4A4538", background: "#F2EEE6", padding: "3px 10px", borderRadius: 999 }}>top theme · {it.topTag}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#4A7C59", background: "#EAF1EC", padding: "3px 10px", borderRadius: 999 }}>{it.followups} avg follow-ups</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div><div style={{ fontFamily: "'Absans',serif", fontSize: 24, color: "#1A1A2E", lineHeight: 1 }}>{it.asked}</div><div style={{ fontSize: 11, color: "#6F685B", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 3 }}>asked</div></div>
            <div><div style={{ fontFamily: "'Absans',serif", fontSize: 24, color: "#1A1A2E", lineHeight: 1 }}>{it.completed}</div><div style={{ fontSize: 11, color: "#6F685B", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 3 }}>answered</div></div>
          </div>
        </div>
      ))}
      <Button variant="outline" style={{ alignSelf: "flex-start", marginTop: 8 }}><Icon name="plus" size={14}/> edit questions</Button>
    </div>
  );
}

/* ─────────────────────────────────────── Survey settings tab ─────────────────────────────────────── */

function SurveySettingsTab() {
  return (
    <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.10)", borderRadius: 16, padding: 24 }}>
        <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 16, color: "#1A1A2E", marginBottom: 14 }}>status & access</div>
        {[
          { t: "Accepting responses", d: "turn off to close the survey without deleting it.", kind: "toggle", on: true },
          { t: "Respondent cap", d: "automatically close after this many completed voices.", kind: "field", v: "no cap" },
          { t: "Require email", d: "ask for an email before the first question.", kind: "toggle", on: false },
        ].map(row => <SettingRowLite key={row.t} {...row}/>)}
      </div>
      <div style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.10)", borderRadius: 16, padding: 24 }}>
        <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 16, color: "#1A1A2E", marginBottom: 14 }}>conversation</div>
        {[
          { t: "Follow-up style", d: "gentle · curious (default) · thorough.", kind: "field", v: "curious" },
          { t: "Max session length", d: "we'll wrap up after this point.", kind: "field", v: "15 min" },
          { t: "Preserve pauses", d: "keep um's and ah's for verbatim review.", kind: "toggle", on: true },
        ].map(row => <SettingRowLite key={row.t} {...row}/>)}
      </div>
      <div style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.10)", borderRadius: 16, padding: 24 }}>
        <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 16, color: "#1A1A2E", marginBottom: 14 }}>danger zone</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>Delete survey</div><div style={{ fontSize: 12, color: "#6F685B", marginTop: 2 }}>removes the survey and every response. can't be undone.</div></div>
          <Button variant="danger">Delete</Button>
        </div>
      </div>
    </div>
  );
}

function SettingRowLite({ t, d, kind, on, v }) {
  const [toggled, setToggled] = React.useState(on);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderTop: "1px solid rgba(26,26,46,0.06)" }}>
      <div style={{ paddingRight: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>{t}</div>
        <div style={{ fontSize: 12, color: "#6F685B", marginTop: 2, lineHeight: 1.5 }}>{d}</div>
      </div>
      {kind === "toggle" ? (
        <button onClick={() => setToggled(!toggled)} style={{ width: 42, height: 24, borderRadius: 999, border: "none", cursor: "pointer", background: toggled ? "#4A7C59" : "rgba(26,26,46,0.2)", position: "relative", padding: 0, flexShrink: 0 }}>
          <span style={{ position: "absolute", top: 3, left: toggled ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "all 180ms", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}/>
        </button>
      ) : (
        <div style={{ padding: "7px 14px", border: "1px solid rgba(26,26,46,0.15)", borderRadius: 8, fontSize: 13, color: "#1A1A2E", background: "#fff", fontFamily: "'Manrope',sans-serif", minWidth: 120, textAlign: "left" }}>{v}</div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────── Single response drawer ─────────────────────────────────────── */

function ResponseDrawer({ r, onClose }) {
  const resp = r || SAMPLE_RESPONSES[0];
  const [playing, setPlaying] = React.useState(false);
  const [pos, setPos] = React.useState(42);
  const transcript = [
    { t: "0:00", who: "koel", text: "tell me about the last time you set up a survey — what was the first thing that tripped you up?" },
    { t: "0:08", who: "them", text: "honestly, the pricing page confused me more than the product did. i kept going back and forth between \"per voice\" and \"per minute\" and i couldn't tell which i was being charged for." },
    { t: "0:42", who: "koel", text: "when you say \"per voice\" — you mean one interview, however long it was?", highlight: true },
    { t: "0:47", who: "them", text: "yeah, that's what i assumed eventually. but for the first couple minutes i genuinely thought a 5-minute interview might count as 5 voices. the copy says \"per voice\" but there's no tooltip, nothing explaining it." },
    { t: "1:24", who: "koel", text: "did that affect your decision to keep going?" },
    { t: "1:29", who: "them", text: "not really, because your trial made it easy to just try. but it's a friction i'd fix before anyone who's price-sensitive lands on that page." },
  ];
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(26,26,46,0.48)", zIndex: 800, animation: "fadeIn 160ms" }}>
      <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "min(640px, 92vw)", background: "#FAF7F2", boxShadow: "-24px 0 64px rgba(26,26,46,0.24)", display: "flex", flexDirection: "column", animation: "modalIn 220ms cubic-bezier(0.22,1,0.36,1)" }}>
        <div style={{ padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(26,26,46,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#4A4538", cursor: "pointer", padding: 4, display: "inline-flex" }}><Icon name="chevronLeft" size={18}/></button>
            <div style={{ fontSize: 12, color: "#6F685B", letterSpacing: "0.06em" }}>VOICES · response</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="outline" style={{ padding: "7px 12px", fontSize: 13 }}><Icon name="download" size={14}/> transcript</Button>
            <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#6F685B", cursor: "pointer", padding: 4 }}><Icon name="x" size={18}/></button>
          </div>
        </div>

        <div style={{ overflow: "auto", flex: 1 }}>
          <div style={{ padding: "28px 28px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#D4CCBB", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Absans',serif", fontSize: 22, color: "#1A1A2E" }}>{resp.name[0]}</div>
              <div>
                <div style={{ fontFamily: "'Absans',serif", fontSize: 26, color: "#1A1A2E", letterSpacing: "-0.01em", lineHeight: 1.1 }}>{resp.name}</div>
                <div style={{ fontSize: 13, color: "#6F685B", marginTop: 4 }}>{resp.role} · {resp.date}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 22 }}>
              <MetaStat label="DURATION" value={resp.time} icon="clock"/>
              <MetaStat label="SENTIMENT" value={resp.sentiment} icon="sparkle"/>
              <MetaStat label="STATUS" value={resp.completed ? "completed" : "partial"} icon="check"/>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16 }}>
              {resp.tags.map(t => <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#4A4538", background: "#F2EEE6", padding: "4px 10px", borderRadius: 999 }}><Icon name="tag" size={10}/>{t}</span>)}
              <button style={{ background: "transparent", border: "1px dashed rgba(26,26,46,0.20)", borderRadius: 999, padding: "3px 10px", fontSize: 11, color: "#6F685B", cursor: "pointer", fontFamily: "'Manrope',sans-serif" }}>+ add tag</button>
            </div>

            {/* Audio scrubber */}
            <div style={{ marginTop: 22, background: "#1A1A2E", color: "#FAF7F2", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
              <button onClick={() => setPlaying(!playing)} style={{ width: 40, height: 40, borderRadius: "50%", background: "#E8B04B", color: "#1A1A2E", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={playing ? "pause" : "play"} size={16}/>
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(250,247,242,0.7)", fontFamily: "ui-monospace, monospace", marginBottom: 6 }}>
                  <span>{Math.floor(pos/60)}:{String(pos%60).padStart(2,"0")}</span>
                  <span>{resp.time}</span>
                </div>
                <div style={{ height: 28, display: "flex", alignItems: "center", gap: 2 }}>
                  {Array.from({ length: 72 }).map((_, i) => {
                    const h = 20 + Math.abs(Math.sin(i * 0.6) * 70) + (i % 7 === 0 ? 10 : 0);
                    const played = i / 72 < pos / resp.duration;
                    return <div key={i} style={{ width: 3, height: `${Math.min(100, h)}%`, background: played ? "#E8B04B" : "rgba(250,247,242,0.28)", borderRadius: 2 }}/>;
                  })}
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: "4px 28px 28px" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6F685B", fontWeight: 600, marginTop: 16, marginBottom: 12 }}>TRANSCRIPT</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {transcript.map((seg, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "54px 1fr", gap: 14 }}>
                  <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: "#6F685B", paddingTop: 3 }}>{seg.t}</div>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: seg.who === "koel" ? "#E8B04B" : "#4A7C59", fontWeight: 700, marginBottom: 4 }}>{seg.who === "koel" ? "KOEL" : "MAYA"}{seg.highlight && <span style={{ marginLeft: 8, color: "#B3412B", fontWeight: 600 }}>· follow-up</span>}</div>
                    <div style={{ fontFamily: seg.who === "them" ? "'Absans',serif" : "'Manrope',sans-serif", fontSize: seg.who === "them" ? 17 : 14, color: seg.who === "them" ? "#1A1A2E" : "#4A4538", lineHeight: 1.5, fontWeight: seg.who === "koel" ? 500 : 400 }}>{seg.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 28, padding: 18, background: "#fff", border: "1px solid rgba(26,26,46,0.10)", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ display: "inline-flex", color: "#E8B04B" }}><Icon name="sparkle" size={16}/></span>
                <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6F685B", fontWeight: 600 }}>KOEL'S SUMMARY</div>
              </div>
              <div style={{ fontSize: 14, color: "#1A1A2E", lineHeight: 1.6 }}>maya found pricing copy the biggest friction — specifically the ambiguity between "per voice" and "per minute". the trial was enough to convert her anyway, but she'd flag the wording before any price-sensitive landing page visitor.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaStat({ label, value, icon }) {
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.08)", borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6F685B", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}><Icon name={icon} size={10}/>{label}</div>
      <div style={{ fontFamily: "'Absans',serif", fontSize: 18, color: "#1A1A2E", marginTop: 4, letterSpacing: "-0.01em" }}>{value}</div>
    </div>
  );
}

/* ─────────────────────────────────────── Respondent preview session ─────────────────────────────────────── */

function RespondentSession({ onBack }) {
  const [recording, setRecording] = React.useState(false);
  const [bars, setBars] = React.useState(Array.from({ length: 28 }, () => 40));
  React.useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setBars(b => b.map(() => 30 + Math.random() * 70)), 120);
    return () => clearInterval(id);
  }, [recording]);
  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px 36px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(26,26,46,0.08)" }}>
        <AppBrand/>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: "#4A4538", cursor: "pointer", fontSize: 13 }}>exit preview ×</button>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <div style={{ maxWidth: 640, width: "100%" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6F685B", fontWeight: 600 }}>QUESTION 1 OF 2</div>
          <div style={{ fontFamily: "'Absans',serif", fontSize: 40, lineHeight: 1.15, letterSpacing: "-0.015em", color: "#1A1A2E", marginTop: 16, textWrap: "pretty" }}>tell me about the last time you set up a survey — what was the first thing that tripped you up?</div>
          <div style={{ fontSize: 15, color: "#4A4538", marginTop: 16, lineHeight: 1.6 }}>speak whenever you're ready. there's no timer. pause as much as you like — we keep listening.</div>
          <div style={{ marginTop: 48, background: recording ? "#1A1A2E" : "#fff", color: recording ? "#FAF7F2" : "#1A1A2E", borderRadius: 20, padding: 28, display: "flex", alignItems: "center", gap: 22, border: recording ? "1px solid #E8B04B" : "1px solid rgba(26,26,46,0.10)", boxShadow: "0 8px 24px rgba(26,26,46,0.08)", transition: "all 220ms cubic-bezier(0.22,1,0.36,1)" }}>
            <button onClick={() => setRecording(!recording)} style={{ width: 72, height: 72, borderRadius: "50%", background: recording ? "#E8B04B" : "#1A1A2E", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 180ms" }}>
              {recording ? <div style={{ width: 20, height: 20, borderRadius: 4, background: "#1A1A2E" }}/> : <span style={{ color: "#FAF7F2" }}><Icon name="mic" size={28} stroke={1.5}/></span>}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: recording ? "#E8B04B" : "#6F685B", fontWeight: 600 }}>{recording ? "RECORDING · 00:24" : "TAP TO SPEAK"}</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 34, marginTop: 10 }}>
                {bars.map((h, i) => (<div key={i} style={{ width: 3, height: `${recording ? h : 18}%`, background: recording ? "#E8B04B" : "rgba(26,26,46,0.2)", borderRadius: 2, transition: "height 120ms linear" }}/>))}
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

/* ─────────────────────────────────────── Insights (chatbot) ─────────────────────────────────────── */

function InsightsView() {
  const surveys = SAMPLE_SURVEYS.slice(0, 4).map(s => ({ id: s.id, title: s.title, voices: s.responses, status: s.status }));
  const [selected, setSelected] = React.useState(surveys[0]);
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState([
    { role: "koel", text: `i've been listening to ${surveys[0].voices} voices from ${surveys[0].title}. what would you like to understand?`, suggestions: ["what themes came up most?", "where did people get stuck?", "what surprised respondents?"] },
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
        cta={<Button variant="outline"><Icon name="copy" size={14}/> Export thread</Button>}
      />
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", height: "calc(100% - 89px)", minHeight: 0 }}>
        <div style={{ borderRight: "1px solid rgba(26,26,46,0.08)", padding: "20px 16px", overflow: "auto", background: "#FAF7F2" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6F685B", fontWeight: 600, padding: "4px 10px 12px" }}>ASK ABOUT A SURVEY</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {surveys.map(s => {
              const active = selected.id === s.id;
              return (
                <button key={s.id} onClick={() => { setSelected(s); setMessages([{ role: "koel", text: `i've been listening to ${s.voices} voices from ${s.title}. what would you like to understand?`, suggestions: ["what themes came up most?", "where did people get stuck?", "what surprised respondents?"] }]); }} style={{ textAlign: "left", padding: "12px 14px", borderRadius: 10, background: active ? "#1A1A2E" : "transparent", color: active ? "#FAF7F2" : "#1A1A2E", border: "none", cursor: "pointer", fontFamily: "'Manrope',sans-serif" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: active ? "rgba(250,247,242,0.6)" : "#6F685B", marginTop: 4 }}>{s.voices} voices · {s.status}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", minHeight: 0, background: "#FAF7F2" }}>
          <div ref={scrollRef} style={{ flex: 1, overflow: "auto", padding: "28px 48px" }}>
            <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
              {messages.map((m, i) => m.role === "user" ? <UserBubble key={i} text={m.text}/> : <KoelBubble key={i} msg={m} onSuggest={send}/>)}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(26,26,46,0.08)", padding: "16px 48px 24px", background: "#FAF7F2" }}>
            <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 10, alignItems: "flex-end", background: "#fff", border: "1px solid rgba(26,26,46,0.15)", borderRadius: 14, padding: "10px 12px 10px 16px", boxShadow: "0 2px 10px rgba(26,26,46,0.04)" }}>
              <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} placeholder={`ask about "${selected.title}"…`} rows={1} style={{ flex: 1, border: "none", outline: "none", resize: "none", fontFamily: "'Manrope',sans-serif", fontSize: 15, color: "#1A1A2E", background: "transparent", padding: "6px 0", minHeight: 24, maxHeight: 120, lineHeight: 1.5 }}/>
              <button onClick={() => send(input)} style={{ background: input.trim() ? "#1A1A2E" : "rgba(26,26,46,0.1)", color: input.trim() ? "#FAF7F2" : "#6F685B", border: "none", borderRadius: 10, width: 36, height: 36, cursor: input.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 180ms" }}>
                <Icon name="send" size={16}/>
              </button>
            </div>
            <div style={{ maxWidth: 720, margin: "8px auto 0", fontSize: 11, color: "#6F685B", textAlign: "center" }}>answers cite the exact moments they came from. nothing is made up.</div>
          </div>
        </div>
      </div>
    </>
  );
}

function UserBubble({ text }) {
  return (<div style={{ alignSelf: "flex-end", maxWidth: "75%", background: "#1A1A2E", color: "#FAF7F2", padding: "12px 18px", borderRadius: "16px 16px 4px 16px", fontSize: 15, lineHeight: 1.5, fontFamily: "'Manrope',sans-serif" }}>{text}</div>);
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
                  <span>{q.who}</span><span>·</span><span style={{ color: "#4A7C59", cursor: "pointer", fontWeight: 500 }}>▸ play</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {msg.suggestions && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
            {msg.suggestions.map(s => (<button key={s} onClick={() => onSuggest(s)} style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.15)", borderRadius: 999, padding: "7px 14px", fontSize: 13, color: "#1A1A2E", cursor: "pointer", fontFamily: "'Manrope',sans-serif", transition: "all 180ms" }}>{s}</button>))}
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
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr" }}>
        <nav style={{ padding: "28px 20px", borderRight: "1px solid rgba(26,26,46,0.08)", display: "flex", flexDirection: "column", gap: 2, position: "sticky", top: 89, alignSelf: "flex-start" }}>
          {sections.map(s => (
            <button key={s.k} onClick={() => setSection(s.k)} style={{ textAlign: "left", padding: "9px 12px", borderRadius: 8, background: section === s.k ? "rgba(26,26,46,0.06)" : "transparent", border: "none", cursor: "pointer", fontFamily: "'Manrope',sans-serif", fontSize: 14, fontWeight: section === s.k ? 600 : 500, color: s.k === "danger" ? "#B3412B" : "#1A1A2E" }}>{s.l}</button>
          ))}
        </nav>
        <div style={{ padding: "32px 48px", maxWidth: 760 }}>
          <SectionHeader title={sections.find(x => x.k === section).l.toLowerCase()} sub="settings for this workspace."/>
          <div style={{ marginTop: 12, color: "#6F685B", fontSize: 14, lineHeight: 1.6 }}>
            settings ui mirrors the survey-level settings pattern. full settings views documented in the design system.
          </div>
        </div>
      </div>
    </>
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
