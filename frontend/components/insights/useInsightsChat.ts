"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  apiErrorDetailMessage,
  askSurveyInsights,
  isApiError,
} from "@/lib/data";
import { logger } from "@/lib/observability/logger";
import type { InsightMessage, Survey } from "@/lib/types";

const ERROR_MSG = "Sorry, we are facing some issues. Please try again later.";

type GetToken = () => Promise<string | null>;

function userFacingInsightsError(status: number): string {
  if (status === 401) return "Session expired — sign in again.";
  if (status === 403) return "You do not have access to insights for this survey.";
  if (status === 429) return "Too many requests — try again in a moment.";
  return ERROR_MSG;
}

const newMsg = (
  role: InsightMessage["role"],
  text: string,
  route?: InsightMessage["route"],
): InsightMessage => {
  const message: InsightMessage = {
    id: crypto.randomUUID(),
    role,
    text,
  };
  if (route) message.route = route;
  return message;
};

export function useInsightsChat(surveys: Survey[], getToken: GetToken) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<InsightMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const hydrated = useRef(false);
  const requestSeq = useRef(0);
  const activeRequest = useRef<{
    id: number;
    surveyId: string;
    controller: AbortController;
  } | null>(null);

  const selected = useMemo(
    () => surveys.find((survey) => survey.id === selectedId),
    [selectedId, surveys],
  );

  const isCurrentRequest = useCallback((requestId: number, surveyId: string) => (
    activeRequest.current?.id === requestId &&
    activeRequest.current.surveyId === surveyId
  ), []);

  const cancelActiveRequest = useCallback(() => {
    requestSeq.current += 1;
    activeRequest.current?.controller.abort();
    activeRequest.current = null;
  }, []);

  const handleSelect = useCallback((id: string) => {
    const survey = surveys.find((candidate) => candidate.id === id);
    if (!survey) return;

    cancelActiveRequest();
    setSelectedId(id);
    setMessages([
      newMsg(
        "assistant",
        `i've been listening to ${survey.responseCount} voices from "${survey.title}". what would you like to understand?`,
      ),
    ]);
    setInput("");
    setSending(false);
  }, [cancelActiveRequest, surveys]);

  useEffect(() => {
    if (hydrated.current || !surveys.length) return;
    hydrated.current = true;
    handleSelect(surveys[0].id);
  }, [handleSelect, surveys]);

  useEffect(() => {
    return () => {
      requestSeq.current += 1;
      activeRequest.current?.controller.abort();
      activeRequest.current = null;
    };
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending || !selectedId) return;

    const surveyId = selectedId;
    const controller = new AbortController();
    cancelActiveRequest();
    const requestId = requestSeq.current;
    activeRequest.current = { id: requestId, surveyId, controller };

    setMessages((prev) => [...prev, newMsg("user", text)]);
    setInput("");
    setSending(true);
    try {
      const token = await getToken();
      if (!isCurrentRequest(requestId, surveyId)) return;
      const result = await askSurveyInsights(surveyId, text, token, {
        signal: controller.signal,
      });
      if (!isCurrentRequest(requestId, surveyId)) return;
      setMessages((prev) => [
        ...prev,
        newMsg("assistant", result.answer, result.route),
      ]);
    } catch (e) {
      if (!isCurrentRequest(requestId, surveyId) || controller.signal.aborted) {
        return;
      }

      if (isApiError(e)) {
        logger.error("insights_chat_failed", {
          error: e,
          status: e.status,
          surveyId,
          detail: e.detail,
          detailMessage: apiErrorDetailMessage(e.detail),
        });
        setMessages((prev) => [
          ...prev,
          newMsg("assistant", userFacingInsightsError(e.status)),
        ]);
      } else {
        logger.error("insights_chat_failed", {
          error: e instanceof Error ? e : new Error(String(e)),
          status: undefined,
          surveyId,
        });
        setMessages((prev) => [...prev, newMsg("assistant", ERROR_MSG)]);
      }
    } finally {
      if (isCurrentRequest(requestId, surveyId)) {
        activeRequest.current = null;
        setSending(false);
      }
    }
  }, [cancelActiveRequest, getToken, input, isCurrentRequest, selectedId, sending]);

  return {
    selected,
    selectedId,
    messages,
    input,
    sending,
    setInput,
    handleSelect,
    handleSend,
  };
}
