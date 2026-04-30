"use client";

import Icon from "@/components/ui/Icon";
import type { Response as SurveyResponse, Theme } from "@/lib/types";

interface VoicesTabProps {
  responses: SurveyResponse[];
  themes: Theme[];
  onOpenResponse: (response: SurveyResponse) => void;
}

function EmptyResponses() {
  return (
    <div
      className="rounded-2xl border px-8 py-14 text-center"
      style={{ background: "var(--color-bg-raised)", borderColor: "var(--color-border)" }}
    >
      <div
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: "var(--color-stone-100)", color: "var(--color-fg2)" }}
      >
        <Icon name="mic" size={20} />
      </div>
      <div className="text-lg font-semibold" style={{ color: "var(--color-midnight)" }}>
        waiting for first voice
      </div>
      <p className="mx-auto mt-2 max-w-[360px] text-sm leading-relaxed" style={{ color: "var(--color-fg3)" }}>
        share the survey link and responses will appear here with transcripts, themes, and summaries.
      </p>
    </div>
  );
}

function ResponseCard({
  response,
  onOpen,
}: {
  response: SurveyResponse;
  onOpen: (response: SurveyResponse) => void;
}) {
  const quote =
    response.processingStatus === "done"
      ? `"${response.quote}"`
      : response.processingStatus === "failed"
        ? "processing failed - transcript could not be generated."
        : "processing response - transcript and themes will appear shortly.";

  return (
    <button
      type="button"
      onClick={() => onOpen(response)}
      aria-label={`Open response details for ${response.respondentName}`}
      className="response-hover w-full rounded-2xl border px-[22px] py-5 text-left transition-all"
      style={{
        background: "var(--color-bg-raised)",
        borderColor: "var(--color-border)",
        cursor: "pointer",
      }}
    >
      <div className="flex justify-between text-xs" style={{ color: "var(--color-fg3)" }}>
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-6 rounded-full" style={{ background: "var(--color-stone-300)" }} />
          <span className="text-[13px] font-semibold" style={{ color: "var(--color-midnight)" }}>
            {response.respondentName}
          </span>
          {response.respondentRole !== "—" && (
            <>
              <span>·</span>
              <span>{response.respondentRole}</span>
            </>
          )}
        </div>
        <div>{response.duration}</div>
      </div>

      <div
        className="mt-3 text-xl leading-snug tracking-normal"
        style={{ fontFamily: "var(--font-display)", color: "var(--color-midnight)" }}
      >
        {quote}
      </div>

      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {response.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full px-2.5 py-[3px] text-[11px] font-semibold"
            style={{ color: "var(--color-fg2)", background: "var(--color-stone-100)" }}
          >
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}

function ThemesPanel({ themes }: { themes: Theme[] }) {
  const maxTheme = Math.max(...themes.map((theme) => theme.count), 1);

  return (
    <aside
      className="self-start rounded-2xl border p-[22px]"
      style={{
        background: "var(--color-bg-raised)",
        borderColor: "var(--color-border)",
        boxShadow: "0 2px 8px rgba(26,26,46,0.04)",
      }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: "var(--color-fg3)" }}>
        AUTO-THEMES
      </div>
      <div
        className="mt-1.5 text-base font-semibold"
        style={{ color: "var(--color-midnight)", fontFamily: "var(--font-body)" }}
      >
        what people keep coming back to
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {themes.length === 0 ? (
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-fg3)" }}>
            themes will appear after the first response lands.
          </p>
        ) : (
          themes.map((theme) => (
            <div key={theme.name}>
              <div className="mb-1 flex justify-between text-sm" style={{ color: "var(--color-midnight)" }}>
                <span className="font-medium">{theme.name}</span>
                <span style={{ color: "var(--color-fg3)", fontFamily: "var(--font-mono)" }}>{theme.count}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-sm" style={{ background: "var(--color-stone-100)" }}>
                <div
                  className="h-full rounded-sm"
                  style={{ width: `${(theme.count / maxTheme) * 100}%`, background: theme.color }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

export function VoicesTab({ responses, themes, onOpenResponse }: VoicesTabProps) {
  return (
    <div
      role="tabpanel"
      id="survey-panel-voices"
      aria-labelledby="survey-tab-voices"
      className="grid gap-7"
      style={{ gridTemplateColumns: "1fr 320px" }}
    >
      <div className="flex flex-col gap-3">
        {responses.length === 0 ? (
          <EmptyResponses />
        ) : (
          responses.map((response) => (
            <ResponseCard key={response.id} response={response} onOpen={onOpenResponse} />
          ))
        )}
      </div>
      <ThemesPanel themes={themes} />
    </div>
  );
}
