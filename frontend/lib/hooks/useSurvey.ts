"use client";
import { useEffect, useState } from "react";
import { getSurvey, getResponses, getThemes } from "@/lib/data";
import type { Survey, Response, Theme } from "@/lib/types";

export function useSurvey(id: string) {
  const [survey, setSurvey] = useState<Survey | undefined>();
  const [responses, setResponses] = useState<Response[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSurvey(id), getResponses(id), getThemes(id)]).then(
      ([s, r, t]) => {
        setSurvey(s);
        setResponses(r);
        setThemes(t);
        setLoading(false);
      }
    );
  }, [id]);

  return { survey, responses, themes, loading };
}
