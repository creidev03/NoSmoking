import { describe, it, expect } from "vitest";
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

vi.mock("@/components/settings/AccountSection", () => ({
  AccountSection: ({ userId }: { userId: string }) => (
    <div data-testid="account-section">Account for {userId}</div>
  ),
}));

vi.mock("@/components/settings/DataSection", () => ({
  DataSection: ({ userId }: { userId: string }) => (
    <div data-testid="data-section">Data for {userId}</div>
  ),
}));

vi.mock("@/components/settings/DangerZone", () => ({
  DangerZone: ({ userId }: { userId: string }) => (
    <div data-testid="danger-section">Danger for {userId}</div>
  ),
}));

describe("SettingsTabs", () => {
  it("renders all tabs", () => {
    render(
      <SettingsTabs userId="user-1" profile={null} preferences={null} />
    );

    expect(screen.getByText("Perfil")).toBeInTheDocument();
    expect(screen.getByText("Preferencias")).toBeInTheDocument();
    expect(screen.getByText("Cuenta")).toBeInTheDocument();
    expect(screen.getByText("Datos")).toBeInTheDocument();
    expect(screen.getByText("Peligro")).toBeInTheDocument();
  });

  it("defaults to profile tab", () => {
    render(
      <SettingsTabs userId="user-1" profile={null} preferences={null} />
    );

    expect(screen.getByTestId("profile-section")).toBeInTheDocument();
    expect(screen.queryByTestId("preferences-section")).not.toBeInTheDocument();
  });

  it("switches active tab on click", async () => {
    const user = userEvent.setup();

    render(
      <SettingsTabs userId="user-1" profile={null} preferences={null} />
    );

    await user.click(screen.getByText("Preferencias"));
    expect(screen.getByTestId("preferences-section")).toBeInTheDocument();
    expect(screen.queryByTestId("profile-section")).not.toBeInTheDocument();

    await user.click(screen.getByText("Cuenta"));
    expect(screen.getByTestId("account-section")).toBeInTheDocument();

    await user.click(screen.getByText("Datos"));
    expect(screen.getByTestId("data-section")).toBeInTheDocument();

    await user.click(screen.getByText("Peligro"));
    expect(screen.getByTestId("danger-section")).toBeInTheDocument();
  });

  it("passes userId to child sections", async () => {
    const user = userEvent.setup();

    render(
      <SettingsTabs userId="user-1" profile={null} preferences={null} />
    );

    await user.click(screen.getByText("Preferencias"));
    expect(screen.getByTestId("preferences-section")).toHaveTextContent("user-1");
  });

  it("renders tab icons", () => {
    render(
      <SettingsTabs userId="user-1" profile={null} preferences={null} />
    );

    expect(screen.getByText("👤")).toBeInTheDocument();
    expect(screen.getByText("🔔")).toBeInTheDocument();
    expect(screen.getByText("🔐")).toBeInTheDocument();
    expect(screen.getByText("📦")).toBeInTheDocument();
    expect(screen.getByText("⚠️")).toBeInTheDocument();
  });
});
