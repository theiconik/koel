import type { SurveyStatus } from "@/lib/types";

const map: Record<SurveyStatus, { bg: string; fg: string; dot: string; label: string }> = {
  live:   { bg: "#EAF1EC", fg: "#4A7C59", dot: "#4A7C59", label: "live" },
  draft:  { bg: "#F2EEE6", fg: "#4A4538", dot: "#A79E8C", label: "draft" },
  closed: { bg: "#F7E6E0", fg: "#B3412B", dot: "#B3412B", label: "closed" },
};

export default function StatusChip({ status }: { status: SurveyStatus }) {
  const s = map[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.fg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}
