import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { supabaseAnonKey, supabaseUrl } from "./config";

export function createSupabasePublicClient() {
  return createClient<Database>(supabaseUrl(), supabaseAnonKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
