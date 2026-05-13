import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/__tests__/{unit,integration}/**/*.test.ts"],
    exclude: ["dist/**", "node_modules/**"]
  }
});
