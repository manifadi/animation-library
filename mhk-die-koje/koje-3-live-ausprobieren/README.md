# Die Koje · Version 3 – Live ausprobieren (Klickdummy)

Die Koje zum Anfassen: Nutzer:innen ziehen Schubladen auf, fahren die Couch aus, lassen das Tablet ausfahren, malen auf der Spielwand und schalten Lichtstimmungen, auf Wunsch mit synthetischen Sounds. Ein Zähler belohnt, wer alle sechs Features ausprobiert hat.

## Starten

Reines HTML/CSS/JS (ES-Module), kein Build-Schritt. GSAP inkl. Draggable und Flip kommt per CDN. Weil die Seite ES-Module nutzt, braucht sie einen lokalen Server:

```bash
# im Repo-Root
python3 -m http.server 8080
# oder: npx serve .
```

Dann `http://localhost:8080/mhk-die-koje/koje-3-live-ausprobieren/` öffnen. Alternativ `mhk-die-koje/start.command` doppelklicken.

## Dateien

```
index.html        Seite: Hero, Werkzeugleiste, Bühne (Intro, Licht, Drawer, Belohnung), CTA
css/style.css     Design-Tokens (:root) und Szenen-Klassen (.sc-*)
js/scene.js       ★ die komplette SVG-Szene mit benannten Gruppen
js/pullable.js    ★ Physik für ziehbare Elemente (Masse, Widerstand, Einrasten, Selbsteinzug)
js/sound.js       synthetische Sounds (Web Audio API)
js/main.js        Verdrahtung: Tablet, Spielwand und Malen, Licht, Zähler, Führung, Parallax
assets/           Logo, Vorschaubild
```

## Aufbau der Szene & Element-IDs

Frontalansicht, `viewBox="0 0 1200 800"`, Boden bei y = 700. Die Szene besteht aus drei Tiefenebenen. Das Attribut `data-depth` steuert die Mikro-Parallaxe bei Mausbewegung.

| Ebene | `data-depth` | Inhalt |
|---|---|---|
| `#layer-back` | 0.12 | Wand, Fenster, Boden |
| `#layer-mid` | 0.4 | Nische mit `#couch`, `#oberschrank`, `#lichtleiste`, `#tablet-halter`, Unterschränke mit `#schublade-unten`, Hochschrank |
| `#layer-front` | 1 | Pendelleuchten, `#insel` mit `#spielwand` und `#staubsauger-fach` |
| Overlays | – | `.sc-dark` (Abdunklung), `.sc-tint` (Farbton) |
| `.lights` | wie Quelle | Lichtkegel, LED-Schein, Sockel- und Nischenlicht (`mix-blend-mode: screen`, liegen über der Abdunklung) |
| `.hints` | wie Quelle | pulsierende Hinweispunkte (`.hint[data-for]`) und Hand-Hinweis |

| ID | Interaktion | Teile |
|---|---|---|
| `schublade-unten` | Ziehen ↓, Klick, Enter, ↑/↓ | `#schublade-front`, `#schublade-boden`, `#schublade-inhalt` (Töpfe) |
| `staubsauger-fach` | Ziehen ↓, Klick, Enter, ↑/↓ | `#fach-front`, `#fach-boden`, `#fach-inhalt` (Saugroboter und Akkusauger) |
| `couch` | Ziehen ↓, Klick, Enter, ↑/↓ | `#couch-body`, `#couch-polster` (klappt auf), `#couch-label` |
| `tablet-halter` | Klick, Enter, ↑/↓ | `#tablet-move` (Arm), `#tablet-device` (schwenkt), `#tablet-timer` |
| `spielwand` | Klick oder Enter klappt auf, danach Malen | `#spielwand-klappe`, `#spielwand-tafel`, `#spielwand-zeichnung`, `#spielwand-palette` |
| `lichtleiste` | Klick, Enter wechselt die Stimmung | LED-Leiste unter dem `#oberschrank` |
| `insel`, `oberschrank` | – | Gruppen für spätere Assets |

