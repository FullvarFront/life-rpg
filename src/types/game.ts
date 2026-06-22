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

/** Состояние игрока, выведенное из суммарного опыта. */
export interface PlayerState {
  totalXp: number;
  level: number;
  /** Сколько XP набрано внутри текущего уровня. */
  xpIntoLevel: number;
  /** Сколько XP нужно, чтобы пройти текущий уровень и перейти на следующий. */
  xpForNextLevel: number;
}
