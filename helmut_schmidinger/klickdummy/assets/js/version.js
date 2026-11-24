/* ==========================================================================
   Design-Version A / B / C (nur Klickdummy – nicht ins WordPress-Theme übernehmen)
   - ?v=a | ?v=b | ?v=c in der URL schaltet um, die Wahl bleibt beim Weiterklicken
   - B = assets/css/version-b.css (Unslop-Durchgang: optisch vereinheitlicht)
   - C = B + assets/css/version-c.css + assets/js/version-c.js
         (UX: einfachere Wege – siehe Kommentar in version-c.js)
   - Markup nur für C: Attribut data-only-c · in C ausgeblendet: data-not-c
   - Umschalter unten links auf jeder Seite
   ========================================================================== */
(function () {
  var KEY = 'hs-design-version';
  var m = location.search.match(/[?&]v=(a|b|c)\b/i);
  var v = m ? m[1].toLowerCase() : null;
  try {
    if (v) localStorage.setItem(KEY, v);
    else v = localStorage.getItem(KEY);
  } catch (e) {}
  if (v !== 'b' && v !== 'c') v = 'a';
  document.documentElement.setAttribute('data-version', v);
  if (v !== 'a') document.write('<link rel="stylesheet" href="assets/css/version-b.css">');
  if (v === 'c') document.write('<link rel="stylesheet" href="assets/css/version-c.css">');

  var MONTHS = ['Jän.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];

  document.addEventListener('DOMContentLoaded', function () {
    // ISO-Datum der Termine merken (für Version C: Sprung zur Aufführung auf der Werkseite)
    document.querySelectorAll('.c-event__date').forEach(function (el) {
      var t = el.firstChild;
      if (!t || t.nodeType !== 3) return;
      var d = t.nodeValue.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!d) return;
      el.closest('.c-event').setAttribute('data-date', d[0]);
      // B und C: Datum einheitlich „10. Nov. 2026“ statt „2026-11-10“
      if (v !== 'a') t.nodeValue = (+d[3]) + '. ' + MONTHS[+d[2] - 1] + ' ' + d[1];
    });
    // Umschalter
    var url = function (x) {
      var p = new URLSearchParams(location.search); p.set('v', x);
      return location.pathname + '?' + p.toString() + location.hash;
    };
    var nav = document.createElement('nav');
    nav.className = 'v-ab';
    nav.setAttribute('aria-label', 'Design-Version');
    nav.innerHTML = '<span>Design</span>' + ['a', 'b', 'c'].map(function (x) {
      return '<a href="' + url(x) + '"' + (v === x ? ' aria-current="true"' : '') + '>' + x.toUpperCase() + '</a>';
    }).join('');
    document.body.appendChild(nav);
  });

  // nach dem Listener oben registrieren → läuft danach (Datum ist dann schon gemerkt)
  if (v === 'c') document.write('<script src="assets/js/version-c.js"><\/script>');
})();
