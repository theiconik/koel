# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: koel

AI voice-powered survey platform. Respondents speak instead of clicking options; koel transcribes, surfaces themes, and gives creators the *thinking* behind answers. Name is always lowercase — `koel`, never `Koel`.

## Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS — lives in `frontend/`
- **Backend**: Python FastAPI — lives in `backend/` (future phase)
- **Auth**: Clerk (frontend only for now)
- **DB**: Supabase (future phase)

## Commands

All commands run from `frontend/`:

```bash
cd frontend
npm install        # install deps
npm run dev        # dev server → http://localhost:3000
npm run build      # production build (verifier check — must pass clean)
npm run typecheck  # type errors only
npm run lint       # eslint
```

## Architecture

### Frontend structure

```
frontend/                         # Next.js 16 project root
  proxy.ts                        # Clerk auth guard (Next.js 16 middleware convention)
  app/
    (auth)/                       # Public: /sign-in, /sign-up
    (dashboard)/                  # Protected — all routes get Sidebar layout
      page.tsx                    # / → Dashboard Home
      surveys/new/page.tsx        # /surveys/new
      surveys/[id]/page.tsx       # /surveys/:id (detail + responses)
      insights/page.tsx           # /insights (mocked error chat)
      settings/page.tsx           # /settings (Clerk profile + UI-only sections)
  components/
    ui/                           # Button, Icon, StatusChip, StatCard, SurveyCard
    layout/                       # AppBrand, Sidebar, TopBar
  lib/
    data/
      mock/                       # surveys.ts, responses.ts, stats.ts
      index.ts                    # toggle: mock vs real API via NEXT_PUBLIC_USE_MOCK
    hooks/                        # useSurveys, useSurvey, useStats
    types/index.ts                # Survey, Response, Theme, DashboardStats, InsightMessage
  public/
    fonts/                        # Absans + Manrope
    koel-logo.svg
```

### Business logic / UI separation

- **`lib/data/`** owns all data fetching — mock or real. Toggle via `NEXT_PUBLIC_USE_MOCK=true`.
- **Components** receive data as props; they never fetch directly.
- **Hooks** in `lib/hooks/` bridge data layer → component layer.
- Profile data always comes from Clerk (`useUser()`), never from mock.

### Mock data

All logged-in users see the same mock data (defined in `lib/data/mock/`). When `NEXT_PUBLIC_USE_MOCK=false`, the same hooks call the FastAPI backend at `NEXT_PUBLIC_API_BASE_URL`. No component should need to change when switching modes.

## Design system (`koel-ui-design-system/`)

Source of truth for all visual decisions. Read `koel-ui-design-system/README.md` before writing any UI. Key rules:

- **Fonts**: Absans (display — h1/h2 + wordmark only), Manrope (everything else). No third family.
- **Palette**: `--cream #FAF7F2` bg · `--midnight #1A1A2E` text · `--mango #E8B04B` CTA accent (60/30/10 ratio).
- **Tokens**: defined in `koel-ui-design-system/colors_and_type.css` — mirror these as Tailwind config values or CSS variables in the Next.js project.
- **Icons**: Lucide (stroke 1.75px, rounded, `currentColor`). No filled icons except status dots.
- **Buttons**: Primary = mango fill; Midnight = midnight fill; Outline = transparent + midnight border; Ghost = no border. Max one mango button per page.
- **Cards**: white on cream, 1px `--border`, 16px radius, `--shadow-sm`. No colored borders, no gradient headers.
- **No emoji** anywhere in product or marketing copy.
- **No speech-bubble iconography** — voice product, not chat.
- Copy/labels always sentence case. Wordmark always lowercase.

Reference UI patterns live in `koel-ui-design-system/ui_kits/app/Components.jsx` — use as implementation guide for: Sidebar, AppTopBar, SurveyCard, ResponseCard, StatusChip, InsightsView, SettingsView.

## Current status

**Frontend v1 — complete.** All routes built and `npm run build` passes clean.

| Route | Status |
|-------|--------|
| `/` — Dashboard Home | ✓ built |
| `/surveys/new` — New Survey | ✓ built (Preview disabled) |
| `/surveys/[id]` — Survey Detail | ✓ built |
| `/insights` — Insights chat | ✓ built (mocked error) |
| `/settings` — Settings | ✓ built (Clerk profile live) |
| `/sign-in`, `/sign-up` | ✓ Clerk-hosted |

## Deferred / out of scope (this phase)

- **Respondent voice session** (`/respond/[id]`): standalone page, no sidebar, AI asks questions via voice. Design not finalised — do not build yet.
- **Insights AI**: currently returns `"Sorry, we are facing some issues. Please try again later."` — real LLM wired in backend phase.
- **Public survey link**: mock URL string only. No unauthenticated route.

## Known Clerk quirks

- Using `@clerk/nextjs` v7 with Next.js 16.
- Auth guard lives in `proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`).
- **Do not** use `auth.protect()` or `redirectToSignIn()` from Clerk — both route through Clerk's hosted account portal (external URL), which redirects back to `/` causing a 307 loop.
- Correct pattern: call `await auth()` to get `userId`, then use `NextResponse.redirect(new URL('/sign-in', req.url))` directly.

## Claude automation hook

A post-tool hook at `.claude/hooks/post-feature.sh` runs after significant file writes and:
1. Detects whether frontend, backend, or both are affected.
2. Updates `frontend/docs/usage.md` and/or `backend/docs/usage.md`.
3. Updates mock data in `lib/data/mock/` if new data shapes are introduced.
4. Appends unresolved issues to `frontend/docs/issues-and-fixes.md` or `backend/docs/issues-and-fixes.md`.

Doc files are the only auto-generated files — never commit generated code.

## Env vars

```
NEXT_PUBLIC_USE_MOCK=true          # flip to false to hit real API
NEXT_PUBLIC_API_BASE_URL=          # FastAPI base URL (ignored when mock)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY= # Clerk key (required)
CLERK_SECRET_KEY=                  # Clerk secret (server-side only)
```
