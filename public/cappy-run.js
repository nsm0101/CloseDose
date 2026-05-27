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
  // Pixel art encoded as strings. For Cappy sprites the palette is:
  //   '.' transparent · '#' outline · 'B' body brown · 'L' light tan
  //   'D' dark shade · 'E' eye black · 'W' eye highlight · 'M' smile
  // Obstacles still use '#'/'o' against the foreground colors.

  const CAPPY_PALETTE_LIGHT = {
    '#': '#2b1409',
    'B': '#a06438',
    'L': '#d29862',
    'D': '#6b3a1c',
    'E': '#0d0703',
    'W': '#ffffff',
    'M': '#3d1707',
  };

  const CAPPY_PALETTE_DARK = {
    '#': '#1a0c05',
    'B': '#a06438',
    'L': '#d29862',
    'D': '#6b3a1c',
    'E': '#000000',
    'W': '#ffffff',
    'M': '#2a0f04',
  };

  const CAPPY_RUN_A = [
    '..........................',
    '.................##.......',
    '.................####.....',
    '...............#######....',
    '..............#BBBBBBB#...',
    '.............#LBBBBBBBB#..',
    '............#LLBBEEBBBB#..',
    '...........#LLBBBEWBBBBM#.',
    '...#########LBBBBBBBBBBM#.',
    '..#BBBBBBBBBBBBBBBBBBBBM#.',
    '.#BBBBBBBBBBBBBBBBBBBBB##.',
    '.#BBLLBBBBBBBBBBBBBBBB#...',
    '.#BLLBBBBBBBBBBBBBBBBB#...',
    '..#BBBBBBBBBBBBBBBBBB#....',
    '...####...####...####.....',
    '....##.....##.....##......',
  ];

  const CAPPY_RUN_B = [
    '..........................',
    '.................##.......',
    '.................####.....',
    '...............#######....',
    '..............#BBBBBBB#...',
    '.............#LBBBBBBBB#..',
    '............#LLBBEEBBBB#..',
    '...........#LLBBBEWBBBBM#.',
    '...#########LBBBBBBBBBBM#.',
    '..#BBBBBBBBBBBBBBBBBBBBM#.',
    '.#BBBBBBBBBBBBBBBBBBBBB##.',
    '.#BBLLBBBBBBBBBBBBBBBB#...',
    '.#BLLBBBBBBBBBBBBBBBBB#...',
    '..#BBBBBBBBBBBBBBBBBB#....',
    '....####...####...####....',
    '.....##.....##.....##.....',
  ];

  // Mid-jump pose — legs tucked, all four feet off the ground.
  const CAPPY_JUMP = [
    '..........................',
    '.................##.......',
    '.................####.....',
    '...............#######....',
    '..............#BBBBBBB#...',
    '.............#LBBBBBBBB#..',
    '............#LLBBEEBBBB#..',
    '...........#LLBBBEWBBBBM#.',
    '...#########LBBBBBBBBBBM#.',
    '..#BBBBBBBBBBBBBBBBBBBBM#.',
    '.#BBBBBBBBBBBBBBBBBBBBB##.',
    '.#BBLLBBBBBBBBBBBBBBBB#...',
    '.#BLLBBBBBBBBBBBBBBBBB#...',
    '..#BBBBBBBBBBBBBBBBBB#....',
    '....##.....##....##.......',
    '..........................',
  ];

  // Ducking pose — body stretched forward and low (10 rows tall, 30 wide).
  const CAPPY_DUCK_A = [
    '.........................###..',
    '........................#####.',
    '...####################BBBBBB#',
    '..#BBBBBBBBBBBBBBBBBBBBLBEEBB#',
    '.#BBBBBBBBBBBBBBBBBBBBBLBEWBBM',
    '#LLBBBBBBBBBBBBBBBBBBBBBBBBBM#',
    '#BBBBBBBBBBBBBBBBBBBBBBBBBBB#.',
    '.#BBBBBBBBBBBBBBBBBBBBBBBBB#..',
    '..####...####...####...####...',
    '...##.....##.....##.....##....',
  ];

  const CAPPY_DUCK_B = [
    '.........................###..',
    '........................#####.',
    '...####################BBBBBB#',
    '..#BBBBBBBBBBBBBBBBBBBBLBEEBB#',
    '.#BBBBBBBBBBBBBBBBBBBBBLBEWBBM',
    '#LLBBBBBBBBBBBBBBBBBBBBBBBBBM#',
    '#BBBBBBBBBBBBBBBBBBBBBBBBBBB#.',
    '.#BBBBBBBBBBBBBBBBBBBBBBBBB#..',
    '...####...####...####...####..',
    '....##.....##.....##.....##...',
  ];

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

  function spriteSize(sprite) {
    return { w: sprite[0].length, h: sprite.length };
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

    this.state = 'ready'; // 'ready' | 'playing' | 'over'
    this.cappy = null;
    this.obstacles = [];
    this.clouds = [];
    this.groundOffset = 0;
    this.speed = 0;
    this.baseSpeed = 240; // px/sec
    this.maxSpeed = 540;
    this.distance = 0;
    this.score = 0;
    this.hi = parseInt(localStorage.getItem('cappyRun.hi') || '0', 10) || 0;
    this.spawnTimer = 0;
    this.cloudTimer = 0;
    this.frameTick = 0;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._tick = this._tick.bind(this);
  }

  CappyRun.prototype.start = function () {
    if (this.active) return;
    this.active = true;
    this._buildDOM();
    this._reset();
    this.state = 'playing';
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
    topbar.innerHTML =
      '<span class="cappy-run-title">Cappy Run</span>' +
      '<span class="cappy-run-hint">Space / ↑ jump · ↓ duck · Esc to exit</span>';

    const wrap = document.createElement('div');
    wrap.className = 'cappy-run-canvas-wrap';

    const canvas = document.createElement('canvas');
    canvas.width = this.W;
    canvas.height = this.H;
    canvas.tabIndex = 0;

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'cappy-run-close';
    closeBtn.setAttribute('aria-label', 'Exit Cappy Run');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => this.stop());

    wrap.appendChild(canvas);
    wrap.appendChild(closeBtn);
    frame.appendChild(topbar);
    frame.appendChild(wrap);
    overlay.appendChild(frame);
    document.body.appendChild(overlay);

    // Touch / click on canvas = jump (mobile-friendly).
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (this.state === 'over') {
        this._reset();
        this.state = 'playing';
      } else {
        this._jump();
      }
    });

    this.overlay = overlay;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    canvas.focus();
  };

  CappyRun.prototype._reset = function () {
    this.cappy = {
      x: 60,
      y: this.GROUND_Y - 32, // 16-row sprite × 2 scale
      vy: 0,
      onGround: true,
      ducking: false,
      runFrame: 0,
    };
    this.obstacles = [];
    this.clouds = [];
    this.speed = this.baseSpeed;
    this.distance = 0;
    this.score = 0;
    this.spawnTimer = 0.6;
    this.cloudTimer = 0;
    this.frameTick = 0;
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
        this._reset();
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
    if (this.state === 'playing') this._update(dt);
    this._draw();
    this.rafId = requestAnimationFrame(this._tick);
  };

  CappyRun.prototype._update = function (dt) {
    this.frameTick += dt;
    // Speed ramps up with distance.
    this.distance += this.speed * dt;
    this.score = Math.floor(this.distance / 5);
    this.speed = Math.min(this.maxSpeed, this.baseSpeed + this.distance * 0.04);

    // Cappy physics
    const gravity = 1800;
    this.cappy.vy += gravity * dt;
    this.cappy.y += this.cappy.vy * dt;

    const duck = this.keys.duck && this.cappy.onGround;
    this.cappy.ducking = duck;
    const cappyH = duck ? 20 : 32;
    const groundY = this.GROUND_Y - cappyH;
    if (this.cappy.y >= groundY) {
      this.cappy.y = groundY;
      this.cappy.vy = 0;
      this.cappy.onGround = true;
    }

    // Running animation
    if (this.cappy.onGround) {
      this.cappy.runFrame = Math.floor(this.frameTick * 10) % 2;
    }

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
    // Sprites are scale-2; the visible body sits inside a small margin so
    // the collision box trims the transparent borders.
    if (this.cappy.ducking) {
      // Duck sprite: 30×10 cells → 60×20 px. Body spans cols 0-29, rows 2-7.
      return { x: this.cappy.x + 4, y: this.cappy.y + 6, w: 54, h: 12 };
    }
    // Run sprite: 26×16 cells → 52×32 px. Body spans cols 2-23, rows 4-13.
    return { x: this.cappy.x + 6, y: this.cappy.y + 10, w: 42, h: 20 };
  };

  CappyRun.prototype._spawnObstacle = function () {
    const r = Math.random();
    if (this.distance > 800 && r < 0.25) {
      // Flying bird at one of two heights.
      const high = Math.random() < 0.5;
      const sprite = BIRD_A;
      const sz = spriteSize(sprite);
      const scale = 2;
      const w = sz.w * scale;
      const h = sz.h * scale;
      const y = high ? this.GROUND_Y - 70 : this.GROUND_Y - 38;
      this.obstacles.push({
        kind: 'bird', x: this.W + 10, y: y, w: w, h: h, scale: scale,
      });
    } else if (r < 0.55) {
      const scale = 2;
      const sz = spriteSize(PLANT_SMALL);
      const w = sz.w * scale;
      const h = sz.h * scale;
      this.obstacles.push({
        kind: 'plant-small', x: this.W + 10, y: this.GROUND_Y - h, w: w, h: h, scale: scale,
      });
    } else {
      const scale = 2;
      const sz = spriteSize(PLANT_BIG);
      const w = sz.w * scale;
      const h = sz.h * scale;
      this.obstacles.push({
        kind: 'plant-big', x: this.W + 10, y: this.GROUND_Y - h, w: w, h: h, scale: scale,
      });
    }
  };

  CappyRun.prototype._gameOver = function () {
    this.state = 'over';
    if (this.score > this.hi) {
      this.hi = this.score;
      try { localStorage.setItem('cappyRun.hi', String(this.hi)); } catch (_) {}
    }
    if (window.gtag) {
      try { window.gtag('event', 'cappy_run_over', { score: this.score }); } catch (_) {}
    }
  };

  // ------------------------------ Rendering ------------------------------
  CappyRun.prototype._draw = function () {
    const ctx = this.ctx;
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    const fg = dark ? '#e6f0e8' : '#2a3b2f';
    const fgLight = dark ? '#9adfb0' : '#5b8b66';

    ctx.clearRect(0, 0, this.W, this.H);

    // Sky gradient hint via background — let the CSS handle it. Draw clouds.
    for (const c of this.clouds) {
      drawSprite(ctx, CLOUD, c.x, c.y, 2, fgLight, null);
    }

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

    // Obstacles
    for (const ob of this.obstacles) {
      let sprite;
      if (ob.kind === 'plant-small') sprite = PLANT_SMALL;
      else if (ob.kind === 'plant-big') sprite = PLANT_BIG;
      else if (ob.kind === 'bird') {
        sprite = (Math.floor(this.frameTick * 6) % 2 === 0) ? BIRD_A : BIRD_B;
      }
      drawSprite(ctx, sprite, ob.x, ob.y, ob.scale, fg, null);
    }

    // Cappy
    let cappySprite;
    if (this.cappy.ducking) {
      cappySprite = (this.cappy.runFrame === 0) ? CAPPY_DUCK_A : CAPPY_DUCK_B;
    } else if (!this.cappy.onGround) {
      cappySprite = CAPPY_JUMP;
    } else {
      cappySprite = (this.cappy.runFrame === 0) ? CAPPY_RUN_A : CAPPY_RUN_B;
    }
    drawSprite(ctx, cappySprite, this.cappy.x, this.cappy.y, 2,
      dark ? CAPPY_PALETTE_DARK : CAPPY_PALETTE_LIGHT);

    // HUD
    ctx.fillStyle = fg;
    ctx.font = '700 14px "Courier New", monospace';
    ctx.textAlign = 'right';
    const hiText = 'HI ' + pad(this.hi, 5);
    const scText = pad(this.score, 5);
    ctx.fillText(hiText + '   ' + scText, this.W - 12, 22);
    ctx.textAlign = 'left';

    // Banners
    if (this.state === 'over') {
      ctx.fillStyle = fg;
      ctx.font = '700 22px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('G A M E   O V E R', this.W / 2, this.H / 2 - 6);
      ctx.font = '14px "Courier New", monospace';
      ctx.fillText('press space to restart · esc to exit', this.W / 2, this.H / 2 + 16);
      ctx.textAlign = 'left';
    }
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

  function boxesOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function pad(n, len) {
    const s = String(Math.max(0, Math.floor(n)));
    return s.length >= len ? s : '0'.repeat(len - s.length) + s;
  }
})();
