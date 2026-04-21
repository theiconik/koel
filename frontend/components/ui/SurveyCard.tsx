"use client";
import type { Survey } from "@/lib/types";
import StatusChip from "./StatusChip";

interface SurveyCardProps {
  survey: Survey;
  onClick: () => void;
}

export default function SurveyCard({ survey, onClick }: SurveyCardProps) {
  return (
    <div
      onClick={onClick}
      className="rounded-2xl p-[22px] border cursor-pointer transition-all duration-[200ms]"
      style={{
        background: "var(--color-bg-raised)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
        transitionTimingFunction: "var(--ease-out)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-md)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-sm)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      <div className="flex justify-between items-start gap-3">
        <div
          className="font-semibold text-[17px] leading-snug"
          style={{ color: "var(--color-midnight)", fontFamily: "var(--font-body)" }}
        >
          {survey.title}
        </div>
        <StatusChip status={survey.status} />
      </div>

      <div className="text-sm mt-1.5" style={{ color: "var(--color-fg3)" }}>
        {survey.description}
      </div>

      <div className="flex gap-6 mt-5">
        {([
          [survey.responseCount, "voices"],
          [survey.avgDuration, "avg time"],
          [survey.completionRate, "completion"],
        ] as [string | number, string][]).map(([val, lbl]) => (
          <div key={lbl}>
            <div
              className="text-[22px] leading-none"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-midnight)" }}
            >
              {val}
            </div>
            <div
              className="text-[11px] mt-1 tracking-[0.06em] uppercase"
              style={{ color: "var(--color-fg3)" }}
            >
              {lbl}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
