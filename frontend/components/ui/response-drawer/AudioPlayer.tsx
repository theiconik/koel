"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import Icon from "../Icon";

interface AudioPlayerProps {
  audioUrl?: string | null;
  duration: string;
  durationSeconds: number;
  getAuthToken?: () => Promise<string | null>;
}

const BAR_COUNT = 82;
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function resolveAudioUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiBaseUrl}${path}`;
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function AudioPlayer({ audioUrl, duration, durationSeconds, getAuthToken }: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [audioState, setAudioState] = useState<"idle" | "loading" | "ready" | "error">(audioUrl ? "idle" : "error");
  const [audioError, setAudioError] = useState<string | null>(
    audioUrl ? null : "Audio recording is not available for this response.",
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioObjectUrlRef = useRef<string | null>(null);
  const progress = durationSeconds > 0 ? Math.min(pos / durationSeconds, 1) : 0;

  useEffect(() => {
    return () => {
      if (audioObjectUrlRef.current) {
        URL.revokeObjectURL(audioObjectUrlRef.current);
        audioObjectUrlRef.current = null;
      }
    };
  }, []);

  async function ensureAudioLoaded() {
    if (!audioUrl) {
      throw new Error("Audio recording is not available for this response.");
    }
    if (audioRef.current?.src) return audioRef.current;

    const token = getAuthToken ? await getAuthToken() : null;
    const headers = new Headers({ Accept: "audio/*" });
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const res = await fetch(resolveAudioUrl(audioUrl), {
      headers,
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(res.status === 404 ? "Audio recording was not found." : "Audio recording could not be loaded.");
    }

    const audio = audioRef.current;
    if (!audio) throw new Error("Audio player is not ready.");

    const objectUrl = URL.createObjectURL(await res.blob());
    if (audioObjectUrlRef.current) URL.revokeObjectURL(audioObjectUrlRef.current);
    audioObjectUrlRef.current = objectUrl;
    audio.src = objectUrl;
    audio.load();
    return audio;
  }

  async function togglePlayback() {
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }

    setAudioError(null);
    try {
      setAudioState((state) => (state === "ready" ? "ready" : "loading"));
      const audio = await ensureAudioLoaded();
      await audio.play();
      setAudioState("ready");
      setPlaying(true);
    } catch (error) {
      setPlaying(false);
      setAudioState("error");
      setAudioError(error instanceof Error ? error.message : "Audio recording could not be played.");
    }
  }

  function setPlaybackPosition(nextPos: number) {
    const boundedPos = Math.min(Math.max(nextPos, 0), durationSeconds);
    if (audioRef.current?.src) audioRef.current.currentTime = boundedPos;
    setPos(boundedPos);
  }

  function seek(event: MouseEvent<HTMLDivElement>) {
    if (durationSeconds <= 0) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    setPlaybackPosition(Math.round(ratio * durationSeconds));
  }

  function handleSeekKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (durationSeconds <= 0) return;

    const step = Math.max(1, Math.round(durationSeconds / 20));
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      setPlaybackPosition(pos - step);
    } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      setPlaybackPosition(pos + step);
    } else if (event.key === "Home") {
      event.preventDefault();
      setPlaybackPosition(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setPlaybackPosition(durationSeconds);
    }
  }

  return (
    <>
      <section
        className="mt-7 flex h-[105px] items-center rounded-2xl px-5"
        style={{ background: "var(--color-midnight)", color: "var(--color-fg-inverse)" }}
      >
        <audio
          ref={audioRef}
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false);
            setPos(durationSeconds);
          }}
          onTimeUpdate={(event) => setPos(Math.floor(event.currentTarget.currentTime))}
          onLoadedMetadata={(event) => {
            if (durationSeconds === 0) setPos(Math.floor(event.currentTarget.currentTime));
          }}
        />
        <button
          onClick={togglePlayback}
          disabled={!audioUrl || audioState === "loading"}
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full transition-transform active:scale-[0.98]"
          style={{
            background: "var(--color-mango)",
            border: "none",
            color: "var(--color-midnight)",
            cursor: !audioUrl || audioState === "loading" ? "not-allowed" : "pointer",
            opacity: !audioUrl ? 0.55 : 1,
          }}
          aria-label={audioState === "loading" ? "Loading response audio" : playing ? "Pause response audio" : "Play response audio"}
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
          aria-label="Audio playback position"
          aria-valuemax={durationSeconds}
          aria-valuemin={0}
          aria-valuenow={pos}
          onClick={seek}
          onKeyDown={handleSeekKeyDown}
          role="slider"
          tabIndex={durationSeconds > 0 ? 0 : -1}
          className="flex h-[46px] flex-1 cursor-pointer items-center gap-[4px] overflow-hidden focus:outline-none focus:ring-2 focus:ring-[var(--color-mango)] focus:ring-offset-2 focus:ring-offset-[var(--color-midnight)]"
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
          {duration.replace("m ", "m  ")}
        </div>
      </section>
      {audioError && (
        <p className="mt-2 text-[13px]" style={{ color: "var(--color-fg3)" }}>
          {audioError}
        </p>
      )}
    </>
  );
}
