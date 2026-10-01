/* ==========================================================================
   vf-motion.js  –  Lift (Text) · Curtain (Bild) · Wave (Button)
   Aktivierung über Attribute:
     data-motion="lift"     auf Textelementen (p, h1–h6, li, blockquote …)
     data-motion="curtain"  auf dem Bild-Container (oder direkt auf <img>)
     data-motion="wave"     auf <button> oder <a>
   Optionen:
     data-motion-repeat         Animation setzt sich beim Hochscrollen zurück (Testen)
     <html data-motion-repeat>  gilt für die ganze Seite
     data-curtain-dir="right"   Curtain horizontal statt von oben
     data-curtain-full          Curtain-Bild fullscreen (100vw × 100svh)
   API: VFMotion.init(root) für nachgeladenen Inhalt, VFMotion.refresh() nach Layout-Änderungen
   ========================================================================== */
(function () {
  'use strict';

  var docEl = document.documentElement;
  docEl.classList.add('vfm-js');

  var repeatAll = function () { return docEl.hasAttribute('data-motion-repeat'); };
  var repeats = function (el) { return repeatAll() || el.hasAttribute('data-motion-repeat'); };

  /* ------------------------------------------------------------------------
     1 · LIFT
     ------------------------------------------------------------------------ */
  var original = new WeakMap();      // Original-HTML für Neuaufbau bei Resize
  var lineOf = new WeakMap();        // erstes Wort einer Zeile → alle Wörter der Zeile
  var liftEls = new Set();
  var SKIP = /^(SCRIPT|STYLE|SVG|IMG|BR|VIDEO|CANVAS|IFRAME|INPUT|TEXTAREA|SELECT|BUTTON)$/i;

  var liftIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var words = lineOf.get(entry.target);
      if (!words) return;
      var host = entry.target.closest('[data-motion~="lift"]');
      if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
        // im Viewport ODER bereits darüber hinausgescrollt → sichtbar
        words.forEach(function (w) { w.classList.add('vfm-on'); });
        if (host && !repeats(host)) liftIO.unobserve(entry.target);
      } else if (host && repeats(host)) {
        words.forEach(function (w) { w.classList.remove('vfm-on'); });
      }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0 });

  function wrapWords(node, out) {
    Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
      if (ch.nodeType === 3) {
        var parts = ch.textContent.split(/(\s+)/);
        if (parts.length === 1 && !parts[0].trim()) return;
        var frag = document.createDocumentFragment();
        parts.forEach(function (part) {
          if (!part) return;
          if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
          var s = document.createElement('span');
          s.className = 'vfm-w';
          s.textContent = part;
          frag.appendChild(s);
          out.push(s);
        });
        ch.parentNode.replaceChild(frag, ch);
      } else if (ch.nodeType === 1 && !SKIP.test(ch.tagName)) {
        wrapWords(ch, out);
      }
    });
  }

  function splitLift(el) {
    if (!original.has(el)) original.set(el, el.innerHTML);
    else el.innerHTML = original.get(el);

    var words = [];
    wrapWords(el, words);
    el.classList.add('vfm-split');

    // Wörter nach tatsächlicher Zeile gruppieren
    var lines = [], cur = [], lastTop = null;
    words.forEach(function (w) {
      var r = w.getBoundingClientRect();
      if (lastTop !== null && r.top > lastTop + r.height * 0.5) { lines.push(cur); cur = []; }
      if (lastTop === null || r.top > lastTop + r.height * 0.5) lastTop = r.top;
      cur.push(w);
    });
    if (cur.length) lines.push(cur);

    lines.forEach(function (line) {
      lineOf.set(line[0], line);
      liftIO.observe(line[0]);
    });
  }

  function initLift(el) {
    if (liftEls.has(el)) return;
    liftEls.add(el);
    splitLift(el);
  }

  function rebuildLift() {
    liftIO.disconnect();
    liftEls.forEach(splitLift);
  }

  /* ------------------------------------------------------------------------
     2 · CURTAIN
     ------------------------------------------------------------------------ */
  var curtainIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var el = entry.target;
      if (entry.intersectionRatio >= (parseFloat(el.getAttribute('data-motion-threshold')) || 0.35)) {
        el.classList.add('vfm-in');
        if (!repeats(el)) curtainIO.unobserve(el);
      } else if (!entry.isIntersecting && entry.boundingClientRect.top > 0 && repeats(el)) {
        el.classList.remove('vfm-in');   // nur beim Hochscrollen zurücksetzen
      }
    });
  }, { threshold: [0, 0.1, 0.2, 0.35, 0.5] });

  function initCurtain(el) {
    if (el.__vfmCurtain) return;
    // Attribut direkt auf <img>/<video>: in einen Container verpacken
    if (/^(IMG|VIDEO|PICTURE)$/i.test(el.tagName)) {
      var wrap = document.createElement('div');
      ['data-motion', 'data-motion-repeat', 'data-motion-threshold', 'data-curtain-dir', 'data-curtain-full'].forEach(function (a) {
        if (el.hasAttribute(a)) { wrap.setAttribute(a, el.getAttribute(a)); el.removeAttribute(a); }
      });
      wrap.style.display = 'block';
      el.parentNode.insertBefore(wrap, el);
      wrap.appendChild(el);
      if (getComputedStyle(el).display === 'inline') el.style.display = 'block';
      el = wrap;
    }
    el.__vfmCurtain = true;
    curtainIO.observe(el);
  }

  /* ------------------------------------------------------------------------
     3 · WAVE BUTTON
     ------------------------------------------------------------------------ */
  function initWave(btn) {
    if (btn.__vfmWave) return;
    btn.__vfmWave = true;
    btn.classList.add('vfm-wave');

    var halo = document.createElement('span');
    halo.className = 'vfm-halo';
    halo.setAttribute('aria-hidden', 'true');
    var fill = document.createElement('span');
    fill.className = 'vfm-fill';
    fill.setAttribute('aria-hidden', 'true');
    btn.appendChild(halo);
    btn.appendChild(fill);

    function enter() {
      btn.classList.remove('vfm-in', 'vfm-out');
      btn.classList.add('vfm-prep');          // ohne Transition an den Startpunkt (rechts)
      void btn.offsetWidth;
      btn.classList.remove('vfm-prep');
      btn.classList.add('vfm-in');
    }
    function leave() {
      if (!btn.classList.contains('vfm-in')) return;
      btn.classList.remove('vfm-in');
      btn.classList.add('vfm-out');            // zieht sich nach rechts zurück
    }

    btn.addEventListener('pointerenter', enter);
    btn.addEventListener('pointerleave', leave);
    btn.addEventListener('focus', function () { if (btn.matches(':focus-visible')) enter(); });
    btn.addEventListener('blur', leave);
  }

  /* ------------------------------------------------------------------------
     Init
     ------------------------------------------------------------------------ */
  function init(root) {
    root = root || document;
    var q = function (sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); };
    if (root.matches) {
      if (root.matches('[data-motion~="wave"]')) initWave(root);
      if (root.matches('[data-motion~="curtain"]')) initCurtain(root);
    }
    q('[data-motion~="wave"]').forEach(initWave);
    q('[data-motion~="curtain"]').forEach(initCurtain);

    var lifts = q('[data-motion~="lift"]');
    if (root.matches && root.matches('[data-motion~="lift"]')) lifts.push(root);
    var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    fontsReady.then(function () { lifts.forEach(initLift); });
  }

  var lastWidth = window.innerWidth, t;
  window.addEventListener('resize', function () {
    if (window.innerWidth === lastWidth) return;   // Mobile-Adressleiste ignorieren
    lastWidth = window.innerWidth;
    clearTimeout(t);
    t = setTimeout(rebuildLift, 150);
  });

  window.VFMotion = { init: init, refresh: rebuildLift };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); });
  else init();
})();
