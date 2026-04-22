interface StatCardProps {
  label: string;
  value: string | number;
  note: string;
}

export default function StatCard({ label, value, note }: StatCardProps) {
  return (
    <div className="rounded-xl px-5 py-[18px] border border-border bg-bg-raised">
      <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-fg3">
        {label}
      </div>
      <div className="font-display text-[38px] leading-none tracking-[-0.02em] mt-2 text-midnight">
        {value}
      </div>
      <div className="text-xs mt-2 text-fg3">
        {note}
      </div>
    </div>
  );
}
