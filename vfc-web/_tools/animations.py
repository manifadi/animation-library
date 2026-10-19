"""Inhalte der Seite animationen.html: Beschreibung, Werte und KI-Prompt je Effekt.

Die Prompts sind so geschrieben, dass ein KI-Agent den Effekt ohne weiteren Kontext in einem
WordPress-Theme umsetzen kann. Werte = Stand der Prototyp-Seite (assets/main.js, assets/style.css).
"""

CONTEXT = (
    "Kontext: Du arbeitest an der WordPress-Website von vorauerfriends (vfc). Setze den folgenden Effekt im "
    "(Child-)Theme um – mit Vanilla JS und CSS, eingebunden über wp_enqueue_script (Strategie defer) und "
    "wp_enqueue_style. Keine zusätzlichen Libraries, außer sie werden unten ausdrücklich genannt. Übernimm alle "
    "Werte exakt. Bewege nur transform und opacity, wo nichts anderes steht. Bei prefers-reduced-motion: reduce "
    "erscheint alles sofort im Endzustand, ohne Bewegung. Fokus per Tastatur zeigt denselben Zustand wie Hover."
)

GUIDELINES = {
    "id": "guidelines",
    "title": "Grundregeln",
    "meta": "Für alle Effekte",
    "desc": "Bevor einzelne Effekte gebaut werden: so bewegt sich die vfc-Website. Masken statt Fades, Scroll "
            "erzählt und Hover antwortet, ein Bewegungs-Fokus pro Bildschirm, kein Bounce. Dieser Prompt gehört "
            "an den Anfang jeder Session mit dem KI-Agenten.",
    "specs": [
        ("Ankommen", "cubic-bezier(0.16, 1, 0.3, 1) – Expo-Out"),
        ("Abgang", "cubic-bezier(0.7, 0, 0.84, 0) – gespiegelt"),
        ("Durchfahrt", "cubic-bezier(0.76, 0, 0.24, 1) – Vorhang"),
        ("Hover", "0,35–0,6 s · Reveal 1,1 s · Seite 650 ms"),
    ],
    "prompt": """Motion-Grundregeln für die vfc-Website (gelten für alle Effekte, die ich dir gebe):

1. Masken statt Fades: Inhalte erscheinen, indem sie aus einer Kante gleiten (Wörter aus ihrer Zeile, Bilder hinter einem Vorhang, Balken über die Seite). Opacity nur unterstützend. Kein Blur, kein Aufzoomen, kein Wackeln.
2. Scroll erzählt, Hover antwortet: Alles, was eine Szene verändert (Reveals, Fächer, Füllungen, Bilder, Footer), hängt am Scroll und läuft beim Zurückscrollen rückwärts. Hover nur für Text, Buttons, Links und den Cursor – nie für ganze Sections.
3. Ein Fokus pro Bildschirm: pro Viewport bewegt sich eine Sache deutlich; es läuft nie mehr als ein Video gleichzeitig.
4. Kein Bounce, kein Spring, kein Elastic. Bewegungen laufen weich aus und stehen.
5. Easing-Tokens (als CSS-Variablen anlegen):
   --ease-out: cubic-bezier(0.16, 1, 0.3, 1)   → alles, was ankommt (Reveals, Roll, Wave, Pixel)
   --ease-in: cubic-bezier(0.7, 0, 0.84, 0)    → Abgänge; exakt gespiegelte Version von --ease-out
   --ease-curtain: cubic-bezier(0.76, 0, 0.24, 1) → alles, was durchfährt (Vorhang-Balken, Logo schließen)
   --ease: cubic-bezier(0.65, 0, 0.35, 1)      → Farbwechsel, physisches Rollen
6. Dauern: Hover 0,35–0,6 s (Versatz 16 ms pro Buchstabe) · Text-Reveal 1,1 s rein und 1,1 s raus (Versatz 35 ms pro Wort, max. 0,6 s) · Seitenebene 650 ms pro Balken, 90 ms Versatz · Intro ≤ 1,8 s bis die Seite aufgeht.
7. Reihenfolge immer in Leserichtung: oben vor unten, links vor rechts. Rein von unten.
8. Farbe: Hover invertiert Schwarz (#12121a) ↔ Weiß. Rot (#ff002e) ist Akzent (Cursor, Smiley, Fokus), keine Fläche.
9. Performance: nur transform und opacity animieren; Scroll-Effekte erst messen, dann schreiben (ein Layout pro Frame); Layout-Änderungen nur, wo ausdrücklich gewollt; Ziel 60 fps auf der ganzen Seite.
10. Barrierefreiheit: prefers-reduced-motion: reduce → kein Intro, kein Softscroll, keine Reveals, Endzustände sofort. Zerlegter Text bleibt für Screenreader lesbar (sr-only-Text, aria-hidden auf visuellen Kopien). :focus-visible zeigt den Hover-Zustand.""",
}

