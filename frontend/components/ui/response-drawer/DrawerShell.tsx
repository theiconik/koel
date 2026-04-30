"use client";

import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import Icon from "../Icon";

interface DrawerShellProps {
  children: ReactNode;
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

export function DrawerShell({ children, onClose }: DrawerShellProps) {
  const drawerRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    closeButtonRef.current?.focus({ preventScroll: true });
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

  function handleKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }

    if (event.key !== "Tab" || !drawerRef.current) return;

    const focusable = getFocusableElements(drawerRef.current);
    if (focusable.length === 0) {
      event.preventDefault();
      drawerRef.current.focus();
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
    <>
      <button
        aria-label="Close response details"
        onClick={onClose}
        tabIndex={-1}
        className="fixed inset-0 z-40 cursor-default"
        style={{ background: "rgba(26,26,46,0.24)", animation: "fadeIn 160ms" }}
      />

      <aside
        ref={drawerRef}
        aria-label="Response details"
        aria-modal="true"
        role="dialog"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="fixed bottom-0 right-0 top-0 z-50 flex flex-col overflow-hidden"
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
              type="button"
              disabled
              aria-disabled="true"
              title="Transcript download is not available yet"
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
                cursor: "not-allowed",
                fontFamily: "var(--font-body)",
                opacity: 0.45,
              }}
            >
              <Icon name="download" size={18} />
              transcript
            </button>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-stone-100"
              style={{ color: "var(--color-fg2)", border: "none", background: "transparent", cursor: "pointer" }}
            >
              <Icon name="x" size={24} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-9 sm:px-6">{children}</div>
      </aside>
    </>
  );
}
