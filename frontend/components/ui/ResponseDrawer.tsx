"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Response, Sentiment } from "@/lib/types";
import Icon from "./Icon";

interface ResponseDrawerProps {
  response: Response;
  onClose: () => void;
}

const sentimentLabels: Record<Sentiment, string> = {
  delighted: "delighted",
  neutral: "neutral",
  frustrated: "frustrated",
};

const BAR_COUNT = 82;

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function responseDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const day = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).toLowerCase();
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).toLowerCase().replace(" ", "");

  return `${day} · ${time}`;
}

function speakerLabel(response: Response) {
  if (response.isAnonymous) return "THEM";
  return response.respondentName.split(" ")[0].replace(/[^a-z]/gi, "").toUpperCase() || "THEM";
}

export default function ResponseDrawer({ response, onClose }: ResponseDrawerProps) {
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(42);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const participant = useMemo(() => speakerLabel(response), [response]);
  const progress = response.durationSeconds > 0 ? pos / response.durationSeconds : 0;
  const metaDate = responseDate(response.createdAt);
  const initial = response.respondentName.trim().charAt(0).toLowerCase() || "?";

  useEffect(() => {
    if (!playing) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setPos((p) => {
        if (p >= response.durationSeconds) {
          setPlaying(false);
          return response.durationSeconds;
        }
        return p + 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, response.durationSeconds]);

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    setPos(Math.round(ratio * response.durationSeconds));
  }

  return (
    <>
      <button
        aria-label="Close response details"
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default"
        style={{ background: "rgba(26,26,46,0.24)", animation: "fadeIn 160ms" }}
      />

      <aside
        aria-label="Response details"
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{
          width: "min(843px, 100vw)",
          background: "var(--color-cream)",
          color: "var(--color-midnight)",
          animation: "drawerIn 240ms cubic-bezier(0.22,1,0.36,1)",
          boxShadow: "-28px 0 80px rgba(26,26,46,0.20)",
        }}
      >
        <header
          className="flex h-[100px] shrink-0 items-center justify-between px-6 sm:px-8"
          style={{ borderBottom: "1px solid var(--color-border-soft)" }}
        >
          <div className="flex items-center gap-5">
            <button
              onClick={onClose}
              aria-label="Back"
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-stone-100"
              style={{ color: "var(--color-fg2)", border: "none", background: "transparent", cursor: "pointer" }}
            >
              <Icon name="arrowLeft" size={22} />
            </button>
            <div
              className="text-[16px] tracking-[0.06em]"
              style={{ color: "var(--color-fg3)", fontFamily: "var(--font-body)" }}
            >
              VOICES · response
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button
              className="inline-flex items-center justify-center gap-2 text-[18px] font-semibold transition-colors hover:bg-stone-100"
              style={{
                height: 40,
                lineHeight: 1,
                padding: "0 16px",
                border: "1px solid var(--color-border-strong)",
                borderRadius: 14,
                background: "var(--color-bg-raised)",
                color: "var(--color-midnight)",
                boxSizing: "border-box",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              <Icon name="download" size={18} />
              transcript
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-stone-100"
              style={{ color: "var(--color-fg2)", border: "none", background: "transparent", cursor: "pointer" }}
            >
              <Icon name="x" size={24} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-9 sm:px-6">
          <section className="flex items-center gap-5">
            <div
              className="flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-full text-[28px]"
              style={{ background: "var(--color-stone-300)", color: "var(--color-midnight)" }}
            >
              {initial}
            </div>
            <div>
              <h2
                className="text-[34px] leading-none tracking-[-0.01em]"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-midnight)" }}
              >
                {response.respondentName}
              </h2>
              <div className="mt-2 text-[17px]" style={{ color: "var(--color-fg3)" }}>
                {response.respondentRole !== "—" ? `${response.respondentRole} · ` : ""}
                {metaDate}
              </div>
            </div>
          </section>

          <section className="mt-7 grid grid-cols-3 gap-4">
            <MetaCard icon="clock" label="DURATION" value={response.duration} />
            <MetaCard icon="sparkle" label="SENTIMENT" value={sentimentLabels[response.sentiment]} />
            <MetaCard icon="check" label="STATUS" value="completed" />
          </section>

          <section className="mt-5 flex flex-wrap items-center gap-2">
            {response.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[15px] font-semibold leading-none"
                style={{ background: "var(--color-stone-100)", color: "var(--color-fg2)" }}
              >
                <Icon name="tag" size={14} />
                {tag}
              </span>
            ))}
            <button
              className="inline-flex items-center rounded-full px-3 py-2 text-[15px] leading-none"
              style={{
                border: "1px dashed var(--color-border-strong)",
                background: "transparent",
                color: "var(--color-fg3)",
                cursor: "pointer",
              }}
            >
              + add tag
            </button>
          </section>

          <section
            className="mt-7 flex h-[105px] items-center rounded-2xl px-5"
            style={{ background: "var(--color-midnight)", color: "var(--color-fg-inverse)" }}
          >
            <button
              onClick={() => setPlaying((p) => !p)}
              className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full transition-transform active:scale-[0.98]"
              style={{
                background: "var(--color-mango)",
                border: "none",
                color: "var(--color-midnight)",
                cursor: "pointer",
              }}
              aria-label={playing ? "Pause response audio" : "Play response audio"}
            >
              <Icon name={playing ? "pause" : "play"} size={19} stroke={1.8} />
            </button>

            <div
              className="ml-6 mr-5 w-[52px] shrink-0 text-[15px] tabular-nums"
              style={{ color: "rgba(250,247,242,0.75)", fontFamily: "var(--font-mono)" }}
            >
              {formatTime(pos)}
            </div>

            <div
              onClick={seek}
              className="flex h-[46px] flex-1 cursor-pointer items-center gap-[4px] overflow-hidden"
              title="Click to seek"
            >
              {Array.from({ length: BAR_COUNT }).map((_, i) => {
                const height = 12 + Math.abs(Math.sin(i * 0.67) * 24) + (i % 8 === 0 ? 7 : 0);
                const played = i / BAR_COUNT < progress;
                return (
                  <div
                    key={i}
                    className="rounded-full"
                    style={{
                      width: 4,
                      height: `${Math.min(42, height)}px`,
                      background: played ? "var(--color-mango)" : "rgba(250,247,242,0.28)",
                      flexShrink: 0,
                    }}
                  />
                );
              })}
            </div>

            <div
              className="ml-5 w-[70px] shrink-0 text-right text-[15px] tabular-nums"
              style={{ color: "rgba(250,247,242,0.75)", fontFamily: "var(--font-mono)" }}
            >
              {response.duration.replace("m ", "m  ")}
            </div>
          </section>

          <section className="mt-[54px]">
            <div
              className="mb-6 text-[14px] font-bold uppercase tracking-[0.12em]"
              style={{ color: "var(--color-fg3)" }}
            >
              TRANSCRIPT
            </div>

            <div className="flex flex-col gap-7">
              {response.transcript.map((seg, i) => (
                <div key={`${seg.t}-${i}`} className="grid gap-7" style={{ gridTemplateColumns: "64px 1fr" }}>
                  <div
                    className="pt-1 text-[15px] tabular-nums"
                    style={{ color: "var(--color-fg3)", fontFamily: "var(--font-mono)" }}
                  >
                    {seg.t}
                  </div>
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className="text-[13px] font-bold uppercase tracking-[0.12em]"
                        style={{ color: seg.who === "koel" ? "var(--color-mango)" : "var(--color-success)" }}
                      >
                        {seg.who === "koel" ? "KOEL" : participant}
                      </span>
                      {seg.highlight && (
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
                        color: seg.who === "them" ? "var(--color-midnight)" : "var(--color-fg2)",
                        fontFamily: seg.who === "them" ? "var(--font-display)" : "var(--font-body)",
                        fontSize: seg.who === "them" ? 24 : 19,
                        lineHeight: seg.who === "them" ? 1.48 : 1.42,
                      }}
                    >
                      {seg.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

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
              {response.koelSummary}
            </p>
          </section>
        </div>
      </aside>
    </>
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
