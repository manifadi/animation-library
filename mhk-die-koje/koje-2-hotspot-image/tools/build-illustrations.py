#!/usr/bin/env python3
"""
Erzeugt die Platzhalter-Illustrationen der Koje (16:9 und 4:5) und gibt die
exakten Hotspot-Koordinaten in Prozent aus.

Nur für die Platzhalter-Grafiken nötig – die Seite selbst braucht keinen Build.
Sobald echte Kampagnenmotive vorliegen, werden die SVGs einfach ersetzt und die
Koordinaten in data/hotspots.json von Hand gesetzt.

    python3 tools/build-illustrations.py          # schreibt assets/koje-*.svg, druckt Koordinaten
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "..", "assets")

C = {
    "red": "#e30613", "ink": "#3c3c3c", "front": "#dcd6cb", "gap": "#8f877c",
    "oak": "#c99a6a", "oakDark": "#a77a4e", "counter": "#eeebe5", "plinth": "#34322f",
    "steel": "#bfc1c3", "chalk": "#2f3834", "fabric": "#cdbba5", "fabric2": "#d8c8b4",
    "inner": "#e4ddd1", "pot": "#d9d0c3", "leaf": "#5d7752",
}

DEFS = f"""
<defs>
  <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f0ea"/><stop offset="1" stop-color="#e8e1d6"/></linearGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d2b48c"/><stop offset="1" stop-color="#dcc29f"/></linearGradient>
  <linearGradient id="led" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe3b3" stop-opacity=".85"/><stop offset="1" stop-color="#ffe3b3" stop-opacity="0"/></linearGradient>
  <linearGradient id="shelfGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd59a" stop-opacity=".7"/><stop offset="1" stop-color="#ffd59a" stop-opacity="0"/></linearGradient>
  <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe0a8" stop-opacity=".55"/><stop offset="1" stop-color="#ffe0a8" stop-opacity="0"/></linearGradient>
  <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f9fb"/><stop offset="1" stop-color="#dfe8ee"/></linearGradient>
  <linearGradient id="ovenGlass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2a2c"/><stop offset="1" stop-color="#151516"/></linearGradient>
  <radialGradient id="shadow"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  <radialGradient id="bulb"><stop offset="0" stop-color="#fff6e0"/><stop offset=".4" stop-color="#ffd68f" stop-opacity=".8"/><stop offset="1" stop-color="#ffd68f" stop-opacity="0"/></radialGradient>
  <pattern id="oakGrain" width="60" height="200" patternUnits="userSpaceOnUse">
    <rect width="60" height="200" fill="{C['oak']}"/>
    <path d="M8 0 C12 60 4 120 9 200 M22 0 C18 70 26 140 21 200 M37 0 C41 50 33 130 38 200 M51 0 C47 80 55 150 50 200" stroke="{C['oakDark']}" stroke-opacity=".28" stroke-width="1.4" fill="none"/>
  </pattern>
