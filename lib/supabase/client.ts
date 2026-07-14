"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { supabaseAnonKey, supabaseUrl } from "./config";

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(supabaseUrl(), supabaseAnonKey());
}
