# Die Koje · Version 2 – Hotspot-Bild (Klickdummy)

Landing Page für „Die Koje“ von musterhaus küchen. Herzstück ist ein großes, interaktives Bild der Küche mit acht pulsierenden Hotspots. Ein Klick zoomt sanft auf die Stelle und öffnet ein Panel mit Text und Mini-Animation. Ein Fortschrittszähler belohnt, wer alles entdeckt hat.

## Starten

Reines HTML/CSS/JS (ES-Module), kein Build-Schritt. GSAP kommt per CDN. Weil die Seite `data/hotspots.json` per `fetch` lädt, braucht sie einen lokalen Server:

```bash
# im Repo-Root
python3 -m http.server 8080
# oder: npx serve .
```

Dann `http://localhost:8080/mhk-die-koje/koje-2-hotspot-image/` öffnen. Alternativ `mhk-die-koje/start.command` doppelklicken.

## Dateien

```
index.html                 Seite (Hero, Hotspot-Bühne, Panel, Belohnung, Liste, CTA, Footer)
css/style.css              Design-Tokens (:root) + Layout
js/main.js                 Hotspot-Mechanik, Zoom, Panel, Fortschritt, Tastatur, Liste
data/hotspots.json         ★ alle Inhalte und Positionen
assets/koje-16x9.svg       Hauptbild Desktop  [Platzhalter-Illustration]
assets/koje-4x5.svg        Hauptbild Mobil    [Platzhalter-Illustration]
assets/details/*.svg       animierte Detail-Illustrationen pro Feature [Platzhalter]
tools/                     Python-Skripte, die die Platzhalter-SVGs erzeugen (nicht nötig für den Betrieb)
```

## Aufbau von `data/hotspots.json`

```jsonc
{
  "image": {
    "src": "assets/koje-16x9.svg", "width": 1600, "height": 900,          // Desktop-Bild (16:9)
    "mobile": { "src": "assets/koje-4x5.svg", "width": 800, "height": 1000, // Mobil-Variante (4:5)
                "media": "(max-width: 700px)" },                            // ab wann die Mobil-Variante gilt
    "alt": "Bildbeschreibung …"
  },
  "hotspots": [
    {
      "id": "spielwand",            // eindeutig, wird auch für den Fortschritt gespeichert
      "order": 1,                   // Reihenfolge für Vor/Zurück, Pfeiltasten, Liste
      "title": "Spielwand",         // Tooltip, Fortschritt, Liste
      "headline": "Eine Wand, die mitspielt.",
      "text": "2–3 Sätze …",
      "tags": ["Kreidefläche", "Magnetisch"],
      "note": "[Platzhalter: Maße folgen]",   // kursiver Hinweis unter dem Text
      "placeholder": false,         // true → rotes [Platzhalter]-Badge (frei erfundenes Feature)
      "x": 41.88, "y": 83.78,       // Position in % relativ zum Desktop-Bild
      "mobile": { "x": 21.25, "y": 68.9 },   // Position in % relativ zum Mobil-Bild
      "detail": { "src": "assets/details/spielwand.svg", "alt": "Beschreibung der Animation" }
    }
  ]
}
```

**Neuen Hotspot hinzufügen:** Ein weiteres Objekt in `hotspots` eintragen, mehr ist nicht nötig. Zähler („x von N“), Häkchen, Liste, Zusammenfassung und Belohnung passen sich automatisch an.

**Positionen finden:** Das Bild im Browser öffnen, mit der Maus auf das Objekt zeigen und die Koordinate durch die Bildbreite bzw. -höhe teilen, mal 100. Weil die Werte relativ zum Bild sind, sitzen die Punkte bei jeder Bildschirmgröße exakt. Die Bühne behält das Seitenverhältnis des Bildes (`aspect-ratio`).

## Bilder tauschen

- **Hauptbild:** Die neuen Dateien z. B. als `assets/koje-16x9.jpg` (16:9) und `assets/koje-4x5.jpg` (4:5) ablegen. In der JSON `src`, `width` und `height` anpassen und danach alle `x`/`y` neu setzen. Fehlt die Mobil-Variante, den `mobile`-Block bei `image` einfach weglassen, dann gilt überall das 16:9-Bild.
- **Detail pro Feature:** `detail.src` auf eine andere Datei zeigen lassen. SVGs werden inline eingefügt, damit ihre CSS-Animationen laufen. JPG/PNG/WebP werden als `<img>` angezeigt.
- Die Platzhalter-SVGs entstehen über `python3 tools/build-illustrations.py` (gibt auch die Hotspot-Koordinaten aus) und `python3 tools/build-details.py`. Für echte Motive braucht man diese Skripte nicht mehr.

## Interaktion & Barrierefreiheit

