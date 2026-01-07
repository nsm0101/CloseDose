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
 * IMPORTANT: Call this on pages that might be the emailRedirectTo target.
 * It turns the magic-link URL into a persisted session.
 */
export async function initAuthFromUrl() {
  const { data, error } = await supabase.auth.getSession();
  if (error) console.warn("initAuthFromUrl:", error.message);
  return data?.session ?? null;
}

/**
 * Gate a page behind auth. If not logged in, redirect to /cappy/login/
 */
export async function requireAuth({ nextUrl } = {}) {
  await initAuthFromUrl();

  const { data } = await supabase.auth.getUser();
  if (data?.user) return data.user;

  const target = nextUrl || (location.pathname + location.search);
  setNextUrl(target);
  location.href = `/cappy/login/?next=${encodeURIComponent(target)}`;
  return null;
}

/** Send email magic-link (OTP) */
export async function sendMagicLink(email, redirectToAbsoluteUrl) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectToAbsoluteUrl },
  });
  if (error) throw error;
}

/** Logout */
export async function signOut() {
  await supabase.auth.signOut();
}
