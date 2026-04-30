import { afterEach, describe, expect, it, vi } from "vitest";
import { logger } from "@/lib/observability/logger";

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("serializes Error objects with their name and message", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new TypeError("request exploded");

    logger.error("api_request_failed", { error });

    expect(consoleError).toHaveBeenCalledTimes(1);
    const line = consoleError.mock.calls[0][0];
    expect(typeof line).toBe("string");

    const payload = JSON.parse(line as string) as {
      error: { name?: string; message?: string };
    };
    expect(payload.error).toMatchObject({
      name: "TypeError",
      message: "request exploded",
    });
  });
});
