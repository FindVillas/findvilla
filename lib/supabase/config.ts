export function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

// Next.js only includes NEXT_PUBLIC values in browser bundles when their names
// are statically analyzable. Do not replace these with process.env[name].
const publicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function supabaseUrl() {
  if (!publicSupabaseUrl) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL");
  return publicSupabaseUrl;
}

export function supabaseAnonKey() {
  if (!publicSupabaseAnonKey) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return publicSupabaseAnonKey;
}
