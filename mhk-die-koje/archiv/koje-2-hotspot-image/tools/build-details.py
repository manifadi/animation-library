#!/usr/bin/env python3
"""
Erzeugt die animierten Detail-Illustrationen (assets/details/*.svg, 600 × 400).
Platzhalter – werden später durch echte Fotos/Videos/Animationen ersetzt.

Regeln:
- Klassen tragen ein Präfix pro Datei (werden inline in die Seite eingefügt).
- Der Grundzustand ohne Animation zeigt das Feature „geöffnet“
  (wichtig für prefers-reduced-motion).
"""
import os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "details")
os.makedirs(OUT, exist_ok=True)

OAK = '<pattern id="{p}-oak" width="60" height="200" patternUnits="userSpaceOnUse"><rect width="60" height="200" fill="#c99a6a"/><path d="M8 0 C12 60 4 120 9 200 M22 0 C18 70 26 140 21 200 M37 0 C41 50 33 130 38 200 M51 0 C47 80 55 150 50 200" stroke="#a77a4e" stroke-opacity=".3" stroke-width="1.4" fill="none"/></pattern>'
RM = "@media (prefers-reduced-motion: reduce){*{animation:none!important}}"


def svg(p, label, style, body, defs=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400" role="img" aria-label="{label}">'
            f'<defs>{OAK.format(p=p)}{defs}</defs><style>{style}{RM}</style>{body}</svg>')


def badge(text="[Platzhalter]"):
    return (f'<g><rect x="20" y="20" width="{len(text) * 8.4 + 20:.0f}" height="28" fill="#fff" stroke="#e30613" stroke-width="1.5"/>'
            f'<text x="30" y="39" font-family="Open Sans, Arial, sans-serif" font-size="14" font-weight="600" fill="#e30613">{text}</text></g>')


FILES = {}

# 1 · Spielwand: Kreide zeichnet, Magnet fällt.
FILES["spielwand.svg"] = svg("sp", "Animation: Auf der Kreidefläche entsteht eine Zeichnung, ein Magnet haftet.", """
.sp-draw{stroke-dasharray:640;animation:sp-draw 7s ease-in-out infinite}
.sp-d2{animation-delay:.6s}.sp-d3{animation-delay:1.1s}
.sp-mag{animation:sp-mag 7s cubic-bezier(.3,1.4,.5,1) infinite}
@keyframes sp-draw{0%{stroke-dashoffset:640;opacity:1}45%,85%{stroke-dashoffset:0;opacity:1}95%,100%{stroke-dashoffset:0;opacity:0}}
@keyframes sp-mag{0%,40%{transform:translateY(-160px);opacity:0}52%,88%{transform:none;opacity:1}96%,100%{transform:none;opacity:0}}
""", """
<rect x="0" y="360" width="600" height="40" fill="#e2cfb2"/>
<rect x="50" y="48" width="500" height="312" rx="4" fill="url(#sp-oak)"/>
<rect x="80" y="76" width="440" height="256" rx="3" fill="#2f3834"/>
<g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="6">
  <path class="sp-draw" stroke="#f4f1ea" d="M140 300 V215 H250 V300 M128 222 L195 160 L262 222 M182 300 V258 H210 V300"/>
  <path class="sp-draw sp-d2" stroke="#ef4a52" d="M330 196 C300 168 318 136 346 154 C374 136 392 168 362 196 L346 212 Z"/>
  <path class="sp-draw sp-d3" stroke="#f3d36b" d="M440 150 m-28 0 a28 28 0 1 0 56 0 a28 28 0 1 0 -56 0 M440 98 v-14 M440 216 v-14 M388 150 h-14 M506 150 h-14"/>
</g>
<rect x="400" y="236" width="70" height="80" fill="#e8e4dc" transform="rotate(4 435 276)"/>
<g class="sp-mag"><circle cx="436" cy="238" r="13" fill="#e30613"/><circle cx="432" cy="234" r="4" fill="#fff" opacity=".5"/></g>
""")

