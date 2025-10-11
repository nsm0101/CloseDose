(function (global) {
  if (global.CloseDoseCalculator && typeof global.CloseDoseCalculator.mount === 'function') {
    return;
  }

  const DEFAULT_STRINGS = {
    title: 'Fever/Pain Medication Calculator',
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
      infantIbuprofen:
        '<em>Ibuprofen is not recommended for infants under six months. Consult your pediatrician before using ibuprofen for this age group.</em>',
      acetaminophenMax:
        'Maximum single dose for this age group is {{max}} mg of acetaminophen every 6 hours.',
      ibuprofenMax:
        'Maximum single dose for this age group is {{max}} mg of ibuprofen every 6 hours.',
    },
    results: {
      patientWeightLabel: 'Patient weight',
      patientWeightValue: '{{kg}} kg ({{lbs}} lbs)',
      acetaminophenInfantTitle: 'Acetaminophen (160 mg / 5 mL)',
      acetaminophenInfantBody:
        'Give {{ml}} mL ({{mg}} mg) every 4 hours as needed for fever/pain.',
      acetaminophenOlderTitle: 'Acetaminophen (160 mg / 5 mL)',
      acetaminophenOlderBody:
        'Give {{ml}} mL ({{mg}} mg) every 6 hours as needed for fever/pain.',
      ibuprofenTitle: "Ibuprofen (oral)",
      ibuprofenBody100:
        "<strong>Children's 100 mg / 5 mL:</strong> Give {{ml}} mL ({{mg}} mg) every 6 hours as needed for fever/pain.",
      ibuprofenBody50:
        "<strong>Infant's 50 mg / 1.25 mL:</strong> Give {{ml}} mL ({{mg}} mg) every 6 hours as needed for fever/pain.",
    },
    accessibility: {
      resultsRegion: 'Dosing results',
    },
    support: {
      heading: 'Support CloseDose',
      label: 'support options',
      donateButtonAria: 'Support CloseDose with a donation on Givebutter',
      donateButtonLine1: 'Powered by Parents!',
      donateButtonLine2: 'Help Support Us Today!',
      donateButtonSub: 'Please consider donating today.',
      donateCopy: 'Every contribution keeps CloseDose free for families.',
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

  const MINI_CAROUSEL_CONTENT = {
    acetaminophenLiquid: [
      {
        src: 'images/Carousel/ace/k/k1.png',
        alt: "Children's acetaminophen product photo (variant 1)",
        caption: "Children's Acetaminophen Suspension",
        meta: '160 mg / 5 mL',
      },
      {
        src: 'images/Carousel/ace/k/k2.png',
        alt: "Children's acetaminophen product photo (variant 2)",
        caption: "Children's Acetaminophen Suspension",
        meta: '160 mg / 5 mL',
      },
      {
        src: 'images/Carousel/ace/k/k3.png',
        alt: "Children's acetaminophen product photo (variant 3)",
        caption: "Children's Acetaminophen Suspension",
        meta: '160 mg / 5 mL',
      },
      {
        src: 'images/Carousel/ace/k/k4.png',
        alt: "Children's acetaminophen product photo (variant 4)",
        caption: "Children's Acetaminophen Suspension",
        meta: '160 mg / 5 mL',
      },
      {
        src: 'images/Carousel/ace/k/k5.png',
        alt: "Children's acetaminophen product photo (variant 5)",
        caption: "Children's Acetaminophen Suspension",
        meta: '160 mg / 5 mL',
      },
      {
        src: 'images/Carousel/ace/k/k6.png',
        alt: "Children's acetaminophen product photo (variant 6)",
        caption: "Children's Acetaminophen Suspension",
        meta: '160 mg / 5 mL',
      },
      {
        src: 'images/Carousel/ace/k/k7.png',
        alt: "Children's acetaminophen product photo (variant 7)",
        caption: "Children's Acetaminophen Suspension",
        meta: '160 mg / 5 mL',
      },
      {
        src: 'images/Carousel/ace/k/k8.png',
        alt: "Children's acetaminophen product photo (variant 8)",
        caption: "Children's Acetaminophen Suspension",
        meta: '160 mg / 5 mL',
      },
      {
        src: 'images/Carousel/ace/k/k9.png',
        alt: "Children's acetaminophen product photo (variant 9)",
        caption: "Children's Acetaminophen Suspension",
        meta: '160 mg / 5 mL',
      },
    ],
    acetaminophenOther: [
      {
        src: createMiniProductBadge({
          title: "Meltaways",
          subtitle: '160 mg each',
          tone: '#fde68a',
          glyph: '🍓',
        }),
        alt: "Illustration representing Tylenol Children's Meltaways acetaminophen tablets 160 mg each",
        caption: "Tylenol® Children's Meltaways",
        meta: '160 mg orally disintegrating tablet',
      },
      {
        src: createMiniProductBadge({
          title: 'Chewables',
          subtitle: '160 mg each',
          tone: '#fbcfe8',
          glyph: '🧡',
        }),
        alt: "Illustration representing children's chewable acetaminophen tablets 160 mg each",
        caption: "Generic Children's Chewables",
        meta: '160 mg chewable tablet',
      },
      {
        src: createMiniProductBadge({
          title: 'Suppository',
          subtitle: '80-160 mg',
          tone: '#bfdbfe',
          glyph: '🌙',
        }),
        alt: 'Illustration representing acetaminophen suppositories in the 80-160 mg range',
        caption: 'Rectal Suppositories',
        meta: '80-160 mg per dose (check label)',
      },
    ],
    ibuprofenChildren: [
      {
        src: 'images/Carousel/ibu/k1.png',
        alt: "Quality Choice children's ibuprofen oral suspension box showing 100 mg per 5 mL dosing information.",
        caption: "Quality Choice® Children’s Ibuprofen",
        meta: '100 mg / 5 mL oral suspension',
      },
      {
        src: 'images/Carousel/ibu/k2.png',
        alt: "Quality Choice children's ibuprofen packaging highlighting an alcohol-free, non-staining suspension.",
        caption: "Quality Choice® Dye-Free Suspension",
        meta: '100 mg / 5 mL oral suspension',
      },
      {
        src: 'images/Carousel/ibu/k3.png',
        alt: 'Dye-free children’s ibuprofen 100 mg per 5 mL box for ages 2 to 11 years.',
        caption: 'Dye-Free Children’s Ibuprofen',
        meta: '100 mg / 5 mL oral suspension',
      },
      {
        src: 'images/Carousel/ibu/k4.png',
        alt: "Equate children's ibuprofen oral suspension 100 mg per 5 mL packaging.",
        caption: "Equate® Children’s Ibuprofen",
        meta: '100 mg / 5 mL oral suspension',
      },
      {
        src: 'images/Carousel/ibu/k5.png',
        alt: "Children's Advil oral suspension 100 mg per 5 mL bottle and box.",
        caption: "Children’s Advil® Suspension",
        meta: '100 mg / 5 mL oral suspension',
      },
      {
        src: 'images/Carousel/ibu/k6.png',
        alt: "Generic children's ibuprofen packaging comparing to Children's Motrin for ages 2 to 11 years.",
        caption: "Compare to Children’s Motrin®",
        meta: '100 mg / 5 mL oral suspension',
      },
      {
        src: 'images/Carousel/ibu/k7.png',
        alt: "Children's ibuprofen dosing directions panel noting 100 mg per 5 mL oral suspension.",
        caption: 'Children’s Ibuprofen Directions',
        meta: 'Dosing guidance (100 mg / 5 mL)',
      },
      {
        src: 'images/Carousel/ibu/k8.png',
        alt: "Store-brand children's ibuprofen bubble gum flavor package comparing to Children's Motrin.",
        caption: 'Store-Brand Bubble Gum Ibuprofen',
        meta: '100 mg / 5 mL oral suspension',
      },
      {
        src: 'images/Carousel/ibu/k9.png',
        alt: "Children's ibuprofen oral suspension bottle with a lasts up to 8 hours callout.",
        caption: 'Children’s Ibuprofen (8 Hour Relief)',
        meta: '100 mg / 5 mL oral suspension',
      },
    ],
    ibuprofenInfant: [
      {
        src: 'images/Ibuprofen/Infants/Motrin Infant ibuprofen iso.png',
        alt: "Infant's Motrin concentrated ibuprofen 50 mg per 1.25 mL",
        caption: "Infant's Motrin® Concentrated Drops",
        meta: '50 mg / 1.25 mL',
      },
      {
        src: 'images/Ibuprofen/Infants/Amazon Infant ibuprofen iso.png',
        alt: 'Amazon Basics infant ibuprofen 50 mg per 1.25 mL',
        caption: "Amazon Basics® Infant Ibuprofen",
        meta: '50 mg / 1.25 mL',
      },
      {
        src: 'images/Ibuprofen/Infants/Target Infant ibuprofen iso.png',
        alt: 'Target up & up infant ibuprofen 50 mg per 1.25 mL',
        caption: "up & up® Infant Ibuprofen",
        meta: '50 mg / 1.25 mL',
      },
    ],
    ibuprofenOther: [
      {
        src: createMiniProductBadge({
          title: 'Chewables',
          subtitle: '100 mg each',
          tone: '#fecdd3',
          glyph: '🍊',
        }),
        alt: "Illustration representing Motrin children's chewable ibuprofen tablets 100 mg each",
        caption: "Motrin® Children's Chewables",
        meta: '100 mg chewable tablet',
      },
      {
        src: createMiniProductBadge({
          title: 'Junior Tabs',
          subtitle: '100 mg each',
          tone: '#d8b4fe',
          glyph: '⭐',
        }),
        alt: "Illustration representing Advil Junior Strength ibuprofen tablets 100 mg each",
        caption: 'Advil® Junior Strength Tablets',
        meta: '100 mg coated tablet',
      },
      {
        src: createMiniProductBadge({
          title: 'Caplets',
          subtitle: '200 mg each',
          tone: '#bbf7d0',
          glyph: '💊',
        }),
        alt: 'Illustration representing generic ibuprofen caplets 200 mg each',
        caption: 'Ibuprofen Caplets',
        meta: '200 mg tablet/capsule (adolescents+)',
      },
    ],
  };

  const SUPPORT_PARTNER_SLIDES = [
    {
      src: 'https://pics.walgreens.com/prodimg/504869/2_100.jpg',
      alt: 'Walgreens Adult Pain Reliever Liquid Cherry product front',
      caption: 'Walgreens® Adult Pain Reliever (Cherry)',
      meta: 'Acetaminophen 160 mg / 5 mL',
    },
    {
      src: 'https://pics.walgreens.com/prodimg/504869/3_100.jpg',
      alt: 'Walgreens Adult Pain Reliever Liquid Cherry back label and dosing chart',
      caption: 'Back panel & ingredients',
      meta: 'Review dosing instructions on the label',
    },
    {
      src: 'https://pics.walgreens.com/prodimg/504869/4_100.jpg',
      alt: 'Walgreens Adult Pain Reliever Liquid Cherry dosage cup',
      caption: 'Includes measuring cup',
      meta: 'Use the included cup for accuracy',
    },
  ];

  const BASE_STYLES = `
    .cdcalc-card {
      font-family: "Nunito", system-ui, -apple-system, "Segoe UI", sans-serif;
      background: rgba(255, 255, 255, 0.92);
      border: 3px solid #0f2c2a;
      border-radius: 26px;
      box-shadow: 0 6px 0 rgba(15, 44, 42, 0.18);
      padding: clamp(20px, 3vw, 32px);
      max-width: 720px;
      margin: 0 auto;
      color: #0f2c2a;
      --cdcalc-gold: #ffe8a8;
    }

    .cdcalc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
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

    .cdcalc-guide-tab {
      position: absolute;
      top: auto;
      right: -16px;
      bottom: -14px;
      transform: translateX(
        calc(
          (1 - var(--cdcalc-guide-reveal-scroll, 0)) *
          (1 + var(--cdcalc-guide-hidden-extra, 0.28)) * 100%
        )
      );
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      padding: 14px 22px 14px 20px;
      min-width: 168px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-size: 0.74rem;
      line-height: 1;
      text-decoration: none;
      color: #fff;
      border-radius: 36px;
      border: 3px solid rgba(15, 44, 42, 0.9);
      box-shadow:
        inset 0 0 0 2px rgba(255, 255, 255, 0.32),
        0 12px 20px rgba(17, 36, 34, 0.26),
        0 0 0 4px rgba(15, 44, 42, 0.08);
      background: linear-gradient(135deg, rgba(10, 46, 44, 0.92), rgba(15, 44, 42, 0.82));
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      z-index: 1;
      white-space: nowrap;
      will-change: transform;
      overflow: hidden;
    }

    .cdcalc-guide-tab__label {
      display: block;
      padding-right: 4px;
      color: rgba(255, 255, 255, 0.92);
      text-shadow: 0 2px 0 rgba(15, 44, 42, 0.45);
      opacity: calc(0.25 + var(--cdcalc-guide-reveal-scroll, 0) * 0.75);
      transform: translateX(calc(10px - 10px * var(--cdcalc-guide-reveal-scroll, 0)));
      transition: transform 0.3s ease, opacity 0.3s ease;
      pointer-events: none;
    }

    .cdcalc-guide-tab::after {
      content: '';
      width: 46px;
      height: 24px;
      flex-shrink: 0;
      background: #fff;
      border-radius: 16px 16px 16px 2px;
      border: 3px solid rgba(15, 44, 42, 0.9);
      box-shadow:
        inset 0 -2px 0 rgba(15, 44, 42, 0.14),
        0 4px 0 rgba(15, 44, 42, 0.28);
      clip-path: polygon(0% 10%, 66% 10%, 66% 0%, 100% 50%, 66% 100%, 66% 90%, 0% 90%);
      transform-origin: 30% 50%;
    }

    .cdcalc-result-card--with-guide[data-guide-peeking='true'] .cdcalc-guide-tab::after {
      animation: cdcalc-guide-arrow-wave 2.8s ease-in-out infinite;
    }

    .cdcalc-guide-tab:focus-visible,
    .cdcalc-result-card--with-guide:hover .cdcalc-guide-tab,
    .cdcalc-result-card--with-guide:focus-within .cdcalc-guide-tab {
      transform: translateX(0);
      box-shadow:
        inset 0 0 0 2px rgba(255, 255, 255, 0.32),
        0 18px 28px rgba(17, 36, 34, 0.32),
        0 0 0 4px rgba(15, 44, 42, 0.12);
    }

    .cdcalc-guide-tab--acetaminophen {
      background: linear-gradient(135deg, #e14747 0%, #9f1b1b 100%);
    }

    .cdcalc-guide-tab--ibuprofen {
      background: linear-gradient(135deg, #f97316 0%, #c2410c 100%);
    }

    .cdcalc-result-card--with-guide[data-guide-peeking='true'] .cdcalc-guide-tab--acetaminophen,
    .cdcalc-result-card--with-guide[data-guide-peeking='true'] .cdcalc-guide-tab--ibuprofen {
      background-position: 0 0;
    }

    @keyframes cdcalc-guide-arrow-wave {
      0%,
      60%,
      100% {
        transform: rotate(0deg) scaleX(1);
      }
      30% {
        transform: rotate(3deg) scaleX(1.08);
      }
      45% {
        transform: rotate(-2deg) scaleX(1.04);
      }
    }

    @media (max-width: 640px) {
      .cdcalc-guide-tab {
        right: -12px;
        bottom: -10px;
        padding: 12px 20px 12px 18px;
        font-size: 0.72rem;
        min-width: 156px;
        transform: translateX(
          calc(
            (1 - var(--cdcalc-guide-reveal-scroll, 0)) *
            (1 + var(--cdcalc-guide-hidden-extra, 0.28)) * 100%
          )
        );
      }

      .cdcalc-result-card--with-guide {
        --cdcalc-guide-hidden-extra: 0.24;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .cdcalc-guide-tab,
      .cdcalc-guide-tab__label {
        transition: none;
      }

      .cdcalc-result-card--with-guide[data-guide-peeking='true'] .cdcalc-guide-tab::after {
        animation: none;
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

    .cdcalc-mini-carousel {
      border: 2px solid rgba(15, 44, 42, 0.12);
      border-radius: 14px;
      background: rgba(228, 244, 240, 0.6);
      padding: 12px;
      display: grid;
      gap: 10px;
    }

    .cdcalc-mini-heading {
      margin: 0;
      font-size: 0.85rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #124643;
    }

    .cdcalc-mini-carousel-track {
      position: relative;
      min-height: 96px;
    }

    .cdcalc-mini-slide {
      display: none;
      margin: 0;
      align-items: center;
      gap: 12px;
    }

    .cdcalc-mini-slide.is-active {
      display: grid;
      grid-template-columns: auto 1fr;
    }

    .cdcalc-mini-slide--custom.is-active {
      display: block;
    }

    .cdcalc-mini-slide--support {
      text-align: center;
    }

    .cdcalc-mini-image {
      width: 72px;
      height: 72px;
      aspect-ratio: 1 / 1;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 8px 18px rgba(15, 44, 42, 0.18);
      display: grid;
      place-items: center;
      padding: 6px;
      overflow: hidden;
    }

    .cdcalc-mini-image img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      transition: transform 0.25s ease;
    }

    @media (hover: hover) {
      .cdcalc-mini-slide:hover .cdcalc-mini-image img,
      .cdcalc-mini-slide:focus-within .cdcalc-mini-image img {
        transform: scale(1.12);
        will-change: transform;
      }
    }

    .cdcalc-mini-figcaption {
      margin: 0;
      font-size: 0.85rem;
      line-height: 1.4;
      color: #124643;
      display: grid;
      gap: 4px;
    }

    .cdcalc-mini-caption {
      font-weight: 700;
    }

    .cdcalc-mini-meta {
      font-size: 0.75rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #35635d;
    }

    .cdcalc-mini-carousel-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .cdcalc-mini-control {
      border: 2px solid #0f2c2a;
      background: #ffffff;
      color: #0f2c2a;
      border-radius: 12px;
      padding: 4px 10px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 4px 0 rgba(15, 44, 42, 0.18);
    }

    .cdcalc-mini-control:focus-visible {
      outline: 3px solid rgba(36, 166, 135, 0.35);
      outline-offset: 2px;
    }

    .cdcalc-mini-control:disabled {
      opacity: 0.4;
      cursor: default;
      box-shadow: none;
    }

    .cdcalc-mini-dots {
      display: flex;
      gap: 6px;
    }

    .cdcalc-mini-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: 1px solid rgba(18, 58, 55, 0.25);
      background: rgba(255, 255, 255, 0.9);
      padding: 0;
      cursor: pointer;
    }

    .cdcalc-mini-dot.is-active {
      background: #24a687;
      border-color: #0f2c2a;
    }

    .cdcalc-mini-carousel-stack {
      display: grid;
      gap: 12px;
    }

    @media (min-width: 560px) {
      .cdcalc-mini-carousel-stack--split {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }
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
        grid-template-columns: 1fr;
      }

      .cdcalc-age-option {
        min-height: 92px;
      }
    }

    .cdcalc-support-wrap {
      border: 2px dashed rgba(18, 58, 55, 0.18);
      border-radius: 16px;
      padding: 12px;
      background: rgba(228, 244, 240, 0.5);
    }

    .cdcalc-support-card {
      display: grid;
      gap: 12px;
      justify-items: center;
      text-align: center;
    }

    .cdcalc-support-button {
      appearance: none;
      border: 3px solid #0f2c2a;
      border-radius: 999px;
      background: linear-gradient(135deg, rgba(36, 166, 135, 0.95), rgba(18, 70, 67, 0.95));
      color: #ffffff;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: none;
      padding: 12px 18px;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      box-shadow: 0 4px 0 rgba(15, 44, 42, 0.25);
      transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
    }

    .cdcalc-support-button:hover,
    .cdcalc-support-button:focus-visible {
      transform: translateY(-1px);
      box-shadow: 0 6px 0 rgba(15, 44, 42, 0.28);
      background: linear-gradient(135deg, rgba(36, 166, 135, 1), rgba(18, 70, 67, 0.9));
    }

    .cdcalc-support-button:focus-visible {
      outline: 3px solid rgba(255, 232, 168, 0.6);
      outline-offset: 3px;
    }

    .cdcalc-support-lines {
      display: grid;
      gap: 4px;
      text-align: left;
    }

    .cdcalc-support-line {
      font-size: 0.85rem;
      font-weight: 800;
    }

    .cdcalc-support-sub {
      font-size: 0.72rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.9);
    }

    .cdcalc-support-button img {
      width: 48px;
      height: 48px;
    }

    .cdcalc-support-copy {
      margin: 0;
      font-size: 0.82rem;
      line-height: 1.4;
      color: #124643;
    }

    @media (min-width: 560px) {
      .cdcalc-support-button img {
        width: 56px;
        height: 56px;
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
  // - 12+ years: adult ceilings of 1000 mg acetaminophen and 800 mg ibuprofen.
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

  function buildMarkup(strings, ids) {
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
    const calculateStepLabel = form.calculateStep || '';
    return `
      <div class="cdcalc-card" data-calculator-card aria-labelledby="${ids.title}" role="group">
        <div class="cdcalc-header">
          <h2 class="cdcalc-title" id="${ids.title}">${strings.title}</h2>
        </div>
        <form class="cdcalc-form" data-calculator-form novalidate>
          <div class="cdcalc-group" aria-live="polite">
            <div class="cdcalc-group-title">${form.ageLabel}</div>
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
            <div class="cdcalc-group-title">${form.weightLabel}</div>
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
                ? `<p class="cdcalc-step-callout">${calculateStepLabel}</p>`
                : ''
            }
            <button type="submit" class="cdcalc-button" data-submit>${form.calculate}</button>
          </div>
          <div class="cdcalc-results" data-results role="region" aria-live="polite" aria-label="${strings.accessibility.resultsRegion}"></div>
        </form>
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

  function renderMiniCarousel(slides, options = {}) {
    const { label = '', heading = '' } = options;
    if (!Array.isArray(slides) || slides.length === 0) {
      return '';
    }

    const labelAttribute = label ? ` data-mini-label="${escapeHtml(label)}"` : '';
    const headingMarkup = heading
      ? `<h4 class="cdcalc-mini-heading">${escapeHtml(heading)}</h4>`
      : '';
    const slidesMarkup = slides
      .map((slide) => {
        if (!slide || typeof slide !== 'object') {
          return '';
        }
        const classNames = ['cdcalc-mini-slide'];
        const customMarkup = typeof slide.html === 'string' && slide.html.trim() !== '';
        if (customMarkup) {
          classNames.push('cdcalc-mini-slide--custom');
        }
        if (typeof slide.className === 'string' && slide.className.trim() !== '') {
          classNames.push(slide.className.trim());
        }
        const classAttribute = classNames.join(' ');
        if (customMarkup) {
          return `
          <div class="${classAttribute}" aria-hidden="true">
            ${slide.html}
          </div>
        `;
        }
        const caption = slide.caption
          ? `<span class="cdcalc-mini-caption">${escapeHtml(slide.caption)}</span>`
          : '';
        const meta = slide.meta
          ? `<span class="cdcalc-mini-meta">${escapeHtml(slide.meta)}</span>`
          : '';
        const altText = slide.alt ? escapeHtml(slide.alt) : '';
        const src = slide.src ? escapeHtml(slide.src) : '';
        return `
          <figure class="${classAttribute}" aria-hidden="true">
            <div class="cdcalc-mini-image">
              <img src="${src}" alt="${altText}" loading="lazy" decoding="async" />
            </div>
            <figcaption class="cdcalc-mini-figcaption">
              ${caption}
              ${meta}
            </figcaption>
          </figure>
        `;
      })
      .join('');

    const prevLabel = label ? `Show previous ${label}` : 'Show previous item';
    const nextLabel = label ? `Show next ${label}` : 'Show next item';

    return `
      <div class="cdcalc-mini-carousel" data-mini-carousel${labelAttribute}>
        ${headingMarkup}
        <div class="cdcalc-mini-carousel-track">
          ${slidesMarkup}
        </div>
        <div class="cdcalc-mini-carousel-controls">
          <button type="button" class="cdcalc-mini-control" data-mini-carousel-prev aria-label="${escapeHtml(prevLabel)}">‹</button>
          <div class="cdcalc-mini-dots" role="tablist"></div>
          <button type="button" class="cdcalc-mini-control" data-mini-carousel-next aria-label="${escapeHtml(nextLabel)}">›</button>
        </div>
      </div>
    `;
  }

  function renderSupportCarousel(strings) {
    if (!strings || typeof strings !== 'object') {
      return '';
    }

    const supportStrings = strings.support || {};
    if (supportStrings.enabled === false) {
      return '';
    }

    const slides = [];
    const donateButtonAria = supportStrings.donateButtonAria || 'Support CloseDose with a donation on Givebutter';
    const donateLine1 = supportStrings.donateButtonLine1 || '';
    const donateLine2 = supportStrings.donateButtonLine2 || '';
    const donateSub = supportStrings.donateButtonSub || '';
    const donateCopy = supportStrings.donateCopy || '';

    let donateLinesMarkup = [donateLine1, donateLine2]
      .map((line) => (line ? `<span class="cdcalc-support-line">${escapeHtml(line)}</span>` : ''))
      .join('');
    const hasDonateSub = Boolean(donateSub && donateSub.trim());
    const donateSubMarkup = hasDonateSub
      ? `<span class="cdcalc-support-sub">${escapeHtml(donateSub)}</span>`
      : '';

    if (!donateLinesMarkup.trim() && !hasDonateSub) {
      donateLinesMarkup = `<span class="cdcalc-support-line">${escapeHtml(
        supportStrings.heading || 'Support CloseDose',
      )}</span>`;
    }

    const donateButtonMarkup = `
      <button
        type="button"
        class="cdcalc-support-button"
        data-cdcalc-donate
        data-gb-account="r8SGiZ0RhFRoIkXu"
        data-gb-campaign="93Xrjv"
        aria-label="${escapeHtml(donateButtonAria)}"
      >
        <span class="cdcalc-support-lines">
          ${donateLinesMarkup}${donateSubMarkup}
        </span>
        <img src="images/Pig/piggybank-color.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
      </button>
    `;

    const donateCopyMarkup = donateCopy
      ? `<p class="cdcalc-support-copy">${escapeHtml(donateCopy)}</p>`
      : '';

    slides.push({
      className: 'cdcalc-mini-slide--support',
      html: `
        <div class="cdcalc-support-card">
          ${donateButtonMarkup}
          ${donateCopyMarkup}
        </div>
      `,
    });

    SUPPORT_PARTNER_SLIDES.forEach((slide) => {
      slides.push(slide);
    });

    return renderMiniCarousel(slides, {
      label: supportStrings.label || 'support options',
      heading: supportStrings.heading || 'Support CloseDose',
    });
  }

  function initializeMiniCarousels(scope) {
    const root = scope || document;
    if (!root) {
      return;
    }

    const carousels = root.querySelectorAll('[data-mini-carousel]');
    carousels.forEach((carousel) => {
      if (!carousel || carousel.dataset.miniCarouselReady === 'true') {
        return;
      }

      const slides = Array.from(carousel.querySelectorAll('.cdcalc-mini-slide'));
      if (!slides.length) {
        return;
      }

      const prevButton = carousel.querySelector('[data-mini-carousel-prev]');
      const nextButton = carousel.querySelector('[data-mini-carousel-next]');
      const dotsContainer = carousel.querySelector('.cdcalc-mini-dots');
      const label = carousel.dataset.miniLabel || '';
      const dots = [];

      if (dotsContainer) {
        dotsContainer.innerHTML = '';
      }

      const hasMultipleSlides = slides.length > 1;

      const goToSlide = (targetIndex) => {
        if (!slides.length) {
          return;
        }
        const normalizedIndex = ((targetIndex % slides.length) + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
          const isActive = slideIndex === normalizedIndex;
          slide.classList.toggle('is-active', isActive);
          slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        });

        dots.forEach((dot, dotIndex) => {
          const isActive = dotIndex === normalizedIndex;
          dot.classList.toggle('is-active', isActive);
          dot.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        const controlsDisabled = slides.length <= 1;
        if (prevButton) {
          prevButton.disabled = controlsDisabled;
        }
        if (nextButton) {
          nextButton.disabled = controlsDisabled;
        }
        if (dotsContainer) {
          dotsContainer.style.display = slides.length > 1 ? 'flex' : 'none';
        }

        carousel.dataset.miniCarouselIndex = String(normalizedIndex);
      };

      slides.forEach((slide) => {
        slide.classList.remove('is-active');
        slide.setAttribute('aria-hidden', 'true');
      });

      if (dotsContainer && hasMultipleSlides) {
        slides.forEach((_, slideIndex) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'cdcalc-mini-dot';
          dot.setAttribute(
            'aria-label',
            label
              ? `Show ${label} option ${slideIndex + 1}`
              : `Show option ${slideIndex + 1}`
          );
          dot.setAttribute('aria-pressed', 'false');
          dot.addEventListener('click', () => {
            goToSlide(slideIndex);
          });
          dotsContainer.appendChild(dot);
          dots.push(dot);
        });
      }

      if (prevButton) {
        prevButton.addEventListener('click', () => {
          const currentIndex = parseInt(carousel.dataset.miniCarouselIndex || '0', 10) || 0;
          goToSlide(currentIndex - 1);
        });
      }

      if (nextButton) {
        nextButton.addEventListener('click', () => {
          const currentIndex = parseInt(carousel.dataset.miniCarouselIndex || '0', 10) || 0;
          goToSlide(currentIndex + 1);
        });
      }

      goToSlide(0);
      carousel.dataset.miniCarouselReady = 'true';
      carousel.classList.add('cdcalc-mini-ready');
    });
  }

  function initializeSupportInteractions(scope) {
    const root = scope || document;
    if (!root) {
      return;
    }

    const donateButtons = root.querySelectorAll('[data-cdcalc-donate]');
    donateButtons.forEach((button) => {
      if (!button || button.dataset.cdcalcDonateReady === 'true') {
        return;
      }

      const campaignId = button.getAttribute('data-gb-campaign') || '93Xrjv';
      const fallbackUrl = `https://givebutter.com/${campaignId}`;
      if (!button.getAttribute('data-fallback-href')) {
        button.setAttribute('data-fallback-href', fallbackUrl);
      }

      if (button.dataset.cdcalcDonateFallbackHandled !== 'true') {
        button.addEventListener('click', (event) => {
          const givebutterReady =
            typeof window !== 'undefined' &&
            window.Givebutter &&
            typeof window.Givebutter.invoke === 'function';
          if (givebutterReady) {
            return;
          }
          const fallback = button.getAttribute('data-fallback-href');
          if (fallback) {
            event.preventDefault();
            window.open(fallback, '_blank', 'noopener');
          }
        });
        button.dataset.cdcalcDonateFallbackHandled = 'true';
      }

      button.dataset.cdcalcDonateReady = 'true';
    });
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
      const acetaminophenLiquidCarousel = renderMiniCarousel(
        MINI_CAROUSEL_CONTENT.acetaminophenLiquid,
        {
          label: "acetaminophen products",
          heading: '160 mg / 5 mL liquids',
        }
      );
      const acetaminophenAlternateCarousel = renderMiniCarousel(
        MINI_CAROUSEL_CONTENT.acetaminophenOther,
        {
          label: 'alternate acetaminophen products',
          heading: 'Chewables, meltaways & more',
        }
      );
      const acetaminophenCarouselGroup = [
        acetaminophenLiquidCarousel,
        acetaminophenAlternateCarousel,
      ]
        .filter(Boolean)
        .join('');
      const acetaminophenCarouselMarkup = acetaminophenCarouselGroup
        ? `<div class="cdcalc-mini-carousel-stack cdcalc-mini-carousel-stack--split">${acetaminophenCarouselGroup}</div>`
        : '';

      const group = [];
      group.push(`
        <article class="cdcalc-result-card cdcalc-result-card--with-guide">
          <h3>${strings.results.acetaminophenInfantTitle}</h3>
          <p>${formatString(strings.results.acetaminophenInfantBody, {
            ml: acetaMl.toFixed(1),
            mg: acetaMg.toFixed(0),
          })}</p>
          <p>${formatString(strings.warnings.acetaminophenMax, { max: ACETA_MAX_MG_INFANT })}</p>
          ${acetaminophenCarouselMarkup}
          <a
            class="cdcalc-guide-tab cdcalc-guide-tab--acetaminophen"
            href="/medication-guides.html#acetaminophen"
            aria-label="More formulations"
          >
            <span class="cdcalc-guide-tab__label" aria-hidden="true">More formulations</span>
          </a>
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
      const acetaminophenLiquidCarousel = renderMiniCarousel(
        MINI_CAROUSEL_CONTENT.acetaminophenLiquid,
        {
          label: "acetaminophen products",
          heading: '160 mg / 5 mL liquids',
        }
      );
      const acetaminophenAlternateCarousel = renderMiniCarousel(
        MINI_CAROUSEL_CONTENT.acetaminophenOther,
        {
          label: 'alternate acetaminophen products',
          heading: 'Chewables, meltaways & more',
        }
      );
      const acetaminophenCarouselGroup = [
        acetaminophenLiquidCarousel,
        acetaminophenAlternateCarousel,
      ]
        .filter(Boolean)
        .join('');
      const acetaminophenCarouselMarkup = acetaminophenCarouselGroup
        ? `<div class="cdcalc-mini-carousel-stack cdcalc-mini-carousel-stack--split">${acetaminophenCarouselGroup}</div>`
        : '';
      const ibuprofenChildrenCarousel = renderMiniCarousel(
        MINI_CAROUSEL_CONTENT.ibuprofenChildren,
        {
          label: "children's ibuprofen products",
          heading: "Children's 100 mg / 5 mL",
        }
      );
      const ibuprofenInfantCarousel = renderMiniCarousel(
        MINI_CAROUSEL_CONTENT.ibuprofenInfant,
        {
          label: "infant ibuprofen products",
          heading: 'Infant 50 mg / 1.25 mL',
        }
      );
      const ibuprofenOtherCarousel = renderMiniCarousel(
        MINI_CAROUSEL_CONTENT.ibuprofenOther,
        {
          label: 'other ibuprofen products',
          heading: 'Tablets, capsules & chewables',
        }
      );
      const ibuprofenCarouselGroup = [
        ibuprofenChildrenCarousel,
        ibuprofenInfantCarousel,
        ibuprofenOtherCarousel,
      ]
        .filter(Boolean)
        .join('');
      const ibuprofenCarouselMarkup = ibuprofenCarouselGroup
        ? `<div class="cdcalc-mini-carousel-stack cdcalc-mini-carousel-stack--split">${ibuprofenCarouselGroup}</div>`
        : '';

      const group = [];
      group.push(`
        <article class="cdcalc-result-card cdcalc-result-card--with-guide">
          <h3>${strings.results.acetaminophenOlderTitle}</h3>
          <p>${formatString(strings.results.acetaminophenOlderBody, {
            ml: acetaMl.toFixed(1),
            mg: acetaMg.toFixed(0),
          })}</p>
          ${acetaminophenCarouselMarkup}
          <a
            class="cdcalc-guide-tab cdcalc-guide-tab--acetaminophen"
            href="/medication-guides.html#acetaminophen"
            aria-label="More formulations"
          >
            <span class="cdcalc-guide-tab__label" aria-hidden="true">More formulations</span>
          </a>
          ${renderWarning(strings, {
            body: formatString(strings.warnings.acetaminophenMax, { max: ACETA_MAX_SINGLE_DOSE_MG }),
            tone: 'orange',
          })}
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
        <article class="cdcalc-result-card cdcalc-result-card--with-guide">
          <h3>${strings.results.ibuprofenTitle}</h3>
          <p>${formatString(strings.results.ibuprofenBody100, {
            ml: ibuMl100.toFixed(1),
            mg: ibuMg.toFixed(0),
          })}</p>
          <p>${formatString(strings.results.ibuprofenBody50, {
            ml: ibuMl50.toFixed(1),
            mg: ibuMg.toFixed(0),
          })}</p>
          ${ibuprofenCarouselMarkup}
          <a
            class="cdcalc-guide-tab cdcalc-guide-tab--ibuprofen"
            href="/medication-guides.html#ibuprofen"
            aria-label="More formulations"
          >
            <span class="cdcalc-guide-tab__label" aria-hidden="true">More formulations</span>
          </a>
          ${renderWarning(strings, {
            body: formatString(strings.warnings.ibuprofenMax, { max: IBU_MAX_SINGLE_DOSE_MG }),
            tone: 'orange',
          })}
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

      group.push(
        renderWarning(strings, {
          title: strings.warnings.doseSpacingTitle,
          body: formatString(strings.warnings.doseSpacingBody, {
            acetaminophenMax: ACETA_MAX_SINGLE_DOSE_MG,
            ibuprofenMax: IBU_MAX_SINGLE_DOSE_MG,
          }),
          tone: 'teal',
        })
      );

      resultBlocks.push(`<div class="cdcalc-result-group">${group.join('')}</div>`);
    }

    const supportCarouselMarkup = renderSupportCarousel(strings);
    if (supportCarouselMarkup) {
      resultBlocks.push(`<div class="cdcalc-support-wrap">${supportCarouselMarkup}</div>`);
    }

    elements.results.innerHTML = resultBlocks.join('');
    initializeMiniCarousels(elements.results);
    initializeSupportInteractions(elements.results);
    notifyResultsRendered();
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

    host.innerHTML = buildMarkup(strings, ids);
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
