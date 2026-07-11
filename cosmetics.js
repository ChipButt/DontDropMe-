(function () {
  const BALL_SKINS = Object.freeze([
    { id: "default", name: "Default Blue Sphere", cost: 0, unlockLevel: 1 },
    { id: "football", name: "Football", cost: 80, unlockLevel: 10 },
    { id: "tennis", name: "Tennis Ball", cost: 90, unlockLevel: 10 },
    { id: "basketball", name: "Basketball", cost: 110, unlockLevel: 10 },
    { id: "marble", name: "Marble", cost: 140, unlockLevel: 12 },
    { id: "chrome", name: "Chrome Sphere", cost: 180, unlockLevel: 14 },
    { id: "earth", name: "Planet Earth", cost: 220, unlockLevel: 16 },
    { id: "moon", name: "Moon", cost: 190, unlockLevel: 18 },
    { id: "eyeball", name: "Eyeball", cost: 240, unlockLevel: 20 },
    { id: "jelly", name: "Jelly", cost: 260, unlockLevel: 22 },
    { id: "lava", name: "Lava Ball", cost: 300, unlockLevel: 24 },
    { id: "ice", name: "Ice Ball", cost: 300, unlockLevel: 26 },
    { id: "bauble", name: "Christmas Bauble", cost: 340, unlockLevel: 28 },
    { id: "golf", name: "Golf Ball", cost: 320, unlockLevel: 30 },
    { id: "pool", name: "Pool Ball", cost: 360, unlockLevel: 32 },
    { id: "cannonball", name: "Cannonball", cost: 390, unlockLevel: 34 },
    { id: "disco", name: "Disco Ball", cost: 450, unlockLevel: 40 },
    { id: "testicle", name: "Testicle", cost: 750, unlockLevel: 50, hidden: true }
  ]);

  const BACKGROUNDS = Object.freeze([
    {
      id: "default",
      name: "Default Space/Blue",
      cost: 0,
      unlockLevel: 1,
      top: "#0f2445",
      mid: "#07172d",
      bottom: "#04070d",
      accent: "#79d8ff"
    },
    {
      id: "pitch",
      name: "Football Pitch",
      cost: 100,
      unlockLevel: 10,
      top: "#1f5b38",
      mid: "#0d3d25",
      bottom: "#052013",
      accent: "#bff7c7"
    },
    {
      id: "beach",
      name: "Beach/Sea",
      cost: 120,
      unlockLevel: 10,
      top: "#54bce8",
      mid: "#166fa6",
      bottom: "#034463",
      accent: "#ffe19a"
    },
    {
      id: "outer-space",
      name: "Outer Space",
      cost: 150,
      unlockLevel: 12,
      top: "#100d31",
      mid: "#08091f",
      bottom: "#02030c",
      accent: "#c8b7ff"
    },
    {
      id: "volcano",
      name: "Volcano",
      cost: 180,
      unlockLevel: 15,
      top: "#3b0c15",
      mid: "#1f0b12",
      bottom: "#070306",
      accent: "#ff7a3d"
    },
    {
      id: "underwater",
      name: "Underwater",
      cost: 180,
      unlockLevel: 17,
      top: "#0f6c8f",
      mid: "#064159",
      bottom: "#021823",
      accent: "#7fffea"
    },
    {
      id: "forest",
      name: "Forest",
      cost: 200,
      unlockLevel: 20,
      top: "#143c2b",
      mid: "#09281e",
      bottom: "#03140f",
      accent: "#8af28d"
    },
    {
      id: "factory",
      name: "Factory",
      cost: 220,
      unlockLevel: 22,
      top: "#323843",
      mid: "#1b2029",
      bottom: "#080a0f",
      accent: "#ffcc66"
    },
    {
      id: "clouds",
      name: "Clouds",
      cost: 240,
      unlockLevel: 24,
      top: "#77a8dc",
      mid: "#466f9f",
      bottom: "#1b3859",
      accent: "#ffffff"
    },
    {
      id: "castle",
      name: "Castle",
      cost: 260,
      unlockLevel: 27,
      top: "#303257",
      mid: "#1b1c34",
      bottom: "#080913",
      accent: "#d7c18c"
    },
    {
      id: "neon-grid",
      name: "Neon Grid",
      cost: 300,
      unlockLevel: 30,
      top: "#17062d",
      mid: "#090a2b",
      bottom: "#02020d",
      accent: "#ff53dc"
    },
    {
      id: "retro-arcade",
      name: "Retro Arcade",
      cost: 320,
      unlockLevel: 34,
      top: "#24143f",
      mid: "#0d1233",
      bottom: "#02040d",
      accent: "#55ffda"
    },
    {
      id: "laboratory",
      name: "Laboratory",
      cost: 360,
      unlockLevel: 38,
      top: "#1d3540",
      mid: "#102129",
      bottom: "#050b0f",
      accent: "#9cf8ff"
    }
  ]);

  function getBallSkin(id) {
    return BALL_SKINS.find((skin) => skin.id === id) || BALL_SKINS[0];
  }

  function getBackground(id) {
    return BACKGROUNDS.find((background) => background.id === id) || BACKGROUNDS[0];
  }

  window.COSMETICS = Object.freeze({
    BALL_SKINS,
    BACKGROUNDS,
    getBallSkin,
    getBackground
  });
}());
