"use client";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { updateSurveySettings } from "@/lib/data";
import type { Survey, SurveySettings, SurveyStatus } from "@/lib/types";
import Button from "@/components/ui/Button";

interface SurveySettingsTabProps {
  survey: Survey;
  onSaved: (survey: Survey) => void;
}

const STATUS_OPTIONS: { value: SurveyStatus; label: string; desc: string }[] = [
  { value: "live",   label: "Live",   desc: "Accepting responses" },
  { value: "draft",  label: "Draft",  desc: "Not yet published" },
  { value: "closed", label: "Closed", desc: "No longer accepting" },
];

export default function SurveySettingsTab({ survey, onSaved }: SurveySettingsTabProps) {
  const { getToken } = useAuth();
  const [status, setStatus] = useState<SurveyStatus>(survey.status);
  const [responseCap, setResponseCap] = useState(survey.settings.responseCap?.toString() ?? "");
  const [language, setLanguage] = useState(survey.settings.language);
  const [followUpDepth, setFollowUpDepth] = useState(String(survey.settings.followUpDepth));
  const [collectRespondentName, setCollectRespondentName] = useState(survey.settings.collectRespondentName);
  const [allowAnonymousResponses, setAllowAnonymousResponses] = useState(survey.settings.allowAnonymousResponses);
  const [emailTranscript, setEmailTranscript] = useState(survey.settings.emailTranscript);
  const [closeOnResponseCap, setCloseOnResponseCap] = useState(survey.settings.closeOnResponseCap);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(nextStatus = status) {
    setSaving(true);
    setError(null);
    const settings: SurveySettings = {
      responseCap: responseCap ? Number(responseCap) : null,
      language,
      followUpDepth: Number(followUpDepth),
      collectRespondentName,
      allowAnonymousResponses,
      emailTranscript,
      closeOnResponseCap,
    };
    try {
      const token = await getToken();
      const next = await updateSurveySettings(survey.id, settings, nextStatus, token);
      onSaved(next);
      setStatus(next.status);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3.5" style={{ maxWidth: 720 }}>
      {/* Status & access */}
      <SettingsCard title="status & access">
        {error && (
          <div
            className="mb-4 rounded-[10px] border px-3 py-2 text-sm"
            style={{ borderColor: "var(--color-danger)", color: "var(--color-danger)" }}
          >
            {error}
          </div>
        )}
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
          <label className="mt-2 flex items-center gap-2 text-sm" style={{ color: "var(--color-fg2)" }}>
            <input
              type="checkbox"
              checked={closeOnResponseCap}
              onChange={(e) => setCloseOnResponseCap(e.target.checked)}
            />
            close survey when cap is reached
          </label>
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
        <div className="mt-5 grid grid-cols-1 gap-3">
          <Toggle
            checked={collectRespondentName}
            onChange={setCollectRespondentName}
            label="collect respondent name"
          />
          <Toggle
            checked={allowAnonymousResponses}
            onChange={setAllowAnonymousResponses}
            label="allow anonymous responses"
          />
          <Toggle
            checked={emailTranscript}
            onChange={setEmailTranscript}
            label="offer transcript email"
          />
        </div>
      </SettingsCard>

      <div className="flex justify-end">
        <Button variant="primary" onClick={() => save()} disabled={saving}>
          {saving ? "Saving..." : "Save settings"}
        </Button>
      </div>

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
          <Button
            variant="danger-outline"
            className="shrink-0 ml-6"
            onClick={() => {
              setStatus("closed");
              save("closed");
            }}
            disabled={saving}
          >
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

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between gap-4 text-sm" style={{ color: "var(--color-midnight)" }}>
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
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
