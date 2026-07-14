import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { requireEnv, supabaseUrl } from "./config";

export function createSupabaseAdminClient() {
  return createClient<Database>(supabaseUrl(), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
