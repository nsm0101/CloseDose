/*
 * Cappy Run — a Chrome T-Rex style endless runner starring the CloseDose
 * capybara. Triggered by the Konami code (↑ ↑ ↓ ↓ ← → ← → B A Enter) from
 * anywhere on the site. Press Escape to exit. Space / Up jumps, Down ducks.
 */
(function () {
  'use strict';

  if (window.__cappyRunInstalled) return;
  window.__cappyRunInstalled = true;

  // ------------------------- Konami code listener -------------------------
  const KONAMI = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a', 'Enter',
  ];

  let konamiIdx = 0;
  let game = null;

  function konamiKey(e) {
    // Normalize: arrows and Enter use e.key as-is; letters compare case-insensitive.
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Enter') {
      return e.key;
    }
    if (e.key && e.key.length === 1) return e.key.toLowerCase();
    return e.key;
  }

  document.addEventListener('keydown', function (e) {
    if (game && game.active) return; // game handles its own keys
    const k = konamiKey(e);
    const expected = KONAMI[konamiIdx];
    if (k === expected) {
      konamiIdx += 1;
      if (konamiIdx === KONAMI.length) {
        konamiIdx = 0;
        e.preventDefault();
        launchGame();
      }
    } else {
      // Allow the new key to be the start of a fresh sequence.
      konamiIdx = (k === KONAMI[0]) ? 1 : 0;
    }
  }, true);

  function launchGame() {
    if (game && game.active) return;
    if (!game) game = new CappyRun();
    game.start();
  }

  // Also allow other UI (e.g. the secret bar in the site menu) to launch
  // the game without needing to dispatch the full Konami sequence.
  window.addEventListener('cappyrun:launch', launchGame);

  // ----------------------------- Sprite data -----------------------------
  // Cappy is drawn from Braille-encoded silhouettes (each Braille glyph
  // packs 2×4 pixels), giving us much higher-detail frames without
  // sacrificing the chunky pixel-art look. Obstacles still use the older
  // '#'/'o' grid against the foreground colors.

  // Decode a Braille string array into a pixel grid (rows of '#' / '.').
  // Each character expands to 2 columns × 4 rows of dots, padded to the
  // widest line so the resulting grid stays rectangular.
  function braille(lines) {
    const parsed = lines.map((line) => Array.from(line));
    let cellW = 0;
    for (const arr of parsed) if (arr.length > cellW) cellW = arr.length;
    const pixels = [];
    for (const arr of parsed) {
      const rows = ['', '', '', ''];
      for (let ci = 0; ci < cellW; ci++) {
        const ch = arr[ci] || '⠀';
        const cp = ch.codePointAt(0) - 0x2800;
        const safe = (cp >= 0 && cp < 256) ? cp : 0;
        const d = (b) => ((safe >> b) & 1) ? '#' : '.';
        // Braille dot order: bits 0/1/2/6 are col 0 rows 0-3; 3/4/5/7 are col 1.
        rows[0] += d(0) + d(3);
        rows[1] += d(1) + d(4);
        rows[2] += d(2) + d(5);
        rows[3] += d(6) + d(7);
      }
      for (const r of rows) pixels.push(r);
    }
    return pixels;
  }

  // Two-color silhouette palette: body fill + darker outline. Keeps the
  // retro feel while letting the more detailed frames read clearly.
  const CAPPY_BODY_LIGHT = '#a06438';
  const CAPPY_OUTLINE_LIGHT = '#2b1409';
  const CAPPY_BODY_DARK = '#b87242';
  const CAPPY_OUTLINE_DARK = '#1a0c05';
  const CAPPY_SHADOW_LIGHT = 'rgba(20, 10, 4, 0.78)';
  const CAPPY_SHADOW_DARK = 'rgba(0, 0, 0, 0.82)';

  // Idle (breathing) — used during the brief "ready" pose before play.
  const CAPPY_IDLE_FRAMES = [
    braille([
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣄⢘⣒⣀⣀⣀⣀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣽⣿⣛⠛⢛⣿⣿⡿⠟⠂⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣀⣀⡀⠀⣤⣾⣿⣿⣿⣿⣿⣿⣿⣷⣿⡆⠀',
      '⠀⠀⠀⠀⠀⠀⣀⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀',
      '⠀⠀⠀⢀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠜⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⢿⣿⣿⣿⣿⠿⠿⣿⣿⡿⢿⣿⣿⠈⣿⣿⣿⡏⣠⡴⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⣠⣿⣿⣿⡿⢁⣴⣶⣄⠀⠀⠉⠉⠉⠀⢻⣿⡿⢰⣿⡇⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⢿⣿⠟⠋⠀⠈⠛⣿⣿⠀⠀⠀⠀⠀⠀⠸⣿⡇⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⢸⣿⠀⠀⠀⠀⠀⠘⠿⠆⠀⠀⠀⠀⠀⠀⣿⡇⠀⠿⠇⠀⠀⠀⠀⠀⠀⠀',
    ]),
    braille([
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣄⢘⣒⣀⣀⣀⣀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣽⣿⣛⠛⢛⣿⣿⡿⠟⠂⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣀⣀⡀⠀⣤⣾⣿⣿⣿⣿⣿⣿⣿⣷⣿⡆⠀',
      '⠀⠀⠀⠀⠀⠀⣀⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀',
      '⠀⠀⠀⢀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠜⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⢿⣿⣿⣿⣿⠿⠿⣿⣿⡿⢿⣿⣿⠈⣿⣿⣿⡏⣠⡴⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⣿⣿⣿⡿⢁⣴⣶⣄⠀⠀⠉⠉⠉⠀⢻⣿⡿⢰⣿⡇⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⣠⣿⠟⠋⠀⠈⠛⣿⣿⠀⠀⠀⠀⠀⠀⠸⣿⡇⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⢿⣿⠀⠀⠀⠀⠀⠘⠿⠆⠀⠀⠀⠀⠀⠀⣿⡇⠀⠿⠇⠀⠀⠀⠀⠀⠀⠀',
    ]),
  ];

  // Run cycle — six legged poses for a smoother stride.
  const CAPPY_RUN_FRAMES = [
    // Stride opening
    braille([
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣄⢘⣒⣀⣀⣀⣀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣽⣿⣛⠛⢛⣿⣿⡿⠟⠂⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣀⣀⡀⠀⣤⣾⣿⣿⣿⣿⣿⣿⣿⣷⣿⡆⠀',
      '⠀⠀⠀⠀⠀⠀⣀⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀',
      '⠀⠀⠀⢀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠜⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⢿⣿⣿⣿⣿⠿⠿⣿⣿⡿⢿⣿⣿⠈⣿⣿⣿⡏⣠⡴⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⣠⣿⣿⣿⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⡿⢰⣿⡇⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⢿⣿⠟⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣿⡇⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⢸⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⠀⠿⠇⠀⠀⠀⠀⠀⠀⠀',
    ]),
    // Front plant, back lift
    braille([
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣄⢘⣒⣀⣀⣀⣀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣽⣿⣛⠛⢛⣿⣿⡿⠟⠂⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣀⣀⡀⠀⣤⣾⣿⣿⣿⣿⣿⣿⣿⣷⣿⡆⠀',
      '⠀⠀⠀⠀⠀⠀⣀⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀',
      '⠀⠀⠀⢀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠜⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⢿⣿⣿⣿⣿⠿⠿⣿⣿⡿⢿⣿⣿⠈⣿⣿⣿⡏⣠⡴⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠈⠻⣿⣿⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⡿⢰⣿⡇⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠈⠛⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠘⠿⠆⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⠀⠿⠇⠀⠀⠀⠀⠀⠀⠀',
    ]),
    // Crossing
    braille([
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣄⢘⣒⣀⣀⣀⣀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣽⣿⣛⠛⢛⣿⣿⡿⠟⠂⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣀⣀⡀⠀⣤⣾⣿⣿⣿⣿⣿⣿⣿⣷⣿⡆⠀',
      '⠀⠀⠀⠀⠀⠀⣀⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀',
      '⠀⠀⠀⢀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠜⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⢿⣿⣿⣿⣿⠿⠿⣿⣿⡿⢿⣿⣿⠈⣿⣿⣿⡏⣠⡴⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⢀⣴⣶⣄⠀⠀⠀⠀⠀⠀⠀⢻⣿⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠈⠛⣿⣿⠀⠀⠀⠀⠀⠀⢀⣾⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠘⠿⠆⠀⠀⠀⠀⠀⠘⢿⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
    ]),
    // Stride alternating
    braille([
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣄⢘⣒⣀⣀⣀⣀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣽⣿⣛⠛⢛⣿⣿⡿⠟⠂⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣀⣀⡀⠀⣤⣾⣿⣿⣿⣿⣿⣿⣿⣷⣿⡆⠀',
      '⠀⠀⠀⠀⠀⠀⣀⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀',
      '⠀⠀⠀⢀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠜⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⢿⣿⣿⣿⣿⠿⠿⣿⣿⡿⢿⣿⣿⠈⣿⣿⣿⡏⣠⡴⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢁⣴⣶⣄⠀⠀⠀⢻⣿⡿⢰⣿⡇⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⣿⣿⠀⠀⢀⣾⡿⠁⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠿⠆⠀⠘⠿⠃⠀⠀⠿⠇⠀⠀⠀⠀⠀⠀⠀',
    ]),
    // Back plant, front lift
    braille([
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣄⢘⣒⣀⣀⣀⣀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣽⣿⣛⠛⢛⣿⣿⡿⠟⠂⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣀⣀⡀⠀⣤⣾⣿⣿⣿⣿⣿⣿⣿⣷⣿⡆⠀',
      '⠀⠀⠀⠀⠀⠀⣀⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀',
      '⠀⠀⠀⢀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠜⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⢿⣿⣿⣿⣿⠿⠿⣿⣿⡿⢿⣿⣿⠈⣿⣿⣿⡏⣠⡴⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⣠⣿⣿⣿⡿⢁⣴⣶⣄⠀⠀⠀⠀⠀⠀⢻⣿⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⢿⣿⠟⠋⠀⠈⠛⣿⣿⠀⠀⠀⠀⠀⠀⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⢸⣿⠀⠀⠀⠀⠀⠘⠿⠆⠀⠀⠀⠀⠀⠘⠿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
    ]),
    // Crossing return
    braille([
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣄⢘⣒⣀⣀⣀⣀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣽⣿⣛⠛⢛⣿⣿⡿⠟⠂⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣀⣀⡀⠀⣤⣾⣿⣿⣿⣿⣿⣿⣿⣷⣿⡆⠀',
      '⠀⠀⠀⠀⠀⠀⣀⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀',
      '⠀⠀⠀⢀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠜⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⢿⣿⣿⣿⣿⠿⠿⣿⣿⡿⢿⣿⣿⠈⣿⣿⣿⡏⣠⡴⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⢁⣴⣶⣄⠀⠀⠀⠀⠀⢻⣿⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⣿⣿⠀⠀⠀⠀⠀⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠿⠆⠀⠀⠀⠀⠘⠿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
    ]),
  ];

  // Jump — three phases driven by vertical velocity.
  const CAPPY_JUMP_FRAMES = {
    // Takeoff (legs pushing off, body lifted)
    takeoff: braille([
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣄⢘⣒⣀⣀⣀⣀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣽⣿⣛⠛⢛⣿⣿⡿⠟⠂',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣀⣀⡀⠀⣤⣾⣿⣿⣿⣿⣿⣿⣿⣷⣿⡆⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁',
      '⠀⠀⠀⠀⢀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠜⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⢿⣿⣿⣿⣿⠿⠿⣿⣿⡿⢿⣿⣿⠈⣿⣿⣿⡏⣠⡴⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⡿⢰⣿⡇⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣿⡇⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⠀⠿⠇⠀⠀⠀⠀⠀⠀⠀',
    ]),
    // Peak / airborne (legs tucked up against belly — small foot stumps
    // peek out so the silhouette still reads as a four-legged animal).
    peak: braille([
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣄⢘⣒⣀⣀⣀⣀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣽⣿⣛⠛⢛⣿⣿⡿⠟⠂⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣀⣀⡀⠀⣤⣾⣿⣿⣿⣿⣿⣿⣿⣷⣿⡆⠀',
      '⠀⠀⠀⠀⠀⠀⣀⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀',
      '⠀⠀⠀⢀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠜⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⢿⣿⣿⣿⣿⠿⠿⣿⣿⡿⢿⣿⣿⠈⣿⣿⣿⣿⣿⡿⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⣠⣿⣿⣿⡿⠁⠀⠀⠀⠀⠀⠀⠉⠉⠀⠹⣿⣿⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠛⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠛⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
    ]),
    // Landing (leaning forward, legs reaching down)
    landing: braille([
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣄⢘⣒⣀⣀⣀⣀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣽⣿⣛⠛⢛⣿⣿⡿⠟⠂⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⣀⣀⡀⠀⣤⣾⣿⣿⣿⣿⣿⣿⣿⣷⣿⡆⠀⠀⠀',
      '⠀⠀⠀⠀⠀⣀⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀⠀',
      '⠀⠀⢀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀',
      '⠀⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠜⠀⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⢿⣿⣿⣿⣿⠿⠿⣿⣿⡿⢿⣿⣿⠈⣿⣿⣿⡏⣠⡴⠀⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⣠⣿⣿⣿⡿⢁⣴⣶⣄⠀⠀⠉⠉⠉⠀⢻⣿⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⢿⣿⠟⠋⠀⠈⠛⣿⣿⠀⠀⠀⠀⠀⠀⠸⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⢸⣿⠀⠀⠀⠀⠀⠘⠿⠆⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
    ]),
  };

  // Duck — four phase cycle (compress → stretch → pull-back → arch).
  const CAPPY_DUCK_FRAMES = [
    // Compress down
    braille([
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣄⢘⣒⣀⣀⣀⣀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣽⣿⣛⠛⢛⣿⣿⡿⠟⠂⠀',
      '⠀⠀⠀⠀⠀⠀⣀⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀',
      '⠀⠀⠀⢀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⢿⣿⣿⣿⣿⠿⠿⣿⣿⡿⢿⣿⣿⠈⣿⣿⣿⡏⣠⡴⠀⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⣠⣿⣿⣿⡿⢁⣴⣶⣄⠀⠀⠉⠉⠉⠀⢻⣿⡿⢰⣿⡇⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⢿⣿⠟⠋⠀⠈⠛⣿⣿⠀⠀⠀⠀⠀⠀⠸⣿⡇⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀',
    ]),
    // Stretch
    braille([
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣄⢘⣒⣀⣀⣀⣀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣽⣿⣛⠛⢛⣿⣿⡿⠟',
      '⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿',
      '⠀⠀⠀⢀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⢿⣿⣿⣿⣿⠿⠿⣿⣿⡿⢿⣿⣿⠈⣿⣿⣿⡏⣠⡴⠀⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⢁⣴⣶⣄⠀⠀⠉⠉⠉⠀⢻⣿⡿⢰⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⣿⣿⠀⠀⠀⠀⠀⠀⠸⣿⡇⢸⣿⡇⠀⠀⠀⠀⠀⠀',
    ]),
    // Pull back
    braille([
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣄⢘⣒⣀⣀⣀⣀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣽⣿⣛⠛⢛⣿⣿⡿⠟',
      '⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿',
      '⠀⠀⠀⢀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⢿⣿⣿⣿⣿⠿⠿⣿⣿⡿⢿⣿⣿⠈⣿⣿⣿⡏⣠⡴⠀⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⣠⣿⣿⣿⡿⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠀⢻⣿⡿⢰⣿⡇⠀⠀⠀⠀⠀',
      '⠀⠀⢿⣿⠟⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣿⡇⢸⣿⡇⠀⠀⠀⠀⠀',
    ]),
    // Arch back to base
    braille([
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣄⢘⣒⣀⣀⣀⣀⠀⠀⠀',
      '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣽⣿⣛⠛⢛⣿⣿⡿⠟⠂⠀',
      '⠀⠀⠀⠀⠀⠀⣀⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀',
      '⠀⠀⠀⢀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀',
      '⠀⠀⢿⣿⣿⣿⣿⠿⠿⣿⣿⡿⢿⣿⣿⠈⣿⣿⣿⡏⣠⡴⠀⠀⠀⠀⠀⠀⠀⠀',
      '⠀⠀⣠⣿⣿⣿⡿⢁⣴⣶⣄⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⡿⢰⣿⡇⠀⠀⠀⠀⠀',
      '⠀⠀⢿⣿⠟⠋⠀⠈⠛⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠸⣿⡇⢸⣿⡇⠀⠀⠀⠀⠀',
    ]),
  ];

  // Game-over silhouette — drawn in dark shadow tones at death.
  const CAPPY_GAMEOVER = braille([
    '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠀⠀⠀⠀⠀',
    '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠀⠀⠀⠀⠀',
    '⠀⠀⢠⣶⣶⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠀⠀⠀⠀⠀',
    '⠀⠀⢸⣿⣿⣿⣦⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠀⠀⠀⠀⠀',
    '⠀⠀⠈⢿⣿⣿⣿⣿⣿⣶⣤⣤⣀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠀⠀⠀⠀⠀',
    '⠀⠀⠀⠀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣿⣿⠀⠀⠀⠀⠀',
    '⠀⠀⠀⠀⠀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀',
    '⠀⠀⠀⠀⠀⠀⠀⠈⠛⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⠀⠀⠀',
    '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠛⠛⠛⠛⠿⠿⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⠀',
    '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠉⠙⠛⠛⠛⠛⠁⠀',
  ]);

  // Obstacles: pineapple-style plants (Brazilian/Amazonian flair to fit a capybara habitat)
  const PLANT_SMALL = [
    '...#.#.#...',
    '..#.#.#.#..',
    '...#.#.#...',
    '....###....',
    '...#####...',
    '..#######..',
    '..#######..',
    '...#####...',
    '....###....',
    '....###....',
  ];

  const PLANT_BIG = [
    '....#.#.#....',
    '...#.#.#.#...',
    '..#.#.#.#.#..',
    '...#.#.#.#...',
    '....#####....',
    '...#######...',
    '..#########..',
    '.###########.',
    '.###########.',
    '..#########..',
    '...#######...',
    '....#####....',
    '.....###.....',
    '.....###.....',
  ];

  // Bird (parrot) — flying obstacle, two wing positions
  const BIRD_A = [
    '....######...',
    '..############',
    '#############.',
    '..############',
    '.....####.....',
    '.....####.....',
    '..............',
  ];

  const BIRD_B = [
    '..............',
    '.....####.....',
    '#############.',
    '..############',
    '....######....',
    '....#..#......',
    '....#..#......',
  ];

  // Cloud
  const CLOUD = [
    '....######....',
    '..##########..',
    '##############',
    '..##########..',
  ];

  // -------------------- Per-stage obstacle sprites ----------------------
  // Two-tone pixel art: '#' draws in the obstacle's primary color, 'o' in
  // its secondary color. Each theme wires these up in its definition below.

  // City: trash can (ground) + pigeon (flyer)
  const TRASH_CAN = [
    '..oooooo..',
    '.oooooooo.',
    '.#.#..#.#.',
    '.#.#..#.#.',
    '.#.#..#.#.',
    '.#.#..#.#.',
    '.#.#..#.#.',
    '.#.#..#.#.',
    '.oooooooo.',
    '.########.',
  ];
  const PIGEON_A = [
    '...##.....',
    '..####.o..',
    '.#######o.',
    '.#######..',
    '..#####...',
    '...###....',
  ];
  const PIGEON_B = [
    '...##.....',
    '..####.o..',
    '.#######o.',
    '#######...',
    '.####.....',
    '..###.....',
  ];

  // Space: moon rocks (ground) + comet (flyer)
  const MOON_ROCK = [
    '...####...',
    '..######o.',
    '.#######o.',
    '.########.',
    '##########',
    '.########.',
  ];
  const MOON_ROCK_BIG = [
    '...######...',
    '..########o.',
    '.#########o.',
    '.##########.',
    '############',
    '############',
    '.##########.',
    '..########..',
  ];
  const COMET_A = [
    'o.o....##.',
    '.ooo..####',
    '..ooo.####',
    '.ooo..####',
    'o.o....##.',
  ];
  const COMET_B = [
    'oo.....##.',
    '.oo...####',
    '..ooo.####',
    '.oo...####',
    'oo.....##.',
  ];

  // Wild West: cactus (tall) + tumbleweed (short, rolling) + vulture (flyer)
  const CACTUS = [
    '....##....',
    '....##....',
    '.#..##..#.',
    '.#..##..#.',
    '.#..##..#.',
    '.##.##.##.',
    '..#.##.#..',
    '...####...',
    '....##....',
    '....##....',
    '....##....',
    '....##....',
  ];
  const TUMBLEWEED_A = [
    '..#.#.#..',
    '.#.###.#.',
    '#.##o##.#',
    '.###o###.',
    '#.##o##.#',
    '.#.###.#.',
    '..#.#.#..',
  ];
  const TUMBLEWEED_B = [
    '..#.#.#..',
    '.#.#.#.#.',
    '#.#o#o#.#',
    '##.#o#.##',
    '#.#o#o#.#',
    '.#.#.#.#.',
    '..#.#.#..',
  ];
  const VULTURE_A = [
    '#...........#',
    '##.........##',
    '.###.....###.',
    '..####o####..',
    '....######...',
    '.....####....',
  ];
  const VULTURE_B = [
    '..##.....##..',
    '.####...####.',
    '..####o####..',
    '...########..',
    '....######...',
    '.....##......',
  ];

  // Arctic: ice chunks (2 sizes) + arctic tern (flyer)
  const ICE_SMALL = [
    '...##...',
    '..o##o..',
    '.######.',
    '########',
    '.######.',
  ];
  const ICE_BIG = [
    '....##....',
    '...o##o...',
    '..o####o..',
    '.########.',
    '##########',
    '.########.',
    '..######..',
  ];
  const ARCTIC_BIRD_A = [
    '#.........#',
    '.##.....##.',
    '..###o###..',
    '...#####...',
    '....###....',
  ];
  const ARCTIC_BIRD_B = [
    '...#####...',
    '..###o###..',
    '.##.....##.',
    '#.........#',
    '....#......',
  ];

  // Desert: sandstone (2 sizes); desert bird reuses the parrot shape.
  const SANDSTONE_SMALL = [
    '.######.',
    '########',
    '#oooooo#',
    '########',
    '#oooooo#',
    '########',
  ];
  const SANDSTONE_BIG = [
    '..########..',
    '.##########.',
    '#oooooooooo#',
    '############',
    '#oooooooooo#',
    '############',
    '#oooooooooo#',
    '############',
  ];

  // Island: coconut (short) + rock (bigger) + seagull (flyer)
  const COCONUT = [
    '.####.',
    '######',
    '#o##o#',
    '###o##',
    '.####.',
  ];
  const ISLAND_ROCK = [
    '..#####..',
    '.#######.',
    '#ooooooo#',
    '#########',
    '#ooooooo#',
    '#########',
  ];
  const SEAGULL_A = [
    '##.......##',
    '.###...###.',
    '...##o##...',
    '....###....',
  ];
  const SEAGULL_B = [
    '....###....',
    '...##o##...',
    '.###...###.',
    '##.......##',
  ];

  // Outback: dry bush (short) + termite mound (tall) + magpie (flyer)
  const OUTBACK_BUSH = [
    '.#..#..#..',
    '#.##.##.#.',
    '.########.',
    '##########',
    '.########.',
    '...####...',
  ];
  const TERMITE_MOUND = [
    '...##...',
    '..####..',
    '..####..',
    '.######.',
    '.######.',
    '########',
    '########',
    '########',
  ];
  const MAGPIE_A = [
    '...##......',
    '..####o....',
    '.##oo####..',
    '..######...',
    '...####....',
  ];
  const MAGPIE_B = [
    '...##......',
    '..####o....',
    '.##oo####..',
    '###o###....',
    '.####......',
  ];

  function spriteSize(sprite) {
    return { w: sprite[0].length, h: sprite.length };
  }

  // ---------------------------- Stage scenery ----------------------------
  // The game changes its backdrop every STAGE_POINTS points. Stage 0 is
  // always the rainforest; later stages pick randomly from the rest.
  const STAGE_POINTS = 5000;

  function circle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function bgSun(ctx, x, y, r, color) {
    ctx.fillStyle = color;
    circle(ctx, x, y, r);
  }

  // Repeat a draw callback across the canvas width with a parallax scroll.
  // `k` is a stable per-element world index so deterministic randomness
  // (heights, colors) doesn't flicker as the scene scrolls.
  function repeatX(scroll, spacing, W, fn) {
    const off = ((scroll % spacing) + spacing) % spacing;
    let k = Math.floor(scroll / spacing);
    for (let x = -off; x < W + spacing; x += spacing, k++) fn(x, k);
  }

  function hash(n) {
    n = (n << 13) ^ n;
    return ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  // Soft rolling silhouette used for hills / dunes.
  function hillRange(ctx, W, baseY, color, scroll, amp, step) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    const phase = scroll / step;
    for (let x = 0; x <= W; x += step / 2) {
      const y = baseY - amp * (0.5 + 0.5 * Math.sin((x / step) + phase));
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, baseY);
    ctx.closePath();
    ctx.fill();
  }

  function starField(ctx, W, H, scroll) {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 70; i++) {
      let x = ((i * 97) % (W + 40)) - ((scroll * 0.08) % (W + 40));
      if (x < 0) x += W + 40;
      const y = (i * 53) % (H - 70) + 6;
      const s = (i % 4 === 0) ? 2 : 1;
      ctx.globalAlpha = 0.45 + 0.55 * ((i % 5) / 5);
      ctx.fillRect(x, y, s, s);
    }
    ctx.globalAlpha = 1;
  }

  // A peeking Teenage Mutant Ninja Turtle head — cameo for the city stage.
  function tmntHead(ctx, x, y, s, band) {
    ctx.fillStyle = '#4a8c3f'; // green head
    ctx.beginPath();
    ctx.arc(x, y, s, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(x - s, y, s * 2, s * 0.55);
    // bandana
    ctx.fillStyle = band;
    ctx.fillRect(x - s, y - s * 0.18, s * 2, s * 0.42);
    // bandana tails
    ctx.fillRect(x - s - s * 0.5, y - s * 0.1, s * 0.6, s * 0.22);
    ctx.fillRect(x - s - s * 0.4, y + s * 0.12, s * 0.5, s * 0.2);
    // eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - s * 0.55, y - s * 0.08, s * 0.4, s * 0.3);
    ctx.fillRect(x + s * 0.15, y - s * 0.08, s * 0.4, s * 0.3);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - s * 0.4, y + s * 0.02, s * 0.16, s * 0.16);
    ctx.fillRect(x + s * 0.3, y + s * 0.02, s * 0.16, s * 0.16);
  }

  function kangaroo(ctx, x, GY, c) {
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.ellipse(x, GY - 22, 12, 16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 10, GY - 40, 5, 8, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x + 11, GY - 52, 2, 8);
    ctx.beginPath();
    ctx.moveTo(x - 8, GY - 14);
    ctx.quadraticCurveTo(x - 26, GY - 6, x - 30, GY);
    ctx.lineTo(x - 22, GY);
    ctx.quadraticCurveTo(x - 12, GY - 8, x - 4, GY - 16);
    ctx.closePath(); ctx.fill();
    ctx.fillRect(x - 2, GY - 12, 7, 12);
  }

  // ------------------------- Background cameos ---------------------------
  // Occasional / rare flavor characters that scroll through the backdrop.
  // They are purely decorative (no collision).
  function camelFig(ctx, x, GY, c) {
    ctx.fillStyle = c;
    ctx.fillRect(x + 6, GY - 14, 3, 14);
    ctx.fillRect(x + 12, GY - 14, 3, 14);
    ctx.fillRect(x + 22, GY - 14, 3, 14);
    ctx.fillRect(x + 28, GY - 14, 3, 14);
    ctx.beginPath(); ctx.ellipse(x + 18, GY - 22, 16, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 13, GY - 28, 6, Math.PI, 0); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 24, GY - 28, 6, Math.PI, 0); ctx.fill();
    ctx.fillRect(x + 30, GY - 34, 4, 14);
    ctx.beginPath(); ctx.ellipse(x + 34, GY - 36, 5, 3, 0.3, 0, Math.PI * 2); ctx.fill();
  }

  function coveredWagon(ctx, x, GY, c, c2) {
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.arc(x + 8, GY - 5, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 34, GY - 5, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x + 4, GY - 20, 36, 9);
    ctx.fillStyle = c2;
    ctx.beginPath();
    ctx.moveTo(x + 4, GY - 19);
    ctx.quadraticCurveTo(x + 22, GY - 42, x + 40, GY - 19);
    ctx.closePath(); ctx.fill();
  }

  function airplaneFig(ctx, x, y, c) {
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.ellipse(x + 18, y, 18, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y - 8); ctx.lineTo(x + 4, y - 2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 18, y); ctx.lineTo(x + 12, y + 11); ctx.lineTo(x + 26, y + 2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 18, y); ctx.lineTo(x + 12, y - 11); ctx.lineTo(x + 26, y - 2); ctx.closePath(); ctx.fill();
  }

  function ufoFig(ctx, x, y) {
    ctx.fillStyle = 'rgba(170,255,200,0.16)';
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 4); ctx.lineTo(x + 28, y + 4);
    ctx.lineTo(x + 34, y + 28); ctx.lineTo(x + 2, y + 28);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#9fe6ff';
    ctx.beginPath(); ctx.arc(x + 18, y - 3, 8, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#b0b6c4';
    ctx.beginPath(); ctx.ellipse(x + 18, y, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd34d';
    for (let i = -2; i <= 2; i++) circle(ctx, x + 18 + i * 8, y + 2, 1.6);
  }

  function dolphinFig(ctx, x, waterY, progress, c) {
    const arc = Math.sin(Math.max(0, Math.min(1, progress)) * Math.PI);
    const cy = waterY - arc * 50;
    const tilt = (progress - 0.5) * 1.2;
    ctx.save();
    ctx.translate(x, cy);
    ctx.rotate(tilt);
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.ellipse(0, 0, 16, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(13, -2); ctx.lineTo(24, -4); ctx.lineTo(13, 2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-2, -6); ctx.lineTo(3, -16); ctx.lineTo(7, -6); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-24, -6); ctx.lineTo(-20, 0); ctx.lineTo(-24, 6); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function sharkFinFig(ctx, x, waterY, c) {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(x, waterY);
    ctx.quadraticCurveTo(x + 7, waterY - 17, x + 17, waterY);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x - 8, waterY + 2); ctx.lineTo(x + 24, waterY + 2); ctx.stroke();
  }

  function kangarooHop(ctx, x, GY, progress, c) {
    const hop = Math.abs(Math.sin(progress * Math.PI * 6)) * 16;
    kangaroo(ctx, x, GY - hop, c);
  }

  const THEMES = [
    {
      name: 'Rainforest',
      climate: 'hot',
      sky: ['#bfe6cf', '#eaf6ee'],
      groundFill: '#d7ecc9',
      ink: '#234b2c',
      detail: '#4f8a5f',
      ground: [
        { sprite: PLANT_SMALL, color: '#2e6b39' },
        { sprite: PLANT_BIG, color: '#2e6b39' },
      ],
      flyer: { frames: [BIRD_A, BIRD_B], color: '#2e6b39' },
      flyChance: 0.25,
      cameos: [],
      drawBg: function (ctx, W, H, GY, scroll) {
        hillRange(ctx, W, GY, '#a9d9a0', scroll * 0.15, 34, 110);
        hillRange(ctx, W, GY, '#7fc081', scroll * 0.3, 22, 70);
        repeatX(scroll * 0.5, 160, W, function (x) {
          ctx.fillStyle = '#6b4a2a';
          ctx.fillRect(x + 18, GY - 46, 6, 46);
          ctx.fillStyle = '#3f7d46';
          circle(ctx, x + 21, GY - 52, 18);
          circle(ctx, x + 6, GY - 44, 13);
          circle(ctx, x + 36, GY - 44, 13);
        });
      },
    },
    {
      name: 'Wild West',
      climate: 'hot',
      sky: ['#f6d29b', '#fbe9c6'],
      groundFill: '#e6c79a',
      ink: '#5a3210',
      detail: '#9c6a2e',
      ground: [
        { frames: [TUMBLEWEED_A, TUMBLEWEED_B], color: '#9c6a2e', color2: '#c89a5a' },
        { sprite: CACTUS, color: '#3c7a3a', color2: '#2e5e2c' },
      ],
      flyer: { frames: [VULTURE_A, VULTURE_B], color: '#3a2a1a', color2: '#a33524' },
      flyChance: 0.2,
      cameos: [
        { type: 'camel', chance: 0.5, parallax: 0.35, span: 60 },
        { type: 'wagon', chance: 0.35, parallax: 0.45, span: 60 },
      ],
      drawBg: function (ctx, W, H, GY, scroll) {
        bgSun(ctx, W - 120, 50, 30, '#ffce5c');
        repeatX(scroll * 0.2, 270, W, function (x) {
          ctx.fillStyle = '#c98a4e';
          ctx.beginPath();
          ctx.moveTo(x, GY); ctx.lineTo(x + 18, GY - 72);
          ctx.lineTo(x + 120, GY - 72); ctx.lineTo(x + 138, GY);
          ctx.closePath(); ctx.fill();
        });
      },
    },
    {
      name: 'City',
      climate: 'city',
      sky: ['#9fb6d6', '#dfe8f2'],
      groundFill: '#9aa3ad',
      ink: '#222831',
      detail: '#5a6472',
      ground: [
        { sprite: TRASH_CAN, color: '#7a828c', color2: '#aab2bc' },
      ],
      flyer: { frames: [PIGEON_A, PIGEON_B], color: '#8a8f98', color2: '#d24b3a' },
      flyChance: 0.28,
      cameos: [
        { type: 'airplane', chance: 0.6, parallax: 0.15, y: 36, span: 50 },
      ],
      drawBg: function (ctx, W, H, GY, scroll) {
        const bands = ['#2b6cff', '#d32f2f', '#8e44ad', '#ff8c1a'];
        // Far skyline layer — small, light, for depth.
        repeatX(scroll * 0.12, 46, W, function (x, k) {
          const h = 28 + (hash(k * 3) % 44);
          ctx.fillStyle = '#67738a';
          ctx.fillRect(x, GY - h, 38, h);
        });
        // Mid layer with the TMNT brothers tucked small into the gaps.
        repeatX(scroll * 0.22, 72, W, function (x, k) {
          const h = 48 + (hash(k) % 64);
          if (k % 6 === 0) {
            tmntHead(ctx, x - 7, GY - 30, 5, bands[((k / 6) | 0) % 4]);
          }
          ctx.fillStyle = (k % 2 === 0) ? '#3c4654' : '#454f5e';
          ctx.fillRect(x, GY - h, 60, h);
          ctx.fillStyle = 'rgba(255,221,120,0.8)';
          for (let wy = GY - h + 8; wy < GY - 10; wy += 14) {
            for (let wx = x + 8; wx < x + 52; wx += 14) {
              if ((hash(k * 131 + wx * 7 + wy) & 3) !== 0) ctx.fillRect(wx, wy, 7, 8);
            }
          }
        });
        // Near layer — tall, dark, draws IN FRONT so the turtles only peek.
        repeatX(scroll * 0.36, 124, W, function (x, k) {
          const h = 72 + (hash(k * 5) % 58);
          ctx.fillStyle = '#2a313c';
          ctx.fillRect(x, GY - h, 92, h);
          ctx.fillStyle = 'rgba(255,221,120,0.65)';
          for (let wy = GY - h + 10; wy < GY - 12; wy += 16) {
            for (let wx = x + 12; wx < x + 80; wx += 18) {
              if ((hash(k * 57 + wx + wy) & 3) !== 0) ctx.fillRect(wx, wy, 9, 10);
            }
          }
        });
      },
    },
    {
      name: 'Arctic',
      climate: 'cold',
      sky: ['#bfe6f2', '#eaf7fb'],
      groundFill: '#eaf6ff',
      ink: '#2b4a63',
      detail: '#7fb0d6',
      ground: [
        { sprite: ICE_SMALL, color: '#4f9ec2', color2: '#dff4ff' },
        { sprite: ICE_BIG, color: '#4f9ec2', color2: '#dff4ff' },
      ],
      flyer: { frames: [ARCTIC_BIRD_A, ARCTIC_BIRD_B], color: '#5d86a0', color2: '#22323d' },
      flyChance: 0.12,
      cameos: [],
      drawBg: function (ctx, W, H, GY, scroll) {
        ctx.lineWidth = 6;
        for (let a = 0; a < 3; a++) {
          ctx.strokeStyle = ['rgba(120,230,180,0.45)', 'rgba(150,200,255,0.4)', 'rgba(200,160,255,0.35)'][a];
          ctx.beginPath();
          for (let x = 0; x <= W; x += 20) {
            ctx.lineTo(x, 28 + a * 14 + 10 * Math.sin(x / 60 + scroll / 220 + a));
          }
          ctx.stroke();
        }
        repeatX(scroll * 0.25, 230, W, function (x) {
          ctx.fillStyle = '#cfeeff';
          ctx.beginPath();
          ctx.moveTo(x, GY); ctx.lineTo(x + 40, GY - 60);
          ctx.lineTo(x + 80, GY); ctx.closePath(); ctx.fill();
        });
        repeatX(scroll * 0.5, 320, W, function (x) {
          ctx.fillStyle = '#eef7ff';
          ctx.beginPath(); ctx.arc(x + 30, GY, 26, Math.PI, 0); ctx.fill();
          ctx.fillStyle = '#bcd6e6';
          ctx.fillRect(x + 22, GY - 14, 16, 14);
        });
      },
    },
    {
      name: 'Desert',
      climate: 'hot',
      sky: ['#ffb877', '#ffe2b0'],
      groundFill: '#f0c98f',
      ink: '#7a3f12',
      detail: '#b9772e',
      ground: [
        { sprite: SANDSTONE_SMALL, color: '#b9772e', color2: '#e2b272' },
        { sprite: SANDSTONE_BIG, color: '#b9772e', color2: '#e2b272' },
      ],
      flyer: { frames: [BIRD_A, BIRD_B], color: '#7a3f12' },
      flyChance: 0.22,
      cameos: [
        { type: 'camel', chance: 0.5, parallax: 0.35, span: 60 },
      ],
      drawBg: function (ctx, W, H, GY, scroll) {
        bgSun(ctx, 120, 48, 34, '#ffd27f');
        repeatX(scroll * 0.2, 250, W, function (x) {
          ctx.fillStyle = '#caa15a';
          ctx.beginPath();
          ctx.moveTo(x, GY); ctx.lineTo(x + 60, GY - 86);
          ctx.lineTo(x + 120, GY); ctx.closePath(); ctx.fill();
          ctx.fillStyle = 'rgba(0,0,0,0.08)';
          ctx.beginPath();
          ctx.moveTo(x + 60, GY - 86); ctx.lineTo(x + 120, GY);
          ctx.lineTo(x + 60, GY); ctx.closePath(); ctx.fill();
        });
        hillRange(ctx, W, GY, '#e7c08a', scroll * 0.4, 18, 80);
      },
    },
    {
      name: 'Island',
      climate: 'hot',
      sky: ['#7fd0f0', '#cdeefb'],
      groundFill: '#f2e2b0',
      ink: '#1f6f78',
      detail: '#3fa9b5',
      ground: [
        { sprite: COCONUT, color: '#6b4a2a', color2: '#3a2a1a' },
        { sprite: ISLAND_ROCK, color: '#8a8f98', color2: '#6a6f78' },
      ],
      flyer: { frames: [SEAGULL_A, SEAGULL_B], color: '#f0f4f8', color2: '#f5a623' },
      flyChance: 0.24,
      cameos: [
        { type: 'dolphin', chance: 0.45, parallax: 0.5, span: 60 },
        { type: 'shark', chance: 0.12, parallax: 0.5, span: 40 },
      ],
      drawBg: function (ctx, W, H, GY, scroll) {
        bgSun(ctx, W - 110, 46, 28, '#fff2a8');
        ctx.fillStyle = 'rgba(64,170,200,0.5)';
        ctx.fillRect(0, GY - 26, W, 26);
        repeatX(scroll * 0.45, 220, W, function (x) {
          ctx.fillStyle = '#8a5a2b';
          ctx.fillRect(x + 24, GY - 54, 6, 54);
          ctx.fillStyle = '#2fa35a';
          for (let a = -2; a <= 2; a++) {
            ctx.beginPath();
            ctx.moveTo(x + 27, GY - 54);
            ctx.quadraticCurveTo(x + 27 + a * 16, GY - 72, x + 27 + a * 26, GY - 56);
            ctx.lineTo(x + 27, GY - 54);
            ctx.fill();
          }
        });
      },
    },
    {
      name: 'Outback',
      climate: 'hot',
      sky: ['#f0935a', '#ffd9a8'],
      groundFill: '#d98a4e',
      ink: '#4a1d0a',
      detail: '#8a4a22',
      ground: [
        { sprite: OUTBACK_BUSH, color: '#6f6a2a', color2: '#928c3a' },
        { sprite: TERMITE_MOUND, color: '#a5532a', color2: '#7a3d1e' },
      ],
      flyer: { frames: [MAGPIE_A, MAGPIE_B], color: '#1a1a1a', color2: '#ffffff' },
      flyChance: 0.22,
      cameos: [
        { type: 'kangaroo', chance: 0.5, parallax: 0.4, span: 50 },
      ],
      drawBg: function (ctx, W, H, GY, scroll) {
        bgSun(ctx, W - 120, 52, 30, '#ffb24d');
        repeatX(scroll * 0.2, 400, W, function (x) {
          ctx.fillStyle = '#b5532a';
          ctx.beginPath();
          ctx.moveTo(x, GY);
          ctx.quadraticCurveTo(x + 30, GY - 54, x + 90, GY - 50);
          ctx.quadraticCurveTo(x + 160, GY - 46, x + 200, GY);
          ctx.closePath(); ctx.fill();
        });
        // Spinifex / dry shrubs scattered across the midground.
        repeatX(scroll * 0.5, 96, W, function (x, k) {
          ctx.fillStyle = (k % 2 === 0) ? '#7a6a2a' : '#6b5a24';
          ctx.beginPath(); ctx.arc(x + 12, GY - 4, 9, Math.PI, 0); ctx.fill();
          ctx.fillRect(x + 4, GY - 6, 16, 6);
          ctx.fillRect(x + 7, GY - 13, 2, 9);
          ctx.fillRect(x + 12, GY - 14, 2, 10);
          ctx.fillRect(x + 17, GY - 12, 2, 8);
        });
      },
    },
    {
      name: 'Space',
      climate: 'space',
      sky: ['#0b0b2a', '#241640'],
      skyDark: ['#05050f', '#140d28'],
      groundFill: '#3a2f4a',
      ink: '#dfe6ff',
      detail: '#8f7fbf',
      obOutline: 'rgba(255,255,255,0.6)',
      clouds: false,
      ground: [
        { sprite: MOON_ROCK, color: '#8b8b9a', color2: '#5a5a6a' },
        { sprite: MOON_ROCK_BIG, color: '#8b8b9a', color2: '#5a5a6a' },
      ],
      flyer: { frames: [COMET_A, COMET_B], color: '#dfe9ff', color2: '#ffd27f' },
      flyChance: 0.24,
      cameos: [
        { type: 'ufo', chance: 0.12, parallax: 0.2, y: 46, span: 50 },
      ],
      drawBg: function (ctx, W, H, GY, scroll) {
        starField(ctx, W, H, scroll);
        ctx.fillStyle = '#cfd6f5';
        circle(ctx, 110, 52, 26);
        ctx.fillStyle = 'rgba(120,120,160,0.4)';
        circle(ctx, 102, 46, 5); circle(ctx, 120, 58, 4); circle(ctx, 114, 44, 3);
        repeatX(scroll * 0.15, 380, W, function (x, k) {
          ctx.fillStyle = (k % 2 === 0) ? '#5a7fd0' : '#c0673f';
          circle(ctx, x + 40, 64, 18);
          ctx.strokeStyle = 'rgba(255,255,255,0.5)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(x + 40, 64, 32, 9, 0.4, 0, Math.PI * 2);
          ctx.stroke();
        });
      },
    },
  ];

  // Render a background cameo entity for the current frame.
  function drawCameo(ctx, cm, GROUND_Y) {
    const progress = (cm.spawnX - cm.x) / cm.travel;
    switch (cm.type) {
      case 'airplane': airplaneFig(ctx, cm.x, cm.y, '#eef2f6'); break;
      case 'ufo': ufoFig(ctx, cm.x, cm.y); break;
      case 'camel': camelFig(ctx, cm.x, GROUND_Y, '#6b3f1c'); break;
      case 'wagon': coveredWagon(ctx, cm.x, GROUND_Y, '#7a4a22', '#f0e6c8'); break;
      case 'kangaroo': kangarooHop(ctx, cm.x, GROUND_Y, progress, '#5a2a14'); break;
      case 'dolphin': dolphinFig(ctx, cm.x, GROUND_Y + 8, progress, '#5a7fa0'); break;
      case 'shark': sharkFinFig(ctx, cm.x, GROUND_Y + 10, '#3a4654'); break;
    }
  }

  // -------------------------------- Game ---------------------------------
  function CappyRun() {
    this.active = false;
    this.overlay = null;
    this.canvas = null;
    this.ctx = null;
    this.rafId = null;
    this.last = 0;
    this.keys = { jump: false, duck: false };

    this.W = 800;
    this.H = 200;
    this.GROUND_Y = 160;

    this.state = 'ready'; // 'ready' | 'playing' | 'enter' | 'over'
    this.cappy = null;
    this.obstacles = [];
    this.clouds = [];
    this.cameos = [];
    this.cameoTimer = 0;
    this.weatherParticles = [];
    this.groundOffset = 0;
    this.speed = 0;
    this.baseSpeed = 240; // px/sec
    this.maxSpeed = 540;
    this.distance = 0;
    this.score = 0;
    this.hi = parseInt(localStorage.getItem('cappyRun.hi') || '0', 10) || 0;
    this.board = this._loadBoard();
    this.spawnTimer = 0;
    this.cloudTimer = 0;
    this.frameTick = 0;

    this.stage = 0;
    this.theme = THEMES[0];
    this.themeQueue = [];
    this.bgScroll = 0;
    this.stageBannerTimer = 0;
    this.stageBannerName = '';
    this.stageEl = null;

    // 10th-stage low-visibility weather
    this.lowVis = false;
    this.weather = null; // 'rain' | 'snow' | 'night'
    this.lightningTimer = 0;
    this.lightningFlash = 0; // >0 while a lightning flash brightens the scene

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._tick = this._tick.bind(this);
  }

  CappyRun.prototype.start = function () {
    if (this.active) return;
    this.active = true;
    this._buildDOM();
    this._reset();
    // Brief idle "ready" pose on first launch so the breathing animation
    // gets a moment on screen before the run kicks in. Jump skips ahead.
    this.state = 'ready';
    this.readyTimer = 0.9;
    this.last = performance.now();
    document.addEventListener('keydown', this._onKeyDown, true);
    document.addEventListener('keyup', this._onKeyUp, true);
    this.rafId = requestAnimationFrame(this._tick);
    // Track via GA if present.
    if (window.gtag) {
      try { window.gtag('event', 'cappy_run_start', { source: 'konami' }); } catch (_) {}
    }
  };

  CappyRun.prototype.stop = function () {
    if (!this.active) return;
    this.active = false;
    cancelAnimationFrame(this.rafId);
    this.rafId = null;
    document.removeEventListener('keydown', this._onKeyDown, true);
    document.removeEventListener('keyup', this._onKeyUp, true);
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.overlay = null;
    this.canvas = null;
    this.ctx = null;
  };

  CappyRun.prototype._buildDOM = function () {
    const overlay = document.createElement('div');
    overlay.id = 'cappyRunOverlay';
    overlay.className = 'is-active';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Cappy Run game. Press Escape to exit.');

    const frame = document.createElement('div');
    frame.className = 'cappy-run-frame';

    const topbar = document.createElement('div');
    topbar.className = 'cappy-run-topbar';

    // Close button sits immediately to the left of the "Cappy Run" title.
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'cappy-run-close';
    closeBtn.setAttribute('aria-label', 'Exit Cappy Run');
    closeBtn.addEventListener('click', () => this.stop());

    const left = document.createElement('span');
    left.className = 'cappy-run-left';
    const title = document.createElement('span');
    title.className = 'cappy-run-title';
    title.textContent = 'Cappy Run';
    left.appendChild(closeBtn);
    left.appendChild(title);

    const stage = document.createElement('span');
    stage.className = 'cappy-run-stage';
    stage.textContent = THEMES[0].name;
    const hint = document.createElement('span');
    hint.className = 'cappy-run-hint';
    hint.textContent = 'Space / ↑ jump · ↓ duck · Esc to exit';

    topbar.appendChild(left);
    topbar.appendChild(stage);
    topbar.appendChild(hint);

    const wrap = document.createElement('div');
    wrap.className = 'cappy-run-canvas-wrap';

    const canvas = document.createElement('canvas');
    canvas.width = this.W;
    canvas.height = this.H;
    canvas.tabIndex = 0;

    // Game-over / high-score panel overlays the canvas.
    const panel = document.createElement('div');
    panel.className = 'cappy-run-panel';
    panel.style.display = 'none';

    wrap.appendChild(canvas);
    wrap.appendChild(panel);
    frame.appendChild(topbar);
    frame.appendChild(wrap);
    overlay.appendChild(frame);

    // On-screen touch controls (mobile / portrait): ↑ jumps, ↓ ducks. Placed
    // about a third of the way up the screen so thumbs can reach them while the
    // game frame sits at the bottom. Hidden on non-touch devices via CSS.
    const controls = document.createElement('div');
    controls.className = 'cappy-run-touch';

    const downBtn = document.createElement('button');
    downBtn.type = 'button';
    downBtn.className = 'cappy-touch-btn cappy-touch-btn--down';
    downBtn.setAttribute('aria-label', 'Duck');
    downBtn.innerHTML = '<span class="cappy-touch-glyph" aria-hidden="true">↓</span>';

    const upBtn = document.createElement('button');
    upBtn.type = 'button';
    upBtn.className = 'cappy-touch-btn cappy-touch-btn--up';
    upBtn.setAttribute('aria-label', 'Jump');
    upBtn.innerHTML = '<span class="cappy-touch-glyph" aria-hidden="true">↑</span>';

    // Visual press feedback: held while pressed, plays a release "pop".
    const press = (btn) => {
      btn.classList.remove('is-released');
      btn.classList.add('is-pressed');
    };
    const release = (btn) => {
      if (btn.classList.contains('is-pressed')) {
        btn.classList.remove('is-pressed');
        btn.classList.add('is-released');
      }
    };
    [upBtn, downBtn].forEach((b) => {
      b.addEventListener('animationend', (e) => {
        if (e.animationName === 'cappyPop') b.classList.remove('is-released');
      });
    });

    upBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      press(upBtn);
      if (this.state === 'enter') return;
      if (this.state === 'over') {
        this._restart();
      } else if (this.state === 'ready') {
        this.state = 'playing';
      } else {
        this._jump();
        this.keys.jump = true;
      }
    });
    const endJump = () => { this.keys.jump = false; release(upBtn); };
    upBtn.addEventListener('pointerup', endJump);
    upBtn.addEventListener('pointercancel', endJump);
    upBtn.addEventListener('pointerleave', endJump);

    downBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      press(downBtn);
      this.keys.duck = true;
      if (this.cappy && !this.cappy.onGround) {
        this.cappy.vy = Math.max(this.cappy.vy, 900);
      }
    });
    const endDuck = () => { this.keys.duck = false; release(downBtn); };
    downBtn.addEventListener('pointerup', endDuck);
    downBtn.addEventListener('pointercancel', endDuck);
    downBtn.addEventListener('pointerleave', endDuck);

    // Buttons sit below the game frame.
    controls.appendChild(upBtn);
    controls.appendChild(downBtn);
    overlay.appendChild(controls);

    document.body.appendChild(overlay);

    // Touch / click on canvas = jump (mobile-friendly).
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (this.state === 'enter') return;
      if (this.state === 'over') {
        this._restart();
      } else if (this.state === 'ready') {
        this.state = 'playing';
      } else {
        this._jump();
      }
    });

    // Tapping the game-over panel (but not its inputs/buttons) restarts.
    panel.addEventListener('pointerdown', (e) => {
      if (this.state !== 'over') return;
      if (e.target.closest('input, button')) return;
      e.preventDefault();
      this._restart();
    });

    this.overlay = overlay;
    this.canvas = canvas;
    this.panel = panel;
    this.stageEl = stage;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    canvas.focus();
  };

  CappyRun.prototype._reset = function () {
    this.cappy = {
      x: 60,
      y: this.GROUND_Y - 44, // 11 braille rows × 4 px per row
      vy: 0,
      onGround: true,
      ducking: false,
      runFrame: 0,
      duckFrame: 0,
      idleFrame: 0,
    };
    this.obstacles = [];
    this.clouds = [];
    this.cameos = [];
    this.cameoTimer = 1.5;
    this.weatherParticles = [];
    this.speed = this.baseSpeed;
    this.distance = 0;
    this.score = 0;
    this.spawnTimer = 0.6;
    this.cloudTimer = 0;
    this.frameTick = 0;
    // Always start on the rainforest stage; queue the rest with no repeats.
    this.stage = 0;
    this.theme = THEMES[0];
    this.themeQueue = shuffle(THEMES.slice(1));
    this.bgScroll = 0;
    this.stageBannerTimer = 0;
    this.stageBannerName = '';
    this.lowVis = false;
    this.weather = null;
    this.lightningTimer = 0;
    this.lightningFlash = 0;
    if (this.stageEl) this.stageEl.textContent = THEMES[0].name;
  };

  CappyRun.prototype._advanceStage = function (stageIndex) {
    this.stage = stageIndex;
    let theme;
    if (stageIndex === 0) {
      theme = THEMES[0];
    } else {
      // Draw from a shuffled queue so no stage repeats until every theme has
      // been played; refill (excluding the current theme) when it empties.
      if (!this.themeQueue || this.themeQueue.length === 0) {
        this.themeQueue = shuffle(THEMES.filter((t) => t !== this.theme));
      }
      theme = this.themeQueue.shift();
    }
    this.theme = theme;
    this.stageBannerName = theme.name;
    this.stageBannerTimer = 2.5;
    if (this.stageEl) this.stageEl.textContent = theme.name;

    // From the 10th stage on, the weather closes in: rain in hot climates,
    // snow in cold ones, night in the city / deep space. Lightning flashes
    // briefly restore visibility to keep the player on edge.
    this.lowVis = (stageIndex + 1) >= 10;
    if (this.lowVis) {
      this.weather = (theme.climate === 'cold') ? 'snow'
        : (theme.climate === 'hot') ? 'rain'
        : 'night';
      this.lightningTimer = 2 + Math.random() * 4;
    } else {
      this.weather = null;
    }
  };

  CappyRun.prototype._onKeyDown = function (e) {
    if (!this.active) return;
    const k = e.key;
    if (k === 'Escape') {
      e.preventDefault();
      this.stop();
      return;
    }
    if (k === ' ' || k === 'ArrowUp' || k === 'Spacebar') {
      e.preventDefault();
      if (this.state === 'over') {
        // Clear the leaderboard / game-over overlay so the next run is
        // actually visible. Touch / pointer restarts already do this via
        // _restart(); the keyboard path previously skipped _hidePanel().
        this._restart();
        return;
      }
      if (this.state === 'ready') {
        // Skip the idle intro and start running immediately.
        this.state = 'playing';
        return;
      }
      this._jump();
      this.keys.jump = true;
    } else if (k === 'ArrowDown') {
      e.preventDefault();
      this.keys.duck = true;
      if (this.cappy && !this.cappy.onGround) {
        // Fast-fall when ducking mid-air.
        this.cappy.vy = Math.max(this.cappy.vy, 900);
      }
    }
  };

  CappyRun.prototype._onKeyUp = function (e) {
    if (!this.active) return;
    if (e.key === ' ' || e.key === 'ArrowUp') this.keys.jump = false;
    if (e.key === 'ArrowDown') this.keys.duck = false;
  };

  CappyRun.prototype._jump = function () {
    if (this.state !== 'playing') return;
    if (this.cappy.onGround) {
      this.cappy.vy = -560;
      this.cappy.onGround = false;
    }
  };

  CappyRun.prototype._tick = function (now) {
    if (!this.active) return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    if (this.state === 'ready') {
      this.frameTick += dt;
      this.cappy.idleFrame = Math.floor(this.frameTick * 2) % CAPPY_IDLE_FRAMES.length;
      this.readyTimer -= dt;
      if (this.readyTimer <= 0) this.state = 'playing';
    } else if (this.state === 'playing') {
      this._update(dt);
    }
    this._draw();
    this.rafId = requestAnimationFrame(this._tick);
  };

  CappyRun.prototype._update = function (dt) {
    this.frameTick += dt;
    // Speed ramps up with distance.
    this.distance += this.speed * dt;
    this.score = Math.floor(this.distance / 5);
    this.speed = Math.min(this.maxSpeed, this.baseSpeed + this.distance * 0.04);
    this.bgScroll += this.speed * dt;

    // Swap the backdrop every STAGE_POINTS points.
    const targetStage = Math.floor(this.score / STAGE_POINTS);
    if (targetStage !== this.stage) this._advanceStage(targetStage);
    if (this.stageBannerTimer > 0) this.stageBannerTimer -= dt;

    // Cappy physics
    const gravity = 1800;
    this.cappy.vy += gravity * dt;
    this.cappy.y += this.cappy.vy * dt;

    const duck = this.keys.duck && this.cappy.onGround;
    this.cappy.ducking = duck;
    const cappyH = duck ? 32 : 44;
    const groundY = this.GROUND_Y - cappyH;
    if (this.cappy.y >= groundY) {
      this.cappy.y = groundY;
      this.cappy.vy = 0;
      this.cappy.onGround = true;
    }

    // Running / ducking / idle animation cycles. 14 fps for the run stride
    // keeps the six-frame loop legible without feeling stuttery.
    if (this.cappy.onGround) {
      this.cappy.runFrame = Math.floor(this.frameTick * 14) % CAPPY_RUN_FRAMES.length;
      this.cappy.duckFrame = Math.floor(this.frameTick * 10) % CAPPY_DUCK_FRAMES.length;
    }
    this.cappy.idleFrame = Math.floor(this.frameTick * 2) % CAPPY_IDLE_FRAMES.length;

    // Ground scroll
    this.groundOffset = (this.groundOffset + this.speed * dt) % 24;

    // Obstacles
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this._spawnObstacle();
      // Spawn interval shrinks with speed; jitter for variety.
      const base = Math.max(0.6, 1.6 - this.distance * 0.0002);
      this.spawnTimer = base + Math.random() * 0.9;
    }
    for (const ob of this.obstacles) ob.x -= this.speed * dt;
    this.obstacles = this.obstacles.filter(ob => ob.x + ob.w > -10);

    // Clouds
    this.cloudTimer -= dt;
    if (this.cloudTimer <= 0) {
      this.clouds.push({ x: this.W + 10, y: 20 + Math.random() * 60 });
      this.cloudTimer = 1.5 + Math.random() * 2.5;
    }
    for (const c of this.clouds) c.x -= this.speed * 0.25 * dt;
    this.clouds = this.clouds.filter(c => c.x > -40);

    // Background cameos (decorative, occasional / rare per theme).
    this.cameoTimer -= dt;
    if (this.cameoTimer <= 0) {
      this.cameoTimer = 2.2 + Math.random() * 3.2;
      const list = this.theme.cameos || [];
      for (const c of list) {
        if (Math.random() < c.chance) {
          const span = c.span || 40;
          const spawnX = this.W + span;
          this.cameos.push({
            type: c.type, x: spawnX, spawnX: spawnX, y: c.y || 0,
            parallax: c.parallax, span: span, travel: this.W + span * 2 + 40,
          });
          break;
        }
      }
    }
    for (const cm of this.cameos) cm.x -= this.speed * cm.parallax * dt;
    this.cameos = this.cameos.filter(cm => cm.x > -(cm.span + 40));

    // Low-visibility weather (10th stage onward).
    if (this.lowVis) this._updateWeather(dt);

    // Collision check
    const cb = this._cappyBox();
    for (const ob of this.obstacles) {
      if (boxesOverlap(cb, ob)) {
        this._gameOver();
        return;
      }
    }
  };

  CappyRun.prototype._cappyBox = function () {
    // Cappy is drawn from Braille-decoded silhouettes at scale 1. The
    // collision box trims the transparent margin so contact feels fair.
    if (this.cappy.ducking) {
      // Duck sprite: 60×32 px. Body spans roughly cols 4..58, rows 8..28.
      return { x: this.cappy.x + 6, y: this.cappy.y + 10, w: 50, h: 18 };
    }
    // Run sprite: 60×44 px. Body spans roughly cols 6..54, rows 12..40.
    return { x: this.cappy.x + 8, y: this.cappy.y + 14, w: 44, h: 24 };
  };

  CappyRun.prototype._spawnObstacle = function () {
    const t = this.theme;
    const r = Math.random();
    if (this.distance > 800 && t.flyer && r < t.flyChance) {
      // Flying obstacle at one of two heights.
      const f = t.flyer;
      const scale = f.scale || 2;
      const sz = spriteSize(f.frames[0]);
      const w = sz.w * scale;
      const h = sz.h * scale;
      const high = Math.random() < 0.5;
      const y = high ? this.GROUND_Y - 72 : this.GROUND_Y - 40;
      this.obstacles.push({
        x: this.W + 10, y: y, w: w, h: h, scale: scale,
        frames: f.frames, color: f.color, color2: f.color2,
      });
    } else {
      // Ground obstacle picked from this stage's set.
      const defs = t.ground;
      const d = defs[Math.floor(Math.random() * defs.length)];
      const scale = d.scale || 2;
      const base = d.sprite || d.frames[0];
      const sz = spriteSize(base);
      const w = sz.w * scale;
      const h = sz.h * scale;
      this.obstacles.push({
        x: this.W + 10, y: this.GROUND_Y - h, w: w, h: h, scale: scale,
        sprite: d.sprite || null, frames: d.frames || null,
        color: d.color, color2: d.color2,
      });
    }
  };

  CappyRun.prototype._gameOver = function () {
    if (this.score > this.hi) {
      this.hi = this.score;
      try { localStorage.setItem('cappyRun.hi', String(this.hi)); } catch (_) {}
    }
    if (window.gtag) {
      try { window.gtag('event', 'cappy_run_over', { score: this.score }); } catch (_) {}
    }
    if (this._qualifies(this.score)) {
      this.state = 'enter';
      this._showEntry();
    } else {
      this.state = 'over';
      this._showOverPanel();
    }
  };

  CappyRun.prototype._restart = function () {
    this._hidePanel();
    this._reset();
    this.state = 'playing';
  };

  // ----------------------------- Leaderboard -----------------------------
  CappyRun.prototype._loadBoard = function () {
    try {
      const raw = localStorage.getItem('cappyRun.board');
      const arr = raw ? JSON.parse(raw) : [];
      if (Array.isArray(arr)) {
        return arr
          .filter((e) => e && typeof e.score === 'number')
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
      }
    } catch (_) {}
    return [];
  };

  CappyRun.prototype._saveBoard = function () {
    try {
      localStorage.setItem('cappyRun.board', JSON.stringify(this.board.slice(0, 10)));
    } catch (_) {}
  };

  CappyRun.prototype._qualifies = function (score) {
    if (score <= 0) return false;
    if (this.board.length < 10) return true;
    return score > this.board[this.board.length - 1].score;
  };

  CappyRun.prototype._submitScore = function (name) {
    name = String(name || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3) || 'CAP';
    const entry = { name: name, score: this.score };
    this.board.push(entry);
    this.board.sort((a, b) => b.score - a.score);
    this.board = this.board.slice(0, 10);
    this._saveBoard();
    return entry;
  };

  CappyRun.prototype._boardHTML = function (highlight) {
    let rows = '';
    for (let i = 0; i < 10; i++) {
      const e = this.board[i];
      const isHi = highlight && e === highlight;
      const name = e ? escapeHTML(e.name) : '---';
      const score = e ? pad(e.score, 5) : '-----';
      rows += '<li' + (isHi ? ' class="is-you"' : '') + '>' +
        '<span class="r">' + (i + 1) + '.</span>' +
        '<span class="n">' + name + '</span>' +
        '<span class="s">' + score + '</span></li>';
    }
    return '<ol class="cappy-board">' + rows + '</ol>';
  };

  CappyRun.prototype._hidePanel = function () {
    if (this.panel) { this.panel.style.display = 'none'; this.panel.innerHTML = ''; }
  };

  CappyRun.prototype._showEntry = function () {
    if (!this.panel) return;
    this.panel.style.display = 'flex';
    this.panel.innerHTML =
      '<div class="cappy-panel-inner">' +
        '<div class="cappy-panel-title">NEW HIGH SCORE!</div>' +
        '<div class="cappy-panel-sub">Score ' + pad(this.score, 5) + ' — enter your initials</div>' +
        '<div class="cappy-entry-row">' +
          '<input class="cappy-initials" maxlength="3" autocomplete="off" ' +
          'autocapitalize="characters" spellcheck="false" aria-label="Initials" placeholder="AAA">' +
          '<button type="button" class="cappy-save">SAVE</button>' +
        '</div>' +
      '</div>';
    const input = this.panel.querySelector('.cappy-initials');
    const save = this.panel.querySelector('.cappy-save');
    const commit = () => {
      const entry = this._submitScore(input.value);
      this.state = 'over';
      this._showOverPanel(entry);
    };
    input.addEventListener('input', () => {
      input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
    });
    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') { e.preventDefault(); commit(); }
    });
    save.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); commit(); });
    save.addEventListener('pointerdown', (e) => e.stopPropagation());
    setTimeout(() => { try { input.focus(); } catch (_) {} }, 30);
  };

  CappyRun.prototype._showOverPanel = function (highlight) {
    if (!this.panel) return;
    this.panel.style.display = 'flex';
    this.panel.innerHTML =
      '<div class="cappy-panel-inner">' +
        '<div class="cappy-panel-title">GAME OVER</div>' +
        '<div class="cappy-panel-sub">Score ' + pad(this.score, 5) + ' · Best ' + pad(this.hi, 5) + '</div>' +
        '<div class="cappy-board-title">ALL-TIME HIGH SCORES</div>' +
        this._boardHTML(highlight) +
        '<div class="cappy-panel-hint">Tap / Space to play again · Esc to exit</div>' +
      '</div>';
  };

  // ------------------------------- Weather -------------------------------
  CappyRun.prototype._newParticle = function () {
    return {
      x: Math.random() * (this.W + 120) - 20,
      y: Math.random() * this.H,
      s: 0.7 + Math.random() * 0.8,
    };
  };

  CappyRun.prototype._updateWeather = function (dt) {
    const isSnow = this.weather === 'snow';
    const isRain = this.weather === 'rain';
    if (isSnow || isRain) {
      const target = isSnow ? 80 : 110;
      while (this.weatherParticles.length < target) this.weatherParticles.push(this._newParticle());
    } else {
      this.weatherParticles.length = 0;
    }
    const vx = isRain ? (-this.speed * 0.4 - 260) : (-this.speed * 0.15 - 20);
    const vy = isRain ? 760 : 80;
    for (const p of this.weatherParticles) {
      const sway = isSnow ? Math.sin((p.y + this.frameTick * 60) * 0.05) * 24 : 0;
      p.x += (vx + sway) * dt;
      p.y += vy * p.s * dt;
      if (p.y > this.H + 4 || p.x < -12) {
        p.x = Math.random() * (this.W + 120);
        p.y = -6;
        p.s = 0.7 + Math.random() * 0.8;
      }
    }
    // Lightning: a flash that briefly clears the gloom (increased visibility).
    if (this.lightningFlash > 0) this.lightningFlash -= dt;
    this.lightningTimer -= dt;
    if (this.lightningTimer <= 0) {
      this.lightningFlash = 0.5;
      this.lightningTimer = 4 + Math.random() * 6;
    }
  };

  CappyRun.prototype._drawWeather = function (ctx) {
    const flash = Math.max(0, this.lightningFlash) / 0.5; // 0..1
    let darkness = (this.weather === 'snow') ? 0.4 : 0.6;
    darkness *= (1 - 0.85 * flash); // lightning lifts the gloom
    const tint = (this.weather === 'night') ? '8,10,26'
      : (this.weather === 'rain') ? '18,24,40'
      : '150,170,200';
    ctx.fillStyle = 'rgba(' + tint + ',' + darkness.toFixed(3) + ')';
    ctx.fillRect(0, 0, this.W, this.H);

    if (this.weather === 'rain') {
      ctx.strokeStyle = 'rgba(200,220,255,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (const p of this.weatherParticles) { ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 6, p.y + 13); }
      ctx.stroke();
    } else if (this.weather === 'snow') {
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      for (const p of this.weatherParticles) { const sz = 2 * p.s; ctx.fillRect(p.x, p.y, sz, sz); }
    }

    if (flash > 0) {
      ctx.fillStyle = 'rgba(255,255,255,' + (0.4 * flash).toFixed(3) + ')';
      ctx.fillRect(0, 0, this.W, this.H);
    }
  };

  // ------------------------------ Rendering ------------------------------
  CappyRun.prototype._draw = function () {
    const ctx = this.ctx;
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    const t = this.theme || THEMES[0];
    const fg = t.ink;
    const fgLight = t.detail;

    ctx.clearRect(0, 0, this.W, this.H);

    // Stage sky gradient.
    const skyColors = (dark && t.skyDark) ? t.skyDark : t.sky;
    const sky = ctx.createLinearGradient(0, 0, 0, this.H);
    sky.addColorStop(0, skyColors[0]);
    sky.addColorStop(1, skyColors[1]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.W, this.H);

    // Parallax scenery for the current stage.
    t.drawBg(ctx, this.W, this.H, this.GROUND_Y, this.bgScroll, dark);

    // Clouds (skipped for starfield stages).
    if (t.clouds !== false) {
      for (const c of this.clouds) {
        drawSprite(ctx, CLOUD, c.x, c.y, 2, 'rgba(255,255,255,0.85)', null);
      }
    }

    // Ground fill band beneath the horizon.
    ctx.fillStyle = t.groundFill;
    ctx.fillRect(0, this.GROUND_Y + 1, this.W, this.H - this.GROUND_Y);

    // Ground line + dashed texture (river-bank suggestion)
    ctx.strokeStyle = fg;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, this.GROUND_Y + 1);
    ctx.lineTo(this.W, this.GROUND_Y + 1);
    ctx.stroke();
    // Pebble pattern
    ctx.fillStyle = fg;
    for (let x = -this.groundOffset; x < this.W; x += 24) {
      ctx.fillRect(x, this.GROUND_Y + 6, 8, 2);
      ctx.fillRect(x + 14, this.GROUND_Y + 11, 4, 2);
    }
    // Water ripples below the ground line (capybara habitat)
    ctx.strokeStyle = fgLight;
    ctx.lineWidth = 1;
    for (let x = -this.groundOffset * 1.4; x < this.W; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, this.GROUND_Y + 18);
      ctx.quadraticCurveTo(x + 9, this.GROUND_Y + 14, x + 18, this.GROUND_Y + 18);
      ctx.quadraticCurveTo(x + 27, this.GROUND_Y + 22, x + 36, this.GROUND_Y + 18);
      ctx.stroke();
    }

    // Background cameos (behind the obstacles and Cappy).
    for (const cm of this.cameos) drawCameo(ctx, cm, this.GROUND_Y);

    // Obstacles — heavy outline + contact shadow so they read as obviously
    // foreground hazards rather than background scenery.
    const outline = t.obOutline || 'rgba(0,0,0,0.85)';
    for (const ob of this.obstacles) {
      let sprite = ob.sprite;
      if (ob.frames) {
        sprite = ob.frames[Math.floor(this.frameTick * 8) % ob.frames.length];
      }
      // Drop a soft ellipse shadow beneath ground obstacles to ground them.
      const isFlyer = ob.y + ob.h < this.GROUND_Y - 4;
      if (!isFlyer) {
        ctx.fillStyle = 'rgba(0,0,0,0.28)';
        ctx.beginPath();
        ctx.ellipse(ob.x + ob.w / 2, this.GROUND_Y + 2, ob.w * 0.45, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      drawSpriteOutlined(ctx, sprite, ob.x, ob.y, ob.scale, ob.color || fg, ob.color2 || null, outline);
    }

    // Cappy — pick the right pose / frame for the current state.
    const bodyColor = dark ? CAPPY_BODY_DARK : CAPPY_BODY_LIGHT;
    const outlineColor = dark ? CAPPY_OUTLINE_DARK : CAPPY_OUTLINE_LIGHT;
    const shadowColor = dark ? CAPPY_SHADOW_DARK : CAPPY_SHADOW_LIGHT;
    if (this.state === 'over' || this.state === 'enter') {
      // Display game over as a dark shadow resting on the ground.
      const gh = CAPPY_GAMEOVER.length;
      drawSprite(ctx, CAPPY_GAMEOVER, this.cappy.x, this.GROUND_Y - gh, 1, shadowColor);
    } else {
      let cappySprite;
      // Per-frame vertical offset. Subtle pixel bob on the run cycle sells
      // the gait — body sinks on plant frames (1, 4) and lifts on the
      // mid-air crossing frames (2, 5).
      let yOffset = 0;
      if (this.cappy.ducking) {
        cappySprite = CAPPY_DUCK_FRAMES[this.cappy.duckFrame];
        // Duck breath bob: tiny lift on the "stretch" / "arch" frames.
        yOffset = (this.cappy.duckFrame === 1 || this.cappy.duckFrame === 3) ? -1 : 0;
      } else if (!this.cappy.onGround) {
        // Three-phase jump: takeoff → peak → landing, picked by vertical velocity.
        cappySprite = this.cappy.vy < -180
          ? CAPPY_JUMP_FRAMES.takeoff
          : this.cappy.vy > 220
            ? CAPPY_JUMP_FRAMES.landing
            : CAPPY_JUMP_FRAMES.peak;
      } else if (this.state === 'ready') {
        cappySprite = CAPPY_IDLE_FRAMES[this.cappy.idleFrame];
      } else {
        cappySprite = CAPPY_RUN_FRAMES[this.cappy.runFrame];
        const bobs = [0, 1, -1, 0, 1, -1];
        yOffset = bobs[this.cappy.runFrame] || 0;
      }
      drawSpriteOutlined(ctx, cappySprite, this.cappy.x, this.cappy.y + yOffset, 1,
        bodyColor, bodyColor, outlineColor);
    }

    // Low-visibility weather overlay (drawn over the scene, under the HUD).
    if (this.lowVis) this._drawWeather(ctx);

    // HUD
    ctx.fillStyle = fg;
    ctx.font = '700 14px "Courier New", monospace';
    ctx.textAlign = 'right';
    const hiText = 'HI ' + pad(this.hi, 5);
    const scText = pad(this.score, 5);
    ctx.fillText(hiText + '   ' + scText, this.W - 12, 22);
    ctx.textAlign = 'left';

    // Stage-change banner (fades out over its lifetime).
    if (this.stageBannerTimer > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, this.stageBannerTimer / 0.6);
      ctx.fillStyle = fg;
      ctx.textAlign = 'center';
      ctx.font = '700 20px "Courier New", monospace';
      ctx.fillText('STAGE ' + (this.stage + 1) + ' · ' + this.stageBannerName.toUpperCase(),
        this.W / 2, 46);
      ctx.restore();
      ctx.textAlign = 'left';
    }
    // Game-over / high-score display is handled by the HTML panel overlay.
  };

  // ------------------------------ Helpers --------------------------------
  function drawSprite(ctx, rows, x, y, scale, darkOrPalette, lightColor) {
    const palette = (typeof darkOrPalette === 'object' && darkOrPalette !== null) ? darkOrPalette : null;
    const darkColor = palette ? null : darkOrPalette;
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      for (let c = 0; c < row.length; c++) {
        const ch = row.charAt(c);
        if (ch === '.') continue;
        let color = null;
        if (palette) {
          color = palette[ch];
        } else if (ch === '#') {
          color = darkColor;
        } else if (ch === 'o') {
          color = lightColor;
        }
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(x + c * scale, y + r * scale, scale, scale);
      }
    }
  }

  // Draw a sprite with a halo so it reads against any backdrop. Uses an
  // 8-direction outline at the sprite's pixel scale, which fills in corners
  // the 4-direction version left transparent and makes obstacles obviously
  // separate from scenery.
  function drawSpriteOutlined(ctx, rows, x, y, scale, color, color2, outline) {
    if (outline) {
      const s = scale || 1;
      const offs = [
        [-s, 0], [s, 0], [0, -s], [0, s],
        [-s, -s], [s, -s], [-s, s], [s, s],
      ];
      for (let i = 0; i < offs.length; i++) {
        drawSprite(ctx, rows, x + offs[i][0], y + offs[i][1], scale, outline, outline);
      }
    }
    drawSprite(ctx, rows, x, y, scale, color, color2 || color);
  }

  function boxesOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function pad(n, len) {
    const s = String(Math.max(0, Math.floor(n)));
    return s.length >= len ? s : '0'.repeat(len - s.length) + s;
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[ch]));
  }
})();
