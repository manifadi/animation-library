// Manzenreiter – Startseite

/* ---------- Preloader ----------
   Wartet, bis das M mindestens 1,7 s stand UND window "load" gefeuert hat,
   dann 150 ms Pause und Curtain (1,5 s). Bei 50 % – Fläche deckt alles ab –
   verschwindet der weiße Loader, danach werden beide Layer entfernt. */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('is-loading')) return;

  var loader = document.querySelector('.preloader');
  var curtain = document.querySelector('.preloader-curtain');

  // Seite beginnt immer oben beim Hero-Video (außer ein Anker wie #… ist gewünscht)
  if (!location.hash) window.scrollTo(0, 0);
  // script.js läuft erst nach geladenem CSS, also ab Start der M-Animation
  var start = performance.now();

  var MIN_VISIBLE = 1700;
  var PAUSE = 150;
  var CURTAIN = 1500;

  var minTime = new Promise(function (resolve) {
    setTimeout(resolve, Math.max(0, MIN_VISIBLE - (performance.now() - start)));
  });
  var loaded = new Promise(function (resolve) {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve, { once: true });
  });

  /* Curtain- und Lift-Reveals (vf-motion) erst nach dem Preloader scharf schalten.
     Sonst würden Bilder/Texte, die beim Laden schon im Viewport stehen (z. B. durch
     wiederhergestellte Scrollposition), unsichtbar hinter dem Loader aufgedeckt.
     script.js läuft vor dem per defer geladenen vf-motion.js, das Attribut ist
     beim Init von vf-motion also noch nicht da. */
  var waiting = Array.prototype.slice.call(document.querySelectorAll('[data-motion~="curtain"], [data-motion~="lift"]'));
  waiting.forEach(function (el) {
    el.setAttribute('data-motion-wait', el.getAttribute('data-motion'));
    el.removeAttribute('data-motion');
  });

  // Ausgangszustand (Bild verborgen) wiederherstellen, solange die Seite verdeckt ist
  function armReveals() {
    waiting.forEach(function (el) {
      el.setAttribute('data-motion', el.getAttribute('data-motion-wait'));
      el.removeAttribute('data-motion-wait');
    });
  }
  // Ab jetzt beobachten: Reveal startet, sobald das Bild im sichtbaren Bereich ist
  function startReveals() {
    if (window.VFMotion) waiting.forEach(function (el) { window.VFMotion.init(el); });
  }

  var done = false;
  function finish() {
    if (done) return;
    done = true;
    root.classList.remove('is-loading', 'is-revealing');
    if (loader) loader.remove();
    if (curtain) curtain.remove();
    startReveals();
  }

  Promise.all([minTime, loaded]).then(function () {
    setTimeout(function () {
      // falls der Browser doch eine alte Scrollposition wiederhergestellt hat: zurück nach oben,
      // solange der Loader die Seite noch verdeckt
      if (!location.hash && window.scrollY !== 0) window.scrollTo(0, 0);
      root.classList.add('is-revealing');
      setTimeout(function () {
        if (loader) loader.classList.add('is-hidden');
        armReveals();
      }, CURTAIN / 2);
      if (curtain) curtain.addEventListener('animationend', finish, { once: true });
      setTimeout(finish, CURTAIN + 100);   // Absicherung, falls animationend ausbleibt
    }, PAUSE);
  });
})();

/* ---------- Lift in beide Richtungen, rein und raus ----------
   vf-motion deckt Lift-Text nur einmal beim Runterscrollen auf. Diese Ergänzung
   macht jede Zeile scharf, sobald sie die Randzone verlässt und ins Bild kommt
   (von unten wie von oben), und animiert sie wieder heraus (Blur, Deckkraft,
   Versatz), sobald sie beim Weiterscrollen in die Randzone am Bildschirmrand gerät.
   Wörter einer Zeile liegen auf gleicher Höhe und schalten daher gemeinsam.
   Arbeitet nur mit den Wort-Spans (.vfm-w / .vfm-on) von vf-motion. */
