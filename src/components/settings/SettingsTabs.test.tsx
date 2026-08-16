import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsTabs } from "./SettingsTabs";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "tabs.profile": "Profile",
      "tabs.preferences": "Preferences",
      "tabs.data": "Data",
      "tabs.feedback": "Feedback",
    };
    return translations[key] ?? key;
  },
}));

// Mock child components
vi.mock("./ProfileSection", () => ({
  ProfileSection: () => <div data-testid="profile-section">Profile</div>,
}));
vi.mock("./PreferencesSection", () => ({
  PreferencesSection: () => <div data-testid="preferences-section">Preferences</div>,
}));
vi.mock("./DataSection", () => ({
  DataSection: () => <div data-testid="data-section">Data</div>,
}));
vi.mock("./FeedbackSection", () => ({
  FeedbackSection: () => <div data-testid="feedback-section">Feedback</div>,
}));

describe("SettingsTabs", () => {
  const defaultProps = {
    userId: "user-123",
    profile: null,
    preferences: null,
    onboarding: null,
    userEmail: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location
    Object.defineProperty(window, "location", {
      value: { href: "http://localhost:3000/settings", search: "" },
      writable: true,
    });
    // Mock history.replaceState
    window.history.replaceState = vi.fn();
  });

  it("renders four tab buttons", () => {
    render(<SettingsTabs {...defaultProps} />);

    expect(screen.getByRole("button", { name: /Profile/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Preferences/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Data/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Feedback/ })).toBeInTheDocument();
  });

  it("renders feedback tab as the last tab", () => {
    render(<SettingsTabs {...defaultProps} />);

    const tabs = screen.getAllByRole("button");
    const tabLabels = tabs.map((tab) => tab.textContent?.trim());
    expect(tabLabels).toEqual(["Profile", "Preferences", "Data", "Feedback"]);
  });

  it("shows ProfileSection by default", () => {
    render(<SettingsTabs {...defaultProps} />);

    expect(screen.getByTestId("profile-section")).toBeInTheDocument();
  });

  it("shows FeedbackSection when feedback tab is clicked", async () => {
    const user = userEvent.setup();
    render(<SettingsTabs {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /Feedback/ }));

    expect(screen.getByTestId("feedback-section")).toBeInTheDocument();
    expect(screen.queryByTestId("profile-section")).not.toBeInTheDocument();
  });

  it("updates URL query param when feedback tab is clicked", async () => {
    const user = userEvent.setup();
    render(<SettingsTabs {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /Feedback/ }));

    expect(window.history.replaceState).toHaveBeenCalled();
  });
});
