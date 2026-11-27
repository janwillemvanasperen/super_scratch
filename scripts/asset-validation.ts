import { readFileSync, statSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { inflateSync } from 'node:zlib';
import type { Level } from '../src/levels/schema';
import { assetReferenceIssues } from '../src/assets/catalog';
import { checkSheet } from '../src/assets/schema';

export function imageSize(b: Buffer, extension: string): [number, number] {
  if (extension === 'png') {
    if (b.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a')
      throw Error('Ongeldige PNG-signatuur');
    const parts: Buffer[] = [];
    let end = false,
      w = 0,
      h = 0;
    for (let i = 8; i + 12 <= b.length;) {
      const len = b.readUInt32BE(i),
        type = b.toString('ascii', i + 4, i + 8);
      if (i + 12 + len > b.length) throw Error('Afgebroken PNG');
      const data = b.subarray(i + 8, i + 8 + len);
      if (type === 'IHDR') {
        if (len !== 13) throw Error('Ongeldige PNG-header');
        w = data.readUInt32BE(0);
        h = data.readUInt32BE(4);
      }
      if (type === 'IDAT') parts.push(data);
      if (type === 'IEND') {
        end = true;
        break;
      }
      i += len + 12;
    }
    if (!end || !parts.length || !w || !h) throw Error('PNG mist beeldgegevens');
    inflateSync(Buffer.concat(parts), { maxOutputLength: 80 * 1024 * 1024 });
    return [w, h];
  }
  if (extension === 'jpg' || extension === 'jpeg') {
    if (b[0] !== 255 || b[1] !== 216) throw Error('Ongeldige JPEG-signatuur');
    let i = 2;
    while (i + 8 < b.length) {
      if (b[i++] !== 255) continue;
      const marker = b[i++];
      if (marker === 0xd8 || marker === 0xd9) continue;
      const len = b.readUInt16BE(i);
      if (len < 2) break;
      if (
        [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(
          marker,
        )
      )
        return [b.readUInt16BE(i + 5), b.readUInt16BE(i + 3)];
      i += len;
    }
    throw Error('JPEG mist afmetingen');
  }
  if (extension === 'webp') {
    if (
      b.toString('ascii', 0, 4) !== 'RIFF' ||
      b.toString('ascii', 8, 12) !== 'WEBP' ||
      b.length < 30
    )
      throw Error('Ongeldige WebP-signatuur');
    const type = b.toString('ascii', 12, 16);
    if (type === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
    if (type === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    if (type === 'VP8L') {
      const n = b.readUInt32LE(21);
      return [(n & 0x3fff) + 1, ((n >>> 14) & 0x3fff) + 1];
    }
  }
  throw Error('Niet ondersteund of beschadigd beeldbestand');
}
export function validateAssets(level: Level, root = 'public'): string[] {
  const errors = assetReferenceIssues(level),
    base = resolve(root) + sep;
  let total = 0;
  for (const [id, a] of Object.entries(level.assets || {}))
    try {
      const path = resolve(root, a.src);
      if (!path.startsWith(base)) throw Error('Pad buiten public');
      const size = statSync(path).size;
      total += size;
      if (size > 20 * 1024 * 1024) throw Error('Bestand groter dan 20 MB');
      const b = readFileSync(path),
        ext = a.src.split('.').at(-1)!.toLowerCase();
      if (a.type === 'audio') {
        const valid =
          ext === 'wav'
            ? b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WAVE'
            : ext === 'ogg'
              ? b.toString('ascii', 0, 4) === 'OggS'
              : b.toString('ascii', 0, 3) === 'ID3' || (b[0] === 255 && (b[1] & 0xe0) === 0xe0);
        if (!valid) throw Error('Audio-inhoud past niet bij bestandsformaat');
      } else {
        const [w, h] = imageSize(b, ext);
        const problem = checkSheet(a, w, h);
        if (problem) throw Error(problem);
      }
    } catch (e) {
      errors.push(`${id}: ${String(e)}`);
    }
  if (total > 64 * 1024 * 1024) errors.push('Assetpakket is groter dan 64 MB; verklein bestanden');
  return errors;
}
