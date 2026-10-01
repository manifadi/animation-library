---
name: vf-motion
description: Fertige Scroll- und Hover-Animationen für bestehende Websites einbauen – "Lift" (Text wird Zeile für Zeile aus Blur und 50 % Deckkraft scharf, sobald die Zeile in den Viewport scrollt), "Curtain" (schwarze Fläche wischt von oben über ein Bild und gibt es nach unten frei, optional fullscreen) und "Wave" (Button-Hover, weiße Fläche mit fließender Wellenkante kommt von rechts und invertiert Schwarz zu Weiß, ohne Bounce) sowie "Gallery Arrows" (Galerie-Pfeile als weiße Cursor-Bubble, die der Maus folgt). Verwende diesen Skill immer, wenn der User Lift, Curtain, Wave, Wavy-Button, Text-Reveal, Bild-Reveal, Image-Reveal, Scroll-Reveal, Button-Hover-Effekt, Galerie-Pfeile, Slider-Pfeile, Cursor-Pfeil, Pfeil folgt der Maus, Follow-Button, Bubble-Pfeile oder "die Animation von vorhin" auf ein Element, eine Section oder eine Seite anwenden will – auch wenn er den Skill nicht beim Namen nennt.
---

# vf-motion

Drei fertige, getestete Effekte als kleine Bibliothek. **Nichts davon neu schreiben** – immer die Dateien aus `assets/` verwenden und die Effekte nur per `data-motion`-Attribut aktivieren. Timings, Easing und Optik sind abgestimmt; nur ändern, wenn der User das ausdrücklich will.

| Effekt | Attribut | Wirkung |
|---|---|---|
| Lift | `data-motion="lift"` | Jede Textzeile startet mit `blur(8px)`, `opacity .5`, leicht nach unten versetzt, und wird scharf, sobald sie ca. 12 % über dem unteren Viewport-Rand ankommt. Zeilen werden anhand des echten Umbruchs erkannt und bei Breitenänderung neu berechnet. Inline-Markup (`<a>`, `<strong>`, `<em>`, `<br>`) bleibt erhalten. |
| Curtain | `data-motion="curtain"` | Bei 35 % Sichtbarkeit wischt eine schwarze Fläche von oben über das Bild, in der Mitte erscheint das Bild, die Fläche zieht nach unten ab. Das Bild gleitet dabei aus leichtem Zoom in Position. |
| Wave | `data-motion="wave"` | On hover schiebt sich von rechts eine weiße Fläche mit animierter Wellenkante herein, davor eine transluzente Vorwelle. `mix-blend-mode: difference` invertiert Hintergrund und Schrift exakt entlang der Kante. Beim Verlassen zieht sie sich nach rechts zurück. Kein Spring, kein Bounce. |
| Gallery Arrows | `data-motion="gallery-arrows"` | Ersetzt die Pfeile einer bestehenden Bildergalerie durch eine weiße, runde Bubble mit feinem schwarzem Pfeil. Die Bubble ist unsichtbar, bis die Maus ins linke bzw. rechte Drittel der Bildfläche kommt. Dort erscheint sie direkt am Cursor, zieht weich unter dem (sichtbar bleibenden) Mauszeiger mit, wird bei schneller Bewegung bis zu 34 % größer und schrumpft beim Abbremsen zurück. Solange die Maustaste gedrückt ist, wird die Bubble neongelb. Ein Klick irgendwo in der Zone blättert. |

Eine Live-Referenz aller Effekte liegt in `references/demo.html` (Abschnitte "Wave", "Curtain", "B – Lift"). `assets/example.html` zeigt das minimale Markup.

## Ablauf beim Einbau

