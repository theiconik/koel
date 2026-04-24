"use client";
import { useEffect, useState } from "react";
import { getSurvey, getResponses, getThemes } from "@/lib/data";
import { useSurveys } from "@/hooks/useSurveys";
import type { Survey, Response, Theme } from "@/lib/types";

export function useSurvey(id: string) {
  const { surveys, loading: surveysLoading } = useSurveys();
  const [survey, setSurvey] = useState<Survey | undefined>();
  const [responses, setResponses] = useState<Response[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    const surveyFromContext = surveys.find((s) => s.id === id);

    Promise.all([
      surveyFromContext ? Promise.resolve(surveyFromContext) : getSurvey(id),
      getResponses(id),
      getThemes(id),
    ])
      .then(([s, r, t]) => {
        if (cancelled) return;
        setSurvey(s);
        setResponses(r);
        setThemes(r.length > 0 ? t : []);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, surveys]);

  return { survey, responses, themes, loading: loading || surveysLoading, error };
}
