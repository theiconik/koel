"use client";

import { use, useState, useEffect, useRef } from "react";
import Image from "next/image";
import { mockSurveys } from "@/lib/data/mock/surveys";
import type { Survey } from "@/lib/types";

// ── Types ─────────────────────────────────────────────────────────────────────
type Stage = "landing" | "permission" | "chatting" | "ending" | "thanks";
type Turn = { who: "koel" | "user"; text: string; spoken?: boolean };
type PillVariant = "gold" | "midnight" | "outline" | "ghost";

// ── Icons ─────────────────────────────────────────────────────────────────────
function MicIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <path d="M12 19v3" />
    </svg>
  );
}

function ArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ── Shared primitives ─────────────────────────────────────────────────────────
function Mark() {
  return (
    <div className="inline-flex items-center gap-2">
      <Image src="/koel-logo.svg" alt="" width={24} height={24} />
      <span className="text-midnight tracking-[-0.02em] leading-none" style={{ fontFamily: "var(--font-display)", fontSize: 24 }}>
        koel
      </span>
    </div>
  );
}

const pillBase =
  "inline-flex items-center gap-2 font-semibold text-[15px] rounded-full px-[26px] py-[14px] leading-none border-0 cursor-pointer transition-all duration-[180ms] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

const pillVariants: Record<PillVariant, string> = {
  gold:     "bg-mango text-midnight hover:bg-mango-hover",
  midnight: "bg-midnight text-fg-inverse hover:bg-midnight/90",
  outline:  "bg-transparent border border-midnight/20 text-midnight hover:bg-stone-100 !px-[25px] !py-[13px]",
  ghost:    "bg-transparent text-fg2 hover:bg-stone-100 !px-5",
};

function PillBtn({
  variant = "midnight",
  children,
  onClick,
  disabled,
  className = "",
}: {
  variant?: PillVariant;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`${pillBase} ${pillVariants[variant]} ${className}`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      {children}
    </button>
  );
}

function Header({ right }: { right?: React.ReactNode }) {
  return (
    <div className="px-7 py-[22px] flex justify-between items-center max-w-[1160px] mx-auto w-full">
      <Mark />
      <div className="flex items-center gap-3.5 text-xs text-fg3">{right}</div>
    </div>
  );
}

function RespFooter() {
  return (
    <div className="px-7 py-5 text-xs text-fg3 text-center border-t border-midnight/5">
      powered by <span className="text-midnight font-semibold">koel</span> · your voice is encrypted ·{" "}
      <span className="cursor-pointer underline">privacy</span>
    </div>
  );
}

