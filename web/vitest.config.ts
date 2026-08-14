import { defineConfig } from "vitest/config";

// Pure-function libs only (digest formatting), so a node environment is
// enough (no DOM). Kept separate from vite.config.ts to leave the build
// config clean.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
