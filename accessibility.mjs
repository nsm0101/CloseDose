const STORAGE_KEY = 'cd-accessibility';
const DEFAULTS = {
  calm: 'off',
  text: 'md',
  motion: 'full',
  font: 'default',
  icon: 'off',
  lang: 'en',
};

const motionQuery = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : null;

export function loadAccessibilityPrefs() {
  if (typeof localStorage === 'undefined') {
    return { ...DEFAULTS };
  }
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...DEFAULTS, ...(saved || {}) };
  } catch (error) {
    return { ...DEFAULTS };
  }
}

export function saveAccessibilityPrefs(prefs) {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function applyAccessibilityPrefs(prefs) {
  const root = document.documentElement;
  root.dataset.calm = prefs.calm;
  root.dataset.text = prefs.text;
  root.dataset.font = prefs.font;
  root.dataset.icon = prefs.icon;
  root.dataset.lang = prefs.lang;
  const reducedMotion = prefs.motion === 'reduced' || (motionQuery && motionQuery.matches);
  root.dataset.motion = reducedMotion ? 'reduced' : 'full';
  root.lang = prefs.lang || 'en';
}

export function updateAccessibilityPref(prefs, key, value) {
  const next = { ...prefs, [key]: value };
  saveAccessibilityPrefs(next);
  applyAccessibilityPrefs(next);
  return next;
}

export function watchSystemMotion(prefs, onChange) {
  if (!motionQuery) return;
  motionQuery.addEventListener?.('change', () => {
    applyAccessibilityPrefs(prefs);
    onChange?.(prefs);
  });
}

export const accessibilityDefaults = { ...DEFAULTS };
