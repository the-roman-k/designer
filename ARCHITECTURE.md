# Portfolio — Technical Architecture

## Overview

UX Designer portfolio for Roman Kryzhanovskyi. Static site hosted on GitHub Pages with an AI chat assistant powered by OpenAI via Vercel Functions.

**Live URL:** https://the-roman.com
**Chat API:** https://chat.the-roman.com/api/chat
**Repository:** https://github.com/the-roman-k/designer (public)

---

## Tech Stack

- **Frontend:** Vanilla HTML5, CSS3, JavaScript — no frameworks, no npm, no build tools
- **Libraries:** GSAP, Three.js, etc. loaded via CDN per-page
- **Hosting:** GitHub Pages (free, custom domain)
- **AI Chat API:** Vercel Functions (Hobby plan, free, 100K requests/month)
- **AI Model:** OpenAI GPT-4o-mini
- **Domain:** the-roman.com (purchased at Spaceship registrar)

---

## Directory Structure

```
/
  index.html              Landing page (main portfolio)
  style.css               Landing page styles
  style-new.css           Landing page additional styles
  script.js               Landing page scripts (includes AI chat client)
  CNAME                   GitHub Pages custom domain config
  ARCHITECTURE.md         This file

  shared/
    nav.js                Global navigation component
    nav.css               Navigation styles
    project-header.js     Shared project page header
    project-header.css    Project header styles
    rk-logo.svg           Logo

  projects/
    ai-video-production/      AI Video Production case study
    code-discovery-platform/  Code Discovery Platform case study
    image-to-ascii/           Image-to-ASCII creative tool
    image-to-json/            Image-to-JSON prompt tool
    infographics-decision-tree/ Visualization decision system
    miro-mcp/                 Miro MCP Server
    motoshare/                MotoShare P2P rental redesign
    onboarding-tool/          AI Onboarding Assistant
    taxation-platform/        Taxation Platform redesign
    trading-view-indicators/  TradingView Indicators suite
    upscaler/                 Nano Upscaler AI service
    vendor-portal/            Vendor Portal MVP
    video-scenario-tool/      AI Video Scenario Generator
    voice-ai-assistant/       TYPERR voice AI assistant

  portfolio-chat-api/
    api/chat.js           Vercel serverless function (OpenAI proxy)
    vercel.json           Vercel route config
    package.json          Minimal project descriptor

  00-TMP/                 Strategy docs, plans (gitignored)
  01-SOURCE/              Raw materials (gitignored)
  02-PROCESSED/           AI-processed content
```

---

## Hosting & Deployment

### GitHub Pages (main site)

- **Source:** `main` branch, root `/`
- **Custom domain:** `the-roman.com`
- **HTTPS:** Enforced via GitHub Pages settings
- **Auto-deploy:** Every `git push` to `main` triggers rebuild

### Vercel Functions (chat API)

- **Project:** Separate Vercel project connected to same GitHub repo
- **Root Directory:** `portfolio-chat-api` (configured in Vercel)
- **Custom domain:** `chat.the-roman.com`
- **Auto-deploy:** Every `git push` to `main` triggers redeploy
- **Environment variable:** `OPENAI_API_KEY` stored in Vercel dashboard (not in code)

---

## DNS Configuration (Spaceship registrar)

| Type  | Host   | Value                                    | Purpose                |
|-------|--------|------------------------------------------|------------------------|
| A     | @      | 185.199.108.153                          | GitHub Pages           |
| A     | @      | 185.199.109.153                          | GitHub Pages           |
| A     | @      | 185.199.110.153                          | GitHub Pages           |
| A     | @      | 185.199.111.153                          | GitHub Pages           |
| CNAME | www    | the-roman-k.github.io                   | GitHub Pages (www)     |
| CNAME | chat   | f4781a76ca3bc30c.vercel-dns-017.com.     | Vercel Functions (API) |

---

## AI Chat Architecture

```
Browser (index.html)
   |
   |  fetch('https://chat.the-roman.com/api/chat', { messages, messageCount })
   |
   v
Vercel Function (portfolio-chat-api/api/chat.js)
   |
   |  POST https://api.openai.com/v1/chat/completions
   |  model: gpt-4o-mini
   |  max_tokens: 400
   |  temperature: 0.6
   |
   v
OpenAI API -> response -> Vercel -> Browser
```

### Chat configuration

- **Message limit:** 50 messages per session (client + server enforced)
- **Context window:** Last 6 messages sent to OpenAI
- **System prompt:** ~300 lines — Roman's professional profile, 23 projects, rules
- **After limit:** Shows email + LinkedIn links
- **Status indicator:** "Chat online" / "Chat offline" (no debug messages)

### Why Vercel, not Cloudflare Workers?

Cloudflare Workers required changing nameservers at the registrar. Vercel only needs a CNAME record — simpler setup, same result. Also, `*.workers.dev` domain was blocked by Cisco Umbrella on local network.

---

## Architecture Principles

1. **No npm, no build tools** — vanilla HTML/CSS/JS only
2. **Each project page is self-contained** — own HTML, CSS, JS, assets
3. **Editing one page must never affect others**
4. **Libraries loaded via CDN** per-page as needed
5. **Only shared files:** `shared/nav.js`, `shared/nav.css`, `shared/project-header.js`
6. **All pages responsive + accessible** (WCAG 2.1 AA)
7. **API key never in code** — stored in Vercel environment variables

---

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | Landing page HTML |
| `style.css` | Main landing page styles |
| `style-new.css` | Additional landing page styles |
| `script.js` | Landing page JS (tabs, animations, AI chat client) |
| `portfolio-chat-api/api/chat.js` | Vercel serverless function with system prompt |
| `shared/nav.js` | Navigation component (injected into all pages) |
| `.gitignore` | Excludes 00-TMP/, 01-SOURCE/, .env, .DS_Store, .claude, node_modules |
| `CNAME` | GitHub Pages custom domain (the-roman.com) |
