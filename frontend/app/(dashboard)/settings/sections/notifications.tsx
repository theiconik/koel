"use client";
import {
  SectionHeader,
  SettingRow,
  Toggle,
} from "@/components/ui/SettingsPrimitives";

export function NotificationSettings() {
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
