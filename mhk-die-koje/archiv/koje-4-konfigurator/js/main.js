// ---------------------------------------------------------------------------
// Meine Koje · Konfigurator
// Daten: data/features.json · Store: js/store.js · Regeln: js/rules.js
// Vorschau: js/preview.js · Zusammenfassung/Export: js/summary.js
// ---------------------------------------------------------------------------
import { gsap } from "gsap";
import { createStore, encodeConfig, decodeConfig } from "./store.js";
import { applyToggle, describeRules } from "./rules.js";
import { previewMarkup, createPreview } from "./preview.js";
import { cloneScene, exportCard } from "./summary.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMQ = matchMedia("(prefers-reduced-motion: reduce)");
const reduce = () => reduceMQ.matches;
const STORAGE_KEY = "koje4:last";

const storage = {
  get() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; } },
  set(v) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)); } catch { /* ohne Speicher weiter */ } },
};

const data = await fetch("data/features.json", { cache: "no-store" }).then((r) => {
  if (!r.ok) throw new Error(`features.json: HTTP ${r.status}`);
  return r.json();
});
const { features, categories } = data;
const byId = Object.fromEntries(features.map((f) => [f.id, f]));
const TOTAL = features.length;

function defaults() {
  return {
    active: Object.fromEntries(features.map((f) => [f.id, !!f.default])),
    variants: Object.fromEntries(features.filter((f) => f.variants).map((f) => [f.id, f.defaultVariant || f.variants[0].id])),
  };
}

// ---------------------------------------------------------------- Startzustand
const fromHash = decodeConfig(location.hash, features);
const stored = storage.get();
const store = createStore({
  ...(fromHash || defaults()),
  profile: fromHash?.profile || null,
  view: "gesamt",
  focus: null,
  notice: null,
});

// ---------------------------------------------------------------- Vorschau
$("[data-preview]").innerHTML = previewMarkup;
const svg = $(".preview-svg");
const preview = createPreview(svg, features, { reduceMotion: reduce });
preview.render(store.get(), null);

// ---------------------------------------------------------------- Optionen rendern
const catHost = $("[data-categories]");
categories.forEach((cat, ci) => {
  const items = features.filter((f) => f.category === cat.id);
  if (!items.length) return;
  const details = document.createElement("details");
  details.className = "cat";
  details.dataset.cat = cat.id;
  details.open = ci < 2 || matchMedia("(min-width: 900px)").matches;
  details.innerHTML = `
    <summary><h2 class="serif">${cat.name}</h2><span class="cat-meta"><span data-cat-count></span><svg aria-hidden="true"><use href="#i-chevron"/></svg></span></summary>
    <ul>${items.map((f) => `
      <li class="feat" data-feat="${f.id}">
        <div class="feat-main">
          <input type="checkbox" role="switch" class="switch" id="sw-${f.id}" aria-describedby="short-${f.id}" />
          <label class="feat-label" for="sw-${f.id}">
            <span class="feat-name">${f.name}</span>${f.placeholder?.includes("Platzhalter-Feature") ? '<span class="badge">[Platzhalter]</span>' : ""}
            <span class="feat-short" id="short-${f.id}">${f.short}</span>
          </label>
          <button type="button" class="info-btn" data-info-id="${f.id}" aria-label="Mehr zu ${f.name}"><svg width="20" height="20" aria-hidden="true"><use href="#i-info"/></svg></button>
        </div>
        ${f.variants ? `<fieldset class="variants"><legend>Variante</legend>${f.variants.map((v) => `
          <label class="variant"><input type="radio" name="var-${f.id}" value="${v.id}" /><span>${v.name}</span></label>`).join("")}</fieldset>` : ""}
        ${describeRules(f, features) ? `<p class="feat-rule">${describeRules(f, features)}</p>` : ""}
        <p class="feat-auto" data-auto></p>
      </li>`).join("")}
    </ul>`;
  catHost.append(details);
});

// ---------------------------------------------------------------- Aktionen
let sound = null;
function click() {
  if (!sound) return;
  const t = sound.currentTime;
  const o = sound.createOscillator();
  const g = sound.createGain();
  o.frequency.setValueAtTime(1400, t);
  o.frequency.exponentialRampToValueAtTime(500, t + 0.04);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.12, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
  o.connect(g).connect(sound.destination);
  o.start(t);
  o.stop(t + 0.08);
}

function snapshot(s) {
  return { active: { ...s.active }, variants: { ...s.variants } };
}

function toggle(id, on) {
  const s = store.get();
  const res = applyToggle(features, s.active, id, on);
  click();
  store.set({ active: res.active, focus: id, notice: { main: { id, on }, messages: res.messages, undo: snapshot(s) } }, { changed: res.changed });
}

