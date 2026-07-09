const CONFIG = {
  startingDiameter: 64,
  minDiameter: 4,
  gravity: 680,
  maxVelocity: 1100,
  minImpulse: 240,
  maxImpulse: 920,
  shrinkEveryHits: 3,
  shrinkMultiplier: 0.92,
  difficultySpeedMultiplier: 1.04,
  powerupMinSpawnSeconds: 8,
  powerupMaxSpawnSeconds: 15,
  powerupHoldSeconds: 2,
  powerupGrowMultiplier: 1.35,
  baseScore: 100,

  ballStartXRatio: 0.5,
  ballStartYRatio: 0.28,
  centerTapDeadzoneRatio: 0.2,
  upwardImpulseBonus: 120,
  downwardImpulseMultiplier: 0.32,
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
let nextPowerupAt = 0;
let powerup = null;
let floatingLabels = [];
let backgroundDots = [];

const ball = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  diameter: CONFIG.startingDiameter,
  radius: CONFIG.startingDiameter / 2,
  squashTimer: 0,
  squashAngle: 0
};

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
  clampBallInsidePlayfield();
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
  currentGravity = CONFIG.gravity;
  difficultyFactor = 1;
  floatingLabels = [];
  powerup = null;
  smallestDiameterReached = CONFIG.startingDiameter;
  setBallDiameter(CONFIG.startingDiameter);
  ball.x = viewWidth * CONFIG.ballStartXRatio;
  ball.y = viewHeight * CONFIG.ballStartYRatio;
  ball.vx = 0;
  ball.vy = 0;
  ball.squashTimer = 0;
  ball.squashAngle = 0;
  nextPowerupAt = elapsedSeconds + randomRange(CONFIG.powerupMinSpawnSeconds, CONFIG.powerupMaxSpawnSeconds);
  updateHud();
}

function setBallDiameter(diameter) {
  ball.diameter = clamp(diameter, CONFIG.minDiameter, CONFIG.startingDiameter);
  ball.radius = ball.diameter / 2;
  smallestDiameterReached = Math.min(smallestDiameterReached, ball.diameter);
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
  sizeValue.textContent = formatDiameter(ball.diameter);
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
    updatePowerup(deltaSeconds);
    updateBall(deltaSeconds);
  }

  updateFloatingLabels(deltaSeconds);
  updateSquash(deltaSeconds);
  draw();
  requestAnimationFrame(update);
}

function updateBall(deltaSeconds) {
  ball.vy += currentGravity * deltaSeconds;
  ball.x += ball.vx * deltaSeconds;
  ball.y += ball.vy * deltaSeconds;

  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    ball.vx = Math.abs(ball.vx) * CONFIG.wallBounce;
  }

  if (ball.x + ball.radius > viewWidth) {
    ball.x = viewWidth - ball.radius;
    ball.vx = -Math.abs(ball.vx) * CONFIG.wallBounce;
  }

  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.vy = Math.abs(ball.vy) * CONFIG.ceilingBounce;
  }

  if (ball.y + ball.radius >= getFloorY()) {
    ball.y = getFloorY() - ball.radius;
    endGame();
  }
}

function updatePowerup(deltaSeconds) {
  if (!powerup && elapsedSeconds >= nextPowerupAt) {
    spawnPowerup();
  }

  if (!powerup || !powerup.isHolding) {
    return;
  }

  powerup.holdElapsed += deltaSeconds;
  powerup.progress = clamp(powerup.holdElapsed / CONFIG.powerupHoldSeconds, 0, 1);

  if (powerup.progress >= 1) {
    activatePowerup();
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
  ball.squashTimer = Math.max(0, ball.squashTimer - deltaSeconds);
}

function spawnPowerup() {
  const radius = CONFIG.powerupDiameter / 2;
  const minX = radius + CONFIG.powerupSideGap;
  const maxX = Math.max(minX, viewWidth - radius - CONFIG.powerupSideGap);
  const minY = CONFIG.powerupTopGap;
  const maxY = Math.max(minY, getFloorY() - CONFIG.powerupFloorGap);

  powerup = {
    x: randomRange(minX, maxX),
    y: randomRange(minY, maxY),
    radius,
    holdElapsed: 0,
    progress: 0,
    pointerId: null,
    isHolding: false
  };
}

function activatePowerup() {
  setBallDiameter(ball.diameter * CONFIG.powerupGrowMultiplier);
  clampBallInsidePlayfield();
  addFloatingLabel(ball.x, ball.y - ball.radius * CONFIG.labelOffsetYRatio, "GROW");
  powerup = null;
  nextPowerupAt = elapsedSeconds + randomRange(CONFIG.powerupMinSpawnSeconds, CONFIG.powerupMaxSpawnSeconds);
  updateHud();
}

function resetPowerupHold() {
  if (!powerup) {
    return;
  }

  powerup.holdElapsed = 0;
  powerup.progress = 0;
  powerup.pointerId = null;
  powerup.isHolding = false;
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
    powerup.pointerId = event.pointerId;
    powerup.isHolding = true;
    powerup.holdElapsed = 0;
    powerup.progress = 0;
    canvas.setPointerCapture(event.pointerId);
    return;
  }

  handleBallTap(point.x, point.y);
}

