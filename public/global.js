(function () {
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
  const disclaimerCard = document.querySelector('.card--disclaimer');
  if (disclaimerCard) {
    const content = disclaimerCard.querySelector('.disclaimer-content');
    const toggleBtn = disclaimerCard.querySelector('.disclaimer-toggle');
    const closeBtn = disclaimerCard.querySelector('.disclaimer-close');
    const root = document.documentElement;
    let manualDismiss = false;

    const setExpanded = (expanded, manual = false) => {
      disclaimerCard.classList.toggle('is-expanded', expanded);
      disclaimerCard.setAttribute('aria-expanded', expanded);
      if (content) content.hidden = !expanded;
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', String(expanded));
      if (expanded) {
        manualDismiss = false;
        if (closeBtn) closeBtn.focus({ preventScroll: true });
      } else if (manual) {
        manualDismiss = true;
        if (toggleBtn) toggleBtn.focus({ preventScroll: true });
      }
    };

    window.addEventListener('scroll', () => {
      const reachedEnd = window.innerHeight + window.scrollY >= root.scrollHeight - 20;
      if (reachedEnd && !disclaimerCard.classList.contains('is-expanded') && !manualDismiss) {
        setExpanded(true);
      }
    }, { passive: true });

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
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
})();