- Die Hotspots sind `<button>`-Elemente mit `aria-label` („Feature 3 von 8: Ausziehcouch – entdeckt“) und haben eine Klickfläche von 44 px.
- **Hover/Fokus:** Der Punkt wächst und ein Tooltip mit dem Namen erscheint. Am Bildrand klappt der Tooltip automatisch nach innen.
- **Klick:** Das Bild zoomt auf die Stelle (GSAP, `power3.inOut`), das Panel öffnet sich. Am Desktop sitzt es seitlich im Bild, unter 1024 px kommt es als Bottom-Sheet von unten, und die Seite scrollt den Punkt über das Sheet.
- **Tastatur:** Tab erreicht die Hotspots. ← → ↑ ↓ wechseln zwischen den Hotspots bzw. bei offenem Panel zum vorherigen oder nächsten Feature. Escape schließt, danach springt der Fokus zurück auf den Hotspot.
- **Fortschritt:** „x von 8 entdeckt“ mit klickbaren Häkchen. Besuchte Punkte werden anthrazit mit Häkchen. Der Stand wird im `localStorage` gespeichert, „Neu starten“ setzt ihn zurück.
- **Belohnung:** Nach dem letzten Feature öffnet sich beim Schließen des Panels ein Dialog mit Konfetti und CTAs. Er hält den Fokus, Escape schließt ihn.
- **„Alle Features anzeigen“:** Die Listenansicht ist die Alternative für Barrierefreiheit und SEO.
- **`prefers-reduced-motion`:** keine Ping-, Zoom- oder Detail-Animationen. Die Detail-Grafiken zeigen dann direkt den „geöffneten“ Zustand.

## Design-Referenz: Was aus Figma übernommen wurde

Quelle: Figma „MUSTERHAUSKÜCHEN“, Screen *Screendesign-Vorschlag-FINAL-Themenwelten* (node 22-2), per Figma-MCP ausgelesen. Die Werte sind dieselben wie in Version 1.

| Token | Figma | Umsetzung |
|---|---|---|
| Akzentrot | `#e30613` | `--mhk-red`: Hotspots, Buttons, Headline-Akzente |
| Textfarbe | `#3c3c3c` | `--ink`; außerdem `--visited` für entdeckte Hotspots |
| Flächengrau | `#f5f5f5` | `--paper-soft`: Zusammenfassung, Panel-Medien |
| Headline-Font | Dashiell Bright Black | Ersatz Fraunces 900, weil Dashiell ein Adobe-Font ist. Mit Kit greift Dashiell automatisch. |
| Fließtext | Open Sans | Open Sans 16 px |
| Buttons | rot, eckig, SemiBold | `.btn`, 48 px hoch |
| Karten | weiß, heller Rand, rote Serif-Titel, Pfeil-Link | Feature-Liste, Panel |
| Rote Vollfläche | Block „Lange für Sie da!“ | CTA-Block |
| Logo | dunkle Box oben links | `.logo` |

## Inhalte & rechtliche Leitplanken

- Fünf Features sind vorgegeben: Spielwand, Tablet-Halterung, Ausziehcouch, Sockel-Garage und Lichtstimmungen. Drei sind **frei erfundene Platzhalter** und tragen sichtbar das Badge `[Platzhalter]`: Steckdosen-Turm, Ladeschublade und Abfall-Auszug.
- Es gibt keine Maße, Traglasten oder Preise (`[Maß folgt]`) und keine Umwelt- oder Nachhaltigkeitsaussagen (EmpCo).
- „WhatsApp“ und „Pinterest“ teilen sind Platzhalter. „Link kopieren“ funktioniert.
- Impressum und Datenschutz verlinken auf musterhauskuechen.de; die genauen URLs dort sind nicht geprüft.

## Getestet

Mit Playwright in Chrome bei 390 × 844, 768 × 1024 und 1440 × 900 getestet: Hover-Tooltip, Klick mit Zoom, Pfeiltasten, alle acht Features durchklicken, Belohnung inklusive Fokus, Listenansicht und `prefers-reduced-motion`. Dabei traten keine Konsolenfehler auf.

## Offene Punkte für die Produktion

- [ ] Echte Kampagnenmotive (16:9 und 4:5, als AVIF/WebP mit `srcset`) und anschließend die Hotspot-Koordinaten neu setzen
- [ ] Echte Detail-Medien (kurze Loops als MP4/WebM mit Poster, oder Fotos)
- [ ] Freigegebene Texte; Platzhalter-Features bestätigen oder entfernen
- [ ] Dashiell Bright über Adobe-Fonts-Kit
- [ ] Feature-Liste serverseitig ausliefern (SEO). Aktuell wird sie per JS aus der JSON gerendert.
- [ ] Bottom-Sheet per Wischgeste schließbar machen
- [ ] Deep-Links pro Feature (`#feature=couch`) zum Teilen
- [ ] Tracking: Hotspot geöffnet, alle entdeckt, CTA-Klicks
- [ ] Echte Share-Ziele, Consent, korrekte Impressums- und Datenschutz-URLs
- [ ] GSAP lokal bündeln statt CDN
