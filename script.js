function getElements() {
  return {
    ageSelect: document.getElementById('age'),
    weightInput: document.getElementById('weight'),
    weightUnit: document.getElementById('weight-unit'),
    message: document.getElementById('message'),
    results: document.getElementById('results'),
    calculateButton: document.querySelector('#calculator button'),
    ageButtons: document.querySelectorAll('.age-option'),
    unitButtons: document.querySelectorAll('.unit-option'),
    helloBox: document.querySelector('.hello-box'),
  };
}

const ATTENTION_CLASS = 'button--attention';

// Implementation summary:
// - 0–2 months: emergency pathway with the calculator disabled and families
//   directed to seek immediate care.
// - 2–6 months: acetaminophen at 12.5 mg/kg (maximum 160 mg) and no ibuprofen.
// - 6 months–11 years: pediatric caps limiting acetaminophen to 480 mg and
//   ibuprofen to 800 mg per single dose.
// - 12+ years: adult dosing ceilings of 1000 mg acetaminophen and 800 mg
//   ibuprofen per single dose.
// This replaces the prior combined 6+ pathway while keeping the structure ready
// for future refinements if more age bands are needed.
function resolveAgeGate(age) {
  switch (age) {
    case '0-2':
      return 'emergency';
    case '2-6':
      return 'infant';
    case '6-11':
    case '6-24':
      return 'pediatric';
    case '12+':
    case '2y+':
    case '6+':
      return 'adolescent';
    default:
      return '';
  }
}

function clearButtonAttention(button) {
  if (!button) {
    return;
  }
  button.classList.remove(ATTENTION_CLASS);
}

function triggerButtonAttention(button) {
  if (!button) {
    return;
  }
  button.classList.remove(ATTENTION_CLASS);
  void button.offsetWidth;
  button.classList.add(ATTENTION_CLASS);
}

function clearResults(elements) {
  if (elements.results) {
    elements.results.innerHTML = '';
  }
}

function updateForm() {
  const elements = getElements();
  if (
    !elements.ageSelect ||
    !elements.weightInput ||
    !elements.weightUnit ||
    !elements.message ||
    !elements.calculateButton ||
    !elements.results
  ) {
    return;
  }

  const age = elements.ageSelect.value;
  const gate = resolveAgeGate(age);
  const normalizedAge =
    age === '6-24' ? '6-11' : age === '2y+' || age === '6+' ? '12+' : age;

  if (elements.ageButtons && elements.ageButtons.length > 0) {
    elements.ageButtons.forEach((button) => {
      const isSelected = button.dataset.age === normalizedAge;
      button.setAttribute('aria-pressed', String(isSelected));
      button.classList.toggle('is-active', isSelected);
    });
  }

  if (elements.helloBox) {
    elements.helloBox.hidden = Boolean(age);
    elements.helloBox.classList.toggle('is-hidden', Boolean(age));
  }

  if (elements.unitButtons && elements.unitButtons.length > 0) {
    const unit = elements.weightUnit.value || 'lbs';
    elements.unitButtons.forEach((button) => {
      const isSelected = button.dataset.unit === unit;
      button.setAttribute('aria-pressed', String(isSelected));
      button.classList.toggle('is-active', isSelected);
    });
  }

  clearResults(elements);
  elements.message.hidden = true;
  elements.message.innerHTML = '';
  elements.message.classList.remove('alert--critical');
  elements.calculateButton.disabled = false;
  elements.weightInput.disabled = false;
  elements.weightUnit.disabled = false;
  clearButtonAttention(elements.calculateButton);

  if (gate === 'emergency') {
    elements.message.hidden = false;
    elements.message.classList.add('alert--critical');
    elements.message.innerHTML =
      '<strong>Seek immediate medical care.</strong> If a child less than 60 days old has a fever it is a medical emergency. ' +
      'Please contact your pediatrician or seek care with a healthcare provider immediately.';

    elements.calculateButton.disabled = true;
    elements.weightInput.disabled = true;
    elements.weightUnit.disabled = true;
  }
}

