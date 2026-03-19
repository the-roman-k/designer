/**
 * Landing Page Script — script.js
 * Portfolio: Roman Kryzhanovskyi
 *
 * Handles:
 * - Interactive sidebar navigation (tab switching)
 * - Hero word-flip animation
 * - Counter count-up animation (triggered per-tab)
 * - GSAP reveal animations (triggered per-tab)
 * - Numbers & Recommendations marquees
 * - Mobile menu
 * - Project card hover effects
 */

(function () {
  'use strict';

  var prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Track the current active view ID
  var currentTargetId = 'view-hero';
  var isAnimating = false;

  // Word flip state (pauseable)
  var wordFlipEl = null;
  var wordFlipWords = [];
  var wordFlipIdx = 0;
  var wordFlipInterval = null;

  // How I Build — ScrollTrigger instance reference
  var hibScrollTrigger = null;

  /* ══════════════════════════════════════════════════
     INTERACTIVE NAVIGATION
     Sidebar tab switching with GSAP crossfade
     ══════════════════════════════════════════════════ */
  function initInteractiveNavigation() {
    gsap.registerPlugin(ScrollTrigger);

    var questions = document.querySelectorAll('.sidebar .question');

    // Hide all tab-contents except the active one on startup
    document.querySelectorAll('.tab-content').forEach(function (tab) {
      if (tab.id !== currentTargetId) {
        tab.style.display = 'none';
        tab.style.opacity = 0;
      } else {
        tab.style.display = 'flex';
        tab.style.opacity = 1;
        tab.classList.add('active');
        triggerContentReveal(tab);
      }
    });

    questions.forEach(function (q) {
      q.addEventListener('click', function () {
        if (isAnimating) return;

        var newTargetId = q.getAttribute('data-target');
        if (!newTargetId || newTargetId === currentTargetId) return;

        questions.forEach(function (btn) { btn.classList.remove('question-active'); });
        q.classList.add('question-active');

        switchTab(currentTargetId, newTargetId);
      });
    });
  }

  function switchTab(oldId, newId) {
    isAnimating = true;

    var oldTab = document.getElementById(oldId);
    var newTab = document.getElementById(newId);

    if (!oldTab || !newTab) {
      isAnimating = false;
      return;
    }

    // Update currentTargetId immediately to prevent state desync
    currentTargetId = newId;

    // Cleanup leaving tab (pause word flip, disable ScrollTrigger)
    onTabLeave(oldId);

    var mainContent = document.querySelector('.main-content');

    // Kill any in-progress tweens on both tabs to prevent stale callbacks
    gsap.killTweensOf(oldTab);
    gsap.killTweensOf(newTab);

    if (prefersReducedMotion) {
      oldTab.classList.remove('active');
      oldTab.style.display = 'none';
      oldTab.style.opacity = 0;

      newTab.classList.add('active');
      newTab.style.display = 'flex';
      newTab.style.opacity = 1;

      mainContent.scrollTop = 0;
      triggerContentReveal(newTab);

      isAnimating = false;
      return;
    }

    // Safety timeout: unlock isAnimating even if GSAP callbacks fail
    var safetyTimer = setTimeout(function () {
      isAnimating = false;
    }, 1200);

    gsap.to(oldTab, {
      opacity: 0, y: -10, duration: 0.3, ease: 'power2.in',
      onComplete: function () {
        oldTab.classList.remove('active');
        oldTab.style.display = 'none';

        newTab.classList.add('active');
        newTab.style.display = 'flex';
        mainContent.scrollTop = 0;

        gsap.fromTo(newTab,
          { opacity: 0, y: 15 },
          {
            opacity: 1, y: 0, duration: 0.4, ease: 'power2.out',
            onStart: function () {
              // Start reveals during fade-in for snappier feel
              triggerContentReveal(newTab);
            },
            onComplete: function () {
              clearTimeout(safetyTimer);
              isAnimating = false;
            }
          }
        );
      }
    });
  }

  /* Called when leaving a tab — cleanup/pause tab-specific features */
  function onTabLeave(tabId) {
    // Pause word flip when leaving hero
    if (tabId === 'view-hero' && wordFlipInterval) {
      clearInterval(wordFlipInterval);
      wordFlipInterval = null;
    }

    // Disable ScrollTrigger when leaving How I Build
    if (tabId === 'view-how-i-build' && hibScrollTrigger) {
      hibScrollTrigger.disable();
    }

    // Hide catch-me when leaving hero
    if (tabId === 'view-hero' && window._catchMeHide) {
      window._catchMeHide();
    }
  }

  /* ══════════════════════════════════════════════════
     CONTENT REVEAL (per-tab)
     Runs reveal + stagger + counter animations
     when a tab becomes visible
     ══════════════════════════════════════════════════ */
  function triggerContentReveal(tabEl) {
    if (prefersReducedMotion) {
      setCounterValues(tabEl);
      // Show static fallback for vapour text
      if (tabEl.id === 'view-foundation') {
        var vc = document.getElementById('vapour-text-container');
        if (vc && !vc.textContent.trim()) {
          vc.textContent = 'everything.';
          vc.style.color = '#CCFF00';
          vc.style.fontStyle = 'italic';
        }
      }
      // Show static fallback for How I Build
      if (tabEl.id === 'view-how-i-build') {
        initHowIBuild();
      }
      return;
    }

    var reveals = tabEl.querySelectorAll('.reveal');
    if (reveals.length) {
      gsap.fromTo(reveals,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: 'power3.out', overwrite: true }
      );
    }

    var staggers = tabEl.querySelectorAll('.reveal-stagger > *');
    if (staggers.length) {
      gsap.fromTo(staggers,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', overwrite: true }
      );
    }

    // Animate counters inside this tab
    animateCounters(tabEl);

    // Init vapour text when Foundation tab is shown
    if (tabEl.id === 'view-foundation') {
      initVapourText();
    }

    // Init Big Task scatter when How I Build tab is shown
    if (tabEl.id === 'view-how-i-build') {
      // Re-enable ScrollTrigger if it exists from a previous visit
      if (hibScrollTrigger) {
        hibScrollTrigger.enable();
        hibScrollTrigger.refresh();
      }
      // Use double-rAF for reliable layout-settled timing instead of setTimeout
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          initHowIBuild();
        });
      });
    }

    // Restart word flip and catch-me when returning to hero
    if (tabEl.id === 'view-hero') {
      startWordFlip();
      if (window._catchMeShow) window._catchMeShow();
    }

    // Only refresh ScrollTrigger for tabs that actually use it
    if (tabEl.id === 'view-how-i-build') {
      ScrollTrigger.refresh();
    }
  }

  /* ══════════════════════════════════════════════════
     HERO WORD FLIP
     ══════════════════════════════════════════════════ */
  function initWordFlip() {
    wordFlipEl = document.querySelector('[data-hero-rk-flip]');
    if (!wordFlipEl) return;

    var raw = wordFlipEl.getAttribute('data-words') || '';
    wordFlipWords = raw.split('|').map(function (w) { return w.trim(); }).filter(Boolean);
    if (wordFlipWords.length === 0) return;

    wordFlipIdx = Math.max(0, wordFlipWords.indexOf(wordFlipEl.textContent.trim()));

    if (wordFlipWords.indexOf(wordFlipEl.textContent.trim()) === -1) {
      wordFlipEl.textContent = wordFlipWords[0];
      wordFlipIdx = 0;
    }

    startWordFlip();
  }

  function startWordFlip() {
    if (!wordFlipEl || wordFlipWords.length === 0) return;
    if (wordFlipInterval) return; // Already running

    wordFlipInterval = setInterval(function () {
      wordFlipIdx = (wordFlipIdx + 1) % wordFlipWords.length;
      var next = wordFlipWords[wordFlipIdx];

      if (prefersReducedMotion) {
        wordFlipEl.textContent = next;
        return;
      }

      wordFlipEl.classList.remove('is-entering', 'is-leaving');
      wordFlipEl.classList.add('is-leaving');

      var onOut = function (e) {
        if (e.animationName !== 'heroRkFlipOut') return;
        wordFlipEl.removeEventListener('animationend', onOut);
        wordFlipEl.textContent = next;
        wordFlipEl.classList.remove('is-leaving');
        wordFlipEl.classList.add('is-entering');

        var onIn = function (e2) {
          if (e2.animationName !== 'heroRkFlipIn') return;
          wordFlipEl.removeEventListener('animationend', onIn);
          wordFlipEl.classList.remove('is-entering');
        };
        wordFlipEl.addEventListener('animationend', onIn);
      };
      wordFlipEl.addEventListener('animationend', onOut);
    }, 3000);
  }

  /* ══════════════════════════════════════════════════
     COUNTER ANIMATION
     Animates [data-count] elements when their tab
     becomes visible. Counters inside marquee get
     their final value immediately.
     ══════════════════════════════════════════════════ */
  function setCounterValues(container) {
    var counters = container.querySelectorAll('[data-count]');
    counters.forEach(function (el) {
      if (el.dataset.counted) return;
      el.dataset.counted = 'true';
      var target = el.getAttribute('data-count');
      var suffix = el.getAttribute('data-suffix') || '';
      el.innerHTML = target + (suffix ? '<span class="suffix">' + suffix + '</span>' : '');
    });
  }

  function animateCounters(container) {
    if (typeof gsap === 'undefined') {
      setCounterValues(container);
      return;
    }

    var counters = container.querySelectorAll('[data-count]');
    if (!counters.length) return;

    var marquee = container.querySelector('.numbers-marquee');

    counters.forEach(function (el) {
      if (el.dataset.counted) return;
      el.dataset.counted = 'true';

      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';

      // Counters inside marquee: set final value immediately
      if (marquee && marquee.contains(el)) {
        el.innerHTML = target + (suffix ? '<span class="suffix">' + suffix + '</span>' : '');
        return;
      }

      var obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: function () {
          el.textContent = Math.round(obj.val);
        },
        onComplete: function () {
          el.innerHTML = target + (suffix ? '<span class="suffix">' + suffix + '</span>' : '');
        },
      });
    });
  }

  /* ══════════════════════════════════════════════════
     NUMBERS MARQUEE
     Duplicate items for seamless infinite loop
     ══════════════════════════════════════════════════ */
  function initNumbersMarquee() {
    var track = document.querySelector('.numbers-track');
    if (!track) return;
    if (!track.dataset.duplicated) {
      var items = track.innerHTML;
      track.innerHTML = items + items;
      track.dataset.duplicated = 'true';
    }
  }

  /* ══════════════════════════════════════════════════
     RECOMMENDATIONS MARQUEE
     Duplicate cards for seamless loop + drag-to-scroll
     ══════════════════════════════════════════════════ */
  function initRecMarquee() {
    var track = document.querySelector('.rec-marquee-track');
    if (!track) return;

    if (!track.dataset.duplicated) {
      var cards = track.innerHTML;
      track.innerHTML = cards + cards;
      track.dataset.duplicated = 'true';
    }

    var marquee = document.querySelector('.rec-marquee');
    if (!marquee) return;

    var isDragging = false;
    var startX = 0;
    var scrollLeft = 0;

    marquee.addEventListener('mousedown', function (e) {
      isDragging = true;
      startX = e.pageX - marquee.offsetLeft;
      scrollLeft = marquee.scrollLeft;
      marquee.style.cursor = 'grabbing';
      track.style.animationPlayState = 'paused';
    });

    marquee.addEventListener('mouseleave', function () {
      isDragging = false;
      marquee.style.cursor = 'grab';
    });

    marquee.addEventListener('mouseup', function () {
      isDragging = false;
      marquee.style.cursor = 'grab';
    });

    marquee.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      e.preventDefault();
      var x = e.pageX - marquee.offsetLeft;
      var walk = (x - startX) * 1.5;
      marquee.scrollLeft = scrollLeft - walk;
    });

    marquee.addEventListener('touchstart', function () {
      track.style.animationPlayState = 'paused';
    }, { passive: true });

    marquee.addEventListener('touchend', function () {
      track.style.animationPlayState = 'running';
    });
  }

  /* ══════════════════════════════════════════════════
     MOBILE MENU
     ══════════════════════════════════════════════════ */
  function initMobileMenu() {
    var mobileBtn = document.getElementById('mobile-menu-btn');
    var sidebar = document.querySelector('.sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    var questions = document.querySelectorAll('.sidebar .question');

    if (!mobileBtn || !sidebar || !overlay) return;

    function toggleMenu() {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    }

    function closeMenu() {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    }

    mobileBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);

    questions.forEach(function (q) {
      q.addEventListener('click', function () {
        if (window.innerWidth <= 768) {
          closeMenu();
        }
      });
    });
  }

  /* ══════════════════════════════════════════════════
     PROJECT CARD HOVER
     GSAP-driven scale + thumbnail zoom on hover
     ══════════════════════════════════════════════════ */
  function initCardHover() {
    if (prefersReducedMotion || typeof gsap === 'undefined') return;

    var cards = document.querySelectorAll('.project-card');
    cards.forEach(function (card) {
      var thumb = card.querySelector('.project-thumb img');

      card.addEventListener('mouseenter', function () {
        gsap.to(card, {
          scale: 1.015,
          duration: 0.4,
          ease: 'power2.out',
        });
        if (thumb) {
          gsap.to(thumb, {
            scale: 1.06,
            duration: 0.5,
            ease: 'power2.out',
          });
        }
      });

      card.addEventListener('mouseleave', function () {
        gsap.to(card, {
          scale: 1,
          duration: 0.35,
          ease: 'power2.inOut',
        });
        if (thumb) {
          gsap.to(thumb, {
            scale: 1,
            duration: 0.4,
            ease: 'power2.inOut',
          });
        }
      });
    });
  }

  /* ══════════════════════════════════════════════════
     VAPOUR TEXT EFFECT (Foundation section)
     Initializes once when the Foundation tab is shown
     ══════════════════════════════════════════════════ */
  var vapourInstance = null;

  function initVapourText() {
    if (vapourInstance) return; // already initialized
    if (typeof VapourTextCycle === 'undefined') return;

    var container = document.getElementById('vapour-text-container');
    if (!container) return;

    var texts = ['everything.', 'design.', 'how we create.', 'design approach.'];

    // Get computed font size from the h2 parent
    var h2 = container.closest('h2');
    var computedStyle = window.getComputedStyle(h2);
    var fontSize = computedStyle.fontSize;
    var fontFamily = computedStyle.fontFamily;

    // Measure the widest text and size the container accordingly
    var measureCanvas = document.createElement('canvas');
    var measureCtx = measureCanvas.getContext('2d');
    measureCtx.font = computedStyle.fontWeight + ' ' + fontSize + ' ' + fontFamily;
    var maxWidth = 0;
    texts.forEach(function (t) {
      var w = measureCtx.measureText(t).width;
      if (w > maxWidth) maxWidth = w;
    });
    container.style.minWidth = Math.ceil(maxWidth + 20) + 'px';

    vapourInstance = new VapourTextCycle({
      container: container,
      texts: texts,
      font: {
        fontFamily: fontFamily,
        fontSize: fontSize,
        fontWeight: 400,
      },
      color: 'rgb(204, 255, 0)',
      spread: 4,
      density: 6,
      animation: {
        vaporizeDuration: 1.8,
        fadeInDuration: 0.8,
        waitDuration: 2,
      },
      direction: 'left-to-right',
      alignment: 'left',
    });

    // Force-start if IntersectionObserver hasn't kicked in yet
    // Render static text first, then start vaporizing after 2s delay
    setTimeout(function () {
      if (vapourInstance && vapourInstance.animationState === 'static') {
        vapourInstance.isInView = true;
        vapourInstance.lastTime = performance.now();
        vapourInstance.startAnimation();
        setTimeout(function () {
          if (vapourInstance && vapourInstance.animationState === 'static') {
            vapourInstance.animationState = 'vaporizing';
          }
        }, 2000);
      }
    }, 300);
  }

  /* ══════════════════════════════════════════════════
     HOW I BUILD — BIG TASK SCATTER ANIMATION
     Particles form "BIG TASK", scatter on scroll,
     then step texts appear sequentially
     ══════════════════════════════════════════════════ */
  var hibInitialized = false;

  function initHowIBuild() {
    var wrapper = document.getElementById('hib-wrapper');
    var hint = document.getElementById('hib-hint');
    var steps = document.querySelectorAll('#hib-steps .hib-step');
    var scene = document.getElementById('hib-scene');
    var mainContent = document.querySelector('.main-content');

    if (!wrapper || !scene || !mainContent) return;

    // On re-visit, just refresh ScrollTrigger
    if (hibInitialized) {
      if (hibScrollTrigger) {
        hibScrollTrigger.enable();
        hibScrollTrigger.refresh();
      }
      ScrollTrigger.refresh();
      return;
    }
    hibInitialized = true;

    var W = 1400, H = 340;

    // Measure actual rendered width of "SMALL TASK"
    var mc = document.createElement('canvas').getContext('2d');
    mc.font = '700 7px "Courier New", monospace';
    var STEP_X = Math.ceil(mc.measureText('SMALL TASK').width) + 2;
    var STEP_Y = 10;

    // Sample pixels of "BIG TASK" — same font & geometry as big-task.html
    var canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 260px Arial Black, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BIG TASK', W / 2, H / 2);

    var imgData = ctx.getImageData(0, 0, W, H);
    var pxData = imgData.data;
    var points = [];

    for (var y = 0; y < H; y += STEP_Y)
      for (var x = 0; x < W; x += STEP_X)
        if (pxData[((y * W + x) * 4) + 3] > 60)
          points.push({ x: x, y: y });

    // Color palette: white + poison green variations
    var palette = [
      '#FFFFFF', '#FFFFFF', '#FFFFFF',
      '#CCFF00', '#CCFF00',
      '#d4ff33', '#b8e600', '#e6ff80', '#99cc00'
    ];

    // Create particle elements
    var targets = [];
    var finalOpacity = [];

    points.forEach(function (pt) {
      var el = document.createElement('span');
      el.className = 'hib-particle';
      el.textContent = 'SMALL TASK';
      el.style.left = pt.x + 'px';
      el.style.top = pt.y + 'px';
      el.style.color = palette[Math.floor(Math.random() * palette.length)];
      var op = 0.55 + Math.random() * 0.45;
      finalOpacity.push(op);
      wrapper.appendChild(el);
      targets.push(el);
    });

    // Scale wrapper to fit available space (scene width, not window width)
    function scaleWrapper() {
      var viewW = scene.clientWidth || window.innerWidth;
      var s = Math.min(1, (viewW - 40) / 1400);
      wrapper.style.transform = 'scale(' + s + ')';
      wrapper.style.transformOrigin = 'center center';
    }
    scaleWrapper();
    window.addEventListener('resize', function () {
      scaleWrapper();
      if (hibScrollTrigger && hibScrollTrigger.isActive) {
        ScrollTrigger.refresh();
      }
    });

    // Reduced motion: show static layout
    if (prefersReducedMotion) {
      scene.classList.add('hib-scene--static');
      gsap.set(targets, { opacity: function (i) { return finalOpacity[i]; } });
      gsap.set(steps, { opacity: 1, y: 0 });
      steps.forEach(function (s) { s.style.position = 'relative'; });
      return;
    }

    // Pre-compute scatter destinations
    var getVW = function () { return window.innerWidth; };
    var getVH = function () { return window.innerHeight; };

    var scatterX = targets.map(function () { return (Math.random() - 0.5) * getVW() * 2.2; });
    var scatterY = targets.map(function () { return (Math.random() - 0.5) * getVH() * 2.0; });
    var scatterR = targets.map(function () { return (Math.random() - 0.5) * 200; });
    var scatterS = targets.map(function () { return 3 + Math.random() * 5; });

    // Set initial assembled state
    gsap.set(targets, {
      x: 0, y: 0, rotation: 0, scale: 1,
      opacity: function (i) { return finalOpacity[i]; }
    });

    gsap.set(steps, { opacity: 0, y: 80 });

    // Build timeline
    var tl = gsap.timeline({ paused: true });

    // Phase 1 (0–30%): Scatter particles
    tl.to(targets, {
      x: function (i) { return scatterX[i]; },
      y: function (i) { return scatterY[i]; },
      rotation: function (i) { return scatterR[i]; },
      scale: function (i) { return scatterS[i]; },
      opacity: 0,
      ease: 'power2.inOut',
      duration: 0.3,
      stagger: { amount: 0.15, from: 'random' }
    }, 0);

    // Phase 2 (30%–100%): Steps appear one at a time
    var stepWindow = 0.7 / steps.length;

    for (var i = 0; i < steps.length; i++) {
      var startAt = 0.3 + (i * stepWindow);
      var fadeInDur = stepWindow * 0.35;
      var fadeOutStart = startAt + stepWindow * 0.65;
      var fadeOutDur = stepWindow * 0.3;

      tl.fromTo(steps[i],
        { opacity: 0, y: 80, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: fadeInDur, ease: 'power2.out' },
        startAt
      );

      // Fade out all steps except the last one
      if (i < steps.length - 1) {
        tl.to(steps[i],
          { opacity: 0, y: -40, duration: fadeOutDur, ease: 'power2.in' },
          fadeOutStart
        );
      }
    }

    // Bind timeline to scroll (pin the scene) — store reference for enable/disable
    hibScrollTrigger = ScrollTrigger.create({
      trigger: scene,
      scroller: mainContent,
      start: 'top top',
      end: '+=4000',
      pin: true,
      scrub: 1.2,
      animation: tl,
      onUpdate: function (self) {
        if (hint) {
          hint.style.opacity = self.progress < 0.02 ? '1' : '0';
        }
      }
    });
  }

  /* ══════════════════════════════════════════════════
     CATCH ME! — Easter Egg
     ══════════════════════════════════════════════════ */
  var catchMeVisible = false;

  function initCatchMe() {
    var el = document.getElementById('catch-me');
    var overlay = document.getElementById('catch-me-overlay');
    var closeBtn = document.getElementById('catch-me-close');
    if (!el || !overlay) return;

    // Skip on mobile
    if (window.innerWidth <= 768) return;

    var vpW, vpH;
    var elW = 120; // approximate element width
    var elH = 40;  // approximate element height

    // Current position
    var posX, posY;

    // Repulsion state
    var repulsionRadius = 200;
    var repulsionStrength = 1;
    var chaseTimer = null;
    var decayTween = null;
    var caught = false;

    function updateViewport() {
      vpW = window.innerWidth;
      vpH = window.innerHeight;
    }

    function setInitialPosition() {
      updateViewport();
      posX = vpW * 0.75;
      posY = vpH * 0.35;
      gsap.set(el, { left: posX, top: posY, xPercent: 0, yPercent: 0 });
    }

    function clamp(val, min, max) {
      return Math.max(min, Math.min(max, val));
    }

    function showCatchMe() {
      if (caught || window.innerWidth <= 768) return;
      el.style.display = 'flex';
      catchMeVisible = true;
      gsap.fromTo(el, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' });
    }

    function hideCatchMe() {
      catchMeVisible = false;
      gsap.to(el, { opacity: 0, scale: 0.5, duration: 0.3, ease: 'power2.in', onComplete: function () {
        el.style.display = 'none';
      }});
    }

    // Expose for tab switching
    window._catchMeShow = showCatchMe;
    window._catchMeHide = hideCatchMe;

    setInitialPosition();

    // Show on Hero initially
    if (currentTargetId === 'view-hero') {
      showCatchMe();
    }

    // Reset chase — cancel timer and restore full repulsion
    function resetChase() {
      if (chaseTimer) { clearTimeout(chaseTimer); chaseTimer = null; }
      if (decayTween) { decayTween.kill(); decayTween = null; }
      repulsionStrength = 1;
    }

    // Mouse move — flee logic
    document.addEventListener('mousemove', function (e) {
      if (!catchMeVisible || caught) return;

      var mx = e.clientX;
      var my = e.clientY;

      // Center of the element
      var cx = posX + 18; // half of dot width
      var cy = posY + 18;

      var dx = cx - mx;
      var dy = cy - my;
      var dist = Math.sqrt(dx * dx + dy * dy);

      var currentRadius = repulsionRadius * repulsionStrength;

      if (dist < currentRadius && currentRadius > 5) {
        // Start 5-second chase timer if not already running
        if (!chaseTimer) {
          chaseTimer = setTimeout(function () {
            chaseTimer = null;
            decayTween = gsap.to({ val: repulsionStrength }, {
              val: 0,
              duration: 3,
              ease: 'power2.out',
              onUpdate: function () {
                repulsionStrength = this.targets()[0].val;
              }
            });
          }, 5000);
        }

        // Calculate flee direction
        var angle = Math.atan2(dy, dx);
        var force = (1 - dist / currentRadius) * 120 * repulsionStrength;

        var newX = posX + Math.cos(angle) * force;
        var newY = posY + Math.sin(angle) * force;

        // Clamp within viewport
        updateViewport();
        newX = clamp(newX, 16, vpW - elW - 16);
        newY = clamp(newY, 64, vpH - elH - 16); // 64 to avoid project-header

        posX = newX;
        posY = newY;

        gsap.to(el, {
          left: posX,
          top: posY,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      } else {
        // Mouse left proximity — reset the 5-second timer
        resetChase();
      }
    });

    // Click — show overlay
    el.addEventListener('click', function () {
      caught = true;
      catchMeVisible = false;

      // Animate circle to center then show overlay
      updateViewport();
      gsap.to(el, {
        left: vpW / 2,
        top: vpH / 2,
        scale: 0,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: function () {
          el.style.display = 'none';

          // Show overlay
          overlay.style.visibility = 'visible';
          var texts = overlay.querySelectorAll('.catch-me-overlay__text');
          gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' });
          texts.forEach(function (t, i) {
            gsap.fromTo(t,
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.7, delay: 0.3 + i * 0.3, ease: 'power2.out' }
            );
          });
          overlay.classList.add('is-visible');
        }
      });
    });

    // Close overlay — element stays hidden after being caught
    function closeOverlay() {
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: function () {
          overlay.classList.remove('is-visible');
          overlay.style.visibility = 'hidden';
          overlay.style.opacity = 0;
        }
      });
    }

    closeBtn.addEventListener('click', closeOverlay);
    var backBtn = document.getElementById('catch-me-back');
    if (backBtn) backBtn.addEventListener('click', closeOverlay);

    // Reduced motion — skip flee, just show as static clickable
    if (prefersReducedMotion) {
      repulsionStrength = 0;
    }
  }

  /* ══════════════════════════════════════════════════
     AI CHAT — Portfolio Assistant
     ══════════════════════════════════════════════════ */
  function initAIChat() {
    var WORKER_URL = 'https://chat.the-roman.com/api/chat';
    var MAX_MESSAGES = 50;

    var input = document.getElementById('chat-input');
    var sendBtn = document.getElementById('chat-send');
    var messagesEl = document.getElementById('chat-messages');
    var statusEl = document.getElementById('chat-status');
    if (!input || !sendBtn || !messagesEl) return;

    console.log('[AI Chat] initialized');
    if (statusEl) statusEl.textContent = 'Chat online';

    var conversationHistory = [];
    var messageCount = 0;
    var isLoading = false;

    function setStatus(text) {
      console.log('[AI Chat]', text);
      if (!statusEl) return;
      // Show user-friendly status only
      if (text === 'Message limit reached') {
        statusEl.textContent = 'Chat offline';
      } else if (text.startsWith('Error') || text.startsWith('Connection error')) {
        statusEl.textContent = 'Chat offline';
      } else {
        statusEl.textContent = 'Chat online';
      }
    }

    // Show/hide send button when typing
    input.addEventListener('input', function () {
      var hasText = input.value.trim().length > 0;
      sendBtn.classList.toggle('visible', hasText);
    });

    // Send on Enter
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Send on button click
    sendBtn.addEventListener('click', sendMessage);

    function sendMessage() {
      var text = input.value.trim();
      if (!text || isLoading) return;

      messageCount++;
      setStatus('Sending message #' + messageCount + '...');

      // Check limit
      if (messageCount > MAX_MESSAGES) {
        addBubble('limit', 'Thanks for the great conversation! Let\u2019s continue directly \u2014 <a href="mailto:mailtotheroman@gmail.com">mailtotheroman@gmail.com</a> or <a href="https://linkedin.com/in/krizhanovsky" target="_blank" rel="noopener">LinkedIn</a>');
        input.disabled = true;
        sendBtn.disabled = true;
        sendBtn.classList.remove('visible');
        input.placeholder = 'Message limit reached';
        setStatus('Message limit reached');
        return;
      }

      // Add user bubble
      addBubble('user', text);
      conversationHistory.push({ role: 'user', content: text });

      // Clear input
      input.value = '';
      sendBtn.classList.remove('visible');

      // Show typing indicator
      var typing = showTyping();
      isLoading = true;
      sendBtn.disabled = true;

      setStatus('Connecting to API...');

      // Send to Worker
      fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          messageCount: messageCount
        })
      })
      .then(function (res) {
        setStatus('Response received (status ' + res.status + '), parsing...');
        return res.json();
      })
      .then(function (data) {
        removeTyping(typing);
        isLoading = false;
        sendBtn.disabled = false;

        console.log('[AI Chat] Response data:', data);

        if (data.error) {
          setStatus('Error: ' + data.error);
          addBubble('ai', 'Error: ' + data.error);
          return;
        }

        if (data.limitReached) {
          addBubble('limit', data.reply.replace(
            'mailtotheroman@gmail.com',
            '<a href="mailto:mailtotheroman@gmail.com">mailtotheroman@gmail.com</a>'
          ));
          input.disabled = true;
          sendBtn.disabled = true;
          sendBtn.classList.remove('visible');
          input.placeholder = 'Message limit reached';
          setStatus('Message limit reached');
          return;
        }

        var reply = data.reply || 'Sorry, something went wrong. Please try again.';
        addBubble('ai', reply);
        conversationHistory.push({ role: 'assistant', content: reply });
        setStatus('Ready');
      })
      .catch(function (err) {
        removeTyping(typing);
        isLoading = false;
        sendBtn.disabled = false;
        setStatus('Connection error: ' + err.message);
        addBubble('ai', 'Connection error. Please try again in a moment.');
        console.error('[AI Chat] Fetch error:', err);
      });
    }

    var mainContent = document.querySelector('.main-content');

    function scrollToBottom() {
      if (!mainContent) return;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          mainContent.scrollTo({ top: mainContent.scrollHeight, behavior: 'smooth' });
        });
      });
    }

    function addBubble(type, text) {
      messagesEl.classList.add('has-messages');

      var bubble = document.createElement('div');
      bubble.className = 'chat-bubble chat-bubble--' + type;

      if (type === 'limit') {
        bubble.innerHTML = text;
      } else {
        bubble.textContent = text;
      }

      messagesEl.appendChild(bubble);
      scrollToBottom();
    }

    function showTyping() {
      messagesEl.classList.add('has-messages');

      var wrapper = document.createElement('div');
      wrapper.className = 'chat-bubble chat-bubble--ai chat-typing';
      wrapper.innerHTML = '<span class="chat-typing-dot"></span><span class="chat-typing-dot"></span><span class="chat-typing-dot"></span>';
      messagesEl.appendChild(wrapper);
      scrollToBottom();
      return wrapper;
    }

    function removeTyping(el) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }
  }

  /* ══════════════════════════════════════════════════
     INIT
     ══════════════════════════════════════════════════ */
  function init() {
    initWordFlip();
    initNumbersMarquee();
    initRecMarquee();
    initMobileMenu();
    initCardHover();
    initInteractiveNavigation();
    initCatchMe();
    initAIChat();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
