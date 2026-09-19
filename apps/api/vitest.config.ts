import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/live-presence.test.ts", "src/**/*.spec.ts", "tests/**/*.spec.ts"],
    environment: "node",
    testTimeout: 10000,
  },
});