function calculateDose() {
  const elements = getElements();

  if (!elements.ageSelect || !elements.weightInput || !elements.weightUnit || !elements.results) {
    return;
  }

  const age = elements.ageSelect.value;
  const gate = resolveAgeGate(age);
  const weightInput = parseFloat(elements.weightInput.value);
  const weightUnit = elements.weightUnit.value;

  clearResults(elements);
  clearButtonAttention(elements.calculateButton);

  const renderWarning = (title, body, modifier = 'warning-card--teal') => {
    const label = title ? `<strong>${title}</strong>` : '';
    const separator = title ? ' ' : '';
    return `<div class="warning-card ${modifier}">${label}${separator}${body}</div>`;
  };

  if (!age) {
    elements.results.innerHTML = renderWarning('Age required', 'Please select an age group to continue.');
    return;
  }

  if (isNaN(weightInput) || weightInput <= 0) {
    elements.results.innerHTML = renderWarning('Weight required', 'Please enter a valid weight to calculate dosing.');
    return;
  }

  if (gate === 'emergency') {
    return;
  }

  const weightKg = weightUnit === 'lbs' ? weightInput / 2.20462 : weightInput;
  const weightLbs = weightUnit === 'lbs' ? weightInput : weightInput * 2.20462;
  const resultBlocks = [];

  resultBlocks.push(
    `<p class="result-weight"><span>Patient weight</span><br><strong>${weightKg.toFixed(1)} kg (${weightLbs.toFixed(1)} lbs)</strong></p>`
  );

  if (gate === 'infant') {
    const acetaMgCalculated = 12.5 * weightKg;
    const ACETA_MAX_MG_INFANT = 160;
    const acetaMg = Math.min(acetaMgCalculated, ACETA_MAX_MG_INFANT);
    const acetaMl = (acetaMg / 160) * 5;
    const acetaCapped = acetaMg < acetaMgCalculated;

    const group = [];
    group.push(`
      <article class="result-card">
        <h3>Acetaminophen (160 mg / 5 mL)</h3>
        <p>Give <strong><em>${acetaMl.toFixed(1)} mL</em></strong> (<em>${acetaMg.toFixed(0)} mg</em>) every 4 hours as needed for fever/pain.</p>
        <p class="dose-note">Maximum single dose for this age group is ${ACETA_MAX_MG_INFANT} mg.</p>
        ${
          acetaCapped
            ? renderWarning(
                'Maximum dose reached',
                'Weight-based dose was limited to this maximum. Consider discussing dosing with your pediatrician.',
                'warning-card--orange'
              )
            : ''
        }
      </article>
    `);

    group.push(
      renderWarning(
        '',
        '<em>Ibuprofen is not recommended for infants under six months. Consult your pediatrician before using ibuprofen for this age group.</em>',
        'warning-card--red-soft'
      )
    );

    resultBlocks.push(`<div class="result-group">${group.join('')}</div>`);
  } else if (gate === 'pediatric' || gate === 'adolescent') {
    const isPediatric = gate === 'pediatric';
    const ACETA_MAX_SINGLE_DOSE_MG = isPediatric ? 480 : 1000;
    const IBU_MAX_SINGLE_DOSE_MG = 800;

    const acetaMgCalculated = 15 * weightKg;
    const acetaMg = Math.min(acetaMgCalculated, ACETA_MAX_SINGLE_DOSE_MG);
    const acetaMl = (acetaMg / 160) * 5;
    const acetaCapped = acetaMg < acetaMgCalculated;

    const ibuMgCalculated = 10 * weightKg;
    const ibuMg = Math.min(ibuMgCalculated, IBU_MAX_SINGLE_DOSE_MG);
    const ibuCapped = ibuMg < ibuMgCalculated;
    const ibuMl50 = (ibuMg / 50) * 1.25;
    const ibuMl100 = (ibuMg / 100) * 5;

    const group = [];

    group.push(`
      <article class="result-card">
        <h3>Acetaminophen (160 mg / 5 mL)</h3>
        <p>Give <strong><em>${acetaMl.toFixed(1)} mL</em></strong> (<em>${acetaMg.toFixed(0)} mg</em>) every 6 hours as needed for fever/pain.</p>
        ${
          acetaCapped
            ? renderWarning(
                '',
                `Maximum single dose for this age group is ${ACETA_MAX_SINGLE_DOSE_MG} mg of acetaminophen every 6 hours.`,
                'warning-card--orange'
              )
            : ''
        }
        ${
          acetaCapped
            ? renderWarning(
                'Maximum dose reached',
                'Weight-based dose was limited to this maximum. Consider discussing dosing with your pediatrician.',
                'warning-card--orange'
              )
            : ''
        }
      </article>
    `);

    group.push(`
      <article class="result-card">
        <h3>Ibuprofen (oral)</h3>
        <p><strong>Children's 100 mg / 5 mL:</strong> Give <strong><em>${ibuMl100.toFixed(1)} mL</em></strong> (<em>${ibuMg.toFixed(0)} mg</em>) every 6 hours as needed for fever/pain.</p>
        <p><strong>Infant's 50 mg / 1.25 mL:</strong> Give <strong><em>${ibuMl50.toFixed(1)} mL</em></strong> (<em>${ibuMg.toFixed(0)} mg</em>) every 6 hours as needed for fever/pain.</p>
        ${
          ibuCapped
            ? renderWarning(
                '',
                `Maximum single dose for this age group is ${IBU_MAX_SINGLE_DOSE_MG} mg of ibuprofen every 6 hours.`,
                'warning-card--orange'
              )
            : ''
        }
        ${
          ibuCapped
            ? renderWarning(
                'Maximum dose reached',
                'Weight-based dose was limited to this maximum. Consider discussing dosing with your pediatrician.',
                'warning-card--orange'
              )
            : ''
        }
      </article>
    `);

    const doseSpacingBody = acetaCapped || ibuCapped
      ? `Never exceed ${ACETA_MAX_SINGLE_DOSE_MG} mg of acetaminophen or ${IBU_MAX_SINGLE_DOSE_MG} mg of ibuprofen in a single dose, and allow at least 6 hours between doses.`
      : 'Allow at least 6 hours between doses of acetaminophen or ibuprofen. Follow the product instructions for maximum amounts.';

    group.push(renderWarning('Dose spacing reminder', doseSpacingBody, 'warning-card--teal'));

    resultBlocks.push(`<div class="result-group">${group.join('')}</div>`);
  }

  elements.results.innerHTML = resultBlocks.join('');
}

