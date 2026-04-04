import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAnimeEntries } from '../hooks/useAnimeEntries.ts';
import { groupBySeason, computeSeasonStats } from '../services/searchService.ts';
import { getUniqueSeasons } from '../services/animeService.ts';
import { StarRating } from '../components/common/StarRating.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import type { CSSProperties } from 'react';

const containerStyle: CSSProperties = {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '20px',
};

export function SeasonListPage() {
  const { entries, loading } = useAnimeEntries();
  const seasons = useMemo(() => getUniqueSeasons(entries), [entries]);
  const grouped = useMemo(() => groupBySeason(entries), [entries]);
  const [selectedSeason, setSelectedSeason] = useState<string>('');

  if (loading) return <div style={containerStyle}>読み込み中...</div>;

  const displaySeasons = selectedSeason ? [selectedSeason] : seasons;

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', marginBottom: '16px' }}>
        シーズン別一覧
      </h1>

      <select
        value={selectedSeason}
        onChange={(e) => setSelectedSeason(e.target.value)}
        style={{
          padding: '8px 12px',
          border: '1px solid #f9a8d4',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          color: '#1f2937',
          fontSize: '14px',
          marginBottom: '20px',
        }}
      >
        <option value="">全シーズン</option>
        {seasons.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {displaySeasons.length === 0 && (
        <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
          まだアニメが登録されていません
        </div>
      )}

      {displaySeasons.map((season) => {
        const seasonEntries = grouped.get(season) || [];
        const stats = computeSeasonStats(seasonEntries);
        return (
          <div key={season} style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #fbcfe8', paddingBottom: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ec4899', margin: 0 }}>
                {season}
              </h2>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                {stats.count}作品
                {stats.avgRating !== null && ` | 平均 ${stats.avgRating.toFixed(1)}★`}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {seasonEntries.map((entry) => (
                <Link
                  key={entry.id}
                  to={`/anime/${entry.id}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: '#fff0f3',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#1f2937',
                    border: '1px solid #fbcfe8',
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{entry.title}</span>
                  <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <StarRating value={entry.rating} readonly size={12} />
                    <StatusBadge status={entry.watchStatus} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
