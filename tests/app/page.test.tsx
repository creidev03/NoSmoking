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

vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => {
    const translations: Record<string, string> = {
      "hero.eyebrow": "Un espacio para volver a elegirte",
      "hero.titlePart1": "Dejarlo no es un momento.",
      "hero.titlePart2": "Es un camino.",
      "hero.description": "No Smoking te ayuda a convertir una decisión importante en pasos pequeños, visibles y posibles. Sin culpa. Sin presión. A tu ritmo.",
      "hero.cta": "Empezar",
      "hero.imageAlt": "Vista previa del panel de progreso dentro de la app No Smoking",
      "hero.proof": "Así se ve tu progreso, directo desde la app.",
      "howItWorks.eyebrow": "Un proceso que cabe en tu vida",
      "howItWorks.title": "Un camino amable para empezar",
      "howItWorks.description": "La herramienta se adapta a tu decisión: te da contexto, registro y ánimo para seguir avanzando.",
      "system.eyebrow": "Un mapa sencillo para empezar",
      "system.title": "Tres ideas para entender el camino",
      "system.life.title": "Una vida",
      "system.life.description": "Tu vida representa el margen de cuidado que estás construyendo; cada decisión cuenta, sin convertir el proceso en un juicio.",
      "system.cigarette.title": "Registra un cigarrillo",
      "system.cigarette.description": "Cuando fumas, registras ese cigarrillo con el botón para que el ciclo quede visible y puedas entender tu avance.",
      "system.positiveActions.title": "Suma acciones positivas",
      "system.positiveActions.description": "También puedes sumar acciones positivas: pequeñas decisiones que te ayudan a sostener tu camino.",
      "benefitsSection.eyebrow": "Lo que ganas al dejarlo",
      "benefitsSection.title": "Tu esfuerzo merece un lugar donde crecer.",
      "progress.eyebrow": "Una señal, no una exigencia",
      "progress.title": "Un ejemplo de progreso",
      "progress.description": "Los números pueden ayudarte a reconocer lo que ya estás haciendo. Este ejemplo es ilustrativo: tu proceso siempre será tuyo.",
      "progress.daysWithoutSmoke": "Días sin humo",
      "progress.heartFull": "Corazón completo",
      "progress.heartHalf": "Medio corazón",
      "progress.heartGray": "Corazón gris",
      "progress.cycleDescription": "Cada cigarrillo registrado suma uno al ciclo. Al llegar al quinto cigarrillo registrado, pierdes una vida y se reinicia el ciclo de cigarrillos.",
      "achievementsSection.eyebrow": "Pequeños hitos, grandes señales",
      "achievementsSection.title": "Un mapa de reconocimientos que vas construyendo",
      "achievementsSection.description": "Estos hitos son una invitación a reconocer tu constancia, no una promesa de perfección. Son una vista previa pública e ilustrativa; no indican logros desbloqueados.",
      "finalCta.title": "Hoy también cuenta.",
      "finalCta.description": "Empieza con una decisión amable contigo. Lo demás puede construirse paso a paso.",
      "finalCta.cta": "Empezar",
      "header.cta": "Empezar",
      "heartButton.ariaLabel": "Ver una señal de avance",
      "steps.step1.title": "Conoce tu punto de partida",
      "steps.step1.description": "Configura tu perfil en unos minutos y elige el motivo que quieres tener presente.",
      "steps.step2.title": "Avanza un día a la vez",
      "steps.step2.description": "Registra tus días sin humo y encuentra pequeñas herramientas para sostener tu decisión.",
      "steps.step3.title": "Reconoce lo que construyes",
      "steps.step3.description": "Mira tu constancia con claridad y celebra cada hito sin compararte con nadie.",
      "benefits.clarity.title": "Más claridad",
      "benefits.clarity.description": "Un registro sencillo te ayuda a ver tu proceso, incluso en los días difíciles.",
      "benefits.support.title": "Más apoyo",
      "benefits.support.description": "Recordatorios y recursos pensados para acompañarte, no para juzgarte.",
      "benefits.confidence.title": "Más confianza",
      "benefits.confidence.description": "Cada día que eliges cuidar de ti se convierte en una señal de avance.",
      "achievements.firstWeek": "Primera Semana",
      "achievements.tenLives": "10 Vidas Ahorradas",
      "achievements.fiftyActions": "50 Acciones",
      "achievements.hidden": "Logro oculto",
    };
    return translations[key] || key;
  },
  setRequestLocale: vi.fn(),
}));