function initCalculator() {
  const form = document.getElementById('calculator');
  if (!form) {
    return;
  }

  const elements = getElements();

  if (elements.ageButtons && elements.ageSelect) {
    elements.ageButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const ageValue = button.dataset.age || '';
        elements.ageSelect.value = ageValue;
        updateForm();
      });
    });
  }

  if (elements.unitButtons && elements.weightUnit) {
    elements.unitButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const unitValue = button.dataset.unit || 'lbs';
        elements.weightUnit.value = unitValue;
        updateForm();
      });
    });
  }

  if (elements.ageSelect) {
    elements.ageSelect.addEventListener('change', () => updateForm());
  }

  if (elements.weightUnit) {
    elements.weightUnit.addEventListener('change', () => updateForm());
  }

  if (elements.weightInput) {
    const handleWeightInput = () => {
      if (!elements.weightInput) {
        return;
      }
      const value = parseFloat(elements.weightInput.value);
      if (
        !isNaN(value) &&
        value > 0 &&
        elements.calculateButton &&
        !elements.calculateButton.disabled &&
        resolveAgeGate(elements.ageSelect ? elements.ageSelect.value : '')
      ) {
        triggerButtonAttention(elements.calculateButton);
      }
    };

    elements.weightInput.addEventListener('input', handleWeightInput);
    elements.weightInput.addEventListener('change', handleWeightInput);
  }

  if (elements.calculateButton) {
    elements.calculateButton.addEventListener('animationend', () => {
      clearButtonAttention(elements.calculateButton);
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearButtonAttention(elements.calculateButton);
    calculateDose();
  });
}

// Initialize state on first load
updateForm();