**Physik der Auszüge (`pullable.js`):** Das Element folgt dem Finger mit leichter Verzögerung (Masse), hat Widerstand und federt am Anschlag nach (Gummiband). Wer über 85 % zieht oder wirft, lässt es ganz auffahren und mit „Klack“ einrasten. Unter 30 % losgelassen zieht es sich gedämpft selbst zu (`power4.out`). Dazwischen gleitet es mit Trägheit aus. Die Schwellen stehen als `SNAP_AT` und `SELF_CLOSE_BELOW` oben in der Datei.

**Lichtstimmungen:** Die Werte pro Stimmung stehen in `MOODS` in `main.js`: Wand, Himmel, Tönung, Dunkelheit, LED, Lichtkegel, Glühbirne, Sockel, Nische und Sonnenstrahl. Der Dimmer skaliert das Kunstlicht. Alles wird als CSS-Variable auf das SVG geschrieben (`--led`, `--cone` …).

## Grafiken oder ein echtes Asset einsetzen

- **Einzelne Module tauschen:** Den Inhalt einer Gruppe in `js/scene.js` durch eine Grafik ersetzen, z. B. `<image href="assets/couch.png" x="56" y="480" width="298" height="220"/>`. Die ID und die Unterteilung (`#couch-body`, `#couch-polster` …) bleiben erhalten, dann funktionieren Physik und Animation weiter.
- **Fotografisches Gesamtbild:** Das Bild als `<image>` in `#layer-back` legen und die übrigen Gruppen als Ebenen darüber freigestellt anordnen. Die Fronten der Auszüge (`#schublade-front` usw.) sollten eigene Freisteller bleiben, weil sie sich bewegen.
- **3D-Asset später:** Die Logik ist von der Darstellung getrennt. `makePullable({ render(p) {…} })` bekommt nur einen Fortschritt von 0 bis 1. Eine Three.js- oder `<model-viewer>`-Szene müsste in `render` die Animation des Modells auf `p` setzen; Zähler, Sound, Drawer und Tastatur bleiben unverändert. Version 1 zeigt, wie man Scroll-Fortschritt auf GLB-Animationen mappt.

## Sound

- Alle Klänge werden per Web Audio API erzeugt, es gibt keine Dateien: sanftes Klack (gefiltertes Rauschen plus tiefer Körper), gedämpftes Gleiten (Lautstärke folgt der Zuggeschwindigkeit), Einrasten, Selbsteinzug, Motor, Kreide und Fanfare.
- Ambient pro Stimmung: Morgen = heller Akkord mit vereinzeltem Zwitschern, Kochen = leises Rauschen und Brummen, Abend = warmes, tiefes Pad.
- Der Ton ist standardmäßig **aus**. Der AudioContext entsteht erst beim Klick auf das Lautsprecher-Symbol, der Zustand wird als „Ton an/aus“ mit `aria-pressed` angezeigt.

## Bedienung, Touch & Barrierefreiheit

- **Mobil:** Die Szene ist horizontal scrollbar, Licht und Drawer stehen unter der Szene. Vertikale Wischgesten auf Auszügen ziehen diese, horizontale scrollen die Szene. Auf Wand und Boden scrollt die Seite normal. Beim Malen wird nicht gescrollt. Haptik läuft über `navigator.vibrate`, wo verfügbar.
- **Tastatur:** Alle Module sind per Tab erreichbar und haben einen sichtbaren Fokusrahmen. Enter oder Leertaste bedient, ↑/↓ verschiebt. Die Lichtstimmungen sind eine Radiogruppe mit Pfeiltasten. Escape schließt Belohnung, Intro oder Spielwand.
- **Feature-Leiste unter der Szene:** Jedes Element lässt sich auch per Button bedienen. Auf Mobil wird es dabei ins Bild gescrollt.
- **Spielwand:** Die Farben und „Löschen“ gibt es zusätzlich als HTML-Buttons im Drawer.
- **`prefers-reduced-motion`:** keine Parallaxe, kein Pulsieren, Zustände springen ohne Animation.

