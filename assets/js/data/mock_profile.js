// assets/js/data/mock_profile.js
// TEMP: local mock seeds for profile (replace with DB later)
//
// Include BEFORE home.js:
//   <script src="assets/js/data/mock_profile.js"></script>

(function () {
  window.AOC = window.AOC || {};
  window.AOC.Mock = window.AOC.Mock || {};

  // Helper: safe int
  function i(n, fallback = 0) {
    const v = Number(n);
    return Number.isFinite(v) ? Math.trunc(v) : fallback;
  }

  // Creates demo civStats + matchHistory.
  // Pass civs list so icons/ids stay in sync with your real civ list.
  window.AOC.Mock.profileSeed = function profileSeed({ civs } = {}) {
    const now = Date.now();

    const civList = Array.isArray(civs) ? civs : [];
    const has = (id) => civList.some((c) => c && c.id === id);

    // Seed a few civs with variety; everything else will be defaulted by home.js
    const civStats = {};
    function set(id, elo, w, d, l) {
      if (!id || !has(id)) return;
      civStats[id] = { elo: i(elo, 1200), w: i(w), d: i(d), l: i(l) };
    }

    set("traditional", 1620, 18, 3, 9);
    set("vikings", 1475, 22, 2, 11);
    set("chinese", 1605, 31, 4, 17);
    set("britons", 1210, 9, 1, 10);
    set("burgundians", 1750, 40, 5, 20);

    // Match seeds (most recent should have largest ts)
    // Fields used by home.js:
    // - id, ts, civId, oppCivId, oppName, delta, selfColor, selfTimeLeft, oppTimeLeft
    // Optional:
    // - selfElo, oppElo (lets borders reflect actual match ranks)
    const matchHistory = [
      {
        id: "m1",
        ts: now - 1000 * 60 * 60 * 2,
        mode: "Classic",
        civId: "traditional",
        oppCivId: "vikings",
        oppName: "Opponent",
        delta: +24,
        selfColor: "white",
        selfTimeLeft: "4:12",
        oppTimeLeft: "0:31",
        selfElo: 1320,
        oppElo: 1475,
      },
      {
        id: "m2",
        ts: now - 1000 * 60 * 60 * 9,
        mode: "Empires",
        civId: "vikings",
        oppCivId: "britons",
        oppName: "Opponent",
        delta: -18,
        selfColor: "black",
        selfTimeLeft: "1:04",
        oppTimeLeft: "3:55",
        selfElo: 1475,
        oppElo: 1210,
      },
      {
        id: "m3",
        ts: now - 1000 * 60 * 60 * 26,
        mode: "Classic",
        civId: "chinese",
        oppCivId: "burgundians",
        oppName: "Opponent",
        delta: +3,
        selfColor: "white",
        selfTimeLeft: "0:58",
        oppTimeLeft: "0:58",
        selfElo: 1500,
        oppElo: 2200,
      },
      {
        id: "m4",
        ts: now - 1000 * 60 * 60 * 48,
        mode: "Empires",
        civId: "burgundians",
        oppCivId: "traditional",
        oppName: "Opponent",
        delta: +16,
        selfColor: "black",
        selfTimeLeft: "2:22",
        oppTimeLeft: "0:12",
        selfElo: 1750,
        oppElo: 700,
      },
      {
        id: "m5",
        ts: now - 1000 * 60 * 60 * 72,
        mode: "Classic",
        civId: "britons",
        oppCivId: "chinese",
        oppName: "Opponent",
        delta: -9,
        selfColor: "white",
        selfTimeLeft: "0:05",
        oppTimeLeft: "2:47",
        selfElo: 1210,
        oppElo: 1605,
      },
    ];

    return { civStats, matchHistory };
  };
})();
