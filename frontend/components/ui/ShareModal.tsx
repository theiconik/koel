"use client";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import Icon from "./Icon";
import { logger } from "@/lib/observability/logger";

interface ShareModalProps {
  url: string;
  onClose: () => void;
}

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusableElements(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true",
  );
}

export default function ShareModal({ url, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus({ preventScroll: true });

    return () => {
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    function handleDocumentKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    document.addEventListener("keydown", handleDocumentKeyDown);
    return () => document.removeEventListener("keydown", handleDocumentKeyDown);
  }, [onClose]);

  async function copy() {
    setCopyError(null);
    setCopied(false);
    if (!navigator.clipboard?.writeText) {
      const error = new Error("Clipboard API is not available.");
      logger.error("share_modal_copy_failed", { error, url });
      setCopyError("Could not copy link. Select and copy it manually.");
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Clipboard write failed.");
      logger.error("share_modal_copy_failed", { error: err, url });
      setCopyError("Could not copy link. Select and copy it manually.");
    }
  }

  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    "we're listening to real voices with koel — take 3 minutes:"
  )}&url=${encodeURIComponent(url)}`;

  const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }

    if (event.key !== "Tab" || !modalRef.current) return;

    const focusable = getFocusableElements(modalRef.current);
    if (focusable.length === 0) {
      event.preventDefault();
      modalRef.current.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey && activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(26,26,46,0.48)", animation: "fadeIn 160ms" }}
    >
      <button
        type="button"
        aria-label="Close share modal"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{ background: "transparent", border: "none" }}
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-[480px] rounded-[20px] p-7 shadow-2xl"
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
              id="share-modal-title"
              className="text-[26px] leading-[1.15] tracking-[-0.015em]"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-midnight)" }}
            >
              send it to the people whose voice you want.
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
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
            type="button"
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
        {copyError && (
          <p role="alert" className="mt-2 text-sm" style={{ color: "var(--color-danger-zone)" }}>
            {copyError}
          </p>
        )}

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
