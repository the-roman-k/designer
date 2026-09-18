# Portfolio — Project Rules

## Project Overview

UX Designer portfolio for Roman Kryzhanovskyi — Design Engineer.
Landing page at root + individual project pages, each with its own design.

## Tech Stack

- **Vanilla HTML5, CSS3, JavaScript** — no frameworks, no npm, no build tools
- External libraries (GSAP, Three.js, etc.) loaded via CDN `<script>` tags where needed
- Each page decides its own library dependencies independently

## Directory Structure

```
/                          ← Project root
  index.html               ← Landing page (main portfolio page)
  shared/
    nav.js                 ← Global navigation component (injected via JS)
    nav.css                ← Global navigation styles
  projects/
    [project-slug]/        ← One folder per project
      index.html           ← Project page
      style.css            ← Page-specific styles
      script.js            ← Page-specific scripts
      assets/              ← Images, icons, videos for this project
  00-TMP/                  ← Strategy docs, master plans
  01-SOURCE/               ← Raw project materials (screenshots, videos, docs)
  02-PROCESSED/            ← AI-processed case study content
```

## Architecture Principles

### Page Independence
- **Each project page is self-contained.** It has its own HTML, CSS, JS, and assets.
- **Editing one page must NEVER affect other pages.** Do not modify files outside the page being worked on unless explicitly asked.
- **No shared CSS beyond navigation.** Each page owns its design. No global stylesheets, no shared tokens file. Copy what you need into the page.
- **Libraries are per-page.** If a page needs GSAP, that page loads GSAP. Another page may not use it at all.

### Global Navigation
- A single navigation component (`shared/nav.js` + `shared/nav.css`) is shared across all pages.
- It provides links to navigate between the landing page and project pages.
- Each page includes it via a `<script>` tag. The nav injects itself into the DOM.
- Nav changes affect all pages (this is the only intentional cross-page dependency).

### Landing Page (`index.html`)
- Lives at the project root.
- Serves as the main portfolio landing / showcase page.
- Has its own unique design, styles, and scripts.

### Project Pages (`projects/[slug]/index.html`)
- Each project has a completely independent design.
- Each project folder contains everything it needs to render.
- Reference assets using relative paths within the project folder.

## Code Conventions

### HTML
- Semantic HTML5 (`<section>`, `<nav>`, `<main>`, `<article>`, `<header>`, `<footer>`)
- Every section has `aria-labelledby` pointing to its heading
- Images always have descriptive `alt` text; decorative elements use `aria-hidden="true"`
- Skip link as first element in `<body>`
- All interactive elements are keyboard-accessible

### CSS
- No CSS frameworks
- Mobile-first responsive design (all pages, no exceptions)
- All animations must respect `prefers-reduced-motion: reduce`
- Focus indicators on all interactive elements via `:focus-visible`
- Color contrast: WCAG 2.1 AA minimum (4.5:1 body text, 3:1 large text/UI)

### JavaScript
- No frameworks, no build step — plain JS
- Libraries via CDN only
- Each page manages its own scripts independently

### Accessibility (WCAG 2.1 AA minimum, all pages)
- Color contrast ratios enforced
- Keyboard navigation: tab order matches visual order
- Screen reader support: proper headings hierarchy, alt text, ARIA labels
- Reduced motion: all animations disabled when `prefers-reduced-motion: reduce`
- Focus management for modals, menus, and interactive elements
- Responsive: works on mobile, tablet, desktop

## Current Work Mode — ADD NEW PROJECTS ONLY

**Goal:** Roman is adding new projects to the portfolio. Two categories exist:
- **Featured Projects** — AI-era projects, shown in the `#view-projects` tab
- **My Foundation before AI** — pre-AI projects, shown in the `#view-foundation` tab

**DO NOT modify any existing pages, styles, scripts, or content unless Roman explicitly asks.**
The only files that should change are listed in the checklist below.

---

## Checklist: How to Add a New Featured Project

Adding a new project requires changes in **exactly 3 places** (plus the new project folder itself). Here's the step-by-step:

### Step 1 — Create the project folder

```
projects/[new-slug]/
├── case-study.html          ← Full case-study page (self-contained HTML)
└── assets/
    └── img/
        └── thumbnail.png    ← Card image for the landing page grid
```

The `case-study.html` must include these two shared scripts in `<head>`:
```html
<script src="../../shared/project-header.js" defer></script>
<link rel="stylesheet" href="../../shared/project-header.css">
```

### Step 2 — Add a card to `index.html`

Insert a new `<article>` inside the `<div class="projects-grid">` block (around line 488–612).
Place it **before** the closing `</div>` of `.projects-grid`.

**HTML template for a Featured Project card:**
```html
<!-- Project N -->
<article class="project-card reveal">
  <a href="projects/[new-slug]/case-study.html" class="project-thumb">
    <img src="projects/[new-slug]/assets/img/thumbnail.png"
         alt="[Project Name]"
         loading="lazy">
  </a>
  <div class="project-info">
    <span class="project-tag">[Category]</span>
    <h3>[Project Name]</h3>
    <p>[One-line description, max ~80 chars]</p>
    <a href="projects/[new-slug]/case-study.html" class="project-link">
      View Case Study <span aria-hidden="true">&rarr;</span>
    </a>
  </div>
</article>
```

