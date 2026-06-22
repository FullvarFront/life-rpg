import { NextResponse } from "next/server";
import { evaluateAction } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";

const MAX_LENGTH = 300;

export async function POST(request: Request) {
  // 1. Авторизация
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  }

  // 2. Тело должно быть валидным JSON
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Тело запроса должно быть JSON." },
      { status: 400 },
    );
  }

  // 3. Валидация text
  const text = (body as { text?: unknown }).text;
  if (typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json(
      { error: "Поле text обязательно и не должно быть пустым." },
      { status: 400 },
    );
  }
  if (text.length > MAX_LENGTH) {
    return NextResponse.json(
      { error: `Поле text не должно превышать ${MAX_LENGTH} символов.` },
      { status: 400 },
    );
  }

  // 4. AI-оценка + запись в БД
  try {
    const result = await evaluateAction(text);

    // Невалидно: в БД не пишем, возвращаем текущее состояние.
    if (!result.valid) {
      const { data: player } = await supabase
        .from("players")
        .select("total_xp, current_streak, longest_streak")
        .eq("user_id", user.id)
        .single();
      return NextResponse.json({
        text,
        ...result,
        totalXp: player?.total_xp ?? 0,
        currentStreak: player?.current_streak ?? 0,
        longestStreak: player?.longest_streak ?? 0,
        attributeXp: null,
      });
    }

    // Валидно: атомарно пишем действие, XP, стрик и XP характеристики.
    const { data: state, error: rpcError } = await supabase.rpc("apply_action", {
      p_text: text,
      p_difficulty: result.difficulty,
      p_xp: result.xp,
      p_attribute: result.attribute,
    });
    if (rpcError) throw rpcError;

    return NextResponse.json({
      text,
      ...result,
      totalXp: state?.total_xp ?? 0,
      currentStreak: state?.current_streak ?? 0,
      longestStreak: state?.longest_streak ?? 0,
      attributeXp: state?.attribute_xp ?? null,
    });
  } catch (error) {
    // Детали наружу не отдаём — только в серверный лог.
    console.error("POST /api/evaluate failed:", error);
    return NextResponse.json(
      { error: "Не удалось оценить действие. Попробуйте позже." },
      { status: 500 },
    );
  }
}
