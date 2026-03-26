// ============================================================================
//
//  EUREKA LABS — HOME PAGE RENDERING (app.js)
//
//  Reads data from data.js and renders the home page:
//  search, sort, filters, lab catalog list, and team grid.
//
//  You should NOT need to edit this file — edit data.js instead.
//
// ============================================================================


// --- State ------------------------------------------------------------------

let activeCat   = "all";
let activeLevel = "all";
let activeSort  = "alpha";
let searchQuery = "";


// --- Search & Sort ----------------------------------------------------------

function buildSearchSort() {
  const searchEl = document.getElementById("lab-search");
  const sortEl   = document.getElementById("sort-controls");

  searchEl.addEventListener("input", function() {
    searchQuery = this.value.trim().toLowerCase();
    renderLabs();
  });

  sortEl.addEventListener("click", function(e) {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    activeSort = btn.dataset.sort;
    sortEl.querySelectorAll(".filter-btn").forEach(function(b) { b.setAttribute("aria-pressed", "false"); });
    btn.setAttribute("aria-pressed", "true");
    renderLabs();
  });
}


// --- Filters ----------------------------------------------------------------

function buildFilters() {
  const catEl   = document.getElementById("cat-filters");
  const levelEl = document.getElementById("level-filters");

  let catHTML = '<button class="filter-btn" aria-pressed="true" data-cat="all">All</button>';
  Object.keys(CATEGORIES).forEach(function(id) {
    catHTML += '<button class="filter-btn" aria-pressed="false" data-cat="' + id + '">' + esc(CATEGORIES[id].label) + '</button>';
  });
  catEl.innerHTML = catHTML;

  let levelHTML = '<button class="filter-btn" aria-pressed="true" data-level="all">All</button>';
  Object.keys(LEVELS).forEach(function(lvl) {
    levelHTML += '<button class="filter-btn" aria-pressed="false" data-level="' + lvl + '">' + esc(LEVELS[lvl].label) + '</button>';
  });
  levelEl.innerHTML = levelHTML;

  catEl.addEventListener("click", function(e) {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    activeCat = btn.dataset.cat;
    catEl.querySelectorAll(".filter-btn").forEach(function(b) { b.setAttribute("aria-pressed", "false"); });
    btn.setAttribute("aria-pressed", "true");
    renderLabs();
  });

  levelEl.addEventListener("click", function(e) {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    activeLevel = btn.dataset.level;
    levelEl.querySelectorAll(".filter-btn").forEach(function(b) { b.setAttribute("aria-pressed", "false"); });
    btn.setAttribute("aria-pressed", "true");
    renderLabs();
  });
}


// --- Lab List ---------------------------------------------------------------

function renderLabs() {
  const listEl  = document.getElementById("labs-list");
  const countEl = document.getElementById("labs-count");
  const emptyEl = document.getElementById("no-results");

  // 1. Filter by category and level
  let results = LABS.filter(function(lab) {
    const catOk   = activeCat   === "all" || lab.categories.indexOf(activeCat) !== -1;
    const levelOk = activeLevel === "all" || lab.level === activeLevel;
    return catOk && levelOk;
  });

  // 2. Filter by search query (matches title, description, authors)
  if (searchQuery) {
    const words = searchQuery.split(/\s+/);
    results = results.filter(function(lab) {
      const haystack = [lab.title, lab.description, lab.authors]
        .filter(Boolean).join(" ").toLowerCase();
      return words.every(function(word) { return haystack.includes(word); });
    });
  }

  // 3. Sort
  results = results.slice().sort(function(a, b) {
    if (activeSort === "alpha")  return a.title.localeCompare(b.title);
    if (activeSort === "newest") return new Date(b.updated) - new Date(a.updated);
    if (activeSort === "oldest") return new Date(a.updated) - new Date(b.updated);
    return 0;
  });

  countEl.textContent = results.length + " lab" + (results.length !== 1 ? "s" : "");

  if (results.length === 0) {
    listEl.classList.add("hidden");
    emptyEl.style.display = "block";
    return;
  }

  listEl.classList.remove("hidden");
  emptyEl.style.display = "none";

  listEl.innerHTML = results.map(function(lab) {
    const catTags = lab.categories.map(function(catId) {
      const c = CATEGORIES[catId] || { label: catId, color: "#666", bg: "#eee" };
      return tagHTML(c.label, c.color, c.bg);
    }).join("");

    const lv = LEVELS[lab.level] || { label: lab.level, color: "#666", bg: "#eee" };
    const lvTag = tagHTML(lv.label, lv.color, lv.bg);

    const thumbHTML = lab.image
      ? '<img class="lab-thumb" src="' + esc(lab.image) + '" alt="">'
      : '<div class="lab-thumb"></div>';

    return '<a class="lab-row" href="lab.html?id=' + encodeURIComponent(lab.id) + '">' +
      thumbHTML +
      '<div><h3>' + esc(lab.title) + '</h3></div>' +
      '<div class="tags">' + catTags + lvTag + '</div>' +
      '<div class="arrow">\u2192</div>' +
    '</a>';
  }).join("");
}


// --- Team -------------------------------------------------------------------

function renderTeam() {
  const grid = document.getElementById("team-grid");
  grid.innerHTML = TEAM.map(function(m) {
    return '<div class="team-member">' +
      '<div class="team-avatar">' + esc(m.name.charAt(0)) + '</div>' +
      '<h4>' + esc(m.name) + '</h4>' +
      '<div class="role">' + esc(m.role) + '</div>' +
      '<div class="affil">' + esc(m.affiliation) + '</div>' +
    '</div>';
  }).join("");
}


// --- Init -------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", function() {
  buildSearchSort();
  buildFilters();
  renderLabs();
  renderTeam();
});
