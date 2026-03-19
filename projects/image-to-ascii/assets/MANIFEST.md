# Asset Manifest — image-to-ascii

**Generated:** 2026-03-16
**Engine:** v5.7

## Images (./assets/img/)

| File | Type | Usage |
|---|---|---|
| tool-empty.png / @2x | Screenshot | Challenge section — empty state |
| tool-filled.png / @2x | Screenshot | Interface section — active preview |
| presets.png / @2x | Screenshot | Presets section — left panel |
| controls.png / @2x | Screenshot | Controls section — right panel |
| export.png / @2x | Screenshot | Export section — format buttons |
| style-01.png / @2x | Screenshot | Styles section — Detailed preset |
| style-02.png / @2x | Screenshot | Styles section — Matrix preset |
| style-03.png / @2x | Screenshot | Styles section — Blueprint preset |
| style-04.png / @2x | Screenshot | Styles section — Retro preset |
| style-05.png / @2x | Screenshot | Available but unused |
| laptop-front.png / @2x | Hero shot | Results section — product showcase |
| laptop-side.png / @2x | Hero shot | Available but unused |

## SVG Diagrams (inline)

| Diagram | Section | Description |
|---|---|---|
| Fragment Shader Pipeline | GPU Engine | 7-step processing pipeline |
| User Flow | Between Styles & Process | Upload → Preview → Tune → Export with iterate loop |

## External Dependencies (CDN)

| Library | Version | URL |
|---|---|---|
| GSAP | 3.12.5 | cdnjs.cloudflare.com |
| ScrollTrigger | 3.12.5 | cdnjs.cloudflare.com |
| Inter font | latest | fonts.googleapis.com |
| JetBrains Mono | latest | fonts.googleapis.com |

## Notes

- All images have @2x retina variants with srcset
- All inline SVGs use stroke="currentColor" and aria-hidden="true"
- No emoji in output — all icons are inline SVG
- Self-contained output: can be deployed independently
