import { describe, it, expect, vi } from 'vitest';
import { cameraPosition, cameraSchema } from '../src/core/camera';
import { moveBody, impactTime } from '../src/core/physics';
import { safeRespawn } from '../src/core/respawn';
import { MechanicSession } from '../src/mechanics/registry';
import { levelEntry } from '../src/levels/entries';
import { Player } from '../src/entities/player';

describe('V2.4 technische kwaliteit', () => {
  const world = { width: 3000, height: 2200 },
    p = { x: 820, y: 960, w: 22, h: 30 };
  it('behoudt de horizontale standaard en volgt een hoge start in twee richtingen', () => {
    expect(cameraPosition(p, world, undefined, { x: 0, y: 0 }, 1)).toEqual({ x: 500, y: 0 });
    const config = cameraSchema.parse({ axis: 'both' });
    expect(cameraPosition(p, world, config, { x: 0, y: 0 }, 0, true)).toEqual({ x: 500, y: 680 });
    expect(cameraPosition({ ...p, x: 2900, y: 2130 }, world, config, { x: 0, y: 0 }, 1)).toEqual({
      x: 2040,
      y: 1660,
    });
  });
  it('vergrendelt de camera in een zone en volgt weer daarbuiten', () => {
    const config = cameraSchema.parse({
      axis: 'both',
      zones: [{ x: 750, y: 900, w: 200, h: 150, viewX: 450, viewY: 650 }],
    });
    expect(cameraPosition(p, world, config, { x: 0, y: 0 }, 0, true)).toEqual({ x: 450, y: 650 });
    expect(cameraPosition({ ...p, y: 1200 }, world, config, { x: 450, y: 650 }, 0, true)).toEqual({
      x: 500,
      y: 920,
    });
  });
  it('stopt snelle beweging bij een dunne muur en detecteert een snel projectiel', () => {
    const wall = { x: 64, y: 0, w: 8, h: 150 };
    const body = { x: 0, y: 10, w: 12, h: 20, vx: 4000, vy: 0 };
    expect(moveBody(body, 0.05, [wall]).wall).toBe(wall);
    expect(body.x).toBe(52);
    expect(impactTime({ x: 0, y: 10, w: 8, h: 8 }, 200, 0, wall)).toBeCloseTo(0.28);
    expect(impactTime({ x: 0, y: 160, w: 8, h: 8 }, 200, 0, wall)).toBe(Infinity);
  });
  it('kiest een vrij terugkeerpunt als een deur het checkpoint bezet', () => {
    const location = safeRespawn({ x: 800, y: 950 }, { x: 60, y: 420 }, p, world, [
      { x: 780, y: 930, w: 80, h: 60 },
    ]);
    expect(location).toEqual({ x: 752, y: 950 });
  });
  it('schakelt een falende mechaniek uit, ruimt bronnen eenmaal op en isoleert een nieuwe poging', () => {
    const cleanup = vi.fn(),
      report = vi.fn(),
      onEvent = vi.fn();
    const context = { player: () => new Player(60, 100), say: vi.fn() };
    const m = new MechanicSession(
      ({ cleanup: own }) => {
        own(cleanup);
        return {
          event: onEvent,
          update: () => {
            throw Error('defect');
          },
        };
      },
      context,
      report,
    );
    m.event({ type: 'checkpoint', id: 'upper' });
    m.update(0.01, context.player());
    m.event({ type: 'exit' });
    m.dispose();
    expect(onEvent.mock.calls.map(([event]) => event.type)).toEqual(['init', 'checkpoint']);
    expect(report).toHaveBeenCalledOnce();
    expect(cleanup).toHaveBeenCalledOnce();
    const healthy = vi.fn();
    const next = new MechanicSession(() => ({ event: healthy }), context, report);
    next.event({ type: 'resume' });
    expect(healthy).toHaveBeenCalledTimes(2);
  });
  it('ondersteunt losse levelmappen en uitgeschakelde items zonder padtraversal', () => {
    expect(levelEntry({ file: 'duo-01/level.json', enabled: false })).toEqual({
      file: 'duo-01/level.json',
      enabled: false,
    });
    expect(() => levelEntry('../duo/level.json')).toThrow();
  });
});
