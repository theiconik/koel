/* App UI kit — shared primitives, sidebar, brand, buttons, icons, toast, share */

function Icon({ name, size = 20, stroke = 1.75 }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    mic: <><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/></>,
    home: <><path d="M3 12 12 3l9 9"/><path d="M5 10v10h14V10"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    search: <><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    chart: <><path d="M3 12h3m12 0h3"/><path d="M7 6v12M17 6v12"/><path d="M10 9v6M14 9v6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    check: <><path d="M20 6 9 17l-5-5"/></>,
    play: <><polygon points="6 4 20 12 6 20 6 4"/></>,
    pause: <><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></>,
    send: <><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7z"/></>,
    chevron: <><polyline points="9 18 15 12 9 6"/></>,
    chevronLeft: <><polyline points="15 18 9 12 15 6"/></>,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></>,
    x: <><path d="M18 6 6 18M6 6l12 12"/></>,
    link: <><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></>,
    tag: <><path d="M20.59 13.41 11 22l-9-9V2h11l9 9a2 2 0 0 1-1.41 3.41z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>,
    sparkle: <><path d="M12 3v3M12 18v3M4.5 7.5l2 1M17.5 15.5l2 1M19.5 7.5l-2 1M6.5 15.5l-2 1M3 12h3M18 12h3"/><circle cx="12" cy="12" r="3"/></>,
    arrow: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  };
  return <svg {...props}>{paths[name]}</svg>;
}

