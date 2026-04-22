"use client";

import React, { useEffect, useState } from "react";

interface MeteorConfig {
  top: number;
  left: number;
  delay: string;
  duration: string;
}

export function Meteors({ number = 20 }: { number?: number }) {
  const [meteors, setMeteors] = useState<MeteorConfig[]>([]);

  useEffect(() => {
    // Random layout must run after mount so SSR HTML matches hydration (empty → filled on client).
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- client-only meteor positions */
    setMeteors(
      Array.from({ length: number }, () => ({
        top: Math.floor(Math.random() * 100),
        left: Math.floor(Math.random() * (400 - -400) + -400),
        delay: (Math.random() * 4).toFixed(2) + "s",
        duration: (Math.random() * 6 + 4).toFixed(2) + "s",
      }))
    );
  }, [number]);

  return (
    <>
      {meteors.map((m, i) => (
        <span
          key={i}
          className="animate-meteor"
          style={{
            position: "absolute",
            top: m.top + "%",
            left: m.left + "px",
            width: 2,
            height: 2,
            borderRadius: 9999,
            background: "rgba(232,176,75,0.55)",
            boxShadow: "0 0 0 1px rgba(232,176,75,0.06)",
            transform: "rotate(215deg)",
            animationDuration: m.duration,
            animationDelay: m.delay,
            zIndex: 1,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "50%",
              right: 0,
              transform: "translateY(-50%)",
              width: 70,
              height: 1,
              background: "linear-gradient(to left, transparent, rgba(232,176,75,0.45))",
              borderRadius: 9999,
            }}
          />
        </span>
      ))}
    </>
  );
}
