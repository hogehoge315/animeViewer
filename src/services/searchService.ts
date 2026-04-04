import type { AnimeEntry, FilterOptions } from '../domain/types.ts';

export function filterEntries(entries: AnimeEntry[], options: FilterOptions): AnimeEntry[] {
  return entries.filter((entry) => {
    if (options.season && entry.season !== options.season) {
      return false;
    }

    if (options.rating !== undefined && entry.rating !== options.rating) {
      return false;
    }

    if (options.watchStatus && entry.watchStatus !== options.watchStatus) {
      return false;
    }

    if (options.titleQuery) {
      const q = options.titleQuery.toLowerCase();
      if (!entry.title.toLowerCase().includes(q)) {
        return false;
      }
    }

    if (options.voiceActorQuery) {
      const q = options.voiceActorQuery.toLowerCase();
      const match = entry.voiceActors.some(
        (va) =>
          va.name.toLowerCase().includes(q) ||
          (va.nameNative && va.nameNative.toLowerCase().includes(q))
      );
      if (!match) return false;
    }

    if (options.hasComment === true && (!entry.comment || entry.comment.trim() === '')) {
      return false;
    }
    if (options.hasComment === false && entry.comment && entry.comment.trim() !== '') {
      return false;
    }

    return true;
  });
}

export function groupBySeason(entries: AnimeEntry[]): Map<string, AnimeEntry[]> {
  const map = new Map<string, AnimeEntry[]>();
  for (const entry of entries) {
    const group = map.get(entry.season);
    if (group) {
      group.push(entry);
    } else {
      map.set(entry.season, [entry]);
    }
  }
  return map;
}

export function computeSeasonStats(entries: AnimeEntry[]): {
  count: number;
  avgRating: number | null;
} {
  const rated = entries.filter((e) => e.rating !== undefined);
  const avg =
    rated.length > 0
      ? rated.reduce((sum, e) => sum + (e.rating || 0), 0) / rated.length
      : null;
  return { count: entries.length, avgRating: avg };
}
