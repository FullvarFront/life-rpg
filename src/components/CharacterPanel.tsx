import { getPlayerState } from "@/game/level";
import { XpBar } from "@/components/XpBar";
import { AttributeBar } from "@/components/AttributeBar";
import { DisciplineCard } from "@/components/DisciplineCard";
import { ATTRIBUTE_META } from "@/components/attributes";
import type { Attribute } from "@/types/game";

export function CharacterPanel({
  totalXp,
  attributeXp,
  currentStreak,
  longestStreak,
}: {
  totalXp: number;
  attributeXp: Record<Attribute, number>;
  currentStreak: number;
  longestStreak: number;
}) {
  const { level } = getPlayerState(totalXp);

  return (
    <div className="flex flex-col gap-6">
      {/* Аватар + общий опыт */}
      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-attr-intellect shadow-lg shadow-accent/20">
            <span className="font-display text-2xl font-bold text-bg">
              {level}
            </span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Уровень</p>
            <p className="font-display text-2xl font-bold text-text">{level}</p>
          </div>
        </div>
        <XpBar totalXp={totalXp} />
      </div>

      {/* Характеристики */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Характеристики
        </h2>
        {ATTRIBUTE_META.map(({ key, name, Icon, text, bar }) => (
          <AttributeBar
            key={key}
            name={name}
            xp={attributeXp[key]}
            Icon={Icon}
            iconClass={text}
            barClass={bar}
          />
        ))}
      </div>

      {/* Дисциплина */}
      <DisciplineCard
        currentStreak={currentStreak}
        longestStreak={longestStreak}
      />
    </div>
  );
}
