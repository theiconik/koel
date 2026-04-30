"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import TopBar from "@/components/layout/TopBar";
import Crumbs from "@/components/layout/Crumbs";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { createSurvey } from "@/lib/data";
import { useSurveys } from "@/hooks/useSurveys";

type Draft = { id: string; text: string };
const newDraft = (): Draft => ({ id: crypto.randomUUID(), text: "" });

export default function NewSurveyPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { addSurvey } = useSurveys();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Draft[]>(() => [newDraft(), newDraft()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateQuestion(id: string, val: string) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, text: val } : q)));
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, newDraft()]);
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  async function handlePublish() {
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const token = await getToken();
      const survey = await createSurvey(
        {
          title: title.trim(),
          description: "",
          status: "live",
          questions: questions
            .filter((q) => q.text.trim())
            .map((q, i) => ({ text: q.text.trim(), order: i + 1 })),
        },
        token,
      );
      addSurvey(survey);
      router.push(`/surveys/${survey.id}/published`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create survey.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <TopBar
        title="new survey"
        crumbs={<Crumbs items={[{ href: "/home", label: "HOME" }, "NEW"]} />}
        cta={
          <>
            <Button variant="outline" disabled aria-disabled="true" title="Preview is not available yet">
              Preview
            </Button>
            <Button variant="primary" onClick={handlePublish} disabled={!title.trim() || saving}>
              {saving ? "Publishing..." : "Publish"}
            </Button>
          </>
        }
      />

      <div className="px-9 py-8 grid gap-7" style={{ gridTemplateColumns: "1fr 360px" }}>
        {/* Left: form */}
        <div className="flex flex-col gap-5">
          {/* Title */}
          <div
            className="rounded-2xl p-7 border"
            style={{ background: "var(--color-bg-raised)", borderColor: "var(--color-border)" }}
          >
            {error && (
              <div
                className="mb-4 rounded-[10px] border px-3 py-2 text-sm"
                style={{ borderColor: "var(--color-danger)", color: "var(--color-danger)" }}
              >
                {error}
              </div>
            )}
            <label
              className="text-sm font-medium block mb-1.5"
              style={{ color: "var(--color-midnight)", fontFamily: "var(--font-body)" }}
            >
              Survey title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. onboarding feedback — v3"
              className="w-full px-3.5 py-2.5 text-base rounded-[10px] border outline-none transition-all"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-midnight)",
                borderColor: "var(--color-border-strong)",
                background: "var(--color-bg-raised)",
              }}
            />
          </div>

          {/* Questions */}
          <div
            className="rounded-2xl p-7 border"
            style={{ background: "var(--color-bg-raised)", borderColor: "var(--color-border)" }}
          >
            <div className="flex justify-between items-center mb-4">
              <div
                className="font-semibold text-[17px]"
                style={{ color: "var(--color-midnight)", fontFamily: "var(--font-body)" }}
              >
                questions
              </div>
              <div className="text-sm" style={{ color: "var(--color-fg3)" }}>
                plain english — koel handles follow-ups
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {questions.map((q, i) => (
                <div key={q.id} className="flex gap-3.5 items-start">
                  <div
                    className="text-[22px] leading-snug w-8 shrink-0"
                    style={{ fontFamily: "var(--font-display)", color: "var(--color-mango)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <textarea
                    value={q.text}
                    onChange={(e) => updateQuestion(q.id, e.target.value)}
                    rows={2}
                    placeholder="ask something open-ended…"
                    className="flex-1 px-3.5 py-2.5 text-[15px] rounded-[10px] border outline-none resize-y leading-relaxed transition-all"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-midnight)",
                      borderColor: "var(--color-border-medium)",
                      background: "var(--color-bg-raised)",
                    }}
                  />
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="mt-2 text-xs px-2 py-1 rounded opacity-40 hover:opacity-70 transition-opacity"
                      style={{ color: "var(--color-danger)", background: "none", border: "none", cursor: "pointer" }}
                    >
                      remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addQuestion}
              className="mt-3.5 flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-[10px] border border-dashed transition-opacity hover:opacity-70"
              style={{
                borderColor: "var(--color-border-heavy)",
                color: "var(--color-fg2)",
                background: "transparent",
                fontFamily: "var(--font-body)",
                cursor: "pointer",
              }}
            >
              <Icon name="plus" size={14} />
              add question
            </button>
          </div>
        </div>

        {/* Right: preview card */}
        <div
          className="rounded-2xl p-6 sticky top-5 self-start"
          style={{
            background: "var(--color-midnight)",
            color: "var(--color-fg-inverse)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div
            className="text-[11px] font-semibold tracking-[0.1em] uppercase"
            style={{ color: "var(--color-mango)" }}
          >
            PREVIEW
          </div>
          <div
            className="text-[22px] leading-snug mt-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title || "untitled"}
          </div>
          <div className="text-sm mt-2" style={{ color: "rgba(250,247,242,0.65)" }}>
            {questions.filter((q) => q.text.trim()).length} questions
            {" · ~"}{Math.max(1, Math.round(questions.filter((q) => q.text.trim()).length * 1.8))} min
          </div>
          <div
            className="my-4"
            style={{ borderTop: "1px solid rgba(250,247,242,0.12)" }}
          />
          <div className="text-sm leading-relaxed" style={{ color: "rgba(250,247,242,0.85)" }}>
            respondents get a single link. no account needed. we ask for the microphone — nothing else.
          </div>

        </div>
      </div>
    </>
  );
}
