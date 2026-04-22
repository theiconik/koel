"use client";
import Button from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SettingsPrimitives";

export function IntegrationsSettings() {
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
            border: "1px solid var(--color-border-soft)",
            borderRadius: 12,
            boxShadow: "var(--shadow-xs)",
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
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-midnight)" }}>{a.name}</div>
              <div style={{ fontSize: 12, color: "var(--color-stone-500)", marginTop: 2 }}>{a.desc}</div>
            </div>
            {a.connected ? (
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "var(--color-success-bg)",
                  color: "var(--color-success)",
                  padding: "5px 11px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-success)", display: "inline-block" }} />
                  live
                </span>
                <Button variant="outline">Configure</Button>
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
