import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl/server", () => ({
  setRequestLocale: vi.fn(),
  getTranslations: async () => (key: string, params?: Record<string, string | number>) => {
    // Note: getTranslations("settings") scopes the namespace,
    // so t("title") receives just "title", not "settings.title"
    const translations: Record<string, string> = {
      "title": "⚙️ Configuración",
    };
    let value = translations[key] || key;
    if (params) {
      for (const [param, val] of Object.entries(params)) {
        value = value.replace(`{${param}}`, String(val));
      }
    }
    return value;
  },
}));

// Mock Clerk auth (server-only module)
const mockAuth = vi.fn();
vi.mock("@clerk/nextjs/server", () => ({
  auth: (...args: any[]) => mockAuth(...args),
}));

// Mock the db module
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          get: vi.fn(() => Promise.resolve(null)),
          all: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
  },
}));

// Mock server actions
vi.mock("@/app/[locale]/dashboard/settings/actions", () => ({
  getUserProfile: vi.fn(() => Promise.resolve(null)),
  getUserPreferences: vi.fn(() => Promise.resolve(null)),
}));

// Mock redirect
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

// Mock SettingsTabs
vi.mock("@/components/settings/SettingsTabs", () => ({
  SettingsTabs: (props: any) => (
    <div data-testid="settings-tabs">
      <span data-testid="user-id">{props.userId}</span>
    </div>
  ),
}));

import SettingsPage from "@/app/[locale]/dashboard/settings/page";
import { redirect } from "next/navigation";

const mockRedirect = vi.mocked(redirect);

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("redirects to /sign-in when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce({ userId: null });

    await expect(SettingsPage({ params: Promise.resolve({ locale: "es" }) })).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/es/sign-in");
  });

  it("renders settings page when authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: "user-1" });

    const element = await SettingsPage({ params: Promise.resolve({ locale: "es" }) });
    render(element);

    expect(screen.getByText("⚙️ Configuración")).toBeInTheDocument();
    expect(screen.getByTestId("settings-tabs")).toBeInTheDocument();
    expect(screen.getByTestId("user-id")).toHaveTextContent("user-1");
  });

  it("passes userId to SettingsTabs", async () => {
    mockAuth.mockResolvedValue({ userId: "test-user-42" });

    const element = await SettingsPage({ params: Promise.resolve({ locale: "es" }) });
    render(element);

    expect(screen.getByTestId("user-id")).toHaveTextContent("test-user-42");
  });
});