(function () {
  if (!('IntersectionObserver' in window)) return;

  var hosts = Array.prototype.slice.call(
    document.querySelectorAll('[data-motion~="lift"], [data-motion-wait~="lift"]')
  );
  if (!hosts.length) return;

  /* Breite der Randzone oben und unten.
     Standard wie vf-motion (12 %); die Textspalten der Intro-Sections reagieren näher am Rand. */
  var EDGE_DEFAULT = '12%';
  var EDGE_INTRO = '4%';
  function edgeFor(host) { return host.closest('.intro') ? EDGE_INTRO : EDGE_DEFAULT; }

  var inView = new WeakMap();
  var observers = {};

  function onChange(entries) {
    entries.forEach(function (e) {
      var w = e.target;
      if (e.isIntersecting) {
        inView.set(w, true);
        w.classList.add('vfm-on');
        return;
      }
      inView.set(w, false);
      // Oben raus → nach oben weg, unten raus → nach unten weg (Gegenrichtung beim Wiedereintritt)
      var above = e.rootBounds ? e.boundingClientRect.top < e.rootBounds.top : e.boundingClientRect.top < 0;
      w.classList.toggle('vfm-above', above);
      // einen Frame später, damit vf-motions eigener Observer nicht dazwischenfunkt
      requestAnimationFrame(function () {
        if (!inView.get(w)) w.classList.remove('vfm-on');
      });
    });
  }

  // Erst beim ersten Split anlegen, damit diese Observer nach dem von vf-motion laufen
  function observerFor(edge) {
    if (!observers[edge]) {
      observers[edge] = new IntersectionObserver(onChange, {
        rootMargin: '-' + edge + ' 0px -' + edge + ' 0px',
        threshold: 0
      });
    }
    return observers[edge];
  }

  function observeWords() {
    Object.keys(observers).forEach(function (k) { observers[k].disconnect(); });
    hosts.forEach(function (host) {
      var io = observerFor(edgeFor(host));
      host.querySelectorAll('.vfm-w').forEach(function (w) { io.observe(w); });
    });
  }

  // vf-motion zerlegt den Text (und nach Resize neu) → dann neu beobachten
  var pending = false;
  var mo = new MutationObserver(function () {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; observeWords(); });
  });
  hosts.forEach(function (host) { mo.observe(host, { childList: true, subtree: true }); });
})();

/* ---------- Vollbild-Menü ----------
   Geöffnet über "Animationserklärungen ˅" und den Burger, geschlossen über das X
   oder die Escape-Taste. Die Menüpunkte öffnen das Sidepanel (siehe unten). */
(function () {
  var menu = document.getElementById('menu');
  if (!menu) return;

  var root = document.documentElement;
  var openers = Array.prototype.slice.call(document.querySelectorAll('[data-menu-open]'));
  var closeBtn = menu.querySelector('[data-menu-close]');
  var lastOpener = null;

  function setExpanded(value) {
    openers.forEach(function (btn) { btn.setAttribute('aria-expanded', value ? 'true' : 'false'); });
  }

  // Öffnen/Schließen animiert (siehe .menu in styles.css): erst sichtbar schalten,
  // dann .is-open setzen; beim Schließen erst nach dem Wisch wieder verstecken.
  var hideTimer = null;
  var CLOSE_DURATION = 800;   // Wisch nach oben inkl. Verzögerung

  function open(e) {
    if (e && e.currentTarget) lastOpener = e.currentTarget;
    clearTimeout(hideTimer);
    menu.hidden = false;
    void menu.offsetWidth;    // Startzustand rendern, damit die Transition läuft
    menu.classList.add('is-open');
    root.classList.add('menu-open');
    setExpanded(true);
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  function close() {
    if (menu.hidden || !menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open');
    setExpanded(false);
    if (lastOpener) lastOpener.focus({ preventScroll: true });
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      menu.hidden = true;
      root.classList.remove('menu-open');
    }, CLOSE_DURATION);
  }

  openers.forEach(function (btn) { btn.addEventListener('click', open); });
  if (closeBtn) closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
})();

/* ---------- Sidepanel: Animationserklärungen ----------
   Ein Klick auf einen Menüpunkt öffnet rechts das Panel mit der passenden Erklärung;
   das Menü bleibt dahinter offen. Schließen über X, Klick auf die abgedunkelte
   Fläche oder Escape (schließt zuerst nur das Panel). Nur das Panel scrollt. */