1. **Prüfen, ob schon installiert.** Im Projekt nach `vf-motion.css` / `vf-motion.js` suchen. Wenn vorhanden: direkt zu Schritt 3.
2. **Installieren.**
   - `assets/vf-motion.css` und `assets/vf-motion.js` in den Asset-Ordner des Projekts kopieren (bestehende Konvention übernehmen, z. B. `css/`, `js/`, `assets/`).
   - CSS im `<head>` nach den bestehenden Stylesheets einbinden, damit die Variablen überschreibbar bleiben.
   - JS mit `defer` einbinden (im `<head>` oder vor `</body>`).
   - Sehr früh im `<head>`, **vor** dem CSS, dieses Inline-Snippet einfügen. Es verhindert, dass Bilder und Text kurz unanimiert aufblitzen:
     ```html
     <script>document.documentElement.classList.add('vfm-js')</script>
     ```
   - **WordPress:** per `wp_enqueue_style` / `wp_enqueue_script` (mit `'strategy' => 'defer'`) im Theme bzw. Child-Theme einbinden, das Inline-Snippet über `wp_head` mit Priorität 1 ausgeben. Nicht in Plugin- oder Core-Dateien schreiben.
3. **Attribute setzen** auf die vom User genannten Elemente (siehe Effekt-Referenz). Selektor oder Beschreibung des Users im Code suchen; bei Mehrdeutigkeit kurz nachfragen, welche Elemente gemeint sind.
4. **Voraussetzungen des Effekts prüfen** (unten) und nur dort minimal nachbessern.
5. **Kurz zusammenfassen**, auf welche Elemente welcher Effekt gesetzt wurde und ob etwas angepasst werden musste.

## Effekt-Referenz

### Lift – Text

```html
<p data-motion="lift">Mehrzeiliger Text …</p>
<h2 data-motion="lift">Überschrift</h2>
```

- Auf **jedes einzelne Textelement** setzen (p, h1–h6, li, blockquote), nicht auf einen Container mit vielen Absätzen – sonst werden auch Kind-Elemente wie Buttons oder Bilder durchlaufen.
- Elemente mit interaktiven Kindern (Formulare, Buttons, Icons als `<svg>`) auslassen oder nur den Textteil markieren. `<svg>`, `<img>`, `<button>`, Inputs werden übersprungen.
- Funktioniert mit jedem Font; die Zerlegung wartet auf `document.fonts.ready`.
- Nicht auf Elemente setzen, die selbst `display: flex/grid` mit Text als direkte Kinder nutzen – dort erst den Text in ein `<span>`/`<p>` legen.
- Wird Text später per JS ausgetauscht: danach `VFMotion.init(element)` aufrufen bzw. bei reinen Layout-Änderungen `VFMotion.refresh()`.

### Curtain – Bild

```html
<figure data-motion="curtain">
  <img src="…" alt="…">
</figure>

<!-- Fullscreen-Variante -->
<div data-motion="curtain" data-curtain-full>
  <img src="…" alt="…">
</div>

<!-- direkt auf dem Bild geht auch, das Skript verpackt es dann selbst -->
<img data-motion="curtain" src="…" alt="…">
```

- Bevorzugt auf den **direkten Container** des Bildes setzen. Das Medium muss ein **direktes Kind** sein (`img`, `picture`, `video`, `svg`, `canvas` oder ein Element mit Klasse `vfm-media`, z. B. ein Div mit Hintergrundbild).
- Der Container bekommt `overflow: hidden` und `position: relative`. Wenn er bereits absolut positioniert ist, bleibt das erhalten, weil `position` über die bestehende Regel gesetzt wird – prüfen, ob die Seite danach gleich aussieht.
- `data-curtain-full`: Container wird `100vw × 100svh` und bricht aus dem Seitencontainer aus. Dafür muss `body { overflow-x: clip; }` gesetzt sein, sonst entsteht horizontaler Scroll – ergänzen, falls nicht vorhanden. Das Bild wird mit `object-fit: cover` gefüllt.
- `data-curtain-dir="right"`: Wischt horizontal von links nach rechts statt von oben nach unten.
- Farbe der Fläche: `--vfm-curtain-color` (Standard `#000`). Bei dunklen Seiten ggf. an die Markenfarbe anpassen, aber nur auf Wunsch.
- Lazy-Loading (`loading="lazy"`) ist kein Problem.

### Wave – Button

```html
<a href="/kontakt" class="btn" data-motion="wave">Kontakt aufnehmen</a>
<button type="button" class="btn" data-motion="wave">Mehr erfahren</button>
```