function handlePointerMove(event) {
  if (!powerup || !powerup.isHolding || powerup.pointerId !== event.pointerId) {
    return;
  }

  const point = getPointerPoint(event);

  if (!isPointInsideCircle(point.x, point.y, powerup.x, powerup.y, powerup.radius)) {
    resetPowerupHold();
  }
}

function handlePointerEnd(event) {
  if (powerup && powerup.pointerId === event.pointerId) {
    resetPowerupHold();
  }
}

function handleBallTap(tapX, tapY) {
  const dx = ball.x - tapX;
  const dy = ball.y - tapY;
  const distance = Math.hypot(dx, dy);

  if (distance > ball.radius) {
    return;
  }

  const deadzone = ball.radius * CONFIG.centerTapDeadzoneRatio;
  const distanceRatio = clamp(distance / ball.radius, 0, 1);
  const impulseStrength = lerp(CONFIG.minImpulse, CONFIG.maxImpulse, distanceRatio);

  // The impulse direction comes from the tap point to the ball centre.
  // Near-centre taps get a controlled upward nudge so normal play is forgiving.
  const dirX = distance <= deadzone ? 0 : dx / distance;
  const dirY = distance <= deadzone ? -1 : dy / distance;
  const impulseX = dirX * impulseStrength;
  let impulseY = dirY * impulseStrength;

  if (impulseY < 0) {
    impulseY -= CONFIG.upwardImpulseBonus;
  } else if (impulseY > 0) {
    impulseY *= CONFIG.downwardImpulseMultiplier;
  }

  // Impulses add to existing velocity, preserving full 360-degree momentum.
  ball.vx += impulseX;
  ball.vy += impulseY;
  clampBallVelocity();

  ball.squashTimer = CONFIG.squashDuration;
  ball.squashAngle = Math.atan2(impulseY, impulseX);

  if (impulseY < 0) {
    handleSuccessfulUpwardHit();
  }
}

function handleSuccessfulUpwardHit() {
  successfulHits += 1;
  const pointsEarned = Math.round(CONFIG.baseScore * (CONFIG.startingDiameter / ball.diameter));
  score += pointsEarned;
  addFloatingLabel(ball.x, ball.y - ball.radius * CONFIG.labelOffsetYRatio, `+${pointsEarned}`);

  if (successfulHits % CONFIG.shrinkEveryHits === 0 && ball.diameter > CONFIG.minDiameter) {
    setBallDiameter(ball.diameter * CONFIG.shrinkMultiplier);
    difficultyFactor *= CONFIG.difficultySpeedMultiplier;
    currentGravity = CONFIG.gravity * difficultyFactor;
    ball.vx *= CONFIG.difficultySpeedMultiplier;
    ball.vy *= CONFIG.difficultySpeedMultiplier;
    clampBallVelocity();
    clampBallInsidePlayfield();
  }

  updateHud();
}

function clampBallVelocity() {
  const speed = Math.hypot(ball.vx, ball.vy);

  if (speed <= CONFIG.maxVelocity) {
    return;
  }

  const scale = CONFIG.maxVelocity / speed;
  ball.vx *= scale;
  ball.vy *= scale;
}

