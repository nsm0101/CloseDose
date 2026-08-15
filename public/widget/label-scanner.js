/*
 * CloseDose — bottle label scanner.
 *
 * Lets a caregiver photograph the front of an OTC fever/pain medicine bottle
 * and get back a plain-English answer to the two questions that actually cause
 * dosing errors at 3am:
 *
 *     1. Which medicine is this?           (acetaminophen vs ibuprofen)
 *     2. How strong is it?                 (the concentration on the label)
 *
 * Everything runs on the device. The photo is drawn to a canvas, OCR'd with
 * Tesseract.js, and matched against a small table of US OTC products. The
 * image is never uploaded, never stored, and is released as soon as the read
 * finishes. That is a deliberate choice for a children's health product.
 *
 * SAFETY POSTURE — read before editing:
 *   - OCR is treated as a *suggestion*, never as truth. Every result is shown
 *     back to the caregiver for visual confirmation against the bottle in
 *     their hand before it is used for anything.
 *   - The scanner identifies the product. It does not calculate a dose. Dose
 *     math stays in the calculator, which requires a weight.
 *   - An unreadable photo must fail loudly to the manual picker. Guessing is
 *     worse than asking.
 *
 * Usage:  <script src="widget/label-scanner.js" defer></script>
 * Mounts into [data-label-scanner], or self-inserts above the calculator card.
 */
