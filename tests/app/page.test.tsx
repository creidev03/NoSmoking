import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

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
    expect(screen.getByText(/un camino amable para empezar/i)).toBeInTheDocument();
    expect(screen.getByText(/lo que ganas al dejarlo/i)).toBeInTheDocument();
    expect(screen.getByText(/un ejemplo de progreso/i)).toBeInTheDocument();
    expect(screen.getByText(/reconocimientos que vas construyendo/i)).toBeInTheDocument();
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

  it("renders the dashboard screenshot inside a phone frame in the hero", () => {
    const { container } = render(<Home />);
    const screenshot = screen.getByRole("img", { name: /vista previa del panel de progreso/i });
    expect(screenshot).toHaveAttribute("src", "/dashboard-preview.png");
    expect(container.querySelector(".landing-phone-frame")).toBeInTheDocument();
    expect(screen.getByText(/así se ve tu progreso, directo desde la app/i)).toBeInTheDocument();
  });

  it("renders the ordered public achievement roadmap without claiming progress", () => {
    const { container } = render(<Home />);
    const cards = container.querySelectorAll("[data-testid='achievement-roadmap-card']");

    expect(cards).toHaveLength(4);
    expect(Array.from(cards).map((card) => card.querySelector("img")?.getAttribute("src"))).toEqual([
      "/achievements/T001.svg",
      "/achievements/P002.svg",
      "/achievements/A003.svg",
      "/achievements/default.svg",
    ]);
    expect(Array.from(cards).map((card) => card.textContent?.trim())).toEqual([
      "Primera Semana",
      "10 Vidas Ahorradas",
      "50 Acciones",
      "Logro oculto",
    ]);
    expect(screen.getByText(/reconocimientos que vas construyendo/i)).toBeInTheDocument();
    expect(Array.from(cards).some((card) => /días$/i.test(card.textContent ?? ""))).toBe(false);
    expect(screen.queryByAltText(/corazón/i)).not.toBeInTheDocument();
    for (const asset of ["T001", "P002", "A003"]) {
      expect(screen.getAllByRole("img").some((image) => image.getAttribute("src")?.includes(`/achievements/${asset}.svg`))).toBe(true);
    }
  });

  it("keeps the hidden achievement generic in public markup and accessibility output", () => {
    const { container } = render(<Home />);
    const hiddenCard = container.querySelectorAll("[data-testid='achievement-roadmap-card']")[3];

    expect(hiddenCard).toHaveTextContent("Logro oculto");
    expect(hiddenCard.querySelector("img")).toHaveAttribute("src", "/achievements/default.svg");
    expect(hiddenCard.querySelector("img")).toHaveAttribute("alt", "Logro oculto");
    expect(hiddenCard.textContent).not.toMatch(/secreta|medianoche/i);
    expect(container.innerHTML).not.toMatch(/A005|Acción Secreta|medianoche|specific_actions/i);
  });

  it("keeps presentation anonymous and explains the cigarette-life cycle", () => {
    render(<Home />);
    expect(screen.getByText(/este ejemplo es ilustrativo/i)).toBeInTheDocument();
    expect(screen.getByText(/quinto cigarrillo registrado/i)).toBeInTheDocument();
    expect(screen.getByText(/pierdes una vida/i)).toBeInTheDocument();
    expect(screen.getByText(/reinicia el ciclo de cigarrillos/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /tres ideas para entender el camino/i })).toBeInTheDocument();
    expect(screen.getByText(/^una vida$/i)).toBeInTheDocument();
    expect(screen.getByText(/^registra un cigarrillo$/i)).toBeInTheDocument();
    expect(screen.getByText(/^suma acciones positivas$/i)).toBeInTheDocument();
  });

  it("makes heart feedback keyboard-safe without making it navigation or state", () => {
    render(<Home />);
    const hearts = screen.getAllByRole("button", { name: /ver una señal de avance/i });
    expect(hearts.length).toBeGreaterThan(0);
    hearts.forEach((heart) => expect(heart).toHaveAttribute("type", "button"));
    expect(screen.getAllByRole("link", { name: "Empezar" })).toHaveLength(3);
  });

  it("keeps decorative effects and content motion scoped", () => {
    const { container } = render(<Home />);
    expect(container.querySelector(".landing-shell")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-motion-reveal]").length).toBeGreaterThanOrEqual(5);
    expect(container.querySelector(".landing-phone-frame")).toBeInTheDocument();
    expect(container.querySelectorAll(".landing-heart").length).toBeGreaterThanOrEqual(3);
  });

  it("does not import database, auth, or achievement state", () => {
    const source = require("fs").readFileSync(
      require("path").resolve(__dirname, "../../src/app/page.tsx"),
      "utf-8"
    );
    expect(source).not.toMatch(/@\/lib\/(db|auth|achievements)/);
  });

  it("uses an explicit public allowlist instead of deprecated badge thresholds", () => {
    const source = require("fs").readFileSync(
      require("path").resolve(__dirname, "../../src/app/page.tsx"),
      "utf-8",
    );
    expect(source).not.toMatch(/BADGE_THRESHOLDS|getBadgePresentation/);
    expect(source).toMatch(/id:\s*["']T001["']/);
    expect(source).toMatch(/id:\s*["']P002["']/);
    expect(source).toMatch(/id:\s*["']A003["']/);
    expect(source).toMatch(/id:\s*["']A005["']/);
    const roadmapSource = source.match(/const PUBLIC_ACHIEVEMENT_ROADMAP[\s\S]*?\];/)?.[0] ?? "";
    expect(roadmapSource).not.toMatch(/condition|description|category|isSecret/);
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
    expect(styles).toMatch(/\.landing-shell[^}]*\.landing-heart-button/);
    expect(styles).toMatch(/min-width:\s*3rem/);
    expect(styles).toMatch(/:active/);
  });

  it("renders decorative flash elements only as hidden presentation", () => {
    const { container } = render(<Home />);
    const flashes = container.querySelectorAll(".landing-flash");

    expect(flashes).toHaveLength(4);
    flashes.forEach((flash) => {
      expect(flash).toHaveAttribute("aria-hidden", "true");
    });
  });
});
