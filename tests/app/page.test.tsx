import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BADGE_THRESHOLDS } from "@/lib/badges";

vi.mock("@/components/landing/LandingMotion", () => ({
  LandingMotion: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="landing-motion">{children}</div>
  ),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import Home from "@/app/page";

describe("Landing page", () => {
  it("renders the semantic landing structure", () => {
    render(<Home />);
    expect(screen.getByText(/dejarlo no es un momento/i)).toBeInTheDocument();
    expect(screen.getByText(/¿cómo funciona\?/i)).toBeInTheDocument();
    expect(screen.getByText(/lo que ganas al dejarlo/i)).toBeInTheDocument();
    expect(screen.getByText(/un ejemplo de progreso/i)).toBeInTheDocument();
    expect(screen.getByText(/logros que puedes desbloquear/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /hoy también cuenta/i })).toBeInTheDocument();
  });

  it("provides onboarding CTAs", () => {
    render(<Home />);
    const ctas = screen.getAllByRole("link", { name: "Empezar" });
    expect(ctas).toHaveLength(3);
    ctas.forEach((cta) => expect(cta).toHaveAttribute("href", "/onboarding"));
  });

  it("renders all how-it-works steps", () => {
    render(<Home />);
    expect(screen.getByText("Conoce tu punto de partida")).toBeInTheDocument();
    expect(screen.getByText("Avanza un día a la vez")).toBeInTheDocument();
    expect(screen.getByText("Reconoce lo que construyes")).toBeInTheDocument();
  });

  it("renders the illustrative progress semantics", () => {
    render(<Home />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "42");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "365");
    expect(progressbar).toHaveAttribute("aria-label", "Días sin fumar");
    expect(screen.getByRole("img", { name: /ejemplo de progreso/i })).toBeInTheDocument();
  });

  it("renders the authoritative achievement preview with existing heart assets", () => {
    render(<Home />);
    for (const threshold of BADGE_THRESHOLDS) {
      expect(screen.getByText(`${threshold.days} días`)).toBeInTheDocument();
    }
    expect(screen.getByText(/puedes desbloquear/i)).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: "Corazón completo" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("img", { name: "Medio corazón" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("img", { name: "Corazón gris" }).length).toBeGreaterThan(0);
  });

  it("keeps decorative effects and content motion scoped", () => {
    const { container } = render(<Home />);
    expect(container.querySelector(".landing-shell")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-motion-reveal]").length).toBeGreaterThanOrEqual(5);
    expect(container.querySelector("[data-motion-progress='true']")).toBeInTheDocument();
    expect(container.querySelectorAll(".landing-heart").length).toBeGreaterThanOrEqual(3);
  });

  it("does not import database, auth, or achievement state", () => {
    const source = require("fs").readFileSync(
      require("path").resolve(__dirname, "../../src/app/page.tsx"),
      "utf-8"
    );
    expect(source).not.toMatch(/@\/lib\/(db|auth|achievements)/);
  });

  it("derives preview thresholds from the authoritative badge export", () => {
    const source = require("fs").readFileSync(
      require("path").resolve(__dirname, "../../src/app/page.tsx"),
      "utf-8",
    );
    expect(source).toMatch(/BADGE_THRESHOLDS/);
    expect(source).not.toMatch(/days:\s*(7|30|100|365)/);
  });

  it("keeps the footer out of this landing slice", () => {
    render(<Home />);
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  });

  it("scopes brand typography to the landing", () => {
    const layout = require("fs").readFileSync(
      require("path").resolve(__dirname, "../../src/app/layout.tsx"),
      "utf-8",
    );
    const styles = require("fs").readFileSync(
      require("path").resolve(__dirname, "../../src/app/globals.css"),
      "utf-8",
    );
    expect(layout).toMatch(/Poppins/);
    expect(layout).toMatch(/Lora/);
    expect(styles).toMatch(/\.landing-shell[\s\S]*var\(--font-poppins\)/);
    expect(styles).toMatch(/\.landing-shell[\s\S]*var\(--font-lora\)/);
  });

  it("keeps the shared Progress component isolated", async () => {
    const pageModule = await import("@/app/page");
    expect(Object.keys(pageModule)).toEqual(["default"]);
  });

  it("defines scoped motion and accessibility boundaries", () => {
    const styles = require("fs").readFileSync(
      require("path").resolve(__dirname, "../../src/app/globals.css"),
      "utf-8",
    );

    expect(styles).toMatch(/prefers-reduced-motion:\s*reduce/);
    expect(styles).toMatch(/@media\s*\(min-width:\s*768px\)\s*and\s*\(pointer:\s*fine\)/);
    expect(styles).toMatch(/@media\s*\(pointer:\s*coarse\)/);
    expect(styles).toMatch(/\.landing-shell[^}]*overflow-x:\s*clip/);
    expect(styles).toMatch(/\.landing-shell[^}]*:focus-visible/);
  });

  it("renders decorative flash elements only as hidden presentation", () => {
    const { container } = render(<Home />);
    const flashes = container.querySelectorAll(".landing-flash");

    expect(flashes).toHaveLength(2);
    flashes.forEach((flash) => {
      expect(flash).toHaveAttribute("aria-hidden", "true");
    });
  });
});
