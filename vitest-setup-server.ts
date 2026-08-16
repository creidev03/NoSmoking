import { vi } from "vitest";

// Mock @clerk/nextjs/server to avoid "server-only" import chain
vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn().mockResolvedValue({ id: "test-user-id" }),
  auth: vi.fn().mockResolvedValue({ userId: "test-user-id" }),
}));

// Mock "server-only" as a safety net
vi.mock("server-only", () => ({}));