# 2 · Tablet-Halterung fährt aus der Arbeitsplatte.
FILES["tablet.svg"] = svg("tb", "Animation: Eine Tablet-Halterung fährt aus der Arbeitsplatte.", """
.tb-lift{animation:tb-lift 5s cubic-bezier(.65,0,.35,1) infinite}
@keyframes tb-lift{0%,12%{transform:translateY(190px)}42%,82%{transform:none}100%{transform:translateY(190px)}}
""", """
<rect x="0" y="0" width="600" height="272" fill="url(#tb-oak)"/>
<rect x="0" y="0" width="600" height="272" fill="#ffe3b3" opacity=".18"/>
<g clip-path="url(#tb-clip)"><g class="tb-lift">
  <rect x="294" y="200" width="12" height="120" rx="3" fill="#bfc1c3"/>
  <rect x="210" y="86" width="180" height="124" rx="12" fill="#3c3c3c"/>
  <rect x="220" y="96" width="160" height="104" rx="3" fill="#fbfaf8"/>
  <rect x="220" y="96" width="160" height="18" fill="#e30613"/>
  <rect x="232" y="126" width="96" height="8" rx="4" fill="#3c3c3c"/>
  <rect x="232" y="144" width="120" height="5" rx="2.5" fill="#bdb8b0"/>
  <rect x="232" y="158" width="104" height="5" rx="2.5" fill="#bdb8b0"/>
  <rect x="232" y="172" width="80" height="5" rx="2.5" fill="#bdb8b0"/>
</g></g>
<rect x="0" y="270" width="600" height="28" fill="#eeebe5"/>
<rect x="0" y="296" width="600" height="3" fill="#d6d1c8"/>
<rect x="240" y="268" width="120" height="4" fill="#1b1b1c"/>
<rect x="0" y="299" width="600" height="101" fill="#8f877c"/>
<rect x="2" y="301" width="296" height="99" fill="#dcd6cb"/><rect x="302" y="301" width="296" height="99" fill="#dcd6cb"/>
""", '<clipPath id="tb-clip"><rect x="0" y="0" width="600" height="270"/></clipPath>')

# 3 · Couch: Sitzfläche wird ausgezogen (Seitenansicht).
FILES["couch.svg"] = svg("co", "Animation: Die Sitzbank wird zur Couch ausgezogen (Seitenansicht).", """
.co-ext{animation:co-ext 5.5s cubic-bezier(.65,0,.35,1) infinite}
@keyframes co-ext{0%,12%{transform:translateX(0)}42%,82%{transform:translateX(190px)}100%{transform:translateX(0)}}
""", """
<rect x="0" y="340" width="600" height="60" fill="#e2cfb2"/>
<ellipse cx="330" cy="342" rx="260" ry="10" fill="#000" opacity=".08"/>
<g class="co-ext" transform="translate(190 0)">
  <rect x="140" y="262" width="230" height="72" fill="#b48558"/>
  <rect x="366" y="258" width="14" height="80" rx="2" fill="url(#co-oak)"/>
  <rect x="150" y="226" width="222" height="38" rx="16" fill="#d8c8b4"/>
</g>
<rect x="60" y="248" width="320" height="92" rx="4" fill="url(#co-oak)"/>
<rect x="60" y="112" width="68" height="150" rx="24" fill="#d8c8b4"/>
<rect x="110" y="206" width="270" height="48" rx="18" fill="#cdbba5"/>
<rect x="140" y="150" width="70" height="62" rx="18" fill="#c61d27" transform="rotate(-12 175 181)"/>
<text x="540" y="380" text-anchor="end" font-family="Open Sans, Arial, sans-serif" font-size="14" fill="#6b6b6b">[Maß folgt]</text>
""")

