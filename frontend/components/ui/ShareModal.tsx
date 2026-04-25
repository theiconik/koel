"use client";
import { useState } from "react";
import Icon from "./Icon";

interface ShareModalProps {
  url: string;
  onClose: () => void;
}

export default function ShareModal({ url, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    "we're listening to real voices with koel — take 3 minutes:"
  )}&url=${encodeURIComponent(url)}`;

  const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(26,26,46,0.48)", animation: "fadeIn 160ms" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] rounded-[20px] p-7 shadow-2xl"
        style={{
          background: "var(--color-cream)",
          animation: "modalIn 200ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-1.5">
          <div>
            <div
              className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-2"
              style={{ color: "var(--color-fg3)" }}
            >
              SHARE SURVEY
            </div>
            <div
              className="text-[26px] leading-[1.15] tracking-[-0.015em]"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-midnight)" }}
            >
              send it to the people whose voice you want.
            </div>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 p-1 rounded-md transition-colors hover:bg-stone-100"
            style={{ background: "none", border: "none", color: "var(--color-fg3)", cursor: "pointer" }}
            aria-label="Close"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* URL row */}
        <div
          className="flex items-center gap-2 mt-5 rounded-xl px-3.5 py-2.5 border"
          style={{
            background: "var(--color-bg-raised)",
            borderColor: "var(--color-border-medium)",
          }}
        >
          <span style={{ color: "var(--color-fg3)" }}>
            <Icon name="link" size={16} />
          </span>
          <div
            className="flex-1 min-w-0 text-[13px] truncate"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-midnight)" }}
          >
            {url}
          </div>
          <button
            onClick={copy}
            className="shrink-0 px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-colors"
            style={{
              background: copied ? "var(--color-success)" : "var(--color-midnight)",
              color: "var(--color-fg-inverse)",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
            }}
          >
            {copied ? "copied" : "copy"}
          </button>
        </div>

        {/* Social platforms */}
        <div
          className="text-[11px] font-semibold tracking-[0.1em] uppercase mt-6 mb-2.5"
          style={{ color: "var(--color-fg3)" }}
        >
          OR POST TO
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <a
            href={xUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all group"
            style={{ borderColor: "var(--color-border-medium)", background: "var(--color-bg-raised)", textDecoration: "none", color: "var(--color-midnight)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[15px] font-bold"
              style={{ background: "var(--color-midnight)", color: "var(--color-fg-inverse)", fontFamily: "var(--font-display)" }}
            >
              X
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ fontFamily: "var(--font-body)" }}>X</div>
              <div className="text-xs" style={{ color: "var(--color-fg3)" }}>post with a preview</div>
            </div>
          </a>
          <a
            href={liUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all"
            style={{ borderColor: "var(--color-border-medium)", background: "var(--color-bg-raised)", textDecoration: "none", color: "var(--color-midnight)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[13px] font-bold"
              style={{ background: "#0A66C2", color: "#fff" }}
            >
              in
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ fontFamily: "var(--font-body)" }}>LinkedIn</div>
              <div className="text-xs" style={{ color: "var(--color-fg3)" }}>share to your network</div>
            </div>
          </a>
        </div>

        <p className="text-xs mt-5 leading-relaxed" style={{ color: "var(--color-fg3)" }}>
          respondents won&apos;t see an X or LinkedIn brand on the survey itself — only koel. they tap and speak.
        </p>
      </div>
    </div>
  );
}
