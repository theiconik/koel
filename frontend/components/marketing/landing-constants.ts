import type { Easing } from "framer-motion";

/** `useInView` options shared by marketing page sections. */
export const LANDING_IN_VIEW = { once: true, margin: "-12% 0px" } as const;

export const tapSpring = { type: "spring" as const, stiffness: 280, damping: 28 };

export const smoothEase: Easing = [0.16, 1, 0.3, 1] as [number, number, number, number];

/** Word of mouth — phrase chunks; visibility driven by scroll through the section. */
export const TESTIMONIAL_PHRASES = [
  "“we ran one koel survey ",
  "and learned more in a week ",
  "than six months of typeform data. ",
  "the quotes alone ",
  "rewrote our onboarding.”",
] as const;

export const TRUSTED_BY_LOGOS = [
  "vercel",
  "retool",
  "plaid",
  "figma",
  "stripe",
  "framer",
  "raycast",
  "notion",
  "linear",
  "vercel",
  "retool",
  "plaid",
  "figma",
  "stripe",
  "framer",
  "raycast",
  "notion",
  "linear",
] as const;

export const WAVEFORM_LEVELS = [
  40, 70, 55, 90, 60, 100, 75, 45, 85, 50, 65, 95, 40, 80, 55, 70, 50, 35, 60, 40,
] as const;

export const HOW_IT_WORKS_STEPS = [
  { n: "01", t: "write the questions", d: "plain english. the way you'd ask a friend. koel handles follow-ups." },
  { n: "02", t: "send a link", d: "respondents open it on any device. no app, no signup. just a microphone permission." },
  {
    n: "03",
    t: "read between the lines",
    d: "every pause, every “wait, actually —” is preserved. summaries link back to the exact moment.",
  },
] as const;

export type PricingPlan = {
  name: string;
  price: string;
  note: string;
  features: string[];
  highlight: boolean;
};

export const PRICING_PLANS: readonly PricingPlan[] = [
  {
    name: "nest",
    price: "free",
    note: "for exploring the shape of it",
    features: ["up to 25 respondents", "one active survey", "auto-transcripts", "7-day history"],
    highlight: false,
  },
  {
    name: "flock",
    price: "$79",
    note: "/ month · for small teams",
    features: [
      "500 respondents / mo",
      "unlimited surveys",
      "themes and auto-tagging",
      "share + export",
      "slack + linear",
    ],
    highlight: true,
  },
  {
    name: "migration",
    price: "let's talk",
    note: "for scale + compliance",
    features: [
      "unlimited respondents",
      "soc 2 + hipaa",
      "sso + scim",
      "dedicated success",
      "multi-language",
    ],
    highlight: false,
  },
] as const;

export const FOOTER_LINK_COLUMNS = [
  { h: "product", l: ["features", "pricing", "changelog", "status"] },
  { h: "company", l: ["about", "careers", "press", "contact"] },
] as const;
