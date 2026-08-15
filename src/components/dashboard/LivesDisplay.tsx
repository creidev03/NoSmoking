import { HeartIcon } from "@/components/icons/HeartIcon";

interface LivesDisplayProps {
  total: number;
  remaining: number;
}

export function LivesDisplay({ total, remaining }: LivesDisplayProps) {
  // Ensure at least 1 heart if total > 0
  const heartsCount = total > 0 ? Math.max(1, Math.round(total)) : 0;
  const fullHearts = Math.floor(remaining);
  const hasHalfHeart = remaining % 1 >= 0.5;
  const grayHearts = heartsCount - fullHearts - (hasHalfHeart ? 1 : 0);

  return (
    <div
      data-testid="lives-display"
      className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:border-[#374151] dark:bg-[#1F2937]"
    >
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-[#6B7280]">
        🫀 Vidas Restantes
      </h2>
      <div className="mb-3 flex flex-wrap items-center gap-1">
        {Array.from({ length: fullHearts }, (_, i) => (
          <HeartIcon key={`full-${i}`} variant="full" size={48} />
        ))}
        {hasHalfHeart && <HeartIcon variant="half" size={48} />}
        {Array.from({ length: grayHearts }, (_, i) => (
          <HeartIcon key={`gray-${i}`} variant="gray" size={48} />
        ))}
      </div>
      <p className="text-3xl font-bold text-[#1F2937] dark:text-[#F3F4F6]">
        {remaining}{" "}
        <span className="text-base font-normal text-[#6B7280]">
          de {total} vidas
        </span>
      </p>
    </div>
  );
}
