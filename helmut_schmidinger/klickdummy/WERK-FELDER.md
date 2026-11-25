# Werk – Felder für WordPress

Grundlage: Helmuts „Musterwerk“ (Word, 11/2026) + Abstimmung mit Manuel.
Ansicht im Klickdummy: `werk-musterwerk-eigenverlag.html` und `werk-musterwerk-fremdverlag.html`.

Umsetzung: Inhaltstyp (CPT) **werk**, Feldgruppe mit ACF. Leere Felder werden auf der Seite automatisch ausgeblendet –
ein einfaches Werk bleibt kurz. Pflicht ist nur der Titel und die Gattung.

## Grunddaten
| Feld | Typ | Hinweis |
|---|---|---|
| Werktitel | WP-Titel | **Pflicht** |
| Untertitel | Text | z. B. „Liederzyklus für mittlere Stimme und Klavier (2018/2019)“ |
| Gattung | Taxonomie *gattung* (Auswahl) | **Pflicht** · bei Kammermusik zusätzlich Besetzungsgröße Duo … Oktett |
| Entstehungsjahr/e | Text | „2018/2019“, „2021–2023“ |
| Dauer | Text | Gesamtdauer selbst eingeben, z. B. „ca. 24’“ |
| Besetzung | Text (frei) | genaue Besetzung |
| Textautor:innen | Wiederholung (Name) | auf Werkebene: Einzellied, Libretto – mehrere möglich; Beschriftung wählbar (Text / Libretto) |
| Widmung | Text | |
| Auftraggeber | Text | |
| Für Schulen geeignet | Häkchen | ordnet das Werk automatisch auch „Besonders für Schüler:innen und Schulen geeignet“ zu |
| Bild | Bild (1) | in der Regel 1. Partiturseite |

## Sätze (Wiederholung, beliebig viele)
| Feld | Typ | Hinweis |
|---|---|---|
| Nummer | Text, optional | meist römische Ziffer (I, II …) oder „1. Bild“ |
| Satztitel | Text | |
| Dauer | Text | |
| Textautor:in | Text, optional | je Lied bei Liederzyklen |
| Überschrift der Liste | Auswahl | Sätze / Lieder / Bilder / Szenen |

## Texte
| Feld | Typ | Hinweis |
|---|---|---|
| Einführungstext | Editor | |
| Kontext | Taxonomie *kontext* (Schlagworte, frei vergebbar) | speist die Kontextwolke auf „Kontexte“ |
| Presse | Wiederholung | Zitat, Medium, Datum, Autor:in (optional), Link (optional) |

## Aufführungen
| Feld | Typ | Hinweis |
|---|---|---|
| Uraufführung | Gruppe | Datum, Stadt, Land (Kürzel), Spielstätte, Interpret:innen, Zusatz („Im Rahmen der …“) |
| Erstaufführungen | Wiederholung | Datum, Stadt, Land, Spielstätte, Interpret:innen, **Land der EA (optional)** → „Deutsche Erstaufführung“ usw. |
| Termine | automatisch | alle Termine (CPT *termin*) mit Beziehungsfeld „Werk“ = dieses Werk; getrennt nach „Demnächst“ / „Bisher“ |

Ein Termin mit Hinweis „Uraufführung“ trägt sich automatisch als UA ins Werk ein, wenn das Feld noch leer ist.

## Audio & Video (Wiederholung)
| Feld | Typ | Hinweis |
|---|---|---|
| Art | Auswahl | Audio / Video |
| Interpret:innen | Text | |
| „Label“ | Text | „Rundfunkmitschnitt der UA“, „CD-Produktion“, „DVD“ … |
| Zugang | Auswahl | **öffentlich** (abspielbar) / **auf Anfrage** (nur gelistet, Link zum Anfrageformular) |
| Datei / YouTube-Link | Datei (MP3) bzw. URL | nur bei „öffentlich“ |
| CD | Beziehung zur Diskographie, optional | eine CD wird einmal angelegt und bei mehreren Werken gewählt |

## Verlag & Anfrage
| Feld | Typ | Hinweis |
|---|---|---|
| Verlag | Auswahl: Eigenverlag / Fremdverlag | |
| Fremdverlag | Auswahl aus Verlagsliste (Name, Website) | nur bei Fremdverlag |
| Bestelllink | URL | nur bei Fremdverlag – Link direkt zur Bestellseite des Werks |

- **Eigenverlag:** Anfrageformular auf der Werkseite (Werk vorbefüllt, Häkchen Noten / Audio / Video).
- **Fremdverlag:** kein Formular – Buttons „Zur Bestellseite“ und „Website des Verlags“.

## PDF
„Als PDF speichern“ öffnet den Druckdialog des Browsers („Als PDF sichern“). Ein eigenes Druck-Layout
(`@media print` in `main.css`) zeigt nur die Werkinfos – ohne Menü, Formular, Player und Fußzeile.
Alternative in WP, falls ein echter PDF-Download gewünscht ist: PDF-Plugin, das dasselbe Layout nutzt.

## Offen
- Satzbezeichnung vs. Satztitel – mit Helmut klären (derzeit ein Feld „Satztitel“).
- Werkverzeichnis-Nummer, Fassungen/Bearbeitungen mit Bezug zum Original – mit Helmut klären.
