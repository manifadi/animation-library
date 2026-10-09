# Die Küche, die alles kann · Licht-an-Feature-Tour

Fünfte Konzeptvariante für „MHK: Die Koje“. Die Küche wird aus einem schwarzen Auftakt heraus beleuchtet; nach dem ersten Scrollen verschwinden Einstiegstext und CTA. Sieben Hotspots starten ruhige, räumliche Kamerafahrten aus derselben Ausgangsszene. Unter dem interaktiven Part ist das vorhandene Werbevideo als responsiver Player eingebunden.

## Bewegungsablauf

Die Kamera fährt in etwa drei Sekunden auf einem durchgehenden Bogen ins Detail und in 2,6 Sekunden zurück. `js/motion.js` berechnet Perspektive und Bildausschnitt; eine Smootherstep-Kurve beschleunigt und bremst mit Geschwindigkeit und Beschleunigung null an beiden Enden. Rückwand, Küchenzeile und Insel werden als separate SVG-Ebenen im CSS-3D-Raum aufgebaut. Die Feature-Grafik sitzt auf derselben Tiefenebene wie das zugehörige Möbel.

Ein gemeinsamer `requestAnimationFrame`-Fortschritt steuert Kamera, Tiefe, Beleuchtungsblende und Feature-Bewegung. Die Rückfahrt kehrt diese Bewegung um. Escape oder „Zur Übersicht“ funktionieren auch während der Hinfahrt; die Rückfahrt beginnt dann an der aktuellen Position. Mobile Ansichten nutzen kleinere Kamerawinkel und platzieren das Detail über der Infokarte. Reduzierte Bewegung wird berücksichtigt.

## Demo und technische Übergabe

Die frontale SVG-Küche wird aus Version 3 wiederverwendet. Kamerafahrten und Feature-Grafiken bleiben eine 2.5D-Konzept-Demo. Echte, synchronisierte Feature-Video-Snippets sind hier noch nicht eingebunden. Das vollständige Werbevideo ist separat im Player unter der Tour verfügbar.

Jeder Eintrag in `js/main.js` besitzt einen eigenen Fokuspunkt und Effekt. Für die spätere Umsetzung kann `openFeature` beim Öffnen eines Features einen Clip starten, der auf derselben Basisansicht beginnt. Beim Schließen wird der Clip zurückgespult oder ein Rückweg-Clip abgespielt; anschließend wird die Kamera auf die Übersicht zurückgesetzt.

## Starten

Im Repo-Root einen lokalen Server starten, zum Beispiel `python3 -m http.server 8080`, dann `http://localhost:8080/mhk-die-koje/koje-5-licht-an-feature-tour/` öffnen. Die Seite verwendet ein ES-Modul und benötigt daher einen lokalen Server.
