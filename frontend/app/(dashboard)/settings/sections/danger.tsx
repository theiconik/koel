"use client";
import Button from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SettingsPrimitives";

export function DangerSettings() {
  const descStyle: React.CSSProperties = {
    fontSize: 13,
    color: "var(--color-stone-500)",
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
    border: `1px solid var(--color-danger-zone-border)`,
    borderRadius: 16,
    background: "var(--color-danger-zone-bg)",
  };
  return (
    <div>
      <SectionHeader title="danger zone" sub="these actions can't be undone." />
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={cardStyle}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-midnight)" }}>Export and delete all data</div>
            <div style={descStyle}>we&apos;ll email you a ZIP of every transcript, then purge the workspace.</div>
          </div>
          <Button variant="danger-outline">Export &amp; delete</Button>
        </div>
        <div style={cardStyle}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-midnight)" }}>Delete workspace</div>
            <div style={descStyle}>permanent. billing stops immediately.</div>
          </div>
          <Button variant="danger">Delete workspace</Button>
        </div>
      </div>
    </div>
  );
}
