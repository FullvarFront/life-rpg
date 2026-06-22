function dayWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "дня";
  return "дней";
}

export function DisciplineCard({
  currentStreak,
  longestStreak,
}: {
  currentStreak: number;
  longestStreak: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <span className="text-3xl" aria-hidden>
        🔥
      </span>
      <div className="min-w-0">
        <p className="text-lg font-bold text-streak">
          {currentStreak} {dayWord(currentStreak)} подряд
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Рекорд: {longestStreak}
        </p>
      </div>
    </div>
  );
}
