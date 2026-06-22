import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Серверный клиент Supabase (Server Components, Route Handlers, Server Actions). */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Вызвано из Server Component, где менять cookies нельзя.
            // Сессию обновит middleware — это безопасно игнорировать.
          }
        },
      },
    },
  );
}
