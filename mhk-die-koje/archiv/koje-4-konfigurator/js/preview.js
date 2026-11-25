// ---------------------------------------------------------------------------
// Live-Vorschau der Koje – SVG, viewBox 1200 × 800, Boden y = 700.
// Jedes Feature ist eine Gruppe mit der ID aus features.json → "layer".
// Steuer-Attribute in den Layern:
//   data-variant="…"   nur sichtbar bei dieser Variante des Features
//   data-when="id"      nur sichtbar, wenn Feature „id“ aktiv ist
//   data-unless="id"    nur sichtbar, wenn Feature „id“ NICHT aktiv ist
//   data-part="…"       Teile, die die Animation bewegt (klappe, arm, body …)
// Alle Farben stehen inline (keine CSS-Klassen), damit der Bild-Export 1:1 passt.
// ---------------------------------------------------------------------------
import { gsap } from "gsap";

const OAK = "url(#oak)";
const FRONT = "#dcd6cb";
const GAP = "#8f877c";
const GRIP = "#bdb5a8";
const r = (x, y, w, h, fill, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;

function fronts(x0, y0, h, segs, gripBottom = false) {
  let out = "";
  let x = x0;
  for (const [w, rows] of segs) {
    let y = y0;
    for (const fr of rows) {
      const fh = h * fr;
      out += r(x + 1.5, y + 1.5, w - 3, fh - 3, FRONT) + r(x + 1.5, gripBottom ? y + fh - 4 : y + 1.5, w - 3, 2.5, GRIP);
      y += fh;
    }
    x += w;
  }
  return out;
}

function couchVariant(x0, w, seats) {
  const cx = x0 + w / 2;
  const cw = (w - 12 - (seats - 1) * 8) / seats;
  const backs = Array.from({ length: seats }, (_, i) => `<rect x="${x0 + 6 + i * (cw + 8)}" y="486" width="${cw}" height="112" rx="22" fill="#d8c8b4"/>`).join("");
  return `
  <g data-part="body" data-origin="${cx} 698">
    <g data-part="polster" data-origin="${cx} 596">
      ${backs}
      <rect x="${x0 + w - 80}" y="518" width="62" height="56" rx="16" fill="#c61d27" transform="rotate(8 ${x0 + w - 49} 546)"/>
      <rect x="${x0 + 16}" y="526" width="56" height="50" rx="14" fill="#a88f78" transform="rotate(-8 ${x0 + 44} 551)"/>
    </g>
    ${r(x0, 622, w, 76, OAK, 'rx="4"')}${r(x0 + 6, 650, w - 12, 46, "#a77a4e", 'opacity=".25" rx="3"')}
    ${r(cx - 20, 656, 40, 4, "#7d5a38", 'rx="2"')}
    <rect x="${x0 + 4}" y="594" width="${w - 8}" height="32" rx="14" fill="#cdbba5"/>
    ${r(x0 + 16, 600, w - 32, 3, "#fff", 'opacity=".35" rx="1.5"')}
  </g>`;
}

export const previewMarkup = `
<svg class="preview-svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="preview-title">
<title id="preview-title">Vorschau deiner Koje</title>
<defs>
  <pattern id="oak" width="60" height="200" patternUnits="userSpaceOnUse">
    <rect width="60" height="200" fill="#c99a6a"/>
    <path d="M8 0 C12 60 4 120 9 200 M22 0 C18 70 26 140 21 200 M37 0 C41 50 33 130 38 200 M51 0 C47 80 55 150 50 200" stroke="#a77a4e" stroke-opacity=".28" stroke-width="1.4" fill="none"/>
  </pattern>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfb08a"/><stop offset="1" stop-color="#dcc29f"/></linearGradient>
  <linearGradient id="ledGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".95"/><stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/></linearGradient>
  <linearGradient id="warmGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc77d" stop-opacity=".9"/><stop offset="1" stop-color="#ffc77d" stop-opacity="0"/></linearGradient>
  <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffdca0" stop-opacity=".7"/><stop offset="1" stop-color="#ffdca0" stop-opacity="0"/></linearGradient>
  <radialGradient id="bulb"><stop offset="0" stop-color="#fff7e6"/><stop offset=".35" stop-color="#ffd08a" stop-opacity=".85"/><stop offset="1" stop-color="#ffd08a" stop-opacity="0"/></radialGradient>
  <radialGradient id="shadow"><stop offset="0" stop-color="#000" stop-opacity=".24"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  <clipPath id="clip-counter"><rect x="0" y="0" width="1200" height="470"/></clipPath>
</defs>

<!-- ============ Grundküche (immer sichtbar) ============ -->
<g id="base">
  <rect x="-1200" y="-800" width="3600" height="1500" fill="#efebe5"/>
  <rect x="-1200" y="700" width="3600" height="900" fill="url(#floor)"/>
  <g opacity=".35">${[732, 766].map((y) => r(-1200, y, 3600, 1.5, "#a8865c")).join("")}${[120, 470, 820].map((x) => r(x, 700, 1.5, 32, "#a8865c")).join("")}${[300, 650, 1000].map((x) => r(x, 733, 1.5, 33, "#a8865c")).join("")}</g>

  <g data-unless="couch">
    <rect x="70" y="420" width="320" height="270" rx="10" fill="none" stroke="#b9b1a5" stroke-width="2.5" stroke-dasharray="10 9"/>
    <text x="230" y="562" text-anchor="middle" font-family="Open Sans, Arial, sans-serif" font-size="17" font-weight="600" fill="#a39b8e">Platz für die Couch</text>
  </g>

  ${r(420, 140, 620, 160, GAP)}${fronts(420, 140, 160, [[150, [1]], [150, [1]], [170, [1]], [150, [1]]], true)}
  ${r(420, 300, 620, 170, OAK)}
  ${r(424, 300, 612, 4, "#e9e1d3")}
  ${r(636, 400, 8, 70, "#bfc1c3", 'rx="3"')}${r(614, 400, 30, 8, "#bfc1c3", 'rx="4"')}
  ${r(892, 436, 36, 34, "#d9d0c3", 'rx="5"')}
  <g fill="#5d7752"><circle cx="904" cy="424" r="16"/><circle cx="920" cy="418" r="14"/><circle cx="912" cy="405" r="13"/><circle cx="898" cy="411" r="11"/></g>
</g>

<!-- ============ Feature-Layer (mittlere Ebene) ============ -->
<g id="feature-oberschrank-links" data-feature="oberschrank-links">
  ${r(60, 140, 340, 160, GAP)}${fronts(60, 140, 160, [[170, [1]], [170, [1]]], true)}
</g>

<g id="feature-couch" data-feature="couch">
  ${r(50, 386, 360, 16, OAK)}${r(50, 386, 12, 314, OAK)}${r(398, 386, 12, 314, OAK)}
  ${r(62, 402, 336, 298, "#000", 'opacity=".07"')}
  <ellipse cx="230" cy="701" rx="160" ry="9" fill="url(#shadow)"/>
  <g data-variant="2">${couchVariant(110, 240, 2)}</g>
  <g data-variant="3">${couchVariant(70, 320, 3)}</g>
</g>

<g id="feature-regal" data-feature="regal">
  ${r(76, 432, 308, 9, OAK, 'rx="2"')}
  ${[["#3c3c3c", 14, 40], ["#b5a48e", 12, 34], ["#c61d27", 15, 44], ["#e9e2d6", 11, 30], ["#6f7f6a", 14, 38]].map(([c, w, h], i) => r(96 + i * 18, 432 - h, w, h, c, 'rx="1"')).join("")}
  <rect x="300" y="404" width="26" height="28" rx="5" fill="#d9d0c3"/>
</g>

<g id="feature-tablet" data-feature="tablet">
  <g clip-path="url(#clip-counter)">
    <g data-part="arm">
      ${r(755, 400, 10, 74, "#bfc1c3", 'rx="3"')}
      <g data-part="device" data-origin="760 404">
        <rect x="700" y="318" width="120" height="86" rx="8" fill="#3c3c3c"/>
        <rect x="707" y="325" width="106" height="72" rx="2" fill="#fbfaf8"/>
        <rect x="707" y="325" width="106" height="12" fill="#e30613"/>
        ${r(712, 345, 64, 6, "#3c3c3c", 'rx="2"')}${r(712, 358, 52, 3, "#bdb8b0", 'rx="1.5"')}${r(712, 365, 44, 3, "#bdb8b0", 'rx="1.5"')}${r(712, 372, 56, 3, "#bdb8b0", 'rx="1.5"')}
        <circle cx="795" cy="372" r="12" fill="none" stroke="#e30613" stroke-width="3"/>
      </g>
    </g>
  </g>
  ${r(715, 468, 90, 3, "#1b1b1c")}
</g>

<g id="feature-steckdose" data-feature="steckdose">
  <g clip-path="url(#clip-counter)">
    <g data-part="arm">
      <rect x="966" y="392" width="28" height="80" rx="5" fill="#f1eee9" stroke="#cfc9be" stroke-width="1.5"/>
      ${[408, 430, 452].map((y) => `<circle cx="980" cy="${y}" r="7" fill="#e2ddd5"/><circle cx="977" cy="${y}" r="1.4" fill="#8f877c"/><circle cx="983" cy="${y}" r="1.4" fill="#8f877c"/>`).join("")}
    </g>
  </g>
  ${r(962, 468, 36, 3, "#1b1b1c")}
</g>

<!-- Arbeitsplatte + Unterschränke (über Tablet-/Steckdosen-Schlitz) -->
<g id="base-run">
  ${r(414, 470, 632, 14, "#eeebe5")}${r(414, 482, 632, 2, "#d6d1c8")}
  ${r(420, 484, 620, 196, GAP)}${fronts(420, 484, 196, [[150, [0.25, 0.33, 0.42]], [150, [1]], [170, [1]], [150, [0.25, 0.33, 0.42]]])}
  ${r(420, 680, 620, 20, "#34322f")}
  ${r(1040, 110, 130, 570, GAP)}${r(1041.5, 111.5, 127, 187, FRONT)}
  <rect x="1044" y="304" width="122" height="116" rx="3" fill="#1d1d1e"/>${r(1056, 312, 98, 5, "#bfc1c3", 'rx="2"')}
  ${r(1041.5, 425.5, 127, 253, FRONT)}${r(1170, 110, 6, 590, OAK)}${r(1040, 680, 130, 20, "#34322f")}
</g>

<!-- ============ Vordere Ebene: Pendel + Insel ============ -->
<g id="base-front">
  ${[690, 900].map((x) => `<line x1="${x}" y1="-60" x2="${x}" y2="236" stroke="#34322f" stroke-width="2"/><path d="M${x - 11} 236 h22 l26 44 h-74 z" fill="#3c3c3c"/><ellipse cx="${x}" cy="280" rx="37" ry="4" fill="#262626"/>`).join("")}
  <ellipse cx="800" cy="762" rx="300" ry="16" fill="url(#shadow)"/>
  ${r(560, 554, 480, 176, OAK)}${r(560, 554, 480, 176, "#000", 'opacity=".04"')}
  ${r(552, 540, 496, 14, "#eeebe5")}${r(552, 552, 496, 2, "#d6d1c8")}
  <path d="M626 540 a34 18 0 0 0 68 0 z" fill="#d9d0c3"/>
  <circle cx="644" cy="532" r="9" fill="#e48a2c"/><circle cx="661" cy="529" r="9" fill="#e48a2c"/><circle cx="677" cy="533" r="8" fill="#e48a2c"/>
  ${r(570, 730, 460, 30, "#34322f")}
  ${r(705, 586, 40, 4, "#7d5a38", 'rx="2"')}${r(935, 586, 40, 4, "#7d5a38", 'rx="2"')}
</g>

<g id="feature-spielwand" data-feature="spielwand">
  <rect x="580" y="570" width="290" height="144" rx="3" fill="#2f3834"/>
  <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="3">
    <circle cx="614" cy="602" r="12" stroke="#f3d36b"/>
    <path d="M614 582v-6M614 628v-6M594 602h-6M640 602h-6" stroke="#f3d36b"/>
    <path d="M664 690v-40h48v40M656 654l32-26 32 26M680 690v-20h12v20" stroke="#f4f1ea"/>
    <path d="M760 626c-9-9-4-20 5-17 9-3 14 8 5 17l-5 6z" stroke="#ef4a52"/>
    <path d="M790 700a40 40 0 0 1 74 0" stroke="#ef4a52"/><path d="M798 700a32 32 0 0 1 58 0" stroke="#f3d36b"/><path d="M806 700a24 24 0 0 1 42 0" stroke="#7cc47f"/>
  </g>
  <circle cx="742" cy="590" r="6" fill="#e30613"/><circle cx="826" cy="600" r="6" fill="#3f86d6"/>
  <g data-part="klappe" data-origin="725 714">${r(580, 570, 290, 144, OAK, 'rx="3"')}<rect x="586" y="576" width="278" height="132" rx="2" fill="none" stroke="#a77a4e" stroke-opacity=".5"/>${r(705, 580, 40, 5, "#7d5a38", 'rx="2.5"')}</g>
</g>

<g id="feature-arbeitsplatz" data-feature="arbeitsplatz">
  ${r(884, 572, 142, 140, "#e4ddd1", 'rx="2"')}
  ${r(898, 584, 50, 34, "#f6f2ea", 'stroke="#cfc6b8"')}${r(956, 590, 34, 26, "#f3d36b", 'opacity=".7"')}
  ${r(884, 660, 142, 9, "#b48558", 'rx="2"')}
  <path d="M928 660 l6 -40 h48 l-6 40 z" fill="#3c3c3c"/><path d="M932 656 l5 -32 h40 l-5 32 z" fill="#8fb3c9"/>
  ${r(920, 658, 66, 4, "#5a5a5a", 'rx="2"')}
  <line x1="1006" y1="660" x2="1006" y2="628" stroke="#3c3c3c" stroke-width="3"/><path d="M996 628 h20 l-4 -10 h-12 z" fill="#3c3c3c"/>
  <g data-part="klappe" data-origin="955 714">${r(880, 570, 150, 144, OAK, 'rx="3"')}<rect x="886" y="576" width="138" height="132" rx="2" fill="none" stroke="#a77a4e" stroke-opacity=".5"/>${r(935, 580, 40, 5, "#7d5a38", 'rx="2.5"')}</g>
</g>

<g id="feature-staubsauger" data-feature="staubsauger">
  <g data-part="inside">
    <polygon points="584,731.5 724,731.5 731,762 577,762" fill="#2a2826"/>
    <ellipse cx="636" cy="750" rx="34" ry="9" fill="#3c3c3c"/><ellipse cx="636" cy="748" rx="25" ry="5" fill="#4d4d4d"/>
    <rect x="676" y="746" width="44" height="6" rx="3" fill="#e30613"/>
  </g>
  <g data-part="front" data-origin="654 731.5">${r(584, 731.5, 140, 27, "#3d3a37")}${r(634, 742, 40, 3, "#6b6661", 'rx="1.5"')}<circle cx="714" cy="745" r="2.6" fill="#52e0bf"/></g>
</g>

<!-- ============ Licht ============ -->
<rect id="dunkel" x="-1200" y="-800" width="3600" height="2400" fill="#1b1612" opacity="0" pointer-events="none"/>
<g id="feature-licht" data-feature="licht" style="mix-blend-mode:screen" pointer-events="none">
  <rect x="420" y="304" width="620" height="150" fill="url(#ledGlow)"/>
  ${r(424, 300, 612, 4, "#fff6e3")}
  <g data-when="oberschrank-links"><rect x="60" y="304" width="340" height="120" fill="url(#ledGlow)"/>${r(64, 300, 332, 4, "#fff6e3")}</g>
  ${[690, 900].map((x) => `<polygon points="${x - 32},282 ${x + 32},282 ${x + 170},760 ${x - 170},760" fill="url(#cone)"/><circle cx="${x}" cy="280" r="34" fill="url(#bulb)"/>`).join("")}
  <g data-variant="ambiente">
    <rect x="420" y="692" width="620" height="40" fill="url(#warmGlow)"/>
    <rect x="570" y="756" width="460" height="34" fill="url(#warmGlow)"/>
    <g data-when="couch"><rect x="62" y="402" width="336" height="90" fill="url(#warmGlow)"/></g>
    <g data-when="regal"><rect x="80" y="441" width="300" height="46" fill="url(#warmGlow)"/></g>
    <g data-when="arbeitsplatz"><circle cx="1006" cy="640" r="40" fill="url(#bulb)"/></g>
  </g>
</g>
</svg>`;

// ---------------------------------------------------------------- Renderer
export function createPreview(svg, features, { reduceMotion }) {
  const dur = (d) => (reduceMotion() ? 0 : d);
  const byId = Object.fromEntries(features.map((f) => [f.id, f]));
  const layers = {};
  for (const f of features) {
    let g = svg.querySelector(f.layer);
    // Neues Feature nur per JSON: Layer-Gruppe entsteht automatisch aus "layerSrc"
    if (!g && f.layerSrc) {
      g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.id = f.layer.replace("#", "");
      const [x, y, w, h] = f.layerBox || [0, 0, 1200, 800];
      g.innerHTML = `<image href="${f.layerSrc}" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
      svg.querySelector("#dunkel").before(g);
    }
    layers[f.id] = g;
  }
  const part = (g, name) => g?.querySelectorAll(`[data-part="${name}"]`);
  const origin = (el) => el.getAttribute("data-origin");
  const show = (g) => gsap.set(g, { display: "inline", opacity: 1 });
  const hide = (g) => gsap.set(g, { display: "none" });
  // Nur die jüngste Animation eines Layers darf ihn verstecken (schnelles Umschalten)
  const hideIf = (g, gen) => { if (g._gen === gen) hide(g); };

  // Startzustände der bewegten Teile
  const closedState = {
    "slide-out": (g) => {
      part(g, "body").forEach((b) => gsap.set(b, { scale: 0.86, y: -10, opacity: 0, svgOrigin: origin(b) }));
      part(g, "polster").forEach((p) => gsap.set(p, { scaleY: 0.2, svgOrigin: origin(p) }));
    },
    "flip-down": (g) => part(g, "klappe").forEach((k) => gsap.set(k, { scaleY: 1, svgOrigin: origin(k) })),
    rise: (g) => {
      part(g, "arm").forEach((a) => gsap.set(a, { y: 170 }));
      part(g, "device").forEach((d) => gsap.set(d, { rotation: -14, scaleX: 0.8, svgOrigin: origin(d) }));
    },
    peek: (g) => {
      part(g, "front").forEach((f) => gsap.set(f, { y: 0, scale: 1, svgOrigin: origin(f) }));
      part(g, "inside").forEach((i) => gsap.set(i, { opacity: 0 }));
    },
    fade: (g) => gsap.set(g, { opacity: 0 }),
    light: () => {},
  };

  const animIn = {
    "slide-out": (g) => {
      show(g);
      const tl = gsap.timeline();
      part(g, "body").forEach((b) => tl.to(b, { scale: 1, y: 0, opacity: 1, duration: dur(0.7), ease: "power3.out", svgOrigin: origin(b) }, 0));
      part(g, "polster").forEach((p) => tl.to(p, { scaleY: 1, duration: dur(0.5), ease: "back.out(1.6)", svgOrigin: origin(p) }, dur(0.35)));
      gsap.fromTo(g, { opacity: 0 }, { opacity: 1, duration: dur(0.25) });
    },
    "flip-down": (g) => {
      show(g);
      part(g, "klappe").forEach((k) => gsap.fromTo(k, { scaleY: 1 }, { scaleY: 0.05, duration: dur(0.6), ease: "power2.in", svgOrigin: origin(k) }));
    },
    rise: (g) => {
      show(g);
      part(g, "arm").forEach((a) => gsap.to(a, { y: 0, duration: dur(0.75), ease: "power3.out" }));
      part(g, "device").forEach((d) => gsap.to(d, { rotation: 0, scaleX: 1, duration: dur(0.6), delay: dur(0.45), ease: "back.out(1.8)", svgOrigin: origin(d) }));
    },
    peek: (g) => {
      show(g);
      const tl = gsap.timeline();
      part(g, "front").forEach((f) => tl.to(f, { y: 26, scale: 1.08, duration: dur(0.45), ease: "power3.out", svgOrigin: origin(f) }, 0)
        .to(f, { y: 0, scale: 1, duration: dur(0.6), ease: "power3.inOut", svgOrigin: origin(f) }, dur(1.3)));
      part(g, "inside").forEach((i) => tl.to(i, { opacity: 1, duration: dur(0.2) }, 0).to(i, { opacity: 0, duration: dur(0.3) }, dur(1.6)));
    },
    fade: (g) => {
      show(g);
      gsap.fromTo(g, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: dur(0.45), ease: "power2.out" });
    },
    light: () => {},
  };

  const animOut = {
    "slide-out": (g, gen) => {
      const tl = gsap.timeline({ onComplete: () => hideIf(g, gen) });
      part(g, "polster").forEach((p) => tl.to(p, { scaleY: 0.2, duration: dur(0.3), ease: "power2.in", svgOrigin: origin(p) }, 0));
      part(g, "body").forEach((b) => tl.to(b, { scale: 0.86, y: -10, opacity: 0, duration: dur(0.4), ease: "power2.in", svgOrigin: origin(b) }, dur(0.15)));
    },
    "flip-down": (g, gen) => {
      const ks = part(g, "klappe");
      if (!ks.length) return hideIf(g, gen);
      ks.forEach((k) => gsap.to(k, { scaleY: 1, duration: dur(0.45), ease: "power2.out", svgOrigin: origin(k), onComplete: () => hideIf(g, gen) }));
    },
    rise: (g, gen) => {
      part(g, "device").forEach((d) => gsap.to(d, { rotation: -14, scaleX: 0.8, duration: dur(0.25), svgOrigin: origin(d) }));
      part(g, "arm").forEach((a) => gsap.to(a, { y: 170, duration: dur(0.5), delay: dur(0.15), ease: "power2.in", onComplete: () => hideIf(g, gen) }));
    },
    peek: (g, gen) => gsap.to(g, { opacity: 0, duration: dur(0.3), onComplete: () => hideIf(g, gen) }),
    fade: (g, gen) => gsap.to(g, { opacity: 0, y: 8, duration: dur(0.3), onComplete: () => hideIf(g, gen) }),
    light: () => {},
  };

  function setConditional(state, instant) {
    const t = instant ? 0 : dur(0.4);
    svg.querySelectorAll("[data-when]").forEach((el) => gsap.to(el, { opacity: state.active[el.dataset.when] ? 1 : 0, duration: t }));
    svg.querySelectorAll("[data-unless]").forEach((el) => gsap.to(el, { opacity: state.active[el.dataset.unless] ? 0 : 1, duration: t }));
    for (const f of features) {
      const g = layers[f.id];
      if (!g || !f.variants) continue;
      g.querySelectorAll(":scope [data-variant]").forEach((v) => {
        const on = v.dataset.variant === state.variants[f.id];
        gsap.to(v, { opacity: on ? 1 : 0, duration: t, display: on ? "inline" : "none", ...(on ? {} : { delay: 0 }) });
      });
    }
    // Licht: Abdunklung der Szene je nach Variante
    const licht = byId.licht ? state.active.licht : false;
    const dark = !licht ? 0 : state.variants.licht === "ambiente" ? 0.34 : 0.06;
    gsap.to(svg.querySelector("#dunkel"), { opacity: dark, duration: instant ? 0 : dur(0.8), ease: "power2.inOut" });
    if (layers.licht) gsap.to(layers.licht, { opacity: licht ? 1 : 0, duration: instant ? 0 : dur(0.8), display: licht ? "inline" : "none" });
  }

  function render(state, prev) {
    const instant = !prev;
    for (const f of features) {
      const g = layers[f.id];
      if (!g || f.animation === "light") continue;
      const on = !!state.active[f.id];
      const was = prev ? !!prev.active[f.id] : null;
      if (instant) {
        closedState[f.animation]?.(g);
        if (on) {
          show(g);
          // Endzustand ohne Animation
          gsap.killTweensOf(g.querySelectorAll("*"));
          if (f.animation === "slide-out") { part(g, "body").forEach((b) => gsap.set(b, { scale: 1, y: 0, opacity: 1 })); part(g, "polster").forEach((p) => gsap.set(p, { scaleY: 1 })); }
          if (f.animation === "flip-down") part(g, "klappe").forEach((k) => gsap.set(k, { scaleY: 0.05 }));
          if (f.animation === "rise") { part(g, "arm").forEach((a) => gsap.set(a, { y: 0 })); part(g, "device").forEach((d) => gsap.set(d, { rotation: 0, scaleX: 1 })); }
          if (f.animation === "fade") gsap.set(g, { opacity: 1 });
        } else hide(g);
      } else if (on !== was) {
        // laufende Animationen (inkl. onComplete → ausblenden) des Layers stoppen
        gsap.killTweensOf([g, ...g.querySelectorAll("*")]);
        const gen = (g._gen = (g._gen || 0) + 1);
        (on ? animIn : animOut)[f.animation]?.(g, gen);
      }
    }
    setConditional(state, instant);
  }

  // Ansicht: Gesamt oder Detail (viewBox-Zoom auf den Ausschnitt "focus")
  function setView(view, focusId) {
    const box = view === "detail" && byId[focusId]?.focus ? byId[focusId].focus : [0, 0, 1200, 800];
    gsap.to(svg, { attr: { viewBox: box.join(" ") }, duration: dur(0.8), ease: "power3.inOut" });
  }

  return { render, setView };
}
