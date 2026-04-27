"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getSurveys } from "@/lib/data";
import type { Survey } from "@/lib/types";

interface SurveysValue {
  surveys: Survey[];
  loading: boolean;
  error: Error | null;
  reload: () => void;
  addSurvey: (survey: Survey) => void;
  updateSurvey: (id: string, patch: Partial<Survey>) => void;
}

const SurveysContext = createContext<SurveysValue | null>(null);

export function SurveysProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        if (!cancelled) setLoading(true);
        return getToken();
      })
      .then((token) => getSurveys(token))
      .then((data) => {
        if (cancelled) return;
        setSurveys(data);
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
  }, [getToken, isLoaded, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  const addSurvey = (survey: Survey) =>
    setSurveys((prev) => [survey, ...prev]);

  const updateSurvey = (id: string, patch: Partial<Survey>) =>
    setSurveys((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );

  return (
    <SurveysContext.Provider
      value={{ surveys, loading, error, reload, addSurvey, updateSurvey }}
    >
      {children}
    </SurveysContext.Provider>
  );
}

export function useSurveys(): SurveysValue {
  const ctx = useContext(SurveysContext);
  if (!ctx) {
    throw new Error("useSurveys must be used within SurveysProvider");
  }
  return ctx;
}
