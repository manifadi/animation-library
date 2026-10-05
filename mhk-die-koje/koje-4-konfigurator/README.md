# Meine Koje · Version 4 – Feature-Konfigurator (Klickdummy)

Nutzer:innen schalten die Features der Koje an und aus und sehen live, wie sich die Küche verändert. Am Ende steht eine Zusammenfassung „Meine Koje“: Man kann sie als Link teilen, als Bild speichern oder direkt zur Beratung mitnehmen. Ziel ist, aus Interesse einen Lead zu machen. Preise gibt es bewusst nicht.

## Starten

Reines HTML/CSS/JS (ES-Module), kein Build-Schritt. GSAP kommt per CDN. Weil `data/features.json` per `fetch` geladen wird, braucht die Seite einen lokalen Server:

```bash
# im Repo-Root
python3 -m http.server 8080
# oder: npx serve .
```

Dann `http://localhost:8080/mhk-die-koje/koje-4-konfigurator/` öffnen. Alternativ `mhk-die-koje/start.command` doppelklicken.

## Dateien

```
index.html          Seite: Hero, Konfigurator (Vorschau + Optionen), Zusammenfassung, Demo-Formular, Dialoge
css/style.css       Design-Tokens (:root), Layout, Schalter, Dialoge
data/features.json  ★ Features, Kategorien, Varianten, Regeln, Einstiegsfragen und deren Vorschläge
js/store.js         Store (ein Objekt, Pub/Sub) + Kodierung der Konfiguration im URL-Hash
js/rules.js         Regel-Engine „benötigt“ / „schließt aus“ mit Begründungen
js/preview.js       SVG-Vorschau mit einer Layer-Gruppe pro Feature + Animationstypen
js/summary.js       Klon der Vorschau für die Karte, PNG-Export per Canvas
js/main.js          Verdrahtung: Optionen, Hinweise, Live-Region, Einstieg, Teilen, Formular
assets/             Logo, Vorschaubild
```

## Aufbau von `data/features.json`

```jsonc
{
  "categories": [{ "id": "wohnen", "name": "Wohnen" }, …],
  "features": [
    {
      "id": "couch",                         // eindeutig, steht auch im Link
      "name": "Ausziehcouch",
      "short": "Kurztext unter dem Schalter",
      "detail": "Detailtext im Info-Modal",
      "category": "wohnen",                  // → categories[].id
      "default": false,                      // Startzustand
      "variants": [{ "id": "2", "name": "2-Sitzer" }, { "id": "3", "name": "3-Sitzer" }],
      "defaultVariant": "2",
      "layer": "#feature-couch",             // SVG-Gruppe in der Vorschau
      "animation": "slide-out",              // fade | slide-out | flip-down | rise | peek | light
      "focus": [0, 370, 480, 320],           // Ausschnitt (viewBox) für die Detail-Ansicht
      "requires": [{ "id": "…", "reason": "Begründung beim Einschalten", "reasonOff": "Begründung, wenn es mit wegfällt" }],
      "excludes": [{ "id": "oberschrank-links", "reason": "Die ausziehbare Couch braucht die freie Wandfläche …" }],
      "placeholder": "Hinweis, was noch fehlt [Platzhalter]"
    }
  ],
  "profile": {
    "questions": [{ "id": "kinder", "question": "Gibt es Kinder im Haushalt?", "options": [{ "id": "ja", "label": "Ja" }, …] }],
    "presets": { "kinder.ja": { "on": ["spielwand"] }, "kochen.familie": { "on": ["couch"], "variants": { "couch": "3" } } }
  }
}
```

- **Regeln** werden nie blockiert. Ein Schalter wird immer umgesetzt, abhängige Features werden mitgeschaltet, und jede Folgeänderung erscheint mit Begründung im Hinweis (inkl. „Rückgängig“), in der betroffenen Zeile und in der Live-Region. Ketten funktionieren auch: „Nischenregal an“ zieht die Couch nach, und die Couch entfernt den Oberschrank links.
- Taucht ein Platzhalter-Feature als „[Platzhalter-Feature …]“ in `placeholder` auf, bekommt es automatisch das rote Badge.

