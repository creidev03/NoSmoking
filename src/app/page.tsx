import Link from "next/link";
import { LandingMotion } from "@/components/landing/LandingMotion";

const ACHIEVEMENTS = [
  { days: 7, label: "Primera Semana", emoji: "🌱" },
  { days: 30, label: "Un Mes Limpio", emoji: "💪" },
  { days: 100, label: "Centenario", emoji: "🏆" },
  { days: 365, label: "Un Año Libre", emoji: "🎉" },
];

export default function Home() {
  return (
    <div className="landing-shell">
      <LandingMotion>
        {/* ── Header ─────────────────────────────────────── */}
        <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
            <span className="landing-heading text-lg font-bold tracking-tight text-foreground">
              No Smoking
            </span>
            {/* ThemeToggle is rendered by layout — this slot is intentionally empty */}
          </div>
        </header>

        {/* ── Hero ───────────────────────────────────────── */}
        <section
          className="landing-section relative overflow-hidden px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28"
          data-motion-reveal
        >
          {/* Decorative hearts — static accessible fallback */}
          <div className="landing-hearts pointer-events-none absolute right-6 top-10 text-3xl opacity-60 select-none sm:right-12 sm:text-4xl" aria-hidden="true">
            💚
          </div>
          <div className="landing-hearts pointer-events-none absolute bottom-12 left-8 text-2xl opacity-40 select-none sm:left-16 sm:text-3xl" aria-hidden="true" style={{ animationDelay: "1.2s" }}>
            💚
          </div>

          {/* Desktop-only flashes */}
          <div className="landing-flash landing-flash-one" aria-hidden="true" />
          <div className="landing-flash landing-flash-two" aria-hidden="true" />

          <div className="mx-auto max-w-2xl text-center">
            <h1 className="landing-heading text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
              Cada día sin humo es una{" "}
              <span className="landing-highlight text-primary">victoria</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              No se trata de perfección, sino de persistencia.
              Registra tu progreso, celebra tus logros y mantén la motivación.
            </p>
            <Link
              href="/onboarding"
              className="mt-8 inline-flex min-h-12 items-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:text-lg"
            >
              Empezar ahora
            </Link>
          </div>

          {/* Hearts group + progress demo */}
          <div
            className="mx-auto mt-12 max-w-xs"
            role="img"
            aria-label="Progreso simulado: 42 días sin fumar"
            data-motion-reveal
          >
            <div className="landing-hearts flex items-center justify-center gap-1 text-xl" aria-hidden="true">
              <span>💚</span>
              <span>💚</span>
              <span>💚</span>
            </div>
            <div
              className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={42}
              aria-valuemin={0}
              aria-valuemax={365}
              aria-label="Días sin fumar"
              data-motion-progress="true"
            >
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.round((42 / 365) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">42</span> / 365 días
            </p>
          </div>
        </section>

        {/* ── Mission ────────────────────────────────────── */}
        <section
          className="landing-section bg-muted/30 px-4 py-16 sm:px-6 sm:py-20"
          data-motion-reveal
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="landing-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Nuestra misión
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Ayudarte a dejar de fumar sin juicios, sin presión y con
              herramientas reales. Cada paso cuenta, por pequeño que sea.
            </p>
          </div>
        </section>

        {/* ── How it works ───────────────────────────────── */}
        <section
          className="landing-section px-4 py-16 sm:px-6 sm:py-20"
          data-motion-reveal
        >
          <div className="mx-auto max-w-2xl">
            <h2 className="landing-heading text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              ¿Cómo funciona?
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Configura tu perfil",
                  desc: "Cuéntanos sobre tu hábito y tu motivación para dejar de fumar.",
                },
                {
                  step: "2",
                  title: "Registra tu progreso",
                  desc: "Marca cada día sin fumar y acumula vidas que protegen tu racha.",
                },
                {
                  step: "3",
                  title: "Celebra tus logros",
                  desc: "Desbloquea medallas que reconocen tu constancia y dedicación.",
                },
              ].map((item) => (
                <div key={item.step} className="text-center" data-motion-reveal>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {item.step}
                  </div>
                  <h3 className="landing-heading mt-4 text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Achievements preview ───────────────────────── */}
        <section
          className="landing-section bg-muted/30 px-4 py-16 sm:px-6 sm:py-20"
          data-motion-reveal
        >
          <div className="mx-auto max-w-2xl">
            <h2 className="landing-heading text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Logros que te esperan
            </h2>
            <p className="mt-3 text-center text-base text-muted-foreground sm:text-lg">
              Cada racha tiene su recompensa. Estos son algunos de los hitos que
              podrás desbloquear:
            </p>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {ACHIEVEMENTS.map((a) => (
                <div
                  key={a.days}
                  className="rounded-lg border border-border bg-card p-4 text-center shadow-sm"
                  data-motion-reveal
                >
                  <div className="text-3xl" aria-hidden="true">
                    {a.emoji}
                  </div>
                  <p className="landing-heading mt-2 text-lg font-bold text-foreground">
                    {a.days} días
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {a.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer CTA ─────────────────────────────────── */}
        <section
          className="landing-section px-4 py-16 text-center sm:px-6 sm:py-20"
          data-motion-reveal
        >
          <div className="mx-auto max-w-xl">
            <h2 className="landing-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              ¿Listo para empezar?
            </h2>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              Tu futuro yo te lo agradecerá.
            </p>
            <Link
              href="/onboarding"
              className="mt-8 inline-flex min-h-12 items-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:text-lg"
            >
              Comenzar mi camino
            </Link>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────── */}
        <footer className="border-t border-border/40 px-4 py-8 text-center text-sm text-muted-foreground sm:px-6">
          <p>No Smoking &copy; {new Date().getFullYear()}</p>
        </footer>
      </LandingMotion>
    </div>
  );
}
