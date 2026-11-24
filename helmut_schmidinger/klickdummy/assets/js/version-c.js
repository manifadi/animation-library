/* ==========================================================================
   Version C – einfachere Wege (nur Klickdummy, lädt assets/js/version.js)
   Baut auf B auf. Was C anders macht und wie es in WordPress gelöst wird:

   1. Zur Person ohne Vorschaltseite: „Zur Person“ führt direkt zur Biographie
      (Video oben). Reiter: Biographie · Sechs Facetten · Preise · Radtouren
      WP: Menüpunkt zeigt auf die Seite „Biographie“, Seite „Übersicht“ entfällt.
   2. Sechs Facetten als eigene Seite – gleiche Einträge wie die Klaviatur
      (Inhaltstyp „Facette“, eine Quelle). Startseite verlinkt darauf.
   3. Gattungsseiten: Gattungen als Leiste über der Liste statt Seitenspalte +
      Brotkrümel; leere Gattungen ausgeblendet; Kammermusik-Besetzungen als
      zweite Zeile. WP: Taxonomie-Liste mit hide_empty.
   4. Termin → Werk: Klick auf eine Aufführung springt auf der Werkseite direkt
      zum Abschnitt „Aufführungen“ und markiert den Termin. Dort verlinkt die
      Liste nicht mehr auf sich selbst.
      WP: Termin (CPT) mit Beziehungsfeld „Werk“; Link = Werk-URL + #termin-JJJJ-MM-TT
   5. Wege für Veranstalter: „Aufführung melden“ auf jeder Werkseite und auf
      „Termine“ → Kontakt mit vorgewähltem Anliegen (?anliegen=…).
   6. Mobil: Zitat/Bild-Panel steht nach dem Inhalt statt davor; EN-Schalter
      ausgeblendet, bis es eine englische Version gibt.
   ========================================================================== */
(function () {
  'use strict';
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var page = location.pathname.split('/').pop() || 'index.html';
  var ARROW = '<svg viewBox="0 0 28 14" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M0 7h26M20 1l6 6-6 6"/></svg>';

  document.addEventListener('DOMContentLoaded', function () {
    /* 1. „Zur Person“ → Biographie */
    $$('a[href="zur-person.html"]').forEach(function (a) {
      if (!a.closest('.c-subnav')) a.setAttribute('href', 'biographie.html');
    });

    /* 2. Startseite: Link zu allen Facetten unter dem Facetten-Text */
    var panel = document.querySelector('.p-home-facets__panel');
    if (panel) {
      var more = document.createElement('p');
      more.className = 'p-home-facets__all';
      more.innerHTML = '<a class="c-link-arrow c-link-arrow--ink" href="facetten.html">Alle sechs Facetten ' + ARROW + '</a>';
      panel.insertAdjacentElement('afterend', more);
    }

    /* 3. Gattungen: leere ausblenden */
    $$('.c-sidenav__list > li').forEach(function (li) {
      var n = li.querySelector('.c-sidenav__link span');
      if (n && n.textContent.trim() === '0') li.classList.add('is-empty');
    });

    /* 4a. Termine, die auf ein Werk zeigen → direkt zur Aufführung auf der Werkseite */
    $$('.c-event[data-date]').forEach(function (ev) {
      var a = ev.querySelector('a.c-event__link[href^="werk-"]');
      if (a && a.getAttribute('href').indexOf('#') === -1) a.setAttribute('href', a.getAttribute('href') + '#termin-' + ev.getAttribute('data-date'));
    });

    /* 4b. Werkseite: Aufführungen ohne Link auf sich selbst, Ziel markieren */
    if (/^werk-/.test(page)) {
      $$('.c-event').forEach(function (ev) {
        var a = ev.querySelector('a.c-event__link');
        if (!a || a.getAttribute('href').split('#')[0] !== page) return;
        var span = document.createElement('span');
        span.className = a.className.replace('c-event__link', '').trim();
        span.innerHTML = a.innerHTML;
        a.replaceWith(span);
        ev.classList.add('is-static');
        if (ev.dataset.date) ev.id = 'termin-' + ev.dataset.date;
      });
      var mark = function () {
        $$('.c-event.is-target').forEach(function (e) { e.classList.remove('is-target'); });
        var t = location.hash && document.getElementById(location.hash.slice(1));
        if (t && t.classList.contains('c-event')) {
          t.classList.add('is-target');
          t.scrollIntoView({ block: 'center', behavior: 'instant' });
        }
      };
      mark();
      // nach dem Laden der Bilder nochmal, sonst stimmt die Position nicht
      window.addEventListener('load', function () { setTimeout(mark, 50); });
      window.addEventListener('hashchange', mark);

      /* 5a. „Aufführung melden“ im Abschnitt Aufführungen */
      $$('.c-block').forEach(function (b) {
        var h = b.querySelector('.c-block__head h2');
        if (!h || h.textContent.trim() !== 'Aufführungen') return;
        b.id = b.id || 'auffuehrungen';
        var p = document.createElement('p');
        p.className = 'c-block__note';
        p.innerHTML = 'Sie führen dieses Werk auf? <a class="c-link-arrow c-link-arrow--ink" href="kontakt.html?anliegen=auffuehrung">Aufführung melden ' + ARROW + '</a>';
        b.appendChild(p);
      });
    }

    /* 5b. Kontakt: Anliegen aus der URL vorwählen */
    var choice = document.querySelector('[data-anliegen]');
    if (choice) {
      var want = (location.search.match(/[?&]anliegen=([a-z]+)/) || [])[1];
      var r = want && choice.querySelector('input[value="' + want + '"]');
      if (r) r.checked = true;
    }
  });
})();
