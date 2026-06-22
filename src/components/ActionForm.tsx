"use client";

import { useState, type FormEvent } from "react";
import { SendHorizontal } from "lucide-react";
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
        err instanceof Error
          ? err.message
          : "Что-то пошло не так. Попробуйте ещё раз.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="font-display text-lg font-semibold text-text">
        Что ты сделал?
      </h2>
      <p className="mt-1 text-sm text-muted">
        Опиши действие — ИИ оценит его и начислит опыт.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
            maxLength={300}
            placeholder="Напр. «час учил английский»"
            className="flex-1 rounded-xl border border-border bg-elevated px-4 py-3 text-sm text-text outline-none transition-colors placeholder:text-muted focus:border-accent disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-bg transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-bg/40 border-t-bg" />
            ) : (
              <SendHorizontal className="h-4 w-4" aria-hidden />
            )}
            {loading ? "Оцениваю…" : "Выполнить"}
          </button>
        </div>

        {notice && (
          <p
            className="rounded-xl border border-streak/30 bg-streak/10 px-4 py-2.5 text-sm text-streak"
            role="status"
          >
            {notice}
          </p>
        )}
        {error && (
          <p
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