(function () {
  var panel = document.getElementById('sidepanel');
  if (!panel) return;

  var articles = Array.prototype.slice.call(panel.querySelectorAll('[data-panel]'));
  var scroller = panel.querySelector('.sidepanel__scroll');
  var closeBtn = panel.querySelector('.sidepanel__close');
  var lastOpener = null;
  var hideTimer = null;
  var CLOSE_DURATION = 550;

  function open(id, opener) {
    var found = false;
    articles.forEach(function (a) {
      var match = a.getAttribute('data-panel') === id;
      a.hidden = !match;
      // Überschrift des aktiven Artikels als Dialog-Titel
      var h = a.querySelector('.sidepanel__title');
      if (h) { if (match) h.id = 'sidepanel-title'; else h.removeAttribute('id'); }
      if (match) found = true;
    });
    if (!found) return;

    lastOpener = opener || null;
    clearTimeout(hideTimer);
    if (scroller) scroller.scrollTop = 0;
    panel.hidden = false;
    void panel.offsetWidth;          // Startzustand rendern, damit die Transition läuft
    panel.classList.add('is-open');
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  function close() {
    if (panel.hidden || !panel.classList.contains('is-open')) return;
    panel.classList.remove('is-open');
    if (lastOpener) lastOpener.focus({ preventScroll: true });
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () { panel.hidden = true; }, CLOSE_DURATION);
  }

  document.querySelectorAll('[data-panel-open]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      open(link.getAttribute('data-panel-open'), link);
    });
  });
  panel.querySelectorAll('[data-panel-close]').forEach(function (el) {
    el.addEventListener('click', close);
  });

  // Escape schließt zuerst nur das Panel, nicht auch das Menü dahinter
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || panel.hidden || !panel.classList.contains('is-open')) return;
    e.stopImmediatePropagation();
    close();
  }, true);
})();

/* ---------- Showroom-Slider ----------
   Slider-Logik für die bestehenden Pfeile: Beim Blättern gleitet das aktuelle Bild
   seitlich hinaus und das nächste kommt von der anderen Seite herein (Carousel),
   die Nummer 01–05 wandert mit. Die Gallery-Arrows (vf-gallery-arrows.js) lösen
   genau diese Original-Pfeile aus.
   Derzeit gibt es nur ein Showroom-Bild – jede Slide zeigt deshalb dasselbe Bild.
   Mit echten Bildern: in SLIDES eintragen. */
(function () {
  var slider = document.querySelector('.slider');
  if (!slider) return;
  var stage = slider.querySelector('.slider__stage');
  var current = slider.querySelector('.slider__image');
  var numbers = Array.prototype.slice.call(slider.querySelectorAll('.slider__pager span'));
  var prev = slider.querySelector('.slider__btn--prev');
  var next = slider.querySelector('.slider__btn--next');
  if (!stage || !current || !numbers.length || !prev || !next) return;

  var SLIDES = numbers.map(function () { return current.getAttribute('src'); });
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var index = Math.max(0, numbers.findIndex(function (n) { return n.classList.contains('accent'); }));
  var leaving = null;   // Bild, das gerade hinausgleitet

  // laufenden Wechsel sofort abschließen (bei schnellem Mehrfachklicken)
  function settle() {
    if (leaving) { leaving.remove(); leaving = null; }
    current.classList.remove('is-moving');
    current.style.transform = '';
  }

  function show(i, dir) {
    settle();
    index = (i + numbers.length) % numbers.length;
    numbers.forEach(function (n, k) { n.classList.toggle('accent', k === index); });

    var incoming = current.cloneNode(false);
    incoming.setAttribute('src', SLIDES[index]);
    if (reduced) {
      current.replaceWith(incoming);
      current = incoming;
      return;
    }

    // neues Bild außerhalb der Bühne bereitlegen (rechts bei "weiter", links bei "zurück")
    incoming.style.transform = 'translateX(' + (dir * 100) + '%)';
    current.after(incoming);
    void incoming.offsetWidth;

    leaving = current;
    current = incoming;
    leaving.classList.add('is-moving');
    incoming.classList.add('is-moving');
    leaving.style.transform = 'translateX(' + (-dir * 100) + '%)';
    incoming.style.transform = 'translateX(0)';

    var out = leaving;
    incoming.addEventListener('transitionend', function done(e) {
      if (e.propertyName !== 'transform') return;
      incoming.removeEventListener('transitionend', done);
      if (leaving === out) settle();
    });
  }

  prev.addEventListener('click', function () { show(index - 1, -1); });
  next.addEventListener('click', function () { show(index + 1, 1); });
})();

/* ---------- Fliegende Hover-Linie (obere Navigation) ----------
   Eine grüne Linie statt einer Unterstreichung pro Punkt:
   - Ruhe: rechts außerhalb des Bildschirms
   - erster Hover: fliegt von rechts unter das Wort
   - Wechsel zwischen Punkten: gleitet flüssig, passt die Länge an
   - Menü verlassen: fliegt wieder nach rechts hinaus */
