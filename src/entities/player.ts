import { RULES } from '../core/rules';
export class Player {
  w = 22;
  h = 30;
  vx = 0;
  vy = 0;
  grounded = false;
  facing = 1;
  coyote = 0;
  buffer = 0;
  invuln = 0;
  carrying?: string;
  constructor(
    public x: number,
    public y: number,
  ) {}
  tick(dt: number, axis: number, boost: boolean) {
    const speed = RULES.speed * (boost ? 1.45 : 1),
      target = axis * speed;
    this.vx +=
      Math.sign(target - this.vx) * Math.min(Math.abs(target - this.vx), RULES.acceleration * dt);
    if (axis) this.facing = axis;
    this.vy = Math.min(850, this.vy + RULES.gravity * dt);
    this.coyote = this.grounded ? 0.1 : Math.max(0, this.coyote - dt);
    this.buffer = Math.max(0, this.buffer - dt);
    this.invuln = Math.max(0, this.invuln - dt);
  }
}
