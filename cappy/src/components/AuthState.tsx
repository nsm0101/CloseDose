import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useSession() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) =>
      setSession(session)
    )

    return () => sub.subscription.unsubscribe()
  }, [])

  return session
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    alert('Sign out failed')
  }
}
