(function (global) {
  if (global.CloseDoseAllergyCalculator && typeof global.CloseDoseAllergyCalculator.mount === 'function') {
    return;
  }

  const DEFAULT_STRINGS = {
    title: 'Allergy Medication Dosing',
    header: {
      eyebrow: 'Allergy Dosing'
    },
    form: {
      ageLabel: 'Step 1: Tap an age group',
      ageGroupAria: 'Select patient age',
      agePrompt: '',
      ageOptions: {
        '0-23m': {
          primary: '0 TO 23',
          connector: 'MONTHS',
          secondary: '',
          align: 'center',
          accessible: '0 to 23 Months',
        },
        '2-5y': {
          primary: '2 TO 5',
          connector: 'YEARS',
          secondary: '',
          align: 'center',
          accessible: '2 to 5 Years',
        },
        '6-11y': {
          primary: '6 TO 11',
          connector: 'YEARS',
          secondary: '',
          align: 'center',
          accessible: '6 to 11 Years',
        },
        '12y+': {
          primary: '12 Years',
          connector: '+',
          secondary: '',
          align: 'center',
          accessible: '12 Years and older',
        }
      },
      ageSelectLabel: 'Select age',
      weightLabel: 'Step 2: Enter weight',
      weightInputLabel: 'Enter weight',
      weightPlaceholder: 'Enter weight',
      weightUnitAria: 'Select weight unit',
      severityLabel: 'Step 3: Select symptom severity',
      calculate: 'Calculate',
      calculateStep: 'Step 4: Calculate!',
    },
    units: {
      lbs: 'lbs',
      kg: 'kg',
    },
    warnings: {
      ageRequiredTitle: 'Age required',
      ageRequiredBody: 'Please select an age group and exact age to continue.',
      weightRequiredTitle: 'Weight required',
      weightRequiredBody: 'Please enter a valid weight to calculate dosing.',
      severityRequiredTitle: 'Severity required',
      severityRequiredBody: 'Please select symptom severity to continue.',
      maxDoseReachedTitle: 'Maximum dose reached',
      maxDoseReachedBody: 'Weight-based dose was limited to this maximum. Consider discussing dosing with your pediatrician.',
      allergySafetyTitle: 'Antihistamine Safety Reminder',
      allergySafetyBody: 'Use only one oral antihistamine at a time unless directed. Seek emergency care for trouble breathing, severe swelling, or signs of anaphylaxis.',
      benadrylDrowsiness: 'Benadryl can cause marked sleepiness or paradoxical agitation. Do not use to make a child sleepy.',
      underTwoClinician: '<strong>Clinician guidance needed.</strong> Allergy medicine dosing is not recommended for children under 2 years without direct clinician instructions. Call 911 for breathing trouble, severe swelling, or signs of anaphylaxis.',
      benadrylAgeLimit: 'Not recommended for children under 6 years. Consult your pediatrician before using Benadryl.'
    },
    results: {
      patientWeightLabel: 'Patient weight',
      patientWeightValue: '{{kg}} kg ({{lbs}} lbs)',
    },
    accessibility: {
      resultsRegion: 'Dosing results',
    }
  };

  const BASE_STYLES = `
    .cdcalc-wrapper {
      position: relative;
      max-width: 720px;
      margin: 0 auto;
    }

    .cdcalc-wrapper--has-logomark {
      padding-top: 60px;
    }

    .cdcalc-logomark {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 200px;
      height: auto;
      display: block;
      pointer-events: none;
      user-select: none;
    }

    .cdcalc-card {
      font-family: "Nunito", system-ui, -apple-system, "Segoe UI", sans-serif;
      background: rgba(255, 255, 255, 0.92);
      border: 3px solid #0f2c2a;
      border-radius: 26px;
      box-shadow: 0 6px 0 rgba(15, 44, 42, 0.18);
      padding: clamp(20px, 3vw, 32px);
      max-width: 100%;
      margin: 0;
      color: #0f2c2a;
      --cdcalc-gold: #ffe8a8;
    }

    .cdcalc-header {
      margin: calc(-1 * clamp(20px, 3vw, 32px));
      margin-bottom: 28px;
      padding: clamp(18px, 3.2vw, 28px) clamp(20px, 3vw, 32px);
      background: linear-gradient(135deg, #e9f6f2 0%, #cdeee6 100%);
      border-bottom: 3px solid #0f2c2a;
      border-radius: 23px 23px 0 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      text-align: center;
    }

    .cdcalc-header-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin: 0;
      padding: 4px 14px;
      border-radius: 999px;
      background: #0f2c2a;
      color: #ffffff;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }

    .cdcalc-header-eyebrow::after {
      content: '↓';
      font-size: 0.9em;
      line-height: 1;
    }

    .cdcalc-title {
      font-size: clamp(1.6rem, 3vw, 2rem);
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin: 0;
    }

    .cdcalc-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .cdcalc-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .cdcalc-group-title {
      font-size: 1rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin: 0;
    }

    .cdcalc-group-title--step,
    .cdcalc-step-callout--step {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .cdcalc-step-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      width: 44px;
      height: 44px;
      border-radius: 999px;
      background: #24a687;
      color: #ffffff;
      border: 3px solid #0f2c2a;
      box-shadow: 0 3px 0 rgba(15, 44, 42, 0.25);
      font-size: 1.35rem;
      font-weight: 900;
      letter-spacing: 0;
    }

    .cdcalc-step-text {
      display: inline-block;
      font-size: 1.2rem;
    }

    .cdcalc-segmented {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .cdcalc-segmented-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 10px;
    }

    .cdcalc-age-option,
    .cdcalc-unit-option {
      appearance: none;
      border: 3px solid #0f2c2a;
      border-radius: 16px;
      background: #ffffff;
      color: #0f2c2a;
      font-weight: 800;
      font-size: 0.95rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 14px 12px;
      cursor: pointer;
      transition: background 0.12s ease, color 0.12s ease, transform 0.12s ease;
    }

    .cdcalc-age-option {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      gap: 2px;
      min-height: 92px;
      line-height: 1.05;
    }

    .cdcalc-age-option--align-center {
      align-items: center;
      text-align: center;
    }

    .cdcalc-age-option.is-active,
    .cdcalc-unit-option.is-active {
      background: #24a687;
      color: #ffffff;
      box-shadow: inset 0 0 0 2px #0f2c2a;
    }

    .cdcalc-age-line {
      display: block;
      width: 100%;
    }

    .cdcalc-age-line--primary {
      font-size: 1.05rem;
    }

    .cdcalc-age-line--connector {
      font-size: 0.72rem;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      opacity: 0.7;
    }

    .cdcalc-age-line--secondary {
      font-size: 1.05rem;
      font-weight: 800;
    }

    .cdcalc-age-option:focus-visible,
    .cdcalc-unit-option:focus-visible,
    .cdcalc-button:focus-visible {
      outline: 3px solid #0f2c2a;
      outline-offset: 3px;
    }

    .cdcalc-hello {
      margin: 0;
      font-weight: 700;
      color: #124643;
    }

    .cdcalc-unit-row {
      display: flex;
      flex-direction: column;
      gap: 16px;
      align-items: center;
    }

    .cdcalc-weight-input {
      position: relative;
      width: min(100%, clamp(200px, 33%, 240px));
      margin: 0 auto;
    }

    .cdcalc-input {
      width: 100%;
      display: block;
      border: 4px dashed #0f2c2a;
      border-radius: 16px;
      padding: 16px 18px;
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f2c2a;
      background: #ffffff;
      text-align: center;
      letter-spacing: 0.04em;
      transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
      appearance: textfield;
    }

    .cdcalc-input:focus,
    .cdcalc-input:focus-visible {
      outline: none;
      border-color: var(--cdcalc-gold);
      box-shadow: 0 0 0 8px rgba(255, 232, 168, 0.3);
      transform: scale(1.01);
    }

    .cdcalc-input::-webkit-outer-spin-button,
    .cdcalc-input::-webkit-inner-spin-button {
      appearance: none;
      margin: 0;
    }

    .cdcalc-unit-toggle {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      width: min(100%, clamp(240px, 50%, 360px));
      margin: 0 auto;
    }

    .cdcalc-unit-option {
      width: 100%;
    }

    .cdcalc-action {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
      margin-top: 12px;
      text-align: left;
    }

    .cdcalc-step-callout {
      margin: 0;
      font-weight: 800;
      font-size: 0.95rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #0f2c2a;
    }

    .cdcalc-step-callout--step {
      justify-content: flex-start;
    }

    .cdcalc-button {
      appearance: none;
      border: 3px solid #0f2c2a;
      border-radius: 999px;
      background: linear-gradient(135deg, #24a687 0%, #1f8f7b 70%);
      color: #ffffff;
      font-weight: 900;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      padding: clamp(18px, 2.5vw, 24px) clamp(28px, 6vw, 40px);
      font-size: clamp(1rem, 0.95rem + 0.25vw, 1.15rem);
      cursor: pointer;
      box-shadow: 0 4px 0 rgba(15, 44, 42, 0.25);
      transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease, background 0.16s ease;
      align-self: center;
    }

    .cdcalc-button:disabled {
      background: #cbd5d5;
      color: #597b7a;
      cursor: not-allowed;
      box-shadow: none;
    }

    .cdcalc-button:not(:disabled):hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 0 rgba(15, 44, 42, 0.25);
    }

    @keyframes cdcalc-button-breathe {
      0%,
      100% {
        transform: translateY(0) scale(1);
        box-shadow:
          0 4px 0 rgba(15, 44, 42, 0.25),
          0 0 0 0 rgba(255, 232, 168, 0);
        background: linear-gradient(135deg, #24a687 0%, #1f8f7b 70%);
        filter: drop-shadow(0 0 0 rgba(255, 232, 168, 0));
      }
      45% {
        transform: translateY(-6px) scale(1.1);
        box-shadow:
          0 16px 0 rgba(15, 44, 42, 0.32),
          0 0 0 14px rgba(255, 232, 168, 0.45);
        background: linear-gradient(140deg, #24a687 0%, var(--cdcalc-gold) 92%);
        filter: drop-shadow(0 0 18px rgba(255, 232, 168, 0.4));
      }
    }

    @keyframes cdcalc-input-breathe {
      0%,
      100% {
        transform: scale(1);
        border-color: #0f2c2a;
        box-shadow: 0 0 0 0 rgba(255, 232, 168, 0);
      }
      50% {
        transform: scale(1.02);
        border-color: var(--cdcalc-gold);
        box-shadow: 0 0 0 10px rgba(255, 232, 168, 0.35);
      }
    }

    .cdcalc-button--breathing {
      animation: cdcalc-button-breathe 2.4s ease-in-out infinite;
    }

    .cdcalc-input--attention {
      animation: cdcalc-input-breathe 2.1s ease-in-out infinite;
      will-change: transform, box-shadow, border-color;
    }

    .cdcalc-alert {
      border-radius: 16px;
      border: 3px solid #d14343;
      background: #fee2e2;
      padding: 16px;
      font-weight: 700;
      color: #7f1d1d;
      margin: 0;
    }

    .cdcalc-results {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 8px;
    }

    .cdcalc-result-group {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .cdcalc-result-weight {
      margin: 0;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .cdcalc-result-card {
      border: 3px solid #0f2c2a;
      border-radius: 18px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.86);
      box-shadow: inset 0 0 0 1px rgba(15, 44, 42, 0.12);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .cdcalc-result-card h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 900;
    }

    .cdcalc-result-card p {
      margin: 0;
      line-height: 1.5;
      font-size: 0.98rem;
    }

    .cdcalc-dose-ml {
      display: inline-block;
      font-size: clamp(1.8rem, 5vw, 2.4rem);
      font-weight: 900;
      letter-spacing: 0.01em;
      color: #0f2c2a;
      background: var(--cdcalc-gold);
      padding: 2px 12px;
      border-radius: 12px;
      margin: 0 6px 0 2px;
      line-height: 1.15;
      vertical-align: middle;
    }

    .cdcalc-dose-mg {
      display: inline-block;
      font-size: 0.95rem;
      font-weight: 700;
      color: #124643;
      margin-right: 6px;
      vertical-align: middle;
    }

    .cdcalc-warning {
      border-radius: 16px;
      border: 3px solid #124643;
      background: #e4f4f0;
      color: #123a37;
      padding: 14px;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .cdcalc-warning--orange {
      border-color: #b45309;
      background: #fef3c7;
      color: #92400e;
    }

    .cdcalc-warning--red {
      border-color: #b91c1c;
      background: #fee2e2;
      color: #7f1d1d;
    }

    .cdcalc-warning--teal {
      border-color: #124643;
      background: #e4f4f0;
      color: #123a37;
    }

    .cdcalc-warning strong {
      display: inline-block;
      margin-bottom: 2px;
    }

    .cdcalc-visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
      border: 0;
    }

    .cdcalc-segmented select,
    .cdcalc-unit-toggle select {
      display: none;
    }

    .cdcalc-select-label {
      font-size: 0.95rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 6px;
      display: block;
      color: #0f2c2a;
      text-align: left;
    }

    .cdcalc-select {
      width: 100%;
      max-width: 320px;
      margin: 0;
      display: block;
      border: 3px solid #0f2c2a;
      border-radius: 16px;
      padding: 12px 16px;
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f2c2a;
      background: #ffffff;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230f2c2a' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 16px center;
      background-size: 16px;
      padding-right: 40px;
    }

    .cdcalc-severity-toggle {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      width: 100%;
    }

    .cdcalc-severity-option {
      appearance: none;
      border: 3px solid #0f2c2a;
      border-radius: 18px;
      background: #ffffff;
      color: #0f2c2a;
      padding: 12px clamp(8px, 2vw, 16px);
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.12s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 4px;
    }

    .cdcalc-severity-title {
      font-size: 1.1rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .cdcalc-severity-desc {
      font-size: 0.78rem;
      font-weight: 600;
      opacity: 0.85;
      line-height: 1.3;
    }

    .cdcalc-severity-option:hover {
      transform: translateY(-1px);
    }

    .cdcalc-severity-option[data-severity="mild"].is-active {
      background: #24a687;
      color: #ffffff;
      border-color: #0f2c2a;
    }

    .cdcalc-severity-option[data-severity="moderate"].is-active {
      background: #d97706;
      color: #ffffff;
      border-color: #0f2c2a;
    }

    .cdcalc-severity-option[data-severity="severe"].is-active {
      background: #b91c1c;
      color: #ffffff;
      border-color: #0f2c2a;
      box-shadow: 0 0 0 4px rgba(185, 28, 28, 0.25);
    }

    .cdcalc-result-card--critical {
      border: 3px solid #b91c1c;
      background: #fef2f2;
      box-shadow: 0 4px 12px rgba(185, 28, 28, 0.12);
    }

    .cdcalc-result-card--disabled {
      opacity: 0.8;
      background: #f8fafc;
    }

    .cdcalc-result-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 8px;
      border-bottom: 2px dashed rgba(15, 44, 42, 0.15);
      padding-bottom: 6px;
    }

    .cdcalc-result-badge {
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 999px;
      background: #0f2c2a;
      color: #ffffff;
      letter-spacing: 0.05em;
    }

    .cdcalc-result-badge--preferred {
      background: #24a687;
    }

    .cdcalc-result-badge--alternative {
      background: #597b7a;
    }

    .cdcalc-result-badge--emergency {
      background: #b91c1c;
    }

    .cdcalc-result-badge--adjunct {
      background: #d97706;
    }

    .cdcalc-result-badge--prescription {
      background: #7c3aed;
    }

    .cdcalc-result-section-title {
      font-size: 1.25rem;
      font-weight: 900;
      color: #0f2c2a;
      margin: 24px 0 12px 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 3px solid #0f2c2a;
      padding-bottom: 4px;
    }

    .cdcalc-result-section-title:first-of-type {
      margin-top: 12px;
    }

    @media (max-width: 640px) {
      .cdcalc-segmented-buttons {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .cdcalc-age-option {
        min-height: 80px;
        padding: 8px 6px;
      }

      .cdcalc-severity-toggle {
        grid-template-columns: 1fr;
      }
    }
  `;

  function escapeHtml(value) {
    if (typeof value !== 'string') {
      return '';
    }
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function deepMerge(target, source) {
    if (!source) {
      return target;
    }
    Object.keys(source).forEach((key) => {
      const sourceValue = source[key];
      const targetValue = target[key];
      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object'
      ) {
        deepMerge(targetValue, sourceValue);
      } else {
        target[key] = sourceValue;
      }
    });
    return target;
  }

  function formatString(template, values) {
    if (!template) {
      return '';
    }
    return template.replace(/\{\{(.*?)\}\}/g, (match, key) => {
      const trimmed = key.trim();
      return Object.prototype.hasOwnProperty.call(values, trimmed)
        ? values[trimmed]
        : match;
    });
  }

  function injectStyles(host, options = {}) {
    const shouldInject = options.injectStyles !== false;
    if (!shouldInject) {
      return null;
    }
    const doc = host.ownerDocument || document;
    const styleElement = doc.createElement('style');
    styleElement.setAttribute('type', 'text/css');
    styleElement.textContent = BASE_STYLES;
    doc.head.appendChild(styleElement);
    return styleElement;
  }

  const ATTENTION_CLASS = 'cdcalc-button--breathing';
  const INPUT_ATTENTION_CLASS = 'cdcalc-input--attention';

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

  function resolveAgeGate(age) {
    switch (age) {
      case '0-23m':
        return 'clinician';
      case '2-5y':
        return 'toddler';
      case '6-11y':
        return 'pediatric';
      case '12y+':
        return 'adolescent';
      default:
        return '';
    }
  }

  function renderWarning(strings, options = {}) {
    const { title = '', body = '', tone = 'teal' } = options;
    const toneClass = tone ? ` cdcalc-warning--${tone}` : '';
    const titleHtml = title ? `<strong>${escapeHtml(title)}</strong> ` : '';
    return `
      <div class="cdcalc-warning${toneClass}">
        ${titleHtml}${body}
      </div>
    `;
  }

  function trackCalculatorEvent(eventName, params) {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      var payload = Object.assign({event_category: 'allergy_calculator'}, params || {});
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, payload);
      } else if (window.dataLayer && typeof window.dataLayer.push === 'function') {
        window.dataLayer.push(Object.assign({event: eventName}, payload));
      }
    } catch (err) {
      /* swallow — analytics is best-effort only */
    }
  }

  function buildMarkup(strings, ids, logomarkSrc) {
    const { form, units } = strings;
    const ageOptions = form.ageOptions || {};

    const normalizeAgeLabel = function (value) {
      if (!value) return null;
      if (typeof value === 'string') {
        return { primary: value, secondary: '', connector: '', align: 'center', accessible: value };
      }
      return {
        primary: value.primary || '',
        secondary: value.secondary || '',
        connector: value.connector || '',
        align: value.align || 'center',
        accessible: value.accessible || [value.primary, value.connector, value.secondary].filter(Boolean).join(' ')
      };
    };

    const ageLabel0to23 = normalizeAgeLabel(ageOptions['0-23m']);
    const ageLabel2to5 = normalizeAgeLabel(ageOptions['2-5y']);
    const ageLabel6to11 = normalizeAgeLabel(ageOptions['6-11y']);
    const ageLabel12Plus = normalizeAgeLabel(ageOptions['12y+']);

    const renderAgeButton = function (ageValue, label) {
      const alignmentClass = label.align === 'center' ? ' cdcalc-age-option--align-center' : '';
      const connectorLine = label.connector
        ? `<span class="cdcalc-age-line cdcalc-age-line--connector">${escapeHtml(label.connector)}</span>`
        : '';
      const secondaryLine = label.secondary
        ? `<span class="cdcalc-age-line cdcalc-age-line--secondary">${escapeHtml(label.secondary)}</span>`
        : '';
      return `
        <button type="button" class="cdcalc-age-option${alignmentClass}" data-age="${ageValue}" aria-pressed="false" aria-label="${escapeHtml(label.accessible)}">
          <span class="cdcalc-age-line cdcalc-age-line--primary">${escapeHtml(label.primary)}</span>
          ${connectorLine}
          ${secondaryLine}
        </button>
      `;
    };

    const renderStepTitle = function (labelText) {
      const raw = typeof labelText === 'string' ? labelText : '';
      const match = /^\s*step\s*(\d+)\s*[:.\-]?\s*(.*)$/i.exec(raw);
      if (match) {
        return {
          aria: raw,
          html: `<span class="cdcalc-step-badge" aria-hidden="true">${escapeHtml(match[1])}</span><span class="cdcalc-step-text">${escapeHtml(match[2])}</span>`,
        };
      }
      return { aria: raw, html: escapeHtml(raw) };
    };

    const stepAge = renderStepTitle(form.ageLabel);
    const stepWeight = renderStepTitle(form.weightLabel);
    const stepSeverity = renderStepTitle(form.severityLabel || 'Step 3: Select symptom severity');
    const stepCalculate = renderStepTitle(form.calculateStep || 'Step 4: Calculate!');

    const wrapperClass = logomarkSrc ? 'cdcalc-wrapper cdcalc-wrapper--has-logomark' : 'cdcalc-wrapper';
    const logomarkHtml = logomarkSrc ? `<img class="cdcalc-logomark" src="${logomarkSrc}" alt="" aria-hidden="true">` : '';

    return `
      <div class="${wrapperClass}">
        ${logomarkHtml}
        <div class="cdcalc-card" data-calculator-card aria-labelledby="${ids.title}" role="group">
          <div class="cdcalc-header">
            ${strings.header && strings.header.eyebrow ? `<p class="cdcalc-header-eyebrow">${escapeHtml(strings.header.eyebrow)}</p>` : ''}
            <h2 class="cdcalc-title" id="${ids.title}">${strings.title}</h2>
          </div>
          <form class="cdcalc-form" data-calculator-form novalidate>
            <div class="cdcalc-group" aria-live="polite">
              <div class="cdcalc-group-title cdcalc-group-title--step" aria-label="${escapeHtml(stepAge.aria)}">${stepAge.html}</div>
              <div class="cdcalc-segmented">
                <div class="cdcalc-segmented-buttons" role="group" aria-label="${form.ageGroupAria}">
                  ${renderAgeButton('0-23m', ageLabel0to23)}
                  ${renderAgeButton('2-5y', ageLabel2to5)}
                  ${renderAgeButton('6-11y', ageLabel6to11)}
                  ${renderAgeButton('12y+', ageLabel12Plus)}
                </div>
              </div>
              <select data-age-select aria-hidden="true" tabindex="-1" hidden>
                <option value="">${form.ageSelectLabel}</option>
                <option value="0-23m">${escapeHtml(ageLabel0to23.accessible)}</option>
                <option value="2-5y">${escapeHtml(ageLabel2to5.accessible)}</option>
                <option value="6-11y">${escapeHtml(ageLabel6to11.accessible)}</option>
                <option value="12y+">${escapeHtml(ageLabel12Plus.accessible)}</option>
              </select>
              <div class="cdcalc-group" data-exact-age-wrapper style="display: none; margin-top: 12px; padding: 0;">
                <label for="${ids.exactAge}" class="cdcalc-select-label" data-exact-age-label>Exact age</label>
                <select id="${ids.exactAge}" class="cdcalc-select" data-exact-age-select>
                  <option value="">Select age</option>
                </select>
              </div>
              <p class="cdcalc-alert" data-message hidden></p>
            </div>

            <div class="cdcalc-group">
              <div class="cdcalc-group-title cdcalc-group-title--step" aria-label="${escapeHtml(stepWeight.aria)}">${stepWeight.html}</div>
              <div class="cdcalc-unit-row">
                <div class="cdcalc-weight-input">
                  <label for="${ids.weight}" class="cdcalc-visually-hidden">${form.weightInputLabel}</label>
                  <input type="number" inputmode="decimal" min="0" step="0.1" id="${ids.weight}" name="${ids.weight}" class="cdcalc-input" data-weight-input placeholder="${form.weightPlaceholder}" />
                </div>
                <div class="cdcalc-unit-toggle" role="group" aria-label="${form.weightUnitAria}">
                  <button type="button" class="cdcalc-unit-option is-active" data-unit="lbs" aria-pressed="true">${units.lbs}</button>
                  <button type="button" class="cdcalc-unit-option" data-unit="kg" aria-pressed="false">${units.kg}</button>
                </div>
              </div>
              <select data-weight-unit aria-hidden="true" tabindex="-1" hidden>
                <option value="lbs" selected>${units.lbs}</option>
                <option value="kg">${units.kg}</option>
              </select>
            </div>

            <div class="cdcalc-group">
              <div class="cdcalc-group-title cdcalc-group-title--step" aria-label="${escapeHtml(stepSeverity.aria)}">${stepSeverity.html}</div>
              <div class="cdcalc-severity-toggle" role="group" aria-label="${escapeHtml(form.severityGroupAria || 'Select symptom severity')}">
                <button type="button" class="cdcalc-severity-option" data-severity="mild" aria-pressed="false">
                  <span class="cdcalc-severity-title">Mild</span>
                  <span class="cdcalc-severity-desc">Hives, itchy skin, runny nose</span>
                </button>
                <button type="button" class="cdcalc-severity-option" data-severity="moderate" aria-pressed="false">
                  <span class="cdcalc-severity-title">Moderate</span>
                  <span class="cdcalc-severity-desc">Widespread hives, mild body swelling</span>
                </button>
                <button type="button" class="cdcalc-severity-option" data-severity="severe" aria-pressed="false">
                  <span class="cdcalc-severity-title">Severe</span>
                  <span class="cdcalc-severity-desc">Trouble breathing, lip/tongue swelling, vomiting, fainting</span>
                </button>
              </div>
              <select data-severity-select aria-hidden="true" tabindex="-1" hidden>
                <option value="">Select severity</option>
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe / Anaphylaxis</option>
              </select>
            </div>

            <div class="cdcalc-action">
              ${form.calculateStep ? `<p class="cdcalc-step-callout cdcalc-step-callout--step" aria-label="${escapeHtml(stepCalculate.aria)}">${stepCalculate.html}</p>` : ''}
              <button type="submit" class="cdcalc-button" data-submit>${form.calculate}</button>
            </div>
            <div class="cdcalc-results" data-results role="region" aria-live="polite" aria-label="${strings.accessibility.resultsRegion}"></div>
          </form>
        </div>
      </div>
    `;
  }

  function getElements(root) {
    return {
      root,
      ageSelect: root.querySelector('[data-age-select]'),
      ageButtons: root.querySelectorAll('.cdcalc-age-option'),
      message: root.querySelector('[data-message]'),
      weightInput: root.querySelector('[data-weight-input]'),
      unitSelect: root.querySelector('[data-weight-unit]'),
      unitButtons: root.querySelectorAll('.cdcalc-unit-option'),
      submitButton: root.querySelector('[data-submit]'),
      results: root.querySelector('[data-results]'),
      form: root.querySelector('[data-calculator-form]'),
      exactAgeWrapper: root.querySelector('[data-exact-age-wrapper]'),
      exactAgeLabel: root.querySelector('[data-exact-age-label]'),
      exactAgeSelect: root.querySelector('[data-exact-age-select]'),
      severitySelect: root.querySelector('[data-severity-select]'),
      severityButtons: root.querySelectorAll('.cdcalc-severity-option'),
    };
  }

  function clearResults(elements) {
    if (elements && elements.results) {
      elements.results.innerHTML = '';
    }
  }

  // DOSING LOGIC HELPER FUNCTIONS
  function getCetirizineDose(ageMonths, weightKg) {
    const ageYears = Math.floor(ageMonths / 12);
    
    if (ageMonths < 6) {
      return {
        doseMg: null,
        message: "⛔ NOT RECOMMENDED under 6 months of age.",
        action: "Consult your child's doctor."
      };
    } else if (ageMonths >= 6 && ageMonths <= 23) {
      if (weightKg < 7) {
        return {
          doseMg: null,
          message: "⚠️ Weight below studied range (<7 kg). Consult doctor."
        };
      }
      return {
        doseMg: 2.5,
        volumeMl: 2.5,
        frequency: "Once daily",
        maxDailyMg: 2.5,
        formulation: "Oral solution ONLY (1 mg/mL)",
        warning: "Physician-directed dosing only. OTC label says 'ask a doctor' under age 2."
      };
    } else if (ageYears >= 2 && ageYears <= 5) {
      return {
        doseMg: 2.5,
        volumeMl: 2.5,
        frequency: "Once daily; may increase to TWICE daily if symptoms persist",
        maxDailyMg: 5,
        formulation: "Oral solution (1 mg/mL)",
        warning: null
      };
    } else if (ageYears >= 6 && ageYears <= 11) {
      const recommended = (weightKg < 25) ? 5 : 10;
      return {
        doseMg: recommended,
        volumeMl: recommended,
        frequency: "Once daily",
        maxDailyMg: 10,
        formulation: "Oral solution, chewable tablet, OR tablet",
        warning: null
      };
    } else if (ageYears >= 12 && ageYears <= 17) {
      return {
        doseMg: 10,
        volumeMl: 10,
        frequency: "Once daily",
        maxDailyMg: 10,
        formulation: "Any (solution, chewable, or tablet)",
        warning: null
      };
    }
    return null;
  }

  function getLoratadineDose(ageMonths, weightKg) {
    const ageYears = Math.floor(ageMonths / 12);
    
    if (ageMonths < 24) {
      return {
        doseMg: null,
        message: "⛔ NOT APPROVED under 2 years. Consult your child's doctor."
      };
    } else if (ageYears >= 2 && ageYears <= 5) {
      return {
        doseMg: 5,
        volumeMl: 5,
        frequency: "Once daily",
        maxDailyMg: 5,
        formulation: "Oral solution (5 mg/5 mL) or 1 chewable tablet (5 mg)",
        warning: null
      };
    } else if (ageYears >= 6 && ageYears <= 11) {
      return {
        doseMg: 10,
        volumeMl: 10,
        frequency: "Once daily",
        maxDailyMg: 10,
        formulation: "Oral solution (10 mL), 2 chewable tablets, or 1 tablet (10 mg)",
        warning: null
      };
    } else if (ageYears >= 12 && ageYears <= 17) {
      return {
        doseMg: 10,
        frequency: "Once daily",
        maxDailyMg: 10,
        formulation: "Tablet (10 mg) or RediTab (10 mg)",
        warning: null
      };
    }
    return null;
  }

  function getFexofenadineDose(ageMonths, weightKg) {
    const ageYears = Math.floor(ageMonths / 12);
    
    if (ageMonths < 24) {
      return {
        doseMg: null,
        message: "⛔ NOT APPROVED under 2 years."
      };
    } else if (ageYears >= 2 && ageYears <= 5) {
      return {
        doseMg: 30,
        volumeMl: 5,
        frequency: "TWICE daily (every 12 hours)",
        maxDailyMg: 60,
        formulation: "Oral suspension (30 mg/5 mL)",
        warning: "OTC label says 'ask a doctor' under age 6. Physician-directed.",
        special: "⚠️ Give on EMPTY STOMACH. Avoid fruit juices (apple, orange, grapefruit) — they reduce absorption by up to 70%."
      };
    } else if (ageYears >= 6 && ageYears <= 11) {
      return {
        doseMg: 30,
        volumeMl: 5,
        frequency: "TWICE daily (every 12 hours)",
        maxDailyMg: 60,
        formulation: "ODT (30 mg) or oral suspension (5 mL)",
        warning: null,
        special: "⚠️ Give on EMPTY STOMACH. Avoid fruit juices."
      };
    } else if (ageYears >= 12 && ageYears <= 17) {
      return {
        doseMgOption1: 60,
        doseMgOption2: 180,
        frequencyOption1: "Twice daily",
        frequencyOption2: "Once daily",
        maxDailyMg: 180,
        formulation: "Tablet (60 mg or 180 mg)",
        warning: null,
        special: "⚠️ Give on EMPTY STOMACH. Avoid fruit juices."
      };
    }
    return null;
  }

  function getLevocetirizineDose(ageMonths, weightKg) {
    const ageYears = Math.floor(ageMonths / 12);
    
    if (ageMonths < 6) {
      return {
        doseMg: null,
        message: "⛔ NOT RECOMMENDED under 6 months."
      };
    } else if (ageMonths >= 6 && ageMonths <= 23) {
      if (weightKg < 7) {
        return {
          doseMg: null,
          message: "⚠️ Weight below studied range. Consult doctor."
        };
      }
      return {
        doseMg: 1.25,
        volumeMl: 2.5,
        frequency: "Once daily IN THE EVENING",
        maxDailyMg: 1.25,
        formulation: "Rx oral solution ONLY (0.5 mg/mL)",
        warning: "Physician-directed. OTC label says 'do not use' under 2."
      };
    } else if (ageYears >= 2 && ageYears <= 5) {
      return {
        doseMg: 1.25,
        volumeMl: 2.5,
        frequency: "Once daily IN THE EVENING",
        maxDailyMg: 1.25,
        formulation: "OTC oral solution (2.5 mg/5 mL → give 2.5 mL)",
        warning: null
      };
    } else if (ageYears >= 6 && ageYears <= 11) {
      return {
        doseMg: 2.5,
        volumeMl: 5,
        frequency: "Once daily IN THE EVENING",
        maxDailyMg: 2.5,
        formulation: "OTC oral solution (2.5 mg/5 mL → give 5 mL)",
        warning: "⚠️ Do NOT give 5 mg (adult dose) — produces ~2× adult blood levels in children 6–11."
      };
    } else if (ageYears >= 12 && ageYears <= 17) {
      return {
        doseMg: 5,
        volumeMl: 10,
        frequency: "Once daily IN THE EVENING",
        maxDailyMg: 5,
        formulation: "OTC solution (10 mL) or Rx tablet (5 mg)",
        warning: null
      };
    }
    return null;
  }

  function getDiphenhydramineDose(ageMonths, weightKg) {
    const ageYears = Math.floor(ageMonths / 12);
    const globalWarning = "⚠️ FIRST-GENERATION: Causes drowsiness. May cause paradoxical excitation in young children. Use a 2nd-generation antihistamine (cetirizine, loratadine) if available.";
    
    if (ageMonths < 24) {
      return {
        doseMg: null,
        message: "🚫 DO NOT USE under 2 years. FDA advisory against OTC cough/cold/antihistamine use in children <2.",
        globalWarning: globalWarning
      };
    } else if (ageYears >= 2 && ageYears <= 3) {
      if (weightKg < 10) {
        return {
          doseMg: null,
          message: "⚠️ Very low weight. Consult doctor for individualized dosing.",
          globalWarning: globalWarning
        };
      }
      const rawDose = 1.25 * weightKg;
      let calculatedDose = Math.round(rawDose * 2) / 2;
      calculatedDose = Math.min(calculatedDose, 12.5);
      const volume = calculatedDose / 2.5;
      
      return {
        doseMg: calculatedDose,
        volumeMl: Math.round(volume * 10) / 10,
        frequency: "Every 4–6 hours as needed",
        maxDailyMg: Math.min(5 * weightKg, 75),
        maxDosesPerDay: 6,
        formulation: "Oral solution ONLY (12.5 mg/5 mL)",
        warning: "Physician-directed only. OTC labels say 'do not use' under age 4.",
        globalWarning: globalWarning
      };
    } else if (ageYears >= 4 && ageYears <= 5) {
      return {
        doseMg: 12.5,
        volumeMl: 5,
        frequency: "Every 4–6 hours as needed",
        maxDailyMg: 75,
        maxDosesPerDay: 6,
        formulation: "Oral solution (5 mL) or 1 chewable tablet (12.5 mg)",
        warning: null,
        globalWarning: globalWarning
      };
    } else if (ageYears >= 6 && ageYears <= 11) {
      const dose = (weightKg < 25) ? 12.5 : 25;
      return {
        doseMg: dose,
        volumeMl: dose / 2.5,
        frequency: "Every 4–6 hours as needed",
        maxDailyMg: 150,
        maxDosesPerDay: 6,
        formulation: "Oral solution, chewable, or capsule/tablet (if ≥25 mg dose)",
        warning: null,
        globalWarning: globalWarning
      };
    } else if (ageYears >= 12 && ageYears <= 17) {
      return {
        doseMg: 25,
        doseRange: "25–50 mg",
        frequency: "Every 4–6 hours as needed",
        maxDailyMg: 300,
        maxDosesPerDay: 6,
        formulation: "Any (solution, chewable, capsule, or tablet)",
        warning: null,
        globalWarning: globalWarning
      };
    }
    return null;
  }

  function getChlorpheniramineDose(ageMonths, weightKg) {
    const ageYears = Math.floor(ageMonths / 12);
    const globalWarning = "⚠️ FIRST-GENERATION: Causes drowsiness. May cause paradoxical excitation in young children. Use a 2nd-generation antihistamine (cetirizine, loratadine) if available.";
    
    if (ageMonths < 24) {
      return {
        doseMg: null,
        message: "🚫 DO NOT USE under 2 years.",
        globalWarning: globalWarning
      };
    } else if (ageYears >= 2 && ageYears <= 5) {
      return {
        doseMg: 1,
        volumeMl: 2.5,
        frequency: "Every 4–6 hours as needed",
        maxDailyMg: 6,
        formulation: "Syrup (2 mg/5 mL) — give 2.5 mL",
        warning: "OTC labels typically say 'ask a doctor' for this age group.",
        globalWarning: globalWarning
      };
    } else if (ageYears >= 6 && ageYears <= 11) {
      return {
        doseMg: 2,
        volumeMl: 5,
        frequency: "Every 4–6 hours as needed",
        maxDailyMg: 12,
        formulation: "Syrup (5 mL) or ½ tablet (if scored 4 mg tablet available)",
        warning: null,
        globalWarning: globalWarning
      };
    } else if (ageYears >= 12 && ageYears <= 17) {
      return {
        doseMg: 4,
        frequency: "Every 4–6 hours as needed",
        maxDailyMg: 24,
        formulation: "Tablet (4 mg)",
        warning: null,
        globalWarning: globalWarning
      };
    }
    return null;
  }

  function getEpinephrineDose(ageMonths, weightKg) {
    const globalMessages = [
      "🚨 EPINEPHRINE is the ONLY first-line treatment for anaphylaxis.",
      "Inject into MID-OUTER THIGH. Can inject through clothing.",
      "CALL 911 AFTER administering. Do NOT delay epinephrine for antihistamines.",
      "A second dose may be given after 5 minutes if symptoms persist.",
      "Always carry TWO devices."
    ];
    
    if (weightKg < 7.5) {
      const calcDose = Math.round(0.01 * weightKg * 1000) / 1000;
      return {
        doseMg: null,
        message: "⚠️ No auto-injector approved for <7.5 kg. Requires physician-prepared drawn-up epinephrine (0.01 mg/kg IM). Discuss with allergist.",
        calculatedDose: calcDose,
        globalMessages: globalMessages
      };
    } else if (weightKg >= 7.5 && weightKg < 15) {
      return {
        doseMg: 0.15,
        devices: [
          "Auvi-Q 0.1 mg (FDA-approved for 7.5–<15 kg)",
          "EpiPen Jr 0.15 mg (safe and acceptable per guidelines)",
          "Auvi-Q 0.15 mg"
        ],
        intranasal: null,
        site: "Mid-outer thigh, IM",
        repeat: "May repeat × 1 after 5 minutes",
        warning: "Either 0.1 mg or 0.15 mg is acceptable in this weight range per 2023 AAAAI guidelines.",
        globalMessages: globalMessages
      };
    } else if (weightKg >= 15 && weightKg < 25) {
      return {
        doseMg: 0.15,
        devices: [
          "EpiPen Jr 0.15 mg",
          "Auvi-Q 0.15 mg",
          "neffy 1 mg intranasal spray (needle-free option)"
        ],
        intranasalInstructions: "Spray into ONE nostril. Do NOT sniff. May repeat in same nostril after 5 min.",
        site: "Mid-outer thigh, IM (or intranasal if using neffy)",
        repeat: "May repeat × 1 after 5 minutes",
        globalMessages: globalMessages
      };
    } else if (weightKg >= 25 && weightKg < 30) {
      return {
        doseMg: 0.3,
        devices: [
          "EpiPen 0.3 mg",
          "Auvi-Q 0.3 mg",
          "neffy 2 mg intranasal spray"
        ],
        intranasalInstructions: "Spray into ONE nostril. Do NOT sniff. May repeat in same nostril after 5 min.",
        site: "Mid-outer thigh, IM (or intranasal if using neffy)",
        repeat: "May repeat × 1 after 5 minutes",
        note: "AAAAI/AAP/EAACI guidelines recommend 0.3 mg at ≥25 kg. FDA label threshold is 30 kg — either is acceptable.",
        globalMessages: globalMessages
      };
    } else if (weightKg >= 30) {
      return {
        doseMg: 0.3,
        devices: [
          "EpiPen 0.3 mg",
          "Auvi-Q 0.3 mg",
          "neffy 2 mg intranasal spray"
        ],
        intranasalInstructions: "Spray into ONE nostril. Do NOT sniff. May repeat in same nostril after 5 min.",
        site: "Mid-outer thigh, IM (or intranasal if using neffy)",
        repeat: "May repeat × 1 after 5 minutes",
        globalMessages: globalMessages
      };
    }
    return null;
  }

  function getFamotidineDose(ageMonths, weightKg) {
    const ageYears = Math.floor(ageMonths / 12);
    
    if (ageMonths < 12) {
      return {
        doseMg: null,
        message: "⚠️ Not typically used under 1 year for allergic reactions. Consult doctor."
      };
    } else if (ageMonths >= 12 && ageYears < 12) {
      const doseLow = Math.round(0.25 * weightKg);
      let doseHigh = Math.round(0.5 * weightKg);
      doseHigh = Math.min(doseHigh, 20);
      
      return {
        doseRange: doseLow + "–" + doseHigh + " mg",
        frequency: "Once or twice daily",
        maxDailyMg: Math.min(2 * doseHigh, 40),
        formulation: "Rx oral suspension (8 mg/mL) for young children; OTC tablets (10 mg, 20 mg) for older children who can swallow",
        warning: "Off-label for allergic reactions. Use as ADJUNCT to H1 antihistamine, not alone."
      };
    } else if (ageYears >= 12 && ageYears <= 17) {
      return {
        doseMg: "10–20 mg",
        frequency: "Once or twice daily",
        maxDailyMg: 40,
        formulation: "OTC tablet (10 mg or 20 mg)",
        warning: "Off-label for allergic reactions."
      };
    }
    return null;
  }

  function getPrednisoloneDose(ageMonths, weightKg) {
    const globalWarning = "⚠️ PRESCRIPTION ONLY. Do not start without physician direction.";
    
    if (ageMonths < 1) {
      return {
        doseMg: null,
        message: "⚠️ Neonatal dosing requires specialist guidance.",
        globalWarning: globalWarning
      };
    }
    
    let doseLow = Math.round(1.0 * weightKg);
    let doseHigh = Math.round(2.0 * weightKg);
    doseHigh = Math.min(doseHigh, 60);
    doseLow = Math.min(doseLow, 60);
    
    let formulation = "";
    if (weightKg < 10) {
      formulation = "Prednisolone liquid (15 mg/5 mL or 3 mg/mL)";
    } else if (weightKg < 30) {
      formulation = "Prednisolone liquid preferred; ODT (Orapred) if available";
    } else {
      formulation = "Prednisone tablet (5 mg, 10 mg, 20 mg) or prednisolone liquid";
    }
    
    return {
      doseRange: doseLow + "–" + doseHigh + " mg/day",
      frequency: "Once daily (morning) or divided twice daily",
      duration: "3–5 days (no taper needed for short courses)",
      maxDailyMg: 60,
      formulation: formulation,
      warning: "Rx only. Weak evidence for benefit in anaphylaxis. Commonly used for moderate-severe allergic reactions.",
      globalWarning: globalWarning
    };
  }

  function populateExactAgeOptions(elements, ageGroup) {
    if (!elements || !elements.exactAgeSelect || !elements.exactAgeWrapper || !elements.exactAgeLabel) {
      return;
    }
    
    const previousValue = elements.exactAgeSelect.value;
    elements.exactAgeSelect.innerHTML = '';
    
    if (!ageGroup) {
      elements.exactAgeWrapper.style.display = 'none';
      return;
    }
    
    elements.exactAgeWrapper.style.display = 'block';
    
    let options = [];
    if (ageGroup === '0-23m') {
      elements.exactAgeLabel.textContent = 'Select exact age (months):';
      options.push({ value: '', text: 'Select months' });
      for (let m = 0; m <= 23; m++) {
        const text = m === 0 ? '0 months (under 1 month)' : m === 1 ? '1 month' : `${m} months`;
        options.push({ value: String(m), text });
      }
    } else if (ageGroup === '2-5y') {
      elements.exactAgeLabel.textContent = 'Select exact age (years):';
      options.push({ value: '', text: 'Select years' });
      for (let y = 2; y <= 5; y++) {
        options.push({ value: String(y * 12), text: `${y} years old` });
      }
    } else if (ageGroup === '6-11y') {
      elements.exactAgeLabel.textContent = 'Select exact age (years):';
      options.push({ value: '', text: 'Select years' });
      for (let y = 6; y <= 11; y++) {
        options.push({ value: String(y * 12), text: `${y} years old` });
      }
    } else if (ageGroup === '12y+') {
      elements.exactAgeLabel.textContent = 'Select exact age (years):';
      options.push({ value: '', text: 'Select years' });
      for (let y = 12; y <= 17; y++) {
        options.push({ value: String(y * 12), text: `${y} years old` });
      }
    }
    
    options.forEach(opt => {
      const optionEl = document.createElement('option');
      optionEl.value = opt.value;
      optionEl.textContent = opt.text;
      elements.exactAgeSelect.appendChild(optionEl);
    });
    
    if (previousValue && Array.from(elements.exactAgeSelect.options).some(o => o.value === previousValue)) {
      elements.exactAgeSelect.value = previousValue;
    } else {
      elements.exactAgeSelect.value = '';
    }
  }

  function calculateDose(elements, strings, onResultsRendered) {
    if (!elements || !elements.ageSelect || !elements.exactAgeSelect || !elements.weightInput || !elements.unitSelect || !elements.results || !elements.severitySelect) {
      return;
    }

    const notifyResultsRendered = () => {
      if (typeof onResultsRendered === 'function') {
        onResultsRendered();
      }
    };

    const ageGroup = elements.ageSelect.value;
    const ageMonthsStr = elements.exactAgeSelect.value;
    const weightInput = parseFloat(elements.weightInput.value);
    const weightUnit = elements.unitSelect.value;
    const severity = elements.severitySelect.value;

    clearResults(elements);
    notifyResultsRendered();

    if (!ageGroup || ageMonthsStr === '') {
      elements.results.innerHTML = renderWarning(strings, {
        title: strings.warnings.ageRequiredTitle,
        body: strings.warnings.ageRequiredBody,
      });
      notifyResultsRendered();
      return;
    }

    if (isNaN(weightInput) || weightInput <= 0) {
      elements.results.innerHTML = renderWarning(strings, {
        title: strings.warnings.weightRequiredTitle,
        body: strings.warnings.weightRequiredBody,
      });
      notifyResultsRendered();
      return;
    }

    if (!severity) {
      elements.results.innerHTML = renderWarning(strings, {
        title: strings.warnings.severityRequiredTitle,
        body: strings.warnings.severityRequiredBody,
      });
      notifyResultsRendered();
      return;
    }

    const ageMonths = parseInt(ageMonthsStr, 10);
    const weightKg = weightUnit === 'lbs' ? weightInput / 2.20462 : weightInput;
    const weightLbs = weightUnit === 'lbs' ? weightInput : weightInput * 2.20462;

    // STEP 1 Validation:
    if (ageMonths < 0 || ageMonths > 215) {
      elements.results.innerHTML = renderWarning(strings, {
        title: 'Invalid Age',
        body: 'Age must be 0–17 years (0–215 months)',
        tone: 'orange'
      });
      notifyResultsRendered();
      return;
    }

    if (weightKg < 2.0 || weightKg > 120.0) {
      elements.results.innerHTML = renderWarning(strings, {
        title: 'Weight Limits',
        body: 'Please enter a valid weight between 2.0 and 120.0 kg (4.4 and 264.6 lbs).',
        tone: 'orange'
      });
      notifyResultsRendered();
      return;
    }

    const resultBlocks = [];
    const weightLabel = `
      <p class="cdcalc-result-weight">
        <span>${strings.results.patientWeightLabel}</span><br />
        <strong>${formatString(strings.results.patientWeightValue, {
          kg: weightKg.toFixed(1),
          lbs: weightLbs.toFixed(1),
        })}</strong>
      </p>
    `;
    resultBlocks.push(weightLabel);

    const renderCard = (medName, subtitle, doseText, isDisabled, badgeType, badgeText, warningHtml, specialHtml, globalWarningHtml, extraDetails) => {
      const disabledClass = isDisabled ? ' cdcalc-result-card--disabled' : '';
      const badgeClass = badgeType ? ` cdcalc-result-badge--${badgeType}` : '';
      const badgeHtml = badgeText ? `<span class="cdcalc-result-badge${badgeClass}">${escapeHtml(badgeText)}</span>` : '';
      
      return `
        <article class="cdcalc-result-card${disabledClass}">
          <div class="cdcalc-result-title-row">
            <h3>${escapeHtml(medName)} <span style="font-size:0.85rem; font-weight:normal; color:#597b7a; display:block; margin-top:2px;">${escapeHtml(subtitle)}</span></h3>
            ${badgeHtml}
          </div>
          ${doseText ? `<p>${doseText}</p>` : ''}
          ${extraDetails ? `<p style="font-size: 0.9rem; color: #124643; margin-top: 6px;">${extraDetails}</p>` : ''}
          ${globalWarningHtml ? `<div class="cdcalc-warning cdcalc-warning--orange" style="margin-top: 8px; padding: 10px; font-size: 0.88rem;">${globalWarningHtml}</div>` : ''}
          ${warningHtml ? `<div class="cdcalc-warning cdcalc-warning--orange" style="margin-top: 8px; padding: 10px; font-size: 0.88rem;">${warningHtml}</div>` : ''}
          ${specialHtml ? `<div class="cdcalc-warning cdcalc-warning--teal" style="margin-top: 8px; padding: 10px; font-size: 0.88rem;">${specialHtml}</div>` : ''}
        </article>
      `;
    };

    const renderEpinephrineCard = (epiRes) => {
      const disabledClass = !epiRes.doseMg ? ' cdcalc-result-card--disabled' : ' cdcalc-result-card--critical';
      const badgeHtml = `<span class="cdcalc-result-badge cdcalc-result-badge--emergency">EMERGENCY</span>`;
      
      let content = '';
      if (!epiRes.doseMg) {
        content = `<div class="cdcalc-warning cdcalc-warning--red" style="margin-top: 8px; padding: 12px; font-size: 0.95rem;">${epiRes.message}</div>`;
        if (epiRes.calculatedDose !== undefined) {
          content += `<p style="margin-top: 8px;"><em>Reference weight-based dose (0.01 mg/kg): <strong>${epiRes.calculatedDose} mg</strong></em></p>`;
        }
      } else {
        content = `
          <p>Give <span class="cdcalc-dose-ml">${epiRes.doseMg} mg</span> IM into mid-outer thigh immediately.</p>
          <div style="margin-top: 10px;">
            <strong>Approved options for this weight:</strong>
            <ul style="margin: 6px 0; padding-left: 20px; font-size: 0.95rem; line-height: 1.4;">
              ${epiRes.devices.map(dev => `<li>${escapeHtml(dev)}</li>`).join('')}
            </ul>
          </div>
          ${epiRes.intranasalInstructions ? `
            <div class="cdcalc-warning cdcalc-warning--teal" style="margin-top: 8px; padding: 10px; font-size: 0.88rem;">
              <strong>Intranasal spray instructions:</strong> ${escapeHtml(epiRes.intranasalInstructions)}
            </div>
          ` : ''}
          <div style="margin-top: 8px; font-size: 0.9rem; color: #124643;">
            <strong>Injection site:</strong> ${escapeHtml(epiRes.site)}<br/>
            <strong>Repeat:</strong> ${escapeHtml(epiRes.repeat)}
          </div>
        `;
      }
      
      const globalMsgsHtml = `
        <div style="margin-top: 12px; border-top: 2px dashed rgba(185, 28, 28, 0.25); padding-top: 10px;">
          <ul style="margin: 0; padding-left: 20px; font-size: 0.9rem; line-height: 1.4; color: #7f1d1d;">
            ${epiRes.globalMessages.map(msg => `<li><strong>${escapeHtml(msg)}</strong></li>`).join('')}
          </ul>
        </div>
      `;
      
      return `
        <article class="cdcalc-result-card ${disabledClass}">
          <div class="cdcalc-result-title-row">
            <h3>Epinephrine Auto-Injector <span style="font-size:0.85rem; font-weight:normal; color:#b91c1c; display:block; margin-top:2px;">First-line Anaphylaxis Treatment</span></h3>
            ${badgeHtml}
          </div>
          ${content}
          ${globalMsgsHtml}
        </article>
      `;
    };

    let htmlOutput = '';

    if (severity === 'mild') {
      htmlOutput += `<div class="cdcalc-result-section-title">✅ Recommended: 2nd-Generation Antihistamine (choose one)</div>`;
      
      const cet = getCetirizineDose(ageMonths, weightKg);
      if (cet) {
        const extra = cet.doseMg ? `Max daily: ${cet.maxDailyMg} mg` : '';
        const doseText = cet.doseMg ? `Give <span class="cdcalc-dose-ml">${cet.volumeMl.toFixed(1)} mL</span> <span class="cdcalc-dose-mg">(${cet.doseMg} mg)</span> ${cet.frequency}.` : `<strong>${cet.message}</strong>${cet.action ? ' ' + cet.action : ''}`;
        htmlOutput += renderCard('Cetirizine (Zyrtec)', cet.formulation, doseText, !cet.doseMg, 'preferred', 'Preferred', cet.warning, null, null, extra);
      }
      
      const lor = getLoratadineDose(ageMonths, weightKg);
      if (lor) {
        const extra = lor.doseMg ? `Max daily: ${lor.maxDailyMg} mg` : '';
        const doseText = lor.doseMg ? `Give <span class="cdcalc-dose-ml">${lor.volumeMl.toFixed(1)} mL</span> <span class="cdcalc-dose-mg">(${lor.doseMg} mg)</span> ${lor.frequency}.` : `<strong>${lor.message}</strong>`;
        htmlOutput += renderCard('Loratadine (Claritin)', lor.formulation, doseText, !lor.doseMg, 'preferred', 'Preferred', lor.warning, null, null, extra);
      }
      
      const fex = getFexofenadineDose(ageMonths, weightKg);
      if (fex) {
        const extra = fex.maxDailyMg ? `Max daily: ${fex.maxDailyMg} mg` : '';
        let doseText = '';
        if (fex.doseMgOption1) {
          doseText = `Give <span class="cdcalc-dose-ml">${fex.doseMgOption1} mg</span> ${fex.frequencyOption1} <strong>OR</strong> <span class="cdcalc-dose-ml">${fex.doseMgOption2} mg</span> ${fex.frequencyOption2}.`;
        } else if (fex.doseMg) {
          doseText = `Give <span class="cdcalc-dose-ml">${fex.volumeMl.toFixed(1)} mL</span> <span class="cdcalc-dose-mg">(${fex.doseMg} mg)</span> ${fex.frequency}.`;
        } else {
          doseText = `<strong>${fex.message}</strong>`;
        }
        htmlOutput += renderCard('Fexofenadine (Allegra)', fex.formulation, doseText, !(fex.doseMg || fex.doseMgOption1), 'preferred', 'Preferred', fex.warning, fex.special, null, extra);
      }
      
      const lev = getLevocetirizineDose(ageMonths, weightKg);
      if (lev) {
        const extra = lev.doseMg ? `Max daily: ${lev.maxDailyMg} mg` : '';
        const doseText = lev.doseMg ? `Give <span class="cdcalc-dose-ml">${lev.volumeMl.toFixed(1)} mL</span> <span class="cdcalc-dose-mg">(${lev.doseMg} mg)</span> ${lev.frequency}.` : `<strong>${lev.message}</strong>`;
        htmlOutput += renderCard('Levocetirizine (Xyzal)', lev.formulation, doseText, !lev.doseMg, 'preferred', 'Preferred', lev.warning, null, null, extra);
      }
      
      htmlOutput += `<div class="cdcalc-result-section-title">⚠️ Alternative (if 2nd-gen unavailable)</div>`;
      
      const ben = getDiphenhydramineDose(ageMonths, weightKg);
      if (ben) {
        const extra = ben.doseMg ? `Max daily: ${ben.maxDailyMg.toFixed(1).replace('.0', '')} mg (up to ${ben.maxDosesPerDay} doses of ${ben.doseMg} mg in 24 hours)` : '';
        let doseText = '';
        if (ben.doseRange) {
          doseText = `Give <span class="cdcalc-dose-ml">${ben.doseRange}</span> ${ben.frequency}.`;
        } else if (ben.doseMg) {
          doseText = `Give <span class="cdcalc-dose-ml">${ben.volumeMl.toFixed(1)} mL</span> <span class="cdcalc-dose-mg">(${ben.doseMg} mg)</span> ${ben.frequency}.`;
        } else {
          doseText = `<strong>${ben.message}</strong>`;
        }
        htmlOutput += renderCard('Diphenhydramine (Benadryl)', ben.formulation, doseText, !ben.doseMg, 'alternative', 'Alternative H1', ben.warning, null, ben.globalWarning, extra);
      }
      
      const chl = getChlorpheniramineDose(ageMonths, weightKg);
      if (chl) {
        const extra = chl.doseMg ? `Max daily: ${chl.maxDailyMg} mg` : '';
        const doseText = chl.doseMg ? `Give <span class="cdcalc-dose-ml">${chl.volumeMl ? chl.volumeMl.toFixed(1) + ' mL' : chl.doseMg + ' mg'}</span> <span class="cdcalc-dose-mg">(${chl.doseMg} mg)</span> ${chl.frequency}.` : `<strong>${chl.message}</strong>`;
        htmlOutput += renderCard('Chlorpheniramine (Chlor-Trimeton)', chl.formulation, doseText, !chl.doseMg, 'alternative', 'Alternative H1', chl.warning, null, chl.globalWarning, extra);
      }
      
    } else if (severity === 'moderate') {
      htmlOutput += `<div class="cdcalc-result-section-title">✅ Recommended: 2nd-Generation Antihistamine (choose one)</div>`;
      
      const cet = getCetirizineDose(ageMonths, weightKg);
      if (cet) {
        const extra = cet.doseMg ? `Max daily: ${cet.maxDailyMg} mg` : '';
        const doseText = cet.doseMg ? `Give <span class="cdcalc-dose-ml">${cet.volumeMl.toFixed(1)} mL</span> <span class="cdcalc-dose-mg">(${cet.doseMg} mg)</span> ${cet.frequency}.` : `<strong>${cet.message}</strong>${cet.action ? ' ' + cet.action : ''}`;
        htmlOutput += renderCard('Cetirizine (Zyrtec)', cet.formulation, doseText, !cet.doseMg, 'preferred', 'Preferred', cet.warning, null, null, extra);
      }
      
      const lor = getLoratadineDose(ageMonths, weightKg);
      if (lor) {
        const extra = lor.doseMg ? `Max daily: ${lor.maxDailyMg} mg` : '';
        const doseText = lor.doseMg ? `Give <span class="cdcalc-dose-ml">${lor.volumeMl.toFixed(1)} mL</span> <span class="cdcalc-dose-mg">(${lor.doseMg} mg)</span> ${lor.frequency}.` : `<strong>${lor.message}</strong>`;
        htmlOutput += renderCard('Loratadine (Claritin)', lor.formulation, doseText, !lor.doseMg, 'preferred', 'Preferred', lor.warning, null, null, extra);
      }
      
      const fex = getFexofenadineDose(ageMonths, weightKg);
      if (fex) {
        const extra = fex.maxDailyMg ? `Max daily: ${fex.maxDailyMg} mg` : '';
        let doseText = '';
        if (fex.doseMgOption1) {
          doseText = `Give <span class="cdcalc-dose-ml">${fex.doseMgOption1} mg</span> ${fex.frequencyOption1} <strong>OR</strong> <span class="cdcalc-dose-ml">${fex.doseMgOption2} mg</span> ${fex.frequencyOption2}.`;
        } else if (fex.doseMg) {
          doseText = `Give <span class="cdcalc-dose-ml">${fex.volumeMl.toFixed(1)} mL</span> <span class="cdcalc-dose-mg">(${fex.doseMg} mg)</span> ${fex.frequency}.`;
        } else {
          doseText = `<strong>${fex.message}</strong>`;
        }
        htmlOutput += renderCard('Fexofenadine (Allegra)', fex.formulation, doseText, !(fex.doseMg || fex.doseMgOption1), 'preferred', 'Preferred', fex.warning, fex.special, null, extra);
      }
      
      const lev = getLevocetirizineDose(ageMonths, weightKg);
      if (lev) {
        const extra = lev.doseMg ? `Max daily: ${lev.maxDailyMg} mg` : '';
        const doseText = lev.doseMg ? `Give <span class="cdcalc-dose-ml">${lev.volumeMl.toFixed(1)} mL</span> <span class="cdcalc-dose-mg">(${lev.doseMg} mg)</span> ${lev.frequency}.` : `<strong>${lev.message}</strong>`;
        htmlOutput += renderCard('Levocetirizine (Xyzal)', lev.formulation, doseText, !lev.doseMg, 'preferred', 'Preferred', lev.warning, null, null, extra);
      }
      
      htmlOutput += `<div class="cdcalc-result-section-title">➕ Consider Adding: H2 Blocker</div>`;
      
      const fam = getFamotidineDose(ageMonths, weightKg);
      if (fam) {
        const extra = fam.maxDailyMg ? `Max daily: ${fam.maxDailyMg} mg` : '';
        const doseText = fam.doseMg ? `Give <span class="cdcalc-dose-ml">${fam.doseMg} mg</span> ${fam.frequency}.` : fam.doseRange ? `Give <span class="cdcalc-dose-ml">${fam.doseRange}</span> ${fam.frequency}.` : `<strong>${fam.message}</strong>`;
        htmlOutput += renderCard('Famotidine (Pepcid)', fam.formulation, doseText, !(fam.doseMg || fam.doseRange), 'adjunct', 'Adjunct H2', fam.warning, null, null, extra);
      }
      
      htmlOutput += `<div class="cdcalc-result-section-title">⚠️ Alternative H1 (if 2nd-gen unavailable)</div>`;
      
      const ben = getDiphenhydramineDose(ageMonths, weightKg);
      if (ben) {
        const extra = ben.doseMg ? `Max daily: ${ben.maxDailyMg.toFixed(1).replace('.0', '')} mg (up to ${ben.maxDosesPerDay} doses of ${ben.doseMg} mg in 24 hours)` : '';
        let doseText = '';
        if (ben.doseRange) {
          doseText = `Give <span class="cdcalc-dose-ml">${ben.doseRange}</span> ${ben.frequency}.`;
        } else if (ben.doseMg) {
          doseText = `Give <span class="cdcalc-dose-ml">${ben.volumeMl.toFixed(1)} mL</span> <span class="cdcalc-dose-mg">(${ben.doseMg} mg)</span> ${ben.frequency}.`;
        } else {
          doseText = `<strong>${ben.message}</strong>`;
        }
        htmlOutput += renderCard('Diphenhydramine (Benadryl)', ben.formulation, doseText, !ben.doseMg, 'alternative', 'Alternative H1', ben.warning, null, ben.globalWarning, extra);
      }
      
      const chl = getChlorpheniramineDose(ageMonths, weightKg);
      if (chl) {
        const extra = chl.doseMg ? `Max daily: ${chl.maxDailyMg} mg` : '';
        const doseText = chl.doseMg ? `Give <span class="cdcalc-dose-ml">${chl.volumeMl ? chl.volumeMl.toFixed(1) + ' mL' : chl.doseMg + ' mg'}</span> <span class="cdcalc-dose-mg">(${chl.doseMg} mg)</span> ${chl.frequency}.` : `<strong>${chl.message}</strong>`;
        htmlOutput += renderCard('Chlorpheniramine (Chlor-Trimeton)', chl.formulation, doseText, !chl.doseMg, 'alternative', 'Alternative H1', chl.warning, null, chl.globalWarning, extra);
      }
      
      htmlOutput += `
        <div class="cdcalc-warning cdcalc-warning--red" style="margin-top: 16px; padding: 14px;">
          <strong>🔴 Monitor closely.</strong> If swelling involves lips, tongue, or throat, or if breathing difficulties develop, treat as <strong>SEVERE</strong> immediately.
        </div>
      `;
      
    } else if (severity === 'severe') {
      htmlOutput += `<div class="cdcalc-result-section-title">🚨 FIRST: EPINEPHRINE — Give IMMEDIATELY</div>`;
      
      const epi = getEpinephrineDose(ageMonths, weightKg);
      htmlOutput += renderEpinephrineCard(epi);
      
      htmlOutput += `
        <div class="cdcalc-warning cdcalc-warning--red" style="margin-top: 14px; padding: 14px; font-size: 1.1rem; border-width: 4px;">
          <strong>📞 CALL 911 IMMEDIATELY</strong><br/>
          Any use of epinephrine requires emergency department evaluation. Call 911 after administering the injection.
        </div>
      `;
      
      htmlOutput += `<div class="cdcalc-result-section-title">➕ After Epinephrine: Antihistamine</div>`;
      
      const cet = getCetirizineDose(ageMonths, weightKg);
      if (cet) {
        const extra = cet.doseMg ? `Max daily: ${cet.maxDailyMg} mg` : '';
        const doseText = cet.doseMg ? `Give <span class="cdcalc-dose-ml">${cet.volumeMl.toFixed(1)} mL</span> <span class="cdcalc-dose-mg">(${cet.doseMg} mg)</span> ${cet.frequency}.` : `<strong>${cet.message}</strong>${cet.action ? ' ' + cet.action : ''}`;
        htmlOutput += renderCard('Cetirizine (Zyrtec) - Preferred', cet.formulation, doseText, !cet.doseMg, 'preferred', 'Preferred Post-Epi', cet.warning, null, null, extra);
      }
      
      const ben = getDiphenhydramineDose(ageMonths, weightKg);
      if (ben) {
        const extra = ben.doseMg ? `Max daily: ${ben.maxDailyMg.toFixed(1).replace('.0', '')} mg (up to ${ben.maxDosesPerDay} doses of ${ben.doseMg} mg in 24 hours)` : '';
        let doseText = '';
        if (ben.doseRange) {
          doseText = `Give <span class="cdcalc-dose-ml">${ben.doseRange}</span> ${ben.frequency}.`;
        } else if (ben.doseMg) {
          doseText = `Give <span class="cdcalc-dose-ml">${ben.volumeMl.toFixed(1)} mL</span> <span class="cdcalc-dose-mg">(${ben.doseMg} mg)</span> ${ben.frequency}.`;
        } else {
          doseText = `<strong>${ben.message}</strong>`;
        }
        htmlOutput += renderCard('Diphenhydramine (Benadryl) - Alternative', ben.formulation, doseText, !ben.doseMg, 'alternative', 'Alternative Post-Epi', ben.warning, null, ben.globalWarning, extra);
      }
      
      htmlOutput += `<div class="cdcalc-result-section-title">➕ Adjunctive (physician-directed)</div>`;
      
      const fam = getFamotidineDose(ageMonths, weightKg);
      if (fam) {
        const extra = fam.maxDailyMg ? `Max daily: ${fam.maxDailyMg} mg` : '';
        const doseText = fam.doseMg ? `Give <span class="cdcalc-dose-ml">${fam.doseMg} mg</span> ${fam.frequency}.` : fam.doseRange ? `Give <span class="cdcalc-dose-ml">${fam.doseRange}</span> ${fam.frequency}.` : `<strong>${fam.message}</strong>`;
        htmlOutput += renderCard('Famotidine (Pepcid)', fam.formulation, doseText, !(fam.doseMg || fam.doseRange), 'adjunct', 'Adjunct H2', fam.warning, null, null, extra);
      }
      
      const pred = getPrednisoloneDose(ageMonths, weightKg);
      if (pred) {
        const extra = pred.doseRange ? `Duration: ${pred.duration} | Max daily: ${pred.maxDailyMg} mg` : '';
        const doseText = pred.doseRange ? `Give <span class="cdcalc-dose-ml">${pred.doseRange}</span> as directed by physician.` : `<strong>${pred.message}</strong>`;
        htmlOutput += renderCard('Prednisolone / Prednisone', pred.formulation, doseText, !pred.doseRange, 'prescription', 'Rx Corticosteroid', pred.warning, null, pred.globalWarning, extra);
      }
    }

    resultBlocks.push(`<div class="cdcalc-result-group">${htmlOutput}</div>`);
    elements.results.innerHTML = resultBlocks.join('');
    notifyResultsRendered();

    trackCalculatorEvent('calculate_dose', {
      age_group: ageGroup,
      exact_age_months: ageMonths,
      weight_unit: weightUnit,
      severity_tier: severity,
    });
  }

  function updateForm(elements, strings) {
    if (!elements || !elements.ageSelect || !elements.weightInput || !elements.unitSelect || !elements.message || !elements.submitButton || !elements.results || !elements.severitySelect) {
      return;
    }

    const age = elements.ageSelect.value;
    elements.ageButtons.forEach((button) => {
      const isSelected = button.dataset.age === age;
      button.setAttribute('aria-pressed', String(isSelected));
      button.classList.toggle('is-active', isSelected);
    });

    const severity = elements.severitySelect.value;
    elements.severityButtons.forEach((button) => {
      const isSelected = button.dataset.severity === severity;
      button.setAttribute('aria-pressed', String(isSelected));
      button.classList.toggle('is-active', isSelected);
    });

    const unit = elements.unitSelect.value || 'lbs';
    elements.unitButtons.forEach((button) => {
      const isSelected = button.dataset.unit === unit;
      button.setAttribute('aria-pressed', String(isSelected));
      button.classList.toggle('is-active', isSelected);
    });

    populateExactAgeOptions(elements, age);

    clearResults(elements);
    elements.message.hidden = true;
    elements.message.innerHTML = '';
    elements.message.style.display = 'none';
    elements.submitButton.disabled = false;
    elements.weightInput.disabled = false;
    elements.unitSelect.disabled = false;
    clearButtonAttention(elements.submitButton);
  }

  function bindEvents(elements, strings, onResultsRendered) {
    if (!elements || !elements.form) {
      return () => {};
    }

    const refreshGuidanceAnimations = () => {
      refreshSubmitAnimation();
      refreshWeightAnimation();
    };

    const shouldAnimateSubmit = () => {
      if (!elements || !elements.weightInput || !elements.ageSelect || !elements.exactAgeSelect || !elements.severitySelect) {
        return false;
      }
      const ageGroup = elements.ageSelect.value;
      if (!ageGroup) return false;
      const exactAge = elements.exactAgeSelect.value;
      if (exactAge === '') return false;
      const weightValue = parseFloat(elements.weightInput.value);
      if (Number.isNaN(weightValue) || weightValue <= 0) {
        return false;
      }
      const severity = elements.severitySelect.value;
      if (!severity) return false;
      return true;
    };

    const shouldAnimateWeightInput = () => {
      if (!elements || !elements.weightInput || !elements.ageSelect || elements.weightInput.disabled) {
        return false;
      }
      const ageValue = elements.ageSelect.value;
      if (!ageValue) {
        return false;
      }
      if (document.activeElement === elements.weightInput) {
        return false;
      }
      const weightValue = typeof elements.weightInput.value === 'string' ? elements.weightInput.value.trim() : '';
      return weightValue === '';
    };

    const refreshSubmitAnimation = () => {
      if (!elements || !elements.submitButton) {
        return;
      }
      if (shouldAnimateSubmit()) {
        triggerButtonAttention(elements.submitButton);
      } else {
        clearButtonAttention(elements.submitButton);
      }
    };

    const refreshWeightAnimation = () => {
      if (!elements || !elements.weightInput) {
        return;
      }
      if (shouldAnimateWeightInput()) {
        if (!elements.weightInput.classList.contains(INPUT_ATTENTION_CLASS)) {
          elements.weightInput.classList.add(INPUT_ATTENTION_CLASS);
        }
      } else {
        elements.weightInput.classList.remove(INPUT_ATTENTION_CLASS);
      }
    };

    const onAgeButtonClick = (event) => {
      const button = event.currentTarget;
      const ageValue = button.dataset.age || '';
      elements.ageSelect.value = ageValue;
      updateForm(elements, strings);
      refreshGuidanceAnimations();
      if (typeof onResultsRendered === 'function') {
        onResultsRendered();
      }
    };

    elements.ageButtons.forEach((button) => {
      button.addEventListener('click', onAgeButtonClick);
    });

    const onSeverityButtonClick = (event) => {
      const button = event.currentTarget;
      const severityValue = button.dataset.severity || '';
      elements.severitySelect.value = severityValue;
      updateForm(elements, strings);
      refreshGuidanceAnimations();
      if (typeof onResultsRendered === 'function') {
        onResultsRendered();
      }
    };

    elements.severityButtons.forEach((button) => {
      button.addEventListener('click', onSeverityButtonClick);
    });

    const onUnitButtonClick = (event) => {
      const button = event.currentTarget;
      const unitValue = button.dataset.unit || 'lbs';
      elements.unitSelect.value = unitValue;
      updateForm(elements, strings);
      refreshGuidanceAnimations();
      if (typeof onResultsRendered === 'function') {
        onResultsRendered();
      }
    };

    elements.unitButtons.forEach((button) => {
      button.addEventListener('click', onUnitButtonClick);
    });

    const onAgeSelectChange = () => {
      updateForm(elements, strings);
      refreshGuidanceAnimations();
      if (typeof onResultsRendered === 'function') {
        onResultsRendered();
      }
    };

    const onExactAgeSelectChange = () => {
      refreshGuidanceAnimations();
      clearResults(elements);
      if (typeof onResultsRendered === 'function') {
        onResultsRendered();
      }
    };

    const onSeveritySelectChange = () => {
      updateForm(elements, strings);
      refreshGuidanceAnimations();
      if (typeof onResultsRendered === 'function') {
        onResultsRendered();
      }
    };

    const onUnitSelectChange = () => {
      updateForm(elements, strings);
      refreshGuidanceAnimations();
      if (typeof onResultsRendered === 'function') {
        onResultsRendered();
      }
    };

    const onWeightInput = () => {
      refreshGuidanceAnimations();
    };

    const onWeightFocusChange = () => {
      refreshWeightAnimation();
    };

    elements.ageSelect.addEventListener('change', onAgeSelectChange);
    elements.exactAgeSelect.addEventListener('change', onExactAgeSelectChange);
    elements.severitySelect.addEventListener('change', onSeveritySelectChange);
    elements.unitSelect.addEventListener('change', onUnitSelectChange);
    elements.weightInput.addEventListener('input', onWeightInput);
    elements.weightInput.addEventListener('change', onWeightInput);
    elements.weightInput.addEventListener('focus', onWeightFocusChange);
    elements.weightInput.addEventListener('blur', onWeightFocusChange);

    const onSubmit = (event) => {
      event.preventDefault();
      clearButtonAttention(elements.submitButton);
      calculateDose(elements, strings, onResultsRendered);
    };

    elements.form.addEventListener('submit', onSubmit);

    updateForm(elements, strings);
    refreshGuidanceAnimations();
    if (typeof onResultsRendered === 'function') {
      onResultsRendered();
    }

    return () => {
      elements.ageButtons.forEach((button) => {
        button.removeEventListener('click', onAgeButtonClick);
      });
      elements.severityButtons.forEach((button) => {
        button.removeEventListener('click', onSeverityButtonClick);
      });
      elements.unitButtons.forEach((button) => {
        button.removeEventListener('click', onUnitButtonClick);
      });
      elements.ageSelect.removeEventListener('change', onAgeSelectChange);
      elements.exactAgeSelect.removeEventListener('change', onExactAgeSelectChange);
      elements.severitySelect.removeEventListener('change', onSeveritySelectChange);
      elements.unitSelect.removeEventListener('change', onUnitSelectChange);
      elements.form.removeEventListener('submit', onSubmit);
      elements.weightInput.removeEventListener('input', onWeightInput);
      elements.weightInput.removeEventListener('change', onWeightInput);
      elements.weightInput.removeEventListener('focus', onWeightFocusChange);
      elements.weightInput.removeEventListener('blur', onWeightFocusChange);
    };
  }

  function createCalculator(host, options = {}) {
    const strings = deepMerge(JSON.parse(JSON.stringify(DEFAULT_STRINGS)), options.strings || {});
    const idSuffix = options.id || Math.random().toString(36).slice(2, 9);
    const ids = {
      title: `cdcalc-title-${idSuffix}`,
      weight: `cdcalc-weight-${idSuffix}`,
      exactAge: `cdcalc-exact-age-${idSuffix}`,
    };

    const logomarkSrc = Object.prototype.hasOwnProperty.call(options, 'logomarkSrc')
      ? options.logomarkSrc
      : '/images/logomark-WC.png';
    host.innerHTML = buildMarkup(strings, ids, logomarkSrc);
    const styleElement = injectStyles(host, options);

    const card = host.querySelector('[data-calculator-card]');
    const elements = getElements(card);
    const teardown = bindEvents(elements, strings, () => {});

    return {
      destroy() {
        teardown();
        if (styleElement && styleElement.parentNode) {
          styleElement.parentNode.removeChild(styleElement);
        }
        host.innerHTML = '';
      },
      getStrings() {
        return strings;
      },
    };
  }

  const api = {
    mount(target, options = {}) {
      const host = typeof target === 'string' ? document.querySelector(target) : target;
      if (!host) {
        throw new Error('CloseDoseAllergyCalculator: mount target not found.');
      }
      return createCalculator(host, options);
    },
  };

  global.CloseDoseAllergyCalculator = api;
})(window);
