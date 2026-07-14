import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/types";

export async function requireUser(locale: Locale, nextPath: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login?next=${encodeURIComponent(nextPath)}`);
  const { data: profile, error } = await supabase.from("profiles").select("id,email,display_name,role").eq("id", user.id).single();
  if (error) throw error;
  return { supabase, user, profile };
}

export async function requireRole(locale: Locale, role: "partner" | "staff", nextPath: string) {
  const context = await requireUser(locale, nextPath);
  if (role === "staff") {
    if (context.profile.role !== "staff") redirect(`/${locale}/trips`);
    return context;
  }
  const { data: membership } = await context.supabase.from("partner_memberships").select("id,partner_id,permission").eq("user_id", context.user.id).maybeSingle();
  if (!membership) redirect(`/${locale}/partner/apply`);
  return { ...context, membership };
}
