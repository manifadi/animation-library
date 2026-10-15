import { sceneMarkup } from "../../koje-3-live-ausprobieren/js/scene.js?v=20261015";
import { cameraPose, clamp, smootherstep } from "./motion.js?v=20261015";

const experience = document.querySelector(".experience");
const stage = document.querySelector("[data-stage]");
const scenePlane = document.querySelector("[data-scene-plane]");
const featureCard = document.querySelector("[data-feature-card]");
const effect = document.querySelector("[data-effect]");
const title = document.querySelector("[data-title]");
const description = document.querySelector("[data-description]");
const number = document.querySelector("[data-feature-number]");
const cameraLabel = document.querySelector("[data-camera-label]");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const hotspots = document.querySelector("[data-hotspots]");
const introCopy = document.querySelector("[data-intro-copy]");
let returnFocus = null;
let activeKey = null;
let phase = "idle";
let progress = 0;
let frame = 0;
let motionTarget = 0;
let geometry;
let hasEnteredTour = false;

// Separate actual depth planes, sharing a camera and a stable transform origin.
const template = document.createElement("template");
template.innerHTML = sceneMarkup;
const source = template.content.querySelector("svg");
const layers = [
  { id: "layer-back", lights: "0.12", depth: -75 },
  { id: "layer-mid", lights: "0.4", depth: 0 },
  { id: "layer-front", lights: "1", depth: 100 },
].map(({ id, lights, depth }) => {
  const element = document.createElement("div");
  element.className = "scene-layer";
  const svg = source.cloneNode(false);
  svg.removeAttribute("role");
  svg.removeAttribute("aria-label");
  svg.setAttribute("aria-hidden", "true");
  svg.append(source.querySelector("defs").cloneNode(true), source.querySelector(`#${id}`).cloneNode(true));
  svg.append(source.querySelector(`.lights[data-depth="${lights}"]`).cloneNode(true));
  // Wand großzügig verlängern: Auf hohen Handy-Screens und bei schrägen
  // Kamerawinkeln sonst sichtbare Kante oberhalb bzw. seitlich der Küche.
  svg.querySelectorAll(".sc-wall").forEach((wall) => {
    wall.setAttribute("x", "-4000");
    wall.setAttribute("width", "9200");
    wall.setAttribute("y", "-4000");
    wall.setAttribute("height", "4700");
  });
  const ids = new Map();
  svg.querySelectorAll("[id]").forEach((node) => {
    ids.set(node.id, `${id}-${node.id}`);
    node.id = ids.get(node.id);
  });
  svg.querySelectorAll("*").forEach((node) => {
    node.removeAttribute("tabindex");
    node.removeAttribute("role");
    for (const attribute of [...node.attributes]) {
      const value = attribute.value.replace(/url\(#([^)]+)\)/g, (_, ref) => `url(#${ids.get(ref) || ref})`);
      if (value !== attribute.value) node.setAttribute(attribute.name, value);
    }
  });
  element.append(svg);
  scenePlane.append(element);
  return { element, depth };
});
scenePlane.append(effect);
scenePlane.inert = true;
featureCard.inert = true;
hotspots.inert = true;

const features = {
  schublade: {
    number: "01", title: "Leise zu. Ganz ohne Knall.",
    description: "Alle Schubladen schließen sanft und gedämpft. Ein leichter Stoß genügt, den Rest erledigt die Dämpfung – kein Klappern, auch wenn die Kinder schon schlafen.",
    focus: [39, 79], effect: "effect-drawer", label: "Schublade · gleitet leise zu",
    view: [18, 8, 1.8, 0],
  },
  heisswasser: {
    number: "02", title: "Kochend heiß. Auf Knopfdruck.",
    description: "Die Armatur liefert heißes Wasser direkt aus dem Hahn. Für Tee, Pasta oder zum Blanchieren – ohne Wasserkocher und ohne Warten.",
    focus: [52, 53], effect: "effect-water", label: "Armatur · heißes Wasser",
    view: [-16, 7, 2.05, 0],
  },
  ofen: {
    number: "03", title: "Knusprig wie beim Italiener.",
    description: "Der Backofen sitzt auf bequemer Arbeitshöhe und bringt Pizza, Brot und Braten auf den Punkt. Rein, warten, staunen.",
    focus: [92, 45], effect: "effect-oven", label: "Backofen · heizt auf",
    view: [-24, -3, 1.85, 0],
  },
  licht: {
    number: "04", title: "Licht in jeder Farbe.",
    description: "LED-Bänder tauchen die Küche in genau die Stimmung, die gerade passt: warmweiß zum Kochen, bunt für die Party.",
    focus: [72, 37], effect: "effect-light", label: "LED-Licht · wechselt die Farbe",
    view: [14, -7, 1.3, 0],
  },
  futternapf: {
    number: "05", title: "Auch der Hund hat seinen Platz.",
    description: "Im Sockel versteckt sich eine Schublade mit Futter- und Wassernapf. Ausziehen, füttern, zuschieben – kein Napf mehr im Weg, keine Stolperfalle.",
    focus: [92, 87], effect: "effect-napf", label: "Sockel · Napf fährt aus",
    view: [-22, 11, 1.95, 0],
  },
  spielwand: {
    number: "06", title: "Hier darf die Küche mitspielen.",
    description: "Die Wohnseite der Insel wird zur Fläche für kleine Ideen. Klappe auf, Stifte raus – und schon wird aus Warten gemeinsame Zeit.",
    focus: [60, 82], effect: "effect-play", label: "Spielwand · klappt auf",
    view: [-20, 4, 1.7, 100],
  },
  zapfhahn: {
    number: "07", title: "Ein Zapfhahn. Mitten in der Küche.",
    description: "Ein Handgriff, ein frisch gezapftes Getränk. Der Zapfhahn sitzt direkt in der Arbeitsfläche – für den Feierabend und für Gäste, die gerne noch bleiben.",
    focus: [53, 67], effect: "effect-beer", label: "Zapfhahn · frisch gezapft",
    view: [-18, 6, 1.75, 100],
  },
  roboter: {
    number: "08", title: "Der Saugroboter wohnt im Sockel.",
    description: "Unsichtbar verstaut und schnell wieder unterwegs: Die Garage im Küchensockel lässt den Roboter direkt unter der Insel hervorkommen.",
    focus: [55, 93], effect: "effect-robot", label: "Sockel-Garage · Roboter fährt los",
    view: [-17, -6, 1.85, 100],
  },
  couch: {
    number: "09", title: "Sitzen, wo gekocht wird.",
    description: "Aus der ruhigen Nische fährt im Handumdrehen eine Couch heraus. Für den Kaffee zwischendurch, die Hausaufgaben oder Gäste, die beim Kochen dabei sein wollen.",
    focus: [17, 73], effect: "effect-couch", label: "Couch · fährt aus",
    view: [21, 4, 1.65, 0],
  },
};

let illuminated = false;
function illuminate() {
  if (illuminated) return;
  illuminated = true;
  const cover = document.querySelector("[data-loading-cover]");
  window.setTimeout(() => experience.classList.add("is-lit"), motionPreference.matches ? 0 : 400);
  window.setTimeout(() => cover.classList.add("is-off"), motionPreference.matches ? 0 : 800);
}

function dismissIntro() {
  const dismissed = hasEnteredTour || phase !== "idle" || window.scrollY - experience.offsetTop > 24;
  experience.classList.toggle("has-scrolled", dismissed);
  introCopy.inert = dismissed;
  hotspots.inert = !dismissed || phase !== "idle";
}

function measureScene() {
  geometry = {
    width: scenePlane.offsetWidth,
    height: scenePlane.offsetHeight,
    top: scenePlane.offsetTop,
    stageWidth: stage.clientWidth,
    stageHeight: stage.clientHeight,
    mobile: window.matchMedia("(max-width: 700px)").matches,
  };
}

function renderCamera() {
  if (!activeKey) return;
  const feature = features[activeKey];
  const pose = cameraPose(feature, progress, geometry);
  scenePlane.style.transform = `translateX(-50%) translate3d(${pose.x}px, ${pose.y}px, 0) perspective(${pose.perspective}px) rotateX(${pose.pitch}deg) rotateY(${pose.yaw}deg) rotateZ(${pose.roll}deg) scale(${pose.scale})`;
  for (const layer of layers) {
    layer.element.style.transform = `translateZ(${layer.depth * pose.unit * progress}px)`;
  }
  effect.style.transform = `translateZ(${feature.view[3] * pose.unit * progress + .1}px)`;
  effect.style.opacity = smootherstep(progress / .55);
  effect.style.setProperty("--action", pose.action);
  effect.style.setProperty("--action-offset", `${(1 - pose.action) * 28}px`);
  effect.style.setProperty("--action-travel", `${(1 - pose.action) * -70}px`);
  effect.style.setProperty("--action-tilt", `${(1 - pose.action) * -60}deg`);
  effect.style.setProperty("--secondary", pose.secondary);
  effect.style.setProperty("--secondary-offset", `${(1 - pose.secondary) * 16}px`);
  effect.style.setProperty("--draw-right", `${(1 - pose.secondary) * 100}%`);
  experience.style.setProperty("--camera-progress", progress);
}

function finishCamera(target) {
  frame = 0;
  experience.classList.remove("is-moving");
  if (target === 1) {
    phase = "active";
    experience.classList.add("is-arrived");
    featureCard.classList.add("is-visible");
    featureCard.inert = false;
    featureCard.querySelector("[data-close]").focus({ preventScroll: true });
  } else {
    phase = "idle";
    activeKey = null;
    experience.classList.remove("is-focused", "is-returning", "is-arrived");
    delete experience.dataset.activeFeature;
    effect.className = "feature-effect";
    featureCard.hidden = true;
    document.querySelectorAll(".hotspot").forEach((button) => button.setAttribute("aria-pressed", "false"));
    dismissIntro();
    if (!hotspots.inert) returnFocus?.focus({ preventScroll: true });
  }
}

function animateCamera(target) {
  cancelAnimationFrame(frame);
  motionTarget = target;
  const from = progress;
  const duration = motionPreference.matches ? 0 : (target ? 3000 : 2600) * Math.max(.35, Math.abs(target - from));
  measureScene();
  const started = performance.now();
  const tick = (now) => {
    const elapsed = duration ? clamp((now - started) / duration) : 1;
    progress = from + (target - from) * smootherstep(elapsed);
    renderCamera();
    if (elapsed < 1) frame = requestAnimationFrame(tick);
    else finishCamera(target);
  };
  frame = requestAnimationFrame(tick);
}

function openFeature(key, trigger) {
  const feature = features[key];
  if (!feature || phase !== "idle") return;
  if (Math.abs(stage.getBoundingClientRect().top) > 2) {
    window.scrollTo({ top: experience.offsetTop + 64, behavior: motionPreference.matches ? "instant" : "smooth" });
  }
  returnFocus = trigger || document.activeElement;
  hasEnteredTour = true;
  activeKey = key;
  phase = "opening";
  experience.dataset.activeFeature = key;
  experience.classList.add("has-scrolled", "is-focused", "is-moving");
  document.querySelectorAll(".hotspot").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.feature === key)));
  title.textContent = feature.title;
  description.textContent = feature.description;
  number.textContent = feature.number;
  cameraLabel.textContent = feature.label;
  effect.className = `feature-effect ${feature.effect}`;
  featureCard.hidden = false;
  featureCard.inert = true;
  dismissIntro();
  document.querySelector(".tour-return").focus({ preventScroll: true });
  animateCamera(1);
}

