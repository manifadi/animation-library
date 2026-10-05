// ---------------------------------------------------------------------------
// Die Koje · Scrollytelling – Bühne, Kamerafahrt, Licht, UI.
// Pfad & Timing: js/camera-path.js · Blockout-Szene: js/kitchen.js
// ---------------------------------------------------------------------------
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  SCROLL_LENGTH_VH, ANCHOR_DEFAULTS, KEYFRAMES, STATIONS, FEATURE_ANIMS, LIGHT_KEYS, LIGHT_MOODS,
} from "./camera-path.js";
import { buildKitchen } from "./kitchen.js";

gsap.registerPlugin(ScrollTrigger);

// Austausch des 3D-Modells: ?model=assets/koje.glb – oder hier fest eintragen.
const MODEL_URL = new URLSearchParams(location.search).get("model") || null;

const html = document.documentElement;
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const journey = $("#journey");
const stage = $(".stage");
const canvas = $("#scene");
const heroCopy = $(".hero-copy");
const hotspot = $(".hotspot");
const hotspotLabel = $(".hotspot-label");
const progressFill = $(".progress-track");
const stationEls = Object.fromEntries($$(".station").map((el) => [el.dataset.station, el]));
const navButtons = $$(".progress-nav button");
const moodChips = $$(".moods li");
const loadBar = $(".preloader-bar span");

const isStatic = () => html.classList.contains("is-static");
const finePointer = matchMedia("(pointer: fine)").matches;
const isSmall = () => innerWidth < 760;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2); // power2.inOut
const smooth = (t) => t * t * (3 - 2 * t);
const setLoad = (v) => loadBar?.style.setProperty("--load", v);

journey.style.setProperty("--scroll-length", `${SCROLL_LENGTH_VH}vh`);

function finishLoading() {
  window.__kojeReady = true;
  setLoad(1);
  setTimeout(() => html.classList.add("is-loaded"), 300);
}

main().catch((err) => {
  console.error("[Koje] Initialisierung fehlgeschlagen – statischer Modus.", err);
  html.classList.add("is-static", "no-webgl");
  finishLoading();
});