- Das Skript hängt zwei `<span aria-hidden>` an (`.vfm-halo`, `.vfm-fill`) und **verändert den Inhalt nicht**. Icons, Flex-Layout und Abstände bleiben unverändert.
- Der Button bekommt `overflow: hidden`, `isolation: isolate` und (falls statisch) `position: relative`. Bestehende `border-radius` werden respektiert.
- **Farblogik:** Die weiße Fläche invertiert per `difference`. Schwarzer Button mit weißer Schrift wird zu weißem Button mit schwarzer Schrift – das ist der vorgesehene Fall. Bei anderen Button-Farben entsteht die jeweilige Komplementärfarbe (z. B. Blau → Orange). Wenn ein Button nicht schwarz ist, den User darauf hinweisen, statt die Farbe eigenmächtig zu ändern.
- Ein vorhandener eigener Hover-Effekt (Hintergrundwechsel, Transform) kollidiert. Diesen für Buttons mit `data-motion="wave"` deaktivieren, z. B. `.btn[data-motion~="wave"]:hover { background: <Ausgangsfarbe>; transform: none; }`, und das erwähnen.
- Pseudo-Elemente `::before/::after` des Buttons werden nicht angetastet.

### Gallery Arrows – Cursor-Bubble für Galerie-Pfeile

**Dateien:** `assets/vf-gallery-arrows.css`, `assets/vf-gallery-arrows.js` (unabhängig von vf-motion.css/js, keine weiteren Libraries). Minimalbeispiel: `assets/example-gallery.html`. Live-Referenz: `references/demo.html`, Abschnitt „Galerie“.

#### Funktionsprinzip (wichtig)

Die Bibliothek baut **keinen eigenen Slider**. Sie blendet die vorhandenen Pfeile der Galerie aus (Klasse `vfg-original`, bleiben im DOM) und ruft bei einem Klick in der Zone `.click()` auf dem **originalen** Pfeil auf. Dadurch bleibt die bestehende Slider-Logik (eigene Skripte, Swiper, Slick, Splide, Glide …) unverändert, inklusive Nummern-Navigation, Zähler, Loop und Übergängen.

#### Einbau

1. CSS und JS einbinden wie bei den anderen vf-motion-Effekten (CSS im `<head>`, JS mit `defer`). In WordPress per `wp_enqueue_style` / `wp_enqueue_script` im (Child-)Theme.
2. Die **Bildfläche** der Galerie finden: das Element, das die Bilder umschließt und über dem die Pfeile liegen (nicht den ganzen Galerie-Wrapper mit Nummern/Captions, sonst entstehen die Zonen auch über der Nummernleiste).
3. Darauf setzen:
   ```html
   <div class="slider-stage"
        data-motion="gallery-arrows"
        data-gallery-prev=".slider .arrow-left"
        data-gallery-next=".slider .arrow-right">
   ```
   Die Selektoren der Original-Pfeile **immer explizit** angeben. Die Auto-Erkennung (`.prev`, `.swiper-button-prev`, `.slick-prev` …) ist nur ein Fallback.
4. Prüfen, dass die Stage eine feste Höhe bzw. ein `aspect-ratio` hat und nichts vor ihr liegt, das Mausereignisse abfängt (z. B. ein transparentes Overlay mit `pointer-events: auto`). Falls doch: dem Overlay `pointer-events: none` geben, sofern es keine eigene Funktion hat.
5. Mehrere Galerien auf einer Seite: Attribut auf jede Stage, Selektoren jeweils eindeutig (z. B. über eine ID oder den Eltern-Container).
6. Testen: Maus in linkes/rechtes Drittel → Bubble erscheint und folgt; Mitte → keine Bubble; Klick blättert genau einmal; Taste gedrückt halten → Neon; Touch-Ansicht in den DevTools → Bubbles fix links/rechts sichtbar.

#### Optionen

| Attribut | Standard | Bedeutung |
|---|---|---|
| `data-gallery-prev` / `data-gallery-next` | Auto | CSS-Selektor der Original-Pfeile |
| `data-gallery-zone` | `0.3` | Breite der Aktivzone je Seite (`0.25` = Viertel) |
| `data-gallery-max-scale` | `0.34` | maximale Vergrößerung bei schneller Bewegung (`0` = aus) |

CSS-Variablen (in einem Projekt-Stylesheet nach `vf-gallery-arrows.css` überschreiben):

