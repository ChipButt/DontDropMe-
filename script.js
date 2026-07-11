const CONFIG = {
  startingDiameter: 64,
  minDiameter: 4,
  gravity: 500,
  maxVelocity: 960,
  minImpulse: 300,
  maxImpulse: 980,
  shrinkEveryHits: 3,
  shrinkMultiplier: 0.92,
  difficultySpeedMultiplier: 1.04,
  powerupMinSpawnSeconds: 8,
  powerupMaxSpawnSeconds: 15,
  powerupHoldSeconds: 0,
  powerupGrowMultiplier: 1.35,
  baseScore: 100,

  maxDeltaSeconds: 0.032,
  maxDevicePixelRatio: 2,
  ballStartXRatio: 0.5,
  ballStartYRatio: 0.28,
  centerTapDeadzoneRatio: 0.28,
  tapAssistPadding: 30,
  tapAssistMultiplier: 2,
  topTapZoneRatio: 0.38,
  upwardImpulseBonus: 210,
  nonTopUpwardLift: 360,
  downwardImpulseMultiplier: 0.22,
  rapidTapGraceSeconds: 0.24,
  rapidTapAssistRadius: 96,
  rapidTapMinBelowCenterRatio: 0.1,

  floorInset: 18,
  floorGlowHeight: 92,
  wallBounce: 0.78,
  ceilingBounce: 0.55,
  squashDuration: 0.16,
  squashStretchRatio: 0.18,
  squashSquashRatio: 0.1,

  slowDurationSeconds: 7,
  slowGravityMultiplier: 0.52,
  slowVelocityMultiplier: 0.78,
  multiBallCount: 3,
  multiBallDiameterMultiplier: 0.72,
  multiBallCarryVelocityMultiplier: 0.45,
  multiBallSpreadVelocityX: 340,
  multiBallLaunchVelocityY: -620,
  multiBallSpawnSeparationRatio: 0.55,

  collectibleRadius: 16,
  phasingGemRadius: 18,
  powerupRadius: 22,
  collectibleTopGap: 126,
  collectibleFloorGap: 156,
  collectibleSideGap: 22,
  goldGemScore: 650,
  phasingGemScore: 1100,
  collectibleBounceImpulse: 175,
  collectibleUpwardNudge: 90,
  powerupBounceImpulse: 230,
  powerupLifetimeSeconds: 11,
  phasingGemPulseSpeed: 2.35,
  phasingCollisionOpacity: 0.5,

  blackHoleTopGap: 112,
  blackHoleRadius: 34,
  blackHoleRampSeconds: 0.8,
  blackHoleFadeSeconds: 0.9,
  blackHolePositions: [0.16, 0.38, 0.62, 0.84],

  portalRadius: 28,
  portalCooldownSeconds: 1.25,
  portalWarningSeconds: 1,
  portalAnchors: [
    { side: "left", x: 0, y: 0.28 },
    { side: "left", x: 0, y: 0.55 },
    { side: "right", x: 1, y: 0.32 },
    { side: "right", x: 1, y: 0.62 },
    { side: "top", x: 0.25, y: 0 },
    { side: "top", x: 0.5, y: 0 },
    { side: "top", x: 0.75, y: 0 }
  ],

  floatingLabelDuration: 0.72,
  floatingLabelRiseSpeed: 58,
  labelOffsetYRatio: 1.15,
  labelTopSafeY: 132,
  labelSideSafeX: 22,
  labelStackSlots: 3,
  labelStackOffsetX: 34,
  labelStackOffsetY: 24,
  labelFontMin: 12,
  labelFontRatio: 0.34,
  labelFontMax: 22,

  shadowHeightRangeRatio: 0.68,
  shadowMinAlpha: 0.045,
  shadowMaxAlpha: 0.28,
  shadowMinWidthRatio: 1.15,
  shadowMaxWidthRatio: 2.35,
  shadowMinHeightRatio: 0.13,
  shadowMaxHeightRatio: 0.34,
  sphereLightXRatio: -0.38,
  sphereLightYRatio: -0.42,
  sphereLightRadiusRatio: 0.08,
  sphereShadeRadiusRatio: 1,
  sphereHighlightXRatio: -0.34,
  sphereHighlightYRatio: -0.4,
  sphereHighlightRadiusXRatio: 0.26,
  sphereHighlightRadiusYRatio: 0.16,
  sphereHighlightAlpha: 0.58,
  sphereEdgeLineRatio: 0.12,
  sphereEdgeStartAngle: -0.08,
  sphereEdgeEndAngle: 0.68,
  floorLineAlpha: 0.72,
  floorLineWidth: 2,
  backgroundDotCount: 38,
  backgroundDotMinRadius: 0.7,
  backgroundDotMaxRadius: 2.1,
  backgroundDotAlpha: 0.32
};

const { LEVELS, TUTORIALS, COLLECTIBLE_TYPES, POWERUP_TYPES, COSMETICS, StorageManager } = window;

const POWERUP_STYLES = {
  [POWERUP_TYPES.slow]: {
    outer: "rgba(76, 217, 255, 0.24)",
    inner: "#39c9ff",
    glow: "rgba(76, 217, 255, 0.72)",
    ring: "rgba(221, 250, 255, 0.82)",
    text: "SLOW",
    ink: "#031522"
  },
  [POWERUP_TYPES.grow]: {
    outer: "rgba(20, 223, 139, 0.24)",
    inner: "#19dd8c",
    glow: "rgba(79, 255, 174, 0.68)",
    ring: "rgba(228, 255, 240, 0.82)",
    text: "+",
    ink: "#032011"
  },
  [POWERUP_TYPES.multi]: {
    outer: "rgba(241, 92, 255, 0.24)",
    inner: "#f061ff",
    glow: "rgba(241, 92, 255, 0.7)",
    ring: "rgba(255, 226, 255, 0.86)",
    text: "x3",
    ink: "#25032b"
  }
};

const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

const hud = document.querySelector("#hud");
const runBanner = document.querySelector("#runBanner");
const levelValue = document.querySelector("#levelValue");
const scoreValue = document.querySelector("#scoreValue");
const bestValue = document.querySelector("#bestValue");
const hitsValue = document.querySelector("#hitsValue");
const sizeValue = document.querySelector("#sizeValue");
const runTitle = document.querySelector("#runTitle");
const runGoal = document.querySelector("#runGoal");

const screens = {
  home: document.querySelector("#homeScreen"),
  map: document.querySelector("#mapScreen"),
  tutorial: document.querySelector("#tutorialScreen"),
  results: document.querySelector("#resultsScreen"),
  shop: document.querySelector("#shopScreen"),
  help: document.querySelector("#helpScreen")
};

const homeCoins = document.querySelector("#homeCoins");
const shopCoins = document.querySelector("#shopCoins");
const playButton = document.querySelector("#playButton");
const mapButton = document.querySelector("#mapButton");
const shopButton = document.querySelector("#shopButton");
const helpButton = document.querySelector("#helpButton");
const levelMap = document.querySelector("#levelMap");
const tutorialTitle = document.querySelector("#tutorialTitle");
const tutorialBody = document.querySelector("#tutorialBody");
const tutorialStartButton = document.querySelector("#tutorialStartButton");
const resultsLevelLabel = document.querySelector("#resultsLevelLabel");
const resultsTitle = document.querySelector("#resultsTitle");
const resultsStars = document.querySelector("#resultsStars");
const resultsStats = document.querySelector("#resultsStats");
const retryButton = document.querySelector("#retryButton");
const nextLevelButton = document.querySelector("#nextLevelButton");
const shopLockMessage = document.querySelector("#shopLockMessage");
const shopContent = document.querySelector("#shopContent");

let saveData = StorageManager.loadSave();
let viewWidth = 0;
let viewHeight = 0;
let deviceScale = 1;
let gameState = "menu";
let lastFrameTime = 0;
let elapsedSeconds = 0;
let levelElapsedSeconds = 0;
let selectedLevelId = saveData.highestUnlockedLevel;
let currentLevel = LEVELS[0];
let pendingTutorialLevel = null;
let lastResult = null;

let score = 0;
let successfulHits = 0;
let smallestDiameterReached = CONFIG.startingDiameter;
let difficultyFactor = 1;
let slowTimer = 0;
let currentGravity = CONFIG.gravity;
let nextBallId = 1;
let balls = [];
let collectibles = [];
let powerups = [];
let blackHole = null;
let portal = null;
let spawnTimers = {};
let floatingLabels = [];
let backgroundDots = [];
let recentTapAssist = null;

const ball = createBallObject(0);
balls = [ball];

function createBallObject(id) {
  return {
    id,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    diameter: CONFIG.startingDiameter,
    radius: CONFIG.startingDiameter / 2,
    squashTimer: 0,
    squashAngle: 0,
    active: true,
    inTransit: false,
    portalCooldown: 0
  };
}

