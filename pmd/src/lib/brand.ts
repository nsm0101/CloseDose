/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Centralized PREtendingMD brand assets.
 *
 * The hand-drawn "stuffed bear doctor" is the mascot and identifying visual
 * for the app. Source art lives in `public/images/`; these optimized,
 * web-sized derivatives are generated from the high-res masters. Paths
 * resolve under the app's BASE_URL ("/PMD/") in production.
 */
const base = import.meta.env.BASE_URL;

export const BRAND = {
  /** Full doctor-bear mascot with stethoscope, transparent background. */
  mascot: `${base}images/bear-mascot.png`,
  /** Clean bear-head mark, transparent — ideal for compact spots (headers, footers). */
  bearHead: `${base}images/bear-head.png`,
  /** Rainbow "PREtendingMD" wordmark, transparent — for light backgrounds. */
  wordmark: `${base}images/wordmark.png`,
  /** Full-color app icon (blue starry tile) — favicons, install icon. */
  appIcon: `${base}images/icon-512.png`,
} as const;
