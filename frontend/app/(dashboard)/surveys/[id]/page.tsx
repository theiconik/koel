"use client";
import { use, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import TopBar from "@/components/layout/TopBar";
import Crumbs from "@/components/layout/Crumbs";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import StatusChip from "@/components/ui/StatusChip";
import Toast from "@/components/ui/Toast";
import ShareModal from "@/components/ui/ShareModal";
import ResponseDrawer from "@/components/ui/ResponseDrawer";
import ThemesTab from "@/components/surveys/ThemesTab";
import QuestionsTab from "@/components/surveys/QuestionsTab";
import SurveySettingsTab from "@/components/surveys/SurveySettingsTab";
import { retryResponseProcessing } from "@/lib/data";
import { useSurvey } from "@/hooks/useSurvey";
import type { Response } from "@/lib/types";

const TABS = ["voices", "themes", "questions", "settings"] as const;
type Tab = (typeof TABS)[number];

export default function SurveyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getToken } = useAuth();
  const { survey, responses, themes, loading, error, reload, applySurvey } = useSurvey(id);
  const [activeTab, setActiveTab] = useState<Tab>("voices");
  const [activeResponse, setActiveResponse] = useState<Response | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [showShare, setShowShare] = useState(false);

  if (loading) {
    return (
      <LoadingAnimation label="Loading survey" className="flex-1" />
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ color: "var(--color-fg3)" }}>
        <div>{error.message}</div>
        <Button variant="outline" onClick={reload}>
          Try again
        </Button>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: "var(--color-fg3)" }}>
        survey not found.
      </div>
    );
  }

  function copyLink() {
    navigator.clipboard?.writeText(survey!.shareUrl);
    setShowToast(true);
  }

  async function retryResponse(response: Response) {
    const token = await getToken();
    await retryResponseProcessing(response.surveyId, response.id, token);
    setActiveResponse(null);
    reload();
  }

  const maxTheme = Math.max(...themes.map((t) => t.count), 1);

  return (
    <>
      <TopBar
        title={survey.title}
        crumbs={<Crumbs items={[{ href: "/home", label: "HOME" }, "SURVEY"]} />}
        cta={
          <>
            <Button variant="outline" onClick={copyLink}>
              <Icon name="copy" size={14} /> Copy link
            </Button>
            <Button variant="midnight" onClick={() => setShowShare(true)}>
              Share
            </Button>
          </>
        }
      />

      <div className="px-9 pt-6 pb-3">
        {/* Meta row */}
        <div className="flex items-center gap-4 mb-4">
          <StatusChip status={survey.status} />
          <span className="text-sm" style={{ color: "var(--color-fg3)" }}>
            {survey.responseCount} voices · {survey.completionRate} completion · avg {survey.avgDuration}
          </span>
        </div>

        {/* Tab bar */}
        <div className="flex" style={{ borderBottom: "1px solid var(--color-border-soft)" }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="mr-6 pb-3 text-sm transition-colors"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: activeTab === tab ? 600 : 500,
                color: activeTab === tab ? "var(--color-midnight)" : "var(--color-fg3)",
                borderBottom: `2px solid ${activeTab === tab ? "var(--color-mango)" : "transparent"}`,
                background: "none",
                cursor: "pointer",
                marginBottom: -1,
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="px-9 pb-9 pt-5">
        {activeTab === "voices" && (
          <div className="grid gap-7" style={{ gridTemplateColumns: "1fr 320px" }}>
            {/* Response list */}
            <div className="flex flex-col gap-3">
              {responses.length === 0 ? (
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
              ) : (
                responses.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setActiveResponse(r)}
                    className="rounded-2xl px-[22px] py-5 border cursor-pointer transition-all"
                    style={{
                      background: "var(--color-bg-raised)",
                      borderColor: "var(--color-border)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,26,46,0.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                  >
                    <div className="flex justify-between text-xs" style={{ color: "var(--color-fg3)" }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full" style={{ background: "var(--color-stone-300)" }} />
                        <span className="font-semibold text-[13px]" style={{ color: "var(--color-midnight)" }}>
                          {r.respondentName}
                        </span>
                        {r.respondentRole !== "—" && (
                          <>
                            <span>·</span>
                            <span>{r.respondentRole}</span>
                          </>
                        )}
                      </div>
                      <div>{r.duration}</div>
                    </div>

                    <div
                      className="text-xl leading-snug mt-3 tracking-[-0.005em]"
                      style={{ fontFamily: "var(--font-display)", color: "var(--color-midnight)" }}
                    >
                      {r.processingStatus === "done"
                        ? `"${r.quote}"`
                        : r.processingStatus === "failed"
                          ? "processing failed - transcript could not be generated."
                          : "processing response - transcript and themes will appear shortly."}
                    </div>

                    <div className="flex gap-1.5 mt-3.5 flex-wrap">
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
                ))
              )}
            </div>

            {/* Themes side panel */}
            <div
              className="rounded-2xl p-[22px] self-start border"
              style={{
                background: "var(--color-bg-raised)",
                borderColor: "var(--color-border)",
                boxShadow: "0 2px 8px rgba(26,26,46,0.04)",
              }}
            >
              <div className="text-[11px] font-semibold tracking-[0.1em] uppercase" style={{ color: "var(--color-fg3)" }}>
                AUTO-THEMES
              </div>
              <div className="font-semibold text-base mt-1.5" style={{ color: "var(--color-midnight)", fontFamily: "var(--font-body)" }}>
                what people keep coming back to
              </div>
              <div className="flex flex-col gap-3 mt-4">
                {themes.length === 0 ? (
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-fg3)" }}>
                    themes will appear after the first response lands.
                  </p>
                ) : (
                  themes.map((t) => (
                    <div key={t.name}>
                      <div className="flex justify-between text-sm mb-1" style={{ color: "var(--color-midnight)" }}>
                        <span className="font-medium">{t.name}</span>
                        <span style={{ color: "var(--color-fg3)", fontFamily: "var(--font-mono)" }}>{t.count}</span>
                      </div>
                      <div className="h-1.5 rounded-sm overflow-hidden" style={{ background: "var(--color-stone-100)" }}>
                        <div
                          className="h-full rounded-sm"
                          style={{ width: `${(t.count / maxTheme) * 100}%`, background: t.color }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "themes" && <ThemesTab themes={themes} />}
        {activeTab === "questions" && (
          <QuestionsTab surveyId={survey.id} questions={survey.questions} onSaved={applySurvey} />
        )}
        {activeTab === "settings" && <SurveySettingsTab survey={survey} onSaved={applySurvey} />}
      </div>

      {/* Response drawer */}
      {activeResponse && (
        <ResponseDrawer
          key={activeResponse.id}
          response={activeResponse}
          onClose={() => setActiveResponse(null)}
          onRetry={activeResponse.processingError ? () => retryResponse(activeResponse) : undefined}
        />
      )}

      {/* Toast */}
      {showToast && (
        <Toast text="link copied to clipboard" onDismiss={() => setShowToast(false)} />
      )}

      {/* Share modal */}
      {showShare && (
        <ShareModal url={survey.shareUrl} onClose={() => setShowShare(false)} />
      )}
    </>
  );
}