(function () {
  function textRect(el) {
    // nur den sichtbaren Text messen (z. B. ohne den Pfeil bei "Animationserklärungen")
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { return n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP; }
    });
    var node = walker.nextNode();
    if (!node) return el.getBoundingClientRect();
    var v = node.nodeValue;
    var start = v.search(/\S/);
    var end = v.replace(/\s+$/, '').length;
    var range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, end);
    return range.getBoundingClientRect();
  }

  function flyingLine(container, items, leaveTriggers) {
    if (!container || !items.length) return null;

    var line = document.createElement('span');
    line.className = 'fly-line';
    line.setAttribute('aria-hidden', 'true');
    container.appendChild(line);

    var inside = false;
    var cur = { x: 0, y: 0, w: 0 };

    function offRight() {
      // knapp hinter dem rechten Bildschirmrand, in Koordinaten des Containers
      return document.documentElement.clientWidth - container.getBoundingClientRect().left + 24;
    }

    function place(x, y, w, instant) {
      if (instant) line.style.transition = 'none';
      line.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scaleX(' + Math.max(w, 1).toFixed(2) + ')';
      if (instant) { void line.offsetWidth; line.style.transition = ''; }
      cur = { x: x, y: y, w: w };
    }

    function to(item) {
      var c = container.getBoundingClientRect();
      var r = textRect(item);
      var x = r.left - c.left;
      var y = r.bottom - c.top;
      line.classList.remove('is-leaving');
      // von draußen: erst unsichtbar auf die richtige Höhe rechts außerhalb setzen, dann reinfliegen
      if (!inside) place(offRight(), y, r.width, true);
      place(x, y, r.width);
      inside = true;
    }

    function out() {
      if (!inside) return;
      inside = false;
      line.classList.add('is-leaving');
      place(offRight(), cur.y, cur.w);
    }

    function reset() {
      inside = false;
      line.classList.remove('is-leaving');
      place(offRight(), cur.y, cur.w, true);
    }

    items.forEach(function (item) {
      item.addEventListener('pointerenter', function () { to(item); });
      item.addEventListener('focus', function () { if (item.matches(':focus-visible')) to(item); });
    });
    (leaveTriggers || []).forEach(function (el) { el.addEventListener('pointerenter', out); });
    container.addEventListener('pointerleave', out);
    container.addEventListener('focusout', function (e) {
      if (!container.contains(e.relatedTarget)) out();
    });
    window.addEventListener('resize', function () { if (!inside) reset(); });

    reset();
    return { reset: reset, out: out };
  }

  // Obere Navigation (ohne Sale-Button – dort fliegt die Linie raus)
  var nav = document.querySelector('.site-nav');
  if (nav) {
    flyingLine(
      nav,
      Array.prototype.slice.call(nav.querySelectorAll(':scope > a:not(.site-nav__sale), :scope > .site-nav__toggle')),
      Array.prototype.slice.call(nav.querySelectorAll('.site-nav__sale'))
    );
  }
})();

/* ---------- Sticky-Header ----------
   - über dem Hero-Video: immer transparent mit weißer Schrift
   - runterscrollen: gleitet nach oben aus dem Bild (.is-hidden)
   - hochscrollen: kommt zurück – weiß mit schwarzer Schrift (.is-solid) aber erst,
     wenn der Header nicht mehr über dem Hero-Video liegt */
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;
  var hero = document.querySelector('.hero');

  // Liegt der Header (noch) über dem Hero-Video?
  function overHero(y) {
    return hero ? y < hero.offsetTop + hero.offsetHeight - header.offsetHeight : y <= 10;
  }

  var root = document.documentElement;
  var TOP = 10;        // bis hierhin gilt "ganz oben"
  var DELTA = 4;       // Mindest-Scrollweg, damit kleines Zittern nichts auslöst
  var lastY = window.scrollY;
  var ticking = false;

  function update() {
    ticking = false;
    var y = window.scrollY;
    var dy = y - lastY;

    // Während Preloader, Menü oder Panel ist das Scrollen gesperrt → nur die Farbe anpassen
    if (root.classList.contains('is-loading') || root.classList.contains('menu-open')) {
      header.classList.toggle('is-solid', !overHero(y));
      lastY = y;
      return;
    }

    if (y <= TOP) {
      header.classList.remove('is-hidden');
    } else if (dy > DELTA && y > header.offsetHeight) {
      header.classList.add('is-hidden');
    } else if (dy < -DELTA) {
      header.classList.remove('is-hidden');
    }
    // Weiß nur außerhalb des Hero-Videos (beim Einblenden schon vorher gesetzt, solange noch versteckt)
    header.classList.toggle('is-solid', !overHero(y));
    if (Math.abs(dy) > DELTA || y <= TOP) lastY = y;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });

  // Tastatur: Fokus im Header holt ihn zurück
  header.addEventListener('focusin', function () {
    header.classList.toggle('is-solid', !overHero(window.scrollY));
    header.classList.remove('is-hidden');
  });

  // Beim Laden: weiß nur, wenn die Seite schon unterhalb des Hero-Videos steht
  header.classList.toggle('is-solid', !overHero(window.scrollY));
  window.addEventListener('load', function () {
    header.classList.toggle('is-solid', !overHero(window.scrollY));
  });
})();