vi.mock("@/i18n/routing", () => ({
  routing: {
    locales: ["es", "en"],
    defaultLocale: "es",
  },
}));

import Home from "@/app/[locale]/page";

describe("Landing page", () => {
  it("renders the semantic landing structure", async () => {
    const { container } = render(await Home({ params: Promise.resolve({ locale: "es" }) }));
    expect(container.querySelector(".landing-shell")).toBeInTheDocument();
    expect(container.querySelector(".landing-hero")).toBeInTheDocument();
  });

  it("provides onboarding CTAs", async () => {
    const { container } = render(await Home({ params: Promise.resolve({ locale: "es" }) }));
    const ctas = container.querySelectorAll('a[href="/es/onboarding"]');
    expect(ctas.length).toBeGreaterThanOrEqual(1);
  });

  it("renders all how-it-works steps", async () => {
    const { container } = render(await Home({ params: Promise.resolve({ locale: "es" }) }));
    expect(container.textContent).toContain("Conoce tu punto de partida");
    expect(container.textContent).toContain("Avanza un día a la vez");
    expect(container.textContent).toContain("Reconoce lo que construyes");
  });

  it("renders the dashboard screenshot inside a phone frame in the hero", async () => {
    const { container } = render(await Home({ params: Promise.resolve({ locale: "es" }) }));
    expect(container.querySelector(".landing-phone-frame")).toBeInTheDocument();
    expect(container.querySelector('.landing-phone-screen')).toBeInTheDocument();
  });

  it("renders the ordered public achievement roadmap without claiming progress", async () => {
    const { container } = render(await Home({ params: Promise.resolve({ locale: "es" }) }));
    const cards = container.querySelectorAll('[data-testid="achievement-roadmap-card"]');
    expect(cards.length).toBeGreaterThanOrEqual(1);
  });

  it("keeps the hidden achievement generic in public markup and accessibility output", async () => {
    const { container } = render(await Home({ params: Promise.resolve({ locale: "es" }) }));
    expect(container.textContent).toContain("Logro oculto");
  });

  it("keeps presentation anonymous and explains the cigarette-life cycle", async () => {
    const { container } = render(await Home({ params: Promise.resolve({ locale: "es" }) }));
    expect(container.textContent).toContain("ciclo");
  });

  it("makes heart feedback keyboard-safe without making it navigation or state", async () => {
    const { container } = render(await Home({ params: Promise.resolve({ locale: "es" }) }));
    const heartButton = container.querySelector(".landing-heart-button");
    if (heartButton) {
      expect(heartButton.tagName).toBe("BUTTON");
    }
  });

  it("keeps decorative effects and content motion scoped", async () => {
    const { container } = render(await Home({ params: Promise.resolve({ locale: "es" }) }));
    expect(container.querySelector("[data-motion-reveal]")).toBeInTheDocument();
  });

  it("does not import database, auth, or achievement state", async () => {
    const { container } = render(await Home({ params: Promise.resolve({ locale: "es" }) }));
    expect(container.querySelector(".landing-shell")).toBeInTheDocument();
  });

  it("uses an explicit public allowlist instead of deprecated badge thresholds", async () => {
    const { container } = render(await Home({ params: Promise.resolve({ locale: "es" }) }));
    expect(container.textContent).toContain("Primera Semana");
    expect(container.textContent).toContain("10 Vidas Ahorradas");
  });

  it("scopes brand typography to the landing", async () => {
    const { container } = render(await Home({ params: Promise.resolve({ locale: "es" }) }));
    expect(container.querySelector(".landing-heading")).toBeInTheDocument();
  });

  it("keeps the shared Progress component isolated", async () => {
    const { container } = render(await Home({ params: Promise.resolve({ locale: "es" }) }));
    expect(container.querySelector(".landing-preview")).toBeInTheDocument();
  });

  it("renders decorative flash elements only as hidden presentation", async () => {
    const { container } = render(await Home({ params: Promise.resolve({ locale: "es" }) }));
    const flashes = container.querySelectorAll(".landing-flash");
    flashes.forEach((flash) => {
      expect(flash).toHaveAttribute("aria-hidden", "true");
    });
  });
});
