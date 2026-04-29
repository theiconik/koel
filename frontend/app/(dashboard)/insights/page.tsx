"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { askSurveyInsights } from "@/lib/data";
import { useSurveys } from "@/hooks/useSurveys";
import type { InsightMessage, Survey } from "@/lib/types";

const ERROR_MSG = "Sorry, we are facing some issues. Please try again later.";

const newMsg = (role: InsightMessage["role"], text: string): InsightMessage => ({
  id: crypto.randomUUID(),
  role,
  text,
});

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
        className="text-[11px] font-semibold tracking-[0.1em] uppercase px-4 pt-5 pb-3"
        style={{ color: "var(--color-fg3)" }}
      >
        ASK ABOUT A SURVEY
      </div>
      <div className="flex flex-col gap-1 px-3 pb-4">
        {surveys.map((s) => {
          const active = s.id === selectedId;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className="text-left px-3.5 py-3 rounded-[10px] border-none transition-colors"
              style={{
                background: active ? "var(--color-midnight)" : "transparent",
                color: active ? "var(--color-fg-inverse)" : "var(--color-midnight)",
                fontFamily: "var(--font-body)",
                cursor: "pointer",
              }}
            >
              <div className="text-[13px] font-semibold leading-snug">{s.title}</div>
              <div
                className="text-[11px] mt-1"
                style={{ color: active ? "rgba(250,247,242,0.6)" : "var(--color-fg3)" }}
              >
                {s.responseCount} voices · {s.status}
              </div>
            </button>
          );
        })}
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
  onInputChange: (val: string) => void;
  onSend: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ background: "var(--color-cream)" }}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-12 py-7">
        <div className="max-w-[720px] mx-auto flex flex-col gap-5">
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <div
                  className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={{
                    background: "var(--color-midnight)",
                    color: "var(--color-fg-inverse)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex gap-3">
                <div
                  className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center mt-1 overflow-hidden"
                  style={{ background: "var(--color-stone-200)" }}
                >
                  <Image src="/koel-logo.svg" alt="" width={18} height={18} />
                </div>
                <div
                  className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed border"
                  style={{
                    background: "var(--color-bg-raised)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-midnight)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {m.text}
                </div>
              </div>
            )
          )}
          {sending && (
            <div className="flex gap-3">
              <div
                className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-semibold mt-1"
                style={{ background: "var(--color-stone-200)", color: "var(--color-midnight)" }}
              >
                k
              </div>
              <div
                className="px-4 py-3 rounded-2xl text-sm border"
                style={{
                  background: "var(--color-bg-raised)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-fg3)",
                }}
              >
                …
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className="border-t px-12 py-4"
        style={{ borderColor: "var(--color-border-soft)", background: "var(--color-cream)" }}
      >
        <div
          className="max-w-[720px] mx-auto flex gap-2.5 items-center rounded-[14px] px-4 py-1.5 border focus-within:[box-shadow:none]"
          style={{
            background: "var(--color-bg-raised)",
            borderColor: "var(--color-border-strong)",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder={selected ? `ask about "${selected.title}"…` : "select a survey…"}
            disabled={!selected || sending}
            rows={1}
            className="flex-1 border-none outline-none resize-none text-[15px] leading-[1.4] py-0 my-0 block"
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
            onClick={onSend}
            disabled={!selected || !input.trim() || sending}
            className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 transition-colors"
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

export default function InsightsPage() {
  const { surveys } = useSurveys();
  const { getToken } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<InsightMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const hydrated = useRef(false);

  const selected = surveys.find((s) => s.id === selectedId);

  function handleSelect(id: string) {
    const s = surveys.find((sv) => sv.id === id);
    if (!s) return;
    setSelectedId(id);
    setMessages([
      newMsg(
        "assistant",
        `i've been listening to ${s.responseCount} voices from "${s.title}". what would you like to understand?`,
      ),
    ]);
    setInput("");
  }

  // Hydrate selection once when surveys first load. Not derived state —
  // it's a one-shot initial-pick driven by async data arriving.
  useEffect(() => {
    if (hydrated.current || !surveys.length) return;
    hydrated.current = true;
    handleSelect(surveys[0].id);
  }, [surveys]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSend() {
    const text = input.trim();
    if (!text || sending || !selectedId) return;
    setMessages((prev) => [...prev, newMsg("user", text)]);
    setInput("");
    setSending(true);
    try {
      const token = await getToken();
      const result = await askSurveyInsights(selectedId, text, token);
      setMessages((prev) => [...prev, newMsg("assistant", result.answer)]);
    } catch {
      setMessages((prev) => [...prev, newMsg("assistant", ERROR_MSG)]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <TopBar
        title="insights"
        crumbs="HOME · INSIGHTS"
        cta={
          <Button variant="outline" disabled>
            <Icon name="copy" size={14} /> Export thread
          </Button>
        }
      />
      <div
        className="flex flex-1 min-h-0 overflow-hidden"
        style={{ height: "calc(100vh - 89px)" }}
      >
        <SurveyRail surveys={surveys} selectedId={selectedId} onSelect={handleSelect} />
        <ChatColumn
          messages={messages}
          sending={sending}
          selected={selected}
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
        />
      </div>
    </>
  );
}
