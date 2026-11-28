import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
const crc = (b) => {
  let c = 0xffffffff;
  for (const v of b) {
    c ^= v;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
};
function chunk(type, data) {
  const t = Buffer.from(type),
    n = Buffer.alloc(4),
    c = Buffer.alloc(4);
  n.writeUInt32BE(data.length);
  c.writeUInt32BE(crc(Buffer.concat([t, data])));
  return Buffer.concat([n, t, data, c]);
}
export class Pixels {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.p = Buffer.alloc(w * h * 4);
  }
  dot(x, y, c) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const n = (y * this.w + x) * 4,
      s = c.replace('#', '');
    this.p[n] = parseInt(s.slice(0, 2), 16);
    this.p[n + 1] = parseInt(s.slice(2, 4), 16);
    this.p[n + 2] = parseInt(s.slice(4, 6), 16);
    this.p[n + 3] = s.length === 8 ? parseInt(s.slice(6), 16) : 255;
  }
  rect(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.dot(x + i, y + j, c);
  }
  line(x, y, X, Y, c, width = 1) {
    let n = Math.max(Math.abs(X - x), Math.abs(Y - y));
    for (let i = 0; i <= n; i++)
      this.rect(
        Math.round(x + ((X - x) * i) / (n || 1)),
        Math.round(y + ((Y - y) * i) / (n || 1)),
        width,
        width,
        c,
      );
  }
  ellipse(x, y, rx, ry, c) {
    for (let j = -ry; j <= ry; j++)
      for (let i = -rx; i <= rx; i++)
        if ((i * i) / (rx * rx) + (j * j) / (ry * ry) <= 1) this.dot(x + i, y + j, c);
  }
  poly(points, c) {
    const ys = points.map((p) => p[1]);
    for (let y = Math.min(...ys); y <= Math.max(...ys); y++) {
      let cuts = [];
      points.forEach(([x1, y1], i) => {
        const [x2, y2] = points[(i + 1) % points.length];
        if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y))
          cuts.push(x1 + ((y - y1) * (x2 - x1)) / (y2 - y1));
      });
      cuts.sort((a, b) => a - b);
      for (let i = 0; i < cuts.length; i += 2)
        this.rect(Math.ceil(cuts[i]), y, Math.floor(cuts[i + 1]) - Math.ceil(cuts[i]) + 1, 1, c);
    }
  }
  blit(src, x, y, scale = 1) {
    for (let j = 0; j < src.h; j++)
      for (let i = 0; i < src.w; i++) {
        const n = (j * src.w + i) * 4;
        if (src.p[n + 3])
          this.rect(
            x + i * scale,
            y + j * scale,
            scale,
            scale,
            src.p.subarray(n, n + 4).toString('hex'),
          );
      }
  }
  save(path) {
    const header = Buffer.alloc(13);
    header.writeUInt32BE(this.w);
    header.writeUInt32BE(this.h, 4);
    header[8] = 8;
    header[9] = 6;
    const raw = Buffer.alloc((this.w * 4 + 1) * this.h);
    for (let y = 0; y < this.h; y++)
      this.p.copy(raw, y * (this.w * 4 + 1) + 1, y * this.w * 4, (y + 1) * this.w * 4);
    writeFileSync(
      path,
      Buffer.concat([
        Buffer.from('89504e470d0a1a0a', 'hex'),
        chunk('IHDR', header),
        chunk('IDAT', deflateSync(raw)),
        chunk('IEND', Buffer.alloc(0)),
      ]),
    );
  }
}
