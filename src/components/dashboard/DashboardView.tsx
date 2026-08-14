import { type GameState } from "@/lib/game-state";

interface DashboardViewProps {
  gameState: GameState;
}

export function DashboardView({ gameState }: DashboardViewProps) {
  return (
    <div>
      <h1>Dashboard</h1>
      <p data-testid="remaining-lives">Lives: {gameState.remainingLives}</p>
      <p data-testid="streak-days">Streak: {gameState.streakDays}</p>
      <p data-testid="cigarettes-today">Cigarettes: {gameState.cigarettesToday}</p>
    </div>
  );
}
