import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

/**
 * Supabase client (browser safe): uses anon key only.
 * - detectSessionInUrl: true enables auth callback parsing
 * - flowType: "pkce" is recommended for modern auth flows
 */
export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});

supabase.auth.getSession().then(({ data }) => {
  supabase.realtime.setAuth(data?.session?.access_token ?? null);
});

supabase.auth.onAuthStateChange((_event, session) => {
  supabase.realtime.setAuth(session?.access_token ?? null);
});
