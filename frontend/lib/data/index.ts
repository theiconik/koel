import type { Survey, Response, Theme, DashboardStats } from "@/lib/types";
import { mockSurveys } from "./mock/surveys";
import { mockResponses, mockThemes } from "./mock/responses";
import { mockStats } from "./mock/stats";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function getSurveys(): Promise<Survey[]> {
  if (useMock) return mockSurveys;
  return apiFetch<Survey[]>("/surveys");
}

export async function getSurvey(id: string): Promise<Survey | undefined> {
  if (useMock) return mockSurveys.find((s) => s.id === id);
  return apiFetch<Survey>(`/surveys/${id}`);
}

export async function getResponses(surveyId: string): Promise<Response[]> {
  if (useMock) return mockResponses.filter((r) => r.surveyId === surveyId);
  return apiFetch<Response[]>(`/surveys/${surveyId}/responses`);
}

export async function getThemes(surveyId: string): Promise<Theme[]> {
  if (useMock) return mockThemes;
  return apiFetch<Theme[]>(`/surveys/${surveyId}/themes`);
}

export async function getStats(): Promise<DashboardStats> {
  if (useMock) return mockStats;
  return apiFetch<DashboardStats>("/stats");
}