## Design-Referenz: Was aus Figma übernommen wurde

Quelle: Figma „MUSTERHAUSKÜCHEN“, Screen *Screendesign-Vorschlag-FINAL-Themenwelten* (node 22-2), per Figma-MCP ausgelesen. Es sind dieselben Tokens wie in Version 1 und 2.

| Token | Figma | Umsetzung |
|---|---|---|
| Akzentrot | `#e30613` | `--mhk-red`: Hinweise, Buttons, Zähler, aktive Stimmung |
| Textfarbe | `#3c3c3c` | `--ink`, dunkler Button, Ton-an-Zustand |
| Flächengrau / Rand | `#f5f5f5` / `#e6e6e6` | Panels (mobil), Werkzeug- und Leisten-Buttons |
| Headline-Font | Dashiell Bright Black | Ersatz Fraunces 900, weil Dashiell ein Adobe-Font ist |
| Fließtext, Buttons | Open Sans, rote eckige Buttons | übernommen |
| Rote Vollfläche | Block „Lange für Sie da!“ | CTA „Das will ich haben.“ |
| Bildsprache | warme Holztöne, helle Fronten, Wohnlichkeit | Eiche, Greige-Fronten, warmes Licht in der Szene |

## Inhalte & rechtliche Leitplanken

- Es gibt keine Maße, Traglasten oder Preise. Platzhalter sind markiert: `[Maß folgt]`, „Sitzplatz für [Platzhalter] Personen“, `[Platzhalter: … folgt]`.
- Es gibt keine Umwelt- oder Nachhaltigkeitsaussagen (EmpCo).
- Die Inhalte des Sockelfachs (Saugroboter und Akkusauger) sind ein Platzhalter.

## Getestet

Mit Playwright in Chrome bei 1440 × 900, 768 × 1024 und 390 × 844 (Touch-Emulation). Automatisiert durchgespielt:

- **Schublade:** Ziehen mit Einrasten, halb ziehen und stehen lassen (p = 0,49), zurückschieben mit Selbsteinzug.
- **Tastatur:** Sockelfach per Enter, Couch per Pfeiltasten (0,4 → einrasten → Selbsteinzug).
- **Übrige Elemente:** Couch per Klick, Tablet, Spielwand mit Malen, Lichtstimmung „Abend“.
- **Abschluss:** 6/6 mit Belohnung und Fokus im Dialog, danach Reset.
- **Touch per CDP-Events:** Ein vertikaler Zug auf die Schublade öffnet sie, ohne die Seite zu scrollen. Ein Wisch auf die Wand scrollt die Seite, ein horizontaler Wisch scrollt die Szene. Malen per Finger scrollt nicht mit.
- **Ton:** einschalten.
- **`prefers-reduced-motion`:** ohne Fehler.

In keinem Durchlauf gab es Konsolenfehler.

## Offene Punkte für die Produktion

- [ ] Echte Freisteller bzw. 3D-Asset der Koje, Proportionen nach Planungsdaten
- [ ] Sounddesign mit echten Aufnahmen (Foley) statt Synthese; Lautstärke und Mix abstimmen
- [ ] Freigegebene Texte, Sitzplatzanzahl, Maße, Ausstattung des Sockelfachs
- [ ] Spielwand: Zeichnung speichern oder teilen? Eventuell als echtes `<canvas>` mit Kreide-Textur
- [ ] Haptik auf iOS (`navigator.vibrate` fehlt dort) – eventuell mit einem visuellen Ersatz
- [ ] Dashiell Bright über Adobe-Fonts-Kit; GSAP lokal bündeln
- [ ] Tracking: welches Feature zuerst, Abbruchpunkte, CTA-Klicks
- [ ] Test auf echten Geräten (iOS Safari, Android Chrome), besonders Touch-Gesten und Audio
