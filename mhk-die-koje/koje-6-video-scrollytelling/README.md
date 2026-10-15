# Die Koje · Version 1 – Scrollytelling mit Hintergrund-Videos (Klickdummy)

Einstiegsvariante (~5.000 €) der Landing Page „Die Koje“. Oben ein Hero mit Headline, danach führt die Seite Feature für Feature durch die Koje. Im Hintergrund läuft pro Feature ein kurzes Video-Snippet aus dem Werbespot, davor eine Karte mit Headline, Beschreibung und „Termin vereinbaren“. Kein 3D, keine Abhängigkeiten – reines HTML/CSS/JS.

## Aufbau

- `index.html` – Hero, neun Feature-Abschnitte, CTA. Jeder Abschnitt hat `data-scene`, passend zum `data-for` eines `<video>` in `.backdrop`.
- `js/main.js` – der Abschnitt in der Bildschirmmitte ist aktiv: sein Video wird eingeblendet und von vorn abgespielt, die anderen pausieren. Erzeugt außerdem die Punkte-Navigation rechts (Desktop) und den Fortschrittsbalken (Mobil).
- `assets/video/` – Snippets (H.264, ohne Ton, 640 px) plus Poster-JPG.

## Snippets

Geschnitten aus `../assets/MHK v2 (1).mp4`. Oben wurden 28 px beschnitten, um den eingebrannten Timecode zu entfernen.

| Datei | Feature | Quelle (s) |
|---|---|---|
| 00-hero | Bühne, Auftritt | 4,3–11,0 |
| 01-schubladen | Leise schließende Schubladen | 12,3–15,7 |
| 02-heisswasser | Heißes Wasser auf Knopfdruck | 17,1–21,55 |
| 03-ofen | Backofen / Pizza | 21,65–24,8 |
| 04-licht | Bunte Lichter | 26,55–30,6 |
| 05-futternapf | Futternapf im Sockel | 32,1–35,08 |
| 06-spielwand | Spielwand (0,6× verlangsamt) | 38,33–39,6 |
| 07-zapfhahn | Zapfhahn | 40,45–42,0 |
| 08-saugroboter | Saugroboter im Sockel | 43,65–48,15 |
| 09-couch | Ausfahrbare Couch | 52,4–58,08 |

Neu schneiden, z. B.:

```bash
ffmpeg -ss 12.3 -to 15.7 -i "../assets/MHK v2 (1).mp4" -an -vf "crop=iw:ih-28:0:28,fps=25" \
  -c:v libx264 -crf 22 -pix_fmt yuv420p -movflags +faststart assets/video/01-schubladen.mp4
```

Sobald der Spot ohne Timecode und in höherer Auflösung vorliegt, die Snippets mit denselben Zeiten (ohne `crop`) neu exportieren.

## Starten

Im Repo-Root `python3 -m http.server 8080`, dann `http://localhost:8080/mhk-die-koje/koje-6-video-scrollytelling/` öffnen.
