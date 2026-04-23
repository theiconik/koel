# Wiring with Mock Data

## How it works

`lib/data/index.ts` checks `NEXT_PUBLIC_USE_MOCK` at module load:

```ts
const useMock = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
```

When `useMock` is `true` (the default), every data function returns static fixtures instead of hitting the API. The backend is not needed.

## Mock fixtures

Located in `lib/data/mock/`:

| File | Exports |
|---|---|
| `surveys.ts` | `mockSurveys: Survey[]` |
| `responses.ts` | `mockResponses: Response[]`, `mockThemes: Theme[]` |
| `stats.ts` | `mockStats: DashboardStats` |

Edit these files to change what the UI renders during development.

## Switching to real API

1. Set `NEXT_PUBLIC_API_BASE_URL=https://your-api` in `.env.local`
2. Set `NEXT_PUBLIC_USE_MOCK=false`

The data functions will now call `apiFetch` which hits `${baseUrl}/surveys`, `/surveys/:id/responses`, etc.

## Adding a new data function

1. Add the type to `lib/types/index.ts` if needed.
2. Add mock fixture data to the relevant file in `lib/data/mock/`.
3. Export a new async function from `lib/data/index.ts` following the mock-or-fetch pattern:

```ts
export async function getX(): Promise<X> {
  if (useMock) return mockX;
  return apiFetch<X>("/x");
}
```

4. Consume it via a hook in `hooks/` or directly in a Server Component page.

## Hooks for client-side data access

| Hook | File | Returns |
|---|---|---|
| `useSurveys()` | `contexts/SurveysContext.tsx` (re-exported from `hooks/useSurveys.ts`) | `{ surveys, loading, error, addSurvey, updateSurvey }` |
| `useSurvey(id)` | `hooks/useSurvey.ts` | `{ survey, responses, themes, loading, error }` |
| `useStats()` | `hooks/useStats.ts` | `{ stats, loading, error }` |

`SurveysProvider` is mounted in `app/(dashboard)/layout.tsx` and must wrap any client component that calls `useSurveys()`.
