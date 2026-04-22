"use client";
import { useEffect, useState } from "react";
import { getSurvey, getResponses, getThemes } from "@/lib/data";
import type { Survey, Response, Theme } from "@/lib/types";

export function useSurvey(id: string) {
  const [survey, setSurvey] = useState<Survey | undefined>();
  const [responses, setResponses] = useState<Response[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getSurvey(id), getResponses(id), getThemes(id)])
      .then(([s, r, t]) => {
        if (cancelled) return;
        setSurvey(s);
        setResponses(r);
        setThemes(t);
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
  }, [id]);

  return { survey, responses, themes, loading, error };
}
