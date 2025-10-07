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
//   ibuprofen to 400 mg per single dose.
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
        <p>Give ${acetaMl.toFixed(1)} mL (${acetaMg.toFixed(0)} mg) every 4 hours as needed for fever/pain.</p>
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
    const IBU_MAX_SINGLE_DOSE_MG = isPediatric ? 400 : 800;

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
        <p>Give ${acetaMl.toFixed(1)} mL (${acetaMg.toFixed(0)} mg) every 6 hours as needed for fever/pain.</p>
        ${renderWarning(
          '',
          `Maximum single dose for this age group is ${ACETA_MAX_SINGLE_DOSE_MG} mg of acetaminophen every 6 hours.`,
          'warning-card--orange'
        )}
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
        <p><strong>Children's 100 mg / 5 mL:</strong> Give ${ibuMl100.toFixed(1)} mL (${ibuMg.toFixed(0)} mg) every 6 hours as needed for fever/pain.</p>
        <p><strong>Infant's 50 mg / 1.25 mL:</strong> Give ${ibuMl50.toFixed(1)} mL (${ibuMg.toFixed(0)} mg) every 6 hours as needed for fever/pain.</p>
        ${renderWarning(
          '',
          `Maximum single dose for this age group is ${IBU_MAX_SINGLE_DOSE_MG} mg of ibuprofen every 6 hours.`,
          'warning-card--orange'
        )}
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

    group.push(
      renderWarning(
        'Dose spacing reminder',
        `Never exceed ${ACETA_MAX_SINGLE_DOSE_MG} mg of acetaminophen or ${IBU_MAX_SINGLE_DOSE_MG} mg of ibuprofen in a single dose, and allow at least 6 hours between doses.`,
        'warning-card--teal'
      )
    );

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

window.addEventListener('DOMContentLoaded', () => {
  initCarousels();
  initCalculator();
  updateForm();
  initTranslations();
});
