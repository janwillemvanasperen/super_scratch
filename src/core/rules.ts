export const RULES = {
  hearts: 3,
  lives: 3,
  coin: 100,
  enemy: 200,
  secret: 500,
  finish: 1000,
  heartBonus: 100,
  lifeBonus: 250,
  gravity: 1250,
  speed: 245,
  jump: 510,
  acceleration: 1900,
};
export function timeBonus(seconds: number, target: number) {
  return Math.round(1000 * Math.max(0, Math.min(1, 1 - seconds / (target * 2))));
}
export class Run {
  hearts = 3;
  lives = 3;
  coins = 0;
  score = 0;
  seconds = 0;
  kills = 0;
  secrets = 0;
  finished = false;
  claimed = new Set<string>();
  keys = new Set<string>();
  claim(id: string, kind: 'coin' | 'enemy' | 'secret' | 'bonus') {
    if (this.claimed.has(id)) return false;
    this.claimed.add(id);
    this.score += kind === 'bonus' ? 500 : RULES[kind];
    if (kind === 'coin') this.coins++;
    if (kind === 'enemy') this.kills++;
    if (kind === 'secret') this.secrets++;
    return true;
  }
  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    this.hearts = 3;
    return this.lives > 0;
  }
  finish(target: number) {
    if (!this.finished) {
      this.score +=
        RULES.finish + this.hearts * 100 + this.lives * 250 + timeBonus(this.seconds, target);
      this.finished = true;
    }
    return this.score;
  }
}
