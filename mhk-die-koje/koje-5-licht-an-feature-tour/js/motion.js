export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

// Zero velocity and acceleration at both ends: no kick or hard stop.
export function smootherstep(value) {
  const t = clamp(value);
  return clamp(t * t * t * (t * (t * 6 - 15) + 10));
}

export function projectPoint(point, yaw, pitch, scale, perspective) {
  const ry = yaw * Math.PI / 180;
  const rx = pitch * Math.PI / 180;
  const x = (point.x * Math.cos(ry) + point.z * Math.sin(ry)) * scale;
  const z = (-point.x * Math.sin(ry) + point.z * Math.cos(ry)) * scale;
  const y = point.y * scale * Math.cos(rx) - z * Math.sin(rx);
  const depth = point.y * scale * Math.sin(rx) + z * Math.cos(rx);
  const factor = perspective / (perspective - depth);
  return { x: x * factor, y: y * factor };
}

// One continuous, reversible path for the camera, scene layers and feature action.
// Kamerafahrt: kurzes Ausholen (leichter Zoom zurück), dann ein Bogen mit
// Neigung in der Kurve (roll) und ein Dolly-Effekt über die Perspektive.
// Roll und Ausholen sind am Ziel exakt null, damit der Fokuspunkt sitzt.
export function cameraPose(feature, progress, geometry) {
  const p = clamp(progress);
  const { width, height, stageWidth, stageHeight, top, mobile } = geometry;
  const [endYaw, endPitch, endScale, depth] = feature.view;
  const dir = Math.sign(endYaw) || 1;
  const arc = Math.sin(Math.PI * p);
  const settle = (p + smootherstep(p)) / 2; // etwas weicher an den Enden
  const yaw = endYaw * settle * (mobile ? .65 : 1) + arc * dir * 3;
  const pitch = endPitch * settle + arc * 2.4;
  const roll = arc * -dir * (mobile ? 1.2 : 2.2) * (1 - p);
  const windup = .07 * Math.sin(Math.PI * clamp(p / .4)) * (1 - p);
  const scale = 1 + ((mobile ? 1.55 : endScale) - 1) * settle - windup;
  const perspective = Math.max(900, width * (1.6 - .4 * settle));
  const unit = width / 1200;
  const point = {
    x: (feature.focus[0] / 100 - .5) * width,
    y: (feature.focus[1] / 100 - .5) * height,
    z: depth * unit * p,
  };
  const projected = projectPoint(point, yaw, pitch, scale, perspective);
  const center = { x: stageWidth / 2, y: top + height / 2 };
  const target = { x: stageWidth * (mobile ? .5 : .35), y: stageHeight * (mobile ? .32 : .52) };
  const desired = {
    x: center.x + point.x + (target.x - center.x - point.x) * settle + arc * width * .05 * dir,
    y: center.y + point.y + (target.y - center.y - point.y) * settle - arc * height * .04,
  };
  return {
    x: desired.x - center.x - projected.x,
    y: desired.y - center.y - projected.y,
    yaw, pitch, roll, scale, perspective, unit,
    action: smootherstep((p - .25) / .75),
    secondary: smootherstep((p - .55) / .45),
  };
}
