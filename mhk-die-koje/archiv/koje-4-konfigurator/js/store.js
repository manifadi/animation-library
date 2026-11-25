// Ein einziger Store für den gesamten Zustand – Vanilla Pub/Sub.
// state = { active: {id: bool}, variants: {id: variantId}, profile, view, focus, notice }
export function createStore(initial) {
  let state = initial;
  const subs = new Set();
  return {
    get: () => state,
    set(update, meta = {}) {
      const prev = state;
      state = { ...state, ...(typeof update === "function" ? update(state) : update) };
      subs.forEach((fn) => fn(state, prev, meta));
    },
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
  };
}

// ---------- Konfiguration <-> URL-Hash ----------
// Format: #k=couch.3,spielwand,licht.ambiente&p=kochen.familie,kinder.ja
// Features ohne Eintrag sind aus. "#k=" (leer) = alles aus.
export function encodeConfig({ active, variants, profile }, features) {
  const k = features
    .filter((f) => active[f.id])
    .map((f) => (f.variants && variants[f.id] ? `${f.id}.${variants[f.id]}` : f.id))
    .join(",");
  const p = profile ? Object.entries(profile).map(([q, a]) => `${q}.${a}`).join(",") : "";
  return `k=${k}${p ? `&p=${p}` : ""}`;
}

export function decodeConfig(hash, features) {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  if (!params.has("k")) return null;
  const byId = Object.fromEntries(features.map((f) => [f.id, f]));
  const active = Object.fromEntries(features.map((f) => [f.id, false]));
  const variants = Object.fromEntries(features.filter((f) => f.variants).map((f) => [f.id, f.defaultVariant]));
  for (const token of params.get("k").split(",").filter(Boolean)) {
    const [id, v] = token.split(".");
    if (!byId[id]) continue;
    active[id] = true;
    if (v && byId[id].variants?.some((x) => x.id === v)) variants[id] = v;
  }
  let profile = null;
  if (params.get("p")) {
    profile = {};
    for (const token of params.get("p").split(",")) {
      const [q, a] = token.split(".");
      if (q && a) profile[q] = a;
    }
  }
  return { active, variants, profile };
}
