(function () {
  window.AOC = window.AOC || {};
  const AOC = window.AOC;
  AOC.DATA = AOC.DATA || {};
  const DATA = AOC.DATA;

  // Build lookup maps once all data files have loaded
  DATA.CIVS_BY_ID = Object.fromEntries((DATA.CIVS || []).map(c => [c.id, c]));
  DATA.PIECES_BY_ID = Object.fromEntries((DATA.PIECES || []).map(p => [p.id, p]));
  DATA.EMOTES_BY_ID = Object.fromEntries((DATA.EMOTES || []).map(e => [e.id, e]));

  // Public helpers
  AOC.listCivs = () => (DATA.CIVS || []).slice();
  AOC.getCiv   = (id) => DATA.CIVS_BY_ID?.[id] || null;

  AOC.listPieces = () => (DATA.PIECES || []).slice();
  AOC.getPiece   = (id) => DATA.PIECES_BY_ID?.[id] || null;

  AOC.listEmotes = () => (DATA.EMOTES || []).slice();
  AOC.getEmote   = (id) => DATA.EMOTES_BY_ID?.[id] || null;
})();
