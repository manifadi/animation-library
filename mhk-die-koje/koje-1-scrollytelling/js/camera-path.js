// ---------------------------------------------------------------------------
// Kamerapfad der Koje – hier wird die komplette Kamerafahrt definiert.
//
// Jeder Keyframe hängt an einem benannten Anker (Empty-Objekt in der Szene).
// Kamera-Position und Blickpunkt sind OFFSETS relativ zu diesem Anker. Wird
// später ein echtes 3D-Modell geladen, das Empties mit denselben Namen
// enthält, wandert die Kamera automatisch mit – der Pfad bleibt gültig.
//
//   anchor   Name des Anker-Objekts (siehe ANCHOR_DEFAULTS bzw. GLB)
//   offset   Kamera-Position = Anker + offset          [x, y, z] in Metern
//   look     Blickpunkt      = Anker + look            [x, y, z] in Metern
//   fov      vertikales Sichtfeld in Grad
//   hold     [von, bis] – Scroll-Fortschritt (0–1), in dem die Kamera an
//            diesem Keyframe stehen bleibt. von === bis → reiner Wegpunkt
//            ("via"), durch den die Kamera ohne Halt fährt.
//   drift    optional: leichtes Nachschieben während des Halts (0–1)
//
// Zwischen zwei Halte-Keyframes wird über alle dazwischenliegenden Wegpunkte
// mit einer CatmullRom-Kurve interpoliert und mit "power2.inOut" ge-eased.
// ---------------------------------------------------------------------------

export const SCROLL_LENGTH_VH = 1150; // Länge der Kamerafahrt in vh (zzgl. 100vh Bühne)

// Standard-Positionen der Anker (Blockout-Küche). Ein GLB darf sie überschreiben.
export const ANCHOR_DEFAULTS = {
  anchor_overview:    [-0.6, 1.0, -1.2],
  anchor_schubladen:  [-0.05, 0.78, -1.98],
  anchor_heisswasser: [-1.16, 1.12, -2.42],
  anchor_ofen:        [1.85, 1.21, -1.96],
  anchor_licht:       [-0.5, 0.6, -1.0],
  anchor_futternapf:  [-2.15, 0.06, -1.95],
  anchor_spielwand:   [-0.8, 0.48, 0.26],
  anchor_zapfhahn:    [0.66, 1.08, -0.12],
  anchor_staubsauger: [0.62, 0.06, 0.26],
  anchor_couch:       [-3.44, 0.45, -2.0],
};

export const KEYFRAMES = [
  { id: "hero",        anchor: "anchor_overview",    offset: [3.0, 1.25, 6.6],   look: [-0.9, -0.1, 0],    fov: 38, hold: [0.0, 0.03] },
  { id: "schubladen",  anchor: "anchor_schubladen",  offset: [0.55, 0.72, 1.6],  look: [0, -0.12, 0],      fov: 46, hold: [0.08, 0.13],  drift: 0.05 },
  { id: "heisswasser", anchor: "anchor_heisswasser", offset: [0.6, 0.36, 1.3],   look: [0, -0.12, 0],      fov: 44, hold: [0.18, 0.23],  drift: 0.05 },
  { id: "ofen",        anchor: "anchor_ofen",        offset: [-0.55, 0.12, 1.6], look: [0, -0.05, 0],      fov: 44, hold: [0.28, 0.33],  drift: 0.05 },
  { id: "licht",       anchor: "anchor_licht",       offset: [2.8, 1.0, 4.6],    look: [0, 0, 0],          fov: 42, hold: [0.38, 0.45],  drift: 0.06 },
  { id: "via-futter",  anchor: "anchor_futternapf",  offset: [-0.75, 1.14, 3.15], look: [0.1, 0, 0],       fov: 44, hold: [0.48, 0.48] },
  { id: "futternapf",  anchor: "anchor_futternapf",  offset: [-0.32, 0.6, 1.45], look: [0.05, 0, 0.12],    fov: 46, hold: [0.51, 0.56],  drift: 0.05 },
  { id: "via-links",   anchor: "anchor_spielwand",   offset: [-1.9, 0.6, 1.6],   look: [0.3, 0, 0],        fov: 46, hold: [0.595, 0.595] },
  { id: "spielwand",   anchor: "anchor_spielwand",   offset: [0.7, 0.34, 2.1],   look: [0.12, 0.0, 0],     fov: 48, hold: [0.63, 0.68],  drift: 0.06 },
  { id: "zapfhahn",    anchor: "anchor_zapfhahn",    offset: [0.3, 0.32, 1.25],  look: [0, -0.06, 0],      fov: 44, hold: [0.73, 0.77],  drift: 0.05 },
  { id: "staubsauger", anchor: "anchor_staubsauger", offset: [0.62, 0.13, 0.95], look: [-0.05, 0.03, 0],   fov: 46, hold: [0.81, 0.85],  drift: 0.05 },
  { id: "couch-weit",  anchor: "anchor_couch",       offset: [2.3, 1.15, 3.6],   look: [0.15, 0, 0],       fov: 44, hold: [0.885, 0.895] },
  { id: "couch",       anchor: "anchor_couch",       offset: [0.75, 0.62, 2.05], look: [0.05, -0.1, 0.3],  fov: 46, hold: [0.91, 0.95],  drift: 0.05 },
  { id: "outro",       anchor: "anchor_overview",    offset: [-1.6, 1.5, 6.9],   look: [0.2, -0.05, 0],    fov: 38, hold: [0.985, 1.0] },
];

