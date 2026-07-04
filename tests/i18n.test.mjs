import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const en = JSON.parse(await readFile(new URL('../public/i18n/en.json', import.meta.url)));
const es = JSON.parse(await readFile(new URL('../public/i18n/es.json', import.meta.url)));

const enKeys = Object.keys(en).sort();
const esKeys = Object.keys(es).sort();

assert.deepEqual(esKeys, enKeys, 'Spanish keys must match English keys');

console.log('i18n key parity tests passed');
