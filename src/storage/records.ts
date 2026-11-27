import type { Run } from '../core/rules';
export type RecordEntry = {
  score: number;
  time: number;
  coins: number;
  completed: boolean;
  secret: boolean;
};
export class Records {
  available = true;
  data: Record<string, RecordEntry> = {};
  constructor(private storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage) {
    try {
      const raw = JSON.parse(storage.getItem('super-scratch.records.v1') || '{}');
      for (const [id, r] of Object.entries(raw)) {
        const a = r as RecordEntry;
        if (
          a &&
          Number.isFinite(a.score) &&
          a.score >= 0 &&
          Number.isFinite(a.time) &&
          a.time >= 0 &&
          Number.isFinite(a.coins) &&
          a.coins >= 0
        )
          this.data[id] = {
            score: a.score,
            time: a.time,
            coins: a.coins,
            completed: !!a.completed,
            secret: !!a.secret,
          };
      }
    } catch {
      this.available = false;
    }
  }
  save(id: string, run: Run) {
    const old = this.data[id];
    const isNew = !old || run.score > old.score;
    this.data[id] = {
      score: Math.max(old?.score ?? 0, run.score),
      time: Math.min(old?.time ?? Infinity, run.seconds),
      coins: Math.max(old?.coins ?? 0, run.coins),
      completed: true,
      secret: !!old?.secret || run.secrets > 0,
    };
    try {
      this.storage.setItem('super-scratch.records.v1', JSON.stringify(this.data));
    } catch {
      this.available = false;
    }
    return isNew;
  }
}
