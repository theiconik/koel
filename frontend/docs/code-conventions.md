# Code Conventions

## File & Folder Structure

```
app/              Next.js App Router pages
  (auth)/         sign-in, sign-up (public)
  (dashboard)/    authenticated pages — each page imports from components/
components/
  layout/         shell components: Sidebar, TopBar, Crumbs, AppBrand
  ui/             reusable primitives: Button, Icon, StatCard, SurveyCard, etc.
  observability/  non-visual mounts (e.g. Sentry init bootstrap)
  marketing/      landing page components
contexts/         React context + provider (e.g. SurveysContext)
hooks/            custom hooks that wrap data fetching or browser APIs
lib/
  data/           data-access layer (apiFetch + mock toggle)
  data/mock/      static mock fixtures
  observability/  client logger + Sentry bootstrap (`logger.ts`, `client.ts`)
  types/          shared TypeScript interfaces
  utils/          small standalone helpers (e.g. stable survey fingerprint strings)
```

## Server vs. Client Components

- Pages under `app/(dashboard)/` are **Server Components by default** — do not add `"use client"` unless the component uses state, effects, or browser APIs.
- Hooks (`hooks/`) and contexts (`contexts/`) always need `"use client"`.
- Data-fetching in Server Components should call `lib/data` functions directly (they are async-safe).

## Components

- UI primitives live in `components/ui/`. Prefer extending these over one-off inline styles.
- `Button` accepts a `variant` prop: `primary | midnight | outline | ghost | danger | danger-outline`.
- `Icon` renders inline SVG. Add new icons by extending the `paths` object in `components/ui/Icon.tsx`. No external icon library.
- `SettingsPrimitives.tsx` exports `SectionHeader`, `SettingRow`, `Field`, `SettingsSelect`, `Toggle` — use these for all settings sections.

## Styling

- Tailwind CSS v4. No `tailwind.config.js` — config is in CSS directly.
- Design tokens are CSS variables (e.g. `var(--color-cream)`, `var(--font-body)`). Use tokens, not raw hex.
- No inline `style` objects except when a CSS variable is required (e.g. `style={{ background: "var(--color-cream)" }}`).

## TypeScript

- All shared types live in `lib/types/index.ts`. Add there first before defining local types.
- Avoid `any`. Use `unknown` if the type is truly unknown.

## Naming

- Components: PascalCase (`SurveyCard.tsx`)
- Hooks: camelCase prefixed `use` (`useSurveys.ts`)
- Files match their default export name.

## Data Fetching

- Data functions live in `lib/data/index.ts`. Pages/components call these functions — avoid raw `fetch` in UI code.
- **Mock mode** is **opt-in** (`NEXT_PUBLIC_USE_MOCK=true`). Omit the variable or set it `false` in production builds so the UI talks to `NEXT_PUBLIC_API_BASE_URL`.
- **`useAuthResource`** (`hooks/useAuthResource.ts`) is the shared Clerk token + **`AbortSignal`** primitive for authenticated GET flows (used by **`SurveysProvider`** via `getSurveys` and **`useStats`**).
- **`useSurvey(id)`** bundles parallel survey / responses / theme loads with **`surveyListFingerprint`** from `lib/utils/surveyFingerprint.ts` so unrelated changes to `surveys` in context do not re-fetch the detail page.


## Observability

- Prefer **`logger.error` / `logger.warn`** from `lib/observability/logger.ts` over empty `catch` blocks. Failed `fetch` responses log **`requestId`** from **`x-request-id` / `X-Request-ID`** headers when present.
- Set **`NEXT_PUBLIC_SENTRY_DSN`** to initialize **Sentry Browser** lazily (`lib/observability/client.ts` + `components/observability/ObservabilityBootstrap` in root layout).
