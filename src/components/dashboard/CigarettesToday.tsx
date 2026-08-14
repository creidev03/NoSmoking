interface CigarettesTodayProps {
  count: number;
  threshold: number;
}

export function CigarettesToday({ count, threshold }: CigarettesTodayProps) {
  const remaining = Math.max(0, threshold - count);
  const segments = Array.from({ length: threshold }, (_, i) => i < count);

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:border-[#374151] dark:bg-[#1F2937]">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-[#6B7280]">
        🚬 Consumo de Hoy
      </h2>

      <div className="mb-4 flex items-baseline gap-2">
        <span
          data-testid="cigarette-count"
          className={`text-[48px] font-bold leading-none ${
            count >= threshold
              ? "text-[#EF4444]"
              : count >= threshold * 0.6
                ? "text-[#F97316]"
                : "text-[#1F2937] dark:text-[#F3F4F6]"
          }`}
        >
          {count}
        </span>
        <span className="text-[#6B7280]">de {threshold} permitidos</span>
      </div>

      {/* 5-segment progress bar */}
      <div className="mb-3 flex gap-1">
        {segments.map((filled, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded transition-all duration-200 ${
              filled ? "bg-[#EF4444]" : "bg-[#10B981]"
            }`}
          />
        ))}
      </div>

      {remaining > 0 && (
        <p data-testid="remaining-text" className="text-sm text-[#6B7280]">
          Quedan{" "}
          <span className="font-medium text-[#1F2937] dark:text-[#F3F4F6]">
            {remaining}
          </span>{" "}
          antes de penalización
        </p>
      )}
      {count >= threshold && (
        <p
          data-testid="penalty-text"
          className="text-sm font-medium text-[#EF4444]"
        >
          ⚠️ ¡Ciclo completado! Se perderá 1 vida
        </p>
      )}
    </div>
  );
}
