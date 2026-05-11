const fallbackSupabaseUrl = "http://127.0.0.1:54321";
const fallbackSupabaseAnonKey = "local-build-placeholder-key";

export function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return {
    supabaseUrl: supabaseUrl || fallbackSupabaseUrl,
    supabaseAnonKey: supabaseAnonKey || fallbackSupabaseAnonKey,
    isConfigured: Boolean(supabaseUrl && supabaseAnonKey),
  };
}

export function isSupabaseConfigured() {
  return getSupabaseConfig().isConfigured;
}
