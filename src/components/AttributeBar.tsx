import type { LucideIcon } from "lucide-react";
import { getPlayerState } from "@/game/level";

export function AttributeBar({
  name,
  xp,
  Icon,
  iconClass,
  barClass,
}: {
  name: string;
  xp: number;
  Icon: LucideIcon;
  /** Класс цвета иконки, напр. "text-attr-intellect". */
  iconClass: string;
  /** Статичный класс заливки полосы, напр. "bg-attr-intellect". */
  barClass: string;
}) {
  const { level, xpIntoLevel, xpForNextLevel } = getPlayerState(xp);
  const percent =
    xpForNextLevel > 0
      ? Math.min(100, (xpIntoLevel / xpForNextLevel) * 100)
      : 0;

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm text-text">
          <Icon className={`h-4 w-4 ${iconClass}`} aria-hidden />
          {name}
        </span>
        <span className="font-display text-xs text-muted">Ур. {level}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-elevated">
        <div
          className={`h-full rounded-full transition-[width] duration-700 ease-out ${barClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
