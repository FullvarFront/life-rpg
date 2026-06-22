import Groq from "groq-sdk";
import type { Difficulty, EvaluationResult } from "@/types/game";
import { clampXp } from "@/game/xp";

// Весь код, зависящий от AI-провайдера, живёт ТОЛЬКО здесь.
// Смена провайдера = правка этого файла, остальной код не трогаем.

/** Быстрая лёгкая модель Groq (бесплатный tier). */
const MODEL = "llama-3.1-8b-instant";

const DIFFICULTIES: readonly Difficulty[] = [
  "trivial",
  "easy",
  "medium",
  "hard",
  "epic",
];

/** Результат по умолчанию при сбое парсинга/ответа. */
const PARSE_FALLBACK: EvaluationResult = {
  valid: false,
  reason: "Не удалось оценить действие, попробуй переформулировать",
  difficulty: "trivial",
  xp: 0,
};

const SYSTEM_PROMPT = `Ты — судья действий в RPG-игре про реальную жизнь. Игрок вводит, что он сделал, а ты решаешь, засчитать ли это и сколько опыта (XP) дать.

ШАГ 1. Реши, валидно ли действие.
ЗАСЧИТЫВАЙ (valid=true) только реальные, уже совершённые, полезные или нейтрально-продуктивные действия: учёба, работа, спорт, гигиена, забота о себе и близких, бытовые дела, творчество, полезные привычки.
НЕ ЗАСЧИТЫВАЙ (valid=false), если это:
- негатив или отрицание действия («не мылся», «ничего не делал», «прокрастинировал»);
- вредное/деструктивное действие;
- бессмыслица, случайный набор букв, не действие;
- явная попытка обмануть систему или нереалистичное преувеличение.
Если valid=false — поставь difficulty="trivial", xp=0 и в reason напиши короткое дружелюбное объяснение, почему не засчитано (1 предложение, на русском).

ШАГ 2. Если valid=true — определи ТИП действия:
- РУТИННОЕ (бытовое самообслуживание и быт): гигиена, еда, уборка, посуда, мелкие бытовые дела. Это поддержание жизни, а не развитие.
- РАЗВИВАЮЩЕЕ: учёба, тренировки и спорт, освоение навыков, осмысленная работа, творческая практика — то, что делает человека лучше.

ШАГ 3. Оцени сложность и XP в зависимости от типа.

Для РУТИННЫХ действий:
- Оценивай по сути действия, а НЕ по времени. Длительность игнорируй: «помылся», «помылся 1 минуту» и «мылся полчаса» — это одно и то же, давай одинаково.
- Такие действия обычно trivial или easy; крупная разовая бытовая задача (генеральная уборка) — максимум medium.
- Не повышай XP за то, что человек делал рутину «дольше».

Для РАЗВИВАЮЩИХ действий:
- Учитывай время и интенсивность: «2 часа учил английский» должно дать заметно больше, чем «1 минуту учил английский». Чем дольше/интенсивнее — тем выше XP, а очень долгое/интенсивное может поднять саму сложность.
- Не верь нереалистичным заявлениям о времени — оценивай правдоподобно.

Шкала сложности:
trivial — мелочь, секунды; easy — лёгкое; medium — заметное усилие; hard — серьёзная задача/высокая интенсивность; epic — крупное достижение.

ШАГ 4. Назначь конкретное число XP внутри диапазона выбранной сложности:
trivial 2–9, easy 10–29, medium 30–69, hard 70–129, epic 130–240.
Выбирай НЕкруглые числа (47, а не 50; 113, а не 100).

Верни строго JSON: { "valid": boolean, "reason": string, "difficulty": "trivial|easy|medium|hard|epic", "xp": целое число }.`;

function isDifficulty(value: unknown): value is Difficulty {
  return (
    typeof value === "string" &&
    (DIFFICULTIES as readonly string[]).includes(value)
  );
}

/**
 * Оценивает действие через Groq: валидность, сложность и XP.
 * XP валидного действия прогоняется через clampXp для безопасности.
 * Сетевые ошибки/ошибки API пробрасываются наружу — их ловит вызывающий роут.
 */
export async function evaluateAction(text: string): Promise<EvaluationResult> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Действие игрока: "${text}"` },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) return PARSE_FALLBACK;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    const difficulty = isDifficulty(parsed.difficulty)
      ? parsed.difficulty
      : "trivial";
    const reason = typeof parsed.reason === "string" ? parsed.reason : "";

    // Невалидно: принудительно xp=0, сложность trivial.
    if (parsed.valid !== true) {
      return {
        valid: false,
        reason: reason || PARSE_FALLBACK.reason,
        difficulty: "trivial",
        xp: 0,
      };
    }

    // Валидно: зажимаем xp в диапазон сложности.
    const rawXp =
      typeof parsed.xp === "number" ? parsed.xp : Number(parsed.xp);
    const xp = clampXp(difficulty, Number.isFinite(rawXp) ? rawXp : 0);

    return { valid: true, reason: "", difficulty, xp };
  } catch {
    return PARSE_FALLBACK;
  }
}
