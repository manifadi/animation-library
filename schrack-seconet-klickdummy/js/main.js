/* Schrack Seconet – Klickdummy
   Statischer Stand: keine Animationen, kein Loader, kein Soft-Scroll.
   Platzhalter-Links (href="#") springen nicht an den Seitenanfang,
   außer "Nach oben". Weitere Interaktionen folgen in der nächsten Stufe. */
(function () {
  'use strict';
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href="#"]');
    if (!a) return;
    e.preventDefault();
    if (a.classList.contains('totop')) window.scrollTo(0, 0);
  });
  /* Tab-Module mit [data-tabs]: Klick bzw. Pfeiltasten schalten das Panel um */
  document.querySelectorAll('[data-tabs]').forEach(function (box) {
    var tabs = Array.prototype.slice.call(box.querySelectorAll('[role="tab"]'));
    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!n) return;
        var next = tabs[(i + n + tabs.length) % tabs.length];
        select(next); next.focus();
      });
    });
  });
})();

/* Karten-Stapel (Übersichtsseiten): mit den Pfeilen durch die Karten blättern */
document.querySelectorAll('.astack').forEach(function (stack) {
  var cards = Array.prototype.slice.call(stack.querySelectorAll('.astack__card'));
  if (cards.length < 2) return;
  var i = 0;
  var live = document.createElement('p');
  live.className = 'visually-hidden'; live.setAttribute('aria-live', 'polite');
  live.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);';
  stack.appendChild(live);
  function show(n, dir) {
    stack.setAttribute('data-dir', dir);
    i = (n + cards.length) % cards.length;
    cards.forEach(function (c, k) {
      var on = k === i;
      c.classList.toggle('is-current', on);
      if (on) c.removeAttribute('inert'); else c.setAttribute('inert', '');
    });
    var t = cards[i].querySelector('.astack__title');
    live.textContent = (i + 1) + ' von ' + cards.length + ': ' + (t ? t.textContent : '');
  }
  var prev = stack.querySelector('.astack__nav--prev');
  var next = stack.querySelector('.astack__nav--next');
  if (prev) prev.addEventListener('click', function () { show(i - 1, 'prev'); });
  if (next) next.addEventListener('click', function () { show(i + 1, 'next'); });
  stack.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { show(i - 1, 'prev'); }
    if (e.key === 'ArrowRight') { show(i + 1, 'next'); }
  });
});

/* Burger-Menü: fährt unter dem Header heraus (federndes Easing im CSS) */
(function () {
  var btn = document.querySelector('.burger');
  var menu = document.getElementById('megamenu');
  var backdrop = document.querySelector('.menu-backdrop');
  var header = document.querySelector('.site-header');
  if (!btn || !menu) return;
  var closeBtn = menu.querySelector('.megamenu__close');
  var timer;
  function isOpen() { return btn.getAttribute('aria-expanded') === 'true'; }
  function open() {
    clearTimeout(timer);
    document.documentElement.style.setProperty('--hdr', header.getBoundingClientRect().bottom + 'px');
    menu.hidden = false; if (backdrop) backdrop.hidden = false;
    void menu.offsetHeight;                       /* Reflow, damit die Transition startet */
    menu.classList.add('is-open'); document.documentElement.classList.add('menu-open'); if (backdrop) backdrop.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-label', 'Menü schließen');
    var first = menu.querySelector('a'); if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 250);
  }
  function close(returnFocus) {
    menu.classList.remove('is-open'); document.documentElement.classList.remove('menu-open'); if (backdrop) backdrop.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Menü öffnen');
    timer = setTimeout(function () { menu.hidden = true; if (backdrop) backdrop.hidden = true; }, 420);
    if (returnFocus) btn.focus();
  }
  btn.addEventListener('click', function () { isOpen() ? close() : open(); });
  if (closeBtn) closeBtn.addEventListener('click', function () { close(true); });
  if (backdrop) backdrop.addEventListener('click', function () { close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen()) close(true); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
})();

/* Kontaktformular: Auswahl „Wie sollen wir Sie kontaktieren?“ */
document.querySelectorAll('.choice').forEach(function (group) {
  var btns = Array.prototype.slice.call(group.querySelectorAll('.choice__btn'));
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      btns.forEach(function (o) { var on = o === b; o.classList.toggle('is-active', on); o.setAttribute('aria-checked', on ? 'true' : 'false'); });
    });
  });
});