function clampBallInsidePlayfield() {
  if (!viewWidth || !viewHeight) {
    return;
  }

  ball.x = clamp(ball.x, ball.radius, viewWidth - ball.radius);
  ball.y = clamp(ball.y, ball.radius, getFloorY() - ball.radius);
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
  drawBallShadow();

  if (powerup) {
    drawPowerup();
  }

  drawBall();
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

function drawBallShadow() {
  const floorY = getFloorY();
  const distanceToFloor = Math.max(0, floorY - (ball.y + ball.radius));
  const range = Math.max(viewHeight * CONFIG.shadowHeightRangeRatio, ball.radius);
  const closeness = 1 - clamp(distanceToFloor / range, 0, 1);
  const width = ball.radius * lerp(CONFIG.shadowMinWidthRatio, CONFIG.shadowMaxWidthRatio, closeness);
  const height = ball.radius * lerp(CONFIG.shadowMinHeightRatio, CONFIG.shadowMaxHeightRatio, closeness);
  const alpha = lerp(CONFIG.shadowMinAlpha, CONFIG.shadowMaxAlpha, closeness);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#02040a";
  ctx.beginPath();
  ctx.ellipse(ball.x, floorY + height, width, height, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBall() {
  const squashProgress = ball.squashTimer / CONFIG.squashDuration;
  const stretch = 1 + squashProgress * CONFIG.squashStretchRatio;
  const squash = 1 - squashProgress * CONFIG.squashSquashRatio;

  ctx.save();
  ctx.translate(ball.x, ball.y);
  ctx.rotate(ball.squashAngle);
  ctx.scale(stretch, squash);

  const gradient = ctx.createRadialGradient(
    ball.radius * CONFIG.sphereLightXRatio,
    ball.radius * CONFIG.sphereLightYRatio,
    ball.radius * CONFIG.sphereLightRadiusRatio,
    0,
    0,
    ball.radius * CONFIG.sphereShadeRadiusRatio
  );
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.24, "#a8efff");
  gradient.addColorStop(0.48, "#2fa7ff");
  gradient.addColorStop(0.76, "#1165d8");
  gradient.addColorStop(1, "#062361");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.globalAlpha = CONFIG.sphereHighlightAlpha;
  const highlight = ctx.createRadialGradient(
    ball.radius * CONFIG.sphereHighlightXRatio,
    ball.radius * CONFIG.sphereHighlightYRatio,
    0,
    ball.radius * CONFIG.sphereHighlightXRatio,
    ball.radius * CONFIG.sphereHighlightYRatio,
    ball.radius * CONFIG.sphereHighlightRadiusXRatio
  );
  highlight.addColorStop(0, "#ffffff");
  highlight.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = highlight;
  ctx.beginPath();
  ctx.ellipse(
    ball.radius * CONFIG.sphereHighlightXRatio,
    ball.radius * CONFIG.sphereHighlightYRatio,
    ball.radius * CONFIG.sphereHighlightRadiusXRatio,
    ball.radius * CONFIG.sphereHighlightRadiusYRatio,
    -Math.PI / 7,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = "rgba(0, 14, 53, 0.46)";
  ctx.lineWidth = Math.max(1, ball.radius * CONFIG.sphereEdgeLineRatio);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(
    0,
    0,
    ball.radius - ctx.lineWidth / 2,
    Math.PI * CONFIG.sphereEdgeStartAngle,
    Math.PI * CONFIG.sphereEdgeEndAngle
  );
  ctx.stroke();

  ctx.restore();
}

function drawPowerup() {
  const progressEnd = -Math.PI / 2 + Math.PI * 2 * powerup.progress;

  ctx.save();
  ctx.translate(powerup.x, powerup.y);
  ctx.shadowColor = "rgba(79, 255, 174, 0.68)";
  ctx.shadowBlur = powerup.radius;
  ctx.fillStyle = "rgba(20, 223, 139, 0.22)";
  ctx.beginPath();
  ctx.arc(0, 0, powerup.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "#19dd8c";
  ctx.beginPath();
  ctx.arc(0, 0, powerup.radius * 0.72, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.36)";
  ctx.lineWidth = CONFIG.powerupRingLineWidth;
  ctx.beginPath();
  ctx.arc(0, 0, powerup.radius, 0, Math.PI * 2);
  ctx.stroke();

  if (powerup.progress > 0) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = CONFIG.powerupRingLineWidth;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, 0, powerup.radius, -Math.PI / 2, progressEnd);
    ctx.stroke();
  }

  ctx.strokeStyle = "#032011";
  ctx.lineWidth = CONFIG.powerupPlusLineWidth;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-powerup.radius * 0.28, 0);
  ctx.lineTo(powerup.radius * 0.28, 0);
  ctx.moveTo(0, -powerup.radius * 0.28);
  ctx.lineTo(0, powerup.radius * 0.28);
  ctx.stroke();
  ctx.restore();
}

function drawFloatingLabels() {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (const label of floatingLabels) {
    const progress = clamp(label.age / CONFIG.floatingLabelDuration, 0, 1);
    const alpha = 1 - progress;
    const fontSize = clamp(ball.diameter * CONFIG.labelFontRatio, CONFIG.labelFontMin, CONFIG.labelFontMax);

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
window.addEventListener("pointerup", handlePointerEnd);
window.addEventListener("pointercancel", handlePointerEnd);
canvas.addEventListener("pointerdown", handlePointerDown);
canvas.addEventListener("pointermove", handlePointerMove);
startScreen.addEventListener("pointerdown", handlePointerDown);
restartButton.addEventListener("click", restartGame);

resizeCanvas();
resetGameValues();
updateHud();
requestAnimationFrame(update);
