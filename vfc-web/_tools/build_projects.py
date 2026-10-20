"""Erzeugt die Projekt-Detailseiten (projekt-*.html) und die Projektliste + Filter auf index.html.

Menü, Header und Footer kommen aus index.html, damit alle Seiten identisch bleiben.
Aufruf (im Ordner vfc-web):  python3 _tools/build_projects.py

Medien werden direkt von vorauerfriends.com eingebunden (Videos zuerst, dann GIFs, dann Bilder).
Kennzahlen: Rosenbauer stammt aus dem Figma, alle anderen sind Platzhalter zum Ersetzen.
Outcome (Zitat + Kennzahlen) ist fürs neue Konzept ausgeblendet (SHOW_OUTCOME), die Werte bleiben in CASES.
"""
import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UP = "https://www.vorauerfriends.com/wp-content/uploads/"

# Leistungen in Kachel-Reihenfolge: Schlüssel (Filter/Tags), Name, Farbe
SERVICES = [
    ("brand-strategy", "Brand Strategy", "lime"),
    ("campaigning", "Campaigning", "green"),
    ("content-creation", "Content Creation", "turquoise"),
    ("corporate-design", "Corporate Design", "orange-nav"),
    ("digital-experience", "Digital Experience", "lila"),
    ("social-media", "Social Media", "yellow-nav"),
    ("leadgenerierung", "Leadgenerierung", "red"),
    ("employer-branding", "Employer Branding", "pink"),
]
SERVICE = {k: (name, color) for k, name, color in SERVICES}

# Outcome-Section mit Zitat und Kennzahlen (zählen hoch) – ausgeblendet
SHOW_OUTCOME = False


def thumb(path):
    """1024er-Variante, die WordPress zu jedem JPG erzeugt (GIFs bleiben Original, sonst ohne Animation)."""
    return re.sub(r"\.jpg$", "-1024x576.jpg", path)


# ---------------------------------------------------------------------------------------------
# Inhalte. Flow-Einträge: ("text", "…") · ("full", medium) · ("show", stil, [medium, …])
# Medium: (pfad, alt) – .mp4 wird als Video eingebunden. Alles läuft in voller Breite:
# „show“ ist eine Galerie, die main.js aus den Bildern zu einem Bewegtbild macht (keine Videos).
# Stile (GALLERIES in main.js): lamellen · zwinkern · raster · laufband · duo (ab drei Bildern).
# Pro Projekt höchstens fünf große Medien (Bild, Video, Galerie) und zwei Texte, je rund drei
# Zeilen (≈ 340–390 Zeichen).
# ---------------------------------------------------------------------------------------------

