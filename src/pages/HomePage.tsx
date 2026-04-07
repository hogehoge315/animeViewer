import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAnimeEntries } from '../hooks/useAnimeEntries.ts';
import { filterEntries } from '../services/searchService.ts';
import { getUniqueSeasons } from '../services/animeService.ts';
import type { WatchStatus, FilterOptions } from '../domain/types.ts';
import { WATCH_STATUS_LABELS } from '../domain/types.ts';
import { AnimeCard } from '../components/anime/AnimeCard.tsx';
import type { CSSProperties } from 'react';

const containerStyle: CSSProperties = {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '20px',
};

const filterBarStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginBottom: '20px',
  padding: '12px',
  backgroundColor: '#fff0f3',
  borderRadius: '12px',
};

const filterInputStyle: CSSProperties = {
  padding: '6px 10px',
  border: '1px solid #f9a8d4',
  borderRadius: '6px',
  backgroundColor: '#ffffff',
  color: '#1f2937',
  fontSize: '13px',
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '12px',
};

const emptyStyle: CSSProperties = {
  textAlign: 'center',
  padding: '60px 20px',
  color: '#6b7280',
  fontSize: '16px',
};

const statuses = Object.entries(WATCH_STATUS_LABELS) as [WatchStatus, string][];

export function HomePage() {
  const { entries, loading, updateEntry } = useAnimeEntries();
  const [filters, setFilters] = useState<FilterOptions>({});

  const seasons = useMemo(() => getUniqueSeasons(entries), [entries]);
  const filtered = useMemo(() => filterEntries(entries, filters), [entries, filters]);

  if (loading) {
    return <div style={containerStyle}>読み込み中...</div>;
  }

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
          マイアニメリスト
        </h1>
        <Link
          to="/add"
          style={{
            padding: '8px 16px',
            backgroundColor: '#ec4899',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          + 追加
        </Link>
      </div>

      <div style={filterBarStyle}>
        <input
          type="text"
          placeholder="タイトル検索..."
          value={filters.titleQuery || ''}
          onChange={(e) => setFilters((f) => ({ ...f, titleQuery: e.target.value || undefined }))}
          style={{ ...filterInputStyle, flex: '1 1 150px' }}
        />
        <input
          type="text"
          placeholder="声優検索..."
          value={filters.voiceActorQuery || ''}
          onChange={(e) => setFilters((f) => ({ ...f, voiceActorQuery: e.target.value || undefined }))}
          style={{ ...filterInputStyle, flex: '1 1 120px' }}
        />
        <select
          value={filters.season || ''}
          onChange={(e) => setFilters((f) => ({ ...f, season: e.target.value || undefined }))}
          style={filterInputStyle}
        >
          <option value="">全シーズン</option>
          {seasons.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filters.watchStatus || ''}
          onChange={(e) => setFilters((f) => ({ ...f, watchStatus: (e.target.value as WatchStatus) || undefined }))}
          style={filterInputStyle}
        >
          <option value="">全ステータス</option>
          {statuses.map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <select
          value={filters.rating !== undefined ? String(filters.rating) : ''}
          onChange={(e) => setFilters((f) => ({ ...f, rating: e.target.value ? Number(e.target.value) : undefined }))}
          style={filterInputStyle}
        >
          <option value="">全評価</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>{'★'.repeat(n)}</option>
          ))}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#6b7280', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={filters.hasComment === true}
            onChange={(e) => setFilters((f) => ({ ...f, hasComment: e.target.checked ? true : undefined }))}
          />
          コメントあり
        </label>
      </div>

      {filtered.length === 0 ? (
        <div style={emptyStyle}>
          {entries.length === 0 ? (
            <>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📺</div>
              <p>まだアニメが登録されていません</p>
              <Link to="/add" style={{ color: '#ec4899' }}>最初のアニメを追加する →</Link>
            </>
          ) : (
            <p>フィルター条件に一致するアニメがありません</p>
          )}
        </div>
      ) : (
        <div style={gridStyle}>
          {filtered.map((entry) => (
            <AnimeCard
              key={entry.id}
              entry={entry}
              onProgressCommit={(watchedEpisodes) => updateEntry(entry.id, { watchedEpisodes })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
