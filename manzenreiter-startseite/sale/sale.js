// Manzenreiter – Sale-Seiten: Platzhalter-Karten und Laufschrift

// ------------------------------------------------------------------
// Produkt-Raster (Sale-Übersicht, Figma "09 Sale Übersicht") – jede Karte
// führt zur Detailseite. Bilder und SOLD-Markierungen wie im Design.
// ------------------------------------------------------------------
const PLACEHOLDER_TITLES = [
  "Behind the word mountains",
  "The Big Oxmox advised",
  "Semantics a large language ocean",
];
const PRODUCT_IMAGES = 12;          // assets/produkt-01.jpg … produkt-12.jpg
const SOLD = [3, 11];               // Karte 4 und 12 (Index ab 0)

function buildProjectCards(container, count) {
  if (!container) return;
  let html = "";
  for (let i = 0; i < count; i++) {
    const title = PLACEHOLDER_TITLES[i % PLACEHOLDER_TITLES.length];
    const img = `assets/produkt-${String((i % PRODUCT_IMAGES) + 1).padStart(2, "0")}.jpg`;
    const sold = SOLD.includes(i) ? '<span class="sale-card__sold">SOLD</span>' : "";
    html += `
      <a class="sale-card" href="detail.html">
        <div class="sale-card__media" data-motion="curtain">
          <img src="${img}" alt="" width="986" height="554" loading="lazy" />${sold}
        </div>
        <p class="sale-card__title" data-motion="lift">${title}</p>
        <p class="sale-card__price">
          <img class="sale-card__arrow" src="assets/arrow.svg" alt="" width="32" height="30" />
          <span class="sale-card__now">€ 3.099</span>
          <span class="sale-card__old">statt 5.189</span>
        </p>
      </a>`;
  }
  container.innerHTML = html;
}

buildProjectCards(document.getElementById("project-grid"), 12);
buildProjectCards(document.getElementById("related-grid"), 3);

// ------------------------------------------------------------------
// SALE marquee — scroll-linked, not time-based.
//
// Position is a direct function of window.scrollY, like an Apple-style
// scroll-scrubbed animation: scrolling down moves the "left" line left
// and the "right" line right; scrolling up inverts both, because the
// transform is recomputed from the absolute scroll position rather
// than accumulated frame-by-frame.
//
// Each line's markup contains two identical copies of the "SALE" text
// back to back, so its scrollWidth is exactly 2x one repeat's width
// ("half"). The transform is always kept within (-half, 0]: at 0, copy 1
// exactly fills the viewport from the left edge; at -half, copy 2 has
// slid into that exact same spot. Only the *sign* of the drift inside
// the modulo differs between the two lines (which makes one line's
// sawtooth rise and the other's fall) — the safe (-half, 0] range itself
// is identical, so neither line ever runs out of content on either side.
// ------------------------------------------------------------------
const MARQUEE_SPEED = 0.8; // px of marquee movement per px scrolled

function mod(n, m) {
  return ((n % m) + m) % m;
}

function initMarquee() {
  const lines = document.querySelectorAll(".marquee-line[data-dir]");
  if (!lines.length) return;
  // "Bewegung reduzieren": Laufschrift bleibt stehen
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const items = Array.from(lines).map((el) => ({
    el,
    dir: el.dataset.dir === "left" ? -1 : 1,
    half: el.scrollWidth / 2,
  }));

  function update() {
    const y = window.scrollY;
    items.forEach((item) => {
      if (!item.half) return;
      const x = mod(item.dir * y * MARQUEE_SPEED, item.half) - item.half;
      item.el.style.transform = `translateX(${x}px)`;
    });
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  function measure() {
    items.forEach((item) => {
      item.half = item.el.scrollWidth / 2;
    });
    update();
  }
  window.addEventListener("resize", measure);
  // Inter kommt als Webfont nach: danach neu messen, sonst stimmt die Breite nicht
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  update();
}

initMarquee();
