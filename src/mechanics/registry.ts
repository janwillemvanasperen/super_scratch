import type { Player } from '../entities/player';
import type { Controls, WorldObject } from './world-types';

export type MechanicEvent =
  | { type: 'init' | 'pause' | 'resume' | 'restart' | 'exit' | 'life' }
  | { type: 'input'; controls: Readonly<Controls> }
  | { type: 'collision'; grounded: boolean; ceiling: boolean; wall: boolean }
  | { type: 'damage'; amount: number }
  | { type: 'collect' | 'checkpoint'; id: string };

type Context = {
  player: () => Player;
  say: (text: string) => void;
  cleanup: (callback: () => void) => void;
};
type Mechanic = {
  update?: (dt: number, p: Player) => void;
  event?: (event: MechanicEvent) => void;
};
type Factory = (context: Context) => Mechanic;

export const mechanics = {
  wind: () => {
    let elapsed = 0;
    return {
      update(dt: number, p: Player) {
        elapsed += dt;
        if (!p.grounded) p.vx += Math.sin(elapsed) * 80 * dt;
      },
    };
  },
} satisfies Record<string, Factory>;

export class MechanicSession {
  private instance?: Mechanic;
  private cleanups: (() => void)[] = [];
  private disposed = false;
  constructor(
    factory: Factory,
    context: Omit<Context, 'cleanup'>,
    private report: (error: unknown) => void,
  ) {
    try {
      this.instance = factory({
        ...context,
        cleanup: (callback) => {
          if (this.disposed) throw Error('Mechaniek is afgesloten');
          this.cleanups.push(callback);
        },
      });
      this.event({ type: 'init' });
    } catch (error) {
      this.fail(error);
    }
  }
  private fail(error: unknown) {
    this.report(error);
    this.dispose();
  }
  private call(action: (mechanic: Mechanic) => void) {
    if (!this.instance || this.disposed) return;
    try {
      action(this.instance);
    } catch (error) {
      this.fail(error);
    }
  }
  event(event: MechanicEvent) {
    this.call((m) => m.event?.(event));
  }
  update(dt: number, p: Player) {
    this.call((m) => m.update?.(dt, p));
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.instance = undefined;
    for (const cleanup of this.cleanups.reverse()) {
      try {
        cleanup();
      } catch (error) {
        this.report(error);
      }
    }
    this.cleanups = [];
  }
}
