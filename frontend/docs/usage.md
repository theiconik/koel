# Frontend — Usage

## Dev setup

```bash
cd frontend
npm install
npm run dev       # http://localhost:3000
npm run build     # production build check
npm run typecheck # type errors only
npm run lint      # linting
```

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — from Clerk dashboard
- `CLERK_SECRET_KEY` — from Clerk dashboard
- `NEXT_PUBLIC_USE_MOCK=true` — set to `false` to hit real API
- `NEXT_PUBLIC_API_BASE_URL` — FastAPI base URL (ignored when mock=true)

## Adding a new page

1. Create `app/(dashboard)/your-page/page.tsx` — inherits sidebar layout automatically.
2. Add nav item to `components/layout/Sidebar.tsx` if it needs a nav entry.
3. Add data fetcher to `lib/data/index.ts` + mock fixture to `lib/data/mock/`.
4. Add hook to `lib/hooks/`.

## Mock data

All fixtures live in `lib/data/mock/`. Toggle off with `NEXT_PUBLIC_USE_MOCK=false`.
Components never import from `lib/data/mock/` directly — always through `lib/hooks/`.
[2026-04-21 21:28] created

<!-- updated: 2026-04-21 22:27 after change to  -->
