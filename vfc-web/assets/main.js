(() => {
  const body = document.body;
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("nav");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const motion = !reduceMotion.matches;

  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

  /* ---------- Softscroll (Lenis) ---------- */

  const lenis = motion && window.Lenis
    ? new window.Lenis({ lerp: 0.085, autoRaf: true, stopInertiaOnNavigate: true })
    : null;

  // Alles, was am Scroll hängt, läuft über einen gemeinsamen Takt. Jeder Job misst nur und
  // gibt eine Schreib-Funktion zurück: erst messen alle, dann schreiben alle. So rechnet der
  // Browser das Layout pro Frame nur einmal statt nach jedem Job neu.
  const scrollJobs = [];
  const runScrollJobs = () => {
    const writes = scrollJobs.map((measure) => measure());
    writes.forEach((write) => write?.());
  };
  const onScrollFrame = (measure) => { scrollJobs.push(measure); measure()?.(); };
  let ticking = false;
  const requestJobs = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; runScrollJobs(); });
  };
  // Lenis meldet jeden Frame synchron, auch native Scrolls (Tastatur, Scrollbar)
  if (lenis) lenis.on("scroll", runScrollJobs);
  else window.addEventListener("scroll", requestJobs, { passive: true });
  window.addEventListener("resize", requestJobs);

  /* ---------- Burger-Menü ---------- */

  // Adressen aus dem Footer ins Menü übernehmen (eine Quelle für beide)
  const navAddresses = nav.querySelector(".addresses--nav");
  const footerAddresses = document.getElementById("addresses");
  if (navAddresses && footerAddresses) navAddresses.innerHTML = footerAddresses.innerHTML;

  let closeTimer;

  function openNav() {
    clearTimeout(closeTimer);
    nav.hidden = false;
    nav.scrollTop = 0;
    // Reflow erzwingen, damit die Transition startet
    void nav.offsetWidth;
    nav.classList.add("is-open");
    body.classList.add("nav-open");
    lenis?.stop();
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Menü schließen");
    const first = nav.querySelector("a");
    if (first) first.focus({ preventScroll: true });
  }

  // instant: ohne Ausblend-Animation (z. B. hinter dem Seitenwechsel-Vorhang)
  function closeNav({ returnFocus = true, instant = false } = {}) {
    clearTimeout(closeTimer);
    if (instant) nav.style.transition = "none";
    nav.classList.remove("is-open");
    body.classList.remove("nav-open");
    lenis?.start();
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Menü öffnen");
    if (instant) {
      nav.hidden = true;
      void nav.offsetWidth;
      nav.style.transition = "";
    } else {
      closeTimer = setTimeout(() => { nav.hidden = true; }, reduceMotion.matches ? 0 : 600);
    }
    if (returnFocus) toggle.focus({ preventScroll: true });
  }

  const isOpen = () => nav.classList.contains("is-open");

  toggle.addEventListener("click", () => (isOpen() ? closeNav() : openNav()));

  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;
    if (e.key === "Escape") { closeNav(); return; }
    // Fokus innerhalb von Menü + Toggle halten
    if (e.key === "Tab") {
      const items = [toggle, ...nav.querySelectorAll("a, button")];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Klick auf einen Anker im Menü schließt das Menü (mit Bewegung erledigt das der Vorhang)
  nav.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!motion && link && link.getAttribute("href").startsWith("#")) closeNav({ returnFocus: false });
  });

  /* ---------- Seitenwechsel: Vorhang aus drei Balken ---------- */

  // Klick auf einen Link: drei weiße Balken ziehen von links rein (oben zuerst) und decken
  // alles außer der Seitenleiste ab. Dann wird gesprungen bzw. die neue Seite geladen,
  // danach ziehen die Balken im selben Takt nach rechts raus.
  const root = document.documentElement;
  const pt = document.querySelector(".pt");
  const ptBars = pt ? [...pt.children] : [];
  const PT_DURATION = 650;
  const PT_GAP = 90;
  const PT_EASE = "cubic-bezier(0.76, 0, 0.24, 1)";
  let ptBusy = false;

  const moveBars = (from, to) => Promise.all(ptBars.map((bar, i) => bar.animate(
    [{ transform: from }, { transform: to }],
    { duration: PT_DURATION, delay: i * PT_GAP, easing: PT_EASE, fill: "forwards" },
  ).finished));

  const cover = () => {
    pt.classList.add("is-active");
    return moveBars("translateX(-101%)", "translateX(0)");
  };
  const uncover = () => {
    pt.classList.add("is-active");
    return moveBars("translateX(0)", "translateX(101%)").then(() => {
      root.classList.remove("pt-cover", "is-intro");
      ptBars.forEach((bar) => bar.getAnimations().forEach((a) => a.cancel()));
      pt.classList.remove("is-active");
    });
  };

  const jumpTo = (target) => {
    // Auf Mobile liegt die Topbar über dem Inhalt
    const offset = -(parseFloat(getComputedStyle(document.getElementById("main")).paddingTop) || 0);
    if (lenis) lenis.scrollTo(target, { offset, immediate: true, force: true });
    else window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY + offset);
  };

  if (motion && pt) {
    document.addEventListener("click", (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target.closest("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download") || link.classList.contains("skip-link")) return;
      const href = link.getAttribute("href");
      const url = new URL(link.href, location.href);
      // mailto:, tel: und fremde Seiten ohne Vorhang
      if (!["http:", "https:", "file:"].includes(url.protocol) || url.origin !== location.origin) return;
      e.preventDefault();
      if (ptBusy) return; // Vorhang läuft schon
      ptBusy = true;

      if (href.startsWith("#")) {
        // Gleiche Seite: unter dem Vorhang springen. "#" (Platzhalter-Links) spielt nur den Vorhang.
        const target = href.length > 1 ? document.getElementById(decodeURIComponent(href.slice(1))) : null;
        cover()
          .then(() => {
            if (isOpen()) closeNav({ returnFocus: false, instant: true });
            if (target) jumpTo(target);
            return new Promise((resolve) => setTimeout(resolve, 120));
          })
          .then(uncover)
          .then(() => { ptBusy = false; });
        return;
      }

      // Andere Seite: zudecken, merken, laden. Die neue Seite startet verdeckt und deckt auf.
      try { sessionStorage.setItem("vfc-pt", "1"); } catch (err) { /* privater Modus */ }
      cover().then(() => { location.href = url.href; });
    });

    // Zurück-Button (bfcache): die Seite kommt noch verdeckt zurück
    window.addEventListener("pageshow", (e) => {
      if (!e.persisted || !ptBars.some((bar) => bar.getAnimations().length)) return;
      uncover().then(() => { ptBusy = false; });
    });
  }

  // Ladeanimation (ca. 1,8 s bis zum Reveal): Logo erscheint, steht kurz, schließt sich zum
  // Smiley, der Smiley zwinkert, dann ziehen die Balken nach rechts ab.
  const EXPO_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
  const EXPO_IN = "cubic-bezier(0.7, 0, 0.84, 0)";
  const CURTAIN = PT_EASE;
  const playIntro = () => {
    const intro = document.querySelector(".intro");
    const logo = intro.querySelector(".intro__logo");
    const smiley = intro.querySelector(".intro__smiley");
    pt.classList.add("is-active");
    lenis?.stop();

    // 0–420 ms gleitet das Logo aus seiner Maske hoch, steht bis 650 ms und schließt sich bis
    // 1050 ms von beiden Seiten zur Mitte (Schnitt statt Stauchen, Buchstaben bleiben unverzerrt)
    logo.animate([
      { transform: "translateY(105%)", clipPath: "inset(0 0% 0 0%)", easing: EXPO_OUT },
      { transform: "translateY(0)", clipPath: "inset(0 0% 0 0%)", offset: 0.4 },
      { transform: "translateY(0)", clipPath: "inset(0 0% 0 0%)", easing: CURTAIN, offset: 0.62 },
      { transform: "translateY(0)", clipPath: "inset(0 50% 0 50%)" },
    ], { duration: 1050, fill: "forwards" });

    // ab 850 ms, während sich das Logo schließt, ploppen die Smiley-Pixel auf
    intro.querySelectorAll(".intro__px").forEach((px, i) => px.animate(
      [{ transform: "scale(0)" }, { transform: "scale(1)" }],
      { duration: 360, delay: 850 + i * 35, easing: EXPO_OUT, fill: "both" },
    ));

    // 1450–1710 ms zwinkert das rechte Auge, danach kurz stehen lassen
    const wink = intro.querySelector(".intro__px--wink").animate(
      [{ transform: "scaleY(1)" }, { transform: "scaleY(0.15)", offset: 0.4 }, { transform: "scaleY(1)" }],
      { duration: 260, delay: 1450, easing: "ease-in-out" },
    );

    return wink.finished.then(() => new Promise((resolve) => setTimeout(resolve, 120))).then(() => {
      smiley.animate(
        [{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(0.85)" }],
        { duration: 220, easing: EXPO_IN, fill: "forwards" },
      );
      lenis?.start();
    });
  };

  // Beim ersten Laden: Ladeanimation. Über einen Vorhang-Link angekommen: aufdecken, sobald
  // die Seite geladen ist. Reveals starten erst dann, damit sie nicht verdeckt ablaufen.
  try { sessionStorage.removeItem("vfc-pt"); } catch (err) { /* privater Modus */ }
  const pageReady = new Promise((resolve) => {
    const intro = root.classList.contains("is-intro");
    if (!intro && !root.classList.contains("pt-cover")) { resolve(); return; }
    if (!motion || !pt) { root.classList.remove("pt-cover", "is-intro"); resolve(); return; }
    if (intro) {
      playIntro().then(() => { uncover(); resolve(); });
      return;
    }
    const reveal = () => setTimeout(() => { uncover(); resolve(); }, 150);
    if (document.readyState === "complete") reveal();
    else window.addEventListener("load", reveal, { once: true });
  });

  /* ---------- Menü, Footer, Filter: Buchstaben rollen beim Hover ---------- */

  // Hover: Text rollt nach oben weg, die Kopie kommt von unten. Verlassen: zurück nach unten.
  // .addresses a = Telefon, E-Mail und Social im Menü und im Footer; .filter__label = Projekt-Filter
  if (motion) {
    document.querySelectorAll(".nav__link, .nav .chip--lg, .addresses a, .filter__label, [data-roll]").forEach((link) => {
      const text = link.textContent.trim();
      const label = document.createElement("span");
      label.className = "sr-only";
      label.textContent = text;
      const roll = document.createElement("span");
      roll.className = "roll";
      roll.setAttribute("aria-hidden", "true");
      [...text].forEach((ch, i) => {
        const c = document.createElement("span");
        c.className = "roll__c";
        c.style.setProperty("--i", i);
        const inner = document.createElement("span");
        inner.className = "roll__in";
        inner.textContent = inner.dataset.c = ch === " " ? "\u00a0" : ch;
        c.append(inner);
        roll.append(c);
      });
      link.replaceChildren(label, roll);
    });
  }

  /* ---------- Projekt-Filter ---------- */

  const filters = document.querySelectorAll(".filter");
  const projects = document.querySelectorAll(".project");
  const empty = document.getElementById("project-empty");

  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.filter;
      filters.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      let visible = 0;
      projects.forEach((p) => {
        const show = key === "all" || p.dataset.tags.split(" ").includes(key);
        p.hidden = !show;
        if (show) visible++;
      });
      if (empty) empty.hidden = visible > 0;
      requestJobs();
    });
  });

  /* ---------- Text-Reveal: Wörter gleiten aus ihrer Maske, beim Rausscrollen rückwärts wieder hinein ---------- */

  // Ersetzt nur Textknoten; <br>, <svg> und Links bleiben erhalten. &nbsp; hält Wörter zusammen.
  // Ein Buchstaben-Roll (Footer-Links) gleitet als Ganzes, damit Hover und Reveal sich nicht stören.
  const wrapWord = (node) => {
    const w = document.createElement("span");
    const inner = document.createElement("span");
    w.className = "w";
    inner.className = "w__i";
    node.replaceWith(w);
    inner.append(node);
    w.append(inner);
    return w;
  };

  function splitText(el, { chars = false } = {}) {
    const words = [];
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          if (child.classList.contains("roll")) words.push(wrapWord(child));
          else if (!child.classList.contains("sr-only") && child.namespaceURI === "http://www.w3.org/1999/xhtml") walk(child);
          return;
        }
        if (child.nodeType !== Node.TEXT_NODE || !child.textContent.trim()) return;
        const frag = document.createDocumentFragment();
        child.textContent.split(/([ \t\n\r]+)/).forEach((part) => {
          if (!part) return;
          if (!part.trim()) { frag.append(" "); return; }
          const w = document.createElement("span");
          const inner = document.createElement("span");
          w.className = "w";
          inner.className = "w__i";
          if (chars) {
            for (const ch of part) {
              const c = document.createElement("span");
              c.className = "c";
              c.textContent = ch;
              inner.append(c);
            }
          } else {
            inner.textContent = part;
          }
          w.append(inner);
          frag.append(w);
          words.push(w);
        });
        child.replaceWith(frag);
      });
    };
    walk(el);
    return words;
  }

  const REVEAL = [
    ".hero .eyebrow", ".hero__title",
    ".projects__title", ".project .eyebrow", ".project__title",
    ".card .eyebrow", ".card__title", ".card__body",
    ".culture .eyebrow", ".culture__title",
    ".footer .addresses__col",
    // Projekt-Detailseiten
    ".case-hero .eyebrow", ".case-hero__title", ".case-label h2", ".case-label span",
    ".case-text", ".case-quote p", ".case-quote cite", ".kpi__label",
  ].join(", ");

  // Große Absätze mit data-fill füllen sich zusätzlich Zeichen für Zeichen (siehe unten)
  const fills = [...document.querySelectorAll("[data-fill]")];

  if (motion && "IntersectionObserver" in window) {
    const words = [...document.querySelectorAll(REVEAL)].flatMap((el) => splitText(el));
    fills.forEach((el) => words.push(...splitText(el, { chars: true })));
    body.classList.add("has-reveal");

    // Wörter sind „drin“, solange sie im Band zwischen 6 % oben und 8 % unten liegen.
    // Raus ist die Rein-Animation rückwärts: gleicher Versatz, aber vom letzten Wort zum ersten.
    const io = new IntersectionObserver((entries) => {
      const changed = entries.filter((entry) => entry.isIntersecting !== entry.target.classList.contains("is-in"));
      // Lesereihenfolge: oben vor unten, links vor rechts
      changed.sort((a, b) =>
        a.boundingClientRect.top - b.boundingClientRect.top ||
        a.boundingClientRect.left - b.boundingClientRect.left);
      const ins = changed.filter((entry) => entry.isIntersecting);
      const outs = changed.filter((entry) => !entry.isIntersecting).reverse();
      [ins, outs].forEach((group) => group.forEach((entry, n) => {
        entry.target.style.setProperty("--d", `${Math.min(n * 0.035, 0.6).toFixed(3)}s`);
        entry.target.classList.toggle("is-in", entry.isIntersecting);
      }));
    }, { rootMargin: "-6% 0px -8% 0px" });
    pageReady.then(() => words.forEach((w) => io.observe(w)));
  }

  /* ---------- Große Absätze: Zeichen füllen sich beim Scrollen von grau zu dunkel ---------- */

  if (motion && body.classList.contains("has-reveal")) fills.forEach((lede) => {
    const chars = [...lede.querySelectorAll(".c")];
    const SOFT = 14; // so viele Zeichen breit ist der weiche Übergang
    const current = new Array(chars.length).fill(-1);
    onScrollFrame(() => {
      const r = lede.getBoundingClientRect();
      const vh = window.innerHeight;
      // Start: Oberkante bei 90 % Höhe · Ende: Unterkante bei 55 % Höhe
      const start = vh * 0.9;
      const end = vh * 0.55 - r.height;
      const head = clamp((start - r.top) / (start - end)) * (chars.length + SOFT);
      return () => chars.forEach((c, i) => {
        const f = Math.round(clamp((head - i) / SOFT) * 100) / 100;
        if (f === current[i]) return;
        current[i] = f;
        c.style.opacity = (0.22 + 0.78 * f).toFixed(2);
      });
    });
  });

  /* ---------- „View All Projects“: Fächer als Endlos-Band ---------- */

  // Sechs Ebenen stehen dauerhaft übereinander. Beim Scrollen rückt jede Ebene eine Position
  // nach oben und wird dabei schmaler: die oberste verlässt das Bild, unten schiebt sich eine
  // neue nach. Alle Ebenen zeigen denselben Text, deshalb reichen 8 Elemente, die nach jedem
  // vollen Schritt wieder von vorn zählen.
  // Kommt die Section darunter ins Bild, gleiten alle Ebenen auf den vollen Schriftzug unten
  // und verschmelzen zu statischem Text; beim Hochscrollen fächert er wieder auf.
  // Verschmolzen braucht der Text weniger Platz: die Box gibt Höhe ab, der Schriftzug rückt
  // nach oben und die Section darunter rückt nach.
  const echo = document.querySelector(".echo");
  if (echo) {
    const slices = [...echo.querySelectorAll(".echo__slice")];
    // Oberkante und Höhe je Position (Einheiten der 1436er-Breite). Index 0 = wartet unterhalb,
    // 1 = voller Schriftzug unten, 2–6 = darüber, 7–8 = schon oben draußen. Jede Ebene deckt die
    // unteren 10 Einheiten der darüberliegenden ab: TOP[k] = TOP[k + 1] + HEIGHT[k + 1] − 10.
    const TOP = [499, 307, 201, 124, 66, 22, -12, -38, -58];
    const HEIGHT = [202, 202, 116, 87, 68, 54, 44, 36, 30];
    const STEP = 70;      // Scrollstrecke in px pro nachrückender Ebene
    const BOX = 509;      // Höhe der Box mit aufgefächertem Text
    const COLLAPSE = 260; // so viel Höhe gibt sie verschmolzen ab (Rest: Schriftzug + Luft oben)
    const at = (list, x) => {
      const k = Math.floor(x);
      return list[k] + (list[k + 1] - list[k]) * (x - k);
    };

    let stackH = "";
    const render = (offset, merge = 0) => {
      const frac = offset - Math.floor(offset);
      const m = merge * merge * (3 - 2 * merge); // weich rein und raus
      const lift = COLLAPSE * m;
      // Die Boxhöhe verschiebt alles darunter: nur anfassen, wenn sie sich wirklich ändert
      const nextH = (BOX - lift).toFixed(1);
      if (nextH !== stackH) {
        stackH = nextH;
        echo.style.setProperty("--stack-h", stackH);
      }
      slices.forEach((slice, d) => {
        // DOM oben = hinterste Ebene; je größer x, desto weiter oben
        const x = slices.length - 1 - d + frac;
        const y = at(TOP, x);
        const h = at(HEIGHT, x);
        slice.style.setProperty("--y", (y + (TOP[1] - y) * m - lift).toFixed(2));
        slice.style.setProperty("--h", (h + (HEIGHT[1] - h) * m).toFixed(2));
      });
    };

    if (motion) {
      let gap = parseFloat(getComputedStyle(echo).marginBottom);
      window.addEventListener("resize", () => { gap = parseFloat(getComputedStyle(echo).marginBottom); });
      onScrollFrame(() => {
        const vh = window.innerHeight;
        const r = echo.getBoundingClientRect();
        const scrolled = (vh - r.top) / STEP;
        // Gemessen an der Oberkante des Fächers (ändert sich nicht, wenn die Box schrumpft):
        // 0 = die Section darunter würde bei voller Höhe gerade unten ins Bild kommen,
        // 1 = sie läge dann bei 55 % Höhe
        const nextTop = r.top + (BOX / 1436) * r.width + gap;
        const merge = clamp((vh - nextTop) / (vh * 0.45));
        return () => render(scrolled, merge);
      });
    } else {
      render(0);
    }
  }

  /* ---------- Cursor-Follower ---------- */

  if (motion && finePointer.matches) {
    const cursor = document.createElement("div");
    cursor.className = "cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.innerHTML = '<span class="cursor__dot"><span class="cursor__label"></span></span>';
    body.append(cursor);
    const label = cursor.querySelector(".cursor__label");

    // Der Punkt läuft dem Zeiger mit weichem Nachzug hinterher
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0, lastT = 0;
    const follow = (t) => {
      const dt = Math.min(0.05, lastT ? (t - lastT) / 1000 : 0.016);
      lastT = t;
      const k = 1 - Math.exp(-dt * 14);
      x += (tx - x) * k;
      y += (ty - y) * k;
      cursor.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      if (Math.abs(tx - x) + Math.abs(ty - y) > 0.1) raf = requestAnimationFrame(follow);
      else { raf = 0; lastT = 0; }
    };

    window.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      if (!cursor.classList.contains("is-visible")) {
        x = tx;
        y = ty;
        cursor.classList.add("is-visible");
      }
      if (!raf) raf = requestAnimationFrame(follow);
    }, { passive: true });

    // Form nach dem Element unter dem Zeiger: Punkt · Ring (Link) · Label-Kreis · Label-Pill
    document.addEventListener("pointerover", (e) => {
      const el = e.target instanceof Element ? e.target : null;
      if (!el) return;
      // Auf roten Flächen (Leadgen-Karte, Leiste bei offenem Menü) wäre Rot unsichtbar
      let color = el.closest("[data-cursor-color]")?.dataset.cursorColor || "";
      if (!color && isOpen() && el.closest(".bar")) color = "#fff";
      cursor.style.setProperty("--cursor-c", color);
      const labelHost = el.closest("[data-cursor-label]");
      if (labelHost) {
        label.textContent = labelHost.dataset.cursorLabel;
        // Pill: so breit wie das Label (Breite messen, damit sie weich aufziehen kann)
        if (labelHost.hasAttribute("data-cursor-pill")) {
          cursor.style.setProperty("--pill-w", `${label.offsetWidth + 48}px`);
          cursor.dataset.state = "pill";
        } else {
          cursor.dataset.state = "label";
        }
        return;
      }
      cursor.dataset.state = el.closest("a, button, label, [role='button']") ? "link" : "";
    });

    document.addEventListener("pointerdown", () => cursor.classList.add("is-down"));
    document.addEventListener("pointerup", () => cursor.classList.remove("is-down"));
    document.documentElement.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));
  }

  /* ---------- Projektliste + Abschnittszeilen: fahren beim Scrollen rein ---------- */

  // Bild = Curtain (vf-motion), Texte = Wort-Reveal; hier: Trennlinien + Tags (CSS: .is-in)
  if (body.classList.contains("has-reveal")) {
    const lined = document.querySelectorAll(".project, .case-label");
    const rowIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        rowIO.unobserve(entry.target);
      });
    }, { threshold: 0.2 });
    projects.forEach((row) => {
      row.querySelectorAll(".chip").forEach((chip, i) => chip.style.setProperty("--ci", i));
    });
    pageReady.then(() => lined.forEach((row) => rowIO.observe(row)));
  }

  /* ---------- Projektliste: Hover ---------- */

  // Eine dunkle Fläche fährt von der Kante herein, über die die Maus kommt, und verlässt die
  // Zeile in Richtung der Maus. Im Bild läuft eine Video-Vorschau des Projekts.
  let previewing = null; // läuft eine Vorschau, pausieren die Hintergrundvideos (nie zwei Videos)
  if (finePointer.matches) {
    document.querySelectorAll(".project__link").forEach((link) => {
      const preview = link.querySelector(".project__preview video");
      const edge = (e) => {
        const r = link.getBoundingClientRect();
        return e.clientY < r.top + r.height / 2 ? "-101%" : "101%";
      };
      link.addEventListener("pointerenter", (e) => {
        if (e.pointerType !== "mouse") return;
        // ohne Transition an die Einstiegskante setzen, dann hereinfahren
        link.style.setProperty("--wipe-t", "0s");
        link.style.setProperty("--from", edge(e));
        void link.offsetWidth;
        link.style.removeProperty("--wipe-t");
        link.classList.add("is-hover");
        if (preview && motion) {
          previewing = preview;
          preview.play().then(() => link.classList.add("is-preview")).catch(() => {});
          requestJobs();
        }
      });
      link.addEventListener("pointerleave", (e) => {
        link.style.setProperty("--from", edge(e));
        link.classList.remove("is-hover", "is-preview");
        if (preview) {
          preview.pause();
          if (previewing === preview) previewing = null;
          requestJobs();
        }
      });
    });
  }

  /* ---------- Kennzahlen zählen beim Reinscrollen hoch ---------- */

  const counters = [...document.querySelectorAll("[data-count]")];
  if (motion && counters.length && "IntersectionObserver" in window) {
    const format = (el, value) => {
      const decimals = Number(el.dataset.decimals) || 0;
      const number = value.toLocaleString("de-DE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      return `${el.dataset.prefix || ""}${number}${el.dataset.suffix || ""}`;
    };
    counters.forEach((el) => { el.textContent = format(el, 0); });
    const countIO = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      countIO.unobserve(entry.target);
      const el = entry.target;
      const target = Number(el.dataset.count);
      const start = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - start) / 1600);
        el.textContent = format(el, p < 1 ? target * (1 - Math.pow(2, -10 * p)) : target); // Expo-Out
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }), { threshold: 0.6 });
    pageReady.then(() => counters.forEach((el) => countIO.observe(el)));
  }

  /* ---------- Animationsseite: Prompts kopieren und Demos auslösen ---------- */

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback ohne Clipboard-API (z. B. per file:// geöffnet)
      const area = document.createElement("textarea");
      area.value = text;
      area.style.cssText = "position:fixed;opacity:0";
      body.append(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    }
  };
  document.querySelectorAll("[data-copy], [data-copy-all]").forEach((btn) => {
    const label = btn.dataset.label;
    let timer;
    btn.addEventListener("click", async () => {
      const text = btn.hasAttribute("data-copy-all")
        ? [...document.querySelectorAll(".anim-prompt pre")].map((pre) => pre.textContent).join("\n\n———\n\n")
        : document.getElementById(btn.dataset.copy)?.textContent || "";
      const ok = await copyText(text);
      btn.textContent = btn.dataset.label = ok ? "Kopiert ✓" : "Bitte manuell kopieren";
      clearTimeout(timer);
      timer = setTimeout(() => { btn.textContent = btn.dataset.label = label; }, 2000);
    });
  });
  document.querySelectorAll("[data-replay-intro]").forEach((btn) => btn.addEventListener("click", () => {
    try { sessionStorage.removeItem("vfc-pt"); } catch (err) { /* privater Modus */ }
    location.reload();
  }));
  document.querySelectorAll("[data-open-menu]").forEach((btn) => btn.addEventListener("click", openNav));

  /* ---------- Footer-Reveal: der Footer steht fest unten, die Seite schiebt sich darüber weg ---------- */

  const footer = document.querySelector(".footer");
  if (footer) {
    // Nur wenn der Footer ganz ins Fenster passt, sonst wäre sein oberer Teil nie zu sehen
    const fitFooter = () => body.classList.toggle("footer-reveal", footer.offsetHeight <= window.innerHeight);
    fitFooter();
    window.addEventListener("resize", fitFooter);
  }

  /* ---------- Galerien: aus statischen Bildern wird ein Bewegtbild ---------- */

  // Jedes Bild ist ein Fenster über den ganzen Rahmen. Ein Zustand sagt, wo das Fenster liegt
  // (r = [x, y, Breite, Höhe] als Anteil des Rahmens) und wo das Bild darin sitzt (Mitte c,
  // Größe k; 1 = füllt den Rahmen). Bewegt wird nur transform: das Fenster verschiebt und
  // skaliert sich, das Bild darin gegenläufig, damit es nie verzerrt. Die Gegenbewegung ist nicht
  // linear, darum wird sie als dichte Keyframe-Folge vorberechnet.
  // Jede Galerie hat einen von drei Schnitt-Stilen (data-gallery, siehe GALLERIES).
  // Gesteuert wird eine Galerie wie ein Video (siehe unten): sie läuft nur, solange sie die
  // größte bewegte Fläche im Bild ist.
  const inOut = (t) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2); // Quart-In-Out ≈ Curtain
  const easeOut = (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t)); // Expo-Out ≈ --ease-out
  // Zustand: Fenster r, Bildmitte c, Bildgröße k. Ohne c/k füllt das Bild sein Fenster (wie object-fit: cover).
  const st = (r, c = [r[0] + r[2] / 2, r[1] + r[3] / 2], k = Math.max(r[2], r[3])) => ({ r, c, k });
  const FULL = st([0, 0, 1, 1]);
  const num = (v) => (Math.abs(v) < 1e-6 ? 0 : +v.toPrecision(6)); // ohne Exponent-Schreibweise
  const pct = (v) => `${num(v * 100)}%`;
  const transforms = ({ r: [x, y, w, h], c: [cx, cy], k }) => {
    w = Math.max(w, 0.001);
    h = Math.max(h, 0.001);
    return [
      `translate(${pct(x)}, ${pct(y)}) scale(${num(w)}, ${num(h)})`,
      `translate(${pct((cx - k / 2 - x) / w)}, ${pct((cy - k / 2 - y) / h)}) scale(${num(k / w)}, ${num(k / h)})`,
    ];
  };
  const place = (tile, state, z = tile.style.zIndex) => {
    [tile.style.transform, tile.firstElementChild.style.transform] = transforms(state);
    tile.style.zIndex = z;
    tile.classList.add("is-on");
  };
  const hide = (tile) => tile.classList.remove("is-on");
  const glide = (tile, from, to, { duration = 900, ease = inOut, delay = 0, z } = {}) => {
    const frames = Array.from({ length: 41 }, (_, i) => {
      const e = ease(i / 40);
      const mix = (a, b) => a + (b - a) * e;
      return transforms(st(from.r.map((v, j) => mix(v, to.r[j])), from.c.map((v, j) => mix(v, to.c[j])), mix(from.k, to.k)));
    });
    place(tile, to, z); // Endzustand bleibt stehen, die Animation läuft darüber
    const timing = { duration, delay, easing: "linear", fill: "backwards" };
    return Promise.all([tile, tile.firstElementChild].map((el, n) =>
      el.animate(frames.map((f) => ({ transform: f[n] })), timing).finished));
  };
  // Einfache Bewegung zwischen zwei transform-Werten (Lider)
  const run = (el, from, to, timing) => {
    el.style.transform = to;
    return el.animate([{ transform: from }, { transform: to }], timing).finished;
  };
  // Zusätzliche Fenster für Streifen und Kopien (nur Deko, nicht für Screenreader)
  const extra = (track, src = "") => {
    const tile = document.createElement("div");
    const img = document.createElement("img");
    tile.className = "case-show__slide case-show__extra";
    tile.setAttribute("aria-hidden", "true");
    img.alt = "";
    img.loading = "lazy";
    if (src) img.src = src;
    tile.append(img);
    track.append(tile);
    return tile;
  };

  // Jeder Stil bekommt die Bild-Fenster und gibt { hold, step } zurück: step() spielt einen
  // Schnitt und liefert, wie lange danach stehen bleibt (ms).
  const GALLERIES = {
    // Lamellen: das nächste Bild fällt in sieben senkrechten Streifen ein, abwechselnd von oben und
    // unten, gestaffelt quer durchs Bild; die Laufrichtung wechselt bei jedem Schnitt
    lamellen(tiles, track) {
      const N = 7;
      const slats = Array.from({ length: N }, () => extra(track));
      // Streifen zeigen schon vorab das nächste Bild, damit es beim Schnitt geladen ist
      const prime = (tile) => slats.forEach((slat) => { slat.firstElementChild.src = tile.firstElementChild.src; });
      let i = 0;
      let flip = false;
      prime(tiles[1]);
      return {
        hold: 1700,
        async step() {
          const a = tiles[i];
          const b = tiles[(i + 1) % tiles.length];
          a.style.zIndex = 1;
          await Promise.all(slats.map((slat, n) => {
            const x = n / N;
            const w = 1 / N + (n < N - 1 ? 0.002 : 0); // leicht überlappen, sonst bleibt eine Haarlinie
            const y = n % 2 ? 0 : 1;
            return glide(slat, st([x, y, w, 0], [0.5, 0.5], 1.06), st([x, 0, w, 1], [0.5, 0.5], 1),
              { duration: 750, ease: easeOut, delay: (flip ? N - 1 - n : n) * 45, z: 3 });
          }));
          place(b, FULL, 2);
          slats.forEach(hide);
          hide(a);
          i = (i + 1) % tiles.length;
          flip = !flip;
          prime(tiles[(i + 1) % tiles.length]);
          return 1700;
        },
      };
    },

    // Zwinkern: zwei dunkle Lider schließen sich kurz wie beim Smiley-Zwinkern, dahinter wird
    // geschnitten. Jedes Bild driftet währenddessen leicht nach (wie eine Kamerafahrt), der Takt
    // wechselt zwischen lang und kurz.
    zwinkern(tiles, track) {
      const lids = ["top", "bottom"].map((side) => {
        const lid = document.createElement("span");
        lid.className = `case-show__lid case-show__lid--${side}`;
        track.append(lid);
        return lid;
      });
      const DRIFT = [[0.47, 0.52], [0.53, 0.48], [0.5, 0.53], [0.52, 0.5]];
      let i = 0;
      let cut = 0;
      return {
        hold: 1600,
        async step() {
          const a = tiles[i];
          const b = tiles[(i + 1) % tiles.length];
          await Promise.all(lids.map((lid) => run(lid, "scaleY(0)", "scaleY(1)",
            { duration: 220, easing: "cubic-bezier(0.7, 0, 0.84, 0)" })));
          hide(a);
          glide(b, st([0, 0, 1, 1], DRIFT[cut % DRIFT.length], 1.07), FULL, { duration: 2600, ease: easeOut, z: 1 });
          await Promise.all(lids.map((lid) => run(lid, "scaleY(1)", "scaleY(0)",
            { duration: 450, easing: "cubic-bezier(0.16, 1, 0.3, 1)" })));
          i = (i + 1) % tiles.length;
          return ++cut % 2 ? 1000 : 1600;
        },
      };
    },

    // Wechsel: Vollbilder, die zufällig auf drei Arten wechseln – Slide nach links, harter Schnitt
    // ohne Animation, oder ein Bild fällt von oben in eine Hälfte und liegt halb über dem
    // Vollbild. Nie zweimal derselbe Wechsel hintereinander, nach einer Hälfte wieder Vollbild.
    wechsel(tiles, track) {
      // Bei zwei Bildern je eine Kopie, sonst fehlt nach einer Hälfte ein freies Bild
      const pool = tiles.map((tile, src) => ({ tile, src, state: FULL }));
      if (tiles.length < 3) tiles.forEach((tile, src) => pool.push({ tile: extra(track, tile.firstElementChild.src), src, state: FULL }));
      let visible = [pool[0]]; // von unten nach oben
      let last = "";
      // Zufällig ein Bild, das gerade nicht zu sehen ist
      const pick = () => {
        const shown = visible.map((p) => p.src);
        const free = pool.filter((p) => !visible.includes(p));
        const fresh = free.filter((p) => !shown.includes(p.src));
        const options = fresh.length ? fresh : free.filter((p) => p.src !== shown[shown.length - 1]);
        return options[Math.floor(Math.random() * options.length)];
      };
      const shift = ({ r: [x, y, w, h], c: [cx, cy], k }, dx) => st([x + dx, y, w, h], [cx + dx, cy], k);
      const MOVES = {
        // alles schiebt sich nach links hinaus, das neue Vollbild kommt von rechts
        async slide(b) {
          await Promise.all([
            ...visible.map((p) => glide(p.tile, p.state, shift(p.state, -1), { duration: 750 })),
            glide(b.tile, shift(FULL, 1), FULL, { duration: 750 }),
          ]);
          visible.forEach((p) => hide(p.tile));
          b.state = FULL;
          visible = [b];
          return 1500;
        },
        // das neue Bild liegt sofort obenauf
        cut(b) {
          place(b.tile, FULL, 9);
          visible.forEach((p) => hide(p.tile));
          b.state = FULL;
          visible = [b];
          return 1100;
        },
        // das neue Bild fällt von oben in die linke oder rechte Hälfte
        async half(b) {
          const x = Math.random() < 0.5 ? 0 : 0.5;
          b.state = st([x, 0, 0.5, 1]);
          await glide(b.tile, st([x, -1, 0.5, 1]), b.state, { duration: 800, ease: easeOut, z: 9 });
          visible = [...visible, b];
          return 1400;
        },
      };
      return {
        hold: 1500,
        async step() {
          const moves = Object.keys(MOVES).filter((m) => m !== last && !(m === "half" && visible.length > 1));
          last = moves[Math.floor(Math.random() * moves.length)];
          const hold = await MOVES[last](pick());
          visible.forEach((p, n) => { p.tile.style.zIndex = n + 1; });
          return hold;
        },
      };
    },
  };

  const shows = !motion ? [] : [...document.querySelectorAll(".case-show")].map((el) => {
    const tiles = [...el.querySelectorAll(".case-show__slide")];
    const gallery = (GALLERIES[el.dataset.gallery] || GALLERIES.lamellen)(tiles, el.firstElementChild);
    const show = { el, paused: true };
    let hold = gallery.hold;
    let timer = 0;
    let moving = false;
    const next = async () => {
      moving = true;
      hold = await gallery.step();
      moving = false;
      if (!show.paused) timer = setTimeout(next, hold);
    };
    // Pausieren lässt einen laufenden Schnitt noch zu Ende laufen
    show.play = () => { show.paused = false; if (!moving) timer = setTimeout(next, hold); };
    show.pause = () => { show.paused = true; clearTimeout(timer); };
    return show;
  });

  /* ---------- Hintergrundvideos: nur abspielen, was gerade sichtbar ist ---------- */

  const videos = [...document.querySelectorAll(".bg-video"), ...shows];
  if (videos.length) {
    // Es läuft immer nur das Video (oder die Galerie), das gerade am meisten Fläche einnimmt:
    // zwei gleichzeitig laufende Videos drücken Chrome auf 30 fps. Die hereinschiebende Karte
    // zeigt ihr Standbild, bis sie übernimmt.
    onScrollFrame(() => {
      const vh = window.innerHeight;
      const states = videos.map((v) => {
        const box = v.el || v;
        const r = box.getBoundingClientRect();
        let bottom = Math.min(r.bottom, vh);
        // Im Sticky-Stack schiebt sich die nächste Karte über die aktuelle
        const next = box.closest(".stack > *")?.nextElementSibling;
        if (next) bottom = Math.min(bottom, next.getBoundingClientRect().top);
        return { near: r.top < vh * 2, area: Math.max(0, bottom - Math.max(r.top, 0)) * r.width };
      });
      const lead = previewing ? -1 : states.reduce((best, s, i) => (s.area > (states[best]?.area || 0) ? i : best), -1);
      return () => videos.forEach((v, i) => {
        // Nächste Videos schon vorladen, damit beim Reinscrollen kein Poster-Flackern entsteht
        if (v.preload === "none" && states[i].near) v.preload = "auto";
        const play = i === lead && !reduceMotion.matches;
        if (play && v.paused) v.play()?.catch(() => {});
        else if (!play && !v.paused) v.pause();
      });
    });
    reduceMotion.addEventListener("change", requestJobs);
  }
})();
