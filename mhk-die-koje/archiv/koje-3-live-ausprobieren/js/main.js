// ---------------------------------------------------------------------------
// Die Koje · Live ausprobieren
// Szene: js/scene.js · Physik der Auszüge: js/pullable.js · Sounds: js/sound.js
// ---------------------------------------------------------------------------
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { sceneMarkup } from "./scene.js";
import { Sound } from "./sound.js";
import { makePullable } from "./pullable.js";

gsap.registerPlugin(Flip);

const reduceMQ = matchMedia("(prefers-reduced-motion: reduce)");
const reduce = () => reduceMQ.matches;
const dur = (d) => (reduce() ? 0 : d);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const $ = (s) => document.querySelector(s);
const NS = "http://www.w3.org/2000/svg";

// ---------------------------------------------------------------- Inhalte
const FEATURES = [
  { id: "schublade-unten", chip: "Schublade", name: "Vollauszug", text: "Läuft weich bis zum Anschlag und rastet ein. Kurz vor dem Schließen zieht sie sich gedämpft selbst zu.", note: "[Maß folgt]" },
  { id: "staubsauger-fach", chip: "Sockelfach", name: "Sockel-Garage", text: "Im Sockel der Insel wohnen Saugroboter und Akkusauger. Fach auf, Sauger raus, Fach zu.", note: "[Platzhalter: Ausstattung folgt]" },
  { id: "couch", chip: "Couch", name: "Ausziehcouch", text: "Fährt aus der Nische neben der Küche, das Rückenpolster klappt auf. Sitzplatz für [Platzhalter] Personen.", note: "[Maß folgt]" },
  { id: "tablet-halter", chip: "Tablet", name: "Tablet-Halterung", text: "Ein Arm fährt aus der Arbeitsplatte und hält das Rezept auf Augenhöhe – der Timer läuft gleich mit.", note: "[Platzhalter: Mechanik folgt]" },
  { id: "spielwand", chip: "Spielwand", name: "Spielwand", text: "Klappe auf, und die Inselseite wird zur Maltafel. Wähl eine Farbe und mal los – mit Maus oder Finger.", note: "[Platzhalter: Oberfläche folgt]" },
  { id: "licht", chip: "Licht", name: "Lichtstimmungen", text: "Morgen, Kochen, Abend – plus Dimmer. Unterschrank-, Sockel- und Pendellicht ändern sich gemeinsam.", note: "[Platzhalter: Lichtsteuerung folgt]" },
];
const byId = Object.fromEntries(FEATURES.map((f) => [f.id, f]));

// ---------------------------------------------------------------- Szene
const sceneHost = $("[data-scene]");
sceneHost.innerHTML = sceneMarkup;
const svg = sceneHost.querySelector("svg");
const S = (id) => svg.querySelector(`#${id}`);
const stage = $("[data-stage]");
const scroller = $("[data-scroll]");
const sound = new Sound();

// ---------------------------------------------------------------- Fortschritt & Führung
const discovered = new Set();
let started = false;
const pips = $("[data-pips]");
const dock = $("[data-dock]");
const intro = $("[data-intro]");
const handHint = S("hand-hint");

FEATURES.forEach((f) => {
  const li = document.createElement("li");
  li.dataset.id = f.id;
  li.innerHTML = `<svg aria-hidden="true"><use href="#i-check"/></svg>`;
  pips.append(li);
  const b = document.createElement("button");
  b.type = "button";
  b.className = "dock-btn";
  b.dataset.id = f.id;
  b.innerHTML = `<span class="dot"><svg aria-hidden="true"><use href="#i-check"/></svg></span>${f.chip}`;
  b.addEventListener("click", () => dockAction(f.id));
  dock.append(b);
});
$("[data-total]").textContent = FEATURES.length;

function interacted() {
  if (started) return;
  started = true;
  hideIntro();
  handHint.classList.add("is-gone");
}

function hideIntro() {
  intro.classList.add("is-gone");
  setTimeout(() => (intro.hidden = true), reduce() ? 0 : 450);
}

function discover(id) {
  if (discovered.has(id)) return;
  discovered.add(id);
  svg.querySelector(`.hint[data-for="${id}"]`)?.classList.add("is-found");
  pips.querySelector(`[data-id="${id}"]`).classList.add("is-done");
  const btn = dock.querySelector(`[data-id="${id}"]`);
  btn.classList.add("is-done");
  btn.setAttribute("aria-label", `${byId[id].chip} – ausprobiert`);
  $("[data-count]").textContent = discovered.size;
  if (discovered.size === FEATURES.length) setTimeout(celebrate, reduce() ? 200 : 1100);
}

