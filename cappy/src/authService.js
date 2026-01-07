import { supabase } from "./supabaseClient";

const NEXT_KEY = "cappy_next_url";

/** Store where to send the user after login */
export function setNextUrl(url) {
  try { localStorage.setItem(NEXT_KEY, url); } catch (_) {}
}

export function getNextUrl(fallback = "/cappy/app/") {
  try { return localStorage.getItem(NEXT_KEY) || fallback; } catch (_) { return fallback; }
}

export function clearNextUrl() {
  try { localStorage.removeItem(NEXT_KEY); } catch (_) {}
}

/**
 * Gate a page behind auth. If not logged in, redirect to /cappy/auth/
 */
export async function requireAuth({ nextUrl } = {}) {
  const { data, error } = await supabase.auth.getUser();
  if (error) console.warn("requireAuth:", error.message);
  if (data?.user) return data.user;

  const target = nextUrl || (location.pathname + location.search);
  setNextUrl(target);
  location.href = `/cappy/auth/?next=${encodeURIComponent(target)}`;
  return null;
}

/** Logout */
export async function signOut() {
  await supabase.auth.signOut();
}