function resizeCanvas() {
  const bounds = canvas.getBoundingClientRect();
  viewWidth = bounds.width;
  viewHeight = bounds.height;
  deviceScale = Math.min(window.devicePixelRatio || 1, CONFIG.maxDevicePixelRatio);
  canvas.width = Math.round(viewWidth * deviceScale);
  canvas.height = Math.round(viewHeight * deviceScale);
  ctx.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
  createBackgroundDots();
  clampAllBallsInsidePlayfield();
  updateHud();
}

function createBackgroundDots() {
  backgroundDots = Array.from({ length: CONFIG.backgroundDotCount }, (_, index) => {
    const wave = Math.sin(index * 999);
    const drift = Math.cos(index * 427);
    const radiusRange = CONFIG.backgroundDotMaxRadius - CONFIG.backgroundDotMinRadius;

    return {
      xRatio: (wave + 1) / 2,
      yRatio: (drift + 1) / 2,
      radius: CONFIG.backgroundDotMinRadius + ((Math.sin(index * 313) + 1) / 2) * radiusRange
    };
  });
}

function showScreen(name) {
  gameState = name === "play" ? "playing" : "menu";

  Object.entries(screens).forEach(([screenName, element]) => {
    element.classList.toggle("screen--hidden", screenName !== name);
  });

  hud.classList.toggle("hud--hidden", gameState !== "playing");
  runBanner.classList.toggle("run-banner--hidden", gameState !== "playing");
}

function renderHome() {
  homeCoins.textContent = formatNumber(saveData.totalCoins);
  playButton.textContent = `Play Level ${saveData.highestUnlockedLevel}`;
  shopButton.textContent = saveData.shopUnlocked ? "Shop" : "Shop (Locked)";
  shopButton.disabled = !saveData.shopUnlocked;
  showScreen("home");
}

function renderLevelMap() {
  const currentLevelId = clamp(saveData.highestUnlockedLevel, 1, LEVELS.length);
  const trailSteps = LEVELS.map((level, index) => {
    const state = level.id < currentLevelId ? "visited" : level.id === currentLevelId ? "current" : "locked";
    const rowEndClass = level.id % 5 === 0 ? " map-trail-step--row-end" : "";

    return `<span class="map-trail-step map-trail-step--${state}${rowEndClass}" style="--trail-index: ${index};"></span>`;
  }).join("");

  const levelNodes = LEVELS.map((level) => {
    const unlocked = level.id <= saveData.highestUnlockedLevel;
    const stars = StorageManager.getBestStars(saveData, level.id);
    const isCurrent = level.id === currentLevelId;
    const classes = [
      "level-node",
      unlocked ? "level-node--unlocked" : "level-node--locked",
      isCurrent ? "level-node--current" : ""
    ].filter(Boolean).join(" ");
    const starText = stars > 0 ? "★".repeat(stars) : "";

    return `
      <button class="${classes}" type="button" data-level-id="${level.id}" ${unlocked ? "" : "disabled"}>
        ${isCurrent ? `
          <span class="map-player-piece" aria-hidden="true">
            <span class="map-player-piece__shadow"></span>
            <span class="map-player-piece__ball"></span>
          </span>
        ` : ""}
        <span class="level-node__number">${level.id}</span>
        <span class="level-stars">${starText}</span>
      </button>
    `;
  }).join("");

  levelMap.innerHTML = `
    <div class="map-scene">
      <div class="map-scenery" aria-hidden="true">
        <span class="map-cloud map-cloud--one"></span>
        <span class="map-cloud map-cloud--two"></span>
        <span class="map-hill map-hill--back"></span>
        <span class="map-hill map-hill--front"></span>
      </div>
      <div class="map-trail" aria-hidden="true">${trailSteps}</div>
      <div class="map-path">${levelNodes}</div>
    </div>
  `;
  showScreen("map");
}

function renderTutorial(level) {
  const tutorial = TUTORIALS[level.tutorialKey];
  pendingTutorialLevel = level;
  tutorialTitle.textContent = tutorial.title;
  tutorialBody.innerHTML = tutorial.lines.map((line) => `<li>${line}</li>`).join("");
  showScreen("tutorial");
}

function renderResults(result) {
  const level = result.level;
  const nextLevel = LEVELS[level.id] || null;
  const previousBest = result.previousBest;
  const bestStars = StorageManager.getBestStars(saveData, level.id);

  resultsLevelLabel.textContent = `Level ${level.id}`;
  resultsTitle.textContent = level.title;
  resultsStars.textContent = result.stars > 0 ? "★".repeat(result.stars) : "No stars";
  resultsStats.innerHTML = createResultsRows([
    ["Final score", formatNumber(result.score)],
    ["Previous best", formatNumber(previousBest)],
    ["Best score", formatNumber(StorageManager.getBestScore(saveData, level.id))],
    ["Best stars", bestStars > 0 ? "★".repeat(bestStars) : "0"],
    ["Hits", formatNumber(result.hits)],
    ["Smallest size", formatDiameter(result.smallestDiameter)],
    ["Coins earned", result.coinsEarned > 0 ? `+${formatNumber(result.coinsEarned)}` : "0"],
    ["Total coins", formatNumber(saveData.totalCoins)]
  ]);

  nextLevelButton.disabled = !(nextLevel && nextLevel.id <= saveData.highestUnlockedLevel);
  lastResult = result;
  showScreen("results");
}

function createResultsRows(rows) {
  return rows.map(([label, value]) => `
    <div>
      <dt>${label}</dt>
      <dd>${value}</dd>
    </div>
  `).join("");
}

function renderShop() {
  shopCoins.textContent = formatNumber(saveData.totalCoins);
  shopLockMessage.textContent = saveData.shopUnlocked
    ? "Cosmetics change visuals only. They never alter physics, score, or level difficulty."
    : "Pass Level 10 with at least 1 star to unlock coins and the cosmetic shop.";

  shopContent.innerHTML = saveData.shopUnlocked ? `
    ${renderShopSection("Ball Skins", "ball", COSMETICS.BALL_SKINS)}
    ${renderShopSection("Backgrounds", "background", COSMETICS.BACKGROUNDS)}
  ` : "";
  showScreen("shop");
}

function renderShopSection(title, kind, items) {
  const ownedKey = kind === "ball" ? "ownedBallSkins" : "ownedBackgrounds";
  const equippedKey = kind === "ball" ? "equippedBallSkin" : "equippedBackground";
  const visibleItems = items.filter((item) => !item.hidden || saveData.highestUnlockedLevel >= item.unlockLevel);

  return `
    <section class="shop-section">
      <h3>${title}</h3>
      <div class="shop-grid">
        ${visibleItems.map((item) => renderShopItem(kind, item, ownedKey, equippedKey)).join("")}
      </div>
    </section>
  `;
}

function renderShopItem(kind, item, ownedKey, equippedKey) {
  const owned = saveData[ownedKey].includes(item.id);
  const equipped = saveData[equippedKey] === item.id;
  const levelLocked = saveData.highestUnlockedLevel < item.unlockLevel;
  const canBuy = !owned && !levelLocked && saveData.totalCoins >= item.cost;
  const actionLabel = equipped
    ? "Equipped"
    : owned
      ? "Equip"
      : levelLocked
        ? `Level ${item.unlockLevel}`
        : `${formatNumber(item.cost)} coins`;
  const action = owned ? "equip" : "buy";

  return `
    <article class="shop-item ${equipped ? "shop-item--equipped" : ""}">
      <span class="shop-item__name">${item.name}</span>
      <span class="shop-item__meta">${item.cost === 0 ? "Owned" : `${formatNumber(item.cost)} coins`}</span>
      <button
        class="shop-item__action"
        type="button"
        data-shop-kind="${kind}"
        data-shop-action="${action}"
        data-shop-id="${item.id}"
        ${equipped || levelLocked || (!owned && !canBuy) ? "disabled" : ""}
      >${actionLabel}</button>
    </article>
  `;
}

function requestStartLevel(levelId) {
  const level = LEVELS[levelId - 1];

  if (!level || level.id > saveData.highestUnlockedLevel) {
    return;
  }

  selectedLevelId = level.id;

  if (level.tutorialKey && !StorageManager.isTutorialSeen(saveData, level.tutorialKey)) {
    renderTutorial(level);
    return;
  }

  beginLevelRun(level);
}

function beginLevelRun(level) {
  currentLevel = level;
  resetRunValues(level);
  updateHud();
  showScreen("play");
}

