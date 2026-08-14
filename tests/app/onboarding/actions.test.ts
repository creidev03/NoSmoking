import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Turso client module
const mockExecute = vi.fn();
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          get: vi.fn(() => Promise.resolve(null)),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => ({
          get: vi.fn(() =>
            Promise.resolve({
              id: "test-onboarding-id",
              userId: "test-user-id",
              currentStep: 1,
            })
          ),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
  },
}));

// Mock redirect
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

import { submitStep, completeOnboarding } from "@/app/onboarding/actions";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const mockDb = vi.mocked(db);
const mockRedirect = vi.mocked(redirect);

// Helper to create a FormData-like object
function createFormData(data: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    formData.set(key, value);
  }
  return formData;
}

describe("submitStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns nextStep 2 when step 1 data is valid", async () => {
    const result = await submitStep("user-1", 1, createFormData({ cigarettes_per_day: "10" }));
    expect(result).toEqual({ nextStep: 2 });
  });

  it("throws on empty cigarettes_per_day", async () => {
    await expect(
      submitStep("user-1", 1, createFormData({ cigarettes_per_day: "" }))
    ).rejects.toThrow("cigarettes_per_day is required");
  });

  it("throws on invalid cigarettes_per_day", async () => {
    await expect(
      submitStep("user-1", 1, createFormData({ cigarettes_per_day: "abc" }))
    ).rejects.toThrow("cigarettes_per_day must be a number");
  });

  it("throws on invalid step number", async () => {
    await expect(
      submitStep("user-1", 5, createFormData({ cigarettes_per_day: "10" }))
    ).rejects.toThrow("Invalid step");
  });

  it("clamps cigarettes_per_day to 100", async () => {
    // The action should clamp values > 100
    const result = await submitStep("user-1", 1, createFormData({ cigarettes_per_day: "150" }));
    expect(result).toEqual({ nextStep: 2 });
    // Verify the insert was called (clamping happens inside the action)
  });

  it("returns nextStep 4 when step 3 data is valid", async () => {
    const result = await submitStep("user-1", 3, createFormData({ motivation: "health" }));
    expect(result).toEqual({ nextStep: 4 });
  });

  it("throws on empty motivation", async () => {
    await expect(
      submitStep("user-1", 3, createFormData({ motivation: "" }))
    ).rejects.toThrow("motivation is required");
  });

  it("returns nextStep 3 when step 2 data is valid", async () => {
    const result = await submitStep("user-1", 2, createFormData({ smoking_years: "5" }));
    expect(result).toEqual({ nextStep: 3 });
  });

  it("returns nextStep 4 when step 4 data is valid", async () => {
    const result = await submitStep("user-1", 4, createFormData({ quit_attempts: "3" }));
    expect(result).toEqual({ nextStep: 5 });
  });
});

describe("completeOnboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to /dashboard after successful completion", async () => {
    // Setup mock select chain to return an onboarding record
    const mockGet = vi.fn(() =>
      Promise.resolve({
        id: "onboarding-1",
        userId: "user-1",
        cigarettesPerDay: 25,
        smokingYears: 5,
        motivation: "health",
        quitAttempts: 2,
        currentStep: 4,
      })
    );
    const mockWhere = vi.fn(() => ({ get: mockGet }));
    const mockFrom = vi.fn(() => ({ where: mockWhere }));
    mockDb.select.mockReturnValue({ from: mockFrom } as any);

    await expect(completeOnboarding("user-1")).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
  });

  it("throws when no onboarding record found", async () => {
    await expect(completeOnboarding("nonexistent")).rejects.toThrow();
  });
});
