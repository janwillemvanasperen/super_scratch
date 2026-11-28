import type { Level } from '../levels/schema';
import { assetUrl } from '../assets/catalog';

export class AudioEngine {
  ctx?: AudioContext;
  music = true;
  sfx = true;
  musicVolume = 0.28;
  effectsVolume = 0.28;
  timer?: ReturnType<typeof setInterval>;
  step = 0;
  private notes = [60, 64, 67, 72, 67, 64, 62, 67];
  private tempo = 115;
  private level?: Level;
  private epoch = 0;
  private controller?: AbortController;
  private paused = false;
  private musicBuffer?: AudioBuffer;
  private musicNode?: AudioBufferSourceNode;
  private musicGain?: GainNode;
  private startedAt = 0;
  private offset = 0;
  private buffers = new Map<string, AudioBuffer>();
  private voices = new Set<AudioScheduledSourceNode>();
  private gains = new Set<GainNode>();
  private channels = new Map<AudioScheduledSourceNode, boolean>();
  constructor() {
    try {
      const s = JSON.parse(localStorage.getItem('super-scratch.audio') || '{}');
      if (typeof s.music === 'boolean') this.music = s.music;
      if (typeof s.sfx === 'boolean') this.sfx = s.sfx;
      this.musicVolume = this.clamp(s.musicVolume ?? s.volume ?? 0.28);
      this.effectsVolume = this.clamp(s.effectsVolume ?? s.volume ?? 0.28);
    } catch {}
  }
  private clamp(v: unknown) {
    return typeof v === 'number' && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.28;
  }
  unlock() {
    try {
      this.ctx ??= new AudioContext();
      void this.ctx.resume().catch(() => {});
    } catch {
      console.warn('Audio is niet beschikbaar in deze browser.');
    }
  }
  save() {
    try {
      localStorage.setItem(
        'super-scratch.audio',
        JSON.stringify({
          music: this.music,
          sfx: this.sfx,
          musicVolume: this.musicVolume,
          effectsVolume: this.effectsVolume,
        }),
      );
    } catch {}
    this.refresh();
  }
  refresh() {
    if (this.musicGain && this.ctx)
      this.musicGain.gain.setValueAtTime(
        this.music ? this.musicVolume * (this.level?.audio?.musicVolume ?? 1) : 0,
        this.ctx.currentTime,
      );
    if (!this.sfx) this.stopVoices(false);
    if (!this.music) this.stopVoices(true);
  }
  private tone(
    freq: number,
    seconds: number,
    type: OscillatorType,
    gain: number,
    delay = 0,
    music = false,
  ) {
    if (
      !this.ctx ||
      this.ctx.state !== 'running' ||
      (music ? this.musicVolume : this.effectsVolume) === 0
    )
      return;
    const o = this.ctx.createOscillator(),
      g = this.ctx.createGain(),
      t = this.ctx.currentTime + delay;
    o.type = type;
    o.frequency.value = freq;
    const volume = music
      ? this.musicVolume * (this.level?.audio?.musicVolume ?? 1)
      : this.effectsVolume * (this.level?.audio?.effectsVolume ?? 1);
    g.gain.setValueAtTime(Math.max(0.0001, volume * gain), t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
    o.connect(g);
    g.connect(this.ctx.destination);
    this.voices.add(o);
    this.channels.set(o, music);
    this.gains.add(g);
    o.onended = () => {
      this.voices.delete(o);
      this.channels.delete(o);
      this.gains.delete(g);
      o.disconnect();
      g.disconnect();
    };
    o.start(t);
    o.stop(t + seconds + 0.01);
  }
  play(name: string) {
    if (!this.sfx || this.effectsVolume === 0 || this.paused || !this.ctx) return;
    const buffer = this.buffers.get(name);
    if (buffer) {
      const source = this.ctx.createBufferSource(),
        gain = this.ctx.createGain();
      source.buffer = buffer;
      gain.gain.value = this.effectsVolume * (this.level?.audio?.effectsVolume ?? 1);
      source.connect(gain);
      gain.connect(this.ctx.destination);
      this.voices.add(source);
      this.channels.set(source, false);
      this.gains.add(gain);
      source.onended = () => {
        this.voices.delete(source);
        this.channels.delete(source);
        this.gains.delete(gain);
        source.disconnect();
        gain.disconnect();
      };
      source.start();
      return;
    }
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
    (seq[name] || seq.coin).forEach((f, i) => this.tone(f, 0.13, 'square', 0.15, i * 0.085));
  }
  start(notes = [60, 64, 67, 72, 67, 64, 62, 67], tempo = 115, level?: Level) {
    this.stop();
    this.level = level;
    this.notes = notes;
    this.tempo = tempo;
    this.step = 0;
    this.paused = false;
    this.offset = 0;
    this.startSynth();
    if (!level?.audio || !this.ctx) return;
    const epoch = this.epoch;
    this.controller = new AbortController();
    const signal = this.controller.signal;
    const requests: Promise<void>[] = [];
    const load = async (id: string, label: string) => {
      const a = level.assets?.[id];
      if (a?.type !== 'audio') {
        console.warn(`Audioverwijzing ${id} ontbreekt; chiptune blijft beschikbaar.`);
        return;
      }
      const abort = new AbortController();
      const timer = setTimeout(() => abort.abort(), 10000);
      const cancel = () => abort.abort();
      signal.addEventListener('abort', cancel, { once: true });
      try {
        const response = await fetch(assetUrl(a.src), { signal: abort.signal });
        if (!response.ok) throw Error(`HTTP ${response.status}`);
        if (Number(response.headers.get('content-length') || 0) > 20 * 1024 * 1024)
          throw Error('Audiobestand groter dan 20 MB');
        const bytes = await response.arrayBuffer();
        if (bytes.byteLength > 20 * 1024 * 1024) throw Error('Audiobestand groter dan 20 MB');
        const buffer = await this.ctx!.decodeAudioData(bytes);
        if (epoch !== this.epoch || signal.aborted || abort.signal.aborted) return;
        if (label === '__music') {
          this.musicBuffer = buffer;
          if (!this.paused) this.startBuffer();
        } else this.buffers.set(label, buffer);
      } catch (error) {
        if (!signal.aborted && epoch === this.epoch)
          console.warn(
            `Audio ${a.src} kon niet worden geladen; standaardgeluid wordt gebruikt.`,
            error,
          );
      } finally {
        clearTimeout(timer);
        signal.removeEventListener('abort', cancel);
      }
    };
    if (level.audio.music) requests.push(load(level.audio.music, '__music'));
    for (const [name, id] of Object.entries(level.audio.effects || {}))
      requests.push(load(id, name));
    void Promise.allSettled(requests);
  }
  private startSynth() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(
      () => {
        if (this.music && !this.paused) {
          const n = this.notes[this.step % this.notes.length];
          this.tone(440 * 2 ** ((n - 69) / 12), 0.17, 'square', 0.065, 0, true);
          if (this.step % 2 === 0)
            this.tone(440 * 2 ** ((n - 93) / 12), 0.25, 'triangle', 0.18, 0, true);
        }
        this.step++;
      },
      60000 / this.tempo / 2,
    );
  }
  private startBuffer() {
    if (!this.ctx || !this.musicBuffer || this.paused) return;
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    this.stopVoices(true);
    this.stopMusicNode();
    const source = this.ctx.createBufferSource(),
      gain = this.ctx.createGain();
    source.buffer = this.musicBuffer;
    source.loop = this.level?.audio?.loop ?? true;
    source.connect(gain);
    gain.connect(this.ctx.destination);
    this.musicNode = source;
    this.musicGain = gain;
    this.refresh();
    this.startedAt = this.ctx.currentTime;
    const offset = source.loop
      ? this.offset % this.musicBuffer.duration
      : Math.min(this.offset, this.musicBuffer.duration);
    source.start(0, offset);
    source.onended = () => {
      if (this.musicNode === source) {
        this.musicNode = undefined;
        this.musicGain = undefined;
      }
      source.disconnect();
      gain.disconnect();
    };
  }
  private stopMusicNode() {
    const source = this.musicNode;
    this.musicNode = undefined;
    if (source) {
      try {
        source.stop();
      } catch {}
      source.disconnect();
    }
    this.musicGain?.disconnect();
    this.musicGain = undefined;
  }
  private stopVoices(channel?: boolean) {
    for (const v of this.voices) {
      if (channel !== undefined && this.channels.get(v) !== channel) continue;
      try {
        v.stop();
      } catch {}
      v.disconnect();
      this.voices.delete(v);
      this.channels.delete(v);
    }
    if (channel === undefined) {
      for (const g of this.gains) g.disconnect();
      this.gains.clear();
    }
  }
  pause() {
    if (this.paused) return;
    this.paused = true;
    if (this.musicNode && this.ctx) this.offset += this.ctx.currentTime - this.startedAt;
    this.stopMusicNode();
    this.stopVoices();
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }
  resume() {
    if (!this.paused) return;
    this.paused = false;
    if (this.musicBuffer) this.startBuffer();
    else this.startSynth();
  }
  stop(preserveEffects = false) {
    this.epoch++;
    this.controller?.abort();
    this.controller = undefined;
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    this.stopMusicNode();
    this.stopVoices();
    this.musicBuffer = undefined;
    this.offset = 0;
    this.paused = false;
    if (!preserveEffects) {
      this.buffers.clear();
      this.level = undefined;
    }
  }
}
