"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getSurvey, getResponses, getThemes } from "@/lib/data";
import { useSurveys } from "@/hooks/useSurveys";
import type { Survey, Response, Theme } from "@/lib/types";

export function useSurvey(id: string) {
  const { getToken, isLoaded } = useAuth();
  const { surveys, loading: surveysLoading, updateSurvey } = useSurveys();
  const [survey, setSurvey] = useState<Survey | undefined>();
  const [responses, setResponses] = useState<Response[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;
    const surveyFromContext = surveys.find((s) => s.id === id);

    Promise.resolve()
      .then(() => {
        if (!cancelled) setLoading(true);
        return getToken();
      })
      .then((token) =>
        Promise.all([
          surveyFromContext && reloadKey === 0 ? Promise.resolve(surveyFromContext) : getSurvey(id, token),
          getResponses(id, token),
          getThemes(id, token),
        ])
      )
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
  }, [getToken, id, isLoaded, reloadKey, surveys]);

  function applySurvey(next: Survey) {
    setSurvey(next);
    updateSurvey(next.id, next);
  }

  return {
    survey,
    responses,
    themes,
    loading: loading || surveysLoading,
    error,
    reload: () => setReloadKey((key) => key + 1),
    applySurvey,
  };
}
