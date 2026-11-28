import { describe, it, expect } from 'vitest';
import { Run, timeBonus } from '../src/core/rules';
import { Records } from '../src/storage/records';
import { moveBody } from '../src/core/physics';
import { levelSchema, kinds } from '../src/levels/schema';
import { readFileSync } from 'node:fs';
const data = JSON.parse(readFileSync('public/levels/first-adventure.json', 'utf8'));
describe('vaste spelregels', () => {
  it('start met 3 levens en hartjes, geen punten', () => {
    const r = new Run();
    expect([r.lives, r.hearts, r.score, r.coins, r.seconds]).toEqual([3, 3, 0, 0, 0]);
  });
  it('kan munten, vijanden en geheimen na een herstart niet farmen', () => {
    const r = new Run();
    for (let i = 0; i < 3; i++) {
      r.claim('c', 'coin');
      r.claim('e', 'enemy');
      r.claim('s', 'secret');
      r.loseLife();
    }
    expect(r.score).toBe(800);
    expect([r.coins, r.kills, r.secrets, r.lives]).toEqual([1, 1, 1, 0]);
  });
  it('berekent finish één keer en nooit een negatieve tijdbonus', () => {
    const r = new Run();
    r.seconds = 60;
    expect(timeBonus(60, 60)).toBe(500);
    expect(timeBonus(999, 60)).toBe(0);
    expect(timeBonus(0, 60)).toBe(1000);
    expect(r.finish(60)).toBe(2550);
    expect(r.finish(60)).toBe(2550);
  });
  it('landt op een platform en stopt bij een muur', () => {
    const p = { x: 50, y: 20, w: 22, h: 30, vx: 0, vy: 300 };
    expect(moveBody(p, 0.1, [{ x: 0, y: 70, w: 200, h: 20 }]).grounded).toBe(true);
    expect(p.y).toBe(40);
    p.vx = 200;
    moveBody(p, 0.1, [{ x: 80, y: 0, w: 20, h: 200 }]);
    expect(p.x).toBe(58);
  });
  it('houdt een klein tijdstapje stabiel op de grond', () => {
    const p = { x: 50, y: 450, w: 22, h: 30, vx: 100, vy: 10 };
    expect(moveBody(p, 1 / 120, [{ x: 0, y: 480, w: 1000, h: 60 }]).grounded).toBe(true);
    expect(p.y).toBe(450);
  });
});
describe('records', () => {
  it('bewaart onafhankelijke records en herlaadt ze', () => {
    let json: string | null = null;
    const storage = {
      getItem: () => json,
      setItem: (_k: string, v: string) => {
        json = v;
      },
    };
    const r = new Run();
    r.score = 100;
    r.seconds = 50;
    r.coins = 3;
    r.secrets = 1;
    new Records(storage).save('a', r);
    r.score = 90;
    r.seconds = 40;
    r.coins = 2;
    r.secrets = 0;
    const records = new Records(storage);
    records.save('a', r);
    expect(new Records(storage).data.a).toEqual({
      score: 100,
      time: 40,
      coins: 3,
      completed: true,
      secret: true,
    });
  });
  it('verdraagt beschadigde of geblokkeerde opslag', () => {
    expect(new Records({ getItem: () => '{', setItem: () => {} }).data).toEqual({});
    const r = new Records({
      getItem: () => null,
      setItem: () => {
        throw Error('quota');
      },
    });
    expect(() => r.save('a', new Run())).not.toThrow();
    expect(r.available).toBe(false);
  });
});
describe('levelcontract', () => {
  it('valideert beide speelwerelden', () => {
    for (const file of JSON.parse(readFileSync('public/levels/index.json', 'utf8')))
      expect(
        levelSchema.safeParse(JSON.parse(readFileSync(`public/levels/${file}`, 'utf8'))).success,
      ).toBe(true);
  });
  it('weigert dubbele IDs, ontbrekende finish en ongeldige kleuren', () => {
    const l = structuredClone(data);
    l.objects.push(l.objects[0]);
    expect(levelSchema.safeParse(l).success).toBe(false);
    l.objects = l.objects.filter((o: any) => o.kind !== 'finish');
    expect(levelSchema.safeParse(l).success).toBe(false);
    l.palette.sky = 'red';
    expect(levelSchema.safeParse(l).success).toBe(false);
  });
  it('ondersteunt toevoegen en weghalen zonder wijziging in bestaande data', () => {
    const copy = structuredClone(data);
    copy.id = 'student-test';
    copy.name = 'Student test';
    const registry = [levelSchema.parse(data), levelSchema.parse(copy)];
    expect(registry.length).toBe(2);
    expect(registry.filter((l) => l.id !== 'student-test')).toEqual([levelSchema.parse(data)]);
  });
  it('behoudt alle 33 oorspronkelijke bouwstenen in de twee basislevels', () => {
    const all = JSON.parse(readFileSync('public/levels/tutorial.json', 'utf8')).objects.concat(
      data.objects,
    );
    for (const k of kinds.slice(0,33))
      expect(
        all.some((o: any) => o.kind === k),
        `Bouwsteen ${k}`,
      ).toBe(true);
  });
  it('houdt verplichte sprongen binnen de theoretische sprongafstand', () => {
    const maxDistance = 245 * ((2 * 510) / 1250);
    for (const file of ['tutorial', 'first-adventure']) {
      const l = levelSchema.parse(JSON.parse(readFileSync(`public/levels/${file}.json`, 'utf8')));
      const ground = l.objects.filter((o) => o.kind === 'ground').sort((a, b) => a.x - b.x);
      for (let i = 1; i < ground.length; i++)
        expect(ground[i].x - (ground[i - 1].x + ground[i - 1].w)).toBeLessThan(maxDistance - 15);
    }
  });
});