function setVariant(id, v) {
  const s = store.get();
  const undo = snapshot(s);
  let active = s.active;
  let messages = [];
  if (!active[id]) ({ active, messages } = applyToggle(features, active, id, true));
  click();
  store.set({ active, variants: { ...s.variants, [id]: v }, focus: id, notice: { main: { id, variant: v }, messages, undo } });
}

function undo() {
  const n = store.get().notice;
  if (!n?.undo) return;
  store.set({ ...n.undo, notice: { main: null, messages: [], info: "Rückgängig gemacht." } });
}

catHost.addEventListener("change", (e) => {
  const t = e.target;
  const li = t.closest("[data-feat]");
  if (!li) return;
  if (t.classList.contains("switch")) toggle(li.dataset.feat, t.checked);
  if (t.type === "radio") setVariant(li.dataset.feat, t.value);
});
$("[data-undo]").addEventListener("click", undo);

// Ansicht
$$("[data-view]").forEach((b) => b.addEventListener("click", () => store.set({ view: b.dataset.view })));

// ---------------------------------------------------------------- Anzeige aktualisieren
const counter = { n: 0 };
const countEl = $("[data-count]");
$("[data-total]").textContent = TOTAL;

function updateOptions(s) {
  for (const f of features) {
    const li = $(`[data-feat="${f.id}"]`);
    const sw = $(".switch", li);
    sw.checked = !!s.active[f.id];
    li.classList.toggle("is-on", !!s.active[f.id]);
    if (f.variants) {
      const fs = $(".variants", li);
      $$("input", fs).forEach((r) => (r.checked = r.value === s.variants[f.id]));
    }
  }
  $$(".cat").forEach((cat) => {
    const ids = features.filter((f) => f.category === cat.dataset.cat).map((f) => f.id);
    $("[data-cat-count]", cat).textContent = `${ids.filter((id) => s.active[id]).length}/${ids.length} aktiv`;
  });
}

function updateProgress(s) {
  const n = features.filter((f) => s.active[f.id]).length;
  gsap.to(counter, { n, duration: reduce() ? 0 : 0.45, ease: "power2.out", onUpdate: () => (countEl.textContent = Math.round(counter.n)) });
  $("[data-bar]").style.setProperty("--p", n / TOTAL);
}

function updateNotice(s, prev) {
  const box = $("[data-notice]");
  const n = s.notice;
  $$("[data-auto]").forEach((p) => (p.textContent = ""));
  if (!n || (!n.messages?.length && !n.info)) {
    box.hidden = true;
    return;
  }
  box.hidden = false;
  $(".notice-title", box).textContent = n.info ? "Hinweis" : "Automatisch angepasst";
  $("[data-notice-list]").innerHTML = n.info ? `<li>${n.info}</li>` : n.messages.map((m) => `<li>${m.text}</li>`).join("");
  $("[data-undo]").hidden = !n.undo;
  for (const m of n.messages || []) {
    const li = $(`[data-feat="${m.id}"]`);
    $("[data-auto]", li).textContent = `${m.on ? "Automatisch eingeschaltet" : "Automatisch ausgeschaltet"} – siehe Hinweis oben.`;
    li.classList.remove("is-flash");
    void li.offsetWidth;
    li.classList.add("is-flash");
    li.closest("details").open = true;
  }
  if (n !== prev?.notice && !reduce()) gsap.fromTo(box, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.35 });
}

function announce(s) {
  const n = s.notice;
  if (!n?.main) return;
  const f = byId[n.main.id];
  let text = n.main.variant ? `${f.name}: ${f.variants.find((v) => v.id === n.main.variant).name} gewählt.` : `${f.name} ${n.main.on ? "eingeschaltet" : "ausgeschaltet"}.`;
  if (n.messages?.length) text += " " + n.messages.map((m) => m.text).join(" ");
  const n2 = features.filter((x) => s.active[x.id]).length;
  $("[data-live]").textContent = `${text} ${n2} von ${TOTAL} Features gewählt.`;
}

