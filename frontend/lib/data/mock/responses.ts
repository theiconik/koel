import type { Response, Theme } from "@/lib/types";

export const mockResponses: Response[] = [
  {
    id: "r1",
    surveyId: "1",
    respondentName: "maya r.",
    respondentRole: "pm, fintech",
    isAnonymous: false,
    quote: "honestly, the pricing page confused me more than the product did.",
    duration: "3m 42s",
    tags: ["pricing", "confusion"],
    createdAt: "2026-04-19T08:00:00Z",
  },
  {
    id: "r2",
    surveyId: "1",
    respondentName: "daniel k.",
    respondentRole: "founder, logistics",
    isAnonymous: false,
    quote: "i thought the voice thing was gimmicky. then i realized i was talking about the real problem.",
    duration: "4m 18s",
    tags: ["onboarding", "surprise"],
    createdAt: "2026-04-19T05:00:00Z",
  },
  {
    id: "r3",
    surveyId: "1",
    respondentName: "anon · id 0041",
    respondentRole: "—",
    isAnonymous: true,
    quote: "set up was easy. the part where i got stuck was inviting my team — i couldn't find the link.",
    duration: "2m 55s",
    tags: ["onboarding", "invite"],
    createdAt: "2026-04-18T12:00:00Z",
  },
  {
    id: "r4",
    surveyId: "1",
    respondentName: "ritika s.",
    respondentRole: "ux researcher",
    isAnonymous: false,
    quote: "i've been using typeform for six years. this felt like reading someone's diary by comparison — in a good way.",
    duration: "6m 12s",
    tags: ["comparison", "delight"],
    createdAt: "2026-04-17T10:00:00Z",
  },
];

export const mockThemes: Theme[] = [
  { name: "pricing clarity", count: 14, color: "#E8B04B" },
  { name: "onboarding",      count: 11, color: "#4A7C59" },
  { name: "team invites",    count: 8,  color: "#F08A63" },
  { name: "voice novelty",   count: 6,  color: "#1A1A2E" },
  { name: "integrations",    count: 4,  color: "#A79E8C" },
];