CASES = [
    {
        "slug": "egger",
        "client": "Egger Bier",
        "abbr": "Eggr",
        "title": ["Aufs echte", "Leben"],
        "page_title": "Egger – Aufs echte Leben",
        "frame": "green",
        "tags": ["campaigning", "digital-experience", "social-media"],
        "hero_video": "2026/08/vfc_egger_hero_1.mp4",
        "poster": "2026/08/vfc_egger_13.jpg",
        "poster_alt": "Marko Arnautović mit Fans und Egger-Dosen im Stadion",
        "challenge": "Ein ganzes Land im Fußballfieber – und jede Marke will mitspielen. Egger Bier sollte "
                     "zur WM26 nicht nur dabei sein, sondern auffallen: mit einem Gesicht, das man kennt, "
                     "und einer Haltung, die man spürt.",
        "flow": [
            ("full", ("2026/08/vfc_egger_snippet_1.mp4", "Spot-Ausschnitt mit Marko Arnautović")),
            ("text", "Wenn ganz Österreich im Fußballfieber ist, spielt Egger Bier ganz vorne mit. Rund um die "
                     "WM26 entwickeln wir eine Testimonialkampagne mit Marko Arnautović als Gesicht. Herzstück ist "
                     "die limitierte Arnautović-Dose: Ein starkes Creative Concept trägt sie vom Regal bis ins "
                     "Stadion und verbindet Marke und Fußball über alle Touchpoints – von OOH und TV bis zu Social, "
                     "Digital und Print."),
            ("show", "zwinkern", [("2026/08/vfc_egger_1.jpg", "Key Visual mit Marko Arnautović und Egger-Trikot"),
                                  ("2026/08/vfc_egger_12.gif", "Animierte Arnautović-Dose")]),
            ("text", "Der Claim „Aufs echte Leben“ holt die Kampagne dorthin, wo Fußball tatsächlich gelebt wird – "
                     "auf den Bahnsteig, an den Zaun, in die Stammkneipe. Auf Social Media wird daraus ein Spiel: "
                     "Mit der Bieröffner-Challenge, Real-Time-Postings zu den Matchdays und Formaten wie „May the "
                     "Fourth“ bleibt Egger im Feed präsent – mit Schmäh statt Werbesprech und mit "
                     "Wiedererkennungswert."),
            ("show", "raster", [("2026/08/vfc_egger_5.jpg", "Großfläche „Aufs echte Leben“ an der Straße"),
                                ("2026/08/vfc_egger_6.jpg", "Gebrandete Straßenbahn in Wien"),
                                ("2026/08/vfc_egger_8.jpg", "Plakat „Aufs echte Leben“ am Zaun"),
                                ("2026/08/vfc_egger_11.jpg", "Citylight am Bahnsteig"),
                                ("2026/08/vfc_egger_10.jpg", "Bierdeckel mit Sprüchen der Kampagne")]),
            ("full", ("2026/08/vfc_egger_snippet_2.mp4", "Social-Clip der Kampagne")),
            ("show", "laufband", [("2026/08/vfc_egger_2.jpg", "Social Post zur Bieröffner-Challenge"),
                                  ("2026/08/vfc_egger_3.jpg", "Social Post „May the Fourth be with you“"),
                                  ("2026/08/vfc_egger_4.gif", "Mitarbeiter im Egger-Lager zeigt das Peace-Zeichen")]),
        ],
        "quote": "Uns war wichtig, Marko nicht in eine Werberolle zu stecken, sondern ihn so zu zeigen, wie "
                 "man ihn kennt: direkt, authentisch und mit Schmäh. So entsteht eine Kampagne mit Charakter.",
        "quote_by": "Eva, Account Director @ vfc",
        "kpis": [(4, 0, "", "", "Wochen rund um die WM26"), (12, 0, "", "", "Touchpoints von Dose bis Tram"),
                 (2.4, 1, "", " Mio.", "Social Impressions"), (38, 0, "", "", "Content-Pieces"),
                 (1, 0, "", "", "Dose mit Kultstatus")],
    },
    {
        "slug": "landesgartenschau",
        "client": "OÖ Landesgartenschau",
        "abbr": "Lndsgrtnsch",
        "title": ["Vorfreude", "blüht auf."],
        "page_title": "OÖ Landesgartenschau – Vorfreude blüht auf",
        "frame": "pink",
        "tags": ["campaigning", "content-creation"],
        "hero_video": "2026/08/vfc_langesgatenschau_hero.mp4",
        "poster": "2026/08/vfc_langesgatenschau_sujet.jpg",
        "poster_alt": "Menschen mit Blütenköpfen flanieren durch die Welser Innenstadt",
        "challenge": "2027 wird Wels zur „Stadt der Gärten“. Bis dahin ist es noch ein Weilchen – die Vorfreude "
                     "sollte aber schon jetzt sprießen. Gesucht war ein Auftritt, der aus einer Zukunftsvision "
                     "ein Stadtgespräch macht.",
        "flow": [
            ("text", "2027 wird Wels zur „Stadt der Gärten“ – und wir sorgen schon heute dafür, dass man davon "
                     "spricht. Mit einer aufmerksamkeitsstarken Imagekampagne übersetzen wir die Markenidee in einen "
                     "Auftritt, der hängen bleibt: vom Key Visual über Digital- und Print-Ads bis zur Mediaplanung. "
                     "So wächst die Vorfreude auf die OÖ Landesgartenschau mit jedem Kontaktpunkt ein Stück weiter."),
            ("full", ("2026/08/vfc_langesgatenschau_sujet_3.jpg", "Plakat „Stadt der Gärten“ an einem Geländer")),
            ("text", "Das Key Visual setzt auf einen charmanten Bruch: Menschen mit Blütenköpfen flanieren durch "
                     "die Welser Innenstadt – vertraut und doch so, dass man zweimal hinschaut. Fotografiert direkt "
                     "vor Ort, mit viel Liebe zum Detail inszeniert und konsequent auf Plakat, Inserat und Digital "
                     "ausgerollt, wird aus einer Zukunftsvision schon jetzt ein echtes Stadtgespräch in ganz Wels."),
            ("show", "lamellen", [("2026/08/vfc_langesgatenschau_sujet_4.jpg", "Inserate und Drucksorten der Kampagne"),
                                  ("2026/08/vfc_langesgatenschau_sujet_5.gif", "Fotoshooting in der Welser Innenstadt")]),
        ],
        "quote": "Mein Lieblingsmoment bei der Kampagne ist eigentlich ganz simpel: wenn man merkt, dass jemand "
                 "zweimal hinschaut. Genau dafür haben wir das Key Visual gemacht. Auffallen, hängen bleiben "
                 "und schon jetzt ein bisschen Vorfreude auf 2027 auslösen.",
        "quote_by": "Joanna, Account Managerin @ vfc",
        "kpis": [(3, 0, "", "", "Sujet-Welten"), (180, 0, "", "", "Plakatflächen in Oberösterreich"),
                 (1.1, 1, "", " Mio.", "Ad-Impressions"), (6, 0, "", "", "Monate Vorfreude-Kampagne"),
                 (2, 0, "", "×", "hinschauen – mindestens")],
    },
    {
        "slug": "holter",
        "client": "Holter",
        "abbr": "Hltr",
        "title": ["Saubere", "Markensache."],
        "page_title": "Holter – Saubere Markensache",
        "frame": "lila",
        "tags": ["campaigning", "content-creation", "digital-experience"],
        "hero_video": "2025/05/vfc_holter_nachhaltigkiet_hero.mp4",
        "poster": "2025/06/vfc_holter_nachhaltigkiet_img_2.jpg",
        "poster_alt": "Badezimmer mit Rasenboden – „Holter dir die Natur ins Haus“",
        "challenge": "Vier Premiummarken, drei Kampagnenziele, ein Absender: Für Holter galt es, Grohe, Hansa, "
                     "MeinHOLTERBad und Laufen unter einen Hut zu bringen – ohne dass eine Marke im Schatten "
                     "der anderen steht.",
        "flow": [
            ("full", ("2025/05/vfc_holter_nachhaltigkiet_video2.mp4", "Bewegtbild-Ad der Kampagne")),
            ("text", "Wenn vier Premiummarken aufeinandertreffen, muss die Kampagne sitzen! Für Holter haben wir "
                     "Grohe, Hansa, MeinHOLTERBad und Laufen in einer WKZ-Kampagne vereint. Drei Phasen, drei "
                     "Claims, drei Ansätze: Markenvielfalt zeigen, Nachhaltigkeit pushen, Termine generieren – von "
                     "Awareness über Traffic bis Conversion, jede Phase mit eigenem Design-Treatment."),
            ("show", "duo", [("2025/05/vfc_holter_nachhaltigkiet_social_2.jpg", "Social Ads „Holter dir die Natur ins Haus“"),
                             ("2025/05/vfc_holter_nachhaltigkiet_social_3.jpg", "Ad-Formate für alle vier Marken"),
                             ("2025/05/vfc_holter_nachhaltigkiet_social_1.jpg", "Story-Formate für Hansa und Holter")]),
            ("text", "„Holter dir die Natur ins Haus“ bringt das Thema Nachhaltigkeit direkt ins Badezimmer, "
                     "Bewegtbild und Social Ads tragen die Botschaft in den Feed. Creative Concept, Digital Ads und "
                     "OOH greifen dabei perfekt ineinander, und jede Marke bekommt ihre eigene Bühne, ohne dass das "
                     "große Ganze verloren geht. Das Ergebnis: vier Marken, eine Kampagne und maximaler Impact!"),
            ("full", ("2025/05/vfc_holter_nachhaltigkiet_video3.mp4", "Animierte Social Ad")),
        ],
        "quote": "Das Spannende bei dieser Holter-Kampagne war die Balance zwischen vier starken Marken und drei "
                 "verschiedenen Kampagnenzielen. Jede Phase brauchte ihr eigenes Design, ohne das große Ganze "
                 "zu verlieren. Markenvielfalt zeigen und trotzdem eine konsistente Geschichte erzählen – das "
                 "war die Kunst.",
        "quote_by": "Marco, Geschäftsführer @ vfc",
        "kpis": [(4, 0, "", "", "Premiummarken"), (3, 0, "", "", "Phasen, drei Claims"),
                 (26, 0, "", "", "Ad-Formate"), (1.3, 1, "", " Mio.", "Impressions"),
                 (410, 0, "", "", "vereinbarte Beratungstermine")],
    },
    {
        "slug": "rosenbauer",
        "client": "Rosenbauer",
        "abbr": "Rsnbr",
        "title": ["Jede Technik", "hat ihre Zeit"],
        "page_title": "Rosenbauer – #TheAnswerIsElectric",
        "frame": "turquoise",
        "tags": ["brand-strategy", "campaigning", "digital-experience"],
        "hero_video": None,
        "poster": "2024/08/vfc_rosenbauer_electric_hero.jpg",
        "poster_alt": "Feuerwehr-Pferdekutsche in einer futuristischen Stadt",
        "preview_video": "2024/08/vfc_rosenbauer_electric_social.mp4",
        "challenge": "Feuerwehrtechnik denkt in Jahrzehnten – Nachhaltigkeit in Jahren. Rosenbauer wollte zeigen, "
                     "dass die Zukunft der Branche elektrisch ist, und dabei auch jene abholen, die an bewährter "
                     "Technik hängen.",
        "flow": [
            ("text", "Zeiten ändern sich, ebenso wie die Herausforderungen, denen man sich stellen muss. Auch bei "
                     "Rosenbauer rückt Nachhaltigkeit in den Fokus, denn eins ist klar: #TheAnswerIsElectric. Das "
                     "Key Visual schlägt die Brücke – eine Pferdekutsche als Feuerwehrfahrzeug, mitten in einer "
                     "elektrifizierten Stadt der Zukunft. Jede Technik hat ihre Zeit, und die des Elektroantriebs "
                     "ist jetzt."),
            ("full", ("2024/08/vfc_rosenbauer_electric_social.mp4", "Social Video #TheAnswerIsElectric")),
            ("text", "Mit Social-Media- sowie Paid-Social-Kampagnen, Sondernewsletter, Inseraten und einer eigenen "
                     "Microsite zur Kampagne bringen wir Rosenbauers elektrifizierte Vision der Zukunft an die "
                     "Massen. Überall gilt dieselbe Bildsprache: Tradition trifft Zukunft – so wird aus einem "
                     "Branchenthema eine Geschichte, die man auf LinkedIn, Facebook & Co. gerne liest, teilt und "
                     "weitererzählt."),
            ("show", "raster", [("2024/08/vfc_rosenbauer_electric_inserat.jpg", "Inserat „Jede Technik hat ihre Zeit“"),
                                ("2024/08/vfc_rosenbauer_electric_web.jpg", "Microsite zur Kampagne")]),
        ],
        "quote": "Rosenbauer ist Marktführer – und eine treibende Kraft für mehr Nachhaltigkeit in der Branche. "
                 "Unsere Informationskampagne baut genau darauf auf. Das Ziel? So viele Interessierte auf "
                 "LinkedIn, Facebook & Co. mit den zukunftsweisenden Lösungsansätzen abzuholen.",
        "quote_by": "Andrea, Account Managerin @ vfc",
        # Kennzahlen aus dem Figma („05 Case + Text“)
        "kpis": [(4, 0, "", "+", "Monate Laufzeit"), (1404, 0, "", "", "Sitzungen"),
                 (22, 0, "", "", "Sek. Interaktionsdauer"), (254, 0, "", "", "Leads / 214 von bezahlten Maßnahmen"),
                 (1609, 0, "", "", "Seitenaufrufe")],
    },
    {
        "slug": "schrack-seconet",
        "client": "Schrack Seconet",
        "abbr": "Schrck Scnt",
        "title": ["For the", "people who…"],
        "page_title": "Schrack Seconet – For the people who…",
        "frame": "lime",
        "tags": ["campaigning", "employer-branding", "leadgenerierung"],
        "hero_video": "2023/12/vfgc_schrack_employer_LOOP_v1.mp4",
        "poster": "2023/12/vfc_schrack_employerbranding_0.jpg",
        "poster_alt": "Mitarbeiterin vor einem Serverraum in rot-blauem Licht",
        "challenge": "Sicherheitstechnik ist ein Job mit Verantwortung – und mit Zukunft. Schrack Seconet wollte "
                     "genau die Menschen erreichen, die mehr suchen als einen Arbeitsplatz: Talente, die "
                     "Verantwortung übernehmen und Zukunft gestalten.",
        "flow": [
            ("text", "Für optimales Employer Branding muss nicht nur der Inhalt matchen, sondern auch die Art und "
                     "Weise, wie er kommuniziert wird. Und wir haben sie gefunden: die perfekte Mischung aus klarem, "
                     "aber emotionalem Wording und einem modernen, zielgruppenorientierten Auftritt. Daraus entstand "
                     "die Idee „For the people who…“ – starke Statements, die echte Mitarbeiter:innen "
                     "vervollständigen."),
            ("full", ("2023/12/vfc_schrack_employerbranding_2.jpg", "Großfläche „Who want to shape tomorrow“ bei Nacht")),
            ("show", "zwinkern", [("2023/12/vfc_schrack_employerbranding_4.jpg", "Plakatserie in der U-Bahn"),
                                  ("2023/12/vfc_schrack_employerbranding_3.jpg", "Weitere Sujets der Plakatserie")]),
            ("text", "Who want to shape tomorrow, who want to make a difference, who want to take responsibility: "
                     "Inszeniert in markantem Rot-Blau-Licht, rollen wir die Statements über alle Kanäle aus – von "
                     "der Großfläche über die U-Bahn bis zur Karriere-Website. Denn sind wir mal ehrlich: Was lässt "
                     "einen näher zusammenrücken als der Blick in die (gemeinsame) Zukunft?"),
            ("full", ("2023/12/vfc_schrack_employerbranding_8.jpg", "Karriere-Website und Ads der Kampagne")),
        ],
        "quote": "Wir wollten klassische Werte neu verpacken. Mit starken Statements, die den Nagel auf den Kopf "
                 "treffen. Und mit denen sich sowohl potentielle als auch bestehende Mitarbeiter:innen sofort "
                 "identifizieren können.",
        "quote_by": "Johanna, Account Director @ vfc",
        "kpis": [(5, 0, "", "", "Statements, ein Versprechen"), (12, 0, "", "", "Mitarbeiter:innen vor der Kamera"),
                 (48, 0, "", "", "Citylights in Wien"), (2.1, 1, "", "×", "mehr Bewerbungen"),
                 (1, 0, "", "", "neue Karriere-Website")],
    },
    {
        "slug": "transgourmet",
        "client": "Transgourmet",
        "abbr": "Trnsgrmt",
        "title": ["Hannes kann es!", "Und Du?"],
        "page_title": "Transgourmet – Der Hannes, der kann es!",
        "frame": "yellow-nav",
        "tags": ["digital-experience", "employer-branding", "leadgenerierung", "social-media"],
        "hero_video": "2023/04/vfc_transgouremt_hannes_hero_1.mp4",
        "poster": "2023/04/vfc_transgourmet_hannes_thumb.jpg",
        "poster_alt": "Hannes lächelt in die Kamera",
        "challenge": "IT-Fachkräfte sind heiß begehrt – und schwer zu überzeugen. Transgourmet suchte Verstärkung "
                     "für das IT-Team und brauchte eine Kampagne, die im Recruiting-Einheitsbrei nicht untergeht.",
        "flow": [
            ("text", "Was ist die IT, wenn nicht das Herzstück des Unternehmens? Zumindest wenn es nach Hannes "
                     "geht. Und um ihn dreht sich alles, schließlich sucht sein Team bei Transgourmet Verstärkung. "
                     "Für diese HR-Kampagne servieren wir ein ganzes Kreativ-Menü an Touchpoints und gemeinsam mit "
                     "Forafilm einen Kreativspot – und zeigen allen da draußen: Der Hannes, der kann es."),
            ("full", ("2023/04/vfc_transgouremt_hannes_gif_3.mp4", "Hannes als Loop")),
            ("show", "duo", [("2023/04/vfc_transgourmet_hannes_1.jpg", "Hannes im Transgourmet-Markt"),
                             ("2023/04/vfc_transgourmet_hannes_3.jpg", "Hannes in Nahaufnahme"),
                             ("2023/04/vfc_transgourmet_hannes_4.jpg", "Landingpage im Retro-Gaming-Look auf drei Smartphones")]),
            ("text", "Pixel-Typo, knallige Farben und ein Held mit Schnauzbart: Landingpage, Social Ads und "
                     "animierte Sticker spielen mit Retro-Gaming-Ästhetik und machen die Bewerbung so einfach wie "
                     "ein Level-up. So wird aus einer klassischen IT-Stellenausschreibung eine Kampagne, die im "
                     "Recruiting-Einheitsbrei nicht untergeht – sondern Lust auf das nächste Level macht."),
            ("show", "lamellen", [("2023/04/vfc_transgourmet_hannes_social_5.jpg", "Social Ads „Jetzt bewerben“"),
                                  ("2023/04/vfc_transgourmet_hannes_sticker_6.gif", "Animierte Hannes-Sticker")]),
            ("full", ("2023/04/vfc_transgouremt_hannes_gif_4.mp4", "Hannes-Loop für Social")),
        ],
        "quote": "Eine IT-Stelle ausschreiben kann jeder. Aber Bewerberinnen und Bewerber eiskalt auf den Job "
                 "heiß zu machen, verlangt dann doch einen echten Profi. Einen Hannes eben.",
        "quote_by": "Alfred, Creative Director Text @ vfc",
        "kpis": [(1, 0, "", "", "Kreativspot mit Forafilm"), (8, 0, "", "", "Wochen Kampagne"),
                 (640, 0, "", " k", "Video-Views"), (97, 0, "", "", "Bewerbungen"),
                 (3.2, 1, "", " %", "Klickrate Social Ads")],
    },
    {
        "slug": "ski-austria",
        "client": "Ski Austria",
        "abbr": "Sk Astr",
        "title": ["Mit Schuss zum", "neuen Auftritt"],
        "page_title": "Ski Austria – Mit Schuss zum neuen Auftritt",
        "frame": "red",
        "tags": ["digital-experience"],
        "hero_video": "2023/08/vfc_skiaustia_hero_v3.mp4",
        "poster": "2023/06/vfc_skiaustria_web_hero.jpg",
        "poster_alt": "Seiten der neuen Ski-Austria-Plattform in der Perspektive",
        "challenge": "Ski Austria ist mehr als Weltcup: zwölf Sportarten, hunderte Athlet:innen, Fans, Vereine und "
                     "Medien. Gesucht war eine digitale Plattform, die all diese Usergruppen bedient – und dabei "
                     "so schnell ist wie eine Abfahrt.",
        "flow": [
            ("full", ("2023/06/vfc_skiaustria_animation_4.mp4", "Animation der Startseite")),
            ("text", "Wir sind nicht nur auf der Piste standfest unterwegs, sondern auch digital stark aufgestellt. "
                     "Unsere Informationsplattform für Ski Austria ist auf die unterschiedlichsten Usergruppen "
                     "zugeschnitten und im reduzierten Swiss Design gehalten: großformatige Bilder, klare Typo und "
                     "das markante Rot als Leitsystem. Animierte Balken und Slider bringen Bewegung ins Interface."),
            ("full", ("2023/06/vfc_skiaustria_web_slider_animation_single.mp4", "Animierter Slider")),
            ("show", "laufband", [("2023/06/vfc_skiaustria_web_1.jpg", "Athletenseite Andrea Limbacher"),
                                  ("2023/06/vfc_skiaustria_web_2.jpg", "Profil von Simon Eder"),
                                  ("2023/06/vfc_skiaustria_web_5.jpg", "Event-Seite IBU Cup Biathlon"),
                                  ("2023/06/vfc_skiaustria_web_7.jpg", "Snowboard-Bereich"),
                                  ("2023/06/vfc_skiaustria_web_8.jpg", "News-Artikel zum Trainingsauftakt"),
                                  ("2023/06/vfc_skiaustria_web_6.jpg", "Übersicht der Seitentemplates")]),
            ("full", ("2023/06/vfc_skiaustria_web_balken_animation.mp4", "Animation der roten Balken")),
            ("text", "Gemeinsam mit unserem Partner Mindspace entstand so eine langfristige digitale Infrastruktur – "
                     "vom Athletenprofil über den Event-Kalender bis zum News-Hub, auch für die Second-Screen-Nutzung "
                     "während spannender Weltcupveranstaltungen. Damit ist die Plattform für Fans, Vereine und "
                     "Medien der stetige Begleiter rund um den Ski- und Snowboardsport."),
            ("full", ("2023/06/vfc_skiaustria_animation_5.mp4", "Animation der Event-Übersicht")),
        ],
        "quote": "Von Anfang an war klar: Für Ski Austrias Markenpositionierung braucht es keine einfache Website, "
                 "sondern eine langfristige digitale Infrastruktur. Und die haben wir gemeinsam mit unserem "
                 "Partner Mindspace auf die Beine gestellt – vollumfassend und bis ins kleinste Detail durchdacht.",
        "quote_by": "Christoph, Digital Director @ vfc",
        "kpis": [(12, 0, "", "", "Sportarten auf einer Plattform"), (400, 0, "", "+", "Athletenprofile"),
                 (1.9, 1, "", " Mio.", "Sitzungen pro Saison"), (68, 0, "", " %", "mobile Nutzung"),
                 (2, 0, "", "", "Screens gleichzeitig")],
    },
]