**Available category tags:** `AI-Powered`, `Creative Tech`, `Workflow`

### Step 3 — Register in `shared/project-header.js`

Add the project to the `FEATURED` array (line 16–25) so the "Next project →" navigation works:

```javascript
var FEATURED = [
  // ... existing projects ...
  { slug: '[new-slug]', label: '[Project Name]', page: 'case-study.html' },
];
```

### Step 4 — Verify

- Open `index.html` — the new card should appear in the Featured Projects grid
- Open `projects/[new-slug]/case-study.html` — "Back to main page" and "Next project →" links should work
- Check that no other project pages were broken (existing links still work)

---

## Checklist: How to Add a New Foundation Project

Foundation projects appear in the `#view-foundation` tab. They use a different, simpler card format.

### Step 1 — Create the project folder

Same structure as Featured Projects:
```
projects/[new-slug]/
├── case-study.html
└── assets/
    └── img/
        └── thumbnail.png
```

### Step 2 — Add a card to `index.html`

Insert a new `<div class="foundation-card">` inside the `<div class="foundation-grid reveal-stagger">` block (around line 1333–1369).

**HTML template for a Foundation card:**
```html
<div class="foundation-card">
  <span class="foundation-card-period">[Category]</span>
  <h4>[Project Name]</h4>
  <p>[One-line description]</p>
</div>
```

**Note:** Foundation cards currently do NOT link to case study pages — they are text-only summaries.
If Roman asks to make them clickable, wrap the card content in an `<a>` tag.

**Available category tags:** `Enterprise`, `Platform`, `Mobile`, `IoT`, `Leadership`

### Step 3 — Register in `shared/project-header.js`

Add to the `FOUNDATION` array (line 28–35):

```javascript
var FOUNDATION = [
  // ... existing projects ...
  { slug: '[new-slug]', label: '[Project Name]', page: 'case-study.html' },
];
```

### Step 4 — Verify

Same as Featured Projects verification above.

---

## Current Project Inventory

### Featured Projects (9) — in `#view-projects`
| # | Slug | Name | Tag |
|---|------|------|-----|
| 0 | `grid-inspection` | Grid Inspection | AI-Powered · Enterprise |
| 1 | `voice-ai-assistant` | Voice AI Assistant | AI-Powered |
| 2 | `video-scenario-tool` | Video Scenarios Tool | AI-Powered |
| 3 | `ai-video-production` | AI Video Production | AI-Powered |
| 4 | `miro-mcp` | Miro MCP Server | AI-Powered |
| 5 | `image-to-ascii` | Image to ASCII | Creative Tech |
| 6 | `image-to-json` | Image to JSON | Workflow |
| 7 | `infographics-decision-tree` | Infographics Decision Tree | Workflow |
| 8 | `upscaler` | AI Image Upscaler | AI-Powered |

### Foundation Projects (6) — in `#view-foundation`
| # | Slug | Name | Tag |
|---|------|------|-----|
| 1 | `onboarding-tool` | AI Onboarding Assistant | — |
| 2 | `trading-view-indicators` | TradingView Indicators | — |
| 3 | `motoshare` | MotoShare | Mobile |
| 4 | `code-discovery-platform` | Code Discovery Platform | Platform |
| 5 | `vendor-portal` | Vendor Portal | Enterprise |
| 6 | `taxation-platform` | Taxation Platform | Enterprise |

---

## Files That Change When Adding a Project

| File | What changes |
|------|-------------|
| `projects/[new-slug]/` (new folder) | Entire new folder with case-study.html + assets |
| `index.html` | New `<article>` card added inside the grid |
| `shared/project-header.js` | New entry in `FEATURED` or `FOUNDATION` array |

**No other files should be modified.** Specifically:
- Do NOT touch `style.css`, `style-new.css`, `script.js` at root
- Do NOT touch `shared/nav.js` or `shared/nav.css`
- Do NOT touch any existing project folder
- Do NOT touch `shared/project-header.css`

---

## Rules for AI Agents

1. **Never add npm, package.json, or build tools** to this project
2. **Never modify pages you weren't asked to modify.** When working on `projects/video-scenario-tool/`, do not touch `index.html` or any other project folder
3. **The only shared files are `shared/nav.js` and `shared/nav.css`.** Changes there affect all pages — confirm before editing
4. **Each page is fully self-contained** — inline or local CSS/JS, no shared stylesheets beyond nav
5. **All markup must be responsive and accessible** — no exceptions
6. **Load libraries from CDN** — no local copies, no npm installs
7. **Images must have `alt` text** and use `loading="lazy"` where appropriate
8. **Respect `prefers-reduced-motion`** in any animation code