function resetRunValues(level) {
  score = 0;
  successfulHits = 0;
  smallestDiameterReached = CONFIG.startingDiameter;
  difficultyFactor = 1;
  slowTimer = 0;
  levelElapsedSeconds = 0;
  floatingLabels = [];
  recentTapAssist = null;
  collectibles = [];
  powerups = [];
  blackHole = null;
  portal = null;
  nextBallId = 1;
  spawnTimers = createSpawnTimers(level);

  resetBallObject(ball, {
    x: viewWidth * CONFIG.ballStartXRatio,
    y: viewHeight * CONFIG.ballStartYRatio,
    vx: 0,
    vy: 0,
    diameter: CONFIG.startingDiameter
  });
  balls = [ball];
  recalculateGravity();
}

function createSpawnTimers(level) {
  const timers = {};

  Object.entries(level.spawnRates).forEach(([type, rate]) => {
    if (rate) {
      timers[type] = randomRange(rate.min * 0.55, rate.max * 0.85);
    }
  });

  return timers;
}

function resetBallObject(targetBall, values) {
  targetBall.x = values.x;
  targetBall.y = values.y;
  targetBall.vx = values.vx;
  targetBall.vy = values.vy;
  targetBall.squashTimer = 0;
  targetBall.squashAngle = 0;
  targetBall.active = true;
  targetBall.inTransit = false;
  targetBall.portalCooldown = 0;
  setBallDiameter(values.diameter, targetBall);
  clampBallInsidePlayfield(targetBall);
}

function createBall(values) {
  const newBall = createBallObject(nextBallId);
  nextBallId += 1;
  resetBallObject(newBall, values);
  return newBall;
}

function setBallDiameter(diameter, targetBall = getPrimaryBall()) {
  targetBall.diameter = clamp(diameter, CONFIG.minDiameter, CONFIG.startingDiameter);
  targetBall.radius = targetBall.diameter / 2;
  smallestDiameterReached = Math.min(smallestDiameterReached, targetBall.diameter);
}

function update(timestamp) {
  if (!lastFrameTime) {
    lastFrameTime = timestamp;
  }

  const rawDelta = (timestamp - lastFrameTime) / 1000;
  const deltaSeconds = Math.min(rawDelta, CONFIG.maxDeltaSeconds);
  lastFrameTime = timestamp;
  elapsedSeconds += deltaSeconds;

  if (gameState === "playing") {
    levelElapsedSeconds += deltaSeconds;
    updateSlowTimer(deltaSeconds);
    updateSpawners(deltaSeconds);
    updateBlackHole(deltaSeconds);
    updatePortal(deltaSeconds);
    updateBalls(deltaSeconds);
    updateCollectibles(deltaSeconds);
    updatePowerups(deltaSeconds);
    checkEntityCollisions();
    updateHud();
  }

  updateFloatingLabels(deltaSeconds);
  updateSquash(deltaSeconds);
  draw();
  requestAnimationFrame(update);
}

function updateSlowTimer(deltaSeconds) {
  slowTimer = Math.max(0, slowTimer - deltaSeconds);
  recalculateGravity();
}

function updateSpawners(deltaSeconds) {
  Object.entries(spawnTimers).forEach(([type, timeLeft]) => {
    const nextTime = timeLeft - deltaSeconds;

    if (nextTime > 0) {
      spawnTimers[type] = nextTime;
      return;
    }

    spawnByType(type);
    const rate = currentLevel.spawnRates[type];
    spawnTimers[type] = rate ? randomRange(rate.min, rate.max) : Number.POSITIVE_INFINITY;
  });
}

function spawnByType(type) {
  if (type === COLLECTIBLE_TYPES.goldGem && countEntities(collectibles, COLLECTIBLE_TYPES.goldGem) < 2) {
    spawnGem(COLLECTIBLE_TYPES.goldGem);
  } else if (type === COLLECTIBLE_TYPES.phasingGem && countEntities(collectibles, COLLECTIBLE_TYPES.phasingGem) < 1) {
    spawnGem(COLLECTIBLE_TYPES.phasingGem);
  } else if (type === POWERUP_TYPES.slow || type === POWERUP_TYPES.grow || type === POWERUP_TYPES.multi) {
    if (powerups.length < 2) {
      spawnPowerup(type);
    }
  } else if (type === "blackHole" && !blackHole) {
    spawnBlackHole();
  } else if (type === "portals" && !portal) {
    spawnPortal();
  }
}

function countEntities(entities, type) {
  return entities.filter((entity) => entity.type === type).length;
}

function spawnGem(type) {
  const radius = type === COLLECTIBLE_TYPES.phasingGem ? CONFIG.phasingGemRadius : CONFIG.collectibleRadius;
  const point = getRandomPlayfieldPoint(radius);
  const rate = currentLevel.spawnRates[type] || {};

  collectibles.push({
    type,
    x: point.x,
    y: point.y,
    radius,
    age: 0,
    lifetime: rate.lifetime || 7,
    collected: false
  });
}

function spawnPowerup(type) {
  const point = getRandomPlayfieldPoint(CONFIG.powerupRadius);

  powerups.push({
    type,
    x: point.x,
    y: point.y,
    radius: CONFIG.powerupRadius,
    age: 0,
    lifetime: CONFIG.powerupLifetimeSeconds,
    collected: false
  });
}

function spawnBlackHole() {
  const rate = currentLevel.spawnRates.blackHole;
  const xRatio = CONFIG.blackHolePositions[Math.floor(Math.random() * CONFIG.blackHolePositions.length)];
  blackHole = {
    x: viewWidth * xRatio,
    y: Math.max(CONFIG.blackHoleTopGap, viewHeight * 0.13),
    radius: CONFIG.blackHoleRadius,
    age: 0,
    activeSeconds: rate.duration,
    pullMultiplier: rate.pullMultiplier,
    strength: 0
  };
}

function spawnPortal() {
  const entryAnchor = getRandomPortalAnchor();
  let exitAnchor = getRandomPortalAnchor();
  let safety = 0;

  while (exitAnchor === entryAnchor && safety < 10) {
    exitAnchor = getRandomPortalAnchor();
    safety += 1;
  }

  portal = {
    entry: resolvePortalAnchor(entryAnchor),
    exit: resolvePortalAnchor(exitAnchor),
    radius: CONFIG.portalRadius,
    state: "entry",
    exitTimer: CONFIG.portalWarningSeconds,
    transitBallId: null
  };
}

function getRandomPlayfieldPoint(radius) {
  const minX = radius + CONFIG.collectibleSideGap;
  const maxX = Math.max(minX, viewWidth - radius - CONFIG.collectibleSideGap);
  const minY = CONFIG.collectibleTopGap;
  const maxY = Math.max(minY, getFloorY() - CONFIG.collectibleFloorGap);

  return {
    x: randomRange(minX, maxX),
    y: randomRange(minY, maxY)
  };
}

function getRandomPortalAnchor() {
  return CONFIG.portalAnchors[Math.floor(Math.random() * CONFIG.portalAnchors.length)];
}

function resolvePortalAnchor(anchor) {
  const inset = CONFIG.portalRadius + 2;
  let x = anchor.x * viewWidth;
  let y = anchor.y * viewHeight;

  if (anchor.side === "left") {
    x = inset;
  } else if (anchor.side === "right") {
    x = viewWidth - inset;
  } else if (anchor.side === "top") {
    y = Math.max(inset, CONFIG.collectibleTopGap - 50);
  }

  return {
    ...anchor,
    x: clamp(x, inset, viewWidth - inset),
    y: clamp(y, inset, getFloorY() - inset),
    radius: CONFIG.portalRadius
  };
}

function updateBlackHole(deltaSeconds) {
  if (!blackHole) {
    return;
  }

  blackHole.age += deltaSeconds;
  const ramp = CONFIG.blackHoleRampSeconds;
  const activeEnd = ramp + blackHole.activeSeconds;
  const life = activeEnd + CONFIG.blackHoleFadeSeconds;

  if (blackHole.age < ramp) {
    blackHole.strength = blackHole.age / ramp;
  } else if (blackHole.age < activeEnd) {
    blackHole.strength = 1;
  } else {
    blackHole.strength = 1 - clamp((blackHole.age - activeEnd) / CONFIG.blackHoleFadeSeconds, 0, 1);
  }

  if (blackHole.age >= life) {
    blackHole = null;
  }
}

function updatePortal(deltaSeconds) {
  if (!portal || portal.state !== "exit") {
    return;
  }

  portal.exitTimer -= deltaSeconds;

  if (portal.exitTimer > 0) {
    return;
  }

  const transitingBall = balls.find((activeBall) => activeBall.id === portal.transitBallId);

  if (transitingBall) {
    releaseBallFromPortal(transitingBall, portal.exit);
  }

  portal = null;
}

