/* ==========================================================================
   Klaviatur – Facetten-Navigation (Startseiten-Versionen A–D)
   Das Tasten-Motiv vom Briefpapier / der alten Website: Jede hervorgehobene
   Taste ist eine Facette von Helmut Schmidinger.

   WP: Facetten = eigener Inhaltstyp „Facette“ (Titel, Text, Link 1/2 mit
   Beschriftung, PDF, optional Bild, Reihenfolge). Die Daten unten sind Platzhalter
   aus dem Mail vom Kunden.

   Markup:
     <div class="kv" data-kv data-octaves="4" data-octaves-mobile="2">  → Tasten
     <div data-kv-panel></div>                                        → Detail der aktiven Facette
     <ol data-kv-list></ol>                                           → Liste aller Facetten
   ========================================================================== */
(function () {
  'use strict';

  var FACETTEN = [
    {
      titel: 'Komponist',
      text: '„Komponist sein ist für mich weniger eine Berufsbezeichnung als viel mehr eine Wertehaltung, die, der Übersetzung des Wortes compositio folgend, das Verbindende über das Trennende stellt.“',
      links: [
        { label: 'Zum Werk', url: 'werk.html' },
        { label: 'Aufführungen', url: 'aktuelles.html' }
      ]
    },
    {
      titel: 'Intendant',
      text: 'So wie ich aus Klängen ein Stück komponiere, komponiere ich aus Stücken ein Konzertprogramm. Mein Anspruch ist, dass meine Konzertprogramme das Adjektiv „komponiert“ verdienen.',
      links: [
        { label: 'Welser Abonnementkonzerte', url: 'https://www.welserabonnementkonzerte.at/', extern: true },
        { label: 'Jeunesse Wels', url: 'https://jeunesse-wels.at/', extern: true }
      ]
    },
    {
      titel: 'Pädagoge',
      text: 'Platzhalter – Text folgt. Hier stehen zwei, drei Zeilen dazu, wie das Unterrichten mit dem Komponieren zusammenhängt.',
      platzhalter: true,
      links: [
        { label: 'KUG – Personenprofil', url: 'https://www.kug.ac.at/personen/magart-drphil-helmut-schmidinger', extern: true },
        { label: 'Kompositionspädagogik', url: 'https://institut1.kug.ac.at/studienrichtungen/kompositionspaedagogik', extern: true }
      ]
    },
    {
      titel: 'Forscher',
      text: 'Platzhalter – Text folgt. Zwei, drei Zeilen zur Forschung und ihrer Beziehung zum Komponieren.',
      platzhalter: true,
      links: [
        { label: 'Young Science – Profil', url: 'https://youngscience.oead.at/de/wissenschaftsvermittlung/wissenschaftsbotschafter-innen/botschafter-profile/855', extern: true },
        { label: 'Forschung an der KUG', url: 'https://institut1.kug.ac.at/studienrichtungen/kompositionspaedagogik/forschung', extern: true },
        { label: 'Publikationen (PDF)', url: '#', pdf: true }
      ]
    },
    {
      titel: 'Musikvermittler',
      text: 'Platzhalter – Text folgt. Zwei, drei Zeilen zur Musikvermittlung.',
      platzhalter: true,
      links: [
        { label: 'Universal Edition – Listening Lab', url: 'https://www.universaledition.com/listeninglab', extern: true }
      ]
    },
    {
      titel: 'Notengrafiker',
      text: 'Meine über 20 Jahre Erfahrung als Notengrafiker für die Universal Edition und die Neue Mozart-Ausgabe (Bärenreiter-Verlag) fließen in das Stichbild meiner eigenen Werke ein … weil man den sichtbaren Unterschied hört.',
      links: []
    }
  ];

  var ARROW = '<svg viewBox="0 0 28 14" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M0 7h26M20 1l6 6-6 6"/></svg>';
  var EXT = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M4 1h9v9M13 1 1 13"/></svg>';

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function linksHtml(f, cls) {
    if (!f.links.length) { return ''; }
    return '<ul class="' + cls + '">' + f.links.map(function (l) {
      var attrs = l.extern ? ' target="_blank" rel="noopener"' : '';
      return '<li><a href="' + l.url + '"' + attrs + '>' + l.label + (l.extern ? EXT : ARROW) + '</a></li>';
    }).join('') + '</ul>';
  }

  /* gleichmäßig verteilte Tasten für die 6 Facetten */
  function facetSlots(total, count) {
    var out = [];
    for (var i = 0; i < count; i++) { out.push(Math.round((i + 0.5) * total / count - 0.5)); }
    return out;
  }

  var listeners = [];
  var active = 0;

  function setActive(i, opts) {
    active = i;
    listeners.forEach(function (fn) { fn(i, opts || {}); });
  }

  /* ---------- Tasten ---------- */
  function buildKeys(root) {
    var BLACK = [1, 2, 4, 5, 6];          // Grenzen zwischen weißen Tasten, an denen schwarze sitzen
    var bw = parseFloat(root.getAttribute('data-black-width') || '0.56');
    var showWhite = root.hasAttribute('data-white');

    function render() {
      var mobile = window.matchMedia('(max-width: 40em)').matches;
      var oct = parseInt(root.getAttribute(mobile ? 'data-octaves-mobile' : 'data-octaves') || '3', 10);
      var W = 7 * oct;
      var html = '';
      if (showWhite) {
        for (var w = 1; w < W; w++) {
          html += '<span class="kv__white" style="left:' + (w / W * 100) + '%"></span>';
        }
      }
      var positions = [];
      for (var o = 0; o < oct; o++) { BLACK.forEach(function (b) { positions.push(o * 7 + b); }); }
      var slots = facetSlots(positions.length, FACETTEN.length);
      positions.forEach(function (p, idx) {
        var style = 'left:' + ((p - bw / 2) / W * 100) + '%;width:' + (bw / W * 100) + '%;--i:' + idx;
        var fi = slots.indexOf(idx);
        if (fi > -1) {
          html += '<button type="button" class="kv__key kv__key--facet" style="' + style + '" data-facet="' + fi + '" aria-label="' + pad(fi + 1) + ' ' + FACETTEN[fi].titel + '" aria-controls="kv-panel">' +
            '<span class="kv__num">' + pad(fi + 1) + '</span><span class="kv__name">' + FACETTEN[fi].titel + '</span></button>';
        } else {
          html += '<span class="kv__key" style="' + style + '" aria-hidden="true"></span>';
        }
      });
      root.innerHTML = '<div class="kv__keys">' + html + '</div>';
      root.querySelectorAll('[data-facet]').forEach(function (btn) {
        var i = parseInt(btn.getAttribute('data-facet'), 10);
        btn.addEventListener('click', function () { setActive(i, { fromClick: true }); });
      });
      mark(active);
    }

    function mark(i) {
      root.querySelectorAll('[data-facet]').forEach(function (btn) {
        var on = parseInt(btn.getAttribute('data-facet'), 10) === i;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    listeners.push(mark);
    render();
    var last = window.matchMedia('(max-width: 40em)').matches;
    window.addEventListener('resize', function () {
      var now = window.matchMedia('(max-width: 40em)').matches;
      if (now !== last) { last = now; render(); }
    });
    requestAnimationFrame(function () { root.classList.add('is-ready'); });
  }

  /* ---------- Detail-Panel ---------- */
  function buildPanel(panel) {
    panel.id = panel.id || 'kv-panel';
    panel.setAttribute('aria-live', 'polite');
    function render(i) {
      var f = FACETTEN[i];
      panel.classList.remove('is-in');
      panel.innerHTML =
        '<p class="kv-panel__meta"><span class="kv-panel__num">(' + pad(i + 1) + ')</span><span class="kv-panel__of">/ ' + pad(FACETTEN.length) + '</span></p>' +
        '<h2 class="kv-panel__title">' + f.titel + '</h2>' +
        '<p class="kv-panel__text' + (f.platzhalter ? ' is-placeholder' : '') + '">' + f.text + '</p>' +
        linksHtml(f, 'kv-panel__links');
      void panel.offsetWidth;
      panel.classList.add('is-in');
    }
    listeners.push(render);
    render(active);
  }

  /* ---------- Liste ---------- */
  function buildList(list) {
    list.innerHTML = FACETTEN.map(function (f, i) {
      return '<li class="fl__item" data-fl="' + i + '">' +
        '<span class="fl__num">' + pad(i + 1) + '</span>' +
        '<h3 class="fl__title">' + f.titel + '</h3>' +
        '<p class="fl__text' + (f.platzhalter ? ' is-placeholder' : '') + '">' + f.text + '</p>' +
        linksHtml(f, 'fl__links') +
        '</li>';
    }).join('');
    listeners.push(function (i) {
      list.querySelectorAll('[data-fl]').forEach(function (li) {
        li.classList.toggle('is-active', parseInt(li.getAttribute('data-fl'), 10) === i);
      });
    });
  }

  /* ---------- Wortwolke Kontexte (WP: Taxonomie „kontext“, Größe = Anzahl Werke) ---------- */
  var KONTEXTE = [
    ['Haydn', 5], ['Schokolade', 3], ['Wels', 4], ['Psalmen', 2], ['Mozart', 3], ['Most', 1],
    ['Kaffee', 2], ['Mahler', 4], ['Linz', 2], ['Bibel', 3], ['Wien', 3], ['Wein', 2],
    ['Prokofjew', 1], ['Schubert', 2], ['Kindheit', 3], ['Zeit', 5], ['Fahrrad', 1], ['Anagramm', 2],
    ['Graz', 2], ['Vögel', 1], ['Bach', 3], ['Kulinarik', 4], ['Märchen', 2], ['Steyr', 1]
  ];
  function buildCloud(el) {
    var max = Math.max.apply(null, KONTEXTE.map(function (k) { return k[1]; }));
    el.innerHTML = KONTEXTE.map(function (k) {
      var lvl = Math.max(1, Math.round(k[1] / max * 5));
      return '<li><a class="cloud__w cloud__w--' + lvl + '" href="kontexte.html">' + k[0] + '<sup>' + k[1] + '</sup></a></li>';
    }).join('');
  }

  /* ---------- Zurück/Weiter + Tags (Version D) ---------- */
  function initSteppers() {
    document.querySelectorAll('[data-kv-prev]').forEach(function (b) {
      b.addEventListener('click', function () { setActive((active + FACETTEN.length - 1) % FACETTEN.length, { fromClick: true }); });
    });
    document.querySelectorAll('[data-kv-next]').forEach(function (b) {
      b.addEventListener('click', function () { setActive((active + 1) % FACETTEN.length, { fromClick: true }); });
    });
    document.querySelectorAll('[data-kv-tags]').forEach(function (wrap) {
      wrap.innerHTML = FACETTEN.map(function (f, i) {
        return '<button type="button" class="kv-tag" data-tag="' + i + '">' + f.titel + '</button>';
      }).join('');
      wrap.querySelectorAll('[data-tag]').forEach(function (b) {
        b.addEventListener('click', function () { setActive(parseInt(b.getAttribute('data-tag'), 10), { fromClick: true }); });
      });
      listeners.push(function (i) {
        wrap.querySelectorAll('[data-tag]').forEach(function (b) {
          b.classList.toggle('is-active', parseInt(b.getAttribute('data-tag'), 10) === i);
        });
      });
    });
    document.querySelectorAll('[data-kv-count]').forEach(function (el) {
      listeners.push(function (i) { el.textContent = pad(i + 1) + ' / ' + pad(FACETTEN.length); });
    });
  }

  /* ---------- Mobil-Menü (für die Versionen) ---------- */
  function initMenu() {
    var btn = document.querySelector('[data-v-menu]');
    if (!btn) { return; }
    btn.addEventListener('click', function () {
      var open = document.documentElement.classList.toggle('v-menu-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-kv]').forEach(buildKeys);
    document.querySelectorAll('[data-kv-panel]').forEach(buildPanel);
    document.querySelectorAll('[data-kv-list]').forEach(buildList);
    document.querySelectorAll('[data-cloud]').forEach(buildCloud);
    initSteppers();
    setActive(active);
    /* nach der ersten Interaktion hört der „Wink“ der Tasten auf */
    ['click', 'focusin'].forEach(function (ev) {
      document.addEventListener(ev, function (e) {
        if (e.target.closest && e.target.closest('[data-facet],[data-tag]')) {
          document.querySelectorAll('[data-kv]').forEach(function (k) { k.classList.add('is-touched'); });
        }
      });
    });
    initMenu();
  });
})();
