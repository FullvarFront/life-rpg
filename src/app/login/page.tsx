"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

function authErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/invalid login credentials/i.test(msg)) return "Неверный email или пароль.";
  if (/user already registered/i.test(msg))
    return "Пользователь с таким email уже зарегистрирован.";
  if (/password should be at least/i.test(msg))
    return "Пароль слишком короткий (минимум 6 символов).";
  if (/unable to validate email|invalid email/i.test(msg))
    return "Некорректный email.";
  if (/email not confirmed/i.test(msg))
    return "Email не подтверждён. Проверьте почту.";
  return msg || "Не удалось выполнить действие.";
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;

        if (data.session) {
          // Подтверждение email отключено → вошли сразу.
          router.push("/");
          router.refresh();
        } else {
          // Подтверждение включено → письмо отправлено.
          setNotice(
            "Аккаунт создан. Подтвердите email по ссылке из письма, затем войдите.",
          );
          setMode("signin");
        }
      }
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 px-4 py-10">
      <header className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          <span className="text-text">Life</span>{" "}
          <span className="text-accent">RPG</span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          {mode === "signin" ? "Вход в аккаунт" : "Регистрация"}
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          autoComplete="email"
          placeholder="email@example.com"
          className="rounded-xl border border-border bg-elevated px-4 py-3 text-sm text-text outline-none transition-colors placeholder:text-muted focus:border-accent disabled:opacity-60"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          placeholder="Пароль (минимум 6 символов)"
          className="rounded-xl border border-border bg-elevated px-4 py-3 text-sm text-text outline-none transition-colors placeholder:text-muted focus:border-accent disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-bg transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-bg/40 border-t-bg" />
          )}
          {mode === "signin" ? "Войти" : "Зарегистрироваться"}
        </button>
      </form>

      {error && (
        <p
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-center text-sm text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          className="rounded-xl border border-streak/30 bg-streak/10 px-4 py-2.5 text-center text-sm text-streak"
          role="status"
        >
          {notice}
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          setMode((m) => (m === "signin" ? "signup" : "signin"));
          setError(null);
          setNotice(null);
        }}
        className="text-center text-sm text-muted underline-offset-2 transition-colors hover:text-text hover:underline"
      >
        {mode === "signin"
          ? "Нет аккаунта? Зарегистрироваться"
          : "Уже есть аккаунт? Войти"}
      </button>
    </main>
  );
}
