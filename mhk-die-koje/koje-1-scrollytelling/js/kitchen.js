// ---------------------------------------------------------------------------
// Blockout-Küche "Die Koje" – prozedural aus Three.js-Geometrie.
// Platzhalter, bis das echte 3D-Modell (GLB) vorliegt. Maße sind grob
// realistisch (Meter), aber KEINE Produktdaten.
//
// Raum:   Rückwand z = -2.6, linke Wand x = -4.3 (mit Fenster), Boden y = 0
// Zeile:  x -2.45 … 1.55 an der Rückwand, Hochschränke x 1.55 … 2.75
// Insel:  x -1.8 … 0.9, z -0.75 … 0.26 – Wohnseite (+z) = Spielwand
// Couch:  x -4.28 … -2.6 an der Rückwand, links neben der Zeile
// ---------------------------------------------------------------------------
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { ANCHOR_DEFAULTS } from "./camera-path.js";
import { woodTexture, plankTexture, chalkTexture, recipeTexture } from "./textures.js";

const lerp = (a, b, t) => a + (b - a) * t;

function box(parent, mat, [x0, x1], [y0, y1], [z0, z1], { cast = true, receive = true } = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat);
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  m.castShadow = cast;
  m.receiveShadow = receive;
  parent.add(m);
  return m;
}

function rounded(parent, mat, [w, h, d], [x, y, z], radius = 0.04) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, radius), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

// Frontenreihe mit schmalen Fugen. dir = +1: Fronten zeigen nach +z, -1: nach -z.
function frontRun(parent, mat, { x0, widths, types = [], y0, y1, z, dir = 1 }) {
  const gap = 0.003, t = 0.019;
  const [za, zb] = dir > 0 ? [z, z + t] : [z - t, z];
  let x = x0;
  widths.forEach((w, i) => {
    const type = types[i] || "door";
    const rows = type === "drawers" ? [0.42, 0.33, 0.25] : type === "drawers2" ? [0.55, 0.45] : [1];
    let y = y0;
    rows.forEach((fr) => {
      const h = (y1 - y0) * fr;
      box(parent, mat, [x + gap / 2, x + w - gap / 2], [y + gap / 2, y + h - gap / 2], [za, zb]);
      y += h;
    });
    x += w;
  });
}

