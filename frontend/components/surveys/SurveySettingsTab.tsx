"use client";
import { useState } from "react";
import type { Survey, SurveyStatus } from "@/lib/types";
import Button from "@/components/ui/Button";

interface SurveySettingsTabProps {
  survey: Survey;
}

const STATUS_OPTIONS: { value: SurveyStatus; label: string; desc: string }[] = [
  { value: "live",   label: "Live",   desc: "Accepting responses" },
  { value: "draft",  label: "Draft",  desc: "Not yet published" },
  { value: "closed", label: "Closed", desc: "No longer accepting" },
];

export default function SurveySettingsTab({ survey }: SurveySettingsTabProps) {
  const [status, setStatus] = useState<SurveyStatus>(survey.status);
  const [responseCap, setResponseCap] = useState("");
  const [language, setLanguage] = useState("en");
  const [followUpDepth, setFollowUpDepth] = useState("2");

  return (
    <div className="flex flex-col gap-3.5" style={{ maxWidth: 720 }}>
      {/* Status & access */}
      <SettingsCard title="status & access">
        <div className="flex flex-col gap-3">
          <Label>Survey status</Label>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                className="flex-1 px-4 py-3 rounded-xl border text-left transition-all"
                style={{
                  background: status === opt.value ? "var(--color-midnight)" : "var(--color-bg-raised)",
                  borderColor: status === opt.value ? "var(--color-midnight)" : "var(--color-border-medium)",
                  color: status === opt.value ? "var(--color-fg-inverse)" : "var(--color-midnight)",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                <div className="text-sm font-semibold">{opt.label}</div>
                <div
                  className="text-xs mt-0.5"
                  style={{ color: status === opt.value ? "rgba(250,247,242,0.6)" : "var(--color-fg3)" }}
                >
                  {opt.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          <Label>Response cap</Label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={responseCap}
              onChange={(e) => setResponseCap(e.target.value)}
              placeholder="No limit"
              min={1}
              className="w-36 px-3.5 py-2.5 rounded-[10px] border text-sm outline-none transition-all"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-midnight)",
                borderColor: "var(--color-border-strong)",
                background: "var(--color-bg-raised)",
              }}
            />
            <span className="text-sm" style={{ color: "var(--color-fg3)" }}>
              responses maximum
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-fg4)" }}>
            Survey closes automatically when this number is reached.
          </p>
        </div>
      </SettingsCard>

      {/* Voice settings */}
      <SettingsCard title="voice & transcription">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Language</Label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3.5 py-2.5 rounded-[10px] border text-sm outline-none"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-midnight)",
                borderColor: "var(--color-border-strong)",
                background: "var(--color-bg-raised)",
                cursor: "pointer",
              }}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Follow-up depth</Label>
            <select
              value={followUpDepth}
              onChange={(e) => setFollowUpDepth(e.target.value)}
              className="px-3.5 py-2.5 rounded-[10px] border text-sm outline-none"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-midnight)",
                borderColor: "var(--color-border-strong)",
                background: "var(--color-bg-raised)",
                cursor: "pointer",
              }}
            >
              <option value="1">1 follow-up per question</option>
              <option value="2">2 follow-ups per question</option>
              <option value="3">3 follow-ups per question</option>
            </select>
            <p className="text-xs" style={{ color: "var(--color-fg4)" }}>
              koel will ask this many clarifying questions per topic.
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Danger zone */}
      <SettingsCard title="danger zone" danger>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold" style={{ color: "var(--color-danger-zone)" }}>
              Close this survey
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--color-fg3)" }}>
              Stops accepting responses immediately. Cannot be undone without re-opening manually.
            </div>
          </div>
          <Button variant="danger-outline" className="shrink-0 ml-6">
            Close survey
          </Button>
        </div>

        <div
          className="mt-3 pt-3 flex items-center justify-between"
          style={{ borderTop: "1px solid var(--color-danger-zone-border)" }}
        >
          <div>
            <div className="text-sm font-semibold" style={{ color: "var(--color-danger-zone)" }}>
              Delete this survey
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--color-fg3)" }}>
              Permanently removes all responses, themes, and transcripts.
            </div>
          </div>
          <Button variant="danger" className="shrink-0 ml-6">
            Delete survey
          </Button>
        </div>
      </SettingsCard>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="text-sm font-medium"
      style={{ color: "var(--color-midnight)", fontFamily: "var(--font-body)" }}
    >
      {children}
    </label>
  );
}

function SettingsCard({
  title,
  danger = false,
  children,
}: {
  title: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-6 border"
      style={{
        background: danger ? "var(--color-danger-zone-bg)" : "var(--color-bg-raised)",
        borderColor: danger ? "var(--color-danger-zone-border)" : "var(--color-border)",
      }}
    >
      <div
        className="font-semibold text-base mb-4"
        style={{
          color: danger ? "var(--color-danger-zone)" : "var(--color-midnight)",
          fontFamily: "var(--font-body)",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
