interface StreakDisplayProps {
  streakDays: number;
}

export function StreakDisplay({ streakDays }: StreakDisplayProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-gradient-to-br from-[#D1FAE5] to-[#10B981] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:border-[#065F46] dark:from-[#064E3B] dark:to-[#047857]">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-[#065F46] dark:text-[#A7F3D0]">
        📅 Días Sin Fumar
      </h2>
      <div className="flex items-baseline gap-2">
        <span
          data-testid="streak-days"
          className="text-[48px] font-bold leading-none text-[#065F46] dark:text-[#FFFFFF]"
        >
          {streakDays}
        </span>
        <span className="text-[#065F46]/80 dark:text-[#A7F3D0]/80">
          {streakDays === 1 ? "día" : "días"}
        </span>
      </div>
      {streakDays >= 7 && (
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#FFFFFF]/30 px-2 py-0.5 text-xs font-medium text-[#065F46] dark:bg-[#FFFFFF]/10 dark:text-[#A7F3D0]">
          🏅 ¡Sigue así!
        </div>
      )}
    </div>
  );
}
