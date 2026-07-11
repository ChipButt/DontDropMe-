(function () {
  const MECHANIC_TYPES = Object.freeze({
    shrinking: "shrinking",
    blackHole: "blackHole",
    portals: "portals"
  });

  const COLLECTIBLE_TYPES = Object.freeze({
    goldGem: "goldGem",
    phasingGem: "phasingGem"
  });

  const POWERUP_TYPES = Object.freeze({
    slow: "slow",
    grow: "grow",
    multi: "multi"
  });

  const TUTORIALS = Object.freeze({
    core: {
      title: "First Bounce",
      lines: [
        "Tap the ball before it hits the floor.",
        "Every 3 upward hits, the ball shrinks.",
        "Smaller ball = more points.",
        "Survive as long as possible."
      ]
    },
    goldGem: {
      title: "Bonus Gems",
      lines: [
        "Gold gems appear briefly.",
        "Guide the ball into them for bonus points.",
        "Gems collide with the ball. Tapping gems does nothing."
      ]
    },
    slow: {
      title: "Slow Gravity",
      lines: [
        "Slow Gravity powerups reduce gravity temporarily.",
        "Collect them by hitting them with the ball.",
        "Powerups are never tap-activated."
      ]
    },
    blackHole: {
      title: "Black Holes",
      lines: [
        "Black holes form near the top of the screen.",
        "They pull gravity towards themselves.",
        "Tap carefully while the pull is active."
      ]
    },
    multi: {
      title: "Multi-ball",
      lines: [
        "Multi-ball splits one ball into three.",
        "All balls can score and collect items.",
        "You only lose when every ball is gone."
      ]
    },
    phasingGem: {
      title: "Phasing Gems",
      lines: [
        "Phasing gems fade in and out.",
        "When bright, they collide with the ball.",
        "When faded, the ball passes through."
      ]
    },
    portals: {
      title: "Portals",
      lines: [
        "Portals move a ball from one edge to another.",
        "Watch for the blinking exit warning.",
        "The ball keeps its velocity when it exits."
      ]
    }
  });

  const WORLD_NAMES = Object.freeze({
    1: "Training Fields",
    2: "Gravity Gardens",
    3: "Split Skies",
    4: "Phase Caverns",
    5: "Portal Peak"
  });

  const TITLES = Object.freeze({
    1: "First Bounce",
    2: "Bonus Gems",
    3: "Gem Practice",
    4: "Slow Gravity",
    5: "Soft Landing",
    6: "Black Holes",
    7: "Top Pull",
    8: "Mixed Forces",
    9: "Pressure Pocket",
    10: "World One Trial",
    20: "Multi-ball",
    30: "Phase Challenge",
    40: "Portal Doors",
    50: "Everything Falls"
  });

  const LEVEL_PATTERNS = Object.freeze({
    11: ["goldGem", "slow"],
    12: ["goldGem", "blackHole"],
    13: ["slow", "grow"],
    14: ["goldGem", "slow", "blackHole"],
    15: ["goldGem"],
    16: ["blackHole"],
    17: ["goldGem", "grow", "blackHole"],
    18: ["slow", "blackHole"],
    19: ["goldGem", "slow", "grow", "blackHole"],
    21: ["goldGem", "multi"],
    22: ["slow", "multi"],
    23: ["blackHole", "multi"],
    24: ["goldGem", "slow", "multi"],
    25: ["goldGem", "grow", "multi"],
    26: ["blackHole", "slow", "multi"],
    27: ["goldGem", "blackHole", "multi"],
    28: ["goldGem", "slow", "grow", "multi"],
    29: ["goldGem", "slow", "blackHole", "multi"],
    31: ["phasingGem"],
    32: ["goldGem", "phasingGem"],
    33: ["slow", "phasingGem"],
    34: ["blackHole", "phasingGem"],
    35: ["goldGem", "multi", "phasingGem"],
    36: ["slow", "multi", "phasingGem"],
    37: ["goldGem", "blackHole", "phasingGem"],
    38: ["goldGem", "slow", "multi", "phasingGem"],
    39: ["goldGem", "slow", "blackHole", "multi", "phasingGem"],
    41: ["portals"],
    42: ["goldGem", "portals"],
    43: ["slow", "portals"],
    44: ["phasingGem", "portals"],
    45: ["blackHole", "portals"],
    46: ["goldGem", "multi", "portals"],
    47: ["slow", "blackHole", "portals"],
    48: ["goldGem", "phasingGem", "multi", "portals"],
    49: ["goldGem", "slow", "blackHole", "phasingGem", "portals"]
  });

  function createLevel(id) {
    const world = Math.ceil(id / 10);
    const tokens = new Set(getTokensForLevel(id));
    const thresholds = getStarThresholds(id);

    return Object.freeze({
      id,
      title: TITLES[id] || createTitle(id),
      world: WORLD_NAMES[world],
      gravityMultiplier: Number((0.78 + id * 0.018 + world * 0.025).toFixed(3)),
      star1Score: thresholds[0],
      star2Score: thresholds[1],
      star3Score: thresholds[2],
      enabledMechanics: Object.freeze([
        MECHANIC_TYPES.shrinking,
        ...(tokens.has("blackHole") ? [MECHANIC_TYPES.blackHole] : []),
        ...(tokens.has("portals") ? [MECHANIC_TYPES.portals] : [])
      ]),
      enabledCollectibles: Object.freeze([
        ...(tokens.has("goldGem") ? [COLLECTIBLE_TYPES.goldGem] : []),
        ...(tokens.has("phasingGem") ? [COLLECTIBLE_TYPES.phasingGem] : [])
      ]),
      enabledPowerups: Object.freeze([
        ...(tokens.has("slow") ? [POWERUP_TYPES.slow] : []),
        ...(tokens.has("grow") ? [POWERUP_TYPES.grow] : []),
        ...(tokens.has("multi") ? [POWERUP_TYPES.multi] : [])
      ]),
      spawnRates: Object.freeze(createSpawnRates(id, tokens)),
      tutorialKey: getTutorialKey(id)
    });
  }

  function getTokensForLevel(id) {
    if (id === 1) {
      return [];
    }

    if (id === 2 || id === 3) {
      return ["goldGem"];
    }

    if (id === 4) {
      return ["slow"];
    }

    if (id === 5) {
      return ["goldGem", "slow"];
    }

    if (id === 6 || id === 7) {
      return ["blackHole"];
    }

    if (id === 8 || id === 9 || id === 10) {
      return ["goldGem", "slow", "blackHole", ...(id === 10 ? ["grow"] : [])];
    }

    if (id === 20) {
      return ["goldGem", "slow", "blackHole", "multi"];
    }

    if (id === 30) {
      return ["goldGem", "slow", "blackHole", "multi", "phasingGem"];
    }

    if (id === 40) {
      return ["goldGem", "slow", "blackHole", "multi", "phasingGem", "portals"];
    }

    if (id === 50) {
      return ["goldGem", "slow", "grow", "blackHole", "multi", "phasingGem", "portals"];
    }

    return LEVEL_PATTERNS[id] || ["goldGem", "slow"];
  }

  function createSpawnRates(id, tokens) {
    const pressure = Math.min(1.15, id / 55);
    const rates = {
      goldGem: null,
      phasingGem: null,
      slow: null,
      grow: null,
      multi: null,
      blackHole: null,
      portals: null
    };

    if (tokens.has("goldGem")) {
      rates.goldGem = {
        min: Math.max(4.2, 9.2 - pressure * 3),
        max: Math.max(7.2, 14.6 - pressure * 3.4),
        lifetime: Math.max(4.2, 7.2 - pressure * 1.6)
      };
    }

    if (tokens.has("phasingGem")) {
      rates.phasingGem = {
        min: Math.max(5.8, 10.5 - pressure * 2.4),
        max: Math.max(8.8, 15.5 - pressure * 2.8),
        lifetime: Math.max(8.5, 13.5 - pressure * 1.4)
      };
    }

    if (tokens.has("slow")) {
      rates.slow = {
        min: Math.max(8.5, 15.5 - pressure * 2.8),
        max: Math.max(12.5, 23 - pressure * 4.2)
      };
    }

    if (tokens.has("grow")) {
      rates.grow = {
        min: 18,
        max: 28
      };
    }

    if (tokens.has("multi")) {
      rates.multi = {
        min: Math.max(17, 27 - pressure * 4),
        max: Math.max(24, 39 - pressure * 6)
      };
    }

    if (tokens.has("blackHole")) {
      rates.blackHole = {
        min: Math.max(13, 24 - pressure * 4.2),
        max: Math.max(19, 34 - pressure * 5.4),
        duration: Math.min(7.8, 5.1 + pressure * 2.1),
        pullMultiplier: Math.min(1.55, 1.08 + pressure * 0.34)
      };
    }

    if (tokens.has("portals")) {
      rates.portals = {
        min: Math.max(14, 26 - pressure * 5),
        max: Math.max(20, 37 - pressure * 6.5),
        warningSeconds: 1
      };
    }

    return rates;
  }

  function getStarThresholds(id) {
    const earlyThresholds = [
      [200, 600, 1200],
      [300, 900, 1700],
      [450, 1200, 2400],
      [600, 1600, 3200],
      [800, 2100, 4300],
      [1050, 2800, 5600],
      [1350, 3600, 7200],
      [1700, 4500, 9000],
      [2100, 5400, 10800],
      [2600, 6500, 13000]
    ];

    if (id <= earlyThresholds.length) {
      return earlyThresholds[id - 1];
    }

    const postTen = id - earlyThresholds.length;
    const star1 = roundToNearest(2600 + postTen * 780 + postTen * postTen * 45, 250);
    const star2 = roundToNearest(star1 * (2.42 + postTen * 0.018), 500);
    const star3 = roundToNearest(star1 * (4.85 + postTen * 0.035), 1000);
    return [star1, star2, star3];
  }

  function getTutorialKey(id) {
    return {
      1: "core",
      2: "goldGem",
      4: "slow",
      6: "blackHole",
      20: "multi",
      30: "phasingGem",
      40: "portals"
    }[id] || null;
  }

  function createTitle(id) {
    const adjectives = ["Bright", "Wobbly", "Narrow", "Glowing", "High", "Careful", "Sharp", "Moonlit", "Busy"];
    const nouns = ["Bounce", "Arc", "Drop", "Pocket", "Trail", "Pull", "Loop", "Climb", "Trial"];
    return `${adjectives[id % adjectives.length]} ${nouns[(id * 3) % nouns.length]}`;
  }

  function roundToNearest(value, step) {
    return Math.round(value / step) * step;
  }

  window.MECHANIC_TYPES = MECHANIC_TYPES;
  window.COLLECTIBLE_TYPES = COLLECTIBLE_TYPES;
  window.POWERUP_TYPES = POWERUP_TYPES;
  window.TUTORIALS = TUTORIALS;
  window.LEVELS = Object.freeze(Array.from({ length: 50 }, (_, index) => createLevel(index + 1)));
}());
