import { useState, useCallback, useEffect } from 'react';
import type { AnimeEntry } from '../domain/types.ts';
import * as animeService from '../services/animeService.ts';
import type { CreateAnimeInput } from '../services/animeService.ts';

export function useAnimeEntries() {
  const [entries, setEntries] = useState<AnimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    const data = animeService.getAllAnime();
    setEntries(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const addEntry = useCallback(
    (input: CreateAnimeInput): AnimeEntry => {
      const entry = animeService.addAnime(input);
      reload();
      return entry;
    },
    [reload]
  );

  const updateEntry = useCallback(
    (id: string, updates: Partial<AnimeEntry>): AnimeEntry | undefined => {
      const result = animeService.updateAnime(id, updates);
      reload();
      return result;
    },
    [reload]
  );

  const deleteEntry = useCallback(
    (id: string): boolean => {
      const result = animeService.deleteAnime(id);
      reload();
      return result;
    },
    [reload]
  );

  return { entries, loading, addEntry, updateEntry, deleteEntry, reload };
}
