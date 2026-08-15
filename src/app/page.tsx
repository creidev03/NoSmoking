import Link from "next/link";
import { LandingMotion } from "@/components/landing/LandingMotion";
import { BADGE_THRESHOLDS } from "@/lib/badges";

const ILLUSTRATIVE_PROGRESS_DAYS = 42;
const ILLUSTRATIVE_PROGRESS_MAX_DAYS = 365;

const STEPS = [
  { number: "01", title: "Conoce tu punto de partida", description: "Configura tu perfil en unos minutos y elige el motivo que quieres tener presente." },
  { number: "02", title: "Avanza un día a la vez", description: "Registra tus días sin humo y encuentra pequeñas herramientas para sostener tu decisión." },
  { number: "03", title: "Reconoce lo que construyes", description: "Mira tu constancia con claridad y celebra cada hito sin compararte con nadie." },
];

const BENEFITS = [
  { title: "Más claridad", description: "Un registro sencillo te ayuda a ver tu proceso, incluso en los días difíciles." },
  { title: "Más apoyo", description: "Recordatorios y recursos pensados para acompañarte, no para juzgarte." },
  { title: "Más confianza", description: "Cada día que eliges cuidar de ti se convierte en una señal de avance." },
];

const BADGE_PRESENTATION = {
  primera_semana: { label: "Primera semana", source: "heart-gray.svg", alt: "Corazón gris" },
  un_mes: { label: "Un mes limpio", source: "heart-gray.svg", alt: "Corazón gris" },
  centenario: { label: "Cien días", source: "heart-half.svg", alt: "Medio corazón" },
  un_ano: { label: "Un año libre", source: "heart-full.svg", alt: "Corazón completo" },
} as const;

function getBadgePresentation(key: string) {
  return BADGE_PRESENTATION[key as keyof typeof BADGE_PRESENTATION];
}

function Heart({ source, alt }: { source: string; alt: string }) {
  return <img src={`/icons/${source}`} alt={alt} className="landing-heart" />;
}

function Header() {
  return (
    <header className="landing-header border-b border-border/60 bg-background/90">
      <div className="landing-container flex items-center justify-between">
        <span className="landing-heading text-lg font-bold tracking-tight text-foreground">No Smoking</span>
        <Link href="/onboarding" className="landing-header-link inline-flex min-h-12 items-center px-3 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Empezar</Link>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="landing-hero landing-section px-4 py-20 sm:px-6 sm:py-28" data-motion-reveal>
      <span className="landing-flash landing-flash-one" aria-hidden="true" />
      <span className="landing-flash landing-flash-two" aria-hidden="true" />
      <div className="landing-container grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
        <div className="max-w-xl">
          <p className="landing-eyebrow">Un espacio para volver a elegirte</p>
          <h1 className="landing-heading mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            Dejarlo no es un momento. <span className="landing-highlight text-primary">Es un camino.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
            No Smoking te ayuda a convertir una decisión importante en pasos pequeños, visibles y posibles. Sin culpa. Sin presión. A tu ritmo.
          </p>
          <Link href="/onboarding" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Empezar</Link>
        </div>
        <div className="landing-hero-proof" role="img" aria-label={`Ejemplo de progreso: ${ILLUSTRATIVE_PROGRESS_DAYS} días sin fumar`} data-motion-reveal>
          <div className="landing-proof-card rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tu avance, a la vista</p>
                <p className="landing-heading mt-2 text-4xl font-bold text-foreground">{ILLUSTRATIVE_PROGRESS_DAYS} <span className="text-base font-normal text-muted-foreground">días</span></p>
              </div>
              <div className="landing-heart-row" aria-hidden="true"><Heart source="heart-full.svg" alt="" /><Heart source="heart-full.svg" alt="" /><Heart source="heart-half.svg" alt="" /></div>
            </div>
            <div className="mt-8 h-3 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={ILLUSTRATIVE_PROGRESS_DAYS} aria-valuemin={0} aria-valuemax={ILLUSTRATIVE_PROGRESS_MAX_DAYS} aria-label="Días sin fumar" data-motion-progress="true"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((ILLUSTRATIVE_PROGRESS_DAYS / ILLUSTRATIVE_PROGRESS_MAX_DAYS) * 100)}%` }} /></div>
            <p className="mt-3 text-sm text-muted-foreground">Un ejemplo ilustrativo de cómo puedes ver tu proceso.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="landing-section px-4 py-20 sm:px-6 sm:py-24" data-motion-reveal>
      <div className="landing-container">
        <div className="max-w-2xl"><p className="landing-eyebrow">Un proceso que cabe en tu vida</p><h2 className="landing-heading mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">¿Cómo funciona?</h2><p className="mt-4 text-lg leading-8 text-muted-foreground">La herramienta se adapta a tu decisión: te da contexto, registro y ánimo para seguir avanzando.</p></div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">{STEPS.map((step) => <article key={step.number} className="landing-step" data-motion-reveal><span className="landing-step-number">{step.number}</span><h3 className="landing-heading mt-5 text-xl font-semibold text-foreground">{step.title}</h3><p className="mt-3 leading-7 text-muted-foreground">{step.description}</p></article>)}</div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section className="landing-section bg-muted/30 px-4 py-20 sm:px-6 sm:py-24" data-motion-reveal>
      <div className="landing-container"><div className="max-w-2xl"><p className="landing-eyebrow">Lo que ganas al dejarlo</p><h2 className="landing-heading mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Tu esfuerzo merece un lugar donde crecer.</h2></div><div className="mt-12 grid gap-5 md:grid-cols-3">{BENEFITS.map((benefit) => <article key={benefit.title} className="rounded-xl border border-border bg-card p-6"><div className="landing-benefit-mark"><Heart source="heart-full.svg" alt="Corazón completo" /></div><h3 className="landing-heading mt-5 text-xl font-semibold text-foreground">{benefit.title}</h3><p className="mt-3 leading-7 text-muted-foreground">{benefit.description}</p></article>)}</div></div>
    </section>
  );
}

