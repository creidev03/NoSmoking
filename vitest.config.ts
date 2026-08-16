import { defineConfig } from "vitest/config";
import path from "path";

const alias = {
  "@": path.resolve(__dirname, "./src"),
  // Mock "server-only" so Clerk's currentUser works in tests
  "server-only": path.resolve(__dirname, "./server-only-mock.ts"),
};

export default defineConfig({
  resolve: { alias },
  esbuild: {
    jsx: "automatic",
  },
  test: {
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "tests/**/*.test.ts", "tests/**/*.test.tsx"],
    projects: [
      {
        resolve: { alias },
        esbuild: { jsx: "automatic" },
        test: {
          environment: "node",
          include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
          globals: true,
          setupFiles: ["./vitest-setup-server.ts"],
        },
      },
      {
        resolve: { alias },
        esbuild: { jsx: "automatic" },
        test: {
          environment: "jsdom",
          include: ["src/**/*.test.tsx", "tests/**/*.test.tsx"],
          globals: true,
          setupFiles: ["./vitest-setup.ts"],
        },
      },
    ],
  },
});
