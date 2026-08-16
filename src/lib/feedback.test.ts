import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSend = vi.hoisted(() => vi.fn());

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

import { sendFeedbackEmail } from "@/lib/feedback";

describe("sendFeedbackEmail", () => {
  const validParams = {
    type: "bug",
    subject: "App crashes on login",
    message: "When I click login, the app crashes with a white screen.",
    userEmail: "user@test.com",
    userId: "user-123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockResolvedValue({ data: { id: "email-1" }, error: null });
  });

  it("sends email with correct subject line format", async () => {
    await sendFeedbackEmail(validParams);

    expect(mockSend).toHaveBeenCalledOnce();
    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.subject).toBe("[NoSmoking] bug: App crashes on login");
  });

  it("sends email to creidev03@gmail.com", async () => {
    await sendFeedbackEmail(validParams);

    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.to).toBe("creidev03@gmail.com");
  });

  it("sends email from NoSmoking App", async () => {
    await sendFeedbackEmail(validParams);

    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.from).toBe("NoSmoking App <onboarding@resend.dev>");
  });

  it("includes user ID, type, subject, and message in body", async () => {
    await sendFeedbackEmail(validParams);

    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.text).toContain("user-123");
    expect(callArgs.text).toContain("bug");
    expect(callArgs.text).toContain("App crashes on login");
    expect(callArgs.text).toContain("When I click login, the app crashes");
  });

  it("returns success on successful send", async () => {
    const result = await sendFeedbackEmail(validParams);

    expect(result).toEqual({ success: true });
  });

  it("returns error when Resend API fails", async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: "Invalid API key" } });

    const result = await sendFeedbackEmail(validParams);

    expect(result).toEqual({ success: false, error: "email_failed" });
  });

  it("formats improvement type in subject line", async () => {
    await sendFeedbackEmail({ ...validParams, type: "improvement", subject: "Add dark mode" });

    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.subject).toBe("[NoSmoking] improvement: Add dark mode");
  });

  it("includes timestamp in email body", async () => {
    await sendFeedbackEmail(validParams);

    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.text).toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});