function updateBalls(deltaSeconds) {
  let lostAnyBall = false;

  for (const activeBall of getActiveBalls()) {
    activeBall.portalCooldown = Math.max(0, activeBall.portalCooldown - deltaSeconds);

    if (activeBall.inTransit) {
      continue;
    }

    updateSingleBall(activeBall, deltaSeconds);

    if (activeBall.y + activeBall.radius >= getFloorY()) {
      activeBall.y = getFloorY() - activeBall.radius;
      activeBall.active = false;
      lostAnyBall = true;
      addFloatingLabel(activeBall.x, activeBall.y - activeBall.radius, "LOST");
    }
  }

  if (lostAnyBall) {
    balls = balls.filter((activeBall) => activeBall.active);
    recentTapAssist = recentTapAssist && balls.some((activeBall) => activeBall.id === recentTapAssist.ballId)
      ? recentTapAssist
      : null;
  }

  if (getActiveBalls().length === 0) {
    endLevelRun();
  }
}

function updateSingleBall(activeBall, deltaSeconds) {
  const gravityVector = getGravityVector(activeBall);
  activeBall.vx += gravityVector.x * deltaSeconds;
  activeBall.vy += gravityVector.y * deltaSeconds;
  clampBallVelocity(activeBall);
  activeBall.x += activeBall.vx * deltaSeconds;
  activeBall.y += activeBall.vy * deltaSeconds;

  if (activeBall.x - activeBall.radius < 0) {
    activeBall.x = activeBall.radius;
    activeBall.vx = Math.abs(activeBall.vx) * CONFIG.wallBounce;
  }

  if (activeBall.x + activeBall.radius > viewWidth) {
    activeBall.x = viewWidth - activeBall.radius;
    activeBall.vx = -Math.abs(activeBall.vx) * CONFIG.wallBounce;
  }

  if (activeBall.y - activeBall.radius < 0) {
    activeBall.y = activeBall.radius;
    activeBall.vy = Math.abs(activeBall.vy) * CONFIG.ceilingBounce;
  }
}

function getGravityVector(activeBall) {
  if (blackHole && blackHole.strength > 0) {
    const dx = blackHole.x - activeBall.x;
    const dy = blackHole.y - activeBall.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const pull = currentGravity * blackHole.pullMultiplier * blackHole.strength;

    return {
      x: (dx / distance) * pull,
      y: (dy / distance) * pull
    };
  }

  return { x: 0, y: currentGravity };
}

function updateCollectibles(deltaSeconds) {
  collectibles = collectibles
    .map((collectible) => ({ ...collectible, age: collectible.age + deltaSeconds }))
    .filter((collectible) => !collectible.collected && collectible.age < collectible.lifetime);
}

function updatePowerups(deltaSeconds) {
  powerups = powerups
    .map((activePowerup) => ({ ...activePowerup, age: activePowerup.age + deltaSeconds }))
    .filter((activePowerup) => !activePowerup.collected && activePowerup.age < activePowerup.lifetime);
}

function checkEntityCollisions() {
  for (const activeBall of getActiveBalls()) {
    if (activeBall.inTransit) {
      continue;
    }

    for (const collectible of collectibles) {
      if (collectible.collected || !isCollectibleCollisionActive(collectible)) {
        continue;
      }

      if (isBallTouchingEntity(activeBall, collectible)) {
        collectGem(activeBall, collectible);
      }
    }

    for (const activePowerup of powerups) {
      if (!activePowerup.collected && isBallTouchingEntity(activeBall, activePowerup)) {
        collectPowerup(activeBall, activePowerup);
      }
    }

    if (portal && portal.state === "entry" && activeBall.portalCooldown <= 0 && isBallTouchingEntity(activeBall, portal.entry)) {
      sendBallThroughPortal(activeBall);
    }
  }

  collectibles = collectibles.filter((collectible) => !collectible.collected);
  powerups = powerups.filter((activePowerup) => !activePowerup.collected);
}

function isBallTouchingEntity(activeBall, entity) {
  return Math.hypot(activeBall.x - entity.x, activeBall.y - entity.y) <= activeBall.radius + entity.radius;
}

function isCollectibleCollisionActive(collectible) {
  return collectible.type !== COLLECTIBLE_TYPES.phasingGem || getPhasingOpacity(collectible) >= CONFIG.phasingCollisionOpacity;
}

function collectGem(activeBall, collectible) {
  const baseValue = collectible.type === COLLECTIBLE_TYPES.phasingGem
    ? CONFIG.phasingGemScore
    : CONFIG.goldGemScore;
  const pointsEarned = Math.round(baseValue + currentLevel.id * 30 + CONFIG.baseScore * (CONFIG.startingDiameter / activeBall.diameter));

  score += pointsEarned;
  collectible.collected = true;
  applyCollisionBounce(activeBall, collectible, CONFIG.collectibleBounceImpulse);
  activeBall.vy -= CONFIG.collectibleUpwardNudge;
  clampBallVelocity(activeBall);
  addFloatingLabel(collectible.x, collectible.y, `+${pointsEarned}`);
}

function collectPowerup(activeBall, activePowerup) {
  activePowerup.collected = true;
  applyCollisionBounce(activeBall, activePowerup, CONFIG.powerupBounceImpulse);

  if (activePowerup.type === POWERUP_TYPES.slow) {
    activateSlowPowerup(activePowerup);
  } else if (activePowerup.type === POWERUP_TYPES.grow) {
    activateGrowPowerup(activePowerup);
  } else if (activePowerup.type === POWERUP_TYPES.multi) {
    activateMultiBallPowerup(activePowerup, activeBall);
  }
}

function activateSlowPowerup(activePowerup) {
  slowTimer = Math.max(slowTimer, CONFIG.slowDurationSeconds);
  recalculateGravity();

  for (const activeBall of getActiveBalls()) {
    activeBall.vx *= CONFIG.slowVelocityMultiplier;
    activeBall.vy *= CONFIG.slowVelocityMultiplier;
  }

  addFloatingLabel(activePowerup.x, activePowerup.y, "SLOW");
}

function activateGrowPowerup(activePowerup) {
  for (const activeBall of getActiveBalls()) {
    setBallDiameter(activeBall.diameter * CONFIG.powerupGrowMultiplier, activeBall);
    clampBallInsidePlayfield(activeBall);
  }

  addFloatingLabel(activePowerup.x, activePowerup.y, "GROW");
}

function activateMultiBallPowerup(activePowerup, sourceBall = getLargestActiveBall()) {
  if (!sourceBall || sourceBall.inTransit) {
    return;
  }

  const splitDiameter = sourceBall.diameter * CONFIG.multiBallDiameterMultiplier;
  const sourceX = sourceBall.x;
  const sourceY = sourceBall.y;
  const sourceVX = sourceBall.vx;
  const sourceVY = sourceBall.vy;
  const sourceRadius = sourceBall.radius;
  const centerIndex = (CONFIG.multiBallCount - 1) / 2;
  const splitBalls = [];

  for (let index = 0; index < CONFIG.multiBallCount; index += 1) {
    const splitBall = index === 0 ? sourceBall : createBall({
      x: sourceX,
      y: sourceY,
      vx: sourceVX,
      vy: sourceVY,
      diameter: splitDiameter
    });
    const offsetIndex = index - centerIndex;
    const xOffset = offsetIndex * sourceRadius * CONFIG.multiBallSpawnSeparationRatio;

    splitBall.active = true;
    splitBall.inTransit = false;
    setBallDiameter(splitDiameter, splitBall);
    splitBall.x = clamp(sourceX + xOffset, splitBall.radius, viewWidth - splitBall.radius);
    splitBall.y = clamp(sourceY, splitBall.radius, getFloorY() - splitBall.radius);
    splitBall.vx = sourceVX * CONFIG.multiBallCarryVelocityMultiplier
      + offsetIndex * CONFIG.multiBallSpreadVelocityX;
    splitBall.vy = Math.min(
      sourceVY * CONFIG.multiBallCarryVelocityMultiplier,
      CONFIG.multiBallLaunchVelocityY
    );
    splitBall.squashTimer = CONFIG.squashDuration;
    splitBall.squashAngle = Math.atan2(splitBall.vy, splitBall.vx);
    clampBallVelocity(splitBall);
    splitBalls.push(splitBall);
  }

  balls = balls
    .filter((activeBall) => activeBall.active && activeBall.id !== sourceBall.id)
    .concat(splitBalls);
  addFloatingLabel(activePowerup.x, activePowerup.y, "x3");
}

function sendBallThroughPortal(activeBall) {
  activeBall.inTransit = true;
  activeBall.portalCooldown = CONFIG.portalCooldownSeconds;
  portal.state = "exit";
  portal.exitTimer = currentLevel.spawnRates.portals?.warningSeconds || CONFIG.portalWarningSeconds;
  portal.transitBallId = activeBall.id;
  addFloatingLabel(portal.entry.x, portal.entry.y, "ZIP");
}

