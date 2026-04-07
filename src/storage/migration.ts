import type { StorageSchema, WatchStatus, AnimeEntry, VoiceActor } from '../domain/types.ts';

const CURRENT_SCHEMA_VERSION = 2;
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

  if (version === 1) {
    return migrateFromV1(record);
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

function normalizePositiveEpisodeCount(val: unknown): number | undefined {
  if (typeof val !== 'number' || !Number.isFinite(val) || val <= 0) {
    return undefined;
  }
  return Math.floor(val);
}

function normalizeNonNegativeEpisodeCount(val: unknown): number | undefined {
  if (typeof val !== 'number' || !Number.isFinite(val) || val < 0) {
    return undefined;
  }
  return Math.floor(val);
}

function normalizeEntry(entry: Record<string, unknown>): AnimeEntry {
  const totalEpisodes = normalizePositiveEpisodeCount(entry.totalEpisodes);
  const watchedEpisodes = normalizeNonNegativeEpisodeCount(entry.watchedEpisodes);

  return {
    id: (entry.id as string) || crypto.randomUUID(),
    season: (entry.season as string) || '',
    title: (entry.title as string) || '',
    anilistMediaId: entry.anilistMediaId as number | undefined,
    totalEpisodes,
    watchedEpisodes:
      watchedEpisodes === undefined || totalEpisodes === undefined
        ? watchedEpisodes
        : Math.min(watchedEpisodes, totalEpisodes),
    rating: entry.rating as number | undefined,
    comment: entry.comment as string | undefined,
    watchStatus: toWatchStatus(entry.watchStatus),
    voiceActors: toVoiceActors(entry.voiceActors),
    genres: toStringArray(entry.genres),
    coverImage: entry.coverImage as string | undefined,
    createdAt: (entry.createdAt as string) || new Date().toISOString(),
    updatedAt: (entry.updatedAt as string) || new Date().toISOString(),
  };
}

function migrateFromV0(data: Record<string, unknown>): StorageSchema {
  const rawEntries = Array.isArray(data.entries) ? data.entries : [];
  const entries: AnimeEntry[] = rawEntries.map((entry: Record<string, unknown>) => normalizeEntry(entry));
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    appVersion: '0.1.0',
    entries,
  };
}

function migrateFromV1(data: Record<string, unknown>): StorageSchema {
  const rawEntries = Array.isArray(data.entries) ? data.entries : [];
  const entries: AnimeEntry[] = rawEntries.map((entry: Record<string, unknown>) => normalizeEntry(entry));
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