# ---------------------------------------------------------------------------------------------

e = html.escape


def page_url(case):
    return f"projekt-{case['slug']}.html"


def chips(tags, indent):
    pad = " " * indent
    return "".join(f'{pad}<li class="chip" style="--c: var(--{SERVICE[t][1]})">{SERVICE[t][0]}</li>\n' for t in tags)


def preview_src(case):
    return case.get("preview_video") or case["hero_video"]


def project_row(case, indent=6):
    """Zeile der Projektliste (Startseite + Related Projects)."""
    p = " " * indent
    title = "<br />".join(e(line) for line in case["title"])
    return (
        f'{p}<li class="project" data-tags="{" ".join(case["tags"])}">\n'
        f'{p}  <a class="project__link" href="{page_url(case)}" data-cursor-label="View Project" data-cursor-pill>\n'
        f'{p}    <div class="project__media" data-motion="curtain"><img class="project__img" src="{UP}{thumb(case["poster"])}" '
        f'alt="{e(case["poster_alt"])}" width="1024" height="576" loading="lazy" />'
        f'<span class="project__preview" aria-hidden="true"><video src="{UP}{preview_src(case)}" muted loop playsinline preload="none"></video></span></div>\n'
        f'{p}    <div class="project__text">\n'
        f'{p}      <p class="eyebrow">{e(case["client"])}</p>\n'
        f'{p}      <h3 class="project__title">{title}</h3>\n'
        f'{p}      <ul class="tags">\n{chips(case["tags"], indent + 8)}{p}      </ul>\n'
        f'{p}    </div>\n'
        f'{p}    <svg class="px px--arrow project__arrow" aria-hidden="true"><use href="#px-arrow" /></svg>\n'
        f'{p}  </a>\n'
        f'{p}</li>\n'
    )


