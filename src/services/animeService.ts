import type { AnimeEntry, WatchStatus, VoiceActor } from '../domain/types.ts';
import { generateId } from '../domain/types.ts';
import * as repository from '../storage/repository.ts';

export interface CreateAnimeInput {
  title: string;
  season: string;
  anilistMediaId?: number;
  rating?: number;
  comment?: string;
  watchStatus: WatchStatus;
  voiceActors?: VoiceActor[];
  genres?: string[];
  coverImage?: string;
}

export function addAnime(input: CreateAnimeInput): AnimeEntry {
  const now = new Date().toISOString();
  const entry: AnimeEntry = {
    id: generateId(),
    title: input.title,
    season: input.season,
    anilistMediaId: input.anilistMediaId,
    rating: input.rating,
    comment: input.comment,
    watchStatus: input.watchStatus,
    voiceActors: input.voiceActors || [],
    genres: input.genres || [],
    coverImage: input.coverImage,
    createdAt: now,
    updatedAt: now,
  };
  repository.save(entry);
  return entry;
}

export function updateAnime(id: string, updates: Partial<AnimeEntry>): AnimeEntry | undefined {
  return repository.update(id, updates);
}

export function deleteAnime(id: string): boolean {
  return repository.remove(id);
}

export function getAllAnime(): AnimeEntry[] {
  return repository.getAll();
}

export function getAnimeById(id: string): AnimeEntry | undefined {
  return repository.getById(id);
}

export function getUniqueSeasons(entries: AnimeEntry[]): string[] {
  const seasons = new Set(entries.map((e) => e.season));
  return Array.from(seasons).sort().reverse();
}