```css
:root {
  --vfg-size: clamp(48px, 4.6vw, 68px);  /* Durchmesser */
  --vfg-bg: #fff;                         /* Bubble */
  --vfg-arrow: #000;                      /* Pfeil */
  --vfg-accent: #c6ea7a;                  /* Neon beim Drücken – an die Akzentfarbe der Seite anpassen */
  --vfg-shadow: 0 6px 24px rgba(0,0,0,.12);
  --vfg-inset: 2.6%;                      /* Randabstand der fixen Position */
}
```

Wenn die Seite bereits eine Akzentfarbe hat (z. B. für die aktive Nummer der Galerie), `--vfg-accent` auf genau diese Farbe setzen.

#### Verhalten im Detail (nicht ändern, außer auf Wunsch)

- Folgen mit Trägheit: Position nähert sich pro Frame um 18 % dem Ziel an. Ein-/Ausblenden über Skalierung 50 % → 100 % plus Opacity.
- Die Bubble bleibt innerhalb ihrer Zone und mit Abstand zum Bildrand, damit sie nie abgeschnitten wird.
- Mauszeiger bleibt sichtbar und wird in der Zone zur Hand (`cursor: pointer`).
- Links, Buttons oder Formularelemente **innerhalb** der Stage (z. B. ein Lightbox-Link um das Bild) unterbrechen die Zone, damit deren Klick erhalten bleibt. Liegt um jedes Bild ein Lightbox-Link, den User fragen, ob die Lightbox bleiben oder der Klick blättern soll.
- Touch-Geräte, `prefers-reduced-motion` und Tastatur: Bubbles stehen fix links und rechts mittig (Touch immer sichtbar, Tastatur bei Fokus). Die Bubbles sind echte `<button>` mit dem `aria-label` der Original-Pfeile.
- Der rAF-Loop schläft, wenn nichts animiert wird.

#### Nicht tun

- Keinen eigenen Slider bauen und die Original-Pfeile nicht löschen.
- Den Mauszeiger nicht ausblenden (`cursor: none`) – ausdrücklich nicht gewünscht.
- Keine zusätzlichen Libraries (GSAP o. ä.) einsetzen.
- Swiper/Slick-Optionen nicht anfassen. Falls Drag/Swipe auf Desktop aktiv ist und nach einem Drag ungewollt geblättert wird, den User darauf hinweisen statt eigenmächtig Drag zu deaktivieren.

## Anpassen über CSS-Variablen

In einem projekt-eigenen Stylesheet nach `vf-motion.css` überschreiben, nie in `vf-motion.css` selbst:

```css
:root {
  --vfm-lift-blur: 8px;          /* Unschärfe am Start */
  --vfm-lift-opacity: .5;        /* Deckkraft am Start */
  --vfm-lift-offset: .45em;      /* Versatz nach unten */
  --vfm-lift-duration: 1.1s;
  --vfm-curtain-color: #000;
  --vfm-curtain-duration: 1.6s;
  --vfm-wave-fill: #fff;
  --vfm-wave-halo: rgba(255,255,255,.24);
  --vfm-wave-duration: 1s;
}
```

Variablen können auch pro Element gesetzt werden (`style="--vfm-lift-blur: 4px"`).

## Testen

- `data-motion-repeat` auf einem Element (oder `<html data-motion-repeat>` für die ganze Seite): Lift und Curtain setzen sich zurück, sobald das Element beim Hochscrollen unten aus dem Viewport verschwindet. Nur zum Testen – vor Livegang wieder entfernen und den User daran erinnern.
- `prefers-reduced-motion: reduce` ist berücksichtigt: Inhalte erscheinen sofort, Wave wechselt nur kurz die Farbe.

## Nicht tun

- Effekte nicht nachbauen, nicht in andere Libraries (GSAP, AOS, Framer) übersetzen und keine zusätzlichen Libraries installieren.
- Beim Wave-Button kein Spring- oder Elastic-Easing einsetzen – der User will ausdrücklich keinen Bounce am Ende.
- Keine Inhalte umschreiben, keine Klassen umbenennen, keine bestehenden Styles löschen. Nur Attribute ergänzen und Konflikte minimal auflösen.
- `vf-motion.css` / `vf-motion.js` nicht pro Element duplizieren oder inline kopieren.