function ProgressPreviewSection() {
  return (
    <section className="landing-section px-4 py-20 sm:px-6 sm:py-24" data-motion-reveal>
      <div className="landing-container grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><p className="landing-eyebrow">Una señal, no una exigencia</p><h2 className="landing-heading mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Un ejemplo de progreso</h2><p className="mt-4 leading-8 text-muted-foreground">Los números pueden ayudarte a reconocer lo que ya estás haciendo. Este ejemplo es ilustrativo: tu proceso siempre será tuyo.</p></div><div className="landing-preview rounded-2xl border border-border bg-card p-6 sm:p-8"><div className="flex items-center justify-between"><span className="font-semibold text-foreground">Días sin humo</span><span className="text-sm text-muted-foreground">Vista previa</span></div><div className="mt-8 flex items-center gap-4"><Heart source="heart-full.svg" alt="Corazón completo" /><Heart source="heart-half.svg" alt="Medio corazón" /><Heart source="heart-gray.svg" alt="Corazón gris" /><span className="ml-auto text-2xl font-bold text-primary">{ILLUSTRATIVE_PROGRESS_DAYS}</span></div><p className="mt-5 text-sm text-muted-foreground">No muestra una racha personal ni datos guardados.</p></div></div>
    </section>
  );
}

function AchievementsSection() {
  return (
    <section className="landing-section bg-muted/30 px-4 py-20 sm:px-6 sm:py-24" data-motion-reveal>
      <div className="landing-container"><div className="mx-auto max-w-2xl text-center"><p className="landing-eyebrow">Pequeños hitos, grandes señales</p><h2 className="landing-heading mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Logros que puedes desbloquear</h2><p className="mt-4 text-lg leading-8 text-muted-foreground">Estos hitos son una invitación a reconocer tu constancia, no una promesa de perfección.</p></div><div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">{BADGE_THRESHOLDS.map((badge) => { const presentation = getBadgePresentation(badge.key); return <article key={badge.key} className="rounded-xl border border-border bg-card p-5 text-center" data-motion-reveal><Heart source={presentation.source} alt={presentation.alt} /><p className="landing-heading mt-4 text-xl font-bold text-foreground">{badge.days} días</p><p className="mt-2 text-sm text-muted-foreground">{presentation.label}</p></article>; })}</div></div>
    </section>
  );
}

function FinalCtaSection() {
  return <section className="landing-section px-4 py-24 text-center sm:px-6 sm:py-32" data-motion-reveal><div className="landing-container mx-auto max-w-2xl"><h2 className="landing-heading text-3xl font-bold tracking-tight text-foreground sm:text-5xl">Hoy también cuenta.</h2><p className="mx-auto mt-5 max-w-lg text-lg leading-8 text-muted-foreground">Empieza con una decisión amable contigo. Lo demás puede construirse paso a paso.</p><Link href="/onboarding" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Empezar</Link></div></section>;
}

export default function Home() {
  return <div className="landing-shell"><LandingMotion><Header /><main><HeroSection /><HowItWorksSection /><BenefitsSection /><ProgressPreviewSection /><AchievementsSection /><FinalCtaSection /></main></LandingMotion></div>;
}
