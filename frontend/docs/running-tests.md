# Running Tests

The frontend has focused unit/component coverage through Vitest and React Testing Library.

Run the focused test suite from `frontend/`:

```bash
npm run test
npm run test:coverage # emits coverage/lcov.info for SonarQube
```

Use these for broader correctness checks:

```bash
npm run typecheck   # TypeScript type errors
npm run lint        # ESLint
npm run build       # production build (catches type + compile errors)
```
