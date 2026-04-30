# Building the Project

## Stack

- Next.js 16 (App Router), React 19, TypeScript 5
- Tailwind CSS v4
- Clerk for auth
- Framer Motion for animations

## Prerequisites

- Node.js 20+
- A Clerk account (free tier is fine)

## Setup

```bash
cd frontend
cp .env.example .env.local
# fill in NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY from Clerk dashboard
npm install
npm run dev
```

App runs at `http://localhost:3000`.

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk auth (public key) |
| `CLERK_SECRET_KEY` | Yes | Clerk auth (server key) |
| `NEXT_PUBLIC_API_BASE_URL` | No | Backend API base URL (default: `""`) |
| `NEXT_PUBLIC_USE_MOCK` | No | Set to **`"true"`** to use mock fixtures locally; omit or **`false`** for the real API (default). |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Enables Sentry Browser for client errors (see `lib/observability/client.ts`). |

Unless `NEXT_PUBLIC_USE_MOCK` is **`"true"`**, builds use the backend at `NEXT_PUBLIC_API_BASE_URL` (requires a running API unless you omit calls that hit the server).

## Scripts

```bash
npm run dev        # dev server
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

## Route Groups

- `(auth)` — sign-in / sign-up pages (public, no sidebar)
- `(dashboard)` — authenticated app shell with sidebar; Clerk runs in root `proxy.ts` (Next.js 16 convention — see [middleware-to-proxy](https://nextjs.org/docs/messages/middleware-to-proxy)).
- `/` — marketing landing page (public)
