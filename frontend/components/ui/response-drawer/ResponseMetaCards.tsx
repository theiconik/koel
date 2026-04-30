import type { Response, Sentiment } from "@/lib/types";
import Icon from "../Icon";

interface ResponseMetaCardsProps {
  response: Response;
}

const sentimentLabels: Record<Sentiment, string> = {
  delighted: "delighted",
  neutral: "neutral",
  frustrated: "frustrated",
};

const statusLabels: Record<Response["processingStatus"], string> = {
  pending: "pending",
  processing: "processing",
  done: "completed",
  failed: "failed",
};

export function ResponseMetaCards({ response }: ResponseMetaCardsProps) {
  return (
    <section className="mt-7 grid grid-cols-3 gap-4">
      <MetaCard icon="clock" label="DURATION" value={response.duration} />
      <MetaCard icon="sparkle" label="SENTIMENT" value={sentimentLabels[response.sentiment]} />
      <MetaCard icon="check" label="STATUS" value={statusLabels[response.processingStatus]} />
    </section>
  );
}

function MetaCard({ icon, label, value }: { icon: "clock" | "sparkle" | "check"; label: string; value: string }) {
  return (
    <div
      className="rounded-xl px-5 py-5"
      style={{
        background: "var(--color-bg-raised)",
        border: "1px solid var(--color-border-medium)",
      }}
    >
      <div className="flex items-center gap-1.5">
        <Icon name={icon} size={13} />
        <span
          className="text-[13px] font-bold uppercase tracking-[0.12em]"
          style={{ color: "var(--color-fg3)" }}
        >
          {label}
        </span>
      </div>
      <div
        className="mt-3 text-[25px] leading-none"
        style={{ color: "var(--color-midnight)", fontFamily: "var(--font-display)" }}
      >
        {value}
      </div>
    </div>
  );
}