# 4 · Saugroboter fährt aus der Sockel-Garage.
FILES["staubsauger.svg"] = svg("ro", "Animation: Ein Saugroboter fährt aus dem Sockel der Insel und wieder zurück.", """
.ro-bot{animation:ro-bot 7s cubic-bezier(.65,0,.35,1) infinite}
.ro-c{animation:ro-c 7s linear infinite}
.ro-c2{animation-delay:.25s}.ro-c3{animation-delay:.5s}
@keyframes ro-bot{0%,10%{transform:translateX(0)}45%,60%{transform:translateX(250px)}90%,100%{transform:translateX(0)}}
@keyframes ro-c{0%,30%{opacity:1}38%,88%{opacity:0}96%,100%{opacity:1}}
""", """
<rect x="0" y="340" width="600" height="60" fill="#e2cfb2"/>
<rect x="0" y="40" width="320" height="270" fill="url(#ro-oak)"/>
<rect x="0" y="40" width="320" height="16" fill="#eeebe5"/>
<rect x="0" y="310" width="320" height="30" fill="#34322f"/>
<rect x="150" y="310" width="170" height="30" fill="#191817"/>
<rect x="152" y="310" width="166" height="3" fill="#ffb36b"/>
<g fill="#9c7a52"><circle class="ro-c" cx="430" cy="334" r="3"/><circle class="ro-c ro-c2" cx="458" cy="337" r="2.5"/><circle class="ro-c ro-c3" cx="492" cy="333" r="3"/><circle class="ro-c ro-c3" cx="520" cy="336" r="2"/></g>
<g class="ro-bot" transform="translate(250 0)">
  <ellipse cx="236" cy="342" rx="72" ry="6" fill="#000" opacity=".15"/>
  <rect x="166" y="306" width="140" height="34" rx="17" fill="#3c3c3c"/>
  <rect x="176" y="308" width="120" height="7" rx="3.5" fill="#5c5c5c"/>
  <circle cx="290" cy="323" r="3.5" fill="#52e0bf"/>
</g>
""")

