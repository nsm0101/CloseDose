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
      calculate: 'Calculate',
      calculateStep: 'Step 3: Calculate!',
    },
    units: {
      lbs: 'lbs',
      kg: 'kg',
    },
    warnings: {
      ageRequiredTitle: 'Age required',
      ageRequiredBody: 'Please select an age group to continue.',
      weightRequiredTitle: 'Weight required',
      weightRequiredBody: 'Please enter a valid weight to calculate dosing.',
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

    @media (max-width: 640px) {
      .cdcalc-segmented-buttons {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .cdcalc-age-option {
        min-height: 80px;
        padding: 8px 6px;
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
    const stepCalculate = renderStepTitle(form.calculateStep || '');

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
    };
  }

  function clearResults(elements) {
    if (elements && elements.results) {
      elements.results.innerHTML = '';
    }
  }

  function calculateDose(elements, strings, onResultsRendered) {
    if (!elements || !elements.ageSelect || !elements.weightInput || !elements.unitSelect || !elements.results) {
      return;
    }

    const notifyResultsRendered = () => {
      if (typeof onResultsRendered === 'function') {
        onResultsRendered();
      }
    };

    const age = elements.ageSelect.value;
    const gate = resolveAgeGate(age);
    const weightInput = parseFloat(elements.weightInput.value);
    const weightUnit = elements.unitSelect.value;

    clearResults(elements);
    notifyResultsRendered();

    if (!age) {
      elements.results.innerHTML = renderWarning(strings, {
        title: strings.warnings.ageRequiredTitle,
        body: strings.warnings.ageRequiredBody,
      });
      notifyResultsRendered();
      return;
    }

    if (gate === 'clinician') {
      // These show messages directly via elements.message in updateForm
      trackCalculatorEvent('calculate_dose', { age_group: age, weight_unit: weightUnit, result_type: gate });
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

    const weightKg = weightUnit === 'lbs' ? weightInput / 2.20462 : weightInput;
    const weightLbs = weightUnit === 'lbs' ? weightInput : weightInput * 2.20462;

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

    const group = [];

    if (gate === 'toddler') {
      // Cetirizine
      group.push(`
        <article class="cdcalc-result-card">
          <h3>Cetirizine (Zyrtec®) <span style="font-size:0.85rem; font-weight:normal; color:#597b7a; display:block; margin-top:2px;">Common liquid: 1 mg / mL</span></h3>
          <p>Give <span class="cdcalc-dose-ml">2.5 mL</span><span class="cdcalc-dose-mg">(2.5 mg)</span> once daily as needed.</p>
          <div class="cdcalc-warning cdcalc-warning--teal" style="margin-top: 8px; padding: 10px; font-size: 0.88rem;">
            May cause sleepiness in some children. Do not combine with another oral antihistamine unless directed. Ask your clinician before increasing.
          </div>
        </article>
      `);
      // Loratadine
      group.push(`
        <article class="cdcalc-result-card">
          <h3>Loratadine (Claritin®) <span style="font-size:0.85rem; font-weight:normal; color:#597b7a; display:block; margin-top:2px;">Common liquid: 5 mg / 5 mL</span></h3>
          <p>Give <span class="cdcalc-dose-ml">5.0 mL</span><span class="cdcalc-dose-mg">(5 mg)</span> once daily as needed.</p>
          <div class="cdcalc-warning cdcalc-warning--teal" style="margin-top: 8px; padding: 10px; font-size: 0.88rem;">
            Usually less sedating than older antihistamines. Do not combine with another oral antihistamine unless directed.
          </div>
        </article>
      `);
      // Fexofenadine
      group.push(`
        <article class="cdcalc-result-card">
          <h3>Fexofenadine (Allegra®) <span style="font-size:0.85rem; font-weight:normal; color:#597b7a; display:block; margin-top:2px;">Common liquid: 30 mg / 5 mL</span></h3>
          <p>Give <span class="cdcalc-dose-ml">5.0 mL</span><span class="cdcalc-dose-mg">(30 mg)</span> twice daily as needed.</p>
          <div class="cdcalc-warning cdcalc-warning--teal" style="margin-top: 8px; padding: 10px; font-size: 0.88rem;">
            Avoid taking with fruit juice because it can reduce absorption.
          </div>
        </article>
      `);
      // Benadryl
      group.push(`
        <article class="cdcalc-result-card">
          <h3>Diphenhydramine (Benadryl®) <span style="font-size:0.85rem; font-weight:normal; color:#597b7a; display:block; margin-top:2px;">Common liquid: 12.5 mg / 5 mL</span></h3>
          <div class="cdcalc-warning cdcalc-warning--orange" style="margin-top: 4px; padding: 12px; font-size: 0.95rem;">
            <strong>${strings.warnings.benadrylAgeLimit}</strong>
          </div>
        </article>
      `);
    } else if (gate === 'pediatric' || gate === 'adolescent') {
      const isPediatric = gate === 'pediatric';
      const maxBenadrylMg = isPediatric ? 25 : 50;

      // Cetirizine
      group.push(`
        <article class="cdcalc-result-card">
          <h3>Cetirizine (Zyrtec®) <span style="font-size:0.85rem; font-weight:normal; color:#597b7a; display:block; margin-top:2px;">Common liquid: 1 mg / mL</span></h3>
          <p>Give <span class="cdcalc-dose-ml">5.0–10.0 mL</span><span class="cdcalc-dose-mg">(5–10 mg)</span> once daily as needed.</p>
          <div class="cdcalc-warning cdcalc-warning--teal" style="margin-top: 8px; padding: 10px; font-size: 0.88rem;">
            May cause sleepiness in some children. Do not combine with another oral antihistamine unless directed.
          </div>
        </article>
      `);
      // Loratadine
      group.push(`
        <article class="cdcalc-result-card">
          <h3>Loratadine (Claritin®) <span style="font-size:0.85rem; font-weight:normal; color:#597b7a; display:block; margin-top:2px;">Common liquid: 5 mg / 5 mL</span></h3>
          <p>Give <span class="cdcalc-dose-ml">10.0 mL</span><span class="cdcalc-dose-mg">(10 mg)</span> once daily as needed.</p>
          <div class="cdcalc-warning cdcalc-warning--teal" style="margin-top: 8px; padding: 10px; font-size: 0.88rem;">
            Usually less sedating than older antihistamines. Do not combine with another oral antihistamine unless directed.
          </div>
        </article>
      `);
      // Fexofenadine
      if (isPediatric) {
        group.push(`
          <article class="cdcalc-result-card">
            <h3>Fexofenadine (Allegra®) <span style="font-size:0.85rem; font-weight:normal; color:#597b7a; display:block; margin-top:2px;">Common liquid: 30 mg / 5 mL</span></h3>
            <p>Give <span class="cdcalc-dose-ml">5.0 mL</span><span class="cdcalc-dose-mg">(30 mg)</span> twice daily as needed.</p>
            <div class="cdcalc-warning cdcalc-warning--teal" style="margin-top: 8px; padding: 10px; font-size: 0.88rem;">
              Avoid taking with fruit juice because it can reduce absorption.
            </div>
          </article>
        `);
      } else {
        group.push(`
          <article class="cdcalc-result-card">
            <h3>Fexofenadine (Allegra®) <span style="font-size:0.85rem; font-weight:normal; color:#597b7a; display:block; margin-top:2px;">Common liquid: 30 mg / 5 mL</span></h3>
            <p>Give <span class="cdcalc-dose-ml">10.0 mL</span><span class="cdcalc-dose-mg">(60 mg)</span> twice daily OR 180 mg once daily (using adult form) as needed.</p>
            <div class="cdcalc-warning cdcalc-warning--teal" style="margin-top: 8px; padding: 10px; font-size: 0.88rem;">
              Avoid taking with fruit juice because it can reduce absorption.
            </div>
          </article>
        `);
      }

      // Benadryl
      const benadrylMgCalculated = 1.0 * weightKg;
      const benadrylMg = Math.min(maxBenadrylMg, Math.round(benadrylMgCalculated));
      const benadrylMl = (benadrylMg / 12.5) * 5;
      const benadrylCapped = benadrylMg < benadrylMgCalculated;

      group.push(`
        <article class="cdcalc-result-card">
          <h3>Diphenhydramine (Benadryl®) <span style="font-size:0.85rem; font-weight:normal; color:#597b7a; display:block; margin-top:2px;">Common liquid: 12.5 mg / 5 mL</span></h3>
          <p>Give <span class="cdcalc-dose-ml">${benadrylMl.toFixed(1).replace('.0', '')} mL</span><span class="cdcalc-dose-mg">(${benadrylMg.toFixed(0)} mg)</span> every 6 hours as needed.</p>
          <div class="cdcalc-warning cdcalc-warning--teal" style="margin-top: 8px; padding: 10px; font-size: 0.88rem;">
            ${strings.warnings.benadrylDrowsiness} Allow at least 6 hours between doses. Do not exceed 4 doses in 24 hours.
          </div>
          ${
            benadrylCapped
              ? renderWarning(strings, {
                  body: `Maximum single dose for this age group is ${maxBenadrylMg} mg every 6 hours.`,
                  tone: 'orange',
                })
              : ''
          }
          ${
            benadrylCapped
              ? renderWarning(strings, {
                  title: strings.warnings.maxDoseReachedTitle,
                  body: strings.warnings.maxDoseReachedBody,
                  tone: 'orange',
                })
              : ''
          }
        </article>
      `);
    }

    // General safety warning card
    group.push(
      renderWarning(strings, {
        title: strings.warnings.allergySafetyTitle,
        body: strings.warnings.allergySafetyBody,
        tone: 'teal',
      })
    );

    resultBlocks.push(`<div class="cdcalc-result-group">${group.join('')}</div>`);
    elements.results.innerHTML = resultBlocks.join('');
    notifyResultsRendered();

    trackCalculatorEvent('calculate_dose', {
      age_group: age,
      weight_unit: weightUnit,
      result_type: gate,
    });
  }

  function updateForm(elements, strings) {
    if (!elements || !elements.ageSelect || !elements.weightInput || !elements.unitSelect || !elements.message || !elements.submitButton || !elements.results) {
      return;
    }

    const age = elements.ageSelect.value;
    const gate = resolveAgeGate(age);

    elements.ageButtons.forEach((button) => {
      const isSelected = button.dataset.age === age;
      button.setAttribute('aria-pressed', String(isSelected));
      button.classList.toggle('is-active', isSelected);
    });

    const unit = elements.unitSelect.value || 'lbs';
    elements.unitButtons.forEach((button) => {
      const isSelected = button.dataset.unit === unit;
      button.setAttribute('aria-pressed', String(isSelected));
      button.classList.toggle('is-active', isSelected);
    });

    clearResults(elements);
    elements.message.hidden = true;
    elements.message.innerHTML = '';
    elements.message.style.display = 'none';
    elements.submitButton.disabled = false;
    elements.weightInput.disabled = false;
    elements.unitSelect.disabled = false;
    clearButtonAttention(elements.submitButton);

    if (gate === 'clinician') {
      elements.message.hidden = false;
      elements.message.style.display = 'block';
      elements.message.innerHTML = strings.warnings.underTwoClinician;
      elements.submitButton.disabled = true;
      elements.weightInput.disabled = true;
      elements.unitSelect.disabled = true;
    }
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
      if (!elements || !elements.weightInput || !elements.ageSelect) {
        return false;
      }
      const weightValue = parseFloat(elements.weightInput.value);
      if (Number.isNaN(weightValue) || weightValue <= 0) {
        return false;
      }
      const gate = resolveAgeGate(elements.ageSelect.value);
      return Boolean(gate && gate !== 'clinician');
    };

    const shouldAnimateWeightInput = () => {
      if (!elements || !elements.weightInput || !elements.ageSelect || elements.weightInput.disabled) {
        return false;
      }
      const ageValue = elements.ageSelect.value;
      const gate = resolveAgeGate(ageValue);
      if (!gate || gate === 'clinician') {
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
      elements.unitButtons.forEach((button) => {
        button.removeEventListener('click', onUnitButtonClick);
      });
      elements.ageSelect.removeEventListener('change', onAgeSelectChange);
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
