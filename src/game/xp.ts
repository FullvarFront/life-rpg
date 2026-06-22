import type { Difficulty } from "@/types/game";

/** Сколько опыта даёт действие каждой сложности. */
const XP_BY_DIFFICULTY: Record<Difficulty, number> = {
  trivial: 5,
  easy: 15,
  medium: 40,
  hard: 80,
  epic: 150,
};

/** Опыт за действие заданной сложности. */
export function xpForDifficulty(difficulty: Difficulty): number {
  return XP_BY_DIFFICULTY[difficulty];
}