export function buildKitchen({ anisotropy = 4 } = {}) {
  RectAreaLightUniformsLib.init();
  const root = new THREE.Group();
  root.name = "koje-blockout";

  const repeat = (t, x, y) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(x, y);
    t.anisotropy = anisotropy;
    return t;
  };
  const oakTex = repeat(woodTexture(), 1, 1);

  const M = {
    wall:     new THREE.MeshStandardMaterial({ color: 0xf1ece5, roughness: 0.95 }),
    floor:    new THREE.MeshStandardMaterial({ map: repeat(plankTexture(), 10, 10), roughness: 0.68 }),
    front:    new THREE.MeshStandardMaterial({ color: 0xdcd6cb, roughness: 0.82 }),
    carcass:  new THREE.MeshStandardMaterial({ color: 0x8f877c, roughness: 0.9 }),
    inner:    new THREE.MeshStandardMaterial({ color: 0xe4ddd1, roughness: 0.9 }),
    oak:      new THREE.MeshStandardMaterial({ map: oakTex, roughness: 0.6 }),
    counter:  new THREE.MeshStandardMaterial({ color: 0xeeebe5, roughness: 0.36 }),
    plinth:   new THREE.MeshStandardMaterial({ color: 0x34322f, roughness: 0.85 }),
    glass:    new THREE.MeshStandardMaterial({ color: 0x151516, roughness: 0.12, metalness: 0.3 }),
    steel:    new THREE.MeshStandardMaterial({ color: 0xbfc1c3, roughness: 0.28, metalness: 0.9 }),
    anthra:   new THREE.MeshStandardMaterial({ color: 0x3c3c3c, roughness: 0.55, side: THREE.DoubleSide }),
    fabric:   new THREE.MeshStandardMaterial({ color: 0xcdbba5, roughness: 1 }),
    fabric2:  new THREE.MeshStandardMaterial({ color: 0xa88f78, roughness: 1 }),
    red:      new THREE.MeshStandardMaterial({ color: 0xc61d27, roughness: 0.85 }),
    chalk:    new THREE.MeshStandardMaterial({ map: chalkTexture(), roughness: 0.95 }),
    niche:    new THREE.MeshStandardMaterial({ color: 0x1f1e1c, roughness: 0.9 }),
    paper:    new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.95 }),
    plant:    new THREE.MeshStandardMaterial({ color: 0x5d7752, roughness: 0.85, flatShading: true }),
    pot:      new THREE.MeshStandardMaterial({ color: 0xd9d0c3, roughness: 0.9 }),
    orange:   new THREE.MeshStandardMaterial({ color: 0xe48a2c, roughness: 0.6 }),
    led:      new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0xffd8a6, emissiveIntensity: 0 }),
    bulb:     new THREE.MeshStandardMaterial({ color: 0xf5efe6, emissive: 0xffc98a, emissiveIntensity: 0 }),
    accent:   new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0xffb36b, emissiveIntensity: 0 }),
    status:   new THREE.MeshStandardMaterial({ color: 0x0b2a24, emissive: 0x52e0bf, emissiveIntensity: 1.6 }),
    window:   new THREE.MeshBasicMaterial({ color: 0xfff4e6 }),
    screen:   new THREE.MeshBasicMaterial({ map: recipeTexture(), color: 0xd9d9d9 }),
  };

  // ---------- Raum ----------
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), M.floor);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  root.add(floor);
  box(root, M.wall, [-4.3, 7], [0, 2.9], [-2.72, -2.6], { cast: false });
  box(root, M.wall, [-4.42, -4.3], [0, 2.9], [-2.72, 3.2], { cast: false });

  // Fenster in der linken Wand (Lichtquelle der Szene)
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.45), M.window);
  win.rotation.y = Math.PI / 2;
  win.position.set(-4.295, 1.65, -0.15);
  root.add(win);
  box(root, M.anthra, [-4.3, -4.26], [0.9, 0.94], [-1.05, 0.75], { cast: false });
  box(root, M.anthra, [-4.3, -4.26], [2.36, 2.4], [-1.05, 0.75], { cast: false });
  box(root, M.anthra, [-4.3, -4.26], [0.9, 2.4], [-1.05, -0.99], { cast: false });
  box(root, M.anthra, [-4.3, -4.26], [0.9, 2.4], [0.69, 0.75], { cast: false });
  box(root, M.anthra, [-4.3, -4.27], [0.9, 2.4], [-0.17, -0.13], { cast: false });

  // ---------- Küchenzeile ----------
  const runW = [0.6, 0.6, 0.9, 0.6, 0.7, 0.6];
  box(root, M.plinth, [-2.45, 1.55], [0, 0.1], [-2.55, -2.04]);
  box(root, M.carcass, [-2.45, 1.55], [0.1, 0.88], [-2.6, -1.98]);
  frontRun(root, M.front, {
    x0: -2.45, widths: runW, types: ["drawers", "door", "door", "drawers", "drawers2", "drawers"],
    y0: 0.1, y1: 0.88, z: -1.98, dir: 1,
  });
  box(root, M.counter, [-2.47, 1.55], [0.88, 0.92], [-2.6, -1.95]);
  box(root, M.steel, [-1.42, -0.9], [0.92, 0.921], [-2.47, -2.08]);                    // Spüle
  const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.32, 20), M.steel);
  tap.position.set(-1.16, 1.08, -2.52);
  tap.castShadow = true;
  root.add(tap);
  box(root, M.steel, [-1.172, -1.148], [1.22, 1.24], [-2.53, -2.33]);
  box(root, M.glass, [0.4, 1.15], [0.92, 0.926], [-2.5, -2.02]);                       // Kochfeld
  box(root, M.oak, [-2.45, 1.55], [0.92, 1.45], [-2.6, -2.585], { cast: false });     // Nischenrückwand
  box(root, M.oak, [-2.48, -2.45], [0, 0.88], [-2.6, -1.95]);                          // Wange links
  // Oberschränke + LED-Leiste
  box(root, M.carcass, [-2.45, 1.55], [1.45, 2.15], [-2.6, -2.26]);
  frontRun(root, M.front, { x0: -2.45, widths: runW, y0: 1.45, y1: 2.15, z: -2.26, dir: 1 });
  box(root, M.led, [-2.42, 1.52], [1.444, 1.45], [-2.31, -2.28], { cast: false, receive: false });
  const ledLight = new THREE.RectAreaLight(0xffd8a6, 0, 3.9, 0.05);
  ledLight.position.set(-0.45, 1.44, -2.36);
  ledLight.lookAt(-0.45, 0, -1.9);
  root.add(ledLight);

  // Hochschränke mit Backofen
  box(root, M.plinth, [1.55, 2.75], [0, 0.1], [-2.55, -2.04]);
  box(root, M.carcass, [1.55, 2.75], [0.1, 2.3], [-2.6, -1.98]);
  frontRun(root, M.front, { x0: 1.55, widths: [0.6], y0: 0.1, y1: 0.9, z: -1.98 });
  box(root, M.glass, [1.56, 2.14], [0.92, 1.5], [-1.98, -1.958]);
  frontRun(root, M.front, { x0: 1.55, widths: [0.6], y0: 1.52, y1: 2.3, z: -1.98 });
  frontRun(root, M.front, { x0: 2.15, widths: [0.6], y0: 0.1, y1: 1.3, z: -1.98 });
  frontRun(root, M.front, { x0: 2.15, widths: [0.6], y0: 1.3, y1: 2.3, z: -1.98 });
  box(root, M.oak, [2.75, 2.78], [0, 2.3], [-2.6, -1.95]);

  // Pflanze auf der Arbeitsfläche
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.16, 28), M.pot);
  pot.position.set(1.25, 1.0, -2.4);
  pot.castShadow = true;
  root.add(pot);
  [[0, 0.17, 0, 0.11], [0.07, 0.24, 0.02, 0.08], [-0.06, 0.26, -0.02, 0.085], [0.01, 0.33, 0.03, 0.07]].forEach(([x, y, z, r]) => {
    const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), M.plant);
    leaf.position.set(1.25 + x, 0.92 + y, -2.4 + z);
    leaf.castShadow = true;
    root.add(leaf);
  });

  // ---------- Tablet-Halterung (fährt aus der Arbeitsplatte) ----------
  box(root, M.glass, [-0.93, -0.57], [0.92, 0.9215], [-2.405, -2.365], { cast: false });
  const tablet = new THREE.Group();
  tablet.position.set(-0.75, 0.92, -2.385);
  root.add(tablet);
  box(tablet, M.steel, [-0.016, 0.016], [-0.34, 0.02], [-0.008, 0.008]);
  const cradle = new THREE.Group();
  cradle.position.y = 0.02;
  cradle.rotation.x = -0.28;
  tablet.add(cradle);
  box(cradle, M.anthra, [-0.155, 0.155], [0, 0.21], [-0.006, 0.006]);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.29, 0.193), M.screen);
  screen.position.set(0, 0.105, 0.0065);
  cradle.add(screen);

  // ---------- Insel ----------
  box(root, M.carcass, [-1.8, 0.9], [0.1, 0.88], [-0.75, 0.0]);
  box(root, M.counter, [-1.85, 0.95], [0.88, 0.92], [-0.8, 0.3]);
  frontRun(root, M.front, {
    x0: -1.8, widths: [0.6, 0.6, 0.9, 0.6], types: ["drawers", "drawers", "door", "drawers"],
    y0: 0.1, y1: 0.88, z: -0.75, dir: -1,
  });
  // Eichen-Wangen an den Inselenden
  box(root, M.oak, [-1.83, -1.8], [0, 0.88], [-0.78, 0.26]);
  box(root, M.oak, [0.9, 0.93], [0, 0.88], [-0.78, 0.26]);
  // Sockel mit Roboter-Garage (Nische x 0.42 … 0.82)
  box(root, M.plinth, [-1.75, 0.42], [0, 0.1], [-0.69, 0.16]);
  box(root, M.plinth, [0.82, 0.85], [0, 0.1], [-0.69, 0.16]);
  box(root, M.niche, [0.42, 0.82], [0, 0.1], [-0.69, -0.36]);
  box(root, M.niche, [0.4, 0.42], [0, 0.1], [-0.36, 0.16]);
  box(root, M.niche, [0.82, 0.84], [0, 0.1], [-0.36, 0.16]);
  box(root, M.carcass, [0.42, 0.82], [0.1, 0.11], [-0.36, 0.2]);
  box(root, M.accent, [0.45, 0.79], [0.094, 0.1], [0.12, 0.15], { cast: false, receive: false });

  // Wohnseite: Eichenverkleidung mit Spielwand und Klappfach (x -0.25 … 0.1, y 0.3 … 0.56)
  const ZF = 0.2, ZB = 0.26;
  box(root, M.oak, [-1.8, -0.25], [0.1, 0.88], [ZF, ZB]);
  box(root, M.oak, [0.1, 0.9], [0.1, 0.88], [ZF, ZB]);
  box(root, M.oak, [-0.25, 0.1], [0.1, 0.3], [ZF, ZB]);
  box(root, M.oak, [-0.25, 0.1], [0.56, 0.88], [ZF, ZB]);
  box(root, M.inner, [-0.25, 0.1], [0.0, 0.88], [0.0, ZF], { cast: false });
  box(root, M.chalk, [-1.72, -0.33], [0.14, 0.84], [ZB, ZB + 0.004]);
  // Kreide im Klappfach
  ["#e30613", "#f3c13a", "#3f86d6", "#5aae62", "#f4f1ea", "#f08fb5"].forEach((col, i) => {
    const c = new THREE.Mesh(
      new THREE.CylinderGeometry(0.007, 0.007, 0.09, 10),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.8 }),
    );
    c.position.set(-0.19 + i * 0.028, 0.3 + 0.045, 0.11 + (i % 2) * 0.03);
    c.rotation.z = (i - 2.5) * 0.06;
    root.add(c);
  });
  // Magnete und Zettel
  [[-1.34, 0.78, 0xe30613], [-1.0, 0.38, 0xf3c13a], [-0.6, 0.72, 0x3f86d6], [-0.48, 0.25, 0x5aae62]].forEach(([x, y, col]) => {
    const mag = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.012, 24),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.4 }),
    );
    mag.rotation.x = Math.PI / 2;
    mag.position.set(x, y, ZB + 0.012);
    mag.castShadow = true;
    root.add(mag);
  });
  box(root, M.paper, [-1.42, -1.26], [0.63, 0.8], [ZB + 0.004, ZB + 0.006]).rotation.z = 0.05;
  box(root, M.paper, [-1.07, -0.92], [0.22, 0.4], [ZB + 0.004, ZB + 0.006]).rotation.z = -0.07;

  // Klappe: Drehpunkt an der unteren Vorderkante
  const flap = new THREE.Group();
  flap.position.set(-0.075, 0.3, ZB);
  root.add(flap);
  box(flap, M.oak, [-0.173, 0.173], [0.003, 0.257], [-0.028, 0]);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.004, 24), M.plinth);
  grip.rotation.x = Math.PI / 2;
  grip.position.set(0, 0.215, 0.001);
  flap.add(grip);
  const sheet = box(flap, M.paper, [-0.12, 0.12], [0.03, 0.2], [-0.03, -0.028], { cast: false });

  // Roboter (parkt im Sockel)
  const robot = new THREE.Group();
  root.add(robot);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.165, 0.07, 48), M.anthra);
  body.position.y = 0.04;
  body.castShadow = true;
  robot.add(body);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.006, 48), M.glass);
  lid.position.y = 0.078;
  robot.add(lid);
  const sensor = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 32), M.anthra);
  sensor.position.set(0, 0.086, -0.06);
  robot.add(sensor);
  const statusLed = new THREE.Mesh(new THREE.SphereGeometry(0.008, 12, 8), M.status);
  statusLed.position.set(0, 0.083, 0.11);
  robot.add(statusLed);

  // Obst auf der Insel + Schneidebrett
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.14, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.pot);
  bowl.material = bowl.material.clone();
  bowl.material.side = THREE.DoubleSide;
  bowl.position.set(-1.3, 1.06, -0.3);
  bowl.castShadow = true;
  root.add(bowl);
  [[-1.33, -0.32], [-1.25, -0.27], [-1.3, -0.22]].forEach(([x, z], i) => {
    const o = new THREE.Mesh(new THREE.SphereGeometry(0.042, 24, 16), M.orange);
    o.position.set(x, 0.98 + (i === 2 ? 0.03 : 0), z);
    o.castShadow = true;
    root.add(o);
  });
  box(root, M.oak, [0.05, 0.45], [0.92, 0.94], [-0.55, -0.3]);

  // ---------- Pendelleuchten ----------
  const pendants = [];
  const bulbs = [];
  [-1.15, 0.25].forEach((x) => {
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 1.1, 6), M.plinth);
    cable.position.set(x, 2.37, -0.25);
    root.add(cable);
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.17, 0.22, 48, 1, true), M.anthra);
    shade.position.set(x, 1.71, -0.25);
    shade.castShadow = true;
    root.add(shade);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 24, 16), M.bulb);
    bulb.position.set(x, 1.64, -0.25);
    root.add(bulb);
    bulbs.push(bulb);
    const pl = new THREE.PointLight(0xffc98a, 0, 0, 2);
    pl.position.set(x, 1.57, -0.25);
    root.add(pl);
    pendants.push(pl);
  });

  // ---------- Couch mit Auszug ----------
  const CX0 = -4.28, CX1 = -2.6, CX = (CX0 + CX1) / 2, CW = CX1 - CX0;
  box(root, M.oak, [CX0, CX1], [0.02, 0.3], [-2.58, -1.82]);
  box(root, M.plinth, [CX0 + 0.04, CX1 - 0.04], [0, 0.02], [-2.54, -1.88]);
  rounded(root, M.fabric, [CW - 0.06, 0.15, 0.56], [CX, 0.375, -2.08]);
  rounded(root, M.fabric, [CW / 2 - 0.05, 0.44, 0.17], [CX - CW / 4, 0.66, -2.48], 0.06).rotation.x = -0.1;
  rounded(root, M.fabric, [CW / 2 - 0.05, 0.44, 0.17], [CX + CW / 4, 0.66, -2.48], 0.06).rotation.x = -0.1;
  const pillow = rounded(root, M.red, [0.42, 0.36, 0.12], [CX1 - 0.32, 0.62, -2.3], 0.06);
  pillow.rotation.set(-0.25, 0.1, 0.12);
  const pillow2 = rounded(root, M.fabric2, [0.4, 0.34, 0.12], [CX0 + 0.32, 0.62, -2.3], 0.06);
  pillow2.rotation.set(-0.25, -0.1, -0.1);
  const couchExt = new THREE.Group();
  root.add(couchExt);
  box(couchExt, M.oak, [CX0 + 0.06, CX1 - 0.06], [0.04, 0.27], [-2.3, -1.83]);
  box(couchExt, M.oak, [CX0 + 0.02, CX1 - 0.02], [0.03, 0.29], [-1.83, -1.81]);
  rounded(couchExt, M.fabric, [CW - 0.14, 0.13, 0.46], [CX, 0.345, -2.07]);
  // Regal mit Akzentlicht über der Couch
  box(root, M.oak, [CX0, CX1 - 0.1], [1.55, 1.58], [-2.6, -2.36]);
  box(root, M.accent, [CX0 + 0.05, CX1 - 0.15], [1.546, 1.55], [-2.42, -2.4], { cast: false, receive: false });
  [[0.05, 0.22, 0x3c3c3c], [0.04, 0.2, 0xb5a48e], [0.05, 0.24, 0xc61d27], [0.035, 0.18, 0xe9e2d6], [0.05, 0.21, 0x6f7f6a]].forEach(([w, h, col], i) => {
    box(root, new THREE.MeshStandardMaterial({ color: col, roughness: 0.85 }), [CX0 + 0.12 + i * 0.065, CX0 + 0.12 + i * 0.065 + w], [1.58, 1.58 + h], [-2.56, -2.4]);
  });
  const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.2, 28), M.pot);
  vase.position.set(CX1 - 0.45, 1.68, -2.48);
  vase.castShadow = true;
  root.add(vase);
  const accentLight = new THREE.PointLight(0xffb36b, 0, 0, 2);
  accentLight.position.set(CX, 1.4, -2.3);
  root.add(accentLight);
  const nicheLight = new THREE.PointLight(0xffb36b, 0, 0, 2);
  nicheLight.position.set(0.62, 0.08, 0.3);
  root.add(nicheLight);

  // ---------- Anker ----------
  const anchors = {};
  for (const [name, p] of Object.entries(ANCHOR_DEFAULTS)) {
    const a = new THREE.Object3D();
    a.name = name;
    a.position.fromArray(p);
    root.add(a);
    anchors[name] = a;
  }

  // ---------- Feature-Animationen (t = 0 … 1) ----------
  const features = {
    klappe(t) {
      flap.rotation.x = t * Math.PI * 0.5;
      sheet.visible = t > 0.55;
    },
    tablet(t) {
      tablet.position.y = 0.92 + lerp(-0.33, 0.08, t);
    },
    couch(t) {
      couchExt.position.z = t * 0.55;
    },
    roboter(t) {
      robot.position.set(0.62 - t * 0.04, 0, lerp(-0.12, 0.62, t));
      robot.rotation.y = t * 0.45;
    },
  };
  Object.values(features).forEach((f) => f(0));

  return {
    root,
    anchors,
    setFeature(name, t) {
      features[name]?.(t);
    },
    // Licht-Hooks für die Stimmungen
    fixtures: {
      setLed(v) {
        ledLight.intensity = v * 34;
        M.led.emissiveIntensity = v * 4;
      },
      setPendant(v) {
        pendants.forEach((p) => (p.intensity = v * 3.6));
        M.bulb.emissiveIntensity = v * 6;
      },
      setAccent(v) {
        accentLight.intensity = v * 1.4;
        nicheLight.intensity = v * 0.25;
        M.accent.emissiveIntensity = v * 4;
      },
      setWindow(color) {
        M.window.color.copy(color);
      },
    },
  };
}
