// Prozedurale Canvas-Texturen für die Blockout-Küche.
// Deterministisch (fester Seed), damit jede Ansicht gleich aussieht.
import * as THREE from "three";

function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")];
}

function toTexture(c) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function rng(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

// Holzfurnier, Maserung vertikal.
export function woodTexture({ base = "#b98b5e", grain = "#7f5a38", seed = 7 } = {}) {
  const w = 512, h = 1024;
  const [c, g] = makeCanvas(w, h);
  const r = rng(seed);
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 240; i++) {
    const x = r() * w, amp = 2 + r() * 9, freq = 0.003 + r() * 0.009, ph = r() * 6.28;
    g.strokeStyle = grain;
    g.globalAlpha = 0.035 + r() * 0.13;
    g.lineWidth = 0.6 + r() * 2.4;
    g.beginPath();
    for (let y = 0; y <= h; y += 8) {
      const xx = x + Math.sin(y * freq + ph) * amp + Math.sin(y * freq * 3.1 + ph) * amp * 0.3;
      if (y === 0) g.moveTo(xx, y);
      else g.lineTo(xx, y);
    }
    g.stroke();
  }
  g.globalAlpha = 1;
  return toTexture(c);
}

// Eichendielen, längs in x-Richtung.
export function plankTexture({ seed = 3 } = {}) {
  const S = 1024, rows = 8;
  const [c, g] = makeCanvas(S, S);
  const r = rng(seed);
  const tones = ["#d6b993", "#cfb08a", "#dcc19c", "#cba982", "#d4b690"];
  for (let i = 0; i < rows; i++) {
    const y0 = (i * S) / rows, hh = S / rows;
    let x = -r() * S * 0.6;
    while (x < S) {
      const len = S * (0.45 + r() * 0.5);
      g.fillStyle = tones[Math.floor(r() * tones.length)];
      g.fillRect(x, y0, len, hh);
      for (let k = 0; k < 26; k++) {
        const yy = y0 + r() * hh, amp = 1 + r() * 3, ph = r() * 6;
        const xs = Math.max(x, 0), xe = Math.min(x + len, S);
        g.strokeStyle = "#9c7a52";
        g.globalAlpha = 0.04 + r() * 0.1;
        g.lineWidth = 0.5 + r() * 1.5;
        g.beginPath();
        for (let xx = xs; xx <= xe; xx += 12) {
          const v = yy + Math.sin(xx * 0.012 + ph) * amp;
          if (xx === xs) g.moveTo(xx, v);
          else g.lineTo(xx, v);
        }
        g.stroke();
      }
      g.globalAlpha = 0.3;
      g.fillStyle = "#7d6143";
      g.fillRect(x, y0, 2, hh);
      g.globalAlpha = 1;
      x += len;
    }
    g.globalAlpha = 0.35;
    g.fillStyle = "#7d6143";
    g.fillRect(0, y0, S, 2);
    g.globalAlpha = 1;
  }
  return toTexture(c);
}

