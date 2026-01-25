import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  (import.meta as any).env?.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL,
  (import.meta as any).env?.PUBLIC_SUPABASE_ANON_KEY ||
    process.env.PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)
