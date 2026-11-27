import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { levelSchema, objectSchema, kinds } from '../src/levels/schema';
import {
  animationSchema,
  assetSchema,
  checkSheet,
  frameAt,
  visualSchema,
} from '../src/assets/schema';
import { assetReferenceIssues } from '../src/assets/catalog';
import { objectBody, objectBounds } from '../src/assets/layout';
import { repeatPositions } from '../src/assets/repeat';
import { validateAssets, imageSize } from '../scripts/asset-validation';
const data = () => JSON.parse(readFileSync('public/levels/midnight-city.json', 'utf8'));
describe('level assets', () => {
  it('keeps legacy levels optional and validates both complete original packs', () => {
    for (const id of ['tutorial', 'first-adventure', 'midnight-city', 'deep-sea-treasure']) {
      const l = levelSchema.parse(JSON.parse(readFileSync(`public/levels/${id}.json`, 'utf8')));
      expect(validateAssets(l)).toEqual([]);
      if (!l.demo) expect(l.assets).toBeUndefined();
    }
  });
  it('supports a visual for all 33 kinds while preserving independent collision geometry', () => {
    for (const kind of kinds) {
      const o = objectSchema.parse({
        id: 'test',
        kind,
        x: 100,
        y: 200,
        w: 64,
        h: 80,
        visual: { asset: 'a', scale: 3, rotation: 90 },
        hitbox: { width: 20, height: 30, offsetX: 7, offsetY: 9 },
      });
      const body = objectBody(o);
      expect([body.x, body.y, body.w, body.h]).toEqual([107, 209, 20, 30]);
      expect(objectBounds({ ...o, ...body })).toEqual({ x: 100, y: 200, w: 64, h: 80 });
    }
  });
  it('reports bad references and missing files without rejecting otherwise playable geometry', () => {
    const raw = data();
    raw.character.visual.asset = 'missing';
    raw.assets.music.src = 'assets/midnight-city/missing.wav';
    const l = levelSchema.parse(raw);
    expect(assetReferenceIssues(l).join()).toContain('missing');
    expect(validateAssets(l).join()).toContain('missing.wav');
  });
  it('checks sheet grids, dimensions, frame references and PNG corruption', () => {
    const sheet = assetSchema.parse({
      type: 'sheet',
      src: 'assets/demo/hero.png',
      frameWidth: 32,
      frameHeight: 32,
      frameCount: 4,
    });
    expect(checkSheet(sheet, 128, 32)).toBeNull();
    expect(checkSheet(sheet, 127, 32)).toBeTruthy();
    expect(checkSheet(sheet, 8192, 8192)).toBeTruthy();
    const raw = data();
    raw.character.visual.animations.walk.frames = [99];
    expect(assetReferenceIssues(levelSchema.parse(raw)).join()).toContain('frame');
    expect(() => imageSize(Buffer.from('not a PNG'), 'png')).toThrow();
    const png = readFileSync('public/assets/midnight-city/hero.png');
    expect(() => imageSize(png.subarray(0, 50), 'png')).toThrow();
  });
  it('rejects executable/remote paths, invalid formats and animation settings', () => {
    for (const src of [
      'https://example.com/a.png',
      'assets/demo/../evil.png',
      'assets/demo/a.svg',
      'assets/demo/a.js',
    ])
      expect(assetSchema.safeParse({ type: 'image', src }).success).toBe(false);
    for (const clip of [
      { frames: [] },
      { frames: [-1] },
      { frames: [0], fps: 0 },
      { frames: [0], fps: 61 },
    ])
      expect(animationSchema.safeParse(clip).success).toBe(false);
    expect(visualSchema.safeParse({ asset: 'a', scale: 0 }).success).toBe(false);
    for (const ext of ['mp3', 'ogg', 'wav'])
      expect(
        assetSchema.safeParse({ type: 'audio', src: `assets/demo/music.${ext}` }).success,
      ).toBe(true);
  });
  it('plays looping and finite animations at the specified frame rate', () => {
    const loop = animationSchema.parse({ frames: [2, 4, 6], fps: 10 });
    expect([0, 0.1, 0.2, 0.3, 100].map((t) => frameAt(loop, t))).toEqual([2, 4, 6, 2, 4]);
    const once = { ...loop, repeat: 0 };
    expect(frameAt(once, 20)).toBe(6);
  });
  it('covers long worlds in both directions with a fixed number of repeated layers', () => {
    for (const x of [-100000, -50000, -1024, -1, 0, 1, 50000, 100000]) {
      const p = repeatPositions(x, 512, 960, true);
      expect(p.length).toBe(4);
      expect(p[0]).toBeLessThanOrEqual(0);
      expect(p.at(-1)! + 512).toBeGreaterThanOrEqual(960);
      for (let i = 1; i < p.length; i++) expect(p[i] - p[i - 1]).toBe(512);
    }
    expect(repeatPositions(23, 512, 960, false)).toEqual([23]);
  });
  it('rejects duplicate layer IDs and excessively small layers', () => {
    const raw = data();
    raw.background.layers.push(raw.background.layers[0]);
    expect(levelSchema.safeParse(raw).success).toBe(false);
    const tiny = data();
    tiny.background.layers[0].width = 1;
    expect(levelSchema.safeParse(tiny).success).toBe(false);
  });
});
