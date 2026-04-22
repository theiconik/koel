"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

type PointerHighlightProps = {
  children: ReactNode;
  borderColor?: string;
  className?: string;
};

/** Shared with rect, cursor, and text blur so they stay in sync. */
const HL_DURATION = "1.2s";
const HL_DELAY = "0.22s";
const HL_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export function PointerHighlight({
  children,
  borderColor = "var(--color-mango)",
  className = "",
}: PointerHighlightProps) {
  const prefersReducedMotion = useReducedMotion() === true;

  const drawAnimation = prefersReducedMotion
    ? undefined
    : `koel-hl-rect ${HL_DURATION} ${HL_EASE} ${HL_DELAY} both`;

  const cursorAnimation = prefersReducedMotion
    ? undefined
    : `koel-hl-cursor ${HL_DURATION} ${HL_EASE} ${HL_DELAY} both`;

  const textAnimation = prefersReducedMotion
    ? undefined
    : `koel-hl-text ${HL_DURATION} ${HL_EASE} ${HL_DELAY} both`;

  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        position: "relative",
        padding: "0 0.06em",
        margin: 0,
        transform: "translateZ(0)",
      }}
    >
      {/* Rectangle – grows from top-left origin like a drag-select */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "-0.06em -0.1em",
          border: `2px solid ${borderColor}`,
          borderRadius: 10,
          pointerEvents: "none",
          transformOrigin: "top left",
          animation: drawAnimation,
          filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.07))",
          ...(prefersReducedMotion ? { opacity: 1, transform: "scale(1, 1)" } : {}),
        }}
      />
      <span
        style={{
          position: "relative",
          animation: textAnimation,
          ...(prefersReducedMotion ? { opacity: 1, filter: "none" } : {}),
        }}
      >
        {children}
      </span>

      {/* Cursor – travels from top-left to bottom-right, matching the rectangle growth */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          right: "-0.7em",
          bottom: "-0.55em",
          width: 22,
          height: 22,
          pointerEvents: "none",
          animation: cursorAnimation,
          filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.2))",
          ...(prefersReducedMotion ? { opacity: 0 } : {}),
        }}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
          <path
            d="M4 3.5L20.2 12.1c.5.26.47.98-.05 1.2l-6.5 2.82-2.83 6.5c-.22.52-.94.55-1.2.05L4 3.5Z"
            fill="white"
          />
          <path
            d="M4 3.5L20.2 12.1c.5.26.47.98-.05 1.2l-6.5 2.82-2.83 6.5c-.22.52-.94.55-1.2.05L4 3.5Z"
            stroke="rgba(0,0,0,0.85)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <style jsx>{`
        @keyframes koel-hl-rect {
          0% {
            transform: scale(0, 0);
            opacity: 0;
          }
          28% {
            opacity: 1;
          }
          100% {
            transform: scale(1, 1);
            opacity: 1;
          }
        }

        @keyframes koel-hl-cursor {
          0% {
            left: -0.4em;
            top: -0.3em;
            right: auto;
            bottom: auto;
            opacity: 1;
          }
          100% {
            left: calc(100% - 0.1em);
            top: calc(100% - 0.15em);
            right: auto;
            bottom: auto;
            opacity: 1;
          }
        }

        @keyframes koel-hl-text {
          0% {
            opacity: 0;
            filter: blur(14px);
          }
          22% {
            opacity: 0.2;
            filter: blur(11px);
          }
          45% {
            opacity: 0.55;
            filter: blur(6px);
          }
          72% {
            opacity: 0.92;
            filter: blur(2px);
          }
          100% {
            opacity: 1;
            filter: blur(0);
          }
        }
      `}</style>
    </span>
  );
}
