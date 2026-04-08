import { useMemo } from 'react';
import { useAnimeEntries } from '../hooks/useAnimeEntries.ts';
import { WATCH_STATUS_LABELS, WATCH_STATUS_COLORS } from '../domain/types.ts';
import type { WatchStatus, AnimeEntry } from '../domain/types.ts';
import type { CSSProperties } from 'react';

const containerStyle: CSSProperties = {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '20px',
};

const sectionStyle: CSSProperties = {
  backgroundColor: '#fff',
  border: '1px solid #fbcfe8',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '16px',
};

const sectionTitleStyle: CSSProperties = {
  fontSize: '16px',
  fontWeight: 700,
  color: '#1f2937',
  marginBottom: '16px',
  paddingBottom: '8px',
  borderBottom: '2px solid #f9a8d4',
};

const statGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
  gap: '12px',
};

const statCardStyle: CSSProperties = {
  backgroundColor: '#fff5f7',
  borderRadius: '10px',
  padding: '16px',
  textAlign: 'center',
};

const statValueStyle: CSSProperties = {
  fontSize: '28px',
  fontWeight: 700,
  color: '#ec4899',
};

const statLabelStyle: CSSProperties = {
  fontSize: '12px',
  color: '#6b7280',
  marginTop: '4px',
};

const barContainerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '8px',
};

const barLabelStyle: CSSProperties = {
  fontSize: '13px',
  color: '#1f2937',
  width: '100px',
  flexShrink: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const barTrackStyle: CSSProperties = {
  flex: 1,
  height: '20px',
  backgroundColor: '#fce7f3',
  borderRadius: '10px',
  overflow: 'hidden',
};

const barCountStyle: CSSProperties = {
  fontSize: '12px',
  color: '#6b7280',
  width: '40px',
  textAlign: 'right',
  flexShrink: 0,
};

const emptyStyle: CSSProperties = {
  textAlign: 'center',
  padding: '60px 20px',
  color: '#6b7280',
  fontSize: '16px',
};

function computeStats(entries: AnimeEntry[]) {
  const totalCount = entries.length;

  // Status breakdown
  const statusCounts: Record<WatchStatus, number> = {
    watching: 0,
    completed: 0,
    dropped: 0,
    plan_to_watch: 0,
  };
  for (const e of entries) {
    statusCounts[e.watchStatus]++;
  }

  // Rating distribution
  const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let ratedCount = 0;
  let ratingSum = 0;
  for (const e of entries) {
    if (e.rating !== undefined && e.rating >= 1 && e.rating <= 5) {
      ratingCounts[e.rating]++;
      ratedCount++;
      ratingSum += e.rating;
    }
  }
  const avgRating = ratedCount > 0 ? ratingSum / ratedCount : null;

  // Genre ranking
  const genreCounts = new Map<string, number>();
  for (const e of entries) {
    for (const g of e.genres) {
      genreCounts.set(g, (genreCounts.get(g) || 0) + 1);
    }
  }
  const topGenres = Array.from(genreCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Season statistics
  const seasonMap = new Map<string, { count: number; ratingSum: number; ratedCount: number }>();
  for (const e of entries) {
    const s = seasonMap.get(e.season) || { count: 0, ratingSum: 0, ratedCount: 0 };
    s.count++;
    if (e.rating !== undefined) {
      s.ratingSum += e.rating;
      s.ratedCount++;
    }
    seasonMap.set(e.season, s);
  }
  const seasonStats = Array.from(seasonMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([season, s]) => ({
      season,
      count: s.count,
      avgRating: s.ratedCount > 0 ? s.ratingSum / s.ratedCount : null,
    }));

  // Episode statistics
  let totalWatched = 0;
  let totalEpisodes = 0;
  for (const e of entries) {
    totalWatched += e.watchedEpisodes || 0;
    totalEpisodes += e.totalEpisodes || 0;
  }

  // Voice actor ranking
  const vaCounts = new Map<string, number>();
  for (const e of entries) {
    for (const va of e.voiceActors) {
      const name = va.nameNative || va.name;
      if (!name) continue;
      vaCounts.set(name, (vaCounts.get(name) || 0) + 1);
    }
  }
  const topVoiceActors = Array.from(vaCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Comment count
  const commentCount = entries.filter(
    (e) => e.comment && e.comment.trim() !== ''
  ).length;

  return {
    totalCount,
    statusCounts,
    ratingCounts,
    ratedCount,
    avgRating,
    topGenres,
    seasonStats,
    totalWatched,
    totalEpisodes,
    topVoiceActors,
    commentCount,
  };
}

function HorizontalBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={barContainerStyle}>
      <span style={barLabelStyle} title={label}>{label}</span>
      <div style={barTrackStyle}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: '10px',
            transition: 'width 0.3s',
            minWidth: value > 0 ? '4px' : '0',
          }}
        />
      </div>
      <span style={barCountStyle}>{value}</span>
    </div>
  );
}

