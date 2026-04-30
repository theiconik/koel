"use client";
import type { Survey } from "@/lib/types";
import StatusChip from "./StatusChip";

interface SurveyCardProps {
  survey: Survey;
  onClick: () => void;
}

export default function SurveyCard({ survey, onClick }: SurveyCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-border bg-bg-raised p-[22px] text-left shadow-sm cursor-pointer card-hover"
      aria-label={`Open survey ${survey.title}`}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="font-body font-semibold text-[17px] leading-snug text-midnight">
          {survey.title}
        </div>
        <StatusChip status={survey.status} />
      </div>

      <div className="text-sm mt-1.5 text-fg3">
        {survey.description}
      </div>

      <div className="flex gap-6 mt-5">
        {([
          [survey.responseCount, "voices"],
          [survey.avgDuration, "avg time"],
          [survey.completionRate, "completion"],
        ] as [string | number, string][]).map(([val, lbl]) => (
          <div key={lbl}>
            <div className="font-display text-[22px] leading-none text-midnight">
              {val}
            </div>
            <div className="text-[11px] mt-1 tracking-[0.06em] uppercase text-fg3">
              {lbl}
            </div>
          </div>
        ))}
      </div>
    </button>
  );
}
