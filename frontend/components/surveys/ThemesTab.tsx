import type { Theme } from "@/lib/types";

interface ThemesTabProps {
  themes: Theme[];
}

export default function ThemesTab({ themes }: ThemesTabProps) {
  return (
    <div className="grid grid-cols-2 gap-3.5">
      {themes.map((t) => (
        <div
          key={t.name}
          className="rounded-2xl p-6 border"
          style={{ background: "var(--color-bg-raised)", borderColor: "var(--color-border)" }}
        >
          <div className="flex justify-between items-center mb-2.5">
            <div className="flex items-center gap-2.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: t.color }}
              />
              <span
                className="font-semibold text-[17px]"
                style={{ color: "var(--color-midnight)", fontFamily: "var(--font-body)" }}
              >
                {t.name}
              </span>
            </div>
            <span
              className="text-[24px] leading-none"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-midnight)" }}
            >
              {t.count}
            </span>
          </div>

          {t.summary && (
            <p className="text-sm leading-[1.6]" style={{ color: "var(--color-fg2)" }}>
              {t.summary}
            </p>
          )}

          {t.quotes && t.quotes.length > 0 && (
            <div className="mt-3.5 flex flex-col gap-2">
              {t.quotes.map((q, i) => (
                <div
                  key={i}
                  className="pl-3"
                  style={{ borderLeft: `2px solid ${t.color}` }}
                >
                  <div
                    className="text-[15px] leading-snug"
                    style={{ fontFamily: "var(--font-display)", color: "var(--color-midnight)" }}
                  >
                    &ldquo;{q.q}&rdquo;
                  </div>
                  <div className="text-[11px] mt-1" style={{ color: "var(--color-fg3)" }}>
                    {q.who}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
