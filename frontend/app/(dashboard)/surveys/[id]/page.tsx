"use client";
import { use, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import Crumbs from "@/components/layout/Crumbs";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import StatusChip from "@/components/ui/StatusChip";
import { useSurvey } from "@/hooks/useSurvey";

const TABS = ["voices", "themes", "questions", "settings"] as const;
type Tab = (typeof TABS)[number];

export default function SurveyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { survey, responses, themes, loading } = useSurvey(id);
  const [activeTab, setActiveTab] = useState<Tab>("voices");

  if (loading || !survey) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: "var(--color-fg3)" }}>
        loading…
      </div>
    );
  }

  const maxTheme = Math.max(...themes.map((t) => t.count), 1);

  return (
    <>
      <TopBar
        title={survey.title}
        crumbs={<Crumbs items={[{ href: "/home", label: "HOME" }, "SURVEY"]} />}
        cta={
          <>
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(survey.shareUrl)}>
              <Icon name="copy" size={14} /> Copy link
            </Button>
            <Button variant="midnight">Share</Button>
          </>
        }
      />

      <div className="px-9 py-8 grid gap-7" style={{ gridTemplateColumns: "1fr 320px" }}>
        {/* Main column */}
        <div>
          {/* Meta row */}
          <div className="flex items-center gap-4 mb-4">
            <StatusChip status={survey.status} />
            <span className="text-sm" style={{ color: "var(--color-fg3)" }}>
              {survey.responseCount} voices · {survey.completionRate} completion · avg {survey.avgDuration}
            </span>
          </div>

          {/* Tabs */}
          <div
            className="flex mb-4"
            style={{ borderBottom: "1px solid var(--color-border-soft)" }}
          >
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="mr-5 pb-3 text-sm border-b-2 transition-colors"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: activeTab === tab ? 600 : 500,
                  color: activeTab === tab ? "var(--color-midnight)" : "var(--color-fg3)",
                  borderBottomColor: activeTab === tab ? "var(--color-mango)" : "transparent",
                  background: "none",
                  border: "none",
                  borderBottom: `2px solid ${activeTab === tab ? "var(--color-mango)" : "transparent"}`,
                  cursor: "pointer",
                  marginBottom: -1,
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Voices tab */}
          {activeTab === "voices" && (
            <div className="flex flex-col gap-3">
              {responses.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl px-[22px] py-5 border cursor-pointer response-hover"
                  style={{
                    background: "var(--color-bg-raised)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <div className="flex justify-between text-xs" style={{ color: "var(--color-fg3)" }}>
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ background: "var(--color-stone-300)" }}
                      />
                      <span className="font-semibold text-[13px]" style={{ color: "var(--color-midnight)" }}>
                        {r.respondentName}
                      </span>
                      {r.respondentRole !== "—" && (
                        <><span>·</span><span>{r.respondentRole}</span></>
                      )}
                    </div>
                    <div>{r.duration}</div>
                  </div>

                  <div
                    className="text-xl leading-snug mt-3 tracking-[-0.005em]"
                    style={{ fontFamily: "var(--font-display)", color: "var(--color-midnight)" }}
                  >
                    &ldquo;{r.quote}&rdquo;
                  </div>

                  <div className="flex gap-1.5 mt-3.5">
                    {r.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-semibold px-2.5 py-[3px] rounded-full"
                        style={{ color: "var(--color-fg2)", background: "var(--color-stone-100)" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Other tabs — UI only placeholder */}
          {activeTab !== "voices" && (
            <div
              className="text-sm py-8 text-center"
              style={{ color: "var(--color-fg3)" }}
            >
              {activeTab} — coming soon.
            </div>
          )}
        </div>

        {/* Themes panel */}
        <div
          className="rounded-2xl p-[22px] self-start border"
          style={{
            background: "var(--color-bg-raised)",
            borderColor: "var(--color-border)",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <div
            className="text-[11px] font-semibold tracking-[0.1em] uppercase"
            style={{ color: "var(--color-fg3)" }}
          >
            AUTO-THEMES
          </div>
          <div
            className="font-semibold text-base mt-1.5"
            style={{ color: "var(--color-midnight)", fontFamily: "var(--font-body)" }}
          >
            what people keep coming back to
          </div>

          <div className="flex flex-col gap-3 mt-4">
            {themes.map((t) => (
              <div key={t.name}>
                <div className="flex justify-between text-sm mb-1" style={{ color: "var(--color-midnight)" }}>
                  <span className="font-medium">{t.name}</span>
                  <span style={{ color: "var(--color-fg3)", fontFamily: "var(--font-mono)" }}>{t.count}</span>
                </div>
                <div
                  className="h-1.5 rounded-sm overflow-hidden"
                  style={{ background: "var(--color-stone-100)" }}
                >
                  <div
                    className="h-full rounded-sm"
                    style={{ width: `${(t.count / maxTheme) * 100}%`, background: t.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