function AppBrand({ size = 26 }) {
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

function AppTopBar({ title, crumbs, cta, search, searchPlaceholder = "Search surveys, responses…", onSearch }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 36px", borderBottom: "1px solid rgba(26,26,46,0.08)", background: "#FAF7F2" }}>
      <div>
        {crumbs && <div style={{ fontSize: 12, color: "#6F685B", letterSpacing: "0.04em", marginBottom: 4 }}>{crumbs}</div>}
        <h1 style={{ fontFamily: "'Absans',serif", fontSize: 32, letterSpacing: "-0.015em", color: "#1A1A2E", margin: 0, lineHeight: 1.1 }}>{title}</h1>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {search && (
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6F685B" }}><Icon name="search" size={16}/></span>
            <input onChange={e => onSearch && onSearch(e.target.value)} placeholder={searchPlaceholder} style={{
              fontFamily: "'Manrope',sans-serif", fontSize: 14, padding: "9px 14px 9px 34px",
              border: "1px solid rgba(26,26,46,0.15)", borderRadius: 10, background: "#fff", width: 280, color: "#1A1A2E"
            }}/>
          </div>
        )}
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

function Button({ variant = "primary", children, onClick, style }) {
  const base = { fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 14, borderRadius: 10, padding: "10px 18px", border: "none", cursor: "pointer", transition: "all 180ms cubic-bezier(0.22,1,0.36,1)", lineHeight: 1, display: "inline-flex", alignItems: "center", gap: 6 };
  const variants = {
    primary:  { background: "#E8B04B", color: "#1A1A2E" },
    midnight: { background: "#1A1A2E", color: "#FAF7F2" },
    outline:  { background: "transparent", color: "#1A1A2E", border: "1px solid rgba(26,26,46,0.20)", padding: "9px 17px" },
    ghost:    { background: "transparent", color: "#1A1A2E", padding: "10px 12px" },
    danger:   { background: "transparent", color: "#B3412B", border: "1px solid #B3412B", padding: "9px 17px" },
  };
  return <button onClick={onClick} style={{ ...base, ...variants[variant], ...style }}>{children}</button>;
}

function Toast({ text }) {
  return (
    <div style={{
      position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
      background: "#1A1A2E", color: "#FAF7F2", padding: "12px 20px", borderRadius: 12,
      fontFamily: "'Manrope',sans-serif", fontSize: 14, fontWeight: 500,
      display: "flex", alignItems: "center", gap: 10,
      boxShadow: "0 12px 32px rgba(26,26,46,0.28)", animation: "toastIn 200ms cubic-bezier(0.22,1,0.36,1)", zIndex: 1000,
    }}>
      <span style={{ color: "#4A7C59", display: "inline-flex" }}><Icon name="check" size={16} stroke={2.5}/></span>
      {text}
    </div>
  );
}

function ShareModal({ onClose, url }) {
  const [copied, setCopied] = React.useState(false);
  function copy() { navigator.clipboard && navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1600); }
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent("we're listening to real voices with koel — take 3 minutes:")}&url=${encodeURIComponent(url)}`;
  const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(26,26,46,0.48)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 900, animation: "fadeIn 160ms", padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#FAF7F2", borderRadius: 20, width: "100%", maxWidth: 480, padding: 28, boxShadow: "0 24px 64px rgba(26,26,46,0.24)", animation: "modalIn 200ms cubic-bezier(0.22,1,0.36,1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6F685B", fontWeight: 600 }}>SHARE SURVEY</div>
            <div style={{ fontFamily: "'Absans',serif", fontSize: 28, color: "#1A1A2E", marginTop: 8, letterSpacing: "-0.015em", lineHeight: 1.15 }}>send it to the people whose voice you want.</div>
          </div>
          <button onClick={onClose} aria-label="close" style={{ background: "transparent", border: "none", color: "#6F685B", cursor: "pointer", padding: 4, marginTop: 2 }}><Icon name="x" size={20}/></button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid rgba(26,26,46,0.12)", borderRadius: 12, padding: "10px 10px 10px 14px", marginTop: 22 }}>
          <span style={{ color: "#6F685B", display: "inline-flex" }}><Icon name="link" size={16}/></span>
          <div style={{ flex: 1, minWidth: 0, fontFamily: "ui-monospace, monospace", fontSize: 13, color: "#1A1A2E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</div>
          <button onClick={copy} style={{ background: copied ? "#4A7C59" : "#1A1A2E", color: "#FAF7F2", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope',sans-serif" }}>{copied ? "copied" : "copy"}</button>
        </div>

        <div style={{ fontSize: 12, color: "#6F685B", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginTop: 24, marginBottom: 10 }}>OR POST TO</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <a href={xUrl} target="_blank" rel="noopener" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#fff", border: "1px solid rgba(26,26,46,0.12)", borderRadius: 12, textDecoration: "none", color: "#1A1A2E", transition: "all 180ms" }}
             onMouseEnter={e => { e.currentTarget.style.background = "#1A1A2E"; e.currentTarget.style.color = "#FAF7F2"; }}
             onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#1A1A2E"; }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#1A1A2E", color: "#FAF7F2", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Absans',serif", fontSize: 16, flexShrink: 0 }}>X</div>
            <div><div style={{ fontSize: 14, fontWeight: 600 }}>X</div><div style={{ fontSize: 12, opacity: 0.7 }}>post with a preview</div></div>
          </a>
          <a href={liUrl} target="_blank" rel="noopener" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#fff", border: "1px solid rgba(26,26,46,0.12)", borderRadius: 12, textDecoration: "none", color: "#1A1A2E", transition: "all 180ms" }}
             onMouseEnter={e => { e.currentTarget.style.background = "#0A66C2"; e.currentTarget.style.color = "#fff"; }}
             onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#1A1A2E"; }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#0A66C2", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>in</div>
            <div><div style={{ fontSize: 14, fontWeight: 600 }}>LinkedIn</div><div style={{ fontSize: 12, opacity: 0.7 }}>share to your network</div></div>
          </a>
        </div>

        <div style={{ fontSize: 12, color: "#6F685B", marginTop: 22, lineHeight: 1.6 }}>respondents won't see an X or LinkedIn brand on the survey itself — only koel. they tap and speak.</div>
      </div>
    </div>
  );
}

function TabBtn({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: "transparent", border: "none", padding: "12px 4px", marginRight: 24,
      fontFamily: "'Manrope',sans-serif", fontSize: 14, fontWeight: active ? 600 : 500,
      color: active ? "#1A1A2E" : "#6F685B", cursor: "pointer",
      borderBottom: active ? "2px solid #E8B04B" : "2px solid transparent", marginBottom: -1,
    }}>{children}</button>
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

function StatCard({ label, value, note }) {
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.10)", borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6F685B", fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: "'Absans',serif", fontSize: 38, color: "#1A1A2E", letterSpacing: "-0.02em", marginTop: 8, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#6F685B", marginTop: 8 }}>{note}</div>
    </div>
  );
}

/* ─── Sample data used by multiple views ─── */
const SAMPLE_SURVEYS = [
  { id: 1, slug: "onboarding-v3", title: "onboarding feedback — v3", desc: "how new signups found their feet in week 1.", status: "live", responses: 37, duration: "3m 42s", completion: "84%" },
  { id: 2, slug: "pricing", title: "pricing page research", desc: "what confuses people at the moment of decision.", status: "live", responses: 12, duration: "5m 10s", completion: "71%" },
  { id: 3, slug: "churn", title: "churn exit interviews", desc: "a quiet, unscripted conversation before they go.", status: "draft", responses: 0, duration: "—", completion: "—" },
  { id: 4, slug: "q3-advisory", title: "q3 customer advisory", desc: "12 of our most thoughtful users, 20 minutes each.", status: "closed", responses: 12, duration: "18m 04s", completion: "100%" },
  { id: 5, slug: "beta-nps", title: "beta nps · march cohort", desc: "what the first 200 beta users would tell a friend.", status: "closed", responses: 48, duration: "4m 12s", completion: "92%" },
  { id: 6, slug: "support-loop", title: "support loop closings", desc: "after a ticket resolves, we ask what almost made them leave.", status: "live", responses: 21, duration: "2m 48s", completion: "68%" },
  { id: 7, slug: "onboarding-v2", title: "onboarding feedback — v2", desc: "the previous iteration, archived for reference.", status: "closed", responses: 54, duration: "3m 58s", completion: "79%" },
];
