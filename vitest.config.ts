import { defineConfig } from "vitest/config";
import path from "path";

const alias = {
  "@": path.resolve(__dirname, "./src"),
};

export default defineConfig({
  resolve: { alias },
  esbuild: {
    jsx: "automatic",
  },
  test: {
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    projects: [
      {
        resolve: { alias },
        esbuild: { jsx: "automatic" },
        test: {
          environment: "node",
          include: ["src/**/*.test.ts"],
          globals: true,
        },
      },
      {
        resolve: { alias },
        esbuild: { jsx: "automatic" },
        test: {
          environment: "jsdom",
          include: ["src/**/*.test.tsx"],
          globals: true,
          setupFiles: ["./vitest-setup.ts"],
        },
      },
    ],
  },
});
