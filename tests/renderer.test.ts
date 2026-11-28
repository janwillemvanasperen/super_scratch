import { describe, it, expect, vi } from 'vitest';
vi.mock('phaser', () => {
  class Sprite {
    visible = true;
    frame: any;
    destroy = vi.fn();
    setFrame(f: any) {
      this.frame = f;
      return this;
    }
    setVisible(v: boolean) {
      this.visible = v;
      return this;
    }
    setOrigin() {
      return this;
    }
    setPosition() {
      return this;
    }
    setAlpha() {
      return this;
    }
    setAngle() {
      return this;
    }
    setFlipX() {
      return this;
    }
    setFlipY() {
      return this;
    }
    setDepth() {
      return this;
    }
    setTint() {
      return this;
    }
    clearTint() {
      return this;
    }
    setDisplaySize() {
      return this;
    }
    setScale() {
      return this;
    }
  }
  class TileSprite extends Sprite {
    setSize() {
      return this;
    }
    setTileScale() {
      return this;
    }
  }
  return { default: { GameObjects: { Sprite, TileSprite } } };
});
import Phaser from 'phaser';
import { AssetRenderer, preloadGraphics } from '../src/assets/renderer';
import { visualSchema } from '../src/assets/schema';
import { levelSchema } from '../src/levels/schema';
import { readFileSync } from 'node:fs';
const getLevel = () =>
  levelSchema.parse(JSON.parse(readFileSync('public/levels/midnight-city.json', 'utf8')));
function scene() {
  const sprites: any[] = [];
  const s = {
    textures: {
      exists: vi.fn((key: string) => !key.endsWith(':missing')),
      get: vi.fn((key: string) => ({
        key,
        has: (frame: string) =>
          key.endsWith(':background') ? frame === '__BASE' : Number(frame) < 8,
        getSourceImage: () => ({
          width: key.endsWith(':hero') ? 384 : 512,
          height: key.endsWith(':hero') ? 48 : 270,
        }),
      })),
      remove: vi.fn(),
    },
    add: {
      sprite: vi.fn(() => {
        const p = new (Phaser.GameObjects.Sprite as any)();
        sprites.push(p);
        return p;
      }),
      tileSprite: vi.fn(() => {
        const p = new (Phaser.GameObjects.TileSprite as any)();
        sprites.push(p);
        return p;
      }),
      rectangle: vi.fn(),
    },
    load: { spritesheet: vi.fn(), image: vi.fn() },
  };
  return { s: s as any, sprites };
}
describe('asset rendering and cleanup', () => {
  it('uses the base frame for images and falls back for missing textures/frames', () => {
    const l = getLevel();
    l.assets = { background: l.assets!.background, hero: l.assets!.hero };
    delete l.background;
    const { s, sprites } = scene(),
      r = new AssetRenderer(s, l),
      bounds = { x: 0, y: 0, w: 100, h: 100 };
    expect(r.draw('bg', bounds, visualSchema.parse({ asset: 'background' }), 'idle', 0, 0)).toBe(
      true,
    );
    expect(sprites[0].frame).toBe('__BASE');
    expect(r.draw('x', bounds, visualSchema.parse({ asset: 'missing' }), 'idle', 0, 0)).toBe(false);
    expect(
      r.draw('bad', bounds, visualSchema.parse({ asset: 'hero', frame: 30 }), 'idle', 0, 0),
    ).toBe(false);
  });
  it('changes animation states, removes unseen objects and unloads level textures', () => {
    const l = getLevel();
    l.assets = { hero: l.assets!.hero };
    delete l.background;
    const { s, sprites } = scene(),
      r = new AssetRenderer(s, l),
      v = l.character.visual!,
      b = { x: 0, y: 0, w: 22, h: 30 };
    r.begin();
    r.draw('p', b, v, 'walk', 0, 0);
    r.draw('p', b, v, 'walk', 0.11, 0);
    expect(sprites[0].frame).toBe(0);
    r.draw('p', b, v, 'jump', 0.2, 0);
    expect(sprites[0].frame).toBe(4);
    r.end();
    expect(sprites[0].destroy).not.toHaveBeenCalled();
    r.begin();
    r.end();
    expect(sprites[0].destroy).toHaveBeenCalledOnce();
    r.destroy();
    expect(s.textures.remove).toHaveBeenCalledWith('level:midnight-city:1:hero');
  });
  it('preloads only assets from the selected level, leaving audio to AudioEngine', () => {
    const l = getLevel(),
      { s } = scene();
    s.textures.exists.mockReturnValue(false);
    preloadGraphics(s, l);
    expect(s.load.spritesheet).toHaveBeenCalledTimes(6);
    expect(s.load.image).toHaveBeenCalledTimes(8);
    const urls = [...s.load.image.mock.calls, ...s.load.spritesheet.mock.calls].map((c) => c[1]);
    expect(urls.every((u) => u.includes('midnight-city'))).toBe(true);
    expect(urls.some((u) => u.endsWith('.wav'))).toBe(false);
  });
});
