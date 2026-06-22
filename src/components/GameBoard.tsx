"use client";

import { useState } from "react";
import { ActionForm } from "@/components/ActionForm";
import { CharacterPanel } from "@/components/CharacterPanel";
import { ATTRIBUTE_BY_KEY } from "@/components/attributes";
import type {
  ActionEntry,
  Attribute,
  Difficulty,
  EvaluateResponse,
} from "@/types/game";

const DIFFICULTY_META: Record<Difficulty, { label: string; pill: string }> = {
  trivial: {
    label: "Мелочь",
    pill: "bg-difficulty-trivial/15 text-difficulty-trivial",
  },
  easy: { label: "Лёгкое", pill: "bg-difficulty-easy/15 text-difficulty-easy" },
  medium: {
    label: "Среднее",
    pill: "bg-difficulty-medium/15 text-difficulty-medium",
  },
  hard: { label: "Сложное", pill: "bg-difficulty-hard/15 text-difficulty-hard" },
  epic: { label: "Эпик", pill: "bg-difficulty-epic/15 text-difficulty-epic" },
};

function DifficultyPill({ difficulty }: { difficulty: Difficulty }) {
  const meta = DIFFICULTY_META[difficulty];
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.pill}`}
    >
      {meta.label}
    </span>
  );
}

function AttributeTag({ attribute }: { attribute: Attribute }) {
  const meta = ATTRIBUTE_BY_KEY[attribute];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />
      {meta.name}
    </span>
  );
}

function FeedItem({ entry }: { entry: ActionEntry }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-muted/40">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyPill difficulty={entry.difficulty} />
          {entry.attribute && <AttributeTag attribute={entry.attribute} />}
        </div>
        <p className="mt-2 truncate text-sm text-text">{entry.text}</p>
      </div>
      <span className="shrink-0 font-display font-semibold text-accent">
        +{entry.xp} XP
      </span>
    </li>
  );
}

export function GameBoard({
  initialTotalXp,
  initialCurrentStreak,
  initialLongestStreak,
  initialAttributeXp,
  initialHistory,
}: {
  initialTotalXp: number;
  initialCurrentStreak: number;
  initialLongestStreak: number;
  initialAttributeXp: Record<Attribute, number>;
  initialHistory: ActionEntry[];
}) {
  // Источник правды — БД. Сюда приходят уже загруженные на сервере данные.
  const [totalXp, setTotalXp] = useState(initialTotalXp);
  const [currentStreak, setCurrentStreak] = useState(initialCurrentStreak);
  const [longestStreak, setLongestStreak] = useState(initialLongestStreak);
  const [attributeXp, setAttributeXp] = useState(initialAttributeXp);
  const [history, setHistory] = useState<ActionEntry[]>(initialHistory);
  const [last, setLast] = useState<ActionEntry | null>(null);
  const [pop, setPop] = useState<{ id: number; xp: number } | null>(null);

  // Сюда приходят только валидные действия (ActionForm отсеивает невалидные).
  // Все значения берём из ответа роута — это актуальное состояние из БД.
  function handleResult(result: EvaluateResponse) {
    const entry: ActionEntry = {
      id: crypto.randomUUID(),
      text: result.text,
      difficulty: result.difficulty,
      xp: result.xp,
      attribute: result.attribute,
      createdAt: new Date().toISOString(),
    };
    setTotalXp(result.totalXp);
    setCurrentStreak(result.currentStreak);
    setLongestStreak(result.longestStreak);
    if (result.attribute !== null && result.attributeXp !== null) {
      const attr = result.attribute;
      const xp = result.attributeXp;
      setAttributeXp((prev) => ({ ...prev, [attr]: xp }));
    }
    setLast(entry);
    setHistory((prev) => [entry, ...prev].slice(0, 10));
    setPop({ id: Date.now(), xp: result.xp });
  }

  return (
    <div className="grid gap-6 md:grid-cols-[300px_1fr]">
      {/* Лист персонажа */}
      <aside className="md:sticky md:top-6 md:self-start">
        <CharacterPanel
          totalXp={totalXp}
          attributeXp={attributeXp}
          currentStreak={currentStreak}
          longestStreak={longestStreak}
        />
      </aside>

      {/* Основная область */}
      <div className="flex flex-col gap-6">
        <div className="relative">
          <ActionForm onResult={handleResult} />
          {pop && (
            <span
              key={pop.id}
              className="pointer-events-none absolute -top-2 right-6 animate-xp-pop font-display text-lg font-bold text-accent"
            >
              +{pop.xp} XP
            </span>
          )}
        </div>

        {last && (
          <div className="rounded-2xl border border-accent/30 bg-surface p-5 shadow-lg shadow-accent/5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <DifficultyPill difficulty={last.difficulty} />
                {last.attribute && <AttributeTag attribute={last.attribute} />}
              </div>
              <span className="font-display text-lg font-bold text-accent">
                +{last.xp} XP
              </span>
            </div>
            <p className="mt-2.5 text-sm text-text">{last.text}</p>
          </div>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Лента действий
          </h2>
          {history.length > 0 ? (
            <ul className="flex flex-col gap-2.5">
              {history.map((entry) => (
                <FeedItem key={entry.id} entry={entry} />
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-8 text-center text-sm text-muted">
              Пока пусто — введи своё первое действие.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
