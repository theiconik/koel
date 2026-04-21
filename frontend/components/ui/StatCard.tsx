interface StatCardProps {
  label: string;
  value: string | number;
  note: string;
}

export default function StatCard({ label, value, note }: StatCardProps) {
  return (
    <div
      className="rounded-xl px-5 py-[18px] border"
      style={{
        background: "var(--color-bg-raised)",
        borderColor: "var(--color-border)",
      }}
    >
      <div
        className="text-[11px] font-semibold tracking-[0.1em] uppercase"
        style={{ color: "var(--color-fg3)" }}
      >
        {label}
      </div>
      <div
        className="text-[38px] leading-none tracking-[-0.02em] mt-2"
        style={{ fontFamily: "var(--font-display)", color: "var(--color-midnight)" }}
      >
        {value}
      </div>
      <div className="text-xs mt-2" style={{ color: "var(--color-fg3)" }}>
        {note}
      </div>
    </div>
  );
}