function releaseBallFromPortal(activeBall, exit) {
  activeBall.inTransit = false;
  activeBall.portalCooldown = CONFIG.portalCooldownSeconds;
  activeBall.x = clamp(exit.x, activeBall.radius + 4, viewWidth - activeBall.radius - 4);
  activeBall.y = clamp(exit.y, activeBall.radius + 4, getFloorY() - activeBall.radius - 4);
  activeBall.squashTimer = CONFIG.squashDuration;
  activeBall.squashAngle = Math.atan2(activeBall.vy, activeBall.vx);
  addFloatingLabel(activeBall.x, activeBall.y, "PORTAL");
}

function applyCollisionBounce(activeBall, entity, impulse) {
  const dx = activeBall.x - entity.x;
  const dy = activeBall.y - entity.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  activeBall.vx += (dx / distance) * impulse;
  activeBall.vy += (dy / distance) * impulse;
  activeBall.squashTimer = CONFIG.squashDuration;
  activeBall.squashAngle = Math.atan2(activeBall.vy, activeBall.vx);
  clampBallVelocity(activeBall);
}

function handlePointerDown(event) {
  if (gameState !== "playing") {
    return;
  }

  event.preventDefault();
  const point = getPointerPoint(event);
  handleBallTap(point.x, point.y);
}

function handleBallTap(tapX, tapY) {
  const tapTarget = getTapTarget(tapX, tapY);

  if (!tapTarget) {
    return;
  }

  const activeBall = tapTarget.ball;
  const effectiveTapRadius = getEffectiveTapRadius(activeBall);
  let dx = activeBall.x - tapX;
  let dy = activeBall.y - tapY;
  let distance = Math.hypot(dx, dy);

  if (tapTarget.assisted) {
    dx = clamp(activeBall.x - tapX, -activeBall.radius, activeBall.radius);
    dy = -activeBall.radius;
    distance = Math.hypot(dx, dy);
  }

  const deadzone = activeBall.radius * CONFIG.centerTapDeadzoneRatio;
  const distanceRatio = clamp(distance / effectiveTapRadius, 0, 1);
  const impulseStrength = lerp(CONFIG.minImpulse, CONFIG.maxImpulse, distanceRatio);
  const isTopTap = tapY < activeBall.y - activeBall.radius * CONFIG.topTapZoneRatio;

  // Core feel: exact vector from tap point to ball center, scaled by tap distance.
  const dirX = distance <= deadzone ? 0 : dx / distance;
  const dirY = distance <= deadzone ? -1 : dy / distance;
  const impulseX = dirX * impulseStrength;
  let impulseY;

  if (isTopTap) {
    impulseY = Math.max(0, dirY * impulseStrength) * CONFIG.downwardImpulseMultiplier;
  } else {
    impulseY = Math.min(0, dirY * impulseStrength) - CONFIG.nonTopUpwardLift;
  }

  if (impulseY < 0) {
    impulseY -= CONFIG.upwardImpulseBonus;
  }

  // Add impulse to current velocity so 360-degree momentum is preserved.
  activeBall.vx += impulseX;
  activeBall.vy += impulseY;
  clampBallVelocity(activeBall);

  activeBall.squashTimer = CONFIG.squashDuration;
  activeBall.squashAngle = Math.atan2(impulseY, impulseX);

  if (impulseY < 0) {
    recentTapAssist = { x: tapX, y: tapY, time: elapsedSeconds, ballId: activeBall.id };
    handleSuccessfulUpwardHit(activeBall);
  }
}

function getTapTarget(tapX, tapY) {
  let bestTarget = null;

  for (const activeBall of getActiveBalls()) {
    if (activeBall.inTransit) {
      continue;
    }

    const distance = Math.hypot(activeBall.x - tapX, activeBall.y - tapY);
    const effectiveTapRadius = getEffectiveTapRadius(activeBall);

    if (distance <= effectiveTapRadius) {
      const scoreForTarget = distance / effectiveTapRadius;

      if (!bestTarget || scoreForTarget < bestTarget.score) {
        bestTarget = { ball: activeBall, score: scoreForTarget, assisted: false };
      }
    }
  }

  if (bestTarget) {
    return bestTarget;
  }

  for (const activeBall of getActiveBalls()) {
    if (!activeBall.inTransit && isRapidTapAssistActive(tapX, tapY, activeBall)) {
      return { ball: activeBall, score: 1, assisted: true };
    }
  }

  return null;
}

function getEffectiveTapRadius(activeBall) {
  return Math.max(
    activeBall.radius + CONFIG.tapAssistPadding,
    activeBall.radius * CONFIG.tapAssistMultiplier
  );
}

function isRapidTapAssistActive(tapX, tapY, activeBall) {
  if (!recentTapAssist || recentTapAssist.ballId !== activeBall.id) {
    return false;
  }

  const age = elapsedSeconds - recentTapAssist.time;
  const tapDistance = Math.hypot(tapX - recentTapAssist.x, tapY - recentTapAssist.y);
  const isBelowBall = tapY >= activeBall.y + activeBall.radius * CONFIG.rapidTapMinBelowCenterRatio;

  return age <= CONFIG.rapidTapGraceSeconds && tapDistance <= CONFIG.rapidTapAssistRadius && isBelowBall;
}

function handleSuccessfulUpwardHit(activeBall) {
  successfulHits += 1;
  const pointsEarned = Math.round(CONFIG.baseScore * (CONFIG.startingDiameter / activeBall.diameter));
  score += pointsEarned;
  addFloatingLabel(activeBall.x, activeBall.y - activeBall.radius * CONFIG.labelOffsetYRatio, `+${pointsEarned}`);

  if (successfulHits % CONFIG.shrinkEveryHits === 0) {
    shrinkActiveBallsAndIncreaseDifficulty();
  }
}

function shrinkActiveBallsAndIncreaseDifficulty() {
  const activeBalls = getActiveBalls();
  const canShrink = activeBalls.some((activeBall) => activeBall.diameter > CONFIG.minDiameter);

  if (canShrink) {
    for (const activeBall of activeBalls) {
      setBallDiameter(activeBall.diameter * CONFIG.shrinkMultiplier, activeBall);
      clampBallInsidePlayfield(activeBall);
    }
  }

  difficultyFactor *= CONFIG.difficultySpeedMultiplier;
  recalculateGravity();

  for (const activeBall of activeBalls) {
    activeBall.vx *= CONFIG.difficultySpeedMultiplier;
    activeBall.vy *= CONFIG.difficultySpeedMultiplier;
    clampBallVelocity(activeBall);
  }
}

function recalculateGravity() {
  const slowFactor = slowTimer > 0 ? CONFIG.slowGravityMultiplier : 1;
  currentGravity = CONFIG.gravity * currentLevel.gravityMultiplier * difficultyFactor * slowFactor;
}

function endLevelRun() {
  if (gameState !== "playing") {
    return;
  }

  const previousBest = StorageManager.getBestScore(saveData, currentLevel.id);
  const stars = getStarsForScore(currentLevel, score);
  const coinsEarned = getCoinsEarned(currentLevel, score, stars);
  const result = {
    level: currentLevel,
    score,
    hits: successfulHits,
    smallestDiameter: smallestDiameterReached,
    stars,
    previousBest,
    coinsEarned
  };

  StorageManager.updateLevelResult(saveData, currentLevel, score, stars, coinsEarned);
  saveData = StorageManager.loadSave();
  selectedLevelId = Math.min(saveData.highestUnlockedLevel, currentLevel.id + (stars >= 1 ? 1 : 0));
  renderResults(result);
}

function getStarsForScore(level, value) {
  if (value >= level.star3Score) {
    return 3;
  }

  if (value >= level.star2Score) {
    return 2;
  }

  if (value >= level.star1Score) {
    return 1;
  }

  return 0;
}

function getCoinsEarned(level, value, stars) {
  const coinsUnlocked = saveData.shopUnlocked || level.id > 10 || (level.id === 10 && stars >= 1);

  if (!coinsUnlocked) {
    return 0;
  }

  const starBonus = [0, 10, 25, 50][stars] || 0;
  return Math.floor(value / 1000) + starBonus;
}

function updateHud() {
  const bestScore = StorageManager.getBestScore(saveData, currentLevel.id);
  levelValue.textContent = String(currentLevel.id);
  scoreValue.textContent = formatNumber(score);
  bestValue.textContent = formatNumber(bestScore);
  hitsValue.textContent = formatNumber(successfulHits);
  sizeValue.textContent = formatDiameter(getDisplayBallDiameter());
  runTitle.textContent = `L${currentLevel.id}: ${currentLevel.title}`;
  runGoal.textContent = getNextStarLabel();
}

