"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
import type { InsightMessage, Survey } from "@/lib/types";

const SHOW_INSIGHTS_ROUTE = process.env.NODE_ENV !== "production";

interface InsightsChatLayoutProps {
  surveys: Survey[];
  selectedId: string | null;
  selected: Survey | undefined;
  messages: InsightMessage[];
  input: string;
  sending: boolean;
  onSelect: (id: string) => void;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

function SurveyRail({
  surveys,
  selectedId,
  onSelect,
}: {
  surveys: Survey[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      className="w-[280px] shrink-0 flex flex-col border-r overflow-y-auto"
      style={{ borderColor: "var(--color-border-soft)", background: "var(--color-cream)" }}
    >
      <div
        className="px-4 pb-3 pt-5 text-[11px] font-semibold uppercase tracking-[0.1em]"
        style={{ color: "var(--color-fg3)" }}
      >
        ASK ABOUT A SURVEY
      </div>
      <div className="flex flex-col gap-1 px-3 pb-4">
        {surveys.map((survey) => {
          const active = survey.id === selectedId;
          return (
            <button
              key={survey.id}
              type="button"
              onClick={() => onSelect(survey.id)}
              className="rounded-[10px] border-none px-3.5 py-3 text-left transition-colors"
              style={{
                background: active ? "var(--color-midnight)" : "transparent",
                color: active ? "var(--color-fg-inverse)" : "var(--color-midnight)",
                fontFamily: "var(--font-body)",
                cursor: "pointer",
              }}
            >
              <div className="text-[13px] font-semibold leading-snug">{survey.title}</div>
              <div
                className="mt-1 text-[11px]"
                style={{ color: active ? "rgba(250,247,242,0.6)" : "var(--color-fg3)" }}
              >
                {survey.responseCount} voices · {survey.status}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AssistantMessage({ message }: { message: InsightMessage }) {
  return (
    <div className="flex gap-3">
      <div
        className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full"
        style={{ background: "var(--color-stone-200)" }}
      >
        <Image src="/koel-logo.svg" alt="" width={18} height={18} />
      </div>
      <div
        className="max-w-[80%] rounded-2xl border px-4 py-3 text-sm leading-relaxed"
        style={{
          background: "var(--color-bg-raised)",
          borderColor: "var(--color-border)",
          color: "var(--color-midnight)",
          fontFamily: "var(--font-body)",
        }}
      >
        {message.text}
        {SHOW_INSIGHTS_ROUTE && message.route && (
          <div
            className="mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]"
            style={{
              background: "var(--color-stone-100)",
              color: "var(--color-fg3)",
            }}
          >
            {message.route}
          </div>
        )}
      </div>
    </div>
  );
}

function UserMessage({ message }: { message: InsightMessage }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
        style={{
          background: "var(--color-midnight)",
          color: "var(--color-fg-inverse)",
          fontFamily: "var(--font-body)",
        }}
      >
        {message.text}
      </div>
    </div>
  );
}

function SendingIndicator() {
  return (
    <div className="flex gap-3">
      <div
        className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
        style={{ background: "var(--color-stone-200)", color: "var(--color-midnight)" }}
      >
        k
      </div>
      <div
        className="rounded-2xl border px-4 py-3 text-sm"
        style={{
          background: "var(--color-bg-raised)",
          borderColor: "var(--color-border)",
          color: "var(--color-fg3)",
        }}
      >
        …
      </div>
    </div>
  );
}

function ChatColumn({
  messages,
  sending,
  selected,
  input,
  onInputChange,
  onSend,
}: {
  messages: InsightMessage[];
  sending: boolean;
  selected: Survey | undefined;
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex min-h-0 flex-1 flex-col" style={{ background: "var(--color-cream)" }}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-12 py-7">
        <div className="mx-auto flex max-w-[720px] flex-col gap-5">
          {messages.map((message) => (
            message.role === "user"
              ? <UserMessage key={message.id} message={message} />
              : <AssistantMessage key={message.id} message={message} />
          ))}
          {sending && <SendingIndicator />}
        </div>
      </div>

      <div
        className="border-t px-12 py-4"
        style={{ borderColor: "var(--color-border-soft)", background: "var(--color-cream)" }}
      >
        <div
          className="mx-auto flex max-w-[720px] items-center gap-2.5 rounded-[14px] border px-4 py-1.5 focus-within:[box-shadow:none]"
          style={{
            background: "var(--color-bg-raised)",
            borderColor: "var(--color-border-strong)",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <textarea
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            placeholder={selected ? `ask about "${selected.title}"…` : "select a survey…"}
            disabled={!selected || sending}
            rows={1}
            className="my-0 block flex-1 resize-none border-none py-0 text-[15px] leading-[1.4] outline-none"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-midnight)",
              background: "transparent",
              minHeight: 22,
              maxHeight: 120,
              boxShadow: "none",
            }}
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!selected || !input.trim() || sending}
            aria-label="Send insight question"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] transition-colors"
            style={{
              background: selected && input.trim() ? "var(--color-midnight)" : "var(--color-border)",
              color: selected && input.trim() ? "var(--color-fg-inverse)" : "var(--color-fg3)",
              border: "none",
              cursor: selected && input.trim() ? "pointer" : "default",
            }}
          >
            <Icon name="send" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function InsightsChatLayout({
  surveys,
  selectedId,
  selected,
  messages,
  input,
  sending,
  onSelect,
  onInputChange,
  onSend,
}: InsightsChatLayoutProps) {
  return (
    <div
      className="flex min-h-0 flex-1 overflow-hidden"
      style={{ height: "calc(100vh - 89px)" }}
    >
      <SurveyRail surveys={surveys} selectedId={selectedId} onSelect={onSelect} />
      <ChatColumn
        messages={messages}
        sending={sending}
        selected={selected}
        input={input}
        onInputChange={onInputChange}
        onSend={onSend}
      />
    </div>
  );
}