# 5 · Lichtstimmungen: Morgen → Kochen → Abend.
FILES["licht.svg"] = svg("li", "Animation: Die Küche wechselt von Morgenlicht über Kochlicht zu Abendlicht.", """
.li-bg{fill:#cfc8be;animation:li-bg 9s ease-in-out infinite}
.li-win{fill:#e9edf2;animation:li-win 9s ease-in-out infinite}
.li-led{opacity:1;animation:li-led 9s ease-in-out infinite}
.li-pend{opacity:1;animation:li-pend 9s ease-in-out infinite}
.li-l{opacity:0;animation:9s ease-in-out infinite}
.li-l1{animation-name:li-l1}.li-l2{opacity:1;animation-name:li-l2}.li-l3{animation-name:li-l3}
@keyframes li-bg{0%,26%{fill:#f3e7d8}36%,59%{fill:#cfc8be}69%,92%{fill:#2a2622}100%{fill:#f3e7d8}}
@keyframes li-win{0%,26%{fill:#fff4dc}36%,59%{fill:#e9edf2}69%,92%{fill:#3b4a66}100%{fill:#fff4dc}}
@keyframes li-led{0%,26%{opacity:.15}36%,59%{opacity:1}69%,92%{opacity:.6}100%{opacity:.15}}
@keyframes li-pend{0%,26%{opacity:0}36%,59%{opacity:1}69%,92%{opacity:.85}100%{opacity:0}}
@keyframes li-l1{0%,26%{opacity:1}33%,95%{opacity:0}100%{opacity:1}}
@keyframes li-l2{0%,29%{opacity:0}36%,59%{opacity:1}66%,100%{opacity:0}}
@keyframes li-l3{0%,62%{opacity:0}69%,92%{opacity:1}98%,100%{opacity:0}}
""", """
<rect class="li-bg" x="0" y="0" width="600" height="400"/>
<rect x="30" y="70" width="120" height="170" fill="#3c3c3c"/>
<rect class="li-win" x="38" y="78" width="104" height="154"/>
<rect x="210" y="70" width="360" height="90" fill="#8f877c"/>
<rect x="212" y="72" width="88" height="86" fill="#dcd6cb"/><rect x="302" y="72" width="88" height="86" fill="#dcd6cb"/><rect x="392" y="72" width="88" height="86" fill="#dcd6cb"/><rect x="482" y="72" width="86" height="86" fill="#dcd6cb"/>
<rect x="210" y="160" width="360" height="92" fill="url(#li-oak)"/>
<g class="li-led"><rect x="214" y="160" width="352" height="5" fill="#fff4dc"/><rect x="210" y="165" width="360" height="80" fill="url(#li-glow)"/></g>
<rect x="206" y="252" width="368" height="14" fill="#eeebe5"/>
<rect x="210" y="266" width="360" height="110" fill="#8f877c"/>
<rect x="212" y="268" width="88" height="106" fill="#dcd6cb"/><rect x="302" y="268" width="88" height="106" fill="#dcd6cb"/><rect x="392" y="268" width="88" height="106" fill="#dcd6cb"/><rect x="482" y="268" width="86" height="106" fill="#dcd6cb"/>
<rect x="0" y="376" width="600" height="24" fill="#c9ad86"/>
<line x1="390" y1="0" x2="390" y2="150" stroke="#34322f" stroke-width="2"/>
<g class="li-pend"><path d="M330 192 L450 192 L540 380 L240 380 Z" fill="url(#li-cone)"/><circle cx="390" cy="190" r="40" fill="url(#li-bulb)"/></g>
<path d="M378 150 h24 l26 40 h-76 z" fill="#3c3c3c"/>
<g font-family="Open Sans, Arial, sans-serif" font-size="18" font-weight="700" text-anchor="end">
  <text class="li-l li-l1" x="570" y="44" fill="#3c3c3c">Morgen</text>
  <text class="li-l li-l2" x="570" y="44" fill="#3c3c3c">Kochen</text>
  <text class="li-l li-l3" x="570" y="44" fill="#ffffff">Abend</text>
</g>
""", '<linearGradient id="li-glow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe3b3" stop-opacity=".9"/><stop offset="1" stop-color="#ffe3b3" stop-opacity="0"/></linearGradient>'
     '<linearGradient id="li-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe0a8" stop-opacity=".55"/><stop offset="1" stop-color="#ffe0a8" stop-opacity="0"/></linearGradient>'
     '<radialGradient id="li-bulb"><stop offset="0" stop-color="#fff6e0"/><stop offset=".4" stop-color="#ffd68f" stop-opacity=".8"/><stop offset="1" stop-color="#ffd68f" stop-opacity="0"/></radialGradient>')

# 6 · [Platzhalter] Versenkbarer Steckdosen-Turm.
FILES["steckdose.svg"] = svg("st", "Animation: Ein Steckdosen-Turm fährt aus der Arbeitsplatte [Platzhalter].", """
.st-lift{animation:st-lift 5s cubic-bezier(.65,0,.35,1) infinite}
@keyframes st-lift{0%,12%{transform:translateY(170px)}42%,82%{transform:none}100%{transform:translateY(170px)}}
""", """
<rect x="0" y="0" width="600" height="272" fill="url(#st-oak)"/>
<g clip-path="url(#st-clip)"><g class="st-lift">
  <rect x="266" y="104" width="68" height="200" rx="8" fill="#f1eee9" stroke="#cfc9be" stroke-width="2"/>
  <g fill="#e2ddd5"><circle cx="300" cy="140" r="17"/><circle cx="300" cy="190" r="17"/><circle cx="300" cy="240" r="17"/></g>
  <g fill="#8f877c"><circle cx="293" cy="140" r="3"/><circle cx="307" cy="140" r="3"/><circle cx="293" cy="190" r="3"/><circle cx="307" cy="190" r="3"/><circle cx="293" cy="240" r="3"/><circle cx="307" cy="240" r="3"/></g>
  <rect x="282" y="94" width="36" height="12" rx="4" fill="#d9d4cb"/>
</g></g>
<rect x="0" y="270" width="600" height="28" fill="#eeebe5"/>
<rect x="258" y="268" width="84" height="4" fill="#1b1b1c"/>
<rect x="0" y="299" width="600" height="101" fill="#8f877c"/>
<rect x="2" y="301" width="296" height="99" fill="#dcd6cb"/><rect x="302" y="301" width="296" height="99" fill="#dcd6cb"/>
""" + badge(), '<clipPath id="st-clip"><rect x="0" y="0" width="600" height="270"/></clipPath>')