// Kreidetafel der Spielwand mit Kinderzeichnungen.
export function chalkTexture() {
  const W = 1024, H = 512;
  const [c, g] = makeCanvas(W, H);
  const r = rng(11);
  g.fillStyle = "#2f3834";
  g.fillRect(0, 0, W, H);
  // Wischspuren
  for (let i = 0; i < 40; i++) {
    g.strokeStyle = "#ffffff";
    g.globalAlpha = 0.015 + r() * 0.025;
    g.lineWidth = 20 + r() * 40;
    g.beginPath();
    g.arc(r() * W, r() * H, 60 + r() * 160, r() * 6, r() * 6 + 1.5);
    g.stroke();
  }
  g.globalAlpha = 1;

  const chalk = (color, width, draw) => {
    g.strokeStyle = color;
    g.lineCap = "round";
    g.lineJoin = "round";
    for (let pass = 0; pass < 3; pass++) {
      g.save();
      g.globalAlpha = pass === 0 ? 0.85 : 0.35;
      g.lineWidth = width - pass;
      g.translate((r() - 0.5) * 2.5, (r() - 0.5) * 2.5);
      g.beginPath();
      draw();
      g.stroke();
      g.restore();
    }
  };

  // Sonne
  chalk("#f3d36b", 6, () => {
    g.arc(130, 110, 46, 0, Math.PI * 2);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      g.moveTo(130 + Math.cos(a) * 62, 110 + Math.sin(a) * 62);
      g.lineTo(130 + Math.cos(a) * 90, 110 + Math.sin(a) * 90);
    }
  });
  // Haus
  chalk("#f4f1ea", 6, () => {
    g.rect(270, 250, 170, 150);
    g.moveTo(255, 255); g.lineTo(355, 165); g.lineTo(455, 255);
    g.rect(335, 330, 40, 70);
    g.rect(290, 280, 34, 34);
  });
  // Herz in MHK-Rot
  chalk("#ef4a52", 7, () => {
    g.moveTo(520, 220);
    g.bezierCurveTo(470, 170, 500, 120, 540, 150);
    g.bezierCurveTo(580, 120, 610, 170, 560, 220);
    g.lineTo(540, 245);
    g.closePath();
  });
  // Strichmännchen
  const person = (x, y, col) => chalk(col, 6, () => {
    g.moveTo(x + 18, y); g.arc(x, y, 18, 0, Math.PI * 2);
    g.moveTo(x, y + 18); g.lineTo(x, y + 80);
    g.moveTo(x - 30, y + 45); g.lineTo(x + 30, y + 45);
    g.moveTo(x, y + 80); g.lineTo(x - 22, y + 120);
    g.moveTo(x, y + 80); g.lineTo(x + 22, y + 120);
  });
  person(640, 300, "#9fd0f0");
  person(720, 320, "#f2a7c3");
  // Regenbogen
  ["#ef4a52", "#f59a3c", "#f3d36b", "#7cc47f", "#6aa8e8"].forEach((col, i) => {
    chalk(col, 9, () => g.arc(900, 470, 150 - i * 14, Math.PI * 1.08, Math.PI * 1.92));
  });
  // Blumen
  [[90, 470], [150, 440], [205, 475]].forEach(([x, y], i) => {
    chalk("#7cc47f", 5, () => { g.moveTo(x, H); g.lineTo(x, y); });
    chalk(["#f2a7c3", "#f3d36b", "#9fd0f0"][i], 6, () => g.arc(x, y - 14, 14, 0, Math.PI * 2));
  });
  // Schrift
  g.fillStyle = "#f4f1ea";
  g.globalAlpha = 0.85;
  g.font = "bold 74px 'Chalkboard SE', 'Comic Sans MS', 'Segoe Print', cursive";
  g.fillText("KOJE", 720, 150);
  g.globalAlpha = 1;
  return toTexture(c);
}

// Bildschirminhalt des Tablets (illustrativ).
export function recipeTexture() {
  const W = 600, H = 400;
  const [c, g] = makeCanvas(W, H);
  g.fillStyle = "#fbfaf8";
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#e30613";
  g.fillRect(0, 0, W, 58);
  g.fillStyle = "#ffffff";
  g.font = "600 24px 'Open Sans', Arial, sans-serif";
  g.fillText("Rezept  ·  Schritt 2 von 5", 26, 38);
  g.fillStyle = "#3c3c3c";
  g.font = "900 40px Georgia, serif";
  g.fillText("Ofengemüse mit Feta", 26, 116);
  g.font = "400 22px 'Open Sans', Arial, sans-serif";
  ["Paprika in Streifen schneiden", "Zucchini würfeln", "Feta zerbröseln", "Mit Öl und Kräutern mischen"].forEach((t, i) => {
    const y = 172 + i * 50;
    g.strokeStyle = i < 2 ? "#e30613" : "#9a9a9a";
    g.lineWidth = 2.5;
    g.strokeRect(26, y - 20, 24, 24);
    if (i < 2) {
      g.beginPath();
      g.moveTo(31, y - 8); g.lineTo(37, y - 2); g.lineTo(46, y - 15);
      g.stroke();
    }
    g.fillStyle = i < 2 ? "#9a9a9a" : "#3c3c3c";
    g.fillText(t, 66, y);
  });
  g.strokeStyle = "#e30613";
  g.lineWidth = 8;
  g.beginPath();
  g.arc(500, 250, 62, -Math.PI / 2, Math.PI * 0.9);
  g.stroke();
  g.fillStyle = "#3c3c3c";
  g.font = "700 30px 'Open Sans', Arial, sans-serif";
  g.textAlign = "center";
  g.fillText("12:00", 500, 261);
  return toTexture(c);
}
