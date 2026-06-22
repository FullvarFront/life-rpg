"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="shrink-0 rounded-xl border border-border px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:border-muted/50 hover:text-text disabled:opacity-50"
    >
      {loading ? "Выходим…" : "Выйти"}
    </button>
  );
}