def media(item):
    path, alt = item
    if path.endswith(".mp4"):
        # Videos laufen über main.js (immer nur das größte sichtbare) – ohne Ton, als Loop
        return (f'<figure class="case-media" data-motion="curtain"><video class="bg-video" src="{UP}{path}" muted loop '
                f'playsinline preload="metadata" aria-label="{e(alt)}"></video></figure>')
    return (f'<figure class="case-media" data-motion="curtain"><img src="{UP}{path}" alt="{e(alt)}" '
            f'width="1920" height="1080" loading="lazy" /></figure>')


GALLERY_STYLES = {"lamellen": 2, "zwinkern": 2, "raster": 2, "laufband": 2, "duo": 3}  # Stil: Mindestanzahl Bilder


def show(style, items):
    """Galerie: die Bilder liegen übereinander, main.js schneidet sie im gewählten Stil."""
    assert len(items) >= GALLERY_STYLES[style] and not any(path.endswith(".mp4") for path, _ in items)
    slides = "".join(f'<div class="case-show__slide{" is-on" if i == 0 else ""}"><img src="{UP}{path}" '
                     f'alt="{e(alt)}" width="1920" height="1080" loading="lazy" /></div>'
                     for i, (path, alt) in enumerate(items))
    return (f'<figure class="case-media case-show" data-gallery="{style}" data-motion="curtain">'
            f'<div class="case-show__track vfm-media">{slides}</div></figure>')


