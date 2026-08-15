interface CigarettesTodayProps {
  count: number;
  threshold: number;
}

export function CigarettesToday({ count, threshold }: CigarettesTodayProps) {
  const remaining = Math.max(0, threshold - count);
  const segments = Array.from({ length: threshold }, (_, i) => i < count);

  return (
    <div className="rounded-xl border border-border bg-surface-card p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:border-border dark:bg-surface-card">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-text-muted">
        🚬 Consumo de Hoy
      </h2>

      <div className="mb-4 flex items-baseline gap-2">
        <span
          data-testid="cigarette-count"
          className={`text-[48px] font-bold leading-none ${
            count >= threshold
              ? "text-danger"
              : count >= threshold * 0.6
                ? "text-warning"
                : "text-text dark:text-text"
          }`}
        >
          {count}
        </span>
        <span className="text-text-muted">de {threshold} permitidos</span>
      </div>

      {/* 5-segment progress bar */}
      <div className="mb-3 flex gap-1">
        {segments.map((filled, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded transition-all duration-200 ${
              filled ? "bg-danger" : "bg-success"
            }`}
          />
        ))}
      </div>

      {remaining > 0 && (
        <p data-testid="remaining-text" className="text-sm text-text-muted">
          Quedan{" "}
          <span className="font-medium text-text dark:text-text">
            {remaining}
          </span>{" "}
          antes de penalización
        </p>
      )}
      {count >= threshold && (
        <p
          data-testid="penalty-text"
          className="text-sm font-medium text-danger"
        >
          ⚠️ ¡Ciclo completado! Se perderá 1 vida
        </p>
      )}
    </div>
  );
}
