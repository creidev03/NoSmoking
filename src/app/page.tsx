import Link from "next/link";
import { LandingMotion } from "@/components/landing/LandingMotion";

const STEPS = [
  { number: "01", title: "Conoce tu punto de partida", description: "Configura tu perfil en unos minutos y elige el motivo que quieres tener presente." },
  { number: "02", title: "Avanza un día a la vez", description: "Registra tus días sin humo y encuentra pequeñas herramientas para sostener tu decisión." },
  { number: "03", title: "Reconoce lo que construyes", description: "Mira tu constancia con claridad y celebra cada hito sin compararte con nadie." },
];

const BENEFITS = [
  { title: "Más claridad", description: "Un registro sencillo te ayuda a ver tu proceso, incluso en los días difíciles.", icon: "/achievements/T001.svg", iconAlt: "Calendario" },
  { title: "Más apoyo", description: "Recordatorios y recursos pensados para acompañarte, no para juzgarte.", icon: "/achievements/T004.svg", iconAlt: "Reloj de arena" },
  { title: "Más confianza", description: "Cada día que eliges cuidar de ti se convierte en una señal de avance.", icon: "/achievements/T006.svg", iconAlt: "Reloj de arena dorado" },
];

type PublicRoadmapCard = {
  id: "T001" | "P002" | "A003" | "A005";
  label: string;
  source: string;
  alt: string;
};

const PUBLIC_ACHIEVEMENT_ROADMAP: readonly PublicRoadmapCard[] = [
  { id: "T001", label: "Primera Semana", source: "/achievements/T001.svg", alt: "Calendario" },
  { id: "P002", label: "10 Vidas Ahorradas", source: "/achievements/P002.svg", alt: "Diez vidas ahorradas" },
  { id: "A003", label: "50 Acciones", source: "/achievements/A003.svg", alt: "Cincuenta acciones positivas" },
  { id: "A005", label: "Logro oculto", source: "/achievements/default.svg", alt: "Logro oculto" },
];

function Heart({ source, alt, interactive = false }: { source: string; alt: string; interactive?: boolean }) {
  const image = <img src={source} alt={interactive ? "" : alt} aria-hidden={interactive ? "true" : undefined} className="landing-heart" />;

  if (!interactive) return image;

  return <button type="button" className="landing-heart-button" aria-label="Ver una señal de avance">{image}</button>;
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
      <span className="landing-flash landing-flash-three" aria-hidden="true" />
      <span className="landing-flash landing-flash-four" aria-hidden="true" />
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
        <div className="landing-hero-proof" data-motion-reveal>
          <div className="landing-phone-frame">
            <span className="landing-phone-notch" aria-hidden="true" />
            <img src="/dashboard-preview.png" alt="Vista previa del panel de progreso dentro de la app No Smoking" className="landing-phone-screen landing-phone-screen-light" />
            <img src="/dashboard-preview-dark.png" alt="" aria-hidden="true" className="landing-phone-screen landing-phone-screen-dark" />
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">Así se ve tu progreso, directo desde la app.</p>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="landing-section px-4 py-20 sm:px-6 sm:py-24" data-motion-reveal>
      <div className="landing-container">
        <div className="max-w-2xl"><p className="landing-eyebrow">Un proceso que cabe en tu vida</p><h2 className="landing-heading mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Un camino amable para empezar</h2><p className="mt-4 text-lg leading-8 text-muted-foreground">La herramienta se adapta a tu decisión: te da contexto, registro y ánimo para seguir avanzando.</p></div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">{STEPS.map((step) => <article key={step.number} className="landing-step" data-motion-reveal><span className="landing-step-number">{step.number}</span><h3 className="landing-heading mt-5 text-xl font-semibold text-foreground">{step.title}</h3><p className="mt-3 leading-7 text-muted-foreground">{step.description}</p></article>)}</div>
      </div>
    </section>
  );
}

function SystemSection() {
  const points = [
    { title: "Una vida", description: "Tu vida representa el margen de cuidado que estás construyendo; cada decisión cuenta, sin convertir el proceso en un juicio." },
    { title: "Registra un cigarrillo", description: "Cuando fumas, registras ese cigarrillo con el botón para que el ciclo quede visible y puedas entender tu avance." },
    { title: "Suma acciones positivas", description: "También puedes sumar acciones positivas: pequeñas decisiones que te ayudan a sostener tu camino." },
  ];

  return <section className="landing-section bg-muted/30 px-4 py-20 sm:px-6 sm:py-24" data-motion-reveal><div className="landing-container"><div className="max-w-2xl"><p className="landing-eyebrow">Un mapa sencillo para empezar</p><h2 className="landing-heading mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Tres ideas para entender el camino</h2></div><div className="mt-12 grid gap-8 md:grid-cols-3">{points.map((point, index) => <article key={point.title} className="landing-step" data-motion-reveal><span className="landing-step-number">0{index + 1}</span><h3 className="landing-heading mt-5 text-xl font-semibold text-foreground">{point.title}</h3><p className="mt-3 leading-7 text-muted-foreground">{point.description}</p></article>)}</div></div></section>;
}

