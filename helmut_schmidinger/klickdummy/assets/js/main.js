/* ==========================================================================
   Helmut Schmidinger – Klickdummy JS (Vanilla, ohne Abhängigkeiten)
   Module:
   1. Mobile-Menü
   2. Suche (Overlay)
   3. Aufführungs-Filter (Aktuelles)     → WP: per GET-Parameter / AJAX
   4. Werkliste: Filter "für Schulen" + Sortierung
   5. Kontexte-Chips
   6. Akkordeon
   7. Tabs
   8. Formular-Validierung (Demo)        → WP: Contact Form 7 übernimmt
   9. Video 2-Klick-Lösung
   ========================================================================== */
(function () {
  'use strict';
  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  /* 1. Mobile-Menü ------------------------------------------------------ */
  var menu = $('[data-mobile-nav]');
  function toggleMenu(open) {
    if (!menu) return;
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('is-locked', open);
    $$('[data-menu-open]').forEach(function (b) { b.setAttribute('aria-expanded', open ? 'true' : 'false'); });
    if (open) { var f = $('a, button', menu); f && f.focus(); }
  }
  $$('[data-menu-open]').forEach(function (b) { b.addEventListener('click', function () { toggleMenu(true); }); });
  $$('[data-menu-close]').forEach(function (b) { b.addEventListener('click', function () { toggleMenu(false); }); });

  /* 2. Suche ------------------------------------------------------------ */
  var search = $('[data-search]');
  function toggleSearch(open) {
    if (!search) return;
    search.classList.toggle('is-open', open);
    document.body.classList.toggle('is-locked', open);
    if (open) setTimeout(function () { var i = $('input', search); i && i.focus(); }, 50);
  }
  $$('[data-search-open]').forEach(function (b) { b.addEventListener('click', function () { toggleMenu(false); toggleSearch(true); }); });
  $$('[data-search-close]').forEach(function (b) { b.addEventListener('click', function () { toggleSearch(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { toggleSearch(false); toggleMenu(false); } });

  /* 3. Aufführungs-Filter ---------------------------------------------- */
  var evFilter = $('[data-event-filter]');
  if (evFilter) {
    var list = $('[data-event-list]');
    var empty = $('[data-event-empty]');
    var count = $('[data-event-count]');
    var selects = $$('select', evFilter);
    var applyEvents = function () {
      var v = {}; selects.forEach(function (s) { v[s.name] = s.value; });
      var visible = 0;
      $$('.c-event', list).forEach(function (row) {
        var ok = (!v.jahr || row.dataset.year === v.jahr) &&
                 (!v.monat || row.dataset.month === v.monat) &&
                 (!v.werk || row.dataset.work === v.werk);
        row.classList.toggle('is-hidden', !ok);
        if (ok) visible++;
      });
      // Monatsbalken ausblenden, wenn darunter nichts sichtbar ist
      $$('.c-events__month', list).forEach(function (h) {
        var n = h.nextElementSibling, any = false;
        while (n && !n.classList.contains('c-events__month')) { if (!n.classList.contains('is-hidden')) any = true; n = n.nextElementSibling; }
        h.hidden = !any;
      });
      if (empty) empty.hidden = visible > 0;
      if (count) count.textContent = visible + (visible === 1 ? ' Aufführung' : ' Aufführungen');
    };
    selects.forEach(function (s) { s.addEventListener('change', applyEvents); });
    var reset = $('[data-filter-reset]', evFilter.parentNode);
    reset && reset.addEventListener('click', function (e) { e.preventDefault(); selects.forEach(function (s) { s.selectedIndex = 0; }); applyEvents(); });
    $$('[data-filter-reset-empty]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); selects.forEach(function (s) { s.selectedIndex = 0; }); applyEvents(); }); });
    applyEvents();
  }

  /* 4. Werkliste: Schul-Filter + Sortierung ----------------------------- */
  var wf = $('[data-work-filter]');
  if (wf) {
    var wlist = $('[data-work-list]');
    var schoolToggle = $('input[name="schulen"]', wf);
    var sort = $('select[name="sort"]', wf);
    var wcount = $('[data-work-count]');
    var wempty = $('[data-work-empty]');
    var applyWorks = function () {
      var rows = $$('.c-work-row', wlist), vis = 0;
      rows.forEach(function (r) { var ok = !schoolToggle.checked || r.dataset.school === '1'; r.classList.toggle('is-hidden', !ok); if (ok) vis++; });
      rows.sort(function (a, b) {
        if (sort.value === 'titel') return a.dataset.title.localeCompare(b.dataset.title, 'de');
        if (sort.value === 'alt') return (+a.dataset.year) - (+b.dataset.year);
        return (+b.dataset.year) - (+a.dataset.year);
      }).forEach(function (r) { wlist.appendChild(r); });
      if (wcount) wcount.textContent = vis + (vis === 1 ? ' Werk' : ' Werke');
      if (wempty) wempty.hidden = vis > 0;
    };
    schoolToggle.addEventListener('change', applyWorks);
    sort.addEventListener('change', applyWorks);
    applyWorks();
  }

  /* 5. Kontexte-Chips --------------------------------------------------- */
  var chips = $('[data-context-chips]');
  if (chips) {
    var clist = $('[data-context-list]');
    var ctitle = $('[data-context-title]');
    $$('.c-chip', chips).forEach(function (chip) {
      chip.addEventListener('click', function () {
        $$('.c-chip', chips).forEach(function (c) { c.classList.remove('is-active'); c.setAttribute('aria-pressed', 'false'); });
        chip.classList.add('is-active'); chip.setAttribute('aria-pressed', 'true');
        var key = chip.dataset.context;
        $$('.c-work-row', clist).forEach(function (r) { r.classList.toggle('is-hidden', key !== 'alle' && r.dataset.context.split(' ').indexOf(key) === -1); });
        if (ctitle) ctitle.textContent = chip.dataset.label;
      });
    });
  }

  /* 6. Akkordeon -------------------------------------------------------- */
  $$('[data-accordion] .c-accordion__trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.c-accordion__item');
      var open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* 7. Tabs ------------------------------------------------------------- */
  $$('[data-tabs]').forEach(function (tabs) {
    var btns = $$('[role="tab"]', tabs);
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.setAttribute('aria-selected', 'false'); $('#' + b.getAttribute('aria-controls')).hidden = true; });
        btn.setAttribute('aria-selected', 'true');
        $('#' + btn.getAttribute('aria-controls')).hidden = false;
      });
    });
  });

  /* 8. Formular-Validierung (Demo) -------------------------------------- */
  $$('[data-validate]').forEach(function (form) {
    form.setAttribute('novalidate', '');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      $$('[required]', form).forEach(function (input) {
        var field = input.closest('.c-field');
        var ok = input.type === 'checkbox' ? input.checked : input.value.trim() !== '' && input.checkValidity();
        field && field.classList.toggle('is-invalid', !ok);
        if (!ok) valid = false;
      });
      var err = $('[data-form-error]', form), succ = $('[data-form-success]', form);
      if (!valid) { err && (err.hidden = false); succ && (succ.hidden = true); var first = $('.is-invalid input, .is-invalid textarea', form); first && first.focus(); return; }
      err && (err.hidden = true);
      var btn = $('button[type="submit"]', form);
      btn.classList.add('is-loading');
      setTimeout(function () { btn.classList.remove('is-loading'); succ && (succ.hidden = false); form.reset(); }, 900);
    });
    $$('input, textarea', form).forEach(function (i) {
      i.addEventListener('input', function () { var f = i.closest('.c-field'); f && f.classList.remove('is-invalid'); });
      i.addEventListener('change', function () { var f = i.closest('.c-field'); f && f.classList.remove('is-invalid'); });
    });
  });

  /* 9. Video 2-Klick ---------------------------------------------------- */
  $$('[data-video]').forEach(function (v) {
    v.addEventListener('click', function () {
      var id = v.dataset.video;
      v.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1" title="Video" allow="autoplay; encrypted-media" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe>';
    });
  });
})();
