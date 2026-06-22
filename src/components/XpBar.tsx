import { getPlayerState } from "@/game/level";

export function XpBar({ totalXp }: { totalXp: number }) {
  const { level, xpIntoLevel, xpForNextLevel } = getPlayerState(totalXp);
  const percent =
    xpForNextLevel > 0
      ? Math.min(100, (xpIntoLevel / xpForNextLevel) * 100)
      : 0;

  return (
    <div className="w-full">
      <div className="mb-2 flex items-baseline justify-between text-xs">
        <span className="text-muted">До уровня {level + 1}</span>
        <span className="font-display font-medium text-text">
          {xpIntoLevel} / {xpForNextLevel} XP
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-elevated">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
