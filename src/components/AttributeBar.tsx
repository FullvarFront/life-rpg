import { getPlayerState } from "@/game/level";

export function AttributeBar({
  name,
  xp,
  colorClass,
}: {
  name: string;
  xp: number;
  /** Статичный Tailwind-класс заливки, напр. "bg-attr-intellect". */
  colorClass: string;
}) {
  const { level, xpIntoLevel, xpForNextLevel } = getPlayerState(xp);
  const percent =
    xpForNextLevel > 0
      ? Math.min(100, (xpIntoLevel / xpForNextLevel) * 100)
      : 0;

  return (
    <div className="w-full">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium">{name}</span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Ур. {level} · {xpIntoLevel}/{xpForNextLevel}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${colorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
