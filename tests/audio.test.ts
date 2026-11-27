import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AudioEngine } from '../src/audio/audio';
import { levelSchema } from '../src/levels/schema';
import { readFileSync } from 'node:fs';
const level = levelSchema.parse(
  JSON.parse(readFileSync('public/levels/midnight-city.json', 'utf8')),
);
function context() {
  const nodes: any[] = [],
    oscillators: any[] = [];
  const source = () => {
    const n = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      loop: false,
      buffer: null,
      onended: undefined,
    };
    nodes.push(n);
    return n;
  };
  return {
    nodes,
    oscillators,
    state: 'running',
    currentTime: 0,
    destination: {},
    resume: vi.fn(async () => {}),
    decodeAudioData: vi.fn(async () => ({ duration: 8 })),
    createBufferSource: vi.fn(source),
    createOscillator: vi.fn(() => {
      const n = { ...source(), frequency: { value: 0 }, type: 'square' };
      oscillators.push(n);
      return n;
    }),
    createGain: vi.fn(() => ({
      gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
  };
}
const flush = async () => {
  for (let i = 0; i < 12; i++) await Promise.resolve();
};
describe('audio lifecycle', () => {
  let engine: AudioEngine, ctx: ReturnType<typeof context>;
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: vi.fn() });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        headers: new Headers(),
        arrayBuffer: async () => new ArrayBuffer(8),
      })),
    );
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    ctx = context();
    engine = new AudioEngine();
    engine.ctx = ctx as any;
  });
  afterEach(() => {
    engine.stop();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
  it('loads per-level music/effects, loops, pauses, resumes at offset and stops on exit', async () => {
    engine.start(level.music.notes, 120, level);
    await flush();
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(ctx.decodeAudioData).toHaveBeenCalledTimes(3);
    const music = ctx.nodes[0];
    expect(music.loop).toBe(true);
    ctx.currentTime = 3;
    engine.pause();
    expect(music.stop).toHaveBeenCalled();
    engine.play('coin');
    expect(ctx.nodes.length).toBe(1);
    engine.resume();
    expect(ctx.nodes[1].start).toHaveBeenCalledWith(0, 3);
    engine.play('coin');
    expect(ctx.nodes.length).toBe(3);
    engine.stop();
    expect(ctx.nodes[1].stop).toHaveBeenCalled();
    expect(ctx.nodes[2].stop).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('uses generated sound after missing or undecodable audio and cleans timers', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(Error('404'));
    ctx.decodeAudioData.mockRejectedValue(Error('invalid audio'));
    engine.start(level.music.notes, 120, level);
    await flush();
    vi.advanceTimersByTime(500);
    engine.play('coin');
    expect(ctx.oscillators.length).toBeGreaterThan(2);
    engine.stop();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('does not revive a previous level after a late decode', async () => {
    let resolve!: Function;
    ctx.decodeAudioData.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    const onlyMusic = { ...level, audio: { ...level.audio!, effects: undefined } };
    engine.start(level.music.notes, 120, onlyMusic);
    await flush();
    engine.stop();
    resolve({ duration: 8 });
    await flush();
    expect(ctx.nodes).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('keeps volumes independent, migrates old volume and preserves finish sound', async () => {
    vi.stubGlobal('localStorage', {
      getItem: () => JSON.stringify({ volume: 0.4 }),
      setItem: vi.fn(),
    });
    const migrated = new AudioEngine();
    expect(migrated.musicVolume).toBe(0.4);
    expect(migrated.effectsVolume).toBe(0.4);
    engine.musicVolume = 0.1;
    engine.effectsVolume = 0.8;
    engine.start(level.music.notes, 120, level);
    await flush();
    engine.stop(true);
    engine.play('finish');
    const gain = ctx.createGain.mock.results.at(-1)!.value;
    expect(gain.gain.value).toBeCloseTo(0.8 * 0.9);
    expect(engine.musicVolume).toBe(0.1);
    engine.stop();
  });
  it('does not start loaded music while paused and supports non-looping tracks', async () => {
    const l = { ...level, audio: { ...level.audio!, loop: false } };
    engine.start(l.music.notes, 120, l);
    engine.pause();
    await flush();
    expect(ctx.nodes).toHaveLength(0);
    engine.resume();
    expect(ctx.nodes[0].loop).toBe(false);
  });
});
