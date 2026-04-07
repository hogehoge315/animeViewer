import { useState, useEffect, useRef, useCallback } from 'react';
import type { AniListMedia, AniListPageResult, AniListStaffPageResult } from '../api/anilist/types.ts';
import type { StaffWithWorks } from '../api/adapter.ts';
import { queryAniList } from '../api/anilist/client.ts';
import { SEARCH_ANIME_QUERY, SEARCH_BY_VOICE_ACTOR_QUERY } from '../api/anilist/queries.ts';
import { adaptStaffResult } from '../api/adapter.ts';

const MAX_VOICE_ACTOR_RESULT_PAGES = 5;

export function useAniListSearch(debounceMs: number = 500) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AniListMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

      setLoading(true);
      timerRef.current = setTimeout(() => {
        const requestId = ++requestIdRef.current;
        void (async () => {
          try {
            const data = await queryAniList<AniListPageResult>(SEARCH_ANIME_QUERY, {
              search: query.trim(),
              perPage: 10,
            });
            if (requestId !== requestIdRef.current) return;
            if (data) {
              setResults(data.Page.media);
              setError(null);
            } else {
              setResults([]);
              setError('検索に失敗しました');
            }
          } catch {
            if (requestId !== requestIdRef.current) return;
            setResults([]);
            setError('検索に失敗しました');
          } finally {
            if (requestId === requestIdRef.current) {
              setLoading(false);
            }
          }
        })();
      }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, debounceMs]);

  return { query, setQuery, results, loading, error };
}

export function useVoiceActorSearch(debounceMs: number = 500) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StaffWithWorks[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const search = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);
      if (timerRef.current) clearTimeout(timerRef.current);

      if (!searchQuery.trim()) {
        setResults([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      timerRef.current = setTimeout(() => {
        const requestId = ++requestIdRef.current;
        void (async () => {
          try {
            const staffResults: StaffWithWorks[] = [];
            let page = 1;
            let hasNextPage = true;

            while (hasNextPage && page <= MAX_VOICE_ACTOR_RESULT_PAGES) {
              const data = await queryAniList<AniListStaffPageResult>(SEARCH_BY_VOICE_ACTOR_QUERY, {
                search: searchQuery.trim(),
                page,
                perPage: 20,
                worksPerPage: 50,
              });

              if (requestId !== requestIdRef.current) return;

              if (!data) {
                setResults([]);
                setError('検索に失敗しました');
                return;
              }

              staffResults.push(...data.Page.staff.map(adaptStaffResult));
              hasNextPage = data.Page.pageInfo.hasNextPage;
              page += 1;
            }

            if (requestId !== requestIdRef.current) return;
            setResults(staffResults);
            setError(null);
          } catch {
            if (requestId !== requestIdRef.current) return;
            setResults([]);
            setError('検索に失敗しました');
          } finally {
            if (requestId === requestIdRef.current) {
              setLoading(false);
            }
          }
        })();
      }, debounceMs);
    },
    [debounceMs]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { query, search, results, loading, error };
}
