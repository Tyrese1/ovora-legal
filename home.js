/* Ovora product page: nav frosting, reveals, the light/dark chapter morph and a damped scroll parallax.
   Progressive enhancement only; the page reads fine with this file blocked. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var doc = document.documentElement;

  /* Nav: transparent at the top, frosted once the sentinel leaves the viewport. */
  var nav = document.getElementById('nav');
  var sentinel = document.querySelector('.nav-sentinel');
  if (nav && sentinel && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      nav.classList.toggle('is-scrolled', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* Reveals: once, when a block is a fifth of the way in. */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* Chapter morph: a zero-height band at the viewport centre decides the page theme,
     so it works whatever the chapter's height. In dark mode both token sets are the same. */
  var themed = document.querySelectorAll('[data-theme-section]');
  if (themed.length && 'IntersectionObserver' in window) {
    var morph = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) doc.setAttribute('data-theme', e.target.getAttribute('data-theme-section'));
      });
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    themed.forEach(function (el) { morph.observe(el); });
  }

  /* Damped parallax: a lerped shadow scroll value moves the phones a little against the page.
     Reads scrollY inside rAF only; no scroll listener. Off under reduced motion. */
  var items = Array.prototype.map.call(document.querySelectorAll('[data-parallax]'), function (el) {
    return { el: el, k: parseFloat(el.getAttribute('data-parallax')) || 0, top: 0, h: 0 };
  });
  var heroCopy = document.querySelector('[data-hero-copy]');
  if (!items.length || reduce.matches) return;

  var current = window.scrollY, target = current, vh = window.innerHeight, running = false, raf = 0;
  function measure() {
    vh = window.innerHeight;
    var y = window.scrollY;
    items.forEach(function (it) {
      it.el.style.transform = '';
      var r = it.el.getBoundingClientRect();
      it.top = r.top + y; it.h = r.height;
    });
  }
  function frame() {
    target = window.scrollY;
    current += (target - current) * 0.1;
    if (Math.abs(target - current) < 0.05) current = target;
    var mid = current + vh / 2;
    items.forEach(function (it) {
      var centre = it.top + it.h / 2;
      if (centre < current - vh || centre > current + 2 * vh) return;
      var d = (centre - mid) * it.k;
      d = Math.max(-140, Math.min(140, d));
      it.el.style.transform = 'translate3d(0,' + d.toFixed(2) + 'px,0)';
    });
    if (heroCopy) {
      var p = Math.min(1, Math.max(0, current / (vh * 0.7)));
      heroCopy.style.opacity = (1 - p * 0.9).toFixed(3);
      heroCopy.style.transform = 'translate3d(0,' + (current * 0.14).toFixed(2) + 'px,0)';
    }
    if (current === target && !running) { raf = 0; return; }
    running = false;
    raf = requestAnimationFrame(frame);
  }
  function kick() { running = true; if (!raf) raf = requestAnimationFrame(frame); }
  measure(); kick();
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', function () { measure(); kick(); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { measure(); kick(); } });
  reduce.addEventListener && reduce.addEventListener('change', function (e) {
    if (e.matches) { items.forEach(function (it) { it.el.style.transform = ''; }); if (heroCopy) { heroCopy.style.opacity = ''; heroCopy.style.transform = ''; } }
  });
})();