</defs>"""


def rect(x, y, w, h, fill, rx=0, extra=""):
    return f'<rect x="{x:g}" y="{y:g}" width="{w:g}" height="{h:g}" rx="{rx:g}" fill="{fill}" {extra}/>'


def fronts(x0, y0, widths, types, h):
    """Frontenreihe mit 3-px-Fugen und Grifffuge oben. Zeilen von oben nach unten."""
    out, x = [], x0
    rows = {"drawers3": [0.25, 0.33, 0.42], "drawers2": [0.45, 0.55], "door": [1]}
    for w, t in zip(widths, types):
        y = y0
        for fr in rows[t]:
            fh = h * fr
            out.append(rect(x + 1.5, y + 1.5, w - 3, fh - 3, C["front"]))
            out.append(rect(x + 1.5, y + 1.5, w - 3, 2.5, "#bdb5a8"))
            y += fh
        x += w
    return "".join(out)


# ---------------------------------------------------------------- Bauteile
# Jedes Bauteil: (svg, breite, höhe, {hotspot-id: (x, y)}) in lokalen Koordinaten.

def couch():
    s = []
    s.append('<ellipse cx="170" cy="300" rx="200" ry="14" fill="url(#shadow)"/>')
    s.append(rect(0, 226, 340, 70, "url(#oakGrain)", 4))
    s.append(rect(6, 252, 328, 44, C["oakDark"], 3, 'opacity=".35"'))
    s.append(rect(150, 262, 40, 4, "#7d5a38", 2))
    s.append(rect(10, 294, 320, 6, C["plinth"]))
    s.append(rect(6, 186, 328, 46, C["fabric"], 18))
    s.append(rect(14, 90, 150, 110, C["fabric2"], 24))
    s.append(rect(176, 90, 150, 110, C["fabric2"], 24))
    s.append(rect(24, 118, 82, 68, "#a88f78", 18, 'transform="rotate(-8 65 152)"'))
    s.append(rect(230, 112, 86, 74, "#c61d27", 18, 'transform="rotate(7 273 149)"'))
    s.append(rect(20, 194, 300, 3, "#ffffff", 1.5, 'opacity=".35"'))
    return "".join(s), 340, 300, {"couch": (170, 214)}


def shelf():
    s = [rect(10, 62, 280, 46, "url(#shelfGlow)")]
    s.append(rect(0, 52, 300, 10, "url(#oakGrain)", 2))
    for i, (w, h, col) in enumerate([(16, 46, "#3c3c3c"), (14, 40, "#b5a48e"), (16, 50, "#c61d27"), (12, 36, "#e9e2d6"), (16, 44, "#6f7f6a")]):
        s.append(rect(24 + i * 19, 52 - h, w, h, col, 1))
    s.append(rect(210, 18, 30, 34, C["pot"], 6))
    return "".join(s), 300, 110, {}


def window():
    s = [rect(0, 0, 310, 220, C["ink"], 3)]
    s.append(rect(8, 8, 143, 204, "url(#glass)"))
    s.append(rect(159, 8, 143, 204, "url(#glass)"))
    s.append('<path d="M30 190 L120 30 M60 200 L140 60 M180 190 L280 30" stroke="#fff" stroke-opacity=".55" stroke-width="10"/>')
    return "".join(s), 310, 220, {}


def kitchen_wall():
    W = 860
    s = []
    # Oberschränke
    s.append(rect(0, 0, W, 180, C["gap"]))
    s.append(fronts(0, 0, [140, 140, 200, 140, 120, 120], ["door"] * 6, 180))
    # Nischenrückwand + LED-Licht
    s.append(rect(0, 180, W, 170, "url(#oakGrain)"))
    s.append(rect(0, 184, W, 130, "url(#led)"))
    s.append(rect(6, 180, W - 12, 4, "#fff4dc"))
    # Tablet-Halterung (ausgefahren)
    s.append(rect(197, 296, 6, 54, C["steel"], 2))
    s.append(rect(150, 232, 100, 70, C["ink"], 7))
    s.append(rect(156, 238, 88, 58, "#fbfaf8", 2))
    s.append(rect(156, 238, 88, 11, C["red"], 2))
    for i, w in enumerate([60, 48, 66, 40]):
        s.append(rect(164, 256 + i * 9, w, 3.5, "#b4b0aa", 1.5))
    s.append(rect(180, 349, 40, 2, "#1b1b1c"))
    # Armatur
    s.append(rect(356, 280, 8, 70, C["steel"], 3))
    s.append(rect(334, 280, 30, 8, C["steel"], 4))
    # Pflanze
    s.append(rect(592, 314, 36, 36, C["pot"], 5))
    for cx, cy, r in [(604, 302, 16), (620, 296, 14), (612, 284, 13), (598, 290, 11)]:
        s.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{C["leaf"]}"/>')
    # Steckdosen-Turm [Platzhalter]
    s.append(rect(752, 296, 24, 54, "#f1eee9", 4, f'stroke="#cfc9be" stroke-width="1.5"'))
    for cy in (310, 330):
        s.append(f'<circle cx="764" cy="{cy}" r="6" fill="#e2ddd5"/><circle cx="761.5" cy="{cy}" r="1.3" fill="#8f877c"/><circle cx="766.5" cy="{cy}" r="1.3" fill="#8f877c"/>')
    # Arbeitsplatte
    s.append(rect(-4, 350, W + 8, 14, C["counter"]))
    s.append(rect(-4, 362, W + 8, 2, "#d6d1c8"))
    # Unterschränke
    s.append(rect(0, 364, W, 182, C["gap"]))
    s.append(fronts(0, 364, [140, 140, 200, 140, 120, 120], ["drawers3", "door", "door", "drawers3", "drawers3", "drawers2"], 182))
    s.append(rect(0, 546, W, 18, C["plinth"]))
    hs = {"tablet": (200, 266), "steckdose": (764, 302), "ladeschublade": (650, 386), "abfall": (800, 512)}
    return "".join(s), W, 564, hs


def tall_cabinet():
    s = [rect(0, 0, 180, 572, C["gap"])]
    s.append(rect(1.5, 1.5, 87, 207, C["front"]))
    s.append(rect(4, 214, 82, 118, "url(#ovenGlass)", 3))
    s.append(rect(14, 222, 62, 5, C["steel"], 2))
    s.append(rect(1.5, 338.5, 87, 232, C["front"]))
    s.append(rect(91.5, 1.5, 87, 287, C["front"]))
    s.append(rect(91.5, 291.5, 87, 279, C["front"]))
    for x, y in [(1.5, 1.5), (1.5, 338.5), (91.5, 1.5), (91.5, 291.5)]:
        s.append(rect(x, y, 87, 2.5, "#bdb5a8"))
    s.append(rect(180, 0, 6, 590, "url(#oakGrain)"))
    s.append(rect(0, 572, 180, 18, C["plinth"]))
    return "".join(s), 186, 590, {}


def island():
    s = ['<ellipse cx="310" cy="192" rx="360" ry="16" fill="url(#shadow)"/>']
    s.append(rect(0, 14, 620, 160, "url(#oakGrain)"))
    s.append(rect(0, 14, 620, 160, "#000", 0, 'opacity=".04"'))
    # Spielwand
    s.append(rect(20, 30, 362, 128, C["chalk"], 3))
    chalk = 'fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.6"'
    s.append(f'<g {chalk}>'
             f'<circle cx="58" cy="62" r="13" stroke="#f3d36b"/>'
             f'<path d="M58 40v-6M58 90v-6M36 62h-6M86 62h-6M42 46l-4-4M74 78l4 4M74 46l4-4M42 78l-4 4" stroke="#f3d36b"/>'
             f'<path d="M110 140v-38h46v38M104 104l29-24 29 24M126 140v-18h10v18" stroke="#f4f1ea"/>'
             f'<path d="M196 88c-8-8-4-18 4-15 8-3 12 7 4 15l-4 5z" stroke="#ef4a52"/>'
             f'<circle cx="236" cy="96" r="6" stroke="#9fd0f0"/><path d="M236 102v20M226 110h20M236 122l-7 12M236 122l7 12" stroke="#9fd0f0"/>'
             f'<circle cx="262" cy="100" r="6" stroke="#f2a7c3"/><path d="M262 106v18M253 113h18M262 124l-6 11M262 124l6 11" stroke="#f2a7c3"/>'
             f'<path d="M296 150a44 44 0 0 1 80 0" stroke="#ef4a52"/><path d="M304 150a36 36 0 0 1 64 0" stroke="#f3d36b"/><path d="M312 150a28 28 0 0 1 48 0" stroke="#7cc47f"/><path d="M320 150a20 20 0 0 1 32 0" stroke="#6aa8e8"/>'
             f'</g>')
    s.append(f'<text x="290" y="70" font-family="Chalkboard SE, Comic Sans MS, cursive" font-weight="700" font-size="22" fill="#f4f1ea" opacity=".9">KOJE</text>')
    s.append(rect(150, 46, 30, 36, "#e8e4dc", 1, 'transform="rotate(5 165 64)"'))
    for cx, cy, col in [(165, 48, "#e30613"), (98, 120, "#f3c13a"), (342, 46, "#3f86d6")]:
        s.append(f'<circle cx="{cx}" cy="{cy}" r="5" fill="{col}"/>')
    # Klappfach (offen)
    s.append(rect(406, 66, 82, 54, C["inner"], 2))
    for i, col in enumerate(["#e30613", "#f3c13a", "#3f86d6", "#5aae62", "#f08fb5"]):
        s.append(rect(418 + i * 12, 96 - (i % 2) * 4, 5, 24 + (i % 2) * 4, col, 2))
    s.append('<path d="M402 120 h90 l8 10 h-106 z" fill="#b48558"/>')
    # Arbeitsplatte + Deko
    s.append(rect(-8, 0, 636, 14, C["counter"]))
    s.append(rect(-8, 12, 636, 2, "#d6d1c8"))
    s.append('<path d="M96 0 a40 22 0 0 0 80 0 z" fill="#d9d0c3"/>')
    for cx, cy in [(116, -8), (136, -12), (156, -7)]:
        s.append(f'<circle cx="{cx}" cy="{cy}" r="10" fill="#e48a2c"/>')
    s.append(rect(440, -6, 90, 6, C["oakDark"], 2))
    # Sockel + Roboter-Garage
    s.append(rect(10, 174, 600, 16, C["plinth"]))
    s.append(rect(498, 174, 104, 16, "#191817"))
    s.append(rect(500, 174, 100, 2, "#ffb36b", 1, 'opacity=".9"'))
    s.append(rect(506, 172, 92, 22, C["ink"], 11))
    s.append(rect(512, 173, 80, 5, "#5a5a5a", 2.5))
    s.append('<circle cx="580" cy="183" r="2.4" fill="#52e0bf"/>')
    return "".join(s), 620, 194, {"spielwand": (200, 94), "staubsauger": (552, 184)}


def pendant(length):
    s = [f'<line x1="35" y1="0" x2="35" y2="{length}" stroke="{C["plinth"]}" stroke-width="2"/>']
    s.append(f'<path d="M-40 {length + 46} L110 {length + 46} L210 {length + 330} L-140 {length + 330} Z" fill="url(#cone)"/>')
    s.append(f'<circle cx="35" cy="{length + 44}" r="34" fill="url(#bulb)"/>')
    s.append(f'<path d="M24 {length} h22 l26 46 h-74 z" fill="{C["ink"]}"/>')
    s.append(f'<ellipse cx="35" cy="{length + 46}" rx="37" ry="4" fill="#2a2a2a"/>')
    return "".join(s), 70, length + 50, {"licht": (35, length + 26)}


# ---------------------------------------------------------------- Layout
def place(parts, hotspots, comp, x, y, s=1.0):
    svg, w, h, hs = comp
    parts.append(f'<g transform="translate({x:g} {y:g}) scale({s:g})">{svg}</g>')
    for k, (lx, ly) in hs.items():
        hotspots[k] = (x + lx * s, y + ly * s)


def build(W, H, layout):
    parts, hs = [], {}
    layout(parts, hs)
    body = "".join(parts)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
           f'role="img" aria-label="Illustration der Koje [Platzhalter]">{DEFS}{body}</svg>')
    pct = {k: {"x": round(x / W * 100, 2), "y": round(y / H * 100, 2)} for k, (x, y) in hs.items()}
    return svg, pct


def floor(parts, y0, W, H, step):
    parts.append(rect(0, y0, W, H - y0, "url(#floor)"))
    y, row = y0, 0
    while y < H:
        parts.append(rect(0, y, W, 1.5, "#a8865c", 0, 'opacity=".35"'))
        off = (row * 173) % 400
        for x in range(-off, W, 400):
            parts.append(rect(x, y, 1.5, step, "#a8865c", 0, 'opacity=".3"'))
        y += step
        row += 1


def wide(parts, hs):
    W, H, F = 1600, 900, 800
    parts.append(rect(0, 0, W, F, "url(#wall)"))
    floor(parts, F, W, H, 34)
    place(parts, hs, window(), 85, 110)
    place(parts, hs, shelf(), 90, 340)
    place(parts, hs, kitchen_wall(), 470, F - 564)
    place(parts, hs, tall_cabinet(), 1330, F - 590)
    place(parts, hs, couch(), 80, F - 300)
    place(parts, hs, island(), 470, 850 - 190)
    place(parts, hs, pendant(250), 615, 0)
    place(parts, hs, pendant(250), 875, 0)


def tall(parts, hs):
    W, H, F = 800, 1000, 640
    parts.append(rect(0, 0, W, F, "url(#wall)"))
    floor(parts, F, W, H, 42)
    place(parts, hs, kitchen_wall(), 40, F - 564 * 0.68, 0.68)
    place(parts, hs, tall_cabinet(), 625, F - 590 * 0.68, 0.68)
    place(parts, hs, island(), 22, 760 - 190 * 0.74, 0.74)
    place(parts, hs, couch(), 470, 940 - 300 * 0.92, 0.92)
    place(parts, hs, pendant(210), 118, 0, 0.8)
    place(parts, hs, pendant(210), 300, 0, 0.8)


if __name__ == "__main__":
    out = {}
    for name, (W, H, fn) in {"koje-16x9.svg": (1600, 900, wide), "koje-4x5.svg": (800, 1000, tall)}.items():
        svg, pct = build(W, H, fn)
        with open(os.path.join(ASSETS, name), "w", encoding="utf-8") as f:
            f.write(svg)
        out[name] = pct
    print(json.dumps(out, indent=2))
