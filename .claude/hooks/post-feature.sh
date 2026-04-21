#!/bin/bash
# Post-feature hook: updates docs and mock data after significant file writes.
# Triggered by Claude Code on PostToolUse (Write/Edit events).

FILE="$1"  # path of the file just written/edited, passed by the hook config

FRONTEND_DOCS="frontend/docs"
BACKEND_DOCS="backend/docs"
DATE=$(date '+%Y-%m-%d %H:%M')

mkdir -p "$FRONTEND_DOCS" "$BACKEND_DOCS"

# Detect which side changed
IS_FRONTEND=false
IS_BACKEND=false

if [[ "$FILE" == frontend/* ]] || [[ "$FILE" == components/* ]] || [[ "$FILE" == app/* ]]; then
  IS_FRONTEND=true
fi
if [[ "$FILE" == backend/* ]]; then
  IS_BACKEND=true
fi

# If no match, try to infer from current git diff
if ! $IS_FRONTEND && ! $IS_BACKEND; then
  DIFF=$(git diff --name-only HEAD 2>/dev/null)
  echo "$DIFF" | grep -q '^frontend/' && IS_FRONTEND=true
  echo "$DIFF" | grep -q '^backend/'  && IS_BACKEND=true
fi

# Update frontend usage doc
if $IS_FRONTEND; then
  USAGE_FILE="$FRONTEND_DOCS/usage.md"
  if [ ! -f "$USAGE_FILE" ]; then
    cat > "$USAGE_FILE" << 'EOF'
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
EOF
    echo "[$DATE] created" >> "$USAGE_FILE"
  else
    echo "" >> "$USAGE_FILE"
    echo "<!-- updated: $DATE after change to $FILE -->" >> "$USAGE_FILE"
  fi
fi

# Update backend usage doc
if $IS_BACKEND; then
  USAGE_FILE="$BACKEND_DOCS/usage.md"
  if [ ! -f "$USAGE_FILE" ]; then
    cat > "$USAGE_FILE" << 'EOF'
# Backend — Usage

## Dev setup
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Running tests
```bash
pytest --cov=. --cov-report=term-missing
```
EOF
    echo "[$DATE] created" >> "$USAGE_FILE"
  else
    echo "" >> "$USAGE_FILE"
    echo "<!-- updated: $DATE after change to $FILE -->" >> "$USAGE_FILE"
  fi
fi

exit 0
