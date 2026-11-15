/**
 * Web Audio sound kit. Everything is synthesised, so there are no audio files to ship: an original
 * jungle soundtrack (a relaxed marimba groove while betting, a driving drum groove in flight that
 * speeds up with the multiplier), jungle ambience, and the game's effects. Browsers only allow audio
 * after a click, so call unlock() from the sound toggle.
 */

type Phase = 'waiting' | 'flying' | 'crashed';
type Mode = 'calm' | 'flight' | 'rest';

/** How far ahead (s) the music is scheduled, and how often (ms) the scheduler wakes. */
const LOOKAHEAD = 0.25;
const WAKE_MS = 25;

/** Chords as MIDI notes, one per bar. Calm: C major, I-vi-IV-V. Flight: A minor, i-VI-VII-v. */
const CALM_CHORDS = [
  [48, 52, 55],
  [45, 48, 52],
  [41, 45, 48],
  [43, 47, 50],
];
const FLIGHT_CHORDS = [
  [45, 48, 52],
  [41, 45, 48],
  [43, 47, 50],
  [40, 43, 47],
];
/** The calm marimba line: [step, chord tone, octaves up]. Two bars long, so it doesn't repeat every bar. */
const CALM_LINE: [number, number, number][][] = [
  [
    [0, 0, 2],
    [3, 1, 2],
    [6, 2, 2],
    [8, 1, 3],
    [10, 2, 2],
    [12, 0, 3],
    [14, 1, 2],
  ],
  [
    [0, 2, 2],
    [2, 1, 2],
    [4, 0, 2],
    [7, 1, 2],
    [10, 2, 2],
    [11, 0, 3],
    [14, 2, 2],
  ],
];
/** The flight ostinato: one chord tone per eighth note. */
const FLIGHT_LINE = [0, 2, 1, 2, 0, 2, 1, 2];

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

export class SoundFx {
  private ctx: AudioContext | null = null;
  private noise: AudioBuffer | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private volume = 0.8;
  private ambient: { src: AudioBufferSourceNode; gain: GainNode; timer: number } | null = null;
  private music: { timer: number; next: number; step: number; bar: number } | null = null;
  private phase: Phase = 'waiting';
  private mult = 1;
  private mode: Mode = 'calm';

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
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 0.34;
      this.musicBus.connect(this.master);
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

  /** The rest of the catch, timed to the stage: the winch ratchet, the cage door's clang, the padlock's click. */
  capture(beats: { wrap: number; reel: number; shut: number; lock: number }) {
    const ctx = this.ctx;
    if (!ctx || !this.noise) return;
    const t0 = ctx.currentTime;

    const tick = (at: number, gain: number, freq: number, q: number, len: number) => {
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = freq;
      bp.Q.value = q;
      const g = ctx.createGain();
      g.gain.setValueAtTime(gain, at);
      g.gain.exponentialRampToValueAtTime(0.001, at + len);
      src.connect(bp).connect(g).connect(this.out);
      src.start(at);
      src.stop(at + len + 0.02);
    };
    const ring = (at: number, freq: number, gain: number, len: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = freq;
      g.gain.setValueAtTime(gain, at);
      g.gain.exponentialRampToValueAtTime(0.001, at + len);
      o.connect(g).connect(this.out);
      o.start(at);
      o.stop(at + len + 0.02);
    };

    for (let at = beats.wrap; at < beats.reel; at += 0.075) tick(t0 + at, 0.16, 2400, 6, 0.03);
    tick(t0 + beats.shut, 0.6, 700, 1.2, 0.2);
    ring(t0 + beats.shut, 310, 0.16, 0.5);
    ring(t0 + beats.shut, 467, 0.1, 0.42);
    tick(t0 + beats.lock - 0.06, 0.32, 3400, 5, 0.04);
    tick(t0 + beats.lock, 0.46, 2200, 4, 0.06);
    ring(t0 + beats.lock, 1244, 0.09, 0.3);
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

  // ---- music ------------------------------------------------------------------------

  /** Follows the round: the soundtrack changes with the phase and speeds up with the multiplier. */
  setPhase(phase: Phase, mult: number) {
    this.mult = mult;
    if (phase === this.phase) return;
    this.phase = phase;
    this.mode = phase === 'flying' ? 'flight' : phase === 'crashed' ? 'rest' : 'calm';
    // a flight starts its groove on the downbeat
    if (this.music && this.ctx && phase === 'flying') {
      this.music.step = 0;
      this.music.bar = 0;
      this.music.next = this.ctx.currentTime + 0.05;
    }
  }

  startMusic() {
    const ctx = this.ctx;
    if (!ctx || this.music || !this.musicBus) return;
    this.musicBus.gain.cancelScheduledValues(ctx.currentTime);
    this.musicBus.gain.setValueAtTime(0.0001, ctx.currentTime);
    this.musicBus.gain.exponentialRampToValueAtTime(0.34, ctx.currentTime + 1.2);
    const m = { timer: 0, next: ctx.currentTime + 0.1, step: 0, bar: 0 };
    m.timer = window.setInterval(() => this.schedule(), WAKE_MS);
    this.music = m;
  }

  stopMusic() {
    const m = this.music;
    if (!m || !this.ctx || !this.musicBus) return;
    window.clearInterval(m.timer);
    this.musicBus.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.25);
    this.music = null;
  }

