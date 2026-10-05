// ---------------------------------------------------------------------------
// Die Koje · Hotspot-Bild – alle Inhalte kommen aus data/hotspots.json.
// ---------------------------------------------------------------------------
import { gsap } from "gsap";

const $ = (s, el = document) => el.querySelector(s);
const STORAGE_KEY = "koje2:visited";
const REWARD_KEY = "koje2:reward";
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const sidePanelMQ = matchMedia("(min-width: 1024px)");
const dur = (d) => (reduceMotion.matches ? 0 : d);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const pad = (n) => String(n).padStart(2, "0");

const store = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* privater Modus */ }
  },
};

const el = {
  stage: $("[data-stage]"),
  viewport: $("[data-viewport]"),
  canvas: $("[data-canvas]"),
  picture: $("[data-picture]"),
  layer: $("[data-hotspots]"),
  hint: $("[data-hint]"),
  error: $("[data-error]"),
  panel: $("[data-panel]"),
  panelBody: $("[data-panel-body]"),
  checks: $("[data-checks]"),
  count: $("[data-count]"),
  total: $("[data-total]"),
  reset: $("[data-reset]"),
  list: $("[data-list]"),
  listToggle: $("[data-list-toggle]"),
  listSection: $("#feature-list"),
  chips: $("[data-chips]"),
  reward: $("[data-reward]"),
};

let data;
try {
  const res = await fetch("data/hotspots.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  data = await res.json();
} catch (err) {
  console.error("[Koje] hotspots.json nicht ladbar", err);
  el.error.hidden = false;
  el.hint.hidden = true;
  throw err;
}

const spots = [...data.hotspots].sort((a, b) => a.order - b.order);
const byId = Object.fromEntries(spots.map((s) => [s.id, s]));
const visited = new Set(store.get(STORAGE_KEY, []).filter((id) => byId[id]));
const svgCache = new Map();
const mobileMQ = matchMedia(data.image.mobile?.media || "(max-width: 0px)");

let current = null;
let lastTrigger = null;
let rewardShown = store.get(REWARD_KEY, false);
const zoom = { x: 0, y: 0, s: 1 };

// ---------------------------------------------------------------- Bild + Hotspots
function renderImage() {
  const { image } = data;
  el.picture.innerHTML = "";
  if (image.mobile) {
    const source = document.createElement("source");
    source.media = image.mobile.media;
    source.srcset = image.mobile.src;
    source.width = image.mobile.width;
    source.height = image.mobile.height;
    el.picture.append(source);
  }
  const img = document.createElement("img");
  Object.assign(img, { src: image.src, alt: image.alt, width: image.width, height: image.height, decoding: "async" });
  el.picture.append(img);
}

const hsButtons = {};
function renderHotspots() {
  spots.forEach((s, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "hs";
    b.dataset.id = s.id;
    b.style.setProperty("--i", i);
    b.innerHTML = `<span class="hs-dot"><svg aria-hidden="true"><use href="#i-check"/></svg></span><span class="hs-tip" aria-hidden="true">${s.title}</span>`;
    b.addEventListener("click", () => (current === s.id ? close() : open(s.id, b)));
    el.layer.append(b);
    hsButtons[s.id] = b;
  });
  positionHotspots();
}

// Position in Prozent relativ zum Bild – resize-sicher. Mobil gilt die 4:5-Variante.
function positionHotspots() {
  const mobile = !!data.image.mobile && mobileMQ.matches;
  const img = mobile ? data.image.mobile : data.image;
  el.viewport.style.setProperty("--ratio", `${img.width} / ${img.height}`);
  for (const s of spots) {
    const p = mobile && s.mobile ? s.mobile : s;
    const b = hsButtons[s.id];
    b.style.left = `${p.x}%`;
    b.style.top = `${p.y}%`;
    b.classList.toggle("tip-left", p.x > 78);
    b.classList.toggle("tip-right", p.x < 14);
    b.classList.toggle("tip-below", p.y < 16);
  }
}

const pos = (s) => (data.image.mobile && mobileMQ.matches && s.mobile ? s.mobile : s);

// ---------------------------------------------------------------- Fortschritt
function renderChecks() {
  el.total.textContent = spots.length;
  spots.forEach((s) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.id = s.id;
    b.innerHTML = `<svg aria-hidden="true"><use href="#i-check"/></svg>`;
    b.addEventListener("click", () => open(s.id, hsButtons[s.id]));
    li.append(b);
    el.checks.append(li);
  });
}

