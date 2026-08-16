import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsTabs } from "@/components/settings/SettingsTabs";

// Mock child components to avoid their internal dependencies
vi.mock("@/components/settings/ProfileSection", () => ({
  ProfileSection: ({ userId }: { userId: string }) => (
    <div data-testid="profile-section">Profile for {userId}</div>
  ),
}));

vi.mock("@/components/settings/PreferencesSection", () => ({
  PreferencesSection: ({ userId }: { userId: string }) => (
    <div data-testid="preferences-section">Preferences for {userId}</div>
  ),
}));

vi.mock("@/components/settings/DataSection", () => ({
  DataSection: ({ userId }: { userId: string }) => (
    <div data-testid="data-section">Data for {userId}</div>
  ),
}));

describe("SettingsTabs", () => {
  it("renders visible tabs", () => {
    render(
      <SettingsTabs
        userId="user-1"
        profile={null}
        preferences={null}
        onboarding={null}
        userEmail={null}
      />
    );

    expect(screen.getByText("Perfil")).toBeInTheDocument();
    expect(screen.getByText("Preferencias")).toBeInTheDocument();
    expect(screen.getByText("Datos")).toBeInTheDocument();
    // Account and Danger tabs should NOT be rendered
    expect(screen.queryByText("Cuenta")).not.toBeInTheDocument();
    expect(screen.queryByText("Peligro")).not.toBeInTheDocument();
  });

  it("defaults to profile tab", () => {
    render(
      <SettingsTabs
        userId="user-1"
        profile={null}
        preferences={null}
        onboarding={null}
        userEmail={null}
      />
    );

    expect(screen.getByTestId("profile-section")).toBeInTheDocument();
    expect(screen.queryByTestId("preferences-section")).not.toBeInTheDocument();
  });

  it("switches active tab on click", async () => {
    const user = userEvent.setup();

    render(
      <SettingsTabs
        userId="user-1"
        profile={null}
        preferences={null}
        onboarding={null}
        userEmail={null}
      />
    );

    await user.click(screen.getByText("Preferencias"));
    expect(screen.getByTestId("preferences-section")).toBeInTheDocument();
    expect(screen.queryByTestId("profile-section")).not.toBeInTheDocument();

    await user.click(screen.getByText("Datos"));
    expect(screen.getByTestId("data-section")).toBeInTheDocument();
  });

  it("passes userId to child sections", async () => {
    const user = userEvent.setup();

    render(
      <SettingsTabs
        userId="user-1"
        profile={null}
        preferences={null}
        onboarding={null}
        userEmail={null}
      />
    );

    await user.click(screen.getByText("Preferencias"));
    expect(screen.getByTestId("preferences-section")).toHaveTextContent("user-1");
  });

  it("renders Lucide icons instead of emojis", () => {
    render(
      <SettingsTabs
        userId="user-1"
        profile={null}
        preferences={null}
        onboarding={null}
        userEmail={null}
      />
    );

    // Should not have emoji spans
    expect(screen.queryByText("👤")).not.toBeInTheDocument();
    expect(screen.queryByText("🔔")).not.toBeInTheDocument();
    expect(screen.queryByText("📦")).not.toBeInTheDocument();
  });
});