// ---------------------------------------------------------------- Feature-Drawer (unten rechts)
const card = $("[data-card]");
let cardId = null;
function showCard(id, actions = []) {
  const key = id + actions.map((a) => a.label).join();
  if (key === cardId) return;
  cardId = key;
  const f = byId[id];
  const state = Flip.getState(card);
  $("[data-fc-kicker]").textContent = "Zuletzt benutzt";
  $("[data-fc-title]").textContent = f.name;
  $("[data-fc-text]").textContent = f.text;
  $("[data-fc-note]").textContent = f.note || "";
  const box = $("[data-fc-actions]");
  box.innerHTML = "";
  actions.forEach(({ label, fn }) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tool";
    b.textContent = label;
    b.addEventListener("click", fn);
    box.append(b);
  });
  Flip.from(state, { duration: dur(0.35), ease: "power2.out", scale: false });
  gsap.fromTo(card.children, { opacity: 0.2 }, { opacity: 1, duration: dur(0.3), stagger: 0.03 });
}

// ---------------------------------------------------------------- Auszüge (Schublade, Sockelfach)
function drawerRenderer({ x0, x1, y0, travel, scaleMax, front, floor, rim, clip, content, depth = 0.5 }) {
  const cx = (x0 + x1) / 2;
  const w = x1 - x0;
  return (p) => {
    const pc = clamp(p, -0.05, 1.12);
    const d = Math.max(0, pc) * travel;
    const s = 1 + Math.max(0, pc) * (scaleMax - 1);
    front.setAttribute("transform", `translate(${cx} ${y0 + d}) scale(${s}) translate(${-cx} ${-y0})`);
    const hw = (w / 2) * s;
    const ty = y0 + d;
    const pts = `${x0},${y0} ${x1},${y0} ${cx + hw},${ty} ${cx - hw},${ty}`;
    floor.setAttribute("points", pts);
    clip.setAttribute("points", pts);
    const rh = Math.min(5, d);
    rim.setAttribute("points", `${x0},${y0} ${x1},${y0} ${x1},${y0 + rh} ${x0},${y0 + rh}`);
    content.setAttribute("transform", `translate(0 ${y0 + d * depth})`);
  };
}

const pullCommon = { sound, reduceMotion: reduce };

const schublade = makePullable({
  ...pullCommon,
  el: S("schublade-unten"),
  travel: 62,
  render: drawerRenderer({ x0: 401.5, x1: 538.5, y0: 577.5, travel: 62, scaleMax: 1.07, front: S("schublade-front"), floor: S("schublade-boden"), rim: S("schublade-rand"), clip: S("schublade-clip"), content: S("schublade-inhalt"), depth: 0.55 }),
  onInteract: () => { interacted(); showCard("schublade-unten"); },
  onOpen: () => discover("schublade-unten"),
  labels: { open: "Schublade unten öffnen – ziehen oder Enter", close: "Schublade unten schließen – Enter oder Pfeil nach oben" },
});

const fach = makePullable({
  ...pullCommon,
  el: S("staubsauger-fach"),
  travel: 36,
  render: drawerRenderer({ x0: 584, x1: 724, y0: 731.5, travel: 36, scaleMax: 1.1, front: S("fach-front"), floor: S("fach-boden"), rim: document.createElementNS(NS, "polygon"), clip: S("fach-clip"), content: S("fach-inhalt"), depth: 0.5 }),
  onInteract: () => { interacted(); showCard("staubsauger-fach"); },
  onOpen: () => discover("staubsauger-fach"),
  labels: { open: "Sockelfach mit Staubsauger öffnen", close: "Sockelfach schließen" },
});

// ---------------------------------------------------------------- Couch
const couchBody = S("couch-body");
const polster = S("couch-polster");
const couchShadow = S("couch-shadow");
const couchLabel = S("couch-label");
const couch = makePullable({
  ...pullCommon,
  el: S("couch"),
  travel: 60,
  render(p) {
    const pc = clamp(p, -0.05, 1.12);
    const s = 0.94 + 0.12 * pc;
    const ty = -8 + 22 * pc;
    couchBody.setAttribute("transform", `translate(205 ${698 + ty}) scale(${s}) translate(-205 -698)`);
    const k = clamp((pc - 0.3) / 0.7, 0, 1);
    const sy = 0.2 + 0.8 * (1 - Math.pow(1 - k, 3)); // Polster klappt auf
    polster.setAttribute("transform", `translate(0 596) scale(1 ${sy}) translate(0 -596)`);
    couchShadow.setAttribute("rx", 150 * s);
    couchShadow.setAttribute("cy", 700 + ty * 0.4);
    couchLabel.setAttribute("opacity", clamp((pc - 0.85) / 0.15, 0, 1));
  },
  onInteract: () => { interacted(); showCard("couch"); },
  onOpen: () => discover("couch"),
  labels: { open: "Couch ausfahren", close: "Couch einfahren" },
});

