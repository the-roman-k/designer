/**
 * Shared Navigation Component
 * Portfolio: Roman Kryzhanovskyi
 *
 * Self-injecting navigation — call initNavigation() to mount.
 * Handles: scroll-direction hide/show, hamburger menu,
 * keyboard accessibility, focus trap, reduced motion.
 */

(function () {
  'use strict';

  /* ── Configuration ─────────────────────────────── */
  const NAV_LINKS = [
    { label: 'Work', href: '#work' },
    { label: 'Projects', href: '#projects' },
    { label: 'Stack', href: '#stack' },
    { label: 'About', href: '#shift' },
    { label: 'Contact', href: '#contact', cta: true },
  ];

  const MOBILE_LINKS = [
    { label: 'Work', href: '#work' },
    { label: 'Projects', href: '#projects' },
    { label: 'Stack', href: '#stack' },
    { label: 'Foundation', href: '#foundation' },
    { label: 'About', href: '#shift' },
  ];

  const SCROLL_THRESHOLD = 10;
  const HIDE_DELAY = 80;
  const BREAKPOINT = 1024;

  /* ── Build DOM ─────────────────────────────────── */
  function buildNav() {
    // Skip-to-content
    const skip = document.createElement('a');
    skip.href = '#main';
    skip.className = 'skip-link';
    skip.textContent = 'Skip to content';

    // Wrapper
    const wrapper = document.createElement('header');
    wrapper.className = 'nav-wrapper';
    wrapper.setAttribute('role', 'banner');

    // Inner
    const inner = document.createElement('nav');
    inner.className = 'nav-inner';
    inner.setAttribute('role', 'navigation');
    inner.setAttribute('aria-label', 'Main navigation');

    // Logo
    const logo = document.createElement('a');
    logo.href = '/';
    logo.className = 'nav-logo';
    logo.setAttribute('aria-label', 'Roman Kryzhanovskyi — Home');
    logo.innerHTML =
      '<img class="nav-logo-img" src="shared/rk-logo.svg" alt="" width="36" height="36" aria-hidden="true">' +
      '<span class="availability-dot" aria-hidden="true"></span>';

    // Desktop links
    const ul = document.createElement('ul');
    ul.className = 'nav-links';
    NAV_LINKS.forEach(function (item) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      a.className = item.cta ? 'nav-link nav-link--cta' : 'nav-link';
      li.appendChild(a);
      ul.appendChild(li);
    });

    // Hamburger
    const burger = document.createElement('button');
    burger.className = 'nav-hamburger';
    burger.setAttribute('aria-label', 'Open menu');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-controls', 'nav-mobile-panel');
    burger.innerHTML =
      '<span class="nav-hamburger-lines">' +
      '<span class="nav-hamburger-line"></span>' +
      '<span class="nav-hamburger-line"></span>' +
      '<span class="nav-hamburger-line"></span>' +
      '</span>';

    // Mobile panel
    const panel = document.createElement('div');
    panel.className = 'nav-mobile-panel';
    panel.id = 'nav-mobile-panel';
    panel.setAttribute('aria-hidden', 'true');

    const mobileContent = document.createElement('div');
    mobileContent.className = 'nav-mobile-content';
    mobileContent.setAttribute('role', 'dialog');
    mobileContent.setAttribute('aria-label', 'Navigation menu');

    MOBILE_LINKS.forEach(function (item) {
      const a = document.createElement('a');
      a.href = item.href;
      a.className = 'nav-mobile-link';
      a.textContent = item.label;
      mobileContent.appendChild(a);
    });

    const mobileCTA = document.createElement('a');
    mobileCTA.href = '#contact';
    mobileCTA.className = 'nav-mobile-cta';
    mobileCTA.textContent = 'Let\u2019s Talk';
    mobileContent.appendChild(mobileCTA);

    panel.appendChild(mobileContent);

    // Assemble
    inner.appendChild(logo);
    inner.appendChild(ul);
    inner.appendChild(burger);
    wrapper.appendChild(inner);

    return { skip: skip, wrapper: wrapper, panel: panel, burger: burger };
  }

  /* ── Controller ────────────────────────────────── */
  function NavController(elements) {
    this.wrapper = elements.wrapper;
    this.panel = elements.panel;
    this.burger = elements.burger;
    this.isMenuOpen = false;
    this.lastScrollY = 0;
    this.hideTimeout = null;
    this.scrollTicking = false;

    this._bindEvents();
  }

  NavController.prototype._bindEvents = function () {
    var self = this;

    window.addEventListener('scroll', function () {
      self._onScroll();
    }, { passive: true });

    window.addEventListener('resize', function () {
      self._onResize();
    });

    this.burger.addEventListener('click', function () {
      self._toggleMenu();
    });

    this.panel.addEventListener('click', function (e) {
      if (e.target === self.panel || e.target.classList.contains('nav-mobile-link') || e.target.classList.contains('nav-mobile-cta')) {
        self._closeMenu();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && self.isMenuOpen) {
        self._closeMenu();
        self.burger.focus();
      }
    });

    // Smooth scroll for anchor links
    this.wrapper.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = this.getAttribute('href').slice(1);
        var target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      });
    });

    this.panel.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = this.getAttribute('href').slice(1);
        var target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          self._closeMenu();
          setTimeout(function () {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
          }, 350);
        }
      });
    });
  };

  NavController.prototype._onScroll = function () {
    if (this.scrollTicking) return;
    this.scrollTicking = true;

    var self = this;
    requestAnimationFrame(function () {
      var y = window.pageYOffset;

      if (y <= 60) {
        clearTimeout(self.hideTimeout);
        self.wrapper.classList.remove('nav-hidden');
        self.lastScrollY = y;
        self.scrollTicking = false;
        return;
      }

      var delta = y - self.lastScrollY;
      if (Math.abs(delta) > SCROLL_THRESHOLD) {
        if (delta > 0) {
          clearTimeout(self.hideTimeout);
          self.hideTimeout = setTimeout(function () {
            if (!self.isMenuOpen) {
              self.wrapper.classList.add('nav-hidden');
            }
          }, HIDE_DELAY);
        } else {
          clearTimeout(self.hideTimeout);
          self.wrapper.classList.remove('nav-hidden');
        }
      }

      self.lastScrollY = y;
      self.scrollTicking = false;
    });
  };

  NavController.prototype._onResize = function () {
    if (window.innerWidth > BREAKPOINT && this.isMenuOpen) {
      this._closeMenu();
    }
  };

  NavController.prototype._toggleMenu = function () {
    if (this.isMenuOpen) {
      this._closeMenu();
    } else {
      this._openMenu();
    }
  };

  NavController.prototype._openMenu = function () {
    this.isMenuOpen = true;
    this.burger.setAttribute('aria-expanded', 'true');
    this.burger.setAttribute('aria-label', 'Close menu');
    this.panel.classList.add('is-open');
    this.panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-menu-open');

    // Focus first link
    var firstLink = this.panel.querySelector('.nav-mobile-link');
    if (firstLink) firstLink.focus();

    // Focus trap
    this._trapFocus();
  };

  NavController.prototype._closeMenu = function () {
    this.isMenuOpen = false;
    this.burger.setAttribute('aria-expanded', 'false');
    this.burger.setAttribute('aria-label', 'Open menu');
    this.panel.classList.remove('is-open');
    this.panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-menu-open');

    this._releaseFocus();
  };

  NavController.prototype._trapFocus = function () {
    var focusable = this.panel.querySelectorAll('a, button');
    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    this._focusTrapHandler = function (e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    this.panel.addEventListener('keydown', this._focusTrapHandler);
  };

  NavController.prototype._releaseFocus = function () {
    if (this._focusTrapHandler) {
      this.panel.removeEventListener('keydown', this._focusTrapHandler);
      this._focusTrapHandler = null;
    }
  };

  /* ── Load CSS ──────────────────────────────────── */
  function loadNavCSS() {
    // Determine path relative to the HTML file
    var scripts = document.querySelectorAll('script[src*="nav.js"]');
    var basePath = '';
    if (scripts.length) {
      var src = scripts[scripts.length - 1].getAttribute('src');
      basePath = src.substring(0, src.lastIndexOf('/') + 1);
    }

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = basePath + 'nav.css';
    document.head.appendChild(link);
  }

  /* ── Init ──────────────────────────────────────── */
  function initNavigation() {
    loadNavCSS();

    var els = buildNav();
    document.body.prepend(els.panel);
    document.body.prepend(els.wrapper);
    document.body.prepend(els.skip);

    new NavController(els);
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
  } else {
    initNavigation();
  }
})();