function getNextStarLabel() {
  if (score < currentLevel.star1Score) {
    return `1-star: ${formatNumber(currentLevel.star1Score)}`;
  }

  if (score < currentLevel.star2Score) {
    return `2-star: ${formatNumber(currentLevel.star2Score)}`;
  }

  if (score < currentLevel.star3Score) {
    return `3-star: ${formatNumber(currentLevel.star3Score)}`;
  }

  return "3-star secured";
}

function updateFloatingLabels(deltaSeconds) {
  floatingLabels = floatingLabels
    .map((label) => ({
      ...label,
      age: label.age + deltaSeconds,
      y: Math.max(CONFIG.labelTopSafeY, label.y - CONFIG.floatingLabelRiseSpeed * deltaSeconds)
    }))
    .filter((label) => label.age < CONFIG.floatingLabelDuration);
}

function updateSquash(deltaSeconds) {
  for (const activeBall of getActiveBalls()) {
    activeBall.squashTimer = Math.max(0, activeBall.squashTimer - deltaSeconds);
  }
}

function clampBallVelocity(activeBall) {
  const speed = Math.hypot(activeBall.vx, activeBall.vy);

  if (speed <= CONFIG.maxVelocity) {
    return;
  }

  const scale = CONFIG.maxVelocity / speed;
  activeBall.vx *= scale;
  activeBall.vy *= scale;
}

function clampBallInsidePlayfield(activeBall) {
  if (!viewWidth || !viewHeight || !activeBall) {
    return;
  }

  activeBall.x = clamp(activeBall.x, activeBall.radius, viewWidth - activeBall.radius);
  activeBall.y = clamp(activeBall.y, activeBall.radius, getFloorY() - activeBall.radius);
}

function clampAllBallsInsidePlayfield() {
  for (const activeBall of getActiveBalls()) {
    clampBallInsidePlayfield(activeBall);
  }
}

function getActiveBalls() {
  return balls.filter((activeBall) => activeBall.active);
}

function getVisibleBalls() {
  return getActiveBalls().filter((activeBall) => !activeBall.inTransit);
}

function getPrimaryBall() {
  return getActiveBalls()[0] || ball;
}

function getLargestActiveBall() {
  const activeBalls = getVisibleBalls();

  if (activeBalls.length === 0) {
    return null;
  }

  return activeBalls.reduce((largestBall, activeBall) => (
    activeBall.diameter > largestBall.diameter ? activeBall : largestBall
  ), activeBalls[0]);
}

function getDisplayBallDiameter() {
  const activeBalls = getActiveBalls();

  if (activeBalls.length === 0) {
    return ball.diameter;
  }

  return activeBalls.reduce((smallestDiameter, activeBall) => (
    Math.min(smallestDiameter, activeBall.diameter)
  ), activeBalls[0].diameter);
}

function addFloatingLabel(x, y, text) {
  const stackIndex = floatingLabels.length % CONFIG.labelStackSlots;
  const centeredIndex = stackIndex - (CONFIG.labelStackSlots - 1) / 2;
  const stackedX = clamp(
    x + centeredIndex * CONFIG.labelStackOffsetX,
    CONFIG.labelSideSafeX,
    viewWidth - CONFIG.labelSideSafeX
  );
  const stackedY = Math.max(CONFIG.labelTopSafeY, y - stackIndex * CONFIG.labelStackOffsetY);

  floatingLabels.push({ x: stackedX, y: stackedY, text, age: 0 });
}

function draw() {
  drawBackground();
  drawFloor();

  if (blackHole) {
    drawBlackHole();
  }

  if (portal) {
    drawPortal();
  }

  drawBallShadows();
  drawCollectibles();
  drawPowerups();
  drawBalls();
  drawFloatingLabels();
}

