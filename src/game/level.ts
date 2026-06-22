import type { PlayerState } from "@/types/game";

/**
 * Суммарный XP, необходимый для достижения уровня `level`.
 * Порог: 50 * L * (L - 1) → уровень 1 = 0, 2 = 100, 3 = 300, 4 = 600 ...
 */
function totalXpForLevel(level: number): number {
  return 50 * level * (level - 1);
}

/** Уровень игрока по суммарному опыту. */
export function levelFromTotalXp(totalXp: number): number {
  if (totalXp <= 0) return 1;
  let level = 1;
  while (totalXpForLevel(level + 1) <= totalXp) {
    level += 1;
  }
  return level;
}

/** Полное состояние игрока, выведенное из суммарного опыта. */
export function getPlayerState(totalXp: number): PlayerState {
  const safeXp = Math.max(0, totalXp);
  const level = levelFromTotalXp(safeXp);
  const currentThreshold = totalXpForLevel(level);
  const nextThreshold = totalXpForLevel(level + 1);

  return {
    totalXp: safeXp,
    level,
    xpIntoLevel: safeXp - currentThreshold,
    xpForNextLevel: nextThreshold - currentThreshold,
  };
}