function updateProgress() {
  el.count.textContent = visited.size;
  el.reset.hidden = visited.size === 0;
  spots.forEach((s, i) => {
    const seen = visited.has(s.id);
    const b = hsButtons[s.id];
    b.classList.toggle("is-visited", seen);
    b.classList.toggle("is-active", s.id === current);
    b.setAttribute("aria-label", `Feature ${i + 1} von ${spots.length}: ${s.title}${seen ? " – entdeckt" : ""}`);
    b.setAttribute("aria-expanded", String(s.id === current));
    const c = el.checks.querySelector(`[data-id="${s.id}"]`);
    c.classList.toggle("is-visited", seen);
    c.classList.toggle("is-current", s.id === current);
    c.setAttribute("aria-label", `${s.title} – ${seen ? "entdeckt" : "noch nicht entdeckt"}`);
  });
  el.panel.querySelector("[data-done]").hidden = !(visited.size === spots.length && !rewardShown);
}

// ---------------------------------------------------------------- Zoom
function applyZoom() {
  el.canvas.style.transform = `translate3d(${zoom.x}px, ${zoom.y}px, 0) scale(${zoom.s})`;
  el.canvas.style.setProperty("--inv", (1 / zoom.s).toFixed(4));
}

// Zoomt so, dass der Hotspot im freien Bereich neben bzw. über dem Panel liegt.
function zoomTo(s, { instant = false } = {}) {
  const W = el.viewport.clientWidth;
  const H = el.viewport.clientHeight;
  const side = sidePanelMQ.matches;
  const S = side ? 1.7 : 1.55;
  const p = pos(s);
  const px = (p.x / 100) * W;
  const py = (p.y / 100) * H;
  const freeW = side ? W - el.panel.offsetWidth - 32 : W;
  const tx = clamp(freeW / 2 - S * px, W - S * W, 0);
  const ty = clamp(H / 2 - S * py, H - S * H, 0);
  el.viewport.classList.add("is-zoomed");
  gsap.to(zoom, { x: tx, y: ty, s: S, duration: instant ? 0 : dur(0.9), ease: "power3.inOut", onUpdate: applyZoom, overwrite: true });
  if (!side) scrollForSheet(ty + S * py);
  else ensureStageVisible();
}

function resetZoom() {
  el.viewport.classList.remove("is-zoomed");
  gsap.to(zoom, { x: 0, y: 0, s: 1, duration: dur(0.8), ease: "power3.inOut", onUpdate: applyZoom, overwrite: true });
}

// Mobil: Seite so scrollen, dass der Hotspot mittig über dem Bottom-Sheet steht.
function scrollForSheet(spotY) {
  requestAnimationFrame(() => {
    const top = el.viewport.getBoundingClientRect().top + scrollY;
    const header = 12;
    const free = innerHeight - el.panel.offsetHeight - header;
    const target = top + spotY - header - free / 2;
    window.scrollTo({ top: Math.max(0, target), behavior: reduceMotion.matches ? "auto" : "smooth" });
  });
}

function ensureStageVisible() {
  const r = el.viewport.getBoundingClientRect();
  if (r.top < 0 || r.bottom > innerHeight) {
    const target = scrollY + r.top - Math.max(16, (innerHeight - r.height) / 2);
    window.scrollTo({ top: target, behavior: reduceMotion.matches ? "auto" : "smooth" });
  }
}

// ---------------------------------------------------------------- Panel
async function detailMarkup(detail) {
  if (!detail?.src) return "";
  if (!svgCache.has(detail.src)) {
    const task = detail.src.endsWith(".svg")
      ? fetch(detail.src).then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
      : Promise.resolve(`<img src="${detail.src}" alt="">`);
    svgCache.set(detail.src, task.catch(() => ""));
  }
  return svgCache.get(detail.src);
}

