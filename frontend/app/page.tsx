"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PointerHighlight } from "@/components/ui/pointer-highlight";
import { Meteors } from "@/components/ui/meteors";
import {
  FOOTER_LINK_COLUMNS,
  HOW_IT_WORKS_STEPS,
  PRICING_PLANS,
  smoothEase,
  TRUSTED_BY_LOGOS,
  WAVEFORM_LEVELS,
} from "@/components/marketing/landing-constants";
import {
  Eyebrow,
  KoelWordmark,
  NavScrollLink,
  scrollToId,
  TestimonialScrollQuote,
} from "@/components/marketing/landing-ui";
import { useAuthPathNavigation } from "@/hooks/useAuthPathNavigation";
import { useLandingSectionInView } from "@/hooks/useLandingSectionInView";
import { useMarketingPageMotion } from "@/hooks/useMarketingPageMotion";

export default function MarketingHomePage() {
  const prefersReduced = useReducedMotion() === true;
  const navigateIfAuthed = useAuthPathNavigation();

  const {
    sampleRef,
    sampleInView,
    productRef,
    productInView,
    testimonialRef,
    testimonialInView,
    pricingRef,
    pricingInView,
    footerRef,
    footerInView,
  } = useLandingSectionInView();

  const {
    navContainerVariants,
    navItemVariants,
    heroStaggerVariants,
    heroItemVariants,
    heroCardVariants,
    gridContainerVariants,
    gridItemVariants,
    revealHidden,
    revealVisible,
    revealTransition,
    buttonHoverTap,
    tapSpring,
  } = useMarketingPageMotion(prefersReduced);

  const appHomeUrl = useMemo(() => "/home", []);
  const newSurveyUrl = useMemo(() => "/surveys/new", []);

  const handleStartListening = () => navigateIfAuthed(appHomeUrl);
  const handleStartSurvey = () => navigateIfAuthed(newSurveyUrl);

  return (
    <div style={{ background: "var(--color-cream)" }}>
      <motion.nav
        className="sticky top-0 z-10"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 48px",
          background: "rgba(250,247,242,0.82)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderBottom: "1px solid var(--color-border-soft)",
        }}
        variants={navContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <motion.div style={{ display: "flex", alignItems: "center", gap: 8 }} variants={navItemVariants}>
            <img src="/koel-logo.svg" alt="" style={{ height: 28, width: "auto", display: "block" }} />
            <KoelWordmark size={28} />
          </motion.div>
          <motion.div
            variants={navItemVariants}
            style={{ display: "flex", gap: 24, fontSize: 14, color: "var(--color-fg2)" }}
          >
            <NavScrollLink sectionId="product" label="product" prefersReduced={prefersReduced} />
            <NavScrollLink sectionId="pricing" label="pricing" prefersReduced={prefersReduced} />
            <NavScrollLink sectionId="about" label="about" prefersReduced={prefersReduced} />
          </motion.div>
        </div>
        <motion.div style={{ display: "flex", gap: 8, alignItems: "center" }} variants={navItemVariants}>
          <motion.button
            type="button"
            onClick={handleStartListening}
            className="rounded-[10px] px-5 py-3 text-[15px] font-semibold"
            style={{
              fontFamily: "var(--font-body)",
              lineHeight: 1,
              background: "var(--color-midnight)",
              color: "var(--color-fg-inverse)",
              border: "none",
              cursor: "pointer",
              transition: "filter 180ms var(--ease-out)",
            }}
            {...buttonHoverTap}
          >
            start listening
          </motion.button>
        </motion.div>
      </motion.nav>

      <main>
        <section style={{ padding: "96px 48px 120px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 64, alignItems: "center" }}>
            <motion.div variants={heroStaggerVariants} initial="hidden" animate="visible">
              <motion.h1
                variants={heroItemVariants}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(44px,5.4vw,76px)",
                  lineHeight: 1.04,
                  letterSpacing: "-0.02em",
                  color: "var(--color-midnight)",
                  marginTop: 0,
                  marginBottom: 0,
                }}
              >
                listen to what people
                <br />
                <PointerHighlight>
                  <span>actually mean.</span>
                </PointerHighlight>
              </motion.h1>
              <motion.p
                variants={heroItemVariants}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 20,
                  lineHeight: 1.65,
                  color: "var(--color-fg2)",
                  marginTop: 20,
                  maxWidth: 520,
                }}
              >
                koel turns your survey into a two-minute conversation. respondents speak, we transcribe the pauses and
                the afterthoughts — you get the answer behind the answer.
              </motion.p>
              <motion.div
                variants={heroItemVariants}
                style={{ display: "flex", gap: 12, marginTop: 36, alignItems: "center" }}
              >
                <motion.button
                  type="button"
                  onClick={handleStartSurvey}
                  className="rounded-[10px] px-5 py-3 text-[15px] font-semibold"
                  style={{
                    fontFamily: "var(--font-body)",
                    lineHeight: 1,
                    background: "var(--color-mango)",
                    color: "var(--color-midnight)",
                    border: "none",
                    cursor: "pointer",
                    transition: "filter 180ms var(--ease-out)",
                  }}
                  {...buttonHoverTap}
                >
                  start your first survey
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => scrollToId("sample")}
                  className="rounded-[10px] px-3.5 py-3 text-[15px] font-semibold"
                  style={{
                    fontFamily: "var(--font-body)",
                    lineHeight: 1,
                    background: "transparent",
                    color: "var(--color-midnight)",
                    border: "none",
                    cursor: "pointer",
                  }}
                  whileHover={prefersReduced ? undefined : { opacity: 0.82, x: 2 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                  transition={tapSpring}
                >
                  hear a sample →
                </motion.button>
              </motion.div>
              <motion.div variants={heroItemVariants} style={{ marginTop: 28, fontSize: 13, color: "var(--color-fg3)" }}>
                no credit card · takes about 6 minutes to set up
              </motion.div>
            </motion.div>

            <motion.div variants={heroCardVariants} initial="hidden" animate="visible" style={{ position: "relative" }}>
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  bottom: "-18%",
                  left: "8%",
                  right: "8%",
                  height: "55%",
                  background: "rgba(232,176,75,0.32)",
                  filter: "blur(44px)",
                  borderRadius: "50%",
                  zIndex: 0,
                  pointerEvents: "none",
                }}
              />
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: "-18%",
                  left: "8%",
                  right: "8%",
                  height: "55%",
                  background: "rgba(232,176,75,0.32)",
                  filter: "blur(44px)",
                  borderRadius: "50%",
                  zIndex: 0,
                  pointerEvents: "none",
                }}
              />

              <div
                aria-label="sample voice card"
                style={{
                  position: "relative",
                  overflow: "hidden",
                  background: "var(--color-midnight)",
                  borderRadius: 20,
                  padding: 28,
                  color: "var(--color-fg-inverse)",
                  boxShadow: "0 20px 48px rgba(26,26,46,0.22)",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--color-mango)",
                    fontWeight: 600,
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-mango)" }} /> LIVE ·
                  maya r.
                </div>
                <div
                  style={{
                    position: "relative",
                    zIndex: 2,
                    fontFamily: "var(--font-display)",
                    fontSize: 26,
                    lineHeight: 1.2,
                    marginTop: 14,
                    color: "var(--color-fg-inverse)",
                  }}
                >
                  “honestly? the pricing page confused me more than the product did.”
                </div>
                <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "flex-end", gap: 3, height: 32, marginTop: 22 }}>
                  {WAVEFORM_LEVELS.map((h, i) => (
                    <div
                      key={i}
                      style={{
                        width: 3,
                        height: `${h}%`,
                        background: "var(--color-mango)",
                        borderRadius: 2,
                        opacity: i < 15 ? 1 : 0.4,
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    position: "relative",
                    zIndex: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 18,
                    fontSize: 12,
                    color: "rgba(250,247,242,0.55)",
                  }}
                >
                  <span>01:42 / 03:08</span>
                  <span>auto-transcribing</span>
                </div>

                <Meteors number={20} />
              </div>
            </motion.div>
          </div>
        </section>

        <section
          ref={sampleRef}
          id="sample"
          style={{
            padding: "36px 0",
            borderTop: "1px solid var(--color-border-soft)",
            borderBottom: "1px solid var(--color-border-soft)",
            background: "var(--color-bg-sunken)",
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={revealHidden}
            animate={sampleInView ? revealVisible : revealHidden}
            transition={revealTransition}
            style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px", display: "flex", alignItems: "center", gap: 40 }}
          >
            <div
              style={{
                fontSize: 13,
                color: "var(--color-fg3)",
                flexShrink: 0,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              trusted by
            </div>
            <div
              style={{
                position: "relative",
                flex: 1,
                overflow: "hidden",
                maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
                WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
              }}
            >
              <div className="koel-marquee" style={{ display: "flex", gap: 56, width: "max-content" }}>
                {TRUSTED_BY_LOGOS.map((n, i) => (
                  <div
                    key={`${n}-${i}`}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 24,
                      color: "var(--color-fg2)",
                      letterSpacing: "-0.02em",
                      flexShrink: 0,
                      textTransform: "lowercase",
                    }}
                  >
                    {n}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <section ref={productRef} id="product" style={{ padding: "120px 48px", maxWidth: 1200, margin: "0 auto" }}>
          <motion.div
            initial={revealHidden}
            animate={productInView ? revealVisible : revealHidden}
            transition={revealTransition}
          >
            <Eyebrow>how it works</Eyebrow>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(36px,4.4vw,56px)",
                lineHeight: 1.1,
                letterSpacing: "-0.015em",
                color: "var(--color-midnight)",
                marginTop: 16,
                maxWidth: 720,
              }}
            >
              a survey that sounds like a conversation, because it is one.
            </h2>
          </motion.div>

          <motion.div
            style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32, marginTop: 64 }}
            variants={gridContainerVariants}
            initial="hidden"
            animate={productInView ? "visible" : "hidden"}
          >
            {HOW_IT_WORKS_STEPS.map((s) => (
              <motion.div key={s.n} variants={gridItemVariants}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 44, color: "var(--color-mango)", lineHeight: 1 }}>
                  {s.n}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 22, fontWeight: 600, color: "var(--color-midnight)", marginTop: 20 }}>
                  {s.t}
                </div>
                <div style={{ fontSize: 15, color: "var(--color-fg2)", marginTop: 10, lineHeight: 1.65 }}>{s.d}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section ref={testimonialRef} style={{ background: "var(--color-midnight)", padding: "120px 48px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "left" }}>
            <motion.div
              initial={{ opacity: 0, y: prefersReduced ? 0 : 10 }}
              animate={
                testimonialInView ? { opacity: 1, y: 0 } : { opacity: 0, y: prefersReduced ? 0 : 10 }
              }
              transition={{ duration: prefersReduced ? 0.15 : 0.5, ease: smoothEase }}
            >
              <Eyebrow color="var(--color-mango)">word of mouth</Eyebrow>
            </motion.div>
            <TestimonialScrollQuote prefersReduced={prefersReduced} />
          </div>
        </section>

        <section ref={pricingRef} id="pricing" style={{ padding: "120px 48px", maxWidth: 1200, margin: "0 auto" }}>
          <motion.div
            initial={revealHidden}
            animate={pricingInView ? revealVisible : revealHidden}
            transition={revealTransition}
          >
            <Eyebrow>pricing</Eyebrow>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(36px,4.4vw,56px)",
                lineHeight: 1.1,
                letterSpacing: "-0.015em",
                color: "var(--color-midnight)",
                marginTop: 16,
                maxWidth: 720,
              }}
            >
              priced per voice, not per seat.
            </h2>
          </motion.div>

          <motion.div
            style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginTop: 56 }}
            variants={gridContainerVariants}
            initial="hidden"
            animate={pricingInView ? "visible" : "hidden"}
          >
            {PRICING_PLANS.map((p) => (
              <motion.div
                key={p.name}
                variants={gridItemVariants}
                whileHover={prefersReduced ? undefined : { y: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                style={{
                  background: p.highlight ? "var(--color-midnight)" : "var(--color-bg-raised)",
                  color: p.highlight ? "var(--color-fg-inverse)" : "var(--color-midnight)",
                  border: p.highlight ? `1px solid var(--color-midnight)` : `1px solid var(--color-border)`,
                  borderRadius: 16,
                  padding: 28,
                  boxShadow: p.highlight ? "0 20px 48px rgba(26,26,46,0.14)" : "var(--shadow-sm)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: p.highlight ? "var(--color-mango)" : "var(--color-fg3)",
                  }}
                >
                  {p.name}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 48, letterSpacing: "-0.02em", marginTop: 14, lineHeight: 1 }}>
                  {p.price}
                </div>
                <div style={{ fontSize: 13, color: p.highlight ? "rgba(250,247,242,0.6)" : "var(--color-fg3)", marginTop: 6 }}>
                  {p.note}
                </div>
                <div style={{ height: 1, background: p.highlight ? "rgba(250,247,242,0.15)" : "var(--color-border-soft)", margin: "20px 0" }} />
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ fontSize: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ color: p.highlight ? "var(--color-mango)" : "var(--color-forest)", marginTop: 2 }}>—</span> {f}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 24 }}>
                  <motion.button
                    type="button"
                    onClick={handleStartListening}
                    className="w-full rounded-[10px] px-5 py-3 text-[15px] font-semibold"
                    style={{
                      fontFamily: "var(--font-body)",
                      lineHeight: 1,
                      background: p.highlight ? "var(--color-mango)" : "transparent",
                      color: p.highlight ? "var(--color-midnight)" : "var(--color-midnight)",
                      border: p.highlight ? "none" : "1px solid var(--color-midnight)",
                      cursor: "pointer",
                      transition: "filter 180ms var(--ease-out)",
                    }}
                    {...buttonHoverTap}
                  >
                    {p.highlight ? "start listening" : "choose"}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <footer
          ref={footerRef}
          id="about"
          style={{
            background: "var(--color-cream)",
            borderTop: "1px solid var(--color-border-soft)",
            padding: "56px 48px 32px",
          }}
        >
          <motion.div
            initial={revealHidden}
            animate={footerInView ? revealVisible : revealHidden}
            transition={revealTransition}
          >
            <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 40 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <img src="/koel-logo.svg" alt="" style={{ height: 36, width: "auto", display: "block" }} />
                  <KoelWordmark size={34} />
                </div>
                <div style={{ fontSize: 13, color: "var(--color-fg3)", marginTop: 14, maxWidth: 280, lineHeight: 1.6 }}>
                  listen closely. built in bangalore 💗
                </div>
              </div>

              {FOOTER_LINK_COLUMNS.map((col) => (
                <div key={col.h}>
                  <Eyebrow>{col.h}</Eyebrow>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14, fontSize: 14, color: "var(--color-fg2)" }}>
                    {col.l.map((x) => (
                      <span key={x} style={{ color: "inherit" }}>
                        {x}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                maxWidth: 1200,
                margin: "56px auto 0",
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                color: "var(--color-fg3)",
                paddingTop: 20,
                borderTop: "1px solid var(--color-border-soft)",
              }}
            >
              <div>© 2026 koel, inc.</div>
              <div style={{ display: "flex", gap: 20 }}>
                <span>privacy</span>
                <span>terms</span>
                <span>security</span>
              </div>
            </div>
          </motion.div>
        </footer>
      </main>

      <style jsx global>{`
        .koel-marquee {
          animation: koel-marquee 32s linear infinite;
        }

        @keyframes koel-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