// ---------------------------------------------------------------- Tablet-Halterung
const tablet = S("tablet-halter");
const tabMove = S("tablet-move");
const tabDev = S("tablet-device");
const timerText = S("tablet-timer");
const timerRing = S("tablet-ring");
tabMove.removeAttribute("transform");
gsap.set(tabMove, { y: 165 });
gsap.set(tabDev, { rotation: -14, scaleX: 0.8, svgOrigin: "760 404" });
const tabTl = gsap.timeline({ paused: true })
  .to(tabMove, { y: 0, duration: 0.85, ease: "power3.out" })
  .to(tabDev, { rotation: 0, scaleX: 1, duration: 0.7, ease: "back.out(1.8)" }, "-=0.3");
let tabOpen = false;
let timerLeft = 12 * 60;
let timerId = null;

function renderTimer() {
  const m = Math.floor(timerLeft / 60);
  const s = timerLeft % 60;
  timerText.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  timerRing.setAttribute("stroke-dashoffset", (81.7 * (1 - s / 60 || 0)).toFixed(1));
}

function setTablet(open, { quiet = false } = {}) {
  if (open === tabOpen) return;
  tabOpen = open;
  tablet.setAttribute("aria-pressed", String(open));
  tablet.setAttribute("aria-label", open ? "Tablet-Halterung einfahren" : "Tablet-Halterung ausfahren");
  clearInterval(timerId);
  if (open) {
    if (!quiet) sound.motor(0.85);
    if (reduce()) tabTl.progress(1); else tabTl.timeScale(1).play();
    setTimeout(() => sound.klack(0.6), reduce() ? 0 : 850);
    timerId = setInterval(() => {
      timerLeft = timerLeft <= 0 ? 12 * 60 : timerLeft - 1;
      if (timerLeft === 0) sound.timerDone();
      renderTimer();
    }, 1000);
    discover("tablet-halter");
  } else {
    if (!quiet) sound.motor(0.55);
    if (reduce()) tabTl.progress(0); else tabTl.timeScale(1.7).reverse();
  }
}
renderTimer();

// ---------------------------------------------------------------- Spielwand + Malen
const wand = S("spielwand");
const klappe = S("spielwand-klappe");
const palette = S("spielwand-palette");
const ablage = S("spielwand-ablage");
const tafel = S("spielwand-tafel");
const zeichnung = S("spielwand-zeichnung");
const COLORS = [["#f4f1ea", "Weiß"], ["#f3d36b", "Gelb"], ["#ef4a52", "Rot"]];
let wandOpen = false;
let chalkColor = COLORS[0][0];
palette.setAttribute("aria-hidden", "true");
palette.querySelectorAll("[role],[tabindex]").forEach((n) => { n.removeAttribute("role"); n.removeAttribute("tabindex"); });
palette.style.pointerEvents = "none";

function setColor(c) {
  chalkColor = c;
  palette.querySelectorAll(".sc-color").forEach((g) => g.classList.toggle("is-active", g.dataset.color === c));
}
setColor(chalkColor);

function clearDrawing() {
  const paths = [...zeichnung.children];
  gsap.to(paths, { opacity: 0, duration: dur(0.35), onComplete: () => paths.forEach((p) => p.remove()) });
  sound.softClose(0.4);
}

function wandActions() {
  return [
    ...COLORS.map(([c, l]) => ({ label: l, fn: () => setColor(c) })),
    { label: "Löschen", fn: clearDrawing },
    { label: "Klappe schließen", fn: () => setWand(false) },
  ];
}

