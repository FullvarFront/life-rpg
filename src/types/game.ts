/** Оценка сложности действия. */
export type Difficulty = "trivial" | "easy" | "medium" | "hard" | "epic";

/** Запись о действии, которое ввёл пользователь. */
export interface ActionEntry {
  id: string;
  /** Что ввёл пользователь. */
  text: string;
  /** Оценка сложности. */
  difficulty: Difficulty;
  /** Начисленный опыт. */
  xp: number;
  /** ISO-дата создания. */
  createdAt: string;
}

/** Результат AI-оценки действия. */
export interface EvaluationResult {
  /** Засчитано ли действие. */
  valid: boolean;
  /** Объяснение, если невалидно; иначе "". */
  reason: string;
  difficulty: Difficulty;
  /** Начисленный опыт; 0 если невалидно. */
  xp: number;
}

/** Ответ /api/evaluate: результат оценки плюс исходный текст. */
export type EvaluatedAction = EvaluationResult & { text: string };

/** Полный ответ /api/evaluate с актуальным total XP из БД. */
export type EvaluateResponse = EvaluatedAction & { totalXp: number };

/** Строка таблицы public.players (профиль игрока, 1 на пользователя). */
export interface PlayerRow {
  user_id: string;
  total_xp: number;
  created_at: string;
}

/** Строка таблицы public.actions (засчитанное действие). */
export interface ActionRow {
  id: string;
  user_id: string;
  text: string;
  /** В БД хранится как text; по смыслу — Difficulty. */
  difficulty: Difficulty;
  xp: number;
  created_at: string;
}

/** Состояние игрока, выведенное из суммарного опыта. */
export interface PlayerState {
  totalXp: number;
  level: number;
  /** Сколько XP набрано внутри текущего уровня. */
  xpIntoLevel: number;
  /** Сколько XP нужно, чтобы пройти текущий уровень и перейти на следующий. */
  xpForNextLevel: number;
}
