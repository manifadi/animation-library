// ---------------------------------------------------------------------------
// Ziehbares Element (Schublade, Sockelfach, Couch) mit glaubwürdiger Physik:
//   • Masse:          das Element folgt dem Finger leicht verzögert
//   • Widerstand:     dragResistance + Gummiband über den Anschlag hinaus
//   • Einrasten:      Wurf/Zug über 85 % → fährt ganz auf und rastet mit „Klack“ ein
//   • Selbsteinzug:   unter 30 % losgelassen → zieht sich gedämpft selbst zu
//   • dazwischen:     gleitet mit Trägheit aus und bleibt stehen
// Bedienung: Ziehen (Maus/Touch), Klick/Tap = auf/zu, Enter/Leertaste = auf/zu,
// Pfeiltasten ↓/↑ verschieben in 20-%-Schritten.
// ---------------------------------------------------------------------------
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

const SNAP_AT = 0.85;
const SELF_CLOSE_BELOW = 0.3;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const haptic = (ms) => navigator.vibrate?.(ms);

export function makePullable({ el, travel, render, sound, reduceMotion, onInteract, onOpen, onClose, labels }) {
  const state = { p: 0 };
  let isOpen = false;
  let pxTravel = travel;
  let samples = [];
  let touchInput = false;
  let goal = 0; // Ziel der laufenden Animation (für Tastatur-Schritte)

  const dur = (d) => (reduceMotion() ? 0 : d);
  const draw = () => render(state.p);

  const proxy = document.createElement("div");
  proxy.style.cssText = "position:absolute;left:0;top:0;width:1px;height:1px;visibility:hidden;pointer-events:none";
  document.body.append(proxy);

  function setAria() {
    const open = state.p > 0.5;
    el.setAttribute("aria-pressed", String(open));
    el.setAttribute("aria-label", open ? labels.close : labels.open);
  }

  function settle(target) {
    if (target >= 1 && !isOpen) {
      isOpen = true;
      sound.snap();
      if (touchInput) haptic(12);
      onOpen?.();
    } else if (target <= 0 && isOpen) {
      isOpen = false;
      onClose?.();
    } else if (target <= 0) {
      onClose?.();
    }
    setAria();
  }

  function animateTo(target, kind) {
    gsap.killTweensOf(state);
    goal = target;
    const dist = Math.abs(target - state.p);
    const vars = {
      snap: { duration: dur(0.28 + dist * 0.35), ease: "back.out(1.5)" },     // Einrasten mit leichtem Nachfedern
      selfclose: { duration: dur(0.55 + dist * 0.7), ease: "power4.out" },    // Dämpfer: schnell an, sanft zu
      glide: { duration: dur(0.35 + dist * 0.6), ease: "power3.out" },        // Trägheit
    }[kind];
    if (kind === "selfclose") sound.softClose(vars.duration || 0.3);
    gsap.to(state, {
      p: target,
      ...vars,
      onUpdate: draw,
      onComplete: () => {
        if (kind === "selfclose" && touchInput) haptic(6);
        settle(target);
      },
    });
  }

  function decide(projected) {
    if (projected >= SNAP_AT) animateTo(1, "snap");
    else if (projected <= SELF_CLOSE_BELOW) animateTo(0, "selfclose");
    else animateTo(clamp(projected, SELF_CLOSE_BELOW + 0.02, SNAP_AT - 0.02), "glide");
  }

  function toggle() {
    onInteract?.();
    if (state.p > 0.5) animateTo(0, "selfclose");
    else {
      sound.motor?.(0.25);
      animateTo(1, "snap");
    }
  }

  Draggable.create(proxy, {
    trigger: el,
    type: "y",
    minimumMovement: 4,
    dragResistance: 0.06,
    edgeResistance: 0.82,
    allowNativeTouchScrolling: true,
    onPress(e) {
      touchInput = e.pointerType === "touch" || e.type?.startsWith("touch");
      gsap.killTweensOf(state);
      const scale = el.ownerSVGElement.getScreenCTM()?.d || 1;
      pxTravel = travel * scale;
      gsap.set(proxy, { y: state.p * pxTravel });
      this.applyBounds({ minY: 0, maxY: pxTravel });
      this.update();
      samples = [];
    },
    onDragStart() {
      onInteract?.();
      el.classList.add("is-dragging");
      sound.slideStart();
    },
    onDrag() {
      const raw = clamp(this.y / pxTravel, -0.05, 1.12);
      const now = performance.now();
      samples.push([now, raw]);
      samples = samples.filter(([t]) => now - t < 120);
      const speed = samples.length > 1 ? (raw - samples[0][1]) / ((now - samples[0][0]) / 1000) : 0;
      sound.slideSpeed(speed * 0.35);
      // Masse: kurze Verzögerung statt 1:1-Kopplung
      goal = raw;
      gsap.to(state, { p: raw, duration: 0.14, ease: "power2.out", overwrite: true, onUpdate: draw });
    },
    onDragEnd() {
      el.classList.remove("is-dragging");
      sound.slideStop();
      const now = performance.now();
      const recent = samples.filter(([t]) => now - t < 120);
      const v = recent.length > 1 ? (recent.at(-1)[1] - recent[0][1]) / ((recent.at(-1)[0] - recent[0][0]) / 1000 || 1) : 0;
      const current = recent.at(-1)?.[1] ?? state.p;
      decide(current + clamp(v, -6, 6) * 0.16);
    },
    onClick() {
      toggle();
    },
  });

  // Touch: vertikale Gesten gehören dem Auszug, horizontale bleiben Scrollen.
  // (touch-action wird auf SVG-Gruppen nicht überall beachtet.)
  let touchStart = null;
  let axis = null;
  el.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    touchStart = { x: t.clientX, y: t.clientY };
    axis = null;
  }, { passive: true });
  el.addEventListener("touchmove", (e) => {
    if (!touchStart) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    if (!axis && Math.hypot(dx, dy) > 3) axis = Math.abs(dy) > Math.abs(dx) ? "y" : "x";
    if (axis === "y" && e.cancelable) e.preventDefault();
  }, { passive: false });
  el.addEventListener("touchend", () => (touchStart = null));

  el.addEventListener("keydown", (e) => {
    touchInput = false;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      onInteract?.();
      const delta = e.key === "ArrowDown" ? 0.2 : -0.2;
      const target = clamp(goal + delta, 0, 1);
      if (target >= SNAP_AT) animateTo(1, "snap");
      else if (delta < 0 && target <= SELF_CLOSE_BELOW) animateTo(0, "selfclose");
      else animateTo(target, "glide");
    }
  });

  draw();
  setAria();

  return {
    state,
    toggle,
    get isOpen() { return state.p > 0.5; },
    reset() {
      if (state.p > 0.001) animateTo(0, "selfclose");
    },
  };
}
