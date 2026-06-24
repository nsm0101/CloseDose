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

  // ---------------------------------------------------------------------------
  // Feature-usage tracking
  // ---------------------------------------------------------------------------

  // Acquisition context, read once from the URL and attached to every event so
  // usage can be sliced by where a visitor came from — e.g. a printed clinic
  // handout linking to /?src=qr&id=clinic-poster.
  var search = new URLSearchParams(window.location.search);
  var SRC = (search.get('src') || 'na').toLowerCase();
  var ID = (search.get('id') || 'na').toLowerCase();

  // The one safe way to record a feature-usage event. Never throws and quietly
  // no-ops if analytics is blocked. Exposed as window.cdTrack so inline page
  // scripts can report usage the same way, e.g.
  //   window.cdTrack('shopping_mode_toggle', { state: 'on' });
  function cdTrack(name, eventParams) {
    if (!name) return;
    try {
      var payload = { src: SRC, id: ID };
      if (eventParams) {
        Object.keys(eventParams).forEach(function (key) {
          payload[key] = eventParams[key];
        });
      }
      gtag('event', name, payload);
    } catch (_) { /* best-effort only — analytics must never break the page */ }
  }
  window.cdTrack = cdTrack;

  // Automatic outbound + contact tracking. External links, mailto: and tel:
  // clicks are some of the most valuable conversions on the site (donations,
  // sponsorship email, the Poison Control phone number, Shopping-Mode retailer
  // links) yet are tedious to tag by hand, so capture them site-wide.
  function trackAnchor(anchor) {
    var href = anchor.getAttribute('href') || '';
    if (!href) return;
    if (/^mailto:/i.test(href)) {
      cdTrack('email_click', { to: href.replace(/^mailto:/i, '').split('?')[0] });
    } else if (/^tel:/i.test(href)) {
      cdTrack('phone_click', { number: href.replace(/^tel:/i, '') });
    } else if (/^https?:\/\//i.test(href)) {
      var host = '';
      try { host = new URL(href, window.location.href).hostname; } catch (_) { host = ''; }
      if (host && host !== window.location.hostname) {
        cdTrack('outbound_click', {
          domain: host.replace(/^www\./, ''),
          label: (anchor.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
        });
      }
    }
  }

  // A single delegated listener (capture phase, so it still fires when an inner
  // handler stops propagation) drives both the declarative data-track events and
  // the automatic anchor tracking above.
  document.addEventListener('click', function (event) {
    var node = event.target;
    if (!node || typeof node.closest !== 'function') return;

    // Declarative tracking: <button data-track="event_name" data-track-foo="bar">
    // records cdTrack('event_name', { foo: 'bar' }) with no extra JavaScript.
    var tracked = node.closest('[data-track]');
    if (tracked) {
      var extra = {};
      var data = tracked.dataset || {};
      Object.keys(data).forEach(function (key) {
        if (key.indexOf('track') === 0 && key !== 'track') {
          var param = key.slice('track'.length);
          extra[param.charAt(0).toLowerCase() + param.slice(1)] = data[key];
        }
      });
      cdTrack(tracked.getAttribute('data-track'), extra);
    }

    var anchor = node.closest('a[href]');
    if (anchor) trackAnchor(anchor);
  }, true);
})();
