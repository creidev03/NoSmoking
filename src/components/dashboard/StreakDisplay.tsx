interface StreakDisplayProps {
  streakDays: number;
}

export function StreakDisplay({ streakDays }: StreakDisplayProps) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:border-[#374151] dark:bg-[#1F2937]">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F97316]/10">
          <span className="text-2xl">🔥</span>
        </div>
        <div>
          <span
            data-testid="streak-days"
            className="text-[32px] font-bold leading-none text-[#1F2937] dark:text-[#F3F4F6]"
          >
            {streakDays}
          </span>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            {streakDays === 1 ? "día sin fumar" : "días sin fumar"}
          </p>
        </div>
      </div>
      {streakDays >= 7 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-[#F97316]">
          <span>🏅</span>
          <span className="font-medium">¡Sigue así!</span>
        </div>
      )}
    </div>
  );
}
