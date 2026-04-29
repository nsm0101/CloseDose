import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const configured = Boolean(url && anonKey)

function missingConfigError() {
  return new Error('Supabase is not configured for this build. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

function rejectMissing() {
  return Promise.resolve({ data: null, error: missingConfigError() })
}

function createMockSupabase() {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: missingConfigError() }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: async () => ({ error: missingConfigError() }),
      signUp: rejectMissing,
      signInWithPassword: rejectMissing,
    },
    from() {
      return {
        upsert: rejectMissing,
        insert: () => ({
          select: () => ({ single: rejectMissing })
        })
      }
    },
    rpc: rejectMissing,
    __configured: false,
  }
}

export const supabase = configured
  ? createClient(url, anonKey)
  : createMockSupabase()

export const supabaseConfigured = configured