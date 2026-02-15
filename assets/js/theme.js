// Theme + settings utilities (shared across pages).
// This runs without modules so you can open the HTML via file:// during mockup iteration.

(function(){
  const THEMES = [
    { id: "gold",        name: "Gold (Default)",  swatch: ["#e0c050", "#2a2a2a"] },
    { id: "royal-gold",  name: "Royal Gold",      swatch: ["#f2d36b", "#262626"] },
    { id: "emerald",     name: "Emerald",         swatch: ["#48d18a", "#262626"] },
    { id: "sapphire",    name: "Sapphire",        swatch: ["#62b7ff", "#262626"] },
    { id: "amethyst",    name: "Amethyst",        swatch: ["#c48bff", "#262626"] },
    { id: "crimson",     name: "Crimson",         swatch: ["#ff6a6a", "#262626"] },
  ];

  const STORAGE_THEME = "aoc_theme";
  const STORAGE_USER  = "aoc_username";

  function setTheme(themeId){
    document.documentElement.setAttribute("data-theme", themeId);
    localStorage.setItem(STORAGE_THEME, themeId);
    // update active tile (if modal exists on page)
    const grid = document.getElementById("themeGrid");
    if (!grid) return;
    grid.querySelectorAll(".theme").forEach(el => {
      el.classList.toggle("is-active", el.getAttribute("data-theme") === themeId);
    });
  }

  function applySavedTheme(){
    const saved = localStorage.getItem(STORAGE_THEME);
    if (saved) document.documentElement.setAttribute("data-theme", saved);
  }

  function setUsername(name){
    localStorage.setItem(STORAGE_USER, name);
    document.querySelectorAll("#usernameLabel").forEach(el => (el.textContent = name || "Username"));
  }

  function applySavedUsername(){
    const name = localStorage.getItem(STORAGE_USER) || "Username";
    document.querySelectorAll("#usernameLabel").forEach(el => (el.textContent = name));
    const input = document.getElementById("usernameInput");
    if (input) input.value = name === "Username" ? "" : name;
  }

  function openModal(){
    const modal = document.getElementById("settingsModal");
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal(){
    const modal = document.getElementById("settingsModal");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  function initThemeGrid(){
    const grid = document.getElementById("themeGrid");
    if (!grid) return;

    grid.innerHTML = THEMES.map(t => {
      const sw = `linear-gradient(90deg, ${t.swatch[0]}, ${t.swatch[0]} 55%, ${t.swatch[1]} 55%, ${t.swatch[1]})`;
      return `
        <button class="theme" type="button" data-theme="${t.id}">
          <div class="theme__swatch" style="background:${sw}"></div>
          <div class="theme__name">${t.name}</div>
        </button>
      `;
    }).join("");

    const current = document.documentElement.getAttribute("data-theme") || "gold";
    grid.querySelectorAll(".theme").forEach(btn => {
      btn.classList.toggle("is-active", btn.getAttribute("data-theme") === current);
      btn.addEventListener("click", () => setTheme(btn.getAttribute("data-theme")));
    });
  }

  function initModalWiring(){
    const openBtn = document.getElementById("openSettings");
    if (openBtn) openBtn.addEventListener("click", openModal);

    document.querySelectorAll("[data-close-modal]").forEach(el => {
      el.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

    const input = document.getElementById("usernameInput");
    if (input){
      input.addEventListener("input", () => setUsername(input.value.trim()));
    }
  }

  // Public helpers for other scripts (vanilla)
  window.AOC = window.AOC || {};
  window.AOC.setTheme = setTheme;
  window.AOC.applySavedTheme = applySavedTheme;
  window.AOC.applySavedUsername = applySavedUsername;
  window.AOC.initThemeGrid = initThemeGrid;
  window.AOC.initModalWiring = initModalWiring;

  // Initialize for any page that includes this script.
  applySavedTheme();
  initThemeGrid();
  applySavedUsername();
  initModalWiring();
})();