// Feature-Stationen = Hotspot + Seitenpanel + Fortschrittsnavigation.
// range:   Bereich, in dem der Hotspot sichtbar ist.
// jump:    Ziel beim Klick in der Navigation.
// hotspot: Position des Hotspots, Offset relativ zu anchor_<id>.
export const STATIONS = [
  { id: "schubladen",  range: [0.075, 0.135], jump: 0.11,  hotspot: [0, 0.0, 0.25] },
  { id: "heisswasser", range: [0.175, 0.235], jump: 0.21,  hotspot: [0.2, 0.0, 0.06] },
  { id: "ofen",        range: [0.275, 0.335], jump: 0.31,  hotspot: [0, 0, 0.02] },
  { id: "licht",       range: [0.375, 0.455], jump: 0.42,  hotspot: [0.5, 0.28, 1.3] },
  { id: "futternapf",  range: [0.505, 0.565], jump: 0.54,  hotspot: [0, 0.06, 0.38] },
  { id: "spielwand",   range: [0.625, 0.685], jump: 0.66,  hotspot: [0.2, 0.1, 0.02] },
  { id: "zapfhahn",    range: [0.725, 0.775], jump: 0.755, hotspot: [-0.16, 0.12, 0] },
  { id: "staubsauger", range: [0.805, 0.855], jump: 0.835, hotspot: [0, 0.05, 0.36] },
  { id: "couch",       range: [0.905, 0.955], jump: 0.935, hotspot: [0, -0.02, 0.55] },
];

// Kleine Bewegungen der Ausstattung, gekoppelt an den Scroll-Fortschritt.
// [start, ende] → 0 … 1. Bei einem GLB werden Animation-Clips gleichen Namens gescrubbt.
export const FEATURE_ANIMS = {
  schublade: [0.07, 0.14],   // Schublade öffnet und gleitet sanft wieder zu
  wasser:    [0.17, 0.24],   // Heißwasser läuft, Dampf steigt auf
  ofen:      [0.265, 0.33],  // Backofen glüht
  rgb:       [0.37, 0.46],   // Farbwechsel der LED-Bänder
  napf:      [0.5, 0.6],     // Napf-Schublade fährt aus dem Sockel und wieder ein
  klappe:    [0.62, 0.67],   // Klappfach der Spielwand öffnet
  zapfhahn:  [0.72, 0.775],  // Hebel kippt, Glas füllt sich
  roboter:   [0.80, 0.845],  // Saugroboter fährt aus dem Sockel
  couch:     [0.9, 0.94],    // Sitzfläche wird ausgezogen
};

// Lichtstimmungen über den Scroll-Fortschritt. Zwischen zwei Keys wird weich überblendet.
export const LIGHT_KEYS = [
  { at: 0.0,   mood: "tag" },
  { at: 0.35,  mood: "tag" },
  { at: 0.385, mood: "party" },
  { at: 0.45,  mood: "party" },
  { at: 0.49,  mood: "tag" },
  { at: 0.96,  mood: "tag" },
  { at: 1.0,   mood: "abend" },
];

// Werte pro Lichtstimmung (Farben als Hex, Intensitäten physikalisch grob).
export const LIGHT_MOODS = {
  tag:    { sun: "#fff1e0", sunI: 1.9, hemiI: 0.42, env: 0.32, led: 0.0, pendant: 0.0, accent: 0.0, bg: "#e9e3da", exposure: 0.95 },
  morgen: { sun: "#ffd9ad", sunI: 2.6, hemiI: 0.45, env: 0.34, led: 0.2, pendant: 0.0, accent: 0.0, bg: "#efe1cf", exposure: 0.98 },
  kochen: { sun: "#e9edf2", sunI: 0.3, hemiI: 0.16, env: 0.13, led: 1.0, pendant: 1.0, accent: 0.2, bg: "#bdb6ac", exposure: 1.05 },
  party:  { sun: "#6d7fb0", sunI: 0.14, hemiI: 0.07, env: 0.06, led: 0.0, pendant: 0.0, accent: 0.0, bg: "#1c1a22", exposure: 1.1 },
  abend:  { sun: "#8ea3cc", sunI: 0.12, hemiI: 0.07, env: 0.06, led: 0.5, pendant: 0.7, accent: 1.0, bg: "#24201c", exposure: 1.1 },
};
