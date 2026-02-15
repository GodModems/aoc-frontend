// assets/js/pages/home.js
// index.html logic:
// - Center panel stays constant.
// - Left/Right panels swap content based on selected tab (Profile / Leaderboard / Shop).
// - Uses civs.js as source of truth for civ metadata.
// - Uses demo-seeds.js (or future DB) for civStats + matchHistory + leaderboard.

(function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  function boot() {
    window.AOC = window.AOC || {};

    // --- DOM refs ---
    const leftTitle = document.getElementById("leftTitle");
    const rightTitle = document.getElementById("rightTitle");
    const leftBody = document.getElementById("leftBody");
    const rightBody = document.getElementById("rightBody");
    const usernameLabel = document.getElementById("usernameLabel");

    if (!leftTitle || !rightTitle || !leftBody || !rightBody) {
      console.warn("[AoC] Missing required panel elements. Check ids: leftTitle/rightTitle/leftBody/rightBody");
      return;
    }

    // =========================================================
    // KEYS / STATE
    // =========================================================
    const STATE_KEY = "aoc_home_state_v1";
    const LB_STATE_KEY = "aoc_lb_state_v1";

    function loadState() {
      let s = null;
      try {
        s = JSON.parse(localStorage.getItem(STATE_KEY) || "null");
      } catch {}
      if (!s || typeof s !== "object") s = {};
      return {
        selectedCivId: typeof s.selectedCivId === "string" ? s.selectedCivId : null,
        selectedMatchId: typeof s.selectedMatchId === "string" ? s.selectedMatchId : null,
      };
    }

    function saveState(next) {
      const cur = loadState();
      const merged = { ...cur, ...(next || {}) };
      localStorage.setItem(STATE_KEY, JSON.stringify(merged));
      return merged;
    }

    function normalizeMode(v) {
      const s = String(v || "").trim().toLowerCase();
      return s === "empires" ? "empires" : "classic";
    }

    function loadLbState() {
      let st = null;
      try {
        st = JSON.parse(localStorage.getItem(LB_STATE_KEY) || "null");
      } catch {}
      if (!st || typeof st !== "object") st = {};

      const left = st.left && typeof st.left === "object" ? st.left : {};
      const right = st.right && typeof st.right === "object" ? st.right : {};

      return {
        left: {
          mode: normalizeMode(left.mode || "classic"),
          civId: typeof left.civId === "string" ? left.civId : "",
        },
        right: {
          mode: normalizeMode(right.mode || "empires"),
          civId: typeof right.civId === "string" ? right.civId : "",
        },
      };
    }

    function saveLbState(st) {
      localStorage.setItem(LB_STATE_KEY, JSON.stringify(st));
    }

    function setLbSide(side, patch) {
      const st = loadLbState();
      st[side] = { ...st[side], ...patch };
      st[side].mode = normalizeMode(st[side].mode);
      st[side].civId = st[side].civId || "";
      saveLbState(st);
    }

    // =========================================================
    // UTILITIES
    // =========================================================
    function escapeHtml(s) {
      return String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    function clampNum(v, fallback = 0) {
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    }

    function fmtPct(part, total) {
      const p = clampNum(part, 0);
      const t = clampNum(total, 0);
      if (t <= 0) return "0%";
      return `${Math.round((p / t) * 100)}%`;
    }

    function toSelfColor(v) {
      const s = String(v ?? "").trim().toLowerCase();
      if (s === "black" || s === "b" || s === "1" || s === "dark") return "black";
      if (s === "white" || s === "w" || s === "0" || s === "light") return "white";
      return "white";
    }

    function deltaClass(n) {
      const num = clampNum(n, 0);
      if (num > 0) return "pos";
      if (num < 0) return "neg";
      return "neu";
    }

    function fmtDelta(n) {
      const num = clampNum(n, 0);
      return num > 0 ? `+${num}` : `${num}`;
    }

    // =========================================================
    // DATA SOURCES
    // =========================================================
    let warnedMissingSeeds = false;

    function getCivs() {
      const civs = window.AOC?.DATA?.CIVS;
      if (Array.isArray(civs) && civs.length) return civs;

      const fn = window.AOC?.listCivs;
      if (typeof fn === "function") {
        const out = fn();
        if (Array.isArray(out) && out.length) return out;
      }

      return [];
    }

    function civByIdMap(civs) {
      return Object.fromEntries((civs || []).map((c) => [c.id, c]));
    }

    // demo-seeds.js (temporary) — later replace with DB fetch
    function getSeedsRoot() {
      const root = window.AOC?.Seeds || window.AOC?.SEEDS || window.AOC?.SEED;
      if (!root && !warnedMissingSeeds) {
        warnedMissingSeeds = true;
        console.warn("[AoC] demo-seeds.js not loaded (window.AOC.Seeds missing). Using empty seeds.");
      }
      return root || {};
    }

    function getCivStatsSeed() {
      const s = getSeedsRoot().civStats;
      return s && typeof s === "object" ? s : {};
    }

    function getMatchHistorySeed() {
      const arr = getSeedsRoot().matchHistory;
      return Array.isArray(arr) ? arr : [];
    }

    function getLeaderboardSeed(mode) {
      const key = normalizeMode(mode);
      const seeded = getSeedsRoot()?.leaderboard?.[key];
      if (Array.isArray(seeded)) return seeded;
      return null;
    }

    // ranks.js integration
    function borderFromElo(elo) {
      const n = clampNum(elo, NaN);
      const fn = window.AOC?.Ranks?.borderSrcFromElo;
      if (typeof fn === "function" && Number.isFinite(n)) return fn(n);
      return "assets/ui/borders/wood.svg";
    }

    // =========================================================
    // WDL RENDERING (no flex shift: fixed-width swap)
    // =========================================================
    function wdlTripletHTML(w, d, l, extraClass) {
      const ww = clampNum(w, 0);
      const dd = clampNum(d, 0);
      const ll = clampNum(l, 0);
      const t = ww + dd + ll;

      // The swap block uses fixed width and absolute overlay so switching
      // count <-> pct doesn't reflow other columns.
      function swapHTML(value, pct) {
        return `
          <span class="wdl__swap" style="position:relative;display:inline-block;width:4ch;height:1em;vertical-align:baseline;">
            <span class="wdl__count" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:1;transition:opacity 120ms linear;">${escapeHtml(
              String(value)
            )}</span>
            <span class="wdl__pct" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 120ms linear;">${escapeHtml(
              String(pct)
            )}</span>
            <span style="visibility:hidden;">100%</span>
          </span>
        `;
      }

      return `
        <span class="${escapeHtml(extraClass || "")} wdl-wrap" data-mode="count" data-w="${ww}" data-d="${dd}" data-l="${ll}" data-t="${t}">
          <span class="wdl w" style="color: var(--elo-gain);">${swapHTML(ww, fmtPct(ww, t))}</span>
          <span class="wdl sep" style="color: var(--muted);">·</span>
          <span class="wdl d" style="color: var(--muted);">${swapHTML(dd, fmtPct(dd, t))}</span>
          <span class="wdl sep" style="color: var(--muted);">·</span>
          <span class="wdl l" style="color: var(--elo-lose);">${swapHTML(ll, fmtPct(ll, t))}</span>
        </span>
      `;
    }

    function setWdlMode(wdlEl, mode) {
      if (!wdlEl) return;
      if (wdlEl.getAttribute("data-mode") === mode) return;

      wdlEl.setAttribute("data-mode", mode);
      const showPct = mode === "pct";

      wdlEl.querySelectorAll(".wdl__count").forEach((el) => (el.style.opacity = showPct ? "0" : "1"));
      wdlEl.querySelectorAll(".wdl__pct").forEach((el) => (el.style.opacity = showPct ? "1" : "0"));
    }

    // =========================================================
    // BASE (fallback) LEFT/RIGHT
    // =========================================================
    function renderEmotes() {
      const cells = Array.from({ length: 15 }, () => '<button class="emote" type="button"></button>').join("");
      leftBody.innerHTML = `<div class="emote-grid">${cells}</div>`;
    }

    function renderRules() {
      rightBody.innerHTML = `
        <div class="centerwide__info">
          <div class="kicker">Selected Civ</div>
          <div class="bigline" id="selectedCivName">Traditional</div>
          <div class="kicker" style="margin-top:16px;">Civ Rules</div>
          <div class="muted">Placeholder rules panel. Populate from your real data source.</div>
        </div>
      `;
    }

    // =========================================================
    // PROFILE
    // =========================================================
    function matchCardHTML({
      m,
      username,
      selfElo,
      oppElo,
      selfTimeLeft,
      oppTimeLeft,
      selfDelta,
      oppDelta,
      selfColor,
      isActive,
      selfCivIcon,
      oppCivIcon,
    }) {
      const safeColor = selfColor === "black" ? "black" : "white";

      const selfBorderSrc = borderFromElo(selfElo);
      const oppBorderSrc = borderFromElo(oppElo);

      return `
        <button class="mh-card ${isActive ? "is-active" : ""} self-${escapeHtml(safeColor)}" type="button"
          data-match="${escapeHtml(m.id)}"
          data-self-color="${escapeHtml(safeColor)}"
        >
          <div class="mh-card__inner">
            <div class="mh-side mh-side--left">
              <div class="mh-avatar" aria-hidden="true">
                <img class="mh-avatar__civ" src="${escapeHtml(selfCivIcon)}" alt="">
                <img class="mh-avatar__border" src="${escapeHtml(selfBorderSrc)}" alt="">
              </div>
              <div class="mh-meta">
                <div class="mh-name">${escapeHtml(username)}</div>
                <div class="mh-line">${escapeHtml(String(selfElo ?? "—"))}</div>
                <div class="mh-line">${escapeHtml(selfTimeLeft ?? "—")}</div>
              </div>
            </div>

            <div class="mh-center" aria-hidden="true">
              <div class="mh-delta ${deltaClass(selfDelta)}">${fmtDelta(selfDelta)}</div>
              <div class="mh-delta ${deltaClass(oppDelta)}">${fmtDelta(oppDelta)}</div>
            </div>

            <div class="mh-side mh-side--right">
              <div class="mh-meta">
                <div class="mh-name">${escapeHtml(m.oppName || "Opponent")}</div>
                <div class="mh-line">${escapeHtml(String(oppElo ?? "—"))}</div>
                <div class="mh-line">${escapeHtml(oppTimeLeft ?? "—")}</div>
              </div>
              <div class="mh-avatar" aria-hidden="true">
                <img class="mh-avatar__civ" src="${escapeHtml(oppCivIcon)}" alt="">
                <img class="mh-avatar__border" src="${escapeHtml(oppBorderSrc)}" alt="">
              </div>
            </div>
          </div>
        </button>
      `;
    }

    function renderProfile() {
      const username = localStorage.getItem("aoc_username") || "Username";
      const civs = getCivs();
      const civById = civByIdMap(civs);

      leftTitle.textContent = "Civ Stats";
      rightTitle.textContent = "Match History";

      if (!civs.length) {
        leftBody.innerHTML = `<div class="empty">No civ data loaded. Ensure civs.js is included before home.js.</div>`;
        rightBody.innerHTML = `<div class="empty">No civ data loaded. Ensure civs.js is included before home.js.</div>`;
        return;
      }

      const civStatsSeed = getCivStatsSeed(); // current per-civ stats ONLY
      const matchHistorySeed = getMatchHistorySeed(); // match history ONLY

      const state0 = loadState();
      const state =
        state0.selectedCivId && !civById[state0.selectedCivId]
          ? saveState({ selectedCivId: null })
          : state0;

      // ---- Civ Stats (left) ----
      leftBody.innerHTML = `
        <div class="civstats-grid" id="civStatsGrid">
          ${civs
            .map((civ) => {
              const s = civStatsSeed[civ.id] || {};
              const elo = clampNum(s.elo, 1200);
              const w = clampNum(s.w, 0);
              const d = clampNum(s.d, 0);
              const l = clampNum(s.l, 0);

              const active = state.selectedCivId === civ.id ? "is-active" : "";
              const borderSrc = borderFromElo(elo);

              return `
                <div class="civstat ${active}" data-civ="${escapeHtml(civ.id)}">
                  <div class="civstat__icon" aria-hidden="true">
                    <img class="civstat__civ" src="${escapeHtml(civ.icon)}" alt="">
                    <img class="civstat__border" src="${escapeHtml(borderSrc)}" alt="">
                  </div>
                  <div class="civstat__meta">
                    <div class="civstat__name">${escapeHtml(civ.name)}</div>
                    <div class="civstat__sub">
                      <img class="civstat__crown" src="assets/ui/misc/crown.svg" alt="">
                      <span class="civstat__elo">${escapeHtml(String(elo))}</span>
                    </div>
                    <div class="civstat__wdl" aria-label="Wins, draws, losses">
                      ${wdlTripletHTML(w, d, l, "civ-wdl")}
                    </div>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      `;

      // Hover -> swap counts to percentages (per civ tile)
      const civGrid = document.getElementById("civStatsGrid");
      if (civGrid) {
        civGrid.querySelectorAll(".civstat").forEach((cell) => {
          const wdl = cell.querySelector(".wdl-wrap");
          if (!wdl) return;
          cell.addEventListener("mouseenter", () => setWdlMode(wdl, "pct"));
          cell.addEventListener("mouseleave", () => setWdlMode(wdl, "count"));
        });

        // Click -> toggle civ filter for match history
        civGrid.addEventListener("click", (e) => {
          const cell = e.target.closest(".civstat");
          if (!cell) return;
          const civId = cell.getAttribute("data-civ");
          if (!civId) return;

          const cur = loadState().selectedCivId;
          const nextSelected = cur === civId ? null : civId;
          saveState({ selectedCivId: nextSelected, selectedMatchId: null });
          renderProfile();
        });
      }

      // ---- Match History (right) ----
      const filtered = state.selectedCivId
        ? matchHistorySeed.filter((m) => m && m.civId === state.selectedCivId)
        : matchHistorySeed.slice();

      const ordered = filtered
        .filter((m) => m && typeof m === "object" && m.id)
        .slice()
        .sort((a, b) => clampNum(b?.ts, 0) - clampNum(a?.ts, 0));

      // Maintain selected card within current filter
      let selectedMatchId = state.selectedMatchId;
      if (selectedMatchId && !ordered.some((m) => m.id === selectedMatchId)) selectedMatchId = null;
      if (!selectedMatchId && ordered[0]?.id) selectedMatchId = ordered[0].id;
      if (selectedMatchId !== state.selectedMatchId) saveState({ selectedMatchId });

      const fallbackIcon = "assets/ui/emblems/traditional.png";

      rightBody.innerHTML = `
        <div class="mh-list" id="matchCardList">
          ${
            ordered.length === 0
              ? `<div class="empty">No matches yet.</div>`
              : ordered
                  .map((m) => {
                    const selfColor = toSelfColor(m.selfColor ?? m.playerColor ?? m.color ?? m.side ?? m.youColor);

                    const selfDelta = clampNum(m.delta, 0);
                    const oppDelta = -selfDelta;

                    // IMPORTANT: match history ELO comes from the match seed, not civStats
                    const selfElo =
                      m.selfElo != null ? clampNum(m.selfElo, 0) : m.elo != null ? clampNum(m.elo, 0) : "—";
                    const oppElo = m.oppElo != null ? clampNum(m.oppElo, 0) : "—";

                    const selfTimeLeft = m.selfTimeLeft ?? "—";
                    const oppTimeLeft = m.oppTimeLeft ?? "—";

                    const selfCivIcon = civById[m.civId]?.icon ?? fallbackIcon;

                    const oppCivId = m.oppCivId ?? m.opponentCivId ?? m.oppCiv ?? null;
                    const oppCivIcon = oppCivId && civById[oppCivId]?.icon ? civById[oppCivId].icon : fallbackIcon;

                    return matchCardHTML({
                      m,
                      username,
                      selfElo,
                      oppElo,
                      selfTimeLeft,
                      oppTimeLeft,
                      selfDelta,
                      oppDelta,
                      selfColor,
                      isActive: m.id === selectedMatchId,
                      selfCivIcon,
                      oppCivIcon,
                    });
                  })
                  .join("")
          }
        </div>
      `;

      const cardList = document.getElementById("matchCardList");
      if (cardList) {
        cardList.addEventListener("click", (e) => {
          const card = e.target.closest(".mh-card");
          if (!card) return;
          const matchId = card.getAttribute("data-match");
          if (!matchId) return;
          saveState({ selectedMatchId: matchId });
          renderProfile();
        });
      }
    }

    // =========================================================
    // LEADERBOARD (mode + civ controls, scrollable)
    // =========================================================
    function listCivsForUI() {
      const arr = window.AOC?.listCivs?.();
      return Array.isArray(arr) ? arr : getCivs();
    }

    function getLeaderboardRows(mode) {
      const seeded = getLeaderboardSeed(mode);
      if (Array.isArray(seeded)) return seeded;

      // fallback demo (100 rows)
      const civs = listCivsForUI();
      const pick = (i) => (civs[i % Math.max(1, civs.length)]?.id || "traditional");

      return Array.from({ length: 100 }, (_, i) => {
        const rank = i + 1;
        const elo = 2200 - i * 7;
        const w = 30 - Math.floor(i / 4);
        const d = 3 + (i % 4);
        const l = 10 + Math.floor(i / 5);
        return { rank, name: "Username", civId: pick(i), w, d, l, elo };
      });
    }

    function leaderboardPanelHTML(side) {
      const st = loadLbState();
      const sideState = st[side];
      const mode = normalizeMode(sideState.mode);
      const civId = sideState.civId || "";

      const civs = listCivsForUI();
      const rows0 = getLeaderboardRows(mode);

      const rows = rows0
        .filter((r) => !civId || r.civId === civId)
        .slice()
        .sort((a, b) => (clampNum(b.elo, 0) - clampNum(a.elo, 0)))
        .slice(0, 100);

      const modeLabel = mode === "empires" ? "Empires" : "Classic";

      return `
        <div class="lb-wrap" data-lb-side="${escapeHtml(side)}">
          <div class="lb-controls">
            <div style="display:flex; gap:10px; align-items:center;">
              <div class="kicker">Mode</div>
              <select class="lb-mode-filter" aria-label="Select leaderboard mode">
                <option value="classic" ${mode === "classic" ? "selected" : ""}>Classic</option>
                <option value="empires" ${mode === "empires" ? "selected" : ""}>Empires</option>
              </select>
            </div>

            <div style="display:flex; gap:10px; align-items:center;">
              <div class="kicker">Civilization</div>
              <select class="lb-civ-filter" aria-label="Filter leaderboard by civilization">
                <option value="" ${civId ? "" : "selected"}>All Civs</option>
                ${civs
                  .map(
                    (c) => `
                  <option value="${escapeHtml(c.id)}" ${civId === c.id ? "selected" : ""}>
                    ${escapeHtml(c.name)}
                  </option>
                `
                  )
                  .join("")}
              </select>
            </div>
          </div>

          <div class="lb-scroll">
            <table class="table leaderboard-table" data-leaderboard="1">
              <thead>
                <tr><th colspan="4">${escapeHtml(modeLabel)} Leaderboard</th></tr>
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>
                    <span class="wdl-head" aria-label="Wins, draws, losses">
                      <span class="wdl w">W</span>
                      <span class="wdl sep">·</span>
                      <span class="wdl d">D</span>
                      <span class="wdl sep">·</span>
                      <span class="wdl l">L</span>
                    </span>
                  </th>
                  <th>Crowns</th>
                </tr>
              </thead>
              <tbody>
                ${
                  rows.length === 0
                    ? `<tr><td colspan="4" class="muted">No entries.</td></tr>`
                    : rows
                        .map(
                          (r) => `
                    <tr data-wdl="1">
                      <td>${escapeHtml(String(r.rank))}.</td>
                      <td>${escapeHtml(String(r.name))}</td>
                      <td>${wdlTripletHTML(r.w, r.d, r.l, "lb-wdl")}</td>
                      <td>${escapeHtml(String(r.elo))}</td>
                    </tr>
                  `
                        )
                        .join("")
                }
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    function ensureLeaderboardDelegates(rootEl) {
      if (!rootEl) return;
      if (rootEl.dataset.lbDelegates === "1") return;
      rootEl.dataset.lbDelegates = "1";

      // Mode/civ selects (delegated)
      rootEl.addEventListener("change", (e) => {
        const panel = e.target.closest("[data-lb-side]");
        if (!panel) return;

        const side = panel.getAttribute("data-lb-side");
        if (side !== "left" && side !== "right") return;

        if (e.target.matches(".lb-mode-filter")) {
          setLbSide(side, { mode: e.target.value });
          renderLeaderboard();
          return;
        }

        if (e.target.matches(".lb-civ-filter")) {
          setLbSide(side, { civId: e.target.value });
          renderLeaderboard();
          return;
        }
      });

      // WDL hover -> % (delegated, no reflow)
      rootEl.addEventListener("mouseover", (e) => {
        const row = e.target.closest("tr[data-wdl='1']");
        if (!row || !rootEl.contains(row)) return;

        const rel = e.relatedTarget;
        if (rel && row.contains(rel)) return;

        const wdl = row.querySelector(".wdl-wrap");
        setWdlMode(wdl, "pct");
      });

      rootEl.addEventListener("mouseout", (e) => {
        const row = e.target.closest("tr[data-wdl='1']");
        if (!row || !rootEl.contains(row)) return;

        const rel = e.relatedTarget;
        if (rel && row.contains(rel)) return;

        const wdl = row.querySelector(".wdl-wrap");
        setWdlMode(wdl, "count");
      });
    }

    function renderLeaderboard() {
      const st = loadLbState();

      const leftModeLabel = st.left.mode === "empires" ? "Empires" : "Classic";
      const leftCivLabel = st.left.civId === "" ? "All Civs" : st.left.civId
      const rightModeLabel = st.right.mode === "empires" ? "Empires" : "Classic";
      const rightCivLabel = st.right.civId === "" ? "All Civs" : st.right.civId

      leftTitle.textContent = `${leftModeLabel} ${leftCivLabel}`;
      leftBody.innerHTML = leaderboardPanelHTML("left");
      ensureLeaderboardDelegates(leftBody);

      rightTitle.textContent = `${rightModeLabel} ${rightCivLabel}`;
      rightBody.innerHTML = leaderboardPanelHTML("right");
      ensureLeaderboardDelegates(rightBody);
    }

    // =========================================================
    // SHOP (mock)
    // =========================================================
    function renderShop() {
      leftTitle.textContent = "Items";
      leftBody.innerHTML = `
        <div class="shopgrid" id="shopGrid">
          ${Array.from(
            { length: 9 },
            (_, i) => `
            <button class="shopitem" type="button" data-item="${i}">
              <div class="shopthumb"></div>
              <div class="shopprice">[price]</div>
            </button>
          `
          ).join("")}
        </div>
      `;

      rightTitle.textContent = "[Selected Item]";
      rightBody.innerHTML = `
        <div class="centerwide__info" style="text-align:center;">
          <div class="shopthumb" style="margin: 10px auto; width: 60%;"></div>
          <div class="rule" style="width: 70%; margin: 16px auto;"></div>
          <div class="bigline" id="itemName">[Item Name]</div>
          <div class="kicker" id="itemCost" style="margin-top: 6px;">[Item Cost]</div>
          <button class="btn btn--purchase" type="button" style="margin-top: 22px; background: var(--accent); color:#111; font-size: 34px;">Purchase</button>
        </div>
      `;

      const grid = document.getElementById("shopGrid");
      if (grid) {
        grid.addEventListener("click", (e) => {
          const btn = e.target.closest(".shopitem");
          if (!btn) return;

          const idx = btn.getAttribute("data-item");
          const itemName = document.getElementById("itemName");
          const itemCost = document.getElementById("itemCost");

          if (itemName) itemName.textContent = `Item #${idx}`;
          if (itemCost) itemCost.textContent = `$${(Number(idx) + 1) * 2}.99`;
        });
      }
    }

    // =========================================================
    // TAB SYSTEM
    // =========================================================
    function setTab(tab) {
      document.querySelectorAll("[data-tab]").forEach((b) => {
        b.classList.toggle("is-active", b.getAttribute("data-tab") === tab);
      });

      if (tab === "profile") return renderProfile();
      if (tab === "leaderboard") return renderLeaderboard();
      if (tab === "shop") return renderShop();

      leftTitle.textContent = "Emotes";
      rightTitle.textContent = "Civ Rules";
      renderEmotes();
      renderRules();
    }

    function initTabs() {
      document.querySelectorAll("[data-tab]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const tab = btn.getAttribute("data-tab");
          location.hash = tab;
          setTab(tab);
        });
      });

      const initial = (location.hash || "").replace("#", "");
      setTab(initial || "profile");
    }

    // =========================================================
    // CIV SELECT (kept for now; not the focus)
    // =========================================================
    function initCivSelect() {
      const btn = document.getElementById("civSelectBtn");
      const menu = document.getElementById("civSelectMenu");
      const label = document.getElementById("civSelectLabel");
      if (!btn || !menu || !label) return;

      const civs = typeof window.AOC?.listCivs === "function" ? window.AOC.listCivs() || [] : [];
      if (!Array.isArray(civs) || !civs.length) return;

      menu.innerHTML = civs
        .map(
          (c) => `
        <div class="option" role="option" data-id="${escapeHtml(c.id)}">
          <div class="option__badge"><img class="badge-img" src="${escapeHtml(c.icon)}" alt=""></div>
          <div>${escapeHtml(c.name)}</div>
        </div>
      `
        )
        .join("");

      const select = btn.closest(".select");
      if (!select) return;

      function close() {
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
        const civ = civs.find((x) => x.id === id);
        if (!civ) return;

        label.textContent = civ.name;

        const nameEl = document.getElementById("selectedCivName");
        if (nameEl) nameEl.textContent = civ.name;

        close();
      });

      document.addEventListener("click", (e) => {
        if (!select.contains(e.target)) close();
      });
    }

    function initUserLabel() {
      if (!usernameLabel) return;
      usernameLabel.textContent = localStorage.getItem("aoc_username") || "Username";
    }

    // =========================================================
    // BOOT
    // =========================================================
    try {
      renderEmotes();
      renderRules();
      initUserLabel();
      initTabs();
      initCivSelect();

      // bind delegates once (leaderboard handlers are delegated on bodies)
      ensureLeaderboardDelegates(leftBody);
      ensureLeaderboardDelegates(rightBody);
    } catch (err) {
      console.error("[AoC] home.js boot error:", err);
    }
  }
})();
