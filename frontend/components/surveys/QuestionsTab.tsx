"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { updateSurveyQuestions } from "@/lib/data";
import type { Question, Survey } from "@/lib/types";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

interface QuestionsTabProps {
  surveyId: string;
  questions: Question[];
  onSaved: (survey: Survey) => void;
}

export default function QuestionsTab({ surveyId, questions, onSaved }: QuestionsTabProps) {
  const { getToken } = useAuth();
  const [drafts, setDrafts] = useState<Question[]>(questions);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateQuestion(id: string, text: string) {
    setDrafts((prev) => prev.map((q) => (q.id === id ? { ...q, text } : q)));
  }

  function addQuestion() {
    setDrafts((prev) => [...prev, { id: `new-${crypto.randomUUID()}`, text: "", order: prev.length + 1 }]);
    setEditing(true);
  }

  function removeQuestion(id: string) {
    setDrafts((prev) => prev.filter((q) => q.id !== id).map((q, i) => ({ ...q, order: i + 1 })));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const token = await getToken();
      const next = await updateSurveyQuestions(
        surveyId,
        drafts
          .filter((q) => q.text.trim())
          .map((q, i) => ({ ...q, id: q.id.startsWith("new-") ? "" : q.id, text: q.text.trim(), order: i + 1 })),
        token,
      );
      onSaved(next);
      setDrafts(next.questions);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save questions.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3.5">
      {error && (
        <div
          className="rounded-[10px] border px-3 py-2 text-sm"
          style={{ borderColor: "var(--color-danger)", color: "var(--color-danger)" }}
        >
          {error}
        </div>
      )}
      {drafts.map((q, i) => (
        <div
          key={q.id}
          className="rounded-2xl p-7 border"
          style={{
            background: "var(--color-bg-raised)",
            borderColor: "var(--color-border)",
            display: "grid",
            gridTemplateColumns: "60px 1fr 200px",
            gap: 20,
          }}
        >
          {/* Number */}
          <div
            className="text-[40px] leading-none"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-mango)" }}
          >
            {String(i + 1).padStart(2, "0")}
          </div>

          {/* Question text + tags */}
          <div>
            {editing ? (
              <textarea
                value={q.text}
                onChange={(e) => updateQuestion(q.id, e.target.value)}
                rows={2}
                className="w-full rounded-[10px] border px-3 py-2 text-[15px] leading-relaxed outline-none"
                style={{
                  borderColor: "var(--color-border-medium)",
                  background: "var(--color-bg-raised)",
                  color: "var(--color-midnight)",
                }}
              />
            ) : (
              <div
                className="text-[20px] leading-snug tracking-[-0.005em]"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-midnight)" }}
              >
                {q.text}
              </div>
            )}
            <div className="flex gap-2 mt-3 flex-wrap">
              {q.topTag && (
                <span
                  className="text-[11px] font-semibold px-2.5 py-[3px] rounded-full"
                  style={{ color: "var(--color-fg2)", background: "var(--color-bg-sunken)" }}
                >
                  top theme · {q.topTag}
                </span>
              )}
              {q.avgFollowUps !== undefined && (
                <span
                  className="text-[11px] font-semibold px-2.5 py-[3px] rounded-full"
                  style={{ color: "var(--color-success)", background: "var(--color-success-bg)" }}
                >
                  {q.avgFollowUps} avg follow-ups
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-2.5">
            {editing && (
              <Button variant="ghost" onClick={() => removeQuestion(q.id)}>
                remove
              </Button>
            )}
            {q.askedCount !== undefined && (
              <div>
                <div
                  className="text-[24px] leading-none"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-midnight)" }}
                >
                  {q.askedCount}
                </div>
                <div
                  className="text-[11px] mt-1 tracking-[0.06em] uppercase"
                  style={{ color: "var(--color-fg3)" }}
                >
                  asked
                </div>
              </div>
            )}
            {q.answeredCount !== undefined && (
              <div>
                <div
                  className="text-[24px] leading-none"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-midnight)" }}
                >
                  {q.answeredCount}
                </div>
                <div
                  className="text-[11px] mt-1 tracking-[0.06em] uppercase"
                  style={{ color: "var(--color-fg3)" }}
                >
                  answered
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="flex gap-2 self-start mt-2">
        {editing ? (
          <>
            <Button variant="primary" onClick={save} disabled={saving}>
              {saving ? "saving..." : "save questions"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setDrafts(questions);
                setEditing(false);
                setError(null);
              }}
            >
              cancel
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Icon name="plus" size={14} /> edit questions
          </Button>
        )}
        <Button variant="outline" onClick={addQuestion}>
          <Icon name="plus" size={14} /> add question
        </Button>
      </div>
    </div>
  );
}
