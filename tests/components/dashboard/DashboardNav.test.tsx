import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "es",
}));

// Mock next/navigation
const mockPathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

// Mock next/link with default export
vi.mock("next/link", () => ({
  default: ({ href, children, className, ...props }: any) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

// Mock Clerk components
vi.mock("@clerk/nextjs", () => ({
  UserButton: ({ ...props }: any) => (
    <div data-testid="user-button" {...props} />
  ),
}));

describe("DashboardNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all 4 nav items (desktop sidebar)", () => {
    mockPathname.mockReturnValue("/es/dashboard");
    const { container } = render(<DashboardNav />);

    // Desktop sidebar has hidden md:flex class
    const sidebar = container.querySelector("aside");
    expect(sidebar).toBeInTheDocument();

    // Check nav items exist in the sidebar
    const sidebarText = sidebar?.textContent ?? "";
    expect(sidebarText).toContain("Home");
    expect(sidebarText).toContain("Logros");
    expect(sidebarText).toContain("Timeline");
    expect(sidebarText).toContain("Configuración");
  });

  it("highlights active route for Home", () => {
    mockPathname.mockReturnValue("/es/dashboard");
    const { container } = render(<DashboardNav />);

    // Find the desktop sidebar links
    const sidebar = container.querySelector("aside");
    const links = sidebar?.querySelectorAll("a") ?? [];
    const homeLink = Array.from(links).find((l) => l.textContent?.includes("Home"));
    expect(homeLink).toHaveClass("text-primary");
  });

  it("highlights active route for Logros", () => {
    mockPathname.mockReturnValue("/es/dashboard/logros");
    const { container } = render(<DashboardNav />);

    const sidebar = container.querySelector("aside");
    const links = sidebar?.querySelectorAll("a") ?? [];
    const logrosLink = Array.from(links).find((l) => l.textContent?.includes("Logros"));
    expect(logrosLink).toHaveClass("text-primary");
  });

  it("highlights active route for Timeline", () => {
    mockPathname.mockReturnValue("/es/dashboard/timeline");
    const { container } = render(<DashboardNav />);

    const sidebar = container.querySelector("aside");
    const links = sidebar?.querySelectorAll("a") ?? [];
    const timelineLink = Array.from(links).find((l) => l.textContent?.includes("Timeline"));
    expect(timelineLink).toHaveClass("text-primary");
  });

  it("highlights active route for Settings", () => {
    mockPathname.mockReturnValue("/es/dashboard/settings");
    const { container } = render(<DashboardNav />);

    const sidebar = container.querySelector("aside");
    const links = sidebar?.querySelectorAll("a") ?? [];
    const settingsLink = Array.from(links).find((l) => l.textContent?.includes("Configuración"));
    expect(settingsLink).toHaveClass("text-primary");
  });

  it("shows user menu on desktop", () => {
    mockPathname.mockReturnValue("/es/dashboard");
    render(<DashboardNav />);

    expect(screen.getByTestId("user-button")).toBeInTheDocument();
  });

  it("renders navigation links with correct hrefs", () => {
    mockPathname.mockReturnValue("/es/dashboard");
    const { container } = render(<DashboardNav />);

    const sidebar = container.querySelector("aside");
    const links = sidebar?.querySelectorAll("a") ?? [];
    const hrefs = Array.from(links).map((link) => link.getAttribute("href"));

    expect(hrefs).toContain("/es/dashboard");
    expect(hrefs).toContain("/es/dashboard/logros");
    expect(hrefs).toContain("/es/dashboard/timeline");
    expect(hrefs).toContain("/es/dashboard/settings");
  });
});