function drawBackground() {
  const theme = COSMETICS.getBackground(saveData.equippedBackground);
  const gradient = ctx.createLinearGradient(0, 0, 0, viewHeight);
  gradient.addColorStop(0, theme.top);
  gradient.addColorStop(0.52, theme.mid);
  gradient.addColorStop(1, theme.bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, viewWidth, viewHeight);

  ctx.save();
  ctx.globalAlpha = CONFIG.backgroundDotAlpha;
  ctx.fillStyle = theme.accent;
  for (const dot of backgroundDots) {
    ctx.beginPath();
    ctx.arc(dot.xRatio * viewWidth, dot.yRatio * viewHeight, dot.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  if (theme.id === "neon-grid" || theme.id === "retro-arcade") {
    drawNeonGrid(theme.accent);
  }
  ctx.restore();
}

function drawNeonGrid(color) {
  const floorY = getFloorY();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.22;

  for (let x = 0; x <= viewWidth; x += 34) {
    ctx.beginPath();
    ctx.moveTo(viewWidth / 2, viewHeight * 0.54);
    ctx.lineTo(x, floorY);
    ctx.stroke();
  }

  for (let y = viewHeight * 0.58; y < floorY; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(viewWidth, y);
    ctx.stroke();
  }
}

function drawFloor() {
  const floorY = getFloorY();
  const theme = COSMETICS.getBackground(saveData.equippedBackground);
  const gradient = ctx.createLinearGradient(0, floorY - CONFIG.floorGlowHeight, 0, viewHeight);
  gradient.addColorStop(0, "rgba(37, 179, 255, 0)");
  gradient.addColorStop(1, "rgba(37, 179, 255, 0.18)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, floorY - CONFIG.floorGlowHeight, viewWidth, CONFIG.floorGlowHeight + CONFIG.floorInset);

  ctx.save();
  ctx.globalAlpha = CONFIG.floorLineAlpha;
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = CONFIG.floorLineWidth;
  ctx.beginPath();
  ctx.moveTo(0, floorY);
  ctx.lineTo(viewWidth, floorY);
  ctx.stroke();
  ctx.restore();
}

function drawBallShadows() {
  for (const activeBall of getVisibleBalls()) {
    drawBallShadow(activeBall);
  }
}

function drawBallShadow(activeBall) {
  const floorY = getFloorY();
  const distanceToFloor = Math.max(0, floorY - (activeBall.y + activeBall.radius));
  const range = Math.max(viewHeight * CONFIG.shadowHeightRangeRatio, activeBall.radius);
  const closeness = 1 - clamp(distanceToFloor / range, 0, 1);
  const width = activeBall.radius * lerp(CONFIG.shadowMinWidthRatio, CONFIG.shadowMaxWidthRatio, closeness);
  const height = activeBall.radius * lerp(CONFIG.shadowMinHeightRatio, CONFIG.shadowMaxHeightRatio, closeness);
  const alpha = lerp(CONFIG.shadowMinAlpha, CONFIG.shadowMaxAlpha, closeness);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#02040a";
  ctx.beginPath();
  ctx.ellipse(activeBall.x, floorY + height, width, height, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBalls() {
  for (const activeBall of getVisibleBalls()) {
    drawBall(activeBall);
  }
}

function drawBall(activeBall) {
  const squashProgress = activeBall.squashTimer / CONFIG.squashDuration;
  const stretch = 1 + squashProgress * CONFIG.squashStretchRatio;
  const squash = 1 - squashProgress * CONFIG.squashSquashRatio;
  const skin = COSMETICS.getBallSkin(saveData.equippedBallSkin);

  ctx.save();
  ctx.translate(activeBall.x, activeBall.y);
  ctx.rotate(activeBall.squashAngle);
  ctx.scale(stretch, squash);
  drawBallSkin(activeBall.radius, skin.id);
  ctx.restore();
}

function drawBallSkin(radius, skinId) {
  if (skinId === "football") {
    drawShadedSphere(radius, ["#ffffff", "#f8f8f8", "#cfd4dc", "#838b98"]);
    drawFootballMarks(radius);
  } else if (skinId === "tennis") {
    drawShadedSphere(radius, ["#f4ff8a", "#dfff36", "#91c918", "#4f790b"]);
    drawTennisMarks(radius);
  } else if (skinId === "basketball") {
    drawShadedSphere(radius, ["#ffe0a0", "#e8872c", "#b14a17", "#5a1d09"]);
    drawBasketballMarks(radius);
  } else if (skinId === "marble") {
    drawShadedSphere(radius, ["#ffffff", "#dce3ea", "#aeb8c2", "#6b7480"]);
    drawMarbleMarks(radius);
  } else if (skinId === "chrome") {
    drawShadedSphere(radius, ["#ffffff", "#d9eef8", "#788999", "#20252e"]);
  } else if (skinId === "earth") {
    drawShadedSphere(radius, ["#e5fbff", "#2f9bff", "#1062c8", "#06225c"]);
    drawEarthMarks(radius);
  } else if (skinId === "moon") {
    drawShadedSphere(radius, ["#ffffff", "#cfd4d8", "#858b92", "#3b4047"]);
    drawCraters(radius);
  } else if (skinId === "eyeball") {
    drawShadedSphere(radius, ["#ffffff", "#f2f7ff", "#c9d4e4", "#7d8797"]);
    drawEyeball(radius);
  } else if (skinId === "jelly") {
    drawShadedSphere(radius, ["rgba(255,255,255,0.95)", "#97f6ff", "#a35dff", "#4a207b"]);
  } else if (skinId === "lava") {
    drawShadedSphere(radius, ["#fff1a8", "#ff7a2f", "#7d160c", "#1a0402"]);
    drawLavaCracks(radius);
  } else if (skinId === "ice") {
    drawShadedSphere(radius, ["#ffffff", "#c8f8ff", "#5fb6df", "#1f4f75"]);
    drawIceCracks(radius);
  } else if (skinId === "bauble") {
    drawShadedSphere(radius, ["#ffffff", "#ff5d7a", "#bc123d", "#4a0719"]);
    drawBaubleCap(radius);
  } else if (skinId === "golf") {
    drawShadedSphere(radius, ["#ffffff", "#f4f5f0", "#c7c9c0", "#74786f"]);
    drawDimples(radius);
  } else if (skinId === "pool") {
    drawShadedSphere(radius, ["#e8f2ff", "#244bff", "#102091", "#050b3c"]);
    drawPoolMark(radius);
  } else if (skinId === "cannonball") {
    drawShadedSphere(radius, ["#b8bdc4", "#4d5661", "#1d232b", "#05070a"]);
  } else if (skinId === "disco") {
    drawShadedSphere(radius, ["#ffffff", "#d8f8ff", "#6a84a0", "#1b2440"]);
    drawDiscoTiles(radius);
  } else if (skinId === "testicle") {
    drawShadedSphere(radius, ["#fff3df", "#e7b488", "#b77854", "#5d2c25"]);
  } else {
    drawShadedSphere(radius, ["#ffffff", "#a8efff", "#2fa7ff", "#062361"]);
  }
}

function drawShadedSphere(radius, colors) {
  const gradient = ctx.createRadialGradient(
    radius * CONFIG.sphereLightXRatio,
    radius * CONFIG.sphereLightYRatio,
    radius * CONFIG.sphereLightRadiusRatio,
    0,
    0,
    radius * CONFIG.sphereShadeRadiusRatio
  );
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(0.28, colors[1]);
  gradient.addColorStop(0.62, colors[2]);
  gradient.addColorStop(1, colors[3]);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.globalAlpha = CONFIG.sphereHighlightAlpha;
  const highlight = ctx.createRadialGradient(
    radius * CONFIG.sphereHighlightXRatio,
    radius * CONFIG.sphereHighlightYRatio,
    0,
    radius * CONFIG.sphereHighlightXRatio,
    radius * CONFIG.sphereHighlightYRatio,
    radius * CONFIG.sphereHighlightRadiusXRatio
  );
  highlight.addColorStop(0, "#ffffff");
  highlight.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = highlight;
  ctx.beginPath();
  ctx.ellipse(
    radius * CONFIG.sphereHighlightXRatio,
    radius * CONFIG.sphereHighlightYRatio,
    radius * CONFIG.sphereHighlightRadiusXRatio,
    radius * CONFIG.sphereHighlightRadiusYRatio,
    -Math.PI / 7,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = "rgba(0, 14, 53, 0.46)";
  ctx.lineWidth = Math.max(1, radius * CONFIG.sphereEdgeLineRatio);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(
    0,
    0,
    radius - ctx.lineWidth / 2,
    Math.PI * CONFIG.sphereEdgeStartAngle,
    Math.PI * CONFIG.sphereEdgeEndAngle
  );
  ctx.stroke();
}

function drawFootballMarks(radius) {
  ctx.fillStyle = "#10151f";
  ctx.beginPath();
  for (let index = 0; index < 5; index += 1) {
    const angle = -Math.PI / 2 + index * Math.PI * 0.4;
    const x = Math.cos(angle) * radius * 0.22;
    const y = Math.sin(angle) * radius * 0.22;
    index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawTennisMarks(radius) {
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = Math.max(2, radius * 0.08);
  ctx.beginPath();
  ctx.arc(-radius * 0.45, 0, radius * 0.75, -Math.PI * 0.4, Math.PI * 0.4);
  ctx.arc(radius * 0.45, 0, radius * 0.75, Math.PI * 0.6, Math.PI * 1.4);
  ctx.stroke();
}

function drawBasketballMarks(radius) {
  ctx.strokeStyle = "rgba(35, 12, 5, 0.8)";
  ctx.lineWidth = Math.max(1, radius * 0.07);
  ctx.beginPath();
  ctx.moveTo(-radius, 0);
  ctx.lineTo(radius, 0);
  ctx.moveTo(0, -radius);
  ctx.lineTo(0, radius);
  ctx.arc(-radius * 0.55, 0, radius * 0.8, -Math.PI / 2, Math.PI / 2);
  ctx.arc(radius * 0.55, 0, radius * 0.8, Math.PI / 2, Math.PI * 1.5);
  ctx.stroke();
}

function drawMarbleMarks(radius) {
  ctx.strokeStyle = "rgba(71, 91, 112, 0.42)";
  ctx.lineWidth = Math.max(1, radius * 0.06);
  for (let index = 0; index < 4; index += 1) {
    ctx.beginPath();
    ctx.arc(-radius * 0.1 + index * radius * 0.12, -radius * 0.2, radius * (0.38 + index * 0.08), 0.1, 2.5);
    ctx.stroke();
  }
}

function drawEarthMarks(radius) {
  ctx.fillStyle = "#40c46f";
  ctx.beginPath();
  ctx.ellipse(-radius * 0.25, -radius * 0.05, radius * 0.22, radius * 0.34, -0.5, 0, Math.PI * 2);
  ctx.ellipse(radius * 0.25, radius * 0.12, radius * 0.28, radius * 0.18, 0.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawCraters(radius) {
  ctx.fillStyle = "rgba(70, 78, 86, 0.38)";
  for (const crater of [[-0.24, -0.08, 0.13], [0.18, 0.14, 0.18], [0.28, -0.24, 0.1]]) {
    ctx.beginPath();
    ctx.arc(radius * crater[0], radius * crater[1], radius * crater[2], 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawEyeball(radius) {
  ctx.fillStyle = "#49a7ff";
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#06111f";
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.16, 0, Math.PI * 2);
  ctx.fill();
}

function drawLavaCracks(radius) {
  ctx.strokeStyle = "#ffd35d";
  ctx.lineWidth = Math.max(1, radius * 0.06);
  ctx.beginPath();
  ctx.moveTo(-radius * 0.5, -radius * 0.15);
  ctx.lineTo(-radius * 0.1, radius * 0.08);
  ctx.lineTo(radius * 0.18, -radius * 0.25);
  ctx.lineTo(radius * 0.45, radius * 0.16);
  ctx.stroke();
}

function drawIceCracks(radius) {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
  ctx.lineWidth = Math.max(1, radius * 0.045);
  ctx.beginPath();
  ctx.moveTo(-radius * 0.45, radius * 0.1);
  ctx.lineTo(-radius * 0.05, -radius * 0.18);
  ctx.lineTo(radius * 0.18, radius * 0.22);
  ctx.moveTo(-radius * 0.05, -radius * 0.18);
  ctx.lineTo(radius * 0.33, -radius * 0.3);
  ctx.stroke();
}

function drawBaubleCap(radius) {
  ctx.fillStyle = "#d9c16b";
  ctx.fillRect(-radius * 0.18, -radius * 1.05, radius * 0.36, radius * 0.22);
}

function drawDimples(radius) {
  ctx.fillStyle = "rgba(90, 96, 102, 0.22)";
  for (let index = 0; index < 18; index += 1) {
    const angle = index * 2.17;
    const distance = radius * (0.22 + (index % 4) * 0.14);
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * distance, Math.sin(angle) * distance, Math.max(1, radius * 0.045), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPoolMark(radius) {
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0c1230";
  ctx.font = `900 ${Math.max(8, radius * 0.44)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("8", 0, radius * 0.02);
}

function drawDiscoTiles(radius) {
  ctx.strokeStyle = "rgba(255,255,255,0.38)";
  ctx.lineWidth = 1;
  for (let index = -2; index <= 2; index += 1) {
    ctx.beginPath();
    ctx.moveTo(index * radius * 0.22, -radius * 0.8);
    ctx.lineTo(index * radius * 0.22, radius * 0.8);
    ctx.moveTo(-radius * 0.8, index * radius * 0.22);
    ctx.lineTo(radius * 0.8, index * radius * 0.22);
    ctx.stroke();
  }
}

function drawCollectibles() {
  for (const collectible of collectibles) {
    if (collectible.type === COLLECTIBLE_TYPES.phasingGem) {
      drawPhasingGem(collectible);
    } else {
      drawGoldGem(collectible);
    }
  }
}

function drawGoldGem(collectible) {
  ctx.save();
  ctx.translate(collectible.x, collectible.y);
  ctx.rotate(Math.PI / 4);
  ctx.shadowColor = "rgba(255, 214, 107, 0.62)";
  ctx.shadowBlur = collectible.radius;
  ctx.fillStyle = "#ffd66b";
  ctx.fillRect(-collectible.radius * 0.72, -collectible.radius * 0.72, collectible.radius * 1.44, collectible.radius * 1.44);
  ctx.strokeStyle = "rgba(80, 48, 0, 0.5)";
  ctx.lineWidth = 2;
  ctx.strokeRect(-collectible.radius * 0.72, -collectible.radius * 0.72, collectible.radius * 1.44, collectible.radius * 1.44);
  ctx.restore();
}

function drawPhasingGem(collectible) {
  const opacity = getPhasingOpacity(collectible);

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(collectible.x, collectible.y);
  ctx.rotate(Math.PI / 4);
  ctx.shadowColor = opacity >= CONFIG.phasingCollisionOpacity
    ? "rgba(165, 110, 255, 0.68)"
    : "rgba(165, 110, 255, 0.24)";
  ctx.shadowBlur = collectible.radius;
  ctx.fillStyle = opacity >= CONFIG.phasingCollisionOpacity ? "#c08cff" : "#6b70ff";
  ctx.fillRect(-collectible.radius * 0.68, -collectible.radius * 0.68, collectible.radius * 1.36, collectible.radius * 1.36);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.strokeRect(-collectible.radius * 0.68, -collectible.radius * 0.68, collectible.radius * 1.36, collectible.radius * 1.36);
  ctx.restore();
}

function getPhasingOpacity(collectible) {
  return 0.28 + 0.72 * ((Math.sin(collectible.age * CONFIG.phasingGemPulseSpeed) + 1) / 2);
}

function drawPowerups() {
  for (const activePowerup of powerups) {
    drawPowerup(activePowerup);
  }
}

function drawPowerup(activePowerup) {
  const style = POWERUP_STYLES[activePowerup.type] || POWERUP_STYLES[POWERUP_TYPES.grow];
  const pulseScale = 1 + Math.sin(elapsedSeconds * 4.2) * 0.055;
  const textRatio = activePowerup.type === POWERUP_TYPES.slow ? 0.34 : 0.72;

  ctx.save();
  ctx.translate(activePowerup.x, activePowerup.y);
  ctx.scale(pulseScale, pulseScale);
  ctx.shadowColor = style.glow;
  ctx.shadowBlur = activePowerup.radius;
  ctx.fillStyle = style.outer;
  ctx.beginPath();
  ctx.arc(0, 0, activePowerup.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = style.inner;
  ctx.beginPath();
  ctx.arc(0, 0, activePowerup.radius * 0.72, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = style.ring;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, activePowerup.radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = style.ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `950 ${Math.max(8, activePowerup.radius * textRatio)}px Inter, ui-sans-serif, system-ui, sans-serif`;
  ctx.fillText(style.text, 0, 0);
  ctx.restore();
}

function drawBlackHole() {
  const pulse = 1 + Math.sin(elapsedSeconds * 8) * 0.05;
  const radius = blackHole.radius * (0.75 + blackHole.strength * 0.35) * pulse;

  ctx.save();
  ctx.translate(blackHole.x, blackHole.y);
  ctx.globalAlpha = blackHole.strength;
  const glow = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius * 1.6);
  glow.addColorStop(0, "rgba(0, 0, 0, 1)");
  glow.addColorStop(0.38, "rgba(52, 16, 96, 0.92)");
  glow.addColorStop(1, "rgba(93, 197, 255, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 1.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(180, 231, 255, 0.78)";
  ctx.lineWidth = 3;
  for (let index = 0; index < 3; index += 1) {
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * (1 + index * 0.26), radius * (0.45 + index * 0.08), elapsedSeconds * 2 + index, 0, Math.PI * 1.55);
    ctx.stroke();
  }

  ctx.fillStyle = "#010105";
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.52, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPortal() {
  if (portal.state === "entry") {
    drawPortalRing(portal.entry, "#54f2a4", 1);
  } else {
    const warningAlpha = 0.35 + Math.abs(Math.sin(elapsedSeconds * 12)) * 0.65;
    drawPortalRing(portal.exit, "#f061ff", warningAlpha);
  }
}

function drawPortalRing(anchor, color, alpha) {
  ctx.save();
  ctx.translate(anchor.x, anchor.y);
  ctx.globalAlpha = alpha;
  ctx.shadowColor = color;
  ctx.shadowBlur = CONFIG.portalRadius;
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(0, 0, CONFIG.portalRadius * 0.75, CONFIG.portalRadius * 1.08, getPortalRotation(anchor.side), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function getPortalRotation(side) {
  return side === "top" ? Math.PI / 2 : 0;
}

function drawFloatingLabels() {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (const label of floatingLabels) {
    const progress = clamp(label.age / CONFIG.floatingLabelDuration, 0, 1);
    const alpha = 1 - progress;
    const fontSize = clamp(
      getDisplayBallDiameter() * CONFIG.labelFontRatio,
      CONFIG.labelFontMin,
      CONFIG.labelFontMax
    );

    ctx.globalAlpha = alpha;
    ctx.font = `900 ${fontSize}px Inter, ui-sans-serif, system-ui, sans-serif`;
    ctx.lineWidth = Math.max(1, fontSize * 0.16);
    ctx.strokeStyle = "rgba(2, 8, 20, 0.75)";
    ctx.fillStyle = "#ffffff";
    ctx.strokeText(label.text, label.x, label.y);
    ctx.fillText(label.text, label.x, label.y);
  }

  ctx.restore();
}

function getPointerPoint(event) {
  const bounds = canvas.getBoundingClientRect();

  return {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top
  };
}

function getFloorY() {
  return viewHeight - CONFIG.floorInset;
}

function formatDiameter(value) {
  const decimals = value < 10 ? 1 : 0;
  return `${value.toFixed(decimals)}px`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function handleMenuClick(event) {
  const actionButton = event.target.closest("[data-action]");

  if (actionButton) {
    const action = actionButton.dataset.action;

    if (action === "home") {
      renderHome();
    } else if (action === "map") {
      renderLevelMap();
    }
    return;
  }

  const levelButton = event.target.closest("[data-level-id]");

  if (levelButton) {
    requestStartLevel(Number(levelButton.dataset.levelId));
    return;
  }

  const shopItemButton = event.target.closest("[data-shop-id]");

  if (shopItemButton) {
    handleShopAction(shopItemButton);
  }
}

function handleShopAction(button) {
  const kind = button.dataset.shopKind;
  const action = button.dataset.shopAction;
  const itemId = button.dataset.shopId;
  const item = kind === "ball"
    ? COSMETICS.BALL_SKINS.find((skin) => skin.id === itemId)
    : COSMETICS.BACKGROUNDS.find((background) => background.id === itemId);

  if (!item) {
    return;
  }

  if (action === "buy") {
    StorageManager.buyItem(saveData, kind, item);
  } else {
    StorageManager.equipItem(saveData, kind, itemId);
  }

  saveData = StorageManager.loadSave();
  renderShop();
}

window.addEventListener("resize", resizeCanvas);
document.addEventListener("click", handleMenuClick);
canvas.addEventListener("pointerdown", handlePointerDown);
playButton.addEventListener("click", () => requestStartLevel(saveData.highestUnlockedLevel));
mapButton.addEventListener("click", renderLevelMap);
shopButton.addEventListener("click", renderShop);
helpButton.addEventListener("click", () => showScreen("help"));
tutorialStartButton.addEventListener("click", () => {
  if (!pendingTutorialLevel) {
    return;
  }

  StorageManager.markTutorialSeen(saveData, pendingTutorialLevel.tutorialKey);
  saveData = StorageManager.loadSave();
  beginLevelRun(pendingTutorialLevel);
});
retryButton.addEventListener("click", () => requestStartLevel(lastResult ? lastResult.level.id : selectedLevelId));
nextLevelButton.addEventListener("click", () => requestStartLevel(lastResult ? lastResult.level.id + 1 : saveData.highestUnlockedLevel));

resizeCanvas();
currentLevel = LEVELS[0];
resetRunValues(currentLevel);
renderHome();
requestAnimationFrame(update);
