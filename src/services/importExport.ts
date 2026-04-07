import type { AnimeEntry, ExportData, WatchStatus } from '../domain/types.ts';

const APP_VERSION = '0.1.0';
const CURRENT_SCHEMA_VERSION = 2;

export function exportToJSON(entries: AnimeEntry[]): ExportData {
  return {
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    entries,
  };
}

const VALID_WATCH_STATUSES: WatchStatus[] = ['watching', 'completed', 'dropped', 'plan_to_watch'];

function isValidWatchStatus(val: unknown): val is WatchStatus {
  return typeof val === 'string' && VALID_WATCH_STATUSES.includes(val as WatchStatus);
}

export function validateImportData(data: unknown): string[] {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('データがオブジェクトではありません');
    return errors;
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.schemaVersion !== 'number') {
    errors.push('schemaVersionが不正です');
  }

  if (!Array.isArray(obj.entries)) {
    errors.push('entriesが配列ではありません');
    return errors;
  }

  for (let i = 0; i < obj.entries.length; i++) {
    const entry = obj.entries[i] as Record<string, unknown>;
    if (!entry || typeof entry !== 'object') {
      errors.push(`entries[${i}]: エントリがオブジェクトではありません`);
      continue;
    }
    if (typeof entry.id !== 'string' || !entry.id) {
      errors.push(`entries[${i}]: idが不正です`);
    }
    if (typeof entry.title !== 'string' || !entry.title) {
      errors.push(`entries[${i}]: titleが不正です`);
    }
    if (typeof entry.season !== 'string' || !entry.season) {
      errors.push(`entries[${i}]: seasonが不正です`);
    }
    if (!isValidWatchStatus(entry.watchStatus)) {
      errors.push(`entries[${i}]: watchStatusが不正です`);
    }
    if (!Array.isArray(entry.voiceActors)) {
      errors.push(`entries[${i}]: voiceActorsが配列ではありません`);
    }
    if (!Array.isArray(entry.genres)) {
      errors.push(`entries[${i}]: genresが配列ではありません`);
    }
  }

  return errors;
}

export function parseImportData(
  text: string
): { data: ExportData; errors: string[] } | { data: null; errors: string[] } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { data: null, errors: ['JSONのパースに失敗しました'] };
  }

  const errors = validateImportData(parsed);
  if (errors.length > 0) {
    return { data: null, errors };
  }

  return { data: parsed as ExportData, errors: [] };
}

export function mergeImport(
  existing: AnimeEntry[],
  imported: AnimeEntry[],
  mode: 'overwrite' | 'merge'
): AnimeEntry[] {
  if (mode === 'overwrite') {
    return imported;
  }

  const map = new Map<string, AnimeEntry>();
  for (const e of existing) {
    map.set(e.id, e);
  }
  for (const e of imported) {
    const current = map.get(e.id);
    if (!current || new Date(e.updatedAt) > new Date(current.updatedAt)) {
      map.set(e.id, e);
    }
  }
  return Array.from(map.values());
}
