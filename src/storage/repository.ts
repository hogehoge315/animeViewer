import type { AnimeEntry, StorageSchema } from '../domain/types.ts';
import { migrate } from './migration.ts';

const STORAGE_KEY = 'anime-viewer-data';
const CURRENT_SCHEMA_VERSION = 2;
const APP_VERSION = '0.1.0';

function loadSchema(): StorageSchema {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { schemaVersion: CURRENT_SCHEMA_VERSION, appVersion: APP_VERSION, entries: [] };
    }
    const parsed: unknown = JSON.parse(raw);
    return migrate(parsed);
  } catch {
    return { schemaVersion: CURRENT_SCHEMA_VERSION, appVersion: APP_VERSION, entries: [] };
  }
}

function saveSchema(schema: StorageSchema): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schema));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function getAll(): AnimeEntry[] {
  return loadSchema().entries;
}

export function getById(id: string): AnimeEntry | undefined {
  return loadSchema().entries.find((e) => e.id === id);
}

export function save(entry: AnimeEntry): void {
  const schema = loadSchema();
  const idx = schema.entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) {
    schema.entries[idx] = entry;
  } else {
    schema.entries.push(entry);
  }
  schema.appVersion = APP_VERSION;
  saveSchema(schema);
}

export function update(id: string, updates: Partial<AnimeEntry>): AnimeEntry | undefined {
  const schema = loadSchema();
  const idx = schema.entries.findIndex((e) => e.id === id);
  if (idx < 0) return undefined;
  const updated = { ...schema.entries[idx], ...updates, updatedAt: new Date().toISOString() };
  schema.entries[idx] = updated;
  saveSchema(schema);
  return updated;
}

export function remove(id: string): boolean {
  const schema = loadSchema();
  const before = schema.entries.length;
  schema.entries = schema.entries.filter((e) => e.id !== id);
  if (schema.entries.length < before) {
    saveSchema(schema);
    return true;
  }
  return false;
}

export function clear(): void {
  const schema: StorageSchema = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    entries: [],
  };
  saveSchema(schema);
}

export function saveAll(entries: AnimeEntry[]): void {
  const schema: StorageSchema = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    entries,
  };
  saveSchema(schema);
}
