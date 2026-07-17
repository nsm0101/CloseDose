(function () {
  'use strict';

  const CONFIG = Object.freeze({
    laneWidth: 2.15,
    segmentLength: 22,
    segmentCount: 9,
    baseSpeed: 14,
    maxSpeed: 27,
    gravity: 22,
    jumpVelocity: 8.7,
    slideDuration: 0.72,
    turnPromptZ: -20,
    removeZ: 15,
    shieldDuration: 8,
    boostStartCharge: 42,
    fruitBoostCharge: 55,
    boostDrainPerSecond: 24,
    boostSpeedMultiplier: 1.42,
    superchargeDuration: 8,
    superchargeMaxInventory: 3,
    doubleTapWindow: 320,
    doubleTapRadius: 34,
    turnBeginZ: -13,
    turnDuration: 0.56,
    crashDuration: 1.16,
    pitFallDuration: 1.5,
    magnetDuration: 10,
    magnetRadius: 4.2,
    starDuration: 12,
    slowmoDuration: 6,
    slowmoScale: 0.55,
    qteBonus: 40,
    stageCycle: 1600,
  });

  const GAME = Object.freeze({
    START: 'START',
    RUNNING: 'RUNNING',
    PAUSED: 'PAUSED',
    CRASHED: 'CRASHED',
    GAMEOVER: 'GAMEOVER',
  });

  const STAGES = Object.freeze([
    {
      name: 'EMERALD CANOPY', deck: 'the warm-up run', threshold: 0, theme: 'jungle',
      sky: 0x3eb99b, path: 0xc86f3f, pathLight: 0xe29a4d, leaf: 0x155c42,
      leafLight: 0x9bc65b, accent: 0x5fc9ba, fogNear: 42, fogFar: 136,
      speedBonus: 0, safeGap: 1, turnGap: 8, threatMin: 24, threatRange: 9, difficulty: 1,
    },
    {
      name: 'CAPYBARA SPRINGS', deck: 'steam, stone, serenity', threshold: 300, theme: 'springs',
      sky: 0x8fc3cf, path: 0xa89478, pathLight: 0xc9b696, leaf: 0x2e6b52,
      leafLight: 0x8fbf77, accent: 0xf2a1b0, fogNear: 32, fogFar: 116,
      speedBonus: 1.4, safeGap: 1, turnGap: 10, threatMin: 21, threatRange: 8, difficulty: 2,
    },
    {
      name: 'CRYSTAL HOLLOW', deck: 'the cave hums with light', threshold: 700, theme: 'cave',
      sky: 0x1c2040, path: 0x53476b, pathLight: 0x6e5f8e, leaf: 0x2a3560,
      leafLight: 0x8f7bf0, accent: 0x53e0e8, fogNear: 21, fogFar: 82,
      speedBonus: 2.8, safeGap: 0, turnGap: 12, threatMin: 18, threatRange: 7, difficulty: 3,
    },
    {
      name: 'NEON HEIGHTS', deck: 'the city never blinks', threshold: 1150, theme: 'city',
      sky: 0x2b1440, path: 0x3b3852, pathLight: 0x514e70, leaf: 0x232b4c,
      leafLight: 0xff3fa4, accent: 0x35e6ff, fogNear: 26, fogFar: 98,
      speedBonus: 4.1, safeGap: 0, turnGap: 14, threatMin: 15, threatRange: 6, difficulty: 4,
    },
  ]);

  const MISSIONS = Object.freeze([
    { id: 'coins1', label: 'Collect 50 coins', stat: 'coins', target: 50 },
    { id: 'turns1', label: 'Nail 5 corner turns', stat: 'turns', target: 5 },
    { id: 'dist1', label: 'Run 400m in one go', stat: 'bestDistance', target: 400 },
    { id: 'ducks1', label: 'Slide under 3 branches', stat: 'ducks', target: 3 },
    { id: 'leaps1', label: 'Leap 3 gorges', stat: 'leaps', target: 3 },
    { id: 'power1', label: 'Grab 5 power-ups', stat: 'powerups', target: 5 },
    { id: 'city1', label: 'Reach Neon Heights', stat: 'cityVisits', target: 1 },
    { id: 'coins2', label: 'Collect 250 coins', stat: 'coins', target: 250 },
    { id: 'turns2', label: 'Nail 25 corner turns', stat: 'turns', target: 25 },
    { id: 'dist2', label: 'Run 1,000m in one go', stat: 'bestDistance', target: 1000 },
    { id: 'ducks2', label: 'Slide under 15 branches', stat: 'ducks', target: 15 },
    { id: 'leaps2', label: 'Leap 15 gorges', stat: 'leaps', target: 15 },
    { id: 'power2', label: 'Grab 25 power-ups', stat: 'powerups', target: 25 },
    { id: 'city2', label: 'Visit Neon Heights 5 times', stat: 'cityVisits', target: 5 },
    { id: 'coins3', label: 'Collect 1,000 coins', stat: 'coins', target: 1000 },
    { id: 'turns3', label: 'Nail 100 corner turns', stat: 'turns', target: 100 },
    { id: 'dist3', label: 'Run 2,000m in one go', stat: 'bestDistance', target: 2000 },
  ]);

  const stats = safeReadJson('cappy_stats', {
    coins: 0, turns: 0, leaps: 0, ducks: 0, powerups: 0, bestDistance: 0, cityVisits: 0, done: [],
  });

  const dom = {
    shell: document.getElementById('game-shell'),
    container: document.getElementById('game-container'),
    hud: document.getElementById('hud'),
    hudScore: document.getElementById('hud-score'),
    hudCoins: document.getElementById('hud-coins'),
    hudHighscore: document.getElementById('hud-highscore'),
    comboChip: document.getElementById('combo-chip'),
    hudCombo: document.getElementById('hud-combo'),
    shieldChip: document.getElementById('shield-chip'),
    shieldTime: document.getElementById('shield-time'),
    magnetChip: document.getElementById('magnet-chip'),
    magnetTime: document.getElementById('magnet-time'),
    starChip: document.getElementById('star-chip'),
    starTime: document.getElementById('star-time'),
    slowmoChip: document.getElementById('slowmo-chip'),
    slowmoTime: document.getElementById('slowmo-time'),
    powWord: document.getElementById('pow-word'),
    panelWipe: document.getElementById('panel-wipe'),
    missionList: document.getElementById('mission-list'),
    musicButton: document.getElementById('music-button'),
    skinOptions: Array.prototype.slice.call(document.querySelectorAll('.skin-option')),
    boostMeter: document.getElementById('boost-meter'),
    boostFill: document.getElementById('boost-fill'),
    boostValue: document.getElementById('boost-value'),
    superchargeInventory: document.getElementById('supercharge-inventory'),
    superchargeCount: document.getElementById('supercharge-count'),
    superchargeTime: document.getElementById('supercharge-time'),
    startScreen: document.getElementById('start-screen'),
    startButton: document.getElementById('start-button'),
    startHighscore: document.getElementById('start-highscore'),
    pauseButton: document.getElementById('pause-button'),
    pauseScreen: document.getElementById('pause-screen'),
    resumeButton: document.getElementById('resume-button'),
    restartFromPause: document.getElementById('restart-from-pause'),
    gameOverScreen: document.getElementById('game-over-screen'),
    gameOverKicker: document.getElementById('gameover-kicker'),
    restartButton: document.getElementById('restart-button'),
    finalScore: document.getElementById('final-score'),
    finalDistance: document.getElementById('final-distance'),
    finalCoins: document.getElementById('final-coins'),
    finalBest: document.getElementById('final-best'),
    newHighscore: document.getElementById('new-highscore-banner'),
    turnPrompt: document.getElementById('turn-prompt'),
    turnArrow: document.getElementById('turn-arrow'),
    turnLabel: document.getElementById('turn-label'),
    threatWarning: document.getElementById('threat-warning'),
    threatLane: document.getElementById('threat-lane'),
    stageBanner: document.getElementById('stage-banner'),
    stageIssue: document.getElementById('stage-issue'),
    stageName: document.getElementById('stage-name'),
    stageDeck: document.getElementById('stage-deck'),
    helpButton: document.getElementById('help-button'),
    startHelpButton: document.getElementById('start-help-button'),
    controlsScreen: document.getElementById('controls-screen'),
    controlsClose: document.getElementById('controls-close'),
    closeButton: document.getElementById('close-game-btn'),
    toast: document.getElementById('toast'),
  };

  const state = {
    mode: GAME.START,
    distance: 0,
    coins: 0,
    score: 0,
    best: safeReadBest(),
    speed: CONFIG.baseSpeed,
    elapsed: 0,
    serial: 0,
    heading: 0,
    streak: 0,
    combo: 1,
    shield: 0,
    boostCharge: CONFIG.boostStartCharge,
    boosting: false,
    boostHeld: false,
    boostBonus: 0,
    superchargeInventory: 0,
    superchargeTimer: 0,
    magnetTimer: 0,
    starTimer: 0,
    slowmoTimer: 0,
    starBonus: 0,
    pickupScore: 0,
    powTimer: 0,
    stageIndex: 0,
    stageBannerTimer: 0,
    lastHazardSerial: -99,
    lastTurnSerial: 0,
    activeTurn: null,
    turnAnimation: null,
    threat: null,
    threatCooldown: 18,
    crashTimer: 0,
    crashVelocity: 0,
    crashReason: '',
    crashStartZ: 0,
    helpWasRunning: false,
    helpPreviousFocus: null,
    toastTimer: 0,
    lastFrame: 0,
  };

  const player = {
    lane: 1,
    x: 0,
    targetX: 0,
    y: 0,
    vy: 0,
    jumping: false,
    sliding: false,
    slideTimer: 0,
    rig: null,
    art: null,
    outline: null,
    cyan: null,
    coral: null,
    afterimages: [],
    poseTextures: {},
    inkTextures: {},
    skin: 'classic',
    currentPose: 'runA',
    shadow: null,
    cycle: 0,
  };

  let scene;
  let camera;
  let renderer;
  let world;
  let segments = [];
  let particles = [];
  let audioContext = null;
  let materials;
  let geometries;
  let sunLight;
  let backdrop;
  let tempWorld;
  let sharedLineMaterial;

  function init() {
    if (!window.THREE) {
      showFatalError('The 3D engine could not load. Check your connection and reload.');
      return;
    }

    tempWorld = new THREE.Vector3();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x3eb99b);
    scene.fog = new THREE.Fog(0x3eb99b, 42, 136);

    camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 180);
    camera.position.set(0, 5, 8.6);
    camera.lookAt(0, 0.9, -10.5);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    dom.container.appendChild(renderer.domElement);

    world = new THREE.Group();
    scene.add(world);

    createSharedAssets();
    applyBiome(0);
    createLights();
    createBackdrop();
    createPlayer();
    resetSegments(true);
    setupControls();
    setupLocalTestBridge();
    syncBestScore();
    renderMissions();
    applySkin(safeReadString('cappy_skin', 'classic'));
    syncMusicButton();

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('orientationchange', resize, { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && state.mode === GAME.RUNNING) pauseGame();
    });

    requestAnimationFrame(loop);
  }

  function createSharedAssets() {
    sharedLineMaterial = new THREE.LineBasicMaterial({ color: 0x14251f, transparent: true, opacity: 0.82 });
    sharedLineMaterial.userData.shared = true;
    materials = {
      path: toon(0xc98548),
      pathLight: toon(0xe0a55f),
      ink: new THREE.MeshBasicMaterial({ color: 0x14251f }),
      river: toon(0x4fafa5),
      leaf: toon(0x1f5941),
      leafLight: toon(0x77a94c),
      leafDark: toon(0x123c31),
      bark: toon(0x704934),
      stone: toon(0x6a806c),
      stoneLight: toon(0x9aaa80),
      sun: toon(0xf5bd31, 0xf5bd31),
      coral: toon(0xe96342, 0x7a2518),
      cream: toon(0xfff2ce),
      pit: new THREE.MeshBasicMaterial({ color: 0x14251f }),
      warning: new THREE.MeshBasicMaterial({ color: 0xe96342, transparent: true, opacity: 0.75, side: THREE.DoubleSide }),
      shadow: new THREE.MeshBasicMaterial({ color: 0x081a15, transparent: true, opacity: 0.38, depthWrite: false }),
      pool: new THREE.MeshBasicMaterial({ color: 0x9fdbe0, transparent: true, opacity: 0.85 }),
      steam: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, depthWrite: false }),
      crystalCyan: toon(0x53e0e8, 0x53e0e8),
      crystalMagenta: toon(0xc86ff0, 0xc86ff0),
      building: toon(0x2a3050),
      neonPink: new THREE.MeshBasicMaterial({ color: 0xff3fa4 }),
      neonCyan: new THREE.MeshBasicMaterial({ color: 0x35e6ff }),
    };
    materials.crystalCyan.emissiveIntensity = 0.55;
    materials.crystalMagenta.emissiveIntensity = 0.55;
    materials.window = new THREE.MeshBasicMaterial({ map: createWindowTexture() });
    materials.window.userData.shared = true;
    Object.values(materials).forEach(function (material) { material.userData.shared = true; });

    geometries = {
      floor: new THREE.BoxGeometry(7.1, 0.18, CONFIG.segmentLength - 0.12),
      laneDash: new THREE.BoxGeometry(0.08, 0.025, 2.1),
      trunk: new THREE.CylinderGeometry(0.14, 0.28, 2.5, 7),
      canopy: new THREE.SphereGeometry(1, 8, 6),
      rock: new THREE.DodecahedronGeometry(0.7, 0),
      coin: new THREE.TorusGeometry(0.25, 0.075, 6, 12),
      coinCore: new THREE.CircleGeometry(0.15, 12),
      shadow: new THREE.CircleGeometry(0.78, 24),
      particle: new THREE.TetrahedronGeometry(0.11, 0),
      warningRing: new THREE.RingGeometry(0.55, 0.78, 18),
      fallingRock: new THREE.IcosahedronGeometry(0.72, 1),
      ruinBody: new THREE.CylinderGeometry(0.5, 0.65, 2.2, 6),
      ruinCap: new THREE.CylinderGeometry(0.68, 0.68, 0.22, 6),
      stalagmite: new THREE.ConeGeometry(0.55, 2.6, 6),
      crystal: new THREE.OctahedronGeometry(0.6, 0),
      bamboo: new THREE.CylinderGeometry(0.09, 0.11, 3.4, 6),
      poolDisc: new THREE.CircleGeometry(1.15, 16),
      steamPuff: new THREE.SphereGeometry(0.4, 7, 5),
      building: new THREE.BoxGeometry(2.4, 1, 2.2),
      lampPole: new THREE.CylinderGeometry(0.07, 0.09, 3.1, 6),
    };
    Object.values(geometries).forEach(function (geometry) { geometry.userData.shared = true; });
  }

  function createWindowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    context.fillStyle = '#1a2038';
    context.fillRect(0, 0, 64, 128);
    const palette = ['#ffd76a', '#35e6ff', '#ff3fa4', '#1a2038', '#1a2038'];
    for (let y = 6; y < 122; y += 14) {
      for (let x = 6; x < 58; x += 14) {
        context.fillStyle = palette[Math.floor(seeded(x * 7 + y * 13) * palette.length)];
        context.fillRect(x, y, 8, 9);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    return texture;
  }

  function toon(color, emissive) {
    return new THREE.MeshToonMaterial({
      color: color,
      emissive: emissive || 0x000000,
      emissiveIntensity: emissive ? 0.12 : 0,
    });
  }

  function createLights() {
    scene.add(new THREE.HemisphereLight(0xcdf4ca, 0x163c2f, 0.92));
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    sunLight = new THREE.DirectionalLight(0xffe59a, 0.9);
    sunLight.position.set(-8, 18, 9);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.shadow.camera.left = -12;
    sunLight.shadow.camera.right = 12;
    sunLight.shadow.camera.top = 14;
    sunLight.shadow.camera.bottom = -5;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 45;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);
  }

  function createBackdrop() {
    backdrop = { rays: [], farMaterials: [] };
    const sunHalo = new THREE.Mesh(new THREE.RingGeometry(10.2, 11.2, 48), materials.ink);
    sunHalo.position.set(-18, 14, -75.2);
    scene.add(sunHalo);
    const sun = new THREE.Mesh(new THREE.CircleGeometry(10, 48), new THREE.MeshBasicMaterial({ color: 0xf5bd31 }));
    sun.position.set(-18, 14, -75);
    scene.add(sun);
    backdrop.sun = sun;

    const rays = new THREE.Group();
    for (let i = 0; i < 13; i += 1) {
      const ray = new THREE.Mesh(
        new THREE.PlaneGeometry(i % 2 ? 1.2 : 2.1, 34),
        new THREE.MeshBasicMaterial({ color: i % 2 ? 0xe96342 : 0xf5bd31, transparent: true, opacity: 0.28 })
      );
      ray.position.set(-18, 14, -76);
      ray.rotation.z = (i / 13) * Math.PI * 2;
      ray.translateY(22);
      rays.add(ray);
      backdrop.rays.push(ray);
    }
    scene.add(rays);

    const far = new THREE.Group();
    for (let i = 0; i < 18; i += 1) {
      const crown = new THREE.Mesh(new THREE.CircleGeometry(4 + seeded(i) * 4, 8), materials.leafDark);
      crown.position.set(-50 + i * 6.2, 3 + seeded(i + 2) * 5, -72 - seeded(i + 8) * 15);
      crown.scale.y = 1.3;
      far.add(crown);
    }
    scene.add(far);
    backdrop.far = far;

    const skyline = new THREE.Group();
    for (let i = 0; i < 16; i += 1) {
      const slabHeight = 10 + seeded(i + 60) * 22;
      const slab = new THREE.Mesh(new THREE.PlaneGeometry(5 + seeded(i + 66) * 6, slabHeight), materials.leafDark);
      slab.position.set(-52 + i * 7, slabHeight / 2 - 1, -70 - seeded(i + 71) * 14);
      skyline.add(slab);
      if (i % 3 === 0) {
        const beacon = new THREE.Mesh(new THREE.CircleGeometry(0.9, 8), i % 2 ? materials.neonPink : materials.neonCyan);
        beacon.position.set(slab.position.x, slabHeight - 0.6, slab.position.z + 0.5);
        skyline.add(beacon);
      }
    }
    skyline.visible = false;
    scene.add(skyline);
    backdrop.skyline = skyline;

    const caveTeeth = new THREE.Group();
    for (let i = 0; i < 14; i += 1) {
      const tooth = new THREE.Mesh(new THREE.PlaneGeometry(6 + seeded(i + 80) * 5, 16 + seeded(i + 84) * 12), materials.leafDark);
      tooth.position.set(-48 + i * 7.4, 20 - seeded(i + 88) * 6, -68 - seeded(i + 90) * 12);
      tooth.rotation.z = Math.PI + (seeded(i + 93) - 0.5) * 0.3;
      caveTeeth.add(tooth);
    }
    caveTeeth.visible = false;
    scene.add(caveTeeth);
    backdrop.caveTeeth = caveTeeth;

    const midMaterial = new THREE.MeshBasicMaterial({ color: 0x155c42, transparent: true, opacity: 0.72, depthWrite: false });
    backdrop.midMaterial = midMaterial;
    let mid = new THREE.Group();
    backdrop.mid = mid;
    for (let i = 0; i < 15; i += 1) {
      const crown = new THREE.Mesh(new THREE.CircleGeometry(2.8 + seeded(i + 40) * 3.2, 7), midMaterial);
      crown.position.set(-42 + i * 6, 2 + seeded(i + 30) * 5.5, -45 - seeded(i + 20) * 9);
      crown.scale.set(1.15, 1.55, 1);
      crown.rotation.z = (seeded(i + 11) - 0.5) * 0.3;
      mid.add(crown);
    }
    scene.add(mid);

    const dots = document.createElement('canvas');
    dots.width = 128;
    dots.height = 128;
    const dotContext = dots.getContext('2d');
    dotContext.clearRect(0, 0, 128, 128);
    dotContext.fillStyle = 'rgba(20,37,31,.55)';
    for (let y = 5; y < 128; y += 12) {
      for (let x = 5; x < 128; x += 12) {
        dotContext.beginPath();
        dotContext.arc(x + (y % 24 ? 5 : 0), y, 2.2, 0, Math.PI * 2);
        dotContext.fill();
      }
    }
    const dotTexture = new THREE.CanvasTexture(dots);
    dotTexture.wrapS = THREE.RepeatWrapping;
    dotTexture.wrapT = THREE.RepeatWrapping;
    dotTexture.repeat.set(8, 3);
    const dotSheet = new THREE.Mesh(
      new THREE.PlaneGeometry(112, 42),
      new THREE.MeshBasicMaterial({ map: dotTexture, transparent: true, opacity: 0.38, depthWrite: false })
    );
    dotSheet.position.set(0, 13, -92);
    scene.add(dotSheet);
    backdrop.dots = dotSheet;
  }

  function createPlayer() {
    const rig = new THREE.Group();
    rig.position.set(0, 0.04, 0);
    scene.add(rig);

    const shadow = new THREE.Mesh(geometries.shadow, materials.shadow);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.015;
    shadow.scale.set(1.25, 0.62, 1);
    rig.add(shadow);

    const plane = new THREE.PlaneGeometry(3.12, 3.12);
    const outlineMat = spriteMaterial(0x14251f, 1);
    const cyanMat = spriteMaterial(0x36d8d0, 0);
    const coralMat = spriteMaterial(0xf06b4f, 0);
    const artMat = spriteMaterial(0xffffff, 1);

    const outline = new THREE.Mesh(plane, outlineMat);
    outline.position.set(0, 1.24, -0.035);
    outline.scale.set(1.065, 1.065, 1);
    rig.add(outline);

    const cyan = new THREE.Mesh(plane, cyanMat);
    cyan.position.set(-0.025, 1.24, -0.02);
    rig.add(cyan);

    const coral = new THREE.Mesh(plane, coralMat);
    coral.position.set(0.025, 1.24, -0.01);
    rig.add(coral);

    const art = new THREE.Mesh(plane, artMat);
    art.position.set(0, 1.24, 0);
    rig.add(art);

    for (let i = 0; i < 3; i += 1) {
      const trailMaterial = spriteMaterial(i % 2 ? 0xf06b4f : 0x36d8d0, 0);
      trailMaterial.blending = THREE.AdditiveBlending;
      const trail = new THREE.Mesh(plane, trailMaterial);
      trail.position.set((i - 1) * 0.05, 1.24, -0.06 - i * 0.025);
      trail.scale.setScalar(1 + i * 0.035);
      rig.add(trail);
      player.afterimages.push(trail);
    }

    player.art = art;
    player.outline = outline;
    player.cyan = cyan;
    player.coral = coral;

    const poseFiles = {
      runA: 'assets/cappy-center-run-a.png',
      runB: 'assets/cappy-center-run-b.png',
      left: 'assets/cappy-run-left.png',
      right: 'assets/cappy-run-right.png',
      jump: 'assets/cappy-center-jump.png',
      slide: 'assets/cappy-center-slide.png',
      boost: 'assets/cappy-center-boost.png',
      crash: 'assets/cappy-center-crash.png',
    };
    const loader = new THREE.TextureLoader();
    Object.keys(poseFiles).forEach(function (name) {
      loader.load(
        poseFiles[name],
        function (texture) {
          texture.encoding = THREE.sRGBEncoding;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          player.poseTextures[name] = texture;
          if (name === player.currentPose || (name === 'runA' && !player.art.material.map)) setPlayerPose(name, true);
        },
        undefined,
        function () { showToast('A Cappy pose could not load'); }
      );
    });

    player.rig = rig;
    player.shadow = shadow;
  }

  function spriteMaterial(color, opacity) {
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: opacity,
      alphaTest: 0.06,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    material.userData.shared = true;
    return material;
  }

  function setPlayerPose(name, force) {
    if (!player.poseTextures[name] || (!force && player.currentPose === name)) return;
    player.currentPose = name;
    const texture = getSkinTexture(name);
    [player.art, player.outline, player.cyan, player.coral].concat(player.afterimages).forEach(function (mesh) {
      if (!mesh) return;
      mesh.material.map = texture;
      mesh.material.needsUpdate = true;
    });
  }

  function getSkinTexture(name) {
    if (player.skin === 'ink') {
      if (!player.inkTextures[name] && player.poseTextures[name]) {
        player.inkTextures[name] = makeInkTexture(player.poseTextures[name]);
      }
      return player.inkTextures[name] || player.poseTextures[name];
    }
    return player.poseTextures[name];
  }

  // Newsprint b&w with a screentone dot pattern, generated from the classic art.
  function makeInkTexture(sourceTexture) {
    try {
      const image = sourceTexture.image;
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const px = imageData.data;
      for (let i = 0; i < px.length; i += 4) {
        if (px[i + 3] < 8) continue;
        let value = px[i] * 0.3 + px[i + 1] * 0.59 + px[i + 2] * 0.11;
        value = Math.max(0, Math.min(255, (value - 128) * 1.65 + 152));
        const pixel = i / 4;
        const x = pixel % canvas.width;
        const y = (pixel - x) / canvas.width;
        if (value > 55 && value < 215 && x % 5 < 2 && y % 5 < 2) value *= 0.42;
        px[i] = px[i + 1] = px[i + 2] = value;
      }
      context.putImageData(imageData, 0, 0);
      const texture = new THREE.CanvasTexture(canvas);
      texture.encoding = THREE.sRGBEncoding;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      return texture;
    } catch (error) {
      // Canvas may be tainted when served from file:// — fall back to classic.
      return sourceTexture;
    }
  }

  function applySkin(name) {
    const skin = name === 'ink' ? 'ink' : 'classic';
    player.skin = skin;
    safeWriteString('cappy_skin', skin);
    dom.shell.classList.toggle('skin-ink', skin === 'ink');
    dom.skinOptions.forEach(function (button) {
      button.setAttribute('aria-checked', String(button.dataset.skin === skin));
      button.classList.toggle('selected', button.dataset.skin === skin);
    });
    if (player.art) setPlayerPose(player.currentPose, true);
  }

  function resetSegments(safeStart) {
    segments.forEach(function (segment) {
      disposeSegmentContent(segment);
      world.remove(segment.root);
    });
    segments = [];
    state.serial = 0;
    state.lastHazardSerial = -99;
    state.lastTurnSerial = 0;
    for (let i = 0; i < CONFIG.segmentCount; i += 1) {
      const segment = makeSegment();
      buildSegment(segment, state.serial, -i * CONFIG.segmentLength, safeStart && i < 3);
      state.serial += 1;
      world.add(segment.root);
      segments.push(segment);
    }
  }

  function rebuildAfterTurn() {
    segments.forEach(function (segment) {
      disposeSegmentContent(segment);
      world.remove(segment.root);
    });
    segments = [];
    for (let i = 0; i < CONFIG.segmentCount; i += 1) {
      const segment = makeSegment();
      buildSegment(segment, state.serial, -i * CONFIG.segmentLength, i < 3);
      state.serial += 1;
      world.add(segment.root);
      segments.push(segment);
    }
  }

  function makeSegment() {
    return { root: new THREE.Group(), obstacles: [], pickups: [], turn: null, qte: null };
  }

  function buildSegment(segment, serial, zPosition, safe) {
    disposeSegmentContent(segment);
    segment.obstacles = [];
    segment.pickups = [];
    segment.turn = null;
    segment.qte = null;
    segment.root.position.set(0, 0, zPosition);
    segment.root.rotation.set(0, 0, 0);
    segment.root.userData.serial = serial;

    const floor = inkedMesh(geometries.floor, serial % 2 ? materials.path : materials.pathLight);
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    segment.root.add(floor);

    for (let laneLine = -1; laneLine <= 1; laneLine += 2) {
      for (let z = -9; z <= 9; z += 4.2) {
        const dash = new THREE.Mesh(geometries.laneDash, materials.ink);
        dash.position.set(laneLine * CONFIG.laneWidth / 2, 0.012, z + (serial % 2) * 1.05);
        segment.root.add(dash);
      }
    }

    addPathMarks(segment.root, serial);
    addJungleSides(segment.root, serial);

    const stage = STAGES[state.stageIndex];
    const needsRecovery = serial - state.lastHazardSerial <= stage.safeGap;
    const powerSegment = !safe && serial >= 6 && serial % 8 === 4;
    const powerType = ['FRUIT', 'MAGNET', 'STAR', 'SLOWMO'][Math.floor(serial / 8) % 4];
    const superchargeSegment = !safe && serial >= 10 && serial % 14 === 9;
    const shouldTurn = !safe && !needsRecovery && serial >= 7 && serial - state.lastTurnSerial >= stage.turnGap;
    if (superchargeSegment) {
      const superchargeLane = Math.floor(seeded(serial * 53) * 3);
      addCoinTrail(segment, superchargeLane, -8, 7, 0.82);
      addPickup(segment, 'SUPERCHARGE', superchargeLane, 3.1, 1.08);
    } else if (powerSegment) {
      const powerLane = Math.floor(seeded(serial * 31) * 3);
      addCoinTrail(segment, powerLane, -8, 7, 0.82);
      addPickup(segment, powerType, powerLane, 3.1, 1.05);
    } else if (shouldTurn) {
      const eventRoll = seeded(serial * 71);
      if (eventRoll < 0.55) {
        const direction = seeded(serial * 17) > 0.5 ? 1 : -1;
        addTurnGate(segment, direction);
      } else {
        addQteGate(segment, eventRoll < 0.78 ? 'leap' : 'duck');
      }
      state.lastTurnSerial = serial;
      state.lastHazardSerial = serial;
    } else if (!safe && !needsRecovery) {
      if (addGameplayPattern(segment, serial)) state.lastHazardSerial = serial;
    } else {
      const flowLane = Math.floor(seeded(serial * 43 + state.stageIndex) * 3);
      addCoinTrail(segment, flowLane, -8, 7, 0.82);
    }
  }

  function disposeSegmentContent(segment) {
    if (!segment || !segment.root) return;
    disposeObjectResources(segment.root);
    while (segment.root.children.length) segment.root.remove(segment.root.children[0]);
  }

  function disposeObjectResources(root) {
    root.traverse(function (object) {
      if (object.geometry && !object.geometry.userData.shared) object.geometry.dispose();
      const objectMaterials = object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : [];
      objectMaterials.forEach(function (material) {
        if (material.userData && material.userData.shared) return;
        if (material.map) material.map.dispose();
        material.dispose();
      });
    });
  }

  function addPathMarks(root, serial) {
    for (let z = -9; z < 10; z += 4.4) {
      const mark = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.34, 6), materials.ink);
      mark.rotation.x = -Math.PI / 2;
      mark.rotation.z = serial * 0.3;
      mark.position.set(0, 0.017, z);
      mark.scale.y = 0.55;
      root.add(mark);
    }
  }

  function addJungleSides(root, serial) {
    const random = mulberry32(serial * 92821 + 17);
    const stage = STAGES[state.stageIndex];
    const theme = stage.theme;
    for (let z = -9; z <= 9; z += 4.6) {
      [-1, 1].forEach(function (side) {
        const x = side * (4.7 + random() * 2.2);
        if (theme === 'jungle') {
          if (random() < 0.72) root.add(createTree(x, z + random() * 1.4, random()));
          if (random() < 0.32) root.add(createLeafFan(side * (3.9 + random()), z + random() * 2, random()));
          if (random() < 0.14) root.add(createRuin(side * (5.2 + random()), z + 1, random()));
          if (random() < 0.44) root.add(createComicFlower(side * (3.8 + random() * 1.6), z + random() * 2.2, random()));
          if (random() < 0.14) root.add(createInkFrond(side * (6.4 + random()), z - 1, side));
        } else if (theme === 'springs') {
          if (random() < 0.5) root.add(createSpringPool(side * (5.1 + random() * 1.6), z + random() * 1.6, random()));
          if (random() < 0.6) root.add(createBambooCluster(side * (4.2 + random() * 2), z + random() * 2, random()));
          if (random() < 0.3) root.add(createTree(x, z + random() * 1.4, random()));
          if (random() < 0.24) root.add(createRuin(side * (5.4 + random()), z + 1, random()));
          if (random() < 0.3) root.add(createComicFlower(side * (3.8 + random() * 1.4), z + random() * 2, random()));
        } else if (theme === 'cave') {
          if (random() < 0.7) root.add(createStalagmite(side * (4.4 + random() * 2), z + random() * 1.6, random()));
          if (random() < 0.62) root.add(createCrystal(side * (3.9 + random() * 1.8), z + random() * 2, random()));
          if (random() < 0.22) root.add(createRuin(side * (5.4 + random()), z + 1, random()));
        } else {
          if (random() < 0.78) root.add(createBuilding(side * (5.6 + random() * 1.8), z + random() * 1.6, random()));
          if (random() < 0.4) root.add(createStreetLamp(side * (3.9 + random() * 0.4), z + random() * 2, side));
          if (random() < 0.34) root.add(createNeonSign(side * (4.6 + random() * 1.2), z + random() * 2, random(), side));
        }
      });
    }
  }

  function createSpringPool(x, z, variation) {
    const spot = new THREE.Group();
    spot.position.set(x, 0, z);
    const pool = new THREE.Mesh(geometries.poolDisc, materials.pool);
    pool.rotation.x = -Math.PI / 2;
    pool.position.y = 0.03;
    pool.scale.set(1 + variation * 0.4, 0.72, 1);
    spot.add(pool);
    for (let i = 0; i < 5; i += 1) {
      const angle = (i / 5) * Math.PI * 2 + variation * 3;
      const rock = inkedMesh(geometries.rock, i % 2 ? materials.stoneLight : materials.stone);
      rock.position.set(Math.cos(angle) * (1.15 + variation * 0.35), 0.16, Math.sin(angle) * 0.85);
      rock.scale.setScalar(0.4 + seeded(i + variation * 9) * 0.3);
      spot.add(rock);
    }
    for (let i = 0; i < 3; i += 1) {
      const puff = new THREE.Mesh(geometries.steamPuff, materials.steam);
      puff.position.set((seeded(i * 3 + variation) - 0.5) * 1.2, 0.6 + i * 0.55, (seeded(i * 7) - 0.5) * 0.8);
      puff.scale.setScalar(0.65 + i * 0.3);
      spot.add(puff);
    }
    return spot;
  }

  function createBambooCluster(x, z, variation) {
    const cluster = new THREE.Group();
    cluster.position.set(x, 0, z);
    for (let i = 0; i < 3; i += 1) {
      const stalk = inkedMesh(geometries.bamboo, i % 2 ? materials.leafLight : materials.leaf);
      stalk.position.set((i - 1) * 0.34, 1.7, (i % 2) * 0.26);
      stalk.rotation.z = (variation - 0.5) * 0.12 + (i - 1) * 0.05;
      cluster.add(stalk);
      const tip = inkedMesh(new THREE.SphereGeometry(0.28, 6, 5), materials.leafLight);
      tip.scale.set(1.5, 0.5, 0.6);
      tip.position.set((i - 1) * 0.34, 3.35, (i % 2) * 0.26);
      cluster.add(tip);
    }
    return cluster;
  }

  function createStalagmite(x, z, variation) {
    const spike = inkedMesh(geometries.stalagmite, variation > 0.5 ? materials.stone : materials.stoneLight);
    spike.position.set(x, 1.1, z);
    spike.scale.set(0.8 + variation * 0.6, 0.8 + variation * 0.9, 0.8 + variation * 0.6);
    spike.rotation.y = variation * Math.PI;
    return spike;
  }

  function createCrystal(x, z, variation) {
    const cluster = new THREE.Group();
    cluster.position.set(x, 0, z);
    for (let i = 0; i < 3; i += 1) {
      const shard = inkedMesh(geometries.crystal, (i + Math.floor(variation * 2)) % 2 ? materials.crystalCyan : materials.crystalMagenta);
      shard.position.set((i - 1) * 0.42, 0.55 + (i % 2) * 0.3, (i % 2) * 0.24);
      shard.scale.set(0.5, 0.9 + variation * 0.8 + (i % 2) * 0.35, 0.5);
      shard.rotation.z = (i - 1) * 0.28 + (variation - 0.5) * 0.2;
      cluster.add(shard);
    }
    return cluster;
  }

  function createBuilding(x, z, variation) {
    const tower = new THREE.Group();
    const height = 4.5 + variation * 5.5;
    tower.position.set(x + (Math.abs(x) / x) * 1.4, 0, z);
    const body = inkedMesh(geometries.building, materials.building);
    body.scale.y = height;
    body.position.y = height / 2;
    tower.add(body);
    const windows = new THREE.Mesh(new THREE.PlaneGeometry(2, height * 0.86), materials.window);
    windows.position.set(x > 0 ? -1.22 : 1.22, height / 2, 0);
    windows.rotation.y = x > 0 ? -Math.PI / 2 : Math.PI / 2;
    tower.add(windows);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.16, 2.3), variation > 0.5 ? materials.neonPink : materials.neonCyan);
    trim.position.y = height + 0.06;
    tower.add(trim);
    return tower;
  }

  function createStreetLamp(x, z, side) {
    const lamp = new THREE.Group();
    lamp.position.set(x, 0, z);
    const pole = inkedMesh(geometries.lampPole, materials.ink);
    pole.position.y = 1.55;
    lamp.add(pole);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), side > 0 ? materials.neonCyan : materials.neonPink);
    glow.position.y = 3.15;
    lamp.add(glow);
    return lamp;
  }

  function createNeonSign(x, z, variation, side) {
    const sign = new THREE.Group();
    sign.position.set(x, 2 + variation * 1.6, z);
    const frame = inkedMesh(new THREE.BoxGeometry(1.5, 0.9, 0.12), materials.ink);
    sign.add(frame);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.26, 0.66), variation > 0.5 ? materials.neonPink : materials.neonCyan);
    face.position.z = side > 0 ? -0.08 : 0.08;
    face.rotation.y = side > 0 ? Math.PI : 0;
    sign.add(face);
    sign.rotation.y = side * 0.5;
    sign.rotation.z = (variation - 0.5) * 0.14;
    return sign;
  }

  function createTree(x, z, variation) {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);
    tree.rotation.z = (variation - 0.5) * 0.16;
    const trunk = inkedMesh(geometries.trunk, materials.bark);
    trunk.position.y = 1.25;
    trunk.castShadow = true;
    tree.add(trunk);

    const crownCount = 3;
    for (let i = 0; i < crownCount; i += 1) {
      const crown = inkedMesh(geometries.canopy, i === 1 ? materials.leafLight : materials.leaf);
      const angle = (i / crownCount) * Math.PI * 2 + variation * 2;
      crown.position.set(Math.cos(angle) * 0.65, 3 + Math.sin(angle) * 0.25, Math.sin(angle) * 0.5);
      crown.scale.set(1.25, 0.82, 0.82);
      crown.castShadow = true;
      tree.add(crown);
    }
    return tree;
  }

  function createLeafFan(x, z, variation) {
    const fan = new THREE.Group();
    fan.position.set(x, 0, z);
    for (let i = 0; i < 5; i += 1) {
      const leaf = inkedMesh(new THREE.SphereGeometry(0.42, 7, 5), i % 2 ? materials.leafLight : materials.leaf);
      leaf.scale.set(0.44, 1.7, 0.25);
      leaf.position.y = 0.55;
      leaf.rotation.z = -0.95 + i * 0.48 + variation * 0.1;
      fan.add(leaf);
    }
    return fan;
  }

  function createRuin(x, z, variation) {
    const ruin = new THREE.Group();
    ruin.position.set(x, 0, z);
    const body = inkedMesh(geometries.ruinBody, materials.stone);
    body.position.y = 1.1;
    body.scale.y = 0.82 + variation * 0.34;
    body.rotation.y = variation;
    ruin.add(body);
    const cap = inkedMesh(geometries.ruinCap, materials.stoneLight);
    cap.position.y = 1.88 + variation * 0.7;
    ruin.add(cap);
    return ruin;
  }

  function createComicFlower(x, z, variation) {
    const flower = new THREE.Group();
    flower.position.set(x, 0.42, z);
    flower.rotation.y = variation * Math.PI;
    for (let i = 0; i < 6; i += 1) {
      const petal = inkedMesh(geometries.canopy, i % 2 ? materials.coral : materials.cream);
      const angle = (i / 6) * Math.PI * 2;
      petal.position.set(Math.cos(angle) * 0.42, Math.sin(angle) * 0.42, 0);
      petal.scale.set(0.28, 0.5, 0.12);
      petal.rotation.z = angle - Math.PI / 2;
      flower.add(petal);
    }
    const center = inkedMesh(new THREE.SphereGeometry(0.22, 8, 6), materials.sun);
    flower.add(center);
    flower.scale.setScalar(0.72 + variation * 0.55);
    return flower;
  }

  function createInkFrond(x, z, side) {
    const frond = new THREE.Group();
    frond.position.set(x, 2.2, z);
    const panel = inkedMesh(new THREE.CircleGeometry(2.3, 7), side > 0 ? materials.river : materials.leafDark);
    panel.scale.set(0.62, 1.5, 1);
    panel.rotation.y = side * 0.28;
    panel.rotation.z = side * -0.22;
    frond.add(panel);
    return frond;
  }

  function addGameplayPattern(segment, serial) {
    const random = mulberry32(serial * 19937 + 91);
    const stage = STAGES[state.stageIndex];
    const pattern = Math.floor(random() * (6 + Math.min(2, stage.difficulty - 1)));
    const actionType = random() > 0.5 ? 'LOG' : 'VINE';

    if (pattern === 0) {
      const blocked = Math.floor(random() * 3);
      addObstacle(segment, 'TOTEM', blocked, -2);
      addCoinTrail(segment, blocked === 1 ? 0 : 1, -8, 6, 0.82);
    } else if (pattern === 1) {
      const safeLane = Math.floor(random() * 3);
      [0, 1, 2].filter(function (lane) { return lane !== safeLane; }).forEach(function (lane) {
        addObstacle(segment, 'TOTEM', lane, 0);
      });
      addCoinTrail(segment, safeLane, -8, 7, 0.82);
    } else if (pattern === 2) {
      const lane = Math.floor(random() * 3);
      addObstacle(segment, actionType, lane, 0);
      addCoinTrail(segment, lane, -8, 7, actionType === 'LOG' ? 1.55 : 0.48);
    } else if (pattern === 3) {
      const lane = Math.floor(random() * 3);
      addObstacle(segment, 'PIT', lane, 1);
      addCoinTrail(segment, lane, -7, 7, 1.55);
    } else if (pattern === 4) {
      const first = Math.floor(random() * 3);
      const second = first === 0 ? 2 : 0;
      addObstacle(segment, 'LOG', first, -5);
      addObstacle(segment, 'TOTEM', second, 5);
      addCoinTrail(segment, 1, -9, 8, 0.82);
    } else if (pattern === 5) {
      const weave = serial % 2 ? [0, 1, 2] : [2, 1, 0];
      weave.forEach(function (lane, index) {
        addPickup(segment, 'COIN', lane, -7 + index * 6.5, 0.82);
        addPickup(segment, 'COIN', lane, -5 + index * 6.5, 0.82);
      });
      return false;
    } else if (pattern === 6) {
      const blocked = Math.floor(random() * 3);
      addObstacle(segment, 'ROCK', blocked, 0);
      addCoinTrail(segment, blocked === 1 ? 2 : 1, -8, 7, 0.82);
    } else {
      const gateLane = Math.floor(random() * 3);
      addObstacle(segment, 'GATE', gateLane, 0);
      addCoinTrail(segment, gateLane, -8, 7, 0.45);
    }

    if (serial > 10 && serial % 11 === 5) {
      addPickup(segment, 'SHIELD', Math.floor(random() * 3), 7, 1.05);
    }
    return true;
  }

  function addObstacle(segment, type, lane, z) {
    const obstacle = createObstacle(type);
    obstacle.position.set(laneX(lane), 0, z);
    obstacle.userData.type = type;
    segment.root.add(obstacle);
    segment.obstacles.push({ type: type, lane: lane, mesh: obstacle, hit: false });
  }

  function createObstacle(type) {
    const group = new THREE.Group();
    if (type === 'LOG') {
      const log = inkedMesh(new THREE.CylinderGeometry(0.36, 0.46, 1.75, 9), materials.bark);
      log.rotation.z = Math.PI / 2;
      log.position.y = 0.38;
      log.castShadow = true;
      group.add(log);
      for (let i = -1; i <= 1; i += 1) {
        const moss = new THREE.Mesh(new THREE.SphereGeometry(0.18, 7, 5), materials.leafLight);
        moss.position.set(i * 0.48, 0.62, 0);
        moss.scale.set(1.2, 0.45, 0.8);
        group.add(moss);
      }
    } else if (type === 'VINE') {
      [-0.92, 0.92].forEach(function (x) {
        const post = inkedMesh(new THREE.CylinderGeometry(0.13, 0.2, 2.6, 7), materials.bark);
        post.position.set(x, 1.3, 0);
        group.add(post);
      });
      const vine = inkedMesh(new THREE.TorusGeometry(0.92, 0.11, 6, 18, Math.PI), materials.leafLight);
      vine.position.set(0, 1.45, 0);
      vine.rotation.z = Math.PI;
      group.add(vine);
      const bar = inkedMesh(new THREE.CylinderGeometry(0.12, 0.12, 1.9, 7), materials.leaf);
      bar.rotation.z = Math.PI / 2;
      bar.position.y = 1.28;
      group.add(bar);
    } else if (type === 'PIT') {
      const pit = new THREE.Mesh(new THREE.CircleGeometry(1.02, 14), materials.pit);
      pit.rotation.x = -Math.PI / 2;
      pit.scale.set(1.08, 1.55, 1);
      pit.position.y = 0.018;
      group.add(pit);
      const rim = new THREE.Mesh(new THREE.RingGeometry(0.98, 1.14, 14), materials.coral);
      rim.rotation.x = -Math.PI / 2;
      rim.scale.set(1.08, 1.55, 1);
      rim.position.y = 0.022;
      group.add(rim);
      [
        [-0.94, -0.82], [-0.78, 0.9], [-0.35, -1.42], [0.42, 1.38], [0.82, -0.96], [0.98, 0.58],
      ].forEach(function (point, index) {
        const fragment = inkedMesh(new THREE.DodecahedronGeometry(0.14 + (index % 2) * 0.04, 0), index % 2 ? materials.stoneLight : materials.cream);
        fragment.position.set(point[0], 0.09, point[1]);
        fragment.scale.set(1.25, 0.45, 0.8);
        fragment.rotation.y = index * 0.72;
        group.add(fragment);
      });
      for (let row = 0; row < 2; row += 1) {
        [-1, 1].forEach(function (side) {
          const chevron = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.035, 0.14), row ? materials.coral : materials.sun);
          chevron.position.set(side * 0.2, 0.035, 1.72 + row * 0.48);
          chevron.rotation.y = side * -0.52;
          group.add(chevron);
        });
      }
    } else if (type === 'ROCK') {
      const rockCount = 4;
      for (let i = 0; i < rockCount; i += 1) {
        const rock = inkedMesh(new THREE.DodecahedronGeometry(0.46 + i * 0.07, 0), i % 2 ? materials.stoneLight : materials.stone);
        rock.position.set((i - 1.5) * 0.36, 0.34 + (i % 2) * 0.18, (i % 2) * 0.2);
        rock.rotation.set(i * 0.8, i * 0.45, i * 0.35);
        group.add(rock);
      }
      const warningStripe = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.08, 0.12), materials.sun);
      warningStripe.position.set(0, 0.12, 0.62);
      warningStripe.rotation.z = -0.08;
      group.add(warningStripe);
    } else if (type === 'GATE') {
      [-0.9, 0.9].forEach(function (x) {
        const pillar = inkedMesh(new THREE.BoxGeometry(0.3, 2.45, 0.34), materials.stone);
        pillar.position.set(x, 1.22, 0);
        group.add(pillar);
      });
      const lintel = inkedMesh(new THREE.BoxGeometry(2.12, 0.42, 0.42), materials.stoneLight);
      lintel.position.set(0, 1.48, 0);
      group.add(lintel);
      for (let i = -2; i <= 2; i += 1) {
        const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.08, 0.56, 5), i % 2 ? materials.coral : materials.sun);
        tassel.position.set(i * 0.32, 1.04, 0.04);
        group.add(tassel);
      }
    } else {
      const body = inkedMesh(new THREE.CylinderGeometry(0.6, 0.76, 2.25, 6), materials.stone);
      body.position.y = 1.12;
      body.rotation.y = Math.PI / 6;
      body.castShadow = true;
      group.add(body);
      const face = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.2, 0.08), materials.coral);
      face.position.set(0, 1.4, 0.61);
      group.add(face);
      const eyeA = new THREE.Mesh(new THREE.CircleGeometry(0.07, 8), materials.cream);
      eyeA.position.set(-0.18, 1.42, 0.66);
      group.add(eyeA);
      const eyeB = eyeA.clone();
      eyeB.position.x = 0.18;
      group.add(eyeB);
    }
    return group;
  }

  function addCoinTrail(segment, lane, startZ, endZ, y) {
    const step = 2.6;
    for (let z = startZ; z <= endZ; z += step) addPickup(segment, 'COIN', lane, z, y);
  }

  function addPickup(segment, type, lane, z, y) {
    const group = new THREE.Group();
    if (type === 'COIN') {
      const ring = inkedMesh(geometries.coin, materials.sun);
      ring.rotation.y = Math.PI / 2;
      group.add(ring);
      const core = new THREE.Mesh(geometries.coinCore, materials.sun);
      core.rotation.y = Math.PI;
      group.add(core);
    } else if (type === 'SHIELD') {
      const glow = new THREE.Mesh(new THREE.OctahedronGeometry(0.48, 0), materials.river);
      glow.scale.set(0.8, 1.25, 0.35);
      glow.rotation.z = -0.45;
      group.add(glow);
      const vein = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.65, 0.08), materials.cream);
      vein.rotation.z = -0.45;
      group.add(vein);
    } else if (type === 'FRUIT') {
      const fruit = inkedMesh(new THREE.SphereGeometry(0.42, 9, 7), materials.coral);
      fruit.scale.set(1, 1.08, 0.86);
      fruit.rotation.z = -0.12;
      group.add(fruit);
      const highlight = new THREE.Mesh(new THREE.SphereGeometry(0.1, 7, 5), materials.cream);
      highlight.position.set(-0.16, 0.15, 0.34);
      group.add(highlight);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.055, 0.3, 6), materials.bark);
      stem.position.set(0.05, 0.46, 0);
      stem.rotation.z = -0.2;
      group.add(stem);
      const leaf = inkedMesh(new THREE.SphereGeometry(0.16, 7, 5), materials.leafLight);
      leaf.scale.set(1.35, 0.45, 0.55);
      leaf.position.set(0.2, 0.52, 0);
      leaf.rotation.z = 0.42;
      group.add(leaf);
    } else if (type === 'MAGNET') {
      const horseshoe = inkedMesh(new THREE.TorusGeometry(0.34, 0.13, 6, 14, Math.PI), materials.coral);
      horseshoe.rotation.z = Math.PI;
      group.add(horseshoe);
      [-0.34, 0.34].forEach(function (x) {
        const tip = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.2, 0.26), materials.cream);
        tip.position.set(x, 0.28, 0);
        group.add(tip);
      });
    } else if (type === 'STAR') {
      const shape = new THREE.Shape();
      for (let i = 0; i < 10; i += 1) {
        const radius = i % 2 ? 0.22 : 0.5;
        const angle = (i / 10) * Math.PI * 2 + Math.PI / 2;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (i === 0) shape.moveTo(px, py);
        else shape.lineTo(px, py);
      }
      const star = inkedMesh(new THREE.ExtrudeGeometry(shape, { depth: 0.14, bevelEnabled: false }), materials.sun);
      star.rotation.y = Math.PI;
      group.add(star);
    } else if (type === 'SLOWMO') {
      const lens = inkedMesh(new THREE.TorusGeometry(0.42, 0.09, 6, 16), materials.river);
      group.add(lens);
      const glass = new THREE.Mesh(new THREE.CircleGeometry(0.34, 14), materials.pool);
      group.add(glass);
      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.05), materials.ink);
      hand.position.set(0, 0.12, 0.03);
      group.add(hand);
      const handShort = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.05), materials.ink);
      handShort.position.set(0.08, 0, 0.03);
      group.add(handShort);
    } else if (type === 'SUPERCHARGE') {
      const core = inkedMesh(new THREE.OctahedronGeometry(0.36, 0), materials.sun);
      core.scale.set(0.78, 1.3, 0.78);
      core.rotation.z = Math.PI / 4;
      group.add(core);
      const outer = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.075, 6, 18), materials.river);
      outer.rotation.y = Math.PI / 2;
      outer.rotation.z = Math.PI / 5;
      group.add(outer);
      const crossRing = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.055, 6, 16), materials.coral);
      crossRing.rotation.x = Math.PI / 2;
      crossRing.rotation.z = -Math.PI / 5;
      group.add(crossRing);
    }
    group.position.set(laneX(lane), y, z);
    group.userData.phase = z;
    segment.root.add(group);
    segment.pickups.push({ type: type, lane: lane, mesh: group, collected: false });
  }

  function addTurnGate(segment, direction) {
    const gate = new THREE.Group();
    gate.position.z = -1;
    segment.root.add(gate);

    const branch = inkedMesh(new THREE.BoxGeometry(19, 0.16, 7.05), materials.pathLight);
    branch.position.set(direction * 9.4, -0.09, 0);
    gate.add(branch);
    for (let i = 0; i < 4; i += 1) {
      const tree = createTree(direction * (6 + i * 3.4), -4.4, seeded(i * 5 + 2));
      gate.add(tree);
      const treeNear = createTree(direction * (7.5 + i * 3.4), 4.3, seeded(i * 9 + 4));
      gate.add(treeNear);
    }

    addSignBoard(gate, direction < 0 ? '←' : '→');

    const deadEnd = new THREE.Group();
    gate.add(deadEnd);
    const blockedAhead = inkedMesh(new THREE.BoxGeometry(7.2, 1.35, 1.1), materials.stone);
    blockedAhead.position.set(0, 0.64, -8.2);
    deadEnd.add(blockedAhead);
    for (let i = -2; i <= 2; i += 1) {
      const vine = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.08, 5, 12, Math.PI), materials.leafLight);
      vine.position.set(i * 1.25, 1.2, -7.6);
      vine.rotation.z = Math.PI;
      deadEnd.add(vine);
    }

    segment.turn = { direction: direction, root: segment.root, deadEnd: deadEnd, resolved: false, prompted: false };
    addCoinTrail(segment, 1, -9, -4, 0.82);
  }

  function addSignBoard(gate, glyph) {
    const board = inkedMesh(new THREE.BoxGeometry(4.5, 2.2, 0.28), materials.sun);
    board.position.set(0, 2.45, -4.5);
    gate.add(board);
    const arrow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.5, 1.45),
      new THREE.MeshBasicMaterial({ map: createGlyphTexture(glyph), transparent: true, side: THREE.DoubleSide })
    );
    arrow.position.set(0, 2.45, -4.34);
    gate.add(arrow);
    [-1, 1].forEach(function (side) {
      const post = inkedMesh(new THREE.CylinderGeometry(0.22, 0.3, 3.4, 7), materials.bark);
      post.position.set(side * 2.45, 1.7, -4.5);
      gate.add(post);
    });
  }

  function addQteGate(segment, kind) {
    const gate = new THREE.Group();
    gate.position.z = -1;
    segment.root.add(gate);
    addSignBoard(gate, kind === 'leap' ? '↑' : '↓');

    if (kind === 'leap') {
      const chasm = new THREE.Mesh(new THREE.BoxGeometry(7.1, 0.24, 2.5), materials.pit);
      chasm.position.y = 0.02;
      gate.add(chasm);
      [-1.35, 1.35].forEach(function (z) {
        const rim = new THREE.Mesh(new THREE.BoxGeometry(7.1, 0.05, 0.22), materials.coral);
        rim.position.set(0, 0.045, z);
        gate.add(rim);
      });
      for (let i = -2; i <= 2; i += 1) {
        const chevron = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.035, 0.14), i % 2 ? materials.coral : materials.sun);
        chevron.position.set(i * 1.3, 0.05, 2.05);
        chevron.rotation.y = i > 0 ? -0.5 : (i < 0 ? 0.5 : 0);
        gate.add(chevron);
      }
    } else {
      const trunk = inkedMesh(new THREE.CylinderGeometry(0.34, 0.4, 7.4, 8), materials.bark);
      trunk.rotation.z = Math.PI / 2;
      trunk.position.y = 1.34;
      gate.add(trunk);
      for (let i = -2; i <= 2; i += 1) {
        const drape = inkedMesh(new THREE.SphereGeometry(0.3, 6, 5), i % 2 ? materials.leafLight : materials.leaf);
        drape.scale.set(0.7, 1.6, 0.5);
        drape.position.set(i * 1.35, 0.92, 0.12);
        gate.add(drape);
      }
    }

    segment.qte = { kind: kind, root: segment.root, resolved: false, prompted: false, failed: false };
  }

  function createGlyphTexture(glyph) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 192;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#14251f';
    context.font = '900 150px sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(glyph, 256, 95);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  function inkedMesh(geometry, material) {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry, 28),
      sharedLineMaterial
    );
    group.add(edges);
    return group;
  }

  function loop(timestamp) {
    requestAnimationFrame(loop);
    const rawDelta = state.lastFrame ? Math.max(0, (timestamp - state.lastFrame) / 1000) : 0;
    const dt = Math.min(rawDelta, 0.05);
    state.lastFrame = timestamp;

    if (state.mode === GAME.RUNNING) updateRunning(dt, timestamp);
    else if (state.mode === GAME.CRASHED) updateCrash(dt);
    else updateIdle(timestamp);

    updateParticles(dt);
    updateToast(dt);
    renderer.render(scene, camera);
  }

  function updateRunning(dt, timestamp) {
    state.elapsed += dt;
    const sdt = state.slowmoTimer > 0 ? dt * CONFIG.slowmoScale : dt;
    updateStageProgress();
    updateBoost(dt);
    state.distance += state.speed * sdt;
    if (state.boosting) state.boostBonus += state.speed * sdt;
    if (state.starTimer > 0) state.starBonus += state.speed * sdt;
    const stage = STAGES[state.stageIndex];
    const cruiseSpeed = Math.min(CONFIG.maxSpeed + stage.speedBonus, CONFIG.baseSpeed + stage.speedBonus + state.distance * 0.01);
    state.speed = cruiseSpeed * (state.boosting ? CONFIG.boostSpeedMultiplier : 1);
    dom.shell.classList.toggle('high-speed', state.speed > 22);

    if (!state.turnAnimation) moveSegments(state.speed * sdt);
    updatePlayer(sdt, timestamp);
    updatePickups(timestamp);
    checkObstacles();
    updateTurnGates(dt);
    updateThreat(sdt);
    updateShield(dt);
    updateSupercharge(dt);
    updatePowerTimers(dt);
    updateTurnAnimation(sdt);
    updateStageBanner(dt);
    updateHud();
    updateCamera(dt);
  }

  function updatePowerTimers(dt) {
    if (state.magnetTimer > 0) {
      state.magnetTimer = Math.max(0, state.magnetTimer - dt);
      if (state.magnetTimer === 0) showToast('MAGNET OFF');
    }
    if (state.starTimer > 0) {
      state.starTimer = Math.max(0, state.starTimer - dt);
      if (state.starTimer === 0) showToast('DOUBLE SCORE ENDED');
    }
    if (state.slowmoTimer > 0) {
      state.slowmoTimer = Math.max(0, state.slowmoTimer - dt);
      if (state.slowmoTimer === 0) showToast('TIME CATCHES UP');
    }
    dom.shell.classList.toggle('slowmo', state.slowmoTimer > 0);
  }

  function updateBoost(dt) {
    const canBoost = state.mode === GAME.RUNNING && state.boostHeld && state.boostCharge > 0;
    state.boosting = canBoost;
    if (state.boosting) {
      state.boostCharge = Math.max(0, state.boostCharge - CONFIG.boostDrainPerSecond * dt);
      if (state.boostCharge === 0) {
        state.boosting = false;
        state.boostHeld = false;
        playSound('boostEnd');
        showToast('BOOST SPENT');
      }
    }
    dom.shell.classList.toggle('boosting', state.boosting);
  }

  function startBoost() {
    if (state.mode !== GAME.RUNNING || state.boostCharge <= 0) return;
    if (!state.boostHeld) playSound('boost');
    state.boostHeld = true;
  }

  function stopBoost() {
    state.boostHeld = false;
    state.boosting = false;
    dom.shell.classList.remove('boosting');
  }

  function moveSegments(distance) {
    segments.forEach(function (segment) { segment.root.position.z += distance; });
    const first = segments[0];
    if (first && first.root.position.z > CONFIG.removeZ) {
      segments.shift();
      const lastZ = segments[segments.length - 1].root.position.z;
      buildSegment(first, state.serial, lastZ - CONFIG.segmentLength, false);
      state.serial += 1;
      segments.push(first);
    }
  }

  function updatePlayer(dt, timestamp) {
    player.targetX = laneX(player.lane);
    const lateralDelta = player.targetX - player.x;
    const ease = 1 - Math.exp(-17 * dt);
    player.x += lateralDelta * ease;
    player.rig.position.x = player.x;

    if (player.jumping) {
      player.vy -= CONFIG.gravity * dt;
      player.y += player.vy * dt;
      if (player.y <= 0) {
        player.y = 0;
        player.vy = 0;
        player.jumping = false;
        playSound('land');
      }
    }

    if (player.sliding) {
      player.slideTimer -= dt;
      if (player.slideTimer <= 0) player.sliding = false;
    }

    player.cycle += dt * state.speed * 0.78;
    const bob = player.jumping || player.sliding ? 0 : Math.abs(Math.sin(player.cycle)) * (state.boosting ? 0.045 : 0.085);
    player.rig.position.y = player.y + bob;
    player.rig.rotation.z = lateralDelta * -0.075 + Math.sin(player.cycle * 0.5) * 0.012;

    if (player.art && player.outline) {
      let pose = Math.floor(player.cycle / Math.PI) % 2 === 0 ? 'runA' : 'runB';
      if (Math.abs(lateralDelta) > 0.08) pose = lateralDelta < 0 ? 'left' : 'right';
      if (state.boosting) pose = 'boost';
      if (player.jumping) pose = 'jump';
      if (player.sliding) pose = 'slide';
      if (state.turnAnimation) pose = state.turnAnimation.direction < 0 ? 'left' : 'right';
      setPlayerPose(pose);

      const runSquash = 1 + Math.sin(player.cycle * 2) * 0.014;
      const jumpStretch = player.jumping ? 1 + Math.min(Math.abs(player.vy) * 0.012, 0.08) : runSquash;
      const facing = state.turnAnimation && state.turnAnimation.direction < 0 ? -1 : 1;
      const supercharged = state.superchargeTimer > 0;
      const poseScale = player.sliding ? 1.06 : ((state.boosting || supercharged) ? 1.04 : 1);
      const poseY = player.sliding ? 1.02 : 1.24;
      const artMeshes = [player.art, player.cyan, player.coral].concat(player.afterimages);
      artMeshes.forEach(function (mesh) {
        mesh.scale.set(facing * poseScale / jumpStretch, poseScale * jumpStretch, 1);
        mesh.position.y = poseY;
      });
      player.outline.scale.set(facing * 1.065 * poseScale / jumpStretch, 1.065 * poseScale * jumpStretch, 1);
      player.outline.position.y = poseY;
      player.art.rotation.z = player.sliding ? -0.04 : 0;
      player.outline.rotation.z = player.art.rotation.z;

      const registration = (state.boosting || supercharged) ? 0.095 : Math.min(0.045, Math.abs(lateralDelta) * 0.03);
      player.cyan.material.opacity = registration > 0.005 ? ((state.boosting || supercharged) ? 0.38 : 0.24) : 0;
      player.coral.material.opacity = player.cyan.material.opacity;
      player.cyan.position.x = -registration;
      player.coral.position.x = registration;
      player.afterimages.forEach(function (trail, index) {
        trail.material.opacity = (state.boosting || supercharged) ? 0.18 - index * 0.035 : 0;
        trail.position.x = -lateralDelta * (0.06 + index * 0.035) + Math.sin(timestamp * 0.018 + index) * 0.025;
        trail.position.y = poseY + index * 0.012;
      });
    }

    player.shadow.scale.set(1.25 - player.y * 0.12, 0.62 - player.y * 0.05, 1);
    player.shadow.material.opacity = Math.max(0.12, 0.38 - player.y * 0.08);
  }

  function updatePickups(timestamp) {
    segments.forEach(function (segment) {
      segment.pickups.forEach(function (pickup) {
        if (pickup.collected) return;
        pickup.mesh.rotation.y += 0.055;
        pickup.mesh.position.y += Math.sin(timestamp * 0.004 + pickup.mesh.userData.phase) * 0.0018;
        pickup.mesh.getWorldPosition(tempWorld);
        if (state.magnetTimer > 0 && pickup.type === 'COIN' && !state.turnAnimation) {
          const pullDx = player.x - tempWorld.x;
          const pullDy = player.y + 0.8 - tempWorld.y;
          const pullDz = -tempWorld.z;
          const pullDistance = Math.sqrt(pullDx * pullDx + pullDy * pullDy + pullDz * pullDz);
          if (pullDistance < CONFIG.magnetRadius && tempWorld.z < 0.5) {
            const strength = 0.22;
            tempWorld.x += pullDx * strength;
            tempWorld.y += pullDy * strength;
            pickup.mesh.parent.worldToLocal(tempWorld);
            pickup.mesh.position.x = tempWorld.x;
            pickup.mesh.position.y = tempWorld.y;
            pickup.mesh.getWorldPosition(tempWorld);
          }
        }
        const previousZ = pickup.lastWorldZ;
        pickup.lastWorldZ = tempWorld.z;
        const crossedPlayer = Math.abs(tempWorld.z) < 0.9 || (previousZ !== undefined && previousZ < -0.9 && tempWorld.z > 0.9);
        const verticalReach = tempWorld.y > 1.25 ? 0.52 : 0.82;
        if (crossedPlayer && Math.abs(tempWorld.x - player.x) < 0.78 && Math.abs(tempWorld.y - (player.y + 0.8)) < verticalReach) {
          collectPickup(pickup, tempWorld.clone());
        }
      });
    });
  }

  function collectPickup(pickup, position) {
    pickup.collected = true;
    pickup.mesh.visible = false;
    const starMultiplier = state.starTimer > 0 ? 2 : 1;
    if (pickup.type === 'COIN') bumpStat('coins', 1);
    else bumpStat('powerups', 1);
    if (pickup.type === 'COIN') {
      state.coins += 1;
      state.pickupScore += 12 * (state.boosting ? 2 : 1) * starMultiplier;
      state.streak += 1;
      state.combo = Math.min(5, 1 + Math.floor(state.streak / 8));
      playSound('coin');
      spawnBurst(position, materials.sun, 7);
      if (navigator.vibrate) navigator.vibrate(12);
    } else if (pickup.type === 'SHIELD') {
      state.shield = CONFIG.shieldDuration;
      playSound('shield');
      showToast('LEAF SHIELD READY');
      spawnBurst(position, materials.river, 14);
      if (navigator.vibrate) navigator.vibrate([20, 35, 20]);
    } else if (pickup.type === 'FRUIT') {
      state.boostCharge = Math.min(100, state.boostCharge + CONFIG.fruitBoostCharge);
      state.pickupScore += 45 * (state.boosting ? 2 : 1) * starMultiplier;
      playSound('fruitPickup');
      showToast('FRUIT FUEL +' + CONFIG.fruitBoostCharge);
      spawnBurst(position, materials.coral, 10);
      spawnBurst(position, materials.leafLight, 7);
      if (navigator.vibrate) navigator.vibrate([16, 22, 28]);
    } else if (pickup.type === 'MAGNET') {
      state.magnetTimer = CONFIG.magnetDuration;
      state.pickupScore += 40 * starMultiplier;
      playSound('magnet');
      showToast('COIN MAGNET ON');
      popWord('CLING!');
      spawnBurst(position, materials.coral, 10);
      spawnBurst(position, materials.cream, 6);
      if (navigator.vibrate) navigator.vibrate([18, 20, 18]);
    } else if (pickup.type === 'STAR') {
      state.starTimer = CONFIG.starDuration;
      state.pickupScore += 40;
      playSound('star');
      showToast('DOUBLE SCORE');
      popWord('x2!');
      spawnBurst(position, materials.sun, 14);
      if (navigator.vibrate) navigator.vibrate([18, 20, 18]);
    } else if (pickup.type === 'SLOWMO') {
      state.slowmoTimer = CONFIG.slowmoDuration;
      state.pickupScore += 40 * starMultiplier;
      playSound('slowmo');
      showToast('SLOW-MO LENS');
      popWord('FRZZT!');
      spawnBurst(position, materials.river, 12);
      if (navigator.vibrate) navigator.vibrate([30, 40]);
    } else if (pickup.type === 'SUPERCHARGE') {
      const previousCount = state.superchargeInventory;
      state.superchargeInventory = Math.min(CONFIG.superchargeMaxInventory, state.superchargeInventory + 1);
      state.pickupScore += 60 * (state.boosting ? 2 : 1) * starMultiplier;
      playSound('superchargePickup');
      showToast(previousCount === CONFIG.superchargeMaxInventory ? 'SUPERCHARGE FULL' : 'SUPERCHARGE STORED');
      spawnBurst(position, materials.sun, 10);
      spawnBurst(position, materials.river, 10);
      if (navigator.vibrate) navigator.vibrate([22, 24, 22, 30]);
    }
  }

  function activateSupercharge() {
    if (state.mode !== GAME.RUNNING) return false;
    if (state.superchargeTimer > 0) {
      showToast('SUPERCHARGE ACTIVE');
      return false;
    }
    if (state.superchargeInventory <= 0) {
      showToast('SUPERCHARGE EMPTY');
      return false;
    }
    state.superchargeInventory -= 1;
    state.superchargeTimer = CONFIG.superchargeDuration;
    dom.shell.classList.add('supercharged');
    playSound('supercharge');
    showToast('INVINCIBLE');
    spawnBurst(new THREE.Vector3(player.x, player.y + 0.9, 0), materials.sun, 18);
    spawnBurst(new THREE.Vector3(player.x, player.y + 0.9, 0), materials.river, 14);
    if (navigator.vibrate) navigator.vibrate([30, 28, 50]);
    updateHud();
    return true;
  }

  function updateSupercharge(dt) {
    if (state.superchargeTimer <= 0) return;
    state.superchargeTimer = Math.max(0, state.superchargeTimer - dt);
    if (state.superchargeTimer === 0) {
      dom.shell.classList.remove('supercharged');
      showToast('SUPERCHARGE ENDED');
    }
  }

  function checkObstacles() {
    if (state.turnAnimation) return;
    segments.forEach(function (segment) {
      segment.obstacles.forEach(function (obstacle) {
        if (obstacle.hit) return;
        obstacle.mesh.getWorldPosition(tempWorld);
        const previousZ = obstacle.lastWorldZ;
        obstacle.lastWorldZ = tempWorld.z;
        const crossedPlayer = Math.abs(tempWorld.z) < 0.9 || (previousZ !== undefined && previousZ < -0.9 && tempWorld.z > 0.9);
        if (!crossedPlayer || Math.abs(tempWorld.x - player.x) > 0.78) return;

        let avoided = false;
        if (obstacle.type === 'LOG' || obstacle.type === 'PIT') avoided = player.y > 0.58;
        if (obstacle.type === 'VINE' || obstacle.type === 'GATE') avoided = player.sliding;
        if (!avoided) {
          obstacle.hit = true;
          if (state.superchargeTimer > 0 || state.shield > 0) obstacle.mesh.visible = false;
          crash(obstacle.type.toLowerCase(), { worldZ: tempWorld.z });
        }
      });
    });
  }

  function updateTurnGates() {
    if (state.turnAnimation) return;
    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];
      const turn = segment.turn;
      if (turn && !turn.resolved) {
        const z = turn.root.position.z - 1;
        if (!turn.prompted && z > CONFIG.turnPromptZ) {
          turn.prompted = true;
          state.activeTurn = turn;
          showEventPrompt(turn.direction < 0 ? '↰' : '↱', turn.direction < 0 ? 'LEFT TURN' : 'RIGHT TURN');
          playSound('warning');
        }
        if (turn.queued && !turn.resolved && z > CONFIG.turnBeginZ) {
          beginTurn(turn);
          return;
        }
        if (turn.prompted && z > 1.25 && !turn.resolved) {
          turn.resolved = true;
          state.activeTurn = null;
          hideTurnPrompt();
          crash('missed turn');
          return;
        }
      }

      const qte = segment.qte;
      if (qte && !qte.resolved) {
        const z = qte.root.position.z - 1;
        if (!qte.prompted && z > CONFIG.turnPromptZ) {
          qte.prompted = true;
          showEventPrompt(qte.kind === 'leap' ? '↑' : '↓', qte.kind === 'leap' ? 'JUMP THE GAP' : 'SLIDE UNDER');
          playSound('warning');
        }
        if (qte.prompted && Math.abs(z) < 1.1) {
          const safe = qte.kind === 'leap' ? player.y > 0.45 : player.sliding;
          if (!safe) {
            qte.resolved = true;
            hideTurnPrompt();
            crash(qte.kind === 'leap' ? 'gorge' : 'branch', { worldZ: z });
            return;
          }
        }
        if (qte.prompted && z >= 1.1) {
          qte.resolved = true;
          hideTurnPrompt();
          state.pickupScore += CONFIG.qteBonus * (state.starTimer > 0 ? 2 : 1);
          state.streak += 3;
          state.combo = Math.min(5, 1 + Math.floor(state.streak / 8));
          popWord(qte.kind === 'leap' ? 'LEAP!' : 'SWISH!');
          playSound('qte');
          bumpStat(qte.kind === 'leap' ? 'leaps' : 'ducks', 1);
        }
      }
    }
  }

  function acceptTurn(direction) {
    const turn = state.activeTurn;
    if (!turn || turn.resolved || direction !== turn.direction) return false;
    turn.queued = true;
    if (turn.deadEnd) turn.deadEnd.visible = false;
    playSound('lane');
    if (!turn.root) beginTurn(turn);
    return true;
  }

  function beginTurn(turn) {
    if (!turn || turn.resolved) return;
    turn.resolved = true;
    state.activeTurn = null;
    hideTurnPrompt();
    clearThreat();
    state.threatCooldown = Math.max(state.threatCooldown, 4);
    state.heading = (state.heading + turn.direction + 4) % 4;
    state.streak += 4;
    state.combo = Math.min(5, 1 + Math.floor(state.streak / 8));
    const pivotZ = turn.root ? turn.root.position.z - 1 : CONFIG.turnBeginZ;
    const arcDuration = (Math.abs(pivotZ) * Math.PI / 2) / Math.max(10, state.speed);
    state.turnAnimation = {
      direction: turn.direction,
      time: 0,
      duration: THREE.MathUtils.clamp(arcDuration, 0.55, 1.1),
      pivotZ: pivotZ,
    };
    dom.shell.classList.add('turning');
    playSound('turn');
    if (navigator.vibrate) navigator.vibrate([25, 30, 25]);
  }

  function updateTurnAnimation(dt) {
    const animation = state.turnAnimation;
    if (!animation) return;
    animation.time += dt;
    const progress = Math.min(1, animation.time / animation.duration);
    const eased = progress * progress * (3 - 2 * progress);
    const arc = Math.sin(progress * Math.PI);
    const yaw = animation.direction * (Math.PI / 2) * eased;
    const pivotZ = animation.pivotZ;

    // Rotate the whole course around the corner so the camera sweeps
    // continuously through the turn instead of cutting.
    world.rotation.y = yaw;
    world.position.x = -pivotZ * Math.sin(yaw);
    world.position.z = pivotZ * (1 - Math.cos(yaw));

    camera.position.set(
      player.x * 0.4 + animation.direction * arc * 1.5,
      5 + arc * 0.34,
      8.6 - arc * 0.75
    );
    camera.lookAt(player.x * 0.18 + animation.direction * arc * 1.2, 0.92, -10.5 + arc * 1.3);
    camera.rotation.z = -animation.direction * arc * 0.075;
    player.rig.position.x = player.x + animation.direction * arc * 0.45;
    player.rig.rotation.z = -animation.direction * arc * 0.16;

    if (progress >= 1) {
      // Panel-wipe masks the course re-anchor onto a straight axis.
      flashPanel();
      state.lastTurnSerial = state.serial;
      rebuildAfterTurn();
      world.rotation.y = 0;
      world.position.set(0, 0, 0);
      camera.rotation.z = 0;
      camera.position.set(0, 5, 8.6);
      camera.lookAt(0, 0.9, -10.5);
      player.rig.position.x = player.x;
      player.rig.rotation.z = 0;
      state.turnAnimation = null;
      dom.shell.classList.remove('turning');
      popWord(animation.direction < 0 ? 'SKRRT!' : 'ZOOM!');
      applyBiome(state.heading);
      bumpStat('turns', 1);
    }
  }

  function showEventPrompt(arrow, label) {
    state.stageBannerTimer = 0;
    dom.stageBanner.classList.add('hidden');
    dom.turnArrow.textContent = arrow;
    dom.turnLabel.textContent = label;
    dom.turnPrompt.classList.remove('hidden');
  }

  function hideTurnPrompt() {
    dom.turnPrompt.classList.add('hidden');
  }

  function updateThreat(dt) {
    if (!state.threat) {
      state.threatCooldown -= dt;
      if (state.threatCooldown <= 0 && !state.activeTurn && !state.turnAnimation) spawnThreat();
      return;
    }

    const threat = state.threat;
    threat.timer -= dt;
    const progress = 1 - Math.max(0, threat.timer / threat.duration);
    const eased = progress * progress;
    threat.marker.rotation.z += dt * 3;
    threat.marker.scale.setScalar(0.7 + progress * 0.9);
    threat.rock.position.set(
      laneX(threat.lane) + (1 - eased) * 7,
      11 - eased * 10.25,
      -1.4 - (1 - eased) * 4
    );
    threat.rock.rotation.x += dt * 5;
    threat.rock.rotation.z += dt * 7;

    if (threat.timer <= 0) {
      const strike = threat.rock.position.clone();
      spawnBurst(strike, materials.coral, 18);
      impact();
      if (Math.abs(player.x - laneX(threat.lane)) < 0.86 && player.y < 0.62) crash('boulder');
      scene.remove(threat.marker);
      scene.remove(threat.rock);
      disposeObjectResources(threat.rock);
      state.threat = null;
      const stage = STAGES[state.stageIndex];
      state.threatCooldown = stage.threatMin + Math.random() * stage.threatRange;
      dom.threatWarning.classList.add('hidden');
    }
  }

  function spawnThreat() {
    const lane = Math.floor(Math.random() * 3);
    const marker = new THREE.Mesh(geometries.warningRing, materials.warning);
    marker.rotation.x = -Math.PI / 2;
    marker.position.set(laneX(lane), 0.025, -1.4);
    scene.add(marker);

    const rock = inkedMesh(geometries.fallingRock, materials.stone);
    rock.position.set(laneX(lane) + 7, 11, -5.4);
    scene.add(rock);

    state.threat = { lane: lane, timer: 2.75, duration: 2.75, marker: marker, rock: rock };
    dom.threatLane.textContent = ['left lane', 'center lane', 'right lane'][lane];
    dom.threatWarning.classList.remove('hidden');
    playSound('warning');
  }

  function updateShield(dt) {
    if (state.shield <= 0) return;
    state.shield = Math.max(0, state.shield - dt);
    if (state.shield === 0) showToast('SHIELD FADED');
  }

  function updateCamera(dt) {
    if (state.turnAnimation) return;
    const targetX = player.x * 0.4;
    const baseFov = window.innerWidth < 600 ? 67 : 58;
    const targetFov = baseFov + (state.boosting ? 6.5 : 0);
    camera.position.x += (targetX - camera.position.x) * (1 - Math.exp(-4 * dt));
    camera.position.z += ((state.boosting ? 8.05 : 8.6) - camera.position.z) * (1 - Math.exp(-4 * dt));
    camera.position.y = 5 + player.y * 0.13 + (state.boosting ? 0.12 : 0);
    camera.fov += (targetFov - camera.fov) * (1 - Math.exp(-5 * dt));
    camera.updateProjectionMatrix();
    camera.lookAt(player.x * 0.18, 0.9 + player.y * 0.06, state.boosting ? -12.4 : -10.5);
    camera.rotation.z += ((player.lane === 1 ? 0 : (player.lane - 1) * -0.012) - camera.rotation.z) * (1 - Math.exp(-4 * dt));
  }

  function updateStageProgress() {
    const local = state.distance % CONFIG.stageCycle;
    let nextIndex = 0;
    for (let i = STAGES.length - 1; i >= 0; i -= 1) {
      if (local >= STAGES[i].threshold) {
        nextIndex = i;
        break;
      }
    }
    if (nextIndex !== state.stageIndex) applyStage(nextIndex, true);
  }

  function applyStage(index, announce) {
    state.stageIndex = THREE.MathUtils.clamp(index, 0, STAGES.length - 1);
    applyBiome(state.heading);
    if (announce && !state.activeTurn && !state.turnAnimation) {
      const stage = STAGES[state.stageIndex];
      const lap = Math.floor(state.distance / CONFIG.stageCycle);
      dom.stageIssue.textContent = 'ISSUE ' + String(state.stageIndex + 1 + lap * STAGES.length).padStart(2, '0');
      dom.stageName.textContent = stage.name;
      dom.stageDeck.textContent = stage.deck;
      dom.stageBanner.classList.remove('hidden');
      dom.stageBanner.style.animation = 'none';
      void dom.stageBanner.offsetWidth;
      dom.stageBanner.style.animation = '';
      state.stageBannerTimer = 2.4;
      playSound('stage');
      if (state.stageIndex === 3 && state.mode === GAME.RUNNING) bumpStat('cityVisits', 1);
    }
    if (music) setMusicTheme(STAGES[state.stageIndex].theme);
  }

  function updateStageBanner(dt) {
    if (state.stageBannerTimer <= 0) return;
    state.stageBannerTimer -= dt;
    if (state.stageBannerTimer <= 0) dom.stageBanner.classList.add('hidden');
  }

  function applyBiome(heading) {
    if (!scene || !materials) return;
    const stage = STAGES[state.stageIndex];
    const turnTint = (((heading % 4) + 4) % 4 - 1.5) * 0.012;
    const sky = new THREE.Color(stage.sky).offsetHSL(turnTint, 0, turnTint * 0.7);
    scene.background.copy(sky);
    if (scene.fog) {
      scene.fog.color.copy(sky);
      scene.fog.near = stage.fogNear;
      scene.fog.far = stage.fogFar;
    }
    materials.path.color.setHex(stage.path);
    materials.pathLight.color.setHex(stage.pathLight);
    materials.leaf.color.setHex(stage.leaf);
    materials.leafLight.color.setHex(stage.leafLight);
    materials.leafDark.color.copy(new THREE.Color(stage.leaf).offsetHSL(-0.01, 0.04, -0.1));
    materials.river.color.setHex(stage.accent);
    if (backdrop) {
      backdrop.midMaterial.color.setHex(stage.leaf);
      const sunColors = { jungle: 0xf5bd31, springs: 0xfaf0dd, cave: 0x53e0e8, city: 0xff3fa4 };
      backdrop.sun.material.color.setHex(sunColors[stage.theme]);
      backdrop.sun.scale.setScalar(stage.theme === 'cave' ? 0.5 : 1);
      backdrop.rays.forEach(function (ray, index) {
        ray.material.color.setHex(index % 2 ? stage.accent : sunColors[stage.theme]);
        ray.material.opacity = stage.theme === 'city' ? 0.4 : (stage.theme === 'cave' ? 0.16 : 0.28);
      });
      backdrop.dots.material.opacity = 0.3 + state.stageIndex * 0.055;
      if (backdrop.far) backdrop.far.visible = stage.theme === 'jungle' || stage.theme === 'springs';
      if (backdrop.mid) backdrop.mid.visible = backdrop.far.visible;
      if (backdrop.skyline) backdrop.skyline.visible = stage.theme === 'city';
      if (backdrop.caveTeeth) backdrop.caveTeeth.visible = stage.theme === 'cave';
    }
    const accent = '#' + new THREE.Color(stage.accent).getHexString();
    document.documentElement.style.setProperty('--stage-accent', accent);
    document.documentElement.style.setProperty('--stage-glow', accent + '6b');
  }

  function calculateScore() {
    return Math.floor(state.distance + state.boostBonus + state.starBonus + state.pickupScore + Math.max(0, state.combo - 1) * 25);
  }

  function updateHud() {
    state.score = calculateScore();
    dom.hudScore.textContent = String(state.score).padStart(5, '0');
    dom.hudHighscore.textContent = String(Math.max(state.best, state.score)).padStart(5, '0');
    dom.hudCoins.textContent = String(state.coins);
    dom.hudCombo.textContent = 'x' + state.combo;
    dom.comboChip.classList.toggle('hidden', state.combo < 2);
    dom.shieldChip.classList.toggle('hidden', state.shield <= 0);
    dom.shieldTime.textContent = Math.ceil(state.shield);
    dom.magnetChip.classList.toggle('hidden', state.magnetTimer <= 0);
    dom.magnetTime.textContent = Math.ceil(state.magnetTimer);
    dom.starChip.classList.toggle('hidden', state.starTimer <= 0);
    dom.starTime.textContent = Math.ceil(state.starTimer);
    dom.slowmoChip.classList.toggle('hidden', state.slowmoTimer <= 0);
    dom.slowmoTime.textContent = Math.ceil(state.slowmoTimer);
    const boostValue = Math.round(state.boostCharge);
    dom.boostFill.style.width = boostValue + '%';
    dom.boostValue.textContent = String(boostValue);
    dom.boostMeter.setAttribute('aria-valuenow', String(boostValue));
    dom.boostMeter.classList.toggle('empty', boostValue === 0);
    const superchargeActive = state.superchargeTimer > 0;
    const showSupercharge = state.mode === GAME.RUNNING && (state.superchargeInventory > 0 || superchargeActive);
    dom.superchargeInventory.classList.toggle('hidden', !showSupercharge);
    dom.superchargeCount.textContent = String(state.superchargeInventory);
    dom.superchargeTime.textContent = Math.ceil(state.superchargeTimer) + 's';
    dom.superchargeTime.classList.toggle('hidden', !superchargeActive);
    dom.shell.classList.toggle('supercharged', superchargeActive);
    dom.shell.dataset.gameState = state.mode;
    dom.shell.dataset.lane = String(player.lane);
    dom.shell.dataset.jumping = String(player.jumping);
    dom.shell.dataset.sliding = String(player.sliding);
    dom.shell.dataset.heading = String(state.heading);
    dom.shell.dataset.pose = player.currentPose;
    dom.shell.dataset.boosting = String(state.boosting);
    dom.shell.dataset.boostCharge = String(boostValue);
    dom.shell.dataset.speed = state.speed.toFixed(2);
    dom.shell.dataset.superchargeCount = String(state.superchargeInventory);
    dom.shell.dataset.superchargeTime = state.superchargeTimer.toFixed(2);
    dom.shell.dataset.crashReason = state.crashReason;
    dom.shell.dataset.crashStartZ = state.crashStartZ.toFixed(2);
    dom.shell.dataset.turning = String(Boolean(state.turnAnimation));
    dom.shell.dataset.skin = player.skin;
    dom.shell.dataset.music = String(music.enabled && Boolean(music.timer));
    dom.shell.dataset.worldYaw = world ? world.rotation.y.toFixed(3) : '0.000';
    dom.shell.dataset.stage = String(state.stageIndex);
    dom.shell.dataset.turnGap = String(STAGES[state.stageIndex].turnGap);
    dom.shell.dataset.activeSegments = String(segments.length);
    dom.shell.dataset.activeTurn = state.activeTurn ? String(state.activeTurn.direction) : '';
    if (renderer) {
      dom.shell.dataset.geometries = String(renderer.info.memory.geometries);
      dom.shell.dataset.textures = String(renderer.info.memory.textures);
    }
  }

  function updateIdle(timestamp) {
    if (!player.rig || state.mode === GAME.GAMEOVER) return;
    player.rig.position.y = Math.abs(Math.sin(timestamp * 0.0022)) * 0.04;
    player.rig.rotation.z = Math.sin(timestamp * 0.0014) * 0.012;
  }

  function updateCrash(dt) {
    state.crashTimer += dt;
    const t = state.crashTimer;
    const fallingIntoPit = state.crashReason === 'pit' || state.crashReason === 'gorge';
    const crashDuration = fallingIntoPit ? CONFIG.pitFallDuration : CONFIG.crashDuration;

    if (fallingIntoPit) {
      const progress = Math.min(1, t / crashDuration);
      const sink = progress * progress * (3 - 2 * progress);
      setPlayerPose(progress < 0.18 ? 'jump' : 'crash');
      dom.shell.dataset.pose = player.currentPose;
      player.rig.position.z = state.crashStartZ - sink * 0.18;
      player.rig.position.y = player.y + Math.sin(Math.min(1, progress * 1.8) * Math.PI) * 0.16 - sink * 2.45;
      player.rig.rotation.z = Math.sin(progress * Math.PI) * -0.24;
      player.rig.scale.setScalar(1 - sink * 0.34);
      if (player.shadow) {
        player.shadow.scale.set(1.25 + sink * 0.5, 0.62 + sink * 0.26, 1);
        player.shadow.material.opacity = Math.max(0, 0.34 * (1 - progress * 1.5));
      }
      camera.position.z += (7.9 - camera.position.z) * 0.08;
      camera.position.y += (4.65 - camera.position.y) * 0.08;
      camera.lookAt(player.x * 0.1, -0.3 * sink, -4.8);
    } else if (t < 0.09) {
      player.rig.scale.set(1.06, 0.9, 1);
      player.rig.position.z = state.crashStartZ;
      camera.position.z = 7.72;
      camera.position.y = 4.82;
    } else {
      setPlayerPose('crash');
      dom.shell.dataset.pose = 'crash';
      const progress = Math.min(1, (t - 0.09) / (CONFIG.crashDuration - 0.09));
      const settle = 1 - Math.pow(1 - progress, 3);
      player.rig.position.z = state.crashStartZ + settle * 0.48;
      player.rig.position.y = Math.sin(progress * Math.PI) * 0.11;
      player.rig.rotation.z = Math.sin(progress * Math.PI) * -0.16;
      player.rig.scale.set(1 + (1 - settle) * 0.08, 0.82 + settle * 0.12, 1);
      if (player.shadow) {
        player.shadow.scale.set(1.65 + settle * 0.35, 0.72 + settle * 0.18, 1);
        player.shadow.material.opacity = 0.44;
      }
      camera.position.x += (Math.sin(t * 31) * (1 - progress) * 0.08 - camera.position.x) * 0.24;
      camera.position.z += (8.25 - camera.position.z) * 0.1;
      camera.position.y += (4.86 - camera.position.y) * 0.12;
      camera.lookAt(player.x * 0.08, 0.82, -5.8);
    }
    if (state.crashTimer > crashDuration) finishRun();
  }

  function crash(reason, collision) {
    if (state.mode !== GAME.RUNNING) return;
    const unsavable = reason === 'missed turn' || reason === 'gorge';
    if (!unsavable && state.superchargeTimer > 0) {
      const savePosition = new THREE.Vector3(player.x, player.y + 0.75, -0.2);
      spawnBurst(savePosition, materials.sun, 12);
      spawnBurst(savePosition, materials.river, 10);
      impact();
      playSound('superchargeHit');
      showToast('SUPERCHARGE SMASH');
      popWord('SMASH!');
      if (navigator.vibrate) navigator.vibrate([20, 18, 36]);
      return;
    }
    if (!unsavable && state.shield > 0) {
      state.shield = 0;
      state.streak = 0;
      state.combo = 1;
      impact();
      playSound('shieldBreak');
      showToast('SHIELD SAVE');
      popWord('SAVED!');
      return;
    }

    state.mode = GAME.CRASHED;
    state.score = calculateScore();
    state.crashTimer = 0;
    state.crashVelocity = state.speed;
    state.crashReason = reason;
    state.crashStartZ = (reason === 'pit' || reason === 'gorge')
      ? 0
      : (collision && Number.isFinite(collision.worldZ) ? Math.max(0.68, collision.worldZ + 0.58) : 0);
    state.streak = 0;
    state.superchargeTimer = 0;
    state.turnAnimation = null;
    world.rotation.y = 0;
    world.position.set(0, 0, 0);
    camera.rotation.z = 0;
    player.rig.position.x = player.x;
    player.rig.position.z = state.crashStartZ;
    dom.shell.dataset.gameState = state.mode;
    dom.shell.dataset.pose = player.currentPose;
    dom.shell.dataset.crashReason = state.crashReason;
    dom.shell.dataset.crashStartZ = state.crashStartZ.toFixed(2);
    stopBoost();
    hideTurnPrompt();
    dom.threatWarning.classList.add('hidden');
    dom.pauseButton.classList.add('hidden');
    const kickers = {
      'missed turn': 'Wrong way, jungle explorer',
      gorge: 'The gap wins this round',
      branch: 'That branch came out of nowhere',
      boulder: 'Squashed flat. Classic.',
    };
    dom.gameOverKicker.textContent = kickers[reason] || 'The jungle wins this round';
    state.magnetTimer = 0;
    state.starTimer = 0;
    state.slowmoTimer = 0;
    dom.shell.classList.remove('turning', 'supercharged', 'slowmo');
    dom.shell.classList.add('crashing');
    if (player.cyan && player.coral) {
      player.cyan.material.opacity = 0.5;
      player.coral.material.opacity = 0.5;
      player.cyan.position.x = -0.12;
      player.coral.position.x = 0.12;
    }
    const impactPosition = new THREE.Vector3(player.x, 0.55, -0.2);
    spawnBurst(impactPosition, materials.coral, 15);
    spawnBurst(impactPosition, materials.ink, 12);
    impact();
    stopMusic();
    playSound('crash');
    if (navigator.vibrate) navigator.vibrate([90, 50, 120]);
  }

  function impact() {
    dom.shell.classList.remove('impact');
    void dom.shell.offsetWidth;
    dom.shell.classList.add('impact');
    window.setTimeout(function () { dom.shell.classList.remove('impact'); }, 400);
  }

  function startRun() {
    initAudio();
    clearThreat();
    hideTurnPrompt();
    state.mode = GAME.RUNNING;
    state.distance = 0;
    state.coins = 0;
    state.score = 0;
    state.speed = CONFIG.baseSpeed;
    state.boostCharge = CONFIG.boostStartCharge;
    state.boosting = false;
    state.boostHeld = false;
    state.boostBonus = 0;
    state.superchargeInventory = 0;
    state.superchargeTimer = 0;
    state.magnetTimer = 0;
    state.starTimer = 0;
    state.slowmoTimer = 0;
    state.starBonus = 0;
    state.powTimer = 0;
    state.pickupScore = 0;
    state.stageIndex = 0;
    state.stageBannerTimer = 0;
    state.elapsed = 0;
    state.heading = 0;
    state.streak = 0;
    state.combo = 1;
    state.shield = 0;
    state.activeTurn = null;
    state.turnAnimation = null;
    state.threatCooldown = STAGES[0].threatMin;
    state.crashTimer = 0;
    state.crashVelocity = 0;
    state.crashReason = '';
    state.crashStartZ = 0;
    state.lastFrame = performance.now();
    player.lane = 1;
    player.x = 0;
    player.targetX = 0;
    player.y = 0;
    player.vy = 0;
    player.jumping = false;
    player.sliding = false;
    player.rig.position.set(0, 0.04, 0);
    player.rig.rotation.set(0, 0, 0);
    player.rig.scale.set(1, 1, 1);
    setPlayerPose('runA', true);
    if (player.cyan && player.coral) {
      player.cyan.material.opacity = 0;
      player.coral.material.opacity = 0;
    }
    player.afterimages.forEach(function (trail) { trail.material.opacity = 0; });
    player.shadow.scale.set(1.25, 0.62, 1);
    player.shadow.material.opacity = 0.38;
    world.rotation.set(0, 0, 0);
    world.position.set(0, 0, 0);
    camera.position.set(0, 5, 8.6);
    camera.rotation.z = 0;
    applyStage(0, true);
    resetSegments(true);

    dom.startScreen.classList.add('hidden');
    dom.pauseScreen.classList.add('hidden');
    dom.gameOverScreen.classList.add('hidden');
    dom.newHighscore.classList.add('hidden');
    dom.hud.classList.remove('hidden');
    dom.pauseButton.classList.remove('hidden');
    dom.shell.classList.add('running');
    dom.shell.classList.remove('turning', 'crashing', 'boosting', 'supercharged', 'impact', 'slowmo');
    updateHud();
    window.setTimeout(function () { dom.pauseButton.focus(); }, 0);
    playSound('start');
    startMusic();
  }

  function pauseGame() {
    if (state.mode !== GAME.RUNNING) return;
    stopBoost();
    stopMusic();
    state.mode = GAME.PAUSED;
    dom.shell.dataset.gameState = state.mode;
    dom.pauseScreen.classList.remove('hidden');
    dom.pauseButton.classList.add('hidden');
    window.setTimeout(function () { dom.resumeButton.focus(); }, 0);
  }

  function resumeGame() {
    if (state.mode !== GAME.PAUSED) return;
    state.mode = GAME.RUNNING;
    dom.shell.dataset.gameState = state.mode;
    state.lastFrame = performance.now();
    dom.pauseScreen.classList.add('hidden');
    dom.pauseButton.classList.remove('hidden');
    dom.pauseButton.focus();
    startMusic();
  }

  function finishRun() {
    if (state.mode === GAME.GAMEOVER) return;
    state.mode = GAME.GAMEOVER;
    state.superchargeTimer = 0;
    bumpMax('bestDistance', Math.floor(state.distance));
    safeWriteJson('cappy_stats', stats);
    renderMissions();
    const previousBest = state.best;
    if (state.score > state.best) {
      state.best = state.score;
      safeWriteBest(state.best);
    }
    syncBestScore();
    dom.finalScore.textContent = String(state.score);
    dom.finalDistance.textContent = Math.floor(state.distance) + 'm';
    dom.finalCoins.textContent = String(state.coins);
    dom.finalBest.textContent = String(state.best);
    dom.newHighscore.classList.toggle('hidden', state.score <= previousBest || state.score === 0);
    dom.hud.classList.add('hidden');
    dom.gameOverScreen.classList.remove('hidden');
    dom.superchargeInventory.classList.add('hidden');
    dom.shell.classList.remove('running', 'high-speed', 'turning', 'boosting', 'supercharged', 'crashing', 'slowmo');
    stopBoost();
    clearThreat();
    window.setTimeout(function () { dom.restartButton.focus(); }, 0);
  }

  function handleLateral(direction) {
    if (state.mode !== GAME.RUNNING) return;
    if (state.activeTurn) {
      if (!acceptTurn(direction)) {
        playSound('blocked');
        showToast(direction < 0 ? 'TURN RIGHT' : 'TURN LEFT');
      }
      return;
    }
    if (player.sliding) return;
    const nextLane = THREE.MathUtils.clamp(player.lane + direction, 0, 2);
    if (nextLane !== player.lane) {
      player.lane = nextLane;
      playSound('lane');
    } else {
      playSound('blocked');
    }
  }

  function jump() {
    if (state.mode !== GAME.RUNNING || player.jumping || player.sliding) return;
    player.jumping = true;
    player.vy = CONFIG.jumpVelocity;
    playSound('jump');
  }

  function slide() {
    if (state.mode !== GAME.RUNNING || player.jumping || player.sliding) return;
    player.sliding = true;
    player.slideTimer = CONFIG.slideDuration;
    playSound('slide');
  }

  function setupControls() {
    document.addEventListener('keydown', function (event) {
      const key = event.key.toLowerCase();
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' ', 'a', 'b', 'd', 'w', 's', 'x', 'shift', '?'].includes(key)) event.preventDefault();
      if (!dom.controlsScreen.classList.contains('hidden')) {
        if (key === 'escape') closeControls();
        else if (key === 'tab') {
          event.preventDefault();
          dom.controlsClose.focus();
        }
        return;
      }
      if (key === '?') {
        openControls();
        return;
      }
      const localTest = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
      if (localTest && ['1', '2', '3', '4'].includes(key) && state.mode === GAME.RUNNING) {
        const index = Number(key) - 1;
        state.distance = STAGES[index].threshold + (index ? 6 : 0);
        updateStageProgress();
        updateHud();
        return;
      }
      if (localTest && ['5', '6', '7'].includes(key) && state.mode === GAME.RUNNING) {
        state.distance = key === '5' ? 2401 : (key === '6' ? 2601 : 3001);
        updateStageProgress();
        updateHud();
        return;
      }
      if (localTest && key === 'f' && state.mode === GAME.RUNNING) {
        collectPickup({ type: 'FRUIT', collected: false, mesh: { visible: true } }, new THREE.Vector3(player.x, 0.9, 0));
        updateHud();
        return;
      }
      if (localTest && key === 'q' && state.mode === GAME.RUNNING) {
        collectPickup({ type: 'SUPERCHARGE', collected: false, mesh: { visible: true } }, new THREE.Vector3(player.x, 0.9, 0));
        updateHud();
        return;
      }
      if (localTest && key === 'i' && state.mode === GAME.RUNNING && segments.length > 1) {
        addObstacle(segments[1], 'PIT', 1, 0);
        return;
      }
      if (localTest && key === 'o' && state.mode === GAME.RUNNING && segments.length > 1) {
        addObstacle(segments[1], 'LOG', 1, 0);
        return;
      }
      if (localTest && key === 'l' && state.mode === GAME.RUNNING && segments.length > 1) {
        addQteGate(segments[1], 'leap');
        return;
      }
      if (localTest && key === 'k' && state.mode === GAME.RUNNING && segments.length > 1) {
        addQteGate(segments[1], 'duck');
        return;
      }
      if (localTest && key === 'c' && state.mode === GAME.RUNNING) {
        crash('test impact');
        return;
      }
      if (localTest && key === 't' && state.mode === GAME.RUNNING) {
        state.activeTurn = { direction: 1, resolved: false, prompted: true, root: null };
        showEventPrompt("↱", "RIGHT TURN");
        return;
      }
      if (localTest && key === 'v' && state.mode === GAME.RUNNING && !state.threat) {
        spawnThreat();
        return;
      }
      if (localTest && key === 'n' && state.mode === GAME.RUNNING && segments.length) {
        const testTurn = { direction: 1, resolved: false, prompted: true, root: segments[0].root };
        segments[0].turn = testTurn;
        state.activeTurn = testTurn;
        showEventPrompt("↱", "RIGHT TURN");
        return;
      }
      if (localTest && key === 'u' && state.mode === GAME.RUNNING && segments.length > 1) {
        const bufferedTurn = { direction: 1, resolved: false, prompted: true, root: segments[1].root };
        segments[1].turn = bufferedTurn;
        state.activeTurn = bufferedTurn;
        showEventPrompt("↱", "RIGHT TURN");
        return;
      }
      if (localTest && key === 'g' && state.mode === GAME.RUNNING) {
        for (let i = 0; i < 120; i += 1) {
          const first = segments.shift();
          const lastZ = segments[segments.length - 1].root.position.z;
          buildSegment(first, state.serial, lastZ - CONFIG.segmentLength, false);
          state.serial += 1;
          segments.push(first);
        }
        return;
      }
      if (key === 'escape' || key === 'p') {
        if (state.mode === GAME.RUNNING) pauseGame();
        else if (state.mode === GAME.PAUSED) resumeGame();
        return;
      }
      if ((key === 'shift' || key === 'b') && !event.repeat) {
        startBoost();
        return;
      }
      if (key === 'x' && !event.repeat) {
        activateSupercharge();
        return;
      }
      if (key === 'm' && !event.repeat) {
        toggleMusic();
        return;
      }
      if ((key === 'enter' || key === ' ') && (state.mode === GAME.START || state.mode === GAME.GAMEOVER)) {
        startRun();
        return;
      }
      if (key === 'arrowleft' || key === 'a') handleLateral(-1);
      else if (key === 'arrowright' || key === 'd') handleLateral(1);
      else if (key === 'arrowup' || key === 'w' || key === ' ') jump();
      else if (key === 'arrowdown' || key === 's') slide();
    });

    document.addEventListener('keyup', function (event) {
      const key = event.key.toLowerCase();
      if (key === 'shift' || key === 'b') stopBoost();
    });

    const gesture = {
      pointerId: null, x: 0, y: 0, moved: false, boostActive: false, holdTimer: 0,
      lastTapTime: 0, lastTapX: 0, lastTapY: 0,
    };
    dom.container.addEventListener('pointerdown', function (event) {
      if (state.mode !== GAME.RUNNING || gesture.pointerId !== null || event.target.closest('button')) return;
      gesture.pointerId = event.pointerId;
      gesture.x = event.clientX;
      gesture.y = event.clientY;
      gesture.moved = false;
      gesture.boostActive = false;
      if (dom.container.setPointerCapture) dom.container.setPointerCapture(event.pointerId);
      gesture.holdTimer = window.setTimeout(function () {
        if (!gesture.moved && state.mode === GAME.RUNNING) {
          gesture.boostActive = true;
          gesture.lastTapTime = 0;
          startBoost();
        }
      }, 170);
    });
    dom.container.addEventListener('pointermove', function (event) {
      if (event.pointerId !== gesture.pointerId) return;
      const dx = event.clientX - gesture.x;
      const dy = event.clientY - gesture.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) > 18) {
        if (!gesture.moved) gesture.lastTapTime = 0;
        gesture.moved = true;
        window.clearTimeout(gesture.holdTimer);
        if (gesture.boostActive) stopBoost();
      }
    });
    function finishGesture(event) {
      if (event.pointerId !== gesture.pointerId) return;
      window.clearTimeout(gesture.holdTimer);
      const cancelled = event.type === 'pointercancel';
      const dx = cancelled ? 0 : event.clientX - gesture.x;
      const dy = cancelled ? 0 : event.clientY - gesture.y;
      const wasBoost = gesture.boostActive;
      const wasMoved = gesture.moved;
      if (wasBoost) stopBoost();
      gesture.pointerId = null;
      gesture.boostActive = false;
      const travel = Math.max(Math.abs(dx), Math.abs(dy));
      if (state.mode !== GAME.RUNNING || wasBoost) return;
      if (cancelled) {
        gesture.lastTapTime = 0;
        return;
      }
      if (!wasMoved && travel < 28) {
        const now = performance.now();
        const tapDistance = Math.hypot(event.clientX - gesture.lastTapX, event.clientY - gesture.lastTapY);
        if (gesture.lastTapTime && now - gesture.lastTapTime <= CONFIG.doubleTapWindow && tapDistance <= CONFIG.doubleTapRadius) {
          gesture.lastTapTime = 0;
          activateSupercharge();
        } else {
          gesture.lastTapTime = now;
          gesture.lastTapX = event.clientX;
          gesture.lastTapY = event.clientY;
        }
        return;
      }
      gesture.lastTapTime = 0;
      if (travel < 18) return;
      if (Math.abs(dx) > Math.abs(dy)) handleLateral(dx > 0 ? 1 : -1);
      else if (dy < 0) jump();
      else slide();
    }
    dom.container.addEventListener('pointerup', finishGesture);
    dom.container.addEventListener('pointercancel', finishGesture);

    dom.startButton.addEventListener('click', startRun);
    dom.restartButton.addEventListener('click', startRun);
    dom.pauseButton.addEventListener('click', pauseGame);
    dom.resumeButton.addEventListener('click', resumeGame);
    dom.restartFromPause.addEventListener('click', startRun);
    dom.helpButton.addEventListener('click', openControls);
    dom.startHelpButton.addEventListener('click', openControls);
    dom.controlsClose.addEventListener('click', closeControls);
    dom.controlsScreen.addEventListener('pointerdown', function (event) {
      if (event.target === dom.controlsScreen) closeControls();
    });
    dom.closeButton.addEventListener('click', closeGame);
    dom.musicButton.addEventListener('click', function () {
      initAudio();
      toggleMusic();
    });
    dom.skinOptions.forEach(function (button) {
      button.addEventListener('click', function () { applySkin(button.dataset.skin); });
    });
  }

  function openControls() {
    if (!dom.controlsScreen.classList.contains('hidden')) return;
    state.helpPreviousFocus = document.activeElement;
    state.helpWasRunning = state.mode === GAME.RUNNING;
    if (state.helpWasRunning) {
      pauseGame();
      dom.pauseScreen.classList.add('hidden');
    }
    dom.controlsScreen.classList.remove('hidden');
    window.setTimeout(function () { dom.controlsClose.focus(); }, 0);
  }

  function closeControls() {
    if (dom.controlsScreen.classList.contains('hidden')) return;
    const restoreFocus = state.helpPreviousFocus;
    const focusAfterClose = function () {
      const target = restoreFocus && restoreFocus.offsetParent !== null
        ? restoreFocus
        : (state.mode === GAME.RUNNING ? dom.helpButton : dom.startButton);
      if (target && target.focus) target.focus();
    };
    dom.controlsScreen.classList.add('hidden');
    if (state.helpWasRunning) {
      state.helpWasRunning = false;
      resumeGame();
      window.setTimeout(focusAfterClose, 0);
      return;
    }
    focusAfterClose();
  }

  function setupLocalTestBridge() {
    if (!['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)) return;
    document.addEventListener('cappy:test', function () {
      const action = dom.shell.dataset.testAction;
      if (action === 'force-turn-left' || action === 'force-turn-right') {
        const direction = action.endsWith('left') ? -1 : 1;
        state.activeTurn = { direction: direction, resolved: false, prompted: true, root: null };
        showEventPrompt(direction < 0 ? "↰" : "↱", direction < 0 ? "LEFT TURN" : "RIGHT TURN");
      } else if (action === 'left') handleLateral(-1);
      else if (action === 'right') handleLateral(1);
      else if (action === 'jump') jump();
      else if (action === 'slide') slide();
      else if (action === 'boost-start') startBoost();
      else if (action === 'boost-stop') stopBoost();
      else if (action === 'threat' && !state.threat) spawnThreat();
      else if (action === 'crash') crash('test');
      else if (action.indexOf('distance:') === 0) {
        const value = Number(action.split(':')[1]);
        if (Number.isFinite(value)) {
          state.distance = Math.max(0, value);
          updateStageProgress();
        }
      }
      delete dom.shell.dataset.testAction;
    });
  }

  function closeGame() {
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.closeHandler) {
      window.webkit.messageHandlers.closeHandler.postMessage('exit_cappy_runner');
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      pauseGame();
      showToast('GAME PAUSED');
    }
  }

  function spawnBurst(position, material, count) {
    for (let i = 0; i < count; i += 1) {
      const mesh = new THREE.Mesh(geometries.particle, material);
      const baseScale = 0.65 + Math.random() * 0.75;
      mesh.scale.setScalar(baseScale);
      mesh.position.copy(position);
      const angle = Math.random() * Math.PI * 2;
      particles.push({
        mesh: mesh,
        velocity: new THREE.Vector3(Math.cos(angle) * (1.4 + Math.random() * 2.2), 1.5 + Math.random() * 3.3, Math.sin(angle) * 1.8),
        life: 0.7 + Math.random() * 0.35,
        baseScale: baseScale,
      });
      scene.add(mesh);
    }
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      particle.life -= dt;
      particle.velocity.y -= 7 * dt;
      particle.mesh.position.addScaledVector(particle.velocity, dt);
      particle.mesh.rotation.x += dt * 8;
      particle.mesh.rotation.z += dt * 6;
      particle.mesh.scale.setScalar(Math.max(0, particle.life) * particle.baseScale);
      if (particle.life <= 0) {
        scene.remove(particle.mesh);
        particles.splice(i, 1);
      }
    }
  }

  function clearThreat() {
    if (!state.threat) return;
    scene.remove(state.threat.marker);
    scene.remove(state.threat.rock);
    disposeObjectResources(state.threat.rock);
    state.threat = null;
    dom.threatWarning.classList.add('hidden');
  }

  function showToast(message) {
    dom.toast.textContent = message;
    dom.toast.classList.remove('hidden');
    state.toastTimer = 1.25;
  }

  function updateToast(dt) {
    if (state.toastTimer > 0) {
      state.toastTimer -= dt;
      if (state.toastTimer <= 0) dom.toast.classList.add('hidden');
    }
    if (state.powTimer > 0) {
      state.powTimer -= dt;
      if (state.powTimer <= 0) dom.powWord.classList.add('hidden');
    }
  }

  function popWord(text) {
    if (!dom.powWord) return;
    dom.powWord.textContent = text;
    dom.powWord.classList.remove('hidden', 'pop');
    void dom.powWord.offsetWidth;
    dom.powWord.classList.add('pop');
    state.powTimer = 0.85;
  }

  function flashPanel() {
    if (!dom.panelWipe) return;
    dom.panelWipe.classList.remove('wipe');
    void dom.panelWipe.offsetWidth;
    dom.panelWipe.classList.add('wipe');
  }

  function syncBestScore() {
    const text = String(state.best).padStart(5, '0');
    dom.hudHighscore.textContent = text;
    dom.startHighscore.textContent = text;
  }

  function safeReadJson(key, fallback) {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(key));
      return parsed && typeof parsed === 'object' ? Object.assign({}, fallback, parsed) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function safeWriteJson(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Storage may be unavailable in private WKWebViews.
    }
  }

  function safeReadString(key, fallback) {
    try {
      return window.localStorage.getItem(key) || fallback;
    } catch (error) {
      return fallback;
    }
  }

  function safeWriteString(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      // Storage may be unavailable in private WKWebViews.
    }
  }

  function activeMissions() {
    return MISSIONS.filter(function (mission) { return stats.done.indexOf(mission.id) === -1; }).slice(0, 3);
  }

  function bumpStat(key, amount) {
    stats[key] += amount;
    checkMissions();
  }

  function bumpMax(key, value) {
    if (value <= stats[key]) return;
    stats[key] = value;
    checkMissions();
  }

  function checkMissions() {
    let changed = false;
    activeMissions().forEach(function (mission) {
      if (stats[mission.stat] < mission.target) return;
      stats.done.push(mission.id);
      changed = true;
      if (state.mode === GAME.RUNNING) {
        state.pickupScore += 150;
        popWord('DONE!');
      }
      showToast('MISSION: ' + mission.label.toUpperCase());
      playSound('star');
    });
    if (changed) {
      safeWriteJson('cappy_stats', stats);
      renderMissions();
    }
  }

  function renderMissions() {
    if (!dom.missionList) return;
    const active = activeMissions();
    dom.missionList.innerHTML = '';
    if (!active.length) {
      const li = document.createElement('li');
      li.className = 'mission-complete-all';
      li.textContent = 'All missions complete. Legend.';
      dom.missionList.appendChild(li);
      return;
    }
    active.forEach(function (mission) {
      const progress = Math.min(stats[mission.stat], mission.target);
      const li = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = mission.label;
      const count = document.createElement('b');
      count.textContent = progress + '/' + mission.target;
      const bar = document.createElement('i');
      bar.style.width = Math.round((progress / mission.target) * 100) + '%';
      li.appendChild(label);
      li.appendChild(count);
      li.appendChild(bar);
      dom.missionList.appendChild(li);
    });
  }

  function safeReadBest() {
    try {
      const value = Number(window.localStorage.getItem('cappy_jungle_best'));
      return Number.isFinite(value) && value >= 0 ? value : 0;
    } catch (error) {
      return 0;
    }
  }

  function safeWriteBest(value) {
    try {
      window.localStorage.setItem('cappy_jungle_best', String(value));
    } catch (error) {
      // The run still completes when storage is unavailable in private WKWebViews.
    }
  }

  function initAudio() {
    if (audioContext) {
      if (audioContext.state === 'suspended') audioContext.resume();
      return;
    }
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (AudioCtor) audioContext = new AudioCtor();
  }

  // --- Lo-fi biome music -------------------------------------------------
  const MUSIC_THEMES = {
    jungle: {
      bpm: 84, root: 196, scale: [0, 2, 4, 7, 9], bassWave: 'triangle', pluckWave: 'triangle',
      padWave: 'sine', filter: 1900, padSemis: [0, 4, 7, 11], kick: [0, 8], hatEvery: 2, hatOff: 1,
      pluckChance: 0.42, bass: [0, -1, 0, -1, 7, -1, 5, -1, 0, -1, 0, -1, 3, -1, 5, -1],
    },
    springs: {
      bpm: 66, root: 220, scale: [0, 2, 4, 7, 9], bassWave: 'sine', pluckWave: 'sine',
      padWave: 'sine', filter: 1450, padSemis: [0, 4, 7, 14], kick: [0], hatEvery: 4, hatOff: 2,
      pluckChance: 0.3, bass: [0, -1, -1, -1, 5, -1, -1, -1, 7, -1, -1, -1, 4, -1, -1, -1],
    },
    cave: {
      bpm: 74, root: 174.6, scale: [0, 3, 5, 7, 10], bassWave: 'triangle', pluckWave: 'sine',
      padWave: 'triangle', filter: 1150, padSemis: [0, 3, 7, 10], kick: [0, 10], hatEvery: 4, hatOff: 3,
      pluckChance: 0.34, bass: [0, -1, 0, -1, 3, -1, -1, -1, 0, -1, 0, -1, 10, -1, -1, -1],
    },
    city: {
      bpm: 96, root: 233.1, scale: [0, 3, 5, 7, 10], bassWave: 'sawtooth', pluckWave: 'square',
      padWave: 'sawtooth', filter: 2300, padSemis: [0, 3, 7, 12], kick: [0, 4, 8, 12], hatEvery: 2, hatOff: 1,
      pluckChance: 0.5, bass: [0, 0, -1, 0, -1, 0, -1, -1, 3, 3, -1, 3, 5, -1, 7, -1],
    },
  };

  const music = {
    enabled: safeReadString('cappy_music', 'on') === 'on',
    theme: 'jungle',
    timer: null,
    nextTime: 0,
    step: 0,
    chain: null,
    noiseBuffer: null,
  };

  function getNoiseBuffer() {
    if (music.noiseBuffer || !audioContext) return music.noiseBuffer;
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    music.noiseBuffer = buffer;
    return buffer;
  }

  function ensureMusicChain() {
    if (music.chain || !audioContext) return;
    const gain = audioContext.createGain();
    gain.gain.value = 0.5;
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = MUSIC_THEMES[music.theme].filter;
    filter.Q.value = 0.65;
    filter.connect(gain);
    gain.connect(audioContext.destination);

    // Faint vinyl hiss keeps the loops feeling lo-fi rather than synthetic.
    const hiss = audioContext.createBufferSource();
    hiss.buffer = getNoiseBuffer();
    hiss.loop = true;
    const hissFilter = audioContext.createBiquadFilter();
    hissFilter.type = 'highpass';
    hissFilter.frequency.value = 3600;
    const hissGain = audioContext.createGain();
    hissGain.gain.value = 0;
    hiss.connect(hissFilter);
    hissFilter.connect(hissGain);
    hissGain.connect(gain);
    hiss.start();
    music.chain = { gain: gain, filter: filter, hissGain: hissGain };
  }

  function setMusicTheme(theme) {
    if (!MUSIC_THEMES[theme]) return;
    music.theme = theme;
    if (music.chain && audioContext) {
      music.chain.filter.frequency.setTargetAtTime(MUSIC_THEMES[theme].filter, audioContext.currentTime, 0.4);
    }
  }

  function musicVoice(wave, freq, when, dur, peak, attack) {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(freq, when);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(peak, when + (attack || 0.015));
    gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    oscillator.connect(gain);
    gain.connect(music.chain.filter);
    oscillator.start(when);
    oscillator.stop(when + dur + 0.03);
  }

  function musicHat(when, strong) {
    const source = audioContext.createBufferSource();
    source.buffer = getNoiseBuffer();
    const filter = audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 6200;
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(strong ? 0.09 : 0.05, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.045);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(music.chain.gain);
    source.start(when, Math.random(), 0.06);
  }

  function playMusicStep(step, when) {
    const theme = MUSIC_THEMES[music.theme];
    const beat16 = step % 16;

    if (theme.kick.indexOf(beat16) !== -1) {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(118, when);
      oscillator.frequency.exponentialRampToValueAtTime(46, when + 0.13);
      gain.gain.setValueAtTime(0.42, when);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.16);
      oscillator.connect(gain);
      gain.connect(music.chain.gain);
      oscillator.start(when);
      oscillator.stop(when + 0.2);
    }

    if (beat16 % theme.hatEvery === theme.hatOff % theme.hatEvery) {
      musicHat(when, beat16 % 4 === theme.hatOff);
    }

    const bassSemi = theme.bass[beat16];
    if (bassSemi >= 0) {
      musicVoice(theme.bassWave, (theme.root / 2) * Math.pow(2, bassSemi / 12), when, 0.24, 0.3);
    }

    if (beat16 === 0) {
      theme.padSemis.forEach(function (semi) {
        musicVoice(theme.padWave, theme.root * Math.pow(2, semi / 12), when, 1.9, 0.045, 0.5);
      });
    }

    if (beat16 % 2 === 0 && seeded(step * 7.31 + theme.bpm) < theme.pluckChance) {
      const note = theme.scale[Math.floor(seeded(step * 3.7) * theme.scale.length)]
        + 12 * (seeded(step * 1.31) > 0.6 ? 2 : 1);
      musicVoice(theme.pluckWave, theme.root * Math.pow(2, note / 12), when, 0.2, 0.085);
    }
  }

  function scheduleMusic() {
    if (!audioContext || !music.chain) return;
    const stepLength = 60 / MUSIC_THEMES[music.theme].bpm / 4;
    while (music.nextTime < audioContext.currentTime + 0.28) {
      playMusicStep(music.step, music.nextTime);
      music.nextTime += stepLength;
      music.step = (music.step + 1) % 64;
    }
  }

  function startMusic() {
    if (!music.enabled || music.timer || !audioContext) return;
    ensureMusicChain();
    if (!music.chain) return;
    music.chain.hissGain.gain.setTargetAtTime(0.008, audioContext.currentTime, 0.5);
    music.chain.gain.gain.setTargetAtTime(0.5, audioContext.currentTime, 0.3);
    music.nextTime = audioContext.currentTime + 0.1;
    music.step = 0;
    music.timer = window.setInterval(scheduleMusic, 90);
  }

  function stopMusic() {
    if (music.timer) {
      window.clearInterval(music.timer);
      music.timer = null;
    }
    if (music.chain && audioContext) {
      music.chain.gain.gain.setTargetAtTime(0.0001, audioContext.currentTime, 0.25);
      music.chain.hissGain.gain.setTargetAtTime(0, audioContext.currentTime, 0.25);
    }
  }

  function toggleMusic() {
    music.enabled = !music.enabled;
    safeWriteString('cappy_music', music.enabled ? 'on' : 'off');
    syncMusicButton();
    if (!music.enabled) stopMusic();
    else if (state.mode === GAME.RUNNING) {
      initAudio();
      startMusic();
    }
    showToast(music.enabled ? 'MUSIC ON' : 'MUSIC OFF');
  }

  function syncMusicButton() {
    if (!dom.musicButton) return;
    dom.musicButton.setAttribute('aria-pressed', String(music.enabled));
    dom.musicButton.classList.toggle('muted', !music.enabled);
  }

  function playSound(type) {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    const settings = {
      coin: ['sine', 740, 1160, 0.14, 0.09],
      jump: ['triangle', 180, 520, 0.22, 0.12],
      land: ['sine', 120, 82, 0.09, 0.05],
      slide: ['sawtooth', 160, 68, 0.18, 0.055],
      lane: ['triangle', 240, 310, 0.08, 0.035],
      blocked: ['square', 115, 92, 0.07, 0.025],
      warning: ['square', 420, 420, 0.12, 0.055],
      turn: ['triangle', 260, 820, 0.32, 0.12],
      start: ['triangle', 160, 680, 0.38, 0.1],
      shield: ['sine', 330, 990, 0.38, 0.12],
      shieldBreak: ['sawtooth', 640, 110, 0.32, 0.08],
      fruitPickup: ['triangle', 360, 980, 0.24, 0.09],
      superchargePickup: ['sine', 520, 1480, 0.34, 0.11],
      supercharge: ['sawtooth', 210, 1320, 0.38, 0.08],
      superchargeHit: ['square', 860, 190, 0.2, 0.06],
      boost: ['sawtooth', 170, 760, 0.24, 0.06],
      boostEnd: ['triangle', 520, 120, 0.18, 0.04],
      stage: ['triangle', 210, 940, 0.42, 0.09],
      crash: ['sawtooth', 180, 48, 0.48, 0.12],
      magnet: ['sine', 480, 1240, 0.2, 0.09],
      star: ['triangle', 620, 1560, 0.3, 0.1],
      slowmo: ['sine', 880, 160, 0.42, 0.09],
      qte: ['triangle', 300, 1040, 0.26, 0.11],
    };
    const s = settings[type] || settings.lane;
    oscillator.type = s[0];
    oscillator.frequency.setValueAtTime(s[1], now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, s[2]), now + s[3]);
    gain.gain.setValueAtTime(s[4], now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + s[3]);
    oscillator.start(now);
    oscillator.stop(now + s[3]);
  }

  function resize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.fov = window.innerWidth < 600 ? 67 : 58;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function showFatalError(message) {
    dom.toast.textContent = message;
    dom.toast.classList.remove('hidden');
  }

  function laneX(lane) {
    return (lane - 1) * CONFIG.laneWidth;
  }

  function seeded(value) {
    const x = Math.sin(value * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  function mulberry32(seed) {
    return function () {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  if (['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)) {
    window.CappyRunner = {
      debugState: function () {
        return {
          mode: state.mode,
          distance: Math.floor(state.distance),
          score: state.score,
          coins: state.coins,
          speed: Number(state.speed.toFixed(2)),
          lane: player.lane,
          pose: player.currentPose,
          jumping: player.jumping,
          sliding: player.sliding,
          shield: Number(state.shield.toFixed(2)),
          boostCharge: Number(state.boostCharge.toFixed(2)),
          boosting: state.boosting,
          superchargeInventory: state.superchargeInventory,
          superchargeTimer: Number(state.superchargeTimer.toFixed(2)),
          magnetTimer: Number(state.magnetTimer.toFixed(2)),
          starTimer: Number(state.starTimer.toFixed(2)),
          slowmoTimer: Number(state.slowmoTimer.toFixed(2)),
          stage: state.stageIndex,
          stageName: STAGES[state.stageIndex].name,
          theme: STAGES[state.stageIndex].theme,
          difficulty: STAGES[state.stageIndex].difficulty,
          turnGap: STAGES[state.stageIndex].turnGap,
          activeSegments: segments.length,
          activeTurn: state.activeTurn ? state.activeTurn.direction : null,
          turning: Boolean(state.turnAnimation),
          crashReason: state.crashReason,
          crashStartZ: Number(state.crashStartZ.toFixed(2)),
          lastTurnSerial: state.lastTurnSerial,
          heading: state.heading,
          threatLane: state.threat ? state.threat.lane : null,
          skin: player.skin,
          musicEnabled: music.enabled,
          musicPlaying: Boolean(music.timer),
          musicTheme: music.theme,
          stats: JSON.parse(JSON.stringify(stats)),
          activeMissions: activeMissions().map(function (mission) {
            return { id: mission.id, progress: Math.min(stats[mission.stat], mission.target), target: mission.target };
          }),
        };
      },
      actions: {
        start: startRun,
        left: function () { handleLateral(-1); },
        right: function () { handleLateral(1); },
        jump: jump,
        slide: slide,
        boostStart: startBoost,
        boostStop: stopBoost,
        activateSupercharge: activateSupercharge,
        grantFruit: function () {
          if (state.mode === GAME.RUNNING) collectPickup({ type: 'FRUIT', collected: false, mesh: { visible: true } }, new THREE.Vector3(player.x, 0.9, 0));
        },
        grantSupercharge: function () {
          if (state.mode === GAME.RUNNING) collectPickup({ type: 'SUPERCHARGE', collected: false, mesh: { visible: true } }, new THREE.Vector3(player.x, 0.9, 0));
        },
        grantPower: function (type) {
          if (state.mode === GAME.RUNNING && ['MAGNET', 'STAR', 'SLOWMO', 'SHIELD'].includes(type)) {
            collectPickup({ type: type, collected: false, mesh: { visible: true } }, new THREE.Vector3(player.x, 0.9, 0));
          }
        },
        spawnQte: function (kind) {
          if (state.mode === GAME.RUNNING && segments.length > 1 && (kind === 'leap' || kind === 'duck')) addQteGate(segments[1], kind);
        },
        pause: pauseGame,
        resume: resumeGame,
        forceTurn: function (direction) {
          if (state.mode !== GAME.RUNNING) return;
          state.activeTurn = { direction: direction < 0 ? -1 : 1, resolved: false, prompted: true, root: null };
          showEventPrompt(state.activeTurn.direction < 0 ? "↰" : "↱", state.activeTurn.direction < 0 ? "LEFT TURN" : "RIGHT TURN");
        },
        forceThreat: function () {
          if (state.mode === GAME.RUNNING && !state.threat) spawnThreat();
        },
        forceCrash: function () { crash('debug'); },
        setDistance: function (value) {
          if (state.mode !== GAME.RUNNING || !Number.isFinite(value)) return;
          state.distance = Math.max(0, value);
          updateStageProgress();
          updateHud();
        },
        openControls: openControls,
        closeControls: closeControls,
        setSkin: applySkin,
        toggleMusic: toggleMusic,
      },
    };
  }

  window.addEventListener('DOMContentLoaded', init);
})();
