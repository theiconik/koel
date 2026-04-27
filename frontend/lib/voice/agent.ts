import { Conversation, type Conversation as ElevenLabsConversation } from "@elevenlabs/react";
import type { VoiceAgentMode, VoiceAgentSession, VoiceAgentSnapshot, VoiceSessionStart } from "@/lib/types";

const SCRIPT = [
  "hi - i'm koel. before we get into it, tell me a bit about yourself. what do you do, and how'd you end up trying roshi?",
  "that makes sense. when you say it felt softer than what you'd tried - what were the sharp edges with the old way?",
  "and now that you've run a few surveys with koel - have the answers been different? any moment you remember?",
  "if a friend running a similar team asked you, should i try this - what would you actually say to them?",
  "thank you - really. that's everything i wanted to ask. whenever you're ready, you can end the survey by tapping the button at the top.",
];

const LISTENING_CAPTION = "go ahead - i'm listening.";
const THINKING_CAPTION = "hmm - let me think for a second.";
const ENDED_CAPTION = "conversation ended.";

export const initialVoiceAgentSnapshot: VoiceAgentSnapshot = {
  mode: "speaking",
  caption: SCRIPT[0],
  level: 0.3,
  elapsedSeconds: 0,
  canInterrupt: true,
};

function clampLevel(level: number) {
  return Math.max(0.05, Math.min(1, level));
}

function levelForMode(mode: VoiceAgentMode, tick: number) {
  if (mode === "speaking") {
    return clampLevel(0.55 + 0.3 * (Math.sin(tick * 0.22) * 0.5 + 0.5) + (Math.random() - 0.5) * 0.08);
  }
  if (mode === "listening") {
    return clampLevel(0.35 + Math.random() * 0.55);
  }
  if (mode === "thinking") {
    return clampLevel(0.18 + 0.12 * (Math.sin(tick * 0.12) * 0.5 + 0.5));
  }
  return 0.08;
}

export function createMockVoiceAgent(): VoiceAgentSession {
  let snapshot: VoiceAgentSnapshot = initialVoiceAgentSnapshot;
  let turn = 0;
  let tick = 0;
  let started = false;
  let elapsedTimer: ReturnType<typeof setInterval> | undefined;
  let levelTimer: ReturnType<typeof setInterval> | undefined;
  let turnTimer: ReturnType<typeof setTimeout> | undefined;
  const listeners = new Set<() => void>();

  function notify() {
    listeners.forEach((listener) => listener());
  }

  function clearTurnTimer() {
    if (turnTimer) {
      clearTimeout(turnTimer);
      turnTimer = undefined;
    }
  }

  function patch(next: Partial<VoiceAgentSnapshot>) {
    snapshot = { ...snapshot, ...next };
    notify();
  }

  function setMode(mode: VoiceAgentMode) {
    const caption =
      mode === "speaking" ? SCRIPT[turn] :
      mode === "listening" ? LISTENING_CAPTION :
      mode === "thinking" ? THINKING_CAPTION :
      mode === "ended" ? ENDED_CAPTION :
      snapshot.caption;

    patch({
      mode,
      caption,
      canInterrupt: mode === "speaking" && turn < SCRIPT.length - 1,
    });

    scheduleTurn();
  }

  function scheduleTurn() {
    clearTurnTimer();

    if (snapshot.mode === "speaking") {
      const isLastTurn = turn >= SCRIPT.length - 1;
      if (isLastTurn) return;

      const duration = 2200 + SCRIPT[turn].length * 28;
      turnTimer = setTimeout(() => setMode("listening"), duration);
      return;
    }

    if (snapshot.mode === "listening") {
      turnTimer = setTimeout(() => setMode("thinking"), 6500);
      return;
    }

    if (snapshot.mode === "thinking") {
      turnTimer = setTimeout(() => {
        turn += 1;
        setMode("speaking");
      }, 1600);
    }
  }

  function clearRuntimeTimers() {
    clearTurnTimer();
    if (elapsedTimer) {
      clearInterval(elapsedTimer);
      elapsedTimer = undefined;
    }
    if (levelTimer) {
      clearInterval(levelTimer);
      levelTimer = undefined;
    }
  }

  function start() {
    clearRuntimeTimers();
    turn = 0;
    tick = 0;
    started = true;
    snapshot = { ...initialVoiceAgentSnapshot, conversationId: `mock-${Date.now()}` };
    notify();

    elapsedTimer = setInterval(() => {
      patch({ elapsedSeconds: snapshot.elapsedSeconds + 1 });
    }, 1000);

    levelTimer = setInterval(() => {
      tick += 1;
      patch({ level: levelForMode(snapshot.mode, tick) });
    }, 120);

    scheduleTurn();
  }

  function interrupt() {
    if (!started || snapshot.mode !== "speaking" || !snapshot.canInterrupt) return;
    setMode("listening");
  }

  function end() {
    clearRuntimeTimers();
    started = false;
    patch({
      mode: "ended",
      caption: ENDED_CAPTION,
      level: 0.08,
      canInterrupt: false,
    });
  }

  function dispose() {
    clearRuntimeTimers();
    listeners.clear();
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    start,
    interrupt,
    end,
    dispose,
  };
}