function BenefitsSection() {
  return (
    <section className="landing-section bg-muted/30 px-4 py-20 sm:px-6 sm:py-24" data-motion-reveal>
      <div className="landing-container"><div className="max-w-2xl"><p className="landing-eyebrow">Lo que ganas al dejarlo</p><h2 className="landing-heading mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Tu esfuerzo merece un lugar donde crecer.</h2></div><div className="mt-12 grid gap-5 md:grid-cols-3">{BENEFITS.map((benefit) => <article key={benefit.title} className="rounded-xl border border-border bg-card p-6"><div className="landing-benefit-mark"><img src={benefit.icon} alt={benefit.iconAlt} className="landing-achievement-icon" /></div><h3 className="landing-heading mt-5 text-xl font-semibold text-foreground">{benefit.title}</h3><p className="mt-3 leading-7 text-muted-foreground">{benefit.description}</p></article>)}</div></div>
    </section>
  );
}

function ProgressPreviewSection() {
  return (
    <section className="landing-section px-4 py-20 sm:px-6 sm:py-24" data-motion-reveal>
      <div className="landing-container grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><p className="landing-eyebrow">Una señal, no una exigencia</p><h2 className="landing-heading mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Un ejemplo de progreso</h2><p className="mt-4 leading-8 text-muted-foreground">Los números pueden ayudarte a reconocer lo que ya estás haciendo. Este ejemplo es ilustrativo: tu proceso siempre será tuyo.</p></div><div className="landing-preview rounded-2xl border border-border bg-card p-6 sm:p-8"><div className="flex items-center justify-between"><span className="font-semibold text-foreground">Días sin humo</span></div><div className="mt-8 flex items-center gap-4"><Heart source="/icons/heart-full.svg" alt="Corazón completo" interactive /><Heart source="/icons/heart-half.svg" alt="Medio corazón" interactive /><Heart source="/icons/heart-gray.svg" alt="Corazón gris" interactive /></div><p className="mt-4 text-sm leading-6 text-muted-foreground">Cada cigarrillo registrado suma uno al ciclo. Al llegar al quinto cigarrillo registrado, pierdes una vida y se reinicia el ciclo de cigarrillos.</p></div></div>
    </section>
  );
}

function AchievementsSection() {
  return (
    <section className="landing-section bg-muted/30 px-4 py-20 sm:px-6 sm:py-24" data-motion-reveal>
      <div className="landing-container"><div className="mx-auto max-w-2xl text-center"><p className="landing-eyebrow">Pequeños hitos, grandes señales</p><h2 className="landing-heading mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Un mapa de reconocimientos que vas construyendo</h2><p className="mt-4 text-lg leading-8 text-muted-foreground">Estos hitos son una invitación a reconocer tu constancia, no una promesa de perfección. Son una vista previa pública e ilustrativa; no indican logros desbloqueados.</p></div><div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">{PUBLIC_ACHIEVEMENT_ROADMAP.map((card) => <article key={card.id} className="rounded-xl border border-border bg-card p-5 text-center" data-motion-reveal data-testid="achievement-roadmap-card"><img src={card.source} alt={card.alt} className="landing-achievement-icon mx-auto" /><p className="mt-2 text-sm text-muted-foreground">{card.label}</p></article>)}</div></div>
    </section>
  );
}

function FinalCtaSection() {
  return <section className="landing-section px-4 py-24 text-center sm:px-6 sm:py-32" data-motion-reveal><div className="landing-container mx-auto max-w-2xl"><h2 className="landing-heading text-3xl font-bold tracking-tight text-foreground sm:text-5xl">Hoy también cuenta.</h2><p className="mx-auto mt-5 max-w-lg text-lg leading-8 text-muted-foreground">Empieza con una decisión amable contigo. Lo demás puede construirse paso a paso.</p><Link href="/onboarding" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Empezar</Link></div></section>;
}

export default function Home() {
  return <div className="landing-shell"><LandingMotion><Header /><main><HeroSection /><HowItWorksSection /><SystemSection /><BenefitsSection /><ProgressPreviewSection /><AchievementsSection /><FinalCtaSection /></main></LandingMotion></div>;
}
