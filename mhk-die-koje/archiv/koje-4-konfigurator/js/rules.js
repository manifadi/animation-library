// ---------------------------------------------------------------------------
// Regeln: „benötigt“ und „schließt aus“ – erklären statt blockieren.
// Ein Schalter wird immer umgesetzt; abhängige Features werden automatisch
// mitgeschaltet und jede Folgeänderung bekommt eine verständliche Begründung.
// ---------------------------------------------------------------------------

export function applyToggle(features, active, id, on) {
  const byId = Object.fromEntries(features.map((f) => [f.id, f]));
  const next = { ...active };
  const messages = [];
  const changed = new Set();

  function setOn(fid, reason) {
    if (next[fid]) return;
    next[fid] = true;
    changed.add(fid);
    if (reason) messages.push({ id: fid, on: true, text: reason });
    const f = byId[fid];
    // benötigte Features mitnehmen
    for (const r of f.requires || []) {
      if (!next[r.id]) setOn(r.id, r.reason);
    }
    // eigene Ausschlüsse
    for (const x of f.excludes || []) {
      if (next[x.id]) setOff(x.id, x.reason);
    }
    // Ausschlüsse anderer aktiver Features, die dieses Feature betreffen
    for (const other of features) {
      if (!next[other.id] || other.id === fid) continue;
      const rule = (other.excludes || []).find((x) => x.id === fid);
      if (rule) {
        const back = (f.excludes || []).find((x) => x.id === other.id);
        setOff(other.id, back?.reason || rule.reason);
      }
    }
  }

  function setOff(fid, reason) {
    if (!next[fid]) return;
    next[fid] = false;
    changed.add(fid);
    if (reason) messages.push({ id: fid, on: false, text: reason });
    // Features, die dieses benötigen, entfallen ebenfalls
    for (const other of features) {
      if (!next[other.id]) continue;
      const req = (other.requires || []).find((r) => r.id === fid);
      if (req) setOff(other.id, req.reasonOff || `${other.name} benötigt ${byId[fid].name} und entfällt deshalb ebenfalls.`);
    }
  }

  if (on) setOn(id);
  else setOff(id);
  return { active: next, messages, changed: [...changed] };
}

// Sammelt die Regeln eines Features für die statische Anzeige („Benötigt: …“).
export function describeRules(feature, features) {
  const name = (id) => features.find((f) => f.id === id)?.name || id;
  const parts = [];
  if (feature.requires?.length) parts.push(`Benötigt: ${feature.requires.map((r) => name(r.id)).join(", ")}`);
  if (feature.excludes?.length) parts.push(`Nicht zusammen mit: ${feature.excludes.map((x) => name(x.id)).join(", ")}`);
  return parts.join(" · ");
}
