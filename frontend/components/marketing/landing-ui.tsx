import { useRef, type CSSProperties } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { tapSpring, TESTIMONIAL_PHRASES } from "@/components/marketing/landing-constants";

export function KoelWordmark({
  size = 22,
  color = "var(--color-midnight)",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <span
      style={{
        fontFamily: "var(--font-display)",
        fontSize: size,
        letterSpacing: "-0.02em",
        color,
        textTransform: "lowercase",
        fontWeight: 400,
      }}
    >
      koel
    </span>
  );
}

export function Eyebrow({ children, color = "var(--color-fg3)" }: { children: string; color?: string }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-body)",
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color,
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function ScrollPhrase({
  phrase,
  index,
  total,
  progress,
}: {
  phrase: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const n = total;
  /** Pack reveals into the first ~2/3 of progress so the last clause finishes while the quote is still on screen. */
  const spread = n <= 1 ? 0 : 0.66;
  const start = n <= 1 ? 0 : (index / (n - 1)) * spread;
  const fadeLen = 0.15;
  const fadeEnd = Math.min(start + fadeLen, 0.92);
  const opacity = useTransform(progress, [start, fadeEnd], [0, 1], { clamp: true });
  const y = useTransform(progress, [start, fadeEnd], [12, 0], { clamp: true });
  return (
    <motion.span style={{ display: "inline", opacity, y }}>
      {phrase}
    </motion.span>
  );
}

function TestimonialAttribution() {
  return (
    <>
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--color-stone-200)" }} />
      <div>
        <div style={{ color: "var(--color-fg-inverse)", fontWeight: 600, fontSize: 15 }}>priya menon</div>
        <div style={{ color: "rgba(250,247,242,0.55)", fontSize: 13 }}>head of research · roshi</div>
      </div>
    </>
  );
}

export function TestimonialScrollQuote({ prefersReduced }: { prefersReduced: boolean }) {
  const quoteRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: quoteRef,
    offset: ["start 0.82", "end 0.52"],
  });

  /** Ignore the extreme ends of the quote's scroll span so the first clause waits until the block is in view and the last finishes before scrolling deep into the next section. */
  const phraseProgress = useTransform(scrollYProgress, [0.08, 0.82], [0, 1], { clamp: true });

  const attribOpacity = useTransform(scrollYProgress, [0.58, 0.9], [0, 1], { clamp: true });
  const attribY = useTransform(scrollYProgress, [0.58, 0.9], [14, 0], { clamp: true });

  const quoteStyle: CSSProperties = {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(32px,3.6vw,48px)",
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
    color: "var(--color-fg-inverse)",
    marginTop: 20,
    textWrap: "pretty",
  };

  if (prefersReduced) {
    return (
      <>
        <div ref={quoteRef} style={quoteStyle}>
          {TESTIMONIAL_PHRASES.join("")}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 40 }}>
          <TestimonialAttribution />
        </div>
      </>
    );
  }

  return (
    <>
      <div ref={quoteRef} style={quoteStyle}>
        {TESTIMONIAL_PHRASES.map((phrase, i) => (
          <ScrollPhrase
            key={i}
            phrase={phrase}
            index={i}
            total={TESTIMONIAL_PHRASES.length}
            progress={phraseProgress}
          />
        ))}
      </div>
      <motion.div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginTop: 40,
          opacity: attribOpacity,
          y: attribY,
        }}
      >
        <TestimonialAttribution />
      </motion.div>
    </>
  );
}

type NavScrollLinkProps = {
  sectionId: string;
  label: string;
  prefersReduced: boolean;
};

export function NavScrollLink({ sectionId, label, prefersReduced }: NavScrollLinkProps) {
  return (
    <motion.button
      type="button"
      onClick={() => scrollToId(sectionId)}
      style={{ color: "inherit", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
      whileHover={prefersReduced ? undefined : { opacity: 0.75, y: -1 }}
      whileTap={prefersReduced ? undefined : { scale: 0.98 }}
      transition={tapSpring}
    >
      {label}
    </motion.button>
  );
}
