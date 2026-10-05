// ---------------------------------------------------------------------------
// Interaktive Szene der Koje – Frontalansicht, viewBox 1200 × 800, Boden y = 700.
//
// Ebenen (data-depth = Stärke der Mikro-Parallaxe):
//   layer-back   0.12  Wand, Fenster, Boden
//   layer-mid    0.4   Nische + #couch, #oberschrank, #lichtleiste, #tablet-halter,
//                      Unterschränke, #schublade-unten, Hochschrank
//   layer-front  1     Pendelleuchten, #insel mit #spielwand und #staubsauger-fach
//   dunkel/tönung      Abdunklung + Farbton der Lichtstimmung (über allem Inhalt)
//   lights-*           Lichtkegel, LED-Schein, Sockellicht (über der Abdunklung)
//   hints-*            pulsierende Hinweispunkte + Hand-Hinweis
//
// Interaktive Gruppen tragen class="hit", role="button" und tabindex="0".
// Grafiken lassen sich pro Gruppe austauschen (siehe README).
// ---------------------------------------------------------------------------

const oak = "url(#oak)";
const FRONT = "#dcd6cb";
const GAP = "#8f877c";
const GRIP = "#bdb5a8";

const r = (x, y, w, h, fill, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;

// Frontenreihe; rows = Anteile von oben nach unten
function fronts(x0, y0, h, segs) {
  let out = "";
  let x = x0;
  for (const [w, rows, gripBottom] of segs) {
    let y = y0;
    for (const fr of rows) {
      const fh = h * fr;
      out += r(x + 1.5, y + 1.5, w - 3, fh - 3, FRONT);
      out += r(x + 1.5, gripBottom ? y + fh - 4 : y + 1.5, w - 3, 2.5, GRIP);
      y += fh;
    }
    x += w;
  }
  return out;
}

const focusRing = (x, y, w, h) => `<rect class="focus-ring" x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/>`;

export const sceneMarkup = `
<svg class="scene" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid meet" role="group" aria-label="Interaktive Koje – Elemente mit Tab erreichen, mit Enter bedienen" xmlns="http://www.w3.org/2000/svg">
<defs>
  <pattern id="oak" width="60" height="200" patternUnits="userSpaceOnUse">
    <rect width="60" height="200" fill="#c99a6a"/>
    <path d="M8 0 C12 60 4 120 9 200 M22 0 C18 70 26 140 21 200 M37 0 C41 50 33 130 38 200 M51 0 C47 80 55 150 50 200" stroke="#a77a4e" stroke-opacity=".28" stroke-width="1.4" fill="none"/>
  </pattern>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfb08a"/><stop offset="1" stop-color="#dcc29f"/></linearGradient>
  <linearGradient id="ledGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".95"/><stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/></linearGradient>
  <linearGradient id="nicheGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc77d" stop-opacity=".9"/><stop offset="1" stop-color="#ffc77d" stop-opacity="0"/></linearGradient>
  <linearGradient id="floorGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb866" stop-opacity=".9"/><stop offset="1" stop-color="#ffb866" stop-opacity="0"/></linearGradient>
  <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffdca0" stop-opacity=".7"/><stop offset="1" stop-color="#ffdca0" stop-opacity="0"/></linearGradient>
  <linearGradient id="beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1d6" stop-opacity=".9"/><stop offset="1" stop-color="#fff1d6" stop-opacity="0"/></linearGradient>
  <radialGradient id="bulb"><stop offset="0" stop-color="#fff7e6"/><stop offset=".35" stop-color="#ffd08a" stop-opacity=".85"/><stop offset="1" stop-color="#ffd08a" stop-opacity="0"/></radialGradient>
  <radialGradient id="shadow"><stop offset="0" stop-color="#000" stop-opacity=".24"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  <clipPath id="clip-tablet"><rect x="380" y="0" width="680" height="470"/></clipPath>
  <clipPath id="clip-tafel"><rect x="580" y="570" width="290" height="144" rx="3"/></clipPath>
  <clipPath id="clip-schublade"><polygon id="schublade-clip" points="0,0"/></clipPath>
  <clipPath id="clip-fach"><polygon id="fach-clip" points="0,0"/></clipPath>
</defs>

<!-- ================= Hintere Ebene ================= -->
<g id="layer-back" data-depth="0.12">
  <rect class="sc-wall" x="-1200" y="-800" width="3600" height="1500"/>
  <g id="fenster">
    ${r(80, 120, 250, 230, "#3c3c3c")}
    <rect class="sc-sky" x="88" y="128" width="113" height="214"/>
    <rect class="sc-sky" x="209" y="128" width="113" height="214"/>
    <path d="M110 320 L180 150 M140 330 L196 196 M232 320 L300 150" stroke="#fff" stroke-opacity=".45" stroke-width="9"/>
  </g>
  <rect x="-1200" y="700" width="3600" height="900" fill="url(#floor)"/>
  <g fill="#a8865c" opacity=".35">
    ${[732, 766].map((y) => r(-1200, y, 3600, 1.5, "#a8865c")).join("")}
    ${[120, 470, 820, 1170].map((x, i) => r(x - (i % 2) * 90, 700, 1.5, 32, "#a8865c")).join("")}
    ${[300, 650, 1000].map((x) => r(x, 733, 1.5, 33, "#a8865c")).join("")}
  </g>
</g>

<!-- ================= Mittlere Ebene ================= -->
<g id="layer-mid" data-depth="0.4">
  <!-- Nische -->
  ${r(46, 400, 318, 300, "#000", 'opacity=".07"')}
  ${r(34, 386, 342, 16, oak)}${r(34, 386, 12, 314, oak)}${r(364, 386, 12, 314, oak)}

  <!-- Couch -->
  <g id="couch" class="hit" tabindex="0" role="button" aria-pressed="false" aria-label="Couch ausfahren">
    <rect x="46" y="400" width="318" height="300" fill="transparent"/>
    <ellipse id="couch-shadow" cx="205" cy="700" rx="150" ry="9" fill="url(#shadow)"/>
    <g id="couch-body">
      <g id="couch-polster">
        <rect x="66" y="486" width="134" height="112" rx="22" fill="#d8c8b4"/>
        <rect x="210" y="486" width="134" height="112" rx="22" fill="#d8c8b4"/>
        <rect x="268" y="518" width="66" height="58" rx="16" fill="#c61d27" transform="rotate(8 301 547)"/>
        <rect x="80" y="526" width="60" height="52" rx="14" fill="#a88f78" transform="rotate(-8 110 552)"/>
      </g>
      ${r(56, 622, 298, 76, oak, 'rx="4"')}
      ${r(62, 650, 286, 46, "#a77a4e", 'opacity=".25" rx="3"')}
      ${r(185, 656, 40, 4, "#7d5a38", 'rx="2"')}
      <rect x="60" y="594" width="290" height="32" rx="14" fill="#cdbba5"/>
      ${r(72, 600, 266, 3, "#fff", 'opacity=".35" rx="1.5"')}
    </g>
    <g id="couch-label" opacity="0">
      <rect x="85" y="432" width="240" height="32" rx="16" fill="#fff"/>
      <text x="205" y="453" text-anchor="middle" class="sc-label">Sitzplatz für [Platzhalter] Personen</text>
    </g>
    ${focusRing(40, 394, 330, 312)}
  </g>

  <!-- Oberschrank -->
  <g id="oberschrank">
    ${r(400, 140, 640, 160, GAP)}
    ${fronts(400, 140, 160, [[140, [1], true], [160, [1], true], [180, [1], true], [160, [1], true]])}
  </g>

  <!-- Nischenrückwand, Armatur, Pflanze -->
  ${r(400, 300, 640, 170, oak)}
  ${r(636, 400, 8, 70, "#bfc1c3", 'rx="3"')}${r(614, 400, 30, 8, "#bfc1c3", 'rx="4"')}
  ${r(962, 436, 36, 34, "#d9d0c3", 'rx="5"')}
  <g fill="#5d7752"><circle cx="974" cy="424" r="16"/><circle cx="990" cy="418" r="14"/><circle cx="982" cy="405" r="13"/><circle cx="968" cy="411" r="11"/></g>

  <!-- Lichtleiste (Klick wechselt die Stimmung) -->
  <g id="lichtleiste" class="hit" tabindex="0" role="button" aria-label="Lichtstimmung wechseln">
    <rect x="400" y="286" width="640" height="34" fill="transparent"/>
    <rect class="sc-ledstrip" x="404" y="300" width="632" height="4"/>
    ${focusRing(396, 284, 648, 38)}
  </g>

  <!-- Tablet-Halterung -->
  <g id="tablet-halter" class="hit" tabindex="0" role="button" aria-pressed="false" aria-label="Tablet-Halterung ausfahren">
    <rect x="690" y="300" width="140" height="178" fill="transparent"/>
    <g clip-path="url(#clip-tablet)">
      <g id="tablet-move" transform="translate(0 165)">
        ${r(755, 400, 10, 74, "#bfc1c3", 'rx="3"')}
        <g id="tablet-device">
          <rect x="700" y="318" width="120" height="86" rx="8" fill="#3c3c3c"/>
          <rect x="707" y="325" width="106" height="72" rx="2" fill="#fbfaf8"/>
          <rect x="707" y="325" width="106" height="12" fill="#e30613"/>
          <text x="712" y="334" class="sc-tab-head">Rezept · Schritt 2/5</text>
          <text x="712" y="351" class="sc-tab-title">Ofengemüse</text>
          ${r(712, 358, 52, 3, "#bdb8b0", 'rx="1.5"')}${r(712, 365, 44, 3, "#bdb8b0", 'rx="1.5"')}${r(712, 372, 56, 3, "#bdb8b0", 'rx="1.5"')}${r(712, 379, 38, 3, "#bdb8b0", 'rx="1.5"')}
          <circle cx="795" cy="372" r="13" fill="none" stroke="#eee" stroke-width="3"/>
          <circle id="tablet-ring" cx="795" cy="372" r="13" fill="none" stroke="#e30613" stroke-width="3" stroke-dasharray="81.7" stroke-dashoffset="0" transform="rotate(-90 795 372)"/>
          <text id="tablet-timer" x="795" y="375" text-anchor="middle" class="sc-tab-timer">12:00</text>
        </g>
      </g>
    </g>
    ${r(715, 468, 90, 3, "#1b1b1c")}
    ${focusRing(690, 300, 140, 180)}
  </g>

  <!-- Arbeitsplatte + Unterschränke -->
  ${r(394, 470, 652, 14, "#eeebe5")}${r(394, 482, 652, 2, "#d6d1c8")}
  ${r(400, 484, 640, 196, GAP)}
  ${r(401.5, 485.5, 137, 87, FRONT)}${r(401.5, 485.5, 137, 2.5, GRIP)}
  ${fronts(540, 484, 196, [[160, [0.25, 0.33, 0.42]], [180, [1]], [160, [0.25, 0.33, 0.42]]])}
  ${r(400, 680, 640, 20, "#34322f")}

  <!-- Schublade unten (Vollauszug mit Töpfen) -->
  <g id="schublade-unten" class="hit" tabindex="0" role="button" aria-pressed="false" aria-label="Schublade unten öffnen – ziehen oder Enter, Pfeiltasten verschieben">
    <g id="schublade-innen">
      <polygon id="schublade-boden" points="0,0" fill="#e4ddd1"/>
      <g clip-path="url(#clip-schublade)">
        <g id="schublade-inhalt">
          <ellipse cx="438" cy="0" rx="28" ry="11" fill="#5a5a5a"/><ellipse cx="438" cy="0" rx="22" ry="8" fill="#2f2f2f"/>
          <ellipse cx="497" cy="2" rx="30" ry="12" fill="#bfc1c3"/><ellipse cx="497" cy="2" rx="24" ry="9" fill="#8e9194"/>
          <rect x="520" y="-2" width="16" height="4" rx="2" fill="#3c3c3c"/>
        </g>
      </g>
      <polygon id="schublade-rand" points="0,0" fill="#cfc6b8"/>
    </g>
    <g id="schublade-front">
      ${r(401.5, 577.5, 137, 99, FRONT)}${r(401.5, 577.5, 137, 3, GRIP)}
    </g>
    ${focusRing(396, 572, 147, 112)}
  </g>

  <!-- Hochschrank -->
  <g id="hochschrank">
    ${r(1040, 110, 130, 570, GAP)}
    ${r(1041.5, 111.5, 127, 187, FRONT)}
    <rect x="1044" y="304" width="122" height="116" rx="3" fill="#1d1d1e"/>${r(1056, 312, 98, 5, "#bfc1c3", 'rx="2"')}
    ${r(1041.5, 425.5, 127, 253, FRONT)}${r(1041.5, 425.5, 127, 2.5, GRIP)}${r(1041.5, 111.5, 127, 2.5, GRIP)}
    ${r(1170, 110, 6, 590, oak)}${r(1040, 680, 130, 20, "#34322f")}
  </g>
</g>

<!-- ================= Vordere Ebene ================= -->
<g id="layer-front" data-depth="1">
  <g id="pendel">
    ${[680, 900].map((x) => `<line x1="${x}" y1="-60" x2="${x}" y2="236" stroke="#34322f" stroke-width="2"/>
    <path d="M${x - 11} 236 h22 l26 44 h-74 z" fill="#3c3c3c"/><ellipse cx="${x}" cy="280" rx="37" ry="4" fill="#262626"/>`).join("")}
  </g>

  <g id="insel">
    <ellipse cx="800" cy="762" rx="300" ry="16" fill="url(#shadow)"/>
    ${r(560, 554, 480, 176, oak)}
    ${r(560, 554, 480, 176, "#000", 'opacity=".04"')}
    ${r(552, 540, 496, 14, "#eeebe5")}${r(552, 552, 496, 2, "#d6d1c8")}
    <path d="M626 540 a34 18 0 0 0 68 0 z" fill="#d9d0c3"/>
    <circle cx="644" cy="532" r="9" fill="#e48a2c"/><circle cx="661" cy="529" r="9" fill="#e48a2c"/><circle cx="677" cy="533" r="8" fill="#e48a2c"/>
    ${r(944, 535, 80, 5, "#a77a4e", 'rx="2"')}
    <!-- offenes Regal rechts -->
    ${r(898, 590, 122, 84, "#e4ddd1")}
    ${[["#3c3c3c", 14, 60], ["#c61d27", 16, 66], ["#b5a48e", 12, 56], ["#6f7f6a", 16, 62]].map(([c, w, h], i) => r(910 + i * 20, 674 - h, w, h, c, 'rx="1"')).join("")}
    ${r(570, 730, 460, 30, "#34322f")}

    <!-- Spielwand -->
    <g id="spielwand" class="hit" tabindex="0" role="button" aria-pressed="false" aria-label="Spielwand aufklappen">
      <rect id="spielwand-tafel" x="580" y="570" width="290" height="144" rx="3" fill="#2f3834"/>
      <g opacity=".5" fill="none" stroke-linecap="round" stroke-width="2.4">
        <circle cx="612" cy="598" r="10" stroke="#f3d36b"/>
        <path d="M612 580v-5M612 621v-5M594 598h-5M635 598h-5" stroke="#f3d36b"/>
      </g>
      <text x="752" y="602" class="sc-chalk">KOJE</text>
      <g id="spielwand-zeichnung" clip-path="url(#clip-tafel)"></g>
      <rect id="spielwand-ablage" x="576" y="712" width="298" height="8" rx="2" fill="#b48558" opacity="0"/>
      <g id="spielwand-palette" opacity="0">
        ${[["#f4f1ea", "Kreide weiß"], ["#f3d36b", "Kreide gelb"], ["#ef4a52", "Kreide rot"]].map(([c, l], i) => `
        <g class="sc-color" data-color="${c}" role="button" tabindex="-1" aria-label="${l}">
          <circle cx="852" cy="${592 + i * 28}" r="11" fill="${c}" stroke="#2f3834" stroke-width="3"/>
        </g>`).join("")}
        <g class="sc-clear" role="button" tabindex="-1" aria-label="Tafel löschen">
          <circle cx="852" cy="690" r="11" fill="#3c4843"/>
          <path d="M847 685l10 10M857 685l-10 10" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
        </g>
      </g>
      <g id="spielwand-klappe">
        ${r(580, 570, 290, 144, oak, 'rx="3"')}
        <rect x="586" y="576" width="278" height="132" rx="2" fill="none" stroke="#a77a4e" stroke-opacity=".5"/>
        ${r(705, 580, 40, 5, "#7d5a38", 'rx="2.5"')}
      </g>
      ${focusRing(574, 564, 302, 160)}
    </g>

    <!-- Sockelfach: Staubsauger -->
    <g id="staubsauger-fach" class="hit" tabindex="0" role="button" aria-pressed="false" aria-label="Sockelfach mit Staubsauger öffnen – ziehen oder Enter, Pfeiltasten verschieben">
      <g id="fach-innen">
        <polygon id="fach-boden" points="0,0" fill="#2a2826"/>
        <g clip-path="url(#clip-fach)">
          <g id="fach-inhalt">
            <ellipse cx="626" cy="0" rx="32" ry="10" fill="#3c3c3c"/><ellipse cx="626" cy="-2" rx="24" ry="6" fill="#4d4d4d"/><circle cx="646" cy="0" r="2.2" fill="#52e0bf"/>
            <rect x="664" y="-3" width="52" height="6" rx="3" fill="#e30613"/><rect x="700" y="-6" width="18" height="12" rx="3" fill="#3c3c3c"/>
          </g>
        </g>
      </g>
      <g id="fach-front">
        ${r(584, 731.5, 140, 27, "#3d3a37")}${r(634, 742, 40, 3, "#6b6661", 'rx="1.5"')}
      </g>
      ${focusRing(578, 726, 152, 40)}
    </g>
  </g>
</g>

<!-- ================= Licht-Overlays ================= -->
<rect class="sc-dark" x="-1200" y="-800" width="3600" height="2400" pointer-events="none"/>
<rect class="sc-tint" x="-1200" y="-800" width="3600" height="2400" pointer-events="none"/>
<g class="lights" data-depth="0.12" pointer-events="none">
  <polygon class="sc-beam" points="88,128 322,128 640,800 300,800" fill="url(#beam)"/>
</g>
<g class="lights" data-depth="0.4" pointer-events="none">
  <rect class="sc-led" x="400" y="304" width="640" height="150" fill="url(#ledGlow)"/>
  <rect class="sc-led-line" x="404" y="300" width="632" height="4" fill="#fff6e3"/>
  <rect class="sc-accent" x="46" y="402" width="318" height="90" fill="url(#nicheGlow)"/>
  <rect class="sc-plinth" x="400" y="692" width="640" height="40" fill="url(#floorGlow)"/>
</g>
<g class="lights" data-depth="1" pointer-events="none">
  ${[680, 900].map((x) => `<polygon class="sc-cone" points="${x - 32},282 ${x + 32},282 ${x + 170},760 ${x - 170},760" fill="url(#cone)"/>
  <circle class="sc-bulb" cx="${x}" cy="280" r="34" fill="url(#bulb)"/>`).join("")}
  <rect class="sc-plinth" x="570" y="756" width="460" height="34" fill="url(#floorGlow)"/>
</g>

<!-- ================= Hinweise ================= -->
<g class="hints" data-depth="0.4" pointer-events="none">
  <g class="hint" data-for="couch"><circle cx="205" cy="610" r="9"/></g>
  <g class="hint" data-for="licht"><circle cx="560" cy="302" r="9"/></g>
  <g class="hint" data-for="tablet-halter"><circle cx="760" cy="455" r="9"/></g>
  <g class="hint" data-for="schublade-unten"><circle cx="470" cy="628" r="9"/></g>
  <g id="hand-hint" transform="translate(484 600)">
    <g class="hand-move">
      <path d="M0 0 v-30 a6 6 0 0 1 12 0 v22 v-8 a6 6 0 0 1 12 0 v8 v-4 a6 6 0 0 1 12 0 v6 v-2 a6 6 0 0 1 12 0 v18 c0 18 -10 30 -28 30 h-6 c-12 0 -18 -6 -24 -16 l-12 -20 a6 6 0 0 1 10 -6 z" fill="#fff" stroke="#3c3c3c" stroke-width="2.5" stroke-linejoin="round"/>
    </g>
  </g>
</g>
<g class="hints" data-depth="1" pointer-events="none">
  <g class="hint" data-for="spielwand"><circle cx="725" cy="642" r="9"/></g>
  <g class="hint" data-for="staubsauger-fach"><circle cx="654" cy="745" r="9"/></g>
</g>
</svg>`;
