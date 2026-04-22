"use client";
import { useState } from "react";

export function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, letterSpacing: "-0.015em", color: "var(--color-midnight)", margin: 0, fontWeight: 400 }}>
        {title}
      </h2>
      {sub && <div style={{ fontSize: 14, color: "var(--color-stone-500)", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export function SettingRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(200px, 1fr) minmax(0, 2fr)", gap: "32px 48px", padding: "20px 0", borderBottom: "1px solid var(--color-border)", alignItems: "start" }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-midnight)" }}>{label}</div>
        {hint && <div style={{ fontSize: 13, color: "var(--color-stone-500)", marginTop: 6, lineHeight: 1.5 }}>{hint}</div>}
      </div>
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}

export function Field({
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
  const style: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid var(--color-border-strong)",
    borderRadius: 10,
    fontSize: 14,
    fontFamily: "var(--font-body)",
    color: "var(--color-midnight)",
    boxSizing: "border-box",
    outline: "none",
    background: readOnly ? "var(--color-bg-sunken)" : "var(--color-bg-raised)",
    cursor: readOnly ? "default" : undefined,
  };

  // readOnly: controlled so async updates (e.g. Clerk user loading) propagate.
  // editable: uncontrolled since we don't track changes here yet.
  const valueProps = readOnly
    ? { value: value ?? "", readOnly: true, "aria-readonly": true as const }
    : { defaultValue: value };

  return <input type={type} placeholder={placeholder} style={style} {...valueProps} />;
}

const SETTINGS_SELECT_CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%231A1A2E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

export function SettingsSelect({
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
        border: "1px solid var(--color-border-strong)",
        borderRadius: 10,
        fontSize: 14,
        fontFamily: "var(--font-body)",
        color: "var(--color-midnight)",
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

export function Toggle({ defaultOn }: { defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
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
        background: on ? "var(--color-toggle-on)" : "var(--color-toggle-off)",
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