### Beispiel: neues Feature nur per JSON

```json
{
  "id": "gewuerzauszug",
  "name": "Gewürzauszug",
  "short": "Schmaler Auszug neben dem Herd. [Platzhalter]",
  "detail": "Ein schmaler Hochauszug für Gewürze und Öle direkt neben dem Kochfeld.",
  "category": "kochen",
  "default": false,
  "layer": "#feature-gewuerzauszug",
  "layerSrc": "assets/layers/gewuerzauszug.svg",
  "layerBox": [860, 480, 40, 200],
  "animation": "fade",
  "focus": [760, 400, 270, 180],
  "requires": [],
  "excludes": [],
  "placeholder": "[Platzhalter-Feature – Ausstattung noch nicht bestätigt]"
}
```

Gibt es die Layer-Gruppe noch nicht im SVG, legt die Vorschau sie automatisch an und setzt die Grafik aus `layerSrc` an die Position `layerBox` (x, y, Breite, Höhe im viewBox-Raster 1200 × 800). Zähler („x von N“), Kategorien, Link, Zusammenfassung und Bild-Export passen sich von selbst an.

## Vorschaugrafiken austauschen

- Die Szene steht in `js/preview.js` (`previewMarkup`): Grundküche (`#base`, `#base-run`, `#base-front`) und eine Gruppe pro Feature.
- **Grafik tauschen:** den Inhalt einer Gruppe durch `<image href="assets/…" …/>` ersetzen. Die Animationen greifen auf Teile mit `data-part` zu (`klappe`, `arm`, `device`, `body`, `polster`, `front`, `inside`). Wer diese Teile als eigene Freisteller anlegt, behält die Animation. Sonst einfach `"animation": "fade"` setzen.
- **Steuer-Attribute:** `data-variant="3"` (nur bei dieser Variante sichtbar), `data-when="couch"` (nur wenn Couch aktiv), `data-unless="couch"` (nur wenn Couch aus, z. B. „Platz für die Couch“).
- Alle Farben stehen inline, damit der PNG-Export 1:1 aussieht. Bitte keine CSS-Klassen für Farben in der Szene verwenden.
- **3D-Vorschau später:** `createPreview()` liefert nur `render(state, prev)` und `setView(view, focus)`. Eine Three.js- oder `<model-viewer>`-Vorschau mit derselben Schnittstelle kann die SVG-Szene ersetzen, ohne Store, Regeln oder UI anzufassen.

## Zustand, Link & Speicher

- **Ein Store** (`createStore`) hält `active`, `variants`, `profile`, `view`, `focus` und `notice`. Alle Anzeigen hängen per `subscribe` daran.
- **URL-Hash:** `#k=couch.3,spielwand,licht.ambiente&p=kochen.familie,kinder.ja`. Der Link stellt Features, Varianten und die persönliche Zeile exakt wieder her. Ein Link überspringt die Einstiegsfragen.
- **localStorage** (`koje4:last`, mit try/catch): Beim nächsten Besuch bietet die erste Frage „Letzte Koje fortsetzen“ an. Ohne Speicher funktioniert alles ganz normal.

## Barrierefreiheit

- Die Schalter sind echte `<input type="checkbox" role="switch">` mit `<label>`. Varianten sind Radio-Buttons in einem `fieldset`.
- Eine Live-Region meldet jede Änderung inklusive automatischer Folgeänderungen und des Zählerstands.
- Info-Modal und Einstiegsfragen sind native `<dialog>`-Elemente (Fokusfalle, Escape). Die Antworten der Fragen funktionieren als Radiogruppe mit Pfeiltasten.
- Das Formular hat sichtbare Fehlermeldungen mit `aria-invalid` und `aria-describedby`, der Fokus springt aufs erste Fehlerfeld.
- `prefers-reduced-motion`: Alle Übergänge springen sofort in den Endzustand.

## Design-Referenz: Was aus Figma übernommen wurde

