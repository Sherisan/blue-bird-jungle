/**
 * Tiny Web Audio sound kit. Everything is synthesised, so there are no audio
 * files to ship. Browsers only allow audio after a click, so call unlock()
 * from the sound toggle.
 */
export class SoundFx {
  private ctx: AudioContext | null = null;
  private noise: AudioBuffer | null = null;
  private master: GainNode | null = null;
  private volume = 0.8;
  private ambient: { src: AudioBufferSourceNode; gain: GainNode; timer: number } | null = null;

  /** Everything plays through one master gain so the volume slider controls it all. */
  private get out(): AudioNode {
    return this.master ?? this.ctx!.destination;
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
  }

  /** A low waterfall rumble with crickets and the odd distant bird call. */
  startAmbient() {
    const ctx = this.ctx;
    if (!ctx || this.ambient) return;
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      d[i] = last * 3.5;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 520;
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    gain.gain.setTargetAtTime(0.12, ctx.currentTime, 0.8);
    src.connect(lp).connect(gain).connect(this.out);
    src.start();
    const timer = window.setInterval(() => {
      if (Math.random() < 0.7) this.cricket(gain);
      if (Math.random() < 0.08) this.distantCall(gain);
    }, 900);
    this.ambient = { src, gain, timer };
  }

  stopAmbient() {
    const a = this.ambient;
    if (!a || !this.ctx) return;
    window.clearInterval(a.timer);
    a.gain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.3);
    a.src.stop(this.ctx.currentTime + 1.2);
    this.ambient = null;
  }

  private cricket(bus: AudioNode) {
    const ctx = this.ctx!;
    const t0 = ctx.currentTime + Math.random() * 0.4;
    for (let k = 0; k < 3; k++) {
      const t = t0 + k * 0.05;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 4300 + Math.random() * 300;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.05, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
      o.connect(g).connect(bus);
      o.start(t);
      o.stop(t + 0.04);
    }
  }

  private distantCall(bus: AudioNode) {
    const ctx = this.ctx!;
    const t = ctx.currentTime + 0.1;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(1700, t);
    o.frequency.exponentialRampToValueAtTime(2600, t + 0.18);
    o.frequency.exponentialRampToValueAtTime(1900, t + 0.32);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + 0.36);
  }

  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
      const len = this.ctx.sampleRate * 0.6;
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    void this.ctx.resume();
  }

  /** Net launcher: a deep pneumatic thump followed by a rising whoosh. */
  netShot() {
    const ctx = this.ctx;
    if (!ctx || !this.noise) return;
    const t = ctx.currentTime;

    const o = ctx.createOscillator();
    const og = ctx.createGain();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.18);
    og.gain.setValueAtTime(0.8, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    o.connect(og).connect(this.out);
    o.start(t);
    o.stop(t + 0.25);

    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(600, t);
    bp.frequency.exponentialRampToValueAtTime(3200, t + 0.3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
    src.connect(bp).connect(g).connect(this.out);
    src.start(t);
    src.stop(t + 0.4);
  }

  /** Cash-out: two bright notes. */
  chime() {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    [880, 1318.5].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t + i * 0.09);
      g.gain.exponentialRampToValueAtTime(0.25, t + i * 0.09 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.09 + 0.35);
      o.connect(g).connect(this.out);
      o.start(t + i * 0.09);
      o.stop(t + i * 0.09 + 0.4);
    });
  }

  /** Take-off squawk: a bright, raspy macaw call. */
  squawk() {
    const ctx = this.ctx;
    if (!ctx) return;
    const t0 = ctx.currentTime;
    [0, 0.2].forEach((d, k) => {
      const t = t0 + d;
      const o = ctx.createOscillator();
      const bp = ctx.createBiquadFilter();
      const g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(k ? 900 : 760, t);
      o.frequency.linearRampToValueAtTime(k ? 1300 : 1150, t + 0.05);
      o.frequency.exponentialRampToValueAtTime(k ? 600 : 520, t + 0.16);
      bp.type = 'bandpass';
      bp.frequency.value = 1800;
      bp.Q.value = 2.2;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.28, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
      o.connect(bp).connect(g).connect(this.out);
      o.start(t);
      o.stop(t + 0.18);
    });
  }
}
