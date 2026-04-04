import type { StorageSchema, WatchStatus, AnimeEntry, VoiceActor } from '../domain/types.ts';

const CURRENT_SCHEMA_VERSION = 1;
const VALID_STATUSES: WatchStatus[] = ['watching', 'completed', 'dropped', 'plan_to_watch'];

export function migrate(data: unknown): StorageSchema {
  if (!data || typeof data !== 'object') {
    return createEmpty();
  }

  const record = data as Record<string, unknown>;
  const version = typeof record.schemaVersion === 'number' ? record.schemaVersion : 0;

  if (version === 0) {
    return migrateFromV0(record);
  }

  if (version === CURRENT_SCHEMA_VERSION) {
    return data as StorageSchema;
  }

  return data as StorageSchema;
}

function toWatchStatus(val: unknown): WatchStatus {
  if (typeof val === 'string' && VALID_STATUSES.includes(val as WatchStatus)) {
    return val as WatchStatus;
  }
  return 'plan_to_watch';
}

function toVoiceActors(val: unknown): VoiceActor[] {
  if (!Array.isArray(val)) return [];
  return val.filter(
    (v): v is VoiceActor =>
      v !== null && typeof v === 'object' && typeof v.id === 'number' && typeof v.name === 'string'
  );
}

function toStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val.filter((v): v is string => typeof v === 'string');
}

function migrateFromV0(data: Record<string, unknown>): StorageSchema {
  const rawEntries = Array.isArray(data.entries) ? data.entries : [];
  const entries: AnimeEntry[] = rawEntries.map((entry: Record<string, unknown>) => ({
    id: (entry.id as string) || crypto.randomUUID(),
    season: (entry.season as string) || '',
    title: (entry.title as string) || '',
    anilistMediaId: entry.anilistMediaId as number | undefined,
    rating: entry.rating as number | undefined,
    comment: entry.comment as string | undefined,
    watchStatus: toWatchStatus(entry.watchStatus),
    voiceActors: toVoiceActors(entry.voiceActors),
    genres: toStringArray(entry.genres),
    coverImage: entry.coverImage as string | undefined,
    createdAt: (entry.createdAt as string) || new Date().toISOString(),
    updatedAt: (entry.updatedAt as string) || new Date().toISOString(),
  }));
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    appVersion: '0.1.0',
    entries,
  };
}

function createEmpty(): StorageSchema {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    appVersion: '0.1.0',
    entries: [],
  };
}
