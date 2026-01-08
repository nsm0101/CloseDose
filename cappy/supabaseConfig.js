const defaultSupabaseUrl = "https://tfmpgxwzgdzndbdzsftx.supabase.co";
const defaultSupabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbXBneHd6Z2R6bmRiZHpzZnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjg0MDcsImV4cCI6MjA3OTc0NDQwN30.X5f5YulGHxjJDFX2i7T3vDZXD3Gt9MY8SyvFybTHCKc";

const env = import.meta?.env ?? {};

const supabaseUrl = env.VITE_SUPABASE_URL || defaultSupabaseUrl;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || defaultSupabaseAnonKey;

export { supabaseAnonKey, supabaseUrl };
