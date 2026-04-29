import { supabase } from './supabaseClient'

const NEXT_URL_KEY = 'cappy.nextUrl'

export function getNextUrl(fallback = '/') {
  if (typeof window === 'undefined') return fallback
  try {
    return window.localStorage.getItem(NEXT_URL_KEY) || fallback
  } catch {
    return fallback
  }
}

export function clearNextUrl() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(NEXT_URL_KEY)
  } catch {}
}

export function setNextUrl(nextUrl = '/') {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(NEXT_URL_KEY, nextUrl)
  } catch {}
}

export async function requireAuth({ nextUrl = '/' } = {}) {
  const { data, error } = await supabase.auth.getUser()
  const user = data?.user ?? null
  if (user) return user
  if (nextUrl) setNextUrl(nextUrl)
  if (typeof window !== 'undefined') {
    const hashTarget = `#/auth${nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : ''}`
    if (window.location.hash !== hashTarget) {
      window.location.hash = hashTarget
    }
  }
  if (error) return null
  return null
}