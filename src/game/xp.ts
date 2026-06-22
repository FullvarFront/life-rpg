import type { Difficulty } from "@/types/game";

/** Допустимый диапазон XP [min, max] для каждой сложности. */
export const DIFFICULTY_RANGES: Record<Difficulty, [number, number]> = {
  trivial: [2, 9],
  easy: [10, 29],
  medium: [30, 69],
  hard: [70, 129],
  epic: [130, 240],
};

/**
 * Зажимает xp в диапазон [min, max] выбранной сложности и округляет до целого.
 * Страховка от значений AI вне диапазона.
 */
export function clampXp(difficulty: Difficulty, xp: number): number {
  const [min, max] = DIFFICULTY_RANGES[difficulty];
  return Math.round(Math.min(max, Math.max(min, xp)));
}