function setWand(open) {
  if (open === wandOpen) return;
  wandOpen = open;
  wand.classList.toggle("is-open", open);
  wand.setAttribute("aria-pressed", String(open));
  wand.setAttribute("aria-label", open ? "Spielwand: Malfläche offen – Enter klappt zu" : "Spielwand aufklappen");
  palette.style.pointerEvents = open ? "auto" : "none";
  gsap.killTweensOf([klappe, palette, ablage]);
  if (open) {
    sound.klack(0.7);
    gsap.to(klappe, { scaleY: 0.05, svgOrigin: "725 714", duration: dur(0.6), ease: "power2.in", onComplete: () => { sound.thump(0.2, 85); } });
    gsap.to(ablage, { opacity: 1, duration: dur(0.2), delay: dur(0.5) });
    gsap.to(palette, { opacity: 1, duration: dur(0.4), delay: dur(0.55) });
    discover("spielwand");
    showCard("spielwand", wandActions());
  } else {
    gsap.to([palette, ablage], { opacity: 0, duration: dur(0.15) });
    gsap.to(klappe, { scaleY: 1, svgOrigin: "725 714", duration: dur(0.55), ease: "power2.out", onComplete: () => sound.klack(0.6) });
    showCard("spielwand");
  }
}

let stroke = null;
let lastPt = null;
const toTafel = (e) => {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  return pt.matrixTransform(tafel.getScreenCTM().inverse());
};
const onBoard = (p) => p.x >= 580 && p.x <= 870 && p.y >= 570 && p.y <= 714;