(function (global) {
  'use strict';

  if (global.CloseDoseLabelScanner) return;

  /*
   * The OCR engine is loaded from jsDelivr on demand — nothing is fetched
   * until the caregiver actually taps "Scan the bottle", so the page weight
   * is unchanged for everyone else. If the CDN is ever unreachable the
   * scanner degrades to the manual picker rather than failing shut.
   *
   * To self-host instead (larger repo, no third-party dependency at runtime),
   * set window.CLOSEDOSE_SCANNER_CONFIG before this script loads:
   *
   *     window.CLOSEDOSE_SCANNER_CONFIG = {
   *       scriptUrl: '/vendor/tess/tesseract.min.js',
   *       workerPath: '/vendor/tess/worker.min.js',
   *       corePath:   '/vendor/tess/',
   *       langPath:   '/vendor/tess/'
   *     };
   */
  var CONFIG = global.CLOSEDOSE_SCANNER_CONFIG || {};

  var TESSERACT_CDN =
    CONFIG.scriptUrl ||
    'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';

  /* ------------------------------------------------------------------ *
   * Product table
   *
   * Only US OTC antipyretic/analgesic products a caregiver would plausibly
   * be holding. `match` scores a normalised OCR string; the highest scoring
   * product wins, provided it clears MIN_CONFIDENCE.
   * ------------------------------------------------------------------ */

  var PRODUCTS = [
    {
      id: 'apap-susp-160-5',
      drug: 'Acetaminophen',
      brand: 'Tylenol (Infants’ or Children’s)',
      form: 'Liquid suspension',
      strength: '160 mg per 5 mL',
      calcNote:
        'This is the standard strength CloseDose uses for acetaminophen.',
      tone: 'ok',
      ingredient: 'acetaminophen',
      concentration: { mg: 160, ml: 5 },
    },
    {
      id: 'apap-drops-80-08',
      drug: 'Acetaminophen',
      brand: 'Older concentrated infant drops',
      form: 'Concentrated drops',
      strength: '80 mg per 0.8 mL',
      calcNote:
        'These concentrated drops were discontinued in the US in 2011 because the strength was so easy to mix up with the 160 mg / 5 mL liquid. If this bottle is still in your cabinet, check the expiration date and consider replacing it. Do not use a CloseDose dose calculated for 160 mg / 5 mL with this bottle — the volumes are completely different.',
      tone: 'danger',
      ingredient: 'acetaminophen',
      concentration: { mg: 80, ml: 0.8 },
    },
    {
      id: 'apap-chew-160',
      drug: 'Acetaminophen',
      brand: 'Children’s or Jr. chewable',
      form: 'Chewable tablet',
      strength: '160 mg per tablet',
      calcNote:
        'Chewable tablets are dosed in whole tablets, not mL. Only for children who can reliably chew and swallow tablets.',
      tone: 'ok',
      ingredient: 'acetaminophen',
      concentration: { mg: 160, unit: 'tablet' },
    },
    {
      id: 'apap-adult-325',
      drug: 'Acetaminophen',
      brand: 'Regular Strength (adult)',
      form: 'Tablet',
      strength: '325 mg per tablet',
      calcNote:
        'This is an adult tablet. Do not use it for a young child — use a children’s liquid or chewable and confirm with your pediatrician.',
      tone: 'warn',
      ingredient: 'acetaminophen',
      concentration: { mg: 325, unit: 'tablet' },
    },
    {
      id: 'apap-adult-500',
      drug: 'Acetaminophen',
      brand: 'Extra Strength (adult)',
      form: 'Tablet or caplet',
      strength: '500 mg per tablet',
      calcNote:
        'This is an adult tablet. Do not use it for a young child — use a children’s liquid or chewable and confirm with your pediatrician.',
      tone: 'warn',
      ingredient: 'acetaminophen',
      concentration: { mg: 500, unit: 'tablet' },
    },
    {
      id: 'ibu-susp-100-5',
      drug: 'Ibuprofen',
      brand: 'Children’s Motrin or Advil',
      form: 'Liquid suspension',
      strength: '100 mg per 5 mL',
      calcNote:
        'This is the strength CloseDose recommends for ibuprofen. Not for infants under 6 months.',
      tone: 'ok',
      ingredient: 'ibuprofen',
      concentration: { mg: 100, ml: 5 },
    },
    {
      id: 'ibu-drops-50-125',
      drug: 'Ibuprofen',
      brand: 'Infants’ Motrin or Advil drops',
      form: 'Concentrated drops',
      strength: '50 mg per 1.25 mL',
      calcNote:
        'These infant drops are more concentrated than the children’s liquid. A dose calculated for 100 mg / 5 mL will be the wrong volume for this bottle — make sure you are reading the right line in the calculator. Not for infants under 6 months.',
      tone: 'warn',
      ingredient: 'ibuprofen',
      concentration: { mg: 50, ml: 1.25 },
    },
    {
      id: 'ibu-chew-100',
      drug: 'Ibuprofen',
      brand: 'Junior Strength chewable',
      form: 'Chewable tablet',
      strength: '100 mg per tablet',
      calcNote:
        'Chewable tablets are dosed in whole tablets, not mL. Only for children who can reliably chew and swallow tablets.',
      tone: 'ok',
      ingredient: 'ibuprofen',
      concentration: { mg: 100, unit: 'tablet' },
    },
    {
      id: 'ibu-adult-200',
      drug: 'Ibuprofen',
      brand: 'Advil or Motrin IB (adult)',
      form: 'Tablet, caplet, or gel cap',
      strength: '200 mg per tablet',
      calcNote:
        'This is an adult tablet. Do not use it for a young child — use a children’s liquid or chewable and confirm with your pediatrician.',
      tone: 'warn',
      ingredient: 'ibuprofen',
      concentration: { mg: 200, unit: 'tablet' },
    },
  ];

  /* Products offered in the manual picker, in the order a parent is most
     likely to be holding one. */
  var MANUAL_ORDER = [
    'apap-susp-160-5',
    'ibu-susp-100-5',
    'ibu-drops-50-125',
    'apap-chew-160',
    'ibu-chew-100',
    'apap-drops-80-08',
    'apap-adult-500',
    'apap-adult-325',
    'ibu-adult-200',
  ];

  var MIN_CONFIDENCE = 3; // ingredient hit (2) + at least one weak signal

  /* ------------------------------------------------------------------ *
   * Text normalisation + matching
   * ------------------------------------------------------------------ */

  /*
   * OCR on a glossy, curved bottle label reliably confuses a handful of
   * glyph pairs. We only apply digit-restoring substitutions inside runs that
   * already look numeric, so we don't corrupt real words.
   */
  function normalise(raw) {
    var text = String(raw || '')
      .toUpperCase()
      .replace(/[‘’“”]/g, '')
      .replace(/[^A-Z0-9./\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Repair digits inside numeric-looking tokens: "16O MG" -> "160 MG".
    text = text.replace(/\b[0-9OISBZlL.]{2,6}\b(?=\s*(MG|ML|M[GL]))/g, function (tok) {
      return tok
        .replace(/O/g, '0')
        .replace(/I/g, '1')
        .replace(/L/g, '1')
        .replace(/S/g, '5')
        .replace(/B/g, '8')
        .replace(/Z/g, '2');
    });

    // Unify unit spellings: ML, M L, MLS, MILLILITER(S) -> ML
    text = text
      .replace(/\bMILLI\s?LITERS?\b/g, 'ML')
      .replace(/\bMILLI\s?GRAMS?\b/g, 'MG')
      .replace(/\bM\s+L\b/g, 'ML')
      .replace(/\bM\s+G\b/g, 'MG')
      .replace(/\bMLS\b/g, 'ML')
      .replace(/\bMGS\b/g, 'MG');

    return text;
  }

  var INGREDIENT_TERMS = {
    acetaminophen: [
      'ACETAMINOPHEN',
      'ACETAMINOPHIN',
      'PARACETAMOL',
      'APAP',
      'TYLENOL',
      'FEVERALL',
    ],
    ibuprofen: ['IBUPROFEN', 'IBUPROFIN', 'MOTRIN', 'ADVIL'],
  };

  function detectIngredient(text) {
    var found = [];
    Object.keys(INGREDIENT_TERMS).forEach(function (key) {
      var hit = INGREDIENT_TERMS[key].some(function (term) {
        return text.indexOf(term) !== -1;
      });
      if (hit) found.push(key);
    });
    return found;
  }

  /*
   * Pull every "<number> MG" / "<number> ML" pair out of the text, plus
   * explicit ratios like "160 MG PER 5 ML" or "160MG/5ML".
   */
  function extractNumbers(text) {
    var mg = [];
    var ml = [];
    var ratios = [];

    var ratioRe = /(\d+(?:\.\d+)?)\s*MG\s*(?:PER|\/|IN|-)?\s*(\d+(?:\.\d+)?)\s*ML/g;
    var m;
    while ((m = ratioRe.exec(text)) !== null) {
      ratios.push({ mg: parseFloat(m[1]), ml: parseFloat(m[2]) });
    }

    var mgRe = /(\d+(?:\.\d+)?)\s*MG\b/g;
    while ((m = mgRe.exec(text)) !== null) mg.push(parseFloat(m[1]));

    var mlRe = /(\d+(?:\.\d+)?)\s*ML\b/g;
    while ((m = mlRe.exec(text)) !== null) ml.push(parseFloat(m[1]));

    return { mg: mg, ml: ml, ratios: ratios };
  }

  function hasForm(text, product) {
    if (product.concentration.unit === 'tablet') {
      return /CHEWABLE|TABLET|CAPLET|MELTAWAY|GEL\s?CAP|SOFTGEL/.test(text);
    }
    return /SUSPENSION|LIQUID|ORAL\s?SOLUTION|DROPS|SYRUP|CONCENTRATED/.test(text);
  }

  function scoreProduct(product, text, nums) {
    var ingredients = detectIngredient(text);
    if (ingredients.indexOf(product.ingredient) === -1) return 0;

    var score = 2; // correct active ingredient
    var conc = product.concentration;

    // Strongest signal: an explicit mg/mL ratio that matches exactly.
    var ratioMatch = nums.ratios.some(function (r) {
      return conc.ml && r.mg === conc.mg && Math.abs(r.ml - conc.ml) < 0.01;
    });
    if (ratioMatch) score += 5;

    // Both numbers present somewhere on the label.
    if (conc.ml) {
      var mgSeen = nums.mg.indexOf(conc.mg) !== -1;
      var mlSeen = nums.ml.some(function (v) {
        return Math.abs(v - conc.ml) < 0.01;
      });
      if (mgSeen && mlSeen && !ratioMatch) score += 3;
      else if (mgSeen) score += 1;
    } else {
      // Tablet: the mg number alone is the signal.
      if (nums.mg.indexOf(conc.mg) !== -1) score += 3;
    }

    if (hasForm(text, product)) score += 1;

    // Brand-name corroboration.
    if (/INFANT/.test(text) && /drops|Infants/i.test(product.brand)) score += 1;
    if (/CHILDREN/.test(text) && /Children/i.test(product.brand)) score += 1;
    if (/JUNIOR|JR/.test(text) && /Jr|Junior/i.test(product.brand)) score += 1;

    return score;
  }

  function identify(rawText) {
    var text = normalise(rawText);
    var nums = extractNumbers(text);

    var scored = PRODUCTS.map(function (p) {
      return { product: p, score: scoreProduct(p, text, nums) };
    })
      .filter(function (s) {
        return s.score > 0;
      })
      .sort(function (a, b) {
        return b.score - a.score;
      });

    var ingredients = detectIngredient(text);
    var best = scored[0] || null;
    var runnerUp = scored[1] || null;

    // A near-tie between two different strengths of the same drug is exactly
    // the situation where a confident answer is dangerous. Force confirmation.
    var ambiguous =
      !!(best && runnerUp && best.score - runnerUp.score <= 1);

    return {
      text: text,
      ingredients: ingredients,
      best: best && best.score >= MIN_CONFIDENCE ? best.product : null,
      score: best ? best.score : 0,
      ambiguous: ambiguous,
      alternatives: scored.slice(0, 3).map(function (s) {
        return s.product;
      }),
    };
  }

  /* ------------------------------------------------------------------ *
   * Image preprocessing
   *
   * Tesseract does markedly better on a downscaled, greyscale, contrast-
   * stretched image than on a 12-megapixel phone photo. This also keeps the
   * read fast enough to be usable one-handed.
   * ------------------------------------------------------------------ */

  var MAX_EDGE = 1600;

  function preprocess(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        try {
          var scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
          var w = Math.round(img.width * scale);
          var h = Math.round(img.height * scale);

          var canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(img, 0, 0, w, h);

          var data = ctx.getImageData(0, 0, w, h);
          var px = data.data;
          var i;

          // Greyscale (luma) and gather a histogram for contrast stretching.
          var hist = new Uint32Array(256);
          for (i = 0; i < px.length; i += 4) {
            var v = (px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114) | 0;
            px[i] = px[i + 1] = px[i + 2] = v;
            hist[v]++;
          }

          // Clip the darkest/lightest 1% and stretch what's left to 0-255.
          var total = w * h;
          var clip = total * 0.01;
          var lo = 0;
          var hi = 255;
          var acc = 0;
          for (i = 0; i < 256; i++) {
            acc += hist[i];
            if (acc > clip) { lo = i; break; }
          }
          acc = 0;
          for (i = 255; i >= 0; i--) {
            acc += hist[i];
            if (acc > clip) { hi = i; break; }
          }
          var range = Math.max(1, hi - lo);
          for (i = 0; i < px.length; i += 4) {
            var s = ((px[i] - lo) * 255) / range;
            s = s < 0 ? 0 : s > 255 ? 255 : s;
            px[i] = px[i + 1] = px[i + 2] = s;
          }

          ctx.putImageData(data, 0, 0);
          URL.revokeObjectURL(url);
          resolve({ canvas: canvas, width: w, height: h });
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('Could not read that image.'));
      };
      img.src = url;
    });
  }

  /* ------------------------------------------------------------------ *
   * OCR engine (lazy loaded)
   * ------------------------------------------------------------------ */

  var tesseractPromise = null;

  function loadTesseract() {
    if (tesseractPromise) return tesseractPromise;
    tesseractPromise = new Promise(function (resolve, reject) {
      if (global.Tesseract) return resolve(global.Tesseract);
      var s = document.createElement('script');
      s.src = TESSERACT_CDN;
      s.async = true;
      function engineError(message) {
        var err = new Error(message);
        err.code = 'ENGINE';
        return err;
      }
      s.onload = function () {
        if (global.Tesseract) resolve(global.Tesseract);
        else reject(engineError('Scanner failed to load.'));
      };
      s.onerror = function () {
        tesseractPromise = null; // allow a retry on the next tap
        reject(engineError('Scanner failed to load. Check your connection.'));
      };
      document.head.appendChild(s);
    });
    return tesseractPromise;
  }

  function runOcr(canvas, onProgress) {
    return loadTesseract().then(function (Tesseract) {
      var opts = {
        logger: function (m) {
          if (m && m.status === 'recognizing text' && typeof m.progress === 'number') {
            onProgress(m.progress);
          }
        },
      };
      if (CONFIG.workerPath) opts.workerPath = CONFIG.workerPath;
      if (CONFIG.corePath) opts.corePath = CONFIG.corePath;
      if (CONFIG.langPath) opts.langPath = CONFIG.langPath;

      return Tesseract.recognize(canvas, 'eng', opts).then(function (res) {
        return (res && res.data && res.data.text) || '';
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Styles
   * ------------------------------------------------------------------ */

  var CSS = [
    '.cdscan{--cdscan-fg:var(--ink-900,#0f2c2a);--cdscan-accent:var(--teal-500,#1f8f7b);',
    'background:var(--card-bg,#fff);border:var(--card-border,1px solid rgba(15,44,42,.1));',
    'border-radius:var(--card-radius,16px);box-shadow:var(--shadow-card,0 4px 12px rgba(13,52,82,.1));',
    'padding:var(--space-5,24px);color:var(--cdscan-fg);font-family:var(--font-ui,system-ui,sans-serif);}',

    '.cdscan__head{display:flex;gap:12px;align-items:flex-start;}',
    '.cdscan__glyph{flex:0 0 auto;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;',
    'background:rgba(36,166,135,.14);color:var(--teal-500,#1f8f7b);}',
    '.cdscan__glyph svg{width:22px;height:22px;}',
    '.cdscan__title{margin:0;font-size:var(--text-lg,1.1rem);font-weight:800;line-height:1.25;}',
    '.cdscan__sub{margin:4px 0 0;font-size:var(--text-sm,.85rem);opacity:.8;line-height:1.5;}',

    '.cdscan__actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px;}',
    '.cdscan__btn{appearance:none;border:0;cursor:pointer;font:inherit;font-weight:800;',
    'border-radius:var(--radius-pill,999px);padding:13px 20px;min-height:48px;display:inline-flex;',
    'align-items:center;gap:8px;transition:transform .15s var(--ease-out,ease),box-shadow .15s;}',
    '.cdscan__btn:active{transform:translateY(1px);}',
    '.cdscan__btn:focus-visible{outline:3px solid var(--cdscan-accent);outline-offset:2px;}',
    '.cdscan__btn--primary{background:var(--cdscan-accent);color:#fff;box-shadow:0 4px 0 rgba(15,44,42,.28);}',
    '.cdscan__btn--ghost{background:transparent;color:var(--cdscan-fg);',
    'box-shadow:inset 0 0 0 2px var(--card-border-color,rgba(15,44,42,.18));}',
    '.cdscan__file{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;}',

    '.cdscan__panel{margin-top:16px;}',
    '.cdscan__panel[hidden]{display:none;}',

    '.cdscan__progress{display:flex;align-items:center;gap:12px;font-size:var(--text-sm,.85rem);font-weight:700;}',
    '.cdscan__spinner{width:20px;height:20px;border-radius:50%;flex:0 0 auto;',
    'border:3px solid rgba(36,166,135,.25);border-top-color:var(--cdscan-accent);',
    'animation:cdscan-spin .8s linear infinite;}',
    '@keyframes cdscan-spin{to{transform:rotate(360deg);}}',
    '@media (prefers-reduced-motion:reduce){.cdscan__spinner{animation-duration:2s;}}',
    '.cdscan__bar{margin-top:10px;height:6px;border-radius:999px;overflow:hidden;',
    'background:rgba(15,44,42,.1);}',
    '.cdscan__bar>i{display:block;height:100%;width:0;background:var(--cdscan-accent);',
    'transition:width .25s var(--ease-out,ease);}',

    '.cdscan__result{border-radius:var(--radius-md,14px);padding:16px;',
    'border:2px solid rgba(36,166,135,.35);background:rgba(36,166,135,.07);}',
    '.cdscan__result--warn{border-color:rgba(180,83,9,.45);background:rgba(180,83,9,.08);}',
    '.cdscan__result--danger{border-color:rgba(139,17,17,.5);background:rgba(139,17,17,.08);}',
    '.cdscan__eyebrow{font-size:var(--text-2xs,.68rem);font-weight:800;letter-spacing:.08em;',
    'text-transform:uppercase;opacity:.75;margin:0 0 6px;}',
    '.cdscan__drug{margin:0;font-size:var(--text-xl,1.35rem);font-weight:900;line-height:1.15;}',
    '.cdscan__strength{display:inline-block;margin-top:8px;padding:6px 14px;border-radius:999px;',
    'background:var(--cdscan-accent);color:#fff;font-weight:900;font-size:var(--text-md,1rem);',
    'font-variant-numeric:tabular-nums;}',
    '.cdscan__result--warn .cdscan__strength{background:var(--warning,#b45309);}',
    '.cdscan__result--danger .cdscan__strength{background:var(--danger,#8b1111);}',
    '.cdscan__meta{margin:10px 0 0;font-size:var(--text-sm,.85rem);opacity:.85;}',
    '.cdscan__note{margin:12px 0 0;font-size:var(--text-sm,.85rem);line-height:1.55;}',

    '.cdscan__confirm{margin-top:14px;padding-top:14px;border-top:1px dashed var(--card-border-color,rgba(15,44,42,.18));}',
    '.cdscan__confirm p{margin:0 0 10px;font-weight:800;font-size:var(--text-sm,.9rem);}',

    '.cdscan__list{list-style:none;margin:10px 0 0;padding:0;display:grid;gap:8px;}',
    '.cdscan__opt{width:100%;text-align:left;appearance:none;cursor:pointer;font:inherit;',
    'background:var(--surface-subtle,rgba(15,44,42,.04));color:inherit;border:1px solid ',
    'var(--card-border-color,rgba(15,44,42,.12));border-radius:var(--radius-sm,10px);',
    'padding:12px 14px;min-height:48px;transition:background .15s;}',
    '.cdscan__opt:hover{background:var(--surface-hover,rgba(15,44,42,.08));}',
    '.cdscan__opt:focus-visible{outline:3px solid var(--cdscan-accent);outline-offset:2px;}',
    '.cdscan__opt b{display:block;font-weight:800;}',
    '.cdscan__opt span{display:block;font-size:var(--text-xs,.78rem);opacity:.8;margin-top:2px;}',

    '.cdscan__disclaimer{margin:14px 0 0;font-size:var(--text-xs,.78rem);line-height:1.5;opacity:.85;}',
    '.cdscan__error{margin:0;font-weight:700;color:var(--danger,#8b1111);font-size:var(--text-sm,.9rem);}',
    '.cdscan__privacy{margin:10px 0 0;font-size:var(--text-2xs,.7rem);opacity:.7;}',
  ].join('');

  function injectStyles() {
    if (document.getElementById('cdscan-styles')) return;
    var el = document.createElement('style');
    el.id = 'cdscan-styles';
    el.textContent = CSS;
    document.head.appendChild(el);
  }

  /* ------------------------------------------------------------------ *
   * Component
   * ------------------------------------------------------------------ */

  var DISCLAIMER =
    'Always confirm dosing before administering medication. This scan identifies the bottle — it does not replace reading the label.';

  /* Lucide "camera" — the house icon set. No emoji in product UI. */
  var CAMERA_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/>' +
    '<circle cx="12" cy="13" r="3.5"/></svg>';

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function byId(id) {
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].id === id) return PRODUCTS[i];
    }
    return null;
  }

  function track(name, params) {
    try {
      if (typeof global.gtag === 'function') global.gtag('event', name, params || {});
    } catch (e) { /* analytics must never break the scanner */ }
  }

  function create(host) {
    injectStyles();

    host.classList.add('cdscan');
    host.innerHTML = [
      '<div class="cdscan__head">',
      '<span class="cdscan__glyph" aria-hidden="true">' + CAMERA_ICON + '</span>',
      '<div>',
      '<h2 class="cdscan__title">Not sure what you’re holding?</h2>',
      '<p class="cdscan__sub">Take a photo of the front of the bottle. We’ll tell you which medicine it is and how strong it is, so you know which number to use.</p>',
      '</div>',
      '</div>',
      '<div class="cdscan__actions">',
      '<button type="button" class="cdscan__btn cdscan__btn--primary" data-scan>Scan the bottle</button>',
      '<button type="button" class="cdscan__btn cdscan__btn--ghost" data-manual>Pick it from a list</button>',
      '</div>',
      '<input type="file" accept="image/*" capture="environment" class="cdscan__file" data-file aria-hidden="true" tabindex="-1" />',
      '<div class="cdscan__panel" data-panel hidden aria-live="polite"></div>',
      '<p class="cdscan__privacy">The photo is read on your phone and never leaves it.</p>',
    ].join('');

    var panel = host.querySelector('[data-panel]');
    var fileInput = host.querySelector('[data-file]');

    function show(html) {
      panel.hidden = false;
      panel.innerHTML = html;
    }

    function renderProgress(pct) {
      show(
        [
          '<div class="cdscan__progress"><span class="cdscan__spinner" aria-hidden="true"></span>',
          '<span>Reading the label…</span></div>',
          '<div class="cdscan__bar"><i style="width:' + Math.round(pct * 100) + '%"></i></div>',
        ].join('')
      );
    }

    function renderManual(heading) {
      var items = MANUAL_ORDER.map(function (id) {
        var p = byId(id);
        return [
          '<li><button type="button" class="cdscan__opt" data-pick="' + p.id + '">',
          '<b>' + esc(p.drug) + ' — ' + esc(p.strength) + '</b>',
          '<span>' + esc(p.brand) + ' · ' + esc(p.form) + '</span>',
          '</button></li>',
        ].join('');
      }).join('');

      show(
        [
          '<p class="cdscan__eyebrow">' + esc(heading || 'Choose your bottle') + '</p>',
          '<ul class="cdscan__list">' + items + '</ul>',
          '<p class="cdscan__disclaimer">' + DISCLAIMER + '</p>',
        ].join('')
      );
    }

    function renderProduct(product, opts) {
      opts = opts || {};
      var toneClass =
        product.tone === 'danger'
          ? ' cdscan__result--danger'
          : product.tone === 'warn'
          ? ' cdscan__result--warn'
          : '';

      var eyebrow = opts.confirmed
        ? 'Confirmed'
        : opts.uncertain
        ? 'Best guess — please check'
        : 'This looks like';

      var html = [
        '<div class="cdscan__result' + toneClass + '">',
        '<p class="cdscan__eyebrow">' + esc(eyebrow) + '</p>',
        '<h3 class="cdscan__drug">' + esc(product.drug) + '</h3>',
        '<span class="cdscan__strength">' + esc(product.strength) + '</span>',
        '<p class="cdscan__meta">' + esc(product.brand) + ' · ' + esc(product.form) + '</p>',
        '<p class="cdscan__note">' + esc(product.calcNote) + '</p>',
      ];

      if (!opts.confirmed) {
        html.push(
          '<div class="cdscan__confirm">',
          '<p>Does that match the bottle in your hand?</p>',
          '<div class="cdscan__actions" style="margin-top:0">',
          '<button type="button" class="cdscan__btn cdscan__btn--primary" data-confirm="' +
            product.id +
            '">Yes, that’s it</button>',
          '<button type="button" class="cdscan__btn cdscan__btn--ghost" data-manual>No — show the list</button>',
          '</div>',
          '</div>'
        );
      } else {
        html.push(
          '<div class="cdscan__confirm">',
          '<div class="cdscan__actions" style="margin-top:0">',
          '<button type="button" class="cdscan__btn cdscan__btn--primary" data-gocalc>Go to the calculator</button>',
          '<button type="button" class="cdscan__btn cdscan__btn--ghost" data-scan>Scan another bottle</button>',
          '</div>',
          '</div>'
        );
      }

      html.push('</div>');
      html.push('<p class="cdscan__disclaimer">' + DISCLAIMER + '</p>');
      show(html.join(''));
    }

    function renderFailure(message) {
      show(
        [
          '<div class="cdscan__result cdscan__result--warn">',
          '<p class="cdscan__eyebrow">Couldn’t read that one</p>',
          '<p class="cdscan__error">' + esc(message) + '</p>',
          '<p class="cdscan__note">Labels are shiny and cameras are not always kind at 3am. Try filling the frame with the front of the label in good light — or just pick your bottle from the list below.</p>',
          '<div class="cdscan__actions" style="margin-top:12px">',
          '<button type="button" class="cdscan__btn cdscan__btn--primary" data-scan>Try another photo</button>',
          '<button type="button" class="cdscan__btn cdscan__btn--ghost" data-manual>Pick it from a list</button>',
          '</div>',
          '</div>',
        ].join('')
      );
    }

    function handleFile(file) {
      if (!file) return;
      renderProgress(0.02);
      track('label_scan_start');

      preprocess(file)
        .then(function (out) {
          renderProgress(0.1);
          return runOcr(out.canvas, function (p) {
            renderProgress(0.1 + p * 0.9);
          });
        })
        .then(function (text) {
          var res = identify(text);

          if (!res.best) {
            if (res.ingredients.length === 1) {
              // We know the drug but not the strength — that is still useful,
              // but the strength is the dangerous half, so go to the list
              // filtered by what we did read.
              track('label_scan_partial', { ingredient: res.ingredients[0] });
              renderManual(
                'We read "' +
                  res.ingredients[0] +
                  '" but not the strength — pick your bottle'
              );
              return;
            }
            track('label_scan_fail');
            renderFailure('We couldn’t make out the medicine name or the strength.');
            return;
          }

          track('label_scan_match', { product: res.best.id, score: res.score });
          renderProduct(res.best, { uncertain: res.ambiguous || res.score < 6 });
        })
        .catch(function (err) {
          // If the OCR engine itself couldn't load (offline, CDN blocked),
          // there is no point offering "try another photo" — send them
          // straight to the list, which always works.
          if (err && err.code === 'ENGINE') {
            track('label_scan_engine_unavailable');
            renderManual('Scanner is offline — pick your bottle instead');
            return;
          }
          track('label_scan_error');
          renderFailure(
            (err && err.message) || 'Something went wrong reading that photo.'
          );
        });
    }

    fileInput.addEventListener('change', function () {
      var file = fileInput.files && fileInput.files[0];
      fileInput.value = ''; // allow re-picking the same file
      handleFile(file);
    });

    host.addEventListener('click', function (ev) {
      var t = ev.target.closest('[data-scan],[data-manual],[data-pick],[data-confirm],[data-gocalc]');
      if (!t || !host.contains(t)) return;

      if (t.hasAttribute('data-scan')) {
        fileInput.click();
        return;
      }
      if (t.hasAttribute('data-manual')) {
        track('label_scan_manual_open');
        renderManual('Choose your bottle');
        return;
      }
      if (t.hasAttribute('data-pick')) {
        var picked = byId(t.getAttribute('data-pick'));
        if (picked) {
          track('label_scan_manual_pick', { product: picked.id });
          renderProduct(picked, { confirmed: true });
        }
        return;
      }
      if (t.hasAttribute('data-confirm')) {
        var confirmed = byId(t.getAttribute('data-confirm'));
        if (confirmed) {
          track('label_scan_confirmed', { product: confirmed.id });
          renderProduct(confirmed, { confirmed: true });
        }
        return;
      }
      if (t.hasAttribute('data-gocalc')) {
        var calc = document.getElementById('calculator-card') ||
          document.querySelector('[data-calculator-root]');
        if (calc) {
          calc.scrollIntoView({ behavior: 'smooth', block: 'start' });
          var input = calc.querySelector('input[type="number"],input[inputmode="decimal"]');
          if (input) setTimeout(function () { input.focus(); }, 450);
        }
      }
    });

    return { host: host, identify: identify };
  }

  /* ------------------------------------------------------------------ *
   * Auto-mount
   * ------------------------------------------------------------------ */

  function autoMount() {
    var explicit = document.querySelector('[data-label-scanner]');
    if (explicit) return create(explicit);

    // Fall back to inserting directly above the calculator card so the page
    // works with no markup change.
    var calc =
      document.getElementById('calculator-card') ||
      document.querySelector('[data-calculator-root]');
    if (!calc || !calc.parentNode) return null;

    var section = document.createElement('section');
    section.setAttribute('data-label-scanner', '');
    section.setAttribute('aria-label', 'Identify your medicine bottle');
    section.style.marginBottom = 'var(--space-4, 16px)';
    calc.parentNode.insertBefore(section, calc);
    return create(section);
  }

  global.CloseDoseLabelScanner = {
    mount: create,
    identify: identify,
    normalise: normalise,
    products: PRODUCTS,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoMount);
  } else {
    autoMount();
  }
})(window);
