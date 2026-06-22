import { createBrowserClient } from "@supabase/ssr";

/** Браузерный клиент Supabase (для клиентских компонентов). */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
