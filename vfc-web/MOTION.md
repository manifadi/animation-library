# vfc web – Motion-Guidelines

Wie sich die Seite bewegt und warum. Abgeleitet aus dem Figma-Design (große, leichte Inter Tight,
Schwarz/Weiß mit klaren Markenfarben, harte Pixelkanten, Pixel-Smiley) und den Vorlagen in
`assets/_animation_vorlagen/`. Ziel: **clean, ruhig, präzise – die Bewegung trägt die Typo, sie spielt sich nicht in den Vordergrund.**

## 1. Grundhaltung

- **Masken statt Fades.** Dinge erscheinen, indem sie aus einer Kante gleiten (Wörter aus ihrer Zeile,
  Bilder hinter dem Curtain, Balken über die Seite). Opacity nur unterstützend, nie als Hauptbewegung.
  Kein Blur, kein Aufzoomen, kein Wackeln.
- **Scroll erzählt, Hover antwortet.** Alles, was eine Szene verändert (Reveals, Fächer, Füllung,
  Bilder, Videos, Footer), hängt am Scroll und läuft beim Zurückscrollen rückwärts. Hover gibt es nur
  für Text, Buttons, Links und den Cursor – nie für ganze Sections.
- **Ein Fokus pro Bildschirm.** Pro Viewport bewegt sich eine Sache deutlich. Darum läuft z. B. immer
  nur ein Video, und der Cursor bleibt ein Punkt.
- **Kein Bounce, kein Spring.** Bewegungen laufen weich aus und stehen dann.

## 2. Easing & Tempo

| Token | Kurve | Wofür |
|---|---|---|
| `--ease-out` (Expo-Out) | `cubic-bezier(0.16, 1, 0.3, 1)` | alles, was ankommt: Reveals, Roll, Pixel, Wave |
| Curtain (Quart-In-Out) | `cubic-bezier(0.76, 0, 0.24, 1)` | alles, was durchfährt: Vorhang-Balken, Logo schließen |
| Smiley-Roll | `cubic-bezier(0.65, 0, 0.35, 1)` | physisches Rollen |
| `--ease-in` | `cubic-bezier(0.7, 0, 0.84, 0)` | Abgänge (Unreveal) |

| Klasse | Dauer |
|---|---|
| Hover (Roll, Button, Pill) | 0,35–0,6 s, Versatz 16 ms pro Buchstabe |
| Reveal rein / raus | je 1,1 s – raus ist die Rein-Bewegung rückwärts (gespiegelte Kurve, letztes Wort zuerst), Versatz 35 ms pro Wort, max. 0,6 s |
| Seitenebene (Vorhang) | 650 ms pro Balken, 90 ms Versatz |
| Intro | ≤ 1,2 s bis zum Reveal, ≤ 2 s gesamt |

Reihenfolge immer in Leserichtung: oben vor unten, links vor rechts. Rein von unten, raus nach oben.

## 3. Farbe in Bewegung

- Hover invertiert Schwarz ↔ Weiß (Wave-Button, Start-a-project, Projektzeile).
- **Rot ist Akzent**, nicht Fläche: Cursor, Smiley, Fokus, Menü-Hover. Auf roten Flächen wird der Cursor dunkel.

## 4. Katalog

| Effekt | Auslöser | Wo |
|---|---|---|
| Intro: Logo gleitet hoch, schließt sich zur Mitte, Smiley-Pixel, Zwinkern, Balken ab | erstes Laden | `playIntro` in `main.js` |
| Vorhang: 3 weiße Balken von links, raus nach rechts | Klick auf internen Link | `cover` / `uncover` |
| Wort-Reveal, Unreveal = Reveal rückwärts | Scroll (Band 6 % oben / 8 % unten) | `splitText` + `.w` |
| Lede füllt sich Zeichen für Zeichen grau → dunkel | Scroll, scrubbed | Projects-Lede |
| Projektliste: Curtain-Bild, Linie zeichnet, Tags gestaffelt | Scroll, einmalig | vf-motion + `.project.is-in` |
| Fächer als Endlos-Band → verschmilzt, Box gibt Höhe ab | Scroll, scrubbed | `.echo` |
| Footer steht, Seite schiebt sich darüber weg | Scroll | `.footer-reveal` |
| Buchstaben-Roll | Hover | Menü- und Footer-Links |
| Smiley rollt, Pill invertiert, Label links | Hover | `.cta` |
| Wave-Kante (Manzenreiter) | Hover | `.btn.wave-swap` |
| Cursor: Punkt · Ring (Link) · Pill mit Label | Maus | `[data-cursor-label][data-cursor-pill]` |

| Projektliste Hover: Fläche aus Mausrichtung + Video-Vorschau | Hover | `.project__link.is-hover` |
| Kennzahlen zählen hoch, Abschnittslinien zeichnen sich | Scroll, einmalig | `[data-count]`, `.case-label` |
| Filter: Label-Roll, Farbe breitet sich aus | Hover + Klick | `.filter` |

Ausführliche Beschreibungen und kopierbare KI-Prompts je Effekt: **animationen.html** (Inhalte in `_tools/animations.py`).

## 5. Performance-Regeln (spürbar = unsauber)

- Bewegt werden nur `transform` und `opacity`. Masken laufen über verschachtelte `transform`s
  (Fächer), nicht über animiertes `clip-path` oder Höhen pro Frame.
- Scroll-Jobs: **erst messen, dann schreiben** (`onScrollFrame` gibt eine Schreib-Funktion zurück).
- Layout nur dort ändern, wo es gewollt ist (Fächer-Box beim Verschmelzen) und nur bei echter Änderung.
- **Maximal ein Video spielt** – zwei gleichzeitig drücken Chrome auf 30 fps.
- Zielwert: 60 fps über die ganze Seite. Messen: per Skript scrollen und Frame-Abstände loggen.

## 6. Barrierefreiheit

- `prefers-reduced-motion`: kein Intro, kein Softscroll, keine Reveals, Fächer statisch, Videos stehen.
- Visuell zerlegter Text bleibt für Screenreader lesbar (`sr-only`-Label, `aria-hidden` auf Kopien).
- Fokus zeigt dieselben Zustände wie Hover (`:focus-visible`).

## 7. Lokal testen

Ohne Browser-Cache servieren, sonst liefert Chrome alte CSS/JS aus (der einfache `python -m http.server`
sendet keine Cache-Header). Beispiel: ein kleiner Python-Server, der `Cache-Control: no-store` setzt,
oder im Browser hart neu laden (Cmd+Shift+R).
