const CONFIG = {
  startingDiameter: 64,
  minDiameter: 4,
  gravity: 480,
  maxVelocity: 920,
  minImpulse: 300,
  maxImpulse: 980,
  shrinkEveryHits: 3,
  shrinkMultiplier: 0.92,
  difficultySpeedMultiplier: 1.04,
  powerupMinSpawnSeconds: 8,
  powerupMaxSpawnSeconds: 15,
  powerupGrowMultiplier: 1.35,
  baseScore: 100,

  firstPowerupHitCount: 3,
  slowGravityMultiplier: 0.72,
  slowVelocityMultiplier: 0.82,
  minGravityMultiplier: 0.5,
  slowPowerupChance: 0.5,
  multiBallEveryHits: 75,
  multiBallCount: 3,
  multiBallDiameterMultiplier: 0.72,
  multiBallCarryVelocityMultiplier: 0.45,
  multiBallSpreadVelocityX: 340,
  multiBallLaunchVelocityY: -620,
  multiBallSpawnSeparationRatio: 0.55,

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
  maxDeltaSeconds: 0.032,
  maxDevicePixelRatio: 2,
  floorInset: 18,
  floorGlowHeight: 92,
  wallBounce: 0.78,
  ceilingBounce: 0.55,
  squashDuration: 0.16,
  squashStretchRatio: 0.18,
  squashSquashRatio: 0.1,
  floatingLabelDuration: 0.72,
  floatingLabelRiseSpeed: 58,
  powerupDiameter: 44,
  powerupSideGap: 18,
  powerupTopGap: 122,
  powerupFloorGap: 156,
  powerupRingLineWidth: 4,
  powerupPlusLineWidth: 4,
  powerupPulseSpeed: 4.2,
  powerupPulseScale: 0.055,
  powerupTextRatio: 0.72,
  powerupSlowTextRatio: 0.34,
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
  labelOffsetYRatio: 1.15,
  labelTopSafeY: 132,
  labelSideSafeX: 22,
  labelStackSlots: 3,
  labelStackOffsetX: 34,
  labelStackOffsetY: 24,
  labelFontMin: 12,
  labelFontRatio: 0.34,
  labelFontMax: 22,
  floorLineAlpha: 0.72,
  floorLineWidth: 2,
  backgroundDotCount: 38,
  backgroundDotMinRadius: 0.7,
  backgroundDotMaxRadius: 2.1,
  backgroundDotAlpha: 0.32
};

const POWERUP_TYPES = {
  slow: "slow",
  grow: "grow",
  multi: "multi"
};

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

const scoreValue = document.querySelector("#scoreValue");
const bestValue = document.querySelector("#bestValue");
const hitsValue = document.querySelector("#hitsValue");
const sizeValue = document.querySelector("#sizeValue");
const startScreen = document.querySelector("#startScreen");
const gameOverScreen = document.querySelector("#gameOverScreen");
const finalScoreValue = document.querySelector("#finalScoreValue");
const finalBestValue = document.querySelector("#finalBestValue");
const finalHitsValue = document.querySelector("#finalHitsValue");
const smallestSizeValue = document.querySelector("#smallestSizeValue");
const restartButton = document.querySelector("#restartButton");

const BEST_SCORE_KEY = "tap-sphere-best-score";

let viewWidth = 0;
let viewHeight = 0;
let deviceScale = 1;
let gameState = "start";
let lastFrameTime = 0;
let elapsedSeconds = 0;
let score = 0;
let bestScore = readBestScore();
let successfulHits = 0;
let smallestDiameterReached = CONFIG.startingDiameter;
let currentGravity = CONFIG.gravity;
let difficultyFactor = 1;
let gravityReliefFactor = 1;
let nextPowerupAt = Number.POSITIVE_INFINITY;
let nextMultiBallPowerupAt = CONFIG.multiBallEveryHits;
let firstPowerupSpawned = false;
let queuedPowerups = [];
let powerup = null;
let floatingLabels = [];
let backgroundDots = [];
let recentTapAssist = null;
let balls = [];
let nextBallId = 1;

const ball = {
  id: 0,
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  diameter: CONFIG.startingDiameter,
  radius: CONFIG.startingDiameter / 2,
  squashTimer: 0,
  squashAngle: 0,
  active: true
};

balls = [ball];

function readBestScore() {
  const saved = Number(window.localStorage.getItem(BEST_SCORE_KEY));
  return Number.isFinite(saved) ? saved : 0;
}

