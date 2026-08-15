import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RelapseTips } from "@/components/dashboard/RelapseTips";

describe("RelapseTips", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <RelapseTips isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders when isOpen is true", () => {
    render(<RelapseTips isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("💡 Tips de Recuperación")).toBeInTheDocument();
  });

  it("shows all tip sections", () => {
    render(<RelapseTips isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("¿Por qué es normal una recaída?")).toBeInTheDocument();
    expect(screen.getByText("¿Qué hacer después de fumar?")).toBeInTheDocument();
    expect(screen.getByText("Herramientas comprobadas")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<RelapseTips isOpen={true} onClose={onClose} />);
    
    fireEvent.click(screen.getByTestId("close-tips-button"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when footer button is clicked", () => {
    const onClose = vi.fn();
    render(<RelapseTips isOpen={true} onClose={onClose} />);
    
    fireEvent.click(screen.getByTestId("close-tips-footer-button"));
    expect(onClose).toHaveBeenCalled();
  });
});