def flow_html(case):
    kinds = [kind for kind, *_ in case["flow"]]
    assert kinds.count("text") <= 2 and len(kinds) - kinds.count("text") <= 5, case["slug"]
    out = []
    for kind, *content in case["flow"]:
        if kind == "text":
            out.append(f'        <p class="case-text">{e(content[0])}</p>')
        elif kind == "full":
            out.append("        " + media(content[0]))
        else:
            out.append("        " + show(*content))
    return "\n".join(out) + "\n"


def kpi_html(k):
    value, decimals, prefix, suffix, label = k
    shown = f"{value:,.{decimals}f}".replace(",", "X").replace(".", ",").replace("X", ".")
    # Wort-Einheiten („Mio.“) klein neben die Zahl, Zeichen wie „+“ oder „×“ bleiben groß (wie im Figma)
    unit = ""
    if len(suffix.strip()) > 2:
        unit, suffix = f'<span class="kpi__unit">{e(suffix.strip())}</span>', ""
    return (f'<div class="kpi"><span class="kpi__num"><span data-count="{value}" data-decimals="{decimals}" '
            f'data-prefix="{e(prefix)}" data-suffix="{e(suffix)}">{e(prefix)}{shown}{e(suffix)}</span>{unit}</span>'
            f'<span class="kpi__label">{e(label)}</span></div>')


