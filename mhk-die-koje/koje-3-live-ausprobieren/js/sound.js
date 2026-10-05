// ---------------------------------------------------------------------------
// Synthetische Sounds per Web Audio API – keine Audiodateien nötig.
// Standardmäßig AUS; der AudioContext entsteht erst beim Einschalten (Autoplay-Regeln).
// ---------------------------------------------------------------------------

export class Sound {
  constructor() {
    this.enabled = false;
    this.ctx = null;
    this.mood = null;
    this.ambient = null;
    this.ambientLevel = 1;
  }

  async enable() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.7;
      this.master.connect(this.ctx.destination);
      // 2 s weißes Rauschen als Quelle für Klack, Gleiten, Rauschen
      const len = this.ctx.sampleRate * 2;
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    await this.ctx.resume();
    this.enabled = true;
    if (this.mood) this.setMood(this.mood, true);
    return true;
  }

  disable() {
    this.enabled = false;
    this.stopAmbient(0.3);
    this.slideStop();
  }

  get t() { return this.ctx.currentTime; }

  env(node, peak, attack, decay, start = this.t) {
    node.gain.setValueAtTime(0.0001, start);
    node.gain.exponentialRampToValueAtTime(peak, start + attack);
    node.gain.exponentialRampToValueAtTime(0.0001, start + attack + decay);
  }

  noiseSource(loop = false) {
    const s = this.ctx.createBufferSource();
    s.buffer = this.noise;
    s.loop = loop;
    return s;
  }

  // Kurzes, sanftes „Klack“: gefiltertes Rauschen + tiefer Körper
  klack(strength = 1, when = 0) {
    if (!this.enabled) return;
    const t = this.t + when;
    const n = this.noiseSource();
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 1900; bp.Q.value = 1.6;
    const g = this.ctx.createGain();
    this.env(g, 0.28 * strength, 0.002, 0.05, t);
    n.connect(bp).connect(g).connect(this.master);
    n.start(t); n.stop(t + 0.1);
    this.thump(0.18 * strength, 150, when);
  }

  thump(peak = 0.2, freq = 95, when = 0) {
    if (!this.enabled) return;
    const t = this.t + when;
    const o = this.ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 0.6, t + 0.15);
    const g = this.ctx.createGain();
    this.env(g, peak, 0.004, 0.16, t);
    o.connect(g).connect(this.master);
    o.start(t); o.stop(t + 0.25);
  }

  // Weiches Einrasten: zwei leise Klicks + Körper
  snap() {
    this.klack(0.8);
    this.klack(0.45, 0.045);
  }

  // Selbsteinzug: leises Ausgleiten, am Ende gedämpfter Anschlag
  softClose(duration = 0.8) {
    if (!this.enabled) return;
    const t = this.t;
    const n = this.noiseSource();
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(900, t);
    lp.frequency.exponentialRampToValueAtTime(250, t + duration);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.06, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    n.connect(lp).connect(g).connect(this.master);
    n.start(t); n.stop(t + duration + 0.05);
    this.thump(0.14, 80, duration * 0.9);
  }

  // Gedämpftes Gleiten während des Ziehens – Lautstärke folgt der Geschwindigkeit
  slideStart() {
    if (!this.enabled || this.slide) return;
    const n = this.noiseSource(true);
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 650;
    const g = this.ctx.createGain();
    g.gain.value = 0.0001;
    n.connect(lp).connect(g).connect(this.master);
    n.start();
    this.slide = { n, g, lp };
  }

  slideSpeed(speed) {
    if (!this.slide) return;
    const v = Math.min(1, Math.abs(speed));
    this.slide.g.gain.setTargetAtTime(0.0001 + v * 0.09, this.t, 0.04);
    this.slide.lp.frequency.setTargetAtTime(450 + v * 700, this.t, 0.05);
  }

  slideStop() {
    if (!this.slide) return;
    const { n, g } = this.slide;
    g.gain.setTargetAtTime(0.0001, this.t, 0.05);
    n.stop(this.t + 0.3);
    this.slide = null;
  }

  // Ausfahren (Tablet-Arm, Couch): kurzer Motor-Ton
  motor(duration = 0.6) {
    if (!this.enabled) return;
    const t = this.t;
    const o = this.ctx.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(110, t);
    o.frequency.linearRampToValueAtTime(150, t + duration);
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 500;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.035, t + 0.08);
    g.gain.setValueAtTime(0.035, t + duration - 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    o.connect(lp).connect(g).connect(this.master);
    o.start(t); o.stop(t + duration + 0.05);
  }

  // Kreide auf Tafel
  chalk(speed) {
    if (!this.enabled) return;
    const t = this.t;
    const n = this.noiseSource();
    const hp = this.ctx.createBiquadFilter();
    hp.type = "bandpass"; hp.frequency.value = 3200; hp.Q.value = 0.8;
    const g = this.ctx.createGain();
    this.env(g, Math.min(0.05, 0.01 + speed * 0.04), 0.004, 0.05, t);
    n.connect(hp).connect(g).connect(this.master);
    n.start(t, Math.random()); n.stop(t + 0.08);
  }

  pluck(freq, when = 0, peak = 0.12) {
    if (!this.enabled) return;
    const t = this.t + when;
    const o = this.ctx.createOscillator();
    o.type = "sine"; o.frequency.value = freq;
    const g = this.ctx.createGain();
    this.env(g, peak, 0.005, 0.5, t);
    o.connect(g).connect(this.master);
    o.start(t); o.stop(t + 0.6);
  }

  fanfare() {
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => this.pluck(f, i * 0.09, 0.1));
  }

  timerDone() {
    [880, 880, 1174.7].forEach((f, i) => this.pluck(f, i * 0.18, 0.08));
  }

  // ---------- Ambient pro Lichtstimmung ----------
  setMood(mood, force = false) {
    const changed = mood !== this.mood;
    this.mood = mood;
    if (!this.enabled || (!changed && !force)) return;
    this.stopAmbient(1.2);
    this.ambient = this.buildAmbient(mood);
  }

  setAmbientLevel(v) {
    this.ambientLevel = v;
    if (this.ambient) this.ambient.out.gain.setTargetAtTime(this.ambient.base * (0.4 + v * 0.6), this.t, 0.3);
  }

  buildAmbient(mood) {
    const ctx = this.ctx;
    const out = ctx.createGain();
    out.gain.value = 0.0001;
    out.connect(this.master);
    const nodes = [];
    const lfo = (target, rate, depth) => {
      const l = ctx.createOscillator();
      l.frequency.value = rate;
      const lg = ctx.createGain();
      lg.gain.value = depth;
      l.connect(lg).connect(target);
      l.start();
      nodes.push(l);
    };
    const tone = (freq, type, gain) => {
      const o = ctx.createOscillator();
      o.type = type; o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = gain;
      lfo(g.gain, 0.08 + Math.random() * 0.1, gain * 0.5);
      o.connect(g).connect(out);
      o.start();
      nodes.push(o);
    };
    const hiss = (type, freq, gain) => {
      const n = this.noiseSource(true);
      const f = ctx.createBiquadFilter();
      f.type = type; f.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = gain;
      lfo(g.gain, 0.3, gain * 0.6);
      n.connect(f).connect(g).connect(out);
      n.start();
      nodes.push(n);
    };
    let base = 1;
    let chirp = null;
    if (mood === "morgen") {
      [523.25, 659.25, 783.99].forEach((f) => tone(f, "sine", 0.01));
      base = 0.9;
      // vereinzelte „Vogel“-Zwitscherer
      const tweet = () => {
        if (!this.enabled || this.mood !== "morgen") return;
        const t = this.t;
        for (let i = 0; i < 2; i++) {
          const o = ctx.createOscillator();
          o.frequency.setValueAtTime(2600, t + i * 0.12);
          o.frequency.exponentialRampToValueAtTime(3400, t + i * 0.12 + 0.06);
          const g = ctx.createGain();
          this.env(g, 0.015, 0.01, 0.06, t + i * 0.12);
          o.connect(g).connect(out);
          o.start(t + i * 0.12); o.stop(t + i * 0.12 + 0.1);
        }
        chirp = setTimeout(tweet, 3500 + Math.random() * 4000);
      };
      chirp = setTimeout(tweet, 1500);
    } else if (mood === "kochen") {
      hiss("lowpass", 380, 0.05);
      hiss("highpass", 5200, 0.008);
      tone(100, "sine", 0.008);
      base = 1;
    } else {
      [110, 164.81, 196, 246.94].forEach((f) => tone(f, "triangle", 0.009));
      base = 1;
    }
    out.gain.setTargetAtTime(base * (0.4 + this.ambientLevel * 0.6), this.t, 0.8);
    return { out, nodes, base, stopChirp: () => clearTimeout(chirp) };
  }

  stopAmbient(fade = 1) {
    const a = this.ambient;
    if (!a || !this.ctx) return;
    this.ambient = null;
    a.stopChirp();
    a.out.gain.setTargetAtTime(0.0001, this.t, fade / 3);
    setTimeout(() => {
      a.nodes.forEach((n) => { try { n.stop(); } catch { /* bereits gestoppt */ } });
      a.out.disconnect();
    }, fade * 1000 + 200);
  }
}
