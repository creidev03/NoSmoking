import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileSection } from "@/components/settings/ProfileSection";

// Mock server action
const mockUpdateUserProfile = vi.fn();
vi.mock("@/app/[locale]/dashboard/settings/actions", () => ({
  updateUserProfile: (...args: any[]) => mockUpdateUserProfile(...args),
}));

describe("ProfileSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateUserProfile.mockResolvedValue({ success: true });
  });

  it("renders profile fields", () => {
    render(
      <ProfileSection
        userId="user-1"
        profile={{
          id: "p-1",
          userId: "user-1",
          avatarUrl: null,
          motivations: ["salud", "dinero"],
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        }}
      />
    );

    expect(screen.getByText("Perfil")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Motivaciones para dejar de fumar")).toBeInTheDocument();
    expect(screen.getByText("Salud")).toBeInTheDocument();
    expect(screen.getByText("Dinero")).toBeInTheDocument();
    expect(screen.getByText("Familia")).toBeInTheDocument();
  });

  it("highlights selected motivations", () => {
    render(
      <ProfileSection
        userId="user-1"
        profile={{
          id: "p-1",
          userId: "user-1",
          avatarUrl: null,
          motivations: ["salud"],
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        }}
      />
    );

    const saludBtn = screen.getByText("Salud").closest("button")!;
    const dineroBtn = screen.getByText("Dinero").closest("button")!;

    expect(saludBtn.className).toContain("border-primary");
    expect(dineroBtn.className).not.toContain("border-primary");
  });

  it("shows avatar placeholder when no URL", () => {
    render(
      <ProfileSection
        userId="user-1"
        profile={{
          id: "p-1",
          userId: "user-1",
          avatarUrl: null,
          motivations: null,
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        }}
      />
    );

    expect(screen.getByText("👤")).toBeInTheDocument();
  });

  it("saves profile changes on button click", async () => {
    const user = userEvent.setup();

    render(
      <ProfileSection
        userId="user-1"
        profile={{
          id: "p-1",
          userId: "user-1",
          avatarUrl: null,
          motivations: [],
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        }}
      />
    );

    // Toggle salud motivation
    await user.click(screen.getByText("Salud"));

    // Save
    await user.click(screen.getByText("Guardar cambios"));

    expect(mockUpdateUserProfile).toHaveBeenCalledWith("user-1", {
      motivations: ["salud"],
    });
  });

  it("shows saved confirmation after save", async () => {
    const user = userEvent.setup();

    render(
      <ProfileSection
        userId="user-1"
        profile={{
          id: "p-1",
          userId: "user-1",
          avatarUrl: null,
          motivations: [],
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        }}
      />
    );

    await user.click(screen.getByText("Guardar cambios"));

    expect(await screen.findByText("✓ Guardado")).toBeInTheDocument();
  });

  it("handles null profile gracefully", () => {
    render(<ProfileSection userId="user-1" profile={null} />);

    expect(screen.getByText("Perfil")).toBeInTheDocument();
    expect(screen.getByText("👤")).toBeInTheDocument();
  });
});