async function main() {
  setLoad(0.15);

  // ---------- Renderer ----------
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  } catch (err) {
    console.warn("[Koje] Kein WebGL – statischer Modus.", err);
    html.classList.add("is-static", "no-webgl");
    finishLoading();
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, isSmall() ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xefeae3);
  scene.fog = new THREE.Fog(0xefeae3, 14, 30);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(38, 1, 0.03, 80);

  const hemi = new THREE.HemisphereLight(0xfff6ec, 0xb89a7a, 1);
  const sun = new THREE.DirectionalLight(0xffffff, 2.5);
  sun.position.set(-7.5, 6.5, 2.2);
  sun.target.position.set(-0.5, 0, -1);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(isSmall() ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 25 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.025;
  scene.add(hemi, sun, sun.target);
  setLoad(0.35);

  // ---------- Modell: Blockout oder GLB ----------
  const anchors = {};
  let kitchen = null;
  let mixer = null;
  const clips = {};

  const makeAnchor = (name) => {
    const a = new THREE.Object3D();
    a.name = name;
    a.position.fromArray(ANCHOR_DEFAULTS[name]);
    scene.add(a);
    return a;
  };

  const useBlockout = () => {
    kitchen = buildKitchen({ anisotropy: renderer.capabilities.getMaxAnisotropy() });
    scene.add(kitchen.root);
    Object.assign(anchors, kitchen.anchors);
  };

  if (MODEL_URL) {
    try {
      const gltf = await new GLTFLoader().loadAsync(MODEL_URL, (e) => {
        if (e.total) setLoad(0.35 + 0.45 * (e.loaded / e.total));
      });
      gltf.scene.traverse((o) => {
        if (o.isMesh) o.castShadow = o.receiveShadow = true;
      });
      scene.add(gltf.scene);
      // Benannte Empties im GLB ersetzen die Standard-Anker.
      for (const name of Object.keys(ANCHOR_DEFAULTS)) {
        anchors[name] = gltf.scene.getObjectByName(name) || makeAnchor(name);
      }
      // Animation-Clips mit den Namen aus FEATURE_ANIMS werden per Scroll gescrubbt.
      if (gltf.animations.length) {
        mixer = new THREE.AnimationMixer(gltf.scene);
        for (const clip of gltf.animations) {
          if (!FEATURE_ANIMS[clip.name]) continue;
          const action = mixer.clipAction(clip);
          action.play();
          action.paused = true;
          clips[clip.name] = { action, duration: clip.duration };
        }
      }
    } catch (err) {
      console.warn(`[Koje] Modell „${MODEL_URL}“ nicht ladbar – Blockout wird verwendet.`, err);
      useBlockout();
    }
  } else {
    useBlockout();
  }
  scene.updateMatrixWorld(true);
  setLoad(0.8);

  const setFeature = (name, t) => {
    kitchen?.setFeature(name, t);
    if (clips[name]) clips[name].action.time = t * clips[name].duration;
  };

  // ---------- Kamerapfad ----------
  const v3 = (a) => new THREE.Vector3().fromArray(a);
  const kf = KEYFRAMES.map((k, i) => {
    const a = anchors[k.anchor].getWorldPosition(new THREE.Vector3());
    const isEdge = i === 0 || i === KEYFRAMES.length - 1;
    return { ...k, pos: a.clone().add(v3(k.offset)), look: a.clone().add(v3(k.look)), stop: isEdge || k.hold[1] > k.hold[0] };
  });
  const N = kf.length;
  const posCurve = new THREE.CatmullRomCurve3(kf.map((k) => k.pos), false, "centripetal");
  const lookCurve = new THREE.CatmullRomCurve3(kf.map((k) => k.look), false, "centripetal");
  const stops = kf.map((k, i) => (k.stop ? i : -1)).filter((i) => i >= 0);
  const _d = new THREE.Vector3();

  // Liefert Position/Blickpunkt für Scroll-Fortschritt p und gibt das FOV zurück.
  function cameraAt(p, outPos, outLook) {
    for (const i of stops) {
      const [a, b] = kf[i].hold;
      if (p >= a && p <= b) {
        outPos.copy(kf[i].pos);
        outLook.copy(kf[i].look);
        if (kf[i].drift && b > a) outPos.lerp(outLook, kf[i].drift * smooth((p - a) / (b - a)));
        return kf[i].fov;
      }
    }
    let s = stops[0];
    let e = stops[stops.length - 1];
    for (const i of stops) if (kf[i].hold[1] < p) s = i;
    for (let j = stops.length - 1; j >= 0; j--) if (kf[stops[j]].hold[0] > p) e = stops[j];
    const a = kf[s].hold[1];
    const b = kf[e].hold[0];
    const u = easeInOut(clamp01((p - a) / (b - a)));
    const idx = s + (e - s) * u;
    posCurve.getPoint(idx / (N - 1), outPos);
    lookCurve.getPoint(idx / (N - 1), outLook);
    if (kf[s].drift) outPos.add(_d.subVectors(kf[s].look, kf[s].pos).multiplyScalar(kf[s].drift * (1 - u)));
    const i0 = Math.floor(idx);
    const i1 = Math.min(N - 1, i0 + 1);
    return THREE.MathUtils.lerp(kf[i0].fov, kf[i1].fov, idx - i0);
  }

  // ---------- Lichtstimmungen ----------
  const moods = Object.fromEntries(
    Object.entries(LIGHT_MOODS).map(([k, m]) => [k, { ...m, sun: new THREE.Color(m.sun), bg: new THREE.Color(m.bg) }]),
  );
  const winColor = new THREE.Color();
  let darkScene = false;

  function applyLight(p) {
    let k0 = LIGHT_KEYS[0];
    let k1 = LIGHT_KEYS[LIGHT_KEYS.length - 1];
    for (let i = 0; i < LIGHT_KEYS.length - 1; i++) {
      if (p >= LIGHT_KEYS[i].at && p <= LIGHT_KEYS[i + 1].at) {
        k0 = LIGHT_KEYS[i];
        k1 = LIGHT_KEYS[i + 1];
        break;
      }
    }
    const t = k1.at > k0.at ? smooth(clamp01((p - k0.at) / (k1.at - k0.at))) : 0;
    const A = moods[k0.mood];
    const B = moods[k1.mood];
    const L = (key) => A[key] + (B[key] - A[key]) * t;

    sun.color.copy(A.sun).lerp(B.sun, t);
    sun.intensity = L("sunI");
    hemi.intensity = L("hemiI");
    scene.environmentIntensity = L("env");
    renderer.toneMappingExposure = L("exposure");
    scene.background.copy(A.bg).lerp(B.bg, t);
    scene.fog.color.copy(scene.background);
    if (kitchen) {
      const f = kitchen.fixtures;
      f.setLed(L("led"));
      f.setPendant(L("pendant"));
      f.setAccent(L("accent"));
      f.setWindow(winColor.copy(sun.color).multiplyScalar(0.55 + L("sunI") * 0.22));
    }
    const dark = scene.background.getHSL({}).l < 0.35;
    if (dark !== darkScene) {
      darkScene = dark;
      html.classList.toggle("is-dark-scene", dark);
    }
    return t > 0.5 ? k1.mood : k0.mood;
  }

  function applyFeatures(p) {
    for (const [name, [a, b]] of Object.entries(FEATURE_ANIMS)) setFeature(name, easeInOut(clamp01((p - a) / (b - a))));
    mixer?.update(0);
  }

  const camPos = new THREE.Vector3();
  const camLook = new THREE.Vector3();

  // ---------- Statischer Modus: Standbilder pro Station ----------
  if (isStatic()) {
    renderStills();
    finishLoading();
    return;
  }

  function renderStills() {
    const w = 1200, h = 800;
    renderer.setPixelRatio(1);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.clearViewOffset();
    const snap = (p) => {
      applyLight(p);
      applyFeatures(p);
      camera.fov = cameraAt(p, camPos, camLook);
      camera.position.copy(camPos);
      camera.lookAt(camLook);
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      return renderer.domElement.toDataURL("image/jpeg", 0.86);
    };
    const img = (src, alt) => Object.assign(new Image(), { src, alt, loading: "lazy", width: w, height: h });
    $(".hero-still").append(img(snap(0), "3D-Ansicht der kompletten Koje"));
    const shots = { spielwand: 0.195, tablet: 0.35, couch: 0.565, staubsauger: 0.735 };
    for (const [id, p] of Object.entries(shots)) {
      const title = stationEls[id].querySelector("h2").textContent;
      stationEls[id].querySelector(".station-media").append(img(snap(p), `3D-Detailansicht: ${title}`));
    }
    const trio = stationEls.licht.querySelector(".station-media");
    [["Morgen", 0.825], ["Kochen", 0.867], ["Abend", 0.925]].forEach(([label, p]) => {
      const fig = document.createElement("figure");
      fig.style.margin = "0";
      fig.append(img(snap(p), `Lichtstimmung ${label}`));
      const cap = document.createElement("figcaption");
      cap.textContent = label;
      fig.append(cap);
      trio.append(fig);
    });
    html.classList.remove("is-dark-scene");
  }

  // ---------- Post-Processing (nur große Screens) ----------
  let composer = null;
  if (!isSmall() && finePointer) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.28, 0.5, 0.96));
    composer.addPass(new OutputPass());
  }

  let W = 1, H = 1;
  function resize() {
    W = stage.clientWidth;
    H = stage.clientHeight;
    renderer.setSize(W, H, false);
    composer?.setSize(W, H);
    camera.aspect = W / H;
  }
  resize();
  addEventListener("resize", resize);

  // Hochformat: horizontales Sichtfeld etwas öffnen, damit das Motiv drin bleibt.
  const adaptFov = (fov) => {
    const a = W / H;
    if (a >= 1.25) return fov;
    const k = Math.pow(1.25 / a, 0.6);
    return Math.min(75, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(fov) / 2) * k)));
  };

  // ---------- Scroll: Lenis + ScrollTrigger ----------
  const lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  const state = { p: 0 };
  gsap.to(state, {
    p: 1,
    ease: "none",
    scrollTrigger: { trigger: journey, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true },
  });

  function jumpTo(id) {
    const st = STATIONS.find((s) => s.id === id);
    if (!st) return;
    const top = journey.getBoundingClientRect().top + scrollY;
    const target = top + st.jump * (journey.offsetHeight - innerHeight);
    const dist = Math.abs(target - scrollY) / innerHeight;
    lenis.scrollTo(target, { duration: Math.min(3.2, 1.1 + dist * 0.25), easing: easeInOut });
    stationEls[id]?.setAttribute("tabindex", "-1");
    stationEls[id]?.focus({ preventScroll: true });
  }
  $$("[data-jump]").forEach((el) =>
    el.addEventListener("click", (e) => {
      e.preventDefault();
      jumpTo(el.dataset.jump);
    }),
  );

  // ---------- Maus-Parallax ----------
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  if (finePointer) {
    addEventListener("pointermove", (e) => {
      ptr.tx = (e.clientX / innerWidth) * 2 - 1;
      ptr.ty = (e.clientY / innerHeight) * 2 - 1;
    }, { passive: true });
  }

  // ---------- Render-Loop ----------
  const _r = new THREE.Vector3();
  const _h = new THREE.Vector3();
  const stationById = Object.fromEntries(STATIONS.map((s) => [s.id, s]));
  let p = state.p;
  let shift = 0;
  let last = performance.now();
  let activeId = undefined;
  let currentMood = null;
  let navVisible = false;

  function frame() {
    const now = performance.now();
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;

    const rect = journey.getBoundingClientRect();
    const onScreen = rect.bottom > 0;

    p += (state.p - p) * (1 - Math.exp(-dt * 9));
    if (Math.abs(state.p - p) < 1e-5) p = state.p;

    // Stationen + Navigation
    let active = null;
    for (const st of STATIONS) if (p >= st.range[0] && p <= st.range[1]) active = st.id;
    if (active !== activeId) {
      activeId = active;
      for (const [id, el] of Object.entries(stationEls)) el.classList.toggle("is-active", id === active);
      navButtons.forEach((b) => (b.dataset.jump === active ? b.setAttribute("aria-current", "step") : b.removeAttribute("aria-current")));
      hotspotLabel.textContent = active ? stationEls[active].dataset.hotspot : "";
    }
    navButtons.forEach((b) => b.classList.toggle("is-done", p > stationById[b.dataset.jump].range[1]));
    html.classList.toggle("past-journey", rect.bottom < innerHeight * 0.6);
    const showNav = onScreen && p > 0.06 && p < 0.965;
    if (showNav !== navVisible) {
      navVisible = showNav;
      html.classList.toggle("nav-visible", showNav);
    }
    progressFill.firstElementChild.style.transform = `scaleY(${clamp01((p - 0.1) / 0.85).toFixed(4)})`;

    const heroOp = 1 - clamp01(p / 0.05);
    stage.style.setProperty("--hero-opacity", heroOp.toFixed(3));
    heroCopy.style.visibility = heroOp < 0.01 ? "hidden" : "";
    stage.style.setProperty("--hero-veil", (0.85 * heroOp).toFixed(3));
    stage.style.setProperty("--outro-opacity", clamp01((p - 0.955) / 0.03).toFixed(3));

    if (!onScreen) return; // Bühne nicht sichtbar → nicht rendern

    // Licht + Ausstattung
    const mood = applyLight(p);
    const showMood = active === "licht" ? mood : null;
    if (showMood !== currentMood) {
      currentMood = showMood;
      moodChips.forEach((c) => c.classList.toggle("is-current", c.dataset.mood === showMood));
    }
    applyFeatures(p);

    // Kamera
    const fov = cameraAt(p, camPos, camLook);
    ptr.x += (ptr.tx - ptr.x) * (1 - Math.exp(-dt * 3));
    ptr.y += (ptr.ty - ptr.y) * (1 - Math.exp(-dt * 3));
    const amp = 0.05 + 0.2 * heroOp;
    _r.subVectors(camLook, camPos).cross(camera.up).normalize();
    camPos.addScaledVector(_r, ptr.x * amp).addScaledVector(camera.up, -ptr.y * amp * 0.5);
    camera.position.copy(camPos);
    camera.lookAt(camLook);
    camera.fov = adaptFov(fov);

    // Motiv neben/über das Textpanel schieben
    // Hero: Querformat → Küche nach rechts, Hochformat → Küche nach oben.
    const portrait = W < H;
    const wantShift = active ? 1 : heroOp > 0.5 ? (portrait ? 1 : 0.8) : 0;
    shift += (wantShift - shift) * (1 - Math.exp(-dt * 3));
    const vertical = isSmall() || (portrait && !active);
    if (vertical) camera.setViewOffset(W, H, 0, H * 0.2 * shift, W, H);
    else camera.setViewOffset(W, H, -W * 0.14 * shift, 0, W, H);

    // Pulsierpunkt
    if (active) {
      const st = stationById[active];
      camera.updateMatrixWorld();
      anchors[`anchor_${st.id}`].getWorldPosition(_h).add(_r.fromArray(st.hotspot));
      _h.project(camera);
      const visible = _h.z < 1 && Math.abs(_h.x) < 0.95 && Math.abs(_h.y) < 0.95;
      hotspot.classList.toggle("is-visible", visible);
      hotspot.classList.toggle("is-flipped", (_h.x + 1) / 2 > 0.7);
      hotspot.style.transform = `translate3d(${((_h.x + 1) / 2) * W}px, ${((1 - _h.y) / 2) * H}px, 0)`;
    } else {
      hotspot.classList.remove("is-visible");
    }

    if (composer) composer.render();
    else renderer.render(scene, camera);
  }

  // Erstes Bild vor dem Ausblenden des Preloaders
  applyLight(0);
  applyFeatures(0);
  renderer.compile(scene, camera);
  frame();
  gsap.ticker.add(frame);
  finishLoading();
}
