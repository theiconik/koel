"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { isMockMode, startVoiceSession, submitResponse } from "@/lib/data";
import type { Survey, VoiceAgentMode, VoiceAgentSnapshot } from "@/lib/types";
import { createElevenLabsVoiceAgent, createMockVoiceAgent } from "@/lib/voice/agent";

type Stage = "landing" | "permission" | "chatting" | "ending" | "thanks";
type PermissionState = "idle" | "requesting" | "granted" | "denied";
type CSSVarStyle = CSSProperties & Record<`--${string}`, string | number>;

const RADIAL_BAR_COUNT = 64;
const RADIAL_BAR_SEEDS = Array.from({ length: RADIAL_BAR_COUNT }, (_, i) => {
  const raw = Math.sin(i * 12.9898) * 43758.5453;
  return raw - Math.floor(raw);
});

function formatElapsed(totalSeconds: number) {
  const mm = Math.floor(totalSeconds / 60);
  const ss = String(totalSeconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function modeLabel(mode: VoiceAgentMode) {
  if (mode === "speaking") return "koel is speaking";
  if (mode === "listening") return "koel is listening";
  if (mode === "thinking") return "thinking";
  if (mode === "error") return "connection issue";
  return "conversation ended";
}

function Mark({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2">
      <Image
        src="/koel-logo.svg"
        alt=""
        width={24}
        height={24}
        className={inverse ? "brightness-0 invert" : undefined}
      />
      <span className={`font-display text-2xl tracking-normal leading-none ${inverse ? "text-fg-inverse" : "text-midnight"}`}>
        koel
      </span>
    </div>
  );
}

function Header({ right }: { right?: React.ReactNode }) {
  return (
    <header className="px-7 py-[22px] flex justify-between items-center max-w-[1160px] mx-auto w-full">
      <Mark />
      <div className="flex items-center gap-3.5 text-xs text-fg3">{right}</div>
    </header>
  );
}

function RespFooter() {
  return (
    <footer className="px-7 py-5 text-xs text-fg3 text-center border-t border-midnight/5">
      powered by <span className="text-midnight font-semibold">koel</span> · your voice is encrypted ·{" "}
      <button type="button" className="underline cursor-pointer">
        privacy
      </button>
    </footer>
  );
}

function Landing({ survey, onStart }: { survey: Survey; onStart: () => void }) {
  return (
    <section className="flex-1 flex items-center justify-center px-7 py-10">
      <div className="respondent-slide-up max-w-[680px] text-center">
        <div className="inline-flex items-center gap-2 bg-stone-100 text-fg2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-[0.06em] uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-mango" /> a voice survey · 3 min
        </div>

        <h1 className="font-display text-midnight tracking-normal mt-6 mb-4 text-balance text-[clamp(40px,6vw,64px)] leading-[1.08]">
          {survey.title}
        </h1>

        <p className="text-[17px] text-fg2 leading-[1.65] max-w-[560px] mx-auto mb-9">
          {survey.description} instead of a form, we&apos;ll have a short conversation. koel will speak first and listen as you answer.
          no typing, no multiple choice. just talk.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Button variant="primary" onClick={onStart} className="rounded-full px-[26px] py-[14px] text-[15px]">
            start survey <Icon name="chevronRight" size={16} />
          </Button>
          <Button variant="outline" className="rounded-full px-[25px] py-[13px] text-[15px]">
            read what we do with your voice
          </Button>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-[560px] mx-auto text-left">
          {[
            { n: "01", t: "tap start", d: "we'll ask for your mic - nothing else." },
            { n: "02", t: "just talk", d: "koel speaks first. you answer. pause as much as you need." },
            { n: "03", t: "end when ready", d: "tap end survey at the top to wrap up. that's it." },
          ].map((item) => (
            <div key={item.n}>
              <div className="font-display text-mango leading-none text-xl">{item.n}</div>
              <div className="font-semibold text-sm text-midnight mt-2">{item.t}</div>
              <div className="text-[13px] text-fg3 mt-1 leading-[1.5]">{item.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Permission({ onAllow, onBack }: { onAllow: () => void; onBack: () => void }) {
  const [state, setState] = useState<PermissionState>("idle");

  async function grant() {
    setState("requesting");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone permissions are not available in this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setState("granted");
      window.setTimeout(onAllow, 400);
    } catch {
      setState("denied");
    }
  }

  return (
    <section className="flex-1 flex items-center justify-center px-7 py-10">
      <div className="respondent-slide-up max-w-[520px] text-center">
        <div
          className={`w-32 h-32 rounded-full border border-midnight/10 flex items-center justify-center mx-auto mb-8 transition-all duration-[220ms] ${
            state === "granted" ? "bg-success-bg text-forest" : "bg-white text-midnight"
          } ${state === "requesting" ? "respondent-pulse" : ""}`}
        >
          {state === "granted" ? <Icon name="check" size={48} stroke={2.5} /> : <Icon name="mic" size={48} />}
        </div>

        <h2 className="font-display text-midnight tracking-normal mb-3.5 text-balance text-4xl leading-[1.12]">
          {state === "granted" ? "thank you. let's begin." : "koel needs your microphone."}
        </h2>

        <p className="text-[15px] text-fg2 leading-[1.65] max-w-[420px] mx-auto mb-7">
          {state === "granted"
            ? "connecting you to the conversation..."
            : "when you tap allow, your browser will ask permission. we only record while the survey is active."}
        </p>

        {state === "denied" && (
          <p className="text-sm text-danger mb-5">
            microphone access was blocked. allow microphone access in your browser settings to continue.
          </p>
        )}

        {state !== "granted" && (
          <div className="flex gap-2.5 justify-center flex-wrap">
            <Button variant="ghost" onClick={onBack} className="rounded-full px-5 py-[13px] text-[15px]">
              back
            </Button>
            <Button variant="midnight" onClick={grant} disabled={state === "requesting"} className="rounded-full px-[26px] py-[14px] text-[15px]">
              {state === "requesting" ? "asking your browser..." : state === "denied" ? "try again" : "allow microphone"}
            </Button>
          </div>
        )}

        <p className="mt-7 text-xs text-fg3">you can stop at any time. nothing is shared without your consent.</p>
      </div>
    </section>
  );
}

function BackdropAtmosphere() {
  return (
    <div aria-hidden className="voice-atmosphere">
      <span className="voice-atmosphere__blob voice-atmosphere__blob--coral" />
      <span className="voice-atmosphere__blob voice-atmosphere__blob--mango" />
      <span className="voice-atmosphere__blob voice-atmosphere__blob--forest" />
    </div>
  );
}

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      {[0, 1, 2].map((index) => (
        <span key={index} className="voice-thinking-dot" style={{ "--dot-delay": `${index * 0.15}s` } as CSSVarStyle} />
      ))}
    </span>
  );
}

function RadialBars({ level }: { level: number }) {
  return (
    <div className="voice-radial-bars" aria-hidden>
      {RADIAL_BAR_SEEDS.map((seed, index) => {
        const angle = (index / RADIAL_BAR_COUNT) * 360;
        const amplitude = 0.4 + seed * 0.6;
        const height = 6 + level * 22 * amplitude;

        return (
          <span
            key={index}
            className="voice-radial-bar"
            style={
              {
                "--bar-angle": `${angle}deg`,
                "--bar-height": `${height}px`,
                "--bar-origin": `${178 + height}px`,
              } as CSSVarStyle
            }
          />
        );
      })}
    </div>
  );
}

function Orb({ snapshot, onInterrupt }: { snapshot: VoiceAgentSnapshot; onInterrupt: () => void }) {
  const mode = snapshot.mode;
  const orbMode = mode === "listening" || mode === "thinking" ? mode : "speaking";
  const scale =
    mode === "speaking" ? 1 + snapshot.level * 0.06 :
    mode === "listening" ? 1 + snapshot.level * 0.025 :
    mode === "thinking" ? 0.95 :
    0.92;

  return (
    <div className="voice-orb-wrap">
      {mode === "listening" &&
        [0, 1, 2].map((index) => (
          <span
            key={index}
            className="voice-orb-ripple"
            style={{ "--ring-delay": `${index * 0.8}s` } as CSSVarStyle}
            aria-hidden
          />
        ))}

      <span className={`voice-orb-halo voice-orb-halo--${orbMode}`} aria-hidden />
      {mode === "speaking" && <span className="voice-orb-ring" aria-hidden />}
      {mode === "listening" && <RadialBars level={snapshot.level} />}

      <button
        type="button"
        aria-label={snapshot.canInterrupt ? "interrupt koel" : "voice status"}
        disabled={!snapshot.canInterrupt}
        onClick={onInterrupt}
        className={`voice-orb voice-orb--${orbMode}`}
        style={{ "--orb-scale": scale.toFixed(3) } as CSSVarStyle}
      >
        <span className="voice-orb__flow voice-orb__flow--one" />
        <span className="voice-orb__flow voice-orb__flow--two" />
        <span className="voice-orb__flow voice-orb__flow--three" />
        <span className="voice-orb__gloss" />
      </button>
    </div>
  );
}

function VoiceConversation({
  snapshot,
  onEnd,
  onInterrupt,
}: {
  snapshot: VoiceAgentSnapshot;
  onEnd: () => void;
  onInterrupt: () => void;
}) {
  const isListening = snapshot.mode === "listening";
  const isSpeaking = snapshot.mode === "speaking";
  const status = modeLabel(snapshot.mode);

  return (
    <section className="voice-surface flex-1 flex flex-col text-fg-inverse relative overflow-hidden">
      <BackdropAtmosphere />

      <header className="relative z-[2] px-5 sm:px-7 py-5 flex justify-between items-center gap-4">
        <Mark inverse />
        <div className="flex items-center gap-3 sm:gap-3.5">
          <div className="flex items-center gap-2 text-xs text-fg-inverse-muted font-mono tracking-[0.04em]">
            <span className={`voice-timer-dot voice-timer-dot--${snapshot.mode}`} />
            {formatElapsed(snapshot.elapsedSeconds)}
          </div>
          <button
            type="button"
            onClick={onEnd}
            className="inline-flex items-center gap-2 bg-fg-inverse/6 border border-fg-inverse/20 text-fg-inverse cursor-pointer text-[13px] px-3.5 sm:px-4 py-2 rounded-full font-medium transition-colors hover:bg-coral/20 hover:border-coral/50"
          >
            <span className="w-2 h-2 rounded-[2px] bg-coral" />
            end survey
          </button>
        </div>
      </header>

      <div className="relative z-[2] flex-1 flex flex-col items-center justify-center px-7 pb-24 pt-8 text-center">
        <Orb snapshot={snapshot} onInterrupt={onInterrupt} />

        <div
          className="mt-14 inline-flex items-center gap-2.5 px-4 py-2 bg-fg-inverse/6 border border-fg-inverse/15 rounded-full text-xs tracking-[0.14em] uppercase font-semibold text-fg-inverse-subtle"
          aria-live="polite"
        >
          {snapshot.mode === "thinking" ? (
            <ThinkingDots />
          ) : (
            <span className={`voice-status-dot voice-status-dot--${snapshot.mode}`} />
          )}
          {status}
        </div>

        <div className="mt-7 max-w-[640px] min-h-24" aria-live="polite">
          {isSpeaking && (
            <p key={snapshot.caption} className="respondent-caption-in font-display text-[clamp(22px,2.6vw,30px)] leading-[1.32] tracking-normal text-fg-inverse text-pretty">
              {snapshot.caption}
            </p>
          )}
          {isListening && (
            <div className="respondent-caption-in">
              <p className="font-display text-[clamp(22px,2.6vw,30px)] leading-[1.32] tracking-normal text-fg-inverse-subtle">
                {snapshot.caption}
              </p>
              <p className="mt-2.5 text-[13px] text-fg-inverse-muted">pause as much as you want. i&apos;ll wait.</p>
            </div>
          )}
          {snapshot.mode === "thinking" && (
            <p className="respondent-caption-in font-display text-[clamp(22px,2.6vw,30px)] tracking-normal text-fg-inverse-muted">
              {snapshot.caption}
            </p>
          )}
          {snapshot.mode === "error" && (
            <p className="respondent-caption-in text-danger-bg text-sm">{snapshot.error ?? "something went wrong with the voice session."}</p>
          )}
        </div>

        <p className="absolute bottom-8 left-7 right-7 text-[11px] text-fg-inverse-muted tracking-[0.06em]">
          {snapshot.canInterrupt ? "tap the orb to interrupt · " : ""}
          your voice is encrypted · nothing is recorded after you end
        </p>
      </div>
    </section>
  );
}

function Ending({
  onConfirm,
  onCancel,
  submitting,
  error,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  submitting: boolean;
  error: string | null;
}) {
  return (
    <section className="flex-1 flex items-center justify-center px-7 py-10">
      <div className="respondent-slide-up max-w-[520px] text-center">
        <h2 className="font-display text-midnight tracking-normal mb-3.5 text-balance text-4xl leading-[1.15]">
          ready to wrap up?
        </h2>
        <p className="text-[15px] text-fg2 leading-[1.65] max-w-[420px] mx-auto mb-8">
          we&apos;ll send your conversation to the team. you won&apos;t be able to add more after this.
        </p>
        {error && <p className="text-sm text-danger mb-5">{error}</p>}
        <div className="flex gap-2.5 justify-center flex-wrap">
          <Button variant="outline" onClick={onCancel} disabled={submitting} className="rounded-full px-[25px] py-[13px] text-[15px]">
            not yet - keep talking
          </Button>
          <Button variant="midnight" onClick={onConfirm} disabled={submitting} className="rounded-full px-[26px] py-[14px] text-[15px]">
            {submitting ? "submitting..." : "yes, i'm done"} <Icon name="check" size={14} stroke={2.5} />
          </Button>
        </div>
      </div>
    </section>
  );
}

function Thanks({ onRestart }: { onRestart: () => void }) {
  return (
    <section className="flex-1 flex items-center justify-center px-7 py-10">
      <div className="respondent-slide-up max-w-[620px] text-center">
        <div className="w-[88px] h-[88px] rounded-full flex items-center justify-center mx-auto mb-7 text-forest bg-success-bg">
          <Icon name="check" size={40} stroke={2.5} />
        </div>

        <h1 className="font-display text-midnight tracking-normal mb-4 text-balance text-[clamp(36px,5vw,52px)] leading-[1.1]">
          thank you for your voice.
        </h1>

        <p className="text-[16px] text-fg2 leading-[1.7] max-w-[500px] mx-auto mb-8">
          the team has your conversation. they read every response - a real person, not a dashboard. it makes a difference.
          really.
        </p>

        <div className="bg-white border border-midnight/10 rounded-2xl p-[22px] text-left max-w-[440px] mx-auto mb-7">
          <div className="text-[11px] tracking-[0.1em] uppercase text-fg3 font-semibold mb-2.5">WHAT HAPPENS NEXT</div>
          <div className="flex flex-col gap-2.5">
            {[
              "your audio is encrypted and sent to the team.",
              "koel transcribes and organizes it alongside other voices.",
              "you'll get a copy of the transcript by email if you want one.",
            ].map((item, index) => (
              <div key={item} className="flex gap-2.5 text-sm text-midnight leading-[1.5]">
                <span className="font-display text-mango shrink-0">{String(index + 1).padStart(2, "0")}</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2.5 justify-center flex-wrap">
          <Button variant="outline" className="rounded-full px-[25px] py-[13px] text-[15px]">
            email me a transcript
          </Button>
          <Button variant="ghost" onClick={onRestart} className="rounded-full px-5 py-[13px] text-[15px]">
            start over (demo)
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function RespondentSurveyClient({ survey, slug }: { survey: Survey; slug: string }) {
  const [stage, setStage] = useState<Stage>("landing");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const agent = useMemo(
    () =>
      isMockMode()
        ? createMockVoiceAgent()
        : createElevenLabsVoiceAgent(() => startVoiceSession(slug)),
    [slug],
  );
  const snapshot = useSyncExternalStore(agent.subscribe, agent.getSnapshot, agent.getSnapshot);

  useEffect(() => {
    return () => agent.dispose();
  }, [agent]);

  async function startConversation() {
    setSubmitError(null);
    try {
      await agent.start();
      setStage("chatting");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Could not start the voice session.");
    }
  }

  function requestEnd() {
    setStage("ending");
  }

  function cancelEnd() {
    setStage("chatting");
  }

  async function confirmEnd() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await agent.end();
      await submitResponse(slug, {
        conversation_id: snapshot.conversationId ?? `manual-${Date.now()}`,
        is_anonymous: true,
      });
      setStage("thanks");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Could not submit your response.");
    } finally {
      setSubmitting(false);
    }
  }

  function restart() {
    agent.end();
    setStage("landing");
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col font-body">
      {stage !== "chatting" && (
        <Header
          right={
            <span>
              hosted by <strong className="text-midnight font-semibold">roshi research</strong>
            </span>
          }
        />
      )}

      <main className="flex-1 flex flex-col">
        {stage === "landing" && <Landing survey={survey} onStart={() => setStage("permission")} />}
        {stage === "permission" && (
          <>
            {submitError && (
              <div className="px-7 pt-4 text-center text-sm text-danger">{submitError}</div>
            )}
            <Permission onAllow={startConversation} onBack={() => setStage("landing")} />
          </>
        )}
        {stage === "chatting" && <VoiceConversation snapshot={snapshot} onEnd={requestEnd} onInterrupt={agent.interrupt} />}
        {stage === "ending" && (
          <Ending
            onConfirm={confirmEnd}
            onCancel={cancelEnd}
            submitting={submitting}
            error={submitError}
          />
        )}
        {stage === "thanks" && <Thanks onRestart={restart} />}
      </main>

      {stage !== "chatting" && <RespFooter />}
    </div>
  );
}
