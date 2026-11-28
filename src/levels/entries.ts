export type LevelEntry = { file: string; enabled: boolean };
export function levelEntry(value: unknown): LevelEntry {
  const entry =
    typeof value === 'string'
      ? { file: value, enabled: true }
      : (value as Partial<LevelEntry> | null);
  if (
    !entry ||
    typeof entry.file !== 'string' ||
    !/^[-a-z0-9]+(?:\/[-a-z0-9]+)*\.json$/.test(entry.file) ||
    (entry.enabled !== undefined && typeof entry.enabled !== 'boolean')
  )
    throw Error('Ongeldige bestandsnaam of registerinstelling');
  return { file: entry.file, enabled: entry.enabled !== false };
}
