import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { askSurveyInsights } from "@/lib/data";
import type { InsightChatResponse, Survey } from "@/lib/types";
import { useInsightsChat } from "@/components/insights/useInsightsChat";

vi.mock("@/lib/data", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/data")>();
  return {
    ...actual,
    askSurveyInsights: vi.fn(),
  };
});

const surveys: Survey[] = [
  {
    id: "survey-1",
    title: "First survey",
    description: "",
    status: "live",
    responseCount: 3,
    avgDuration: "2m",
    completionRate: "80%",
    questions: [],
    settings: {
      responseCap: null,
      language: "en",
      followUpDepth: 2,
      collectRespondentName: true,
      allowAnonymousResponses: true,
      emailTranscript: false,
      closeOnResponseCap: false,
    },
    createdAt: "2026-04-01T00:00:00.000Z",
    shareUrl: "https://koel.ai/s/first",
  },
  {
    id: "survey-2",
    title: "Second survey",
    description: "",
    status: "live",
    responseCount: 5,
    avgDuration: "3m",
    completionRate: "90%",
    questions: [],
    settings: {
      responseCap: null,
      language: "en",
      followUpDepth: 2,
      collectRespondentName: true,
      allowAnonymousResponses: true,
      emailTranscript: false,
      closeOnResponseCap: false,
    },
    createdAt: "2026-04-02T00:00:00.000Z",
    shareUrl: "https://koel.ai/s/second",
  },
];

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

function messageTexts(messages: ReturnType<typeof useInsightsChat>["messages"]) {
  return messages.map((message) => message.text);
}

describe("useInsightsChat", () => {
  const askSurveyInsightsMock = vi.mocked(askSurveyInsights);

  beforeEach(() => {
    askSurveyInsightsMock.mockReset();
  });

  it("does not append a slower old answer after the selected survey changes", async () => {
    const oldRequest = deferred<InsightChatResponse>();
    askSurveyInsightsMock.mockReturnValueOnce(oldRequest.promise);
    const getToken = vi.fn().mockResolvedValue("token");

    const { result } = renderHook(() => useInsightsChat(surveys, getToken));

    await waitFor(() => expect(result.current.selectedId).toBe("survey-1"));

    act(() => {
      result.current.setInput("What changed?");
    });

    let oldSend!: Promise<void>;
    act(() => {
      oldSend = result.current.handleSend();
    });

    await waitFor(() => expect(askSurveyInsightsMock).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.handleSelect("survey-2");
    });

    await act(async () => {
      oldRequest.resolve({ answer: "Old answer that must be ignored", route: "rag" });
      await oldSend;
    });

    expect(result.current.selectedId).toBe("survey-2");
    expect(messageTexts(result.current.messages)).not.toContain("Old answer that must be ignored");
    expect(messageTexts(result.current.messages)).toEqual([
      'i\'ve been listening to 5 voices from "Second survey". what would you like to understand?',
    ]);
  });

  it("keeps the newer selected-survey answer when an older request resolves later", async () => {
    const oldRequest = deferred<InsightChatResponse>();
    const newerRequest = deferred<InsightChatResponse>();
    askSurveyInsightsMock
      .mockReturnValueOnce(oldRequest.promise)
      .mockReturnValueOnce(newerRequest.promise);
    const getToken = vi.fn().mockResolvedValue("token");

    const { result } = renderHook(() => useInsightsChat(surveys, getToken));

    await waitFor(() => expect(result.current.selectedId).toBe("survey-1"));

    act(() => {
      result.current.setInput("First question");
    });

    let oldSend!: Promise<void>;
    act(() => {
      oldSend = result.current.handleSend();
    });

    await waitFor(() => expect(askSurveyInsightsMock).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.handleSelect("survey-2");
    });
    act(() => {
      result.current.setInput("Second question");
    });

    let newerSend!: Promise<void>;
    act(() => {
      newerSend = result.current.handleSend();
    });

    await waitFor(() => expect(askSurveyInsightsMock).toHaveBeenCalledTimes(2));

    await act(async () => {
      newerRequest.resolve({ answer: "Newer answer", route: "analytics" });
      await newerSend;
    });

    await waitFor(() => {
      expect(messageTexts(result.current.messages)).toContain("Newer answer");
    });

    await act(async () => {
      oldRequest.resolve({ answer: "Late old answer", route: "rag" });
      await oldSend;
    });

    expect(messageTexts(result.current.messages)).toContain("Newer answer");
    expect(messageTexts(result.current.messages)).not.toContain("Late old answer");
  });
});
