import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAnimeEntries } from '../hooks/useAnimeEntries.ts';
import { filterEntries, groupBySeason, computeSeasonStats } from '../services/searchService.ts';
import { getUniqueSeasons } from '../services/animeService.ts';
import type { WatchStatus, FilterOptions } from '../domain/types.ts';
import { WATCH_STATUS_LABELS } from '../domain/types.ts';
import { AnimeCard } from '../components/anime/AnimeCard.tsx';
import { StarRating } from '../components/common/StarRating.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
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

const toggleBtnBase: CSSProperties = {
  padding: '8px 20px',
  borderRadius: '8px',
  border: 'none',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
};

const statuses = Object.entries(WATCH_STATUS_LABELS) as [WatchStatus, string][];

const SEASON_NAMES = ['春', '夏', '秋', '冬'] as const;

type SortField = 'title' | 'season' | 'rating';
type SortOrder = 'asc' | 'desc';

const jaCollator = new Intl.Collator('ja');

export function HomePage() {
  const { entries, loading, updateEntry } = useAnimeEntries();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [viewMode, setViewMode] = useState<'list' | 'season'>('list');
  const [sortField, setSortField] = useState<SortField>('season');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const seasons = useMemo(() => getUniqueSeasons(entries), [entries]);
  const filtered = useMemo(() => filterEntries(entries, filters), [entries, filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'title') {
        cmp = jaCollator.compare(a.title, b.title);
      } else if (sortField === 'season') {
        cmp = a.season.localeCompare(b.season);
      } else if (sortField === 'rating') {
        const ra = a.rating ?? 0;
        const rb = b.rating ?? 0;
        cmp = ra - rb;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortField, sortOrder]);

  const allYears = useMemo(() => {
    const years = new Set<number>();
    for (const entry of entries) {
      const y = parseInt(entry.season.match(/^(\d+)/)?.[1] ?? '0');
      if (y > 0) years.add(y);
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [entries]);

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedSeasonName, setSelectedSeasonName] = useState<string>('全');

  useEffect(() => {
    if (allYears.length > 0) {
      setSelectedYear((prev) => (allYears.includes(prev) ? prev : allYears[0]));
    }
  }, [allYears]);

  const activeYear = selectedYear;

  const seasonGrouped = useMemo(() => {
    const yearEntries = entries.filter((e) => {
      const y = parseInt(e.season.match(/^(\d+)/)?.[1] ?? '0');
      return y === activeYear;
    });
    const filtered =
      selectedSeasonName === '全'
        ? yearEntries
        : yearEntries.filter((e) => e.season.replace(/^\d+/, '') === selectedSeasonName);
    return groupBySeason(filtered);
  }, [entries, activeYear, selectedSeasonName]);

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

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          style={{
            ...toggleBtnBase,
            backgroundColor: viewMode === 'list' ? '#ec4899' : '#fce7f3',
            color: viewMode === 'list' ? '#fff' : '#6b7280',
          }}
          onClick={() => setViewMode('list')}
        >
          一覧
        </button>
        <button
          style={{
            ...toggleBtnBase,
            backgroundColor: viewMode === 'season' ? '#ec4899' : '#fce7f3',
            color: viewMode === 'season' ? '#fff' : '#6b7280',
          }}
          onClick={() => setViewMode('season')}
        >
          シーズン別
        </button>
      </div>

      {viewMode === 'list' && (
        <>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>並び順:</span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              style={filterInputStyle}
            >
              <option value="season">放送日時順</option>
              <option value="title">名前順</option>
              <option value="rating">評価順</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
              style={{
                padding: '6px 10px',
                border: '1px solid #f9a8d4',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                color: '#1f2937',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {sortOrder === 'asc' ? '昇順 ↑' : '降順 ↓'}
            </button>
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

          {sorted.length === 0 ? (
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
              {sorted.map((entry) => (
                <AnimeCard
                  key={entry.id}
                  entry={entry}
                  onProgressCommit={(watchedEpisodes) => updateEntry(entry.id, { watchedEpisodes })}
                />
              ))}
            </div>
          )}
        </>
      )}

      {viewMode === 'season' && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
            <select
              value={activeYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setSelectedSeasonName('全');
              }}
              style={filterInputStyle}
            >
              {allYears.map((y) => (
                <option key={y} value={y}>{y}年</option>
              ))}
            </select>
            {(['全', ...SEASON_NAMES] as const).map((sn) => (
              <button
                key={sn}
                style={{
                  ...toggleBtnBase,
                  backgroundColor: selectedSeasonName === sn ? '#ec4899' : '#fce7f3',
                  color: selectedSeasonName === sn ? '#fff' : '#6b7280',
                }}
                onClick={() => setSelectedSeasonName(sn)}
              >
                {sn}
              </button>
            ))}
          </div>

          {seasonGrouped.size === 0 ? (
            <div style={emptyStyle}>
              <p>該当するアニメがありません</p>
            </div>
          ) : (
            Array.from(seasonGrouped.entries()).map(([seasonKey, groupEntries]) => {
              const stats = computeSeasonStats(groupEntries);
              return (
                <div key={seasonKey} style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '10px', borderBottom: '2px solid #f9a8d4', paddingBottom: '6px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937', margin: 0 }}>{seasonKey}</h2>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>
                      {stats.count}作品
                      {stats.avgRating !== null && `　平均 ${stats.avgRating.toFixed(1)}★`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {groupEntries.map((entry) => (
                      <Link
                        key={entry.id}
                        to={`/anime/${entry.id}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', backgroundColor: '#fff', border: '1px solid #fce7f3', borderRadius: '10px' }}>
                          <span style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: '#1f2937', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {entry.title}
                          </span>
                          <StatusBadge status={entry.watchStatus} />
                          <StarRating value={entry.rating} readonly size={16} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </>
      )}
    </div>
  );
}
