# Asset Manifest — voice-ai-assistant (TYPERR) — Expanded Edition

> Generated: 2026-03-16 (updated)

---

## Images (`img/`)

| File | Type | Retina |
|---|---|---|
| assistant.png | Screenshot — macOS assistant overlay | 1x |
| assistant@2x.png | Screenshot — macOS assistant overlay | 2x |
| indicators.png | Screenshot — status indicators UI | 1x |
| indicators@2x.png | Screenshot — status indicators UI | 2x |
| main-window-first-version-01.png | Screenshot — v1 main window (variant A) | 1x |
| main-window-first-version-01@2x.png | Screenshot — v1 main window (variant A) | 2x |
| main-window-first-version-02.png | Screenshot — v1 main window (variant B) | 1x |
| main-window-first-version-02@2x.png | Screenshot — v1 main window (variant B) | 2x |
| main-window-second-version.png | Screenshot — v2 main window (redesigned) | 1x |
| main-window-second-version@2x.png | Screenshot — v2 main window (redesigned) | 2x |
| test-pipeline-logs.png | Screenshot — ASR pipeline test logs | 1x |
| test-pipeline-logs@2x.png | Screenshot — ASR pipeline test logs | 2x |

**Total:** 12 files (6 unique images × 2 resolutions)

---

## SVGs (`svg/`)

No standalone SVG files. All diagrams are inline in `case-study.html`:
- End-to-end user flow diagram (5 stages)
- Application architecture diagram (7 components + AppState)
- Product evolution diagram (v1 → v2 → v3)
- UX process flow diagram (5 phases)

---

## External Dependencies

| Resource | CDN | Version |
|---|---|---|
| GSAP | cdnjs.cloudflare.com | 3.12.5 |
| ScrollTrigger | cdnjs.cloudflare.com | 3.12.5 |
| DM Sans | fonts.googleapis.com | Variable (300, 400, 500, 700, 900) |
| Instrument Serif | fonts.googleapis.com | 400 italic |

---

## Content Summary (Expanded Edition)

- **20 sections** (Hero, Challenge, Hypothesis, Competitors, Personas, Goals, UX Principles, User Flow, Input Grammar, Architecture, Surfaces, Trust UX, UX Decisions, Evolution, UX Process, Results, Metrics, Lessons, AI Layer, CTA)
- **4 inline SVG diagrams** (user flow, architecture, evolution, process)
- **6 unique images** with retina srcset
- **20 dot-nav entries** with tooltip labels
- **Dark theme** derived from reference files

---

## Bundle Structure

```
outputs/
├── case-study.html          ← main page (self-contained)
└── assets/
    ├── img/                  ← 12 image files
    ├── svg/                  ← (empty — SVGs inline)
    └── MANIFEST.md           ← this file
```

All paths in HTML use `./assets/...` — the outputs/ folder is fully portable.