def hero_media(case):
    if case["hero_video"]:
        return (f'<video class="case-hero__media bg-video" src="{UP}{case["hero_video"]}" poster="{UP}{case["poster"]}" '
                f'muted loop playsinline preload="auto" aria-hidden="true"></video>')
    return f'<img class="case-hero__media" src="{UP}{case["poster"]}" alt="{e(case["poster_alt"])}" width="1920" height="1080" />'


# ---------------------------------------------------------------------------------------------
# Startseite: Projektliste + Filter
# ---------------------------------------------------------------------------------------------

index_path = ROOT / "index.html"
index = index_path.read_text(encoding="utf-8")

rows = "".join(project_row(c) for c in CASES)
index = re.sub(r"(<!-- projekte:start[^>]*-->\n).*?(    <!-- projekte:end -->)",
               lambda m: f'{m.group(1)}    <ul class="project-list" id="project-list">\n{rows}    </ul>\n{m.group(2)}',
               index, flags=re.S)

counts = {k: sum(k in c["tags"] for c in CASES) for k, _, _ in SERVICES}
filters = ['        <button class="filter is-active" type="button" data-filter="all" aria-pressed="true" '
           'style="--c: var(--ink)"><span class="filter__label">Latest</span></button>\n']
for key, name, color in SERVICES:
    filters.append(f'        <button class="filter" type="button" data-filter="{key}" aria-pressed="false" '
                   f'style="--c: var(--{color})"><span class="filter__count">{counts[key]}</span>'
                   f'<span class="filter__label">{name}</span></button>\n')
index = re.sub(r"(<!-- filter:start[^>]*-->\n).*?(      <!-- filter:end -->)",
               lambda m: f'{m.group(1)}      <div class="filters__track">\n{"".join(filters)}      </div>\n{m.group(2)}',
               index, flags=re.S)
index_path.write_text(index, encoding="utf-8")

# ---------------------------------------------------------------------------------------------
# Detailseiten: Kopf/Menü und Footer aus index.html
# ---------------------------------------------------------------------------------------------

head, rest = index.split('<main id="main">\n', 1)
footer = rest.split("</main>\n", 1)[1]
culture = re.search(r'    <article class="culture" id="culture">.*?    </article>\n', index, re.S).group(0)
echo = re.search(r'    <a class="echo".*?    </a>\n', index, re.S).group(0)
echo = (echo.replace("View All Projects", "Related Projects")
            .replace('data-cursor-label="Related Projects"', 'data-cursor-label="All Projects"')
            .replace('href="#"', 'href="index.html#projekte"'))

# Anker im Menü zeigen auf die Startseite, das Logo führt nach Hause
# (nur <a>-Links – SVG-Verweise wie <use href="#px-smiley"> bleiben lokal)
head = re.sub(r'(<a\b[^>]*\shref=")#(?!main")([^"]+)"', r'\1index.html#\2"', head)
head = head.replace('href="index.html#top"', 'href="index.html"')


