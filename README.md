# Animation Tryouts

Sammlung von Animations- und Website-Experimenten. Jeder Ordner im Repo-Root ist ein eigenständiges Projekt; die Startseite listet sie automatisch als Gallery.

## Neues Projekt hinzufügen

1. Neuen Ordner im Repo-Root anlegen, z. B. `mein-neues-projekt/`.
2. Darin eine `index.html` ablegen (plus CSS/JS/Assets nach Bedarf).
3. Optional eine `meta.json` im selben Ordner für schönere Karten:

   ```json
   {
     "title": "Mein neues Projekt",
     "description": "Kurze Beschreibung, ein bis zwei Sätze.",
     "tags": ["css", "scroll"],
     "date": "2026-08-13",
     "thumbnail": "screenshot.png"
   }
   ```

   Alle Felder sind optional. Ohne `meta.json` wird der Titel aus dem Ordnernamen abgeleitet und als Thumbnail automatisch das erste Bild im Ordner verwendet (alphabetisch).
4. Committen und auf `main` pushen — fertig. Der GitHub-Actions-Workflow generiert die Übersicht neu und deployt automatisch.

Ordner, die mit `.` oder `_` beginnen, sowie `assets/`, `scripts/`, `.github/` und `node_modules/` werden nie als Projekte gelistet.

## Wie es funktioniert

- `scripts/generate-manifest.mjs` scannt beim Deploy alle Top-Level-Ordner mit einer `index.html` und schreibt `projects.json`.
- `index.html` (Root) lädt `projects.json` per `fetch` und rendert die Karten (`assets/gallery.js`, `assets/style.css`).
- `.github/workflows/deploy.yml` läuft bei jedem Push auf `main`: generiert das Manifest neu und deployt über GitHub Pages (Deployment-Quelle "GitHub Actions").

`projects.json` wird nie committet — sie entsteht nur während des Builds und ist in `.gitignore` eingetragen.

## Einmaliges Setup (nur beim ersten Mal nötig)

1. Leeres Repo auf GitHub anlegen (kein README oder .gitignore mitanlegen — ist schon vorhanden).
2. Remote hinzufügen und pushen:

   ```bash
   git remote add origin <REPO-URL>
   git push -u origin main
   ```

3. In den Repo-Settings unter **Settings → Pages → Build and deployment → Source** auf **"GitHub Actions"** umstellen (einmalig, GitHub bietet das automatisch an, sobald ein Pages-Workflow im Repo erkannt wird).
4. Nach dem ersten erfolgreichen Workflow-Lauf ist die Seite unter `https://<user>.github.io/<repo>/` erreichbar.

Ab dann: einfach neue Ordner anlegen und pushen — die Gallery wächst automatisch mit.

## Lokal testen

`fetch()` funktioniert nicht über `file://`, daher einen kleinen lokalen Server starten:

```bash
node scripts/generate-manifest.mjs
python3 -m http.server 8080
# oder: npx serve
```

Dann `http://localhost:8080` öffnen.
