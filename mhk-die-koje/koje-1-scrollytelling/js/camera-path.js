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

export const SCROLL_LENGTH_VH = 760; // Länge der Kamerafahrt in vh (zzgl. 100vh Bühne)

// Standard-Positionen der Anker (Blockout-Küche). Ein GLB darf sie überschreiben.
export const ANCHOR_DEFAULTS = {
  anchor_overview:    [-0.6, 1.0, -1.2],
  anchor_spielwand:   [-0.8, 0.48, 0.26],
  anchor_tablet:      [-0.75, 1.1, -2.38],
  anchor_couch:       [-3.44, 0.45, -2.0],
  anchor_staubsauger: [0.62, 0.06, 0.26],
  anchor_licht:       [-0.5, 1.3, -1.4],
};

export const KEYFRAMES = [
  { id: "hero",        anchor: "anchor_overview",    offset: [3.0, 1.25, 6.6],   look: [-0.9, -0.1, 0],   fov: 38, hold: [0.0, 0.03] },
  { id: "spielwand",   anchor: "anchor_spielwand",   offset: [0.7, 0.34, 2.1],   look: [0.12, 0.0, 0],    fov: 48, hold: [0.12, 0.2],  drift: 0.06 },
  { id: "tablet",      anchor: "anchor_tablet",      offset: [1.15, 0.68, 1.15], look: [0, -0.02, 0],     fov: 40, hold: [0.28, 0.36], drift: 0.05 },
  { id: "couch-weit",  anchor: "anchor_couch",       offset: [2.3, 1.15, 3.6],   look: [0.15, 0, 0],      fov: 44, hold: [0.43, 0.46] },
  { id: "couch-nah",   anchor: "anchor_couch",       offset: [0.75, 0.62, 2.05], look: [0.05, -0.1, 0.3], fov: 46, hold: [0.5, 0.57],  drift: 0.05 },
  { id: "via-insel",   anchor: "anchor_staubsauger", offset: [-1.9, 1.1, 3.0],   look: [-0.2, 0.15, 0],   fov: 44, hold: [0.615, 0.615] },
  { id: "staubsauger", anchor: "anchor_staubsauger", offset: [0.62, 0.13, 0.95], look: [-0.05, 0.03, 0],  fov: 46, hold: [0.67, 0.74], drift: 0.05 },
  { id: "licht",       anchor: "anchor_licht",       offset: [3.0, 0.45, 4.1],   look: [0, -0.1, 0],      fov: 42, hold: [0.8, 0.93],  drift: 0.08 },
  { id: "outro",       anchor: "anchor_overview",    offset: [-1.6, 1.5, 6.9],   look: [0.2, -0.05, 0],   fov: 38, hold: [0.985, 1.0] },
];

// Feature-Stationen = Textpanels + Fortschrittsnavigation.
// range:   Bereich, in dem das Panel sichtbar ist.
// jump:    Ziel beim Klick in der Navigation.
// hotspot: Pulsierpunkt, Offset relativ zu anchor_<id>.
export const STATIONS = [
  { id: "spielwand",   range: [0.105, 0.215], jump: 0.16,  hotspot: [0.72, -0.04, 0.02] },
  { id: "tablet",      range: [0.265, 0.375], jump: 0.32,  hotspot: [0, 0.02, 0.06] },
  { id: "couch",       range: [0.415, 0.585], jump: 0.535, hotspot: [0, -0.02, 0.55] },
  { id: "staubsauger", range: [0.655, 0.755], jump: 0.705, hotspot: [0, 0.05, 0.36] },
  { id: "licht",       range: [0.785, 0.945], jump: 0.81,  hotspot: [-0.65, 0.3, 1.15] },
];

// Kleine Bewegungen der Ausstattung, gekoppelt an den Scroll-Fortschritt.
// [start, ende] → 0 … 1. Bei einem GLB werden Animation-Clips gleichen Namens gescrubbt.
export const FEATURE_ANIMS = {
  klappe:  [0.13, 0.185],  // Klappfach der Spielwand öffnet
  tablet:  [0.265, 0.315], // Halterung fährt aus der Arbeitsplatte
  couch:   [0.495, 0.55],  // Sitzfläche wird ausgezogen
  roboter: [0.67, 0.725],  // Saugroboter fährt aus dem Sockel
};

// Lichtstimmungen über den Scroll-Fortschritt. Zwischen zwei Keys wird weich überblendet.
export const LIGHT_KEYS = [
  { at: 0.0,   mood: "tag" },
  { at: 0.79,  mood: "tag" },
  { at: 0.815, mood: "morgen" },
  { at: 0.835, mood: "morgen" },
  { at: 0.86,  mood: "kochen" },
  { at: 0.875, mood: "kochen" },
  { at: 0.9,   mood: "abend" },
  { at: 1.0,   mood: "abend" },
];

// Werte pro Lichtstimmung (Farben als Hex, Intensitäten physikalisch grob).
export const LIGHT_MOODS = {
  tag:    { sun: "#fff1e0", sunI: 1.9, hemiI: 0.42, env: 0.32, led: 0.0, pendant: 0.0, accent: 0.0, bg: "#e9e3da", exposure: 0.95 },
  morgen: { sun: "#ffd9ad", sunI: 2.6, hemiI: 0.45, env: 0.34, led: 0.2, pendant: 0.0, accent: 0.0, bg: "#efe1cf", exposure: 0.98 },
  kochen: { sun: "#e9edf2", sunI: 0.3, hemiI: 0.16, env: 0.13, led: 1.0, pendant: 1.0, accent: 0.2, bg: "#bdb6ac", exposure: 1.05 },
  abend:  { sun: "#8ea3cc", sunI: 0.12, hemiI: 0.07, env: 0.06, led: 0.5, pendant: 0.7, accent: 1.0, bg: "#24201c", exposure: 1.1 },
};
