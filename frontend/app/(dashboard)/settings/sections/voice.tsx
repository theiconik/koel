"use client";
import { useState } from "react";
import {
  SectionHeader,
  SettingRow,
  SettingsSelect,
  Toggle,
} from "@/components/ui/SettingsPrimitives";

export function VoiceSettings() {
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
                    accentColor: "var(--color-mango)",
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
