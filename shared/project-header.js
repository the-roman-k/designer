/**
 * Project Header — Back / Next Project Navigation
 * Shared component for all project case-study pages.
 *
 * Usage: add to <head> of any project page:
 *   <script src="../../shared/project-header.js" defer></script>
 *
 * The script auto-loads project-header.css, detects the current
 * project from the URL, computes the next project link, detects
 * the page theme (dark/light), and injects the header bar.
 */
(function () {
  'use strict';

  /* ── Featured Projects (AI-era — cycles within this group) ── */
  var FEATURED = [
    { slug: 'voice-ai-assistant',         label: 'Voice AI Assistant',         page: 'case-study.html' },
    { slug: 'video-scenario-tool',        label: 'Video Scenarios Tool',       page: 'case-study.html' },
    { slug: 'ai-video-production',        label: 'AI Video Production',        page: 'case-study.html' },
    { slug: 'miro-mcp',                   label: 'Miro MCP Server',            page: 'case-study.html' },
    { slug: 'image-to-ascii',             label: 'Image to ASCII',             page: 'case-study.html' },
    { slug: 'image-to-json',              label: 'Image to JSON',              page: 'case-study.html' },
    { slug: 'infographics-decision-tree', label: 'Infographics Decision Tree', page: 'case-study.html' },
    { slug: 'upscaler',                   label: 'AI Image Upscaler',          page: 'case-study.html' }
  ];

  /* ── Foundation Projects (pre-AI — cycles within this group) ── */
  var FOUNDATION = [
    { slug: 'onboarding-tool',            label: 'AI Onboarding Assistant',    page: 'case-study.html' },
    { slug: 'trading-view-indicators',    label: 'TradingView Indicators',     page: 'case-study.html' },
    { slug: 'motoshare',                  label: 'MotoShare',                   page: 'case-study.html' },
    { slug: 'code-discovery-platform',    label: 'Code Discovery Platform',    page: 'case-study.html' },
    { slug: 'vendor-portal',              label: 'Vendor Portal',              page: 'case-study.html' },
    { slug: 'taxation-platform',          label: 'Taxation Platform',          page: 'case-study.html' }
  ];

  /* ── Detect current project from URL ── */
  function detectCurrentProject() {
    var path = window.location.pathname;
    var match = path.match(/\/projects\/([^\/]+)\//);
    if (match) return match[1];
    // Fallback: find "projects" segment and take the next one
    var parts = path.split('/').filter(Boolean);
    for (var i = 0; i < parts.length; i++) {
      if (parts[i] === 'projects' && parts[i + 1]) return parts[i + 1];
    }
    return null;
  }

  /* ── Find which group the project belongs to ── */
  function findInGroup(slug, group) {
    for (var i = 0; i < group.length; i++) {
      if (group[i].slug === slug) return i;
    }
    return -1;
  }

  /* ── Get next project (wraps around within the same group) ── */
  function getNextProject(currentSlug) {
    var idx = findInGroup(currentSlug, FEATURED);
    if (idx >= 0) return FEATURED[(idx + 1) % FEATURED.length];

    idx = findInGroup(currentSlug, FOUNDATION);
    if (idx >= 0) return FOUNDATION[(idx + 1) % FOUNDATION.length];

    return null;
  }

  /* ── Resolve base path from script src ── */
  function resolveBasePath() {
    var scripts = document.querySelectorAll('script[src*="project-header.js"]');
    if (!scripts.length) return '../../';
    var src = scripts[scripts.length - 1].getAttribute('src');
    var idx = src.lastIndexOf('shared/');
    return idx >= 0 ? src.substring(0, idx) : '../../';
  }

  /* ── Auto-load CSS ── */
  function loadCSS() {
    var scripts = document.querySelectorAll('script[src*="project-header.js"]');
    var basePath = '';
    if (scripts.length) {
      var src = scripts[scripts.length - 1].getAttribute('src');
      basePath = src.substring(0, src.lastIndexOf('/') + 1);
    }
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = basePath + 'project-header.css';
    document.head.appendChild(link);
  }

  /* ── Detect dark/light theme from body background ── */
  function detectTheme() {
    var bg = window.getComputedStyle(document.body).backgroundColor;
    var match = bg.match(/\d+/g);
    if (match) {
      var r = parseInt(match[0], 10);
      var g = parseInt(match[1], 10);
      var b = parseInt(match[2], 10);
      var luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      return luminance > 128 ? 'light' : 'dark';
    }
    return 'dark';
  }

  /* ── Build the header DOM ── */
  function buildHeader(basePath, nextProject, backHash) {
    var bar = document.createElement('div');
    bar.className = 'project-header';
    bar.setAttribute('role', 'navigation');
    bar.setAttribute('aria-label', 'Project navigation');

    // Back link (left) — returns to the section the user came from
    var backLink = document.createElement('a');
    backLink.href = basePath + 'index.html#' + backHash;
    backLink.className = 'project-header__back';
    backLink.innerHTML = '<span class="project-header__arrow" aria-hidden="true">&larr;</span> Back to main page';

    // Next project link (right)
    var nextLink = document.createElement('a');
    nextLink.href = basePath + 'projects/' + nextProject.slug + '/' + nextProject.page;
    nextLink.className = 'project-header__next';
    nextLink.innerHTML = 'Next project <span class="project-header__arrow" aria-hidden="true">&rarr;</span>';
    nextLink.setAttribute('title', nextProject.label);

    bar.appendChild(backLink);
    bar.appendChild(nextLink);

    return bar;
  }

  /* ── Init ── */
  function initProjectHeader() {
    var slug = detectCurrentProject();
    if (!slug) return;

    var nextProject = getNextProject(slug);
    if (!nextProject) return;

    loadCSS();

    var basePath = resolveBasePath();
    var backHash = findInGroup(slug, FEATURED) >= 0 ? 'view-projects' : 'view-foundation';
    var header = buildHeader(basePath, nextProject, backHash);

    // Apply theme
    var theme = detectTheme();
    header.classList.add('project-header--' + theme);

    // Inject into page
    document.body.prepend(header);

    // Offset body content so it isn't hidden behind the fixed header
    var currentPadding = parseFloat(window.getComputedStyle(document.body).paddingTop) || 0;
    document.body.style.paddingTop = (currentPadding + 48) + 'px';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjectHeader);
  } else {
    initProjectHeader();
  }
})();