  private get bpm() {
    if (this.mode !== 'flight') return 96;
    return 112 + 34 * Math.min(1, Math.log(Math.max(1, this.mult)) / Math.log(20));
  }

  private schedule() {
    const ctx = this.ctx;
    const m = this.music;
    if (!ctx || !m) return;
    // after the tab was in the background, pick up from now instead of playing the backlog
    if (m.next < ctx.currentTime - 0.1) m.next = ctx.currentTime + 0.05;
    while (m.next < ctx.currentTime + LOOKAHEAD) {
      this.playStep(m.step, m.bar, m.next);
      m.next += 60 / this.bpm / 4;
      m.step += 1;
      if (m.step === 16) {
        m.step = 0;
        m.bar += 1;
      }
    }
  }

  private playStep(step: number, bar: number, t: number) {
    const mode = this.mode;
    if (mode === 'flight') {
      const chord = FLIGHT_CHORDS[bar % 4];
      const heat = Math.min(1, Math.log(Math.max(1, this.mult)) / Math.log(10));
      if (step % 4 === 0) this.drum(t, 120, 42, 0.9, 0.26);
      if (heat > 0.3 && (step === 4 || step === 12)) this.clap(t, 0.5 + heat * 0.4);
      this.shaker(t, step % 2 ? 0.7 : 0.35 + heat * 0.3);
      if (step === 3 || step === 11) this.drum(t, 330, 230, 0.4, 0.14);
      if (step === 6 || step === 14) this.drum(t, 220, 160, 0.45, 0.16);
      if (step % 2 === 0) {
        const root = chord[0] - 12 + (step % 8 === 4 ? 12 : 0);
        this.bass(t, step === 14 ? chord[2] - 12 : root, 0.22, 0.32);
        this.marimba(t, chord[FLIGHT_LINE[step / 2]] + 24 + (step >= 8 && heat > 0.5 ? 12 : 0), 0.55 + (step % 4 === 0 ? 0.25 : 0));
      }
      if (step === 0) this.pad(t, chord.map((n) => n + 12), (60 / this.bpm) * 4, 0.035);
      return;
    }
    const chord = CALM_CHORDS[bar % 4];
    if (mode === 'rest') {
      // after a catch: a soft pad and a slow falling line, no drums
      if (step === 0) this.pad(t, chord.map((n) => n + 12), (60 / this.bpm) * 4, 0.05);
      if (step === 0 || step === 8) this.marimba(t, chord[step === 0 ? 2 : 0] + 24, 0.45);
      return;
    }
    if (step === 0) this.pad(t, chord.map((n) => n + 12), (60 / this.bpm) * 4, 0.05);
    if (step === 0) this.bass(t, chord[0] - 12, 0.5, 0.36);
    if (step === 10) this.bass(t, chord[2] - 12, 0.3, 0.26);
    for (const [s, tone, oct] of CALM_LINE[bar % 2]) if (s === step) this.marimba(t, chord[tone] + 12 * oct, 0.7);
    if (step % 4 === 2) this.shaker(t, 0.45);
    if (step === 4 || step === 12) this.drum(t, 200, 150, 0.35, 0.16);
    if (step === 11) this.drum(t, 300, 220, 0.25, 0.12);
  }

