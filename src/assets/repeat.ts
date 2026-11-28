// A bounded number of copies covers the viewport, independent of level length.
export function repeatPositions(
  position: number,
  size: number,
  viewport: number,
  repeat: boolean,
): number[] {
  if (!repeat) return [position];
  const start = (((position % size) + size) % size) - size;
  return Array.from({ length: Math.ceil(viewport / size) + 2 }, (_, i) => start + i * size);
}
