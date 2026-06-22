import { Flame } from "lucide-react";

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
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-6">
      <Flame
        className="h-10 w-10 shrink-0 text-streak"
        style={{ filter: "drop-shadow(0 0 12px rgba(245, 158, 11, 0.55))" }}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="leading-none">
          <span className="font-display text-3xl font-bold text-text">
            {currentStreak}
          </span>{" "}
          <span className="text-sm text-muted">
            {dayWord(currentStreak)} подряд
          </span>
        </p>
        <p className="mt-1.5 text-xs text-muted">Рекорд: {longestStreak}</p>
      </div>
    </div>
  );
}
