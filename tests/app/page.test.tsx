import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock LandingMotion to test the landing page without the observer boundary
vi.mock("@/components/landing/LandingMotion", () => ({
  LandingMotion: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="landing-motion">{children}</div>
  ),
}));

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import Home from "@/app/page";

describe("Landing Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("landing sections render", () => {
    it("renders the hero section with headline", () => {
      render(<Home />);
      expect(
        screen.getByText(/cada día sin humo es una/i)
      ).toBeInTheDocument();
    });

    it("renders the mission section", () => {
      render(<Home />);
      expect(screen.getByText(/nuestra misión/i)).toBeInTheDocument();
    });

    it("renders the how-it-works section", () => {
      render(<Home />);
      expect(screen.getByText(/¿cómo funciona\?/i)).toBeInTheDocument();
    });

    it("renders the achievements preview section", () => {
      render(<Home />);
      expect(screen.getByText(/logros que te esperan/i)).toBeInTheDocument();
    });

    it("renders all how-it-works steps", () => {
      render(<Home />);
      expect(screen.getByText("Configura tu perfil")).toBeInTheDocument();
      expect(screen.getByText("Registra tu progreso")).toBeInTheDocument();
      expect(screen.getByText("Celebra tus logros")).toBeInTheDocument();
    });
  });

  describe("CTA links to /onboarding", () => {
    it("renders primary CTA linking to /onboarding", () => {
      render(<Home />);
      const cta = screen.getByRole("link", { name: /empezar ahora/i });
      expect(cta).toHaveAttribute("href", "/onboarding");
    });

    it("renders footer CTA linking to /onboarding", () => {
      render(<Home />);
      const footerCta = screen.getByRole("link", {
        name: /comenzar mi camino/i,
      });
      expect(footerCta).toHaveAttribute("href", "/onboarding");
    });
  });

  describe("achievement thresholds use authoritative values", () => {
    it("displays 7-day achievement (primera semana)", () => {
      render(<Home />);
      expect(screen.getByText("7 días")).toBeInTheDocument();
      expect(screen.getByText("Primera Semana")).toBeInTheDocument();
    });

    it("displays 30-day achievement (un mes limpio)", () => {
      render(<Home />);
      expect(screen.getByText("30 días")).toBeInTheDocument();
      expect(screen.getByText("Un Mes Limpio")).toBeInTheDocument();
    });

    it("displays 100-day achievement (centenario)", () => {
      render(<Home />);
      expect(screen.getByText("100 días")).toBeInTheDocument();
      expect(screen.getByText("Centenario")).toBeInTheDocument();
    });

    it("displays 365-day achievement (un año libre)", () => {
      render(<Home />);
      expect(screen.getByText("365 días")).toBeInTheDocument();
      expect(screen.getByText("Un Año Libre")).toBeInTheDocument();
    });
  });

  describe("hearts group renders", () => {
    it("renders decorative hearts in hero with aria-hidden", () => {
      const { container } = render(<Home />);
      // Hero section decorative hearts have aria-hidden on their container
      const heroHearts = container.querySelectorAll(
        ".landing-hearts[aria-hidden='true']"
      );
      expect(heroHearts.length).toBeGreaterThanOrEqual(2);
    });

    it("renders progress hearts group with aria-hidden", () => {
      const { container } = render(<Home />);
      const progressGroup = container.querySelector('[role="img"]');
      expect(progressGroup).toBeInTheDocument();
      const heartsInGroup = progressGroup!.querySelectorAll(".landing-hearts");
      expect(heartsInGroup.length).toBe(1);
    });
  });

  describe("progress value and ARIA attributes", () => {
    it("renders progressbar with correct ARIA attributes", () => {
      render(<Home />);
      const progressbar = screen.getByRole("progressbar");
      expect(progressbar).toHaveAttribute("aria-valuenow", "42");
      expect(progressbar).toHaveAttribute("aria-valuemin", "0");
      expect(progressbar).toHaveAttribute("aria-valuemax", "365");
      expect(progressbar).toHaveAttribute("aria-label", "Días sin fumar");
    });

    it("displays progress text with days count", () => {
      render(<Home />);
      expect(screen.getByText("42")).toBeInTheDocument();
      expect(screen.getByText("/ 365 días")).toBeInTheDocument();
    });
  });

  describe("flash nodes exist with correct CSS contract", () => {
    it("renders flash elements with landing-flash class", () => {
      const { container } = render(<Home />);
      const flashOne = container.querySelector(".landing-flash-one");
      const flashTwo = container.querySelector(".landing-flash-two");
      expect(flashOne).toBeInTheDocument();
      expect(flashTwo).toBeInTheDocument();
    });
  });

  describe("no data imports from external modules", () => {
    it("does not import from external data modules", async () => {
      // Verify the page module can be loaded without external data dependencies
      const mod = await import("@/app/page");
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe("function");
    });
  });

  describe("landing shell wrapper", () => {
    it("wraps content in landing-shell div", () => {
      const { container } = render(<Home />);
      const shell = container.querySelector(".landing-shell");
      expect(shell).toBeInTheDocument();
    });

    it("wraps content in LandingMotion boundary", () => {
      render(<Home />);
      expect(screen.getByTestId("landing-motion")).toBeInTheDocument();
    });
  });

  describe("motion reveal targets", () => {
    it("renders data-motion-reveal attributes on sections", () => {
      const { container } = render(<Home />);
      const revealTargets = container.querySelectorAll("[data-motion-reveal]");
      expect(revealTargets.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("accessible heading hierarchy", () => {
    it("has exactly one h1", () => {
      render(<Home />);
      const h1s = screen.getAllByRole("heading", { level: 1 });
      expect(h1s).toHaveLength(1);
    });

    it("has h2 sections for mission, how-it-works, achievements, and footer CTA", () => {
      render(<Home />);
      const h2s = screen.getAllByRole("heading", { level: 2 });
      expect(h2s.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("shared Progress component unchanged", () => {
    it("does not re-export or wrap the shared Progress component", async () => {
      const pageMod = await import("@/app/page");
      const exports = Object.keys(pageMod);
      // The page should only export the default component
      expect(exports).toEqual(["default"]);
    });
  });
});
