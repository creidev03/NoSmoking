import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

import { requireAuth } from "@/lib/auth-guard";
import { auth } from "@clerk/nextjs/server";

const mockAuth = vi.mocked(auth);

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns userId when authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" } as any);

    const result = await requireAuth();

    expect(result).toEqual({ userId: "user_123" });
    expect(mockAuth).toHaveBeenCalledOnce();
  });

  it("throws Error('Unauthorized') when not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null } as any);

    await expect(requireAuth()).rejects.toThrow("Unauthorized");
  });
});
