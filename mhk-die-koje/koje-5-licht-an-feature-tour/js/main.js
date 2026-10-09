import { sceneMarkup } from "../../koje-3-live-ausprobieren/js/scene.js";
import { cameraPose, clamp, smootherstep } from "./motion.js";

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
  zapfhahn: {
    number: "01", title: "Ein Zapfhahn. Mitten in der Küche.",
    description: "Ein Handgriff, ein frisch gezapftes Getränk. Der Zapfhahn fährt sanft aus der Arbeitsfläche – für den Feierabend und für Gäste, die gerne noch bleiben.",
    focus: [53, 67], effect: "effect-beer", label: "Zapfhahn · fährt aus",
    view: [-18, 6, 1.75, 100],
  },
  couch: {
    number: "02", title: "Noch ein Platz am Küchentisch.",
    description: "Aus der ruhigen Nische wird im Handumdrehen ein gemütlicher Sitzplatz. Die Kamera fährt zur Wohnseite und zeigt, wie die Sitzfläche herauskommt.",
    focus: [17, 73], effect: "effect-couch", label: "Sitzplatz · fährt aus",
    view: [21, 4, 1.65, 0],
  },
  tablet: {
    number: "03", title: "Das Rezept fährt mit.",
    description: "Die Halterung hebt sich aus der Arbeitsplatte und bringt Tablet oder Smartphone genau dorthin, wo du sie beim Kochen brauchst.",
    focus: [64, 58], effect: "effect-tablet", label: "Tablet-Halterung · fährt hoch",
    view: [-19, -4, 1.8, 0],
  },
  schublade: {
    number: "04", title: "Alles griffbereit. Und wieder weg.",
    description: "Ein kurzer Blick in die Schublade zeigt: Auch in der Insel steckt mehr Stauraum, als man von außen vermutet.",
    focus: [39, 79], effect: "effect-drawer", label: "Stauraum · öffnet sich",
    view: [17, 9, 1.8, 0],
  },
  spielwand: {
    number: "05", title: "Hier darf die Küche mitspielen.",
    description: "Die Wohnseite der Insel wird zur Fläche für kleine Ideen. Klappe auf, Stifte raus – und schon wird aus Warten gemeinsame Zeit.",
    focus: [60, 82], effect: "effect-play", label: "Spielwand · klappt auf",
    view: [-20, 4, 1.7, 100],
  },
  roboter: {
    number: "06", title: "Der Saugroboter wohnt im Sockel.",
    description: "Unsichtbar verstaut und schnell wieder unterwegs: Die Garage im Küchensockel lässt den Roboter direkt unter der Insel hervorkommen.",
    focus: [55, 93], effect: "effect-robot", label: "Sockel-Garage · Roboter fährt los",
    view: [-17, -6, 1.85, 100],
  },
  licht: {
    number: "07", title: "Licht, das die Stimmung wechselt.",
    description: "Arbeitslicht am Morgen, ein warmer Akzent am Abend. Ein Fingertipp verändert die ganze Atmosphäre der Küche.",
    focus: [72, 37], effect: "effect-light", label: "Lichtstimmung · wird warm",
    view: [-21, -8, 1.6, 100],
  },
};

function illuminate() {
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
  scenePlane.style.transform = `translateX(-50%) translate3d(${pose.x}px, ${pose.y}px, 0) perspective(${pose.perspective}px) rotateX(${pose.pitch}deg) rotateY(${pose.yaw}deg) scale(${pose.scale})`;
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
dismissIntro();