async function fillPanel(s) {
  const i = spots.indexOf(s);
  const q = (sel) => el.panel.querySelector(sel);
  q("[data-num]").textContent = pad(i + 1);
  q("[data-of]").textContent = pad(spots.length);
  q("[data-badge]").hidden = !s.placeholder;
  q("[data-kicker]").textContent = s.title;
  q("[data-title]").textContent = s.headline || s.title;
  q("[data-text]").textContent = s.text;
  q("[data-note]").textContent = s.note || "";
  q("[data-tags]").innerHTML = (s.tags || []).map((t) => `<li>${t}</li>`).join("");
  const prev = spots[(i - 1 + spots.length) % spots.length];
  const next = spots[(i + 1) % spots.length];
  q("[data-prev-name]").textContent = prev.title;
  q("[data-next-name]").textContent = next.title;
  q("[data-prev]").setAttribute("aria-label", `Vorheriges Feature: ${prev.title}`);
  q("[data-next]").setAttribute("aria-label", `Nächstes Feature: ${next.title}`);
  const media = q("[data-media]");
  media.innerHTML = await detailMarkup(s.detail);
  const svg = media.querySelector("svg");
  if (svg) {
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", s.detail.alt || s.title);
  }
}

async function open(id, trigger) {
  const s = byId[id];
  if (!s) return;
  const wasOpen = current !== null;
  current = id;
  if (trigger) lastTrigger = trigger;
  visited.add(id);
  store.set(STORAGE_KEY, [...visited]);
  el.hint.classList.add("is-gone");
  updateProgress();

  if (wasOpen) {
    gsap.to(el.panelBody, { opacity: 0, y: 8, duration: dur(0.15), ease: "power1.in" });
  }
  await fillPanel(s);
  if (current !== id) return; // inzwischen anderer Hotspot gewählt

  if (!wasOpen) {
    el.panel.hidden = false;
    const from = sidePanelMQ.matches ? { x: 40, opacity: 0 } : { yPercent: 100, opacity: 1 };
    gsap.fromTo(el.panel, from, { x: 0, yPercent: 0, opacity: 1, duration: dur(0.55), ease: "power3.out", overwrite: true });
  }
  gsap.fromTo(el.panelBody, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: dur(0.4), delay: wasOpen ? 0 : dur(0.15), ease: "power2.out" });
  el.panelBody.scrollTop = 0;
  zoomTo(s);
  el.panel.querySelector("[data-title]").focus({ preventScroll: true });
}

function close({ restoreFocus = true } = {}) {
  if (current === null) return;
  const id = current;
  current = null;
  updateProgress();
  resetZoom();
  const to = sidePanelMQ.matches ? { x: 40, opacity: 0 } : { yPercent: 100 };
  gsap.to(el.panel, { ...to, duration: dur(0.4), ease: "power2.in", overwrite: true, onComplete: () => (el.panel.hidden = true) });
  if (restoreFocus) (lastTrigger?.isConnected ? lastTrigger : hsButtons[id])?.focus({ preventScroll: true });
  if (visited.size === spots.length && !rewardShown) setTimeout(showReward, reduceMotion.matches ? 0 : 450);
}

function step(dir) {
  const i = spots.findIndex((s) => s.id === current);
  const next = spots[(i + dir + spots.length) % spots.length];
  open(next.id, hsButtons[next.id]);
}

// ---------------------------------------------------------------- Belohnung
function showReward() {
  rewardShown = true;
  store.set(REWARD_KEY, true);
  updateProgress();
  el.reward.hidden = false;
  const confetti = el.reward.querySelector(".confetti");
  confetti.innerHTML = "";
  if (!reduceMotion.matches) {
    const colors = ["#e30613", "#3c3c3c", "#f3c13a", "#c99a6a", "#9fd0f0"];
    for (let i = 0; i < 26; i++) {
      const c = document.createElement("i");
      c.style.left = `${Math.random() * 100}%`;
      c.style.background = colors[i % colors.length];
      c.style.animationDelay = `${Math.random() * 0.6}s`;
      c.style.transform = `rotate(${Math.random() * 180}deg)`;
      confetti.append(c);
    }
  }
  gsap.fromTo(el.reward.querySelector(".reward-card"), { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: dur(0.5), ease: "back.out(1.6)" });
  el.reward.querySelector("#reward-title").focus({ preventScroll: true });
  ensureStageVisible();
}

function hideReward() {
  el.reward.hidden = true;
  el.listToggle.focus({ preventScroll: true });
}

