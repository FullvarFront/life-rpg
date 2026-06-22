"use client";

import { useState } from "react";
import { ActionForm } from "@/components/ActionForm";
import { XpBar } from "@/components/XpBar";
import type {
  ActionEntry,
  Difficulty,
  EvaluateResponse,
} from "@/types/game";

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  trivial: "Мелочь",
  easy: "Лёгкое",
  medium: "Среднее",
  hard: "Сложное",
  epic: "Эпик",
};

// Статичные классы (не собираем имя динамически — иначе Tailwind их не увидит).
const DIFFICULTY_BADGE: Record<Difficulty, string> = {
  trivial: "bg-difficulty-trivial text-white",
  easy: "bg-difficulty-easy text-white",
  medium: "bg-difficulty-medium text-black",
  hard: "bg-difficulty-hard text-white",
  epic: "bg-difficulty-epic text-white",
};

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${DIFFICULTY_BADGE[difficulty]}`}
    >
      {DIFFICULTY_LABEL[difficulty]}
    </span>
  );
}

export function GameBoard({
  initialTotalXp,
  initialHistory,
}: {
  initialTotalXp: number;
  initialHistory: ActionEntry[];
}) {
  // Источник правды — БД. Сюда приходят уже загруженные на сервере данные.
  const [totalXp, setTotalXp] = useState(initialTotalXp);
  const [history, setHistory] = useState<ActionEntry[]>(initialHistory);
  const [last, setLast] = useState<ActionEntry | null>(null);

  // Сюда приходят только валидные действия (ActionForm отсеивает невалидные).
  // totalXp берём из ответа роута — это актуальное значение из БД.
  function handleResult(result: EvaluateResponse) {
    const entry: ActionEntry = {
      id: crypto.randomUUID(),
      text: result.text,
      difficulty: result.difficulty,
      xp: result.xp,
      createdAt: new Date().toISOString(),
    };
    setTotalXp(result.totalXp);
    setLast(entry);
    setHistory((prev) => [entry, ...prev].slice(0, 10));
  }

  return (
    <div className="flex flex-col gap-6">
      <XpBar totalXp={totalXp} />

      <ActionForm onResult={handleResult} />

      {last && (
        <div className="rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-3">
            <DifficultyBadge difficulty={last.difficulty} />
            <span className="font-bold text-xp">+{last.xp} XP</span>
          </div>
          <p className="mt-2 text-sm">{last.text}</p>
        </div>
      )}

      {history.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Последние действия
          </h2>
          <ul className="flex flex-col gap-1.5">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-black/[0.03] px-3 py-2 text-sm dark:bg-white/[0.04]"
              >
                <span className="flex items-center gap-2 truncate">
                  <DifficultyBadge difficulty={entry.difficulty} />
                  <span className="truncate">{entry.text}</span>
                </span>
                <span className="shrink-0 font-medium text-xp">+{entry.xp}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