def detail_page(i, case):
    related = [CASES[(i + 1) % len(CASES)], CASES[(i + 2) % len(CASES)]]
    title = "<br />".join(e(line) for line in case["title"])
    abbr = f"/ {e(case['abbr'])}"
    k = [kpi_html(x) for x in case["kpis"]]
    outcome = (
        f'  <!-- ============ Outcome ============ -->\n'
        f'  <section class="case-section" aria-labelledby="outcome">\n'
        f'    <div class="case-label"><h2 id="outcome">Outcome</h2><span>{abbr}</span></div>\n'
        f'    <div class="case-outcome">\n'
        f'      <blockquote class="case-quote"><p>„{e(case["quote"])}“</p><cite>{e(case["quote_by"])}</cite></blockquote>\n'
        f'      {k[0]}\n      {k[1]}\n'
        f'      <span class="case-outcome__rule" aria-hidden="true"></span>\n'
        f'      {k[2]}\n      {k[3]}\n      {k[4]}\n'
        f'    </div>\n'
        f'  </section>\n\n') if SHOW_OUTCOME else ""
    page_head = (head
                 .replace(re.search(r"<title>.*?</title>", head).group(0),
                          f"<title>{e(case['page_title'])} | vorauerfriends</title>")
                 .replace(re.search(r'<meta name="description" content="[^"]*" />', head).group(0),
                          f'<meta name="description" content="{e(case["challenge"][:155])}" />'))
    frame_rects = re.search(r'    <div class="frame" aria-hidden="true">.*?    </div>\n', index, re.S).group(0)
    return (
        page_head + '<main id="main" class="case">\n\n'
        f'  <!-- ============ Hero ============ -->\n'
        f'  <section class="case-hero" id="top" style="--frame: var(--{case["frame"]})">\n'
        f'    {hero_media(case)}\n'
        f'{frame_rects}'
        f'    <div class="case-hero__content">\n'
        f'      <p class="eyebrow">{e(case["client"])}</p>\n'
        f'      <h1 class="case-hero__title">{title}</h1>\n'
        f'      <ul class="tags">\n{chips(case["tags"], 8)}      </ul>\n'
        f'    </div>\n'
        f'  </section>\n\n'
        f'  <!-- ============ Challenge ============ -->\n'
        f'  <section class="case-section" aria-labelledby="challenge">\n'
        f'    <div class="case-label"><h2 id="challenge">Challenge</h2><span>{abbr}</span></div>\n'
        f'    <p class="case-lede" data-fill>{e(case["challenge"])}</p>\n'
        f'  </section>\n\n'
        f'  <!-- ============ Approach ============ -->\n'
        f'  <section class="case-section" aria-labelledby="approach">\n'
        f'    <div class="case-label"><h2 id="approach">Approach</h2><span>{abbr}</span></div>\n'
        f'    <div class="case-flow">\n{flow_html(case)}    </div>\n'
        f'  </section>\n\n'
        f'{outcome}'
        f'  <!-- ============ Related Projects ============ -->\n'
        f'  <section class="projects related" aria-label="Related Projects">\n'
        f'{echo}'
        f'    <ul class="project-list">\n{"".join(project_row(r) for r in related)}    </ul>\n'
        f'  </section>\n\n'
        f'  <section class="stack" aria-label="Kultur">\n{culture}  </section>\n'
        '</main>\n' + footer
    )


for i, case in enumerate(CASES):
    (ROOT / page_url(case)).write_text(detail_page(i, case), encoding="utf-8")
    print("geschrieben:", page_url(case))
print("index.html: Projektliste + Filter aktualisiert", counts)


# ---------------------------------------------------------------------------------------------
# Animationsseite (animationen.html): Beschreibung, Werte, Live-Demo und KI-Prompt je Effekt
# ---------------------------------------------------------------------------------------------

from animations import ANIMATIONS, CONTEXT, GUIDELINES  # noqa: E402


def demo_html(kind):
    """Live-Demo je Effekt (läuft mit derselben main.js wie die echte Seite)."""
    if kind == "intro":
        return '<div class="anim-demo"><button class="btn btn--line wave-swap" type="button" data-label="Intro abspielen" data-replay-intro>Intro abspielen</button></div>'
    if kind == "curtain":
        return '<div class="anim-demo"><a class="btn btn--line wave-swap" href="#" data-label="Vorhang abspielen">Vorhang abspielen</a></div>'
    if kind == "menu":
        return '<div class="anim-demo"><button class="btn btn--line wave-swap" type="button" data-label="Menü öffnen" data-open-menu>Menü öffnen</button></div>'
    if kind == "roll":
        items = "".join(f'<button class="anim-roll" type="button" data-roll>{t}</button>' for t in ("Leistungen", "Projekte", "Über uns"))
        return f'<div class="anim-demo anim-demo--dark anim-demo--stack">{items}</div>'
    if kind == "reveal":
        return ('<div class="anim-demo anim-demo--text"><p class="case-text">Scroll diesen Absatz langsam aus dem Bild und '
                'wieder zurück: Beim Reinkommen gleiten die Wörter Zeile für Zeile aus ihrer Maske nach oben, beim '
                'Rausscrollen läuft exakt dieselbe Bewegung rückwärts – vom letzten Wort zum ersten zurück nach unten.</p></div>')
    if kind == "fill":
        return ('<div class="anim-demo anim-demo--text"><p class="case-lede" data-fill>Strategen und Markenanalyse-Profis. '
                'Wunderbare Kreative, Storyteller- und Storyseller. Content Queens und Kings und noch so viele mehr!</p></div>')
    if kind == "counter":
        k = [kpi_html((1404, 0, "", "", "Sitzungen")), kpi_html((2.4, 1, "", " Mio.", "Social Impressions"))]
        return f'<div class="anim-demo anim-demo--kpi">{k[0]}{k[1]}</div>'
    if kind == "image":
        return ('<div class="anim-demo anim-demo--media"><figure class="case-media" data-motion="curtain">'
                f'<img src="{UP}2026/08/vfc_egger_5.jpg" alt="Großfläche „Aufs echte Leben“" width="1920" height="1080" loading="lazy" /></figure></div>')
    if kind == "row":
        return f'<div class="anim-demo anim-demo--row"><ul class="project-list">\n{project_row(CASES[0], 8)}      </ul></div>'
    if kind == "fan":
        return f'<div class="anim-demo anim-demo--fan">\n{echo_all}    </div>'
    if kind == "cta":
        return ('<div class="anim-demo anim-demo--dark"><button class="cta" type="button">'
                '<span class="cta__face" aria-hidden="true"><svg><use href="#px-smiley" /></svg></span>'
                '<span class="cta__label">Start a project</span>'
                '<span class="cta__label cta__label--alt" aria-hidden="true">Start a project</span></button></div>')
    if kind == "wave":
        return ('<div class="anim-demo anim-demo--dark"><button class="btn wave-swap" type="button" '
                'data-label="Our Culture">Our Culture</button></div>')
    if kind == "filter":
        demo = [("all", "Latest", "ink", None), ("campaigning", "Campaigning", "green", 5), ("digital-experience", "Digital Experience", "lila", 5)]
        pills = ""
        for key, name, color, count in demo:
            active = ' is-active" aria-pressed="true' if key == "all" else '" aria-pressed="false'
            dot = f'<span class="filter__count">{count}</span>' if count else ""
            pills += (f'<button class="filter{active}" type="button" data-filter="{key}" style="--c: var(--{color})">'
                      f'{dot}<span class="filter__label">{name}</span></button>')
        return f'<div class="anim-demo"><div class="anim-filters">{pills}</div></div>'
    return ""


