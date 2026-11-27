export class AudioEngine {
  ctx?: AudioContext;
  music = true;
  sfx = true;
  volume = 0.28;
  timer?: ReturnType<typeof setInterval>;
  step = 0;
  constructor() {
    try {
      Object.assign(this, JSON.parse(localStorage.getItem('super-scratch.audio') || '{}'));
    } catch {}
  }
  unlock() {
    this.ctx ??= new AudioContext();
    void this.ctx.resume();
  }
  save() {
    try {
      localStorage.setItem(
        'super-scratch.audio',
        JSON.stringify({ music: this.music, sfx: this.sfx, volume: this.volume }),
      );
    } catch {}
  }
  tone(freq: number, seconds: number, type: OscillatorType = 'square', gain = 0.12) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const o = this.ctx.createOscillator(),
      g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(this.volume * gain, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + seconds);
    o.connect(g);
    g.connect(this.ctx.destination);
    o.start();
    o.stop(this.ctx.currentTime + seconds);
  }
  play(name: string) {
    if (!this.sfx) return;
    const seq: Record<string, number[]> = {
      jump: [320, 480],
      coin: [880, 1320],
      hurt: [160, 90],
      enemy: [240, 110],
      heart: [440, 660, 880],
      power: [330, 440, 660, 880],
      door: [220, 330, 440],
      checkpoint: [523, 659, 784],
      life: [220, 160, 90],
      over: [220, 196, 165, 110],
      finish: [523, 659, 784, 1047],
      secret: [392, 523, 659, 1047],
    };
    (seq[name] || seq.coin).forEach((f, i) => {
      if (this.ctx) {
        const o = this.ctx.createOscillator(),
          g = this.ctx.createGain();
        const t = this.ctx.currentTime + i * 0.085;
        o.type = 'square';
        o.frequency.value = f;
        g.gain.setValueAtTime(this.volume * 0.15, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
        o.connect(g);
        g.connect(this.ctx.destination);
        o.start(t);
        o.stop(t + 0.14);
      }
    });
  }
  start(notes = [60, 64, 67, 72, 67, 64, 62, 67], tempo = 115) {
    this.stop();
    this.step = 0;
    this.timer = setInterval(
      () => {
        if (this.music) {
          const n = notes[this.step % notes.length];
          this.tone(440 * 2 ** ((n - 69) / 12), 0.17, 'square', 0.065);
          if (this.step % 2 === 0) this.tone(440 * 2 ** ((n - 93) / 12), 0.25, 'triangle', 0.18);
        }
        this.step++;
      },
      60000 / tempo / 2,
    );
  }
  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }
}
