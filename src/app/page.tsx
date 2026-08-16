import Link from "next/link";
import { LandingMotion } from "@/components/landing/LandingMotion";
import { getTranslations } from "next-intl/server";

// Steps are now defined inside HowItWorksSection with translation keys

// Benefits are now defined inside BenefitsSection with translation keys

// Achievement roadmap is now defined inside AchievementsSection with translation keys

function Heart({ source, alt, interactive = false }: { source: string; alt: string; interactive?: boolean }) {
  const image = <img src={source} alt={interactive ? "" : alt} aria-hidden={interactive ? "true" : undefined} className="landing-heart" />;

  if (!interactive) return image;

  return <button type="button" className="landing-heart-button" aria-label="Ver una señal de avance">{image}</button>;
}

function Header({ t }: { t: (key: string) => string }) {
  return (
    <header className="landing-header border-b border-border/60 bg-background/90">
      <div className="landing-container flex items-center justify-between">
        <span className="landing-heading text-lg font-bold tracking-tight text-foreground">No Smoking</span>
        <Link href="/onboarding" className="landing-header-link inline-flex min-h-12 items-center px-3 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{t("header.cta")}</Link>
      </div>
    </header>
  );
}

function HeroSection({ t }: { t: (key: string) => string }) {
  return (
    <section className="landing-hero landing-section px-4 py-20 sm:px-6 sm:py-28" data-motion-reveal>
      <span className="landing-flash landing-flash-one" aria-hidden="true" />
      <span className="landing-flash landing-flash-two" aria-hidden="true" />
      <span className="landing-flash landing-flash-three" aria-hidden="true" />
      <span className="landing-flash landing-flash-four" aria-hidden="true" />
      <div className="landing-container grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
        <div className="max-w-xl">
          <p className="landing-eyebrow">{t("hero.eyebrow")}</p>
          <h1 className="landing-heading mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            {t("hero.titlePart1")} <span className="landing-highlight text-primary">{t("hero.titlePart2")}</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
            {t("hero.description")}
          </p>
          <Link href="/onboarding" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">{t("hero.cta")}</Link>
        </div>
        <div className="landing-hero-proof" data-motion-reveal>
          <div className="landing-phone-frame">
            <span className="landing-phone-notch" aria-hidden="true" />
            <img src="/dashboard-preview.png" alt={t("hero.imageAlt")} className="landing-phone-screen landing-phone-screen-light" />
            <img src="/dashboard-preview-dark.png" alt="" aria-hidden="true" className="landing-phone-screen landing-phone-screen-dark" />
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">{t("hero.proof")}</p>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection({ t }: { t: (key: string) => string }) {
  const steps = [
    { number: "01", title: t("steps.step1.title"), description: t("steps.step1.description") },
    { number: "02", title: t("steps.step2.title"), description: t("steps.step2.description") },
    { number: "03", title: t("steps.step3.title"), description: t("steps.step3.description") },
  ];
  return (
    <section className="landing-section px-4 py-20 sm:px-6 sm:py-24" data-motion-reveal>
      <div className="landing-container">
        <div className="max-w-2xl"><p className="landing-eyebrow">{t("howItWorks.eyebrow")}</p><h2 className="landing-heading mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t("howItWorks.title")}</h2><p className="mt-4 text-lg leading-8 text-muted-foreground">{t("howItWorks.description")}</p></div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">{steps.map((step) => <article key={step.number} className="landing-step" data-motion-reveal><span className="landing-step-number">{step.number}</span><h3 className="landing-heading mt-5 text-xl font-semibold text-foreground">{step.title}</h3><p className="mt-3 leading-7 text-muted-foreground">{step.description}</p></article>)}</div>
      </div>
    </section>
  );
}

function SystemSection({ t }: { t: (key: string) => string }) {
  const points = [
    { title: t("system.life.title"), description: t("system.life.description") },
    { title: t("system.cigarette.title"), description: t("system.cigarette.description") },
    { title: t("system.positiveActions.title"), description: t("system.positiveActions.description") },
  ];

  return <section className="landing-section bg-muted/30 px-4 py-20 sm:px-6 sm:py-24" data-motion-reveal><div className="landing-container"><div className="max-w-2xl"><p className="landing-eyebrow">{t("system.eyebrow")}</p><h2 className="landing-heading mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t("system.title")}</h2></div><div className="mt-12 grid gap-8 md:grid-cols-3">{points.map((point, index) => <article key={point.title} className="landing-step" data-motion-reveal><span className="landing-step-number">0{index + 1}</span><h3 className="landing-heading mt-5 text-xl font-semibold text-foreground">{point.title}</h3><p className="mt-3 leading-7 text-muted-foreground">{point.description}</p></article>)}</div></div></section>;
}

function BenefitsSection({ t }: { t: (key: string) => string }) {
  const benefits = [
    { title: t("benefits.clarity.title"), description: t("benefits.clarity.description"), icon: "/achievements/T001.svg", iconAlt: "Calendario" },
    { title: t("benefits.support.title"), description: t("benefits.support.description"), icon: "/achievements/T004.svg", iconAlt: "Reloj de arena" },
    { title: t("benefits.confidence.title"), description: t("benefits.confidence.description"), icon: "/achievements/T006.svg", iconAlt: "Reloj de arena dorado" },
  ];
  return (
    <section className="landing-section bg-muted/30 px-4 py-20 sm:px-6 sm:py-24" data-motion-reveal>
      <div className="landing-container"><div className="max-w-2xl"><p className="landing-eyebrow">{t("benefitsSection.eyebrow")}</p><h2 className="landing-heading mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t("benefitsSection.title")}</h2></div><div className="mt-12 grid gap-5 md:grid-cols-3">{benefits.map((benefit) => <article key={benefit.title} className="rounded-xl border border-border bg-card p-6"><div className="landing-benefit-mark"><img src={benefit.icon} alt={benefit.iconAlt} className="landing-achievement-icon" /></div><h3 className="landing-heading mt-5 text-xl font-semibold text-foreground">{benefit.title}</h3><p className="mt-3 leading-7 text-muted-foreground">{benefit.description}</p></article>)}</div></div>
    </section>
  );
}

function ProgressPreviewSection({ t }: { t: (key: string) => string }) {
  return (
    <section className="landing-section px-4 py-20 sm:px-6 sm:py-24" data-motion-reveal>
      <div className="landing-container grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><p className="landing-eyebrow">{t("progress.eyebrow")}</p><h2 className="landing-heading mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t("progress.title")}</h2><p className="mt-4 leading-8 text-muted-foreground">{t("progress.description")}</p></div><div className="landing-preview rounded-2xl border border-border bg-card p-6 sm:p-8"><div className="flex items-center justify-between"><span className="font-semibold text-foreground">{t("progress.daysWithoutSmoke")}</span></div><div className="mt-8 flex items-center gap-4"><Heart source="/icons/heart-full.svg" alt={t("progress.heartFull")} interactive /><Heart source="/icons/heart-half.svg" alt={t("progress.heartHalf")} interactive /><Heart source="/icons/heart-gray.svg" alt={t("progress.heartGray")} interactive /></div><p className="mt-4 text-sm leading-6 text-muted-foreground">{t("progress.cycleDescription")}</p></div></div>
    </section>
  );
}