// ── Landing ───────────────────────────────────────────────────────────────────
function Landing({ survey, onStart }: { survey: Survey; onStart: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center px-7 py-10">
      <div className="max-w-[680px] text-center" style={{ animation: "slideUp 400ms cubic-bezier(0.22,1,0.36,1)" }}>
        <div className="inline-flex items-center gap-2 bg-stone-100 text-fg2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-[0.06em] uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-mango" /> a voice survey · 3 min
        </div>

        <h1
          className="text-midnight tracking-[-0.02em] mt-6 mb-4 text-balance"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px,6vw,64px)", lineHeight: 1.08 }}
        >
          {survey.title}
        </h1>

        <p className="text-[17px] text-fg2 leading-[1.65] max-w-[560px] mx-auto mb-9">
          {survey.description} instead of a form, we'll have a short conversation. koel — our AI — will ask you a couple of things and listen. you just talk.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <PillBtn variant="gold" onClick={onStart}>
            start survey <ArrowRight size={16} />
          </PillBtn>
          <PillBtn variant="outline">read what we do with your voice</PillBtn>
        </div>

        <div className="mt-14 grid grid-cols-3 gap-6 max-w-[560px] mx-auto text-left">
          {[
            { n: "01", t: "tap start", d: "we'll ask for your mic — nothing else." },
            { n: "02", t: "just talk", d: "koel asks, you answer. pause as much as you need." },
            { n: "03", t: "tap to end", d: "when you're done, tap end. that's it." },
          ].map((x) => (
            <div key={x.n}>
              <div className="text-mango leading-none" style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>{x.n}</div>
              <div className="font-semibold text-sm text-midnight mt-2">{x.t}</div>
              <div className="text-[13px] text-fg3 mt-1 leading-[1.5]">{x.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Permission ────────────────────────────────────────────────────────────────
function Permission({ onAllow, onBack }: { onAllow: () => void; onBack: () => void }) {
  const [state, setState] = useState<"idle" | "requesting" | "granted">("idle");

  function grant() {
    setState("requesting");
    setTimeout(() => {
      setState("granted");
      setTimeout(onAllow, 400);
    }, 900);
  }

  return (
    <div className="flex-1 flex items-center justify-center px-7 py-10">
      <div className="max-w-[520px] text-center" style={{ animation: "slideUp 400ms cubic-bezier(0.22,1,0.36,1)" }}>
        <div
          className="w-32 h-32 rounded-full border border-midnight/10 flex items-center justify-center mx-auto mb-8 transition-all duration-[220ms]"
          style={{
            background: state === "granted" ? "#EAF1EC" : "#fff",
            color: state === "granted" ? "var(--color-forest)" : "var(--color-midnight)",
            animation: state === "requesting" ? "pulse 1.1s ease-in-out infinite" : undefined,
          }}
        >
          {state === "granted" ? <CheckIcon size={48} /> : <MicIcon size={48} />}
        </div>

        <h2
          className="text-midnight tracking-[-0.015em] mb-3.5 text-balance"
          style={{ fontFamily: "var(--font-display)", fontSize: 36, lineHeight: 1.12 }}
        >
          {state === "granted" ? "thank you. let's begin." : "koel needs your microphone."}
        </h2>

        <p className="text-[15px] text-fg2 leading-[1.65] max-w-[420px] mx-auto mb-7">
          {state === "granted"
            ? "connecting you to the conversation…"
            : "when you tap allow, your browser will ask permission. we only record while you're talking."}
        </p>

        {state !== "granted" && (
          <div className="flex gap-2.5 justify-center">
            <PillBtn variant="ghost" onClick={onBack}>back</PillBtn>
            <PillBtn variant="midnight" onClick={grant} disabled={state === "requesting"}>
              {state === "requesting" ? "asking your browser…" : "allow microphone"}
            </PillBtn>
          </div>
        )}

        <p className="mt-7 text-xs text-fg3">
          you can stop at any time. nothing is shared without your consent.
        </p>
      </div>
    </div>
  );
}

// ── Chat primitives ───────────────────────────────────────────────────────────
function ChatTurn({ turn }: { turn: Turn }) {
  if (turn.who === "koel") {
    return (
      <div className="flex gap-3.5 items-start" style={{ animation: "slideUp 300ms cubic-bezier(0.22,1,0.36,1)" }}>
        <div className="w-9 h-9 rounded-full bg-midnight flex items-center justify-center shrink-0 overflow-hidden">
          <Image src="/koel-logo.svg" alt="" width={22} height={22} className="invert" />
        </div>
        <div className="flex-1 pt-1">
          <div className="text-[11px] tracking-[0.1em] uppercase text-fg3 font-semibold mb-2 flex items-center gap-2">
            KOEL
            {turn.spoken && (
              <span className="inline-flex items-center gap-1 text-forest normal-case tracking-normal font-medium text-[11px]">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M11 5 6 9H2v6h4l5 4V5zM19 12c0-2-1-3.5-2-4.5M16 8c.6.7 1 1.7 1 3" />
                </svg>
                speaking
              </span>
            )}
          </div>
          <p
            className="text-midnight leading-[1.35] tracking-[-0.005em] text-pretty"
            style={{ fontFamily: "var(--font-display)", fontSize: 22 }}
          >
            {turn.text}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end" style={{ animation: "slideUp 300ms cubic-bezier(0.22,1,0.36,1)" }}>
      <div
        className="max-w-[78%] bg-midnight text-fg-inverse px-[18px] py-3.5 text-[15px] leading-[1.55]"
        style={{ borderRadius: "16px 16px 4px 16px", fontFamily: "var(--font-body)" }}
      >
        <div className="text-[10px] tracking-[0.1em] uppercase font-semibold mb-1" style={{ color: "rgba(250,247,242,0.55)" }}>
          YOU · transcribed
        </div>
        {turn.text}
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex gap-3.5 items-start">
      <div className="w-9 h-9 rounded-full bg-midnight flex items-center justify-center shrink-0 overflow-hidden">
        <Image src="/koel-logo.svg" alt="" width={22} height={22} className="invert" />
      </div>
      <div className="py-3.5 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-fg3"
            style={{ animation: `thinkDot 1.2s ${i * 0.15}s ease-in-out infinite` }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Chatting ──────────────────────────────────────────────────────────────────
const SCRIPT = [
  {
    user: "i'm a product lead at a fintech startup. we were looking for something softer than typeform for our onboarding feedback — something that felt like talking to a person.",
    ai: "that makes sense. when you say \"softer\" — what were the sharp edges with what you'd tried before?",
  },
  {
    user: "typeform is great, but the questions felt like a checklist. people gave short answers because the format invited short answers. i wanted stories.",
    ai: "and now that you've run a few surveys — have the answers been different? any specific moment you remember?",
  },
  {
    user: "yeah, one of our users talked for four minutes straight about how confused they were by our pricing page. that one response made us rewrite a whole section.",
    ai: "that's exactly what we hope for. one last thing — if a friend running a similar team asked \"should i try this?\", what would you actually say?",
  },
  {
    user: "i'd tell them it pays for itself the first time a real person says something you didn't expect. less like gathering data, more like a conversation you wouldn't have had otherwise.",
    ai: "thank you — really. that's everything i wanted to ask. take your time, and tap \"i'm done\" when you're ready.",
  },
];

function Chatting({ onEnd }: { onEnd: () => void }) {
  const [turns, setTurns] = useState<Turn[]>([
    { who: "koel", text: "hi — i'm koel. before we get into it, tell me a bit about yourself. what do you do, and how'd you end up here today?", spoken: true },
  ]);
  const [recording, setRecording] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [bars, setBars] = useState(() => Array.from({ length: 48 }, () => 24));
  const [elapsed, setElapsed] = useState(0);
  const turnIdxRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!recording) {
      setBars(Array.from({ length: 48 }, () => 14));
      return;
    }
    const id = setInterval(() => setBars(Array.from({ length: 48 }, () => 20 + Math.random() * 80)), 110);
    return () => clearInterval(id);
  }, [recording]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [turns, aiSpeaking]);

  function toggleMic() {
    if (aiSpeaking) return;
    if (!recording) {
      setRecording(true);
      return;
    }
    setRecording(false);
    const next = SCRIPT[turnIdxRef.current];
    if (!next) return;
    turnIdxRef.current += 1;
    setTurns((t) => [...t, { who: "user", text: next.user }]);
    setAiSpeaking(true);
    setTimeout(() => {
      setTurns((t) => [...t, { who: "koel", text: next.ai, spoken: true }]);
      setAiSpeaking(false);
    }, 1400);
  }

  const mm = Math.floor(elapsed / 60);
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="flex-1 flex flex-col bg-cream">
      {/* Top bar */}
      <div className="px-7 py-[18px] flex justify-between items-center border-b border-midnight/[0.06]">
        <Mark />
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-1.5 text-xs text-fg3" style={{ fontFamily: "var(--font-mono)" }}>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: recording ? "#B3412B" : "var(--color-forest)",
                animation: recording ? "pulse 1.2s ease-in-out infinite" : undefined,
              }}
            />
            {mm}:{ss}
          </div>
          <button
            onClick={onEnd}
            className="bg-transparent border border-midnight/15 text-fg2 cursor-pointer text-[13px] px-3.5 py-[7px] rounded-full hover:bg-stone-100 transition-colors"
            style={{ fontFamily: "var(--font-body)" }}
          >
            i'm done
          </button>
        </div>
      </div>

      {/* Transcript */}
      <div ref={scrollRef} className="flex-1 overflow-auto px-6 py-8">
        <div className="max-w-[720px] mx-auto flex flex-col gap-7">
          {turns.map((t, i) => (
            <ChatTurn key={i} turn={t} />
          ))}
          {aiSpeaking && <ThinkingBubble />}
        </div>
      </div>

      {/* Mic dock */}
      <div className="border-t border-midnight/[0.08] bg-cream px-6 pt-6 pb-8">
        <div className="max-w-[720px] mx-auto flex items-center gap-5">
          <button
            onClick={toggleMic}
            disabled={aiSpeaking}
            className="w-20 h-20 rounded-full border-0 shrink-0 flex items-center justify-center transition-all duration-[200ms] disabled:cursor-not-allowed"
            style={{
              background: recording ? "var(--color-mango)" : aiSpeaking ? "rgba(26,26,46,0.15)" : "var(--color-midnight)",
              color: recording ? "var(--color-midnight)" : "var(--color-cream)",
              cursor: aiSpeaking ? "default" : "pointer",
              boxShadow: recording
                ? "0 0 0 8px rgba(232,176,75,0.20), 0 12px 32px rgba(26,26,46,0.18)"
                : "0 8px 24px rgba(26,26,46,0.14)",
              animation: recording ? "pulse 1.3s ease-in-out infinite" : undefined,
            }}
          >
            {recording
              ? <div className="w-[22px] h-[22px] rounded-[4px] bg-midnight" />
              : <MicIcon size={32} />}
          </button>

          <div className="flex-1 min-w-0">
            <div
              className="text-[11px] tracking-[0.12em] uppercase font-bold"
              style={{ color: recording ? "#B3412B" : aiSpeaking ? "var(--color-fg3)" : "var(--color-fg2)" }}
            >
              {aiSpeaking ? "KOEL IS THINKING" : recording ? "LISTENING · TAP WHEN DONE" : "TAP TO SPEAK"}
            </div>
            <div className="text-[13px] text-fg3 mt-1">
              {aiSpeaking
                ? "she'll be right with a follow-up."
                : recording
                  ? "take your time. pauses are fine."
                  : "koel will ask a follow-up after each answer."}
            </div>
            <div className="flex items-end gap-[3px] h-7 mt-2.5">
              {bars.map((h, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-[2px]"
                  style={{
                    height: `${h}%`,
                    background: recording ? "var(--color-mango)" : "rgba(26,26,46,0.18)",
                    transition: "height 110ms linear",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <p className="max-w-[720px] mx-auto mt-4 text-[11px] text-fg3 text-center tracking-[0.04em]">
          you can end any time · nothing is recorded when the mic is off
        </p>
      </div>
    </div>
  );
}

// ── Ending ────────────────────────────────────────────────────────────────────
function Ending({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center px-7 py-10">
      <div className="max-w-[520px] text-center" style={{ animation: "slideUp 320ms cubic-bezier(0.22,1,0.36,1)" }}>
        <h2
          className="text-midnight tracking-[-0.015em] mb-3.5 text-balance"
          style={{ fontFamily: "var(--font-display)", fontSize: 36, lineHeight: 1.15 }}
        >
          ready to wrap up?
        </h2>
        <p className="text-[15px] text-fg2 leading-[1.65] max-w-[420px] mx-auto mb-8">
          we'll send your conversation to the team. you won't be able to add more after this.
        </p>
        <div className="flex gap-2.5 justify-center flex-wrap">
          <PillBtn variant="outline" onClick={onCancel}>not yet — keep talking</PillBtn>
          <PillBtn variant="midnight" onClick={onConfirm}>
            yes, i'm done <CheckIcon size={14} />
          </PillBtn>
        </div>
      </div>
    </div>
  );
}

// ── Thanks ────────────────────────────────────────────────────────────────────
function Thanks({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center px-7 py-10">
      <div className="max-w-[620px] text-center" style={{ animation: "slideUp 400ms cubic-bezier(0.22,1,0.36,1)" }}>
        <div className="w-[88px] h-[88px] rounded-full flex items-center justify-center mx-auto mb-7 text-forest" style={{ background: "#EAF1EC" }}>
          <CheckIcon size={40} />
        </div>

        <h1
          className="text-midnight tracking-[-0.015em] mb-4 text-balance"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,5vw,52px)", lineHeight: 1.1 }}
        >
          thank you for your voice.
        </h1>

        <p className="text-[16px] text-fg2 leading-[1.7] max-w-[500px] mx-auto mb-8">
          the team has your conversation. they read every response — a real person, not a dashboard. it makes a difference. really.
        </p>

        <div className="bg-white border border-midnight/10 rounded-2xl p-[22px] text-left max-w-[440px] mx-auto mb-7">
          <div className="text-[11px] tracking-[0.1em] uppercase text-fg3 font-semibold mb-2.5">WHAT HAPPENS NEXT</div>
          <div className="flex flex-col gap-2.5">
            {[
              "your audio is encrypted and sent to the team.",
              "koel transcribes and organizes it alongside other voices.",
              "you'll get a copy of the transcript by email if you want one.",
            ].map((x, i) => (
              <div key={i} className="flex gap-2.5 text-sm text-midnight leading-[1.5]">
                <span className="text-mango shrink-0" style={{ fontFamily: "var(--font-display)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{x}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2.5 justify-center flex-wrap">
          <PillBtn variant="outline">email me a transcript</PillBtn>
          <PillBtn variant="ghost" onClick={onRestart}>start over (demo)</PillBtn>
        </div>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function RespondentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const survey = mockSurveys.find((s) => s.shareUrl.endsWith(`/s/${slug}`));
  const [stage, setStage] = useState<Stage>("landing");

  if (!survey) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-fg3 text-sm" style={{ fontFamily: "var(--font-body)" }}>
        survey not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col" style={{ fontFamily: "var(--font-body)" }}>
      {stage !== "chatting" && (
        <Header
          right={
            <span>
              hosted by <strong className="text-midnight font-semibold">roshi research</strong>
            </span>
          }
        />
      )}

      <div className="flex-1 flex flex-col">
        {stage === "landing"    && <Landing survey={survey} onStart={() => setStage("permission")} />}
        {stage === "permission" && <Permission onAllow={() => setStage("chatting")} onBack={() => setStage("landing")} />}
        {stage === "chatting"   && <Chatting onEnd={() => setStage("ending")} />}
        {stage === "ending"     && <Ending onConfirm={() => setStage("thanks")} onCancel={() => setStage("chatting")} />}
        {stage === "thanks"     && <Thanks onRestart={() => setStage("landing")} />}
      </div>

      {stage !== "chatting" && <RespFooter />}
    </div>
  );
}
