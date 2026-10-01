/* ==========================================================================
   vf-gallery-arrows.js  –  Galerie-Pfeile als Cursor-Bubble

   Markup (auf der Bildfläche einer BESTEHENDEN Galerie):
     <div class="slider-stage"
          data-motion="gallery-arrows"
          data-gallery-prev=".slider .arrow-left"
          data-gallery-next=".slider .arrow-right">
       …Bilder… <button class="arrow-left">…</button> <button class="arrow-right">…</button>
     </div>

   Verhalten:
   - Originale Pfeile werden ausgeblendet (bleiben im DOM), stattdessen zwei weiße Bubbles.
   - Maus/Trackpad: Bubble erscheint nur im linken bzw. rechten Bereich (Standard 30 %),
     zieht weich unter dem Cursor mit und wird bei schneller Bewegung größer (bis +34 %).
   - Klick in der Zone löst den Klick auf den ORIGINALEN Pfeil aus → bestehende Slider-Logik bleibt.
   - Während gedrückter Maustaste: Bubble in Neon (--vfg-accent).
   - Touch / Reduced Motion: Bubbles fix links und rechts mittig, immer sichtbar.

   Optionen (Attribute auf der Stage):
     data-gallery-prev / data-gallery-next   CSS-Selektor der Original-Pfeile (Pflicht, falls nicht auto-erkannt)
     data-gallery-zone="0.3"                 Zonenbreite je Seite (0.25 = Viertel)
     data-gallery-max-scale="0.34"           maximale Vergrößerung bei schneller Bewegung
   API: VFGallery.init(root) für nachgeladene Galerien
   ========================================================================== */
