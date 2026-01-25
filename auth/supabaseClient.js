import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://fvvyapvwtnmambyrlmmx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2dnlhcHZ3dG5tYW1ieXJsbW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMDQzMTIsImV4cCI6MjA3NTg4MDMxMn0.LI4LKR6AefB5Bjm8PQLiIGzoIZ-tfVgJBPVdwzEX0_M";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