// ---------------------------------------------------------------- Liste & Zusammenfassung
function renderList() {
  el.list.innerHTML = spots.map((s, i) => `
    <li class="feature-card">
      <img src="${s.detail?.src || ""}" alt="${s.detail?.alt || ""}" loading="lazy" width="600" height="400" />
      <div class="feature-card-body">
        <p class="panel-num">${pad(i + 1)} ${s.placeholder ? '<span class="badge">[Platzhalter]</span>' : ""}</p>
        <h3 class="serif">${s.title}</h3>
        <p><strong>${s.headline}</strong> ${s.text}</p>
        ${s.note ? `<p class="note">${s.note}</p>` : ""}
        <button type="button" class="show-btn" data-show="${s.id}">Im Bild zeigen <svg aria-hidden="true"><use href="#i-arrow"/></svg></button>
      </div>
    </li>`).join("");
  el.list.addEventListener("click", (e) => {
    const b = e.target.closest("[data-show]");
    if (b) open(b.dataset.show, b);
  });
  el.chips.innerHTML = spots.map((s) => `<li class="${s.placeholder ? "is-placeholder" : ""}">${s.title}${s.placeholder ? " [Platzhalter]" : ""}</li>`).join("");
}

// ---------------------------------------------------------------- Events
el.panel.querySelector("[data-close]").addEventListener("click", () => close());
el.panel.querySelector("[data-prev]").addEventListener("click", () => step(-1));
el.panel.querySelector("[data-next]").addEventListener("click", () => step(1));
el.panel.querySelector("[data-claim]").addEventListener("click", () => close({ restoreFocus: false }));
el.reward.querySelector("[data-reward-close]").addEventListener("click", hideReward);
el.reward.addEventListener("click", (e) => { if (e.target === el.reward) hideReward(); });

el.reset.addEventListener("click", () => {
  visited.clear();
  rewardShown = false;
  store.set(STORAGE_KEY, []);
  store.set(REWARD_KEY, false);
  close({ restoreFocus: false });
  updateProgress();
  el.hint.classList.remove("is-gone");
});

el.listToggle.addEventListener("click", () => {
  const show = el.listSection.hidden;
  el.listSection.hidden = !show;
  el.listToggle.setAttribute("aria-expanded", String(show));
  el.listToggle.textContent = show ? "Liste ausblenden" : "Alle Features anzeigen";
  if (show) gsap.from(el.list.children, { opacity: 0, y: 16, stagger: 0.05, duration: dur(0.5), ease: "power2.out" });
});

$("[data-copy]").addEventListener("click", async () => {
  const status = $("[data-copy-status]");
  try {
    await navigator.clipboard.writeText(location.href.split("#")[0]);
    status.textContent = "Link kopiert ✓";
  } catch {
    status.textContent = "Kopieren nicht möglich";
  }
  setTimeout(() => (status.textContent = ""), 2500);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!el.reward.hidden) return hideReward();
    if (current) return close();
  }
  // Fokus im Belohnungs-Dialog halten
  if (e.key === "Tab" && !el.reward.hidden) {
    const f = [...el.reward.querySelectorAll("a, button")];
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
    else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    return;
  }
  const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
  if (!(e.key in keys)) return;
  const onHotspot = document.activeElement?.classList.contains("hs");
  const inPanel = el.panel.contains(document.activeElement);
  if (current && (inPanel || onHotspot)) {
    e.preventDefault();
    step(keys[e.key]);
  } else if (onHotspot) {
    e.preventDefault();
    const i = spots.findIndex((s) => s.id === document.activeElement.dataset.id);
    hsButtons[spots[(i + keys[e.key] + spots.length) % spots.length].id].focus();
  }
});

// Klick außerhalb von Bild und Panel schließt (Desktop)
document.addEventListener("pointerdown", (e) => {
  if (!current || !sidePanelMQ.matches) return;
  if (el.stage.contains(e.target) || el.checks.contains(e.target) || el.list.contains(e.target)) return;
  close({ restoreFocus: false });
});

let resizeTimer;
addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    positionHotspots();
    if (current) zoomTo(byId[current], { instant: true });
  }, 120);
});
mobileMQ.addEventListener("change", () => { positionHotspots(); if (current) zoomTo(byId[current], { instant: true }); });
sidePanelMQ.addEventListener("change", () => { if (current) { gsap.set(el.panel, { clearProps: "transform,opacity,visibility" }); zoomTo(byId[current], { instant: true }); } });

// ---------------------------------------------------------------- Start
renderImage();
renderHotspots();
renderChecks();
renderList();
updateProgress();
if (visited.size) el.hint.classList.add("is-gone");

// Detail-SVGs im Hintergrund vorladen
(window.requestIdleCallback || ((fn) => setTimeout(fn, 800)))(() => spots.forEach((s) => detailMarkup(s.detail)));