function writeBestScore(value) {
  window.localStorage.setItem(BEST_SCORE_KEY, String(value));
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

function resetGameValues() {
  score = 0;
  successfulHits = 0;
  difficultyFactor = 1;
  gravityReliefFactor = 1;
  recalculateGravity();
  floatingLabels = [];
  recentTapAssist = null;
  powerup = null;
  queuedPowerups = [];
  firstPowerupSpawned = false;
  nextMultiBallPowerupAt = CONFIG.multiBallEveryHits;
  nextPowerupAt = Number.POSITIVE_INFINITY;
  smallestDiameterReached = CONFIG.startingDiameter;
  nextBallId = 1;

  resetBallObject(ball, {
    x: viewWidth * CONFIG.ballStartXRatio,
    y: viewHeight * CONFIG.ballStartYRatio,
    vx: 0,
    vy: 0,
    diameter: CONFIG.startingDiameter
  });
  balls = [ball];
  updateHud();
}

function resetBallObject(targetBall, values) {
  targetBall.x = values.x;
  targetBall.y = values.y;
  targetBall.vx = values.vx;
  targetBall.vy = values.vy;
  targetBall.squashTimer = 0;
  targetBall.squashAngle = 0;
  targetBall.active = true;
  setBallDiameter(values.diameter, targetBall);
  clampBallInsidePlayfield(targetBall);
}

function createBall(values) {
  const newBall = {
    id: nextBallId,
    x: values.x,
    y: values.y,
    vx: values.vx,
    vy: values.vy,
    diameter: CONFIG.startingDiameter,
    radius: CONFIG.startingDiameter / 2,
    squashTimer: 0,
    squashAngle: 0,
    active: true
  };

  nextBallId += 1;
  setBallDiameter(values.diameter, newBall);
  clampBallInsidePlayfield(newBall);
  return newBall;
}

function setBallDiameter(diameter, targetBall = getPrimaryBall()) {
  targetBall.diameter = clamp(diameter, CONFIG.minDiameter, CONFIG.startingDiameter);
  targetBall.radius = targetBall.diameter / 2;
  smallestDiameterReached = Math.min(smallestDiameterReached, targetBall.diameter);
}

function startGame() {
  resetGameValues();
  gameState = "playing";
  startScreen.classList.add("screen--hidden");
  gameOverScreen.classList.add("screen--hidden");
}

function endGame() {
  if (gameState !== "playing") {
    return;
  }

  gameState = "gameover";
  bestScore = Math.max(bestScore, score);
  writeBestScore(bestScore);
  finalScoreValue.textContent = formatNumber(score);
  finalBestValue.textContent = formatNumber(bestScore);
  finalHitsValue.textContent = formatNumber(successfulHits);
  smallestSizeValue.textContent = formatDiameter(smallestDiameterReached);
  gameOverScreen.classList.remove("screen--hidden");
  updateHud();
}

function restartGame() {
  startGame();
}

function updateHud() {
  scoreValue.textContent = formatNumber(score);
  bestValue.textContent = formatNumber(bestScore);
  hitsValue.textContent = formatNumber(successfulHits);
  sizeValue.textContent = formatDiameter(getDisplayBallDiameter());
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
    updatePowerup();
    updateBalls(deltaSeconds);
  }

  updateFloatingLabels(deltaSeconds);
  updateSquash(deltaSeconds);
  draw();
  requestAnimationFrame(update);
}

function updateBalls(deltaSeconds) {
  let lostAnyBall = false;

  for (const activeBall of getActiveBalls()) {
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
    updateHud();
  }

  if (balls.length === 0) {
    endGame();
  }
}

