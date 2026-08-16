import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
const mockCurrentUser = vi.hoisted(() => vi.fn());
const mockSendFeedbackEmail = vi.hoisted(() => vi.fn());
const mockRequireAuth = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs/server", () => ({
  currentUser: mockCurrentUser,
}));

vi.mock("@/lib/auth-guard", () => ({
  requireAuth: mockRequireAuth,
}));

vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  },
}));

vi.mock("@/lib/feedback", () => ({
  sendFeedbackEmail: mockSendFeedbackEmail,
}));

// Import after mocks are set up
import { submitFeedback } from "@/app/[locale]/dashboard/settings/actions";
import { db } from "@/lib/db";
import { feedback } from "@/db/schema";

describe("submitFeedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue({ userId: "user-123" });
    mockCurrentUser.mockResolvedValue({ id: "user-123", emailAddresses: [{ emailAddress: "test@example.com" }] });
    mockSendFeedbackEmail.mockResolvedValue({ success: true });
  });

  it("returns success with valid inputs", async () => {
    const result = await submitFeedback({
      type: "bug",
      subject: "Test subject",
      message: "Test message content",
    });

    expect(result).toEqual({ success: true });
  });

  it("rejects empty subject", async () => {
    const result = await submitFeedback({
      type: "bug",
      subject: "",
      message: "Test message",
    });

    expect(result).toEqual({ success: false, error: "subject_required" });
  });

  it("rejects empty message", async () => {
    const result = await submitFeedback({
      type: "bug",
      subject: "Test subject",
      message: "",
    });

    expect(result).toEqual({ success: false, error: "message_required" });
  });

  it("rejects subject longer than 200 characters", async () => {
    const result = await submitFeedback({
      type: "bug",
      subject: "a".repeat(201),
      message: "Test message",
    });

    expect(result).toEqual({ success: false, error: "subject_too_long" });
  });

  it("rejects message longer than 2000 characters", async () => {
    const result = await submitFeedback({
      type: "bug",
      subject: "Test subject",
      message: "a".repeat(2001),
    });

    expect(result).toEqual({ success: false, error: "message_too_long" });
  });

  it("rejects invalid type", async () => {
    const result = await submitFeedback({
      type: "invalid",
      subject: "Test subject",
      message: "Test message",
    });

    expect(result).toEqual({ success: false, error: "invalid_type" });
  });

  it("returns error when user is not authenticated", async () => {
    mockRequireAuth.mockRejectedValue(new Error("Unauthorized"));

    const result = await submitFeedback({
      type: "bug",
      subject: "Test subject",
      message: "Test message",
    });

    expect(result).toEqual({ success: false, error: "unauthorized" });
  });

  it("returns email_failed when email send fails", async () => {
    mockSendFeedbackEmail.mockResolvedValue({ success: false, error: "email_failed" });

    const result = await submitFeedback({
      type: "bug",
      subject: "Test subject",
      message: "Test message",
    });

    expect(result).toEqual({ success: false, error: "email_failed" });
  });

  it("accepts improvement type", async () => {
    const result = await submitFeedback({
      type: "improvement",
      subject: "Add dark mode",
      message: "It would be nice to have dark mode",
    });

    expect(result).toEqual({ success: true });
  });

  it("accepts subject at max length (200 chars)", async () => {
    const result = await submitFeedback({
      type: "bug",
      subject: "a".repeat(200),
      message: "Test message",
    });

    expect(result).toEqual({ success: true });
  });

  it("accepts message at max length (2000 chars)", async () => {
    const result = await submitFeedback({
      type: "bug",
      subject: "Test subject",
      message: "a".repeat(2000),
    });

    expect(result).toEqual({ success: true });
  });

  it("updates status to 'sent' and sets sentAt after successful email", async () => {
    await submitFeedback({
      type: "bug",
      subject: "Test subject",
      message: "Test message",
    });

    expect(db.update).toHaveBeenCalledWith(feedback);
    const setCall = (db.update as ReturnType<typeof vi.fn>).mock.results[0].value.set;
    expect(setCall).toHaveBeenCalledWith(
      expect.objectContaining({ status: "sent", sentAt: expect.any(String) })
    );
  });

  it("updates status to 'failed' when email send fails", async () => {
    mockSendFeedbackEmail.mockResolvedValue({ success: false, error: "email_failed" });

    await submitFeedback({
      type: "bug",
      subject: "Test subject",
      message: "Test message",
    });

    expect(db.update).toHaveBeenCalledWith(feedback);
    const setCall = (db.update as ReturnType<typeof vi.fn>).mock.results[0].value.set;
    expect(setCall).toHaveBeenCalledWith(
      expect.objectContaining({ status: "failed" })
    );
  });
});
