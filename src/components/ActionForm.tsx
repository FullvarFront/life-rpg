"use client";

import { useState, type FormEvent } from "react";
import type { EvaluateResponse } from "@/types/game";

export function ActionForm({
  onResult,
}: {
  onResult: (result: EvaluateResponse) => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const trimmed = text.trim();
  const canSubmit = trimmed.length > 0 && !loading;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      const data: unknown = await res.json();

      if (!res.ok) {
        const message =
          (data as { error?: string }).error ?? "Не удалось оценить действие.";
        throw new Error(message);
      }

      const result = data as EvaluateResponse;
      if (!result.valid) {
        // Действие не засчитано: XP не начисляем, показываем причину.
        setNotice(result.reason || "Это действие не засчитано.");
        setText("");
        return;
      }

      onResult(result);
      setText("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Что-то пошло не так. Попробуйте ещё раз.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
          maxLength={300}
          placeholder="Что ты сделал? Напр. «час учил английский»"
          className="flex-1 rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-xp disabled:opacity-60 dark:border-white/15 dark:bg-zinc-900"
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex items-center gap-2 rounded-lg bg-xp px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {loading ? "Оцениваю…" : "Выполнить"}
        </button>
      </div>
      {notice && (
        <p
          className="rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
          role="status"
        >
          {notice}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
