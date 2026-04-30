/**
 * Browser-only Sentry. No-op until NEXT_PUBLIC_SENTRY_DSN is set.
 * Dynamically imports @sentry/browser so installs stay optional-at-runtime-sized.
 */

import type * as SentryType from "@sentry/browser";

let loadModule: Promise<typeof SentryType> | null = null;

function sentry(): Promise<typeof SentryType> {
  if (!loadModule) {
    loadModule = import("@sentry/browser");
  }
  return loadModule;
}

let didInit = false;

export function initClientObservability(): void {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn || typeof window === "undefined") return;
  void sentry().then((Sentry) => {
    if (!didInit) {
      Sentry.init({
        dsn,
        environment:
          process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
        tracesSampleRate: 0,
      });
      didInit = true;
    }
  });
}

export function captureException(
  error: unknown,
  extra?: Record<string, unknown>,
): void {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn || typeof window === "undefined") return;
  void sentry().then((Sentry) => {
    if (!didInit) {
      Sentry.init({
        dsn,
        environment:
          process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
        tracesSampleRate: 0,
      });
      didInit = true;
    }
    Sentry.captureException(error, { extra });
  });
}
