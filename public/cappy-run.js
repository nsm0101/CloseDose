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

  const THEMES = [
    {
      name: 'Rainforest',
      sky: ['#bfe6cf', '#eaf6ee'],
      groundFill: '#d7ecc9',
      ink: '#234b2c',
      detail: '#4f8a5f',
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
      sky: ['#f6d29b', '#fbe9c6'],
      groundFill: '#e6c79a',
      ink: '#5a3210',
      detail: '#9c6a2e',
      drawBg: function (ctx, W, H, GY, scroll) {
        bgSun(ctx, W - 120, 50, 30, '#ffce5c');
        repeatX(scroll * 0.2, 270, W, function (x) {
          ctx.fillStyle = '#c98a4e';
          ctx.beginPath();
          ctx.moveTo(x, GY); ctx.lineTo(x + 18, GY - 72);
          ctx.lineTo(x + 120, GY - 72); ctx.lineTo(x + 138, GY);
          ctx.closePath(); ctx.fill();
        });
        repeatX(scroll * 0.5, 200, W, function (x) {
          ctx.fillStyle = '#3c7a3a';
          ctx.fillRect(x + 20, GY - 50, 10, 50);
          ctx.fillRect(x + 8, GY - 36, 12, 8);
          ctx.fillRect(x + 8, GY - 44, 6, 16);
          ctx.fillRect(x + 30, GY - 30, 12, 8);
          ctx.fillRect(x + 36, GY - 40, 6, 16);
        });
      },
    },
    {
      name: 'City',
      sky: ['#9fb6d6', '#dfe8f2'],
      groundFill: '#9aa3ad',
      ink: '#222831',
      detail: '#5a6472',
      drawBg: function (ctx, W, H, GY, scroll) {
        const bands = ['#2b6cff', '#d32f2f', '#8e44ad', '#ff8c1a'];
        repeatX(scroll * 0.2, 64, W, function (x, k) {
          const h = 46 + (hash(k) % 78);
          ctx.fillStyle = (k % 2 === 0) ? '#3c4654' : '#4a5563';
          ctx.fillRect(x, GY - h, 56, h);
          ctx.fillStyle = 'rgba(255,221,120,0.85)';
          for (let wy = GY - h + 6; wy < GY - 8; wy += 14) {
            for (let wx = x + 6; wx < x + 50; wx += 14) {
              if ((hash(k * 131 + wx * 7 + wy) & 3) !== 0) ctx.fillRect(wx, wy, 7, 8);
            }
          }
          // TMNT cameo peeking over every 5th rooftop
          if (k % 5 === 0) {
            tmntHead(ctx, x + 28, GY - h - 2, 13, bands[((k / 5) | 0) % 4]);
          }
        });
      },
    },
    {
      name: 'Arctic',
      sky: ['#bfe6f2', '#eaf7fb'],
      groundFill: '#eaf6ff',
      ink: '#2b4a63',
      detail: '#7fb0d6',
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
      sky: ['#ffb877', '#ffe2b0'],
      groundFill: '#f0c98f',
      ink: '#7a3f12',
      detail: '#b9772e',
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
      sky: ['#7fd0f0', '#cdeefb'],
      groundFill: '#f2e2b0',
      ink: '#1f6f78',
      detail: '#3fa9b5',
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
      sky: ['#f0935a', '#ffd9a8'],
      groundFill: '#d98a4e',
      ink: '#4a1d0a',
      detail: '#8a4a22',
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
        repeatX(scroll * 0.5, 340, W, function (x) {
          kangaroo(ctx, x + 20, GY, '#5a2a14');
        });
        repeatX(scroll * 0.6, 130, W, function (x) {
          ctx.fillStyle = '#7a5a2a';
          ctx.beginPath(); ctx.arc(x + 10, GY - 4, 8, Math.PI, 0); ctx.fill();
        });
      },
    },
    {
      name: 'Space',
      sky: ['#0b0b2a', '#241640'],
      skyDark: ['#05050f', '#140d28'],
      groundFill: '#3a2f4a',
      ink: '#dfe6ff',
      detail: '#8f7fbf',
      clouds: false,
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

    this.stage = 0;
    this.theme = THEMES[0];
    this.bgScroll = 0;
    this.stageBannerTimer = 0;
    this.stageBannerName = '';
    this.stageEl = null;

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
      '<span class="cappy-run-stage">' + THEMES[0].name + '</span>' +
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

    // On-screen touch controls (mobile / portrait): ↑ jumps, ↓ ducks. Placed
    // about a third of the way up the screen so thumbs can reach them while the
    // game frame sits at the bottom. Hidden on non-touch devices via CSS.
    const controls = document.createElement('div');
    controls.className = 'cappy-run-touch';

    const downBtn = document.createElement('button');
    downBtn.type = 'button';
    downBtn.className = 'cappy-touch-btn cappy-touch-btn--down';
    downBtn.setAttribute('aria-label', 'Duck');
    downBtn.innerHTML =
      '<span class="cappy-touch-glyph" aria-hidden="true">▼</span>' +
      '<span class="cappy-touch-label" aria-hidden="true">DUCK</span>';

    const upBtn = document.createElement('button');
    upBtn.type = 'button';
    upBtn.className = 'cappy-touch-btn cappy-touch-btn--up';
    upBtn.setAttribute('aria-label', 'Jump');
    upBtn.innerHTML =
      '<span class="cappy-touch-glyph" aria-hidden="true">▲</span>' +
      '<span class="cappy-touch-label" aria-hidden="true">JUMP</span>';

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
      if (this.state === 'over') {
        this._reset();
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
      if (this.state === 'over') {
        this._reset();
        this.state = 'playing';
      } else {
        this._jump();
      }
    });

    this.overlay = overlay;
    this.canvas = canvas;
    this.stageEl = topbar.querySelector('.cappy-run-stage');
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
    // Always start on the rainforest stage.
    this.stage = 0;
    this.theme = THEMES[0];
    this.bgScroll = 0;
    this.stageBannerTimer = 0;
    this.stageBannerName = '';
    if (this.stageEl) this.stageEl.textContent = THEMES[0].name;
  };

  CappyRun.prototype._advanceStage = function (stageIndex) {
    this.stage = stageIndex;
    let theme;
    if (stageIndex === 0) {
      theme = THEMES[0];
    } else {
      // Random pick from every theme except the rainforest; avoid repeating
      // the theme we just showed.
      const pool = THEMES.slice(1);
      do {
        theme = pool[Math.floor(Math.random() * pool.length)];
      } while (pool.length > 1 && theme === this.theme);
    }
    this.theme = theme;
    this.stageBannerName = theme.name;
    this.stageBannerTimer = 2.5;
    if (this.stageEl) this.stageEl.textContent = theme.name;
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
