import { getPlayerState } from "@/game/level";

export function XpBar({ totalXp }: { totalXp: number }) {
  const { level, xpIntoLevel, xpForNextLevel } = getPlayerState(totalXp);
  const percent =
    xpForNextLevel > 0
      ? Math.min(100, (xpIntoLevel / xpForNextLevel) * 100)
      : 0;

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-semibold">Уровень {level}</span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {xpIntoLevel} / {xpForNextLevel} XP
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-xp transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
