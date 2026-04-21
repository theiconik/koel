import type { Survey } from "@/lib/types";

export const mockSurveys: Survey[] = [
  {
    id: "1",
    title: "onboarding feedback — v3",
    description: "how new signups found their feet in week 1.",
    status: "live",
    responseCount: 37,
    avgDuration: "3m 42s",
    completionRate: "84%",
    questions: [
      { id: "q1", text: "tell me about the last time you set up a survey — what was the first thing that tripped you up?", order: 1 },
      { id: "q2", text: "what were you hoping koel would do differently from what you've tried before?", order: 2 },
    ],
    createdAt: "2026-04-01T10:00:00Z",
    shareUrl: "https://koel.ai/s/onboarding-v3-mock",
  },
  {
    id: "2",
    title: "pricing page research",
    description: "what confuses people at the moment of decision.",
    status: "live",
    responseCount: 12,
    avgDuration: "5m 10s",
    completionRate: "71%",
    questions: [
      { id: "q1", text: "walk me through what you were thinking when you first saw our pricing page.", order: 1 },
      { id: "q2", text: "what almost stopped you from signing up?", order: 2 },
    ],
    createdAt: "2026-04-05T10:00:00Z",
    shareUrl: "https://koel.ai/s/pricing-research-mock",
  },
  {
    id: "3",
    title: "churn exit interviews",
    description: "a quiet, unscripted conversation before they go.",
    status: "draft",
    responseCount: 0,
    avgDuration: "—",
    completionRate: "—",
    questions: [
      { id: "q1", text: "what made you decide to stop using koel?", order: 1 },
    ],
    createdAt: "2026-04-10T10:00:00Z",
    shareUrl: "https://koel.ai/s/churn-mock",
  },
  {
    id: "4",
    title: "q3 customer advisory",
    description: "12 of our most thoughtful users, 20 minutes each.",
    status: "closed",
    responseCount: 12,
    avgDuration: "18m 04s",
    completionRate: "100%",
    questions: [
      { id: "q1", text: "what's the one thing we should build next?", order: 1 },
      { id: "q2", text: "how has koel changed the way your team collects feedback?", order: 2 },
    ],
    createdAt: "2026-03-15T10:00:00Z",
    shareUrl: "https://koel.ai/s/q3-advisory-mock",
  },
];
