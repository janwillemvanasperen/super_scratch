import Phaser from 'phaser';
const sprite = [
  '....aaa.........',
  '...aaaaaa.......',
  '..aabbbbaa......',
  '..abbbbbba......',
  '..abbdbdba......',
  '...bbbbbb.......',
  '....bbbb........',
  '..cccccccc......',
  '.cccccccccc.....',
  '.bccccc ccb.....',
  '.bbcccccbb......',
  '...ccccc........',
  '...ee.ee........',
  '...ee.ee........',
  '..fff.fff.......',
  '..fff.fff.......',
];
export function makeArt(scene: Phaser.Scene) {
  for (let frame = 0; frame < 3; frame++) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    const colors: Record<string, number> = {
      a: 0x263447,
      b: 0xffd09b,
      c: 0xffffff,
      d: 0x142037,
      e: 0x27344f,
      f: 0xffe9bd,
    };
    sprite.forEach((row, y) =>
      [...row].forEach((c, x) => {
        if (colors[c]) {
          g.fillStyle(colors[c]);
          g.fillRect(x + (y > 11 && frame ? ((y + frame) % 2 ? 1 : -1) : 0), y, 1, 1);
        }
      }),
    );
    g.generateTexture(`hero${frame}`, 16, 16);
    g.destroy();
  }
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0xffffff);
  g.fillRect(3, 0, 10, 3);
  g.fillRect(0, 3, 16, 10);
  g.fillRect(2, 13, 4, 3);
  g.fillRect(10, 13, 4, 3);
  g.fillStyle(0x172039);
  g.fillRect(3, 5, 3, 4);
  g.fillRect(10, 5, 3, 4);
  g.generateTexture('enemy', 16, 16);
  g.destroy();
}
export function landscape(
  g: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  palette: { sky: string; far: string; near: string },
  camera = 0,
  time = 0,
) {
  const c = (s: string) => parseInt(s.slice(1), 16);
  g.clear();
  g.fillStyle(c(palette.sky));
  g.fillRect(0, 0, width, height);
  g.fillStyle(0xffebb0);
  g.fillRect(width * 0.76, 65, 54, 54);
  g.fillStyle(0xffffff, 0.7);
  for (let i = -1; i < 6; i++) {
    const x =
      ((((i * 260 - camera * 0.12 + time * 3) % (width + 260)) + width + 260) % (width + 260)) -
      150;
    g.fillRect(x, 110 + (i % 2) * 40, 75, 16);
    g.fillRect(x + 15, 94 + (i % 2) * 40, 38, 20);
  }
  for (let layer = 0; layer < 2; layer++) {
    g.fillStyle(c(layer ? palette.near : palette.far));
    for (let i = -2; i < 10; i++) {
      const x = i * 190 - camera * (layer ? 0.35 : 0.16);
      const y = height - 100 - layer * 30 - (i % 3) * 25;
      g.fillRect(x, y, 190, height - y);
      g.fillRect(x + 24, y - 32, 140, 34);
      g.fillRect(x + 52, y - 60, 80, 32);
    }
  }
}