function closeFeature() {
  if (phase !== "opening" && phase !== "active") return;
  phase = "closing";
  featureCard.inert = true;
  featureCard.classList.remove("is-visible");
  experience.classList.remove("is-arrived");
  experience.classList.add("is-returning", "is-moving");
  animateCamera(0);
}

document.querySelector("[data-discover]").addEventListener("click", () => {
  hasEnteredTour = true;
  dismissIntro();
  window.scrollTo({ top: experience.offsetTop + 64, behavior: motionPreference.matches ? "instant" : "smooth" });
});

document.querySelectorAll(".hotspot").forEach((button) => {
  button.addEventListener("click", () => openFeature(button.dataset.feature, button));
});
document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", closeFeature));
window.addEventListener("scroll", dismissIntro, { passive: true });
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeFeature();
});
new ResizeObserver(() => { measureScene(); renderCamera(); }).observe(stage);
motionPreference.addEventListener("change", () => {
  if (phase === "opening" || phase === "closing") animateCamera(motionTarget);
});
if (document.readyState === "complete") illuminate();
else window.addEventListener("load", illuminate, { once: true });
// Sicherheitsnetz: Hängt ein Asset (z. B. Webfont über langsames Netz), geht das Licht trotzdem an.
window.setTimeout(illuminate, 3500);
dismissIntro();
