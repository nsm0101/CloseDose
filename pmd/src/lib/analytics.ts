/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Lightweight analytics wrapper for PREtendingMD.
 *
 * Page traffic is captured automatically by the gtag snippet in `index.html`
 * (shared CloseDose GA4 property `G-WYY1QFRPYP`). This helper layers on a few
 * product events so we can see not just *how much* traffic the app gets, but
 * *what people actually do* — which tabs they use, how many patients/sessions
 * are created, etc.
 *
 * Every call is best-effort and fail-safe: if gtag has not loaded (ad blocker,
 * offline, etc.) the call is a no-op and never throws. Analytics must never
 * interfere with clinical workflow.
 *
 * No PHI is ever sent — only counts, roles, and UI state.
 */

type GtagFn = (
  command: 'event' | 'config' | 'js' | 'set',
  targetOrEvent: string | Date,
  params?: Record<string, unknown>,
) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

/** GA4 measurement ID. Shared with closedose.com so all traffic is in one place. */
export const GA_MEASUREMENT_ID = 'G-WYY1QFRPYP';

/** Fire a custom GA4 event. Never throws. */
export function track(eventName: string, params: Record<string, unknown> = {}): void {
  try {
    if (typeof window === 'undefined') return;
    const payload = { app: 'pretendingmd', ...params };
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, payload);
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: eventName, ...payload });
    }
  } catch {
    /* best-effort only */
  }
}

/**
 * Record a logical screen/tab view. GA4 already logs the initial page_view;
 * this gives us per-tab engagement inside the single-page app.
 */
export function trackView(view: string): void {
  track('screen_view', { screen_name: view });
}
