import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GameBoard } from "@/components/GameBoard";
import { SignOutButton } from "@/components/SignOutButton";
import type { ActionEntry, Attribute, Difficulty } from "@/types/game";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Серверная защита: нет сессии → на страницу входа.
  if (!user) redirect("/login");

  // Профиль: суммарный XP и стрик.
  const { data: player } = await supabase
    .from("players")
    .select("total_xp, current_streak, longest_streak")
    .eq("user_id", user.id)
    .single();

  // XP по характеристикам (отсутствующие = 0).
  const { data: attrRows } = await supabase
    .from("attribute_xp")
    .select("attribute, xp")
    .eq("user_id", user.id);

  // Последние действия.
  const { data: actions } = await supabase
    .from("actions")
    .select("id, text, difficulty, xp, attribute, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const attributeXp: Record<Attribute, number> = {
    intellect: 0,
    strength: 0,
    creativity: 0,
  };
  for (const row of attrRows ?? []) {
    if (row.attribute in attributeXp) {
      attributeXp[row.attribute as Attribute] = row.xp;
    }
  }

  const initialHistory: ActionEntry[] = (actions ?? []).map((a) => ({
    id: a.id,
    text: a.text,
    difficulty: a.difficulty as Difficulty,
    xp: a.xp,
    attribute: (a.attribute as Attribute | null) ?? null,
    createdAt: a.created_at,
  }));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold tracking-tight text-text">
            Life
          </span>
          <span className="font-display text-2xl font-bold tracking-tight text-accent">
            RPG
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden truncate text-xs text-muted sm:inline">
            {user.email}
          </span>
          <SignOutButton />
        </div>
      </header>

      <GameBoard
        initialTotalXp={player?.total_xp ?? 0}
        initialCurrentStreak={player?.current_streak ?? 0}
        initialLongestStreak={player?.longest_streak ?? 0}
        initialAttributeXp={attributeXp}
        initialHistory={initialHistory}
      />
    </main>
  );
}
