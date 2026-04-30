import type {
  CreateSurveyInput,
  DashboardStats,
  InsightChatResponse,
  Response as SurveyResponseRow,
  ResponseSubmitInput,
  Survey,
  SurveySettings,
  Theme,
  VoiceSessionStart,
} from "@/lib/types";
import { logger } from "@/lib/observability/logger";
import { mockSurveys } from "./mock/surveys";
import { mockResponses, mockThemes } from "./mock/responses";
import { mockStats } from "./mock/stats";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

if (typeof console !== "undefined" && useMock) {
  console.warn(
    "[koel] Mock data mode is ON (NEXT_PUBLIC_USE_MOCK=true). Backend API calls are not used.",
  );
}

export type DataRequestOptions = { signal?: AbortSignal };

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

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isApiErrorDetailRecord(
  detail: unknown,
): detail is Record<string, unknown> {
  return typeof detail === "object" && detail !== null && !Array.isArray(detail);
}

export function apiErrorDetailMessage(detail: unknown): string | undefined {
  if (typeof detail === "string") return detail;
  if (!isApiErrorDetailRecord(detail)) return undefined;

  for (const key of ["detail", "message", "error"]) {
    const value = detail[key];
    if (typeof value === "string") return value;
  }

  return undefined;
}

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT";
  token?: string | null;
  body?: unknown;
  cache?: RequestCache;
  signal?: AbortSignal;
};

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function safePayload(text: string): unknown | null {
  if (!text) return null;
  const payload = safeJson(text);
  return payload === undefined ? { detail: text } : payload;
}

function getPayloadDetail(payload: unknown): unknown {
  return isApiErrorDetailRecord(payload) && "detail" in payload
    ? payload.detail
    : payload;
}

function createMockId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `mock-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isAbortError(error: unknown, signal?: AbortSignal): boolean {
  return Boolean(
    signal?.aborted ||
      (error instanceof DOMException && error.name === "AbortError") ||
      (error instanceof Error && error.name === "AbortError"),
  );
}

async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers();
  headers.set("Accept", "application/json");
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);

  let res: Response;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: options.cache ?? "no-store",
      signal: options.signal,
    });
  } catch (e) {
    if (isAbortError(e, options.signal)) {
      throw e;
    }

    logger.error("api_fetch_network_error", {
      path,
      error: e instanceof Error ? e : new Error(String(e)),
    });
    throw e;
  }

  const requestId =
    res.headers.get("x-request-id") ??
    res.headers.get("X-Request-Id") ??
    undefined;
  const text = await res.text();
  const payload = safePayload(text);
  if (!res.ok) {
    const detail = getPayloadDetail(payload);
    const error = new ApiError(
      apiErrorDetailMessage(detail) ?? `API request failed with ${res.status}`,
      res.status,
      detail,
    );
    logger.error("api_request_failed", {
      path,
      status: res.status,
      requestId,
      detail,
      error,
    });
    throw error;
  }
  return payload as T;
}

export function isMockMode() {
  return useMock;
}

export async function getSurveys(
  token?: string | null,
  opts?: DataRequestOptions,
): Promise<Survey[]> {
  if (useMock) return mockSurveys;
  return apiFetch<Survey[]>("/surveys", { token, signal: opts?.signal });
}

export async function getSurvey(
  id: string,
  token?: string | null,
  opts?: DataRequestOptions,
): Promise<Survey | undefined> {
  if (useMock) return mockSurveys.find((s) => s.id === id);
  return apiFetch<Survey>(`/surveys/${id}`, {
    token,
    signal: opts?.signal,
  });
}

export async function getSurveyBySlug(
  slug: string,
  opts?: DataRequestOptions,
): Promise<Survey | undefined> {
  if (useMock)
    return mockSurveys.find((s) => s.shareUrl.endsWith(`/s/${slug}`));
  return apiFetch<Survey>(
    `/surveys/share/${encodeURIComponent(slug)}`,
    {
      signal: opts?.signal,
    },
  );
}

export async function createSurvey(
  input: CreateSurveyInput,
  token?: string | null,
  opts?: DataRequestOptions,
): Promise<Survey> {
  if (useMock) {
    const id = createMockId();
    return {
      id,
      title: input.title,
      description: input.description ?? "",
      status: input.status ?? "live",
      responseCount: 0,
      avgDuration: "—",
      completionRate: "—",
      questions: input.questions.map((q, i) => ({
        id: `q${i + 1}`,
        text: q.text,
        order: q.order,
      })),
      settings: input.settings ?? mockSurveys[0].settings,
      createdAt: new Date().toISOString(),
      shareUrl: `https://koel.ai/s/${id}-mock`,
    };
  }
  return apiFetch<Survey>("/surveys", {
    method: "POST",
    token,
    body: input,
    signal: opts?.signal,
  });
}