  /** A marimba bar: a sine with a quick, quieter overtone four times higher. */
  private marimba(t: number, midi: number, vel: number) {
    const ctx = this.ctx!;
    const f = hz(midi);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.2 * vel, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    g.connect(this.musicBus!);
    const o = ctx.createOscillator();
    o.frequency.value = f;
    o.connect(g);
    const o2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    o2.frequency.value = f * 4;
    g2.gain.setValueAtTime(0.25, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    o2.connect(g2).connect(g);
    o.start(t);
    o2.start(t);
    o.stop(t + 0.52);
    o2.stop(t + 0.1);
  }

  private bass(t: number, midi: number, len: number, vel: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = hz(midi);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 520;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(lp).connect(g).connect(this.musicBus!);
    o.start(t);
    o.stop(t + len + 0.02);
  }

  /** A soft, warm chord: two slightly detuned saws per note through a low-pass filter. */
  private pad(t: number, midis: number[], dur: number, vel: number) {
    const ctx = this.ctx!;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1100;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel, t + 0.4);
    g.gain.setValueAtTime(vel, t + dur * 0.8);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.6);
    lp.connect(g).connect(this.musicBus!);
    for (const n of midis)
      for (const cents of [-7, 7]) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = hz(n);
        o.detune.value = cents;
        o.connect(lp);
        o.start(t);
        o.stop(t + dur + 0.7);
      }
  }

  private shaker(t: number, vel: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 6500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09 * vel, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    src.connect(hp).connect(g).connect(this.musicBus!);
    src.start(t, Math.random() * 0.4);
    src.stop(t + 0.06);
  }

  /** A tuned drum: a sine that drops in pitch. Low settings make a kick, higher ones a conga or log drum. */
  private drum(t: number, from: number, to: number, vel: number, len: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(from, t);
    o.frequency.exponentialRampToValueAtTime(to, t + len * 0.6);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.7 * vel, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g).connect(this.musicBus!);
    o.start(t);
    o.stop(t + len + 0.02);
  }

  private clap(t: number, vel: number) {
    const ctx = this.ctx!;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1500;
    bp.Q.value = 0.8;
    bp.connect(this.musicBus!);
    [0, 0.012, 0.024].forEach((d, i) => {
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t + d);
      g.gain.exponentialRampToValueAtTime(0.35 * vel, t + d + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d + (i === 2 ? 0.12 : 0.01));
      src.connect(g).connect(bp);
      src.start(t + d, Math.random() * 0.4);
      src.stop(t + d + 0.14);
    });
  }

  // ---- effects ------------------------------------------------------------------------

  /** A short woodblock knock: a bet placed, or the last seconds of the countdown. */
  knock(high = false) {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(high ? 1250 : 820, t);
    o.frequency.exponentialRampToValueAtTime(high ? 900 : 600, t + 0.05);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = high ? 1200 : 800;
    bp.Q.value = 3;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.32, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    o.connect(bp).connect(g).connect(this.out);
    o.start(t);
    o.stop(t + 0.1);
  }

  /** A quick rising run as the multiplier passes 2x, 5x, 10x and beyond; higher tiers run longer. */
  milestone(tier: number) {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const notes = [72, 76, 79, 84, 88].slice(0, Math.min(5, 2 + tier));
    notes.forEach((n, i) => this.pling(t + i * 0.06, n, 0.16));
  }

  /** A bright marimba fanfare after a cash-out. */
  winSting() {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime + 0.12;
    [72, 76, 79, 84].forEach((n, i) => this.pling(t + i * 0.08, n, 0.22));
    this.pling(t + 0.34, 88, 0.26, 0.9);
  }

  /** A falling minor line and a low drum when a bet goes down with Azul. */
  loseSting(delay = 0.45) {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    [69, 67, 64, 57].forEach((n, i) => this.pling(t + i * 0.13, n, 0.2, i === 3 ? 0.9 : 0.4));
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(90, t + 0.4);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.9);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t + 0.4);
    g.gain.exponentialRampToValueAtTime(0.4, t + 0.41);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1);
    o.connect(g).connect(this.out);
    o.start(t + 0.4);
    o.stop(t + 1.05);
  }

  /** One effects-bus marimba note (effects play over the music, through the master). */
  private pling(t: number, midi: number, vel: number, len = 0.45) {
    const ctx = this.ctx!;
    const f = hz(midi);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    g.connect(this.out);
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = f;
    o.connect(g);
    const o2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    o2.frequency.value = f * 4;
    g2.gain.setValueAtTime(0.2, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    o2.connect(g2).connect(g);
    o.start(t);
    o2.start(t);
    o.stop(t + len + 0.02);
    o2.stop(t + 0.08);
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
