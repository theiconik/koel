import type { SurveyStatus } from "@/lib/types";

const map: Record<SurveyStatus, { cls: string; dot: string; label: string }> = {
  live:   { cls: "bg-success-bg text-success",     dot: "bg-success", label: "live" },
  draft:  { cls: "bg-bg-sunken text-fg2",          dot: "bg-fg4",     label: "draft" },
  closed: { cls: "bg-danger-bg text-danger",       dot: "bg-danger",  label: "closed" },
};

export default function StatusChip({ status }: { status: SurveyStatus }) {
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
