const NUMBER_WORDS = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

function wordsToNumber(tokens) {
  let total = 0;
  let isDecimal = false;
  let decimal = '';

  tokens.forEach((token) => {
    if (token === 'point' || token === 'dot') {
      isDecimal = true;
      return;
    }
    if (!(token in NUMBER_WORDS)) {
      return;
    }
    if (!isDecimal) {
      total += NUMBER_WORDS[token];
    } else {
      decimal += NUMBER_WORDS[token].toString();
    }
  });

  if (total === 0 && !decimal) {
    return null;
  }

  if (decimal) {
    return parseFloat(`${total}.${decimal}`);
  }
  return total;
}

export function parseDose(input) {
  if (!input) return null;
  const normalized = input
    .toLowerCase()
    .replace(/[^a-z0-9.\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const hasUnit = /(ml|milliliter|millilitre)/.test(normalized);
  if (!hasUnit) {
    return null;
  }

  const numericMatch = normalized.match(/\d+(?:\.\d+)?/);
  let amount = numericMatch ? parseFloat(numericMatch[0]) : null;

  if (!amount || Number.isNaN(amount)) {
    const tokens = normalized.split(' ');
    amount = wordsToNumber(tokens);
  }

  if (!amount || Number.isNaN(amount)) {
    return null;
  }

  return { amount, unit: 'mL' };
}

export function isSpeechAvailable() {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export function startListening({ onResult, onError } = {}) {
  return new Promise((resolve, reject) => {
    if (!isSpeechAvailable()) {
      const error = new Error('Speech recognition not supported');
      onError?.(error);
      reject(error);
      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = document.documentElement.lang || 'en';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const parsed = parseDose(transcript);
      const commandNow = /\bnow\b/.test(transcript.toLowerCase());
      const result = { transcript, parsed, commandNow };
      onResult?.(result);
      resolve(result);
    };

    recognition.onerror = (event) => {
      const error = new Error(event.error || 'Speech recognition error');
      onError?.(error);
      reject(error);
    };

    recognition.onnomatch = () => {
      const error = new Error('No speech match');
      onError?.(error);
      reject(error);
    };

    recognition.start();
  });
}

export function speak(text) {
  if (!('speechSynthesis' in window)) {
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = document.documentElement.lang || 'en';
  window.speechSynthesis.speak(utterance);
}
