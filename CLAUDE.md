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

## Rules for AI Agents

1. **Never add npm, package.json, or build tools** to this project
2. **Never modify pages you weren't asked to modify.** When working on `projects/video-scenario-tool/`, do not touch `index.html` or any other project folder
3. **The only shared files are `shared/nav.js` and `shared/nav.css`.** Changes there affect all pages — confirm before editing
4. **Each page is fully self-contained** — inline or local CSS/JS, no shared stylesheets beyond nav
5. **All markup must be responsive and accessible** — no exceptions
6. **Load libraries from CDN** — no local copies, no npm installs
7. **Images must have `alt` text** and use `loading="lazy"` where appropriate
8. **Respect `prefers-reduced-motion`** in any animation code
