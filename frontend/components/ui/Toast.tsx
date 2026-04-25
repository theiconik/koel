"use client";
import { useEffect } from "react";
import Icon from "./Icon";

interface ToastProps {
  text: string;
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({ text, onDismiss, duration = 2000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [onDismiss, duration]);

  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium shadow-xl"
      style={{
        background: "var(--color-midnight)",
        color: "var(--color-fg-inverse)",
        fontFamily: "var(--font-body)",
        animation: "toastIn 200ms cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <span style={{ color: "var(--color-success)" }}>
        <Icon name="check" size={16} stroke={2.5} />
      </span>
      {text}
    </div>
  );
}