ANIMATIONS = [
    {
        "id": "intro", "title": "Ladeanimation", "meta": "Laden · Seite", "demo": "intro",
        "desc": "Beim ersten Laden gleitet das vorauerfriends-Logo aus einer Maske hoch, steht kurz und schließt sich "
                "von beiden Seiten zur Mitte. Daraus ploppt der Pixel-Smiley auf und zwinkert – dann ziehen drei weiße "
                "Balken nach rechts ab und die Seite ist da.",
        "specs": [("Auslöser", "Seitenaufruf (nicht nach Seitenwechsel)"), ("Dauer", "≈ 1,8 s bis zum Aufdecken"),
                  ("Kurven", "Expo-Out · Vorhang-Kurve · ease-in-out"), ("Wo", "jede Seite, erster Aufruf")],
        "prompt": """Effekt: Ladeanimation (Intro) für die vfc-Website.

Markup (direkt nach <body>):
- .pt: Vorhang mit drei weißen Balken (siehe Effekt „Seitenwechsel-Vorhang“), position fixed, inset 0, z-index unter Header/Seitenleiste.
- .intro: position fixed, inset 0 (rechts bis zur Seitenleiste), z-index direkt über .pt, display grid, place-items center, pointer-events none; Kinder liegen in derselben Grid-Zelle (grid-area 1 / 1).
  - .intro__mark (overflow hidden) > .intro__logo: das vorauerfriends-Logo als SVG-Maske (background currentColor, mask url(logo.svg) 100% 100%), Farbe #12121a, Breite clamp(200px, 30vw, 440px), Seitenverhältnis 155.179 / 12.3154. Wichtig: SVG verwenden, kein PNG.
  - .intro__smiley: <svg viewBox="0 0 5 4"> mit fünf <rect>: Mund x1 y3 w3 h1, Mundwinkel x0 y2 und x4 y2 (je 1×1), Augen x1 y0 und x3 y0 (je 1×1; rechtes Auge bekommt Klasse --wink). Farbe #ff002e, shape-rendering crispEdges, Breite clamp(56px, 5.5vw, 84px). Jedes rect: transform-box fill-box, transform-origin center, Startzustand scale(0).

Auslöser:
- Inline-Script ganz oben im <head> (wp_head, Priorität 1): setzt <html class="is-intro">, außer die Seite wurde über den Seitenwechsel-Vorhang betreten (sessionStorage-Flag) oder prefers-reduced-motion ist aktiv. Zusätzlich Sicherheitsnetz: nach 6 s is-intro immer entfernen.
- CSS: html.is-intro .intro { display: grid } und html.is-intro .pt span { transform: none } (Balken decken ab dem ersten Paint).
- Achtung: Die Zustandsklasse darf nicht genauso heißen wie das Element (.intro), sonst wird <html> selbst ausgeblendet.

Zeitachse (Web Animations API, fill forwards):
1. 0–420 ms: Logo translateY(105%) → 0, Expo-Out cubic-bezier(0.16, 1, 0.3, 1).
2. bis 650 ms stehen lassen.
3. 650–1050 ms: Logo clip-path inset(0 0% 0 0%) → inset(0 50% 0 50%), Kurve cubic-bezier(0.76, 0, 0.24, 1) – es schließt sich von beiden Seiten zur Mitte, ohne zu stauchen.
4. ab 850 ms: Smiley-Pixel scale(0) → scale(1), je 360 ms Expo-Out, Versatz 35 ms in der Reihenfolge Mund, Mundwinkel links, rechts, Auge links, rechts.
5. 1450–1710 ms: rechtes Auge zwinkert: scaleY 1 → 0.15 (bei 40 %) → 1, ease-in-out.
6. 120 ms Pause, dann gleichzeitig: Smiley opacity 1 → 0 und scale 1 → 0.85 (220 ms, cubic-bezier(0.7, 0, 0.84, 0)) und die Vorhang-Balken fahren nach rechts raus (0 → translateX(101%), 650 ms, 90 ms Versatz, oben zuerst).
7. Danach is-intro entfernen, Animationen der Balken aufräumen.

Weiteres:
- Während des Intros nicht scrollbar (Softscroll stoppen) und Klicks über .pt blockieren (pointer-events auto).
- Text-Reveals der Seite erst starten, wenn die Balken abziehen – sonst laufen sie unsichtbar ab.
- Akzeptanz: kein Aufblitzen der Seite vor dem Intro, Logo scharf in jeder Größe, gesamte Wartezeit bis zur Seite ≈ 1,8 s.""",
    },
    {
        "id": "vorhang", "title": "Seitenwechsel-Vorhang", "meta": "Klick · Seite", "demo": "curtain",
        "desc": "Klick auf einen internen Link: drei weiße Balken fahren von links herein – oben zuerst, dann Mitte, "
                "dann unten – und decken alles außer der Seitenleiste ab. Ist die neue Seite geladen, ziehen sie im "
                "selben Takt nach rechts wieder ab.",
        "specs": [("Auslöser", "Klick auf internen Link"), ("Dauer", "650 ms je Balken, 90 ms Versatz"),
                  ("Kurve", "cubic-bezier(0.76, 0, 0.24, 1)"), ("Wo", "alle Seiten")],
        "prompt": """Effekt: Seitenwechsel-Vorhang aus drei Balken.

Markup (direkt nach <body>): <div class="pt" aria-hidden="true"><span></span><span></span><span></span></div>
CSS:
- .pt { position: fixed; inset: 0; z-index: 45 (unter Header/Seitenleiste, über dem Menü-Overlay); display: grid; grid-template-rows: repeat(3, 1fr); pointer-events: none }
- .pt.is-active { pointer-events: auto } (blockt Klicks, solange der Vorhang läuft)
- .pt span { background: #fff; box-shadow: 0 1px 0 #fff (keine Haarlinien); transform: translateX(-101%) }
- html.pt-cover .pt span { transform: none } (Seite startet verdeckt)

Bewegung (Web Animations API, fill forwards), Balken i = 0, 1, 2 (oben zuerst):
- Zudecken: translateX(-101%) → translateX(0), 650 ms, Delay i × 90 ms, cubic-bezier(0.76, 0, 0.24, 1).
- Aufdecken: translateX(0) → translateX(101%), gleiche Werte. Danach Animationen canceln (CSS-Ruhezustand -101%) und pt-cover entfernen.

Klick-Logik (ein click-Listener auf document):
- Nur interne Links: gleiche Origin, kein target=_blank, kein download, keine Modifier-Taste (Cmd/Ctrl/Shift/Alt), kein mailto:/tel:, nicht der Skip-Link.
- Anderer Pfad: preventDefault → zudecken → sessionStorage.setItem('vfc-pt', '1') → location.href = Ziel.
- Neue Seite: Inline-Script im <head> sieht das Flag und setzt html.pt-cover; nach window.load + 150 ms aufdecken, Flag löschen.
- Anker auf derselben Seite (#…): zudecken → offenes Menü ohne Animation schließen → sofort zum Ziel springen (beim Softscroll immediate) → 120 ms warten → aufdecken.
- Läuft der Vorhang schon, weitere Klicks verwerfen.
- Zurück-Button (bfcache): bei pageshow mit persisted die Balken aufdecken.
- Reduced Motion: kein Vorhang, normale Navigation.""",
    },
    {
        "id": "softscroll", "title": "Softscroll", "meta": "Scroll · Seite", "demo": None,
        "desc": "Die ganze Seite scrollt weich nachgezogen. Alle scroll-gekoppelten Effekte laufen im selben Frame "
                "wie der Scroll, bei offenem Menü steht die Seite still.",
        "specs": [("Bibliothek", "Lenis 1.3.x (MIT), lokal eingebunden"), ("Lerp", "0.085"),
                  ("Besonderes", "Menü stoppt Scroll, eigener Anker-Handler"), ("Wo", "alle Seiten")],
        "prompt": """Effekt: Softscroll mit Lenis (einzige erlaubte Zusatz-Library, Version 1.3.x, MIT-Lizenz – Datei lokal im Theme ablegen, nicht von einem CDN).

Setup:
- new Lenis({ lerp: 0.085, autoRaf: true, stopInertiaOnNavigate: true }) – nicht starten bei prefers-reduced-motion: reduce.
- CSS aus lenis.css übernehmen, plus: html.lenis { scroll-behavior: auto; overflow-anchor: none }. Ein bestehendes html { scroll-behavior: smooth } darf nicht mit Lenis kollidieren.
- Menü-Overlay bekommt data-lenis-prevent (scrollt nativ). Menü öffnen → lenis.stop(); schließen → lenis.start().
- Anker-Links nicht über Lenis' anchors-Option, sondern über den Seitenwechsel-Vorhang bzw. lenis.scrollTo(ziel, { offset: −Höhe der Mobile-Topbar, immediate: true, force: true }).

Scroll-gekoppelte Effekte:
- Ein gemeinsamer Takt: lenis.on('scroll', runJobs). Jeder Job misst zuerst (getBoundingClientRect) und gibt eine Schreib-Funktion zurück; erst nach allen Messungen werden alle Schreib-Funktionen ausgeführt (genau ein Layout pro Frame).
- Ohne Lenis (Reduced Motion): window 'scroll' (passive) + requestAnimationFrame.
- Akzeptanz: 60 fps beim Scrollen (Frame-Abstand per Skript messen), keine Ruckler an Sticky-Elementen.""",
    },
    {
        "id": "menue", "title": "Menü öffnen", "meta": "Klick · Navigation", "demo": "menu",
        "desc": "Das schwarze Mega-Menü wischt von rechts herein, die Inhalte kommen gestaffelt von unten. Der Burger "
                "wird zum X und die Seitenleiste rot. Auf dem Handy kommt das Menü von oben.",
        "specs": [("Auslöser", "Klick auf Burger"), ("Dauer", "Wisch 0,6 s · Inhalte 0,5–0,6 s"),
                  ("Versatz", "0,12 / 0,17 / 0,22 / 0,27 / 0,32 / 0,37 s"), ("Wo", "Navigation")],
        "prompt": """Effekt: Mega-Menü öffnen/schließen.

Aufbau: <nav class="nav" hidden> als position fixed über die Seite (Desktop: links bis zur 80 px breiten Seitenleiste rechts; Mobil: unter der 60 px Topbar), Hintergrund #000, Text weiß, overflow-y auto, overscroll-behavior contain, data-lenis-prevent.

Zustände:
- zu: opacity 0; clip-path: inset(0 0 0 100%) (Desktop: wischt von rechts) bzw. inset(0 0 100% 0) (Mobil: von oben).
- offen (.is-open): opacity 1; clip-path: inset(0 0 0 0).
- Transition: opacity 0.35s, clip-path 0.6s, Kurve cubic-bezier(0.65, 0, 0.35, 1).
- Inhalte (Linkgruppen, mittlere Leiste, Fußbereich): opacity 0 + translateY(24px) → sichtbar; opacity 0.5s, transform 0.6s, gleiche Kurve; Delays beim Öffnen 0.12 s, 0.17 s, 0.22 s, 0.27 s (Gruppen), 0.32 s (Mitte), 0.37 s (Fuß).
- Burger (3 Striche à 1.5 px, Abstand 7.25 px, Breite 35 px): oberer und unterer → top 7.25px und rotate(±45deg) scaleX(1.06), mittlerer → scaleX(0) + opacity 0; transform/top 0.45s, opacity 0.25s.
- Seitenleiste bei offenem Menü: Hintergrund #ff002e, Inhalt weiß (0.4s).

Logik:
- Öffnen: hidden entfernen, Reflow erzwingen, .is-open setzen, body.nav-open (overflow hidden), Softscroll stoppen, aria-expanded true, Fokus auf den ersten Link.
- Schließen: .is-open entfernen, aria-expanded false, Fokus zurück auf den Burger, hidden erst nach 600 ms setzen.
- Escape schließt; Tab bleibt im Menü (Fokusfalle Burger ↔ Menü-Links).
- Klick auf Anker im Menü: Menü hinter dem Seitenwechsel-Vorhang ohne Animation schließen.""",
    },
    {
        "id": "roll", "title": "Buchstaben-Roll", "meta": "Hover · Text", "demo": "roll",
        "desc": "Jeder Buchstabe rollt einzeln nach oben weg, eine Kopie kommt von unten nach. Beim Verlassen rollt "
                "alles zurück nach unten – von links nach rechts versetzt. Im Menü, bei Telefon, E-Mail und Social "
                "sowie bei den Filter-Pills.",
        "specs": [("Auslöser", "Hover / Tastatur-Fokus"), ("Dauer", "0,6 s + 16 ms pro Buchstabe"),
                  ("Kurve", "Expo-Out"), ("Wo", "Menü, Footer-Links, Filter")],
        "prompt": """Effekt: Buchstaben-Roll beim Hover (Text rollt nach oben weg, Kopie kommt von unten).

Umsetzung per JS beim Laden (nur ohne Reduced Motion), für: Hauptlinks und Pills im Menü, Telefon/E-Mail/Social in Menü und Footer, Beschriftungen der Projekt-Filter.
1. Text des Links lesen. Inhalt ersetzen durch:
   <span class="sr-only">Originaltext</span><span class="roll" aria-hidden="true"> … </span>
2. Für jeden Buchstaben i: <span class="roll__c" style="--i: i"><span class="roll__in" data-c="X">X</span></span>; Leerzeichen als \\u00a0.

CSS:
- .roll { display: inline-block; white-space: nowrap }
- .roll__c { display: inline-block; vertical-align: top; overflow: hidden; padding: 0.14em 0.06em; margin: -0.14em -0.06em } (Maske etwas größer, damit Umlaute, Unterlängen und Überhänge nicht abgeschnitten werden – ohne das Layout zu verschieben)
- .roll__in { display: block; position: relative; transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) calc(var(--i) * 16ms) }
- .roll__in::after { content: attr(data-c); position: absolute; left: 0; top: 125% }
- @media (hover: hover) { a:hover .roll__in, button:hover .roll__in { transform: translateY(-125%) } }
- a:focus-visible .roll__in, button:focus-visible .roll__in { transform: translateY(-125%) }

Ergebnis: Hover rollt nach oben (Kopie kommt von unten), Verlassen rollt nach unten zurück; beides von links nach rechts versetzt. Wird der Link außerdem per Text-Reveal eingeblendet, den ganzen .roll als ein „Wort“ behandeln.""",
    },
    {
        "id": "text-reveal", "title": "Text-Reveal & Unreveal", "meta": "Scroll · Text", "demo": "reveal",
        "desc": "Wörter gleiten Zeile für Zeile aus einer unsichtbaren Maske nach oben, sobald sie ins Bild kommen. "
                "Verlassen sie das Bild, läuft exakt dieselbe Bewegung rückwärts: zurück nach unten in die Maske, "
                "vom letzten Wort zum ersten.",
        "specs": [("Auslöser", "Scroll (Band 6 % oben / 8 % unten)"), ("Dauer", "1,1 s rein · 1,1 s raus"),
                  ("Kurve", "Expo-Out rein · gespiegelt raus"), ("Versatz", "35 ms pro Wort, max. 0,6 s")],
        "prompt": """Effekt: Text-Reveal und Unreveal beim Scrollen. Die Unreveal-Bewegung ist exakt die Reveal-Bewegung rückwärts.

Zerlegen (JS, nur ohne Reduced Motion) – für Headlines, Eyebrows, Fließtexte der Kacheln und Projektseiten, Footer-Adressen (nicht für Buttons):
- Nur Textknoten ersetzen; <br>, <svg>, Links und andere Elemente bleiben erhalten (in Links weiter zerlegen). An normalen Leerzeichen trennen, &nbsp; nicht (hält Wörter zusammen).
- Jedes Wort: <span class="w"><span class="w__i">Wort</span></span>, Leerzeichen dazwischen als Textknoten.
- Erst danach body.has-reveal setzen (ohne JS bleibt Text sichtbar).

CSS:
- .w { display: inline-block; vertical-align: top; overflow: hidden; padding: 0.14em 0.06em 0.2em; margin: -0.14em -0.06em -0.2em; text-indent: 0 } (Maske größer als die Zeile, Layout bleibt gleich; text-indent: 0 verhindert eingerückte Wörter in eingerückten Absätzen)
- .w__i { display: inline-block }
- .has-reveal .w__i { transform: translateY(125%); transition: transform 1.1s cubic-bezier(0.7, 0, 0.84, 0) var(--d, 0s) }  ← Raus: gespiegelte Kurve
- .has-reveal .w.is-in .w__i { transform: none; transition: transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) var(--d, 0s) }  ← Rein

Steuerung (ein IntersectionObserver für alle .w, rootMargin "-6% 0px -8% 0px", threshold 0):
- Pro Callback nur Wörter nehmen, deren Zustand sich ändert; nach Leserichtung sortieren (boundingClientRect.top, dann left).
- Rein-Gruppe: Wort n bekommt --d = min(n × 0.035, 0.6) s und .is-in.
- Raus-Gruppe: dieselbe Rechnung, aber in umgekehrter Reihenfolge (letztes Wort zuerst), .is-in entfernen.
- So ist das Verlassen des Bildes oben wie unten exakt die rückwärts abgespielte Rein-Animation.
- Beobachtung erst starten, wenn Intro bzw. Seitenwechsel-Vorhang aufdecken.""",
    },
    {
        "id": "text-fill", "title": "Zeichen-Füllung", "meta": "Scroll · Text", "demo": "fill",
        "desc": "Große Absätze füllen sich beim Scrollen Zeichen für Zeichen von hellgrau zu schwarz, mit einer "
                "weichen Kante über etwa 14 Zeichen. Beim Hochscrollen läuft die Füllung zurück.",
        "specs": [("Auslöser", "Scroll, direkt gekoppelt"), ("Start / Ende", "Oberkante 90 % · Unterkante 55 %"),
                  ("Deckkraft", "0,22 → 1"), ("Wo", "Projects-Intro, Challenge")],
        "prompt": """Effekt: Zeichen-Füllung großer Absätze (grau → schwarz, an den Scroll gekoppelt).

- Absätze mit data-fill werden zusätzlich zum Wort-Reveal in Zeichen zerlegt: innerhalb von .w__i jedes Zeichen als <span class="c">.
- Pro Scroll-Frame (gemeinsamer Takt, erst messen, dann schreiben):
  r = Absatz.getBoundingClientRect(); vh = innerHeight
  start = 0.9 × vh (Oberkante bei 90 % Höhe), end = 0.55 × vh − r.height (Unterkante bei 55 % Höhe)
  p = clamp((start − r.top) / (start − end), 0, 1)
  head = p × (Anzahl Zeichen + 14)
  Zeichen i: f = clamp((head − i) / 14, 0, 1); opacity = 0.22 + 0.78 × f
- f auf 0.01 runden und nur geänderte Werte schreiben (Performance).
- Keine Transition – die Bewegung kommt direkt vom Scroll (auch rückwärts).""",
    },
    {
        "id": "zahlen", "title": "Kennzahlen & Linien", "meta": "Scroll · Projektseiten", "demo": "counter",
        "desc": "Die Zahlen im Outcome zählen beim Reinscrollen hoch und bremsen weich ab. Die Trennlinien der "
                "Abschnitte zeichnen sich von links ein.",
        "specs": [("Auslöser", "60 % sichtbar (Zahlen) · 20 % (Linien)"), ("Dauer", "1,6 s · Linien 1,4 s"),
                  ("Kurve", "Expo-Out"), ("Format", "de-DE: 1.404 · 2,4")],
        "prompt": """Effekt: Kennzahlen zählen hoch + Abschnittslinien zeichnen sich.

Kennzahlen:
- Markup: <span class="kpi__num"><span data-count="1404" data-decimals="0" data-prefix="" data-suffix="+">1.404+</span><span class="kpi__unit">Mio.</span></span> – Wort-Einheiten („Mio.“) als kleines Span (font-size 0.32em), Zeichen wie „+“, „×“, „%“ bleiben in der Zahl.
- Ohne JS steht der Endwert im HTML. Mit JS: Text auf 0 setzen, IntersectionObserver threshold 0.6, einmalig.
- Animation 1600 ms: Wert = Ziel × (1 − 2^(−10 × p)), p = vergangene Zeit / 1600; am Ende exakt der Zielwert.
- Format: toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d }) + Präfix/Suffix.
- CSS: font-variant-numeric: tabular-nums (Breite springt nicht beim Zählen).

Linien der Abschnittszeilen (z. B. „Challenge … / Kürzel“):
- Ohne JS normale border-top/-bottom. Mit JS: Rahmen transparent, stattdessen ::before (oben, top -1px) und ::after (unten, bottom -1px), je 1 px in #8a8a8f, transform scaleX(0), transform-origin left.
- Bei 20 % Sichtbarkeit (einmalig) .is-in: scaleX(1), 1.4s cubic-bezier(0.16, 1, 0.3, 1); untere Linie 0.15 s später.""",
    },
    {
        "id": "curtain", "title": "Bild-Reveal (Curtain)", "meta": "Scroll · Bild", "demo": "image",
        "desc": "Eine schwarze Fläche wischt von oben über das Bild und gibt es nach unten frei. Dabei gleitet das "
                "Bild aus leichtem Zoom in Position. Läuft einmal, sobald das Bild zu 35 % sichtbar ist.",
        "specs": [("Auslöser", "35 % sichtbar, einmalig"), ("Dauer", "1,6 s Fläche · 1,8 s Bild"),
                  ("Kurve", "cubic-bezier(.77, 0, .18, 1)"), ("Wo", "Projektbilder, Projektseiten")],
        "prompt": """Effekt: Bild-Reveal „Curtain“ (vf-motion-Bibliothek – falls vorhanden, die Dateien vf-motion.css/.js verwenden und nur data-motion="curtain" setzen; sonst so nachbauen).

- Container mit data-motion="curtain"; Bild/Video ist DIREKTES Kind. Container: position relative, overflow hidden, isolation isolate.
- Inline-Script früh im <head>: document.documentElement.classList.add('vfm-js') (verhindert Aufblitzen).
- ::after des Containers: inset 0, background #000, z-index 5, Ruhe transform scaleY(0) origin top.
- Medium vor dem Reveal: opacity 0; transform: scale(1.08) translateY(-3%).
- IntersectionObserver (thresholds 0, .1, .2, .35, .5): ab intersectionRatio ≥ 0.35 Klasse .vfm-in, einmalig.
- .vfm-in::after: Keyframe-Animation 1.6s cubic-bezier(.77, 0, .18, 1) both:
  0 %: scaleY(0), origin center top · 45 %: scaleY(1), origin top · 55 %: scaleY(1), origin bottom · 100 %: scaleY(0), origin bottom
- .vfm-in > Medium: opacity 1 (ohne Transition, verzögert um 45 % der Dauer = 0.72 s) und transform none über 1.8s cubic-bezier(.16, 1, .3, 1), ebenfalls 0.72 s verzögert.
- Zusätzliche Elemente im Container (z. B. eine Video-Vorschau) nicht als direktes Kind einsetzen, sonst greifen die Regeln auch dort.
- Reduced Motion: ::after aus, Medium sofort sichtbar.""",
    },
    {
        "id": "liste-rein", "title": "Projektliste reinscrollen", "meta": "Scroll · Liste", "demo": None,
        "live": "index.html#projekte",
        "desc": "Jede Projektzeile kommt beim Scrollen ins Bild: Die Trennlinie zeichnet sich von links ein, das Bild "
                "kommt per Curtain, der Text per Wort-Reveal und die farbigen Tags gestaffelt von unten.",
        "specs": [("Auslöser", "20 % sichtbar, einmalig"), ("Linie", "1,4 s Expo-Out, +0,1 s"),
                  ("Tags", "ab 0,5 s, 70 ms Versatz"), ("Wo", "Projektliste, Related Projects")],
        "prompt": """Effekt: Projektliste fährt beim Scrollen rein.

Pro Zeile <li class="project"> (Bild links per Curtain-Effekt, Text per Wort-Reveal – siehe dort), zusätzlich:
- IntersectionObserver threshold 0.2, einmalig → .is-in (Beobachtung erst nach Intro/Vorhang starten).
- Linie: .project hat border-bottom 1px #8a8a8f; mit JS wird sie transparent und stattdessen gezeichnet: ::after { position absolute; left 0; right 0; bottom -1px; height 1px; background #8a8a8f; transform scaleX(0); transform-origin left; transition transform 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s } → .is-in: transform none.
- Tags (Pills) in der Zeile: Index i als --ci setzen. Ruhe: opacity 0, translateY(14px), transition opacity 0.6s cubic-bezier(0.65, 0, 0.35, 1) und transform 0.9s cubic-bezier(0.16, 1, 0.3, 1). .is-in: opacity 1, transform none, transition-delay calc(0.5s + var(--ci) × 70ms).
- Gefilterte (hidden) Zeilen werden erst beim Einblenden animiert.""",
    },
    {
        "id": "liste-hover", "title": "Projektliste Hover", "meta": "Hover · Liste", "demo": "row",
        "desc": "Eine dunkle Fläche fährt von der Kante herein, über die die Maus kommt, und verlässt die Zeile in "
                "Richtung der Maus. Im Bild startet eine Video-Vorschau des Projekts, der Pixel-Pfeil kommt rein und "
                "der Cursor wird zur Pill „View Project“.",
        "specs": [("Auslöser", "Maus über Zeile (nur Desktop)"), ("Dauer", "0,7 s Fläche · 0,45 s Vorschau"),
                  ("Kurve", "Expo-Out"), ("Wo", "Projektliste, Related Projects")],
        "prompt": """Effekt: Richtungsabhängiger Hover der Projektzeilen mit Video-Vorschau.

Fläche:
- Link der Zeile: position relative; isolation isolate; overflow hidden; color transition 0.3s cubic-bezier(0.65, 0, 0.35, 1) 0.08s.
- ::before { content ""; position absolute; inset 0; z-index -1; background #12121a; transform translateY(var(--from, -101%)); transition transform var(--wipe-t, 0.7s) cubic-bezier(0.16, 1, 0.3, 1) }
- .is-hover / :focus-visible: ::before transform none, Text weiß, Pixel-Pfeil rechts: opacity 0 → 1 und translate(-30%, -50%) → translate(0, -50%).
- JS (nur Maus: pointerType 'mouse' und (hover: hover) and (pointer: fine)):
  pointerenter: Kante = clientY < Zeilenmitte ? '-101%' (oben) : '101%' (unten). --wipe-t auf 0s setzen, --from = Kante, Reflow (offsetWidth), --wipe-t entfernen, .is-hover setzen → Fläche fährt von dieser Kante herein.
  pointerleave: --from = Austrittskante (gleiche Rechnung), .is-hover entfernen → Fläche fährt in Mausrichtung hinaus.
Video-Vorschau:
- Im Bild-Container ein <span class="project__preview" aria-hidden="true"><video muted loop playsinline preload="none" src="…hero.mp4"></video></span> – absolut über dem Bild, opacity 0 (transition 0.45s). NICHT als direktes Kind (sonst greift der Curtain-Effekt).
- pointerenter: video.play(); erst wenn play() erfüllt ist, .is-preview → opacity 1. pointerleave: pause(), ausblenden.
- Solange die Vorschau läuft, alle anderen Hintergrundvideos pausieren (nie zwei Videos gleichzeitig).
Cursor: data-cursor-label="View Project" data-cursor-pill (siehe Cursor-Follower).""",
    },
    {
        "id": "faecher", "title": "Fächer „View All Projects“", "meta": "Scroll · Typo", "demo": "fan",
        "desc": "Sechs Ebenen desselben Schriftzugs stehen als Fächer übereinander. Beim Scrollen wandert jede Ebene "
                "nach oben und wird schmaler, unten rückt eine neue nach. Kommt die nächste Section ins Bild, "
                "verschmelzen alle zu einem statischen Schriftzug und die Box gibt Höhe ab – rückwärts beim Hochscrollen.",
        "specs": [("Auslöser", "Scroll, direkt gekoppelt (kein Hover)"), ("Tempo", "70 px Scroll pro Ebene"),
                  ("Verschmelzen", "nächste Section 100 % → 55 % Höhe"), ("Wo", "Projekte, Related Projects")],
        "prompt": """Effekt: Fächer „View All Projects“ als Endlos-Band mit Verschmelzen. Nur Scroll, kein Hover-Effekt (beim Hover zeigt nur der Cursor die Pill „View All Projects“, der Text bleibt schwarz).

Einheiten: alles in „Einheiten“ einer 1436er-Breite; 1 Einheit = 100cqw / 1436 (Link .echo hat container-type: inline-size).
Markup: <a class="echo" href="…" aria-label="View All Projects"><span class="echo__stack" aria-hidden="true"> 8 × <span class="echo__slice" style="--i: 0…7"><span class="echo__in"><span>View All Projects</span></span></span> </span></a>
CSS:
- .echo__stack { position relative; height calc(100cqw × var(--stack-h, 509) / 1436); overflow hidden }
- .echo__slice { position absolute; left 0; right 0; top 0; height = 202 Einheiten; overflow hidden; z-index var(--i); transform translateY((--y + --h − 202) Einheiten); will-change transform }
- .echo__in { position absolute; inset 0; background #fff; transform translateY((202 − --h) Einheiten); will-change transform }  → Maske nur über transform: sichtbar ist der Bereich [y, y + h], kein clip-path pro Frame.
- Text: position absolute; left 22 Einheiten; top (23 − 44) Einheiten; font-size 188 Einheiten; font-weight 400; line-height 1.2; letter-spacing -0.005em; white-space nowrap.

Geometrie je Position (Index = Position + 1):
TOP = [499, 307, 201, 124, 66, 22, −12, −38, −58]
HEIGHT = [202, 202, 116, 87, 68, 54, 44, 36, 30]
(Index 0 wartet unterhalb, 1 = voller Schriftzug unten, 2–6 darüber, 7–8 schon oben raus; es gilt TOP[k] = TOP[k+1] + HEIGHT[k+1] − 10.)

Pro Scroll-Frame:
- r = echo.getBoundingClientRect(); offset = (innerHeight − r.top) / 70; frac = offset − floor(offset)
- Ebene d (0 = oberste im DOM): x = 7 − d + frac; y = lineare Interpolation TOP bei x, h = HEIGHT bei x.
- Verschmelzen: nextTop = r.top + 509 × (r.width / 1436) + margin-bottom der .echo; merge = clamp((innerHeight − nextTop) / (0.45 × innerHeight), 0, 1); m = merge² × (3 − 2 × merge)
- y = y + (307 − y) × m − 260 × m; h = h + (202 − h) × m; --stack-h = 509 − 260 × m (nur setzen, wenn sich der Wert ändert – verschiebt alles darunter).
- --y / --h auf jede Ebene schreiben (erst messen, dann schreiben).
- html { overflow-anchor: none }, damit der Browser beim Schrumpfen nicht gegensteuert.
- Reduced Motion: statisch (frac = 0, merge = 0).""",
    },
    {
        "id": "smiley-button", "title": "Start-a-project-Button", "meta": "Hover · Button", "demo": "cta",
        "desc": "Beim Hover rollt der Smiley mit einer vollen Umdrehung nach rechts, die Pill invertiert und das "
                "Label taucht links hinter dem rollenden Smiley auf. Beim Verlassen rollt alles zurück.",
        "specs": [("Auslöser", "Hover / Fokus"), ("Dauer", "0,6 s Rollen · 0,35 s Farbe"),
                  ("Kurve", "cubic-bezier(0.65, 0, 0.35, 1)"), ("Wo", "Footer, Menü")],
        "prompt": """Effekt: Pill-Button mit rollendem Smiley.

Markup: <a class="cta" href="…"><span class="cta__face" aria-hidden="true"><svg>Pixel-Smiley</svg></span><span class="cta__label">Start a project</span><span class="cta__label cta__label--alt" aria-hidden="true">Start a project</span></a>
CSS (auf dunklem Grund):
- .cta { --roll: 0.6s cubic-bezier(0.65, 0, 0.35, 1); position relative; display inline-flex; width 322px; height 92px; padding 0; border-radius 999px; box-shadow inset 0 0 0 1px currentColor; color #fff; font-size 29px; letter-spacing -0.02em; white-space nowrap; container-type inline-size (100cqw = Breite der Pill); transition background-color 0.35s, color 0.35s }
- .cta__face { position absolute; left 6px; top 6px; z-index 1; 80 × 80 px; Kreis; Hintergrund #fff; Smiley #12121a (45 × 36 px); transition transform var(--roll), background-color 0.35s, color 0.35s }
- .cta__label { position absolute; inset 0; display flex; align-items center; padding-left 108px; clip-path inset(0 0 0 6px); transition clip-path var(--roll) }
- .cta__label--alt { padding-left 32px; clip-path inset(0 calc(100cqw − 6px) 0 0) }
Hover und :focus-visible:
- .cta: Hintergrund #fff, Text #12121a
- .cta__face: Hintergrund #12121a, Smiley weiß, transform translateX(calc(100cqw − 92px)) rotate(360deg)
- .cta__label: clip-path inset(0 0 0 calc(100cqw − 86px))
- .cta__label--alt: clip-path inset(0 86px 0 0)
Weil alle drei Transitions dieselbe Dauer und Kurve haben, läuft die Schnittkante beider Labels exakt an der linken Kante des Smileys mit: rechts verschwindet der Text unter dem Smiley, links taucht er hinter ihm auf.
Mobil (≤ 360 px): width 100%, max-width 322px, font-size 25px; Label padding-left 100px bzw. 24px.""",
    },
    {
        "id": "wave-button", "title": "Wave-Button", "meta": "Hover · Button", "demo": "wave",
        "desc": "Von rechts schiebt sich eine dunkle Fläche mit animierter Wellenkante über den Button und "
                "invertiert ihn. Beim Verlassen zieht sie sich nach rechts zurück – ohne Nachwippen, reines CSS.",
        "specs": [("Auslöser", "Hover / Fokus"), ("Dauer", "1 s rein · 0,8 s raus"),
                  ("Kurve", "Expo-Out"), ("Wo", "„Our Culture“, Prompt-Buttons")],
        "prompt": """Effekt: Wave-Hover für Buttons (wie bei Manzenreiter, browsersicher ohne mix-blend-mode, reines CSS).

Markup: <a class="btn wave-swap" href="…" data-label="Our Culture">Our Culture</a> – data-label = sichtbarer Text.
CSS:
.wave-swap { position: relative; isolation: isolate; }
.wave-swap::after {
  content: attr(data-label);
  content: attr(data-label) / "";   /* Screenreader lesen nicht doppelt */
  position: absolute; inset: 0; z-index: 1;
  display: flex; align-items: center; justify-content: center;
  border-radius: inherit; background: var(--swap-bg); color: var(--swap-fg);
  white-space: nowrap; pointer-events: none;
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 44' preserveAspectRatio='none'%3E%3Cpath d='M28 0H14C2 5.5 2 16.5 14 22C26 27.5 26 38.5 14 44H28Z'/%3E%3C/svg%3E"), linear-gradient(#000, #000);
          mask-image: (gleich wie oben);
  -webkit-mask-size: 28px 44px, 200% 100%;       mask-size: 28px 44px, 200% 100%;
  -webkit-mask-repeat: repeat-y, no-repeat;      mask-repeat: repeat-y, no-repeat;
  -webkit-mask-position: calc(100% + 28px) 0, calc(-100% + 27px) 0;   mask-position: (gleich);
  transition: -webkit-mask-position .8s cubic-bezier(.16, 1, .3, 1), mask-position .8s cubic-bezier(.16, 1, .3, 1);
}
.wave-swap:hover::after, .wave-swap:focus-visible::after {
  -webkit-mask-position: -28px 0, -1px 0;  mask-position: -28px 0, -1px 0;  transition-duration: 1s;
}
Weißer Button → dunkel: .btn.wave-swap { --swap-bg: #12121a; --swap-fg: #fff; clip-path: inset(0 round 999px); } .btn.wave-swap::after { inset: -2px; } (Ebene ragt 2 px über, clip-path schneidet einmal sauber → kein weißer Saum)
Einen eventuell vorhandenen eigenen Hover-Hintergrund des Buttons für .wave-swap deaktivieren. Reduced Motion: transition none.""",
    },
    {
        "id": "filter", "title": "Filter-Pills", "meta": "Hover + Klick · Filter", "demo": "filter",
        "desc": "Hover: Das Label rollt, der farbige Zähl-Punkt wächst ein Stück. Klick: Die Farbe des Punkts breitet "
                "sich als Kreis über den ganzen Button aus, der Punkt wird weiß und hält die Zahl. Der vorige Filter "
                "zieht seine Farbe gleichzeitig zurück.",
        "specs": [("Auslöser", "Hover · Klick"), ("Dauer", "0,9 s Ausbreiten · 0,5 s Zurückziehen"),
                  ("Kurve", "Expo-Out / gespiegelt"), ("Wo", "Projektfilter")],
        "prompt": """Effekt: Filter-Pills mit Farb-Ausbreitung.

Markup: <button class="filter" type="button" data-filter="campaigning" aria-pressed="false" style="--c: <Farbe der Leistung>"><span class="filter__count">5</span><span class="filter__label">Campaigning</span></button>; „Latest“ ohne Zahl, --c: #12121a.
CSS:
- .filter { --dot: max(calc(42 × u), 32px); --inset: max(calc(7 × u), 5px); --ox: calc(var(--inset) + var(--dot) / 2); position relative; isolation isolate; overflow hidden; display inline-flex; align-items center; gap 10px; height max(calc(56 × u), 44px); padding 0 max(calc(20 × u), 16px) 0 var(--inset); border-radius 999px; box-shadow inset 0 0 0 1px #12121a; transition color 0.45s } (u = 1/1520 der Inhaltsbreite)
- Latest: --ox: 50%.
- .filter__count { Kreis var(--dot); background var(--c); color #12121a; transition scale 0.5s cubic-bezier(0.16,1,0.3,1), background-color 0.45s, color 0.45s }
- Füllung: .filter::before { content ""; position absolute; z-index -1; left var(--ox); top 50%; width calc(200% − 2 × var(--ox) + 4px); aspect-ratio 1; border-radius 50%; background var(--c); translate -50% -50%; scale 0; transition scale 0.5s cubic-bezier(0.7, 0, 0.84, 0) }  (Kreis genau so groß, dass er das entfernte Ende der Pill erreicht → Ausbreitung über die ganze Dauer sichtbar)
- .filter.is-active::before { scale: 1; transition: scale 0.9s cubic-bezier(0.16, 1, 0.3, 1) }
- .filter.is-active .filter__count { background #fff; color #12121a; transition-delay 0.1s }
- Latest aktiv: Text weiß.
- Hover (nur hover: hover): .filter__count scale 1.18; Label per Buchstaben-Roll.
- Desktop: alle Pills sichtbar, flex-wrap wrap, gap 6px. Mobil: eine wischbare Reihe (nowrap, overflow-x auto, Scrollbar ausgeblendet).
Logik: Klick setzt .is-active + aria-pressed nur beim geklickten Button; Projekte ohne passendes Tag bekommen hidden; Hinweis „noch kein Projekt“, wenn keines sichtbar ist.""",
    },
    {
        "id": "cursor", "title": "Cursor-Follower", "meta": "Maus · global", "demo": None,
        "desc": "Ein roter Punkt folgt der Maus mit weichem Nachzug. Über Links wird er zum Ring, über Projekten zur "
                "Pill mit Label. Auf roten Flächen wird er dunkel. Der normale Mauszeiger bleibt sichtbar.",
        "specs": [("Auslöser", "Mausbewegung (nur Desktop)"), ("Nachzug", "1 − e^(−14·dt) pro Frame"),
                  ("Formen", "Punkt 12 px · Ring 48 px · Pill"), ("Wo", "alle Seiten")],
        "prompt": """Effekt: Cursor-Follower (nur Desktop mit Maus; nicht bei Touch oder Reduced Motion).

- Element per JS anlegen: <div class="cursor" aria-hidden="true"><span class="cursor__dot"><span class="cursor__label"></span></span></div> ans Ende von <body>. Der System-Mauszeiger bleibt sichtbar (kein cursor: none).
- .cursor { position fixed; left 0; top 0; z-index 200 (über allem); pointer-events none; color var(--cursor-c, #ff002e); opacity 0 → .is-visible 1 (0.3s) }
- .cursor__dot { position absolute; translate -50% -50%; display grid; place-items center; 12 × 12 px; border-radius 999px; background currentColor; box-shadow inset 0 0 0 1.5px currentColor; transition width/height/border-radius 0.5s cubic-bezier(0.16,1,0.3,1), background-color 0.3s, scale 0.3s }
- Nachzug: pointermove setzt das Ziel; rAF-Schleife x += (Ziel − x) × (1 − e^(−14 × dt)), dt in s (max. 0.05); transform translate3d(x, y, 0); Schleife schläft, wenn die Differenz < 0.1 px ist. Erste Bewegung: sofort an die Mausposition springen.
- Form per pointerover (nicht bei jeder Bewegung):
  · Element mit data-cursor-label + data-cursor-pill → Zustand „pill“: Label-Text setzen, Breite messen, --pill-w = Labelbreite + 48px; Pill 50 px hoch, Label 13px, 500, uppercase, letter-spacing 0.04em, weiß (opacity 0 → 1, scale 0.6 → 1, 0.08 s verzögert).
  · a, button, label, [role=button] → Zustand „link“: 48 × 48 px Ring, background transparent.
  · sonst Punkt (auch über Text – bewusst nur der Punkt).
- Farbe: data-cursor-color am Bereich (z. B. #12121a auf roten Flächen); auf der roten Seitenleiste bei offenem Menü weiß.
- pointerdown: scale 0.82, pointerup zurück. Verlässt die Maus das Fenster (pointerleave auf <html>): ausblenden.""",
    },
    {
        "id": "stack", "title": "Sticky-Stack Leistungen", "meta": "Scroll · Layout", "demo": None,
        "live": "index.html#leistungen",
        "desc": "Die acht Leistungskacheln bleiben oben stehen, die nächste schiebt sich darüber. Jede Kachel hat ein "
                "Hintergrundvideo; verdeckte Kacheln pausieren.",
        "specs": [("Auslöser", "Scroll"), ("Höhe", "100svh, min. 640 px"), ("Mobil", "normal untereinander"),
                  ("Wo", "Leistungen + Culture")],
        "prompt": """Effekt: Sticky-Stack der Leistungskacheln.

- Section .stack, jede Kachel (und der Culture-Block am Ende) direktes Kind: position sticky; top 0; height 100vh / 100svh; min-height 640px; max-height calc(1100 × u + 200px); overflow hidden. Spätere Kacheln liegen im DOM weiter unten und schieben sich deshalb über die vorige.
- Kachel: Grid 1fr / 1fr (Text links in der Leistungsfarbe, Video rechts), Pixel-Band in der Kachelfarbe unten über die ganze Breite.
- Videos ohne Ton, loop, playsinline, poster, preload none; per Scroll-Job nur das Video mit der größten sichtbaren Fläche abspielen – eine Kachel gilt als verdeckt, sobald die nächste Kachel darüberliegt (Unterkante der Sichtfläche = Oberkante der nächsten Kachel).
- Mobil (< 1024 px): kein Sticky, Kacheln untereinander, Video unter dem Text (Seitenverhältnis 375 / 300).""",
    },
    {
        "id": "footer", "title": "Footer-Reveal", "meta": "Scroll · Layout", "demo": None,
        "desc": "Der Footer steht schon fest unten, die Seite darüber schiebt sich nach oben weg. Das Erste, was man "
                "sieht, ist das angeschnittene „vorauerfriends“. Scroll auf dieser Seite ganz nach unten.",
        "specs": [("Auslöser", "Scroll"), ("Technik", "position: sticky; bottom: 0"),
                  ("Bedingung", "Footer passt ins Fenster"), ("Wo", "alle Seiten")],
        "prompt": """Effekt: Footer-Reveal (die Seite schiebt sich über einem stehenden Footer weg).

- <main> { position: relative; z-index: 1; background: #fff } – liegt über dem Footer.
- Footer: Klasse .footer-reveal am <body> → .footer-reveal .footer { position: sticky; bottom: 0; z-index: 0 }. Der Footer klebt am unteren Fensterrand hinter main; scrollt main nach oben weg, wird er von unten nach oben freigelegt (zuerst das angeschnittene Wordmark).
- Die Klasse nur setzen, wenn footer.offsetHeight ≤ innerHeight (bei resize neu prüfen) – sonst wäre der obere Teil des Footers nie sichtbar.
- Mit Softscroll: html { overflow-anchor: none }.""",
    },
]