(function () {
  'use strict';

  var AUTO_PREV = '.prev, .gallery-prev, .slider-prev, .swiper-button-prev, .slick-prev, .splide__arrow--prev, .glide__arrow--left, [data-prev], [aria-label*="orherig"], [aria-label*="Previous"]';
  var AUTO_NEXT = '.next, .gallery-next, .slider-next, .swiper-button-next, .slick-next, .splide__arrow--next, .glide__arrow--right, [data-next], [aria-label*="ächst"], [aria-label*="Next"]';

  var ICON = {
    prev: '<svg viewBox="0 0 140 128" aria-hidden="true"><path d="M68 3.5 7 64l61 60.5M7 64h133"/></svg>',
    next: '<svg viewBox="0 0 140 128" aria-hidden="true"><path d="M72 3.5 133 64l-61 60.5M133 64H0"/></svg>'
  };

  function findOriginal(stage, attr, auto) {
    var sel = stage.getAttribute(attr);
    if (sel) return document.querySelector(sel);
    // Auto-Erkennung: zuerst in der Stage, dann im nächsten Galerie-Container
    return stage.querySelector(auto) || (stage.parentElement && stage.parentElement.querySelector(auto)) || null;
  }

  function makeBubble(side, original) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'vfg-bubble vfg-' + side;
    b.setAttribute('aria-label', (original && original.getAttribute('aria-label')) || (side === 'prev' ? 'Vorheriges Bild' : 'Nächstes Bild'));
    b.innerHTML = ICON[side];
    return b;
  }

  function init(root) {
    root = root || document;
    var stages = Array.prototype.slice.call(root.querySelectorAll('[data-motion~="gallery-arrows"]'));
    if (root.matches && root.matches('[data-motion~="gallery-arrows"]')) stages.push(root);
    stages.forEach(setup);
  }

  function setup(stage) {
    if (stage.__vfg) return;
    stage.__vfg = true;

    var orig = {
      prev: findOriginal(stage, 'data-gallery-prev', AUTO_PREV),
      next: findOriginal(stage, 'data-gallery-next', AUTO_NEXT)
    };
    if (!orig.prev || !orig.next) {
      console.warn('[vf-gallery-arrows] Original-Pfeile nicht gefunden. data-gallery-prev / data-gallery-next setzen.', stage);
      stage.__vfg = false;
      return;
    }
    orig.prev.classList.add('vfg-original');
    orig.next.classList.add('vfg-original');

    var els = { prev: makeBubble('prev', orig.prev), next: makeBubble('next', orig.next) };
    stage.appendChild(els.prev);
    stage.appendChild(els.next);

    var trigger = function (side) { orig[side].click(); };
    var release = function () { els.prev.classList.remove('vfg-pressed'); els.next.classList.remove('vfg-pressed'); };

    // Bubbles selbst sind echte Buttons (Touch, Tastatur)
    ['prev', 'next'].forEach(function (side) {
      els[side].addEventListener('click', function (e) { e.stopPropagation(); trigger(side); });
      els[side].addEventListener('pointerdown', function () { els[side].classList.add('vfg-pressed'); });
    });
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);

    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reduced) return;           // Fallback: fixe, sichtbare Bubbles

    /* ── Follow-Modus ── */
    stage.classList.add('vfg-follow');

    var ZONE = parseFloat(stage.getAttribute('data-gallery-zone')) || 0.3;
    var MAX_SCALE = parseFloat(stage.getAttribute('data-gallery-max-scale'));
    if (isNaN(MAX_SCALE)) MAX_SCALE = 0.34;

    var st = {
      prev: { x: 0, y: 0, tx: 0, ty: 0, show: 0, ts: 0, press: 1 },
      next: { x: 0, y: 0, tx: 0, ty: 0, show: 0, ts: 0, press: 1 }
    };
    var ptr = { x: 0, y: 0, px: 0, py: 0, t: performance.now(), speed: 0 };
    var zone = null;
    var half = els.prev.offsetWidth / 2;
    var running = false;
    var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
    var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };

    function target(side, px, py, w, h) {
      var pad = half + 10;
      var minX = side === 'prev' ? pad : w * (1 - ZONE) + half * 0.3;
      var maxX = side === 'prev' ? w * ZONE - half * 0.3 : w - pad;
      return { x: clamp(px, minX, maxX), y: clamp(py, pad, h - pad) };
    }

    function isForeignControl(el) {
      var c = el.closest('a, button, input, select, textarea, label, [role="button"]');
      return c && !c.classList.contains('vfg-bubble') && stage.contains(c);
    }

    stage.addEventListener('pointermove', function (e) {
      var r = stage.getBoundingClientRect();
      var px = e.clientX - r.left, py = e.clientY - r.top;
      ptr.x = px; ptr.y = py;
      zone = isForeignControl(e.target) ? null
        : px < r.width * ZONE ? 'prev'
        : px > r.width * (1 - ZONE) ? 'next' : null;
      stage.classList.toggle('vfg-in-zone', !!zone);
      ['prev', 'next'].forEach(function (side) {
        var s = st[side];
        s.ts = side === zone ? 1 : 0;
        if (side === zone) {
          var t = target(side, px, py, r.width, r.height);
          s.tx = t.x; s.ty = t.y;
          if (s.show < 0.05) { s.x = t.x; s.y = t.y; }   // frisch eingetreten: direkt am Cursor starten
        }
      });
      start();
    });

    stage.addEventListener('pointerleave', function () {
      zone = null;
      stage.classList.remove('vfg-in-zone');
      st.prev.ts = st.next.ts = 0;
      release();
    });

    stage.addEventListener('pointerdown', function (e) {
      if (!zone || e.button !== 0) return;
      els[zone].classList.add('vfg-pressed');
      st[zone].press = 0.88;
    });

    stage.addEventListener('click', function (e) {
      if (!zone || isForeignControl(e.target)) return;
      trigger(zone);
    });

    // Tastatur: Bubble an fester Position zeigen
    ['prev', 'next'].forEach(function (side) {
      els[side].addEventListener('focus', function () {
        if (!els[side].matches(':focus-visible')) return;
        var r = stage.getBoundingClientRect();
        var s = st[side];
        s.tx = side === 'prev' ? r.width * 0.026 + half : r.width * 0.974 - half;
        s.ty = r.height / 2;
        if (s.show < 0.05) { s.x = s.tx; s.y = s.ty; }
        s.ts = 1;
        start();
      });
      els[side].addEventListener('blur', function () { if (zone !== side) st[side].ts = 0; });
    });

    window.addEventListener('resize', function () { half = els.prev.offsetWidth / 2; });

    function start() {
      if (running) return;
      running = true;
      ptr.t = performance.now();
      requestAnimationFrame(tick);
    }

    function tick(now) {
      var dt = Math.max(now - ptr.t, 1);
      var v = Math.hypot(ptr.x - ptr.px, ptr.y - ptr.py) / dt;   // px/ms
      ptr.px = ptr.x; ptr.py = ptr.y; ptr.t = now;
      ptr.speed += (v - ptr.speed) * 0.12;
      var speedScale = 1 + Math.min(ptr.speed * 0.16, MAX_SCALE);

      var busy = false;
      ['prev', 'next'].forEach(function (side) {
        var s = st[side];
        s.x += (s.tx - s.x) * 0.18;              // Trägheit beim Folgen
        s.y += (s.ty - s.y) * 0.18;
        s.show += (s.ts - s.show) * 0.14;        // Ein-/Ausblenden
        s.press += (1 - s.press) * 0.18;         // Klick-Impuls
        if (s.ts === 0 && s.show < 0.002) { s.show = 0; els[side].style.opacity = 0; return; }
        busy = true;
        var active = side === zone ? speedScale : 1;
        var scale = (0.5 + 0.5 * easeOut(clamp(s.show, 0, 1))) * active * s.press;
        els[side].style.opacity = clamp(s.show * 1.4, 0, 1).toFixed(3);
        els[side].style.transform =
          'translate3d(' + (s.x - half).toFixed(2) + 'px,' + (s.y - half).toFixed(2) + 'px,0) scale(' + scale.toFixed(3) + ')';
      });

      if (busy || ptr.speed > 0.01) requestAnimationFrame(tick);
      else running = false;                      // Loop schläft, wenn nichts zu tun ist
    }
  }

  window.VFGallery = { init: init };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); });
  else init();
})();
