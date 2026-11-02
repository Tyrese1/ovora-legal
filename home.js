/* Ovora product page: nav frosting, reveals, the pinned Today scene, the light/dark chapter morph,
   and a damped scroll engine (hero progress + phone parallax). Progressive enhancement only;
   the page reads fine with this file blocked. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var doc = document.documentElement;
  var hasIO = 'IntersectionObserver' in window;

  /* Nav: transparent at the top, frosted once the sentinel leaves the viewport. */
  var nav = document.getElementById('nav');
  var sentinel = document.querySelector('.nav-sentinel');
  if (nav && sentinel && hasIO) {
    new IntersectionObserver(function (entries) {
      nav.classList.toggle('is-scrolled', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* Reveals: once, when a block is a tenth of the way in. */
  var reveals = document.querySelectorAll('.reveal');
  if (hasIO) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* Centre band: a zero-height strip at mid-viewport. It drives the chapter morph
     (light/dark tokens) and the pinned scene's active beat, whatever the element's height. */
  var band = { rootMargin: '-50% 0px -50% 0px', threshold: 0 };
  var themed = document.querySelectorAll('[data-theme-section]');
  if (themed.length && hasIO) {
    var morph = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) doc.setAttribute('data-theme', e.target.getAttribute('data-theme-section'));
      });
    }, band);
    themed.forEach(function (el) { morph.observe(el); });
  }
  var beats = document.querySelectorAll('.beat');
  if (beats.length && hasIO) {
    var beatIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        beats.forEach(function (b) { b.classList.toggle('is-active', b === e.target); });
      });
    }, band);
    beats.forEach(function (el) { beatIO.observe(el); });
  }

  /* Damped scroll engine. A shadow scroll value lerps toward the real one inside rAF
     (the read is smoothed, native scrolling is never touched). It drives:
     - the hero: phones drift up, shrink a little and fade as the page leaves them;
     - [data-parallax] phones: a small counter-move against the page.
     Uses the translate/scale properties so CSS transform animations (the float) still compose. */
  var items = Array.prototype.map.call(document.querySelectorAll('[data-parallax]'), function (el) {
    return { el: el, k: parseFloat(el.getAttribute('data-parallax')) || 0, top: 0, h: 0 };
  });
  var heroArt = document.querySelector('[data-hero-art]');
  var heroCopy = document.querySelector('[data-hero-copy]');
  if ((!items.length && !heroArt) || reduce.matches) return;

  var current = window.scrollY, target = current, vh = window.innerHeight, running = false, raf = 0, last = 0;
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function measure() {
    vh = window.innerHeight;
    var y = window.scrollY;
    items.forEach(function (it) {
      it.el.style.translate = '';
      var r = it.el.getBoundingClientRect();
      it.top = r.top + y; it.h = r.height;
    });
  }
  function frame(now) {
    target = window.scrollY;
    /* Frame-rate independent damping: 0.1 per 60 Hz frame, whatever the real frame rate. */
    var dt = last ? Math.min(200, now - last) : 16.7; last = now;
    current += (target - current) * (1 - Math.pow(0.9, dt / 16.7));
    if (Math.abs(target - current) < 0.05) current = target;
    var mid = current + vh / 2;
    items.forEach(function (it) {
      var centre = it.top + it.h / 2;
      if (centre < current - vh || centre > current + 2 * vh) return;
      var d = (centre - mid) * it.k;
      d = Math.max(-140, Math.min(140, d));
      it.el.style.translate = '0 ' + d.toFixed(2) + 'px';
    });
    var p = clamp01(current / (vh * 0.9));
    if (heroArt) {
      heroArt.style.translate = '0 ' + (-p * 90).toFixed(2) + 'px';
      heroArt.style.scale = (1 - p * 0.06).toFixed(4);
      heroArt.style.opacity = (1 - p * 0.5).toFixed(3);
    }
    if (heroCopy) {
      /* Bound to the hero's own range: fully gone at p = 1 and never past its section. */
      heroCopy.style.opacity = (1 - p).toFixed(3);
      heroCopy.style.translate = '0 ' + (p * 72).toFixed(2) + 'px';
      heroCopy.style.visibility = p >= 1 ? 'hidden' : '';
    }
    if (current === target && !running) { raf = 0; last = 0; return; }
    running = false;
    raf = requestAnimationFrame(frame);
  }
  function kick() { running = true; if (!raf) raf = requestAnimationFrame(frame); }
  measure(); kick();
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', function () { measure(); kick(); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { measure(); kick(); } });
  if (reduce.addEventListener) reduce.addEventListener('change', function (e) {
    if (!e.matches) return;
    items.forEach(function (it) { it.el.style.translate = ''; });
    [heroArt, heroCopy].forEach(function (el) { if (el) { el.style.translate = ''; el.style.scale = ''; el.style.opacity = ''; el.style.visibility = ''; } });
  });
})();