export function createElevenLabsVoiceAgent(
  getSession: () => Promise<VoiceSessionStart>,
): VoiceAgentSession {
  let snapshot: VoiceAgentSnapshot = {
    ...initialVoiceAgentSnapshot,
    mode: "thinking",
    caption: "connecting to koel...",
    canInterrupt: false,
  };
  let conversation: ElevenLabsConversation | null = null;
  let elapsedTimer: ReturnType<typeof setInterval> | undefined;
  let levelTimer: ReturnType<typeof setInterval> | undefined;
  const listeners = new Set<() => void>();

  function notify() {
    listeners.forEach((listener) => listener());
  }

  function patch(next: Partial<VoiceAgentSnapshot>) {
    snapshot = { ...snapshot, ...next };
    notify();
  }

  function clearTimers() {
    if (elapsedTimer) {
      clearInterval(elapsedTimer);
      elapsedTimer = undefined;
    }
    if (levelTimer) {
      clearInterval(levelTimer);
      levelTimer = undefined;
    }
  }

  function startTimers() {
    clearTimers();
    elapsedTimer = setInterval(() => {
      patch({ elapsedSeconds: snapshot.elapsedSeconds + 1 });
    }, 1000);
    levelTimer = setInterval(() => {
      const level =
        snapshot.mode === "speaking"
          ? conversation?.getOutputVolume?.() ?? 0.5
          : snapshot.mode === "listening"
            ? conversation?.getInputVolume?.() ?? 0.35
            : 0.18;
      patch({ level: clampLevel(level) });
    }, 120);
  }

  async function start() {
    clearTimers();
    patch({
      mode: "thinking",
      caption: "connecting to koel...",
      level: 0.14,
      elapsedSeconds: 0,
      canInterrupt: false,
      error: undefined,
    });

    const session = await getSession();
    if (session.status !== "ready" || !session.signedUrl) {
      const error = "Voice session provider is not configured yet.";
      patch({ mode: "error", caption: "connection issue", error });
      throw new Error(error);
    }

    conversation = await Conversation.startSession({
      signedUrl: session.signedUrl,
      connectionType: "websocket",
      dynamicVariables: session.dynamicVariables ?? {},
      onConnect: ({ conversationId }) => {
        patch({ conversationId, caption: "connected. koel will begin shortly." });
        startTimers();
      },
      onModeChange: ({ mode }) => {
        patch({
          mode,
          caption: mode === "speaking" ? "koel is speaking." : LISTENING_CAPTION,
          canInterrupt: mode === "speaking",
        });
      },
      onMessage: ({ message, role }) => {
        if (!message.trim()) return;
        patch({
          caption: message,
          mode: role === "agent" ? "speaking" : "listening",
          canInterrupt: role === "agent",
        });
      },
      onError: (message) => {
        patch({ mode: "error", caption: "connection issue", error: message });
      },
      onDisconnect: () => {
        clearTimers();
        patch({
          mode: "ended",
          caption: ENDED_CAPTION,
          level: 0.08,
          canInterrupt: false,
        });
      },
    });
  }

  function interrupt() {
    if (!conversation || snapshot.mode !== "speaking") return;
    conversation.sendUserActivity();
  }

  async function end() {
    clearTimers();
    if (conversation?.isOpen()) {
      await conversation.endSession();
    }
    patch({
      mode: "ended",
      caption: ENDED_CAPTION,
      level: 0.08,
      canInterrupt: false,
    });
  }

  function dispose() {
    clearTimers();
    if (conversation?.isOpen()) {
      void conversation.endSession();
    }
    listeners.clear();
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    start,
    interrupt,
    end,
    dispose,
  };
}
