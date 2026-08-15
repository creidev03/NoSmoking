export type Category =
  | "time"
  | "progress"
  | "actions"
  | "challenges"
  | "collection"
  | "awareness";

export type Difficulty = "easy" | "balanced" | "hard" | "medium" | "extreme";

export type ConditionType =
  | "streak_days"
  | "total_actions"
  | "milestone"
  | "time_range"
  | "consecutive_days"
  | "collection"
  | "no_penalties"
  | "phase_actions"
  | "specific_actions"
  | "cumulative_count"
  | "consecutive_days_bad"
  | "consecutive_days_action";

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  category: Category;
  difficulty: Difficulty;
  isSecret: boolean;
  description: string;
  conditionType: ConditionType;
  conditionValue: number;
}

export interface EvaluationResult {
  achievementId: string;
  unlocked: boolean;
  progress: number;
}
