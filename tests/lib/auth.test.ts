import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAuthUserId, getCurrentUser } from "@/lib/auth";

// Mock Clerk modules
vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn(),
  auth: vi.fn(),
}));

import { currentUser, auth } from "@clerk/nextjs/server";

const mockCurrentUser = vi.mocked(currentUser);
const mockAuth = vi.mocked(auth);

describe("auth helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAuthUserId", () => {
    it("returns userId when authenticated", async () => {
      mockAuth.mockResolvedValue({ userId: "user_123" } as any);

      const result = await getAuthUserId();

      expect(result).toBe("user_123");
      expect(mockAuth).toHaveBeenCalledOnce();
    });

    it("returns null when not authenticated", async () => {
      mockAuth.mockResolvedValue({ userId: null } as any);

      const result = await getAuthUserId();

      expect(result).toBeNull();
    });
  });

  describe("getCurrentUser", () => {
    it("returns user object when authenticated", async () => {
      const mockUser = {
        id: "user_123",
        firstName: "John",
        lastName: "Doe",
        emailAddresses: [{ emailAddress: "john@example.com" }],
      };
      mockCurrentUser.mockResolvedValue(mockUser as any);

      const result = await getCurrentUser();

      expect(result).toEqual(mockUser);
      expect(mockCurrentUser).toHaveBeenCalledOnce();
    });

    it("returns null when not authenticated", async () => {
      mockCurrentUser.mockResolvedValue(null);

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });
  });
});