def anim_item(n, item, *, guideline=False):
    num = "00" if guideline else f"{n:02d}"
    specs = "".join(f'<div><dt>{e(k)}</dt><dd>{e(v)}</dd></div>' for k, v in item["specs"])
    demo = "" if guideline else demo_html(item.get("demo"))
    live = item.get("live")
    if live:
        extra = f'<a class="btn btn--line wave-swap" href="{e(live)}" data-label="Live ansehen">Live ansehen</a>'
    elif not demo and not guideline:
        extra = '<span class="anim-note">Läuft auf dieser Seite</span>'
    else:
        extra = ""
    wide = " anim-item__body--wide" if item.get("demo") in ("row", "fan", "image") else ""
    prompt_id = f'prompt-{item["id"]}'
    prompt = f'{CONTEXT}\n\n{item["prompt"]}'
    return (
        f'  <section class="anim-item" id="{item["id"]}" aria-labelledby="{item["id"]}-title">\n'
        f'    <div class="case-label"><h2 id="{item["id"]}-title"><span class="anim-num">{num}</span>{e(item["title"])}</h2><span>{e(item["meta"])}</span></div>\n'
        f'    <div class="anim-item__body{wide}">\n'
        f'      <div class="anim-item__text">\n'
        f'        <p class="anim-item__desc">{e(item["desc"])}</p>\n'
        f'        <dl class="anim-specs">{specs}</dl>\n'
        f'        <div class="anim-item__actions">'
        f'<button class="btn btn--ink wave-swap" type="button" data-copy="{prompt_id}" data-label="Prompt kopieren">Prompt kopieren</button>{extra}</div>\n'
        f'        <details class="anim-prompt"><summary>Prompt ansehen</summary><pre id="{prompt_id}" data-lenis-prevent>{e(prompt)}</pre></details>\n'
        f'      </div>\n'
        + (f'      {demo}\n' if demo else "")
        + f'    </div>\n'
        f'  </section>\n\n'
    )


echo_all = (re.search(r'    <a class="echo".*?    </a>\n', index, re.S).group(0)
            .replace('href="#"', 'href="index.html#projekte"'))
anim_head = (head
             .replace(re.search(r"<title>.*?</title>", head).group(0), "<title>Animationen | vorauerfriends</title>")
             .replace(re.search(r'<meta name="description" content="[^"]*" />', head).group(0),
                      '<meta name="description" content="Alle Animationen der vfc-Website mit Beschreibung und KI-Prompt für die Umsetzung in WordPress." />'))
index_links = "".join(f'<li><a class="anim-index__link" href="#{a["id"]}" data-roll>{e(a["title"])}</a></li>'
                      for a in [GUIDELINES, *ANIMATIONS])
anim_page = (
    anim_head + '<main id="main" class="anim-page">\n\n'
    '  <!-- ============ Kopf ============ -->\n'
    '  <section class="projects anim-hero" aria-labelledby="anim-title">\n'
    '    <div class="projects__intro">\n'
    '      <h1 class="projects__title" id="anim-title">Animationen<svg class="px px--heart" aria-hidden="true"><use href="#px-heart" /></svg></h1>\n'
    '      <p class="projects__lede" data-fill>Alle Effekte der vfc-Website an einem Ort: was sie tun, mit welchen Werten – '
    'und pro Effekt ein fertiger Prompt, den du deinem KI-Agenten für die Umsetzung in WordPress gibst.</p>\n'
    '      <div class="anim-hero__actions"><button class="btn btn--ink wave-swap" type="button" data-copy-all '
    'data-label="Alle Prompts kopieren">Alle Prompts kopieren</button></div>\n'
    '    </div>\n'
    f'    <nav class="anim-index" aria-label="Effekte"><ul>{index_links}</ul></nav>\n'
    '  </section>\n\n'
    + anim_item(0, GUIDELINES, guideline=True)
    + "".join(anim_item(i + 1, a) for i, a in enumerate(ANIMATIONS))
    + '</main>\n' + footer
)
(ROOT / "animationen.html").write_text(anim_page, encoding="utf-8")
print("geschrieben: animationen.html", len(ANIMATIONS), "Effekte + Grundregeln")
