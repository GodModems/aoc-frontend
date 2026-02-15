// assets/js/data/ranks.js
// Client-side rank thresholds + border asset helper.
// Include this BEFORE home.js:
// <script src="assets/js/data/ranks.js"></script>

(function () {
  window.AOC = window.AOC || {};

  const RANKS = [
    { name: "wood",     min: -Infinity },
    { name: "stone",    min: 1000 },
    { name: "iron",     min: 1200 },
    { name: "bronze",   min: 1400 },
    { name: "silver",   min: 1600 },
    { name: "gold",     min: 1800 },
    { name: "platinum", min: 2000 },
    { name: "jade",     min: 2200 },
    { name: "diamond",  min: 2400 },
    { name: "master",   min: 2600 },
  ];

  function clampNum(v, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  function rankFromElo(elo) {
    const e = clampNum(elo, 0);
    let current = RANKS[0].name;
    for (const r of RANKS) {
      if (e >= r.min) current = r.name;
    }
    return current;
  }

  function borderSrcFromElo(elo) {
    const rank = rankFromElo(elo);
    return `assets/ui/borders/${rank}.svg`;
  }

  window.AOC.Ranks = {
    RANKS: RANKS.map(r => r.name),
    rankFromElo,
    borderSrcFromElo,
  };
})();
