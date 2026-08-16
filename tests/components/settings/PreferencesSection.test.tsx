import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PreferencesSection } from "@/components/settings/PreferencesSection";

// Mock server actions
const mockUpdateUserPreferences = vi.fn();
vi.mock("@/app/[locale]/dashboard/settings/actions", () => ({
  updateUserPreferences: (...args: any[]) => mockUpdateUserPreferences(...args),
}));

// Mock next-intl useLocale
vi.mock("next-intl", () => ({
  useLocale: () => "es",
}));

// Mock useTheme
const mockSetTheme = vi.fn();
vi.mock("@/hooks/useTheme", () => ({
  useTheme: (_initialTheme?: string) => ({
    theme: _initialTheme ?? "system",
    resolvedTheme: "light",
    setTheme: mockSetTheme,
    toggleTheme: vi.fn(),
    mounted: true,
  }),
}));

// Mock i18n/navigation
const mockReplace = vi.fn();
vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => "/dashboard/settings",
}));

describe("PreferencesSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateUserPreferences.mockResolvedValue({ success: true });
    document.documentElement.classList.remove("dark");
  });

  it("renders all preference fields", () => {
    render(
      <PreferencesSection
        userId="user-1"
        preferences={{
          id: "p-1",
          userId: "user-1",
          notificationsEnabled: true,
          reminderInterval: "6h",
          language: "es",
          theme: "auto",
          soundsEnabled: true,
          updatedAt: "2026-01-01T00:00:00Z",
        }}
      />
    );

    expect(screen.getByText("Preferencias")).toBeInTheDocument();
    expect(screen.getByText("Notificaciones push")).toBeInTheDocument();
    expect(screen.getByText("Idioma")).toBeInTheDocument();
    expect(screen.getByText("Tema")).toBeInTheDocument();
    expect(screen.getByText("Sonidos")).toBeInTheDocument();
    expect(screen.getByText("Guardar preferencias")).toBeInTheDocument();
  });

  it("calls setTheme after successful save when theme changed", async () => {
    const user = userEvent.setup();

    render(
      <PreferencesSection
        userId="user-1"
        preferences={{
          id: "p-1",
          userId: "user-1",
          notificationsEnabled: true,
          reminderInterval: "6h",
          language: "es",
          theme: "light",
          soundsEnabled: true,
          updatedAt: "2026-01-01T00:00:00Z",
        }}
      />
    );

    // Change theme to dark
    const themeSelect = screen.getByDisplayValue("Claro");
    await user.selectOptions(themeSelect, "dark");

    // Save
    await user.click(screen.getByText("Guardar preferencias"));

    await waitFor(() => {
      expect(mockUpdateUserPreferences).toHaveBeenCalledWith("user-1", {
        notificationsEnabled: true,
        reminderInterval: "6h",
        language: "es",
        theme: "dark",
        soundsEnabled: true,
      });
    });

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("does not redirect when language is unchanged", async () => {
    const user = userEvent.setup();

    render(
      <PreferencesSection
        userId="user-1"
        preferences={{
          id: "p-1",
          userId: "user-1",
          notificationsEnabled: true,
          reminderInterval: "6h",
          language: "es",
          theme: "auto",
          soundsEnabled: true,
          updatedAt: "2026-01-01T00:00:00Z",
        }}
      />
    );

    // Change theme only (language stays "es")
    const themeSelect = screen.getByDisplayValue("Automático");
    await user.selectOptions(themeSelect, "dark");

    // Save
    await user.click(screen.getByText("Guardar preferencias"));

    await waitFor(() => {
      expect(mockUpdateUserPreferences).toHaveBeenCalled();
    });

    // router.replace should NOT be called since language is unchanged
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("redirects when language changes on save", async () => {
    const user = userEvent.setup();

    render(
      <PreferencesSection
        userId="user-1"
        preferences={{
          id: "p-1",
          userId: "user-1",
          notificationsEnabled: true,
          reminderInterval: "6h",
          language: "es",
          theme: "auto",
          soundsEnabled: true,
          updatedAt: "2026-01-01T00:00:00Z",
        }}
      />
    );

    // Change language to English
    const langSelect = screen.getByDisplayValue("Español");
    await user.selectOptions(langSelect, "en");

    // Save
    await user.click(screen.getByText("Guardar preferencias"));

    await waitFor(() => {
      expect(mockUpdateUserPreferences).toHaveBeenCalledWith(
        "user-1",
        expect.objectContaining({ language: "en" })
      );
    });

    expect(mockReplace).toHaveBeenCalledWith("/en/dashboard/settings");
  });

  it("shows saved confirmation after save", async () => {
    const user = userEvent.setup();

    render(
      <PreferencesSection
        userId="user-1"
        preferences={{
          id: "p-1",
          userId: "user-1",
          notificationsEnabled: true,
          reminderInterval: "6h",
          language: "es",
          theme: "auto",
          soundsEnabled: true,
          updatedAt: "2026-01-01T00:00:00Z",
        }}
      />
    );

    await user.click(screen.getByText("Guardar preferencias"));

    expect(await screen.findByText("✓ Guardado")).toBeInTheDocument();
  });
});