export async function updateSurveySettings(
  surveyId: string,
  settings: SurveySettings,
  status: Survey["status"],
  token?: string | null,
  opts?: DataRequestOptions,
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
    signal: opts?.signal,
  });
}

export async function updateSurveyQuestions(
  surveyId: string,
  questions: Survey["questions"],
  token?: string | null,
  opts?: DataRequestOptions,
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
      questions: questions.map((q, i) => ({
        id: q.id,
        text: q.text,
        order: i + 1,
      })),
    },
    signal: opts?.signal,
  });
}

export async function getResponses(
  surveyId: string,
  token?: string | null,
  opts?: DataRequestOptions,
): Promise<SurveyResponseRow[]> {
  if (useMock)
    return mockResponses.filter((r) => r.surveyId === surveyId);
  return apiFetch<SurveyResponseRow[]>(`/surveys/${surveyId}/responses`, {
    token,
    signal: opts?.signal,
  });
}

export async function retryResponseProcessing(
  surveyId: string,
  responseId: string,
  token?: string | null,
  opts?: DataRequestOptions,
): Promise<{ id: string; status: string }> {
  if (useMock) return { id: responseId, status: "pending" };
  return apiFetch<{ id: string; status: string }>(
    `/surveys/${surveyId}/responses/${responseId}/retry`,
    {
      method: "POST",
      token,
      signal: opts?.signal,
    },
  );
}

export async function getThemes(
  surveyId: string,
  token?: string | null,
  opts?: DataRequestOptions,
): Promise<Theme[]> {
  if (useMock) return mockThemes;
  return apiFetch<Theme[]>(`/surveys/${surveyId}/themes`, {
    token,
    signal: opts?.signal,
  });
}

export async function submitResponse(
  slug: string,
  input: ResponseSubmitInput,
  opts?: DataRequestOptions,
): Promise<{ id: string; status: string }> {
  if (useMock)
    return { id: `mock-response-${Date.now()}`, status: "pending" };
  return apiFetch<{ id: string; status: string }>(
    `/surveys/share/${encodeURIComponent(slug)}/responses`,
    {
      method: "POST",
      body: input,
      signal: opts?.signal,
    },
  );
}

export async function startVoiceSession(
  slug: string,
  opts?: DataRequestOptions,
): Promise<VoiceSessionStart> {
  if (useMock)
    return { conversationId: null, provider: "mock", status: "ready" };
  return apiFetch<VoiceSessionStart>(
    `/surveys/share/${encodeURIComponent(slug)}/voice-session`,
    {
      method: "POST",
      signal: opts?.signal,
    },
  );
}

export async function askSurveyInsights(
  surveyId: string,
  message: string,
  token?: string | null,
  opts?: DataRequestOptions,
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
      answer:
        responses[0].koelSummary ||
        "The demo responses point to a few recurring themes, but the real insights chat is available in API mode.",
      route: "rag",
    };
  }
  return apiFetch<InsightChatResponse>(
    `/surveys/${surveyId}/insights/chat`,
    {
      method: "POST",
      token,
      body: { message },
      signal: opts?.signal,
    },
  );
}

export async function getStats(
  token?: string | null,
  opts?: DataRequestOptions,
): Promise<DashboardStats> {
  if (useMock) return mockStats;
  return apiFetch<DashboardStats>("/stats", { token, signal: opts?.signal });
}
