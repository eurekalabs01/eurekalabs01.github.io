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
let currentPage = 1;
let pageSize    = 10;


// --- Search & Sort ----------------------------------------------------------

function buildSearchSort() {
  const searchEl = document.getElementById("lab-search");
  const sortEl   = document.getElementById("sort-controls");

  searchEl.addEventListener("input", function() {
    searchQuery = this.value.trim().toLowerCase();
    currentPage = 1;
    renderLabs();
  });

  sortEl.addEventListener("click", function(e) {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    activeSort = btn.dataset.sort;
    currentPage = 1;
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
    currentPage = 1;
    catEl.querySelectorAll(".filter-btn").forEach(function(b) { b.setAttribute("aria-pressed", "false"); });
    btn.setAttribute("aria-pressed", "true");
    renderLabs();
  });

  levelEl.addEventListener("click", function(e) {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    activeLevel = btn.dataset.level;
    currentPage = 1;
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

  const total = results.length;
  countEl.textContent = total + " lab" + (total !== 1 ? "s" : "");

  if (total === 0) {
    listEl.classList.add("hidden");
    emptyEl.style.display = "block";
    document.getElementById("pagination").innerHTML = "";
    return;
  }

  listEl.classList.remove("hidden");
  emptyEl.style.display = "none";

  // 4. Paginate
  const start = (currentPage - 1) * pageSize;
  results = results.slice(start, start + pageSize);

  renderPagination(total);

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


// --- Pagination -------------------------------------------------------------

function renderPagination(total) {
  const el         = document.getElementById("pagination");
  const totalPages = Math.ceil(total / pageSize);

  // Build per-page selector
  const sizeHTML = '<div class="page-size">' +
    '<span>Per page</span>' +
    [5, 10].map(function(n) {
      const pressed = pageSize === n ? "true" : "false";
      return '<button class="filter-btn" aria-pressed="' + pressed + '" data-size="' + n + '">' + n + '</button>';
    }).join("") +
  '</div>';

  // Build page buttons (always show all — max 7 pages at size 5)
  let pagesHTML = '<div class="page-controls">';
  pagesHTML += '<button class="page-btn" data-page="' + (currentPage - 1) + '"' + (currentPage === 1 ? ' disabled' : '') + '>\u2190 Prev</button>';
  for (var i = 1; i <= totalPages; i++) {
    pagesHTML += '<button class="page-btn' + (i === currentPage ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
  }
  pagesHTML += '<button class="page-btn" data-page="' + (currentPage + 1) + '"' + (currentPage === totalPages ? ' disabled' : '') + '>Next \u2192</button>';
  pagesHTML += '</div>';

  el.innerHTML = '<div class="pagination-bar">' + sizeHTML + pagesHTML + '</div>';

  // Wire up page navigation
  el.querySelectorAll(".page-btn:not([disabled])").forEach(function(btn) {
    btn.addEventListener("click", function() {
      currentPage = parseInt(btn.dataset.page);
      renderLabs();
      document.getElementById("labs").scrollIntoView({ behavior: "smooth" });
    });
  });

  // Wire up per-page size
  el.querySelectorAll("[data-size]").forEach(function(btn) {
    btn.addEventListener("click", function() {
      pageSize    = parseInt(btn.dataset.size);
      currentPage = 1;
      renderLabs();
    });
  });
}


// --- Team -------------------------------------------------------------------

function memberHTML(m) {
  const avatar = m.image
    ? '<img class="team-avatar" src="' + esc(m.image) + '" alt="Photo of ' + esc(m.name) + '">'
    : '<div class="team-avatar">' + esc(m.name.charAt(0)) + '</div>';
  const nameHTML = m.url
    ? '<a href="' + esc(m.url) + '" target="_blank" rel="noopener">' + esc(m.name) + '</a>'
    : esc(m.name);
  return '<div class="team-member">' +
    avatar +
    '<div><h4>' + nameHTML + '</h4>' +
    '<div class="role">' + esc(m.role) + '</div>' +
    (m.affiliation ? '<div class="affil">' + esc(m.affiliation) + '</div>' : '') +
    '</div>' +
  '</div>';
}

function renderTeam() {
  const pis   = TEAM.filter(function(m) { return m.group === "pi"; });
  const colls = TEAM.filter(function(m) { return m.group === "collaborator"; });

  document.getElementById("team-grid").innerHTML        = pis.map(memberHTML).join("");
  document.getElementById("collab-grid").innerHTML      = colls.map(memberHTML).join("");
}


// --- Init -------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", function() {
  buildSearchSort();
  buildFilters();
  renderLabs();
  renderTeam();
});
