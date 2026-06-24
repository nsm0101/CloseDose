/*
 * CloseDose — site-wide analytics loader (single source of truth).
 *
 * Include this on every page, as early in <head> as possible, with:
 *     <script src="/analytics.js"></script>
 *
 * The root-relative "/analytics.js" path means the same tag works from
 * sub-directories (e.g. /legal/, /PMD/). To change the Google Analytics
 * property, pause tracking, or add site-wide events, edit THIS file only —
 * no per-page changes required.
 */
(function () {
  'use strict';

  // Google Analytics 4 measurement ID for the shared CloseDose property.
  var GA_MEASUREMENT_ID = 'G-WYY1QFRPYP';

  // Guard against double-initialisation (e.g. a page that still carries an
  // old inline snippet). Without this, GA4 would log duplicate page_views.
  if (window.__closeDoseAnalyticsLoaded) return;
  window.__closeDoseAnalyticsLoaded = true;

  // Standard GA4 bootstrap. Defining gtag synchronously here (rather than only
  // after the async library arrives) guarantees window.gtag exists for the
  // deferred scripts that depend on it — global.js, the calculator widget, and
  // the Cappy easter egg all call gtag('event', ...) behind `if (window.gtag)`.
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);

  // Pull in the gtag.js library asynchronously so it never blocks rendering.
  // Queued commands above are replayed once it loads.
  if (!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    (document.head || document.documentElement).appendChild(s);
  }
})();
