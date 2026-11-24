/* ==========================================================================
   Design-Version A / B (nur Klickdummy – nicht ins WordPress-Theme übernehmen)
   - ?v=b bzw. ?v=a in der URL schaltet um, die Wahl bleibt beim Weiterklicken
   - Version B = assets/css/version-b.css (Unslop-Durchgang: vereinheitlicht)
   - Umschalter unten links auf jeder Seite
   ========================================================================== */
(function () {
  var KEY = 'hs-design-version';
  var m = location.search.match(/[?&]v=(a|b)\b/i);
  var v = m ? m[1].toLowerCase() : null;
  try {
    if (v) localStorage.setItem(KEY, v);
    else v = localStorage.getItem(KEY);
  } catch (e) {}
  v = v === 'b' ? 'b' : 'a';
  var root = document.documentElement;
  root.setAttribute('data-version', v);
  if (v === 'b') document.write('<link rel="stylesheet" href="assets/css/version-b.css">');

  var MONTHS = ['Jän.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];

  document.addEventListener('DOMContentLoaded', function () {
    if (v === 'b') {
      // Datum einheitlich: „10. Nov. 2026“ statt „2026-11-10“
      document.querySelectorAll('.c-event__date').forEach(function (el) {
        var t = el.firstChild;
        if (!t || t.nodeType !== 3) return;
        var d = t.nodeValue.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!d) return;
        t.nodeValue = (+d[3]) + '. ' + MONTHS[+d[2] - 1] + ' ' + d[1];
      });
    }
    // Umschalter
    var url = function (x) {
      var p = new URLSearchParams(location.search); p.set('v', x);
      return location.pathname + '?' + p.toString() + location.hash;
    };
    var nav = document.createElement('nav');
    nav.className = 'v-ab';
    nav.setAttribute('aria-label', 'Design-Version');
    nav.innerHTML = '<span>Design</span>' +
      '<a href="' + url('a') + '"' + (v === 'a' ? ' aria-current="true"' : '') + '>A</a>' +
      '<a href="' + url('b') + '"' + (v === 'b' ? ' aria-current="true"' : '') + '>B</a>';
    document.body.appendChild(nav);
  });
})();
