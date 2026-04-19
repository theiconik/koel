# Requirements: koel

**Defined:** 2026-04-19
**Core Value:** Respondents speak naturally — creators get the actual reasoning, not just a score.

## v1 Requirements (Frontend milestone)

### Authentication

- [ ] **AUTH-01**: User can sign in via Clerk (email/password, Clerk-hosted UI)
- [ ] **AUTH-02**: User session persists across browser refresh
- [ ] **AUTH-03**: Unauthenticated users are redirected to sign-in
- [ ] **AUTH-04**: Profile data (name, email, avatar) comes from Clerk `useUser()`

### Layout & Navigation

- [ ] **NAV-01**: 240px fixed left sidebar with brand, nav items (Home, Insights, Settings), and user avatar
- [ ] **NAV-02**: Active sidebar item is visually highlighted
- [ ] **NAV-03**: Top bar shows page title, breadcrumb, and contextual CTA
- [ ] **NAV-04**: App layout is fully responsive down to 1024px wide

### Dashboard (Home)

- [ ] **DASH-01**: Stat cards: active surveys, voices this week, hours of audio, completion rate
- [ ] **DASH-02**: Survey grid with SurveyCard (title, status chip, voices/duration/completion stats)
- [ ] **DASH-03**: Status chip variants: live (green), draft (stone), closed (coral)
- [ ] **DASH-04**: Clicking a survey card navigates to that survey’s detail view
- [ ] **DASH-05**: “New survey” CTA in top bar and sidebar

### Survey Creation

- [ ] **SURV-01**: New survey form: title input + question list (plain-English textarea per question)
- [ ] **SURV-02**: Add question button appends a new textarea
- [ ] **SURV-03**: Question numbers rendered in Absans mango
- [ ] **SURV-04**: Right-rail preview card shows title, question count, and estimated time (static)
- [ ] **SURV-05**: Preview button is disabled (no page behind it)
- [ ] **SURV-06**: Publish button sets survey status to live (mock)
- [ ] **SURV-07**: Survey link is a mocked URL string shown after publish

### Survey Detail (Responses)

- [ ] **RESP-01**: Detail view shows survey title, status chip, aggregate stats (voices, completion, avg time)
- [ ] **RESP-02**: Tab bar: Voices, Themes, Questions, Settings (UI only — Voices tab active)
- [ ] **RESP-03**: Response cards: avatar, name, role, timestamp, duration, quote (Absans), tags
- [ ] **RESP-04**: Right-rail auto-themes panel with bar chart (colour per theme, count)
- [ ] **RESP-05**: Copy Link button shows mock URL

### Insights

- [ ] **INSG-01**: Left rail lists surveys user can ask about; selecting one resets chat
- [ ] **INSG-02**: Chat input sends a message; response is always the mock error string
- [ ] **INSG-03**: Mock error: “Sorry, we are facing some issues. Please try again later.”
- [ ] **INSG-04**: Export thread button present (disabled / no-op for now)

### Settings

- [ ] **SETT-01**: Profile section reads name, email, avatar from Clerk `useUser()`
- [ ] **SETT-02**: Workspace, Voice, Notifications, Billing, Integrations, Danger sections rendered (UI only)
- [ ] **SETT-03**: Section navigation via left sub-nav within settings

### Data Layer

- [ ] **DATA-01**: All mock data in `lib/data/mock/` — surveys, responses, themes, insights
- [ ] **DATA-02**: All components consume data via hooks in `lib/hooks/` only
- [ ] **DATA-03**: `NEXT_PUBLIC_USE_MOCK=true` uses mock; `false` hits `NEXT_PUBLIC_API_BASE_URL`
- [ ] **DATA-04**: Switching mock → real requires zero component changes

### Design System Compliance

- [ ] **DS-01**: Tailwind config maps all design tokens (colors, radii, shadows, spacing, fonts)
- [ ] **DS-02**: Absans font loaded for display/headlines; Manrope for body
- [ ] **DS-03**: No emoji in product copy
- [ ] **DS-04**: Wordmark always lowercase `koel`
- [ ] **DS-05**: Focus ring uses mango at 35% opacity

## v2 Requirements (Backend milestone)

- **RESP-BE-01**: Real survey CRUD via FastAPI
- **RESP-BE-02**: Voice recording upload + transcription pipeline
- **INSG-BE-01**: Real LLM-powered insights chat (Claude API)
- **RESP-VOICE-01**: Respondent voice session (`/respond/[id]`) — standalone page, AI asks questions
- **AUTH-BE-01**: Supabase user data synced from Clerk webhook

## Out of Scope

| Feature | Reason |
|---------|--------|
| Respondent voice session | Design not finalised; requires backend + LLM |
| Real Insights AI | LLM credits/integration deferred to backend milestone |
| Public unauthenticated survey route | Requires backend for session management |
| Survey preview page | AI-driven — no static preview makes sense |
| Mobile (<1024px) | Desktop-first product; mobile deferred |
| OAuth / social login | Clerk free tier; email sufficient for v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01–04 | Phase 1 | Pending |
| NAV-01–04 | Phase 1 | Pending |
| DS-01–05 | Phase 1 | Pending |
| DATA-01–04 | Phase 1 | Pending |
| DASH-01–05 | Phase 2 | Pending |
| SURV-01–07 | Phase 3 | Pending |
| RESP-01–05 | Phase 4 | Pending |
| INSG-01–04 | Phase 5 | Pending |
| SETT-01–03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 40 total
- Mapped to phases: 40
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-19*
*Last updated: 2026-04-19 after initialization*