# 7 · [Platzhalter] Ladeschublade (Seitenansicht).
FILES["ladeschublade.svg"] = svg("la", "Animation: Eine Schublade mit Ladestation für Handys öffnet sich [Platzhalter].", """
.la-drw{animation:la-drw 5.5s cubic-bezier(.65,0,.35,1) infinite}
.la-bolt{animation:la-bolt 1.4s ease-in-out infinite;transform-origin:center;transform-box:fill-box}
@keyframes la-drw{0%,12%{transform:translateX(0)}42%,82%{transform:translateX(200px)}100%{transform:translateX(0)}}
@keyframes la-bolt{0%,100%{opacity:.35}50%{opacity:1}}
""", """
<rect x="0" y="360" width="600" height="40" fill="#e2cfb2"/>
<rect x="40" y="70" width="300" height="16" fill="#eeebe5"/>
<g class="la-drw" transform="translate(200 0)">
  <rect x="70" y="112" width="250" height="70" fill="#e4ddd1"/>
  <rect x="70" y="112" width="250" height="6" fill="#cfc6b8"/>
  <rect x="180" y="66" width="44" height="82" rx="8" fill="#3c3c3c"/><rect x="185" y="72" width="34" height="66" rx="3" fill="#56616b"/>
  <path class="la-bolt" d="M205 86 l-10 18 h9 l-4 16 l12 -21 h-9 z" fill="#52e0bf"/>
  <rect x="246" y="98" width="44" height="50" rx="8" fill="#e30613"/>
  <rect x="316" y="100" width="18" height="90" rx="2" fill="#dcd6cb"/>
</g>
<rect x="40" y="86" width="300" height="274" fill="#d3ccc0"/>
<rect x="40" y="86" width="12" height="274" fill="#bdb5a8"/>
<rect x="40" y="342" width="300" height="18" fill="#34322f"/>
""" + badge())

# 8 · [Platzhalter] Abfall-Auszug mit mehreren Behältern (Seitenansicht).
FILES["abfall.svg"] = svg("ab", "Animation: Ein Auszug mit mehreren Abfallbehältern öffnet sich [Platzhalter].", """
.ab-drw{animation:ab-drw 5.5s cubic-bezier(.65,0,.35,1) infinite}
@keyframes ab-drw{0%,12%{transform:translateX(0)}42%,82%{transform:translateX(220px)}100%{transform:translateX(0)}}
""", """
<rect x="0" y="360" width="600" height="40" fill="#e2cfb2"/>
<rect x="40" y="70" width="300" height="16" fill="#eeebe5"/>
<g class="ab-drw" transform="translate(220 0)">
  <rect x="70" y="200" width="250" height="130" fill="#e4ddd1"/>
  <rect x="84" y="150" width="62" height="160" rx="6" fill="#3c3c3c"/><rect x="80" y="144" width="70" height="12" rx="4" fill="#2a2a2a"/>
  <rect x="160" y="160" width="62" height="150" rx="6" fill="#bdb5a8"/><rect x="156" y="154" width="70" height="12" rx="4" fill="#a39b8e"/>
  <rect x="236" y="170" width="62" height="140" rx="6" fill="#c61d27"/><rect x="232" y="164" width="70" height="12" rx="4" fill="#a3151d"/>
  <rect x="316" y="190" width="18" height="150" rx="2" fill="#dcd6cb"/>
</g>
<rect x="40" y="86" width="300" height="274" fill="#d3ccc0"/>
<rect x="40" y="86" width="12" height="274" fill="#bdb5a8"/>
<rect x="40" y="342" width="300" height="18" fill="#34322f"/>
""" + badge())

for name, content in FILES.items():
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        f.write(content)
print("geschrieben:", ", ".join(FILES))
