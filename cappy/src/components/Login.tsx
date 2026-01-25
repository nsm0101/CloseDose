import React from 'react'
import { supabase } from '../lib/supabaseClient'

export async function signInWithGoogle(next: string = '/') {
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : process.env.PUBLIC_SITE_URL || (import.meta as any).env?.PUBLIC_SITE_URL

  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })

  if (error) {
    console.error('Google OAuth error:', error.message)
    alert('Google sign-in failed. Please try again.')
  }
}

export default function Login() {
  return (
    <button type="button" onClick={() => signInWithGoogle('/')}>
      Sign in with Google
    </button>
  )
}
