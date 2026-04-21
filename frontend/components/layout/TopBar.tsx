import { ReactNode } from "react";

interface TopBarProps {
  title: string;
  crumbs?: ReactNode;
  cta?: ReactNode;
}

export default function TopBar({ title, crumbs, cta }: TopBarProps) {
  return (
    <div
      className="flex items-center justify-between px-9 py-5 border-b shrink-0"
      style={{ background: "var(--color-cream)", borderColor: "rgba(26,26,46,0.08)" }}
    >
      <div>
        {crumbs && (
          <div
            className="text-xs mb-1 tracking-[0.04em]"
            style={{ color: "var(--color-fg3)" }}
          >
            {crumbs}
          </div>
        )}
        <h1
          className="text-[32px] leading-tight tracking-[-0.015em] m-0"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-midnight)" }}
        >
          {title}
        </h1>
      </div>
      {cta && <div className="flex items-center gap-2">{cta}</div>}
    </div>
  );
}
