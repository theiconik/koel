import type { Question } from "@/lib/types";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

interface QuestionsTabProps {
  questions: Question[];
}

export default function QuestionsTab({ questions }: QuestionsTabProps) {
  return (
    <div className="flex flex-col gap-3.5">
      {questions.map((q, i) => (
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
            <div
              className="text-[20px] leading-snug tracking-[-0.005em]"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-midnight)" }}
            >
              {q.text}
            </div>
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

      <Button variant="outline" className="self-start mt-2">
        <Icon name="plus" size={14} /> edit questions
      </Button>
    </div>
  );
}
