// ============================================================================
//
//  EUREKA LABS — LAB DETAIL PAGE RENDERING (lab-app.js)
//
//  Reads the "id" query parameter, finds the matching lab in data.js,
//  and renders the lab detail page with image, authors, PDF download,
//  and metadata.
//
//  You should NOT need to edit this file — edit data.js instead.
//
// ============================================================================


function getLabId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function truncateAtWord(str, max) {
  if (!str || str.length <= max) return str || "";
  const cut = str.lastIndexOf(" ", max);
  return str.substring(0, cut > 0 ? cut : max) + "\u2026";
}


function renderLabPage() {
  const id  = getLabId();
  const lab = id ? LABS.find(function(l) { return l.id === id; }) : null;

  // 404 state
  if (!lab) {
    document.getElementById("lab-content").innerHTML =
      '<div class="lab-not-found">' +
        '<h1>Lab not found</h1>' +
        '<p>The requested lab does not exist. It may have been removed or the URL may be incorrect.</p>' +
        '<a href="index.html" class="btn-primary">Back to all labs</a>' +
      '</div>';
    document.title = "Not Found \u2014 Eureka Labs";
    return;
  }

  // Update page title and meta description
  document.title = lab.title + " \u2014 Eureka Labs";
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && lab.description) {
    metaDesc.setAttribute("content", lab.title + " \u2014 " + truncateAtWord(lab.description, 150));
  }

  // Tags
  const tagsHTML = labTagsHTML(lab);

  // Image
  const imgStyle = lab.imagePosition ? ' style="object-position:' + esc(lab.imagePosition) + '"' : "";
  const imageHTML = lab.image
    ? '<div class="lab-image"><img src="' + esc(lab.image) + '" alt="' + esc(lab.title) + '"' + imgStyle + '></div>'
    : "";

  // Metadata bar
  const metaItems = [];
  if (lab.authors)       metaItems.push('<div class="lab-meta-item"><span class="meta-label">Authors</span><span>' + esc(lab.authors) + '</span></div>');
  if (lab.updated)       metaItems.push('<div class="lab-meta-item"><span class="meta-label">Last updated</span><span>' + esc(lab.updated) + '</span></div>');
  if (lab.estimatedTime) metaItems.push('<div class="lab-meta-item"><span class="meta-label">Estimated time</span><span>' + esc(lab.estimatedTime) + '</span></div>');
  const metaHTML = metaItems.length > 0 ? '<div class="lab-meta">' + metaItems.join("") + '</div>' : "";

  // PDF download button
  const pdfHTML = lab.pdf
    ? '<div class="lab-section">' +
        '<h2>Lab manual</h2>' +
        '<a href="' + esc(lab.pdf) + '" target="_blank" rel="noopener" class="btn-primary">' +
          '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 14h10M8 2v9M4 7l4 4 4-4"/></svg>' +
          'View / Download PDF' +
        '</a>' +
      '</div>'
    : "";

  // Resources list (optional extra links)
  const resourcesHTML = (lab.resources && lab.resources.length > 0)
    ? '<div class="lab-section">' +
        '<h2>Resources</h2>' +
        '<ul class="resources-list">' +
          lab.resources.map(function(res) {
            return '<li><a href="' + esc(res.url) + '" target="_blank" rel="noopener">' + esc(res.label) + ' \u2197</a></li>';
          }).join("") +
        '</ul>' +
      '</div>'
    : "";

  // Assemble
  document.getElementById("lab-content").innerHTML =
    '<a href="index.html#labs" class="back-link">\u2190 All labs</a>' +
    '<div class="lab-header">' +
      '<div class="tags">' + tagsHTML + '</div>' +
      '<h1>' + esc(lab.title) + '</h1>' +
    '</div>' +
    metaHTML +
    imageHTML +
    (lab.teaser ? '<p class="lab-teaser">' + esc(lab.teaser) + '</p>' : '') +
    '<div class="lab-section">' +
      '<h2>Overview</h2>' +
      '<p>' + esc(lab.description) + '</p>' +
    '</div>' +
    pdfHTML +
    resourcesHTML;
}


document.addEventListener("DOMContentLoaded", renderLabPage);