export function StatsPage() {
  const { entries, loading } = useAnimeEntries();

  const stats = useMemo(() => computeStats(entries), [entries]);

  if (loading) {
    return <div style={containerStyle}>読み込み中...</div>;
  }

  if (entries.length === 0) {
    return (
      <div style={containerStyle}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', marginBottom: '16px' }}>
          統計
        </h1>
        <div style={emptyStyle}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
          <p>まだアニメが登録されていません</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>アニメを追加すると統計情報が表示されます</p>
        </div>
      </div>
    );
  }

  const maxStatus = Math.max(...Object.values(stats.statusCounts));
  const maxRating = Math.max(...Object.values(stats.ratingCounts));
  const maxGenre = stats.topGenres.length > 0 ? stats.topGenres[0][1] : 0;
  const maxSeason = stats.seasonStats.length > 0
    ? Math.max(...stats.seasonStats.map((s) => s.count))
    : 0;
  const maxVA = stats.topVoiceActors.length > 0 ? stats.topVoiceActors[0][1] : 0;

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', marginBottom: '16px' }}>
        統計
      </h1>

      {/* Overview */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>概要</div>
        <div style={statGridStyle}>
          <div style={statCardStyle}>
            <div style={statValueStyle}>{stats.totalCount}</div>
            <div style={statLabelStyle}>登録作品数</div>
          </div>
          <div style={statCardStyle}>
            <div style={statValueStyle}>{stats.avgRating !== null ? stats.avgRating.toFixed(1) : '—'}</div>
            <div style={statLabelStyle}>平均評価</div>
          </div>
          <div style={statCardStyle}>
            <div style={statValueStyle}>{stats.totalWatched}</div>
            <div style={statLabelStyle}>視聴済み話数</div>
          </div>
          <div style={statCardStyle}>
            <div style={statValueStyle}>{stats.commentCount}</div>
            <div style={statLabelStyle}>コメント数</div>
          </div>
        </div>
      </div>

      {/* Status breakdown */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>ステータス別</div>
        {(Object.entries(WATCH_STATUS_LABELS) as [WatchStatus, string][]).map(
          ([status, label]) => (
            <HorizontalBar
              key={status}
              label={label}
              value={stats.statusCounts[status]}
              max={maxStatus}
              color={WATCH_STATUS_COLORS[status]}
            />
          )
        )}
      </div>

      {/* Rating distribution */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>評価分布</div>
        {[5, 4, 3, 2, 1].map((n) => (
          <HorizontalBar
            key={n}
            label={'★'.repeat(n)}
            value={stats.ratingCounts[n]}
            max={maxRating}
            color="#f59e0b"
          />
        ))}
        {stats.ratedCount > 0 && (
          <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px', textAlign: 'right' }}>
            {stats.ratedCount}作品が評価済み（平均 {stats.avgRating?.toFixed(2)}★）
          </div>
        )}
      </div>

      {/* Genre ranking */}
      {stats.topGenres.length > 0 && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>ジャンル TOP{stats.topGenres.length}</div>
          {stats.topGenres.map(([genre, count]) => (
            <HorizontalBar
              key={genre}
              label={genre}
              value={count}
              max={maxGenre}
              color="#ec4899"
            />
          ))}
        </div>
      )}

      {/* Season statistics */}
      {stats.seasonStats.length > 0 && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>シーズン別作品数</div>
          {stats.seasonStats.map((s) => (
            <div key={s.season} style={barContainerStyle}>
              <span style={barLabelStyle}>{s.season}</span>
              <div style={barTrackStyle}>
                <div
                  style={{
                    width: `${maxSeason > 0 ? (s.count / maxSeason) * 100 : 0}%`,
                    height: '100%',
                    backgroundColor: '#8b5cf6',
                    borderRadius: '10px',
                    transition: 'width 0.3s',
                    minWidth: s.count > 0 ? '4px' : '0',
                  }}
                />
              </div>
              <span style={{ ...barCountStyle, width: 'auto' }}>
                {s.count}作品
                {s.avgRating !== null && (
                  <span style={{ marginLeft: '6px', color: '#f59e0b' }}>
                    {s.avgRating.toFixed(1)}★
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Episode stats */}
      {stats.totalEpisodes > 0 && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>エピソード</div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ ...statCardStyle, flex: '1 1 140px' }}>
              <div style={{ ...statValueStyle, fontSize: '24px' }}>{stats.totalWatched}</div>
              <div style={statLabelStyle}>視聴済み</div>
            </div>
            <div style={{ ...statCardStyle, flex: '1 1 140px' }}>
              <div style={{ ...statValueStyle, fontSize: '24px', color: '#6b7280' }}>{stats.totalEpisodes}</div>
              <div style={statLabelStyle}>全話数</div>
            </div>
            <div style={{ ...statCardStyle, flex: '1 1 140px' }}>
              <div style={{ ...statValueStyle, fontSize: '24px', color: '#8b5cf6' }}>
                {stats.totalEpisodes > 0
                  ? `${((stats.totalWatched / stats.totalEpisodes) * 100).toFixed(0)}%`
                  : '—'}
              </div>
              <div style={statLabelStyle}>消化率</div>
            </div>
          </div>
        </div>
      )}

      {/* Voice actor ranking */}
      {stats.topVoiceActors.length > 0 && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>声優 TOP{stats.topVoiceActors.length}</div>
          {stats.topVoiceActors.map(([name, count]) => (
            <HorizontalBar
              key={name}
              label={name}
              value={count}
              max={maxVA}
              color="#3b82f6"
            />
          ))}
        </div>
      )}
    </div>
  );
}
