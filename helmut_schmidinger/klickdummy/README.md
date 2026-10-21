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
| diskographie.html | page-diskographie.php | automatisch aus ACF-Feld „diskographie“ |
| bibliographie.html | page.php | Gutenberg |
| kontexte.html | taxonomy-kontext.php | Taxonomie **kontext** |
| lehre*.html | page.php | Gutenberg (Akkordeon = Block „Details“) |
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
| `index.html` + Unterseiten | Original | – | jetzt Instrument Serif + Geist (vorher Playfair Display + Jost) |

- `assets/js/klaviatur.js`: Tasten, Facetten-Panel, Facetten-Liste und Wortwolke. Die Facetten-Daten stehen oben in der Datei.
- `assets/css/klaviatur.css`: Basis der Klaviatur und Umschalter. Jede Version hat ihr eigenes `assets/css/v-*.css`.
- `assets/css/fonts.css` + `assets/fonts/`: alle Schriften lokal (OFL, gratis), keine Google-Server mehr.

Die frühere Version C (Mosaik) wurde verworfen, die Buchstaben sind nachgerückt. Startseiten zeigen unter dem Hero nur noch: Nächste Aufführungen + Wortwolke Kontexte.