function updateViewButtons(s) {
  const detail = $('[data-view="detail"]');
  detail.disabled = !s.focus;
  $("[data-detail-label]").textContent = s.focus ? `Detail: ${byId[s.focus].name}` : "Detail";
  $$("[data-view]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === s.view)));
}

function personalLine(profile) {
  if (!profile) return "Deine Auswahl – jederzeit änderbar.";
  const who = { ich: "Für dich, wenn du vor allem selbst kochst", zwei: "Für zwei, die gern zusammen kochen", familie: "Für eine Familie, in der alle mitkochen" }[profile.kochen] || "Für deinen Alltag";
  const extras = [];
  if (profile.kinder === "ja") extras.push("mit Platz zum Spielen");
  if (profile.homeoffice === "oft" || profile.homeoffice === "manchmal") extras.push("mit einem Arbeitsplatz für zu Hause");
  return `${who}${extras.length ? ` – ${extras.join(" und ")}` : ""}.`;
}

function summaryItems(s) {
  return features.filter((f) => s.active[f.id]).map((f) => {
    const v = f.variants?.find((x) => x.id === s.variants[f.id]);
    return { f, label: v ? `${f.name} (${v.name})` : f.name };
  });
}

let summaryTimer;
function updateSummary(s) {
  const items = summaryItems(s);
  $("[data-summary-line]").textContent = personalLine(s.profile);
  $("[data-summary-count]").textContent = `${items.length} von ${TOTAL} Features gewählt`;
  $("[data-summary-list]").innerHTML = items.length
    ? items.map(({ f, label }) => `<li><svg aria-hidden="true"><use href="#i-check"/></svg><span>${label}${f.placeholder?.includes("Platzhalter-Feature") ? ' <span class="muted">[Platzhalter]</span>' : ""}</span></li>`).join("")
    : '<li class="muted">Noch keine Features gewählt.</li>';
  // Vorschaubild nach den Animationen klonen
  clearTimeout(summaryTimer);
  summaryTimer = setTimeout(() => {
    const fig = $("[data-summary-figure]");
    fig.innerHTML = "";
    fig.append(cloneScene(svg));
  }, reduce() ? 50 : 1900);
}

let lastHash = "";
function persist(s) {
  const hash = encodeConfig(s, features);
  lastHash = `#${hash}`;
  if (location.hash !== lastHash) history.replaceState(null, "", lastHash);
  storage.set({ active: s.active, variants: s.variants, profile: s.profile });
}

store.subscribe((s, prev) => {
  if (s.active !== prev.active || s.variants !== prev.variants) preview.render(s, prev);
  if (s.view !== prev.view || (s.view === "detail" && s.focus !== prev.focus)) preview.setView(s.view, s.focus);
  updateOptions(s);
  updateProgress(s);
  updateNotice(s, prev);
  updateViewButtons(s);
  announce(s);
  updateSummary(s);
  persist(s);
});

// Erstanzeige
const init = store.get();
updateOptions(init);
updateProgress(init);
updateViewButtons(init);
updateSummary(init);
persist(init);

// Geteilter Link wird während der Sitzung geändert (z. B. eingefügt)
addEventListener("hashchange", () => {
  if (location.hash === lastHash) return;
  const cfg = decodeConfig(location.hash, features);
  if (cfg) store.set({ active: cfg.active, variants: cfg.variants, profile: cfg.profile ?? store.get().profile, notice: { main: null, messages: [], info: "Konfiguration aus dem Link geladen." } });
});

// ---------------------------------------------------------------- Info-Modal
const info = $("[data-info]");
catHost.addEventListener("click", (e) => {
  const b = e.target.closest("[data-info-id]");
  if (!b) return;
  const f = byId[b.dataset.infoId];
  $("[data-info-cat]").textContent = categories.find((c) => c.id === f.category)?.name || "";
  $("[data-info-title]").textContent = f.name;
  $("[data-info-text]").textContent = f.detail;
  $("[data-info-rules]").textContent = describeRules(f, features);
  $("[data-info-note]").textContent = f.placeholder || "";
  info.showModal();
});
$("[data-info-close]").addEventListener("click", () => info.close());
info.addEventListener("click", (e) => { if (e.target === info) info.close(); });

// ---------------------------------------------------------------- Einstiegsfragen
const intro = $("[data-intro]");
const questions = data.profile.questions;
let step = 0;
let answers = {};

function renderStep() {
  const q = questions[step];
  $("[data-intro-step]").textContent = `Frage ${step + 1} von ${questions.length}`;
  $("[data-intro-dots]").innerHTML = questions.map((_, i) => `<i class="${i <= step ? "is-on" : ""}"></i>`).join("");
  $("[data-intro-q]").textContent = q.question;
  $("[data-intro-options]").innerHTML = q.options.map((o) => `
    <button type="button" class="intro-option" role="radio" aria-checked="${answers[q.id] === o.id}" data-answer="${o.id}"><span class="radio"></span>${o.label}</button>`).join("");
  $("[data-intro-back]").hidden = step === 0;
  $("[data-intro-resume]").hidden = !(step === 0 && stored && !fromHash);
  ($("[data-intro-options] [aria-checked='true']") || $("[data-intro-options] button")).focus();
}

function openIntro() {
  step = 0;
  answers = { ...(store.get().profile || {}) };
  renderStep();
  intro.showModal();
}

function applyProfile(profile) {
  let { active, variants } = defaults();
  const messages = [];
  for (const [q, a] of Object.entries(profile)) {
    const preset = data.profile.presets[`${q}.${a}`];
    if (!preset) continue;
    for (const id of preset.on || []) {
      if (!active[id]) ({ active } = applyToggle(features, active, id, true));
    }
    variants = { ...variants, ...(preset.variants || {}) };
  }
  store.set({ active, variants, profile, focus: null, view: "gesamt", notice: { main: null, messages, info: "Vorschlag anhand deiner Antworten – alles frei änderbar.", undo: snapshot(store.get()) } });
}

$("[data-intro-options]").addEventListener("click", (e) => {
  const b = e.target.closest("[data-answer]");
  if (!b) return;
  answers[questions[step].id] = b.dataset.answer;
  $$("[data-answer]").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
  setTimeout(() => {
    if (step < questions.length - 1) { step++; renderStep(); }
    else { intro.close(); applyProfile(answers); }
  }, reduce() ? 0 : 280);
});
$("[data-intro-options]").addEventListener("keydown", (e) => {
  const opts = $$("[data-answer]");
  const i = opts.indexOf(document.activeElement);
  const dir = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
  if (dir && i > -1) { e.preventDefault(); opts[(i + dir + opts.length) % opts.length].focus(); }
});
$("[data-intro-back]").addEventListener("click", () => { step = Math.max(0, step - 1); renderStep(); });
$("[data-intro-skip]").addEventListener("click", () => intro.close());
$("[data-intro-resume]").addEventListener("click", () => {
  intro.close();
  store.set({ ...stored, notice: { main: null, messages: [], info: "Deine zuletzt verwendete Koje wurde geladen." } });
});
$("[data-open-intro]").addEventListener("click", openIntro);
if (!fromHash) openIntro();

// ---------------------------------------------------------------- Teilen, Bild, Ton
const status = $("[data-action-status]");
const flashStatus = (t) => { status.textContent = t; setTimeout(() => (status.textContent = ""), 3000); };

$("[data-share]").addEventListener("click", async () => {
  const url = location.href;
  if (navigator.share && matchMedia("(pointer: coarse)").matches) {
    try { await navigator.share({ title: "Meine Koje", text: personalLine(store.get().profile), url }); return; } catch { /* abgebrochen */ }
  }
  try {
    await navigator.clipboard.writeText(url);
    flashStatus("Link kopiert ✓");
  } catch {
    flashStatus("Kopieren nicht möglich – Link steht in der Adresszeile.");
  }
});

$("[data-download]").addEventListener("click", async () => {
  flashStatus("Bild wird erstellt …");
  const s = store.get();
  try {
    const blob = await exportCard({ svg, title: "Meine Koje", line: personalLine(s.profile), items: summaryItems(s).map((i) => i.label), total: TOTAL, url: location.href });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "meine-koje.png";
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    flashStatus("Bild gespeichert ✓");
  } catch (err) {
    console.error(err);
    flashStatus("Bild konnte nicht erstellt werden.");
  }
});

$("[data-sound]").addEventListener("click", (e) => {
  const b = e.currentTarget;
  if (sound) { sound.close(); sound = null; }
  else { const AC = window.AudioContext || window.webkitAudioContext; if (AC) sound = new AC(); click(); }
  b.setAttribute("aria-pressed", String(!!sound));
  b.setAttribute("aria-label", sound ? "Klick-Sound ausschalten" : "Klick-Sound einschalten");
  $("use", b).setAttribute("href", sound ? "#i-sound-on" : "#i-sound-off");
});

// ---------------------------------------------------------------- Demo-Formular (sendet nichts)
const form = $("[data-lead]");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const el = form.elements;
  const checks = {
    name: el.namedItem("name").value.trim().length > 1,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.namedItem("email").value.trim()),
    studio: !!el.namedItem("studio").value,
    privacy: el.namedItem("privacy").checked,
  };
  let first = null;
  for (const [k, ok] of Object.entries(checks)) {
    const input = el.namedItem(k);
    const field = input.closest(".field");
    field.classList.toggle("has-error", !ok);
    input.setAttribute("aria-invalid", String(!ok));
    const err = $(`[data-error-for="${k}"]`, form);
    err.id = `err-${k}`;
    if (!ok) input.setAttribute("aria-describedby", err.id); else input.removeAttribute("aria-describedby");
    if (!ok && !first) first = input;
  }
  if (first) { first.focus(); return; }
  // Klickdummy: es wird bewusst NICHTS gesendet.
  const ok = $("[data-lead-success]");
  ok.hidden = false;
  ok.focus();
  form.querySelector("[type=submit]").disabled = true;
});

window.__koje4 = { store, toggle, setVariant, features };
