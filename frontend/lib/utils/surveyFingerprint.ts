import type { Survey } from "@/lib/types";

/** Stable string for this survey row in the list — avoids re-fetching when unrelated surveys change. */
export function surveyListFingerprint(s: Survey): string {
  return JSON.stringify({
    id: s.id,
    responseCount: s.responseCount,
    status: s.status,
    title: s.title,
    questions: s.questions.map((q) => ({
      id: q.id,
      text: q.text,
      order: q.order,
    })),
    settings: s.settings,
    shareUrl: s.shareUrl,
  });
}
