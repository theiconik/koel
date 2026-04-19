# Roadmap: koel

**Created:** 2026-04-19
**Milestone:** Frontend v1
**Goal:** Fully navigable creator dashboard with mock data, Clerk auth, and design-system-compliant UI.

---

## Phase 1 — Foundation
**Goal:** Next.js project bootstrapped, design tokens wired, Clerk auth working, mock data layer in place.

### Plans
1. **Bootstrap** — `create-next-app` with TypeScript + Tailwind; copy fonts + logo from design system; configure `next.config`
2. **Design tokens** — Tailwind config maps all CSS variables (colors, radii, shadows, spacing, font families)
3. **Clerk auth** — Install Clerk SDK; `<ClerkProvider>` in root layout; sign-in/sign-up pages; middleware protecting `(dashboard)` routes
4. **Mock data layer** — `lib/data/mock/` fixtures (surveys, responses, themes); `lib/data/index.ts` toggle; `lib/hooks/` wrappers

**Verifier check:** `npm run build` passes with zero type errors.

---

## Phase 2 — Dashboard Home
**Goal:** Authenticated user lands on a working home screen with stat cards and survey grid.

### Plans
1. **App shell** — Sidebar (brand, nav, user avatar from Clerk), AppTopBar, root `(dashboard)` layout
2. **Stat cards** — 4-column grid reading from `useStats()` hook
3. **Survey grid** — SurveyCard with status chips; click navigates to `/surveys/[id]`
4. **New survey CTA** — button in top bar + sidebar routes to `/surveys/new`

**Verifier check:** `npm run build` passes; all dashboard routes reachable.

---

## Phase 3 — Survey Creation
**Goal:** User can create a survey with title + questions and publish it (mock).

### Plans
1. **New survey page** — `/surveys/new` layout: title input + question list + right-rail static preview card
2. **Question management** — add/remove questions; Absans mango numbering
3. **Publish flow** — Publish button updates mock status to `live`; Preview button disabled
4. **Mock survey link** — Post-publish modal/toast showing a mock respondent URL

**Verifier check:** `npm run build` passes; survey persists in mock state after publish.

---

## Phase 4 — Survey Detail & Responses
**Goal:** Drill-down from a survey card shows responses, themes, and aggregate stats.

### Plans
1. **Survey detail layout** — `/surveys/[id]` page; top bar with breadcrumb, status chip, aggregate stats
2. **Tab bar** — Voices / Themes / Questions / Settings tabs (Voices active, others UI-only)
3. **Response cards** — list of ResponseCard (quote in Absans, tags, meta)
4. **Themes panel** — right-rail auto-themes bar chart; Copy Link button with mock URL

**Verifier check:** `npm run build` passes; survey detail reachable from every survey card.

---

## Phase 5 — Insights + Settings
**Goal:** Insights chat view (mocked error) and Settings view (Clerk profile + UI-only sections).

### Plans
1. **Insights page** — `/insights`; left survey picker rail; chat column with input
2. **Insights mock** — all messages return error string; Export thread button present but disabled
3. **Settings shell** — `/settings`; left sub-nav; section router
4. **Profile section** — reads from Clerk `useUser()`; display name, email, avatar
5. **Remaining settings sections** — Workspace, Voice, Notifications, Billing, Integrations, Danger (UI-only, no logic)

**Verifier check:** `npm run build` passes; all routes reachable with no console errors.

---

## Phase 6 — Claude Hook + Docs
**Goal:** Automated post-feature hook updates docs and mock data; usage docs written.

### Plans
1. **Hook script** — `.claude/hooks/post-feature.sh` detects frontend/backend changes, updates `frontend/docs/usage.md`, appends to `issues-and-fixes.md`
2. **Claude settings** — Register hook in `.claude/settings.json` on `PostToolUse` write events
3. **Frontend usage doc** — `frontend/docs/usage.md`: dev setup, env vars, mock toggle, adding a new page

**Verifier check:** Hook runs after a test file write; `frontend/docs/usage.md` updates correctly.

---

## Summary

| Phase | Name | Plans | Requirements |
|-------|------|-------|--------------|
| 1 | Foundation | 4 | AUTH, NAV, DS, DATA |
| 2 | Dashboard Home | 4 | DASH |
| 3 | Survey Creation | 4 | SURV |
| 4 | Survey Detail | 4 | RESP |
| 5 | Insights + Settings | 5 | INSG, SETT |
| 6 | Hook + Docs | 3 | — |

**Total:** 6 phases, 24 plans

---
*Roadmap created: 2026-04-19*
