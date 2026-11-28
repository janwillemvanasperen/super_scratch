import Phaser from 'phaser';
import type { Level } from '../levels/schema';
import type { Rect } from '../core/physics';
import { assetKey, assetUrl } from './catalog';
import { checkSheet, frameAt, type Visual } from './schema';
import { repeatPositions } from './repeat';

type RenderObject = Phaser.GameObjects.Sprite | Phaser.GameObjects.TileSprite;
type Entry = { object: RenderObject; state: string; since: number; seen: boolean; asset: string };

export function preloadGraphics(scene: Phaser.Scene, level: Level) {
  for (const [id, a] of Object.entries(level.assets || {})) {
    const key = assetKey(level, id);
    if (a.type === 'audio' || scene.textures.exists(key)) continue;
    if (a.type === 'sheet')
      scene.load.spritesheet(
        key,
        assetUrl(a.src),
        {
          frameWidth: a.frameWidth,
          frameHeight: a.frameHeight,
          endFrame: a.frameCount - 1,
          margin: a.margin,
          spacing: a.spacing,
        },
        { timeout: 10000, responseType: 'blob' },
      );
    else scene.load.image(key, assetUrl(a.src), { timeout: 10000, responseType: 'blob' });
  }
}

export class AssetRenderer {
  private entries = new Map<string, Entry>();
  private invalid = new Set<string>();
  private light?: Phaser.GameObjects.Rectangle;
  readonly issues: string[] = [];
  constructor(
    private scene: Phaser.Scene,
    private level: Level,
  ) {
    for (const [id, a] of Object.entries(level.assets || {})) {
      if (a.type === 'audio') continue;
      const key = assetKey(level, id);
      if (!scene.textures.exists(key)) {
        this.invalid.add(id);
        this.issues.push(`Afbeelding niet geladen: ${a.src}`);
        continue;
      }
      const source = scene.textures.get(key).getSourceImage() as HTMLImageElement;
      const error = checkSheet(a, source.width, source.height);
      if (error) {
        this.invalid.add(id);
        this.issues.push(`${a.src}: ${error}`);
      }
    }
    if (level.background?.light) {
      const l = level.background.light;
      this.light = scene.add
        .rectangle(0, 0, 960, 540, parseInt(l.color.slice(1), 16), l.alpha)
        .setOrigin(0)
        .setDepth(400);
      this.light.setScrollFactor?.(0);
    }
    if (this.issues.length) console.warn(`Assets ${level.id}:`, this.issues);
  }
  begin() {
    for (const e of this.entries.values()) e.seen = false;
  }
  available(v?: Visual) {
    return (
      !!v && !this.invalid.has(v.asset) && this.scene.textures.exists(assetKey(this.level, v.asset))
    );
  }
  draw(
    id: string,
    bounds: Rect,
    v: Visual | undefined,
    state: string,
    time: number,
    camera: number,
    facing = 1,
    alpha = 1,
    baseDepth = 100,
  ): boolean {
    if (!v || !this.available(v)) return false;
    const texture = this.scene.textures.get(assetKey(this.level, v.asset));
    const clip = v.animations?.[state] || v.animations?.[v.animation || 'idle'];
    const chosen = v.animations?.[state] ? state : v.animation || 'idle';
    let e = this.entries.get(id);
    if (!e || e.asset !== v.asset) {
      e?.object.destroy();
      const initial = this.level.assets?.[v.asset]?.type === 'image' ? '__BASE' : v.frame;
      const obj =
        v.mode === 'tile'
          ? this.scene.add.tileSprite(
              0,
              0,
              Math.max(1, bounds.w),
              Math.max(1, bounds.h),
              texture.key,
              initial,
            )
          : this.scene.add.sprite(0, 0, texture.key, initial);
      e = { object: obj, state: chosen, since: time, seen: true, asset: v.asset };
      this.entries.set(id, e);
    }
    if (e.state !== chosen) {
      e.state = chosen;
      e.since = time;
    }
    const frame =
      this.level.assets?.[v.asset]?.type === 'image'
        ? '__BASE'
        : clip
          ? frameAt(clip, time - e.since)
          : v.frame;
    if (!texture.has(String(frame))) {
      e.object.setVisible(false);
      return false;
    }
    const obj = e.object;
    obj.setScrollFactor?.(id.startsWith('layer:') ? 0 : 1);
    obj.setFrame(frame);
    e.seen = true;
    obj
      .setOrigin(0)
      .setPosition(Math.round(bounds.x - camera + v.offsetX), Math.round(bounds.y + v.offsetY))
      .setAlpha(v.alpha * alpha)
      .setAngle(v.rotation)
      .setFlipX(v.flipX !== facing < 0)
      .setFlipY(v.flipY)
      .setDepth(baseDepth + v.depth)
      .setVisible(true);
    if (v.tint) obj.setTint(parseInt(v.tint.slice(1), 16));
    else obj.clearTint();
    if (obj instanceof Phaser.GameObjects.TileSprite) {
      obj.setSize(bounds.w, bounds.h);
      obj.setScale(1);
      obj.setTileScale(v.scale, v.scale);
    } else if (v.fit === 'body') obj.setDisplaySize(bounds.w * v.scale, bounds.h * v.scale);
    else obj.setScale(v.scale);
    return true;
  }
  layers(camera: number, time: number, cameraY = 0) {
    for (const layer of this.level.background?.layers || []) {
      if (!this.available(layer.visual)) continue;
      const x = layer.x - camera * layer.parallax + time * layer.scrollX,
        y = layer.y - cameraY * layer.parallaxY + time * layer.scrollY;
      // Modulo anchoring means layers repeat forever, including negative scroll speeds.
      const xs = repeatPositions(x, layer.width, 960, layer.repeatX),
        ys = repeatPositions(y, layer.height, 540, layer.repeatY);
      xs.forEach((xx, col) =>
        ys.forEach((yy, row) =>
          this.draw(
            `layer:${layer.id}:${col}:${row}`,
            { x: xx, y: yy, w: layer.width, h: layer.height },
            layer.visual,
            layer.visual.animation || 'idle',
            time,
            0,
            1,
            1,
            layer.foreground ? 250 : -500,
          ),
        ),
      );
    }
  }
  end() {
    for (const [id, e] of this.entries) {
      if (!e.seen) {
        e.object.destroy();
        this.entries.delete(id);
      }
    }
  }
  destroy() {
    for (const e of this.entries.values()) e.object.destroy();
    this.entries.clear();
    this.light?.destroy();
    for (const [id, a] of Object.entries(this.level.assets || {}))
      if (a.type !== 'audio' && this.scene.textures.exists(assetKey(this.level, id)))
        this.scene.textures.remove(assetKey(this.level, id));
  }
}
