# Klickdummy – Schrack Seconet Corporate Website

Statischer Stand (ohne Animationen, Loader, Soft-Scroll). Seiten im Browser öffnen.

**Grundregel:** Layout und Styles aus dem Design-File („Web Konzept 2 (ohne Personas)“), Inhalte aus dem Wireframe („Corporate Website (Wireframes)“), Bilder immer als Platzhalter (.ph), nie echte Bilder (Ausnahme bisher: finale Bereichs-Kacheln der Startseite).


| Datei | Seite | Design-Vorlage | Inhalte |
|---|---|---|---|
| index.html | Startseite | Figma „01a Home“ | Wireframe „01 Startseite“ |
| fire-safety.html | Bereich Fire Safety | Martins Screen „Martin-HealthCare“ | Wireframe „11 Bereich – Fire Safety“ |
| health-care.html | Bereich Health Care | Martins Screen „Martin-HealthCare“ | Wireframe „12 Bereich – Health Care“ |
| security.html | Bereich Security | Martins Screen „Martin-HealthCare“ | Wireframe „13 Bereich – Security“ |
| anwendungen.html | Anwendungen-Übersicht | Martins Screen „Martin-Anwendungen-Übersicht“ | Wireframe „20 Anwendungen-Übersicht“ |
| bereiche.html | Bereiche-Übersicht | Layout der Anwendungen-Übersicht (kein eigenes Design von Martin) | Wireframe „10 Bereiche-Übersicht“ |
| lifecycle.html | Life Cycle | Martins Screen „Martin-Life-Cycle“ | Wireframe „30 Life Cycle“ (Tab-Modul Life Cycle) |
| anwendung-krankenhaus.html, anwendung-flughafen.html, anwendung-rechenzentrum.html | Anwendungs-Detailseiten | Martins Screen „Martin-Gebäudetyp-Detail a“ | Wireframe „21–23 Anwendung“ + Tab-Modul Anwendung |
| ueber-uns.html | Über die Schrack Seconet AG | Bausteine aus dem Design-File (kein eigener Screen) | Wireframe „24 Über die Schrack Seconet AG“ |
| daten-und-fakten.html | Daten und Fakten | Bausteine aus dem Design-File | Wireframe „25 Daten und Fakten“ |
| ansprechpartner.html | Ansprechpartner und Standorte | Bausteine aus dem Design-File | Wireframe „26 Ansprechpartner und Standorte“ |
| messen.html | Messen & Veranstaltungen | Bausteine aus dem Design-File | Wireframe „27 Messen & Veranstaltungen“ |
| kundenmagazin.html | Fire & Care Kundenmagazin | Bausteine aus dem Design-File | Wireframe „28 Fire & Care“ |
| blog.html | Blog | Bausteine aus dem Design-File | Wireframe „29 Blog“ |
| referenzen.html | Referenzen | Bausteine aus dem Design-File | Wireframe „30 Referenzen“ |
| customer-stories.html | Customer Stories | Bausteine aus dem Design-File | Wireframe „31 Customer Stories“ |
| kundendienst-oesterreich.html | Kundendienst Österreich | Bausteine aus dem Design-File | Wireframe „33 Kundendienst Österreich“ |
| kundendienst-international.html | Kundendienst International | Bausteine aus dem Design-File | Wireframe „34 Kundendienst International“ |
| downloads.html | Downloads | Bausteine aus dem Design-File | Wireframe „35 Downloads“ |
| faq.html | FAQ | Bausteine aus dem Design-File | Wireframe „36 FAQ“ |
| herstellererklaerungen.html | Herstellererklärungen | Bausteine aus dem Design-File | Wireframe „37 Herstellererklärungen“ |
| serviceportal.html | Serviceportal | Bausteine aus dem Design-File | Wireframe „38 Serviceportal“ |
| kontakt.html | Kontakt | Bausteine aus dem Design-File | Wireframe „39 Kontakt“ |
| newsletter.html | Newsletter abonnieren | Bausteine aus dem Design-File | Wireframe „40 Newsletter Anmeldung“ |
| customer-story.html, referenz.html, blogbeitrag.html, messe.html, kundenmagazin-ausgabe.html | Detailseiten (je ein Beispiel) | Bausteine aus dem Design-File | Inhalte sinngemäß von schrack-seconet.com (Isala, ELLA, Modernisierung von Rufanlagen, Exposanità 2027, fire&care 01/2026) |
| Burger-Menü (alle Seiten) | Alle Seiten, die nicht über Bereiche, Anwendungen oder Life Cycle erreichbar sind; fährt unter dem Header heraus | Martins Frame „50 Burgermenu“ (WEcare-Teaser + Spalten) | Wireframe „Menü-Overlay (Burger)“, umgebaut am 26.11. |

- Verlinkt: Logo → Startseite, Bereichs-Kacheln → Bereichsseiten, „Anwendungen“ (Navigation, Footer, Buttons „Alle Anwendungen ansehen“) → anwendungen.html, „Bereiche“ (Navigation, Footer) → bereiche.html, „Life Cycle“ (Navigation, Footer, „Zum Life Cycle“) → lifecycle.html.
- Tab-Module der Bereichsseiten (Was uns auszeichnet / Anwendungen / Life Cycle) sind umschaltbar (js/main.js).
- Responsive: fließend unter 1600 px (clamp/vw), Umbrüche bei 1200 / 1024 / 768 / 480 px
- Struktur: css/style.css (Tokens oben, Unterseiten-Bausteine im Abschnitt „UNTERSEITEN – Bereich“), js/main.js, img/ (Bilder + icons/), fonts/
- Header und Footer sind auf allen Seiten identisch (aus index.html übernommen).
- Bereichs-Kacheln (Fire Safety, Health Care, Security): finale Bilder in img/tile-*.jpg
- Alle anderen Bilder & Videos: Platzhalter (Klasse .ph, grauer Hintergrund + Icon; .ph--video für Videos).
  Die Bild-Exporte aus Martins Design liegen zur späteren Verwendung in img/_design-exporte/


## Stand 26.11.2026 (Abend)
- Alle Seiten aus dem Wireframe-Prototyp sind gebaut und untereinander verlinkt (Hauptnavigation, Burger-Menü, Topbar, Footer, Teaser, Buttons).
- Noch ohne Ziel: Karriere-Links (Seiten gibt es im Wireframe nicht), WEcare-Teaser im Menü, Initiativbewerbung, Detailseiten einzelner Stories/Beiträge/Messen.
- Kontaktformular: Drei Felder in der linken Spalte haben im Wireframe keine Bezeichnung – im Klickdummy bewusst leer gelassen.

## Ergänzung 26.11.2026 (später Nachmittag)
- Detailseiten für Customer Story, Referenz, Blogbeitrag, Messe und Kundenmagazin-Ausgabe. Alle Karten der Übersichten verlinken darauf.
- Produkte/Systeme werden nur angeteasert (rote Karte „Mehr auf Solutions“) und verlinken extern auf solutions.schrack-seconet.com.
- Externe Links: Extern-Icon und neues Fenster (Login, Karriere, WESION, Solutions, Messe-Website, Magazin-PDFs).
- Favicon: img/favicon.svg (rotes S aus „SECONET“, ohne Hintergrund) plus favicon.ico und apple-touch-icon.png.
- Workshop-Themen und Konzept-Notizen: im Projekt unter „claude/konzept-notizen-workshop.md“.
