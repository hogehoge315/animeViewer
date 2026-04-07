import type { AnimeEntry, WatchStatus, VoiceActor } from '../domain/types.ts';
import { generateId } from '../domain/types.ts';
import * as repository from '../storage/repository.ts';

export interface CreateAnimeInput {
  title: string;
  season: string;
  anilistMediaId?: number;
  totalEpisodes?: number;
  watchedEpisodes?: number;
  rating?: number;
  comment?: string;
  watchStatus: WatchStatus;
  voiceActors?: VoiceActor[];
  genres?: string[];
  coverImage?: string;
}

function normalizeEpisodes(
  totalEpisodes?: number,
  watchedEpisodes?: number
): Pick<AnimeEntry, 'totalEpisodes' | 'watchedEpisodes'> {
  const total =
    typeof totalEpisodes === 'number' && Number.isFinite(totalEpisodes) && totalEpisodes > 0
      ? Math.floor(totalEpisodes)
      : undefined;
  const watched =
    typeof watchedEpisodes === 'number' && Number.isFinite(watchedEpisodes) && watchedEpisodes >= 0
      ? Math.floor(watchedEpisodes)
      : undefined;

  return {
    totalEpisodes: total,
    watchedEpisodes:
      watched === undefined || total === undefined ? watched : Math.min(watched, total),
  };
}

export function addAnime(input: CreateAnimeInput): AnimeEntry {
  const now = new Date().toISOString();
  const progress = normalizeEpisodes(input.totalEpisodes, input.watchedEpisodes);
  const entry: AnimeEntry = {
    id: generateId(),
    title: input.title,
    season: input.season,
    anilistMediaId: input.anilistMediaId,
    totalEpisodes: progress.totalEpisodes,
    watchedEpisodes: progress.watchedEpisodes,
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
  const current = repository.getById(id);
  if (!current) return undefined;

  const nextTotalEpisodes = updates.totalEpisodes ?? current.totalEpisodes;
  const nextWatchedEpisodes = updates.watchedEpisodes ?? current.watchedEpisodes;
  const progress = normalizeEpisodes(nextTotalEpisodes, nextWatchedEpisodes);

  return repository.update(id, {
    ...updates,
    totalEpisodes: progress.totalEpisodes,
    watchedEpisodes: progress.watchedEpisodes,
  });
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
