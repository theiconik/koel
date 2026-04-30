import type { TranscriptSegment } from "@/lib/types";

interface TranscriptListProps {
  participant: string;
  transcript: TranscriptSegment[];
}

export function TranscriptList({ participant, transcript }: TranscriptListProps) {
  return (
    <section className="mt-[54px]">
      <div
        className="mb-6 text-[14px] font-bold uppercase tracking-[0.12em]"
        style={{ color: "var(--color-fg3)" }}
      >
        TRANSCRIPT
      </div>

      <div className="flex flex-col gap-7">
        {transcript.length === 0 ? (
          <p className="text-[15px] leading-relaxed" style={{ color: "var(--color-fg3)" }}>
            Transcript is not available yet. Refresh this survey after processing finishes.
          </p>
        ) : transcript.map((seg, i) => (
          <TranscriptSegmentRow key={`${seg.t}-${i}`} participant={participant} segment={seg} />
        ))}
      </div>
    </section>
  );
}

function TranscriptSegmentRow({ participant, segment }: { participant: string; segment: TranscriptSegment }) {
  return (
    <div className="grid gap-7" style={{ gridTemplateColumns: "64px 1fr" }}>
      <div
        className="pt-1 text-[15px] tabular-nums"
        style={{ color: "var(--color-fg3)", fontFamily: "var(--font-mono)" }}
      >
        {segment.t}
      </div>
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span
            className="text-[13px] font-bold uppercase tracking-[0.12em]"
            style={{ color: segment.who === "koel" ? "var(--color-mango)" : "var(--color-success)" }}
          >
            {segment.who === "koel" ? "KOEL" : participant}
          </span>
          {segment.highlight && (
            <>
              <span
                className="text-[13px] font-bold uppercase tracking-[0.12em]"
                style={{ color: "var(--color-coral)" }}
              >
                ·
              </span>
              <span
                className="text-[13px] font-bold uppercase tracking-[0.12em]"
                style={{ color: "var(--color-danger)" }}
              >
                FOLLOW-UP
              </span>
            </>
          )}
        </div>
        <p
          className="leading-relaxed"
          style={{
            color: segment.who === "them" ? "var(--color-midnight)" : "var(--color-fg2)",
            fontFamily: "var(--font-body)",
            fontSize: 22,
            lineHeight: 1.5,
          }}
        >
          {segment.text}
        </p>
      </div>
    </div>
  );
}
