(function () {
  // --- Accessibility Management ---
  const ACCESS_KEY = 'cd-accessibility';
  const ACCESS_DEFAULTS = {
    calm: 'off',
    text: 'md',
    motion: 'full',
    font: 'default',
    icon: 'off',
    lang: 'en'
  };

  function getStoredAccessibility() {
    try {
      const saved = localStorage.getItem(ACCESS_KEY);
      return saved ? JSON.parse(saved) : { ...ACCESS_DEFAULTS };
    } catch (e) {
      return { ...ACCESS_DEFAULTS };
    }
  }

  function saveAccessibility(prefs) {
    localStorage.setItem(ACCESS_KEY, JSON.stringify(prefs));
    applyAccessibility(prefs);
  }

  function applyAccessibility(prefs) {
    const root = document.documentElement;
    root.dataset.calm = prefs.calm;
    root.dataset.text = prefs.text;
    root.dataset.font = prefs.font;
    root.dataset.icon = prefs.icon;
    root.dataset.lang = prefs.lang;
    
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reducedMotion = prefs.motion === 'reduced' || motionQuery.matches;
    root.dataset.motion = reducedMotion ? 'reduced' : 'full';
    root.lang = prefs.lang || 'en';
    
    updateAccessibilityUI(prefs);
  }

  function updateAccessibilityUI(prefs) {
    document.querySelectorAll('.menu-access-btn[data-pref="font"]').forEach(b => {
      const isActive = b.dataset.val === prefs.font;
      b.classList.toggle('is-active', isActive);
      b.setAttribute('aria-pressed', String(isActive));
    });
    document.querySelectorAll('.menu-access-btn[data-pref="text"]').forEach(b => {
      const isActive = b.dataset.val === prefs.text;
      b.classList.toggle('is-active', isActive);
      b.setAttribute('aria-pressed', String(isActive));
    });
    document.querySelectorAll('.menu-access-btn[data-pref="motion"]').forEach(b => {
      const isActive = b.dataset.val === prefs.motion;
      b.classList.toggle('is-active', isActive);
      b.setAttribute('aria-pressed', String(isActive));
    });
  }

  // Load and apply accessibility settings immediately to prevent flashing
  const initialPrefs = getStoredAccessibility();
  applyAccessibility(initialPrefs);

  // --- Theme Management ---
  // Stored values: 'light' | 'dark' | absent (means "system")
  const THEME_KEY = 'cd-theme';

  function getStoredChoice() {
    return localStorage.getItem(THEME_KEY); // 'light' | 'dark' | null
  }

  function getEffectiveTheme() {
    const stored = getStoredChoice();
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // choice: 'system' | 'light' | 'dark'
  function applyTheme(choice) {
    if (choice === 'system') {
      localStorage.removeItem(THEME_KEY);
      const effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', effective);
    } else {
      localStorage.setItem(THEME_KEY, choice);
      document.documentElement.setAttribute('data-theme', choice);
    }
    updateThemeUI();
  }

  function updateThemeUI() {
    const stored = getStoredChoice();
    const activeChoice = stored || 'system';
    const effective = getEffectiveTheme();

    // Animated toggle checkbox in the menu
    const themeSwitch = document.getElementById('menu-theme-switch');
    if (themeSwitch) {
      themeSwitch.checked = effective === 'dark';
    }

    // System button active state
    document.querySelectorAll('.menu-theme-btn').forEach(b => {
      const isActive = b.dataset.themeChoice === activeChoice;
      b.classList.toggle('is-active', isActive);
      b.setAttribute('aria-pressed', String(isActive));
    });
  }

  // Inject theme toggle and wire up click
  document.addEventListener('DOMContentLoaded', function () {
    // Inject animated Day/Night toggle + System button into the menu panel
    const menuPanel = document.querySelector('.menu-panel');
    if (menuPanel) {
      const picker = document.createElement('div');
      picker.className = 'menu-theme-picker';
      picker.innerHTML =
        '<p class="menu-theme-label">Appearance</p>' +
        '<label class="theme-toggle-wrapper" for="menu-theme-switch" aria-label="Toggle dark mode">' +
          '<input type="checkbox" id="menu-theme-switch">' +
          '<svg class="toggle-bg-day" viewBox="0 0 180 72" preserveAspectRatio="none">' +
            '<rect width="180" height="72" fill="#74a1d3"/>' +
            '<circle cx="36" cy="36" r="45" fill="#8bb3de"/>' +
            '<circle cx="36" cy="36" r="70" fill="#9ebfe5"/>' +
            '<circle cx="36" cy="36" r="95" fill="#b0cbec"/>' +
            '<g fill="#e3f0fa"><circle cx="15" cy="76" r="24"/><circle cx="65" cy="74" r="30"/><circle cx="115" cy="76" r="26"/><circle cx="165" cy="74" r="32"/></g>' +
            '<g fill="#ffffff"><circle cx="10" cy="80" r="24"/><circle cx="55" cy="80" r="30"/><circle cx="105" cy="80" r="26"/><circle cx="155" cy="80" r="32"/><circle cx="190" cy="80" r="24"/></g>' +
          '</svg>' +
          '<svg class="toggle-bg-night" viewBox="0 0 180 72" preserveAspectRatio="none">' +
            '<rect width="180" height="72" fill="#2f3640"/>' +
            '<circle cx="144" cy="36" r="45" fill="#3b434f"/>' +
            '<circle cx="144" cy="36" r="70" fill="#464f5d"/>' +
            '<circle cx="144" cy="36" r="95" fill="#525c6b"/>' +
            '<path d="M 40 15 Q 40 22 47 22 Q 40 22 40 29 Q 40 22 33 22 Q 40 22 40 15" fill="#ffffff" opacity="0.9"/>' +
            '<path d="M 85 40 Q 85 44 89 44 Q 85 44 85 48 Q 85 44 81 44 Q 85 44 85 40" fill="#ffffff" opacity="0.7"/>' +
            '<circle cx="20" cy="45" r="1.5" fill="#ffffff" opacity="0.8"/>' +
            '<circle cx="65" cy="25" r="1" fill="#ffffff" opacity="0.6"/>' +
            '<circle cx="100" cy="18" r="2" fill="#ffffff" opacity="0.9"/>' +
            '<circle cx="110" cy="55" r="1.5" fill="#ffffff" opacity="0.5"/>' +
          '</svg>' +
          '<div class="toggle-knob">' +
            '<div class="crater crater-1"></div>' +
            '<div class="crater crater-2"></div>' +
            '<div class="crater crater-3"></div>' +
          '</div>' +
        '</label>' +
        '<button type="button" class="menu-theme-btn" data-theme-choice="system" aria-pressed="false">Use system setting</button>';

      const closeBtn = menuPanel.querySelector('.close-menu');
      menuPanel.insertBefore(picker, closeBtn);

      const themeSwitch = picker.querySelector('#menu-theme-switch');
      if (themeSwitch) {
        themeSwitch.addEventListener('change', function () {
          applyTheme(this.checked ? 'dark' : 'light');
        });
      }

      picker.querySelectorAll('.menu-theme-btn').forEach(function (btn) {
        btn.addEventListener('click', function () { applyTheme(btn.dataset.themeChoice); });
      });

      // Inject Accessibility options panel
      const accPicker = document.createElement('div');
      accPicker.className = 'menu-accessibility-picker';
      accPicker.innerHTML =
        '<p class="menu-theme-label">Reading Options</p>' +
        '<div class="menu-access-group">' +
          '<span class="menu-access-label">Font</span>' +
          '<div class="menu-access-buttons">' +
            '<button type="button" class="menu-access-btn" data-pref="font" data-val="default">Standard</button>' +
            '<button type="button" class="menu-access-btn" data-pref="font" data-val="dyslexic">Dyslexic-Friendly</button>' +
          '</div>' +
        '</div>' +
        '<div class="menu-access-group">' +
          '<span class="menu-access-label">Text Size</span>' +
          '<div class="menu-access-buttons">' +
            '<button type="button" class="menu-access-btn" data-pref="text" data-val="md">Normal</button>' +
            '<button type="button" class="menu-access-btn" data-pref="text" data-val="lg">Large</button>' +
            '<button type="button" class="menu-access-btn" data-pref="text" data-val="xl">X-Large</button>' +
          '</div>' +
        '</div>' +
        '<div class="menu-access-group">' +
          '<span class="menu-access-label">Animations</span>' +
          '<div class="menu-access-buttons">' +
            '<button type="button" class="menu-access-btn" data-pref="motion" data-val="full">On</button>' +
            '<button type="button" class="menu-access-btn" data-pref="motion" data-val="reduced">Off</button>' +
          '</div>' +
        '</div>';

      menuPanel.insertBefore(accPicker, closeBtn);

      accPicker.querySelectorAll('.menu-access-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const prefKey = this.dataset.pref;
          const prefVal = this.dataset.val;
          const prefs = getStoredAccessibility();
          prefs[prefKey] = prefVal;
          saveAccessibility(prefs);
        });
      });

      // Subtle launcher for the Cappy Run easter egg (tap-friendly on mobile,
      // since the Konami code isn't reachable from a touchscreen). The bar is
      // appended last so it sits at the bottom of the menu panel.
      const secretBar = document.createElement('button');
      secretBar.type = 'button';
      secretBar.className = 'menu-secret-bar';
      secretBar.setAttribute('aria-label', 'Launch Cappy Run');
      secretBar.addEventListener('click', function () {
        window.dispatchEvent(new Event('cappyrun:launch'));
        const menuOverlay = document.getElementById('siteMenu');
        const menuBtn = document.querySelector('.menu-btn');
        if (menuOverlay && menuOverlay.classList.contains('open')) {
          menuOverlay.classList.remove('open');
          setTimeout(function () {
            if (!menuOverlay.classList.contains('open')) menuOverlay.hidden = true;
          }, 250);
          if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
        }
      });
      menuPanel.appendChild(secretBar);
    }

    updateThemeUI();
    updateAccessibilityUI(getStoredAccessibility());

    // Sync when OS preference changes and no manual override is stored
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!getStoredChoice()) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        updateThemeUI();
      }
    });
  });

  // --- Site Menu Logic ---
  const menuButton = document.querySelector('.menu-btn');
  const overlay = document.getElementById('siteMenu');
  if (menuButton && overlay) {
    const closeButton = overlay.querySelector('.close-menu');
    const focusableSelector = 'a, button, [tabindex]:not([tabindex="-1"])';

    const updateMenuPresentation = () => {
      const atTop = window.scrollY <= 6;
      menuButton.classList.toggle('is-expanded', atTop);
    };

    function openMenu() {
      overlay.hidden = false;
      requestAnimationFrame(() => overlay.classList.add('open'));
      menuButton.setAttribute('aria-expanded', 'true');
      const firstFocusable = overlay.querySelector(focusableSelector);
      if (firstFocusable) firstFocusable.focus();
    }

    function closeMenu() {
      overlay.classList.remove('open');
      setTimeout(() => { if(!overlay.classList.contains('open')) overlay.hidden = true; }, 250);
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.focus();
    }

    menuButton.addEventListener('click', () => {
      if (overlay.classList.contains('open')) closeMenu();
      else openMenu();
    });

    if (closeButton) closeButton.addEventListener('click', closeMenu);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeMenu(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeMenu();
    });

    updateMenuPresentation();
    window.addEventListener('scroll', updateMenuPresentation, { passive: true });
    window.addEventListener('resize', updateMenuPresentation);
  }

  // --- Cappy Waitlist Logic ---
  const triggers = document.querySelectorAll('[data-cappy-trigger]');
  const modal = document.getElementById('cappyWaitlistModal');
  if (modal) {
    const closeBtn = modal.querySelector('.cappy-modal-close');
    const form = document.getElementById('waitlistForm');
    const successMsg = document.getElementById('waitlistSuccess');

    const openModal = (e) => {
      if(e) e.preventDefault();
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
      setTimeout(() => modal.classList.add('is-visible'), 10);
    };

    const closeModal = () => {
      modal.classList.remove('is-visible');
      modal.setAttribute('aria-hidden', 'true');
      setTimeout(() => { modal.style.display = 'none'; }, 250);
    };

    triggers.forEach(t => t.addEventListener('click', openModal));
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        form.style.display = 'none';
        if (successMsg) successMsg.style.display = 'block';
      });
    }
  }

  // --- Disclaimer Expansion Logic ---
  // The card sits at the very bottom as a collapsed "DISCLAIMER" pill and
  // smoothly expands into the full card when the user reaches the page end
  // (or taps the pill). A manual close keeps it collapsed until re-triggered.
  const disclaimerCard = document.querySelector('.card--disclaimer');
  if (disclaimerCard) {
    const panel = disclaimerCard.querySelector('.disclaimer-body');
    const pill = disclaimerCard.querySelector('.disclaimer-pill');
    const closeBtn = disclaimerCard.querySelector('.disclaimer-close');
    const root = document.documentElement;
    let manualDismiss = false;

    const setExpanded = (expanded, manual = false) => {
      disclaimerCard.classList.toggle('is-expanded', expanded);
      disclaimerCard.setAttribute('aria-expanded', expanded);
      if (panel) panel.inert = !expanded;
      if (pill) pill.setAttribute('aria-expanded', String(expanded));
      if (expanded) {
        manualDismiss = false;
        if (closeBtn) closeBtn.focus({ preventScroll: true });
      } else if (manual) {
        manualDismiss = true;
        if (pill) pill.focus({ preventScroll: true });
      }
    };

    if (panel) panel.inert = true;

    window.addEventListener('scroll', () => {
      const reachedEnd = window.innerHeight + window.scrollY >= root.scrollHeight - 20;
      if (reachedEnd && !disclaimerCard.classList.contains('is-expanded') && !manualDismiss) {
        setExpanded(true);
      }
    }, { passive: true });

    if (pill) {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        setExpanded(true, true);
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setExpanded(false, true);
      });
    }
  }

  // --- Card Intersection Observer for Animations ---
  const observerOptions = { threshold: 0.1 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.card').forEach(card => {
    card.style.animationPlayState = 'paused';
    observer.observe(card);
  });

  // --- GA4 Tracking ---
  const u = new URL(location.href);
  const SRC = (u.searchParams.get('src') || 'na').toLowerCase();
  const ID = (u.searchParams.get('id') || 'na').toLowerCase();
  
  if (window.gtag) {
    gtag('event', 'tag_visit', { src: SRC, id: ID });

    document.querySelectorAll('[id$="Btn"], a[data-use]').forEach(el => {
      el.addEventListener('click', () => {
        const use = el.dataset.use || el.id.replace('Btn', '');
        gtag('event', 'tag_use', { use: use, src: SRC, id: ID });
      });
    });
  }

  // --- Cappy Run (Konami code easter egg) ---
  // Lazy-load the game module + styles on the first DOMContentLoaded so the
  // Konami code listener is wired up across the site without bloating any page.
  let cappyRunLoadPromise = null;
  function loadCappyRun() {
    if (cappyRunLoadPromise) return cappyRunLoadPromise;
    const link = document.createElement('link');
    link.id = 'cappy-run-css';
    link.rel = 'stylesheet';
    link.href = 'cappy-run.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'cappy-run.js';
    script.defer = true;
    cappyRunLoadPromise = new Promise(function (resolve) {
      script.addEventListener('load', resolve);
      script.addEventListener('error', resolve);
    });
    document.head.appendChild(script);
    return cappyRunLoadPromise;
  }
  // Bridge: if a launch event fires before cappy-run.js has registered its
  // own listener, ensure the module is loaded and then re-dispatch.
  window.addEventListener('cappyrun:launch', function () {
    if (window.__cappyRunInstalled) return;
    loadCappyRun().then(function () {
      window.dispatchEvent(new Event('cappyrun:launch'));
    });
  });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCappyRun);
  } else {
    loadCappyRun();
  }
})();
