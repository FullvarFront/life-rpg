import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GameBoard } from "@/components/GameBoard";
import { SignOutButton } from "@/components/SignOutButton";
import type { ActionEntry, Difficulty } from "@/types/game";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Серверная защита: нет сессии → на страницу входа.
  if (!user) redirect("/login");

  // Начальные данные из БД: суммарный XP и последние действия.
  const { data: player } = await supabase
    .from("players")
    .select("total_xp")
    .eq("user_id", user.id)
    .single();

  const { data: actions } = await supabase
    .from("actions")
    .select("id, text, difficulty, xp, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const initialTotalXp = player?.total_xp ?? 0;
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
        initialTotalXp={initialTotalXp}
        initialHistory={initialHistory}
      />
    </main>
  );
}
