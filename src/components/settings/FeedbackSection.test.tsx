import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FeedbackSection } from "./FeedbackSection";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "feedback.title": "Send Feedback",
      "feedback.type.label": "Feedback Type",
      "feedback.type.bug": "Bug Report",
      "feedback.type.improvement": "Improvement",
      "feedback.subject.label": "Subject",
      "feedback.subject.placeholder": "Brief description...",
      "feedback.message.label": "Message",
      "feedback.message.placeholder": "Tell us what happened...",
      "feedback.submit": "Submit Feedback",
      "feedback.success": "Feedback sent! Thank you.",
      "feedback.error.generic": "Failed to send feedback.",
      "feedback.error.subject_required": "Subject is required.",
      "feedback.error.message_required": "Message is required.",
    };
    return translations[key] ?? key;
  },
}));

// Mock the server action
vi.mock("@/app/[locale]/dashboard/settings/actions", () => ({
  submitFeedback: vi.fn(),
}));

import { submitFeedback } from "@/app/[locale]/dashboard/settings/actions";

describe("FeedbackSection", () => {
  const mockSubmitFeedback = vi.mocked(submitFeedback);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form with empty defaults", () => {
    render(<FeedbackSection />);

    expect(screen.getByText("Send Feedback")).toBeInTheDocument();
    expect(screen.getByLabelText("Subject")).toHaveValue("");
    expect(screen.getByLabelText("Message")).toHaveValue("");
  });

  it("renders bug radio as default selected", () => {
    render(<FeedbackSection />);

    const bugRadio = screen.getByLabelText("Bug Report");
    expect(bugRadio).toBeChecked();
  });

  it("renders improvement radio as unselected", () => {
    render(<FeedbackSection />);

    const improvementRadio = screen.getByLabelText("Improvement");
    expect(improvementRadio).not.toBeChecked();
  });

  it("renders submit button", () => {
    render(<FeedbackSection />);

    expect(screen.getByRole("button", { name: "Submit Feedback" })).toBeInTheDocument();
  });

  it("shows subject placeholder", () => {
    render(<FeedbackSection />);

    expect(screen.getByPlaceholderText("Brief description...")).toBeInTheDocument();
  });

  it("shows message placeholder", () => {
    render(<FeedbackSection />);

    expect(screen.getByPlaceholderText("Tell us what happened...")).toBeInTheDocument();
  });

  it("allows typing in subject field", async () => {
    const user = userEvent.setup();
    render(<FeedbackSection />);

    const subjectInput = screen.getByLabelText("Subject");
    await user.type(subjectInput, "My bug report");

    expect(subjectInput).toHaveValue("My bug report");
  });

  it("allows typing in message field", async () => {
    const user = userEvent.setup();
    render(<FeedbackSection />);

    const messageInput = screen.getByLabelText("Message");
    await user.type(messageInput, "Detailed description of the issue");

    expect(messageInput).toHaveValue("Detailed description of the issue");
  });

  it("allows switching feedback type", async () => {
    const user = userEvent.setup();
    render(<FeedbackSection />);

    const improvementRadio = screen.getByLabelText("Improvement");
    await user.click(improvementRadio);

    expect(improvementRadio).toBeChecked();
    expect(screen.getByLabelText("Bug Report")).not.toBeChecked();
  });

  it("shows validation errors for empty fields on submit", async () => {
    const user = userEvent.setup();
    render(<FeedbackSection />);

    await user.click(screen.getByRole("button", { name: "Submit Feedback" }));

    expect(screen.getByText("Subject is required.")).toBeInTheDocument();
    expect(screen.getByText("Message is required.")).toBeInTheDocument();
  });

  it("calls submitFeedback with correct data on valid submission", async () => {
    mockSubmitFeedback.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<FeedbackSection />);

    await user.type(screen.getByLabelText("Subject"), "Test subject");
    await user.type(screen.getByLabelText("Message"), "Test message");
    await user.click(screen.getByRole("button", { name: "Submit Feedback" }));

    expect(mockSubmitFeedback).toHaveBeenCalledWith({
      type: "bug",
      subject: "Test subject",
      message: "Test message",
    });
  });

  it("resets form after successful submission", async () => {
    mockSubmitFeedback.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<FeedbackSection />);

    await user.type(screen.getByLabelText("Subject"), "Test subject");
    await user.type(screen.getByLabelText("Message"), "Test message");
    await user.click(screen.getByRole("button", { name: "Submit Feedback" }));

    expect(screen.getByLabelText("Subject")).toHaveValue("");
    expect(screen.getByLabelText("Message")).toHaveValue("");
  });
});
