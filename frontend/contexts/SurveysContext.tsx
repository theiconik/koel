"use client";
import { createContext, useCallback, useContext } from "react";
import { getSurveys } from "@/lib/data";
import { useAuthResource } from "@/hooks/useAuthResource";
import type { Survey } from "@/lib/types";

interface SurveysValue {
  surveys: Survey[];
  loading: boolean;
  error: Error | null;
  reload: () => void;
  /** Call only with a survey returned from the API — not optimistic drafts. */
  addSurvey: (survey: Survey) => void;
  /** Merge patches from confirmed API responses (`applySurvey`), not speculative UI state. */
  updateSurvey: (id: string, patch: Partial<Survey>) => void;
}

const SurveysContext = createContext<SurveysValue | null>(null);

export function SurveysProvider({ children }: { children: React.ReactNode }) {
  const fetchList = useCallback(
    (token: string | null | undefined, signal: AbortSignal) =>
      getSurveys(token, { signal }),
    [],
  );

  const { data, setData, loading, error, reload } = useAuthResource<Survey[]>(
    fetchList,
    [],
  );

  const surveys = data ?? [];

  const addSurvey = (survey: Survey) => {
    setData((prev) => [survey, ...(prev ?? [])]);
  };

  const updateSurvey = (id: string, patch: Partial<Survey>) => {
    setData((prev) =>
      prev?.map((s) => (s.id === id ? { ...s, ...patch } : s)) ?? [],
    );
  };

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
