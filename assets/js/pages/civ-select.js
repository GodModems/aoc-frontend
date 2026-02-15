// civ-select.html logic:
// - Same civ dropdown as index page.
// - Renders a chessboard preview in the center panel.

(function(){
  function buildBoard(el){
    if (!el) return;
    el.innerHTML = "";
    for (let r = 0; r < 8; r++){
      for (let c = 0; c < 8; c++){
        const sq = document.createElement("div");
        sq.className = "square " + (((r + c) % 2 === 0) ? "light" : "dark");

        // very small “mock” starting position (replace with your own assets)
        const piece = document.createElement("div");
        piece.className = "piece";

        const isBackRank = (r === 7);
        const isPawnRank = (r === 6);
        if (isPawnRank) piece.textContent = "♙";
        else if (isBackRank){
          const back = ["♖","♘","♗","♕","♔","♗","♘","♖"];
          piece.textContent = back[c];
        } else {
          piece.textContent = "";
        }

        sq.appendChild(piece);
        el.appendChild(sq);
      }
    }
  }

  // Civ select dropdown wiring (same implementation as index, minimal duplication).
  const CIVS = [
    { id: "traditional", name: "Traditional", icon: "♔" },
    { id: "vikings", name: "Vikings", icon: "⚔" },
    { id: "chinese", name: "Chinese", icon: "龍" },
    { id: "burgundians", name: "Burgundians", icon: "✠" },
    { id: "teutons", name: "Teutons", icon: "✠" },
    { id: "japanese", name: "Japanese", icon: "⛩" },
  ];

  function initCivSelect(){
    const btn = document.getElementById("civSelectBtn");
    const menu = document.getElementById("civSelectMenu");
    const label = document.getElementById("civSelectLabel");
    if (!btn || !menu || !label) return;

    menu.innerHTML = CIVS.map(c => `
      <div class="option" role="option" data-id="${c.id}">
        <div class="option__badge">${c.icon}</div>
        <div>${c.name}</div>
      </div>
    `).join("");

    const select = btn.closest(".select");
    function close(){
      select.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    }
    btn.addEventListener("click", () => {
      const open = select.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    menu.addEventListener("click", (e) => {
      const opt = e.target.closest(".option");
      if (!opt) return;
      const id = opt.getAttribute("data-id");
      const civ = CIVS.find(x => x.id === id);
      if (!civ) return;
      label.textContent = civ.name;
      close();
    });

    document.addEventListener("click", (e) => {
      if (!select.contains(e.target)) close();
    });
  }

  buildBoard(document.getElementById("board"));
  initCivSelect();

  // Apply saved settings (theme.js already applies on load, but username label exists here too)
  if (window.AOC && typeof window.AOC.applySavedUsername === "function") window.AOC.applySavedUsername();
})();
