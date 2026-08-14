interface LivesDisplayProps {
  total: number;
  remaining: number;
}

export function LivesDisplay({ total, remaining }: LivesDisplayProps) {
  const displayTotal = total / 2;
  const displayRemaining = remaining / 2;
  const hearts = Array.from({ length: total }, (_, i) => i < remaining);

  return (
    <div data-testid="lives-display">
      <div aria-label="Lives">
        {hearts.map((filled, i) => (
          <span key={i} role="img" aria-label="life">
            {filled ? "❤️" : "🤍"}
          </span>
        ))}
      </div>
      <p>{displayRemaining} de {displayTotal} vidas</p>
    </div>
  );
}
