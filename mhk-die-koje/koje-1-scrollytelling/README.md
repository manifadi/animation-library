# Die Koje · Version 1 – Scrollytelling (Klickdummy)

Proof of Concept einer Landing Page für „Die Koje“ von musterhaus küchen. Beim Scrollen fährt eine virtuelle Kamera wie auf einer Apple-Produktseite um die Küche und hält an fünf Feature-Stationen. Die Küche bleibt dabei als Ganzes stehen, nur die Kamera bewegt sich.

## Starten

Reines HTML/CSS/JS (ES-Module), kein Build-Schritt. Wegen der ES-Module braucht die Seite einen lokalen Server:

```bash
# im Repo-Root oder in diesem Ordner
npx serve .
# oder
python3 -m http.server 8080
```

Dann `http://localhost:8080/mhk-die-koje/koje-1-scrollytelling/` öffnen (bzw. den Ordnerpfad passend zum Startverzeichnis).

Nützliche URL-Parameter:

| Parameter | Wirkung |
|---|---|
| `?static` | Statische Feature-Abschnitte erzwingen (wie bei `prefers-reduced-motion`) |
| `?model=assets/koje.glb` | Echtes 3D-Modell statt Blockout-Küche laden |

## Dateien

```
index.html          Seite, Importmap (Three.js, GSAP + ScrollTrigger, Lenis per CDN), Inhalte
css/style.css       Design-Tokens (:root), Layout, statischer Modus
js/camera-path.js   ★ Kamerapfad, Stationen, Feature-Timing, Lichtstimmungen – hier wird getunt
js/main.js          Renderer, Scroll-Logik, Interpolation, Panels, Navigation, Hotspot, Fallbacks
js/kitchen.js       Prozedurale Blockout-Küche inkl. Anker-Objekte und Feature-Bewegungen
js/textures.js      Canvas-Texturen (Eiche, Dielen, Kreidetafel, Rezept-Screen)
assets/             Logo (aus Figma), Vorschaubild
```

## Design-Referenz: Was aus Figma übernommen wurde

Quelle: Figma „MUSTERHAUSKÜCHEN“, Screen *Screendesign-Vorschlag-FINAL-Themenwelten* (node 22-2), per Figma-MCP ausgelesen (`get_design_context`, `get_screenshot`). Der Frame ist 2237 px breit, deshalb wurden die Größen mit Faktor ≈ 0,644 auf 1440 px umgerechnet.

| Token | Figma | Umsetzung |
|---|---|---|
| Akzentrot | `#e30613` | `--mhk-red` – Headline-Akzente, Buttons, Icons, Pfeile |
| Textfarbe | `#3c3c3c` | `--ink` – Headlines, Fließtext, dunkler Button |
| Flächengrau | `#f5f5f5` | `--paper-soft` – Zusammenfassung |
| Headline-Font | Dashiell Bright Black, 92 px | `--font-head`. **Abweichung:** Dashiell ist ein Adobe-Font und auf GitHub Pages nicht frei einbindbar, deshalb Fraunces 900 (Google Fonts) als Ersatz. Mit einem Adobe-Fonts-Kit greift Dashiell automatisch zuerst. |
| Fließtext | Open Sans 24–26 px | Open Sans 16 px |
| Buttons | Rot, eckig, Open Sans SemiBold weiß, 69 px hoch | `.btn`, 48 px hoch, `--radius: 0` |
| Dunkler Button | `#3c3c3c` („Mehr erfahren“) | `.btn--dark` im roten CTA-Block |
| Karten | weiß, 1 px heller Rand, rote Serif-Titel, „Jetzt ansehen ⟶“ | `.feature`, `.station-card` |
| Headline-Muster | einzelne Wörter rot („Voller **Vorteile …**“) | `.accent` in jeder Headline |
| Logo | dunkle Box hängt oben links | `.logo` (PNG aus Figma exportiert) |
| Rote Vollfläche | „Lange für Sie da!“-Block | CTA-Abschnitt am Seitenende |
| Inhaltsrahmen | Flächen 42 px vom Frame-Rand | `--frame-inset` |

Bewusst ergänzt, weil Figma dafür keine Vorlage hat: 3D-Bühne, Glas-Panel (weiß 94 % + Blur, damit der Text vor der Szene lesbar bleibt), Fortschrittsnavigation und Pulsierpunkt.

## Kamera-Keyframes anpassen (`js/camera-path.js`)

Jeder Keyframe hängt an einem **benannten Anker** (Empty-Objekt). Kamera-Position und Blickpunkt sind **Offsets relativ zum Anker**:

```js
{ id: "tablet", anchor: "anchor_tablet", offset: [1.15, 0.68, 1.15], look: [0, -0.02, 0], fov: 40, hold: [0.28, 0.36], drift: 0.05 }
```

- `offset`: Kamera = Ankerposition + offset (Meter, x rechts, y oben, z zum Betrachter)
- `look`: Blickpunkt = Ankerposition + look
- `fov`: vertikales Sichtfeld. Im Hochformat wird es automatisch etwas geöffnet.
- `hold: [von, bis]`: Scroll-Fortschritt (0–1), in dem die Kamera steht. Zwischen zwei Halten fährt sie mit `power2.inOut`.
- `hold` mit `von === bis` ist ein reiner Wegpunkt (z. B. `via-insel`, damit die Kamera um die Insel herum fährt statt hindurch).
- `drift`: leichtes Nachschieben während des Halts (Anteil der Strecke zum Blickpunkt)

