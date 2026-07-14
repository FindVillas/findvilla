"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  return <button className="locale-switch" onClick={async () => { await createSupabaseBrowserClient().auth.signOut(); router.refresh(); }}>Sign out</button>;
}
