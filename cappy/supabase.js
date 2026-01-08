import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { supabaseAnonKey, supabaseUrl } from "./supabaseConfig.js";

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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

export { supabase, supabaseAnonKey, supabaseUrl };
