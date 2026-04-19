# koel

## What This Is

koel is an AI voice-powered survey platform. Instead of clicking options, respondents speak; koel transcribes, surfaces themes, and gives creators the thinking behind each answer. Built for researchers, product teams, and anyone who needs descriptive, qualitative feedback rather than numeric ratings.

## Core Value

Respondents speak naturally — creators get the actual reasoning, not just a score.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Authenticated dashboard where creators manage surveys
- [ ] Survey creation with plain-English questions
- [ ] Survey detail view: drill-down responses + auto-themes panel
- [ ] Insights view: AI chat over survey data (mocked error for now)
- [ ] Settings view: profile (Clerk), workspace, voice, notifications, billing, integrations, danger
- [ ] Mock data layer with env-var toggle to real API

### Out of Scope (this phase)

- Respondent voice session (`/respond/[id]`) — design not finalised
- Preview of survey before publish — disabled button, no page
- Public respondent link — mock URL string only, no real unauthenticated route
- Backend / FastAPI — next milestone
- Real AI in Insights — mocked with "Sorry, we are facing some issues. Please try again later."

## Context

- Frontend-only phase. All data is mocked; `NEXT_PUBLIC_USE_MOCK=true` by default.
- Design system lives in `koel-ui-design-system/` — all token/component decisions come from there.
- Fonts: Absans (display/headlines) + Manrope (body). No third family.
- Palette: cream `#FAF7F2` bg · midnight `#1A1A2E` · mango `#E8B04B` CTA (60/30/10).
- Clerk free tier for auth. Profile data always comes from Clerk, never mock.
- Sidebar: Home, Insights, Settings. Responses reached by drilling into a survey card.

## Constraints

- **Stack**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Clerk
- **Design**: Must follow `koel-ui-design-system/` — no deviations without explicit discussion
- **Data coupling**: Components never fetch directly; all fetching goes through `lib/data/`
- **Wordmark**: Always lowercase `koel` — never `Koel` or `KOEL`
- **Verifier**: Frontend phase — verify `npm run build` passes. Backend phase — verify build + tests + coverage.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|--------|
| Tailwind for styling | Fast token mapping, design-system alignment | — Pending |
| Mock data behind env var | Swap to real API without touching components | — Pending |
| Clerk free tier | User's existing plan | — Pending |
| Insights mocked as error | LLM integration deferred to later | — Pending |
| Preview button disabled | Respondent session design not finalised | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-19 after initialization*
