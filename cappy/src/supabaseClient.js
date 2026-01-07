import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client (browser safe): uses anon key only.
 * - detectSessionInUrl: true enables magic-link / OAuth callback parsing
 * - flowType: "pkce" is recommended for modern auth flows
 */
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  }
);
