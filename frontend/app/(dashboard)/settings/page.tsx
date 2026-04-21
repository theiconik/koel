"use client";
import { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";

const SECTIONS = [
  { k: "profile",       l: "Profile" },
  { k: "voice",         l: "Voice & transcription" },
  { k: "notifications", l: "Notifications" },
  { k: "billing",       l: "Billing" },
  { k: "integrations",  l: "Integrations" },
  { k: "danger",        l: "Danger zone" },
] as const;
type Section = (typeof SECTIONS)[number]["k"];

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, letterSpacing: "-0.015em", color: "var(--midnight)", margin: 0, fontWeight: 400 }}>
        {title}
      </h2>
      {sub && <div style={{ fontSize: 14, color: "var(--stone-500)", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function SettingRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(200px, 1fr) minmax(0, 2fr)", gap: "32px 48px", padding: "20px 0", borderBottom: "1px solid rgba(26,26,46,0.06)", alignItems: "start" }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-midnight)" }}>{label}</div>
        {hint && <div style={{ fontSize: 13, color: "var(--color-stone-500)", marginTop: 6, lineHeight: 1.5 }}>{hint}</div>}
      </div>
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}

function Field({
  value,
  placeholder,
  type = "text",
  readOnly,
}: {
  value?: string;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
}) {
  const baseStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid rgba(26,26,46,0.15)",
    borderRadius: 10,
    fontSize: 14,
    fontFamily: "var(--font-body)",
    color: "var(--midnight)",
    boxSizing: "border-box",
    outline: "none",
    background: readOnly ? "rgba(26,26,46,0.04)" : "#fff",
    cursor: readOnly ? "default" : undefined,
  };

  if (readOnly) {
    return (
      <input
        type={type}
        value={value ?? ""}
        readOnly
        placeholder={placeholder}
        aria-readonly="true"
        style={baseStyle}
      />
    );
  }

  return (
    <input
      type={type}
      defaultValue={value}
      placeholder={placeholder}
      style={baseStyle}
    />
  );
}

const SETTINGS_SELECT_CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%231A1A2E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

/** Strips the UA dropdown arrow (padding does not inset it on WebKit) and draws a chevron inset from the right. */
function SettingsSelect({
  style,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...rest}
      style={{
        width: "100%",
        padding: "10px 42px 10px 14px",
        border: "1px solid rgba(26,26,46,0.15)",
        borderRadius: 10,
        fontSize: 14,
        fontFamily: "var(--font-body)",
        color: "var(--midnight)",
        backgroundColor: "#fff",
        boxSizing: "border-box",
        outline: "none",
        cursor: "pointer",
        appearance: "none",
        WebkitAppearance: "none",
        MozAppearance: "none",
        backgroundImage: SETTINGS_SELECT_CHEVRON,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 14px center",
        backgroundSize: "18px 18px",
        ...style,
      }}
    >
      {children}
    </select>
  );
}

/** Pill switch: grey track when off, forest green when on. */
function Toggle({ defaultOn }: { defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  const trackOn = "#4D6D53";
  const trackOff = "rgba(26, 26, 46, 0.22)";
  const w = 44;
  const h = 28;
  const thumb = 22;
  const pad = 3;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setOn(!on)}
      style={{
        width: w,
        height: h,
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        background: on ? trackOn : trackOff,
        position: "relative",
        transition: "background 180ms ease",
        padding: 0,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: pad,
          left: on ? w - thumb - pad : pad,
          width: thumb,
          height: thumb,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 180ms cubic-bezier(0.22, 1, 0.36, 1)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
          display: "block",
        }}
      />
    </button>
  );
}

function OutlineBtn({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <button style={{
      padding: "10px 18px", background: "transparent",
      color: danger ? "var(--danger)" : "var(--midnight)",
      border: `1px solid ${danger ? "var(--danger)" : "rgba(26,26,46,0.20)"}`,
      borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer",
      fontFamily: "var(--font-body)", transition: "all 180ms",
    }}>{children}</button>
  );
}

