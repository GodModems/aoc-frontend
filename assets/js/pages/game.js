// game.html logic:
// - Renders the board.
// - Populates a simple move list with current-move navigation.

(function(){
  function buildBoard(el){
    if (!el) return;
    el.innerHTML = "";
    for (let r = 0; r < 8; r++){
      for (let c = 0; c < 8; c++){
        const sq = document.createElement("div");
        sq.className = "square " + (((r + c) % 2 === 0) ? "light" : "dark");

        // Empty board by default (replace with live game state)
        const piece = document.createElement("div");
        piece.className = "piece";
        piece.textContent = "";

        sq.appendChild(piece);
        el.appendChild(sq);
      }
    }
  }

  const movesEl = document.getElementById("moves");
  const moves = [
    { ply: 1, w: "e4", b: "d5", tW: "1.0s", tB: "7.4s" },
    { ply: 2, w: "Nf3", b: "dxe4", tW: "4.2s", tB: "3.8s" },
    { ply: 3, w: "Ng5", b: "Nf6", tW: "2.0s", tB: "1.9s" },
  ];

  let cursor = moves.length - 1; // current move

  function renderMoves(){
    if (!movesEl) return;
    movesEl.innerHTML = moves.map((m, idx) => `
      <div class="move">
        <div class="move__ply">${m.ply}.</div>
        <div>${idx === cursor ? `<span class="pill">${m.w}</span>` : m.w}</div>
        <div>${idx === cursor ? `<span class="pill">${m.b}</span>` : m.b}</div>
      </div>
    `).join("");
  }

  function clampCursor(){
    cursor = Math.max(0, Math.min(moves.length - 1, cursor));
  }

  document.getElementById("prevMove")?.addEventListener("click", () => {
    cursor -= 1; clampCursor(); renderMoves();
  });
  document.getElementById("nextMove")?.addEventListener("click", () => {
    cursor += 1; clampCursor(); renderMoves();
  });
  document.getElementById("jumpCurrent")?.addEventListener("click", () => {
    cursor = moves.length - 1; renderMoves();
  });

  buildBoard(document.getElementById("board"));
  renderMoves();

  if (window.AOC && typeof window.AOC.applySavedUsername === "function") window.AOC.applySavedUsername();
})();
