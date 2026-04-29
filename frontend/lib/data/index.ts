import type {
  CreateSurveyInput,
  DashboardStats,
  InsightChatResponse,
  Response,
  ResponseSubmitInput,
  Survey,
  SurveySettings,
  Theme,
  VoiceSessionStart,
} from "@/lib/types";
import { mockSurveys } from "./mock/surveys";
import { mockResponses, mockThemes } from "./mock/responses";
import { mockStats } from "./mock/stats";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detail?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT";
  token?: string | null;
  body?: unknown;
  cache?: RequestCache;
};

async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers();
  headers.set("Accept", "application/json");
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);

  const res = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: options.cache ?? "no-store",
  });

  const text = await res.text();
  const payload = text
    ? (() => {
        try {
          return JSON.parse(text);
        } catch {
          return { detail: text };
        }
      })()
    : null;
  if (!res.ok) {
    const detail = payload?.detail ?? payload;
    throw new ApiError(
      typeof detail === "string" ? detail : `API request failed with ${res.status}`,
      res.status,
      detail,
    );
  }
  return payload as T;
}

export function isMockMode() {
  return useMock;
}

export async function getSurveys(token?: string | null): Promise<Survey[]> {
  if (useMock) return mockSurveys;
  return apiFetch<Survey[]>("/surveys", { token });
}

export async function getSurvey(id: string, token?: string | null): Promise<Survey | undefined> {
  if (useMock) return mockSurveys.find((s) => s.id === id);
  return apiFetch<Survey>(`/surveys/${id}`, { token });
}

export async function getSurveyBySlug(slug: string): Promise<Survey | undefined> {
  if (useMock) return mockSurveys.find((s) => s.shareUrl.endsWith(`/s/${slug}`));
  return apiFetch<Survey>(`/surveys/share/${encodeURIComponent(slug)}`);
}

export async function createSurvey(input: CreateSurveyInput, token?: string | null): Promise<Survey> {
  if (useMock) {
    const id = Date.now().toString();
    return {
      id,
      title: input.title,
      description: input.description ?? "",
      status: input.status ?? "live",
      responseCount: 0,
      avgDuration: "—",
      completionRate: "—",
      questions: input.questions.map((q, i) => ({ id: `q${i + 1}`, text: q.text, order: q.order })),
      settings: input.settings ?? mockSurveys[0].settings,
      createdAt: new Date().toISOString(),
      shareUrl: `https://koel.ai/s/${id}-mock`,
    };
  }
  return apiFetch<Survey>("/surveys", { method: "POST", token, body: input });
}

export async function updateSurveySettings(
  surveyId: string,
  settings: SurveySettings,
  status: Survey["status"],
  token?: string | null,
): Promise<Survey> {
  if (useMock) {
    const current = mockSurveys.find((s) => s.id === surveyId);
    if (!current) throw new ApiError("Survey not found", 404);
    return { ...current, status, settings };
  }
  return apiFetch<Survey>(`/surveys/${surveyId}`, {
    method: "PATCH",
    token,
    body: { status, settings },
  });
}

export async function updateSurveyQuestions(
  surveyId: string,
  questions: Survey["questions"],
  token?: string | null,
): Promise<Survey> {
  if (useMock) {
    const current = mockSurveys.find((s) => s.id === surveyId);
    if (!current) throw new ApiError("Survey not found", 404);
    return { ...current, questions };
  }
  return apiFetch<Survey>(`/surveys/${surveyId}/questions`, {
    method: "PUT",
    token,
    body: {
      questions: questions.map((q, i) => ({ id: q.id, text: q.text, order: i + 1 })),
    },
  });
}

export async function getResponses(surveyId: string, token?: string | null): Promise<Response[]> {
  if (useMock) return mockResponses.filter((r) => r.surveyId === surveyId);
  return apiFetch<Response[]>(`/surveys/${surveyId}/responses`, { token });
}

export async function retryResponseProcessing(
  surveyId: string,
  responseId: string,
  token?: string | null,
): Promise<{ id: string; status: string }> {
  if (useMock) return { id: responseId, status: "pending" };
  return apiFetch<{ id: string; status: string }>(
    `/surveys/${surveyId}/responses/${responseId}/retry`,
    { method: "POST", token },
  );
}

export async function getThemes(surveyId: string, token?: string | null): Promise<Theme[]> {
  if (useMock) return mockThemes;
  return apiFetch<Theme[]>(`/surveys/${surveyId}/themes`, { token });
}

export async function submitResponse(
  slug: string,
  input: ResponseSubmitInput,
): Promise<{ id: string; status: string }> {
  if (useMock) return { id: `mock-response-${Date.now()}`, status: "pending" };
  return apiFetch<{ id: string; status: string }>(
    `/surveys/share/${encodeURIComponent(slug)}/responses`,
    { method: "POST", body: input },
  );
}

export async function startVoiceSession(slug: string): Promise<VoiceSessionStart> {
  if (useMock) return { conversationId: null, provider: "mock", status: "ready" };
  return apiFetch<VoiceSessionStart>(`/surveys/share/${encodeURIComponent(slug)}/voice-session`, { method: "POST" });
}

export async function askSurveyInsights(
  surveyId: string,
  message: string,
  token?: string | null,
): Promise<InsightChatResponse> {
  if (useMock) {
    const responses = mockResponses.filter((r) => r.surveyId === surveyId);
    if (responses.length === 0) {
      return { answer: "No responses for this survey yet.", route: "rag" };
    }
    const positive = responses.filter((r) => r.sentiment === "delighted").length;
    if (/how many|count|percentage|percent|positive|positively/i.test(message)) {
      return {
        answer: `${positive} of ${responses.length} responses were positive in the demo data.`,
        route: "analytics",
      };
    }
    return {
      answer: responses[0].koelSummary || "The demo responses point to a few recurring themes, but the real insights chat is available in API mode.",
      route: "rag",
    };
  }
  return apiFetch<InsightChatResponse>(`/surveys/${surveyId}/insights/chat`, {
    method: "POST",
    token,
    body: { message },
  });
}

export async function getStats(token?: string | null): Promise<DashboardStats> {
  if (useMock) return mockStats;
  return apiFetch<DashboardStats>("/stats", { token });
}
