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
export function cameraPose(feature, progress, geometry) {
  const p = clamp(progress);
  const { width, height, stageWidth, stageHeight, top, mobile } = geometry;
  const [endYaw, endPitch, endScale, depth] = feature.view;
  const yaw = endYaw * p * (mobile ? .65 : 1);
  const pitch = endPitch * p + Math.sin(Math.PI * p) * 1.4;
  const scale = 1 + ((mobile ? 1.55 : endScale) - 1) * p;
  const perspective = Math.max(1200, width * 1.4);
  const unit = width / 1200;
  const point = {
    x: (feature.focus[0] / 100 - .5) * width,
    y: (feature.focus[1] / 100 - .5) * height,
    z: depth * unit * p,
  };
  const projected = projectPoint(point, yaw, pitch, scale, perspective);
  const center = { x: stageWidth / 2, y: top + height / 2 };
  const target = { x: stageWidth * (mobile ? .5 : .35), y: stageHeight * (mobile ? .32 : .52) };
  const arc = Math.sin(Math.PI * p);
  const desired = {
    x: center.x + point.x + (target.x - center.x - point.x) * p + arc * width * .025 * Math.sign(endYaw),
    y: center.y + point.y + (target.y - center.y - point.y) * p - arc * height * .025,
  };
  return {
    x: desired.x - center.x - projected.x,
    y: desired.y - center.y - projected.y,
    yaw, pitch, scale, perspective, unit,
    action: smootherstep((p - .25) / .75),
    secondary: smootherstep((p - .55) / .45),
  };
}
