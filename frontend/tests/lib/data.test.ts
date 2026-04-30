import { afterEach, describe, expect, it, vi } from "vitest";
import { getStats } from "@/lib/data";

describe("data api", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not log expected request aborts as network errors", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const abortError = new DOMException("signal is aborted without reason", "AbortError");
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(abortError);

    await expect(getStats(null, { signal: AbortSignal.abort() })).rejects.toBe(abortError);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
