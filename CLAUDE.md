# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static GitHub Pages site for **Eureka Labs** (eurekalabs.net), a cybersecurity and AI education platform. No build step, no framework, no package manager — all files are served directly.

**Live site:** https://eurekalabs.net  
**Repo:** https://github.com/eurekalabs01/eurekalabs01.github.io  
**Working branch:** `claude/nice-knuth` → merge to `main` via PR to deploy

## Git Workflow

All work is done on branch `claude/nice-knuth` inside a git worktree at:
```
/Users/lma/Documents/GitHub/eurekalabs01/.claude/worktrees/nice-knuth/
```

**Push requires a PATH fix for the macOS credential helper:**
```bash
export PATH="/usr/local/bin:$PATH" && git push origin claude/nice-knuth
```

After pushing, open a PR on GitHub to merge `claude/nice-knuth` → `main`. GitHub Pages deploys automatically on merge.

## Cache Busting

`index.html` and `lab.html` load scripts with a version query param:
```html
<script src="data.js?v=6"></script>
<script src="utils.js?v=6"></script>
<script src="app.js?v=6"></script>   <!-- index.html only -->
<script src="lab-app.js?v=6"></script> <!-- lab.html only -->
```

**Bump `?v=N` in both HTML files whenever `utils.js`, `app.js`, or `lab-app.js` changes.** Only `data.js` changes (new labs, team edits) require bumping if the browser is caching stale JS.

## Core Files

| File | Purpose |
|------|---------|
| `data.js` | All site content — edit this to add/update labs and team members |
| `utils.js` | Shared utilities: `esc()`, `tagHTML()`, `labTagsHTML()`, copyright year |
| `app.js` | Home page: search, filters, sort, pagination, team rendering |
| `lab-app.js` | Lab detail page rendering |
| `index.html` | Home page structure |
| `lab.html` | Lab detail page structure |
| `style.css` | All styles |

## Architecture

The site is entirely JS-rendered from `data.js`. There is no server-side rendering.

- **`data.js`** defines four globals: `CATEGORIES`, `LEVELS`, `TEAM`, `LABS`
- **`utils.js`** is loaded first on both pages and exposes `esc()`, `tagHTML()`, `labTagsHTML()`
- **`app.js`** (home page) reads those globals and renders the lab catalog, filters, pagination, and team grid into pre-existing DOM containers
- **`lab-app.js`** (detail page) reads `?id=` from the URL, finds the matching `LABS` entry, and renders the full lab page

Both pages share the same `utils.js` — any tag-rendering logic belongs there, not duplicated in `app.js`/`lab-app.js`.

## Adding a New Lab

1. Create `labs/{id}/` and place files there (PDF, cover image, notebooks, datasets)
2. Add an entry to the `LABS` array in `data.js` — insert near the top for newest-first ordering:

```js
{
  id: "my-lab-id",               // matches labs/{id}/ folder name
  title: "Lab Title",
  categories: ["ai"],            // one or more keys from CATEGORIES
  level: "fundamental",          // string, or array ["fundamental", "advanced"]
  authors: "First Last, First Last",
  teaser: "One-line hook.",
  description: "Full abstract paragraph.",
  image: "labs/my-lab-id/cover.png",
  imagePosition: "top",          // optional — use when cover image has top text
  pdf:   "labs/my-lab-id/Manual.pdf",
  updated: "2025-01-15",         // YYYY-MM-DD
  estimatedTime: "2-4 hours",
  resources: [                   // optional extra downloads
    { label: "Notebook (foo.ipynb)", url: "labs/my-lab-id/foo.ipynb" },
  ],
},
```

3. `git add data.js labs/{id}/` and commit + push

## Adding a Team Member

Add to the `TEAM` array in `data.js`. Place the photo in `team/`:

```js
{ group: "ra", name: "First Last", role: "Research Assistant", affiliation: "", image: "team/filename.jpg", url: "https://..." },
```

Groups: `"pi"` · `"collaborator"` · `"ra"` · `"former"`  
If no photo is available, use `image: null`. If no URL, use `url: null`.

## Categories and Levels

**Categories** (keys in `CATEGORIES`): `mobile`, `network`, `system`, `ai`, `agent`, `genai`, `deeplearning`, `quantum`

**Levels** (keys in `LEVELS`): `fundamental`, `advanced`, `challenging`

A lab can have multiple levels: `level: ["fundamental", "advanced"]` — both tags render and both filter buttons match it.

## XSS Safety

Always use `esc(str)` from `utils.js` before inserting any data string into HTML. Never use string interpolation directly into innerHTML without escaping.
