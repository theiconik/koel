import { captureException } from "./client";

export type LogLevel = "error" | "warn" | "info";

function toLoggableError(error: Error) {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    cause: error.cause,
  };
}

function serializeLogPayload(payload: Record<string, unknown>) {
  const seen = new WeakSet<object>();

  return JSON.stringify(payload, (_key, value: unknown) => {
    if (value instanceof Error) {
      return toLoggableError(value);
    }

    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return "[Circular]";
      seen.add(value);
    }

    return value;
  });
}

function basePayload(level: LogLevel, event: string, rest: Record<string, unknown>) {
  return serializeLogPayload({
    level,
    ts: new Date().toISOString(),
    event,
    ...rest,
  });
}

/** Structured client logs. Use instead of silent catch blocks or raw console in app code. */
export const logger = {
  error(event: string, rest: Record<string, unknown> = {}) {
    const line = basePayload("error", event, rest);
    console.error(line);
    const err = rest.error;
    if (process.env.NEXT_PUBLIC_SENTRY_DSN && err instanceof Error) {
      captureException(err, { event, ...rest });
    }
  },
  warn(event: string, rest: Record<string, unknown> = {}) {
    console.warn(basePayload("warn", event, rest));
  },
  info(event: string, rest: Record<string, unknown> = {}) {
    if (process.env.NODE_ENV !== "production") {
      console.info(basePayload("info", event, rest));
    }
  },
};
