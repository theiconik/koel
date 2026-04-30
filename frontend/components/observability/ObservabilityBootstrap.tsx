"use client";

import { useEffect } from "react";
import { initClientObservability } from "@/lib/observability/client";

/** One-shot client init (Sentry when DSN is set). Mount once under the root layout. */
export function ObservabilityBootstrap() {
  useEffect(() => {
    initClientObservability();
  }, []);
  return null;
}
