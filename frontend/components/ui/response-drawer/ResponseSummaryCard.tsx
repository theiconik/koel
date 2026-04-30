import Icon from "../Icon";

interface ResponseSummaryCardProps {
  summary: string;
}

export function ResponseSummaryCard({ summary }: ResponseSummaryCardProps) {
  return (
    <section
      className="mt-10 rounded-2xl px-6 py-6"
      style={{
        background: "var(--color-bg-raised)",
        border: "1px solid var(--color-border-medium)",
      }}
    >
      <div className="mb-4 flex items-center gap-3">
        <span style={{ color: "var(--color-mango)" }}>
          <Icon name="sparkle" size={18} />
        </span>
        <span
          className="text-[15px] font-bold uppercase tracking-[0.12em]"
          style={{ color: "var(--color-fg3)" }}
        >
          KOEL&apos;S SUMMARY
        </span>
      </div>
      <p
        className="text-[19px] leading-relaxed"
        style={{ color: "var(--color-midnight)", fontFamily: "var(--font-body)" }}
      >
        {summary || "Summary is not available yet."}
      </p>
    </section>
  );
}