wand.addEventListener("pointerdown", (e) => {
  if (!wandOpen) return;
  const sw = e.target.closest(".sc-color, .sc-clear");
  if (sw) {
    if (sw.classList.contains("sc-clear")) clearDrawing(); else setColor(sw.dataset.color);
    sound.klack(0.35);
    return;
  }
  const p = toTafel(e);
  if (!onBoard(p) || p.x > 836) return; // rechts liegt die Palette
  e.preventDefault();
  wand.setPointerCapture(e.pointerId);
  stroke = document.createElementNS(NS, "path");
  Object.entries({ fill: "none", stroke: chalkColor, "stroke-width": 4.5, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0.92, d: `M${p.x.toFixed(1)} ${p.y.toFixed(1)}` }).forEach(([k, v]) => stroke.setAttribute(k, v));
  zeichnung.append(stroke);
  lastPt = { ...p, t: performance.now() };
});
wand.addEventListener("pointermove", (e) => {
  if (!stroke) return;
  const p = toTafel(e);
  const dx = p.x - lastPt.x;
  const dy = p.y - lastPt.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 1.5) return;
  stroke.setAttribute("d", `${stroke.getAttribute("d")} L${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
  const now = performance.now();
  if (now - lastPt.t > 45) sound.chalk(dist / (now - lastPt.t));
  lastPt = { ...p, t: now };
});
["pointerup", "pointercancel"].forEach((t) => wand.addEventListener(t, () => (stroke = null)));
// Auf Touch-Geräten beim Malen nicht scrollen
tafel.addEventListener("touchstart", (e) => { if (wandOpen) e.preventDefault(); }, { passive: false });
zeichnung.addEventListener("touchstart", (e) => { if (wandOpen) e.preventDefault(); }, { passive: false });

// ---------------------------------------------------------------- Licht
const MOODS = {
  morgen: { wall: "#f6ede1", sky: "#ffe2b6", tint: "#ffb870", tintA: 0.07, dark: 0, led: 0.22, cone: 0, bulb: 0.08, plinth: 0, accent: 0.12, beam: 0.6 },
  kochen: { wall: "#efebe5", sky: "#e3ecf3", tint: "#ffffff", tintA: 0, dark: 0.06, led: 1, cone: 0.85, bulb: 0.9, plinth: 0.25, accent: 0.35, beam: 0.08 },
  abend: { wall: "#dccfbf", sky: "#28344f", tint: "#ff9a3c", tintA: 0.07, dark: 0.55, led: 0.85, cone: 0.9, bulb: 1, plinth: 1, accent: 1, beam: 0 },
};
const MOOD_ORDER = ["morgen", "kochen", "abend"];
const L = { ...MOODS.kochen };
let mood = "kochen";
let dim = 0.85;
const dimmer = $("[data-dimmer]");
const moodBtns = [...document.querySelectorAll("[data-mood]")];

function paintLight() {
  const st = svg.style;
  const k = dim;
  st.setProperty("--wall", L.wall);
  st.setProperty("--sky", L.sky);
  st.setProperty("--tint", L.tint);
  st.setProperty("--tint-a", L.tintA);
  st.setProperty("--dark", (L.dark + (1 - k) * (mood === "abend" ? 0.25 : 0.07)).toFixed(3));
  st.setProperty("--led", (L.led * k).toFixed(3));
  st.setProperty("--cone", (L.cone * k).toFixed(3));
  st.setProperty("--bulb", (L.bulb * (0.3 + 0.7 * k)).toFixed(3));
  st.setProperty("--plinth", (L.plinth * k).toFixed(3));
  st.setProperty("--accent", (L.accent * k).toFixed(3));
  st.setProperty("--beam", L.beam);
  document.documentElement.style.setProperty("--wall", L.wall);
}

function setMood(m, { silent = false } = {}) {
  mood = m;
  moodBtns.forEach((b) => b.setAttribute("aria-checked", String(b.dataset.mood === m)));
  gsap.to(L, { ...MOODS[m], duration: dur(1.4), ease: "power2.inOut", onUpdate: paintLight, onComplete: paintLight, overwrite: true });
  sound.setMood(m);
  if (!silent) {
    interacted();
    sound.klack(0.45);
    discover("licht");
    showCard("licht");
  }
}

moodBtns.forEach((b) => b.addEventListener("click", () => setMood(b.dataset.mood)));
// Pfeiltasten in der Radiogruppe
$(".presets").addEventListener("keydown", (e) => {
  const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
  if (!dir) return;
  e.preventDefault();
  const next = MOOD_ORDER[(MOOD_ORDER.indexOf(mood) + dir + 3) % 3];
  setMood(next);
  moodBtns.find((b) => b.dataset.mood === next).focus();
});
dimmer.addEventListener("input", () => {
  dim = dimmer.value / 100;
  dimmer.setAttribute("aria-valuetext", `${dimmer.value} %`);
  paintLight();
  sound.setAmbientLevel(dim);
  interacted();
  showCard("licht");
});
dimmer.addEventListener("change", () => discover("licht"));

const leiste = S("lichtleiste");
const cycleMood = () => setMood(MOOD_ORDER[(MOOD_ORDER.indexOf(mood) + 1) % 3]);

// ---------------------------------------------------------------- Klick & Tastatur für Toggle-Elemente
function bindToggle(el, fn) {
  el.addEventListener("click", (e) => { if (!e.defaultPrevented) fn(e); });
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(e); }
  });
}
bindToggle(tablet, () => { interacted(); showCard("tablet-halter"); setTablet(!tabOpen); });
tablet.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") { e.preventDefault(); interacted(); showCard("tablet-halter"); setTablet(true); }
  if (e.key === "ArrowDown") { e.preventDefault(); setTablet(false); }
});
bindToggle(leiste, () => cycleMood());
wand.addEventListener("click", (e) => {
  if (!wandOpen) { interacted(); setWand(true); }
  else if (e.target.closest("#spielwand-klappe")) setWand(false);
});
wand.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); interacted(); setWand(!wandOpen); }
});

// Feature-Leiste: bedient das Element und holt es auf Mobil ins Bild
function bringIntoView(el) {
  if (scroller.scrollWidth <= scroller.clientWidth) return;
  const r = el.getBoundingClientRect();
  const sr = scroller.getBoundingClientRect();
  const target = scroller.scrollLeft + (r.left + r.width / 2) - (sr.left + sr.width / 2);
  scroller.scrollTo({ left: target, behavior: reduce() ? "auto" : "smooth" });
}

function dockAction(id) {
  interacted();
  const el = id === "licht" ? leiste : S(id);
  bringIntoView(el);
  ({
    "schublade-unten": () => schublade.toggle(),
    "staubsauger-fach": () => fach.toggle(),
    couch: () => couch.toggle(),
    "tablet-halter": () => { showCard("tablet-halter"); setTablet(!tabOpen); },
    spielwand: () => setWand(!wandOpen),
    licht: () => cycleMood(),
  })[id]();
}

// ---------------------------------------------------------------- Mikro-Parallax
const finePointer = matchMedia("(pointer: fine)").matches;
const layers = [...svg.querySelectorAll("[data-depth]")].map((g) => ({
  d: +g.dataset.depth,
  x: gsap.quickTo(g, "x", { duration: 0.9, ease: "power3" }),
  y: gsap.quickTo(g, "y", { duration: 0.9, ease: "power3" }),
}));
let holding = false;
svg.addEventListener("pointerdown", () => (holding = true));
addEventListener("pointerup", () => (holding = false));
stage.addEventListener("pointermove", (e) => {
  if (!finePointer || reduce() || holding) return;
  const r = svg.getBoundingClientRect();
  const nx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
  const ny = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
  layers.forEach((l) => { l.x(-nx * 12 * l.d); l.y(-ny * 6 * l.d); });
});
stage.addEventListener("pointerleave", () => layers.forEach((l) => { l.x(0); l.y(0); }));

// ---------------------------------------------------------------- Werkzeuge
const soundBtn = $("[data-sound]");
soundBtn.addEventListener("click", async () => {
  if (sound.enabled) sound.disable();
  else {
    sound.mood = mood;
    await sound.enable();
    sound.setAmbientLevel(dim);
    sound.klack(0.5);
  }
  const on = sound.enabled;
  soundBtn.setAttribute("aria-pressed", String(on));
  soundBtn.querySelector("use").setAttribute("href", on ? "#i-sound-on" : "#i-sound-off");
  $("[data-sound-label]").textContent = on ? "Ton an" : "Ton aus";
});

const hintsBtn = $("[data-hints]");
hintsBtn.addEventListener("click", () => {
  const on = hintsBtn.getAttribute("aria-pressed") !== "true";
  hintsBtn.setAttribute("aria-pressed", String(on));
  $("[data-hints-label]").textContent = on ? "Hinweise an" : "Hinweise aus";
  svg.classList.toggle("hints-off", !on);
});

$("[data-reset]").addEventListener("click", () => {
  schublade.reset();
  fach.reset();
  couch.reset();
  setTablet(false);
  setWand(false);
  gsap.to([...zeichnung.children], { opacity: 0, duration: dur(0.3), onComplete: () => (zeichnung.innerHTML = "") });
  timerLeft = 12 * 60;
  renderTimer();
  dim = 0.85;
  dimmer.value = 85;
  setMood("kochen", { silent: true });
  cardId = null;
  $("[data-fc-kicker]").textContent = "Zurückgesetzt";
  $("[data-fc-title]").textContent = "Alles wieder zu.";
  $("[data-fc-text]").textContent = "Die Szene steht wieder auf Anfang. Dein Fortschritt bleibt erhalten.";
  $("[data-fc-note]").textContent = "";
  $("[data-fc-actions]").innerHTML = "";
});

$("[data-intro-close]").addEventListener("click", () => {
  hideIntro();
  S("schublade-unten").focus({ preventScroll: true });
});

// ---------------------------------------------------------------- Belohnung
const reward = $("[data-reward]");
function celebrate() {
  sound.fanfare();
  // Licht-Animation: alle Leuchten pulsieren zweimal
  gsap.fromTo(svg.querySelectorAll(".lights"), { opacity: 1 }, { opacity: 0.25, duration: dur(0.22), yoyo: true, repeat: 3, ease: "sine.inOut" });
  reward.hidden = false;
  const confetti = reward.querySelector(".confetti");
  confetti.innerHTML = "";
  if (!reduce()) {
    const colors = ["#e30613", "#3c3c3c", "#f3c13a", "#c99a6a", "#9fd0f0"];
    for (let i = 0; i < 28; i++) {
      const c = document.createElement("i");
      c.style.left = `${Math.random() * 100}%`;
      c.style.background = colors[i % colors.length];
      c.style.animationDelay = `${Math.random() * 0.6}s`;
      confetti.append(c);
    }
  }
  gsap.fromTo(reward.querySelector(".reward-card"), { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: dur(0.5), ease: "back.out(1.6)" });
  reward.querySelector("#reward-title").focus({ preventScroll: true });
  const r = stage.getBoundingClientRect();
  if (r.top < 0 || r.bottom > innerHeight) stage.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "center" });
}
function closeReward() {
  reward.hidden = true;
  $("[data-reset]").focus({ preventScroll: true });
}
$("[data-reward-close]").addEventListener("click", closeReward);
reward.addEventListener("click", (e) => { if (e.target === reward) closeReward(); });

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!reward.hidden) closeReward();
    else if (!intro.hidden && !intro.classList.contains("is-gone")) hideIntro();
    else if (wandOpen) setWand(false);
  }
  if (e.key === "Tab" && !reward.hidden) {
    const f = [...reward.querySelectorAll("a, button")];
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
    else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
  }
});

// ---------------------------------------------------------------- Start
paintLight();
sound.mood = mood;
// Mobil: Szene so scrollen, dass Schublade und Insel im Bild sind
requestAnimationFrame(() => {
  if (scroller.scrollWidth > scroller.clientWidth) scroller.scrollLeft = (scroller.scrollWidth - scroller.clientWidth) * 0.42;
});
window.__koje = { schublade, fach, couch, setTablet, setWand, setMood, discovered };
