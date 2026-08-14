interface Badge {
  key: string;
  unlockedAt: string;
}

interface BadgesListProps {
  badges: Badge[];
}

const BADGE_INFO: Record<
  string,
  { label: string; icon: string; color: string; bgColor: string }
> = {
  primera_semana: {
    label: "Primera Semana",
    icon: "🥇",
    color: "#F59E0B",
    bgColor: "#FEF3C7",
  },
  un_mes: {
    label: "Un Mes Limpio",
    icon: "🥈",
    color: "#6B7280",
    bgColor: "#F3F4F6",
  },
  centenario: {
    label: "Centenario",
    icon: "🏆",
    color: "#F59E0B",
    bgColor: "#FEF3C7",
  },
  un_ano: {
    label: "Un Año Sin Fumar",
    icon: "👑",
    color: "#A78BFA",
    bgColor: "#EDE9FE",
  },
};

export function BadgesList({ badges }: BadgesListProps) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:border-[#374151] dark:bg-[#1F2937]">
      <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-[#6B7280]">
        🏆 Insignias
      </h2>

      {badges.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <span className="mb-2 text-4xl opacity-30">🏅</span>
          <p className="text-sm text-[#6B7280]">
            No hay insignias desbloqueadas todavía
          </p>
          <p className="mt-1 text-xs text-[#6B7280]/70">
            Mantén tu racha para desbloquear logros
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {badges.map((badge) => {
            const info = BADGE_INFO[badge.key] ?? {
              label: badge.key,
              icon: "🎖️",
              color: "#6B7280",
              bgColor: "#F3F4F6",
            };
            return (
              <div
                key={badge.key}
                data-testid={`badge-${badge.key}`}
                className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] p-2 dark:border-[#374151]"
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-lg"
                  style={{ backgroundColor: info.bgColor }}
                >
                  {info.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-[#1F2937] dark:text-[#F3F4F6]">
                    {info.label}
                  </p>
                  <time
                    dateTime={badge.unlockedAt}
                    className="text-[10px] text-[#6B7280]"
                  >
                    {new Date(badge.unlockedAt).toLocaleDateString("es-ES")}
                  </time>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
