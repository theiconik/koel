import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

if (!globalThis.crypto?.randomUUID) {
  let id = 0;
  const cryptoValue = globalThis.crypto ?? {};

  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: {
      ...cryptoValue,
      randomUUID: () => `test-uuid-${++id}`,
    },
  });
}
