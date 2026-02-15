// assets/js/data/demo-seeds.js
// Temporary demo-only seeds (stand-in for database).
// Include this BEFORE home.js:
// <script src="assets/js/data/demo-seeds.js"></script>

(function () {
  window.AOC = window.AOC || {};
  window.AOC.Seeds = window.AOC.Seeds || {};

  // Current per-civ stats (current Elo, and cumulative W/D/L)
  window.AOC.Seeds.civStats = {
    traditional: { elo: 1200, w: 12, d: 3, l: 8 },
    vikings:     { elo: 1450, w: 7,  d: 1, l: 6 },
    chinese:     { elo: 1400, w: 4,  d: 2, l: 3 },
    britons:     { elo: 1300, w: 2,  d: 0, l: 1 },
    burgundians: { elo: 1100, w: 0,  d: 0, l: 0 },
    egyptians:   { elo: 1200, w: 0,  d: 0, l: 0 },
    french:      { elo: 1200, w: 0,  d: 0, l: 0 },
    huns:        { elo: 1200, w: 0,  d: 0, l: 0 },
    japanese:    { elo: 1200, w: 0,  d: 0, l: 0 },
    mongols:     { elo: 1200, w: 0,  d: 0, l: 0 },
    spanish:     { elo: 1200, w: 0,  d: 0, l: 0 },
    teutons:     { elo: 1200, w: 0,  d: 0, l: 0 },
  };

  // Match history should use the ELOs from THAT MATCH (not civStats).
  // Fields used by home.js:
  // id, ts, civId, oppCivId, oppName, selfElo, oppElo, selfColor, selfTimeLeft, oppTimeLeft, delta
  const now = Date.now();
  window.AOC.Seeds.matchHistory = [
    {
      id: "m1",
      ts: now - 1000 * 60 * 60 * 8,
      civId: "traditional",
      oppCivId: "vikings",
      oppName: "Opponent",
      selfElo: 1180,
      oppElo: 1320,
      selfColor: "white",
      selfTimeLeft: "4:12",
      oppTimeLeft: "0:31",
      delta: +24,
    },
    {
      id: "m2",
      ts: now - 1000 * 60 * 60 * 26,
      civId: "vikings",
      oppCivId: "britons",
      oppName: "Opponent",
      selfElo: 1400,
      oppElo: 1600,
      selfColor: "black",
      selfTimeLeft: "1:04",
      oppTimeLeft: "3:55",
      delta: -18,
    },
    {
      id: "m3",
      ts: now - 1000 * 60 * 60 * 72,
      civId: "chinese",
      oppCivId: "burgundians",
      oppName: "Opponent",
      selfElo: 1300,
      oppElo: 1900,
      selfColor: "white",
      selfTimeLeft: "0:58",
      oppTimeLeft: "0:58",
      delta: +3,
    },
  ];
})();
