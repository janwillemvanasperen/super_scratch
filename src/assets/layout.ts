import type { Block } from '../levels/schema';
import type { Rect } from '../core/physics';

export function objectBody(block: Block) {
  return {
    x: block.x + (block.hitbox?.offsetX || 0),
    y: block.y + (block.hitbox?.offsetY || 0),
    w: block.hitbox?.width ?? block.w,
    h: block.hitbox?.height ?? block.h,
    layoutWidth: block.w,
    layoutHeight: block.h,
  };
}
export function objectBounds(block: Block & { layoutWidth?: number; layoutHeight?: number }): Rect {
  return {
    x: block.x - (block.hitbox?.offsetX || 0),
    y: block.y - (block.hitbox?.offsetY || 0),
    w: block.layoutWidth ?? block.w,
    h: block.layoutHeight ?? block.h,
  };
}
