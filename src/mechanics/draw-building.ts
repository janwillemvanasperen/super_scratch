import type Phaser from 'phaser';
import type { WorldObject, ObjectState } from './world-types';
export function drawBuilding(
  g: Phaser.GameObjects.Graphics,
  o: WorldObject,
  s: ObjectState,
  camera: number,
  time: number,
): boolean {
  const x = Math.round(o.x - camera),
    y = Math.round(o.y),
    w = o.w,
    h = o.h,
    alpha = s.enabled ? 1 : 0.25;
  const rect = (xx: number, yy: number, ww: number, hh: number, c: number, a = alpha) => {
    g.fillStyle(c, a);
    g.fillRect(Math.round(xx), Math.round(yy), ww, hh);
  };
  const line = (xx: number, yy: number, X: number, Y: number, c: number, a = alpha) => {
    g.lineStyle(2, c, a);
    g.lineBetween(xx, yy, X, Y);
  };
  switch (o.kind) {
    case 'switch':
      rect(x + 4, y + h - 9, w - 8, 9, 0x657894);
      rect(x + w / 2 - 3, y + 8, 6, h - 16, 0xaac6cd);
      rect(x + (s.active ? w - 13 : 2), y + 2, 12, 12, s.active ? 0x9ae4af : 0xf6b564);
      line(x + w / 2, y + h - 9, x + (s.active ? w - 7 : 8), y + 8, 0xffedbc);
      break;
    case 'pressurePlate':
      rect(x, y, w, h, 0x36485f);
      rect(
        x + 2,
        y + (s.active ? 4 : 0),
        w - 4,
        Math.max(3, h - 4),
        s.active ? 0x8cdeba : 0xe6bd70,
      );
      break;
    case 'ladder':
      rect(x + 3, y, 4, h, 0xb28162);
      rect(x + w - 7, y, 4, h, 0xb28162);
      for (let yy = y + 5; yy < y + h; yy += 14) rect(x + 7, yy, w - 14, 3, 0xf1cc8a);
      break;
    case 'water':
      rect(x, y, w, h, 0x4bafcb, 0.3);
      for (let xx = x; xx < x + w; xx += 16)
        rect(
          xx,
          y + Math.sin(time * 3 + xx * 0.04) * 2,
          Math.min(12, x + w - xx),
          3,
          0x98e9e1,
          0.7,
        );
      for (let yy = y + 24; yy < y + h; yy += 42)
        for (let xx = x + 16; xx < x + w; xx += 65)
          rect(xx, yy - Math.sin(time + xx) * 4, 2, 3, 0xc5f5ee, 0.6);
      break;
    case 'zone':
      rect(
        x,
        y,
        w,
        h,
        o.zone!.gravity < 1 ? 0xbaa2f3 : o.zone!.gravity > 1 ? 0xf2a882 : 0xa5dbc8,
        0.1,
      );
      g.lineStyle(1, 0xb2d7d2, 0.4);
      g.strokeRect(x, y, w, h);
      for (let yy = y + 18; yy < y + h; yy += 35) {
        const xx = x + ((time * 40) % Math.max(1, w - 20));
        line(xx, yy, Math.min(x + w, xx + 15), yy, 0xc2e7e1, 0.6);
      }
      break;
    case 'surface':
    case 'elevator':
    case 'pathPlatform':
    case 'collapsePlatform': {
      if (s.collapse === -2) {
        g.lineStyle(1, 0xf2cf8d, 0.2);
        g.strokeRect(x, y, w, h);
        break;
      }
      const type = o.surface?.type,
        c =
          type === 'ice'
            ? 0x9edee7
            : type === 'mud'
              ? 0x9d785c
              : type === 'bounce'
                ? 0xd7a7df
                : 0x778eaa;
      rect(x, y, w, h, 0x26394e);
      rect(x, y, w, 5, c);
      for (let xx = x + 8; xx < x + w - 5; xx += 18)
        rect(xx, y + 9, 8, 3, type === 'conveyor' ? 0xf0ca7c : c);
      if (o.kind === 'collapsePlatform')
        for (let xx = x + 12; xx < x + w; xx += 25) {
          line(xx, y, xx - 5, y + h / 2, 0xe1b093);
          line(xx - 5, y + h / 2, xx + 2, y + h, 0xe1b093);
        }
      if (o.kind === 'elevator') {
        rect(x, y - 8, 4, 8, 0xd8c999);
        rect(x + w - 4, y - 8, 4, 8, 0xd8c999);
      }
      break;
    }
    case 'teleporter':
    case 'passage':
      if (!o.portal) return false;
      rect(x, y, w, h, 0x253353, o.portal.secret ? 0.15 : 0.8);
      g.lineStyle(3, 0x9b96ed, o.portal.secret ? 0.2 : 0.8);
      g.strokeEllipse(x + w / 2, y + h / 2, w - 5, h - 5);
      g.lineStyle(2, 0xa2e7dc, 0.5);
      g.strokeEllipse(x + w / 2, y + h / 2, (w - 8) * (0.7 + 0.15 * Math.sin(time * 4)), h - 12);
      break;
    case 'chest':
      rect(x, y + 8, w, h - 8, 0x654c48);
      rect(x + 2, y + (s.completed ? 0 : 5), w - 4, 8, 0xefc576);
      rect(x + 5, y + 12, 3, h - 14, 0xd6a15f);
      rect(x + w - 8, y + 12, 3, h - 14, 0xd6a15f);
      rect(x + w / 2 - 3, y + h / 2, 6, 8, s.completed ? 0x9edfc1 : 0xf2d28b);
      break;
    case 'npc':
      rect(x + w * 0.2, y, w * 0.6, h * 0.35, 0xf3cc98);
      rect(x + w * 0.12, y + h * 0.36, w * 0.76, h * 0.45, 0x89b9ab);
      rect(x + w * 0.2, y + h * 0.8, w * 0.2, h * 0.2, 0x324560);
      rect(x + w * 0.6, y + h * 0.8, w * 0.2, h * 0.2, 0x324560);
      rect(x + w * 0.28, y + h * 0.15, 3, 3, 0x24324e);
      rect(x + w * 0.62, y + h * 0.15, 3, 3, 0x24324e);
      rect(x + w * 0.25, y - 12, w * 0.5, 6, s.completed ? 0xa7dfb2 : 0xffdc8d);
      break;
    default:
      return false;
  }
  return true;
}
