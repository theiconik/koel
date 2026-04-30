#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SONAR_HOST_URL="${SONAR_HOST_URL:-http://localhost:9000}"

if [[ -z "${SONAR_TOKEN:-}" ]]; then
  echo "Set SONAR_TOKEN to a token generated from the local SonarQube UI." >&2
  exit 1
fi

if ! command -v sonar-scanner >/dev/null 2>&1; then
  echo "sonar-scanner is not installed or not on PATH." >&2
  echo "Install it, then rerun: SONAR_TOKEN=... scripts/sonar-local-scan.sh" >&2
  exit 1
fi

cd "$ROOT_DIR/frontend"
npm run test:coverage

cd "$ROOT_DIR"
PYTHONPATH="$ROOT_DIR/backend" \
  "$ROOT_DIR/backend/venv/bin/python" -m pytest backend/tests \
  --cov=backend \
  --cov-report=xml:backend/coverage.xml \
  --junitxml=backend/test-results.xml

cd "$ROOT_DIR"
sonar-scanner \
  -Dsonar.host.url="$SONAR_HOST_URL" \
  -Dsonar.token="$SONAR_TOKEN"
