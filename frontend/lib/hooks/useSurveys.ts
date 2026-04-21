"use client";
import { useEffect, useState } from "react";
import { getSurveys } from "@/lib/data";
import type { Survey } from "@/lib/types";

export function useSurveys() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSurveys().then((data) => {
      setSurveys(data);
      setLoading(false);
    });
  }, []);

  function addSurvey(survey: Survey) {
    setSurveys((prev) => [survey, ...prev]);
  }

  function updateSurvey(id: string, patch: Partial<Survey>) {
    setSurveys((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  }

  return { surveys, loading, addSurvey, updateSurvey };
}