Die Positionen werden über eine CatmullRom-Kurve (centripetal) interpoliert. Die Fahrt bleibt deshalb auch über Wegpunkte hinweg weich.

Weitere Stellschrauben in derselben Datei:

- `SCROLL_LENGTH_VH`: Gesamtlänge der Fahrt (aktuell 760 vh)
- `STATIONS`: Sichtbarkeitsbereich der Textpanels, Sprungziel der Navigation, Position des Pulsierpunkts
- `FEATURE_ANIMS`: Scroll-Bereiche für Klappe, Tablet-Auszug, Couch-Auszug und Roboter
- `LIGHT_KEYS` / `LIGHT_MOODS`: Lichtstimmungen (Tag, Morgen, Kochen, Abend) und ihre Werte

Tipp zum Tunen: Die Seite mit `?static` öffnen. Dort rendert die Szene von jeder Station ein Standbild, und man sieht alle Perspektiven untereinander.

## 3D-Modell austauschen

1. Das GLB nach `assets/` legen, z. B. `assets/koje.glb`.
2. Die Seite mit `?model=assets/koje.glb` aufrufen oder `MODEL_URL` in `js/main.js` fest setzen.
3. Im Modell **Empties mit den Anker-Namen** anlegen: `anchor_overview`, `anchor_spielwand`, `anchor_tablet`, `anchor_couch`, `anchor_staubsauger`, `anchor_licht`. Fehlt ein Anker, wird die Standardposition aus `ANCHOR_DEFAULTS` genommen.
4. Optional: Animation-Clips mit den Namen `klappe`, `tablet`, `couch`, `roboter` werden automatisch per Scroll gescrubbt.
5. Kann das Modell nicht geladen werden, fällt die Seite auf die Blockout-Küche zurück (Warnung in der Konsole).

Der Kamerapfad muss dabei nicht umgeschrieben werden, solange die Anker an den richtigen Stellen sitzen. Nur die Offsets werden eventuell an die echten Proportionen angepasst.

Hinweis: Die Lichtstimmungen steuern beim GLB nur Sonne, Himmel, Umgebung und Hintergrund. LED-Leiste, Pendel und Akzentlicht sind Teil der Blockout-Küche (`kitchen.fixtures`) und müssten für das echte Modell neu verdrahtet werden.

## Barrierefreiheit & Fallbacks

- `prefers-reduced-motion` oder `?static`: keine Kamerafahrt. Die Stationen erscheinen als normale Abschnitte mit je einem gerenderten Standbild, „Licht“ mit drei Bildern (Morgen, Kochen, Abend).
- Kein WebGL oder CDN nicht erreichbar: statischer Modus ohne Bilder. Ein Sicherheitsnetz im `<head>` schaltet nach 12 s um.
- Alle Texte stehen im DOM in Lesereihenfolge (Screenreader). Canvas und Hotspot sind `aria-hidden`.
- Tastatur: Skip-Link, fokussierbare Navigation mit `aria-current="step"`, sichtbarer Fokusrahmen. Ein Sprung setzt den Fokus auf die Station.
- Performance: Bloom nur auf großen Screens mit Maus, Pixel-Ratio auf Mobile ≤ 1,5, Rendering pausiert unterhalb der Bühne. Gemessen: ~59 fps beim Scrollen (Chrome, Desktop).

## Getestet

Playwright mit Chrome bei 390 × 844, 768 × 1024 und 1440 × 900, jeweils alle Stationen, dazu der statische Modus, Navigationsklicks und der GLB-Fallback. Keine Konsolenfehler.

## Bewusst vereinfacht

- Die Küche ist ein prozeduraler Blockout. Proportionen sind grob realistisch, aber **keine Produktdaten**.
- Feature-Bewegungen (Klappe, Tablet-Auszug, Couch-Auszug, Roboter) sind nur angedeutet, die echte Mechanik ist unbekannt.
- Alle Maße, Mechaniken und Steuerungen sind als `[Platzhalter]` bzw. `[Maß folgt]` gekennzeichnet.
- Keine Umwelt- oder Nachhaltigkeitsaussagen (EmpCo-Richtlinie). Garantie- oder Preisangaben wurden ebenfalls bewusst weggelassen.
- Der Bildsequenz-Fallback wurde nicht gebaut. Stattdessen gibt es Standbilder pro Station aus der Live-Szene.

## Offene Punkte für das Produktionsprojekt

- [ ] Finales 3D-Modell (GLB, Draco/Meshopt-komprimiert, KTX2-Texturen) mit Ankern und Feature-Clips
- [ ] Echte Lichtplanung: Leuchten im Modell, eventuell gebackene Lightmaps je Stimmung
- [ ] Freigegebene Texte, Maße, Mechanik- und Steuerungsdetails (Platzhalter ersetzen)
- [ ] Dashiell Bright über Adobe-Fonts-Kit einbinden
- [ ] Rechtliche Prüfung der finalen Claims
- [ ] Performance-Budget auf echten Mittelklasse-Android-Geräten messen und eventuell Bildsequenz-Fallback für Low-End
- [ ] Tracking: Station erreicht, CTA-Klicks
- [ ] Bibliotheken lokal bündeln statt CDN (Ausfallsicherheit, DSGVO)
- [ ] Cookie- und Consent-Integration, Impressum und Datenschutz im Footer