function initCarousels() {
  const carousels = document.querySelectorAll('[data-carousel]');

  carousels.forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    if (slides.length === 0) return;

    slides.forEach((slide) => {
      slide.classList.remove('is-active');
      slide.setAttribute('aria-hidden', 'true');
    });

    let index = -1;

    const prevButton = carousel.querySelector('[data-carousel-prev]');
    const nextButton = carousel.querySelector('[data-carousel-next]');
    const dotsContainer = carousel.querySelector('.carousel-dots');

    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      dotsContainer.setAttribute('role', 'tablist');
    }

    const dots = slides.map((_, slideIndex) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Show slide ${slideIndex + 1}`);
      dot.setAttribute('aria-pressed', 'false');
      dot.addEventListener('click', () => goToSlide(slideIndex));
      if (dotsContainer) {
        dotsContainer.appendChild(dot);
      }
      return dot;
    });

    function goToSlide(newIndex) {
      if (index >= 0) {
        slides[index].classList.remove('is-active');
        slides[index].setAttribute('aria-hidden', 'true');
        if (dots[index]) {
          dots[index].classList.remove('is-active');
          dots[index].setAttribute('aria-pressed', 'false');
        }
      }

      index = (newIndex + slides.length) % slides.length;
      slides[index].classList.add('is-active');
      slides[index].setAttribute('aria-hidden', 'false');
      if (dots[index]) {
        dots[index].classList.add('is-active');
        dots[index].setAttribute('aria-pressed', 'true');
      }

      const controlsDisabled = slides.length <= 1;
      if (prevButton) {
        prevButton.disabled = controlsDisabled;
      }
      if (nextButton) {
        nextButton.disabled = controlsDisabled;
      }
    }

    if (prevButton) {
      prevButton.addEventListener('click', () => goToSlide(index - 1));
    }
    if (nextButton) {
      nextButton.addEventListener('click', () => goToSlide(index + 1));
    }

    goToSlide(0);
    carousel.classList.add('carousel-ready');
  });
}

function initTranslations() {
  const trigger = document.querySelector('[data-open-translations]');
  const overlay = document.getElementById('translation-overlay');
  if (!trigger || !overlay) {
    return;
  }

  const closeButton = overlay.querySelector('[data-close-translations]');
  const status = overlay.querySelector('[data-selection-status]');
  const languageButtons = overlay.querySelectorAll('[data-translate]');
  let lastFocusedElement = null;
  const focusableElements = [
    ...(closeButton ? [closeButton] : []),
    ...Array.from(languageButtons),
  ];
  const backgroundElements = Array.from(
    document.querySelectorAll('main, nav, footer')
  );

  function setBackgroundInert(isInert) {
    backgroundElements.forEach((element) => {
      if (!element) {
        return;
      }
      if (isInert) {
        element.setAttribute('aria-hidden', 'true');
        element.setAttribute('inert', '');
        if ('inert' in element) {
          element.inert = true;
        }
      } else {
        element.removeAttribute('aria-hidden');
        element.removeAttribute('inert');
        if ('inert' in element) {
          element.inert = false;
        }
      }
    });
  }

  function focusFirstElement() {
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  function setExpanded(isExpanded) {
    trigger.setAttribute('aria-expanded', String(isExpanded));
    overlay.setAttribute('aria-hidden', String(!isExpanded));
  }

  setExpanded(false);

  function openOverlay() {
    if (!overlay.hidden) {
      return;
    }
    lastFocusedElement = document.activeElement;
    setBackgroundInert(true);
    overlay.hidden = false;
    requestAnimationFrame(() => {
      overlay.classList.add('is-visible');
    });
    document.body.style.overflow = 'hidden';
    setExpanded(true);
    focusFirstElement();
  }

  function closeOverlay() {
    if (overlay.hidden) {
      return;
    }
    overlay.classList.remove('is-visible');
    setExpanded(false);
    document.body.style.overflow = '';
    setBackgroundInert(false);
    if (status) {
      status.textContent = '';
    }
    setTimeout(() => {
      overlay.hidden = true;
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
    }, 250);
  }

  trigger.addEventListener('click', () => {
    if (overlay.hidden) {
      openOverlay();
    } else {
      closeOverlay();
    }
  });

  trigger.addEventListener('keydown', (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (overlay.hidden) {
        openOverlay();
      }
    }
  });

  if (closeButton) {
    closeButton.addEventListener('click', () => closeOverlay());
  }

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeOverlay();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !overlay.hidden) {
      closeOverlay();
    }
  });

  overlay.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab' || focusableElements.length === 0) {
      return;
    }

    const currentIndex = focusableElements.indexOf(document.activeElement);
    if (currentIndex === -1) {
      event.preventDefault();
      focusFirstElement();
      return;
    }

    let nextIndex = currentIndex + (event.shiftKey ? -1 : 1);

    if (nextIndex < 0) {
      nextIndex = focusableElements.length - 1;
    } else if (nextIndex >= focusableElements.length) {
      nextIndex = 0;
    }

    event.preventDefault();
    focusableElements[nextIndex].focus();
  });

  document.addEventListener('focusin', (event) => {
    if (!overlay.hidden && !overlay.contains(event.target)) {
      focusFirstElement();
    }
  });

  const translationBase = 'https://translate.google.com/translate';

  languageButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const languageCode = button.getAttribute('data-translate');
      const languageName = button.getAttribute('data-lang-name');
      if (!languageCode) {
        return;
      }

      const url = `${translationBase}?sl=en&tl=${encodeURIComponent(languageCode)}&u=${encodeURIComponent(
        window.location.href
      )}`;

      window.open(url, '_blank', 'noopener');
      if (status) {
        status.textContent = `${languageName || 'Español'} translation opening in a new tab.`;
      }
    });
  });
}

const ACCOUNT_STORAGE_KEY = 'closedose.accounts.v1';
const ACCOUNT_SESSION_KEY = 'closedose.session.v1';
const CLOSE_ACCOUNT_MODALS_EVENT = 'closedose:close-account-modals';
let setDashboardCollapsed = () => {};

function getStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return window.localStorage;
  } catch (error) {
    console.warn('localStorage is not available', error);
    return null;
  }
}

function normalizeEmail(email = '') {
  return email.trim().toLowerCase();
}

function hashSecret(value) {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return `cd_${(hash >>> 0).toString(16)}`;
}

function readAccounts() {
  const storage = getStorage();
  if (!storage) {
    return {};
  }
  try {
    const stored = storage.getItem(ACCOUNT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Unable to read stored accounts', error);
    return {};
  }
}

function writeAccounts(accounts) {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    storage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accounts));
  } catch (error) {
    console.warn('Unable to save accounts', error);
  }
}

function getActiveSession() {
  const storage = getStorage();
  if (!storage) {
    return null;
  }
  try {
    const session = storage.getItem(ACCOUNT_SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.warn('Unable to read session', error);
    return null;
  }
}

function setActiveSession(session) {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    storage.setItem(ACCOUNT_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.warn('Unable to save session', error);
  }
}

function clearActiveSession() {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    storage.removeItem(ACCOUNT_SESSION_KEY);
  } catch (error) {
    console.warn('Unable to clear session', error);
  }
}

function initDashboardCardToggle() {
  const card = document.querySelector('[data-dashboard-card]');
  const toggle = document.querySelector('[data-dashboard-toggle]');
  const panel = document.querySelector('[data-dashboard-panel]');
  if (!card || !toggle || !panel) {
    setDashboardCollapsed = () => {};
    return;
  }

  const applyState = (collapsed) => {
    const isCollapsed = Boolean(collapsed);
    card.classList.toggle('account-card--collapsed', isCollapsed);
    panel.hidden = isCollapsed;
    toggle.setAttribute('aria-expanded', String(!isCollapsed));
  };

  setDashboardCollapsed = (collapsed) => {
    if (typeof collapsed === 'boolean') {
      applyState(collapsed);
    }
  };

  applyState(true);

  toggle.addEventListener('click', () => {
    const collapsed = panel.hidden;
    applyState(!collapsed);
  });
}

function initAccountModals() {
  const modals = new Map();
  document.querySelectorAll('[data-modal]').forEach((modal) => {
    const key = modal.getAttribute('data-modal');
    if (key) {
      modals.set(key, modal);
    }
  });

  if (modals.size === 0) {
    return;
  }

  let activeModal = null;
  let lastFocusedElement = null;

  const closeModal = () => {
    if (!activeModal) {
      return;
    }
    activeModal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
    activeModal = null;
    lastFocusedElement = null;
  };

  const openModal = (key) => {
    const modal = modals.get(key);
    if (!modal || !modal.hidden) {
      return;
    }
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    const dialog = modal.querySelector('.account-modal__dialog');
    if (dialog && typeof dialog.focus === 'function') {
      dialog.focus();
    }
    activeModal = modal;
  };

  document.querySelectorAll('[data-open-modal]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const key = trigger.getAttribute('data-open-modal');
      if (key) {
        openModal(key);
      }
    });
  });

  modals.forEach((modal) => {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
    modal.querySelectorAll('[data-close-modal]').forEach((closer) => {
      closer.addEventListener('click', () => closeModal());
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activeModal) {
      closeModal();
    }
  });

  document.addEventListener(CLOSE_ACCOUNT_MODALS_EVENT, () => {
    closeModal();
  });
}

function initAccountCenter() {
  const signupForm = document.getElementById('signupForm');
  const loginForm = document.getElementById('loginForm');
  const logoutButton = document.getElementById('logoutBtn');
  const statusElement = document.getElementById('accountStatus');
  const badgeElement = document.getElementById('accountUserBadge');
  const authViews = document.querySelectorAll('[data-auth-view]');

  if (!signupForm && !loginForm && !logoutButton) {
    return;
  }

  const setStatus = (variant, message) => {
    if (!statusElement) {
      return;
    }
    statusElement.classList.remove('account-status--success', 'account-status--error');
    if (!message) {
      statusElement.hidden = true;
      statusElement.textContent = '';
      return;
    }
    statusElement.hidden = false;
    statusElement.textContent = message;
    if (variant === 'success') {
      statusElement.classList.add('account-status--success');
    } else if (variant === 'error') {
      statusElement.classList.add('account-status--error');
    }
    setDashboardCollapsed(false);
  };

  const renderSessionState = () => {
    const session = getActiveSession();
    authViews.forEach((view) => {
      if (!(view instanceof HTMLElement)) {
        return;
      }
      const shouldShow =
        session && view.dataset.authView === 'logged-in'
          ? true
          : !session && view.dataset.authView === 'logged-out';
      view.hidden = !shouldShow;
    });
    if (session && badgeElement) {
      badgeElement.textContent = session.name || session.email;
    }
    if (session) {
      setDashboardCollapsed(false);
    }
  };

  if (signupForm) {
    signupForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(signupForm);
      const name = (formData.get('name') || '').toString().trim();
      const email = normalizeEmail((formData.get('email') || '').toString());
      const password = (formData.get('password') || '').toString();

      if (name.length < 2) {
        setStatus('error', 'Please enter your full name to continue.');
        return;
      }
      if (!email) {
        setStatus('error', 'A valid email address is required.');
        return;
      }
      if (password.length < 8) {
        setStatus('error', 'Password must be at least 8 characters long.');
        return;
      }

      const accounts = readAccounts();
      if (accounts[email]) {
        setStatus('error', 'An account already exists for that email. Try signing in.');
        return;
      }

      accounts[email] = {
        email,
        name,
        passwordHash: hashSecret(password),
        createdAt: new Date().toISOString(),
      };
      writeAccounts(accounts);
      setActiveSession({ email, name });
      setStatus('success', 'Account created! You are now signed in on this device.');
      signupForm.reset();
      if (loginForm) {
        loginForm.reset();
      }
      document.dispatchEvent(new Event(CLOSE_ACCOUNT_MODALS_EVENT));
      renderSessionState();
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      const email = normalizeEmail((formData.get('email') || '').toString());
      const password = (formData.get('password') || '').toString();

      if (!email || !password) {
        setStatus('error', 'Please enter both your email and password.');
        return;
      }

      const accounts = readAccounts();
      const account = accounts[email];
      if (!account) {
        setStatus('error', 'No account found for that email address.');
        return;
      }
      if (account.passwordHash !== hashSecret(password)) {
        setStatus('error', 'Incorrect password. Please try again.');
        return;
      }

      setActiveSession({ email, name: account.name });
      setStatus('success', `Welcome back, ${account.name || 'friend'}!`);
      loginForm.reset();
      document.dispatchEvent(new Event(CLOSE_ACCOUNT_MODALS_EVENT));
      renderSessionState();
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      clearActiveSession();
      setStatus('success', 'You have been signed out on this browser.');
      renderSessionState();
    });
  }

  renderSessionState();
}

window.addEventListener('DOMContentLoaded', () => {
  initCarousels();
  initCalculator();
  updateForm();
  initTranslations();
  initDashboardCardToggle();
  initAccountModals();
  initAccountCenter();
});