function updateSingleBall(activeBall, deltaSeconds) {
  activeBall.vy += currentGravity * deltaSeconds;
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

function updatePowerup() {
  if (powerup) {
    return;
  }

  if (queuedPowerups.length > 0) {
    spawnPowerup(queuedPowerups.shift());
    return;
  }

  if (!firstPowerupSpawned && successfulHits >= CONFIG.firstPowerupHitCount) {
    firstPowerupSpawned = true;
    spawnPowerup(POWERUP_TYPES.slow);
    return;
  }

  if (elapsedSeconds >= nextPowerupAt) {
    spawnPowerup(getRandomRegularPowerupType());
  }
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

function spawnPowerup(type) {
  const radius = CONFIG.powerupDiameter / 2;
  const minX = radius + CONFIG.powerupSideGap;
  const maxX = Math.max(minX, viewWidth - radius - CONFIG.powerupSideGap);
  const minY = CONFIG.powerupTopGap;
  const maxY = Math.max(minY, getFloorY() - CONFIG.powerupFloorGap);

  powerup = {
    type,
    x: randomRange(minX, maxX),
    y: randomRange(minY, maxY),
    radius
  };
}

function activatePowerup() {
  if (!powerup) {
    return;
  }

  const activatedPowerup = powerup;
  powerup = null;

  if (activatedPowerup.type === POWERUP_TYPES.slow) {
    activateSlowPowerup(activatedPowerup);
  } else if (activatedPowerup.type === POWERUP_TYPES.multi) {
    activateMultiBallPowerup(activatedPowerup);
  } else {
    activateGrowPowerup(activatedPowerup);
  }

  scheduleNextPowerup();
  updateHud();
}

function activateSlowPowerup(activatedPowerup) {
  gravityReliefFactor = Math.max(
    CONFIG.minGravityMultiplier,
    gravityReliefFactor * CONFIG.slowGravityMultiplier
  );
  recalculateGravity();

  for (const activeBall of getActiveBalls()) {
    activeBall.vx *= CONFIG.slowVelocityMultiplier;
    activeBall.vy *= CONFIG.slowVelocityMultiplier;
  }

  addFloatingLabel(activatedPowerup.x, activatedPowerup.y, "SLOW");
}

function activateGrowPowerup(activatedPowerup) {
  for (const activeBall of getActiveBalls()) {
    setBallDiameter(activeBall.diameter * CONFIG.powerupGrowMultiplier, activeBall);
    clampBallInsidePlayfield(activeBall);
  }

  addFloatingLabel(activatedPowerup.x, activatedPowerup.y, "GROW");
}

function activateMultiBallPowerup(activatedPowerup) {
  const sourceBall = getLargestActiveBall();

  if (!sourceBall) {
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
  addFloatingLabel(activatedPowerup.x, activatedPowerup.y, "x3");
}

function scheduleNextPowerup() {
  nextPowerupAt = elapsedSeconds + randomRange(
    CONFIG.powerupMinSpawnSeconds,
    CONFIG.powerupMaxSpawnSeconds
  );
}

function getRandomRegularPowerupType() {
  return Math.random() < CONFIG.slowPowerupChance ? POWERUP_TYPES.slow : POWERUP_TYPES.grow;
}

function queuePowerup(type) {
  if (powerup) {
    queuedPowerups.push(type);
    return;
  }

  spawnPowerup(type);
}

function handlePointerDown(event) {
  event.preventDefault();

  if (gameState === "start") {
    startGame();
    return;
  }

  if (gameState !== "playing") {
    return;
  }

  const point = getPointerPoint(event);

  if (powerup && isPointInsideCircle(point.x, point.y, powerup.x, powerup.y, powerup.radius)) {
    activatePowerup();
    return;
  }

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

  // Impulse direction is the exact vector from the tap point to the ball centre.
  // Centre taps get a controlled upward nudge, while top taps are the only downward hit.
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

  // Impulses add to current velocity so repeated taps preserve full 360-degree momentum.
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
    if (isRapidTapAssistActive(tapX, tapY, activeBall)) {
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

  if (!firstPowerupSpawned && successfulHits >= CONFIG.firstPowerupHitCount) {
    firstPowerupSpawned = true;
    queuePowerup(POWERUP_TYPES.slow);
  }

  while (successfulHits >= nextMultiBallPowerupAt) {
    queuePowerup(POWERUP_TYPES.multi);
    nextMultiBallPowerupAt += CONFIG.multiBallEveryHits;
  }

  updateHud();
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
  currentGravity = CONFIG.gravity * difficultyFactor * gravityReliefFactor;
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

function getPrimaryBall() {
  return getActiveBalls()[0] || ball;
}

function getLargestActiveBall() {
  const activeBalls = getActiveBalls();

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
  drawBallShadows();

  if (powerup) {
    drawPowerup();
  }

  drawBalls();
  drawFloatingLabels();
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, viewHeight);
  gradient.addColorStop(0, "#0f2445");
  gradient.addColorStop(0.48, "#07172d");
  gradient.addColorStop(1, "#04070d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, viewWidth, viewHeight);

  ctx.save();
  ctx.globalAlpha = CONFIG.backgroundDotAlpha;
  ctx.fillStyle = "#b8e6ff";
  for (const dot of backgroundDots) {
    ctx.beginPath();
    ctx.arc(dot.xRatio * viewWidth, dot.yRatio * viewHeight, dot.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawFloor() {
  const floorY = getFloorY();
  const gradient = ctx.createLinearGradient(0, floorY - CONFIG.floorGlowHeight, 0, viewHeight);
  gradient.addColorStop(0, "rgba(37, 179, 255, 0)");
  gradient.addColorStop(1, "rgba(37, 179, 255, 0.18)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, floorY - CONFIG.floorGlowHeight, viewWidth, CONFIG.floorGlowHeight + CONFIG.floorInset);

  ctx.save();
  ctx.globalAlpha = CONFIG.floorLineAlpha;
  ctx.strokeStyle = "#79d8ff";
  ctx.lineWidth = CONFIG.floorLineWidth;
  ctx.beginPath();
  ctx.moveTo(0, floorY);
  ctx.lineTo(viewWidth, floorY);
  ctx.stroke();
  ctx.restore();
}

function drawBallShadows() {
  for (const activeBall of getActiveBalls()) {
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
  for (const activeBall of getActiveBalls()) {
    drawBall(activeBall);
  }
}

function drawBall(activeBall) {
  const squashProgress = activeBall.squashTimer / CONFIG.squashDuration;
  const stretch = 1 + squashProgress * CONFIG.squashStretchRatio;
  const squash = 1 - squashProgress * CONFIG.squashSquashRatio;

  ctx.save();
  ctx.translate(activeBall.x, activeBall.y);
  ctx.rotate(activeBall.squashAngle);
  ctx.scale(stretch, squash);

  const gradient = ctx.createRadialGradient(
    activeBall.radius * CONFIG.sphereLightXRatio,
    activeBall.radius * CONFIG.sphereLightYRatio,
    activeBall.radius * CONFIG.sphereLightRadiusRatio,
    0,
    0,
    activeBall.radius * CONFIG.sphereShadeRadiusRatio
  );
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.24, "#a8efff");
  gradient.addColorStop(0.48, "#2fa7ff");
  gradient.addColorStop(0.76, "#1165d8");
  gradient.addColorStop(1, "#062361");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, activeBall.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.globalAlpha = CONFIG.sphereHighlightAlpha;
  const highlight = ctx.createRadialGradient(
    activeBall.radius * CONFIG.sphereHighlightXRatio,
    activeBall.radius * CONFIG.sphereHighlightYRatio,
    0,
    activeBall.radius * CONFIG.sphereHighlightXRatio,
    activeBall.radius * CONFIG.sphereHighlightYRatio,
    activeBall.radius * CONFIG.sphereHighlightRadiusXRatio
  );
  highlight.addColorStop(0, "#ffffff");
  highlight.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = highlight;
  ctx.beginPath();
  ctx.ellipse(
    activeBall.radius * CONFIG.sphereHighlightXRatio,
    activeBall.radius * CONFIG.sphereHighlightYRatio,
    activeBall.radius * CONFIG.sphereHighlightRadiusXRatio,
    activeBall.radius * CONFIG.sphereHighlightRadiusYRatio,
    -Math.PI / 7,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = "rgba(0, 14, 53, 0.46)";
  ctx.lineWidth = Math.max(1, activeBall.radius * CONFIG.sphereEdgeLineRatio);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(
    0,
    0,
    activeBall.radius - ctx.lineWidth / 2,
    Math.PI * CONFIG.sphereEdgeStartAngle,
    Math.PI * CONFIG.sphereEdgeEndAngle
  );
  ctx.stroke();

  ctx.restore();
}

function drawPowerup() {
  const style = POWERUP_STYLES[powerup.type] || POWERUP_STYLES[POWERUP_TYPES.grow];
  const pulseScale = 1 + Math.sin(elapsedSeconds * CONFIG.powerupPulseSpeed) * CONFIG.powerupPulseScale;
  const textRatio = powerup.type === POWERUP_TYPES.slow
    ? CONFIG.powerupSlowTextRatio
    : CONFIG.powerupTextRatio;

  ctx.save();
  ctx.translate(powerup.x, powerup.y);
  ctx.scale(pulseScale, pulseScale);
  ctx.shadowColor = style.glow;
  ctx.shadowBlur = powerup.radius;
  ctx.fillStyle = style.outer;
  ctx.beginPath();
  ctx.arc(0, 0, powerup.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = style.inner;
  ctx.beginPath();
  ctx.arc(0, 0, powerup.radius * 0.72, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = style.ring;
  ctx.lineWidth = CONFIG.powerupRingLineWidth;
  ctx.beginPath();
  ctx.arc(0, 0, powerup.radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = style.ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `950 ${Math.max(8, powerup.radius * textRatio)}px Inter, ui-sans-serif, system-ui, sans-serif`;
  ctx.fillText(style.text, 0, 0);
  ctx.restore();
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

function isPointInsideCircle(x, y, centerX, centerY, radius) {
  return Math.hypot(x - centerX, y - centerY) <= radius;
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

window.addEventListener("resize", resizeCanvas);
canvas.addEventListener("pointerdown", handlePointerDown);
startScreen.addEventListener("pointerdown", handlePointerDown);
restartButton.addEventListener("click", restartGame);

resizeCanvas();
resetGameValues();
updateHud();
requestAnimationFrame(update);
