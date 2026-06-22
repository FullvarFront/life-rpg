/** Оценка сложности действия. */
export type Difficulty = "trivial" | "easy" | "medium" | "hard" | "epic";

/** Характеристика, которую развивает действие (рутина/быт → null). */
export type Attribute = "intellect" | "strength" | "creativity";

/** Запись о действии, которое ввёл пользователь. */
export interface ActionEntry {
  id: string;
  /** Что ввёл пользователь. */
  text: string;
  /** Оценка сложности. */
  difficulty: Difficulty;
  /** Начисленный опыт. */
  xp: number;
  /** Характеристика действия; null для рутины/быта. */
  attribute: Attribute | null;
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
  /** Характеристика, которую развивает действие; null для рутины/быта. */
  attribute: Attribute | null;
}

/** Ответ /api/evaluate: результат оценки плюс исходный текст. */
export type EvaluatedAction = EvaluationResult & { text: string };

/** Полный ответ /api/evaluate с обновлённым состоянием игрока из БД. */
export type EvaluateResponse = EvaluatedAction & {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  /** Новый XP по выбранной характеристике; null если attribute = null. */
  attributeXp: number | null;
};

/** Строка таблицы public.players (профиль игрока, 1 на пользователя). */
export interface PlayerRow {
  user_id: string;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  /** Дата последней активности (YYYY-MM-DD) или null. */
  last_active_date: string | null;
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
  /** Характеристика действия; null для рутины/быта. */
  attribute: Attribute | null;
  created_at: string;
}

/** Строка таблицы public.attribute_xp (XP по характеристике). */
export interface AttributeXpRow {
  user_id: string;
  attribute: Attribute;
  xp: number;
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