/* ---------- Footer-"M" ----------
   Wird wie im Preloader gezeichnet, sobald es ins Bild kommt, und läuft rückwärts
   heraus, sobald es den Bildschirm verlässt (Randzone 12 % oben/unten). */
(function () {
  var mono = document.querySelector('.site-footer__monogram');
  if (!mono || !('IntersectionObserver' in window)) {
    if (mono) mono.classList.add('is-drawn');
    return;
  }
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { mono.classList.toggle('is-drawn', e.isIntersecting); });
  }, { rootMargin: '-12% 0px -12% 0px', threshold: 0 }).observe(mono);
})();

/* ---------- Seitenwechsel-Curtain ----------
   Klick auf einen Link (außer Mega-Menü und Sidepanel):
   1. schwarze Fläche fällt von oben über die Seite
   2. Navigation zur neuen Seite – ein Flag in sessionStorage sagt ihr, dass sie
      verdeckt startet (siehe Inline-Script im <head>, Klasse .is-arriving)
   3. auf der neuen Seite löst sich die Fläche nach unten auf
   Platzhalter-Links (href="#") simulieren einen Seitenwechsel: verdecken, nach oben
   springen, auflösen. */
(function () {
  var root = document.documentElement;
  var curtain = document.querySelector('.page-curtain');
  if (!curtain) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var busy = false;

  function onceTransition(fn) {
    var done = false;
    function finish() { if (done) return; done = true; fn(); }
    curtain.addEventListener('transitionend', function handler(e) {
      if (e.target !== curtain || e.propertyName !== 'transform') return;
      curtain.removeEventListener('transitionend', handler);
      finish();
    });
    setTimeout(finish, 1100);          // Absicherung, falls transitionend ausbleibt
  }

  function reveal() {
    curtain.classList.add('is-revealing');
    curtain.classList.remove('is-covering');
    root.classList.remove('is-arriving');
    onceTransition(function () {
      curtain.classList.remove('is-revealing');
      busy = false;
    });
  }

  // 3. Ankunft: kurz warten, bis die Seite steht, dann auflösen
  if (root.classList.contains('is-arriving')) {
    busy = true;
    var ready = new Promise(function (resolve) {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', resolve, { once: true });
    });
    var cap = new Promise(function (resolve) { setTimeout(resolve, 1200); });
    Promise.race([ready, cap]).then(function () {
      requestAnimationFrame(function () { requestAnimationFrame(reveal); });
    });
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href]');
    if (!a || a.closest('#menu, #sidepanel')) return;              // Mega-Menü & Panel ausgenommen
    if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    var url = new URL(a.getAttribute('href'), location.href);
    // http(s) und lokal geöffnete Dateien (file://); mailto:, tel: … normal lassen
    if (!/^(https?|file):$/.test(url.protocol)) return;
    if (reduced) return;

    e.preventDefault();
    if (busy) return;
    busy = true;

    var placeholder = a.getAttribute('href') === '#';
    curtain.classList.remove('is-revealing');
    curtain.classList.add('is-covering');

    onceTransition(function () {
      if (placeholder) {
        window.scrollTo(0, 0);
        setTimeout(reveal, 150);
        return;
      }
      // nur eigene Seiten wissen mit dem Flag etwas anzufangen
      if (url.origin === location.origin) {
        try { sessionStorage.setItem('vf-page-transition', '1'); } catch (err) {}
      }
      window.location.href = url.href;
    });
  });

  // Zurück-Button (Seite aus dem Browser-Cache): Fläche wieder entfernen
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    curtain.classList.remove('is-covering', 'is-revealing');
    root.classList.remove('is-arriving');
    busy = false;
  });
})();