Quelle: Figma „MUSTERHAUSKÜCHEN“, Screen *Screendesign-Vorschlag-FINAL-Themenwelten* (node 22-2), per Figma-MCP ausgelesen. Es sind dieselben Tokens wie in Version 1–3.

| Token | Figma | Umsetzung |
|---|---|---|
| Akzentrot | `#e30613` | `--mhk-red`: Schalter an, Fortschritt, Häkchen, Buttons |
| Textfarbe | `#3c3c3c` | `--ink`, gewählte Variante, dunkler Button |
| Flächengrau / Rand | `#f5f5f5` / `#e6e6e6` | Hintergrund der Zusammenfassung, Karten- und Kategorienrahmen |
| Headline-Font | Dashiell Bright Black | Ersatz Fraunces 900 (Dashiell ist ein Adobe-Font) |
| Fließtext, Buttons | Open Sans, rote eckige Buttons | übernommen |
| Karten | weiß, heller Rand, rote Akzentlinie | Kategorien, Zusammenfassungskarte, Formular |

## Inhalte, Recht & Datenschutz

- Es gibt keine Preise, Preisschätzungen, Maße oder Traglasten. Platzhalter sind gekennzeichnet (`[Platzhalter]`, `[Maß folgt]`). Steckdosen-Turm und Klapp-Arbeitsplatz sind erfundene Platzhalter-Features mit Badge.
- Es gibt keine Umwelt- oder Nachhaltigkeitsaussagen (EmpCo).
- **Formular:** Es ist eine Demo und sendet **nichts** ab. Das steht sichtbar am Formular, die Erfolgsmeldung wiederholt es.
- **Externe Requests:** keine Tracker. Extern geladen werden nur GSAP (jsDelivr) und die Schriften (Google Fonts).
- **Vor dem Livegang nötig:** ein echtes Formular mit Datenschutzerklärung, Einwilligungstext und gegebenenfalls Double-Opt-in. Dazu Consent-Management für Fonts/CDN oder lokales Hosting, eine Auftragsverarbeitung mit CRM bzw. Studio sowie Lösch- und Aufbewahrungsfristen.

## Getestet

Mit Playwright in Chrome bei 1440 × 900, 768 × 1024 und 390 × 844 getestet:

- **Einstieg:** Einstiegsfragen ergeben die erwartete Vorkonfiguration (8 von 9).
- **Schalter:** alle Features einzeln an und aus. Die Vorschau reagiert in unter 120 ms.
- **Regeln:** Oberschrank links entfernt Couch und Regal mit Begründung. „Rückgängig“ stellt den vorigen Stand wieder her.
- **Ansicht:** Variantenwechsel und Detail-Ansicht.
- **Link:** Er stellt die Konfiguration in einem neuen Tab identisch wieder her.
- **Zusammenfassung:** inklusive PNG-Export.
- **Formular:** Validierung und Erfolgsmeldung.
- **Belastungstest:** Jeder Layer wurde 4-, 5- und 7-mal schnell hintereinander umgeschaltet, und der Endzustand stimmte jedes Mal.

Es gab keine Konsolenfehler.

## Offene Punkte für die Produktion

- [ ] **Echtes Formular:** serverseitige Validierung, Spam-Schutz, Double-Opt-in, Datenschutz- und Einwilligungstexte
- [ ] **CRM-Anbindung / Studio-Routing:** Konfiguration als strukturierte Daten (Feature-IDs + Varianten) an den Lead hängen
- [ ] **Consent-Management**; Fonts und GSAP lokal hosten
- [ ] Echte Studio-Liste (Studiosuche) statt Platzhalter-Optionen
- [ ] Freigegebene Feature-Texte, Varianten (2-/3-Sitzer), Maße; Platzhalter-Features bestätigen oder streichen
- [ ] Echte Vorschaugrafiken (Freisteller pro Feature) oder 3D-Vorschau mit derselben Schnittstelle
- [ ] Teilen-Link mit Open-Graph-Bild der Konfiguration (serverseitig gerendert)
- [ ] Analytics erst nach Consent: Einstieg genutzt, häufige Kombinationen, Abbrüche, Lead-Conversion
