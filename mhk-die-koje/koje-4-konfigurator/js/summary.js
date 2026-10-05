// ---------------------------------------------------------------------------
// Zusammenfassung „Meine Koje“: Vorschau-Klon und Export der Karte als PNG.
// ---------------------------------------------------------------------------

// Klont die Live-Vorschau in der Gesamtansicht (für Karte und Export).
export function cloneScene(svg) {
  const clone = svg.cloneNode(true);
  clone.setAttribute("viewBox", "0 0 1200 800");
  clone.removeAttribute("aria-labelledby");
  clone.setAttribute("aria-hidden", "true");
  clone.querySelector("title")?.remove();
  // IDs der Verläufe bleiben gleich – im Dokument stört das nicht, weil der Klon dieselben Definitionen nutzt.
  return clone;
}

function svgToImage(svg) {
  const clone = cloneScene(svg);
  clone.setAttribute("width", "1200");
  clone.setAttribute("height", "800");
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function wrap(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

// Zeichnet die Karte auf ein Canvas und liefert ein PNG-Blob.
export async function exportCard({ svg, title, line, items, total, url }) {
  await document.fonts?.ready;
  const W = 1200;
  const rows = Math.ceil(items.length / 2);
  const H = 1140 + rows * 56 + 150;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  const head = '900 84px "Fraunces", Georgia, serif';
  const body = (w, s) => `${w} ${s}px "Open Sans", Arial, sans-serif`;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 880, W, H - 880);
  ctx.fillStyle = "#e30613";
  ctx.fillRect(0, 0, W, 12);

  const logo = await loadImage("assets/mhk-logo.png");
  if (logo) ctx.drawImage(logo, W - 60 - 120, 12, 120, 125);

  ctx.fillStyle = "#3c3c3c";
  ctx.font = head;
  ctx.fillText(title, 60, 150);
  ctx.font = body(400, 28);
  wrap(ctx, line, 900).forEach((l, i) => ctx.fillText(l, 60, 205 + i * 40));

  const scene = await svgToImage(svg);
  ctx.save();
  ctx.fillStyle = "#efebe5";
  ctx.fillRect(60, 290, 1080, 720);
  ctx.drawImage(scene, 60, 290, 1080, 720);
  ctx.restore();
  ctx.strokeStyle = "#e6e6e6";
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 290, 1080, 720);

  ctx.fillStyle = "#3c3c3c";
  ctx.font = body(700, 30);
  ctx.fillText(`Deine Features (${items.length} von ${total})`, 60, 1080);
  ctx.font = body(400, 26);
  items.forEach((it, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 60 + col * 540;
    const y = 1140 + row * 56;
    ctx.fillStyle = "#e30613";
    ctx.beginPath();
    ctx.arc(x + 14, y - 9, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(x + 7, y - 9);
    ctx.lineTo(x + 12, y - 4);
    ctx.lineTo(x + 21, y - 15);
    ctx.stroke();
    ctx.fillStyle = "#3c3c3c";
    ctx.fillText(it, x + 40, y);
  });

  ctx.fillStyle = "#6b6b6b";
  ctx.font = body(400, 20);
  ctx.fillText(`musterhaus küchen · Die Koje · erstellt am ${new Date().toLocaleDateString("de-DE")}`, 60, H - 100);
  ctx.fillText("Klickdummy – Konfiguration zur Orientierung, keine Bestellung.", 60, H - 70);
  if (url) ctx.fillText(url.length > 95 ? `${url.slice(0, 92)}…` : url, 60, H - 40);
  return new Promise((resolve) => c.toBlob(resolve, "image/png"));
}
