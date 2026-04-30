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
import { VoicesTab } from "@/components/surveys/detail/VoicesTab";
import { retryResponseProcessing } from "@/lib/data";
import { logger } from "@/lib/observability/logger";
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
  const [copyError, setCopyError] = useState<string | null>(null);

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

  const surveyId = survey.id;
  const shareUrl = survey.shareUrl;

  async function copyLink() {
    setCopyError(null);
    setShowToast(false);
    if (!navigator.clipboard?.writeText) {
      const error = new Error("Clipboard API is not available.");
      logger.error("survey_link_copy_failed", { error, surveyId });
      setCopyError("Could not copy link. Select and copy it manually.");
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowToast(true);
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Clipboard write failed.");
      logger.error("survey_link_copy_failed", { error: err, surveyId });
      setCopyError("Could not copy link. Select and copy it manually.");
    }
  }

  async function retryResponse(response: Response) {
    const token = await getToken();
    await retryResponseProcessing(response.surveyId, response.id, token);
    setActiveResponse(null);
    reload();
  }

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
        {copyError && (
          <div
            role="alert"
            className="mb-4 rounded-lg border px-4 py-3 text-sm"
            style={{
              borderColor: "var(--color-danger-zone-border)",
              background: "var(--color-danger-zone-bg)",
              color: "var(--color-danger-zone)",
            }}
          >
            {copyError}
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-4 mb-4">
          <StatusChip status={survey.status} />
          <span className="text-sm" style={{ color: "var(--color-fg3)" }}>
            {survey.responseCount} voices · {survey.completionRate} completion · avg {survey.avgDuration}
          </span>
        </div>

        {/* Tab bar */}
        <div
          role="tablist"
          aria-label="Survey detail sections"
          className="flex"
          style={{ borderBottom: "1px solid var(--color-border-soft)" }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              id={`survey-tab-${tab}`}
              aria-controls={`survey-panel-${tab}`}
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className="mr-6 rounded-sm pb-3 text-sm transition-colors focus-visible:shadow-[0_0_0_3px_rgba(232,176,75,0.35)]"
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
          <VoicesTab responses={responses} themes={themes} onOpenResponse={setActiveResponse} />
        )}

        {activeTab === "themes" && (
          <div role="tabpanel" id="survey-panel-themes" aria-labelledby="survey-tab-themes">
            <ThemesTab themes={themes} />
          </div>
        )}
        {activeTab === "questions" && (
          <div role="tabpanel" id="survey-panel-questions" aria-labelledby="survey-tab-questions">
            <QuestionsTab surveyId={survey.id} questions={survey.questions} onSaved={applySurvey} />
          </div>
        )}
        {activeTab === "settings" && (
          <div role="tabpanel" id="survey-panel-settings" aria-labelledby="survey-tab-settings">
            <SurveySettingsTab survey={survey} onSaved={applySurvey} />
          </div>
        )}
      </div>

      {/* Response drawer */}
      {activeResponse && (
        <ResponseDrawer
          key={activeResponse.id}
          response={activeResponse}
          onClose={() => setActiveResponse(null)}
          onRetry={activeResponse.processingError ? () => retryResponse(activeResponse) : undefined}
          getAuthToken={getToken}
        />
      )}

      {/* Toast */}
      {showToast && (
        <Toast text="link copied to clipboard" onDismiss={() => setShowToast(false)} />
      )}

      {/* Share modal */}
      {showShare && (
        <ShareModal url={shareUrl} onClose={() => setShowShare(false)} />
      )}
    </>
  );
}
