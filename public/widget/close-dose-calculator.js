(function (global) {
  if (global.CloseDoseCalculator && typeof global.CloseDoseCalculator.mount === 'function') {
    return;
  }

  const DEFAULT_STRINGS = {
    title: 'Fever/Pain Medication Dosing',
    header: {},
    form: {
      ageLabel: 'Step 1: Tap an age group',
      ageGroupAria: 'Select patient age',
      agePrompt: '',
      ageOptions: {
        '0-2': {
          primary: '0 Months',
          connector: 'TO',
          secondary: '2 Months',
          align: 'center',
          accessible: '0 to 2 Months',
        },
        '2-6': {
          primary: '2 Months',
          connector: 'TO',
          secondary: '6 Months',
          align: 'center',
          accessible: '2 to 6 Months',
        },
        '6-11': {
          primary: '6 Months',
          connector: 'TO',
          secondary: '11 Years',
          align: 'center',
          accessible: '6 Months to 11 Years',
        },
        '12+': {
          primary: '12 Years',
          connector: '+',
          secondary: '',
          align: 'center',
          accessible: '12 Years and older',
        },
        '6-24': '6-24 Months',
        '2y+': '2+ Years',
        '6+': '6+ Months',
      },
      ageSelectLabel: 'Select age',
      infantCriticalMessage:
        '<strong>Seek immediate medical care.</strong> If a child less than 60 days old has a fever it is a medical emergency. Please contact your pediatrician or seek care with a healthcare provider immediately.',
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
      maxDoseReachedBody:
        'Weight-based dose was limited to this maximum. Consider discussing dosing with your pediatrician.',
      doseSpacingTitle: 'Dose spacing reminder',
      doseSpacingBody:
        'Never exceed {{acetaminophenMax}} mg of acetaminophen or {{ibuprofenMax}} mg of ibuprofen in a single dose, and allow at least 6 hours between doses.',
      doseSpacingGeneralBody:
        'Allow at least 6 hours between doses of acetaminophen or ibuprofen. Follow the product instructions for maximum amounts.',
      infantIbuprofen:
        '<em>Ibuprofen is not recommended for infants under six months. Consult your pediatrician before using ibuprofen for this age group.</em>',
      acetaminophenMax:
        'Maximum single dose for this age group is {{max}} mg of acetaminophen every 6 hours.',
      ibuprofenMax:
        'Maximum single dose for this age group is {{max}} mg of ibuprofen every 6 hours.',
      ibuprofenStrengthInfo:
        "<strong>Heads up:</strong> Children's (100 mg / 5 mL) and Infant's (50 mg / 1.25 mL) ibuprofen are <em>different</em> concentrations. Check the bottle before measuring.",
    },
    results: {
      patientWeightLabel: 'Patient weight',
      patientWeightValue: '{{kg}} kg ({{lbs}} lbs)',
      acetaminophenInfantTitle: 'Acetaminophen (160 mg / 5 mL)',
      acetaminophenInfantBody:
        'Give <span class="cdcalc-dose-ml">{{ml}} mL</span><span class="cdcalc-dose-mg">({{mg}} mg)</span> every 4 hours as needed for fever/pain.',
      acetaminophenOlderTitle: 'Acetaminophen (160 mg / 5 mL)',
      acetaminophenOlderBody:
        'Give <span class="cdcalc-dose-ml">{{ml}} mL</span><span class="cdcalc-dose-mg">({{mg}} mg)</span> every 6 hours as needed for fever/pain.',
      ibuprofenTitle: 'Ibuprofen (oral)',
      ibuprofenConcIf: 'If your bottle says',
      ibuprofenConc100: '100 mg / 5 mL',
      ibuprofenConc50: '50 mg / 1.25 mL',
      ibuprofenChildrenSummary: "Children's suspension \u2014 the most common bottle",
      ibuprofenInfantSummary: "Infants' concentrated drops",
      ibuprofenBody100:
        'Give <span class="cdcalc-dose-ml">{{ml}} mL</span><span class="cdcalc-dose-mg">({{mg}} mg)</span> every 6 hours as needed for fever/pain.',
      ibuprofenBody50:
        'Give <span class="cdcalc-dose-ml">{{ml}} mL</span><span class="cdcalc-dose-mg">({{mg}} mg)</span> every 6 hours as needed for fever/pain.',
    },
    accessibility: {
      resultsRegion: 'Dosing results',
    },
  };

  function createMiniProductBadge(options = {}) {
    const {
      title = '',
      subtitle = '',
      tone = '#cde8e3',
      glyph = '',
    } = options;

    const coerce = (value) => {
      if (typeof value === 'string') {
        return value;
      }
      if (value === null || value === undefined) {
        return '';
      }
      return String(value);
    };

    const escapeSvg = (value) =>
      coerce(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
        <defs>
          <linearGradient id="miniBadgeGradient" x1="50%" x2="50%" y1="0%" y2="100%">
            <stop offset="0%" stop-color="${tone}" stop-opacity="0.92" />
            <stop offset="100%" stop-color="${tone}" stop-opacity="1" />
          </linearGradient>
        </defs>
        <rect width="320" height="320" rx="48" fill="url(#miniBadgeGradient)" />
        <text x="50%" y="120" font-family="Nunito, Arial, sans-serif" font-size="76" text-anchor="middle" fill="#0f2c2a">${escapeSvg(
      glyph,
    )}</text>
        <text x="50%" y="188" font-family="Nunito, Arial, sans-serif" font-size="34" font-weight="700" text-anchor="middle" fill="#0f2c2a">${escapeSvg(
      title,
    )}</text>
        <text x="50%" y="232" font-family="Nunito, Arial, sans-serif" font-size="26" text-anchor="middle" fill="#0f2c2a">${escapeSvg(
      subtitle,
    )}</text>
      </svg>
    `;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
  }


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
      background: var(--cdcalc-bg, rgba(255, 255, 255, 0.92));
      border: 3px solid var(--cdcalc-border-color, #0f2c2a);
      border-radius: 26px;
      box-shadow: var(--cdcalc-shadow, 0 6px 0 rgba(15, 44, 42, 0.18));
      padding: clamp(20px, 3vw, 32px);
      max-width: 100%;
      margin: 0;
      color: var(--cdcalc-color, #0f2c2a);
      --cdcalc-gold: #ffe8a8;
    }

    .cdcalc-header {
      margin: calc(-1 * clamp(20px, 3vw, 32px));
      margin-bottom: 28px;
      padding: clamp(18px, 3.2vw, 28px) clamp(20px, 3vw, 32px);
      background: var(--cdcalc-header-bg, linear-gradient(135deg, #e9f6f2 0%, #cdeee6 100%));
      border-bottom: 3px solid var(--cdcalc-header-border-bottom, #0f2c2a);
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
      background: var(--ink-900, #0f2c2a);
      color: var(--white, #ffffff);
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
      color: var(--cdcalc-title-color, inherit);
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
      color: var(--cdcalc-group-title-color, inherit);
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
      background: var(--cdcalc-option-active-bg, #24a687);
      color: var(--white, #ffffff);
      border: 3px solid var(--cdcalc-border-color, #0f2c2a);
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
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 10px;
    }

    .cdcalc-age-option,
    .cdcalc-unit-option {
      appearance: none;
      border: 3px solid var(--cdcalc-option-border-color, #0f2c2a);
      border-radius: 16px;
      background: var(--cdcalc-option-bg, #ffffff);
      color: var(--cdcalc-option-color, #0f2c2a);
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
      background: var(--cdcalc-option-active-bg, #24a687);
      color: var(--white, #ffffff);
      box-shadow: inset 0 0 0 2px var(--cdcalc-border-color, #0f2c2a);
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
      outline: 3px solid var(--cdcalc-border-color, #0f2c2a);
      outline-offset: 3px;
    }

    .cdcalc-hello {
      margin: 0;
      font-weight: 700;
      color: var(--cdcalc-hello-color, #124643);
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
      border: 4px dashed var(--cdcalc-input-border-color, #0f2c2a);
      border-radius: 16px;
      padding: 16px 18px;
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--cdcalc-input-color, #0f2c2a);
      background: var(--cdcalc-input-bg, #ffffff);
      text-align: center;
      letter-spacing: 0.04em;
      transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
      appearance: textfield;
    }

    .cdcalc-input:focus,
    .cdcalc-input:focus-visible {
      outline: none;
      border-color: var(--cdcalc-input-focus-border-color, var(--cdcalc-gold, #ffe8a8));
      box-shadow: var(--cdcalc-input-focus-shadow, 0 0 0 8px rgba(255, 232, 168, 0.3));
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
      color: var(--cdcalc-step-callout-color, #0f2c2a);
    }

    .cdcalc-step-callout--step {
      justify-content: flex-start;
    }

    .cdcalc-button {
      appearance: none;
      border: 3px solid var(--cdcalc-border-color, #0f2c2a);
      border-radius: 999px;
      background: var(--cdcalc-option-active-bg, linear-gradient(135deg, #24a687 0%, #1f8f7b 70%));
      color: var(--white, #ffffff);
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
      background: var(--cdcalc-result-disabled-bg, #e2e8f0);
      color: var(--text-subtle, #64748b);
      cursor: not-allowed;
      box-shadow: none;
      border-color: var(--cdcalc-result-border-color, #cbd5d5);
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
        background: var(--cdcalc-option-active-bg, linear-gradient(135deg, #24a687 0%, #1f8f7b 70%));
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
        border-color: var(--cdcalc-border-color, #0f2c2a);
        box-shadow: 0 0 0 0 rgba(255, 232, 168, 0);
      }
      50% {
        transform: scale(1.02);
        border-color: var(--cdcalc-input-focus-border-color, var(--cdcalc-gold, #ffe8a8));
        box-shadow: var(--cdcalc-input-focus-shadow, 0 0 0 10px rgba(255, 232, 168, 0.35));
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
      border: 3px solid var(--cdcalc-warning-red-border, #d14343);
      background: var(--cdcalc-warning-red-bg, #fee2e2);
      padding: 16px;
      font-weight: 700;
      color: var(--cdcalc-warning-red-color, #7f1d1d);
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
      border: 3px solid var(--cdcalc-result-border-color, var(--cdcalc-border-color, #0f2c2a));
      border-radius: 18px;
      padding: 16px;
      background: var(--cdcalc-result-bg, rgba(255, 255, 255, 0.86));
      box-shadow: var(--cdcalc-result-shadow, inset 0 0 0 1px rgba(15, 44, 42, 0.12));
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .cdcalc-result-card--with-guide {
      position: relative;
      overflow: visible;
      z-index: 2;
      --cdcalc-guide-reveal-scroll: 0;
      --cdcalc-guide-hidden-extra: 0.28;
    }

    .cdcalc-result-card--with-guide[data-guide-peeking='true'] {
      --cdcalc-guide-hidden-extra: 0.08;
    }

    .cdcalc-guide-promo {
      margin-top: 12px;
      padding: 16px 18px;
      border-radius: 16px;
      border: 2px solid var(--cdcalc-guide-promo-border-color, rgba(36, 166, 135, 0.38));
      background: var(--cdcalc-guide-promo-bg, linear-gradient(
          150deg,
          rgba(228, 244, 240, calc(0.45 + var(--cdcalc-guide-reveal-scroll, 0) * 0.25)),
          rgba(255, 255, 255, 0.96)
        ));
      display: grid;
      gap: 10px;
      color: var(--cdcalc-guide-promo-color, #0f2c2a);
      box-shadow: var(--cdcalc-guide-promo-shadow, 0 12px 24px rgba(15, 44, 42, 0.12));
      position: relative;
      overflow: hidden;
      transition: box-shadow 0.3s ease, transform 0.3s ease;
    }

    .cdcalc-guide-promo::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0));
      opacity: calc(0.2 + var(--cdcalc-guide-reveal-scroll, 0) * 0.35);
      pointer-events: none;
    }

    .cdcalc-guide-promo > * {
      position: relative;
      z-index: 1;
    }

    .cdcalc-guide-promo__eyebrow {
      margin: 0;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--cdcalc-guide-promo-text-color, #124643);
    }

    .cdcalc-guide-promo__body {
      margin: 0;
      font-size: 0.92rem;
      line-height: 1.5;
    }

    .cdcalc-guide-promo__link {
      justify-self: start;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 999px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-size: 0.78rem;
      background: #0f2c2a;
      color: #fff;
      text-decoration: none;
      box-shadow: 0 6px 0 rgba(15, 44, 42, 0.35);
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }

    .cdcalc-guide-promo__link:focus-visible,
    .cdcalc-guide-promo__link:hover {
      outline: none;
      transform: translateY(-1px);
      box-shadow: 0 8px 0 rgba(15, 44, 42, 0.4);
      background: #124643;
    }

    .cdcalc-guide-promo__arrow {
      font-size: 1.2em;
      line-height: 1;
      transition: transform 0.2s ease, color 0.2s ease;
    }

    .cdcalc-guide-promo__link:hover .cdcalc-guide-promo__arrow,
    .cdcalc-guide-promo__link:focus-visible .cdcalc-guide-promo__arrow {
      transform: translateX(4px);
      color: #fef3c7;
    }

    .cdcalc-result-card--with-guide[data-guide-peeking='true'] .cdcalc-guide-promo {
      box-shadow: 0 18px 32px rgba(15, 44, 42, 0.18);
      transform: translateY(-2px);
    }

    .cdcalc-guide-promo--acetaminophen {
      border-color: rgba(225, 71, 71, 0.4);
      background: linear-gradient(
          150deg,
          rgba(247, 226, 226, calc(0.42 + var(--cdcalc-guide-reveal-scroll, 0) * 0.25)),
          rgba(255, 255, 255, 0.96)
        );
    }

    .cdcalc-guide-promo--acetaminophen .cdcalc-guide-promo__link {
      background: linear-gradient(135deg, #e14747, #9f1b1b);
      box-shadow: 0 6px 0 rgba(137, 26, 26, 0.45);
    }

    .cdcalc-guide-promo--acetaminophen .cdcalc-guide-promo__link:hover,
    .cdcalc-guide-promo--acetaminophen .cdcalc-guide-promo__link:focus-visible {
      background: linear-gradient(135deg, #f86b6b, #b82020);
      box-shadow: 0 8px 0 rgba(137, 26, 26, 0.5);
    }

    .cdcalc-guide-promo--ibuprofen {
      border-color: rgba(249, 115, 22, 0.38);
      background: linear-gradient(
          150deg,
          rgba(255, 236, 221, calc(0.42 + var(--cdcalc-guide-reveal-scroll, 0) * 0.25)),
          rgba(255, 255, 255, 0.96)
        );
    }

    .cdcalc-guide-promo--ibuprofen .cdcalc-guide-promo__link {
      background: linear-gradient(135deg, #f97316, #c2410c);
      box-shadow: 0 6px 0 rgba(161, 65, 12, 0.45);
    }

    .cdcalc-guide-promo--ibuprofen .cdcalc-guide-promo__link:hover,
    .cdcalc-guide-promo--ibuprofen .cdcalc-guide-promo__link:focus-visible {
      background: linear-gradient(135deg, #fb923c, #d35417);
      box-shadow: 0 8px 0 rgba(161, 65, 12, 0.5);
    }

    @media (max-width: 640px) {
      .cdcalc-guide-promo {
        margin-top: 10px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .cdcalc-guide-promo,
      .cdcalc-guide-promo__link {
        transition: none;
      }
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
      /* The pill keeps its gold ground in both themes, so its ink must not
         follow --cdcalc-result-title-color (white in dark mode -> 1.2:1 on
         gold). This is the number a caregiver actually measures; it gets its
         own token so a theme can never wash it out. */
      color: var(--cdcalc-dose-ml-color, var(--cdcalc-result-title-color, #0f2c2a));
      background: var(--cdcalc-dose-ml-bg, var(--cdcalc-gold, #ffe8a8));
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
      color: var(--cdcalc-dose-mg-color, #124643);
      margin-right: 6px;
      vertical-align: middle;
    }

    .cdcalc-info-banner {
      border-radius: 14px;
      border: 2px solid var(--cdcalc-info-banner-border, #1d4ed8);
      background: var(--cdcalc-info-banner-bg, #e0ecff);
      color: var(--cdcalc-info-banner-color, #0b2660);
      padding: 12px 14px;
      font-size: 0.92rem;
      line-height: 1.45;
    }

    .cdcalc-info-banner em {
      font-style: normal;
      text-decoration: underline;
      text-decoration-thickness: 2px;
      text-underline-offset: 2px;
    }

    /* Concentration check — ibuprofen ships in two strengths and the volume
       differs between them. Both options stay visible and equally weighted;
       the concentration printed on the bottle is the entry condition, so a
       caregiver matches their bottle first and reads the dose second. Never
       collapse one of these or pre-select a "default" strength: the hidden
       option is the one that causes the overdose. */
    .cdcalc-conc-check {
      display: grid;
      gap: 10px;
    }

    .cdcalc-conc-option {
      border-radius: 14px;
      border: 2px solid var(--cdcalc-accordion-border-color, #0f2c2a);
      background: var(--cdcalc-accordion-bg, #ffffff);
      padding: 14px;
      display: grid;
      gap: 2px;
    }

    .cdcalc-conc-option__if {
      margin: 0;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0.72;
    }

    .cdcalc-conc-option__conc {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 900;
      line-height: 1.15;
      font-variant-numeric: tabular-nums;
    }

    .cdcalc-conc-option__meta {
      margin: 0 0 6px;
      font-size: 0.82rem;
      opacity: 0.78;
    }

    .cdcalc-conc-option__dose {
      margin: 0;
      padding-top: 8px;
      border-top: 1px dashed var(--cdcalc-accordion-border-color, rgba(15, 44, 42, 0.35));
      font-size: 0.95rem;
      line-height: 1.5;
    }

    @media (max-width: 640px) {
      .cdcalc-conc-option__conc { font-size: 1.15rem; }
    }

    .cdcalc-accordion {
      border-radius: 14px;
      border: 2px solid var(--cdcalc-accordion-border-color, #0f2c2a);
      background: var(--cdcalc-accordion-bg, #ffffff);
      overflow: hidden;
    }

    .cdcalc-accordion + .cdcalc-accordion {
      margin-top: 4px;
    }

    .cdcalc-accordion > summary {
      list-style: none;
      cursor: pointer;
      padding: 12px 14px;
      font-weight: 800;
      font-size: 0.95rem;
      color: var(--cdcalc-accordion-summary-color, #0f2c2a);
      background: var(--cdcalc-accordion-summary-bg, #f1f8f6);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .cdcalc-accordion > summary::-webkit-details-marker {
      display: none;
    }

    .cdcalc-accordion > summary::after {
      content: '▾';
      font-size: 0.9rem;
      transition: transform 0.2s ease;
      color: var(--cdcalc-accordion-summary-after-color, #124643);
    }

    .cdcalc-accordion[open] > summary::after {
      transform: rotate(180deg);
    }

    .cdcalc-accordion[open] > summary {
      background: var(--cdcalc-accordion-open-summary-bg, #e4f4f0);
      border-bottom: 2px solid var(--cdcalc-accordion-border-color, #0f2c2a);
    }

    .cdcalc-accordion-body {
      padding: 14px;
    }

    .cdcalc-warning {
      border-radius: 16px;
      border: 3px solid var(--cdcalc-warning-border-color, #124643);
      background: var(--cdcalc-warning-bg, #e4f4f0);
      color: var(--cdcalc-warning-color, #123a37);
      padding: 14px;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .cdcalc-warning--orange {
      border-color: var(--cdcalc-warning-orange-border, #b45309);
      background: var(--cdcalc-warning-orange-bg, #fef3c7);
      color: var(--cdcalc-warning-orange-color, #92400e);
    }

    .cdcalc-warning--red {
      border-color: var(--cdcalc-warning-red-border, #b91c1c);
      background: var(--cdcalc-warning-red-bg, #fee2e2);
      color: var(--cdcalc-warning-red-color, #7f1d1d);
    }

    .cdcalc-warning--teal {
      border-color: var(--cdcalc-warning-teal-border, #124643);
      background: var(--cdcalc-warning-teal-bg, #e4f4f0);
      color: var(--cdcalc-warning-teal-color, #123a37);
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
        grid-template-columns: 1fr;
      }

      .cdcalc-age-option {
        min-height: 92px;
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
    const style = document.createElement('style');
    style.dataset.closedoseCalculator = 'true';
    style.textContent = BASE_STYLES;
    host.prepend(style);
    return style;
  }

  const ATTENTION_CLASS = 'cdcalc-button--breathing';
  const INPUT_ATTENTION_CLASS = 'cdcalc-input--attention';

  // Implementation summary:
  // - 0–2 months: emergency redirect, calculator inputs disabled.
  // - 2–6 months: acetaminophen at 12.5 mg/kg (max 160 mg) with ibuprofen suppressed.
  // - 6 months–11 years: pediatric caps of 480 mg acetaminophen and 400 mg ibuprofen.
  // - 12+ years: adult ceilings of 1000 mg acetaminophen and 600 mg ibuprofen.
  // This replaces the previous catch-all 6+ pathway while leaving room to refine
  // segmentation further if future clinical guidance differentiates additional cohorts.
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
    if (!button.classList.contains(ATTENTION_CLASS)) {
      button.classList.add(ATTENTION_CLASS);
    }
  }

  function buildMarkup(strings, ids, logomarkSrc) {
    const { form, units } = strings;
    const fallbackAgeOptions = DEFAULT_STRINGS.form.ageOptions || {};
    const ageOptions = form.ageOptions || {};

    const normalizeAgeLabel = function (value) {
      if (!value) {
        return null;
      }
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
          return null;
        }
        return {
          primary: trimmed,
          secondary: '',
          connector: '',
          align: 'center',
          accessible: trimmed,
        };
      }
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const primary = typeof value.primary === 'string' ? value.primary.trim() : '';
        const secondary = typeof value.secondary === 'string' ? value.secondary.trim() : '';
        const connector = typeof value.connector === 'string' ? value.connector.trim() : '';
        const alignPreference = value.align === 'center' ? 'center' : 'start';
        const accessibleText = typeof value.accessible === 'string' ? value.accessible.trim() : '';
        const fallbackAccessible = [primary, connector, secondary]
          .filter(Boolean)
          .join(' ');

        if (!primary && accessibleText) {
          return {
            primary: accessibleText,
            secondary: '',
            connector: '',
            align: 'center',
            accessible: accessibleText,
          };
        }

        if (!primary) {
          return null;
        }

        const align = alignPreference === 'center' || connector || secondary ? 'center' : alignPreference;

        return {
          primary,
          secondary,
          connector,
          align,
          accessible: accessibleText || fallbackAccessible || primary,
        };
      }
      return null;
    };

    const resolveAgeLabel = function (key, fallbackKey) {
      const candidates = [
        Object.prototype.hasOwnProperty.call(ageOptions, key) ? normalizeAgeLabel(ageOptions[key]) : null,
        fallbackKey && Object.prototype.hasOwnProperty.call(ageOptions, fallbackKey)
          ? normalizeAgeLabel(ageOptions[fallbackKey])
          : null,
        Object.prototype.hasOwnProperty.call(fallbackAgeOptions, key)
          ? normalizeAgeLabel(fallbackAgeOptions[key])
          : null,
        fallbackKey && Object.prototype.hasOwnProperty.call(fallbackAgeOptions, fallbackKey)
          ? normalizeAgeLabel(fallbackAgeOptions[fallbackKey])
          : null,
      ];

      for (let index = 0; index < candidates.length; index += 1) {
        if (candidates[index]) {
          return candidates[index];
        }
      }

      return {
        primary: key,
        secondary: '',
        connector: '',
        align: 'center',
        accessible: key,
      };
    };

    const ageLabel0to2 = resolveAgeLabel('0-2');
    const ageLabel2to6 = resolveAgeLabel('2-6');
    const ageLabel6to11 = resolveAgeLabel('6-11', '6-24');
    const ageLabel12Plus = resolveAgeLabel('12+', '2y+');

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

    const resolveAgeOptionText = function (label) {
      if (!label) {
        return '';
      }
      return label.accessible || label.primary;
    };

    const renderStepTitle = function (labelText) {
      const raw = typeof labelText === 'string' ? labelText : '';
      const match = /^\s*step\s*(\d+)\s*[:.\-]?\s*(.*)$/i.exec(raw);
      if (match) {
        const number = match[1];
        const rest = match[2] || '';
        return {
          aria: raw,
          html: `<span class="cdcalc-step-badge" aria-hidden="true">${escapeHtml(number)}</span><span class="cdcalc-step-text">${escapeHtml(rest)}</span>`,
        };
      }
      return { aria: raw, html: escapeHtml(raw) };
    };

    const stepAge = renderStepTitle(form.ageLabel);
    const stepWeight = renderStepTitle(form.weightLabel);
    const calculateStepLabel = form.calculateStep || '';
    const stepCalculate = renderStepTitle(calculateStepLabel);
    const wrapperClass = logomarkSrc ? 'cdcalc-wrapper cdcalc-wrapper--has-logomark' : 'cdcalc-wrapper';
    const logomarkHtml = logomarkSrc
      ? `<img class="cdcalc-logomark" src="${logomarkSrc}" alt="" aria-hidden="true">`
      : '';
    return `
      <div class="${wrapperClass}">
        ${logomarkHtml}
      <div class="cdcalc-card" data-calculator-card aria-labelledby="${ids.title}" role="group">
        <div class="cdcalc-header">
          ${
            strings.header && strings.header.eyebrow
              ? `<p class="cdcalc-header-eyebrow">${escapeHtml(strings.header.eyebrow)}</p>`
              : ''
          }
          <h2 class="cdcalc-title" id="${ids.title}">${strings.title}</h2>
        </div>
        <form class="cdcalc-form" data-calculator-form novalidate>
          <div class="cdcalc-group" aria-live="polite">
            <div class="cdcalc-group-title cdcalc-group-title--step" aria-label="${escapeHtml(stepAge.aria)}">${stepAge.html}</div>
            <div class="cdcalc-segmented">
              <div class="cdcalc-segmented-buttons" role="group" aria-label="${form.ageGroupAria}">
                ${renderAgeButton('0-2', ageLabel0to2)}
                ${renderAgeButton('2-6', ageLabel2to6)}
                ${renderAgeButton('6-11', ageLabel6to11)}
                ${renderAgeButton('12+', ageLabel12Plus)}
              </div>
              ${
                form.agePrompt
                  ? `<p class="cdcalc-hello" data-age-prompt>${form.agePrompt}</p>`
                  : ''
              }
            </div>
            <select data-age-select aria-hidden="true" tabindex="-1" hidden>
              <option value="">${form.ageSelectLabel}</option>
              <option value="0-2">${escapeHtml(resolveAgeOptionText(ageLabel0to2))}</option>
              <option value="2-6">${escapeHtml(resolveAgeOptionText(ageLabel2to6))}</option>
              <option value="6-11">${escapeHtml(resolveAgeOptionText(ageLabel6to11))}</option>
              <option value="12+">${escapeHtml(resolveAgeOptionText(ageLabel12Plus))}</option>
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
            ${
              calculateStepLabel
                ? `<p class="cdcalc-step-callout cdcalc-step-callout--step" aria-label="${escapeHtml(stepCalculate.aria)}">${stepCalculate.html}</p>`
                : ''
            }
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
      agePrompt: root.querySelector('[data-age-prompt]'),
      message: root.querySelector('[data-message]'),
      weightInput: root.querySelector('[data-weight-input]'),
      unitSelect: root.querySelector('[data-weight-unit]'),
      unitButtons: root.querySelectorAll('.cdcalc-unit-option'),
      submitButton: root.querySelector('[data-submit]'),
      results: root.querySelector('[data-results]'),
      form: root.querySelector('[data-calculator-form]'),
    };
  }

  function createGuideTabRevealController(root) {
    if (!root || typeof window === 'undefined') {
      return {
        sync() {},
        destroy() {},
      };
    }

    const cards = new Set();
    let rafHandle = null;
    let rafIsTimeout = false;

    const cancelScheduledUpdate = () => {
      if (rafHandle === null) {
        return;
      }
      if (rafIsTimeout) {
        clearTimeout(rafHandle);
      } else if (typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(rafHandle);
      }
      rafHandle = null;
      rafIsTimeout = false;
    };

    const updateReveals = () => {
      rafHandle = null;
      rafIsTimeout = false;
      const docElement = window.document && window.document.documentElement;
      const viewportHeight = Math.max(
        window.innerHeight || 0,
        (docElement && docElement.clientHeight) || 0
      );
      if (!viewportHeight) {
        cards.forEach((card) => {
          if (card instanceof HTMLElement) {
            card.style.setProperty('--cdcalc-guide-reveal-scroll', '0');
            delete card.dataset.guidePeeking;
          }
        });
        return;
      }

      cards.forEach((card) => {
        if (!(card instanceof HTMLElement) || !card.isConnected) {
          if (card instanceof HTMLElement) {
            card.style.removeProperty('--cdcalc-guide-reveal-scroll');
            delete card.dataset.guidePeeking;
          }
          cards.delete(card);
          return;
        }
        const rect = card.getBoundingClientRect();
        const rawProgress = 1 - rect.bottom / viewportHeight;
        const reveal = Math.min(Math.max(rawProgress, 0), 1);
        card.style.setProperty('--cdcalc-guide-reveal-scroll', reveal.toFixed(3));
        if (reveal > 0.15) {
          card.dataset.guidePeeking = 'true';
        } else {
          delete card.dataset.guidePeeking;
        }
      });
    };

    const scheduleUpdate = () => {
      if (!cards.size) {
        cancelScheduledUpdate();
        return;
      }
      if (rafHandle !== null) {
        return;
      }
      if (typeof window.requestAnimationFrame === 'function') {
        rafIsTimeout = false;
        rafHandle = window.requestAnimationFrame(() => {
          updateReveals();
        });
      } else {
        rafIsTimeout = true;
        rafHandle = window.setTimeout(() => {
          updateReveals();
        }, 16);
      }
    };

    const syncCards = () => {
      const found = Array.from(root.querySelectorAll('.cdcalc-result-card--with-guide'));
      const current = new Set();
      found.forEach((card) => {
        if (!(card instanceof HTMLElement)) {
          return;
        }
        current.add(card);
        if (!cards.has(card)) {
          cards.add(card);
          card.style.setProperty('--cdcalc-guide-reveal-scroll', '0');
          delete card.dataset.guidePeeking;
        }
      });

      cards.forEach((card) => {
        if (!current.has(card)) {
          if (card instanceof HTMLElement) {
            card.style.removeProperty('--cdcalc-guide-reveal-scroll');
            delete card.dataset.guidePeeking;
          }
          cards.delete(card);
        }
      });

      if (!cards.size) {
        cancelScheduledUpdate();
        return;
      }

      scheduleUpdate();
    };

    const onScrollOrResize = () => {
      scheduleUpdate();
    };

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    syncCards();

    return {
      sync() {
        syncCards();
      },
      destroy() {
        cancelScheduledUpdate();
        window.removeEventListener('scroll', onScrollOrResize);
        window.removeEventListener('resize', onScrollOrResize);
        cards.forEach((card) => {
          if (card instanceof HTMLElement) {
            card.style.removeProperty('--cdcalc-guide-reveal-scroll');
            delete card.dataset.guidePeeking;
          }
        });
        cards.clear();
      },
    };
  }

  function clearResults(elements) {
    if (elements.results) {
      elements.results.innerHTML = '';
    }
  }

  function renderWarning(strings, options = {}) {
    const { title, body, tone } = options;
    const classes = ['cdcalc-warning'];
    if (tone) {
      classes.push(`cdcalc-warning--${tone}`);
    }
    const titleMarkup = title ? `<strong>${title}</strong> ` : '';
    return `<div class="${classes.join(' ')}">${titleMarkup}${body}</div>`;
  }

  function renderGuidePromo(options = {}) {
    const {
      eyebrow = 'Parents',
      body = 'Browse product photos and safety reminders in the medication guide.',
      href = '',
      label = 'Open medication guide',
      tone = '',
    } = options;

    const trimmedHref = typeof href === 'string' ? href.trim() : '';
    if (!trimmedHref) {
      return '';
    }

    const classes = ['cdcalc-guide-promo'];
    if (tone) {
      classes.push(`cdcalc-guide-promo--${tone}`);
    }

    return `
      <div class="${classes.join(' ')}">
        <p class="cdcalc-guide-promo__eyebrow">${escapeHtml(eyebrow)}</p>
        <p class="cdcalc-guide-promo__body">${escapeHtml(body)}</p>
        <a class="cdcalc-guide-promo__link" href="${escapeHtml(trimmedHref)}">
          <span>${escapeHtml(label)}</span>
          <span class="cdcalc-guide-promo__arrow" aria-hidden="true">›</span>
        </a>
      </div>
    `;
  }

  function updateForm(elements, strings) {
    if (
      !elements ||
      !elements.ageSelect ||
      !elements.weightInput ||
      !elements.unitSelect ||
      !elements.message ||
      !elements.submitButton ||
      !elements.results
    ) {
      return;
    }

    const age = elements.ageSelect.value;
    const gate = resolveAgeGate(age);
    const normalizedAge =
      age === '6-24' ? '6-11' : age === '2y+' || age === '6+' ? '12+' : age;

    elements.ageButtons.forEach((button) => {
      const isSelected = button.dataset.age === normalizedAge;
      button.setAttribute('aria-pressed', String(isSelected));
      button.classList.toggle('is-active', isSelected);
    });

    if (elements.agePrompt) {
      const hasAge = Boolean(age);
      elements.agePrompt.hidden = hasAge;
      elements.agePrompt.style.display = hasAge ? 'none' : '';
    }

    const unit = elements.unitSelect.value || 'lbs';
    elements.unitButtons.forEach((button) => {
      const isSelected = button.dataset.unit === unit;
      button.setAttribute('aria-pressed', String(isSelected));
      button.classList.toggle('is-active', isSelected);
    });

    clearResults(elements);
    elements.message.hidden = true;
    elements.message.innerHTML = '';
    elements.submitButton.disabled = false;
    elements.weightInput.disabled = false;
    elements.unitSelect.disabled = false;
    clearButtonAttention(elements.submitButton);

    if (gate === 'emergency') {
      elements.message.hidden = false;
      elements.message.innerHTML = strings.form.infantCriticalMessage;
      elements.submitButton.disabled = true;
      elements.weightInput.disabled = true;
      elements.unitSelect.disabled = true;
    }
  }

  // Lightweight, fail-safe analytics. Reports how often the calculator is
  // actually used (and for which age band / unit) to Google Analytics if a
  // gtag/dataLayer is present on the host page. Never throws — analytics must
  // never break dosing.
  function trackCalculatorEvent(eventName, params) {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      var payload = Object.assign({event_category: 'calculator'}, params || {});
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, payload);
      } else if (window.dataLayer && typeof window.dataLayer.push === 'function') {
        window.dataLayer.push(Object.assign({event: eventName}, payload));
      }
    } catch (err) {
      /* swallow — analytics is best-effort only */
    }
  }

  function calculateDose(elements, strings, onResultsRendered) {
    if (
      !elements ||
      !elements.ageSelect ||
      !elements.weightInput ||
      !elements.unitSelect ||
      !elements.results
    ) {
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

    if (isNaN(weightInput) || weightInput <= 0) {
      elements.results.innerHTML = renderWarning(strings, {
        title: strings.warnings.weightRequiredTitle,
        body: strings.warnings.weightRequiredBody,
      });
      notifyResultsRendered();
      return;
    }

    if (gate === 'emergency') {
      trackCalculatorEvent('calculate_dose', {
        age_group: age,
        weight_unit: weightUnit,
        result_type: 'emergency',
      });
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

    if (gate === 'infant') {
      const ACETA_MAX_MG_INFANT = 160;
      const acetaMgCalculated = 12.5 * weightKg;
      const acetaMg = Math.min(acetaMgCalculated, ACETA_MAX_MG_INFANT);
      const acetaMl = (acetaMg / 160) * 5;
      const acetaCapped = acetaMg < acetaMgCalculated;
      const group = [];
      group.push(`
        <article class="cdcalc-result-card">
          <h3>${strings.results.acetaminophenInfantTitle}</h3>
          <p>${formatString(strings.results.acetaminophenInfantBody, {
            ml: acetaMl.toFixed(1),
            mg: acetaMg.toFixed(0),
          })}</p>
          <p>${formatString(strings.warnings.acetaminophenMax, { max: ACETA_MAX_MG_INFANT })}</p>
          ${
            acetaCapped
              ? renderWarning(strings, {
                  title: strings.warnings.maxDoseReachedTitle,
                  body: strings.warnings.maxDoseReachedBody,
                  tone: 'orange',
                })
              : ''
          }
        </article>
      `);

      group.push(
        renderWarning(strings, {
          body: strings.warnings.infantIbuprofen,
          tone: 'red',
        })
      );

      resultBlocks.push(`<div class="cdcalc-result-group">${group.join('')}</div>`);
    } else if (gate === 'pediatric' || gate === 'adolescent') {
      const isPediatric = gate === 'pediatric';
      const ACETA_MAX_SINGLE_DOSE_MG = isPediatric ? 480 : 1000;
      const IBU_MAX_SINGLE_DOSE_MG = isPediatric ? 400 : 600;

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
        <article class="cdcalc-result-card">
          <h3>${strings.results.acetaminophenOlderTitle}</h3>
          <p>${formatString(strings.results.acetaminophenOlderBody, {
            ml: acetaMl.toFixed(1),
            mg: acetaMg.toFixed(0),
          })}</p>
          ${
            acetaCapped
              ? renderWarning(strings, {
                  body: formatString(strings.warnings.acetaminophenMax, { max: ACETA_MAX_SINGLE_DOSE_MG }),
                  tone: 'orange',
                })
              : ''
          }
          ${
            acetaCapped
              ? renderWarning(strings, {
                  title: strings.warnings.maxDoseReachedTitle,
                  body: strings.warnings.maxDoseReachedBody,
                  tone: 'orange',
                })
              : ''
          }
        </article>
      `);

      group.push(`
        <article class="cdcalc-result-card">
          <h3>${strings.results.ibuprofenTitle}</h3>
          <div class="cdcalc-info-banner">${strings.warnings.ibuprofenStrengthInfo}</div>
          <div class="cdcalc-conc-check">
            <div class="cdcalc-conc-option">
              <p class="cdcalc-conc-option__if">${strings.results.ibuprofenConcIf}</p>
              <p class="cdcalc-conc-option__conc">${strings.results.ibuprofenConc100}</p>
              <p class="cdcalc-conc-option__meta">${strings.results.ibuprofenChildrenSummary}</p>
              <p class="cdcalc-conc-option__dose">${formatString(strings.results.ibuprofenBody100, {
                ml: ibuMl100.toFixed(1),
                mg: ibuMg.toFixed(0),
              })}</p>
            </div>
            <div class="cdcalc-conc-option">
              <p class="cdcalc-conc-option__if">${strings.results.ibuprofenConcIf}</p>
              <p class="cdcalc-conc-option__conc">${strings.results.ibuprofenConc50}</p>
              <p class="cdcalc-conc-option__meta">${strings.results.ibuprofenInfantSummary}</p>
              <p class="cdcalc-conc-option__dose">${formatString(strings.results.ibuprofenBody50, {
                ml: ibuMl50.toFixed(1),
                mg: ibuMg.toFixed(0),
              })}</p>
            </div>
          </div>
          ${
            ibuCapped
              ? renderWarning(strings, {
                  body: formatString(strings.warnings.ibuprofenMax, { max: IBU_MAX_SINGLE_DOSE_MG }),
                  tone: 'orange',
                })
              : ''
          }
          ${
            ibuCapped
              ? renderWarning(strings, {
                  title: strings.warnings.maxDoseReachedTitle,
                  body: strings.warnings.maxDoseReachedBody,
                  tone: 'orange',
                })
              : ''
          }
        </article>
      `);

      const doseSpacingBody = acetaCapped || ibuCapped
        ? formatString(strings.warnings.doseSpacingBody, {
            acetaminophenMax: ACETA_MAX_SINGLE_DOSE_MG,
            ibuprofenMax: IBU_MAX_SINGLE_DOSE_MG,
          })
        : strings.warnings.doseSpacingGeneralBody;

      group.push(
        renderWarning(strings, {
          title: strings.warnings.doseSpacingTitle,
          body: doseSpacingBody,
          tone: 'teal',
        })
      );

      resultBlocks.push(`<div class="cdcalc-result-group">${group.join('')}</div>`);
    }

    elements.results.innerHTML = resultBlocks.join('');
    notifyResultsRendered();

    trackCalculatorEvent('calculate_dose', {
      age_group: age,
      weight_unit: weightUnit,
      result_type: gate,
    });
  }

  function bindEvents(elements, strings, onResultsRendered) {
    if (!elements || !elements.form) {
      return () => {};
    }

    const shouldAnimateSubmit = () => {
      if (
        !elements ||
        !elements.submitButton ||
        !elements.weightInput ||
        !elements.ageSelect ||
        elements.submitButton.disabled
      ) {
        return false;
      }
      const weightValue = parseFloat(elements.weightInput.value);
      if (Number.isNaN(weightValue) || weightValue <= 0) {
        return false;
      }
      const gate = resolveAgeGate(elements.ageSelect.value);
      return Boolean(gate && gate !== 'emergency');
    };

    const shouldAnimateWeightInput = () => {
      if (
        !elements ||
        !elements.weightInput ||
        !elements.ageSelect ||
        elements.weightInput.disabled
      ) {
        return false;
      }
      const ageValue = elements.ageSelect.value;
      const gate = resolveAgeGate(ageValue);
      if (!gate || gate === 'emergency') {
        return false;
      }
      if (document.activeElement === elements.weightInput) {
        return false;
      }
      const weightValue = typeof elements.weightInput.value === 'string'
        ? elements.weightInput.value.trim()
        : '';
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

    const refreshGuidanceAnimations = () => {
      refreshSubmitAnimation();
      refreshWeightAnimation();
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
    const guideTabReveal = createGuideTabRevealController(card);
    const elements = getElements(card);
    const teardown = bindEvents(elements, strings, () => {
      if (guideTabReveal && typeof guideTabReveal.sync === 'function') {
        guideTabReveal.sync();
      }
    });

    return {
      destroy() {
        teardown();
        if (guideTabReveal && typeof guideTabReveal.destroy === 'function') {
          guideTabReveal.destroy();
        }
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
        throw new Error('CloseDoseCalculator: mount target not found.');
      }
      return createCalculator(host, options);
    },
  };

  global.CloseDoseCalculator = api;
})(window);
