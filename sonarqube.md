# SonarQube

This repo is configured for one SonarQube project that analyzes both apps:

- `frontend/` - Next.js, React, TypeScript
- `backend/` - FastAPI, Python

## Required SonarQube Setup

Create or import a SonarQube Cloud project with this key, or update
`sonar-project.properties` to match the key shown by SonarQube Cloud:

```text
theiconik_koel
```

The SonarQube Cloud organization key is:

```text
theiconik
```

For GitHub Actions, configure:

- Repository secret `SONAR_TOKEN`
- Repository variable `SONAR_HOST_URL`, for example `https://sonarqube.example.com`

`SONAR_HOST_URL` must be reachable from the GitHub Actions runner. A local
`http://localhost:9000` SonarQube instance only works with a self-hosted runner
running on the same machine or network.

With GitHub CLI:

```bash
gh secret set SONAR_TOKEN -R theiconik/koel
gh variable set SONAR_HOST_URL --body "https://sonarcloud.io" -R theiconik/koel
```

## Local Browser Dashboard

Run SonarQube locally:

```bash
docker compose -f docker-compose.sonarqube.yml up -d
```

Open the UI:

```text
http://localhost:9000
```

On first run, sign in with the default local admin account:

```text
username: admin
password: admin
```

SonarQube will ask you to change that password. After that, create a local
project:

- Project key: `koel`
- Project name: `koel`
- Analysis method: local/manual

Generate a project token in the SonarQube UI, then run a scan from the repo
root:

```bash
SONAR_TOKEN=your-local-token scripts/sonar-local-scan.sh
```

After the scan finishes, refresh `http://localhost:9000/projects` and open the
`koel` project. The dashboard includes the combined frontend/backend rating,
coverage, duplicated lines, bugs, vulnerabilities, code smells, security
hotspots, and per-file drilldowns.

## Local Coverage Inputs

Generate the reports SonarQube imports before running a scan:

```bash
cd frontend
npm run test:coverage

cd ..
PYTHONPATH=backend backend/venv/bin/python -m pytest backend/tests \
  --cov=backend \
  --cov-report=xml:backend/coverage.xml \
  --junitxml=backend/test-results.xml
```

The scanner reads:

- `frontend/coverage/lcov.info`
- `backend/coverage.xml`
- `backend/test-results.xml`

## Local Scan

After installing `sonar-scanner` locally and setting environment variables:

```bash
SONAR_HOST_URL=https://sonarqube.example.com \
SONAR_TOKEN=your-token \
sonar-scanner
```

The GitHub Actions workflow in `.github/workflows/sonarqube.yml` runs the same
coverage steps before publishing the analysis.

## Backend-Only Project

If you keep a separate `koel-backend` project in SonarQube, scan it with:

```bash
SONAR_TOKEN=your-local-token scripts/sonar-backend-local-scan.sh
```

That script runs from `backend/`, uses `backend/sonar-project.properties`, and
imports:

- `backend/coverage.xml`
- `backend/test-results.xml`