function AchievementsSection({ t }: { t: (key: string) => string }) {
  type PublicRoadmapCard = {
    id: "T001" | "P002" | "A003" | "A005";
    label: string;
    source: string;
    alt: string;
  };

  const PUBLIC_ACHIEVEMENT_ROADMAP: readonly PublicRoadmapCard[] = [
    { id: "T001", label: t("achievements.firstWeek"), source: "/achievements/T001.svg", alt: "Calendario" },
    { id: "P002", label: t("achievements.tenLives"), source: "/achievements/P002.svg", alt: "Diez vidas ahorradas" },
    { id: "A003", label: t("achievements.fiftyActions"), source: "/achievements/A003.svg", alt: "Cincuenta acciones positivas" },
    { id: "A005", label: t("achievements.hidden"), source: "/achievements/default.svg", alt: "Logro oculto" },
  ];

  return (
    <section className="landing-section bg-muted/30 px-4 py-20 sm:px-6 sm:py-24" data-motion-reveal>
      <div className="landing-container"><div className="mx-auto max-w-2xl text-center"><p className="landing-eyebrow">{t("achievementsSection.eyebrow")}</p><h2 className="landing-heading mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t("achievementsSection.title")}</h2><p className="mt-4 text-lg leading-8 text-muted-foreground">{t("achievementsSection.description")}</p></div><div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">{PUBLIC_ACHIEVEMENT_ROADMAP.map((card) => <article key={card.id} className="rounded-xl border border-border bg-card p-5 text-center" data-motion-reveal data-testid="achievement-roadmap-card"><img src={card.source} alt={card.alt} className="landing-achievement-icon mx-auto" /><p className="mt-2 text-sm text-muted-foreground">{card.label}</p></article>)}</div></div>
    </section>
  );
}

function FinalCtaSection({ t }: { t: (key: string) => string }) {
  return <section className="landing-section px-4 py-24 text-center sm:px-6 sm:py-32" data-motion-reveal><div className="landing-container mx-auto max-w-2xl"><h2 className="landing-heading text-3xl font-bold tracking-tight text-foreground sm:text-5xl">{t("finalCta.title")}</h2><p className="mx-auto mt-5 max-w-lg text-lg leading-8 text-muted-foreground">{t("finalCta.description")}</p><Link href="/onboarding" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">{t("finalCta.cta")}</Link></div></section>;
}

export default function Home() {
  // In production (server), getTranslations is async and must be awaited.
  // In tests (mock), it returns the translation function synchronously.
  // We cast to handle both cases for testability.
  const t = getTranslations("landing") as unknown as (key: string) => string;
  return <div className="landing-shell"><LandingMotion><Header t={t} /><main><HeroSection t={t} /><HowItWorksSection t={t} /><SystemSection t={t} /><BenefitsSection t={t} /><ProgressPreviewSection t={t} /><AchievementsSection t={t} /><FinalCtaSection t={t} /></main></LandingMotion></div>;
}
