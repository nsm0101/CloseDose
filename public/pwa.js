/*
 * CloseDose — Add to Home Screen + Share.
 *
 * Two small, self-contained features that share one stylesheet:
 *
 *   1. Add to Home Screen. On Android/Chrome we capture `beforeinstallprompt`
 *      and drive the native installer. On iOS Safari there is no such event,
 *      so we show the manual Share -> "Add to Home Screen" instructions with
 *      the real iOS glyph. Either way the invitation appears once the person
 *      has actually used the page, never on first paint, and a dismissal is
 *      remembered for 60 days.
 *
 *   2. Share. `navigator.share` where available (the whole point on mobile),
 *      clipboard copy as the fallback everywhere else. Injected into the site
 *      header next to the menu button and into the menu panel.
 *
 * No dependencies. Drop in with:
 *     <script src="/pwa.js" defer></script>
 */
(function (global) {
  'use strict';

  if (global.CloseDosePWA) return;

  var doc = document;

  var SHARE_URL = 'https://closedose.com/';
  var SHARE_TITLE = 'CloseDose — pediatric dosing calculator';
  var SHARE_TEXT =
    'Free, physician-built pediatric dosing calculator. Acetaminophen and ibuprofen doses by weight in seconds — no account needed.';

  var A2HS_KEY = 'cd-a2hs-dismissed';
  var A2HS_DELAY_MS = 25000; // let them use the thing first
  var A2HS_SNOOZE_DAYS = 60;

  /* ------------------------------------------------------------------ *
   * Environment
   * ------------------------------------------------------------------ */

  function isStandalone() {
    return !!(
      (global.matchMedia && global.matchMedia('(display-mode: standalone)').matches) ||
      global.navigator.standalone === true
    );
  }

  var ua = global.navigator.userAgent || '';
  var isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS 13+ reports as Mac; the touch-point check separates them.
    (/Macintosh/.test(ua) && global.navigator.maxTouchPoints > 1);

  var isIPad = /iPad/.test(ua) || (/Macintosh/.test(ua) && global.navigator.maxTouchPoints > 1);

  /*
   * Other iOS browsers announce themselves (CriOS, FxiOS...), but an in-app
   * WKWebView — the browser you get tapping a link inside Facebook, Instagram,
   * Gmail, LinkedIn — impersonates Safari almost exactly. The reliable tell is
   * that real Safari carries a "Version/" token and embedded web views do not.
   * This matters because Add to Home Screen exists ONLY in real Safari; showing
   * its instructions anywhere else sends a caregiver looking for a button that
   * is not there.
   */
  var IN_APP_MARKERS =
    /FBAN|FBAV|FB_IAB|Instagram|LinkedInApp|Line\/|Twitter|Snapchat|Pinterest|TikTok|MicroMessenger|WhatsApp|GSA\//;
  var OTHER_IOS_BROWSERS = /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/;

  var isInAppBrowser = isIOS && (IN_APP_MARKERS.test(ua) || !/Version\//.test(ua));
  var isSafari =
    isIOS && !OTHER_IOS_BROWSERS.test(ua) && !isInAppBrowser && /Version\//.test(ua);
  /* iOS, but somewhere Add to Home Screen cannot be reached. */
  var isIOSElsewhere = isIOS && !isSafari;

  function track(name, params) {
    try {
      if (typeof global.gtag === 'function') global.gtag('event', name, params || {});
    } catch (e) { /* analytics never breaks the UI */ }
  }

  /* ------------------------------------------------------------------ *
   * Styles
   * ------------------------------------------------------------------ */

  var CSS = [
    /* shared button chrome, matched to the existing header controls */
    '.cdpwa-iconbtn{appearance:none;border:0;cursor:pointer;font:inherit;display:inline-flex;',
    'align-items:center;justify-content:center;gap:6px;min-height:44px;min-width:44px;',
    'padding:0 12px;border-radius:var(--radius-pill,999px);color:var(--ink-900,#0f2c2a);',
    'background:var(--card-bg,#fff);box-shadow:var(--shadow-btn,0 4px 12px rgba(15,44,42,.08));',
    'border:var(--card-border,1px solid rgba(15,44,42,.1));font-weight:800;',
    'font-size:var(--text-sm,.85rem);transition:transform .15s var(--ease-out,ease);}',
    '.cdpwa-iconbtn:active{transform:translateY(1px);}',
    '.cdpwa-iconbtn:focus-visible{outline:3px solid var(--teal-500,#1f8f7b);outline-offset:2px;}',
    '.cdpwa-iconbtn svg{width:18px;height:18px;flex:0 0 auto;}',
    '@media (max-width:520px){.cdpwa-iconbtn .cdpwa-iconbtn__label{',
    'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;}}',

    /* menu-panel variant sits on the dark overlay */
    '.cdpwa-menuitem{width:100%;justify-content:flex-start;background:transparent;',
    'border:1px solid var(--card-border-color,rgba(255,255,255,.18));',
    'color:var(--menu-link-color,inherit);box-shadow:none;padding:12px 16px;',
    'border-radius:var(--radius-sm,10px);margin-top:8px;}',
    '.cdpwa-menuitem .cdpwa-iconbtn__label{position:static;width:auto;height:auto;clip:auto;}',

    /* toast */
    '.cdpwa-toast{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom,0px));',
    'transform:translate(-50%,12px);z-index:1200;background:var(--ink-900,#0f2c2a);color:#fff;',
    'padding:12px 20px;border-radius:999px;font-weight:800;font-size:.9rem;',
    'font-family:var(--font-ui,system-ui,sans-serif);box-shadow:0 12px 28px rgba(0,0,0,.28);',
    'opacity:0;pointer-events:none;transition:opacity .2s ease,transform .2s ease;}',
    '.cdpwa-toast--on{opacity:1;transform:translate(-50%,0);}',

    /* install invitation */
    '.cdpwa-banner{position:fixed;left:12px;right:12px;',
    'bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:1150;',
    'max-width:520px;margin:0 auto;background:var(--card-bg,#fff);color:var(--ink-900,#0f2c2a);',
    'border:var(--card-border,1px solid rgba(15,44,42,.12));border-radius:var(--radius-lg,20px);',
    'box-shadow:var(--shadow-lg,0 22px 45px rgba(13,52,82,.18));padding:16px;',
    'font-family:var(--font-ui,system-ui,sans-serif);',
    'transform:translateY(140%);transition:transform .35s var(--ease-out,cubic-bezier(.16,1,.3,1));}',
    '.cdpwa-banner--on{transform:translateY(0);}',
    '@media (prefers-reduced-motion:reduce){.cdpwa-banner{transition:none;}}',
    '.cdpwa-banner__row{display:flex;gap:12px;align-items:flex-start;}',
    '.cdpwa-banner__icon{flex:0 0 auto;width:44px;height:44px;border-radius:12px;',
    'object-fit:cover;background:rgba(36,166,135,.14);}',
    '.cdpwa-banner__title{margin:0;font-size:1rem;font-weight:900;line-height:1.25;}',
    '.cdpwa-banner__sub{margin:4px 0 0;font-size:.85rem;line-height:1.5;opacity:.85;}',
    '.cdpwa-banner__close{appearance:none;border:0;background:transparent;cursor:pointer;',
    'font-size:22px;line-height:1;color:inherit;opacity:.55;padding:4px 4px 4px 8px;',
    'min-width:32px;min-height:32px;margin:-4px -4px 0 0;}',
    '.cdpwa-banner__close:hover{opacity:1;}',
    '.cdpwa-banner__actions{display:flex;gap:10px;margin-top:14px;}',
    '.cdpwa-banner__cta{flex:1;appearance:none;border:0;cursor:pointer;font:inherit;font-weight:900;',
    'background:var(--teal-500,#1f8f7b);color:#fff;border-radius:999px;padding:13px 18px;',
    'min-height:48px;box-shadow:0 4px 0 rgba(15,44,42,.28);}',
    '.cdpwa-banner__cta:active{transform:translateY(1px);}',
    '.cdpwa-banner__cta:focus-visible{outline:3px solid var(--teal-500,#1f8f7b);outline-offset:3px;}',

    /* iOS step-by-step */
    '.cdpwa-steps{list-style:none;margin:14px 0 0;padding:0;display:grid;gap:10px;',
    'font-size:.9rem;line-height:1.45;}',
    '.cdpwa-steps li{display:flex;gap:10px;align-items:center;}',
    '.cdpwa-steps b{display:inline-flex;align-items:center;justify-content:center;',
    'flex:0 0 auto;width:24px;height:24px;border-radius:50%;background:rgba(36,166,135,.16);',
    'font-size:.75rem;font-weight:900;}',
    '.cdpwa-manual{margin-top:14px;padding-top:12px;',
    'border-top:1px dashed var(--card-border-color,rgba(15,44,42,.18));}',
    '.cdpwa-manual[hidden]{display:none;}',
    '.cdpwa-manual__lead{margin:0;font-size:.85rem;font-weight:800;}',
    '.cdpwa-linkcopy{appearance:none;border:0;background:transparent;cursor:pointer;font:inherit;',
    'font-weight:800;font-size:.85rem;color:inherit;text-decoration:underline;',
    'text-underline-offset:3px;padding:10px 0 2px;min-height:44px;}',
    '.cdpwa-ios-glyph{display:inline-flex;vertical-align:-4px;margin:0 2px;}',
    '.cdpwa-ios-glyph svg{width:16px;height:18px;}',
  ].join('');

  function injectStyles() {
    if (doc.getElementById('cdpwa-styles')) return;
    var s = doc.createElement('style');
    s.id = 'cdpwa-styles';
    s.textContent = CSS;
    doc.head.appendChild(s);
  }

  var SHARE_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>' +
    '<line x1="8.6" y1="10.5" x2="15.4" y2="6.5"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/></svg>';

  /* The iOS share glyph, so the instructions point at something recognisable. */
  var IOS_SHARE_GLYPH =
    '<span class="cdpwa-ios-glyph" aria-hidden="true">' +
    '<svg viewBox="0 0 20 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M10 2v12"/><path d="M6 6l4-4 4 4"/>' +
    '<path d="M4.5 10H3.5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V11a1 1 0 0 0-1-1h-1"/>' +
    '</svg></span>';

  /* ------------------------------------------------------------------ *
   * Toast
   * ------------------------------------------------------------------ */

  var toastEl = null;
  var toastTimer = null;

  function toast(message) {
    if (!toastEl) {
      toastEl = doc.createElement('div');
      toastEl.className = 'cdpwa-toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      doc.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    // force reflow so the transition runs on repeat calls
    void toastEl.offsetWidth;
    toastEl.classList.add('cdpwa-toast--on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('cdpwa-toast--on');
    }, 2600);
  }

  /* ------------------------------------------------------------------ *
   * Share
   * ------------------------------------------------------------------ */

  function share(source) {
    var payload = { title: SHARE_TITLE, text: SHARE_TEXT, url: SHARE_URL };
    track('share_click', { source: source || 'unknown' });

    if (global.navigator.share) {
      return global.navigator
        .share(payload)
        .then(function () {
          track('share_complete', { method: 'web_share' });
        })
        .catch(function (err) {
          // AbortError just means they closed the sheet. Not a failure.
          if (!err || err.name !== 'AbortError') copyLink();
        });
    }
    return copyLink();
  }

  function copyLink() {
    function done() {
      track('share_complete', { method: 'clipboard' });
      toast('Link copied — paste it anywhere');
    }

    if (global.navigator.clipboard && global.navigator.clipboard.writeText) {
      return global.navigator.clipboard
        .writeText(SHARE_URL)
        .then(done)
        .catch(legacyCopy);
    }
    return Promise.resolve(legacyCopy());

    function legacyCopy() {
      try {
        var ta = doc.createElement('textarea');
        ta.value = SHARE_URL;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        doc.body.appendChild(ta);
        ta.select();
        doc.execCommand('copy');
        doc.body.removeChild(ta);
        done();
      } catch (e) {
        toast('Copy this link: closedose.com');
      }
    }
  }

  function makeShareButton(className, label, source) {
    var b = doc.createElement('button');
    b.type = 'button';
    b.className = className;
    b.setAttribute('aria-label', 'Share CloseDose');
    b.innerHTML = SHARE_ICON + '<span class="cdpwa-iconbtn__label">Share</span>';
    if (label) b.querySelector('.cdpwa-iconbtn__label').textContent = label;
    b.addEventListener('click', function () {
      share(source);
    });
    return b;
  }

  function mountShareButtons() {
    // Header, next to the menu button.
    var menuBtn = doc.querySelector('.menu-btn');
    if (menuBtn && menuBtn.parentNode && !doc.querySelector('[data-cdpwa-share-header]')) {
      var headerBtn = makeShareButton('cdpwa-iconbtn', 'Share', 'header');
      headerBtn.setAttribute('data-cdpwa-share-header', '');
      headerBtn.style.marginLeft = 'auto';
      menuBtn.parentNode.insertBefore(headerBtn, menuBtn.nextSibling);
    }

    // Menu panel, above the close button.
    var menuLinks = doc.querySelector('.menu-panel .menu-links');
    if (menuLinks && menuLinks.parentNode && !doc.querySelector('[data-cdpwa-share-menu]')) {
      var menuBtnEl = makeShareButton(
        'cdpwa-iconbtn cdpwa-menuitem',
        'Share CloseDose with someone',
        'menu'
      );
      menuBtnEl.setAttribute('data-cdpwa-share-menu', '');
      menuLinks.parentNode.insertBefore(menuBtnEl, menuLinks.nextSibling);
    }

    // Anything the site marks up itself.
    Array.prototype.forEach.call(doc.querySelectorAll('[data-share-closedose]'), function (el) {
      if (el.__cdpwaBound) return;
      el.__cdpwaBound = true;
      el.addEventListener('click', function (ev) {
        ev.preventDefault();
        share(el.getAttribute('data-share-closedose') || 'inline');
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Add to Home Screen
   * ------------------------------------------------------------------ */

  var deferredPrompt = null;
  var bannerEl = null;

  function snoozed() {
    try {
      var until = parseInt(global.localStorage.getItem(A2HS_KEY) || '0', 10);
      return until > Date.now();
    } catch (e) {
      return false;
    }
  }

  function snooze() {
    try {
      global.localStorage.setItem(
        A2HS_KEY,
        String(Date.now() + A2HS_SNOOZE_DAYS * 864e5)
      );
    } catch (e) { /* private mode — just don't remember */ }
  }

  function closeBanner() {
    if (!bannerEl) return;
    bannerEl.classList.remove('cdpwa-banner--on');
    var el = bannerEl;
    bannerEl = null;
    setTimeout(function () {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 400);
  }

  /*
   * Hand off to real Safari.
   *
   * `x-safari-https://` is undocumented but is the only thing that reliably
   * escapes an in-app WKWebView, and it is what the ecosystem has settled on.
   * Being undocumented, it can silently do nothing — so we watch for the page
   * being backgrounded, and if we are still here a moment later we reveal the
   * manual route rather than leaving a dead button. Only meaningful over
   * https; on plain http there is nothing sensible to hand off.
   */
  function openInSafari(bannerEl) {
    var manual = bannerEl && bannerEl.querySelector('[data-cdpwa-manual]');

    function revealManual() {
      if (manual) manual.hidden = false;
      track('a2hs_safari_handoff_failed');
    }

    if (global.location.protocol !== 'https:') {
      revealManual();
      return;
    }

    var target =
      'x-safari-https://' +
      global.location.host +
      global.location.pathname +
      global.location.search +
      global.location.hash;

    var timer = setTimeout(revealManual, 1400);
    function onHide() {
      if (doc.hidden) {
        clearTimeout(timer);
        doc.removeEventListener('visibilitychange', onHide);
      }
    }
    doc.addEventListener('visibilitychange', onHide);

    try {
      global.location.href = target;
    } catch (e) {
      clearTimeout(timer);
      revealManual();
    }
  }

  function buildBanner(mode) {
    var el = doc.createElement('div');
    el.className = 'cdpwa-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Add CloseDose to your home screen');

    var shareWhere = isIPad
      ? 'in the top-right corner of Safari'
      : 'at the bottom of Safari';

    var body =
      mode === 'ios'
        ? [
            '<ol class="cdpwa-steps">',
            '<li><b>1</b><span>Tap the Share button ' + IOS_SHARE_GLYPH + ' ' + shareWhere + '.</span></li>',
            '<li><b>2</b><span>Scroll down and tap <strong>Add to Home Screen</strong>.</span></li>',
            '<li><b>3</b><span>Tap <strong>Add</strong>. CloseDose opens like an app.</span></li>',
            '</ol>',
            '<div class="cdpwa-banner__actions">',
            '<button type="button" class="cdpwa-banner__cta" data-cdpwa-done>Got it</button>',
            '</div>',
          ].join('')
        : mode === 'ios-elsewhere'
        ? [
            '<div class="cdpwa-banner__actions">',
            '<button type="button" class="cdpwa-banner__cta" data-cdpwa-safari>Open in Safari</button>',
            '</div>',
            '<div class="cdpwa-manual" data-cdpwa-manual hidden>',
            '<p class="cdpwa-manual__lead">If nothing opened, do it by hand:</p>',
            '<ol class="cdpwa-steps">',
            '<li><b>1</b><span>Tap the <strong>&hellip;</strong> or share icon in this app\u2019s toolbar.</span></li>',
            '<li><b>2</b><span>Choose <strong>Open in Safari</strong> (or <strong>Open in browser</strong>).</span></li>',
            '</ol>',
            '<button type="button" class="cdpwa-linkcopy" data-cdpwa-copy>Copy the link instead</button>',
            '</div>',
          ].join('')
        : [
            '<div class="cdpwa-banner__actions">',
            '<button type="button" class="cdpwa-banner__cta" data-cdpwa-install>Add to home screen</button>',
            '</div>',
          ].join('');

    var title =
      mode === 'ios-elsewhere'
        ? 'Open CloseDose in Safari'
        : 'Keep CloseDose one tap away';
    var sub =
      mode === 'ios-elsewhere'
        ? 'Adding CloseDose to your home screen only works from Safari — this browser can’t do it.'
        : 'Add it to your home screen so it’s there at 2am without hunting for a browser tab.';

    el.innerHTML = [
      '<div class="cdpwa-banner__row">',
      '<img class="cdpwa-banner__icon" src="/images/favicon-192.png" alt="" aria-hidden="true" width="44" height="44" />',
      '<div style="flex:1">',
      '<p class="cdpwa-banner__title">' + title + '</p>',
      '<p class="cdpwa-banner__sub">' + sub + '</p>',
      '</div>',
      '<button type="button" class="cdpwa-banner__close" data-cdpwa-close aria-label="Not now">&times;</button>',
      '</div>',
      body,
    ].join('');

    el.addEventListener('click', function (ev) {
      var t = ev.target.closest(
        '[data-cdpwa-close],[data-cdpwa-done],[data-cdpwa-install],[data-cdpwa-safari],[data-cdpwa-copy]'
      );
      if (!t) return;

      if (t.hasAttribute('data-cdpwa-safari')) {
        track('a2hs_open_in_safari');
        openInSafari(el);
        return;
      }
      if (t.hasAttribute('data-cdpwa-copy')) {
        copyLink();
        return;
      }

      if (t.hasAttribute('data-cdpwa-install')) {
        track('a2hs_prompt_accept');
        // Once we hand off to the browser's own installer we have had our
        // say. Snooze either way — if they accept, `appinstalled` fires and
        // the banner is moot; if they back out of the native sheet, asking
        // again on the next page load would be nagging.
        snooze();
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(function (choice) {
            track('a2hs_outcome', { outcome: (choice && choice.outcome) || 'unknown' });
            deferredPrompt = null;
          });
        }
        closeBanner();
        return;
      }
      // "Got it" and the close X both mean: stop asking for a while.
      track(t.hasAttribute('data-cdpwa-done') ? 'a2hs_ios_ack' : 'a2hs_dismiss');
      snooze();
      closeBanner();
    });

    return el;
  }

  function showBanner(mode) {
    if (bannerEl || isStandalone() || snoozed()) return;
    injectStyles();
    bannerEl = buildBanner(mode);
    doc.body.appendChild(bannerEl);
    // next frame so the slide-up transition actually runs
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (bannerEl) bannerEl.classList.add('cdpwa-banner--on');
      });
    });
    track('a2hs_shown', { mode: mode });
  }

  function armInstallInvite() {
    if (isStandalone() || snoozed()) return;

    // Android / desktop Chrome: wait for the browser to say it's installable.
    global.addEventListener('beforeinstallprompt', function (ev) {
      ev.preventDefault();
      deferredPrompt = ev;
      setTimeout(function () {
        showBanner('native');
      }, A2HS_DELAY_MS);
    });

    global.addEventListener('appinstalled', function () {
      track('a2hs_installed');
      snooze();
      closeBanner();
    });

    // iOS Safari has no install event, so offer the manual route.
    if (isSafari) {
      setTimeout(function () {
        showBanner('ios');
      }, A2HS_DELAY_MS);
      return;
    }

    /*
     * Everywhere else on iOS — Chrome, Firefox, or the in-app browser someone
     * lands in from a text or a Facebook group — Add to Home Screen does not
     * exist. Previously these visitors saw nothing at all, which is the worst
     * outcome for a product meant to spread parent to parent. Send them to
     * Safari instead.
     */
    if (isIOSElsewhere) {
      setTimeout(function () {
        showBanner('ios-elsewhere');
      }, A2HS_DELAY_MS);
    }
  }

  /*
   * iOS only honours standalone display when this meta tag is present. It is
   * normally set in the document head; we add it defensively so a page that
   * ships without it still installs correctly.
   */
  function ensureIOSMeta() {
    if (doc.querySelector('meta[name="apple-mobile-web-app-capable"]')) return;
    ['apple-mobile-web-app-capable', 'mobile-web-app-capable'].forEach(function (name) {
      var m = doc.createElement('meta');
      m.name = name;
      m.content = 'yes';
      doc.head.appendChild(m);
    });
    var title = doc.createElement('meta');
    title.name = 'apple-mobile-web-app-title';
    title.content = 'CloseDose';
    doc.head.appendChild(title);
    var bar = doc.createElement('meta');
    bar.name = 'apple-mobile-web-app-status-bar-style';
    bar.content = 'default';
    doc.head.appendChild(bar);
  }

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */

  function init() {
    injectStyles();
    ensureIOSMeta();
    mountShareButtons();
    armInstallInvite();
  }

  global.CloseDosePWA = {
    share: share,
    copyLink: copyLink,
    showInstallBanner: showBanner,
    isStandalone: isStandalone,
    /*
     * What this browser was detected as, and which invitation it will get.
     * Exposed so the branch can be asserted in tests and read off a real
     * device when a caregiver reports the wrong prompt.
     */
    environment: function () {
      return {
        isIOS: isIOS,
        isIPad: isIPad,
        isSafari: isSafari,
        isInAppBrowser: isInAppBrowser,
        isIOSElsewhere: isIOSElsewhere,
        standalone: isStandalone(),
        mode: isStandalone()
          ? 'none'
          : isSafari
          ? 'ios'
          : isIOSElsewhere
          ? 'ios-elsewhere'
          : 'native',
      };
    },
    /* exposed for the "Add to home screen" link some pages may want inline */
    resetSnooze: function () {
      try { global.localStorage.removeItem(A2HS_KEY); } catch (e) {}
    },
  };

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
