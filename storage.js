(function () {
  const SAVE_KEY = "dont-drop-me-save-v1";
  const SAVE_VERSION = 1;

  function createDefaultSave() {
    return {
      version: SAVE_VERSION,
      highestUnlockedLevel: 1,
      bestScores: {},
      bestStars: {},
      totalCoins: 0,
      ownedBallSkins: ["default"],
      ownedBackgrounds: ["default"],
      equippedBallSkin: "default",
      equippedBackground: "default",
      seenTutorials: {},
      shopUnlocked: false
    };
  }

  function loadSave() {
    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      return migrateSave(raw ? JSON.parse(raw) : createDefaultSave());
    } catch (error) {
      return createDefaultSave();
    }
  }

  function migrateSave(save) {
    const defaults = createDefaultSave();
    const migrated = {
      ...defaults,
      ...save,
      bestScores: { ...defaults.bestScores, ...(save.bestScores || {}) },
      bestStars: { ...defaults.bestStars, ...(save.bestStars || {}) },
      seenTutorials: { ...defaults.seenTutorials, ...(save.seenTutorials || {}) },
      ownedBallSkins: normalizeOwned(save.ownedBallSkins, defaults.ownedBallSkins),
      ownedBackgrounds: normalizeOwned(save.ownedBackgrounds, defaults.ownedBackgrounds)
    };

    migrated.version = SAVE_VERSION;
    migrated.highestUnlockedLevel = clampLevel(Number(migrated.highestUnlockedLevel) || 1);
    migrated.totalCoins = Math.max(0, Number(migrated.totalCoins) || 0);
    applyCurrentStarThresholds(migrated);
    migrated.shopUnlocked = Boolean(migrated.shopUnlocked || Number(migrated.bestStars[10]) >= 1);

    if (!migrated.ownedBallSkins.includes(migrated.equippedBallSkin)) {
      migrated.equippedBallSkin = "default";
    }

    if (!migrated.ownedBackgrounds.includes(migrated.equippedBackground)) {
      migrated.equippedBackground = "default";
    }

    return migrated;
  }

  function applyCurrentStarThresholds(save) {
    if (!Array.isArray(window.LEVELS)) {
      return;
    }

    window.LEVELS.forEach((level) => {
      const earnedStars = getStarsForScore(level, getBestScore(save, level.id));

      if (earnedStars > getBestStars(save, level.id)) {
        save.bestStars[String(level.id)] = earnedStars;
      }

      if (earnedStars >= 1 && level.id < 50) {
        save.highestUnlockedLevel = Math.max(save.highestUnlockedLevel, level.id + 1);
      }
    });

    save.highestUnlockedLevel = clampLevel(save.highestUnlockedLevel);
  }

  function getStarsForScore(level, score) {
    if (!level || score < level.star1Score) {
      return 0;
    }

    if (score >= level.star3Score) {
      return 3;
    }

    if (score >= level.star2Score) {
      return 2;
    }

    return 1;
  }

  function normalizeOwned(value, fallback) {
    if (!Array.isArray(value)) {
      return [...fallback];
    }

    return Array.from(new Set([...fallback, ...value.filter(Boolean)]));
  }

  function saveProgress(save) {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  }

  function resetProgress() {
    const save = createDefaultSave();
    saveProgress(save);
    return save;
  }

  function getBestScore(save, levelId) {
    return Number(save.bestScores[levelId]) || 0;
  }

  function getBestStars(save, levelId) {
    return Number(save.bestStars[levelId]) || 0;
  }

  function markTutorialSeen(save, key) {
    if (!key) {
      return;
    }

    save.seenTutorials[key] = true;
    saveProgress(save);
  }

  function isTutorialSeen(save, key) {
    return !key || Boolean(save.seenTutorials[key]);
  }

  function updateLevelResult(save, level, score, stars, coinsEarned) {
    const id = String(level.id);
    save.bestScores[id] = Math.max(getBestScore(save, level.id), score);
    save.bestStars[id] = Math.max(getBestStars(save, level.id), stars);

    if (stars >= 1 && level.id < 50) {
      save.highestUnlockedLevel = Math.max(save.highestUnlockedLevel, level.id + 1);
    }

    if (Number(save.bestStars[10]) >= 1 || (level.id === 10 && stars >= 1)) {
      save.shopUnlocked = true;
    }

    if (coinsEarned > 0) {
      save.totalCoins += coinsEarned;
    }

    saveProgress(save);
  }

  function buyItem(save, kind, item) {
    const ownedKey = kind === "ball" ? "ownedBallSkins" : "ownedBackgrounds";

    if (save[ownedKey].includes(item.id) || save.totalCoins < item.cost) {
      return false;
    }

    save.totalCoins -= item.cost;
    save[ownedKey].push(item.id);
    saveProgress(save);
    return true;
  }

  function equipItem(save, kind, itemId) {
    const ownedKey = kind === "ball" ? "ownedBallSkins" : "ownedBackgrounds";
    const equippedKey = kind === "ball" ? "equippedBallSkin" : "equippedBackground";

    if (!save[ownedKey].includes(itemId)) {
      return false;
    }

    save[equippedKey] = itemId;
    saveProgress(save);
    return true;
  }

  function clampLevel(value) {
    return Math.min(50, Math.max(1, value));
  }

  window.StorageManager = Object.freeze({
    SAVE_KEY,
    createDefaultSave,
    loadSave,
    saveProgress,
    resetProgress,
    getBestScore,
    getBestStars,
    markTutorialSeen,
    isTutorialSeen,
    updateLevelResult,
    buyItem,
    equipItem
  });
}());
