"use client";
import { useMemo, useState } from "react";
import type { Response } from "@/lib/types";
import { logger } from "@/lib/observability/logger";
import { AudioPlayer } from "./response-drawer/AudioPlayer";
import { DrawerShell } from "./response-drawer/DrawerShell";
import { ProcessingRetryBanner } from "./response-drawer/ProcessingRetryBanner";
import { ResponseMetaCards } from "./response-drawer/ResponseMetaCards";
import { ResponseSummaryCard } from "./response-drawer/ResponseSummaryCard";
import { ResponseTags } from "./response-drawer/ResponseTags";
import { TranscriptList } from "./response-drawer/TranscriptList";

interface ResponseDrawerProps {
  response: Response;
  onClose: () => void;
  onRetry?: () => Promise<void>;
  getAuthToken?: () => Promise<string | null>;
}

function responseDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const day = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).toLowerCase();
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).toLowerCase().replace(" ", "");

  return `${day} · ${time}`;
}

function speakerLabel(response: Response) {
  if (response.isAnonymous) return "THEM";
  return response.respondentName.split(" ")[0].replace(/[^a-z]/gi, "").toUpperCase() || "THEM";
}

export default function ResponseDrawer({ response, onClose, onRetry, getAuthToken }: ResponseDrawerProps) {
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const participant = useMemo(() => speakerLabel(response), [response]);
  const metaDate = responseDate(response.createdAt);
  const initial = response.respondentName.trim().charAt(0).toLowerCase() || "?";

  async function handleRetry() {
    if (!onRetry) return;

    setRetrying(true);
    setRetryError(null);
    try {
      await onRetry();
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Response retry failed.");
      logger.error("response_retry_failed", {
        error: err,
        responseId: response.id,
        surveyId: response.surveyId,
      });
      setRetryError("Retry failed. Please try again.");
    } finally {
      setRetrying(false);
    }
  }

  return (
    <DrawerShell onClose={onClose}>
      <section className="flex items-center gap-5">
        <div
          className="flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-full text-[28px]"
          style={{ background: "var(--color-stone-300)", color: "var(--color-midnight)" }}
        >
          {initial}
        </div>
        <div>
          <h2
            className="text-[34px] leading-none tracking-[-0.01em]"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-midnight)" }}
          >
            {response.respondentName}
          </h2>
          <div className="mt-2 text-[17px]" style={{ color: "var(--color-fg3)" }}>
            {response.respondentRole !== "—" ? `${response.respondentRole} · ` : ""}
            {metaDate}
          </div>
        </div>
      </section>

      <ResponseMetaCards response={response} />
      <ProcessingRetryBanner
        response={response}
        retrying={retrying}
        retryError={retryError}
        onRetry={onRetry ? handleRetry : undefined}
      />
      <ResponseTags tags={response.tags} />
      <AudioPlayer
        key={`${response.id}:${response.audioUrl ?? ""}`}
        audioUrl={response.audioUrl}
        duration={response.duration}
        durationSeconds={response.durationSeconds}
        getAuthToken={getAuthToken}
      />
      <TranscriptList participant={participant} transcript={response.transcript} />
      <ResponseSummaryCard summary={response.koelSummary} />
    </DrawerShell>
  );
}
