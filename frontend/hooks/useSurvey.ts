"use client";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getSurvey, getResponses, getThemes } from "@/lib/data";
import { useSurveys } from "@/hooks/useSurveys";
import { surveyListFingerprint } from "@/lib/utils/surveyFingerprint";
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

  const listSurvey = surveys.find((s) => s.id === id);
  const listFingerprint = useMemo(
    () => (listSurvey ? surveyListFingerprint(listSurvey) : ""),
    [listSurvey],
  );

  useEffect(() => {
    if (!isLoaded) return;
    const ac = new AbortController();
    let cancelled = false;

    const useListFirstSurvey = Boolean(listSurvey && reloadKey === 0);

    (async () => {
      if (!cancelled) setLoading(true);
      try {
        const token = await getToken();
        const s =
          useListFirstSurvey && listSurvey
            ? listSurvey
            : await getSurvey(id, token, { signal: ac.signal });

        const [r, themeRows] = await Promise.all([
          getResponses(id, token, { signal: ac.signal }),
          getThemes(id, token, { signal: ac.signal }),
        ]);

        if (cancelled) return;
        setSurvey(s);
        setResponses(r);
        setThemes(r.length > 0 ? themeRows : []);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof Error && e.name === "AbortError") return;
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- listFingerprint tracks this survey row; listSurvey alone would refetch on unrelated list churn
  }, [getToken, id, isLoaded, reloadKey, listFingerprint]);

  /** Sync local survey + list cache with a Survey object returned by the API. */
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
