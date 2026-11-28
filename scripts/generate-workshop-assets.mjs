import { mkdirSync } from 'node:fs';
import { Pixels } from './pixel-art.mjs';

const folder = 'public/assets/crystal-workshop';
mkdirSync(folder, { recursive: true });
const c = {
  dark: '#30253c',
  purple: '#624764',
  copper: '#cc855e',
  gold: '#fde2a0',
  mint: '#72debc',
  cream: '#f6c49b',
};
function worker(frame) {
  const p = new Pixels(32, 40);
  const step = frame % 2,
    y = frame === 1 ? 1 : 0;
  p.rect(7, 5 + y, 17, 11, c.dark);
  p.rect(9, 4 + y, 14, 8, c.gold);
  p.rect(6, 12 + y, 22, 3, c.copper);
  p.rect(10, 15 + y, 14, 13, c.cream);
  p.rect(20, 18 + y, 4, 3, c.dark);
  p.rect(10, 27 + y, 15, 9, c.purple);
  p.rect(13, 27 + y, 3, 8, c.mint);
  p.rect(22, 27 + y, 5, 5, c.copper);
  p.rect(10 - step * 2, 35, 7, 4, c.dark);
  p.rect(20 + step * 2, 34, 7, 4, c.dark);
  return p;
}
function guard() {
  const p = new Pixels(80, 64);
  p.poly(
    [
      [3, 53],
      [13, 19],
      [28, 7],
      [52, 7],
      [68, 19],
      [77, 53],
    ],
    c.dark,
  );
  p.poly(
    [
      [8, 51],
      [18, 21],
      [29, 12],
      [51, 12],
      [63, 21],
      [72, 51],
    ],
    c.purple,
  );
  p.rect(22, 28, 36, 12, c.dark);
  p.rect(29, 31, 22, 5, c.mint);
  p.rect(35, 8, 10, 12, c.gold);
  p.rect(9, 50, 19, 12, c.copper);
  p.rect(52, 50, 19, 12, c.copper);
  p.poly(
    [
      [32, 47],
      [40, 39],
      [49, 47],
      [41, 55],
    ],
    c.mint,
  );
  return p;
}
function backdrop() {
  const p = new Pixels(320, 180);
  p.rect(0, 0, 320, 180, c.dark);
  for (let x = 0; x < 320; x += 64) {
    p.rect(x, 0, 5, 180, '#514052');
    p.rect(x + 6, 0, 1, 180, '#806075');
    p.rect(x + 18, 18, 30, 108, '#443449');
    p.rect(x + 21, 21, 24, 100, '#59435e');
    p.rect(x + 22, 39, 22, 3, '#8e6880');
    p.rect(x + 22, 83, 22, 3, '#8e6880');
    p.poly(
      [
        [x + 22, 113],
        [x + 30, 59],
        [x + 42, 111],
      ],
      '#52777a',
    );
    p.poly(
      [
        [x + 26, 100],
        [x + 32, 71],
        [x + 36, 99],
      ],
      '#79a997',
    );
  }
  p.rect(0, 143, 320, 3, '#775369');
  p.rect(0, 150, 320, 30, '#443347');
  return p;
}
const sheet = new Pixels(64, 40);
sheet.blit(worker(0), 0, 0);
sheet.blit(worker(1), 32, 0);
sheet.save(folder + '/worker.png');
guard().save(folder + '/watcher.png');
backdrop().save(folder + '/workshop.png');
const cover = backdrop();
cover.blit(guard(), 188, 90);
cover.blit(worker(0), 66, 118);
cover.save(folder + '/cover.png');
