import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("[supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — DB calls will fail");
}

// Use a placeholder URL when env is missing so the server can still start
// (health endpoint works; DB routes will return errors)
export const supabase: SupabaseClient = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseServiceKey || "placeholder",
);
