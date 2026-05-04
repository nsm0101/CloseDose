const dictionaries = new Map();
let currentLang = 'en';
let fallbackDict = {};
let activeDict = {};

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

export async function initI18n(lang = 'en') {
  const enPath = new URL('./i18n/en.json', import.meta.url);
  const langPath = new URL(`./i18n/${lang}.json`, import.meta.url);

  if (!dictionaries.has('en')) {
    dictionaries.set('en', await loadJson(enPath));
  }
  fallbackDict = dictionaries.get('en');

  if (!dictionaries.has(lang)) {
    try {
      dictionaries.set(lang, await loadJson(langPath));
    } catch (error) {
      console.warn(`Missing language file for ${lang}, falling back to English.`);
      dictionaries.set(lang, fallbackDict);
    }
  }

  activeDict = dictionaries.get(lang) || fallbackDict;
  currentLang = lang;
}

export function getCurrentLang() {
  return currentLang;
}

export function t(key, vars = {}) {
  const value = activeDict[key] ?? fallbackDict[key];
  if (!value) {
    console.warn(`Missing i18n key: ${key}`);
    return key;
  }
  return Object.keys(vars).reduce((result, name) => {
    return result.replace(new RegExp(`{${name}}`, 'g'), vars[name]);
  }, value);
}

export function applyTranslations(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      el.textContent = t(key);
    }
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key && 'placeholder' in el) {
      el.placeholder = t(key);
    }
  });
  root.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria-label');
    if (key) {
      el.setAttribute('aria-label', t(key));
    }
  });
}

export function setLanguage(lang) {
  currentLang = lang;
}
