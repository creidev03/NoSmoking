import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DangerZone } from "@/components/settings/DangerZone";

// Mock server action
const mockResetProgress = vi.fn();
vi.mock("@/app/[locale]/dashboard/settings/actions", () => ({
  resetProgress: (...args: any[]) => mockResetProgress(...args),
}));

describe("DangerZone", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResetProgress.mockResolvedValue({ success: true });
  });

  it("renders danger zone with sections", () => {
    render(<DangerZone userId="user-1" />);

    expect(screen.getByText("⚠️ Zona de peligro")).toBeInTheDocument();
    expect(screen.getAllByText("Reiniciar progreso").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Eliminar cuenta").length).toBeGreaterThanOrEqual(1);
  });

  it("shows confirmation modal for reset", async () => {
    const user = userEvent.setup();

    render(<DangerZone userId="user-1" />);

    await user.click(screen.getByTestId("reset-progress-btn"));

    expect(screen.getByText("⚠️ Reiniciar progreso")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("REINICIAR")).toBeInTheDocument();
  });

  it("enables reset button only when correct text is typed", async () => {
    const user = userEvent.setup();

    render(<DangerZone userId="user-1" />);

    await user.click(screen.getByTestId("reset-progress-btn"));

    const input = screen.getByPlaceholderText("REINICIAR");
    const confirmBtn = screen.getByRole("button", { name: "Reiniciar" });

    // Initially disabled
    expect(confirmBtn).toBeDisabled();

    // Wrong text
    await user.type(input, "RESET");
    expect(confirmBtn).toBeDisabled();

    // Correct text
    await user.clear(input);
    await user.type(input, "REINICIAR");
    expect(confirmBtn).not.toBeDisabled();
  });

  it("shows confirmation modal for delete", async () => {
    const user = userEvent.setup();

    render(<DangerZone userId="user-1" />);

    await user.click(screen.getByTestId("delete-account-btn"));

    expect(screen.getByText("🗑️ Eliminar cuenta")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("tu@email.com")).toBeInTheDocument();
  });

  it("enables delete button only when email is entered", async () => {
    const user = userEvent.setup();

    render(<DangerZone userId="user-1" />);

    await user.click(screen.getByTestId("delete-account-btn"));

    const input = screen.getByPlaceholderText("tu@email.com");
    const confirmBtn = screen.getByTestId("confirm-delete-btn");

    expect(confirmBtn).toBeDisabled();

    await user.type(input, "test@example.com");
    expect(confirmBtn).not.toBeDisabled();
  });

  it("calls resetProgress when confirmed", async () => {
    const user = userEvent.setup();

    render(<DangerZone userId="user-1" />);

    await user.click(screen.getByTestId("reset-progress-btn"));
    await user.type(screen.getByPlaceholderText("REINICIAR"), "REINICIAR");

    const confirmBtn = screen.getByRole("button", { name: "Reiniciar" });
    await user.click(confirmBtn);

    expect(mockResetProgress).toHaveBeenCalledWith("user-1");
  });

  it("cancels reset modal on cancel click", async () => {
    const user = userEvent.setup();

    render(<DangerZone userId="user-1" />);

    await user.click(screen.getByTestId("reset-progress-btn"));

    expect(screen.getByPlaceholderText("REINICIAR")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByPlaceholderText("REINICIAR")).not.toBeInTheDocument();
  });

  it("shows success message after reset", async () => {
    const user = userEvent.setup();

    render(<DangerZone userId="user-1" />);

    await user.click(screen.getByTestId("reset-progress-btn"));
    await user.type(screen.getByPlaceholderText("REINICIAR"), "REINICIAR");

    const confirmBtn = screen.getByRole("button", { name: "Reiniciar" });
    await user.click(confirmBtn);

    expect(await screen.findByText("✓ Progreso reiniciado correctamente")).toBeInTheDocument();
  });
});
