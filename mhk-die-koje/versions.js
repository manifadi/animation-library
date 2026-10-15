// Die Versionen der Landing Page „Die Koje“, wie sie auf der Startseite gelistet werden.
// `slug` = Ordnername in mhk-die-koje/. Einträge ohne `slug` erscheinen als
// „In Planung“ und sind nicht verlinkt. `cost` ist der geschätzte Aufwand.
// Nicht gelistet, aber weiterhin im Repo: koje-2-hotspot-image,
// koje-3-live-ausprobieren, koje-4-konfigurator.
window.KOJE_VERSIONS = [
  {
    slug: "koje-6-video-scrollytelling",
    title: "Scrollytelling mit Hintergrund-Videos",
    short: "Videos statt 3D",
    cost: "~5.000 €",
    description: "Hero mit Headline, danach führt die Seite Feature für Feature durch die Koje. Im Hintergrund läuft jeweils ein Video-Snippet aus dem Werbespot, davor Headline, Text und „Termin vereinbaren“.",
    features: ["Neun Feature-Snippets aus dem Werbespot", "Scroll-Reveals für Texte", "Ohne 3D, ohne Abhängigkeiten"],
    thumbnail: "assets/thumbnail.jpg",
  },
  {
    slug: "koje-1-scrollytelling",
    title: "3D Scrollytelling",
    short: "Kamerafahrt in 3D",
    cost: "~12.000 €",
    description: "Wie auf einer Apple-Produktseite: Beim Scrollen fährt die Kamera durch die Koje und hält an neun Features. Ein markanter Hotspot öffnet ein Seitenpanel mit Beschreibung und Video.",
    features: ["Vorgerenderte Kamerafahrt, per Scroll abgespielt", "Neun Feature-Hotspots", "Seitenpanel mit Video und Ton"],
    thumbnail: "assets/thumbnail.jpg",
  },
  {
    slug: "koje-5-licht-an-feature-tour",
    title: "Licht an. Küche entdecken.",
    short: "Interaktiver Rundgang",
    cost: "~12.000 €",
    description: "Die Seite startet schwarz, dann geht das Licht an. Ein interaktiver Rundgang mit räumlichen Kamerafahrten zeigt jedes Feature im Detail, am Ende läuft das Werbevideo.",
    features: ["Licht-an-Auftakt", "Sieben Hotspots mit Kamerafahrten", "Werbevideo eingebunden"],
    thumbnail: "assets/thumbnail.jpg",
  },
];