function ProfileSettings() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [signingOut, setSigningOut] = useState(false);
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toLowerCase() || "—";
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  const handleLogout = () => {
    setSigningOut(true);
    void signOut({ redirectUrl: "/sign-in" }).catch(() => setSigningOut(false));
  };

  return (
    <div>
      <SectionHeader title="profile" sub="how you show up in koel." />
      <div style={{ marginTop: 12 }}>
        <SettingRow label="Avatar">
          <div style={{
            width: 56, height: 56, borderRadius: "50%", background: "var(--stone-300)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-display)", fontSize: 22, color: "var(--midnight)",
            overflow: "hidden", flexShrink: 0,
          }}>
            {user?.imageUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={user.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : initials}
          </div>
        </SettingRow>
        <SettingRow label="Full name">
          <Field value={fullName} readOnly placeholder="—" />
        </SettingRow>
        <SettingRow label="Email" hint="used for sign-in and weekly digests.">
          <Field value={email} type="email" readOnly placeholder="—" />
        </SettingRow>
        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="primary" onClick={handleLogout} disabled={signingOut}>
            {signingOut ? "Signing out…" : "Logout"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function WorkspaceSettings() {
  return (
    <div>
      <SectionHeader title="workspace" sub="settings for roshi research." />
      <div style={{ marginTop: 12 }}>
        <SettingRow label="Workspace name">
          <Field value="Roshi Research" />
        </SettingRow>
        <SettingRow label="Slug" hint="used in survey links: koel.to/{slug}/…">
          <Field value="roshi" />
        </SettingRow>
        <SettingRow label="Default language" hint="applies to new surveys.">
          <SettingsSelect defaultValue="en">
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="es">Spanish</option>
            <option value="de">German</option>
          </SettingsSelect>
        </SettingRow>
        <SettingRow label="Branding" hint="add your logo to respondent pages.">
          <OutlineBtn>Upload workspace logo</OutlineBtn>
        </SettingRow>
      </div>
    </div>
  );
}

export { WorkspaceSettings };

function VoiceSettings() {
  const [followUp, setFollowUp] = useState(1);
  const options = [
    { t: "gentle",   d: "one follow-up, if there's obvious emotion or ambiguity." },
    { t: "curious",  d: "follow up on anything unexpected. (default)" },
    { t: "thorough", d: "dig into every answer — longer sessions." },
  ];
  return (
    <div>
      <SectionHeader title="voice & transcription" sub="how koel listens and what it keeps." />
      <div style={{ marginTop: 12 }}>
        <SettingRow label="Follow-up style" hint="how koel decides to ask the next question.">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {options.map((o, i) => (
              <label
                key={o.t}
                onClick={() => setFollowUp(i)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "14px 16px",
                  cursor: "pointer",
                  border: `1px solid ${followUp === i ? "var(--color-mango)" : "var(--color-border)"}`,
                  borderRadius: 10,
                  background: followUp === i ? "var(--color-stone-100)" : "var(--color-bg-raised)",
                  boxSizing: "border-box",
                }}
              >
                <input
                  type="radio"
                  name="followup"
                  checked={followUp === i}
                  onChange={() => setFollowUp(i)}
                  style={{
                    marginTop: 2,
                    width: 18,
                    height: 18,
                    flexShrink: 0,
                    accentColor: "#2563EB",
                    cursor: "pointer",
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-midnight)" }}>{o.t}</div>
                  <div style={{ fontSize: 13, color: "var(--color-stone-500)", marginTop: 4, lineHeight: 1.45 }}>{o.d}</div>
                </div>
              </label>
            ))}
          </div>
        </SettingRow>
        <SettingRow label="Preserve pauses" hint="keep the um's, ah's and silences — useful for verbatim review.">
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
            <Toggle defaultOn={false} />
          </div>
        </SettingRow>
        <SettingRow label="Auto-tag themes" hint="koel proposes tags; you can edit them any time.">
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
            <Toggle defaultOn={false} />
          </div>
        </SettingRow>
        <SettingRow label="Retention" hint="how long we keep raw audio. transcripts stay indefinitely.">
          <SettingsSelect defaultValue="90">
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="365">1 year</option>
            <option value="0">Keep until deleted</option>
          </SettingsSelect>
        </SettingRow>
      </div>
    </div>
  );
}

function NotificationSettings() {
  const rows = [
    { t: "New response",   d: "when someone completes a voice session.",   on: true },
    { t: "Weekly digest",  d: "a monday summary of what voices said.",      on: true },
    { t: "Theme spike",    d: "when a new theme crosses 5+ mentions.",      on: true },
    { t: "Survey closed",  d: "when a survey reaches its response cap.",    on: false },
    { t: "Team activity",  d: "when a collaborator edits or comments.",     on: false },
  ];
  return (
    <div>
      <SectionHeader title="notifications" sub="you'll get these by email. slack available on flock." />
      <div style={{ marginTop: 12 }}>
        {rows.map(r => (
          <SettingRow key={r.t} label={r.t} hint={r.d}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Toggle defaultOn={r.on} />
            </div>
          </SettingRow>
        ))}
      </div>
    </div>
  );
}

function BillingSettings() {
  return (
    <div>
      <SectionHeader title="billing" sub="you're on flock — renews 14 apr 2026." />
      <div style={{
        marginTop: 20,
        background: "var(--color-bg-inverse)",
        color: "var(--color-fg-inverse)",
        borderRadius: 16,
        padding: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-mango)", fontWeight: 600 }}>CURRENT PLAN</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 32, marginTop: 8, fontWeight: 600 }}>flock</div>
          <div style={{ fontSize: 13, color: "rgba(250,247,242,0.65)", marginTop: 4 }}>$79 / month · 500 voices included</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 28, color: "var(--color-mango)", fontWeight: 500 }}>317 / 500</div>
          <div style={{ fontSize: 12, color: "rgba(250,247,242,0.85)", marginTop: 2 }}>voices this month</div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <SettingRow label="Payment method" hint="we'll email before any overage charges.">
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", border: "1px solid rgba(26,26,46,0.12)", borderRadius: 10, background: "#fff",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14 }}>
              <div style={{
                width: 36, height: 24, background: "var(--color-midnight)", borderRadius: 4,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, color: "#fff", fontWeight: 700, letterSpacing: 1,
              }}>VISA</div>
              <span>•••• 4242</span>
              <span style={{ color: "var(--stone-500)" }}>· exp 08/28</span>
            </div>
            <OutlineBtn>Update</OutlineBtn>
          </div>
        </SettingRow>
        <SettingRow label="Billing email">
          <Field value="finance@roshi.co" type="email" />
        </SettingRow>
        <SettingRow label="Invoices" hint="download past invoices as PDF.">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["Mar 2026 · $79.00", "Feb 2026 · $79.00", "Jan 2026 · $79.00"].map(x => (
              <div key={x} style={{
                display: "flex", justifyContent: "space-between", padding: "10px 14px",
                border: "1px solid rgba(26,26,46,0.08)", borderRadius: 10,
                fontSize: 13, color: "var(--midnight)", background: "#fff",
              }}>
                <span>{x}</span>
                <span style={{ color: "#2D5A43", cursor: "pointer", fontWeight: 600 }}>Download</span>
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
    { name: "Slack",     desc: "post new responses to a channel.",     connected: true,  dot: "#4A148C" },
    { name: "Linear",    desc: "turn insights into issues.",           connected: true,  dot: "#5E6AD2" },
    { name: "Notion",    desc: "sync themes to a research database.",  connected: false, dot: "#1A1A2E" },
    { name: "Zapier",    desc: "3,000+ downstream workflows.",         connected: false, dot: "#E8B04B" },
    { name: "Webhooks",  desc: "post events to any https endpoint.",   connected: false, dot: "#4A7C59" },
  ];
  return (
    <div>
      <SectionHeader title="integrations" sub="pipe koel into the rest of your stack." />
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        {apps.map(a => (
          <div key={a.name} style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "16px 18px", background: "#fff",
            border: "1px solid rgba(26,26,46,0.05)",
            borderRadius: 12,
            boxShadow: "0 1px 2px rgba(26,26,46,0.04)",
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: a.dot + "22",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: a.dot, fontFamily: "var(--font-display)", fontSize: 18, flexShrink: 0, fontWeight: 400,
            }}>
              {a.name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--midnight)" }}>{a.name}</div>
              <div style={{ fontSize: 12, color: "var(--stone-500)", marginTop: 2 }}>{a.desc}</div>
            </div>
            {a.connected ? (
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "#D8F0E4",
                  color: "#1B5E3A",
                  padding: "5px 11px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1B5E3A", display: "inline-block" }} />
                  live
                </span>
                <OutlineBtn>Configure</OutlineBtn>
              </div>
            ) : (
              <Button type="button" variant="midnight" className="rounded-full px-[22px] shrink-0">
                Connect
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DangerSettings() {
  /** Terracotta + peach surfaces — matches danger-zone spec (not global `--danger` red). */
  const accent = "#A44C3D";
  const cardBg = "#FDF2F0";
  const cardBorder = "#F1D3CF";
  const descStyle: React.CSSProperties = {
    fontSize: 13,
    color: "var(--stone-500)",
    marginTop: 6,
    lineHeight: 1.5,
    textTransform: "lowercase",
  };
  const cardStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 24,
    padding: "22px 24px",
    border: `1px solid ${cardBorder}`,
    borderRadius: 16,
    background: cardBg,
  };
  return (
    <div>
      <SectionHeader title="danger zone" sub="these actions can't be undone." />
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={cardStyle}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--midnight)" }}>Export and delete all data</div>
            <div style={descStyle}>we&apos;ll email you a ZIP of every transcript, then purge the workspace.</div>
          </div>
          <button
            type="button"
            style={{
              flexShrink: 0,
              padding: "10px 18px",
              background: "transparent",
              color: accent,
              border: `1px solid ${accent}`,
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              transition: "background 180ms ease, color 180ms ease, border-color 180ms ease",
            }}
          >
            Export &amp; delete
          </button>
        </div>
        <div style={cardStyle}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--midnight)" }}>Delete workspace</div>
            <div style={descStyle}>permanent. billing stops immediately.</div>
          </div>
          <button
            type="button"
            style={{
              flexShrink: 0,
              padding: "10px 18px",
              background: accent,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              transition: "opacity 180ms ease",
            }}
          >
            Delete workspace
          </button>
        </div>
      </div>
    </div>
  );
}

const CONTENT: Record<Section, React.ReactNode> = {
  profile:       <ProfileSettings />,
  voice:         <VoiceSettings />,
  notifications: <NotificationSettings />,
  billing:       <BillingSettings />,
  integrations:  <IntegrationsSettings />,
  danger:        <DangerSettings />,
};

export default function SettingsPage() {
  const [active, setActive] = useState<Section>("profile");

  return (
    <>
      <TopBar title="settings" crumbs="HOME · SETTINGS" />
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr" }}>
        <nav style={{
          padding: "28px 20px",
          borderRight: "1px solid rgba(26,26,46,0.08)",
          display: "flex", flexDirection: "column", gap: 2,
          position: "sticky", top: 89, alignSelf: "flex-start",
        }}>
          {SECTIONS.map(s => (
            <button
              key={s.k}
              onClick={() => setActive(s.k)}
              style={{
                textAlign: "left", padding: "9px 12px", borderRadius: 8,
                background: active === s.k ? "rgba(26,26,46,0.06)" : "transparent",
                border: "none", cursor: "pointer", fontFamily: "var(--font-body)",
                fontSize: 14, fontWeight: active === s.k ? 600 : 500,
                color: s.k === "danger" ? "var(--danger)" : "var(--midnight)",
              }}
            >
              {s.l}
            </button>
          ))}
        </nav>
        <div style={{ padding: "32px 48px", maxWidth: 900 }}>
          {CONTENT[active]}
        </div>
      </div>
    </>
  );
}