/* Startseite: Tab-Modul Anwendungen / Life Cycle umschalten */
document.querySelectorAll('[data-tabmodule]').forEach(function (mod) {
  var heads = Array.prototype.slice.call(mod.querySelectorAll('.tablist__head[data-tm]'));
  function select(key, focus) {
    heads.forEach(function (h) {
      var on = h.getAttribute('data-tm') === key;
      var item = h.closest('.tablist__item');
      item.classList.toggle('is-open', on);
      h.setAttribute('aria-selected', on ? 'true' : 'false');
      h.tabIndex = on ? 0 : -1;
      item.querySelectorAll('.tablist__body a').forEach(function (a) { a.tabIndex = on ? 0 : -1; });
      var panel = document.getElementById(h.getAttribute('aria-controls'));
      panel.hidden = !on; panel.classList.toggle('is-active', on);
      if (on && focus) h.focus();
    });
    mod.querySelectorAll('[data-tm-head]').forEach(function (hd) {
      var on = hd.getAttribute('data-tm-head') === key;
      hd.hidden = !on; hd.classList.toggle('is-active', on);
    });
    mod.setAttribute('aria-labelledby', key === 'apps' ? 'tm-title-apps' : 'tm-tab-lc');
  }
  heads.forEach(function (h, i) {
    h.addEventListener('click', function () { select(h.getAttribute('data-tm')); });
    h.addEventListener('keydown', function (e) {
      var n = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ? -1 : 0;
      if (!n) return;
      e.preventDefault();
      select(heads[(i + n + heads.length) % heads.length].getAttribute('data-tm'), true);
    });
  });
});

/* Header: beim Runterscrollen ausblenden, beim Hochscrollen wieder einblenden */
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;
  var lastY = window.scrollY, ticking = false;
  var DELTA = 6;                                  /* kleine Zitterbewegungen ignorieren */
  function update() {
    var y = window.scrollY, h = header.offsetHeight;
    var menuOpen = document.documentElement.classList.contains('menu-open');
    header.classList.toggle('is-scrolled', y > 4);
    if (menuOpen || y <= h) {
      header.classList.remove('is-hidden');      /* ganz oben oder Menü offen: immer sichtbar */
    } else if (y > lastY + DELTA) {
      header.classList.add('is-hidden');         /* runter */
    } else if (y < lastY - DELTA) {
      header.classList.remove('is-hidden');      /* rauf */
    }
    if (Math.abs(y - lastY) > DELTA || y <= h) lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  /* Fokus per Tastatur im Header: Header immer zeigen */
  header.addEventListener('focusin', function () { header.classList.remove('is-hidden'); });
})();

/* News-Leiste: alle 7 Sekunden automatisch weiter; Pause bei Maus/Fokus und in Hintergrund-Tabs */
document.querySelectorAll('[data-newsbar]').forEach(function (bar) {
  var items = Array.prototype.slice.call(bar.querySelectorAll('.newsbar__item'));
  if (items.length < 2) return;
  var i = 0, timer = null, paused = false;
  var interval = parseInt(bar.getAttribute('data-interval'), 10) || 7000;
  function show(n, dir) {
    var prev = items[i];
    bar.setAttribute('data-dir', dir || 'next');
    i = (n + items.length) % items.length;
    items.forEach(function (it, k) {
      var on = k === i;
      it.classList.toggle('is-current', on);
      it.classList.toggle('is-leaving', it === prev && !on);
      if (on) it.removeAttribute('inert'); else it.setAttribute('inert', '');
    });
  }
  function start() { stop(); if (!paused) timer = setInterval(function () { show(i + 1, 'next'); }, interval); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  bar.querySelector('.newsbar__nav--prev').addEventListener('click', function () { show(i - 1, 'prev'); start(); });
  bar.querySelector('.newsbar__nav--next').addEventListener('click', function () { show(i + 1, 'next'); start(); });
  bar.addEventListener('mouseenter', function () { paused = true; stop(); });
  bar.addEventListener('mouseleave', function () { paused = false; start(); });
  bar.addEventListener('focusin', function () { paused = true; stop(); });
  bar.addEventListener('focusout', function (e) { if (!bar.contains(e.relatedTarget)) { paused = false; start(); } });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
  start();
});

/* Pager (rote Striche) für horizontale Karten-Slider */
document.querySelectorAll('[data-pager-for]').forEach(function (pager) {
  var track = document.getElementById(pager.getAttribute('data-pager-for'));
  if (!track) return;
  function pageWidth() {
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return track.clientWidth + gap;
  }
  function pageCount() { return Math.max(1, Math.round((track.scrollWidth - track.clientWidth) / pageWidth()) + 1); }
  function current() { return Math.min(pageCount() - 1, Math.round(track.scrollLeft / pageWidth())); }
  function build() {
    var n = pageCount(); pager.innerHTML = '';
    for (var k = 0; k < n; k++) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'pager__btn'; b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Seite ' + (k + 1) + ' von ' + n);
      (function (k) { b.addEventListener('click', function () { track.scrollTo({ left: k * pageWidth() }); }); })(k);
      pager.appendChild(b);
    }
    pager.hidden = n < 2;
    mark();
  }
  function mark() {
    var c = current();
    Array.prototype.forEach.call(pager.children, function (b, k) {
      var on = k === c; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }
  var raf;
  track.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(mark); }, { passive: true });
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); track.scrollTo({ left: (current() + 1) * pageWidth() }); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); track.scrollTo({ left: (current() - 1) * pageWidth() }); }
  });
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 150); });
  build();
});

