# Helmut Schmidinger – Klickdummy

Statischer HTML/CSS/JS-Klickdummy für den WordPress-Relaunch. Start: `index.html`, alle Komponenten auf einen Blick: `styleguide.html`.

## Seiten → WordPress-Template
| Datei | WP-Template | Inhalt |
|---|---|---|
| index.html | front-page.php | Hero, 3 Teaser (ACF), nächste Aufführungen (automatisch) |
| aktuelles.html | archive-auffuehrung.php | CPT **auffuehrung**, Filter Jahr/Monat/Werk |
| zur-person.html, biographie.html, preise.html, privates.html | page.php | Gutenberg |
| werk.html | page.php | Gattungs-Kacheln, Downloads |
| gattung-*.html | taxonomy-gattung.php | Werkliste je Gattung (+ „für Schulen“) |
| werk-*.html | single-werk.php | CPT **werk**: Fakten (ACF), Aufführungen (automatisch), Anfrageformular |
| werk-musterwerk-eigenverlag.html, werk-musterwerk-fremdverlag.html | single-werk.php | Musterwerke mit **allen** Feldern (Vorlage Helmut, 11/2026) – Feldliste: `WERK-FELDER.md` |
| termin-*.html | single-termin.php | CPT **termin** (Art Workshop/Vortrag): Fakten, Beschreibung, Anmeldung, weitere Termine – Aufführungen verlinken auf die Werkseite |
| diskographie.html | page-diskographie.php | automatisch aus ACF-Feld „diskographie“ |
| kontexte.html | taxonomy-kontext.php | Taxonomie **kontext** |
| lehre*.html | page.php | nicht mehr im Menü (Kundenwunsch 11/2026), Seiten nur noch als Vorlage |
| kontakt.html | page-kontakt.php | Theme-Optionen + Contact Form 7 |
| impressum.html, datenschutz.html, suche.html | page.php / search.php | |

## Konventionen
- `l-` Layout · `c-` Komponente (BEM) · `p-` Seitentemplate · `u-` Utility · `is-` Zustand (JS)
- Design-Tokens als CSS-Variablen in `assets/css/main.css` (Abschnitt 1)
- `data-acf="…"` markiert, welches ACF-Feld an der Stelle ausgegeben wird
- HTML-Kommentare `WP-Template:` / `ACF:` zeigen die Zuordnung
- Hover-/Focus-Zustände sind zusätzlich als Klassen `.is-hover` / `.is-focus` vorhanden (für Figma-Import, siehe Styleguide)

## Hinweise
- Bilder in `assets/img/` sind Platzhalter aus den KI-Mockups – durch echte Fotos ersetzen.
- Inhalte = Beispieldaten aus der Live-Seite (nicht vollständig geprüft); `[…]` = Inhalt folgt.
- Schriften: Playfair Display + Jost (Google Fonts, in WP lokal einbinden – DSGVO).
- EN-Umschalter ist Platzhalter (später optional Polylang).

## Startseiten-Versionen (Oktober 2026)

Nach dem Kundenmeeting: Klaviatur vom Briefpapier als Facetten-Navigation, „Lehre“ raus aus dem Menü.

| Datei | Version | Inspiration | Schriften |
|---|---|---|---|
| `versionen.html` | Übersicht zum Vergleichen | – | – |
| `start-a.html` | A · Kontrast | Amosov | Inter Tight |
| `start-b.html` | B · Bühne | The Encore | Newsreader + Geist |
| `start-c.html` | C · Plakat | Northtime | Archivo Condensed + Geist Mono + Herr Von Muellerhoff |
| `start-d.html` | D · Kombination (Favorit) | A + C | Inter Tight |
| `index.html` + Unterseiten | Original (Hero mit Facetten + Klaviatur, Stil des Originals) | – | jetzt Instrument Serif + Geist (vorher Playfair Display + Jost) |

- `assets/js/klaviatur.js`: Tasten, Facetten-Panel, Facetten-Liste und Wortwolke. Die Facetten-Daten stehen oben in der Datei. `data-kv-stable` am Panel hält es so hoch wie die längste Facette (nichts darunter springt).
- Original (`index.html`): Facetten-Styles am Ende von `assets/css/main.css` (`.p-home-facets*`, `.p-home-hero__quote`).
- `assets/css/klaviatur.css`: Basis der Klaviatur und Umschalter. Jede Version hat ihr eigenes `assets/css/v-*.css`.
- `assets/css/fonts.css` + `assets/fonts/`: alle Schriften lokal (OFL, gratis), keine Google-Server mehr.

Die frühere Version C (Mosaik) wurde verworfen, die Buchstaben sind nachgerückt. Startseiten zeigen unter dem Hero nur noch: Nächste Aufführungen + Wortwolke Kontexte.

## Design-Versionen B und C

`?v=b` an eine beliebige Seiten-URL hängen (oder unten links „Design A | B“) – die Wahl bleibt beim Weiterklicken erhalten.
Version B = `assets/css/version-b.css` (lädt `assets/js/version.js` nur bei B) – Methode „unslop“ von Damir Sokolovsky (@heydamir), CC BY 4.0.
Inhalte und Struktur sind identisch, B vereinheitlicht nur Typografie, Labels, Karten, Badges und die Termine-Liste.

**Version C** (`?v=c`) = B + einfachere Wege: `assets/css/version-c.css`, `assets/js/version-c.js` (dort erklärt, inkl. WP-Umsetzung).
Markup nur für C trägt `data-only-c`, in C ausgeblendetes `data-not-c`. Neue Seite `facetten.html` (Inhaltstyp „Facette“, nur in C verlinkt).
