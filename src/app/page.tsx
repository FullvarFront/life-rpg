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
    .select("id, text, difficulty, xp, created_at")
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
    createdAt: a.created_at,
  }));

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-10">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight">Life RPG</h1>
          <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
            {user.email}
          </p>
        </div>
        <SignOutButton />
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
