import type { Player } from '../entities/player';
// Factory per run: no global mutable state; never accept executable code from JSON.
export const mechanics = {
  wind: () => ({
    elapsed: 0,
    update(dt: number, p: Player) {
      this.elapsed += dt;
      if (!p.grounded) p.vx += Math.sin(this.elapsed) * 80 * dt;
    },
    destroy() {
      this.elapsed = 0;
    },
  }),
};
